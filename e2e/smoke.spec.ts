import { test, expect, type Page } from "@playwright/test";

const ROUTES = [
  "/",
  "/cs",
  "/tyden",
  "/o-cem-se-mluvi",
  "/ai-modely",
  "/podcasty",
  "/akce",
  "/archive",
  "/cs/archive",
  "/topics",
  "/cs/topics",
  "/weekly",
  "/about",
  "/corrections",
  "/sources",
  "/glossary",
  "/health",
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

test("home: masthead, lead on its photo, the day's band and the week block render", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator(".masthead")).toBeVisible();
  await expect(page.locator(".sidebar")).toHaveCount(0);
  // The page's one h1 is the lead headline, set on the photo's ink band.
  await expect(page.locator(".lead__band h1, .lead--type h1")).toHaveCount(1);
  await expect(page.locator(".lead__dek")).toBeVisible();
  await expect(page.locator(".day-band")).toBeVisible();
  await expect(page.locator(".lead a[href*='/articles/']").first()).toBeVisible();
  await expect(page.locator(".article-body")).toHaveCount(0);
  const cards = page.locator(".week-block .card");
  if (await cards.count()) await expect(cards.first()).toBeVisible();
});

test("the edition line dates the edition, and no reading time appears", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".edition-line time")).toHaveText(/\d{1,2}\. \d{1,2}\. \d{4}/);
  const meta = await page.locator(".lead__meta").innerText();
  expect(meta).toMatch(/zdroj/);
  for (const forbidden of ["min čtení", "signál", "USD", "náklad"]) {
    expect(meta.toLowerCase()).not.toContain(forbidden.toLowerCase());
  }
  expect(await page.locator("body").innerText()).not.toMatch(/min(\.|\u00a0| )čtení/);
});

test("the lead goes to the article, and the body renders with no gate", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".lead a[href*='/articles/']").first()).toHaveAttribute("href", /\/articles\//);

  // A fixed edition, so the assertion measures the layout rather than whichever
  // edition happens to be lead on the day the suite runs.
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  const paragraphs = page.locator(".article-body p");
  await expect(paragraphs.first()).toBeVisible();
  expect(await paragraphs.count()).toBeGreaterThan(0);
});

test("the completion mark closes the edition, above the week feed", async ({ page }) => {
  await page.goto("/");
  const mark = page.locator(".edition-end");
  await expect(mark).toBeVisible();
  const feed = page.locator(".week-block");
  if (await feed.count()) {
    const [markBox, feedBox] = await Promise.all([mark.boundingBox(), feed.boundingBox()]);
    expect(markBox && feedBox && markBox.y).toBeLessThan(feedBox?.y ?? Infinity);
  }
});

test("the devShark house promotion renders without overflow at launch widths", async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    // One placement, the rail square; it reflows into the main column below 1280.
    const banners = page.locator('.banner-slot a[href="https://devshark.app"]');
    await expect(banners).toHaveCount(1);
    await expect(banners.nth(0)).toBeVisible();
    await expect(banners.nth(0)).toHaveAttribute("rel", "sponsored noopener noreferrer");
    await expect(page.locator(".banner-slot__label")).toHaveText(/vlastní projekt/i);

    const visibleCreatives = page.locator(".banner-slot__creative:visible");
    await expect(visibleCreatives).toHaveCount(1);
    for (const creative of await visibleCreatives.all()) {
      await expect(creative).toHaveAttribute("alt", "devShark, vlastní projekt. Kvízová hra, se kterou budeš lepší vývojář.");
    }
    await assertNoHorizontalOverflow(page);
  }
});

