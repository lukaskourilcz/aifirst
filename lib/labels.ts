// Machine ids → Czech display labels.
//
// Tag slugs, dispatch topics and source ids are stable storage keys written
// upstream. None of them is copy, so none of them reaches a reader raw: every
// display site goes through this module, and an id it does not know renders as
// nothing rather than as the slug.

import type { Source } from "./sources";
import { sectionLabel, sectionOfTag } from "./sections";
import { slugify } from "./text";

// Every tag present in content/articles at the time of the 2026-09 audit, plus
// the legacy English tags of the May and June issues. Slugs lose their
// diacritics, which is why the label cannot be derived from the slug.
const TOPIC_LABELS: Record<string, string> = {
  // Czech slugs
  "umela-inteligence": "Umělá inteligence",
  "kyberneticka-bezpecnost": "Kybernetická bezpečnost",
  "kybernetska-bezpecnost": "Kybernetická bezpečnost",
  "google-gemini": "Google Gemini",
  "ai-agenti": "AI agenti",
  "datova-centra": "Datová centra",
  regulace: "Regulace",
  "regulace-ai": "Regulace",
  "pravo-a-regulace": "Regulace",
  openai: "OpenAI",
  anthropic: "Anthropic",
  microsoft: "Microsoft",
  meta: "Meta",
  "open-source-ai": "Open source",
  "evropska-ai-politika": "Evropská politika",
  "globalni-ai-politika": "Globální politika",
  "ai-modely": "AI modely",
  "amd-nvidia": "AMD a Nvidia",
  amd: "AMD",
  nvidia: "Nvidia",
  "autonomni-agenti": "Autonomní agenti",
  "socialni-site": "Sociální sítě",
  "ai-etika": "Etika AI",
  "autorska-prava": "Autorská práva",
  bezpecnost: "Bezpečnost",
  "bezpecnost-softwaru": "Bezpečnost softwaru",
  "bezpecnost-ai": "Bezpečnost AI",
  "ai-bezpecnost": "Bezpečnost AI",
  burza: "Burza",
  "exportni-kontrola": "Exportní kontroly",
  "exportni-kontroly": "Exportní kontroly",
  "export-kontrol": "Exportní kontroly",
  australie: "Austrálie",
  agi: "AGI",
  akvizice: "Akvizice",
  alibaba: "Alibaba",
  "antitrustove-pravo": "Antimonopolní právo",
  "autonomni-zbrane": "Autonomní zbraně",
  "black-hat": "Black Hat",
  byznys: "Byznys",
  "chatgpt-vyhledavani": "Vyhledávání v ChatGPT",
  cina: "Čína",
  "data-soukromi": "Ochrana soukromí",
  "ochrana-soukromi": "Ochrana soukromí",
  soukromi: "Ochrana soukromí",
  "soukromi-ai": "Ochrana soukromí",
  deepmind: "Google DeepMind",
  deepseek: "DeepSeek",
  disney: "Disney",
  email: "E-mail",
  financovani: "Financování",
  fintech: "Fintech",
  gemini: "Google Gemini",
  hardware: "Hardware",
  "hlasove-modely": "Hlasové modely",
  hollywood: "Hollywood",
  "hudebni-prumysl": "Hudební průmysl",
  klima: "Klima",
  "kosmicky-teleskop": "Kosmický teleskop",
  kosmonautika: "Kosmonautika",
  vesmir: "Vesmír",
  "ladeni-kodu": "Ladění kódu",
  linux: "Linux",
  mainframe: "Mainframe",
  marvel: "Marvel",
  matematika: "Matematika",
  "openai-matematika": "Matematika",
  "medialni-prumysl": "Mediální průmysl",
  "mistral-ai": "Mistral AI",
  mistral: "Mistral AI",
  "moderovani-obsahu": "Moderování obsahu",
  "nastroje-pro-vyvojare": "Nástroje pro vývojáře",
  vyvojar: "Nástroje pro vývojáře",
  "otevrena-veda": "Otevřená věda",
  "otevrene-modely": "Otevřené modely",
  "platebni-systemy": "Platební systémy",
  polovodice: "Polovodiče",
  procesory: "Procesory",
  pravo: "Právo",
  "trestni-pravo": "Trestní právo",
  "programovaci-jazyky": "Programovací jazyky",
  reklama: "Reklama",
  "rizikovy-kapital": "Rizikový kapitál",
  robotika: "Robotika",
  smartphony: "Chytré telefony",
  spacex: "SpaceX",
  spam: "Spam",
  "spotrebitelska-elektronika": "Spotřební elektronika",
  stripe: "Stripe",
  supermicro: "Supermicro",
  "technologicke-firmy": "Technologické firmy",
  tencent: "Tencent",
  "trh-prace": "Trh práce",
  "verejne-mineni": "Veřejné mínění",
  virtualizace: "Virtualizace",
  vodoznak: "Vodoznaky",
  vojenstvi: "Vojenství",
  wechat: "WeChat",
  wordpress: "WordPress",
  xbox: "Xbox",
  "ai-infrastruktura": "AI infrastruktura",
  infrastruktura: "Infrastruktura",
  "ai-a-kreativita": "AI a kreativita",
  "ai-spolecnost": "AI a společnost",
  digitalizace: "Digitalizace",
  film: "Film",
  historie: "Historie",
  investice: "Investice",
  "lokalni-modely": "Lokální modely",
  "media-pravo": "Média a právo",
  produktivita: "Produktivita",
  produkty: "Produkty",
  videohry: "Videohry",
  zdravi: "Zdraví",
  "vzdelavani": "Vzdělávání",
  // Legacy English tags of the May and June issues
  ai: "Umělá inteligence",
  models: "AI modely",
  "ai-models": "AI modely",
  llm: "AI modely",
  policy: "Regulace",
  "ai-policy": "Regulace",
  regulation: "Regulace",
  "dev-tools": "Nástroje pro vývojáře",
  "developer-tools": "Nástroje pro vývojáře",
  coding: "Nástroje pro vývojáře",
  agents: "AI agenti",
  "open-source": "Open source",
  oss: "Open source",
  research: "Výzkum",
  ml: "Výzkum",
  "ai-safety": "Bezpečnost AI",
  safety: "Bezpečnost AI",
  cybersecurity: "Kybernetická bezpečnost",
  startups: "Start-upy",
  "google-deepmind": "Google DeepMind",
  platforms: "Platformy",
  "social-media": "Sociální sítě",
  space: "Vesmír",
  "supply-chain": "Dodavatelský řetězec",
  telecoms: "Telekomunikace",
  infrastructure: "Infrastruktura",
  ecosystem: "Ekosystém",
  society: "Společnost",
};

