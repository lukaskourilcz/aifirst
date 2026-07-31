import { readBoardContext } from "@/lib/board";
import type { Locale } from "@/lib/i18n/config";

export async function MakingOf({ date, locale }: { date: string; locale: Locale }) {
  const context = await readBoardContext(date);
  if (!context || context.status !== "edition") return null;
  const copy = locale === "cs"
    ? { heading: "Jak vydání vzniklo", why: "Proč právě tento příběh", argument: "Přečíst diskusi", cost: "Náklady na toto vydání" }
    : { heading: "How this edition was made", why: "Why this story", argument: "Read the argument", cost: "This edition cost" };
  return (
    <aside className="making-of" aria-labelledby={`making-of-${date}`}>
      <p className="label" id={`making-of-${date}`}>{copy.heading}</p>
      <p><strong>{copy.why}:</strong> {context.whyThisStory}</p>
      <p>
        <a href={context.roomUrl} target="_blank" rel="noreferrer noopener">{copy.argument} ↗</a>
        {context.generationCostUsd !== undefined ? (
          <span>{locale === "cs" ? `${copy.cost} $${context.generationCostUsd.toFixed(2)}.` : `${copy.cost} $${context.generationCostUsd.toFixed(2)} to produce.`}</span>
        ) : null}
      </p>
    </aside>
  );
}