test("the section bar carries Dnes and five sections; everything else is under Více", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const bar = page.locator(".section-bar");
  await expect(bar.locator(".section-bar__list > li > a")).toHaveText(["Dnes", "Modely", "Firmy a trh", "Bezpečnost", "Regulace", "Vývoj"]);
  // Archiv is not a section (owner decision); it lives in Více and the footer.
  await expect(bar.locator(".section-bar__list > li > a", { hasText: "Archiv" })).toHaveCount(0);
  const more = bar.locator(".more-menu");
  await more.locator("summary").click();
  for (const path of ["/tyden", "/archive", "/lekce", "/sources", "/corrections", "/about"]) {
    await expect(more.locator(`a[href$="${path}"]`)).toBeVisible();
  }
  // Empty and dormant sections keep their routes but stay out of the navigation.
  for (const path of ["/o-cem-se-mluvi", "/ai-modely", "/podcasty", "/akce", "/radar", "/weekly", "/health", "/admin"]) {
    await expect(page.locator(`.masthead a[href$="${path}"]`)).toHaveCount(0);
  }
  const footer = page.locator("nav.footer-nav");
  for (const path of ["/tyden", "/archive", "/about", "/corrections", "/lekce", "/sources"]) {
    await expect(footer.locator(`a[href$="${path}"]`)).toHaveCount(1);
  }
});

for (const [legacy, current] of [["/search", "/archive"], ["/radar", "/topics"], ["/stats", "/topics"], ["/trends", "/topics"], ["/pulse", "/topics"], ["/tags", "/topics"], ["/colophon", "/about"]] as const) {
  test(`${legacy} permanently resolves to ${current}`, async ({ page }) => {
    await page.goto(legacy);
    await expect(page).toHaveURL(new RegExp(`${current}/?$`));
  });
}

test("issue trust surfaces are semantic and keyboard accessible", async ({ page }) => {
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  await expect(page.getByRole("heading", { name: /sources for this article|zdroje tohoto článku/i })).toBeVisible();
  // The run record is operator data and no longer reaches a reader page.
  await expect(page.locator("section.provenance")).toHaveCount(0);
});

test("legacy Czech print query resolves to the static Czech route", async ({ page }) => {
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning/print?lang=cs");
  await expect(page).toHaveURL(/\/cs\/articles\/2026-07-05-deepmind-blitz-anthropic-reckoning\/print$/);
});

test("the legacy /cs path still serves the Czech home page", async ({ page }) => {
  await page.goto("/cs");
  await expect(page.locator(".lead__title")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "cs");
});

test("inline links carry the Blueprint Blue (#2f5ae6)", async ({ page }) => {
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  // The first <a> inside .article-body is the heading-anchor link (slate by
  // design); the editorial in-body links come right after.
  const links = page.locator(".article-body a:not(.anchor-link)");
  const link = links.first();
  await expect(link).toBeVisible();
  expect(await links.count()).toBeGreaterThan(0);
  const color = await link.evaluate((el) => getComputedStyle(el).color);
  expect(color, "article links should use blueprint blue rgb(47,90,230)").toBe(
    "rgb(47, 90, 230)",
  );
});

test("the section bar marks the current section and holds 44px targets", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/topics/ai-models");
  await expect(page.locator('.section-bar a[aria-current="page"]')).toHaveText("Modely");
  // An article marks the section it belongs to.
  await page.goto("/articles/2026-09-25-ai-agenti-zlocin-google-avatar-microsoft-copilot");
  await expect(page.locator('.section-bar a[aria-current="page"]')).toHaveText("Bezpečnost");
  for (const item of await page.locator(".section-bar__list > li > a").all()) {
    const box = await item.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("the masthead holds the date, the logotype and one search control", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator(".masthead__date time")).toHaveText(/\d{1,2}\. \d{1,2}\. \d{4}/);
  await expect(page.locator(".masthead__brand img[alt=\"DNESKAi\"]")).toBeVisible();
  await expect(page.locator(".search-trigger")).toHaveCount(1);
  await expect(page.locator(".sidebar-status")).toHaveCount(0);
  // Scrolled, the bar condenses and stays on screen.
  await page.mouse.wheel(0, 1200);
  await expect(page.locator(".masthead.is-condensed")).toHaveCount(1);
  await expect(page.locator(".section-bar")).toBeInViewport();
});

test("below 960 the section strip scrolls and the drawer behaves for the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/archive");

  await expect(page.locator(".section-bar__more-button")).toBeVisible();
  const trigger = page.locator(".masthead__menu");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();
  const drawer = page.locator('[role="dialog"] .drawer');
  await expect(drawer).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await expect(drawer.locator('[aria-current="page"]')).toHaveAttribute("href", /\/archive$/);

  for (const item of await page.locator(".drawer__item").all()) {
    const box = await item.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");

  // „Více" at the end of the strip opens the same drawer.
  await page.locator(".section-bar__more-button").click();
  await expect(drawer).toBeVisible();
});

