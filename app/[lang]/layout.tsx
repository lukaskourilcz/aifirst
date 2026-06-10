import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { Footer } from "@/components/Footer";
import { KeyboardHelp } from "@/components/KeyboardHelp";
import { HtmlLang } from "@/components/HtmlLang";
import { LOCALES, isLocale } from "@/lib/i18n/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
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
      <Masthead locale={lang} />
      <main>{children}</main>
      <Footer locale={lang} />
      <KeyboardHelp locale={lang} />
    </>
  );
}
