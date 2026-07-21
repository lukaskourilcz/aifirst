import { describe, expect, it } from "vitest";
import { parseWorkflowInputs } from "../inputs";

describe("workflow inputs", () => {
  it("uses conservative defaults", () => {
    expect(parseWorkflowInputs({}, "2026-07-21")).toMatchObject({ publishMode: "auto", imageProvider: "none", language: "all", force: false });
  });

  it("parses review-mode boolean inputs", () => {
    expect(parseWorkflowInputs({ ISSUE_DATE: "2026-07-20", PUBLISH_MODE: "pull_request", FORCE_GENERATION: "true", SKIP_EMBEDDINGS: "1" }, "2026-07-21")).toMatchObject({ date: "2026-07-20", publishMode: "pull_request", force: true, skipEmbeddings: true });
  });

  it("rejects invalid dates and modes before paid work", () => {
    expect(() => parseWorkflowInputs({ ISSUE_DATE: "today" }, "2026-07-21")).toThrow(/YYYY-MM-DD/);
    expect(() => parseWorkflowInputs({ PUBLISH_MODE: "ship" }, "2026-07-21")).toThrow(/PUBLISH_MODE/);
  });
});
