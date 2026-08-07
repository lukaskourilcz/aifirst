import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { listArticles } from "@/lib/content";
import { loadAiLessons, revealedLessons } from "@/lib/lessons";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localeAlternates } from "@/lib/i18n/metadata";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).daily;
  return {
    title: t.lessonsTitle,
    description: t.lessonsMetaDescription,
    alternates: localeAlternates(lang, "/lekce"),
  };
}

// The same date the Today page uses, so both surfaces agree on which term is
// today's. Only the date is needed, so the summaries are enough — no article
// body is read.
async function leadDate(locale: Locale): Promise<string | undefined> {
  const articles = await listArticles(locale);
  const lead = articles.find((article) => (article.type ?? "daily") === "daily") ?? articles[0];
  return lead?.date;
}

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).daily;
  const { groups, todayIndex, count } = revealedLessons(await leadDate(locale));
  // How much of the curriculum is out, as machine metadata rather than prose.
  const total = loadAiLessons().entries.length;

  return (
    <PageShell
      kicker={`${count} / ${total}`}
      title={t.lessonsTitle}
      intro={t.lessonsIntro}
    >
      {groups.map((group) => {
        const label = locale === "cs" ? group.label.cs : group.label.en;
        return (
          <section key={group.key} className="lesson-group">
            <h2 className="lesson-group__title">{label}</h2>
            <div className="table-scroll" tabIndex={0} role="region" aria-label={label}>
              <table className="lesson-table">
                <caption className="sr-only">{label}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.term}</th>
                    <th scope="col">{t.description}</th>
                  </tr>
                </thead>
                <tbody>
                  {group.lessons.map(({ entry, index, revealedOn }) => {
                    const text = locale === "cs" ? entry.cs : entry.en;
                    return (
                      <tr key={entry.id}>
                        <th scope="row">
                          <span className="lesson-table__term">{entry.term}</span>
                          <span className="lesson-table__meta">
                            {t.revealedOn}{" "}
                            <time dateTime={revealedOn}>{revealedOn}</time>
                            {index === todayIndex ? (
                              <span className="lesson-table__today"> · {t.today}</span>
                            ) : null}
                          </span>
                        </th>
                        <td className="lesson-table__description">{text.full}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </PageShell>
  );
}
