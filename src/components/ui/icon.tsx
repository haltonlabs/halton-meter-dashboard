import React from "react";

interface IconProps {
  name: string;
  size?: number;
  stroke?: string;
}

export function Icon({ name, size = 16, stroke = "currentColor" }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const icons: Record<string, React.ReactNode> = {
    alert: (
      <svg {...common}><path d="M12 9v2m0 4h.01M21 12a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9z" /></svg>
    ),
    download: (
      <svg {...common}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
    ),
    ext: (
      <svg {...common}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
    ),
    folder: (
      <svg {...common}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
    ),
    sun: (
      <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
    ),
    moon: (
      <svg {...common}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
    ),
    chevron: (
      <svg {...common}><path d="M9 18l6-6-6-6" /></svg>
    ),
  };
  return <span style={{ display: "inline-flex" }}>{icons[name] || <span>·</span>}</span>;
}
