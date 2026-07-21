import { describe, expect, it } from "vitest";
import { createDistributionPack } from "../share";
import { createNewsletterArtifact } from "../newsletter";
import type { WrittenArticle } from "../../pipeline/write";
import type { Article } from "../../content";

const written: WrittenArticle = {
  slug: "2026-07-21-test", date: "2026-07-21", tags: ["ai"], illustrationPrompt: "Scene", wire: [], sources: [{ id: "s", url: "https://example.com", title: "S" }], usage: [],
  byLocale: {
    en: { title: "Title", alternativeHeadlines: ["Alternative one", "Alternative two"], dek: "Summary", bodyMdx: "Body", illustrationAlt: "Alt", dispatches: [], whyItMatters: ["Reason", "Watch"], whatChanged: ["Change"], uncertainty: ["Unknown"] },
    cs: { title: "Titulek", alternativeHeadlines: ["Alternativa jedna", "Alternativa dvě"], dek: "Shrnutí", bodyMdx: "Text", illustrationAlt: "Popis", dispatches: [], whyItMatters: ["Důvod", "Sledovat"], whatChanged: ["Změna"], uncertainty: ["Neznámé"] },
  },
};

describe("distribution artifacts", () => {
  it("creates a reader-safe static share contract", () => {
    const pack = createDistributionPack(written, "en", null);
    expect(pack.primaryHeadline).toBe("Title");
    expect(pack.alternativeHeadlines).toEqual(["Alternative one", "Alternative two"]);
    expect(pack.sourceCount).toBe(1);
    expect(pack.blueskyPost.length).toBeLessThanOrEqual(300);
  });

  it("creates provider-independent HTML and text email", () => {
    const article: Article = { slug: written.slug, lang: "en", fallback: false, mdx: "Body", frontmatter: { title: "<Title>", slug: written.slug, date: written.date, dek: "Summary", tags: [], sources: [], illustration: { prompt: "", alt: "" }, type: "weekly" } };
    const artifact = createNewsletterArtifact(article, "en");
    expect(artifact.html).toContain("&lt;Title&gt;");
    expect(artifact.text).toContain("Summary");
  });
});
