import React from "react";
import { getProviderColor, getProviderDisplay } from "@/lib/types";
import { PROVIDERS } from "@/lib/constants";

interface ProviderPillProps {
  provider: string;
}

export function ProviderPill({ provider }: ProviderPillProps) {
  const color = getProviderColor(provider);
  const name = getProviderDisplay(provider);
  return (
    <span
      className="ppill"
      style={{ background: `${color}15`, borderColor: `${color}40`, color }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {name}
    </span>
  );
}

interface ProviderMarkProps {
  provider: string;
  size?: "sm" | "md";
}

export function ProviderMark({ provider, size = "md" }: ProviderMarkProps) {
  const color = getProviderColor(provider);
  const mark = PROVIDERS[provider]?.mark ?? "·";
  const sz = size === "sm" ? 14 : 18;
  return (
    <span
      className="pmark"
      style={{
        width: sz,
        height: sz,
        background: color,
        color: "white",
        fontSize: size === "sm" ? 8 : 10,
      }}
    >
      {mark}
    </span>
  );
}

interface ChartLegendProps {
  providers: string[];
}

export function ChartLegend({ providers }: ChartLegendProps) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {providers.map((p) => (
        <span key={p} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--fg-2)" }}>
          <span style={{ width: 8, height: 8, background: PROVIDERS[p]?.color, borderRadius: 2 }} />
          {PROVIDERS[p]?.short}
        </span>
      ))}
    </div>
  );
}

interface MiniBarProps {
  value: number;
  max: number;
  color: string;
}

export function MiniBar({ value, max, color }: MiniBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.2s ease" }} />
    </div>
  );
}

interface KVProps {
  label: string;
  value: React.ReactNode;
}

export function KV({ label, value }: KVProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "var(--fg-2)" }}>{label}</span>
      <span style={{ color: "var(--fg-0)", fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

interface StatColProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  mono?: boolean;
}

export function StatCol({ label, value, sub, mono = true }: StatColProps) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "var(--fg-0)",
          marginTop: 4,
          fontFamily: mono ? "var(--font-mono)" : "inherit",
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

interface DeltaProps {
  pct: number;
}

export function Delta({ pct }: DeltaProps) {
  const isUp = pct > 0;
  return (
    <span
      className={`delta ${isUp ? "delta--up" : "delta--down"}`}
      style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 2 }}
    >
      {isUp ? "↑" : "↓"} {Math.abs(pct * 100).toFixed(1)}%
    </span>
  );
}
