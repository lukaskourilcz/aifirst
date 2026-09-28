import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A small module in a side column (Pojem dne, Prakticky): the 2 px ink rule,
 * a section label, the body, and an optional link.
 */
export function WidgetModule({
  kicker,
  headingId,
  children,
  action,
}: {
  kicker: string;
  /** Renders the kicker as the section's h2 and labels the region with it. */
  headingId?: string;
  children: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <section className="rail-module" aria-labelledby={headingId}>
      {headingId ? (
        <h2 id={headingId} className="rail-module__kicker">{kicker}</h2>
      ) : (
        <p className="rail-module__kicker">{kicker}</p>
      )}
      {children}
      {action ? (
        <p className="rail-module__action">
          <Link href={action.href}>{action.label}&nbsp;→</Link>
        </p>
      ) : null}
    </section>
  );
}
