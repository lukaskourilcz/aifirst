import { bannerPlaceholder, bannerSlot } from "@/lib/banner";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

/**
 * The reserved 300×250 box. Fixed in both axes at every viewport, so a later
 * creative replaces the inner node and the rail does not move a pixel. It is
 * the only boxed thing in the rail, which is what marks it as not editorial.
 */
export function AdPlaceholder({ locale }: { locale: Locale }) {
  const t = dict(locale).ads;
  return (
    <aside className="ad-slot" aria-label={t.region}>
      <div className="ad-slot__box">
        <span>{t.slot}</span>
      </div>
    </aside>
  );
}

/**
 * A partner belt reserved after the completion mark — the back page of the
 * edition, where a partner cannot dilute the briefing. 728×90 desktop and
 * 320×100 mobile are IAB standard sizes, so a future creative is a drop-in
 * local file.
 *
 * Renders nothing and reserves no space while the slot is empty. When it is
 * filled, both images carry explicit dimensions and the page is still static,
 * so the belt causes no layout shift.
 */
export function BannerSlot({ id, locale }: { id: string; locale: Locale }) {
  const slot = bannerSlot(id);
  // An empty slot either reserves its box or renders nothing at all. Which one
  // is config, so the belt keeps collapsing while the rail square holds space.
  if (slot === null) return bannerPlaceholder(id) ? <AdPlaceholder locale={locale} /> : null;
  const t = dict(locale).daily;

  return (
    <aside className="banner-slot" aria-label={`${t.partnerLabel}: ${slot.advertiser}`}>
      <p className="banner-slot__label">{t.partnerLabel}</p>
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
