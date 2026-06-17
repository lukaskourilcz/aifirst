import type { ReactNode } from "react";

type Props = {
  // Small uppercase line above the title.
  kicker: string;
  title: ReactNode;
  // Optional muted intro paragraph rendered between the title and `children`.
  // Pass `children` instead when a page needs a non-standard intro.
  intro?: ReactNode;
  // Kicker colour: "cyan" (default, the .label--accent style) or "magenta"
  // (the admin console).
  kickerTone?: "cyan" | "magenta";
  children?: ReactNode;
};

// The standard chrome every secondary page opens with: a padded `.container`
// section, an uppercase kicker, the page title, and an optional intro. Index
// and listing pages render their body as `children`.
export function PageShell({
  kicker,
  title,
  intro,
  kickerTone = "cyan",
  children,
}: Props) {
  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p
        className={kickerTone === "cyan" ? "label label--accent" : "label"}
        style={
          kickerTone === "magenta"
            ? { color: "var(--accent-magenta)", marginBottom: 8 }
            : undefined
        }
      >
        {kicker}
      </p>
      <h1>{title}</h1>
      {intro != null && (
        <p
          style={{
            color: "var(--ink-muted)",
            maxWidth: "62ch",
            marginBottom: "3em",
          }}
        >
          {intro}
        </p>
      )}
      {children}
    </section>
  );
}
