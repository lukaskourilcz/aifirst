import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// A cleanup once deleted the last selector of a list, and the dangling list
// silently merged into the next rule. These checks catch that shape.
const css = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");

describe("app/globals.css", () => {
  it("has balanced braces", () => {
    let depth = 0;
    for (const char of withoutComments) {
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      expect(depth).toBeGreaterThanOrEqual(0);
    }
    expect(depth).toBe(0);
  });

  it("never lets a selector list run into a comment or a blank line", () => {
    expect(css).not.toMatch(/,[ \t]*\n[ \t]*\/\*/);
    expect(withoutComments).not.toMatch(/,[ \t]*\n[ \t]*\n/);
  });
});
