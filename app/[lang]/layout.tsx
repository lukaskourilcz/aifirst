import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { Footer } from "@/components/Footer";
import { KeyboardHelp } from "@/components/KeyboardHelp";
import { HtmlLang } from "@/components/HtmlLang";
import { LOCALES, isLocale, localePath, resolveLocale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  // Per-locale Atom autodiscovery for every page in this tree.
  return {
    alternates: {
      types: { "application/atom+xml": localePath(locale, "/feed.xml") },
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <HtmlLang locale={lang} />
      <a className="skip-link" href="#main-content">{dict(lang).common.skipToContent}</a>
      <Masthead locale={lang} />
      <main className="site-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={lang} />
      <KeyboardHelp locale={lang} />
    </>
  );
}
