"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, getAllProjectCosts, getSpendSeries } from "@/lib/api";
import type { Project, ProjectCosts, SpendDataPoint } from "@/lib/types";
import { formatInt, formatUSD } from "@/lib/format";
import { CostDisplay } from "@/components/cost-display";
import { StatCard } from "@/components/stat-card";
import { StackedAreaChart } from "@/components/charts/stacked-area-chart";
import { ChartLegend } from "@/components/project-detail/shared";

export default function OverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [costs, setCosts] = useState<Record<string, ProjectCosts>>({});
  const [series, setSeries] = useState<SpendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, s] = await Promise.all([
          getProjects(),
          getAllProjectCosts(),
          getSpendSeries(30),
        ]);
        setProjects(p);
        setCosts(c);
        setSeries(s);
      } catch (e) {
        console.error("Failed to load overview", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, color: "var(--fg-2)" }}>Loading…</div>;
  }

  const totalCost = Object.values(costs).reduce((sum, c) => sum + c.cost, 0);
  const totalRequests = Object.values(costs).reduce((sum, c) => sum + c.requests, 0);
  const activeCount = projects.filter((p) => p.status === "active").length;

  const usedProviders = ["anthropic", "openai", "google", "groq"].filter((p) =>
    series.some((d) => ((d as Record<string, number | string>)[p] as number) > 0)
  );

  return (
    <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: "var(--fg-0)" }}>
          Overview
        </h1>
        <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>
          All projects, last 30 days
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <StatCard
          label="Spend this month"
          value={<CostDisplay millicents={Math.round(totalCost * 100_000)} size="xl" />}
        />
        <StatCard label="Requests" value={formatInt(totalRequests)} />
        <StatCard label="Active projects" value={String(activeCount)} sub={`${projects.length} total`} />
      </div>

      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--fg-0)" }}>Spend over time</h2>
            <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
              Stacked by provider · last 30 days
            </div>
          </div>
          <ChartLegend providers={usedProviders} />
        </div>
        <StackedAreaChart data={series} providers={usedProviders} mode="stacked" height={220} />
      </section>

      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line-1)" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Projects</h2>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th className="right">Requests</th>
              <th className="right">Spend</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const c = costs[p.slug];
              return (
                <tr key={p.slug}>
                  <td>
                    <Link href={`/projects/${p.slug}`} style={{ color: "var(--fg-0)", textDecoration: "none" }}>
                      {p.name}
                    </Link>
                    <div style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>
                      {p.slug}
                    </div>
                  </td>
                  <td>
                    {p.status === "active" ? (
                      <span className="badge badge--pos">Active</span>
                    ) : (
                      <span className="badge">Archived</span>
                    )}
                  </td>
                  <td className="right num">{formatInt(c?.requests ?? 0)}</td>
                  <td className="right num">{formatUSD(c?.cost ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
