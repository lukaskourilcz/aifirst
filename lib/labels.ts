// Machine ids → Czech display labels.
//
// Tag slugs, dispatch topics and source ids are stable storage keys written
// upstream. None of them is copy, so none of them reaches a reader raw: every
// display site goes through this module, and an id it does not know renders as
// nothing rather than as the slug.

import type { Source } from "./sources";

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
