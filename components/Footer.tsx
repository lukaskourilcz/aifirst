import Link from "next/link";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function Footer({ locale }: { locale: Locale }) {
  const d = dict(locale);
  const t = d.nav;
  const lp = localePrefixer(locale);

  return (
    <footer
      style={{
        borderTop: "1px solid var(--hairline)",
        marginTop: 96,
        padding: "48px 0 64px",
        background: "var(--surface-soft)",
      }}
    >
      <div className="container footer-grid">
        <div>
          <p
            className="label"
            style={{ color: "var(--accent-cyan)", marginBottom: 8 }}
          >
            aifirst<span style={{ color: "var(--accent-magenta)" }}>.</span>
          </p>
          <p style={{ color: "var(--ink-muted)", margin: 0, maxWidth: "52ch" }}>
            {d.footer.description}
          </p>
          <p className="label" style={{ marginTop: 16 }}>
            {d.common.transmissionOngoing}
          </p>
        </div>
        <nav aria-label="footer" className="footer-nav">
          <Link href={lp("/archive")} className="label">{t.archive}</Link>
          <Link href={lp("/glossary")} className="label">{t.glossary}</Link>
          <Link href={lp("/stats")} className="label">{t.stats}</Link>
          <Link href={lp("/trends")} className="label">{t.trends}</Link>
          <Link href={lp("/health")} className="label">{t.health}</Link>
        </nav>
      </div>
    </footer>
  );
}
