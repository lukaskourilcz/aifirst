#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import { DeliveryError, materializeEditionPackage } from "../lib/delivery/edition-package.js";

async function main() {
  const packageFile = process.argv[2];
  if (!packageFile) throw new Error("usage: pnpm consume:edition <package.json> [repository-root]");
  const root = path.resolve(process.argv[3] ?? process.cwd());
  const value = JSON.parse(await fs.readFile(path.resolve(packageFile), "utf8")) as unknown;
  const result = await materializeEditionPackage(value, root);
  console.log(JSON.stringify(result));
}

main().catch((error) => {
  if (error instanceof DeliveryError) console.error(`[delivery:${error.code}] ${error.message}`);
  else console.error(`[delivery:schema_invalid] ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
});
