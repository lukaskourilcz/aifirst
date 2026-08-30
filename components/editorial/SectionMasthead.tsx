import Link from "next/link";

/**
 * The masthead every section on the front page sits under: a mono kicker, a
 * 2px rule, and an optional action on the right.
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
}: {
  kicker: string;
  id?: string;
  action?: { href: string; label: string };
  heading?: boolean;
}) {
  const Kicker = heading ? "h2" : "p";
  return (
    <div className="masthead">
      <Kicker id={id} className="masthead__kicker">{kicker}</Kicker>
      {action ? (
        <Link href={action.href} className="masthead__action">
          {action.label} →
        </Link>
      ) : null}
    </div>
  );
}
