"use client";

/**
 * Top-level error boundary. Renders when a route throws a runtime exception.
 * Uses CSS tokens (not Tailwind utilities) so the surface follows the active
 * theme. Surfaces the error message verbatim — beta users running locally
 * will want the raw cause, not a sanitised "Oops!".
 */
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg-0)",
        color: "var(--fg-0)",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div
          className="card"
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--fg-0)" }}>
            Something broke while rendering this page
          </div>
          <pre
            style={{
              margin: 0,
              padding: "10px 12px",
              background: "var(--bg-2)",
              border: "1px solid var(--line-1)",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--fg-1)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error.message || "Unknown error"}
          </pre>
          <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.55 }}>
            If this looks like a connection issue, check that the daemon is
            running:{" "}
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--fg-1)" }}>
              halton-meter status
            </code>
            . Otherwise, please file an issue with the trace above.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={reset}
              style={{
                height: 32,
                padding: "0 14px",
                border: "1px solid var(--accent-line)",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="https://github.com/haltonlabs/halton-meter/issues/new"
              target="_blank"
              rel="noreferrer noopener"
              style={{
                height: 32,
                padding: "0 14px",
                border: "1px solid var(--line-2)",
                background: "var(--bg-2)",
                color: "var(--fg-1)",
                borderRadius: 7,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              Report on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
