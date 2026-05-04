"use client";
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { DaemonOfflineBanner } from "@/components/shell/daemon-offline-banner";
import { getProjects, getAllProjectCosts } from "@/lib/api";
import type { Project, ProjectCosts } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectCosts, setProjectCosts] = useState<Record<string, ProjectCosts>>({});

  useEffect(() => {
    Promise.all([getProjects(), getAllProjectCosts()])
      .then(([projs, costs]) => {
        setProjects(projs);
        setProjectCosts(costs);
      })
      .catch(() => {
        // Daemon unreachable — banner handles UX; sidebar renders empty.
      });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-0)", color: "var(--fg-0)" }}>
      <Sidebar projects={projects} projectCosts={projectCosts} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
        <DaemonOfflineBanner />
        <Topbar projects={projects} />
        {children}
      </main>
    </div>
  );
}
