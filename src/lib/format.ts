export function formatCost(millicents: number | null | undefined): string {
  if (millicents == null) return "$0.000000";
  const usd = millicents / 100_000;
  if (usd < 1) {
    return `$${usd.toFixed(6)}`;
  }
  return `$${usd.toFixed(2)}`;
}

export function formatInt(n: number | null | undefined): string {
  if (n == null) return "0";
  return n.toLocaleString("en-US");
}

export function formatTokens(n: number | null | undefined): string {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("en-US");
}

export function formatUSD(usd: number | null | undefined): string {
  if (usd == null) return "$0.00";
  if (usd < 1) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

export function stripDateSuffix(model: string): string {
  return model.replace(/-\d{8}$/, "");
}

export function formatTime(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  } catch {
    return iso;
  }
}

export function formatLatency(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function shortModelName(model: string): string {
  return stripDateSuffix(model)
    .replace(/^claude-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
