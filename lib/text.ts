const WPM = 220;

export function wordCount(text: string): number {
  if (!text) return 0;
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return 0;
  return stripped.split(" ").length;
}

export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / WPM));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Quoted titles are frequently English. Latin letters and no Czech diacritics
 * is enough to mark one `lang="en"`, which is what makes a screen reader
 * switch voice.
 */
export function looksEnglish(text: string): boolean {
  return /[a-z]/i.test(text) && !/[áčďéěíňóřšťúůýž]/i.test(text);
}

const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Feed titles arrive with HTML entities still encoded („Google&#8217;s"). */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) return String.fromCodePoint(parseInt(code.slice(2), 16));
    if (code.startsWith("#")) return String.fromCodePoint(Number(code.slice(1)));
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Czech plural: 1 zdroj, 2–4 zdroje, 0 or 5+ zdrojů. */
export function czechPlural(n: number, one: string, few: string, many: string): string {
  const form = n === 1 ? one : n >= 2 && n <= 4 ? few : many;
  return `${n} ${form}`;
}
