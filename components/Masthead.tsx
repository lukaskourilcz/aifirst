import Link from "next/link";
import { buildSearchIndex, listArticles } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { SECTIONS, SECTION_TO_TOPIC, moreNav, sectionNav } from "@/lib/sections";
import { czechNumericDate, czechWeekdayDate } from "@/lib/weeks";
import { BrandLockup } from "./BrandMark";
import { MastheadMenu } from "./MastheadMenu";
import { SearchPalette } from "./SearchPalette";
import { StickyHeader } from "./StickyHeader";

/**
 * Row 1: the date on the left, the logotype centred, search on the right,
 * over a 2 px ink rule. Row 2: the section bar (Dnes and five sections, then
 * „Více"). Below 960 px row 1 is a 56 px bar (menu · logotype · search) and
 * row 2 a horizontally scrolling strip.
 *
 * The date is the newest edition's publishing day, never a clock, so the same
 * content always builds the same page.
 */
export async function Masthead({ locale }: { locale: Locale }) {
  const d = dict(locale);
  const lp = localePrefixer(locale);
  const [index, articles] = await Promise.all([buildSearchIndex(locale), listArticles(locale)]);
  const newest = articles.find((article) => (article.type ?? "daily") === "daily") ?? articles[0];
  const anchor = newest?.date;
  const sections = sectionNav(locale);
  const more = moreNav(locale);
  // An empty search suggests the sections, never raw tags.
  const suggestions = SECTIONS.map((section) => ({
    href: lp(`/topics/${SECTION_TO_TOPIC[section.key]}`),
    title: section.label,
  }));
  const labels = {
    sections: d.nav.sectionsLabel,
    more: d.nav.more,
    search: d.nav.search,
    home: d.nav.home,
    menu: d.nav.menu,
    close: d.nav.close,
  };
  const date = anchor ? czechWeekdayDate(anchor) : "";

  const top = (
    <div className="masthead__top">
      <MastheadMenu sections={sections} more={more} date={date} labels={labels} />
      <p className="meta masthead__date">
        {anchor ? <time dateTime={anchor}>{date}</time> : null}
      </p>
      <Link href={lp("/")} className="masthead__brand" aria-label={labels.home}>
        <BrandLockup size="masthead" />
      </Link>
      <div className="masthead__search">
        <SearchPalette index={index} topics={suggestions} locale={locale} />
      </div>
    </div>
  );

  return (
    <StickyHeader
      top={top}
      miniBrand={<BrandLockup />}
      homeHref={lp("/")}
      sections={sections}
      more={more}
      shortDate={anchor ? czechNumericDate(anchor) : ""}
      labels={labels}
    />
  );
}
