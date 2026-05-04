/**
 * StatCard — a single summary stat tile used on the overview and project detail screens.
 */

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  className?: string;
}

import type React from "react";

export function StatCard({ label, value, sub, className = "" }: StatCardProps) {
  return (
    <div className={`card px-5 py-4 ${className}`}>
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--fg-2)" }}
      >
        {label}
      </p>
      <p
        className="mt-1.5 text-2xl font-semibold"
        style={{ color: "var(--fg-0)" }}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs" style={{ color: "var(--fg-3)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
