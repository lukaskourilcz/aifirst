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
  "/radar",
  "/weekly",
  "/about",
  "/partner",
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

test("home: rail, lead package, condensed briefs and the week feed render", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator(".sidebar")).toBeVisible();
  await expect(page.locator(".lead__title")).toBeVisible();
  await expect(page.locator(".lead__meta")).toBeVisible();
  await expect(page.locator(".condensed")).toBeVisible();
  // The lead headline is a link to the article, not the article itself.
  await expect(page.locator(".lead__title a")).toHaveAttribute("href", /\/articles\//);
  await expect(page.locator(".article-body")).toHaveCount(0);
  await expect(page.locator(".publication-data")).toHaveCount(0);
  const rows = page.locator(".feed-row");
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(rows.nth(0)).toBeVisible();
});

test("the lead meta row carries the date and reading time and nothing else", async ({ page }) => {
  await page.goto("/");
  const meta = await page.locator(".lead__meta").innerText();
  expect(meta).toMatch(/\d{1,2}\. \d{1,2}\. \d{4}/);
  expect(meta).toMatch(/min/);
  for (const forbidden of ["zdroj", "signál", "USD", "náklad"]) {
    expect(meta.toLowerCase()).not.toContain(forbidden.toLowerCase());
  }
});

test("the lead headline goes to the article, and the body renders with no gate", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".lead__title a")).toHaveAttribute("href", /\/articles\//);

  // A fixed edition, so the assertion measures the layout rather than whichever
  // edition happens to be lead on the day the suite runs.
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  const paragraphs = page.locator(".article-body p");
  await expect(paragraphs.first()).toBeVisible();
  expect(await paragraphs.count()).toBeGreaterThan(0);
});

test("the completion mark closes the edition, above the week feed", async ({ page }) => {
  await page.goto("/");
  const mark = page.locator(".caught-up-completion");
  await expect(mark).toBeVisible();
  const feed = page.locator(".feed-section");
  if (await feed.count()) {
    const [markBox, feedBox] = await Promise.all([mark.boundingBox(), feed.boundingBox()]);
    expect(markBox && feedBox && markBox.y).toBeLessThan(feedBox?.y ?? Infinity);
  }
});

test("the reciprocal MMA FILES promotion renders without overflow at launch widths", async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const banners = page.locator('.banner-slot a[href="https://mma-files.vercel.app"]');
    await expect(banners).toHaveCount(2);
    await expect(banners.nth(0)).toBeVisible();
    await expect(banners.nth(1)).toBeVisible();
    await expect(banners.nth(0)).toHaveAttribute("rel", "sponsored noopener noreferrer");

    // Today holds the belt and the rail square, which is the declared cap of
    // two placements on one surface.
    await expect(page.locator(".banner-slot")).toHaveCount(2);

    const visibleCreatives = page.locator(".banner-slot__creative:visible");
    await expect(visibleCreatives).toHaveCount(2);
    for (const creative of await visibleCreatives.all()) {
      await expect(creative).toHaveAttribute("alt", "MMA FILES. UFC a Oktagon. Číst partnerský magazín.");
    }
    await assertNoHorizontalOverflow(page);
  }
});

