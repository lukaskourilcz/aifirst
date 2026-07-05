import { describe, it, expect } from "vitest";
import { projectQuestions } from "../stackexchange.js";
import type { Source } from "../types.js";

const SOURCE: Source = {
  id: "test",
  type: "stackexchange",
  name: "Test stackexchange",
  query: "machine-learning",
  site: "stackoverflow",
  tags: ["tech", "test"],
};

describe("projectQuestions", () => {
  it("skips questions without a link and converts unix seconds to ISO", () => {
    const data = {
      items: [
        {
          title: "How to train a model faster?",
          link: "https://stackoverflow.com/questions/1/how-to-train-a-model-faster",
          body: "<p>I'm trying to speed up training.</p>",
          creation_date: 1778924400,
        },
        {
          title: "No link question",
          body: "<p>This one has no link.</p>",
          creation_date: 1778924400,
        },
      ],
    };

    const items = projectQuestions(data, SOURCE);
    expect(items).toHaveLength(1);

    const [first] = items;
    expect(first?.title).toBe("How to train a model faster?");
    expect(first?.url).toBe(
      "https://stackoverflow.com/questions/1/how-to-train-a-model-faster",
    );
    expect(first?.summary).toBe("I'm trying to speed up training.");
    expect(first?.publishedAt).toBe("2026-05-16T09:40:00.000Z");
    expect(first?.source).toBe("test");
    expect(first?.tags).toEqual(["tech", "test"]);
    expect(first?.id).toMatch(/^[0-9a-f]{16}$/);
  });
});
