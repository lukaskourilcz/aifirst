import type { Locale } from "../i18n/config";
import type { PublishMode } from "../editorial/config";

export type WorkflowInputs = {
  date: string;
  language: Locale | "all";
  publishMode: PublishMode;
  imageProvider: "none" | "fal" | "nasa" | "picsum";
  modelProfile: string;
  force: boolean;
  skipEmbeddings: boolean;
};

function bool(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

export function parseWorkflowInputs(env: Record<string, string | undefined>, fallbackDate: string): WorkflowInputs {
  const date = env.ISSUE_DATE?.trim() || fallbackDate;
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) throw new Error("ISSUE_DATE must be a real YYYY-MM-DD date");
  const language = env.ISSUE_LANGUAGE?.trim() || "all";
  if (!["en", "cs", "all"].includes(language)) throw new Error("ISSUE_LANGUAGE must be en, cs or all");
  const publishMode = env.PUBLISH_MODE?.trim() || "auto";
  if (!["auto", "pull_request", "dry_run"].includes(publishMode)) throw new Error("PUBLISH_MODE is invalid");
  const imageProvider = env.IMAGE_PROVIDER?.trim() || "none";
  if (!["none", "fal", "nasa", "picsum"].includes(imageProvider)) throw new Error("IMAGE_PROVIDER is invalid");
  return {
    date,
    language: language as WorkflowInputs["language"],
    publishMode: publishMode as PublishMode,
    imageProvider: imageProvider as WorkflowInputs["imageProvider"],
    modelProfile: env.MODEL_PROFILE?.trim() || "standard",
    force: bool(env.FORCE_GENERATION),
    skipEmbeddings: bool(env.SKIP_EMBEDDINGS),
  };
}