test("primary nav lives in the sidebar; ops links in the footer", async ({ page }) => {
  // The rail only exists above 960; below that the drawer carries the same
  // items and has its own test.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const sidebar = page.locator(".sidebar");
  for (const path of ["/tyden", "/o-cem-se-mluvi", "/ai-modely", "/podcasty", "/akce"]) {
    await expect(sidebar.locator(`a[href$="${path}"]`)).toBeVisible();
  }
  for (const path of ["/radar", "/topics", "/weekly", "/archive", "/lekce", "/about"]) {
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
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  await expect(page.getByRole("heading", { name: /source ledger|přehled zdrojů/i })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: /nejnovější články/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /časová osa/i })).toBeVisible();
  const entities = page.getByRole("heading", { name: /opakující se entity/i });
  if (await entities.count()) await expect(entities).toBeVisible();
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

test("feeds name their author and declare each enclosure's real media type", async ({ request }) => {
  for (const route of ["/feed.xml", "/weekly/feed.xml", "/topics/ai-models/feed.xml"]) {
    const xml = await (await request.get(route)).text();
    // RFC 4287 section 4.1.1: a feed without an author is invalid.
    expect(xml, route).toMatch(/<author>\s*<name>[^<]+<\/name>/);
    for (const match of xml.matchAll(/<link href="([^"]+)" rel="enclosure" type="([^"]+)"/g)) {
      const href = match[1] ?? "";
      const expected = href.endsWith(".svg") ? "image/svg+xml" : "image/webp";
      expect(match[2], href).toBe(expected);
    }
  }
});

test("reading pages ask for a large image preview and describe themselves as an Article", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /max-image-preview:large/i);

  const href = await page.locator('a[href^="/articles/"]:not([href$="/print"])').first().getAttribute("href");
  expect(href, "the front page links an edition").toBeTruthy();
  await page.goto(href!);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /max-image-preview:large/i);

  const graphs = await page.locator('script[type="application/ld+json"]').allTextContents();
  const nodes = graphs.flatMap((raw) => (JSON.parse(raw)["@graph"] ?? []) as Array<Record<string, unknown>>);
  const article = nodes.find((node) => node["@type"] === "NewsArticle" || node["@type"] === "Article");
  expect(article, "an article page publishes an Article node").toBeTruthy();
  expect(article?.headline).toBeTruthy();
  expect(String(article?.datePublished)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(String(article?.dateModified)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(article?.author).toBeTruthy();

  const organization = nodes.find((node) => node["@type"] === "Organization");
  expect(organization?.["@id"]).toBe((article?.author as { "@id": string })["@id"]);

  // Discover only offers a large preview from 1200px up, so a declared
  // ImageObject must clear it; an edition without a hero declares no image at
  // all rather than a narrow cached thumbnail.
  const image = article?.image;
  if (image && typeof image === "object") {
    expect((image as { width: number }).width).toBeGreaterThanOrEqual(1200);
  }
  if (typeof image === "string") expect(image).not.toContain("/og-cache/");
});

test("source evidence class stays separate and reduced motion disables entrances", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/articles/2026-07-05-deepmind-blitz-anthropic-reckoning");
  await expect(page.locator(".source-ledger")).toBeVisible();
  const headers = await page.locator(".source-ledger th").allTextContents();
  expect(headers.join(" ")).toMatch(/evidence class|třída důkazu/i);
  const entrances = page.locator(".enter");
  expect(await entrances.count()).toBeGreaterThan(0);
  const animationName = await entrances.nth(0).evaluate((element) => getComputedStyle(element).animationName);
  expect(animationName).toBe("none");
});

test("brand, completion, and no-media states are deterministic", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  // Rail, mobile top bar and footer each carry one lockup. The top bar is in
  // the DOM at every width and hidden by CSS above 960.
  await expect(page.locator(".sidebar .brand-mark")).toHaveCount(1);
  await expect(page.locator("footer .brand-mark")).toHaveCount(1);
  await expect(page.locator(".caught-up-completion")).toContainText("přehled");
  // No-media state: an edition without a photo gets the seeded hairline plate.
  const figure = page.locator(".lead__figure");
  await expect(figure).toHaveCount(1);
  const hasImage = await figure.locator("img").count();
  const hasPlate = await figure.locator(".hero-plate").count();
  expect(hasImage + hasPlate, "the lead always resolves to a picture or a plate").toBe(1);
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

test("the subscribe module is Atom-only while no email provider is configured", async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const subscribe = page.locator(".right-rail .rail-module").filter({ hasText: /odebírat/i }).first();
  await expect(subscribe.locator('a[href$="/feed.xml"]')).toHaveCount(1);
  // config/subscribe.json ships empty, so no address is collected anywhere and
  // form-action carries no provider origin.
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(subscribe).not.toContainText("e-mail");

  const csp = (await request.get("/")).headers()["content-security-policy"] ?? "";
  expect(csp).toContain("form-action 'self'");
  expect(csp).toMatch(/form-action 'self';/);
});

