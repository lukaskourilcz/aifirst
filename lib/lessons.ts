import raw from "@/data/ai-lessons.json";
import {
  type DatasetCategory,
  type DatasetEntry,
  type DatasetFile,
  dailyIndex,
  effectiveDateKey,
  revealDate,
  revealedCount,
} from "./daily";
import { czechTypography } from "./typography";

// Parsed once at module scope. The lesson set is an ordered daily curriculum
// with a reveal date per entry, which is a different contract from
// `glossary.yml`'s reference list. The two coexist and are not cross-wired.
// Czech first where Czech has an established term, with the English one the
// reader will meet in the sources kept in brackets. Display only: the dataset
// is append-only and its entries are never edited (data/README.md), so the
// upstream writer should adopt these terms for new entries.
const CZECH_TERMS: Record<string, string> = {
  "Machine learning": "Strojové učení (machine learning)",
  "Neural network": "Neuronová síť (neural network)",
  Parameters: "Parametry (parameters)",
  Pretraining: "Předtrénování (pretraining)",
  "Context window": "Kontextové okno (context window)",
  Attention: "Pozornost (attention)",
  Hallucination: "Halucinace (hallucination)",
  Dataset: "Datová sada (dataset)",
  Multimodal: "Multimodální model (multimodal)",
  "Tool calling": "Volání nástrojů (tool calling)",
  Quantization: "Kvantizace (quantization)",
  "Chain of thought": "Řetězec úvah (chain of thought)",
  "Data labeling": "Anotace dat (data labeling)",
  Temperature: "Teplota (temperature)",
  "Open weights": "Otevřené váhy (open weights)",
  Distillation: "Destilace (distillation)",
  "Vector database": "Vektorová databáze (vector database)",
  "In-context learning": "Učení z kontextu (in-context learning)",
  "Reasoning model": "Uvažující model (reasoning model)",
  "Scaling laws": "Škálovací zákony (scaling laws)",
  "Synthetic data": "Syntetická data (synthetic data)",
  Overfitting: "Přeučení (overfitting)",
  Backpropagation: "Zpětné šíření chyby (backpropagation)",
  "Mixture of experts": "Směs expertů (mixture of experts)",
  "Diffusion model": "Difuzní model (diffusion model)",
  "Data center": "Datové centrum (data center)",
  "Per-token pricing": "Cena za token (per-token pricing)",
  Compute: "Výpočetní výkon (compute)",
};

// Czech glosses are typeset once here (quotes, dashes, non-breaking spaces);
// the committed JSON stays as delivered.
const typesetEntry = (entry: DatasetEntry): DatasetEntry => ({
  ...entry,
  term: entry.term === undefined ? undefined : czechTypography(CZECH_TERMS[entry.term] ?? entry.term),
  cs: { ...entry.cs, short: czechTypography(entry.cs.short), full: czechTypography(entry.cs.full) },
});
const lessons: DatasetFile = { ...(raw as DatasetFile), entries: (raw as DatasetFile).entries.map(typesetEntry) };

export type RevealedLesson = { entry: DatasetEntry; index: number; revealedOn: string };

export type LessonGroup = {
  key: string;
  label: DatasetCategory;
  lessons: RevealedLesson[];
};

export function loadAiLessons(): DatasetFile {
  return lessons;
}

/**
 * The lesson belonging to a publication date. Missing or pre-anchor dates
 * clamp to the anchor, so the returned `dateKey` is the one the pick used.
 */
export function lessonOfTheDay(dateKey: string | undefined): {
  entry: DatasetEntry;
  index: number;
  dateKey: string;
} {
  const resolved = effectiveDateKey(lessons.anchor, dateKey);
  const index = dailyIndex(lessons.anchor, resolved, lessons.entries.length);
  const entry = lessons.entries[index];
  if (entry === undefined) throw new Error("ai-lessons.json has no entries");
  return { entry, index, dateKey: resolved };
}

/**
 * Every lesson revealed up to and including `dateKey`, grouped by category in
 * the order the file's `categories` map declares. Categories with nothing
 * revealed yet are omitted rather than rendered empty.
 */
export function revealedLessons(dateKey: string | undefined): {
  groups: LessonGroup[];
  todayIndex: number;
  count: number;
} {
  const resolved = effectiveDateKey(lessons.anchor, dateKey);
  const count = revealedCount(lessons.anchor, resolved, lessons.entries.length);
  const todayIndex = dailyIndex(lessons.anchor, resolved, lessons.entries.length);

  const revealed: RevealedLesson[] = lessons.entries
    .slice(0, count)
    .map((entry, index) => ({ entry, index, revealedOn: revealDate(lessons.anchor, index) }));

  const groups = Object.entries(lessons.categories)
    .map(([key, label]) => ({
      key,
      label,
      lessons: revealed.filter((item) => item.entry.category === key),
    }))
    .filter((group) => group.lessons.length > 0);

  return { groups, todayIndex, count };
}