test("the footer has four columns, the curate-and-verify statement and no personal name", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site-footer__grid > *")).toHaveCount(4);
  await expect(page.locator(".social-row")).toHaveCount(0);
  await expect(page.locator('footer a[href$="/feed.xml"]')).toHaveText(/RSS/);
  await expect(page.locator('footer a[href="https://www.instagram.com/dneskai/"]')).toHaveCount(1);
  await expect(page.locator(".footer-description")).toContainText("Každou informaci ověřujeme");
  await expect(page.locator('.footer-description a[href$="/sources"]')).toHaveCount(1);
  await expect(page.locator("footer")).not.toContainText("jazykový model");
});

test("campaign links land without a redirect that strips the query", async ({ request }) => {
  const article = "/articles/2026-07-05-deepmind-blitz-anthropic-reckoning";
  for (const path of ["/", article]) {
    const response = await request.get(`${path}?utm_source=threads&utm_medium=post&utm_campaign=edition`, { maxRedirects: 0 });
    expect(response.status(), `${path} must not redirect a campaign link`).toBe(200);
  }
  // The retired /cs prefix still redirects, and keeps the campaign.
  const legacy = await request.get("/cs?utm_source=instagram", { maxRedirects: 0 });
  expect(legacy.status()).toBe(308);
  expect(legacy.headers().location).toContain("utm_source=instagram");
});

test("machine-facing edition views build: share pack, cards, Markdown, llms.txt, news sitemap, RSS", async ({ request }) => {
  const today = await (await request.get("/api/today.json")).json() as { issue: { slug: string; date: string; type: string } };
  const { slug, date } = today.issue;
  expect(slug).toBeTruthy();

  const pack = await request.get(`/data/share/${date}${today.issue.type === "weekly" ? ".weekly" : ""}.cs.json`);
  expect(pack.status()).toBe(200);
  const json = await pack.json() as { schemaVersion: number; social_copy: { threadsText: string }; images: Record<string, { url: string }> };
  expect(json.schemaVersion).toBe(2);
  expect(json.social_copy.threadsText.length).toBeGreaterThan(0);
  for (const format of ["og", "feed", "story", "wide"]) {
    const image = await request.get(new URL(json.images[format]!.url).pathname);
    expect(image.status(), `${format} card`).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
  }

  const md = await request.get(`/articles/${slug}.md`);
  expect(md.status()).toBe(200);
  expect(md.headers()["content-type"]).toContain("text/markdown");
  expect(await md.text()).toMatch(/^# /);

  const llms = await request.get("/llms.txt");
  expect(await llms.text()).toContain(`/articles/${slug}.md`);

  const news = await (await request.get("/news-sitemap.xml")).text();
  expect(news).toContain("<news:language>cs</news:language>");
  const rss = await (await request.get("/rss.xml")).text();
  expect(rss).toContain('<rss version="2.0"');
  expect((await request.get("/favicon.ico")).status()).toBe(200);
  expect(await (await request.get("/robots.txt")).text()).toContain("/news-sitemap.xml");
});

test("skip link and keyboard search work, trap focus, and restore the trigger", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const trigger = page.locator(".search-trigger");
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

test("topic detail is one list of editions and links no raw tag page", async ({ page }) => {
  await page.goto("/topics/ai-models");
  await expect(page.getByRole("heading", { name: /vydání k tématu/i })).toBeVisible();
  await expect(page.locator(".feed-list .feed-row").first()).toBeVisible();
  await expect(page.locator('a[href*="/tags/"]')).toHaveCount(0);
});

test("feeds expose language, entry links, publication time and categories", async ({ request }) => {
  for (const route of ["/feed.xml", "/weekly/feed.xml", "/topics/ai-models/feed.xml"]) {
    const response = await request.get(route);
    expect(response.ok(), route).toBe(true);
    const xml = await response.text();
    expect(xml).toContain('xml:lang="cs"');
    expect(xml).toContain("<updated>");
    if (xml.includes("<entry>")) {
      expect(xml, route).toContain("<published>");
      expect(xml, route).toContain("<category");
      expect(xml, route).toMatch(/<link href="[^"]+\/articles\/[^"]+"\/>/);
    }
  }
  const czech = await request.get("/cs/feed.xml");
  expect(czech.ok()).toBe(true);
  expect(await czech.text()).toContain('xml:lang="cs"');
});

test("the ledger states each source's kind and reduced motion disables entrances", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  await expect(page.locator("#zdroje")).toBeVisible();
  const rows = page.locator(".ledger__row");
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(rows.first().locator(".ledger__class")).toHaveText(/primární|sekundární|neurčeno/);
  await page.goto("/about");
  const animationName = await page.locator(".page-shell").evaluate((element) => getComputedStyle(element).animationName);
  expect(animationName).toBe("none");
});

test("brand, completion, and no-media states are deterministic", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator(".masthead__brand .brand-lockup img[alt=\"DNESKAi\"]")).toHaveCount(1);
  await expect(page.locator("footer .brand-lockup img[alt=\"DNESKAi\"]")).toHaveCount(1);
  await expect(page.locator(".edition-end")).toContainText("přehled");
  // The lead is a photo with the headline on its band, or a typographic lead;
  // never a drawn plate.
  const photoLead = await page.locator(".lead__media img").count();
  const typeLead = await page.locator(".lead--type").count();
  expect(photoLead + typeLead, "the lead is a photo or typographic").toBe(1);
  await expect(page.locator('img[src$=".svg"]:not([src*="/brand/"]):not([src*="/banners/"])')).toHaveCount(0);
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
  for (const route of ["/api/today.json", "/api/weekly.json", "/api/topics.json", "/api/health.json"]) {
    const response = await request.get(route);
    expect(response.ok(), route).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/json");
  }
  const home = await request.get("/");
  expect(home.headers()["content-security-policy"]).toBeTruthy();
  expect(home.headers()["x-frame-options"]).toBe("DENY");
});

