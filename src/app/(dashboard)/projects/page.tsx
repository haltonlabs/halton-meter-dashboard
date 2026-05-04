"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, getAllProjectCosts } from "@/lib/api";
import type { Project, ProjectCosts } from "@/lib/types";
import { formatInt, formatUSD, stripDateSuffix } from "@/lib/format";
import { MODELS, PROVIDERS } from "@/lib/constants";
import { ModelBadge } from "@/components/provider-badge";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [costs, setCosts] = useState<Record<string, ProjectCosts>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([getProjects(), getAllProjectCosts()]);
        setProjects(p);
        setCosts(c);
      } catch (e) {
        console.error("Failed to load projects", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, color: "var(--fg-2)" }}>Loading…</div>;
  }

  const sorted = [...projects].sort((a, b) => (costs[b.slug]?.cost ?? 0) - (costs[a.slug]?.cost ?? 0));

  return (
    <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: "var(--fg-0)" }}>
          Projects
        </h1>
        <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>
          {projects.length} project{projects.length === 1 ? "" : "s"} tracked by the daemon
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ padding: 32, color: "var(--fg-2)", fontSize: 13, textAlign: "center" }}>
          No projects yet. Send your first request through the daemon to get started.
        </div>
      ) : (
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Project</th>
                <th>Primary model</th>
                <th>Status</th>
                <th className="right">Requests</th>
                <th className="right">This month</th>
                <th className="right">All time</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const c = costs[p.slug];
                const provider = MODELS[stripDateSuffix(p.primaryModel)]?.provider ?? "unknown";
                const dotColor = PROVIDERS[provider]?.color ?? "#94A3B8";
                return (
                  <tr key={p.slug}>
                    <td>
                      <Link href={`/projects/${p.slug}`} style={{ color: "var(--fg-0)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                        <span>
                          <div>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>
                            {p.slug}
                          </div>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <ModelBadge provider={provider} model={p.primaryModel} />
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
                    <td className="right num" style={{ color: "var(--fg-2)" }}>
                      {formatUSD(c?.allTimeCost ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
