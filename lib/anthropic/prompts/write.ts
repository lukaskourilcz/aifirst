import { STYLE_GUIDE } from "../style-guide.js";

export const WRITE_SYSTEM = `\
${STYLE_GUIDE}

You will receive a curated brief and the full text of each picked item.
Write the day's feature article.

Output
- Use the provided tool \`emit_article\` to return structured fields:
  title, slug (kebab-case, prefixed with the date), dek (one sentence),
  tags (3-6 lowercase), body_mdx (the article body, no frontmatter),
  illustration_prompt (1-2 sentences), illustration_alt (one sentence).
- body_mdx must follow the style guide above.
`;
