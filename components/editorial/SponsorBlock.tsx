import type { Sponsor } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

/**
 * The sponsor block an edition may carry in its frontmatter. It is the only
 * paid unit that is not a banner slot, and it is labelled the same way: a
 * visible label above the block, the magazine's own word for paid placement as
 * the region's accessible name, and `rel="sponsored"` on the destination.
 */
export function SponsorBlock({ sponsor, locale }: { sponsor?: Sponsor; locale: Locale }) {
  if (!sponsor) return null;
  // The visible label is the sponsor's own wording; the accessible name is the
  // magazine's, so the region is announced consistently whatever an edition
  // writes there.
  const t = dict(locale).article;
  return (
    <aside className="sponsor-block" aria-label={`${t.sponsored}: ${sponsor.name}`}>
      <p className="label">{sponsor.label}</p>
      {sponsor.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sponsor.image} alt={sponsor.image_alt ?? sponsor.name} loading="lazy" />
      ) : null}
      <div>
        <strong>{sponsor.name}</strong>
        <p>{sponsor.copy}</p>
        <a href={sponsor.url} target="_blank" rel="sponsored noreferrer noopener">{sponsor.name} ↗</a>
      </div>
    </aside>
  );
}
