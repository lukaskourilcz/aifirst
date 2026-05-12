import Link from "next/link";
import { SearchPalette } from "./SearchPalette";
import { ThemeToggle } from "./ThemeToggle";
import { buildSearchIndex } from "@/lib/content";

function today(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function Masthead() {
  const index = await buildSearchIndex();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        background: "rgba(5, 7, 13, 0.72)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          gap: 16,
        }}
      >
        <Link
          href="/"
          aria-label="aifirst home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            borderBottom: "none",
            color: "var(--ink-primary)",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              background: "var(--accent-cyan)",
              boxShadow: "var(--glow-cyan)",
              transform: "rotate(45deg)",
            }}
          />
          aifirst<span style={{ color: "var(--accent-magenta)" }}>.</span>
        </Link>
        <nav
          aria-label="primary"
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span className="label">{today()}</span>
          <Link href="/archive" className="label">archive</Link>
          <Link href="/tags" className="label">tags</Link>
          <Link href="/sources" className="label">sources</Link>
          <Link href="/stats" className="label">stats</Link>
          <Link href="/trends" className="label">trends</Link>
          <Link href="/colophon" className="label">colophon</Link>
          <SearchPalette index={index} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