test("the about page is a magazine, not a run record", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "Inzerce" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Opravy" })).toBeVisible();
  // Board changelog, meeting records, model roles and run cost are operator
  // vocabulary and no longer appear on a reader page.
  const copy = (await page.locator("main").innerText()).toLowerCase();
  for (const forbidden of [
    "changelog",
    "záznam jednání",
    "runtime",
    "github actions",
    "automatizovaná redakce",
    "kontrola člověkem",
    "profil modelu",
    "cena běhu",
  ]) {
    expect(copy, `about page still mentions ${forbidden}`).not.toContain(forbidden);
  }

  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  await expect(page.locator(".making-of")).toHaveCount(0);
  await expect(page.locator("section.provenance")).toHaveCount(0);
});

test("the section routes render their honest empty states", async ({ page }) => {
  // Streams, the model category and events fill from upstream (BoardlessAI
  // syncs data/events.json wholesale), so each page shows either items or its
  // empty line.
  for (const [route, empty] of [["/o-cem-se-mluvi", "Dnes zatím nic nového."], ["/podcasty", "Dnes nevyšla žádná nová epizoda."]] as const) {
    await page.goto(route);
    const filled = await page.locator("main li").count();
    if (!filled) await expect(page.getByText(empty)).toBeVisible();
  }

  await page.goto("/ai-modely");
  if (!(await page.locator(".feed-row").count())) {
    await expect(page.getByText("Zatím tu není žádné vydání zaměřené na modely.")).toBeVisible();
  }

  await page.goto("/akce");
  if (!(await page.locator(".events .event:not(.event--past)").count())) {
    await expect(page.getByText("Zatím tu nejsou žádné nadcházející akce.").first()).toBeVisible();
  }
});

