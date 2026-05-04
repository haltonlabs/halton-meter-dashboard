"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getProjectBySlug,
  getProjectCosts,
  getProjectSeries,
  getProjectActivity,
  getProjectTokens,
} from "@/lib/api";
import type { Project, ProjectCosts, SpendDataPoint, ActivityRecord, TokenTotals } from "@/lib/types";
import { PROVIDERS, MODELS } from "@/lib/constants";
import { formatInt, formatTokens, formatTime } from "@/lib/format";
import { ModelBadge } from "@/components/provider-badge";
import { CostDisplay } from "@/components/cost-display";

function Cost({ value, size = "md" as const }: { value: number; size?: "sm" | "md" | "lg" | "xl" }) {
  return <CostDisplay millicents={Math.round((value || 0) * 100_000)} size={size} />;
}
import { Icon } from "@/components/ui/icon";
import { StackedAreaChart } from "@/components/charts/stacked-area-chart";
import { RequestVolumeBars } from "@/components/charts/request-volume-bars";
import { SidePanel } from "@/components/shell/side-panel";
import { ProviderPill, ProviderMark, ChartLegend, MiniBar, KV, StatCol, Delta } from "@/components/project-detail/shared";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [proj, setProj] = useState<Project | null>(null);
  const [costs, setCosts] = useState<ProjectCosts | null>(null);
  const [series, setSeries] = useState<SpendDataPoint[]>([]);
  const [requests, setRequests] = useState<ActivityRecord[]>([]);
  const [tokData, setTokData] = useState<TokenTotals>({ input: 0, output: 0, thinking: 0, cached: 0 });
  const [days, setDays] = useState<30 | 90 | 0>(30);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setLoading(true);
      try {
        const [p, c, s, t] = await Promise.all([
          getProjectBySlug(slug),
          getProjectCosts(slug),
          getProjectSeries(slug, days === 0 ? 365 : days),
          getProjectTokens(slug),
        ]);

        setProj(p);
        setCosts(c);
        setSeries(s);
        setTokData(t ?? { input: 0, output: 0, thinking: 0, cached: 0 });

        const act = await getProjectActivity(slug, null, 20);
        setRequests(act.items);
        setNextCursor(act.nextCursor);
        setTotalRequests(act.total);
      } catch (e) {
        console.error("Failed to load project detail", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, days]);

  const handleNext = async () => {
    if (!nextCursor) return;
    const act = await getProjectActivity(slug, nextCursor, 20);
    setRequests(act.items);
    setNextCursor(act.nextCursor);
    setCursorStack((prev) => [...prev, nextCursor]);
  };

  const handlePrev = async () => {
    if (cursorStack.length === 0) return;
    const prevCursor = cursorStack[cursorStack.length - 2] || null;
    const act = await getProjectActivity(slug, prevCursor, 20);
    setRequests(act.items);
    setNextCursor(act.nextCursor);
    setCursorStack((prev) => prev.slice(0, -1));
  };

  if (loading || !proj || !costs) {
    return (
      <div style={{ padding: 40, color: "var(--fg-2)" }}>
        Loading project data from daemon…
      </div>
    );
  }

  const summary = costs;
  const usedProviders = ["anthropic", "openai", "google", "groq"].filter((p) =>
    series.some((d) => (d as any)[p] > 0)
  );

  const lastMonthDelta =
    summary.lastMonth > 0 ? (summary.cost - summary.lastMonth) / summary.lastMonth : null;

  const avgCost = summary.requests > 0 ? summary.cost / summary.requests : 0;
  const avgTokens =
    tokData.input + tokData.output + tokData.thinking > 0
      ? (tokData.input + tokData.output + tokData.thinking) / summary.requests
      : 0;
  const cacheHitRate = tokData.input + tokData.cached > 0 ? tokData.cached / (tokData.input + tokData.cached) : 0;

  const byProvider: Record<string, number> = {};
  usedProviders.forEach((p) => {
    byProvider[p] = series.reduce((sum, d) => sum + ((d as any)[p] || 0), 0);
  });
  const providerTotal = Object.values(byProvider).reduce((a, b) => a + b, 0);

  const currentMonthLabel = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const reqPerDay = summary.requests > 0 ? (summary.requests / (days || 30)).toFixed(1) : "0";

  const btnGhostStyle = {
    height: 28,
    padding: "0 10px",
    border: "1px solid var(--line-2)",
    background: "var(--bg-2)",
    color: "var(--fg-2)",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  };

  return (
    <div style={{ display: "flex", gap: 24, padding: "24px 32px" }}>
      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0, flex: 1 }}>

        {/* Project header */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              marginBottom: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: -0.3,
                    color: "var(--fg-0)",
                  }}
                >
                  {proj.name}
                </h1>
                <span className="badge badge--ghost" style={{ fontFamily: "var(--font-mono)" }}>
                  {proj.slug}
                </span>
                {proj.status === "active" ? (
                  <span className="badge badge--pos">
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--pos)",
                      }}
                    />
                    Active
                  </span>
                ) : (
                  <span className="badge">Archived</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-2)" }}>
                {proj.client} · created {proj.created} ·{" "}
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  ~/.haltonrc → project={proj.slug}
                </span>
              </div>
            </div>
          </div>

          {/* Time range toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {([30, 90, 0] as const).map((d) => (
              <button
                key={d}
                onClick={() => { setCursorStack([]); setDays(d); }}
                style={{
                  ...btnGhostStyle,
                  background: days === d ? "var(--accent-soft)" : "var(--bg-2)",
                  color: days === d ? "var(--accent)" : "var(--fg-1)",
                  border: days === d ? "1px solid var(--accent-line)" : "1px solid var(--line-2)",
                }}
              >
                {d === 0 ? "All time" : `${d}d`}
              </button>
            ))}
          </div>

          {/* Big stat card */}
          <div
            className="card"
            style={{
              padding: 24,
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
              gap: 32,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--fg-2)",
                  textTransform: "uppercase",
                  letterSpacing: 0.06,
                  marginBottom: 8,
                }}
              >
                This month · {currentMonthLabel}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <Cost value={summary.cost} size="xl" />
                {lastMonthDelta != null && <Delta pct={lastMonthDelta} />}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--fg-3)",
                  marginTop: 6,
                  fontFamily: "var(--font-mono)",
                }}
              >
                vs ${summary.lastMonth.toFixed(4)} last month
              </div>
            </div>
            <StatCol
              label="Requests"
              value={formatInt(summary.requests)}
              sub={`${reqPerDay}/day avg`}
            />
            <StatCol
              label="Avg cost / request"
              value={<Cost value={avgCost} />}
              sub={`avg ${formatTokens(avgTokens)} tok`}
              mono={false}
            />
            <StatCol
              label="Cache hit rate"
              value={`${(cacheHitRate * 100).toFixed(1)}%`}
              sub={`${formatTokens(tokData.cached)} cached`}
            />
          </div>
        </section>

        {/* Spend over time */}
        <section className="card" style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--fg-0)",
                }}
              >
                Spend over time
              </h2>
              <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                Stacked by provider · last {days === 0 ? "all" : days} days
              </div>
            </div>
            <ChartLegend providers={usedProviders} />
          </div>
          <StackedAreaChart
            data={series}
            providers={usedProviders}
            mode="stacked"
            height={220}
          />
        </section>

        {/* Request volume */}
        <section className="card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--fg-0)" }}>
              Request volume
            </h2>
            <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
              Requests per day · same axis
            </div>
          </div>
          <RequestVolumeBars data={series} height={100} />
        </section>

        {/* Recent requests table */}
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--line-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Recent requests</h2>
              <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
                {requests.length} of {totalRequests.toLocaleString()} · live tail
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <a
                href={`/api/projects/${proj.slug}/requests.csv`}
                download
                style={{ ...btnGhostStyle, textDecoration: "none" }}
              >
                <Icon name="download" size={12} stroke="var(--fg-2)" />
                Export CSV
              </a>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Time</th>
                <th>Provider</th>
                <th>Model</th>
                <th>Mode</th>
                <th className="right">Input</th>
                <th className="right">Output</th>
                <th className="right">Cached</th>
                <th className="right">Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={i}>
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--fg-2)",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatTime(r.ts)}
                  </td>
                  <td>
                    <ProviderPill provider={r.provider} />
                  </td>
                  <td>
                    <ModelBadge provider={r.provider} model={r.model} />
                  </td>
                  <td>
                    {r.mode === "thinking" ? (
                      <span className="badge badge--accent">thinking</span>
                    ) : (
                      <span style={{ color: "var(--fg-3)", fontSize: 12 }}>standard</span>
                    )}
                  </td>
                  <td className="right num">{formatInt(r.in)}</td>
                  <td className="right num">{formatInt(r.out)}</td>
                  <td
                    className="right num"
                    style={{ color: r.cached ? "var(--fg-1)" : "var(--fg-3)" }}
                  >
                    {r.cached ? formatInt(r.cached) : "—"}
                  </td>
                  <td className="right">
                    <Cost value={r.cost} size="sm" />
                  </td>
                  <td>
                    {r.status === "success" ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          color: "var(--pos)",
                          fontSize: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "var(--pos)",
                          }}
                        />
                        OK
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          color: "var(--neg)",
                          fontSize: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "var(--neg)",
                          }}
                        />
                        Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid var(--line-1)",
              display: "flex",
              justifyContent: "space-between",
              color: "var(--fg-2)",
              fontSize: 12,
            }}
          >
            <span>
              Showing {requests.length} of {totalRequests.toLocaleString()} requests
            </span>
            <span style={{ display: "inline-flex", gap: 8 }}>
              <button
                style={{ ...btnGhostStyle, height: 26, opacity: cursorStack.length === 0 ? 0.4 : 1 }}
                onClick={handlePrev}
                disabled={cursorStack.length === 0}
              >
                ← Prev
              </button>
              <button
                style={{ ...btnGhostStyle, height: 26, opacity: !nextCursor ? 0.4 : 1 }}
                onClick={handleNext}
                disabled={!nextCursor}
              >
                Next →
              </button>
            </span>
          </div>
        </section>

      </div>

      {/* Right sidebar */}
      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "sticky",
          top: 80,
          alignSelf: "flex-start",
          width: 280,
        }}
      >
        <SidePanel title="This period">
          <KV label="Total cost" value={<Cost value={summary.cost} />} />
          <KV label="Requests" value={<span className="num">{formatInt(summary.requests)}</span>} />
          <KV label="Input tokens" value={<span className="num">{formatTokens(tokData.input)}</span>} />
          <KV label="Output tokens" value={<span className="num">{formatTokens(tokData.output)}</span>} />
          {tokData.thinking > 0 && (
            <KV label="Thinking tokens" value={<span className="num">{formatTokens(tokData.thinking)}</span>} />
          )}
          <KV
            label="Cached tokens"
            value={
              <span className="num">
                {formatTokens(tokData.cached)}{" "}
                <span style={{ color: "var(--fg-3)" }}>
                  ({(cacheHitRate * 100).toFixed(0)}%)
                </span>
              </span>
            }
          />
        </SidePanel>

        <SidePanel title="By provider">
          {Object.entries(byProvider)
            .sort((a, b) => b[1] - a[1])
            .map(([p, v]) => (
              <div key={p} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--fg-1)",
                    }}
                  >
                    <ProviderMark provider={p} size="sm" />
                    {PROVIDERS[p]?.name ?? p}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--fg-0)",
                    }}
                  >
                    ${v.toFixed(2)}
                  </span>
                </div>
                <MiniBar value={v} max={providerTotal} color={PROVIDERS[p]?.color ?? "#94A3B8"} />
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--fg-3)",
                    marginTop: 3,
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {((v / providerTotal) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
        </SidePanel>

        <SidePanel title="Top models">
          {Object.entries(summary.models)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([m, v]) => (
              <div
                key={m}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--line-1)",
                }}
              >
                <ModelBadge provider={PROVIDERS[MODELS[m]?.provider || "unknown"]?.id || "unknown"} model={m} />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--fg-0)",
                  }}
                >
                  ${v.toFixed(2)}
                </span>
              </div>
            ))}
        </SidePanel>

        <SidePanel title="Cost efficiency">
          <KV label="Avg / request" value={<Cost value={avgCost} />} />
          <KV label="Avg tokens" value={<span className="num">{formatInt(Math.round(avgTokens))}</span>} />
          <KV label="Cache hit rate" value={<span className="num">{(cacheHitRate * 100).toFixed(1)}%</span>} />
        </SidePanel>

        <div
          style={{
            padding: 12,
            border: "1px dashed var(--line-2)",
            borderRadius: 7,
            fontSize: 11,
            color: "var(--fg-2)",
            lineHeight: 1.5,
          }}
        >
          Need governance, audit trails, or PDF reports?{" "}
          <a
            href="https://meter.haltonlabs.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            Halton Meter Cloud →
          </a>
        </div>
      </aside>
    </div>
  );
}
