// Czech typography for delivered text, applied at render time.
//
// Upstream writes the prose and this repository never edits it, so the fixes
// happen on the way to the page: typographic quotes, non-breaking spaces after
// one-letter words and before units, en dashes. The committed MDX stays
// byte-identical, which keeps delivery hashes valid.

const NBSP = " ";

// A space before any of these, after a number, becomes a non-breaking space.
// One-letter units that double as Czech words (s, m, t, g, h) are left out on
// purpose: „5 s kolegy" must not glue.
const UNITS = [
  "%", "‰", "°C", "Kč", "USD", "EUR", "\\$", "€",
  "GB", "MB", "TB", "PB", "kB", "KB", "Gb", "Mb",
  "GW", "MW", "kW", "W", "GWh", "MWh", "kWh",
  "GHz", "MHz", "Hz", "km", "cm", "mm", "kg", "ms", "min", "px",
  "mil\\.", "mld\\.", "tis\\.",
];
const UNIT_RE = new RegExp(`(\\d) (${UNITS.join("|")})(?![\\p{L}\\d])`, "gu");

// Standalone one-letter prepositions and conjunctions, glued to the next word.
// The lookbehind accepts a non-breaking space so runs like „a v Praze" glue
// all the way through.
const ONE_LETTER_RE = /(?<=^|[\s („‚[])([ksvzouaiKSVZOUAI]) (?=\S)/gu;

// Words upstream has delivered glued together. Exact matches only: a general
// split rule would break real words. Extend as new cases turn up, and report
// them upstream in docs/EDITORIAL_RULES_2026-09.md.
const GLUED: Record<string, string> = {
  agentnísoustavy: "agentní soustavy",
  agentnísystémy: "agentní systémy",
};
const GLUED_RE = new RegExp(`(?<![\\p{L}])(${Object.keys(GLUED).join("|")})(?![\\p{L}])`, "gu");

function pairDoubleQuotes(text: string): string {
  let open = false;
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i] as string;
    if (char === "„") {
      open = true;
      out += char;
    } else if (char === "“" && open) {
      open = false;
      out += char;
    } else if (char === '"') {
      // Inside an open pair the next straight quote closes it. Outside one, a
      // quote at a word start opens and anything else closes: a pair split
      // across two MDX text nodes still comes out right.
      const previous = i === 0 ? "" : (text[i - 1] as string);
      const opens: boolean = !open && (previous === "" || /[\s ([{–—-]/u.test(previous));
      out += opens ? "„" : "“";
      open = opens;
    } else {
      out += char;
    }
  }
  return out;
}

export function czechTypography(text: string): string {
  if (!text) return text;
  let out = text;

  out = out.replace(GLUED_RE, (word) => GLUED[word] ?? word);

  out = pairDoubleQuotes(out);
  // 'single' quotes around a word or phrase → ‚…‘. An apostrophe inside a
  // word (OpenAI's) is left alone.
  out = out.replace(/(^|[\s (])'([^'\n]+?)'(?=[\s .,;:!?)]|$)/gu, "$1‚$2‘");

  // Dashes: the sentence dash is a spaced en dash, never an em dash.
  out = out.replace(/\s*—\s*/gu, " – ");
  out = out.replace(/ -- /g, " – ").replace(/--/g, "–");
  out = out.replace(/ - /g, " – ");
  // A hyphen between two standalone numbers is a range. Model names such as
  // Qwen3-235B and ISO dates are not touched.
  out = out.replace(/(?<![\p{L}\d.,-])(\d+(?:[.,]\d+)?)-(\d+(?:[.,]\d+)?)(?![\p{L}\d.-])/gu, "$1–$2");

  out = out.replace(/ {2,}/g, " ");
  out = out.replace(UNIT_RE, `$1${NBSP}$2`);
  out = out.replace(ONE_LETTER_RE, `$1${NBSP}`);
  return out;
}

/**
 * Lowercase directly followed by uppercase inside a word („agentníSoustavy").
 * Reported, never rewritten: brand names (OpenAI, DeepSeek, iPhone) share the
 * shape, so the fix belongs upstream.
 */
export function typographyCandidates(text: string): string[] {
  const allowed = /^(?:[A-Z][a-z]+)+$|^i[A-Z]|^e[A-Z]|^Open[A-Z]|^Deep[A-Z]|^You[A-Z]/u;
  const words = text.match(/[\p{L}]*\p{Ll}\p{Lu}[\p{L}]*/gu) ?? [];
  return words.filter((word) => !allowed.test(word));
}

/** Map a list of delivered strings, skipping absent ones. */
export function czechTypographyAll(values: string[] | undefined): string[] | undefined {
  return values?.map(czechTypography);
}
