import { STYLE_GUIDE } from "../style-guide.js";

export const WRITE_SYSTEM = `\
${STYLE_GUIDE}

You will receive a curated brief and the full text of each picked item.
Write the day's feature article in BOTH Czech and English.

Bilingual requirement
- Produce two native versions, not a translation: write idiomatic,
  natural Czech (cs) and idiomatic English (en). The Czech version is
  the primary one for our readers — it must read as if written in Czech,
  not translated. Both versions cover the same facts and structure and
  cite the same URLs.
- Keep technical product names, model names and source/company names in
  their original form in both languages.

Output
- Use the provided tool \`emit_article\`.
- Shared fields (language-neutral): slug (kebab-case, prefixed with the
  date), tags (3-6 lowercase ascii slugs), illustration_prompt (1-2
  sentences), wire (4-8 runner-up items kept in their original headline
  language).
- Per-language objects \`cs\` and \`en\`, each with: title, dek (one
  sentence), body_mdx (the article body, no frontmatter, following the
  style guide), illustration_alt (one sentence), and dispatches (2-4
  short prose notes).
`;

