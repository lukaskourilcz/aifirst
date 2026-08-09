import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { AIPulse } from "@/components/AIPulse";
import { IssueRow } from "@/components/IssueRow";
import { PageShell } from "@/components/PageShell";
import { Wire } from "@/components/Wire";
import { buildRadar } from "@/lib/radar";
import { loadPulse } from "@/lib/pulse";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).radar;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/radar") };
}

function TopicBars({ rows, locale }: { rows: Awaited<ReturnType<typeof buildRadar>>["rising"]; locale: Locale }) {
  const max = Math.max(1, ...rows.map((row) => row.recent));
  return rows.length ? (
    <ul className="radar-bars">
      {rows.map((row) => (
        <li key={row.tag}>
          <Link href={localePath(locale, `/tags/${encodeURIComponent(row.tag)}`)}>{row.tag}</Link>
          <span className="radar-bar" aria-hidden><span style={{ "--radar-width": `${Math.round((row.recent / max) * 100)}%` } as CSSProperties} /></span>
          <span className="label">{row.recent} · {row.delta > 0 ? "+" : ""}{row.delta}</span>
        </li>
      ))}
    </ul>
  ) : <p>{dict(locale).radar.noData}</p>;
}

export default async function RadarPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).radar;
  const [radar, pulse] = await Promise.all([buildRadar(locale), Promise.resolve(loadPulse())]);
  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <div className="split-2 radar-overview">
        <section><h2>{t.rising}</h2><TopicBars rows={radar.rising} locale={locale} /></section>
        <section><h2>{t.recurring}</h2><TopicBars rows={radar.recurring} locale={locale} /></section>
      </div>
      {radar.watchlist.length ? <section className="route-section"><Wire items={radar.watchlist} locale={locale} /></section> : null}
      {radar.cooled.length ? <section className="route-section"><h2>{t.cooled}</h2><TopicBars rows={radar.cooled} locale={locale} /></section> : null}
      {pulse ? <section className="route-section"><h2>{t.pulse}</h2><AIPulse pulse={pulse} locale={locale} /></section> : null}
      <section className="route-section">
        <h2>{t.timeline}</h2>
        <ul className="dense-list">{radar.timeline.map((article) => <IssueRow key={article.slug} href={localePath(locale, `/articles/${article.slug}`)} date={article.date} title={article.title} variant="meta" />)}</ul>
      </section>
    </PageShell>
  );
}
