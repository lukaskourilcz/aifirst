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

// Parsed once at module scope. The lesson set is an ordered daily curriculum
// with a reveal date per entry, which is a different contract from
// `glossary.yml`'s reference list. The two coexist and are not cross-wired.
const lessons = raw as DatasetFile;

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
