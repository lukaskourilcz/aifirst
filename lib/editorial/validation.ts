import type { ArticleFrontmatter } from "../content";
import { ARTICLE_CATEGORIES, PRACTICAL_KINDS, PRACTICAL_VARIANTS } from "../content";

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function nonEmptyStrings(value: unknown, min = 1, max = Infinity): value is string[] {
  return Array.isArray(value) && value.length >= min && value.length <= max && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

function validHttpUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validateArticleFrontmatter(raw: Record<string, unknown>, file: string): string[] {
  const errors: string[] = [];
  const requiredStrings = ["title", "slug", "dek"] as const;
  for (const key of requiredStrings) {
    if (typeof raw[key] !== "string" || raw[key].trim() === "") errors.push(`${file}: missing or non-string ${key}`);
  }
  if (!validDate(raw.date)) errors.push(`${file}: date must be a quoted, real YYYY-MM-DD string`);
  if (typeof raw.date === "string" && !file.startsWith(raw.date)) errors.push(`${file}: filename does not start with frontmatter date ${raw.date}`);
  if (!nonEmptyStrings(raw.tags)) errors.push(`${file}: tags must be a non-empty string array`);
  if (raw.alternative_headlines !== undefined && !nonEmptyStrings(raw.alternative_headlines, 1, 3)) errors.push(`${file}: alternative_headlines must contain 1-3 non-empty strings`);
  // Absent is fine and common. Present but unknown is a content error, because
  // a category the reader cannot route is a silently missing section.
  if (raw.categories !== undefined) {
    if (!Array.isArray(raw.categories)) {
      errors.push(`${file}: categories must be an array if present`);
    } else {
      for (const value of raw.categories) {
        if (typeof value !== "string" || !(ARTICLE_CATEGORIES as readonly string[]).includes(value)) {
          errors.push(`${file}: unknown category ${JSON.stringify(value)}; allowed: ${ARTICLE_CATEGORIES.join(", ")}`);
        }
      }
    }
  }
  if (!Array.isArray(raw.sources)) errors.push(`${file}: sources must be an array`);
  if (raw.dispatches !== undefined && !Array.isArray(raw.dispatches)) errors.push(`${file}: dispatches must be an array if present`);
  if (raw.wire !== undefined && !Array.isArray(raw.wire)) errors.push(`${file}: wire must be an array if present`);
  if (raw.type !== undefined && raw.type !== "daily" && raw.type !== "weekly") errors.push(`${file}: type must be daily or weekly`);
  if (raw.lang !== undefined && raw.lang !== "en" && raw.lang !== "cs") errors.push(`${file}: lang must be en or cs`);
  if (raw.signal_strength !== undefined && (typeof raw.signal_strength !== "number" || raw.signal_strength < 0 || raw.signal_strength > 100)) errors.push(`${file}: signal_strength must be within 0-100`);

  const illustration = raw.illustration;
  // `prompt` is legacy. Upstream stopped emitting it -- nothing ever generated an image from it,
  // and it was the text that captioned real photographs with imagined illustrations -- so it is
  // read when present and never required. `alt` is what a reader depends on and stays required.
  if (!illustration || typeof illustration !== "object" || typeof (illustration as { alt?: unknown }).alt !== "string") {
    errors.push(`${file}: illustration must contain alt; path and prompt are optional`);
  } else if ((illustration as { prompt?: unknown }).prompt !== undefined && typeof (illustration as { prompt?: unknown }).prompt !== "string") {
    errors.push(`${file}: illustration.prompt must be a string when present`);
  }

  const sourceUrls = new Set<string>();
  for (const [index, source] of (Array.isArray(raw.sources) ? raw.sources : []).entries()) {
    if (!source || typeof source !== "object") {
      errors.push(`${file}: sources[${index}] must be an object`);
      continue;
    }
    const item = source as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.title !== "string" || !validHttpUrl(item.url)) errors.push(`${file}: sources[${index}] requires id, title and an http(s) URL`);
    if (typeof item.url === "string") {
      if (sourceUrls.has(item.url)) errors.push(`${file}: duplicate source URL ${item.url}`);
      sourceUrls.add(item.url);
    }
    if (item.classification !== undefined && item.classification !== "primary" && item.classification !== "secondary") errors.push(`${file}: sources[${index}].classification is invalid`);
    if (item.supports !== undefined && !nonEmptyStrings(item.supports)) errors.push(`${file}: sources[${index}].supports must be a non-empty string array`);
  }

  if (raw.corrections !== undefined) {
    if (!Array.isArray(raw.corrections)) errors.push(`${file}: corrections must be an array`);
    for (const [index, correction] of (Array.isArray(raw.corrections) ? raw.corrections : []).entries()) {
      if (!correction || typeof correction !== "object" || !validDate((correction as { date?: unknown }).date) || typeof (correction as { description?: unknown }).description !== "string") errors.push(`${file}: corrections[${index}] requires a real date and description`);
    }
  }

  const sponsor = raw.sponsor;
  if (sponsor !== undefined) {
    if (!sponsor || typeof sponsor !== "object") errors.push(`${file}: sponsor must be an object`);
    else {
      const value = sponsor as Record<string, unknown>;
      for (const key of ["name", "label", "copy"] as const) if (typeof value[key] !== "string" || !value[key]) errors.push(`${file}: sponsor.${key} is required`);
      if (!validHttpUrl(value.url)) errors.push(`${file}: sponsor.url must be http(s)`);
      if (value.image !== undefined) {
        if (typeof value.image !== "string" || !value.image.startsWith("/")) errors.push(`${file}: sponsor.image must be a local root-relative path`);
        if (typeof value.image_alt !== "string" || !value.image_alt) errors.push(`${file}: sponsor.image requires image_alt`);
      }
    }
  }

  if ((raw.type ?? "daily") === "weekly") {
    const digest = raw.digest;
    if (!digest || typeof digest !== "object") errors.push(`${file}: weekly issue requires digest`);
    else {
      const value = digest as Record<string, unknown>;
      if (!validDate(value.from) || !validDate(value.to) || String(value.from) > String(value.to)) errors.push(`${file}: digest range is invalid`);
      if (!nonEmptyStrings(value.covered_slugs)) errors.push(`${file}: digest.covered_slugs must not be empty`);
    }
  }

  if (raw.schema_version === 2) {
    const minimumWhy = (raw.type ?? "daily") === "weekly" ? 1 : 2;
    if (!nonEmptyStrings(raw.why_it_matters, minimumWhy, 3)) errors.push(`${file}: schema v2 requires ${minimumWhy}-3 why_it_matters items`);
    if (!nonEmptyStrings(raw.what_changed, 1, 4)) errors.push(`${file}: schema v2 requires 1-4 what_changed items`);
    if (!nonEmptyStrings(raw.uncertainty, 1, 3)) errors.push(`${file}: schema v2 requires 1-3 uncertainty items`);
    const generation = raw.generation;
    if (!generation || typeof generation !== "object") errors.push(`${file}: schema v2 requires generation provenance`);
    else {
      const value = generation as Record<string, unknown>;
      if (typeof value.generated_at !== "string" || Number.isNaN(new Date(value.generated_at).getTime())) errors.push(`${file}: generation.generated_at must be ISO date-time`);
      if (typeof value.human_reviewed !== "boolean") errors.push(`${file}: generation.human_reviewed must be boolean`);
      if (!value.models || typeof value.models !== "object") errors.push(`${file}: generation.models is required`);
      if (value.cost !== undefined) {
        const cost = value.cost as Record<string, unknown>;
        if (!cost || typeof cost.amount !== "number" || cost.amount < 0 || cost.currency !== "USD") errors.push(`${file}: generation.cost must be a non-negative USD measurement`);
      }
    }
  } else if (raw.schema_version !== undefined) {
    errors.push(`${file}: unsupported schema_version`);
  }

  return errors;
}

