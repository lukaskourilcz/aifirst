import Link from "next/link";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { brand } from "@/lib/brand";
import { SECTIONS, SECTION_TO_TOPIC, moreNav } from "@/lib/sections";
import { BrandLockup } from "./BrandMark";

/**
 * Four columns under a 2 px ink rule: the brand statement, the sections, the
 * magazine's other pages, and the subscriptions (RSS and live social
 * profiles). The statement says what the publication does and links to the
 * sources; who writes the text is stated on O magazínu (#redakce).
 */
export function Footer({ locale }: { locale: Locale }) {
  const d = dict(locale);
  const lp = localePrefixer(locale);
  // A profile that does not exist yet is not linked (lib/brand.ts).
  const social = brand.social.filter((profile) => profile.live);

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <p className="footer-brand"><BrandLockup size="footer" /></p>
          <p className="footer-description">
            {d.footer.description}{" "}
            <Link href={lp("/sources")}>{d.footer.sourcesLink}&nbsp;→</Link>
          </p>
        </div>
        <nav aria-label={d.footer.sections} className="footer-nav">
          <p className="label footer-nav__heading">{d.footer.sections}</p>
          {SECTIONS.map((section) => (
            <Link key={section.key} href={lp(`/topics/${SECTION_TO_TOPIC[section.key]}`)}>{section.label}</Link>
          ))}
        </nav>
        <nav aria-label={d.footer.read} className="footer-nav">
          <p className="label footer-nav__heading">{d.footer.read}</p>
          {moreNav(locale).map((item) => (
            <Link key={item.key} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <nav aria-label={d.footer.subscribe} className="footer-nav">
          <p className="label footer-nav__heading">{d.footer.subscribe}</p>
          <a href={lp("/feed.xml")} type="application/atom+xml">{d.common.atomFeed}&nbsp;↗</a>
          {social.map((profile) => (
            <a key={profile.id} href={profile.url} target="_blank" rel="noopener noreferrer me">
              {profile.label}&nbsp;↗<span className="sr-only"> {profile.handle}</span>
            </a>
          ))}
        </nav>
      </div>
      <p className="meta site-footer__line">{brand.name} · {d.meta.tagline}</p>
    </footer>
  );
}
