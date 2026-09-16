// /llms.txt: the agent-readable index of the publication.
//
// The llms.txt proposal asks for one Markdown file at the site root: an H1
// with the name, a blockquote summary, then H2 sections of links. It is an
// index, not a copy of the content — the article pages, the print views and
// the JSON endpoints already exist and are what the links point at. Built at
// build time from the committed archive, so it costs nothing at request time
// and says nothing the site does not already publish.
import type { ArticleSummary } from "./content";
import { brand } from "./brand";

/** How many recent editions the index lists before pointing at the archive. */
export const LLMS_RECENT_EDITIONS = 30;

export type LlmsTxtInput = {
  base: string;
  description: string;
  articles: readonly ArticleSummary[];
};

function line(title: string, url: string, note?: string): string {
  return `- [${title}](${url})${note ? `: ${note}` : ""}`;
}

export function llmsTxtDocument(input: LlmsTxtInput): string {
  const { base } = input;
  const recent = input.articles.filter((summary) => !summary.fallback).slice(0, LLMS_RECENT_EDITIONS);
  const editions = recent.map((summary) =>
    line(`${summary.date} · ${summary.title}`, `${base}/articles/${summary.slug}`, summary.dek),
  );
  return [
    `# ${brand.name}`,
    "",
    `> ${input.description}`,
    "",
    `${brand.name} je česká denní zpráva o AI a technologiích. Každé vydání má jeden hlavní příběh, sekce Ve zkratce a Na radaru, seznam zdrojů a veřejné opravy. Vydání jsou psána česky; anglické stránky pod /cs jsou jen kompatibilita.`,
    "",
    "## Aktuální vydání",
    "",
    ...(editions.length > 0 ? editions : ["- Zatím žádné vydání."]),
    "",
    "## Sekce",
    "",
    line("Dnes", `${base}/`, "dnešní vydání"),
    line("Poslední týden", `${base}/tyden`),
    line("O čem se mluví", `${base}/o-cem-se-mluvi`),
    line("AI modely", `${base}/ai-modely`),
    line("Podcasty", `${base}/podcasty`),
    line("Akce", `${base}/akce`),
    line("Radar", `${base}/radar`),
    line("Témata", `${base}/topics`),
    line("Archiv", `${base}/archive`),
    line("Zdroje", `${base}/sources`),
    line("Opravy", `${base}/corrections`),
    line("Slovník", `${base}/glossary`),
    line("O projektu", `${base}/about`),
    "",
    "## Strojově čitelné",
    "",
    line("Dnešní vydání (JSON)", `${base}/api/today.json`),
    line("Týdenní vydání (JSON)", `${base}/api/weekly.json`),
    line("Témata (JSON)", `${base}/api/topics.json`),
    line("Radar (JSON)", `${base}/api/radar.json`),
    line("Zdroje (JSON)", `${base}/api/sources.json`),
    line("Atom feed", `${base}/feed.xml`),
    line("Týdenní Atom feed", `${base}/weekly/feed.xml`),
    line("Sitemap", `${base}/sitemap.xml`),
    line("News sitemap", `${base}/news-sitemap.xml`),
    "",
    "## Optional",
    "",
    line("Tisková verze článku", `${base}/articles/<slug>/print`, "stejný text bez navigace"),
    "",
  ].join("\n");
}
