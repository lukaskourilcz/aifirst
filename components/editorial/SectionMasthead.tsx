import Link from "next/link";

/**
 * The module head every block sits under: a 2px ink rule, a Grotesk section
 * label, an optional action on the right and an optional one-line serif note
 * saying what the module is.
 *
 * Sections previously each carried their own heading treatment — a subheading
 * with a hairline for the week feed, a bare mono kicker for the Briefs and
 * Watchlist columns, another for the article aside. One masthead is what turns
 * a stack of blocks into a composed page.
 *
 * `id` pairs with a section's `aria-labelledby`, so the kicker renders as the
 * section's `h2` by default. Set `heading={false}` where the surrounding
 * markup already labels the region and a second heading would only add noise
 * to the outline.
 */
export function SectionMasthead({
  kicker,
  id,
  action,
  heading = true,
  note,
}: {
  kicker: string;
  id?: string;
  action?: { href: string; label: string };
  heading?: boolean;
  note?: string;
}) {
  const Kicker = heading ? "h2" : "p";
  return (
    <>
      <div className="module-head">
        <Kicker id={id} className="label module-head__label">{kicker}</Kicker>
        {action ? (
          <Link href={action.href} className="module-head__action">
            {action.label}&nbsp;→
          </Link>
        ) : null}
      </div>
      {note ? <p className="module-head__note">{note}</p> : null}
    </>
  );
}
