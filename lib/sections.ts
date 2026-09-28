// The five reader sections (round 2, DECISIONS.md Q6) and the „Více" list.
//
// Until the edition-package/2 contract delivers `section` per article, the
// section is derived from the article's tags. An edition covers several
// stories and its tags list the lead story first, so the first tag that maps
// to a section decides; only a single tag mapping to two sections would fall
// back to the DECISIONS.md precedence (Regulace → Bezpečnost → Modely → Vývoj
// → Firmy a trh). Generic tags (umělá inteligence, bare company names) map to
// nothing, and an article with only those falls to Modely. Applying the
// precedence across all tags instead put half of August–September under
// Regulace, because any passing mention of a law won. Section pages are served
// by the existing /topics/<slug> routes (SECTION_TO_TOPIC) until Part B moves
// them to /<section>.

import { type Locale, localePrefixer } from "./i18n/config";

export type SectionKey = "modely" | "firmy-a-trh" | "bezpecnost" | "regulace" | "vyvoj";

export type Section = {
  key: SectionKey;
  label: string;
  /** One-line scope, shown under the section title. */
  scope: string;
};

export const SECTIONS: readonly Section[] = [
  { key: "modely", label: "Modely", scope: "Nové modely, jejich schopnosti, testy a otevřené váhy: co se změnilo a co to znamená v praxi." },
  { key: "firmy-a-trh", label: "Firmy a trh", scope: "Laboratoře, financování, čipy, datová centra, platformy a obchody, které formují trh s AI." },
  { key: "bezpecnost", label: "Bezpečnost", scope: "Útoky, zneužití, incidenty a bezpečnost samotných AI systémů." },
  { key: "regulace", label: "Regulace", scope: "Zákony, soudy, politika, autorská práva a exportní kontroly." },
  { key: "vyvoj", label: "Vývoj", scope: "Programovací agenti, nástroje pro vývojáře, API a infrastruktura pro stavbu s AI." },
];

/** Section → the topic route that serves it until Part B. */
export const SECTION_TO_TOPIC: Record<SectionKey, string> = {
  modely: "ai-models",
  "firmy-a-trh": "ai-companies",
  bezpecnost: "research",
  regulace: "ai-regulation",
  vyvoj: "developer-tools",
};

export function topicToSection(topicSlug: string): SectionKey | null {
  const entry = Object.entries(SECTION_TO_TOPIC).find(([, slug]) => slug === topicSlug);
  return entry ? (entry[0] as SectionKey) : null;
}

// Tag → section, from the mapping table in DECISIONS.md Q6.
const SECTION_TAGS: Record<SectionKey, readonly string[]> = {
  regulace: [
    "regulace", "regulace-ai", "regulation", "policy", "ai-policy", "evropska-ai-politika",
    "exportni-kontrola", "exportni-kontroly", "export-kontrol", "autorska-prava", "pravo-a-regulace",
    "content-moderation", "antitrustove-pravo", "pravo", "trestni-pravo",
  ],
  bezpecnost: [
    "kyberneticka-bezpecnost", "kybernetska-bezpecnost", "bezpecnost", "bezpecnost-ai", "ai-bezpecnost",
    "bezpecnost-softwaru", "ai-safety", "safety", "ai-etika", "vojenstvi", "cybersecurity", "autonomni-zbrane",
  ],
  modely: [
    "ai-models", "models", "llm", "gemini", "google-gemini", "mistral", "mistral-ai", "open-source",
    "oss", "open-source-ai", "otevrene-modely", "ml", "research", "agi", "deepseek", "hlasove-modely",
  ],
  vyvoj: [
    "developer-tools", "dev-tools", "coding", "agents", "ai-agenti", "autonomni-agenti", "releases",
    "robotika", "nastroje-pro-vyvojare", "programovaci-jazyky", "ladeni-kodu", "linux",
  ],
  "firmy-a-trh": [
    "ai-companies", "companies", "startups", "datova-centra", "amd-nvidia", "amd", "nvidia", "burza",
    "meta", "microsoft", "google-deepmind", "platforms", "youtube", "creator-economy", "monetization",
    "social-media", "advertising", "streaming", "socialni-site", "akvizice", "financovani", "byznys",
    "rizikovy-kapital", "polovodice", "procesory", "supermicro", "stripe", "fintech",
  ],
};

const PRECEDENCE: readonly SectionKey[] = ["regulace", "bezpecnost", "modely", "vyvoj", "firmy-a-trh"];

/** The section one tag maps to, or null for a generic tag. */
export function sectionOfTag(tag: string): SectionKey | null {
  const value = tag.toLowerCase();
  return PRECEDENCE.find((key) => SECTION_TAGS[key].includes(value)) ?? null;
}

/**
 * The one section an article belongs to: its first tag that maps to a
 * section, else Modely. Returns null only for an article without tags.
 */
export function sectionOf(tags: readonly string[] | undefined): SectionKey | null {
  if (!tags?.length) return null;
  for (const tag of tags) {
    const key = sectionOfTag(tag);
    if (key) return key;
  }
  return "modely";
}

export function sectionLabel(key: SectionKey | null): string | null {
  return key ? SECTIONS.find((section) => section.key === key)?.label ?? null : null;
}

export type NavItem = { key: string; label: string; href: string };

/** The section bar: Dnes, then the five sections. */
export function sectionNav(locale: Locale): NavItem[] {
  const lp = localePrefixer(locale);
  return [
    { key: "today", label: "Dnes", href: lp("/") },
    ...SECTIONS.map((section) => ({
      key: section.key,
      label: section.label,
      href: lp(`/topics/${SECTION_TO_TOPIC[section.key]}`),
    })),
  ];
}

/** „Více": everything that is not a section. Archiv lives here (owner decision). */
export function moreNav(locale: Locale): NavItem[] {
  const lp = localePrefixer(locale);
  return [
    { key: "week", label: "Poslední týden", href: lp("/tyden") },
    { key: "archive", label: "Archiv", href: lp("/archive") },
    { key: "glossary", label: "Slovník", href: lp("/lekce") },
    { key: "sources", label: "Zdroje", href: lp("/sources") },
    { key: "corrections", label: "Opravy", href: lp("/corrections") },
    { key: "about", label: "O magazínu", href: lp("/about") },
  ];
}
