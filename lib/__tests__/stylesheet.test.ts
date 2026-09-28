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

describe("the Open Graph palette mirrors the CSS tokens", () => {
  const token = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1]?.toLowerCase();

  it("uses the same ink rule, ink text, accent and page colours", async () => {
    const { OG } = await import("../og-theme");
    expect(OG.borderInk).toBe(token("border-ink"));
    expect(OG.ink).toBe(token("text-primary"));
    expect(OG.accent).toBe(token("accent-primary"));
    expect(OG.page).toBe(token("surface-page"));
  });
});
