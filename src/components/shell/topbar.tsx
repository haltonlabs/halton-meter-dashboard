"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "@/lib/theme";
import type { Project } from "@/lib/types";

interface TopbarProps {
  projects: Project[];
}

export function Topbar({ projects }: TopbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isProjectDetail =
    pathname.startsWith("/projects/") && pathname.split("/").length >= 3;
  const slug = isProjectDetail ? pathname.split("/")[2] : null;
  const project = slug ? projects.find((p) => p.slug === slug) : null;

  const labels: Record<string, string> = {
    "/overview": "Overview",
    "/projects": "Projects",
  };
  const currentLabel = labels[pathname];

  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid var(--line-1)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 12,
        background: "var(--bg-0)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-2)", flex: 1 }}>
        {isProjectDetail && project ? (
          <>
            <Link href="/projects" style={{ color: "var(--fg-2)", textDecoration: "none" }}>
              Projects
            </Link>
            <Icon name="chevron" size={12} stroke="var(--fg-3)" />
            <span style={{ color: "var(--fg-0)", fontWeight: 500 }}>{project.name}</span>
          </>
        ) : currentLabel ? (
          <span style={{ color: "var(--fg-0)", fontWeight: 500, fontSize: 14 }}>{currentLabel}</span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          background: "var(--bg-2)",
          border: "1px solid var(--line-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--fg-2)",
          cursor: "pointer",
        }}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={14} stroke="currentColor" />
      </button>
    </header>
  );
}
