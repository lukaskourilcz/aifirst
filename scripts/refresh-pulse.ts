// Refreshes public/data/pulse.json for the /pulse page: AI model pricing +
// intelligence (TensorFeed), provider service status (TensorFeed), and npm
// package momentum (npm registry). All sources are keyless. Resilient by
// design: any section that fails to fetch is simply omitted, and the script
// only skips writing if literally nothing was collected — so a flaky API never
// breaks the daily job. Run via `pnpm pulse:refresh`.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { request } from "undici";
import type {
  Pulse,
  PulseModel,
  PulseService,
  PulsePackage,
} from "../lib/pulse.js";

// npm packages whose download momentum we chart. Recognisable AI SDKs/libs.
const TRACKED_PACKAGES = [
  "openai",
  "@anthropic-ai/sdk",
  "ai",
  "langchain",
  "@huggingface/transformers",
  "@google/generative-ai",
];
const MAX_MODELS = 8;
const MAX_SERVICES = 8;

type TfModel = {
  id?: string;
  name?: string;
  inputPrice?: number;
  outputPrice?: number;
  tier?: string;
  intelligence?: { tfii?: number };
};
type TfProvider = { name?: string; models?: TfModel[] };
type TfModelsResponse = { lastUpdated?: string; providers?: TfProvider[] };

type TfService = { name?: string; provider?: string; status?: string };
type TfStatusResponse = { services?: TfService[] };

type NpmRange = {
  package?: string;
  downloads?: Array<{ downloads?: number; day?: string }>;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const { statusCode, body } = await request(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { accept: "application/json" },
    });
    if (statusCode >= 400) {
      console.warn(`[pulse] ${url} -> ${statusCode}`);
      return null;
    }
    return (await body.json()) as T;
  } catch (err) {
    console.warn(`[pulse] ${url}: ${(err as Error).message}`);
    return null;
  }
}

async function collectModels(): Promise<{
  models: PulseModel[];
  updated: string | null;
}> {
  const data = await getJson<TfModelsResponse>("https://tensorfeed.ai/api/models");
  if (!data) return { models: [], updated: null };
  const flat: PulseModel[] = [];
  for (const provider of data.providers ?? []) {
    for (const m of provider.models ?? []) {
      if (!m.id || !m.name) continue;
      flat.push({
        id: m.id,
        name: m.name,
        provider: provider.name ?? "",
        inputPrice: typeof m.inputPrice === "number" ? m.inputPrice : null,
        outputPrice: typeof m.outputPrice === "number" ? m.outputPrice : null,
        tfii: typeof m.intelligence?.tfii === "number" ? m.intelligence.tfii : null,
        tier: m.tier ?? null,
      });
    }
  }
  // Highest intelligence first (models without a score sink to the bottom).
  flat.sort((a, b) => (b.tfii ?? -1) - (a.tfii ?? -1));
  return { models: flat.slice(0, MAX_MODELS), updated: data.lastUpdated ?? null };
}

async function collectServices(): Promise<PulseService[]> {
  const data = await getJson<TfStatusResponse>("https://tensorfeed.ai/api/status");
  if (!data) return [];
  const out: PulseService[] = [];
  for (const s of data.services ?? []) {
    if (!s.name) continue;
    out.push({
      name: s.name,
      provider: s.provider ?? "",
      status: s.status ?? "unknown",
    });
  }
  return out.slice(0, MAX_SERVICES);
}

async function collectPackages(): Promise<PulsePackage[]> {
  const results = await Promise.all(
    TRACKED_PACKAGES.map(async (name) => {
      const data = await getJson<NpmRange>(
        `https://api.npmjs.org/downloads/range/last-month/${name}`,
      );
      if (!data?.downloads?.length) return null;
      const series = data.downloads.map((d) => d.downloads ?? 0);
      const total = series.reduce((sum, n) => sum + n, 0);
      return { name, total, series } satisfies PulsePackage;
    }),
  );
  return results.filter((p): p is PulsePackage => p !== null);
}

async function main(): Promise<void> {
  const [{ models, updated }, services, packages] = await Promise.all([
    collectModels(),
    collectServices(),
    collectPackages(),
  ]);

  if (!models.length && !services.length && !packages.length) {
    console.error("[pulse] all sources failed; leaving existing data untouched");
    process.exitCode = 0;
    return;
  }

  const pulse: Pulse = {
    generatedAt: new Date().toISOString(),
    modelsUpdated: updated,
    models,
    services,
    packages,
  };

  const dir = path.join(process.cwd(), "public", "data");
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "pulse.json"),
    JSON.stringify(pulse, null, 2) + "\n",
  );
  console.error(
    `[pulse] wrote ${models.length} models, ${services.length} services, ${packages.length} packages`,
  );
}

main().catch((err) => {
  console.error(`[pulse] fatal: ${(err as Error).message}`);
  process.exitCode = 1;
});
