// Shared maths for rendering the signal-strength segment bar, used by
// the SignalStrength component and the article OpenGraph image.
export const SIGNAL_BARS = 12;

export function signalBars(
  value: number,
  bars: number = SIGNAL_BARS,
): { clamped: number; filled: number; bars: number } {
  const clamped = Math.max(0, Math.min(100, value));
  const filled = Math.round((clamped / 100) * bars);
  return { clamped, filled, bars };
}
