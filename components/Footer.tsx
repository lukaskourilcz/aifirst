import Link from "next/link";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { brand } from "@/lib/brand";
import { BrandLockup } from "./BrandMark";

/**
 * Two columns that mirror the rail: the magazine's reading sections, then the
 * pages about it, plus the publication's live social profiles. RSS is the one
 * subscription the site offers. The brand column names who answers for the
 * content, as the About page states it, and links to the editorial page.
 */
export function Footer({ locale }: { locale: Locale }) {
  const d = dict(locale);
  const r = d.rail;
  const lp = localePrefixer(locale);
  // A profile that does not exist yet is not linked (lib/brand.ts).
  const social = brand.social.filter((profile) => profile.live);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-brand"><BrandLockup compact /></p>
          <p className="footer-description">{d.footer.description}</p>
          <p className="footer-operator">
            {d.footer.responsible} {brand.responsiblePerson}
            {" · "}
            <Link href={`${lp("/about")}#redakce`}>{d.footer.editorialContact}</Link>
          </p>
        </div>
        <nav aria-label={d.footer.read} className="footer-nav">
          <p className="footer-nav__heading">{d.footer.read}</p>
          <Link href={lp("/")}>{r.today}</Link>
          <Link href={lp("/tyden")}>{r.week}</Link>
          <Link href={lp("/topics")}>{r.topics}</Link>
          <Link href={lp("/archive")}>{r.archive}</Link>
        </nav>
        <nav aria-label={d.footer.trust} className="footer-nav">
          <p className="footer-nav__heading">{d.footer.trust}</p>
          <Link href={lp("/about")}>{r.aboutMagazine}</Link>
          <Link href={lp("/sources")}>{r.sources}</Link>
          <Link href={lp("/corrections")}>{r.corrections}</Link>
          <Link href={lp("/lekce")}>{r.glossary}</Link>
          <a href={lp("/feed.xml")} type="application/atom+xml">{d.common.atomFeed} ↗</a>
          {social.map((profile) => (
            <a key={profile.id} href={profile.url} target="_blank" rel="noopener noreferrer me">
              {profile.label} ↗<span className="sr-only"> {profile.handle}</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
