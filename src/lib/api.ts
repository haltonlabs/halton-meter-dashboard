// API layer — talks to the daemon's local FastAPI on port 8765.
// Override with NEXT_PUBLIC_API_URL if you've remapped daemon.api_port in
// ~/.halton-meter/config.toml. All money is in millicents (1 USD = 100_000
// millicents) and is converted to USD float here so components stay
// unit-agnostic. Network errors are caught at each call site so a stopped
// daemon never crashes the dashboard — pages render in their empty state.

import type {
  Project,
  ProjectCosts,
  SpendDataPoint,
  ActivityRecord,
  TokenTotals,
  ModelRates,
  ProjectListItem,
  StatsByDayByProvider,
} from "./types";

// Default to "" → same-origin requests proxied through Next rewrites in
// next.config.ts. This avoids CORS friction when the daemon's allowlist
// doesn't cover the dev port. Override with NEXT_PUBLIC_API_URL to talk
// to the daemon directly (e.g. when CORS is configured for your origin).
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Display URL for the daemon — used by the offline banner. */
export function getApiBaseUrl(): string {
  return BASE_URL || "http://localhost:8765";
}
const MILLICENTS_PER_USD = 100_000;

function millicentsToUSD(mc: number | null | undefined): number {
  if (mc == null) return 0;
  return mc / MILLICENTS_PER_USD;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Backend response shapes ──────────────────────────────────────────────────

interface BackendProject {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  archived_at: string | null;
  stats: {
    requests_this_month: number;
    cost_usd_this_month_minor_units: number;
    previous_month_cost_usd_minor_units: number;
    all_time_cost_usd_minor_units: number;
    all_time_requests: number;
    last_active_at: string | null;
    primary_model: string | null;
    primary_provider: string | null;
    top_model: string | null;
    top_provider: string | null;
  };
}

interface BackendStats {
  summary: {
    total_requests: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_thinking_tokens: number;
    // Renamed from `total_cached_tokens` 2026-04-30 (decisions.md):
    // ambiguous name became a bug once cache_write surfaced alongside.
    total_cache_read_tokens: number;
    total_cache_write_tokens: number;
    total_cost_usd_minor_units: number;
    cache_hit_rate: number;
    active_projects?: number;
    models_in_use?: number;
    last_request_at?: string | null;
  };
  by_day: { date: string; requests: number; cost_usd_minor_units: number }[];
  by_day_by_provider: StatsByDayByProvider[];
  by_provider: { provider: string; requests: number; cost_usd_minor_units: number }[];
  by_model: {
    provider: string;
    model: string;
    requests: number;
    input_tokens: number;
    output_tokens: number;
    cost_usd_minor_units: number;
  }[];
  requests?: {
    items: BackendRequest[];
    next_cursor: string | null;
    total: number;
  };
}

interface BackendRequest {
  id: string;
  provider: string;
  model: string;
  mode: string;
  input_tokens: number;
  output_tokens: number;
  thinking_tokens: number;
  // Renamed from `cached_tokens` 2026-04-30 (decisions.md).
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_usd_minor_units: number | null;
  latency_ms: number | null;
  tokens_complete: boolean;
  requested_at: string;
  status: string;
}

// ─── Adapter helpers ──────────────────────────────────────────────────────────

function adaptProject(p: BackendProject): Project {
  return {
    slug: p.slug,
    name: p.name,
    client: p.name,
    status: p.archived_at ? "archived" : "active",
    created: p.created_at,
    // Use primary_model from stats — derived from most-used model by request count
    primaryModel: p.stats.primary_model ?? "claude-sonnet-4-6",
    description: "",
  };
}

function adaptProjectCosts(p: BackendProject): ProjectCosts {
  return {
    cost: millicentsToUSD(p.stats.cost_usd_this_month_minor_units),
    requests: p.stats.requests_this_month,
    lastMonth: millicentsToUSD(p.stats.previous_month_cost_usd_minor_units),
    allTimeCost: millicentsToUSD(p.stats.all_time_cost_usd_minor_units),
    allTimeRequests: p.stats.all_time_requests,
    lastActiveAt: p.stats.last_active_at,
    models: {},
    // Server-computed all-time top model + provider by cost. Either field
    // may be null when the project has zero captured requests; the
    // dashboard renders an em-dash in that case.
    topModel: p.stats.top_model ?? null,
    topProvider: p.stats.top_provider ?? null,
  };
}

/**
 * Map by_day_by_provider into SpendDataPoints with per-day per-provider cost.
 * This replaces the old approach of spreading period totals across all days.
 */
function adaptSpendSeriesFromDayByProvider(
  byDay: BackendStats["by_day"],
  byDayByProvider: StatsByDayByProvider[]
): SpendDataPoint[] {
  // Build a lookup: date → { provider → cost }
  const dayProviderMap: Record<string, Record<string, number>> = {};
  byDayByProvider.forEach((row) => {
    if (!dayProviderMap[row.date]) dayProviderMap[row.date] = {};
    dayProviderMap[row.date][row.provider] =
      (dayProviderMap[row.date][row.provider] ?? 0) + millicentsToUSD(row.cost_usd_minor_units);
  });

  return byDay.map((d, i) => {
    const provMap = dayProviderMap[d.date] ?? {};
    return {
      date: d.date,
      day: i + 1,
      label: d.date.slice(5), // "MM-DD"
      anthropic: provMap.anthropic ?? 0,
      openai: provMap.openai ?? 0,
      google: provMap.google ?? 0,
      groq: provMap.groq ?? 0,
      total: millicentsToUSD(d.cost_usd_minor_units),
      requests: d.requests,
    };
  });
}

function adaptActivity(items: BackendRequest[], project: string): ActivityRecord[] {
  return items.map((r) => ({
    ts:           r.requested_at,
    project,
    provider:     r.provider as ActivityRecord["provider"],
    model:        r.model,
    mode:         r.mode === "thinking" ? "thinking" : "standard",
    in:           r.input_tokens,
    out:          r.output_tokens,
    thinking:     r.thinking_tokens,
    // Display-side `cached` field plumbs cache-read totals through to
    // the existing per-request UI; UI redesign for cache_write is a
    // separate task (out of P0-5 scope, see remediation plan §6).
    cached:       r.cache_read_tokens,
    cost:         millicentsToUSD(r.cost_usd_minor_units),
    latency:      r.latency_ms ?? 0,
    status:       r.status === "success" ? "success" : "error",
  }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const data = await apiFetch<BackendProject[]>("/v1/projects");
  return data.map(adaptProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const data = await apiFetch<BackendProject>(`/v1/projects/${slug}`);
    return adaptProject(data);
  } catch {
    return null;
  }
}

export async function getProjectCosts(slug: string): Promise<ProjectCosts | null> {
  try {
    const data = await apiFetch<BackendProject>(`/v1/projects/${slug}`);
    const costs = adaptProjectCosts(data);
    // Fetch by_model for model cost breakdown
    try {
      const stats = await apiFetch<BackendStats>(`/v1/projects/${slug}/stats`);
      const modelMap: Record<string, number> = {};
      stats.by_model.forEach((m) => {
        modelMap[m.model] = (modelMap[m.model] ?? 0) + millicentsToUSD(m.cost_usd_minor_units);
      });
      costs.models = modelMap;
    } catch {
      // Models map optional — not fatal
    }
    return costs;
  } catch {
    return null;
  }
}

export async function getAllProjectCosts(): Promise<Record<string, ProjectCosts>> {
  const data = await apiFetch<BackendProject[]>("/v1/projects");
  return Object.fromEntries(data.map((p) => [p.slug, adaptProjectCosts(p)]));
}

export async function getSpendSeries(days: number): Promise<SpendDataPoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  // Use global /v1/stats endpoint to avoid N+1 calls
  const stats = await apiFetch<BackendStats>(`/v1/stats?since=${sinceStr}`);
  return adaptSpendSeriesFromDayByProvider(stats.by_day, stats.by_day_by_provider ?? []);
}

export async function getProjectSeries(slug: string, days: number): Promise<SpendDataPoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);
  const stats = await apiFetch<BackendStats>(`/v1/projects/${slug}/stats?since=${sinceStr}`);
  return adaptSpendSeriesFromDayByProvider(stats.by_day, stats.by_day_by_provider ?? []);
}

