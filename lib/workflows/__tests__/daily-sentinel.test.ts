import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parse } from "yaml";

type Step = { name?: string; run?: string };

async function readWorkflow() {
  const raw = await fs.readFile(".github/workflows/daily.yml", "utf8");
  return { raw, workflow: parse(raw) as any };
}

async function missedDayScript(): Promise<string> {
  const { workflow } = await readWorkflow();
  const steps = workflow.jobs.sentinel.steps as Step[];
  const step = steps.find((candidate) => candidate.run?.includes("gh issue create"));
  if (!step?.run) throw new Error("daily.yml has no step that opens a missed-day issue");
  return step.run;
}

describe("daily workflow transition", () => {
  it("keeps only the 07:00 UTC sentinel after the BoardlessAI cutover", async () => {
    const { raw, workflow } = await readWorkflow();
    expect(workflow.on.schedule.map((entry: { cron: string }) => entry.cron)).toEqual(["0 7 * * *"]);
    expect(workflow.jobs.generate).toBeUndefined();
    expect(workflow.permissions).toEqual({ contents: "read", issues: "write" });
    const sentinel = workflow.jobs.sentinel.steps.map((step: Step) => step.run ?? "").join("\n");
    expect(sentinel).toContain("TZ=Europe/Prague date +%F");
    expect(sentinel).toContain("missed-day:");
    expect(sentinel).toContain("status == \"no_edition\"");
    expect(sentinel).toContain("content/articles/${issue_date}.cs.mdx");
    expect(sentinel).toContain("package_hash:");
    expect(sentinel).toContain("board-context/1");
    expect(sentinel).toContain('status == "edition"');
    expect(raw).not.toContain("ANTHROPIC_API_KEY");
    expect(raw).not.toContain("generate:daily");
  });

  it("searches for an open missed-day issue before it opens one", async () => {
    const { raw } = await readWorkflow();
    const script = await missedDayScript();
    const search = script.indexOf('gh issue list --state open --search "missed-day in:title"');
    const create = script.indexOf("gh issue create");
    expect(search).toBeGreaterThan(-1);
    expect(create).toBeGreaterThan(search);
    expect(script).toContain('startswith("missed-day")');
    expect(script).toContain('gh issue comment "$number"');
    expect(script).toContain('gh issue edit "$number" --title "missed-day: ${first_date} (+$((10#$extra + 1)))"');
    expect(script.trimEnd().endsWith("exit 1")).toBe(true);
    // The step still runs on the job token alone.
    expect(raw.match(/secrets\.[A-Z_]+/g) ?? []).toEqual(["secrets.GITHUB_TOKEN"]);
  });
});

/* The step runs for real against a stand-in `gh` that answers from fixtures and
 * records every call, so the search, the comment and the retitle are pinned as
 * behaviour rather than as strings. It needs bash and jq, as the runner does.
 * Each run starts several processes, hence the wider timeout. */
