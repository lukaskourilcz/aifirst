import { permanentRedirect } from "next/navigation";
import { localePath, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-static";
export const metadata = { robots: { index: false } };

export default async function TagsCompatibility({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  permanentRedirect(localePath(lang, "/archive"));
}
