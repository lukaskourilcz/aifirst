import { describe, expect, it } from "vitest";
import { createNewsletterArtifact } from "../newsletter";
import type { Article } from "../../content";

function article(frontmatter: Partial<Article["frontmatter"]> = {}): Article {
  return {
    slug: "2026-07-21-test",
    lang: "cs",
    fallback: false,
    mdx: "Body",
    frontmatter: {
      title: "<Title>",
      slug: "2026-07-21-test",
      date: "2026-07-21",
      dek: "Summary",
      tags: [],
      sources: [],
      illustration: { prompt: "", alt: "" },
      type: "weekly",
      ...frontmatter,
    },
  };
}

const FULL = article({
  type: "daily",
  title: "Model vyšel",
  dek: "Shrnutí dne.",
  why_it_matters: ["Posouvá cenu za token."],
  what_changed: ["Kontext se zdvojnásobil."],
  uncertainty: ["Dostupnost v EU není potvrzená."],
  dispatches: [{ title: "Druhá zpráva", body: "Krátce.", source_url: "https://example.com/brief" }],
  wire: [{ title: "Sledujeme", url: "https://example.com/wire", source: "Example" }],
  corrections: [{ date: "2026-07-22", description: "Upřesněná čísla.", section: "Proč na tom záleží" }],
  sponsor: { name: "Partner", url: "https://example.com/partner", label: "Partner vydání", copy: "Text partnera." },
  sources: [{ id: "s1", url: "https://example.com/source", title: "Primární zdroj" }],
});

describe("the edition email", () => {
  it("escapes every interpolated string", () => {
    const artifact = createNewsletterArtifact(article(), "cs");
    expect(artifact.html).toContain("&lt;Title&gt;");
    expect(artifact.text).toContain("Summary");
  });

  it("renders the whole package for a daily edition, in HTML and in text", () => {
    const artifact = createNewsletterArtifact(FULL, "cs");
    for (const body of [artifact.html, artifact.text]) {
      expect(body).toContain("Proč na tom záleží");
      expect(body).toContain("Posouvá cenu za token.");
      expect(body).toContain("Co se změnilo");
      expect(body).toContain("Co zůstává nejisté");
      expect(body).toContain("Ve zkratce");
      expect(body).toContain("Druhá zpráva");
      expect(body).toContain("Na radaru");
      expect(body).toContain("https://example.com/wire");
      expect(body).toContain("Opravy");
      expect(body).toContain("Přehled zdrojů");
      expect(body).toContain("Primární zdroj");
    }
    expect(artifact.html).toContain("https://example.com/source");
    expect(artifact.text).toContain("https://example.com/source");
  });

  it("labels the sponsor and marks its link", () => {
    const artifact = createNewsletterArtifact(FULL, "cs");
    expect(artifact.html).toContain("Sponzorováno");
    expect(artifact.html).toContain('rel="sponsored noopener"');
    expect(artifact.text).toContain("Sponzorováno · Partner vydání");
  });

  it("omits every block an edition does not carry", () => {
    const artifact = createNewsletterArtifact(article({ type: "daily" }), "cs");
    for (const body of [artifact.html, artifact.text]) {
      expect(body).not.toContain("Proč na tom záleží");
      expect(body).not.toContain("Ve zkratce");
      expect(body).not.toContain("Na radaru");
      expect(body).not.toContain("Opravy");
      expect(body).not.toContain("Přehled zdrojů");
      expect(body).not.toContain("Sponzorováno");
    }
  });

  it("closes with the completion mark exactly once and an absolute canonical link", () => {
    const artifact = createNewsletterArtifact(FULL, "cs");
    expect(artifact.html.split("Máte přehled.").length - 1).toBe(1);
    expect(artifact.text.split("Máte přehled.").length - 1).toBe(1);
    expect(artifact.canonicalUrl).toMatch(/^https?:\/\/.+\/articles\/2026-07-21-test$/);
    expect(artifact.html).toContain(artifact.canonicalUrl);
    expect(artifact.text).toContain(artifact.canonicalUrl);
  });

  it("renders the publishing day, never a machine date or a clock", () => {
    const artifact = createNewsletterArtifact(FULL, "cs");
    expect(artifact.html).toContain("21. července 2026");
    expect(artifact.html).not.toContain("2026-07-21<");
  });

  it("keeps every inline style inside its attribute", () => {
    const artifact = createNewsletterArtifact(FULL, "cs");
    // The shared palette quotes font family names with double quotes, which
    // would close the attribute and spill the declaration into the markup.
    expect(artifact.html).not.toMatch(/style="[^"]*font-family: "/);
    expect(artifact.html).toContain("'Space Grotesk'");
    expect(artifact.html).toContain("'IBM Plex Mono'");
  });

  it("keeps production instrumentation out of the email", () => {
    const artifact = createNewsletterArtifact(
      article({
        type: "daily",
        generation: {
          generated_at: "2026-07-21T06:00:00Z",
          human_reviewed: true,
          models: { writing: "some-model-name" },
          source_candidates: 42,
          package_hash: "abc123",
        },
      }),
      "cs",
    );
    for (const body of [artifact.html, artifact.text]) {
      for (const leak of ["some-model-name", "package_hash", "abc123", "source_candidates", "human_reviewed", "42"]) {
        expect(body).not.toContain(leak);
      }
    }
  });
});
