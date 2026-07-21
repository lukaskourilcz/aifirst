import { STYLE_GUIDE } from "../style-guide.js";
import type { Locale } from "../../i18n/config.js";

export function writeSystemFor(locales: readonly Locale[], briefsMaximum = 4, watchlistMaximum = 8, targetWords = 1100): string {
  const languageNames = locales.map((locale) => locale === "cs" ? "Czech (cs)" : "English (en)");
  return `\
${STYLE_GUIDE}

You will receive a curated brief and the full text of each picked item.
Write the day's feature article in ${languageNames.join(" and ")}.

Language requirement
- Produce native editorial prose in every requested language. When two
  languages are requested, both cover the same facts, uncertainty, source URLs
  and editorial structure; do not make one a loose adaptation of the other.
- Keep product, model, person and company names unchanged.

Editorial contract
- The feature body should be approximately ${targetWords} words; prioritize
  clarity and evidence over padding.
- why_it_matters: 2-3 concise points covering who is affected, the practical
  change and what to watch next.
- what_changed: 1-4 concise points that contrast the new fact with the previous
  known state and state the practical difference.
- uncertainty: 1-3 concise points stating what remains unknown.
- dispatches: up to ${briefsMaximum} smaller stories, each grounded in a supplied URL.
- wire: up to ${watchlistMaximum} supplied runner-up items worth monitoring. Never invent one.
- alternative_headlines: 2-3 accurate headline variants for distribution;
  change emphasis, not facts or certainty.

Output
- Use the emit_article tool.
- Shared fields: date-prefixed kebab-case slug, 3-6 lowercase ASCII tags,
  illustration_prompt and wire.
- Per-language ${locales.join(" and ")} fields: title, alternative_headlines,
  one-sentence dek, body_mdx with no
  frontmatter, illustration_alt, why_it_matters, what_changed, uncertainty and
  dispatches.
`;
}