test("the week chain reaches back through every published week", async ({ page }) => {
  await page.goto("/tyden");
  await expect(page.locator(".feed-row").first()).toBeVisible();

  // Follow the chain to its end; every hop is a static page.
  const seen = new Set<string>();
  for (let hop = 0; hop < 12; hop += 1) {
    const action = page.locator(".week-action");
    if ((await action.count()) === 0) break;
    const href = await action.getAttribute("href");
    expect(href, "the chain must not loop").not.toBe(null);
    expect(seen.has(href!), `revisited ${href}`).toBe(false);
    seen.add(href!);
    const response = await page.goto(href!);
    expect(response?.status(), `dead week page ${href}`).toBeLessThan(400);
  }
  // The oldest week ends with a quiet line into the archive, not a dead control.
  await expect(page.locator(".archive-exhausted")).toBeVisible();
});

test("events expose both scopes as linkable anchors with zero JavaScript", async ({ page }) => {
  await page.goto("/akce");
  await expect(page.locator("#cesko")).toBeAttached();
  await expect(page.locator("#svet")).toBeAttached();
  const nav = page.locator(".scope-nav");
  await expect(nav).toHaveAttribute("aria-label", "Rozsah akcí");
  await expect(nav.locator('a[href="#cesko"]')).toBeVisible();
  await expect(nav.locator('a[href="#svet"]')).toBeVisible();
});

test("the new section routes are in the sitemap", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/tyden", "/o-cem-se-mluvi", "/podcasty"]) {
    expect(xml, `${path} missing from the sitemap`).toContain(`${path}<`);
  }
  // Noindex while empty or dormant, so not advertised to crawlers either.
  for (const path of ["/ai-modely", "/weekly"]) {
    expect(xml, `${path} should not be in the sitemap`).not.toContain(`${path}<`);
  }
  // /akce is advertised exactly when it is indexable, i.e. when something is upcoming.
  const akce = await (await request.get("/akce")).text();
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(akce);
  expect(xml.includes("/akce<"), "/akce sitemap entry must follow its robots state").toBe(!noindex);
});

test("the house creative holds 300x250 and carries no script", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const creative = page.locator(".day-band .banner-slot__creative:visible");
  await expect(creative).toBeVisible();
  const rect = await creative.boundingBox();
  expect(rect?.width).toBe(300);
  expect(rect?.height).toBe(250);
  await expect(page.locator(".banner-slot")).toHaveCount(1);
  await expect(page.locator(".banner-slot script")).toHaveCount(0);
});

test("the magazine's own copy carries no em-dash", async ({ page }) => {
  // Scoped to chrome the redesign writes. Edition titles, deks and dataset
  // entries are immutable published content that predates the rule, so they
  // are excluded here and enforced going forward in the writer prompt.
  const OWN = [
    ".page-header",
    ".empty-line",
    ".week-action",
    ".archive-exhausted",
    ".module-head",
    ".rail-module__kicker",
    ".event-scope__heading",
    ".scope-nav",
    ".about-sections h2",
    ".footer-nav",
  ].join(", ");

  for (const route of ["/", "/tyden", "/akce", "/podcasty", "/o-cem-se-mluvi", "/ai-modely", "/about"]) {
    await page.goto(route);
    const chunks = await page.locator(OWN).allInnerTexts();
    expect(chunks.join(" "), `em-dash in ${route}`).not.toContain("\u2014");
  }
});

test("the article page: byline, figure, side column and ledger", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/articles/2026-08-05-spacex-jde-po-operatorech-ai-zlevnuje");

  await expect(page.locator(".editorial-highlights")).toBeVisible();
  await expect(page.locator(".source-ledger")).toBeVisible();
  await expect(page.locator(".article-body p").first()).toBeVisible();
  // Redaktor is deliberately empty; Ověření never claims an unrecorded review.
  await expect(page.locator(".byline dt").first()).toHaveText("Redaktor");
  await expect(page.locator(".byline")).toContainText(/Sestaveno z|Ověřeno podle/);
  await expect(page.locator('.byline a[href$="/about#redakce"]')).toHaveCount(1);
  await expect(page.locator(".article-head")).not.toContainText("jazykový model");

  const side = page.locator(".article-grid__side");
  await expect(side.locator('.banner-slot a[href="https://devshark.app"]')).toBeVisible();
  await expect(page.locator(".hero__topics, .hero__categories")).toHaveCount(0);
});
