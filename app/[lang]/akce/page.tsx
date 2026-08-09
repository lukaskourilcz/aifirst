import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { RightRail } from "@/components/editorial/RightRail";
import { listArticles } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import {
  byScope,
  eventDateBlock,
  eventPlace,
  loadEvents,
  splitByAnchor,
  type EventScope,
  type MagazineEvent,
} from "@/lib/events";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).sections;
  return { title: t.eventsTitle, alternates: localeAlternates(lang, "/akce") };
}

function EventRow({ event, locale, past }: { event: MagazineEvent; locale: Locale; past?: boolean }) {
  const t = dict(locale).sections;
  const block = eventDateBlock(event.starts);
  const place = eventPlace(event);
  const detail = [event.price, event.organizer].filter(Boolean).join(" · ");

  return (
    <li className={past ? "event event--past" : "event"}>
      <a href={event.url} target="_blank" rel="noopener noreferrer" className="event__link">
        <span aria-hidden className="event__date">
          <span className="event__day">{block.day}</span>
          <span className="event__month">{block.month}</span>
        </span>
        <span className="event__body">
          <span className="event__title">{event.title}</span>
          {place ? <span className="event__place">{place}</span> : null}
          {/* An unknown price is omitted, never guessed and never dashed. */}
          {detail ? <span className="event__detail">{detail}</span> : null}
        </span>
        <span aria-hidden className="event__arrow">↗</span>
        <span className="sr-only">
          {" "}
          <time dateTime={event.starts}>{event.starts}</time> {t.opensInNewWindow}
        </span>
      </a>
    </li>
  );
}

function Scope({
  id,
  heading,
  upcoming,
  past,
  locale,
}: {
  id: string;
  heading: string;
  upcoming: MagazineEvent[];
  past: MagazineEvent[];
  locale: Locale;
}) {
  const t = dict(locale).sections;
  return (
    <section id={id} className="event-scope">
      <h2 className="event-scope__heading">{heading}</h2>
      {upcoming.length === 0 ? (
        <p className="empty-line">{t.eventsEmpty}</p>
      ) : (
        <ul className="events">
          {upcoming.map((event) => (
            <EventRow key={event.id} event={event} locale={locale} />
          ))}
        </ul>
      )}
      {past.length > 0 ? (
        <details className="events-past">
          <summary>
            {t.eventsPast} ({past.length})
          </summary>
          <ul className="events">
            {past.map((event) => (
              <EventRow key={event.id} event={event} locale={locale} past />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

export default async function EventsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).sections;
  const r = dict(locale).rail;

  const articles = await listArticles(locale);
  const anchor = articles[0]?.date ?? "1970-01-01";
  const { upcoming, past } = splitByAnchor(loadEvents(), anchor);

  const scopes: Array<{ id: string; scope: EventScope; heading: string }> = [
    { id: "cesko", scope: "cz", heading: t.eventsCz },
    { id: "svet", scope: "global", heading: t.eventsWorld },
  ];

  return (
    <div className="page-with-rail">
      <div className="page-with-rail__main">
        <PageShell kicker={r.events} title={t.eventsTitle}>
          {/* Stacked sections with anchor navigation, not tabs: real static
              HTML that works with zero JavaScript, keeps both scopes in the
              page for find-in-page and print, and gives each a linkable URL. */}
          <nav className="scope-nav" aria-label={t.eventsScope}>
            {scopes.map((s) => (
              <a key={s.id} href={`#${s.id}`}>{s.heading}</a>
            ))}
          </nav>

          {scopes.map((s) => (
            <Scope
              key={s.id}
              id={s.id}
              heading={s.heading}
              upcoming={byScope(upcoming, s.scope)}
              past={byScope(past, s.scope)}
              locale={locale}
            />
          ))}
        </PageShell>
      </div>
      <RightRail locale={locale} dateKey={articles[0]?.date} events={upcoming} />
    </div>
  );
}
