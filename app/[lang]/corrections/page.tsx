import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { listCorrections } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).corrections;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/corrections") };
}

export default async function CorrectionsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const t = dict(locale).corrections;
  const corrections = await listCorrections(locale);
  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      {corrections.length ? (
        <ol className="corrections-notice">
          {corrections.map((correction) => (
            <li key={`${correction.article.slug}-${correction.date}-${correction.description}`}>
              <time dateTime={correction.date}>{correction.date}</time>
              <span><Link href={localePath(locale, `/articles/${correction.article.slug}`)}>{correction.article.title}</Link> — {correction.description}</span>
            </li>
          ))}
        </ol>
      ) : <p>{t.empty}</p>}
    </PageShell>
  );
}
