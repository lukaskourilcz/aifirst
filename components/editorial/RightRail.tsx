import Link from "next/link";
import type { ReactNode } from "react";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { AdPlaceholder } from "./BannerSlot";
import { DailyLesson } from "./DailyLesson";
import { DidYouKnow } from "./DidYouKnow";
import { eventDateBlock, type MagazineEvent } from "@/lib/events";

/**
 * The shared module frame. The rail is a column of rules, not a stack of
 * boxes: only the ad reservation has a box, which is what marks it as the one
 * thing in the rail that is not editorial.
 */
export function WidgetModule({
  kicker,
  headingId,
  children,
  action,
}: {
  kicker: string;
  /** Renders the kicker as the section's h2 and labels the region with it. */
  headingId?: string;
  children: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <section className="rail-module" aria-labelledby={headingId}>
      {headingId ? (
        <h2 id={headingId} className="rail-module__kicker">{kicker}</h2>
      ) : (
        <p className="rail-module__kicker">{kicker}</p>
      )}
      {children}
      {action ? (
        <p className="rail-module__action">
          <Link href={action.href}>{action.label} →</Link>
        </p>
      ) : null}
    </section>
  );
}

/** The next two events, or nothing at all when there are none. */
export function EventsTeaser({ events, locale }: { events: MagazineEvent[]; locale: Locale }) {
  const t = dict(locale).sections;
  const next = events.slice(0, 2);
  if (next.length === 0) return null;

  return (
    <WidgetModule
      kicker={t.upcomingEvents}
      action={{ href: localePath(locale, "/akce"), label: t.allEvents }}
    >
      <ul className="rail-events">
        {next.map((event) => {
          const block = eventDateBlock(event.starts);
          return (
            <li key={event.id}>
              <span className="rail-events__date">
                {block.day} {block.month}
              </span>
              <span className="rail-events__title">{event.title}</span>
            </li>
          );
        })}
      </ul>
    </WidgetModule>
  );
}

export function SubscribeModule({ locale }: { locale: Locale }) {
  const t = dict(locale).sections;
  const d = dict(locale);
  return (
    <WidgetModule kicker={t.subscribe}>
      <p className="rail-module__body">{t.subscribeBody}</p>
      <p className="rail-module__action">
        <a href={localePath(locale, "/feed.xml")}>{d.common.atomFeed} ↗</a>
      </p>
    </WidgetModule>
  );
}

/**
 * The right rail. It drops below 1280 and its modules reflow into the main
 * column in this same order, which is why the order lives here and not in each
 * page.
 */
export function RightRail({
  locale,
  dateKey,
  events,
}: {
  locale: Locale;
  dateKey?: string;
  events: MagazineEvent[];
}) {
  return (
    <aside className="right-rail">
      <AdPlaceholder locale={locale} />
      {dateKey ? (
        <>
          <DailyLesson dateKey={dateKey} locale={locale} variant="rail" />
          <DidYouKnow dateKey={dateKey} locale={locale} variant="rail" />
        </>
      ) : null}
      <EventsTeaser events={events} locale={locale} />
      <SubscribeModule locale={locale} />
    </aside>
  );
}
