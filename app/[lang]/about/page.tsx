import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";
import { githubRepo } from "@/lib/config";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).about;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/about") };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).about;
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
  ] as const;
  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      {sections.map(([id, title, body]) => <section id={id} key={id} style={{ marginTop: 48, maxWidth: "72ch" }}><h2>{title}</h2><p>{body}</p></section>)}
      <nav aria-label={locale === "cs" ? "Transparentnost" : "Transparency"} style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 48 }}>
        <Link href={localePath(locale, "/sources")}>{t.sourceDirectory} →</Link>
        <Link href={localePath(locale, "/corrections")}>{t.corrections} →</Link>
        <Link href={localePath(locale, "/glossary")}>{dict(locale).nav.glossary} →</Link>
        <a href={`https://github.com/${githubRepo()}`} target="_blank" rel="noreferrer noopener">{t.repository} ↗</a>
      </nav>
    </PageShell>
  );
}
