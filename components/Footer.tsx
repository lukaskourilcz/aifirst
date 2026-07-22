import Link from "next/link";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { BrandLockup } from "./BrandMark";

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
          <p className="footer-brand"><BrandLockup compact /></p>
          <p className="footer-description">
            {d.footer.description}
          </p>
          <p className="label footer-cadence">
            {d.common.transmissionOngoing}
          </p>
        </div>
        <nav aria-label="footer" className="footer-nav">
          <Link href={lp("/radar")} className="label">{t.radar}</Link>
          <Link href={lp("/topics")} className="label">{t.topics}</Link>
          <Link href={lp("/weekly")} className="label">{t.weekly}</Link>
          <Link href={lp("/archive")} className="label">{t.archive}</Link>
          <Link href={lp("/about")} className="label">{t.about}</Link>
          <Link href={lp("/corrections")} className="label">{t.corrections}</Link>
          <Link href={lp("/glossary")} className="label">{t.glossary}</Link>
          <Link href={lp("/sources")} className="label">{t.sources}</Link>
          <a href={lp("/feed.xml")} className="label">{d.common.atomFeed}</a>
        </nav>
      </div>
    </footer>
  );
}
