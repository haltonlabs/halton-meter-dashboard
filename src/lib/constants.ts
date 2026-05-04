export const PROVIDERS: Record<
  string,
  { id: string; name: string; short: string; color: string; mark: string }
> = {
  anthropic: { id: "anthropic", name: "Anthropic", short: "Claude",  color: "#D97757", mark: "A" },
  openai:    { id: "openai",    name: "OpenAI",    short: "OpenAI",  color: "#10A37F", mark: "O" },
  google:    { id: "google",    name: "Google",    short: "Gemini",  color: "#4285F4", mark: "G" },
  groq:      { id: "groq",      name: "Groq",      short: "Groq",    color: "#F55036", mark: "Q" },
  unknown:   { id: "unknown",   name: "Other",     short: "Other",   color: "#94A3B8", mark: "·" },
};

export const USD_TO_GBP = 0.79; // fixed for reports; override via env if needed

// Minimal MODELS map (fallback; real rates come from daemon /pricing-rates)
export const MODELS: Record<string, { provider: string; short: string; in: number; out: number; think: number; cacheRead: number }> = {
  "claude-sonnet-4-6": { provider: "anthropic", short: "Sonnet 4.6", in: 3.0, out: 15.0, think: 15.0, cacheRead: 0.3 },
  "claude-haiku-4-5":  { provider: "anthropic", short: "Haiku 4.5",  in: 0.8, out: 4.0,  think: 4.0,  cacheRead: 0.08 },
  "gpt-4o":            { provider: "openai",    short: "GPT-4o",     in: 2.5, out: 10.0, think: 0,    cacheRead: 0 },
  "gemini-1.5-pro":    { provider: "google",    short: "Gemini 1.5 Pro", in: 1.25, out: 5.0, think: 0, cacheRead: 0 },
};
