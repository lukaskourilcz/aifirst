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

// What a reader needs from an About page: what the magazine covers, how it
// picks, how it treats sources and mistakes, and what it does with their
// attention. How an edition is produced is not a reader-facing subject, and
// the run record that used to live here is operator data.
export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).about;
  const sections = [
    ["problem", t.problemTitle, t.problemBody],
    ["methodology", t.methodTitle, t.methodBody],
    ["sources", t.sourcesTitle, t.sourcesBody],
    ["editorial", t.editorialTitle, t.editorialBody],
    ["corrections-policy", t.correctionsTitle, t.correctionsBody],
    ["accessibility", t.privacyTitle, t.privacyBody],
    ["sponsorship", t.sponsorshipTitle, t.sponsorshipBody],
  ] as const;

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <div className="about-sections">
        {sections.map(([id, title, body], index) => (
          <section id={id} key={id}>
            <span className="label" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </section>
        ))}
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
