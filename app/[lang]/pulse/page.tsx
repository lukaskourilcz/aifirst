import { permanentRedirect } from "next/navigation";
import { localePath, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-static";

// AI Pulse was deleted before launch: live prices and npm counts are not
// editorial content. The URL keeps resolving.
export default async function PulseCompatibility({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  permanentRedirect(localePath(lang, "/radar"));
}
