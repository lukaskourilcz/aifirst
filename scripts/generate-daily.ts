#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import { loadSources, runScrapersDetailed } from "../lib/scraping/run.js";
import { curate } from "../lib/pipeline/curate.js";
import { write } from "../lib/pipeline/write.js";
import { illustrate } from "../lib/pipeline/illustrate.js";
import { persist } from "../lib/pipeline/persist.js";
import { promote } from "../lib/pipeline/promote.js";
import { writePromotionFile } from "../lib/promotion-store.js";
import { todayIso } from "../lib/helpers/date.js";
import { parseWorkflowInputs } from "../lib/workflows/inputs.js";
import { applyModelProfile, loadEditorialConfig } from "../lib/editorial/config.js";
import { evaluateGuardrails, maximumTitleSimilarity, sourceDiversity } from "../lib/editorial/guardrails.js";
import { writeDistributionPacks } from "../lib/distribution/share.js";
import { RunReporter, sendRunReport, writeRunReport } from "../lib/telemetry/report.js";
import { wordCount } from "../lib/text.js";
import { computeSignalStrength } from "../lib/pipeline/signal.js";
import { totalUsageCost } from "../lib/telemetry/pricing.js";
import { LOCALES, type Locale } from "../lib/i18n/config.js";
import { listArticles } from "../lib/content.js";

const inputs = parseWorkflowInputs(
  { ...process.env, ISSUE_DATE: process.argv[2] ?? process.env.ISSUE_DATE },
  todayIso(),
);
const reporter = new RunReporter(process.env.GENERATION_WORKFLOW === "regenerate" ? "regenerate" : "daily", "daily", inputs.date, inputs.publishMode);

async function alreadyExists(date: string, locales: readonly Locale[]): Promise<boolean> {
  const dir = path.join(process.cwd(), "content", "articles");
  const files: string[] = await fs.readdir(dir).catch(() => [] as string[]);
  return locales.every((locale) => files.includes(`${date}.${locale}.mdx`) || (locale === "en" && files.includes(`${date}.mdx`)));
}

async function applyGuardrailMode(result: ReturnType<typeof evaluateGuardrails>, config: Awaited<ReturnType<typeof loadEditorialConfig>>) {
  if (!result.enforced || result.recommendedPublishMode !== "pull_request") return;
  reporter.setPublishMode("pull_request");
  process.env.PUBLISH_MODE = "pull_request";
  if (process.env.GITHUB_ENV) await fs.appendFile(process.env.GITHUB_ENV, "PUBLISH_MODE=pull_request\n", "utf8");
  reporter.warn(`publish_mode_overridden:${config.quality.failureAction}`);
}