describe("missed-day issue step", { timeout: 20_000 }, () => {
  const scratch: string[] = [];

  afterEach(async () => {
    await Promise.all(scratch.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
  });

  async function runStep(options: {
    date: string;
    open: Array<{ number: number; title: string }>;
    comments?: string[];
  }) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "daily-sentinel-"));
    scratch.push(dir);
    const log = path.join(dir, "gh.log");
    await fs.writeFile(path.join(dir, "list.json"), JSON.stringify(options.open));
    await fs.writeFile(
      path.join(dir, "view.json"),
      JSON.stringify({ comments: (options.comments ?? []).map((body) => ({ body })) }),
    );
    await fs.writeFile(
      path.join(dir, "gh-stub.cjs"),
      [
        'const fs = require("node:fs");',
        'const path = require("node:path");',
        "const args = process.argv.slice(2);",
        "const dir = process.env.GH_STUB_DIR;",
        'fs.appendFileSync(path.join(dir, "gh.log"), JSON.stringify(args) + "\\n");',
        'const fixture = { list: "list.json", view: "view.json" }[args[1]];',
        "if (fixture) process.stdout.write(fs.readFileSync(path.join(dir, fixture)));",
        "",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(dir, "gh"),
      `#!/usr/bin/env bash\nexec ${JSON.stringify(process.execPath)} "$GH_STUB_DIR/gh-stub.cjs" "$@"\n`,
      { mode: 0o755 },
    );
    const script = path.join(dir, "step.sh");
    await fs.writeFile(script, await missedDayScript());
    const result = spawnSync("bash", ["-e", script], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${dir}${path.delimiter}${process.env.PATH ?? ""}`,
        GH_STUB_DIR: dir,
        GH_TOKEN: "test-token",
        ISSUE_DATE: options.date,
      },
    });
    const calls = (await fs.readFile(log, "utf8").catch(() => ""))
      .split("\n")
      .filter(Boolean)
      .map((entry) => JSON.parse(entry) as string[]);
    const writes = calls.filter((call) => ["create", "comment", "edit"].includes(call[1] ?? ""));
    return { status: result.status, stdout: result.stdout, stderr: result.stderr, calls, writes };
  }

  it("opens a new issue as the day's date when none is open", async () => {
    const run = await runStep({ date: "2026-09-26", open: [] });
    expect(run.status).toBe(1);
    expect(run.calls[0]?.slice(0, 4)).toEqual(["issue", "list", "--state", "open"]);
    expect(run.calls[0]).toContain("missed-day in:title");
    expect(run.writes).toHaveLength(1);
    expect(run.writes[0]?.slice(0, 4)).toEqual(["issue", "create", "--title", "missed-day: 2026-09-26"]);
  });

  it("ignores open issues whose title does not start with missed-day", async () => {
    const run = await runStep({ date: "2026-09-26", open: [{ number: 12, title: "Sentinel: stop the missed-day noise" }] });
    expect(run.status).toBe(1);
    expect(run.writes.map((call) => call[1])).toEqual(["create"]);
  });

  it("comments on the open issue and counts the first extra date", async () => {
    const run = await runStep({ date: "2026-09-26", open: [{ number: 70, title: "missed-day: 2026-09-20" }] });
    expect(run.status).toBe(1);
    expect(run.writes).toHaveLength(2);
    const [comment, edit] = run.writes;
    expect(comment?.slice(0, 4)).toEqual(["issue", "comment", "70", "--body"]);
    expect(comment?.[4]?.split("\n")[0]).toBe("missed-day: 2026-09-26");
    expect(comment?.[4]).toContain("public/data/board/2026-09-26.json");
    expect(edit).toEqual(["issue", "edit", "70", "--title", "missed-day: 2026-09-20 (+1)"]);
  });

  it("increments an existing (+N) count and keeps the first date", async () => {
    const run = await runStep({ date: "2026-09-26", open: [{ number: 70, title: "missed-day: 2026-09-20 (+9)" }] });
    expect(run.writes.at(-1)).toEqual(["issue", "edit", "70", "--title", "missed-day: 2026-09-20 (+10)"]);
  });

  it("uses the oldest open missed-day issue when several are open", async () => {
    const run = await runStep({
      date: "2026-09-26",
      open: [
        { number: 94, title: "missed-day: 2026-09-24" },
        { number: 64, title: "missed-day: 2026-08-31" },
        { number: 80, title: "missed-day: 2026-09-10" },
      ],
    });
    expect(run.writes.map((call) => call.slice(0, 3))).toEqual([
      ["issue", "comment", "64"],
      ["issue", "edit", "64"],
    ]);
    expect(run.writes[1]?.[4]).toBe("missed-day: 2026-08-31 (+1)");
  });

  it("changes nothing when the issue already holds the date", async () => {
    const sameFirst = await runStep({ date: "2026-09-20", open: [{ number: 70, title: "missed-day: 2026-09-20 (+2)" }] });
    expect(sameFirst.status).toBe(1);
    expect(sameFirst.writes).toEqual([]);

    const commented = await runStep({
      date: "2026-09-26",
      open: [{ number: 70, title: "missed-day: 2026-09-20 (+1)" }],
      comments: ["missed-day: 2026-09-26\r\n\r\nThe 07:00 UTC sentinel found neither ..."],
    });
    expect(commented.status).toBe(1);
    expect(commented.writes).toEqual([]);
  });

  it("comments without retitling when the open title names no first date", async () => {
    const run = await runStep({ date: "2026-09-26", open: [{ number: 70, title: "missed-day backlog" }] });
    expect(run.status).toBe(1);
    expect(run.writes.map((call) => call[1])).toEqual(["comment"]);
    expect(run.stdout).toContain("::warning::issue #70");
  });
});
