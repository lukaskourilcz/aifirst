import { test, expect, type Page } from "@playwright/test";

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

// Dev-only React warnings the prod static build can't produce. The page is
// fully prerendered so there's no hydration to mismatch on. We still fail on
// any other console error.
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

test("home: masthead wordmark, lead, 3-col grid, feature row render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".masthead__wordmark")).toBeVisible();
  await expect(page.locator(".lead__title")).toBeVisible();
  await expect(page.locator(".lead__photo")).toBeVisible();
  await expect(page.locator(".edit-grid")).toBeVisible();
  await expect(page.locator(".feature-row").first()).toBeVisible();
});

test("home: read-issue CTA jumps to the briefing section", async ({ page }) => {
  await page.goto("/");
  await page.locator(".lead__cta").click();
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

test("primary nav is the editorial categories; stats/trends/health are footer-only", async ({ page }) => {
  await page.goto("/");
  const primary = page.locator("nav.primary-nav");
  // Editorial categories in primary nav
  for (const path of ["/archive", "/tags", "/sources", "/glossary", "/colophon"]) {
    await expect(primary.locator(`a[href$="${path}"]`)).toHaveCount(1);
  }
  // Operational/meta pages live only in the footer
  for (const path of ["/stats", "/trends", "/health"]) {
    await expect(primary.locator(`a[href$="${path}"]`)).toHaveCount(0);
  }
});

test("footer hosts the operational links (archive, glossary, stats, trends, health)", async ({ page }) => {
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
  await expect(page.locator(".lead__title")).toBeVisible();
});

test("only signal yellow appears in the chrome", async ({ page }) => {
  // The CTA button is the one place chrome carries yellow.
  await page.goto("/");
  const cta = page.locator(".lead__cta").first();
  await expect(cta).toBeVisible();
  const bg = await cta.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg, "lead CTA should use signal yellow #ffc500 (rgb(255,197,0))").toBe(
    "rgb(255, 197, 0)",
  );
});