/**
 * Daemon liveness check.
 *
 * The daemon is "offline" only when we cannot reach its HTTP API at all.
 * If any endpoint answers, we treat the process as up — recency of the
 * last captured request is a separate signal ("idle" / "live"), not a
 * reachability one. Conflating the two used to make a healthy-but-quiet
 * daemon look broken to the dashboard.
 *
 * Tried in order:
 *   1. `GET /v1/daemon/status`
 *   2. `GET /v1/stats`           (fallback)
 *   3. `GET /health`             (minimal liveness)
 *
 * Returned states:
 *   - "live"    : reachable AND last request < 2 min ago
 *   - "idle"    : reachable AND last request older or unknown
 *   - "offline" : every endpoint failed (process down, port wrong, CORS, etc.)
 */
export type DaemonStatus = "live" | "idle" | "offline";

export interface DaemonStatusInfo {
  status: DaemonStatus;
  lastRequestAt: string | null;
  requestsLastHour?: number;
  /** True when the daemon answered /health but full API isn't ported yet. */
  apiPending?: boolean;
}

interface BackendDaemonStatus {
  last_seen_at: string | null;
  request_count_last_hour: number;
}

interface DaemonHealth {
  status?: string;
  version?: string;
}

function classifyReachable(lastSeenIso: string | null): DaemonStatus {
  // Reachable: distinguish only "live" (recent traffic) vs "idle" (no
  // recent traffic). "offline" is reserved for unreachable.
  if (!lastSeenIso) return "idle";
  const ageMs = Date.now() - new Date(lastSeenIso).getTime();
  return ageMs < 2 * 60_000 ? "live" : "idle";
}

