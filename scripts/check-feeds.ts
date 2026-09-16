#!/usr/bin/env tsx
// Builds every syndication document the site publishes and validates it offline:
// the Atom feeds and the Google News sitemap.
//
// The W3C Feed Validation Service wants a live public URL or a network round
// trip, and a release gate can have neither; this runs the same RFC 4287 checks
// against the documents the build is about to emit, so an invalid feed never
// reaches a deployment. The news sitemap is checked against Google's
// news-sitemap requirements in the same pass.
//
// `--w3c` additionally sends the site, Weekly and Topic feeds to the real
// service and reports what it finds. It is opt-in and stays out of `pnpm verify`
// and CI, because a third-party service being unreachable must not be able to
// fail a release.

import { request } from "undici";
import { atomFeedErrors, newsSitemapErrors, parseXml, type XmlElement } from "../lib/feed-validation.js";
import {
  buildNewsSitemap,
  buildSiteFeed,
  buildTagFeed,
  buildTopicFeed,
  buildWeeklyFeed,
  tagFeedParams,
  topicFeedParams,
} from "../lib/feeds.js";
import { LOCALES } from "../lib/i18n/config.js";

type Document = { label: string; xml: string };

const W3C_VALIDATOR = "https://validator.w3.org/feed/check.cgi?output=soap12";

/** One request at a time with a pause between them: the service is free and shared. */
const W3C_PAUSE_MS = 1_000;
const W3C_TIMEOUT_MS = 30_000;

/** Every descendant with this local name, ignoring namespace prefixes. */
function descendants(node: XmlElement, name: string): XmlElement[] {
  const found: XmlElement[] = [];
  const visit = (candidate: XmlElement) => {
    if (candidate.name === name || candidate.name.endsWith(`:${name}`)) found.push(candidate);
    candidate.children.forEach(visit);
  };
  visit(node);
  return found;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/** What the W3C service reports as errors for one feed, or why it could not say. */
async function w3cErrors(xml: string): Promise<string[]> {
  let status: number;
  let body: string;
  try {
    const response = await request(W3C_VALIDATOR, {
      method: "POST",
      signal: AbortSignal.timeout(W3C_TIMEOUT_MS),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ rawdata: xml }).toString(),
    });
    status = response.statusCode;
    body = await response.body.text();
  } catch (error) {
    return [`the W3C validator could not be reached: ${(error as Error).message}`];
  }
  if (status !== 200) return [`the W3C validator answered ${status}`];

  const { root } = parseXml(body);
  if (!root) return ["the W3C validator returned a response that could not be read"];

  const list = descendants(root, "errorlist")[0];
  if (!list) return ["the W3C validator returned no error list"];
  const messages = descendants(list, "error").map((error) => {
    const text = decodeEntities(descendants(error, "text")[0]?.text ?? "");
    const line = descendants(error, "line")[0]?.text.trim();
    return line ? `W3C: ${text} (line ${line})` : `W3C: ${text}`;
  });
  // A non-zero count with no readable message still has to fail loudly.
  const count = Number(descendants(root, "errorcount")[0]?.text.trim() ?? "0");
  if (count > 0 && messages.length === 0) return [`W3C: ${count} error(s) reported`];
  return messages;
}

async function main() {
  const useW3c = process.argv.includes("--w3c");

  // The site, Weekly and Topic feeds are the ones a syndication partner reads,
  // and the only ones sent to the W3C service. Tag feeds are preserved
  // compatibility URLs built by the same code and are checked offline.
  const primary: Document[] = [];
  const secondary: Document[] = [];

  for (const locale of LOCALES) {
    primary.push({ label: `${locale} /feed.xml`, xml: await buildSiteFeed(locale) });
    primary.push({ label: `${locale} /weekly/feed.xml`, xml: await buildWeeklyFeed(locale) });
    for (const { slug } of await topicFeedParams()) {
      primary.push({ label: `${locale} /topics/${slug}/feed.xml`, xml: await buildTopicFeed(locale, slug) });
    }
    for (const { tag } of await tagFeedParams()) {
      secondary.push({ label: `${locale} /tags/${tag}/feed.xml`, xml: await buildTagFeed(locale, tag) });
    }
  }
  const feeds = [...primary, ...secondary];

  const sitemaps: Document[] = [];
  for (const locale of LOCALES) {
    sitemaps.push({ label: `${locale} /news-sitemap.xml`, xml: await buildNewsSitemap(locale) });
  }

  const failures: string[] = [];
  for (const feed of feeds) {
    for (const error of atomFeedErrors(feed.xml)) failures.push(`${feed.label}: ${error}`);
  }
  // A news sitemap is not an Atom feed, so the feed validator has nothing to say
  // about it; Google's own requirements are checked here instead.
  for (const sitemap of sitemaps) {
    for (const error of newsSitemapErrors(sitemap.xml)) failures.push(`${sitemap.label}: ${error}`);
  }

  if (useW3c) {
    console.log(`[feeds] asking the W3C Feed Validation Service about ${primary.length} feed(s)`);
    for (const [index, feed] of primary.entries()) {
      if (index > 0) await new Promise((resolve) => setTimeout(resolve, W3C_PAUSE_MS));
      for (const error of await w3cErrors(feed.xml)) failures.push(`${feed.label}: ${error}`);
    }
  }

  const total = feeds.length + sitemaps.length;
  if (failures.length) {
    console.error(
      `[feeds] ${failures.length} issue(s) in ${total} document(s):\n\n${failures
        .map((failure) => `  ${failure}`)
        .join("\n")}`,
    );
    process.exit(1);
  }
  console.log(
    `[feeds] ${feeds.length} Atom feed(s) and ${sitemaps.length} news sitemap(s) validated${
      useW3c ? `, ${primary.length} of them by the W3C service` : ""
    }, no issues`,
  );
}

main().catch((error) => {
  console.error("[feeds] FAILED:", error);
  process.exit(1);
});
