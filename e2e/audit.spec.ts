import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";

// Audit: walk through every public route at 3 viewports, screenshot it, and
// flag layouts where the visible content occupies less than 60% of the viewport
// height (visual "dead space" — a feed page that ends mid-fold reads
// unprofessional). Output a brief JSON report.

const ROUTES = [
  "/",
  "/archive",
  "/tags",
  "/sources",
  "/glossary",
  "/colophon",
  "/health",
  "/stats",
  "/trends",
];

const OUT_DIR = path.join(process.cwd(), "audit-screens");

type Finding = {
  route: string;
  viewport: string;
  documentHeight: number;
  viewportHeight: number;
  fillRatio: number;
  shellMainBottom: number | null;
  note?: string;
};

const findings: Finding[] = [];

test.beforeAll(async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
});

test.afterAll(async () => {
  const path = `${OUT_DIR}/findings.json`;
  await fs.writeFile(path, JSON.stringify(findings, null, 2));
  console.log(`\nAudit report: ${path}\nFindings:\n` + JSON.stringify(findings.filter((f) => f.fillRatio < 1 || f.note), null, 2));
});

async function probe(page: Page, route: string, viewport: string) {
  await page.goto(route, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const main = document.querySelector(".shell__main");
    const mainRect = main?.getBoundingClientRect();
    return {
      documentHeight: doc.scrollHeight,
      viewportHeight: window.innerHeight,
      shellMainBottom: mainRect ? mainRect.bottom + window.scrollY : null,
    };
  });
  const fillRatio = metrics.documentHeight / metrics.viewportHeight;
  const finding: Finding = {
    route,
    viewport,
    ...metrics,
    fillRatio,
  };
  if (fillRatio < 1) {
    finding.note = "page shorter than the viewport — looks empty below the fold";
  }
  findings.push(finding);
  const safeName = route.replace(/[\/]/g, "_") || "_root";
  await page.screenshot({
    path: `${OUT_DIR}/${viewport}${safeName}.png`,
    fullPage: true,
  });
}

for (const route of ROUTES) {
  test(`audit desktop ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await probe(page, route, "desktop");
    expect(true).toBe(true);
  });
  test(`audit tablet ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await probe(page, route, "tablet");
    expect(true).toBe(true);
  });
  test(`audit mobile ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await probe(page, route, "mobile");
    expect(true).toBe(true);
  });
}