async function main() {
  const date = inputs.date;
  console.error(`[generate] date=${date} mode=${inputs.publishMode}`);

  const config = await reporter.stage("load_configuration", loadEditorialConfig);
  const scheduled = process.env.GITHUB_EVENT_NAME === "schedule";
  const requestedProfile = scheduled ? config.models.profile : inputs.modelProfile;
  applyModelProfile(config, requestedProfile);
  const configuredMode = config.review.defaultMode === "review" ? "pull_request" : config.publishing.publishMode;
  if (scheduled) {
    reporter.setPublishMode(configuredMode);
    process.env.PUBLISH_MODE = configuredMode;
    if (process.env.GITHUB_ENV) await fs.appendFile(process.env.GITHUB_ENV, `PUBLISH_MODE=${configuredMode}\n`, "utf8");
  }
  if (!config.publishing.dailyEnabled) {
    reporter.warn("daily_publishing_disabled");
    const report = reporter.build({ status: "skipped" });
    console.log(JSON.stringify({ date, status: "skipped", report: await writeRunReport(report) }));
    return;
  }

  const enabledLocales = LOCALES.filter((locale) => config.publishing.enabledLanguages.includes(locale));
  const requestedLocales: Locale[] = inputs.language === "all"
    ? (config.translation.selectedDailyEnabled || config.translation.fullDailyEnabled
        ? [...enabledLocales]
        : [config.publishing.primaryLanguage])
    : enabledLocales.includes(inputs.language) ? [inputs.language] : [config.publishing.primaryLanguage];
  if (!inputs.force && await alreadyExists(date, requestedLocales)) {
    reporter.warn("duplicate_issue_skipped");
    const report = reporter.build({ status: "skipped", language: requestedLocales.join(",") });
    const reportFile = await writeRunReport(report);
    console.log(JSON.stringify({ date, status: "skipped", report: reportFile }));
    return;
  }

  const sources = await reporter.stage("load_sources", loadSources);
  const scrape = await reporter.stage("scrape", () => runScrapersDetailed(sources));
  reporter.setSourceResults(scrape.sources);
  for (const result of scrape.sources.filter((source) => source.status === "failed")) reporter.warn(`source_failed:${result.sourceId}`);
  const items = scrape.items;
  const successfulSourceCount = scrape.sources.filter((source) => source.status === "success").length;
  const itemSourceIds = items.map((item) => item.source);
  const earlyGuardrails = evaluateGuardrails({
    successfulSources: successfulSourceCount,
    candidateItems: items.length,
    sourceDiversity: sourceDiversity(itemSourceIds),
    duplicateStorySimilarity: maximumTitleSimilarity(items.map((item) => item.title)),
  }, config);
  earlyGuardrails.violations.forEach((violation) => reporter.warn(`guardrail:${violation}`));
  await applyGuardrailMode(earlyGuardrails, config);
  if (earlyGuardrails.enforced && earlyGuardrails.recommendedPublishMode === "skip") {
    const report = reporter.build({ status: "skipped", configuredSources: sources.length, attemptedSources: sources.length, successfulSources: successfulSourceCount, candidateItems: items.length });
    console.log(JSON.stringify({ date, status: "skipped", report: await writeRunReport(report) }));
    return;
  }
  if (items.length < 3) throw new Error(`too few items scraped (${items.length})`);

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const brief = await reporter.stage("curate", () => curate(items.slice(0, config.article.maximumCurationCandidates), date));
  reporter.addUsage(brief.usage);
  const picked = new Set(brief.picks.map((pick) => pick.itemId));
  const runnerUps = items.filter((item) => !picked.has(item.id));
  const article = await reporter.stage("write", () => write(
    brief,
    itemsById,
    runnerUps,
    requestedLocales,
    config.article.maximumOutputTokens,
    config.article.briefsMaximum,
    config.article.watchlistMaximum,
    config.article.targetWords,
    requestedLocales.length > 1 ? config.models.profiles[config.translation.modelProfile]?.writing : undefined,
  ));
  article.usage.forEach((line) => reporter.addUsage(line));
  if (brief.usage) article.usage.unshift(brief.usage);

  const signalStrength = computeSignalStrength({
    cited: article.sources.map((source) => ({ id: source.source_id ?? source.id })),
    registry: sources,
  });
  const contributions = new Map<string, number>();
  for (const source of article.sources) {
    const id = source.source_id ?? source.id;
    contributions.set(id, (contributions.get(id) ?? 0) + 1);
  }
  const maximumSingleSourceShare = article.sources.length
    ? Math.max(...contributions.values()) / article.sources.length
    : 1;
  const recent = (await listArticles(config.publishing.primaryLanguage)).filter((issue) => issue.type !== "weekly").slice(0, 14);
  const repeatedTopicFrequency = article.tags.length
    ? Math.max(...article.tags.map((tag) => (recent.filter((issue) => issue.tags?.includes(tag)).length + 1) / (recent.length + 1)))
    : 0;
  const primarySourceRelevant = items.some((item) => item.tags.includes("primary-source"));
  const primarySourcePresent = article.sources.some((source) => source.classification === "primary");
  const knownRunnerUpUrls = new Set(runnerUps.map((item) => item.url));
  const unsupportedWatchlistItems = article.wire.filter((item) => !knownRunnerUpUrls.has(item.url)).length;
  const measuredCost = totalUsageCost(article.usage)?.amount;
  if (requestedLocales.length > 1 && config.translation.budgetPerRun !== null && measuredCost !== undefined && measuredCost > config.translation.budgetPerRun) {
    reporter.warn("guardrail:translation_budget_per_run");
    const report = reporter.build({ status: "skipped", language: requestedLocales.join(","), articleSlug: article.slug, configuredSources: sources.length, attemptedSources: sources.length, successfulSources: successfulSourceCount, candidateItems: items.length, selectedItems: brief.picks.length, citedSources: article.sources.length, signalStrength });
    console.log(JSON.stringify({ date, status: "skipped", report: await writeRunReport(report) }));
    return;
  }
  const finalGuardrails = evaluateGuardrails({
    successfulSources: successfulSourceCount,
    candidateItems: items.length,
    citedSources: article.sources.length,
    signalStrength,
    maximumSingleSourceShare,
    sourceDiversity: sourceDiversity(article.sources.map((source) => source.source_id ?? source.id)),
    duplicateStorySimilarity: maximumTitleSimilarity(article.sources.map((source) => source.title)),
    repeatedTopicFrequency,
    primarySourceRelevant,
    primarySourcePresent,
    unsupportedWatchlistItems,
    costPerRun: measuredCost,
  }, config);
  finalGuardrails.violations.forEach((violation) => reporter.warn(`guardrail:${violation}`));
  await applyGuardrailMode(finalGuardrails, config);
  if (finalGuardrails.enforced && finalGuardrails.recommendedPublishMode === "skip") {
    const report = reporter.build({ status: "skipped", articleSlug: article.slug, configuredSources: sources.length, attemptedSources: sources.length, successfulSources: successfulSourceCount, candidateItems: items.length, selectedItems: brief.picks.length, citedSources: article.sources.length, signalStrength });
    console.log(JSON.stringify({ date, status: "skipped", report: await writeRunReport(report) }));
    return;
  }

  let illustration = { path: null as string | null, provider: process.env.IMAGE_PROVIDER ?? "none" };
  try {
    illustration = await reporter.stage("illustrate", () => illustrate(date, article.illustrationPrompt));
  } catch (error) {
    reporter.warn(`optional_illustration_failed:${error instanceof Error ? error.message : "unknown"}`);
  }
  let promotionFile: string | null = null;
  if (process.env.GENERATE_PROMOTION === "true") {
    try {
      const promotion = await reporter.stage("promotion", () => promote(article, illustration.path));
      reporter.addUsage(promotion.usage);
      promotionFile = await writePromotionFile(promotion.post);
    } catch (error) {
      reporter.warn(`optional_promotion_failed:${error instanceof Error ? error.message : "unknown"}`);
    }
  } else {
    reporter.skip("promotion");
  }

  const completeMeasuredCost = totalUsageCost(reporter.usage)?.amount;
  const completeCostGuardrail = evaluateGuardrails({ costPerRun: completeMeasuredCost }, config);
  completeCostGuardrail.violations.forEach((violation) => reporter.warn(`guardrail:${violation}`));
  await applyGuardrailMode(completeCostGuardrail, config);
  const paidImageCostUnavailable = illustration.provider === "fal" && Boolean(illustration.path);
  if ((completeCostGuardrail.enforced && completeCostGuardrail.recommendedPublishMode === "skip") || (config.budgets.hardCostPerRun !== null && paidImageCostUnavailable)) {
    if (paidImageCostUnavailable) reporter.warn("guardrail:paid_image_cost_unavailable");
    const report = reporter.build({ status: "skipped", language: requestedLocales.join(","), articleSlug: article.slug, configuredSources: sources.length, attemptedSources: sources.length, successfulSources: successfulSourceCount, candidateItems: items.length, selectedItems: brief.picks.length, citedSources: article.sources.length, signalStrength, image: { provider: illustration.provider, generated: Boolean(illustration.path) } });
    console.log(JSON.stringify({ date, status: "skipped", report: await writeRunReport(report) }));
    return;
  }

  const files = await reporter.stage("persist", () => persist({
    article,
    illustrationPath: illustration.path,
    sourceCandidates: items.length,
    imageProvider: illustration.provider,
    usage: reporter.usage,
  }));
  let shareFiles: string[] = [];
  try {
    shareFiles = await reporter.stage("distribution_pack", () => writeDistributionPacks(article, illustration.path));
  } catch (error) {
    reporter.warn(`optional_distribution_failed:${error instanceof Error ? error.message : "unknown"}`);
  }

  const reportInput = {
    status: reporter.warnings.length ? "degraded" : "success",
    articleSlug: article.slug,
    configuredSources: sources.length,
    attemptedSources: sources.length,
    successfulSources: successfulSourceCount,
    candidateItems: items.length,
    selectedItems: brief.picks.length,
    citedSources: article.sources.length,
    signalStrength,
    language: requestedLocales.join(","),
    outputWords: wordCount(article.byLocale[requestedLocales[0]!]!.bodyMdx),
    image: { provider: illustration.provider, generated: Boolean(illustration.path) },
  } as const;
  let report = reporter.build(reportInput);
  const callback = await sendRunReport(report);
  if (callback === "failed") {
    reporter.warn("dashboard_callback_failed");
    report = reporter.build({ ...reportInput, status: "degraded" });
  }
  const reportFile = await writeRunReport(report);

  console.log(JSON.stringify({ date, slug: article.slug, files, shareFiles, illustration: illustration.path, promotion: promotionFile, report: reportFile, callback }));
}

main().catch(async (error) => {
  console.error("[generate] FAILED:", error);
  try {
    reporter.warn(error instanceof Error ? error.message : "unknown_generation_failure");
    const report = reporter.build({ status: "failed" });
    console.error(`[generate] report=${await writeRunReport(report)}`);
  } catch (reportError) {
    console.error("[generate] failed to persist run report:", reportError);
  }
  process.exit(1);
});
