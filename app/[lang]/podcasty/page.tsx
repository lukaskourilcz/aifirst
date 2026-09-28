import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { czechDuration, groupStreamByDay, loadStream, type StreamItem } from "@/lib/streams";
import { czechNumericDate, czechWeekday } from "@/lib/weeks";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).sections;
  return { title: t.podcastsTitle, alternates: localeAlternates(lang, "/podcasty") };
}

const PLATFORMS = [
  ["youtube", "YouTube"],
  ["spotify", "Spotify"],
  ["apple", "Apple"],
  ["rss", "RSS"],
] as const;

// Rows rather than cards: an episode is a list item, and the platform links
// need horizontal room. The row is not one link, so it raises no hover fill.
function Episode({ item, locale }: { item: StreamItem; locale: Locale }) {
  const t = dict(locale).sections;
  const duration = czechDuration(item.durationSec);
  const links = PLATFORMS.filter(([key]) => item.links?.[key]);

  return (
    <li className="episode">
      {item.show ? <p className="episode__show">{item.show}</p> : null}
      <h3 className="episode__title">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
          <span className="sr-only"> {t.opensInNewWindow}</span>
        </a>
      </h3>
      <p className="episode__meta">
        {/* An unknown length is omitted outright: no dash, no "unknown". */}
        {duration ? (
          <>
            {duration}
            <span aria-hidden> · </span>
          </>
        ) : null}
        <time dateTime={item.published}>{czechNumericDate(item.published)}</time>
      </p>
      {links.length > 0 ? (
        <p className="episode__links">
          {links.map(([key, label]) => (
            <a key={key} href={item.links?.[key]} target="_blank" rel="noopener noreferrer">
              {label}
              <span aria-hidden> ↗</span>
              <span className="sr-only"> {t.opensInNewWindow}</span>
            </a>
          ))}
        </p>
      ) : null}
    </li>
  );
}

export default async function PodcastsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).sections;

  const days = groupStreamByDay(loadStream("podcasts"));

  return (
    <div className="list-page">
      <div>
        <PageShell kicker={t.podcastsKicker} title={t.podcastsTitle}>
          {days.length === 0 ? (
            <p className="empty-line">{t.podcastsEmpty}</p>
          ) : (
            days.map((day) => (
              <section key={day.date} className="day-group">
                <h2 className="day-group__label">
                  {czechWeekday(day.date)}
                  <span aria-hidden> · </span>
                  <time dateTime={day.date}>{czechNumericDate(day.date)}</time>
                </h2>
                <ul className="episodes">
                  {day.items.map((item) => (
                    <Episode key={item.id} item={item} locale={locale} />
                  ))}
                </ul>
              </section>
            ))
          )}
        </PageShell>
      </div>
    </div>
  );
}
