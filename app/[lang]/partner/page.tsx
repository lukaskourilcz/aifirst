import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { PartnerRateCard, type PartnerFormat } from "@/components/editorial/PartnerRateCard";
import { bannerInventory, bannerSlot } from "@/lib/banner";
import { listArticles } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localeAlternates } from "@/lib/i18n/metadata";
import { SPONSOR_BLOCK_SLOT, partnerBooking, partnerPackages, partnerVatNote } from "@/lib/partner";
import { loadSources } from "@/lib/sources";
import { loadTopicsConfig, publishedTopics } from "@/lib/topics/config";
import { czechDisplayDate } from "@/lib/weeks";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).partner;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/partner") };
}

/** `728×90 / 320×100`, or the single size when both creatives are the same shape. */
function creativeSize(slotId: string): string | null {
  const slot = bannerSlot(slotId);
  if (slot === null) return null;
  const desktop = `${slot.desktop.width}×${slot.desktop.height}`;
  const mobile = `${slot.mobile.width}×${slot.mobile.height}`;
  return desktop === mobile ? desktop : `${desktop} / ${mobile}`;
}

/**
 * The rate card a partner can act on.
 *
 * Everything on it is either committed configuration or a count taken from
 * published content at build time. The inventory rows are read back out of
 * `config/banner.json` through `bannerSlot`, so the sizes and the sold/free
 * state on this page are the same values the reader surfaces render from and
 * cannot drift from them. There is no traffic figure anywhere, because the site
 * measures none, and the page says so rather than leaving the omission to be
 * noticed.
 */
export default async function PartnerPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const d = dict(locale);
  const t = d.partner;

  const [articles, sources, topicsConfig] = await Promise.all([
    listArticles("cs"),
    loadSources(),
    loadTopicsConfig(),
  ]);
  const oldest = articles.at(-1);

  const formats: PartnerFormat[] = [
    ...bannerInventory().slots.map((slot) => {
      const size = creativeSize(slot.id);
      return { id: slot.id, size, state: size === null ? ("free" as const) : ("taken" as const) };
    }),
    { id: SPONSOR_BLOCK_SLOT, size: null, state: "per-edition" as const },
  ];

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <PartnerRateCard
        locale={locale}
        packages={partnerPackages()}
        booking={partnerBooking()}
        formats={formats}
        vatNote={partnerVatNote()}
        reach={{
          editions: articles.length,
          since: oldest ? czechDisplayDate(oldest.date) : d.common.unavailable,
          sources: sources.length,
          topics: publishedTopics(topicsConfig, articles).length,
        }}
      />
    </PageShell>
  );
}
