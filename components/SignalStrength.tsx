import { signalBars } from "@/lib/helpers/signal";

type Props = { value: number; label?: string };

export function SignalStrength({ value, label = "signal" }: Props) {
  const { clamped, filled, bars } = signalBars(value);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-display)",
        fontSize: "0.72rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--ink-muted)",
      }}
      aria-label={`signal strength ${clamped} of 100`}
    >
      <span>{label}</span>
      <span style={{ display: "inline-flex", gap: 2 }} aria-hidden>
        {Array.from({ length: bars }, (_, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 4,
              height: 12,
              background:
                i < filled
                  ? i < bars - 3
                    ? "var(--accent-cyan)"
                    : "var(--accent-magenta)"
                  : "var(--bg-elev)",
              boxShadow:
                i < filled ? "0 0 6px rgba(92, 240, 255, 0.55)" : "none",
            }}
          />
        ))}
      </span>
      <span style={{ color: "var(--ink-primary)" }}>{String(clamped).padStart(2, "0")}</span>
    </div>
  );
}
