import Link from "next/link";
import { SearchPalette } from "./SearchPalette";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buildSearchIndex } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

function today(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function Masthead({ locale }: { locale: Locale }) {
  const index = await buildSearchIndex(locale);
  const t = dict(locale).nav;
  const lp = localePrefixer(locale);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        background: "var(--surface-elev)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px clamp(16px, 4vw, 24px)",
          gap: 16,
        }}
      >
        <Link
          href={lp("/")}
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
            flexShrink: 0,
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
        <nav aria-label="primary" className="masthead-nav">
          <span className="label masthead-date">{today()}</span>
          <Link href={lp("/archive")} className="label">{t.archive}</Link>
          <Link href={lp("/tags")} className="label">{t.tags}</Link>
          <Link href={lp("/sources")} className="label">{t.sources}</Link>
          <Link href={lp("/glossary")} className="label">{t.glossary}</Link>
          <Link href={lp("/colophon")} className="label">{t.colophon}</Link>
          <Link href={lp("/health")} className="label">{t.health}</Link>
          <SearchPalette index={index} locale={locale} />
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
