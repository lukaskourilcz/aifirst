import { permanentRedirect } from "next/navigation";
import { localePath, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-static";

// Radar was folded into Topics before launch; its topic lists were the only
// part left once the Watchlist, cooling topics, timeline and AI Pulse went.
// Every older URL that pointed at it lands on /topics.
export default async function StatsCompatibility({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  permanentRedirect(localePath(lang, "/topics"));
}
