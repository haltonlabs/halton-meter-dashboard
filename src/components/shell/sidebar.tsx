"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MODELS, PROVIDERS } from "@/lib/constants";
import { stripDateSuffix } from "@/lib/format";
import type { Project, ProjectCosts } from "@/lib/types";

interface SidebarProps {
  projects: Project[];
  projectCosts: Record<string, ProjectCosts>;
}

export function Sidebar({ projects, projectCosts }: SidebarProps) {
  const pathname = usePathname();
  const activeProjects = projects.filter((p) => p.status === "active");

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        background: "var(--bg-1)",
        borderRight: "1px solid var(--line-1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "18px 18px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "linear-gradient(135deg, var(--accent), oklch(64% 0.18 240))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round">
            <path d="M4 20V8M10 20v-7M16 20V4M22 20H2" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-0)" }}>Halton Meter</span>
      </div>

      <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        <NavLink href="/projects" icon="folder" label="Projects" pathname={pathname} />

        <div style={{ marginTop: 8, paddingLeft: 10 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 0.04,
              textTransform: "uppercase",
              color: "var(--fg-3)",
              padding: "8px 0 4px",
            }}
          >
            Active projects
          </div>
          {activeProjects.map((p) => {
            const cost = projectCosts[p.slug]?.cost ?? 0;
            const providerKey =
              MODELS[stripDateSuffix(p.primaryModel)]?.provider ?? "unknown";
            const isActive = pathname.startsWith(`/projects/${p.slug}`);
            const dotColor = PROVIDERS[providerKey]?.color ?? "#94A3B8";
            return (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  background: isActive ? "var(--bg-3)" : "transparent",
                  color: isActive ? "var(--fg-0)" : "var(--fg-1)",
                  fontSize: 12,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)" }}>
                  ${cost.toFixed(0)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{ padding: "12px", borderTop: "1px solid var(--line-1)", fontSize: 11, color: "var(--fg-2)", lineHeight: 1.5 }}>
        Need governance, audits, or PDF reports?{" "}
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
  );
}

function NavLink({
  href,
  icon,
  label,
  pathname,
}: {
  href: string;
  icon: string;
  label: string;
  pathname: string;
}) {
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        background: isActive ? "var(--bg-3)" : "transparent",
        color: isActive ? "var(--fg-0)" : "var(--fg-1)",
        borderRadius: 7,
        fontSize: 13,
        fontWeight: isActive ? 500 : 400,
      }}
    >
      <Icon name={icon} size={16} stroke={isActive ? "var(--fg-0)" : "var(--fg-2)"} />
      <span>{label}</span>
    </Link>
  );
}
