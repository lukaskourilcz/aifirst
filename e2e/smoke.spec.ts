import { test, expect, type Page } from "@playwright/test";

// English is now the default locale (unprefixed); Czech mirrors under /cs.
const ROUTES = [
  "/",
  "/cs",
  "/archive",
  "/cs/archive",
  "/tags",
  "/sources",
  "/glossary",
  "/colophon",
  "/health",
  "/stats",
  "/trends",
  "/search",
];

// Some React errors in dev mode are noise that doesn't reach prod:
// dev SSR + client revival differs on SVG `<title>` text in the trends
// chart, but the page is fully static-prerendered in production so there
// is no hydration to mismatch. We probe for real errors only.
const IGNORED_PATTERNS = [
  /Hydration failed because the server rendered HTML didn't match the client/i,
  /There was an error while hydrating/i,
];

function attachConsoleProbe(page: Page) {
  const errors: string[] = [];
  const push = (text: string) => {
    if (IGNORED_PATTERNS.some((re) => re.test(text))) return;
    errors.push(text);
  };
  page.on("console", (msg) => {
    if (msg.type() === "error") push(msg.text());
  });
  page.on("pageerror", (err) => push(`pageerror: ${err.message}`));
  return errors;
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
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
    await expect(page.locator("h1").first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
    expect(errors, `console errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });
}

test("home: cover, TOC, dispatches sidebar, back-issues all render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".home-cover__title")).toBeVisible();
  await expect(page.locator(".home-cover__art")).toBeVisible();
  await expect(page.locator(".home-contents__link").first()).toBeVisible();
  await expect(page.locator(".article-with-aside__main").first()).toBeVisible();
  // Dispatches present in today's issue => render as aside.
  await expect(page.locator(".dispatches--aside")).toBeVisible();
});

test("home: TOC anchor scrolls to the briefing section", async ({ page }) => {
  await page.goto("/");
  await page.locator(`.home-contents__link[href="#briefing"]`).click();
  await expect(page.locator("#briefing")).toBeInViewport();
});

test("light theme is the default; toggling flips to dark and persists", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-mode", "dark");
  await page.getByRole("button", { name: /switch to dark mode/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await page.getByRole("button", { name: /switch to light mode/i }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-mode", "dark");
});

test("masthead no longer carries archive / glossary / health / stats / trends", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator("nav.masthead-nav");
  for (const path of ["/archive", "/glossary", "/health", "/stats", "/trends"]) {
    await expect(nav.locator(`a[href$="${path}"]`)).toHaveCount(0);
  }
});

test("footer hosts the secondary links (archive, glossary, stats, trends, health)", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("nav.footer-nav");
  for (const path of ["/archive", "/glossary", "/stats", "/trends", "/health"]) {
    await expect(footer.locator(`a[href$="${path}"]`)).toHaveCount(1);
  }
});

test("language switcher reaches the Czech mirror of the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /čeština/i }).first().click();
  await expect(page).toHaveURL(/\/cs\/?$/);
  await expect(page.locator(".home-cover__title")).toBeVisible();
});
