import { describe, expect, it } from "vitest";
import { czechTypography, typographyCandidates } from "../typography";

const NBSP = " ";

describe("czechTypography", () => {
  it("closes a Czech opening quote with a typographic one", () => {
    expect(czechTypography('„…a CloudMCP brány," popsal')).toBe("„…a CloudMCP brány,“ popsal");
    expect(czechTypography('řekl "miliony" lidí')).toBe(`řekl „miliony“ lidí`);
  });

  it("closes a pair split across text nodes", () => {
    expect(czechTypography('," popsal')).toBe(",“ popsal");
  });

  it("splits the words upstream delivered glued together", () => {
    expect(czechTypography("na agentnísoustavy tohoto rozsahu")).toContain("agentní soustavy");
    expect(czechTypography("agentnísystémy.")).toBe("agentní systémy.");
  });

  it("writes a numeric range with an en dash and glues the unit", () => {
    expect(czechTypography("8-24 GB paměti")).toBe(`8–24${NBSP}GB paměti`);
    expect(czechTypography("růst o 25 %")).toBe(`růst o${NBSP}25${NBSP}%`);
  });

  it("leaves model names and ISO dates alone", () => {
    expect(czechTypography("Qwen3-235B-A22B")).toBe("Qwen3-235B-A22B");
    expect(czechTypography("2026-09-25")).toBe("2026-09-25");
  });

  it("glues one-letter prepositions and conjunctions", () => {
    expect(czechTypography("To podstatné z AI")).toBe(`To podstatné z${NBSP}AI`);
    expect(czechTypography("a v Praze")).toBe(`a${NBSP}v${NBSP}Praze`);
    expect(czechTypography("K tomu")).toBe(`K${NBSP}tomu`);
    // Not a standalone word.
    expect(czechTypography("modely s")).toBe("modely s");
  });

  it("turns em dashes and double hyphens into a spaced en dash", () => {
    expect(czechTypography("sandboxy — hostované")).toBe("sandboxy – hostované");
    expect(czechTypography("sandboxy--hostované")).toBe("sandboxy–hostované");
    expect(czechTypography("jedna -- dvě")).toBe("jedna – dvě");
  });

  it("uses Czech single quotes and keeps apostrophes", () => {
    expect(czechTypography("vše, čemu se říká 'AI', je")).toBe("vše, čemu se říká ‚AI‘, je");
    expect(czechTypography("OpenAI's model")).toBe("OpenAI's model");
  });

  it("collapses double spaces", () => {
    expect(czechTypography("dvě  mezery")).toBe("dvě mezery");
  });
});

describe("typographyCandidates", () => {
  it("reports lower-to-upper joins but not brand names", () => {
    expect(typographyCandidates("agentníSoustavy a OpenAI i iPhone")).toEqual(["agentníSoustavy"]);
  });
});
