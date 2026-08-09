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
// both read it from here. Primary items are the six magazine sections and carry
// an index; secondary items are the rest of the magazine and do not.
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
      { key: "talked", label: r.talked, href: lp("/o-cem-se-mluvi") },
      { key: "models", label: r.models, href: lp("/ai-modely") },
      { key: "podcasts", label: r.podcasts, href: lp("/podcasty") },
      { key: "events", label: r.events, href: lp("/akce") },
    ],
    secondary: [
      { key: "radar", label: r.radar, href: lp("/radar") },
      { key: "topics", label: r.topics, href: lp("/topics") },
      { key: "weeklyDigest", label: r.weeklyDigest, href: lp("/weekly") },
      { key: "archive", label: r.archive, href: lp("/archive") },
      { key: "lessons", label: r.lessons, href: lp("/lekce") },
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
