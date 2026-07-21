import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { isLocale, type Locale } from "../i18n/config";

export type PublishMode = "auto" | "pull_request" | "dry_run";
export type GuardrailMode = "report_only" | "enforce";

export type EditorialConfig = {
  schemaVersion: 1;
  brand: { name: string };
  publishing: {
    dailyEnabled: boolean;
    weeklyEnabled: boolean;
    publishMode: PublishMode;
    primaryLanguage: Locale;
    enabledLanguages: Locale[];
  };
  quality: {
    minimumSignalStrength: number;
    minimumSuccessfulSources: number;
    minimumCandidateItems: number;
    minimumCitedSources: number;
    maximumSingleSourceShare: number;
    enforcement: GuardrailMode;
  };
  article: {
    targetWords: number;
    briefsMaximum: number;
    watchlistMaximum: number;
    maximumOutputTokens: number;
    maximumCurationCandidates: number;
  };
  translation: {
    weeklyEnabled: boolean;
    selectedDailyEnabled: boolean;
    fullDailyEnabled: boolean;
    modelProfile: string;
    budgetPerRun: number | null;
  };
  models: {
    profile: string;
    profiles: Record<string, { curation: string; writing: string; utility: string }>;
  };
  illustration: { provider: string };
  budgets: {
    warningCostPerRun: number | null;
    hardCostPerRun: number | null;
    monthlyWarning: number | null;
    monthlyHardLimit: number | null;
    maximumRegenerationAttemptsPerDate: number;
  };
  review: { defaultMode: "auto" | "review" };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateEditorialConfig(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ["editorial configuration must be an object"];
  if (value.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!isRecord(value.brand) || typeof value.brand.name !== "string" || !value.brand.name.trim()) errors.push("brand.name is required");
  const publishing = value.publishing;
  if (!isRecord(publishing)) {
    errors.push("publishing must be an object");
  } else {
    if (!isLocale(String(publishing.primaryLanguage))) {
      errors.push("publishing.primaryLanguage must be en or cs");
    }
    if (!Array.isArray(publishing.enabledLanguages) ||
        publishing.enabledLanguages.some((x) => typeof x !== "string" || !isLocale(x))) {
      errors.push("publishing.enabledLanguages must contain only en/cs");
    } else if (isLocale(String(publishing.primaryLanguage)) && !publishing.enabledLanguages.includes(publishing.primaryLanguage)) {
      errors.push("publishing.enabledLanguages must include primaryLanguage");
    }
    for (const key of ["dailyEnabled", "weeklyEnabled"] as const) if (typeof publishing[key] !== "boolean") errors.push(`publishing.${key} must be boolean`);
    if (!["auto", "pull_request", "dry_run"].includes(String(publishing.publishMode))) {
      errors.push("publishing.publishMode is invalid");
    }
  }
  const article = value.article;
  if (!isRecord(article)) errors.push("article must be an object");
  else for (const key of ["targetWords", "briefsMaximum", "watchlistMaximum", "maximumOutputTokens", "maximumCurationCandidates"] as const) {
    if (!Number.isInteger(article[key]) || Number(article[key]) <= 0) errors.push(`article.${key} must be a positive integer`);
  }
  if (isRecord(article) && typeof article.briefsMaximum === "number" && article.briefsMaximum < 2) errors.push("article.briefsMaximum must be at least 2");
  if (isRecord(article) && typeof article.watchlistMaximum === "number" && article.watchlistMaximum < 4) errors.push("article.watchlistMaximum must be at least 4");
  const translation = value.translation;
  if (!isRecord(translation)) errors.push("translation must be an object");
  else {
    for (const key of ["weeklyEnabled", "selectedDailyEnabled", "fullDailyEnabled"] as const) if (typeof translation[key] !== "boolean") errors.push(`translation.${key} must be boolean`);
    if (typeof translation.modelProfile !== "string" || !translation.modelProfile.trim()) errors.push("translation.modelProfile is required");
    if (translation.budgetPerRun !== null && (typeof translation.budgetPerRun !== "number" || translation.budgetPerRun < 0)) errors.push("translation.budgetPerRun must be null or non-negative");
  }
  if (!isRecord(value.models) || typeof value.models.profile !== "string" || !value.models.profile.trim() || !isRecord(value.models.profiles)) errors.push("models.profile and models.profiles are required");
  else {
    if (!isRecord(value.models.profiles[value.models.profile])) errors.push("models.profile must name a committed profile");
    for (const [name, profile] of Object.entries(value.models.profiles)) {
      if (!isRecord(profile)) { errors.push(`models.profiles.${name} must be an object`); continue; }
      for (const role of ["curation", "writing", "utility"] as const) if (typeof profile[role] !== "string" || !profile[role]) errors.push(`models.profiles.${name}.${role} is required`);
    }
  }
  if (!isRecord(value.illustration) || typeof value.illustration.provider !== "string" || !value.illustration.provider.trim()) errors.push("illustration.provider is required");
  const quality = value.quality;
  if (!isRecord(quality)) {
    errors.push("quality must be an object");
  } else {
    for (const key of ["minimumSignalStrength", "minimumSuccessfulSources", "minimumCandidateItems", "minimumCitedSources"] as const) {
      if (typeof quality[key] !== "number" || quality[key] < 0) {
        errors.push(`quality.${key} must be a non-negative number`);
      }
    }
    if (typeof quality.maximumSingleSourceShare !== "number" || quality.maximumSingleSourceShare <= 0 || quality.maximumSingleSourceShare > 1) {
      errors.push("quality.maximumSingleSourceShare must be within (0, 1]");
    }
    if (!["report_only", "enforce"].includes(String(quality.enforcement))) {
      errors.push("quality.enforcement must be report_only or enforce");
    }
  }
  const budgets = value.budgets;
  if (!isRecord(budgets)) {
    errors.push("budgets must be an object");
  } else {
    for (const key of ["warningCostPerRun", "hardCostPerRun", "monthlyWarning", "monthlyHardLimit"] as const) {
      const amount = budgets[key];
      if (amount !== null && (typeof amount !== "number" || amount < 0)) {
        errors.push(`budgets.${key} must be null or a non-negative number`);
      }
    }
    if (!Number.isInteger(budgets.maximumRegenerationAttemptsPerDate) || Number(budgets.maximumRegenerationAttemptsPerDate) < 0) errors.push("budgets.maximumRegenerationAttemptsPerDate must be a non-negative integer");
  }
  if (!isRecord(value.review) || !["auto", "review"].includes(String(value.review.defaultMode))) errors.push("review.defaultMode must be auto or review");
  return errors;
}

export async function loadEditorialConfig(
  file = path.join(process.cwd(), "config", "editorial.yml"),
): Promise<EditorialConfig> {
  const parsed = YAML.parse(await fs.readFile(file, "utf8")) as unknown;
  const errors = validateEditorialConfig(parsed);
  if (errors.length) throw new Error(`Invalid editorial configuration:\n- ${errors.join("\n- ")}`);
  return parsed as EditorialConfig;
}

export function applyModelProfile(config: EditorialConfig, requested: string): EditorialConfig["models"]["profiles"][string] {
  const profile = config.models.profiles[requested];
  if (!profile) throw new Error(`Unknown MODEL_PROFILE: ${requested}`);
  process.env.AIFIRST_CURATION_MODEL = profile.curation;
  process.env.AIFIRST_WRITING_MODEL = profile.writing;
  process.env.AIFIRST_UTILITY_MODEL = profile.utility;
  return profile;
}
