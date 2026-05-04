export type Provider = "anthropic" | "openai" | "google" | "groq" | "unknown";
export type DateRange = "7d" | "30d" | "90d" | "all";
export type ProviderFilter = "all" | Provider;

export interface Project {
  slug: string;
  name: string;
  client: string;
  status: "active" | "archived";
  created: string;
  primaryModel: string;
  description: string;
}

export interface ProjectCosts {
  cost: number;
  requests: number;
  lastMonth: number;
  allTimeCost: number;
  allTimeRequests: number;
  lastActiveAt: string | null;
  models: Record<string, number>;
  topModel: string | null;
  topProvider: string | null;
}

export interface SpendDataPoint {
  date: string;
  day: number;
  label: string;
  anthropic: number;
  openai: number;
  google: number;
  groq: number;
  total: number;
  requests: number;
  [key: string]: number | string;
}

export interface ActivityRecord {
  ts: string;
  project: string;
  provider: Provider;
  model: string;
  mode: "standard" | "thinking";
  in: number;
  out: number;
  thinking: number;
  cached: number;
  cost: number;
  latency: number;
  status: "success" | "error";
}

export interface TokenTotals {
  input: number;
  output: number;
  thinking: number;
  cached: number;
}

export interface ProjectListItem {
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

export interface StatsByDayByProvider {
  date: string;
  provider: string;
  requests: number;
  cost_usd_minor_units: number;
}

export interface ModelRates {
  provider: string;
  short: string;
  in: number;
  out: number;
  think: number;
  cacheRead: number;
}

// Provider colour helpers
import { PROVIDERS } from "./constants";

export function getProviderColor(provider: string): string {
  return PROVIDERS[provider.toLowerCase()]?.color ?? PROVIDERS.unknown.color;
}

export function getProviderDisplay(provider: string): string {
  return PROVIDERS[provider.toLowerCase()]?.name ?? provider;
}