test("llms.txt indexes the editions and each one resolves as chrome-free markdown", async ({ request }) => {
  const index = await request.get("/llms.txt");
  expect(index.ok()).toBe(true);
  expect(index.headers()["content-type"]).toContain("text/plain");
  const body = await index.text();
  expect(body.startsWith("# DNESKAi")).toBe(true);
  expect(body).toContain("## Optional");

  const first = /\]\((https?:\/\/[^)]+\/articles\/([^/)]+)\.md)\)/.exec(body);
  expect(first, "llms.txt lists at least one edition").not.toBeNull();
  const slug = first?.[2] ?? "";
  for (const route of [`/articles/${slug}.md`, `/articles/${slug}/index.md`]) {
    const markdown = await request.get(route);
    expect(markdown.ok(), route).toBe(true);
    expect(markdown.headers()["content-type"], route).toContain("text/markdown");
    const text = await markdown.text();
    expect(text.startsWith("# "), route).toBe(true);
    expect(text, route).not.toContain("<html");
    expect(text, route).not.toContain("<body");
    // Run instrumentation stays in /health, never in a document readers open.
    for (const key of ["package_hash", "source_candidates", "human_reviewed"]) {
      expect(text, `${key} in ${route}`).not.toContain(key);
    }
  }

  const withdrawn = await request.get("/articles/2026-08-08-openai-astra-pozastaveni-kyberneticky-prach.md");
  expect(withdrawn.status()).toBe(404);
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
  // The stream files ship as valid empty envelopes, so these two are the states
  // a reader sees on day one and they stay exact.
  await page.goto("/o-cem-se-mluvi");
  await expect(page.getByText("Dnes zatím nic nového.")).toBeVisible();

  await page.goto("/podcasty");
  await expect(page.getByText("Dnes nevyšla žádná nová epizoda.")).toBeVisible();

  // These two fill up from committed content — /ai-modely from editions filed
  // under `ai-models`, /akce from the events store — so pinning them to the
  // empty line made the suite fail the day an edition earned the category.
  // What has to hold either way is that the route renders one honest state and
  // never a half-empty shell: the empty lines, or a real feed.
  await page.goto("/ai-modely");
  await expect(
    page.getByText("Zatím tu není žádné vydání zaměřené na modely.").or(page.locator(".feed-list")).first(),
  ).toBeVisible();

  await page.goto("/akce");
  await expect(
    page.getByText("Zatím tu nejsou žádné nadcházející akce.").or(page.locator("ul.events")).first(),
  ).toBeVisible();
});

test("the practical block is either a real block above the mark or nothing at all", async ({ page }) => {
  // No edition carries `practical` yet: upstream's own quality gate has the
  // item switched off. So render-nothing is the state this asserts today, and
  // the assertion holds in both directions the way the section routes do —
  // either a block with rows in the right place, or no shell and no heading.
  await page.goto("/");
  const block = page.locator("[data-practical]");
  const mark = page.locator(".caught-up-completion");
  await expect(mark).toBeVisible();

  if (await block.count()) {
    await expect(block.locator(".digest-row").first()).toBeVisible();
    await expect(block.locator(".digest__heading")).toBeVisible();
    // The kicker comes from the delivered variant, never from the weekday.
    const variant = await block.getAttribute("data-practical");
    expect(["daily", "friday-tools"]).toContain(variant);
    const [blockBox, markBox] = await Promise.all([block.boundingBox(), mark.boundingBox()]);
    expect(blockBox && markBox && blockBox.y).toBeLessThan(markBox?.y ?? Infinity);
    // The body is the deliverable, so it is not clamped to two lines.
    await expect(block.locator(".digest-row__summary--full").first()).toBeVisible();
  } else {
    await expect(page.getByText("Co si dnes můžete zkusit.")).toHaveCount(0);
    await expect(page.getByText("Tři nástroje a jeden prompt.")).toHaveCount(0);
    await expect(page.getByText("k vyzkoušení", { exact: true })).toHaveCount(0);
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
  for (const path of ["/tyden", "/o-cem-se-mluvi", "/ai-modely", "/podcasty", "/akce", "/partner"]) {
    expect(xml, `${path} missing from the sitemap`).toContain(`${path}<`);
  }
});

test("the news sitemap names the publication and robots.txt advertises it", async ({ request }) => {
  const response = await request.get("/news-sitemap.xml");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("xml");
  const xml = await response.text();
  expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
  if (xml.includes("<url>")) {
    expect(xml).toContain("<news:name>DNESKAi</news:name>");
    expect(xml).toMatch(/<news:language>[a-z]{2,3}<\/news:language>/);
    // A bare date is not a news:publication_date; Google wants an instant.
    expect(xml).toMatch(/<news:publication_date>\d{4}-\d{2}-\d{2}T[^<]+<\/news:publication_date>/);
    expect(xml).toMatch(/<loc>https?:\/\/[^<]+\/articles\/[^<]+<\/loc>/);
  }

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("news-sitemap.xml");
});

test("the rail partner creative holds 300x250 and carries no script", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const creative = page.locator(".right-rail .banner-slot__creative:visible");
  await expect(creative).toBeVisible();
  const rect = await creative.boundingBox();
  expect(rect?.width).toBe(300);
  expect(rect?.height).toBe(250);
  await expect(page.locator(".right-rail .banner-slot")).toHaveCount(1);
  await expect(page.locator(".banner-slot script")).toHaveCount(0);
});

