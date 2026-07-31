import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020, { type AnySchema } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";

const contractNames = [
  "calendar",
  "edition-package",
  "idea-ledger",
  "meeting-email",
  "meeting-record",
  "social-pack",
] as const;

type ContractName = (typeof contractNames)[number];

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await fs.readFile(path.join(process.cwd(), "contracts", file), "utf8")) as unknown;
}

async function validator(name: ContractName) {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    formats: { base64: true, date: true, "date-time": true, uri: true },
  });
  return ajv.compile(await readJson(`${name}.schema.json`) as AnySchema);
}

describe("shared delivery contracts", () => {
  it.each(contractNames)("accepts the %s golden fixture", async (name) => {
    const validate = await validator(name);
    expect(validate(await readJson(`fixtures/${name}.valid.json`)), JSON.stringify(validate.errors)).toBe(true);
  });

  it.each(contractNames)("rejects the %s poison fixture", async (name) => {
    const validate = await validator(name);
    expect(validate(await readJson(`fixtures/${name}.poison.json`))).toBe(false);
  });
});
