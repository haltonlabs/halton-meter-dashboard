/**
 * CostDisplay — monospace cost value with correct decimal places.
 * Sub-$1: 6dp. ≥$1: 2dp.
 */

import { formatCost } from "@/lib/format";

interface CostDisplayProps {
  millicents: number | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-2xl font-semibold",
};

export function CostDisplay({
  millicents,
  className = "",
  size = "md",
}: CostDisplayProps) {
  return (
    <span
      className={`font-mono tabular-nums ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {formatCost(millicents)}
    </span>
  );
}
