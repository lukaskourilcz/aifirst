import type { Money, UsageLine } from "./types";

export type TokenPricing = {
  input: number;
  output: number;
  cacheWrite5m: number;
  cacheRead: number;
};

// USD per million tokens. Reverified against Anthropic's live official pricing
// documentation on 2026-07-21. Unknown models deliberately remain unpriced.
export const PRICING_VERSION = "anthropic-2026-07-21";
export const PRICING_SOURCE = "https://platform.claude.com/docs/en/about-claude/pricing";

export const TOKEN_PRICING: Record<string, TokenPricing> = {
  "claude-opus-4-7": { input: 5, output: 25, cacheWrite5m: 6.25, cacheRead: 0.5 },
  "claude-sonnet-4-6": { input: 3, output: 15, cacheWrite5m: 3.75, cacheRead: 0.3 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5, cacheWrite5m: 1.25, cacheRead: 0.1 },
};

export function calculateUsageCost(line: UsageLine): Money | null {
  const pricing = TOKEN_PRICING[line.model];
  if (!pricing || line.inputTokens === undefined || line.outputTokens === undefined) return null;
  const amount = (
    line.inputTokens * pricing.input +
    line.outputTokens * pricing.output +
    (line.cacheWriteTokens ?? 0) * pricing.cacheWrite5m +
    (line.cacheReadTokens ?? 0) * pricing.cacheRead
  ) / 1_000_000;
  return { amount: Number(amount.toFixed(8)), currency: "USD" };
}

export function totalUsageCost(lines: UsageLine[]): Money | null {
  if (lines.length === 0 || lines.some((line) => !line.cost)) return null;
  return {
    amount: Number(lines.reduce((sum, line) => sum + (line.cost?.amount ?? 0), 0).toFixed(8)),
    currency: "USD",
  };
}
