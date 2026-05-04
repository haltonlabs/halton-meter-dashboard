"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiBaseUrl, getDaemonStatus } from "@/lib/api";

const POLL_INTERVAL_MS = 30_000;

export function DaemonOfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function check() {
      const info = await getDaemonStatus();
      if (cancelled) return;
      setOffline(info.status === "offline");
      timer = setTimeout(check, POLL_INTERVAL_MS);
    }

    check();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      style={{
        background: "var(--accent-soft)",
        borderBottom: "1px solid var(--accent-line)",
        color: "var(--fg-0)",
        fontSize: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 24px",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent)",
            flexShrink: 0,
          }}
          aria-hidden
        />
        <span style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontWeight: 600 }}>Daemon not reachable.</strong>{" "}
          The dashboard can&apos;t reach{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{apiUrl}</code>
          . Your traffic isn&apos;t being recorded.
        </span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            border: "1px solid var(--accent-line)",
            background: "transparent",
            color: "var(--accent)",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-expanded={expanded}
        >
          {expanded ? "Hide steps" : "How to fix"}
        </button>
      </div>

      {expanded && (
        <div
          style={{
            padding: "0 24px 12px 44px",
            color: "var(--fg-1)",
            lineHeight: 1.55,
          }}
        >
          <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            <li>
              <strong>Start the daemon.</strong> In a terminal:{" "}
              <code style={codeStyle}>halton-meter daemon</code>{" "}
              (a packaged{" "}
              <code style={codeStyle}>halton-meter start</code> ships in a later
              release). Confirm it&apos;s up:{" "}
              <code style={codeStyle}>curl {apiUrl}/health</code> should return{" "}
              <code style={codeStyle}>{`{"status":"ok"}`}</code>.
            </li>
            <li>
              <strong>Check the port.</strong> The dashboard expects the daemon at{" "}
              <code style={codeStyle}>{apiUrl}</code>. If you&apos;ve changed{" "}
              <code style={codeStyle}>daemon.api_port</code> in{" "}
              <code style={codeStyle}>~/.halton-meter/config.toml</code>, set{" "}
              <code style={codeStyle}>NEXT_PUBLIC_API_URL</code> in{" "}
              <code style={codeStyle}>dashboard/.env.local</code> to match, then
              restart{" "}
              <code style={codeStyle}>npm run dev</code>.
            </li>
            <li>
              <strong>Still stuck?</strong>{" "}
              <Link
                href="https://github.com/haltonlabs/halton-meter#readme"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", textDecoration: "underline" }}
              >
                Check the README
              </Link>{" "}
              or{" "}
              <Link
                href="https://github.com/haltonlabs/halton-meter/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", textDecoration: "underline" }}
              >
                open an issue
              </Link>
              . The banner clears automatically once the daemon answers (poll every 30s).
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

const codeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  background: "var(--bg-2)",
  border: "1px solid var(--line-1)",
  borderRadius: 4,
  padding: "1px 5px",
};
