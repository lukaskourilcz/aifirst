import type { ReactNode } from "react";

type Props = {
  // Small uppercase line above the title.
  kicker: ReactNode;
  title: ReactNode;
  // Optional muted intro paragraph rendered between the title and `children`.
  // Pass `children` instead when a page needs a non-standard intro.
  intro?: ReactNode;
  // The alternate tone is reserved for operator-adjacent and warning surfaces.
  kickerTone?: "primary" | "warning";
  children?: ReactNode;
};

// The standard chrome every secondary page opens with: a padded `.container`
// section, an uppercase kicker, the page title, and an optional intro. Index
// and listing pages render their body as `children`.
export function PageShell({
  kicker,
  title,
  intro,
  kickerTone = "primary",
  children,
}: Props) {
  return (
    <section className="container page-shell">
      <header className="page-header">
        <p className={`label page-kicker page-kicker--${kickerTone}`}>{kicker}</p>
        <h1 className="page-title">{title}</h1>
        {intro != null ? <p className="page-intro">{intro}</p> : null}
      </header>
      <div className="page-content">{children}</div>
    </section>
  );
}
