import Link from "next/link";

/**
 * 404 page. Uses CSS tokens so it themes correctly in dark and light mode.
 */
export default function NotFound() {
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
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: "var(--fg-0)",
            letterSpacing: -0.2,
          }}
        >
          Not found
        </h2>
        <p
          style={{
            margin: "8px 0 16px",
            fontSize: 13,
            color: "var(--fg-2)",
            maxWidth: 360,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist on this dashboard.
        </p>
        <Link
          href="/overview"
          style={{
            display: "inline-block",
            padding: "8px 14px",
            border: "1px solid var(--line-2)",
            background: "var(--bg-2)",
            color: "var(--fg-1)",
            borderRadius: 7,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
