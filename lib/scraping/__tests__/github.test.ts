import { describe, it, expect } from "vitest";
import { projectReleases } from "../github.js";
import type { Source } from "../types.js";

const SOURCE: Source = {
  id: "test",
  type: "github",
  name: "Test github",
  repos: ["acme/widget"],
  tags: ["tech", "test"],
};

describe("projectReleases", () => {
  it("skips drafts and releases without an html_url", () => {
    const releases = [
      {
        html_url: "https://github.com/acme/widget/releases/tag/v1.0.0",
        name: "v1.0.0",
        tag_name: "v1.0.0",
        body: "First stable release.",
        draft: false,
        published_at: "2026-05-12T09:30:00.000Z",
      },
      {
        html_url: "https://github.com/acme/widget/releases/tag/v1.1.0-draft",
        name: "v1.1.0",
        tag_name: "v1.1.0-draft",
        body: "Draft release, not public yet.",
        draft: true,
        published_at: "2026-06-01T09:30:00.000Z",
      },
      {
        name: "v0.9.0",
        tag_name: "v0.9.0",
        body: "Missing url.",
        draft: false,
        published_at: "2026-04-01T09:30:00.000Z",
      },
    ];

    const items = projectReleases(releases, "acme/widget", SOURCE);
    expect(items).toHaveLength(1);

    const [first] = items;
    expect(first?.title).toBe("acme/widget v1.0.0");
    expect(first?.url).toBe("https://github.com/acme/widget/releases/tag/v1.0.0");
    expect(first?.summary).toBe("First stable release.");
    expect(first?.publishedAt).toBe("2026-05-12T09:30:00.000Z");
    expect(first?.source).toBe("test");
    expect(first?.tags).toEqual(["tech", "test"]);
    expect(first?.id).toMatch(/^[0-9a-f]{16}$/);
  });
});
