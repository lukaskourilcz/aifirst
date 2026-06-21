import { test, expect, type Page } from "@playwright/test";

// Every static route the masthead exposes, plus both locales of the home.
const ROUTES = [
  "/",
  "/en",
  "/archive",
  "/en/archive",
  "/tags",
  "/sources",
  "/glossary",
  "/colophon",
  "/health",
  "/search",
];

// Collect any console errors during the test so we can fail loudly if the
// page logs even one — that's almost always a real regression (hydration
// mismatch, missing dict key, broken image, etc.).
function attachConsoleProbe(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// Anything wider than the viewport is a horizontal-overflow bug; magazine
// layouts often regress here on mobile when a long URL or an unbreakable
// monospace heading slips through.
async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  expect(
    overflow.scrollWidth,
    `horizontal overflow: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

for (const route of ROUTES) {
  test(`renders ${route} cleanly`, async ({ page }) => {
    const errors = attachConsoleProbe(page);
    const resp = await page.goto(route, { waitUntil: "networkidle" });
    expect(resp?.status(), `non-200 on ${route}`).toBeLessThan(400);

    // Every public route must have an h1 — otherwise a11y/SEO is broken.
    await expect(page.locator("h1").first()).toBeVisible();

    await assertNoHorizontalOverflow(page);

    expect(errors, `console errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });
}

test("home: cover, TOC, and back-issues all render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".home-cover__title")).toBeVisible();
  await expect(page.locator(".home-cover__art")).toBeVisible();
  await expect(page.locator(".home-contents__link").first()).toBeVisible();
  // The home page should always link to /archive somewhere in the layout.
  await expect(page.getByRole("link", { name: /archiv/i }).first()).toBeVisible();
});

test("home: TOC anchor scrolls to the briefing section", async ({ page }) => {
  await page.goto("/");
  await page.locator(`.home-contents__link[href="#briefing"]`).click();
  await expect(page.locator("#briefing")).toBeInViewport();
});

test("light theme is the default; toggling flips to dark and persists", async ({ page }) => {
  await page.goto("/");
  // Default = no data-mode attribute = light.
  await expect(page.locator("html")).not.toHaveAttribute("data-mode", "dark");

  await page.getByRole("button", { name: /switch to dark mode/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");

  // Toggle back so subsequent tests start clean.
  await page.getByRole("button", { name: /switch to light mode/i }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-mode", "dark");
});

test("masthead no longer links to /stats or /trends", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`a[href$="/stats"]`)).toHaveCount(0);
  await expect(page.locator(`a[href$="/trends"]`)).toHaveCount(0);
});

test("language switcher reaches the English mirror of the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /english/i }).first().click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator(".home-cover__title")).toBeVisible();
});