const SLUG = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/;

/**
 * The Czech label for a tag slug or a dispatch topic, or null when there is
 * none. Callers render nothing for null — never the raw slug.
 *
 * Dispatch topics are free text as often as they are slugs. Free text that is
 * already a reader label ("Kybernetická bezpečnost", "open-source AI") passes
 * through with its first letter raised; an English label with a known Czech
 * form ("Cybersecurity") is translated; a bare slug must be in the map.
 */
export function topicLabel(slug: string): string | null {
  const value = slug.trim();
  if (!value) return null;
  const known = TOPIC_LABELS[value.toLowerCase()];
  if (known) return known;
  if (SLUG.test(value)) return null;
  return value.charAt(0).toLocaleUpperCase("cs") + value.slice(1);
}

/** Czech labels for a tag list: unknown slugs dropped, duplicates merged. */
export function topicLabels(tags: readonly string[] | undefined): string[] {
  const labels = (tags ?? []).map(topicLabel).filter((label): label is string => label !== null);
  return [...new Set(labels)];
}

// Wire items name their feed by the collector's id. These three are feeds, not
// publications, so the reader sees the service's own name.
const FEED_NAMES: Record<string, string> = {
  tensorfeed: "TensorFeed",
  "hn-frontpage": "Hacker News",
  "github-ai-releases": "GitHub",
};

/** `https://www.theverge.com/x` → `theverge.com`; anything unparseable → "". */
export function hostOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * The reader-facing name of a source: the feed map first, then the registry
 * entry in sources.yml, then — for free-text names that are already a
 * publication name — the value itself, and finally the URL's host.
 */
