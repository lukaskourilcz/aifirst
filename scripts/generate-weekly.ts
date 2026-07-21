#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { generateWeekly } from "../lib/pipeline/weekly.js";
import { illustrate } from "../lib/pipeline/illustrate.js";
import { toIsoDate } from "../lib/helpers/date.js";
import { parseWorkflowInputs } from "../lib/workflows/inputs.js";
import { applyModelProfile, loadEditorialConfig } from "../lib/editorial/config.js";
import { RunReporter, sendRunReport, writeRunReport } from "../lib/telemetry/report.js";
import { getArticle } from "../lib/content.js";
import { writeNewsletterArtifact } from "../lib/distribution/newsletter.js";
import { LOCALES, type Locale } from "../lib/i18n/config.js";
import { wordCount } from "../lib/text.js";
import { writeArticleDistributionPack } from "../lib/distribution/share.js";
import { writeMdxFile } from "../lib/content-write.js";
import { totalUsageCost } from "../lib/telemetry/pricing.js";
import { evaluateGuardrails } from "../lib/editorial/guardrails.js";

function lastSundayUtc(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return toIsoDate(date);
}

const inputs = parseWorkflowInputs(
  { ...process.env, ISSUE_DATE: process.argv[2] ?? process.env.ISSUE_DATE },
  lastSundayUtc(),
);
const reporter = new RunReporter(process.env.GENERATION_WORKFLOW === "regenerate" ? "regenerate" : "weekly", "weekly", inputs.date, inputs.publishMode);

async function main() {
  const date = inputs.date;
  const config = await reporter.stage("load_configuration", loadEditorialConfig);
  applyModelProfile(config, inputs.modelProfile);
  if (!config.publishing.weeklyEnabled) {
    const report = reporter.build({ status: "skipped" });
    console.log(JSON.stringify({ date, status: "skipped", report: await writeRunReport(report) }));
    return;
  }
  const enabledLocales = LOCALES.filter((locale) => config.publishing.enabledLanguages.includes(locale));
  const requestedLocales: Locale[] = inputs.language === "all"
    ? (config.translation.weeklyEnabled ? [...enabledLocales] : [config.publishing.primaryLanguage])
    : enabledLocales.includes(inputs.language) ? [inputs.language] : [config.publishing.primaryLanguage];
  const contentFiles: string[] = await fs.readdir(path.join(process.cwd(), "content", "articles")).catch(() => [] as string[]);
  if (!inputs.force && requestedLocales.every((locale) => contentFiles.includes(`${date}-weekly.${locale}.mdx`))) {
    reporter.warn("duplicate_issue_skipped");
    const report = reporter.build({ status: "skipped", language: requestedLocales.join(",") });
    console.log(JSON.stringify({ date, status: "skipped", report: await writeRunReport(report) }));
    return;
  }
  const generated = await reporter.stage("weekly_write", () => generateWeekly(date, requestedLocales, Math.min(6000, config.article.maximumOutputTokens)));
  generated.usage.forEach((line) => reporter.addUsage(line));
  const measuredCost = totalUsageCost(generated.usage)?.amount;
  if (requestedLocales.length > 1 && config.translation.budgetPerRun !== null && measuredCost !== undefined && measuredCost > config.translation.budgetPerRun) {
    reporter.warn("guardrail:translation_budget_per_run");
    throw new Error("weekly translation budget exceeded before publication");
  }
  const costGuardrail = evaluateGuardrails({ costPerRun: measuredCost }, config);
  costGuardrail.violations.forEach((violation) => reporter.warn(`guardrail:${violation}`));
  if (costGuardrail.recommendedPublishMode === "skip") throw new Error("weekly hard cost limit exceeded before publication");
  const primary = generated.files[0];
  let illustration = { path: null as string | null, provider: process.env.IMAGE_PROVIDER ?? "none" };
  if (primary) {
    const raw = await fs.readFile(primary, "utf8");
    const { data } = matter(raw);
    const prompt = (data as { illustration?: { prompt?: string } }).illustration?.prompt;
    if (prompt) illustration = await reporter.stage("illustrate", () => illustrate(`${date}-weekly`, prompt));
  }
  const paidImageCostUnavailable = illustration.provider === "fal" && Boolean(illustration.path);
  if (config.budgets.hardCostPerRun !== null && paidImageCostUnavailable) {
    reporter.warn("guardrail:paid_image_cost_unavailable");
    throw new Error("weekly paid image cost is unavailable under a hard per-run limit");
  }
  await reporter.stage("persist_illustration_metadata", async () => {
    for (const file of generated.files) {
      const parsed = matter(await fs.readFile(file, "utf8"));
      const data = parsed.data as { illustration?: Record<string, unknown> } & Record<string, unknown>;
      if (data.illustration) {
        if (illustration.path) data.illustration.path = illustration.path;
        else delete data.illustration.path;
      }
      await writeMdxFile(path.basename(file), data, parsed.content);
    }
  });

  const newsletterFiles: string[] = [];
  const shareFiles: string[] = [];
  for (const locale of requestedLocales) {
    const article = await getArticle(generated.slug, locale);
    if (article) {
      newsletterFiles.push(...await reporter.stage(`newsletter_${locale}`, () => writeNewsletterArtifact(article, locale)));
      shareFiles.push(await reporter.stage(`distribution_${locale}`, () => writeArticleDistributionPack(article, locale)));
    }
  }
  const primaryArticle = await getArticle(generated.slug, requestedLocales[0]);
  const reportInput = {
    status: reporter.warnings.length ? "degraded" : "success",
    language: requestedLocales.join(","),
    articleSlug: generated.slug,
    selectedItems: primaryArticle?.frontmatter.digest?.covered_slugs.length ?? 0,
    citedSources: 0,
    outputWords: primaryArticle ? wordCount(primaryArticle.mdx) : undefined,
    image: { provider: illustration.provider, generated: Boolean(illustration.path) },
  } as const;
  let report = reporter.build(reportInput);
  const callback = await sendRunReport(report);
  if (callback === "failed") {
    reporter.warn("dashboard_callback_failed");
    report = reporter.build({ ...reportInput, status: "degraded" });
  }
  const reportFile = await writeRunReport(report);
  console.log(JSON.stringify({ date, files: generated.files, newsletterFiles, shareFiles, report: reportFile, callback }));
}

main().catch(async (error) => {
  console.error("[weekly] FAILED:", error);
  try {
    reporter.warn(error instanceof Error ? error.message : "unknown_weekly_failure");
    console.error(`[weekly] report=${await writeRunReport(reporter.build({ status: "failed" }))}`);
  } catch {}
  process.exit(1);
});
