import type { UsageLine } from "./types";
import { calculateUsageCost } from "./pricing";

export type AnthropicUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

export function anthropicUsageLine(model: string, stage: string, usage: AnthropicUsage): UsageLine {
  const line: UsageLine = {
    provider: "anthropic",
    model,
    stage,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheWriteTokens: usage.cache_creation_input_tokens ?? 0,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
  };
  const cost = calculateUsageCost(line);
  return cost ? { ...line, cost } : line;
}
