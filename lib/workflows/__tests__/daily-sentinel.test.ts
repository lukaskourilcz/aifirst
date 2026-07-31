import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

describe("daily workflow transition", () => {
  it("keeps only the 07:00 UTC sentinel after the BoardlessAI cutover", async () => {
    const raw = await fs.readFile(".github/workflows/daily.yml", "utf8");
    const workflow = parse(raw) as any;
    expect(workflow.on.schedule.map((entry: { cron: string }) => entry.cron)).toEqual(["0 7 * * *"]);
    expect(workflow.jobs.generate).toBeUndefined();
    expect(workflow.permissions).toEqual({ contents: "read", issues: "write" });
    const sentinel = workflow.jobs.sentinel.steps.map((step: { run?: string }) => step.run ?? "").join("\n");
    expect(sentinel).toContain("TZ=Europe/Prague date +%F");
    expect(sentinel).toContain("missed-day:");
    expect(sentinel).toContain("status == \"no_edition\"");
    expect(raw).not.toContain("ANTHROPIC_API_KEY");
    expect(raw).not.toContain("generate:daily");
  });
});
