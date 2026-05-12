import Link from "next/link";

function today(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function Masthead() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
        background: "rgba(5, 7, 13, 0.7)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.125rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            borderBottom: "none",
          }}
        >
          aifirst<span style={{ color: "var(--accent-magenta)" }}>.</span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <span className="label">{today()}</span>
          <Link href="/archive" className="label">
            Archive
          </Link>
        </div>
      </div>
    </header>
  );
}
