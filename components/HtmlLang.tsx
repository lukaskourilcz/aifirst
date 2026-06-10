"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

// Root <html> is rendered by the locale-agnostic root layout, so we set
// the active language on the client once the locale is known.
export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
