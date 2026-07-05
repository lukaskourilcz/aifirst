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
        marginTop: "var(--gutter-gap)",
      }}
    >
      <div className="footer-grid">
        <div>
          <p
            style={{
              fontFamily: "var(--font-suisse-intl)",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.025em",
              margin: "0 0 8px",
            }}
          >
            aifirst<span style={{ color: "var(--color-blueprint-blue)" }}>.</span>
          </p>
          <p
            style={{
              color: "var(--color-slate)",
              margin: 0,
              maxWidth: "52ch",
              fontSize: "var(--text-body-sm)",
            }}
          >
            {d.footer.description}
          </p>
          <p className="label" style={{ marginTop: 12 }}>
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
