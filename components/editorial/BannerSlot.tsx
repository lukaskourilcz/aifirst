import { bannerSlot } from "@/lib/banner";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

/**
 * The one configured creative, in the right rail. Local files with explicit
 * dimensions, so a filled slot causes no layout shift; an empty slot renders
 * nothing and reserves no space.
 *
 * The label is config: „Vlastní projekt" while the creative is the owner's own
 * project, the default „Partner" for a paying advertiser.
 */
export function BannerSlot({ id, locale }: { id: string; locale: Locale }) {
  const slot = bannerSlot(id);
  if (slot === null) return null;
  const label = slot.label ?? dict(locale).daily.partnerLabel;

  return (
    <aside className="banner-slot" aria-label={`${label}: ${slot.advertiser}`}>
      <p className="meta banner-slot__label">{label}</p>
      <a
        href={slot.href}
        rel="sponsored noopener noreferrer"
        target="_blank"
        className="banner-slot__link"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slot.desktop.src}
          alt={slot.alt}
          width={slot.desktop.width}
          height={slot.desktop.height}
          loading="lazy"
          decoding="async"
          className="banner-slot__creative banner-slot__creative--desktop"
        />
        {/* Same alt on both: `display: none` drops the hidden one from the
            accessibility tree, so exactly one is ever announced. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slot.mobile.src}
          alt={slot.alt}
          width={slot.mobile.width}
          height={slot.mobile.height}
          loading="lazy"
          decoding="async"
          className="banner-slot__creative banner-slot__creative--mobile"
        />
      </a>
    </aside>
  );
}
