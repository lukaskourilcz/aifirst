import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// The "AI Pulse" dataset: model pricing + intelligence, provider service
// status, and npm package momentum. Produced by scripts/refresh-pulse.ts in
// the daily pipeline and committed to public/data/pulse.json; the /pulse page
// reads it synchronously at build via loadPulse(). Mirrors the read pattern in
// lib/og.ts — cached in module scope, guarded, never throws at render.

export type PulseModel = {
  id: string;
  name: string;
  provider: string;
  inputPrice: number | null; // USD per 1M input tokens
  outputPrice: number | null; // USD per 1M output tokens
  tfii: number | null; // TensorFeed intelligence index
  tier: string | null;
};

export type PulseService = {
  name: string;
  provider: string;
  status: string; // "operational" | "degraded" | "down" | …
};

export type PulsePackage = {
  name: string;
  total: number; // sum of downloads over the window
  series: number[]; // daily downloads, oldest → newest
};

export type Pulse = {
  generatedAt: string;
  modelsUpdated: string | null;
  models: PulseModel[];
  services: PulseService[];
  packages: PulsePackage[];
};

let cached: Pulse | null | undefined;

export function loadPulse(): Pulse | null {
  if (cached !== undefined) return cached;
  const file = path.join(process.cwd(), "public", "data", "pulse.json");
  if (!existsSync(file)) {
    cached = null;
    return cached;
  }
  try {
    cached = JSON.parse(readFileSync(file, "utf8")) as Pulse;
  } catch {
    cached = null;
  }
  return cached;
}
