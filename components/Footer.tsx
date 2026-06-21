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
        marginTop: 96,
        padding: "48px 0 64px",
        background: "var(--color-newsprint-cream)",
        borderTop: "1px solid var(--color-folio-black)",
      }}
    >
      <div className="container footer-grid">
        <div>
          <p
            style={{
              fontFamily: "var(--font-plantin)",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            AIFIRST<span style={{ color: "var(--color-signal-yellow)" }}>.</span>
          </p>
          <p style={{ color: "var(--color-caption-gray)", margin: 0, maxWidth: "52ch" }}>
            {d.footer.description}
          </p>
          <p className="label label--muted" style={{ marginTop: 16 }}>
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
