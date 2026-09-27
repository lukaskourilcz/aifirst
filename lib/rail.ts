import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export type RailItem = { key: string; label: string; href: string };

export type Rail = {
  primary: RailItem[];
  secondary: RailItem[];
  labels: {
    primary: string;
    secondary: string;
    menu: string;
    close: string;
    home: string;
  };
};

// The rail is the same on the desktop sidebar and inside the mobile drawer, so
// both read it from here. Primary items are the four reading sections and carry
// an index; secondary items are the reference and trust pages and do not.
//
// /o-cem-se-mluvi, /ai-modely, /podcasty, /akce, /radar, /weekly and /lekce's
// old „Lekce" entry left the rail before launch. Their routes still build and
// resolve; nothing links to the empty or dormant ones.
//
// Secondary hrefs stay on their shipped English paths. The labels are Czech,
// the routes are a compatibility contract, and nothing in this redesign creates
// Czech aliases for them.
export function buildRail(locale: Locale): Rail {
  const r = dict(locale).rail;
  const lp = localePrefixer(locale);

  return {
    primary: [
      { key: "today", label: r.today, href: lp("/") },
      { key: "week", label: r.week, href: lp("/tyden") },
      { key: "topics", label: r.topics, href: lp("/topics") },
      { key: "archive", label: r.archive, href: lp("/archive") },
    ],
    secondary: [
      { key: "glossary", label: r.glossary, href: lp("/lekce") },
      { key: "sources", label: r.sources, href: lp("/sources") },
      { key: "corrections", label: r.corrections, href: lp("/corrections") },
      { key: "aboutMagazine", label: r.aboutMagazine, href: lp("/about") },
    ],
    labels: {
      primary: r.primary,
      secondary: r.secondary,
      menu: r.menu,
      close: r.close,
      home: locale === "cs" ? "DNESKAi – domů" : "DNESKAi home",
    },
  };
}
