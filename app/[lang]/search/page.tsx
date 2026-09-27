import { permanentRedirect } from "next/navigation";
import { localePath, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-static";

// The search page was a second copy of the archive list. Search itself is the
// palette (⌘K, /), available on every page; the URL lands on the Archive.
export default async function SearchCompatibility({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  permanentRedirect(localePath(lang, "/archive"));
}
