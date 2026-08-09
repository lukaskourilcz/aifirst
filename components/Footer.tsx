import Link from "next/link";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { BrandLockup } from "./BrandMark";
import { SocialRow } from "./SocialRow";

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
        </div>
        <nav aria-label={d.footer.read} className="footer-nav">
          <p className="footer-nav__heading">{d.footer.read}</p>
          <Link href={lp("/radar")}>{t.radar}</Link>
          <Link href={lp("/topics")}>{t.topics}</Link>
          <Link href={lp("/weekly")}>{t.weekly}</Link>
          <Link href={lp("/archive")}>{t.archive}</Link>
        </nav>
        <nav aria-label={d.footer.trust} className="footer-nav">
          <p className="footer-nav__heading">{d.footer.trust}</p>
          <Link href={lp("/about")}>{t.about}</Link>
          <Link href={lp("/corrections")}>{t.corrections}</Link>
          <Link href={lp("/glossary")}>{t.glossary}</Link>
          <Link href={lp("/sources")}>{t.sources}</Link>
          <a href={lp("/feed.xml")}>{d.common.atomFeed} ↗</a>
        </nav>
        <SocialRow heading={d.footer.follow} />
      </div>
    </footer>
  );
}
