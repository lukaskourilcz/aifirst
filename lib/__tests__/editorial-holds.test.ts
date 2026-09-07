import { expect, it } from "vitest";
import { getArticle, listArticles } from "../content";
import { editorialHold, heldArticleSlugs } from "../editorial-holds";

it("retains the source article but removes disputed editions from reader listings", async () => {
  const slug = heldArticleSlugs()[0]!;
  expect(editorialHold(slug)?.reason).toContain("zdroje");
  expect((await getArticle(slug))?.mdx.length).toBeGreaterThan(1000);
  expect((await listArticles()).some(article => article.slug === slug)).toBe(false);
  expect(editorialHold("__proto__")).toBeUndefined();
});
