import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  // Font size of the value; defaults to the common tile, the stats grid uses
  // a larger one.
  valueSize?: string;
  // Inner padding; the stats grid uses a roomier 20.
  padding?: number;
};

// A bordered tile showing a label above a large cyan number/value. Shared by
// the stats grid, the source detail header and the colophon counts.
export function StatCard({
  label,
  value,
  valueSize = "1.8rem",
  padding = 16,
}: Props) {
  return (
    <div
      style={{
        padding,
        border: "1px solid var(--hairline)",
        background: "var(--bg-deep)",
      }}
    >
      <p className="label" style={{ marginBottom: 6 }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: valueSize,
          margin: 0,
          color: "var(--accent-cyan)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}
