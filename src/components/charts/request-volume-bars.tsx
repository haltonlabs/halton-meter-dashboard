"use client";

import React, { useMemo, useState } from "react";

interface SpendDataPoint {
  label: string;
  requests: number;
}

interface RequestVolumeBarsProps {
  data: SpendDataPoint[];
  height?: number;
}

const PADDING = { top: 8, right: 12, bottom: 22, left: 44 };

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

export function RequestVolumeBars({ data, height = 140 }: RequestVolumeBarsProps) {
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

  const { bars, gridLines, xLabels } = useMemo(() => {
    if (!data.length) return { bars: [], gridLines: [], xLabels: [] };
    const innerW = width - PADDING.left - PADDING.right;
    const innerH = height - PADDING.top - PADDING.bottom;
    const rawMax = Math.max(...data.map((d) => d.requests || 0), 1);
    const max = niceMax(rawMax);

    const slot = innerW / data.length;
    const barW = Math.max(2, slot * 0.6);

    const yAt = (v: number) => PADDING.top + innerH - (v / max) * innerH;

    const bars = data.map((d, i) => {
      const x = PADDING.left + slot * i + (slot - barW) / 2;
      const y = yAt(d.requests || 0);
      const h = PADDING.top + innerH - y;
      return { x, y, w: barW, h, requests: d.requests, label: d.label };
    });

    const gridLines = [0, 0.5, 1].map((f) => {
      const v = max * f;
      return { y: yAt(v), label: Math.round(v).toLocaleString("en-US") };
    });

    const labelStep = Math.max(1, Math.ceil(data.length / 6));
    const xLabels = data
      .map((d, i) => ({
        x: PADDING.left + slot * i + slot / 2,
        label: d.label,
        show: i % labelStep === 0 || i === data.length - 1,
      }))
      .filter((d) => d.show);

    return { bars, gridLines, xLabels };
  }, [data, width, height]);

  if (!data.length) {
    return <div style={{ height, color: "var(--fg-3)", fontSize: 13 }}>No requests yet.</div>;
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
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={Math.max(0, b.h)}
            fill="var(--accent)"
            fillOpacity={0.85}
            rx={2}
          >
            <title>{`${b.label}: ${b.requests} requests`}</title>
          </rect>
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