test("the weekly surface stays inside the declared inventory", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tyden");
  // The Weekly belt is declared but unsold, so it renders nothing and Weekly
  // carries the rail square alone. Either way it can never exceed two.
  const banners = page.locator(".banner-slot");
  expect(await banners.count()).toBeLessThanOrEqual(2);
  await expect(page.locator(".banner-slot script")).toHaveCount(0);
  await expect(page.locator(".right-rail .banner-slot")).toHaveCount(1);
});

test("the partner page sells only what the inventory declares", async ({ page }) => {
  await page.goto("/partner");

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Partnerství s DNESKAi.");

  // Every package is quoted individually until the owner sets a rate, so the
  // page must show the on-request state and never a number nobody agreed to.
  const packages = page.locator(".partner-package");
  expect(await packages.count()).toBeGreaterThan(0);
  await expect(page.locator(".partner-price__request").first()).toBeVisible();
  await expect(page.locator(".partner-price__amount")).toHaveCount(0);

  // The inventory rows are read back out of the same config the reader
  // surfaces render from, so the belt reads as taken and the unsold Weekly
  // belt reads as free.
  await expect(page.locator(".partner-format")).toHaveCount(4);
  await expect(page.locator(".partner-state--taken")).toHaveCount(2);
  await expect(page.locator(".partner-state--free")).toHaveCount(1);

  // No traffic figure is claimed anywhere, and nothing is embedded.
  await expect(page.locator(".partner-reach")).toBeVisible();
  await expect(page.locator(".partner-card script, .partner-card iframe, .partner-card form")).toHaveCount(0);

  // No booking destination is configured, so there is a stated empty state
  // rather than a dead button.
  await expect(page.locator(".partner-booking__cta")).toHaveCount(0);
  await expect(page.locator("#booking .route-empty-state")).toBeVisible();
});

test("the partner page is reachable from the footer and the about page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.locator('nav.footer-nav a[href$="/partner"]')).toHaveCount(1);
  // The rail stays sections plus search; the trust nav is the second entry point.
  await expect(page.locator('.sidebar a[href$="/partner"]')).toHaveCount(0);

  await page.goto("/about");
  await expect(page.locator('.trust-links a[href$="/partner"]')).toHaveCount(1);
  await expect(page.locator("#sponsorship")).toBeVisible();
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
    ".section-head",
    ".rail-module__kicker",
    ".event-scope__heading",
    ".scope-nav",
    ".about-sections h2",
    ".footer-nav",
  ].join(", ");

  for (const route of ["/", "/tyden", "/akce", "/podcasty", "/o-cem-se-mluvi", "/ai-modely", "/about", "/partner"]) {
    await page.goto(route);
    const chunks = await page.locator(OWN).allInnerTexts();
    expect(chunks.join(" "), `em-dash in ${route}`).not.toContain("\u2014");
  }
});

test("the article page carries the rail and files chips only when tagged", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // A schema-v2 edition: the legacy May and July issues predate
  // why_it_matters, and a missing highlights block is a real legacy state.
  await page.goto("/articles/2026-08-05-spacex-jde-po-operatorech-ai-zlevnuje");

  // Reading spine survives the re-skin.
  await expect(page.locator(".editorial-highlights")).toBeVisible();
  await expect(page.locator(".source-ledger")).toBeVisible();
  await expect(page.locator(".article-body p").first()).toBeVisible();

  // Rail: the configured partner creative and related editions, nothing else.
  const rail = page.locator(".right-rail");
  await expect(rail.locator('.banner-slot a[href="https://mma-files.vercel.app"]')).toBeVisible();
  await expect(rail.locator(".rail-related a").first()).toBeVisible();

  // This edition has no category, so the row is absent rather than empty.
  await expect(page.locator(".hero__categories")).toHaveCount(0);
  // Topic tags are a separate row and are not conflated with categories.
  await expect(page.locator(".hero__topics")).toBeVisible();
});
