import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

describe("daily workflow transition", () => {
  it("keeps legacy generation and adds the 07:00 UTC sentinel", async () => {
    const raw = await fs.readFile(".github/workflows/daily.yml", "utf8");
    const workflow = parse(raw) as any;
    expect(workflow.on.schedule.map((entry: { cron: string }) => entry.cron)).toEqual(["0 6 * * *", "0 7 * * *"]);
    expect(workflow.jobs.generate.if).toContain("0 6 * * *");
    expect(workflow.jobs.generate.steps.some((step: { name?: string }) => step.name === "Generate daily edition")).toBe(true);
    expect(workflow.jobs.sentinel.if).toContain("0 7 * * *");
    const sentinel = workflow.jobs.sentinel.steps.map((step: { run?: string }) => step.run ?? "").join("\n");
    expect(sentinel).toContain("TZ=Europe/Prague date +%F");
    expect(sentinel).toContain("missed-day:");
    expect(sentinel).toContain("status == \"no_edition\"");
  });
});