/**
 * The practical block, checked against what a reader depends on rather than
 * against upstream's authoring arithmetic.
 *
 * Absent is the normal state and produces nothing. What fails is a block the
 * reader would render wrongly or could not trust: a shape the resolver would
 * throw items away from, an unknown kind, two items the reader cannot tell
 * apart, a raw URL in prose that is already a link, and a source_url this same
 * file does not cite.
 *
 * Deliberately not checked here: the 40-600 character body bound and the
 * one-item / three-tools-plus-a-prompt composition. Both are upstream's own
 * contract, enforced where the block is written; a second copy of them in this
 * repository could only drift and start rejecting editions that are correct.
 * The item count is checked, because the reader truncates at four and a
 * silently dropped fifth item is invisible loss.
 */
export function practicalErrors(fm: Record<string, unknown>, file: string): string[] {
  const raw = fm.practical;
  if (raw === undefined) return [];
  const errors: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    errors.push(`${file}: practical must be an object when present`);
    return errors;
  }
  const block = raw as { variant?: unknown; items?: unknown };
  if (typeof block.variant !== "string" || !(PRACTICAL_VARIANTS as readonly string[]).includes(block.variant)) {
    errors.push(`${file}: practical.variant must be one of ${PRACTICAL_VARIANTS.join(", ")}`);
  }
  if (!Array.isArray(block.items) || block.items.length < 1 || block.items.length > 4) {
    errors.push(`${file}: practical.items must hold 1-4 items`);
    return errors;
  }

  // Every source_url has to be grounded in a citation this file already
  // carries, so the block can never send a reader somewhere the edition itself
  // never cited.
  const cited = new Set<string>();
  for (const source of Array.isArray(fm.sources) ? fm.sources : []) {
    const url = (source as { url?: unknown } | null)?.url;
    if (typeof url === "string") cited.add(url);
  }
  for (const item of Array.isArray(fm.wire) ? fm.wire : []) {
    const url = (item as { url?: unknown } | null)?.url;
    if (typeof url === "string") cited.add(url);
  }

  const titles = new Set<string>();
  for (const [index, candidate] of block.items.entries()) {
    const at = `${file}: practical.items[${index}]`;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      errors.push(`${at} must be an object`);
      continue;
    }
    const item = candidate as Record<string, unknown>;
    const title = item.title;
    const body = item.body;
    const sourceUrl = item.source_url;
    if (typeof item.kind !== "string" || !(PRACTICAL_KINDS as readonly string[]).includes(item.kind)) {
      errors.push(`${at}.kind must be one of ${PRACTICAL_KINDS.join(", ")}`);
    }
    if (typeof title !== "string" || title.trim() === "") errors.push(`${at}.title is required`);
    if (typeof body !== "string" || body.trim() === "") errors.push(`${at}.body is required`);
    if (typeof sourceUrl !== "string" || !sourceUrl.startsWith("https://")) {
      errors.push(`${at}.source_url must be an https URL`);
    } else if (!cited.has(sourceUrl)) {
      errors.push(`${at}.source_url ${sourceUrl} is not cited in this file's sources or wire`);
    }
    // The row is already a link; a URL spelled out in the prose is a second,
    // unclickable one.
    for (const [field, value] of [["title", title], ["body", body]] as const) {
      if (typeof value === "string" && /https?:\/\//i.test(value)) {
        errors.push(`${at}.${field} must not contain a URL`);
      }
    }
    if (typeof title === "string") {
      const key = title.trim().toLowerCase();
      if (titles.has(key)) errors.push(`${at}.title duplicates an earlier practical item`);
      titles.add(key);
    }
  }
  return errors;
}

