"use client";

import React, { useMemo, useState } from "react";
import { PROVIDERS } from "@/lib/constants";

interface SpendDataPoint {
  date: string;
  label: string;
  anthropic?: number;
  openai?: number;
  google?: number;
  groq?: number;
  total: number;
}

interface StackedAreaChartProps {
  data: SpendDataPoint[];
  providers: string[];
  mode?: "stacked" | "line";
  height?: number;
}

const PADDING = { top: 12, right: 12, bottom: 22, left: 44 };

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  let nf;
  if (f <= 1) nf = 1;
  else if (f <= 2) nf = 2;
  else if (f <= 5) nf = 5;
  else nf = 10;
  return nf * exp;
}

function fmtAxis(v: number): string {
  if (v === 0) return "$0";
  if (v < 1) return `$${v.toFixed(2)}`;
  if (v < 10) return `$${v.toFixed(1)}`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${Math.round(v)}`;
}

export function StackedAreaChart({ data, providers, height = 220 }: StackedAreaChartProps) {
  const [width, setWidth] = useState(720);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(Math.max(360, Math.floor(e.contentRect.width)));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { paths, gridLines, xLabels } = useMemo(() => {
    if (!data.length) return { paths: [], gridLines: [], xLabels: [] };

    const innerW = width - PADDING.left - PADDING.right;
    const innerH = height - PADDING.top - PADDING.bottom;
    const rawMax = Math.max(...data.map((d) => d.total || 0), 0.000001);
    const max = niceMax(rawMax);

    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
    const xAt = (i: number) => PADDING.left + i * stepX;
    const yAt = (v: number) => PADDING.top + innerH - (v / max) * innerH;

    const cumulative = data.map(() => 0);
    const paths = providers.map((p) => {
      const top: [number, number][] = [];
      const bottom: [number, number][] = [];
      data.forEach((d, i) => {
        const v = ((d as unknown as Record<string, number>)[p] as number) || 0;
        const y0 = cumulative[i];
        const y1 = y0 + v;
        bottom.push([xAt(i), yAt(y0)]);
        top.push([xAt(i), yAt(y1)]);
        cumulative[i] = y1;
      });
      const dStr =
        `M ${top.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ")} ` +
        `L ${bottom
          .slice()
          .reverse()
          .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
          .join(" L ")} Z`;
      return { provider: p, color: PROVIDERS[p]?.color ?? "#94A3B8", d: dStr };
    });

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => {
      const v = max * f;
      return { y: yAt(v), label: fmtAxis(v) };
    });

    const labelStep = Math.max(1, Math.ceil(data.length / 6));
    const xLabels = data
      .map((d, i) => ({ x: xAt(i), label: d.label, show: i % labelStep === 0 || i === data.length - 1 }))
      .filter((d) => d.show);

    return { paths, gridLines, xLabels };
  }, [data, providers, width, height]);

  if (!data.length) {
    return (
      <div
        ref={containerRef}
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--fg-3)",
          fontSize: 13,
        }}
      >
        No spend data yet — send your first LLM request through the daemon.
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={g.y}
              y2={g.y}
              stroke="var(--line-1)"
              strokeWidth={1}
              strokeDasharray={i === 0 ? "0" : "2 3"}
            />
            <text
              x={PADDING.left - 8}
              y={g.y}
              textAnchor="end"
              dominantBaseline="middle"
              style={{ fill: "var(--fg-3)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            >
              {g.label}
            </text>
          </g>
        ))}
        {paths.map((p) => (
          <path
            key={p.provider}
            d={p.d}
            fill={p.color}
            fillOpacity={0.45}
            stroke={p.color}
            strokeWidth={1.2}
          />
        ))}
        {xLabels.map((x, i) => (
          <text
            key={i}
            x={x.x}
            y={height - 6}
            textAnchor="middle"
            style={{ fill: "var(--fg-3)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          >
            {x.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
