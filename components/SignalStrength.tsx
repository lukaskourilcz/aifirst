import { signalBars } from "@/lib/helpers/signal";

type Props = { value: number; label?: string };

export function SignalStrength({ value, label = "signal" }: Props) {
  const { clamped, filled, bars } = signalBars(value);
  return (
    <div
      className="signal-strength"
      aria-label={`${label}: ${clamped}/100`}
    >
      <span className="signal-strength__label">{label}</span>
      <span className="signal-strength__meter" aria-hidden>
        {Array.from({ length: bars }, (_, i) => (
          <span
            key={i}
            className="signal-strength__segment"
            data-filled={i < filled ? "true" : undefined}
          />
        ))}
      </span>
      <span className="signal-strength__value">{String(clamped).padStart(2, "0")}</span>
    </div>
  );
}
