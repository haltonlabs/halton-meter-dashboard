import React from "react";

interface SidePanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SidePanel({ title, children, className = "" }: SidePanelProps) {
  return (
    <div className={`card ${className}`} style={{ padding: 16 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--fg-2)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}
