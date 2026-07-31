import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { githubRepo } from "@/lib/config";
import { loadSources } from "@/lib/sources";
import { loadBoardChangelog } from "@/lib/board";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).about;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/about") };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).about;
  const [sources, changelog] = await Promise.all([loadSources(), loadBoardChangelog()]);
  const sections = [
    ["problem", t.problemTitle, t.problemBody],
    ["methodology", t.methodTitle, t.methodBody],
    ["automation", t.automationTitle, t.automationBody],
    ["models", t.modelsTitle, t.modelsBody],
    ["sources", t.sourcesTitle, t.sourcesBody],
    ["editorial", t.editorialTitle, t.editorialBody],
    ["corrections-policy", t.correctionsTitle, t.correctionsBody],
    ["human-review", t.reviewTitle, t.reviewBody],
    ["cost", t.costTitle, t.costBody],
    ["static-architecture", t.staticTitle, t.staticBody],
    ["accessibility", t.privacyTitle, t.privacyBody],
    ["sponsorship", t.sponsorshipTitle, t.sponsorshipBody],
  ] as const;
  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <dl className="about-stats">
        <div><dt>{t.registeredSources}</dt><dd>{String(sources.length).padStart(2, "0")}</dd></div>
        <div><dt>{t.runtimeCalls}</dt><dd className="about-stats__ok">0</dd></div>
        <div><dt>{t.languages}</dt><dd>EN / CS</dd></div>
        <div><dt>{t.publishes}</dt><dd>06:00 UTC</dd></div>
      </dl>
      <div className="about-sections">
        {sections.map(([id, title, body], index) => <section id={id} key={id}><span className="label" aria-hidden>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}
        <section id="board-changelog">
          <span className="label" aria-hidden>{String(sections.length + 1).padStart(2, "0")}</span>
          <div>
            <h2>{t.changelogTitle}</h2>
            {changelog.length ? (
              <ol className="board-changelog">
                {changelog.map((entry) => (
                  <li key={`${entry.date}-${entry.meetingUrl}`}>
                    <time dateTime={entry.date}>{entry.date}</time>
                    <span>{entry.summary[locale]}</span>
                    <a href={entry.meetingUrl} target="_blank" rel="noreferrer noopener">{t.changelogMeeting} ↗</a>
                  </li>
                ))}
              </ol>
            ) : <p>{t.changelogEmpty}</p>}
          </div>
        </section>
      </div>
      <nav aria-label={locale === "cs" ? "Transparentnost" : "Transparency"} className="trust-links">
        <Link href={localePath(locale, "/sources")}>{t.sourceDirectory} →</Link>
        <Link href={localePath(locale, "/corrections")}>{t.corrections} →</Link>
        <Link href={localePath(locale, "/glossary")}>{dict(locale).nav.glossary} →</Link>
        <a href={`https://github.com/${githubRepo()}`} target="_blank" rel="noreferrer noopener">{t.repository} ↗</a>
      </nav>
    </PageShell>
  );
}
