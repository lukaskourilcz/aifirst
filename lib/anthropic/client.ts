import Anthropic from "@anthropic-ai/sdk";

export { MODELS } from "./models.js";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    // Optional gateway/proxy override (ANTHROPIC_BASE_URL) — lets you route the
    // pipeline through an Anthropic-compatible gateway for cost caps, caching
    // or fallback without touching call sites. Unset = talk to Anthropic
    // directly, exactly as before. (Offloading cheap utility-tier calls to
    // Groq / Google AI Studio / OpenRouter is a larger change — see NEEDED.md.)
    const baseURL = process.env.ANTHROPIC_BASE_URL?.trim();
    client = new Anthropic(baseURL ? { apiKey, baseURL } : { apiKey });
  }
  return client;
}
