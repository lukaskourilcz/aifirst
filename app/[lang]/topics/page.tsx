import { permanentRedirect } from "next/navigation";
import { localePath, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-static";

// The topic card grid was retired in round 2: the five sections are the
// navigation, and the archive lists everything. The URL keeps resolving.
export default async function TopicsCompatibility({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  permanentRedirect(localePath(lang, "/archive"));
}
