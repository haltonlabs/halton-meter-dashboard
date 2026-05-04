import { getProviderColor, getProviderDisplay } from "@/lib/types";

interface ProviderBadgeProps {
  provider: string;
  className?: string;
}

export function ProviderBadge({ provider, className = "" }: ProviderBadgeProps) {
  const color = getProviderColor(provider);
  const name = getProviderDisplay(provider);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-sm" style={{ color: "var(--fg-1)" }}>{name}</span>
    </span>
  );
}

interface ModelBadgeProps {
  provider: string;
  model: string;
}

export function ModelBadge({ provider, model }: ModelBadgeProps) {
  const color = getProviderColor(provider);
  const shortName = formatModelName(model);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono)",
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {shortName}
    </span>
  );
}

// claude-haiku-4-5-20251001 → Haiku 4.5
// claude-sonnet-4-6         → Sonnet 4.6
// gpt-4o                    → GPT-4o
// gemini-1.5-pro            → Gemini 1.5 Pro
function formatModelName(model: string): string {
  let m = model.replace(/-\d{8}$/, "").replace(/^claude-/, "");
  // Collapse digit-hyphen-digit into digit.digit (version numbers)
  m = m.replace(/(\d)-(\d)/g, "$1.$2");
  return m
    .split("-")
    .map((part) => {
      if (/^gpt$/i.test(part)) return "GPT";
      if (/^\d/.test(part)) return part; // keep "4o", "4.5", "1.5"
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}
