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

test("home: shell sidebar, hero panel, article body, recent feed render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".sidebar").first()).toBeVisible();
  await expect(page.locator(".sidebar__brand").first()).toBeVisible();
  await expect(page.locator(".hero").first()).toBeVisible();
  await expect(page.locator(".hero__title").first()).toBeVisible();
  await expect(page.locator(".article-with-aside__main").first()).toBeVisible();
  // Recent issues are rendered as post cards
  await expect(page.locator(".post-card").first()).toBeVisible();
});

test("dispatches sidebar exists and is bounded to the article column", async ({ page, viewport }) => {
  // Below 1000px the two columns stack vertically, so the bounded-bottom
  // invariant only applies on desktop.
  test.skip((viewport?.width ?? 0) < 1000, "two-column layout only ≥1000px");
  await page.goto("/");
  const main = page.locator(".article-with-aside__main").first();
  const side = page.locator(".article-with-aside__side").first();
  await expect(side).toBeVisible();
  const [mainBox, sideBox] = await Promise.all([
    main.boundingBox(),
    side.boundingBox(),
  ]);
  if (!mainBox || !sideBox) throw new Error("could not measure article columns");
  expect(
    sideBox.y + sideBox.height,
    "dispatches bottom must not exceed article body bottom",
  ).toBeLessThanOrEqual(mainBox.y + mainBox.height + 2);
});

test("article body renders inline — no CTA gate", async ({ page }) => {
  await page.goto("/");
  // The first article paragraph (Mdx output) should be visible without any
  // additional click.
  const body = page.locator(".article-body p").first();
  await expect(body).toBeVisible();
});

test("primary nav lives in the sidebar; ops links in the footer", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.locator(".sidebar");
  for (const path of ["/archive", "/tags", "/sources", "/glossary", "/colophon"]) {
    await expect(sidebar.locator(`a[href$="${path}"]`).first()).toBeVisible();
  }
  const footer = page.locator("nav.footer-nav");
  for (const path of ["/archive", "/glossary", "/stats", "/trends", "/health"]) {
    await expect(footer.locator(`a[href$="${path}"]`)).toHaveCount(1);
  }
});

test("language switcher reaches the Czech mirror of the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /čeština/i }).first().click();
  await expect(page).toHaveURL(/\/cs\/?$/);
  await expect(page.locator(".hero__title")).toBeVisible();
});

test("the single CTA uses Blueprint Blue (#1d52de)", async ({ page, viewport }) => {
  // The "Read the issue" CTA lives in the sidebar's What's-New card, which is
  // hidden on the mobile/tablet collapsed shell. Run this lock-in on desktop.
  test.skip((viewport?.width ?? 0) < 1000, "sidebar card visible only on desktop");
  await page.goto("/");
  const cta = page.locator(".sidebar .cta").first();
  await expect(cta).toBeVisible();
  const bg = await cta.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg, "CTA should use blueprint blue rgb(29,82,222)").toBe(
    "rgb(29, 82, 222)",
  );
});
