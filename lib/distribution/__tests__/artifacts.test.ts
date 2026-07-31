import { describe, expect, it } from "vitest";
import { createNewsletterArtifact } from "../newsletter";
import type { Article } from "../../content";

describe("distribution artifacts", () => {
  it("creates provider-independent HTML and text email", () => {
    const article: Article = { slug: "2026-07-21-test", lang: "en", fallback: false, mdx: "Body", frontmatter: { title: "<Title>", slug: "2026-07-21-test", date: "2026-07-21", dek: "Summary", tags: [], sources: [], illustration: { prompt: "", alt: "" }, type: "weekly" } };
    const artifact = createNewsletterArtifact(article, "en");
    expect(artifact.html).toContain("&lt;Title&gt;");
    expect(artifact.text).toContain("Summary");
  });
});
