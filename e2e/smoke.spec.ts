import { test, expect, type Page } from "@playwright/test";

const ROUTES = [
  "/",
  "/cs",
  "/archive",
  "/cs/archive",
  "/topics",
  "/cs/topics",
  "/radar",
  "/weekly",
  "/about",
  "/corrections",
  "/sources",
  "/glossary",
  "/health",
  "/search",
  "/articles/2026-07-05-deepmind-blitz-anthropic-reckoning/print",
  "/cs/articles/2026-07-05-deepmind-blitz-anthropic-reckoning/print",
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
    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(resp?.status(), `non-200 on ${route}`).toBeLessThan(400);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await assertNoHorizontalOverflow(page);
    expect(errors, `console errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });
}

test("home: shell sidebar, hero panel, article body, recent feed render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".sidebar")).toBeVisible();
  await expect(page.locator(".sidebar__brand")).toBeVisible();
  await expect(page.locator(".hero")).toBeVisible();
  await expect(page.locator(".hero__title")).toBeVisible();
  await expect(page.locator(".article-with-aside__main")).toBeVisible();
  await expect(
    page.locator(".publication-data").getByText("Human reviewed", { exact: true }),
  ).toHaveCount(0);
  // Recent issues are rendered as post cards
  const postCards = page.locator(".post-card");
  expect(await postCards.count()).toBeGreaterThan(0);
  await expect(postCards.nth(0)).toBeVisible();
});

test("dispatches sidebar exists and is bounded to the article column", async ({ page, viewport }) => {
  // Below 1000px the two columns stack vertically, so the bounded-bottom
  // invariant only applies on desktop.
  test.skip((viewport?.width ?? 0) < 1000, "two-column layout only ≥1000px");
  await page.goto("/");
  const main = page.locator(".article-with-aside__main");
  const side = page.locator(".article-with-aside__side");
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
  const paragraphs = page.locator(".article-body p");
  expect(await paragraphs.count()).toBeGreaterThan(0);
  const body = paragraphs.nth(0);
  await expect(body).toBeVisible();
});

test("primary nav lives in the sidebar; ops links in the footer", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.locator(".sidebar");
  for (const path of ["/radar", "/topics", "/weekly", "/archive", "/about"]) {
    await expect(sidebar.locator(`a[href$="${path}"]`)).toBeVisible();
  }
  const footer = page.locator("nav.footer-nav");
  for (const path of ["/radar", "/topics", "/weekly", "/archive", "/about", "/corrections", "/glossary", "/sources"]) {
    await expect(footer.locator(`a[href$="${path}"]`)).toHaveCount(1);
  }
  await expect(sidebar.locator('a[href$="/health"], a[href$="/admin"]')).toHaveCount(0);
});

for (const [legacy, current] of [["/stats", "/radar"], ["/trends", "/radar"], ["/tags", "/topics"], ["/colophon", "/about"]] as const) {
  test(`${legacy} permanently resolves to ${current}`, async ({ page }) => {
    await page.goto(legacy);
    await expect(page).toHaveURL(new RegExp(`${current}/?$`));
  });
}

test("issue trust surfaces are semantic and keyboard accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /source ledger|přehled zdrojů/i })).toBeVisible();
  const provenance = page.locator("section.provenance");
  await expect(provenance).toHaveCount(1);
  await expect(provenance.getByRole("heading")).toBeVisible();
  await expect(provenance.getByRole("link")).toBeVisible();
});

test("legacy Czech print query resolves to the static Czech route", async ({ page }) => {
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning/print?lang=cs");
  await expect(page).toHaveURL(/\/cs\/articles\/2026-07-05-deepmind-blitz-anthropic-reckoning\/print$/);
});

test("language switcher reaches the Czech mirror of the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /čeština/i }).click();
  await expect(page).toHaveURL(/\/cs\/?$/);
  await expect(page.locator(".hero__title")).toBeVisible();
});

test("inline links carry the Blueprint Blue (#2f5ae6)", async ({ page }) => {
  await page.goto("/");
  // The first <a> inside .article-body is the heading-anchor link (slate by
  // design); the editorial in-body links come right after.
  const links = page.locator(".article-body a:not(.anchor-link)");
  expect(await links.count()).toBeGreaterThan(0);
  const link = links.nth(0);
  await expect(link).toBeVisible();
  const color = await link.evaluate((el) => getComputedStyle(el).color);
  expect(color, "article links should use blueprint blue rgb(47,90,230)").toBe(
    "rgb(47, 90, 230)",
  );
});

test("the desktop rail exposes the active section and holds 44px targets", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/weekly");
  const active = page.locator('.nav-rail a[aria-current="page"]');
  await expect(active).toHaveAttribute("href", /\/weekly$/);
  // Primary sections are 44px; the secondary group is deliberately 36px and is
  // not a touch surface at this width.
  for (const item of await page.locator(".nav-rail > a.nav-item").all()) {
    const box = await item.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("the rail contains exactly the sections and search, and no status record", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  // Six indexed sections as direct children, six secondary links, one search
  // control, and no status record of any kind.
  await expect(page.locator(".nav-rail > a.nav-item")).toHaveCount(6);
  await expect(page.locator(".nav-rail__secondary a.nav-item")).toHaveCount(6);
  await expect(page.locator(".sidebar-status")).toHaveCount(0);
  await expect(page.locator(".sidebar .nav-item--button")).toHaveCount(1);
});

test("below 960 the drawer replaces the rail and behaves for the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/weekly");

  await expect(page.locator(".sidebar")).toBeHidden();
  const trigger = page.locator(".topbar__trigger");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();
  const drawer = page.locator('[role="dialog"] .drawer');
  await expect(drawer).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".drawer__close")).toBeFocused();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await expect(drawer.locator('[aria-current="page"]')).toHaveAttribute("href", /\/weekly$/);

  for (const item of await page.locator(".drawer__item").all()) {
    const box = await item.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
});

test("the footer social row is named, sized and not yet focusable", async ({ page }) => {
  await page.goto("/");
  const items = page.locator(".social-row__item");
  await expect(items).toHaveCount(4);
  for (const name of ["Facebook", "Instagram", "Threads", "X"]) {
    await expect(page.getByRole("img", { name, exact: true })).toBeVisible();
  }
  for (const item of await items.all()) {
    const box = await item.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  // Placeholders: no destination yet, so nothing focusable and no link.
  await expect(page.locator(".social-row a")).toHaveCount(0);
});

test("skip link and keyboard search work, trap focus, and restore the trigger", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const trigger = page.getByRole("button", { name: /search|hledat/i });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("textbox");
  await expect(input).toBeFocused();
  const dialogLinks = dialog.getByRole("link");
  const dialogLinkCount = await dialogLinks.count();
  expect(dialogLinkCount).toBeGreaterThan(0);
  const lastLink = dialogLinks.nth(dialogLinkCount - 1);
  await lastLink.focus();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("/");
  await expect(page.getByRole("dialog").getByRole("textbox")).toBeFocused();
});

test("topic detail separates latest coverage, timeline and recurring entities", async ({ page }) => {
  await page.goto("/topics/ai-models");
  await expect(page.getByRole("heading", { name: /latest coverage/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^timeline$/i })).toBeVisible();
  const entities = page.getByRole("heading", { name: /recurring entities/i });
  if (await entities.count()) await expect(entities).toBeVisible();
});

test("feeds expose language, entry links, publication time and categories", async ({ request }) => {
  for (const route of ["/feed.xml", "/weekly/feed.xml", "/topics/ai-models/feed.xml"]) {
    const response = await request.get(route);
    expect(response.ok(), route).toBe(true);
    const xml = await response.text();
    expect(xml).toContain('xml:lang="cs"');
    expect(xml).toContain("<published>");
    expect(xml).toContain("<category");
    expect(xml).toMatch(/<link href="[^"]+\/articles\/[^"]+"\/>/);
  }
  const czech = await request.get("/cs/feed.xml");
  expect(czech.ok()).toBe(true);
  expect(await czech.text()).toContain('xml:lang="cs"');
});

test("source evidence class stays separate and reduced motion disables entrances", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const headers = await page.locator(".source-ledger th").allTextContents();
  expect(headers.join(" ")).toMatch(/evidence class|třída důkazu/i);
  const entrances = page.locator(".enter");
  expect(await entrances.count()).toBeGreaterThan(0);
  const animationName = await entrances.nth(0).evaluate((element) => getComputedStyle(element).animationName);
  expect(animationName).toBe("none");
});

test("brand, completion, and no-media states are deterministic", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".brand-mark")).toHaveCount(2);
  await expect(page.locator(".caught-up-completion")).toContainText("caught up");
  await expect(page.locator(".hero--no-photo")).toBeVisible();
  await page.goto("/topics");
});

test("health and operator-adjacent routes remain private", async ({ page, request }) => {
  await page.goto("/health");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  const promotion = await request.get("/promotion", { maxRedirects: 0 });
  expect(promotion.status()).toBe(404);
  await page.goto("/admin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
});

test("public JSON contracts and security headers remain available", async ({ request }) => {
  for (const route of ["/api/today.json", "/api/weekly.json", "/api/topics.json", "/api/radar.json", "/api/health.json"]) {
    const response = await request.get(route);
    expect(response.ok(), route).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/json");
  }
  const home = await request.get("/");
  expect(home.headers()["content-security-policy"]).toBeTruthy();
  expect(home.headers()["x-frame-options"]).toBe("DENY");
});

test("board transparency is additive and does not fabricate historical context", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "Sponsorship" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Board changelog" })).toBeVisible();
  await expect(page.getByText("No board-initiated product changes have shipped yet.", { exact: true })).toBeVisible();

  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  await expect(page.locator(".making-of")).toHaveCount(0);
});
