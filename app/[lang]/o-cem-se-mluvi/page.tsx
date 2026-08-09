import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { RightRail } from "@/components/editorial/RightRail";
import { listArticles } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { loadEvents, splitByAnchor } from "@/lib/events";
import { czechRelativeDate, groupStreamByDay, loadStream, type StreamItem } from "@/lib/streams";
import { czechNumericDate, czechWeekday } from "@/lib/weeks";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).sections;
  return { title: t.talkedTitle, description: t.talkedIntro, alternates: localeAlternates(lang, "/o-cem-se-mluvi") };
}

// The badge is the platform's first letter on a plain plate. No favicons and no
// scraped assets: nothing on this page fetches anything from the source.
const MONOGRAM: Record<string, string> = {
  medium: "M",
  substack: "S",
  blog: "B",
  youtube: "Y",
  rss: "R",
};

function Card({ item, locale, anchor }: { item: StreamItem; locale: Locale; anchor: string }) {
  const t = dict(locale).sections;
  const relative = czechRelativeDate(item.published, anchor, czechNumericDate);
  // Stream titles are quoted, not written, and are frequently English. The lang
  // attribute is what makes a screen reader switch voice for them.
  const foreign = /[a-z]/i.test(item.title) && !/[áčďéěíňóřšťúůýž]/i.test(item.title);

  return (
    <li className="link-card">
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="link-card__link">
        <span className="link-card__head">
          <span aria-hidden className="link-card__monogram">
            {MONOGRAM[item.source.kind] ?? item.source.name.charAt(0).toUpperCase()}
          </span>
          <span className="link-card__source">{item.source.name}</span>
          <span aria-hidden className="link-card__arrow">↗</span>
        </span>
        <span className="link-card__title" {...(foreign ? { lang: "en" } : {})}>
          {item.title}
        </span>
        <span className="link-card__meta">
          {item.author ? (
            <>
              {item.author}
              <span aria-hidden> · </span>
            </>
          ) : null}
          {relative}
        </span>
        {item.summary ? <span className="link-card__summary">{item.summary}</span> : null}
        <span className="sr-only">{t.opensInNewWindow}</span>
      </a>
    </li>
  );
}

export default async function TalkedAboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).sections;
  const r = dict(locale).rail;

  const articles = await listArticles(locale);
  const anchor = articles[0]?.date ?? "1970-01-01";
  const days = groupStreamByDay(loadStream("talked-about"));
  const { upcoming } = splitByAnchor(loadEvents(), anchor);

  return (
    <div className="page-with-rail">
      <div className="page-with-rail__main">
        <PageShell kicker={r.talked} title={t.talkedTitle} intro={t.talkedIntro}>
          {days.length === 0 ? (
            <p className="empty-line">{t.talkedEmpty}</p>
          ) : (
            days.map((day) => (
              <section key={day.date} className="day-group">
                <h2 className="day-group__label">
                  {czechWeekday(day.date)}
                  <span aria-hidden> · </span>
                  <time dateTime={day.date}>{czechNumericDate(day.date)}</time>
                </h2>
                <ul className="link-cards">
                  {day.items.map((item) => (
                    <Card key={item.id} item={item} locale={locale} anchor={anchor} />
                  ))}
                </ul>
              </section>
            ))
          )}
        </PageShell>
      </div>
      <RightRail locale={locale} dateKey={articles[0]?.date} events={upcoming} />
    </div>
  );
}