export function translationStructureErrors(entries: Array<{ file: string; fm: ArticleFrontmatter }>): string[] {
  const errors: string[] = [];
  const bySlug = new Map<string, Array<{ file: string; fm: ArticleFrontmatter }>>();
  for (const entry of entries) bySlug.set(entry.fm.slug, [...(bySlug.get(entry.fm.slug) ?? []), entry]);
  for (const [slug, variants] of bySlug) {
    if (variants.length < 2) continue;
    const baseline = variants[0];
    if (!baseline) continue;
    const sourceUrls = baseline.fm.sources.map((source) => source.url).sort().join("|");
    const digest = baseline.fm.digest?.covered_slugs.join("|") ?? "";
    const tags = baseline.fm.tags.slice().sort().join("|");
    const correctionShape = (baseline.fm.corrections ?? []).map((correction) => `${correction.date}:${correction.section ?? ""}`).join("|");
    for (const variant of variants.slice(1)) {
      if (variant.fm.date !== baseline.fm.date) errors.push(`${variant.file}: translation date differs for ${slug}`);
      if (variant.fm.sources.map((source) => source.url).sort().join("|") !== sourceUrls) errors.push(`${variant.file}: translation source URLs drift for ${slug}`);
      if ((variant.fm.digest?.covered_slugs.join("|") ?? "") !== digest) errors.push(`${variant.file}: translation digest linkage drifts for ${slug}`);
      if (variant.fm.tags.slice().sort().join("|") !== tags) errors.push(`${variant.file}: translation topic/tag linkage drifts for ${slug}`);
      if ((variant.fm.type ?? "daily") !== (baseline.fm.type ?? "daily")) errors.push(`${variant.file}: translation issue type drifts for ${slug}`);
      if (variant.fm.signal_strength !== baseline.fm.signal_strength) errors.push(`${variant.file}: translation signal strength drifts for ${slug}`);
      if ((variant.fm.corrections ?? []).map((correction) => `${correction.date}:${correction.section ?? ""}`).join("|") !== correctionShape) errors.push(`${variant.file}: translation correction linkage drifts for ${slug}`);
      if ((baseline.fm.schema_version === 2 || variant.fm.schema_version === 2) && (baseline.fm.translation_of !== slug || variant.fm.translation_of !== slug)) errors.push(`${variant.file}: schema v2 translations must link through translation_of=${slug}`);
    }
  }
  return errors;
}
