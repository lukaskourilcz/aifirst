import type { Sponsor } from "@/lib/content";

export function SponsorBlock({ sponsor }: { sponsor?: Sponsor }) {
  if (!sponsor) return null;
  return (
    <aside className="sponsor-block" aria-label={sponsor.label}>
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