export function sourceName(id: string, registry: Source[], url?: string): string {
  const value = id.trim();
  const feed = FEED_NAMES[value];
  if (feed) return feed;
  const registered = registry.find((source) => source.id === value);
  if (registered) return registered.name;
  if (value && !SLUG.test(value)) return value;
  return hostOf(url);
}

/** Evidence class → Czech. Anything upstream has not classified is „neurčeno". */
export function classificationLabel(value: string | undefined): string {
  if (value === "primary") return "primární";
  if (value === "secondary") return "sekundární";
  return "neurčeno";
}

// Licence names as the reader sees them: the host, not the licence's title.
const LICENCE_HOSTS: Record<string, string> = {
  "pexels license": "Pexels",
  "unsplash license": "Unsplash",
  "pixabay license": "Pixabay",
};

/**
 * „Foto: Mikhail Nilov / Pexels". Upstream's `attribution.text` is English
 * („Photo by … on Pexels") and never reaches the page; the credit is rebuilt
 * from the structured fields.
 */
export function photoCreditParts(attribution: { author: string; license: string }): {
  prefix: string;
  author: string;
  host: string;
} {
  const licence = attribution.license.trim();
  const host = LICENCE_HOSTS[licence.toLowerCase()] ?? licence.replace(/\s+licen[cs]e$/i, "");
  return { prefix: "Foto:", author: attribution.author.trim(), host };
}

/**
 * The one-sentence provenance line under an edition's meta row. Null for a
 * legacy edition that carries no generation record: the page then says
 * nothing rather than guessing.
 */
export function provenanceSentence(
  article: { human_reviewed: boolean } | undefined,
  sourceCount: number,
  t: {
    provenanceUnreviewed: string;
    provenanceReviewed: string;
    provenanceSourcesOne: string;
    provenanceSourcesMany: string;
  },
): string | null {
  if (!article) return null;
  if (article.human_reviewed) return t.provenanceReviewed;
  const sources = sourceCount === 1
    ? t.provenanceSourcesOne
    : t.provenanceSourcesMany.replace("{n}", String(sourceCount));
  return t.provenanceUnreviewed.replace("{sources}", sources);
}

export type SourceClass = "primary" | "reporting" | "community";

/** Which of the three groups on /sources a registered source belongs to. */
export function sourceClass(tags: readonly string[] | undefined): SourceClass {
  const set = new Set(tags ?? []);
  if (set.has("primary-source")) return "primary";
  if (["aggregator", "community", "social", "general"].some((tag) => set.has(tag))) return "community";
  return "reporting";
}

/** Two initials from the letters of a name: „Import AI (Jack Clark)" → „IA". */
export function monogram(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  const letters = words.length > 1
    ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`
    : (words[0] ?? "").slice(0, 2);
  return letters.toLocaleUpperCase("cs");
}

/**
 * The article's „Ověření" line (round 2). It claims a review only when the
 * generation record says a person reviewed the text; otherwise it states what
 * the text was assembled from. Null for a legacy edition without a record.
 */
export function verificationSentence(
  generation: { human_reviewed: boolean } | undefined,
  sourceCount: number,
  t: {
    verificationReviewed: string;
    verificationUnreviewed: string;
    provenanceSourcesOne: string;
    provenanceSourcesMany: string;
  },
): string | null {
  if (!generation) return null;
  const sources = sourceCount === 1
    ? t.provenanceSourcesOne
    : t.provenanceSourcesMany.replace("{n}", String(sourceCount));
  return (generation.human_reviewed ? t.verificationReviewed : t.verificationUnreviewed).replace("{sources}", sources);
}

/**
 * The section a Brief belongs to, from its free-text or slug `topic`
 * (round 2, A-11): the topic is slugified and mapped with the same tag table
 * as articles. A topic that maps to no section gets no label, never the raw
 * text. Part B replaces this with a delivered `dispatches[].section`.
 */
export function briefSectionLabel(topic: string | undefined): string | null {
  if (!topic) return null;
  const slug = slugify(topic);
  return sectionLabel(sectionOfTag(slug) ?? (slug.startsWith("ai-") ? sectionOfTag(slug.slice(3)) : null));
}