export async function getDaemonStatus(): Promise<DaemonStatusInfo> {
  try {
    const data = await apiFetch<BackendDaemonStatus>("/v1/daemon/status");
    return {
      status: classifyReachable(data.last_seen_at),
      lastRequestAt: data.last_seen_at,
      requestsLastHour: data.request_count_last_hour,
    };
  } catch {
    try {
      const stats = await apiFetch<BackendStats>("/v1/stats");
      const last = stats.summary.last_request_at ?? null;
      return { status: classifyReachable(last), lastRequestAt: last };
    } catch {
      try {
        const health = await apiFetch<DaemonHealth>("/health");
        if (health?.status === "ok") {
          return { status: "idle", lastRequestAt: null, apiPending: true };
        }
      } catch {
        /* fall through */
      }
      return { status: "offline", lastRequestAt: null };
    }
  }
}

export async function getGlobalStats(days: number): Promise<BackendStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);
  return apiFetch<BackendStats>(`/v1/stats?since=${sinceStr}`);
}

export async function getActivity(): Promise<ActivityRecord[]> {
  const projects = await apiFetch<BackendProject[]>("/v1/projects");
  const allActivity = await Promise.all(
    projects.map(async (p) => {
      const data = await apiFetch<{ items: BackendRequest[]; next_cursor: string | null; total: number }>(
        `/v1/projects/${p.slug}/requests?limit=20`
      );
      return adaptActivity(data.items ?? [], p.slug);
    })
  );
  return allActivity.flat().sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 20);
}

export async function getProjectActivity(
  slug: string,
  cursor?: string | null,
  limit?: number,
  provider?: string | null,
): Promise<{ items: ActivityRecord[]; nextCursor: string | null; total: number }> {
  const params = new URLSearchParams();
  params.set("limit", String(limit ?? 50));
  if (cursor) params.set("cursor", cursor);
  if (provider) params.set("provider", provider);

  const data = await apiFetch<{ items: BackendRequest[]; next_cursor: string | null; total: number }>(
    `/v1/projects/${slug}/requests?${params.toString()}`
  );
  return {
    items: adaptActivity(data.items, slug),
    nextCursor: data.next_cursor,
    total: data.total,
  };
}

export async function getProjectTokens(slug: string): Promise<TokenTotals | null> {
  try {
    const stats = await apiFetch<BackendStats>(`/v1/projects/${slug}/stats`);
    return {
      input:    stats.summary.total_input_tokens,
      output:   stats.summary.total_output_tokens,
      thinking: stats.summary.total_thinking_tokens,
      cached:   stats.summary.total_cache_read_tokens,
    };
  } catch {
    return null;
  }
}

export async function getAllProjectTokens(): Promise<Record<string, TokenTotals>> {
  const projects = await apiFetch<BackendProject[]>("/v1/projects");
  const entries = await Promise.all(
    projects.map(async (p) => {
      const tokens = await getProjectTokens(p.slug);
      return [p.slug, tokens ?? { input: 0, output: 0, thinking: 0, cached: 0 }] as const;
    })
  );
  return Object.fromEntries(entries);
}

export async function getProjectListItems(): Promise<ProjectListItem[]> {
  return apiFetch<ProjectListItem[]>("/v1/projects");
}

/** CSV export URL — use as href for a download link */
export function getProjectCsvUrl(slug: string): string {
  return `${BASE_URL}/v1/projects/${slug}/requests.csv`;
}

/**
 * Live model rates (for cost breakdown tooltips).
 * In open-source we fall back to the static MODELS in constants.ts.
 * The full pricing-rates CRUD + reconciliation flows are enterprise-only
 * on the SaaS platform.
 */
export async function getModelRates(): Promise<Record<string, ModelRates>> {
  return {};
}

// Note: Advanced governance features (policies, audit, full reconciliation)
// are intentionally omitted from the open-source dashboard UI.
// They remain available via the daemon CLI and are reserved for
// enterprise tiers on the SaaS platform (meter.haltonlabs.com).
