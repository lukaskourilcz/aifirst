import { describe, expect, it } from "vitest";
import { campaignFromUrl, publicPath, withLandingUtm } from "../analytics";

const site = "https://caughtup-ai.vercel.app";

describe("analytics: campaign parameters survive the /cs rewrite", () => {
  it("maps the internal /cs tree onto the public path", () => {
    expect(publicPath("/cs")).toBe("/");
    expect(publicPath("/cs/articles/2026-11-05-x")).toBe("/articles/2026-11-05-x");
    expect(publicPath("/csv")).toBe("/csv");
  });

  it("re-attaches utm_* when the SDK cleared the query on the landing page", () => {
    // The SDK reported the router path and dropped the search string.
    const reported = `${site}/cs`;
    const landing = `${site}/?utm_source=threads&utm_medium=post&utm_campaign=edition&ref=x`;
    const url = new URL(withLandingUtm(reported, landing));
    expect(url.pathname).toBe("/");
    expect(url.searchParams.get("utm_source")).toBe("threads");
    expect(url.searchParams.get("utm_medium")).toBe("post");
    expect(url.searchParams.get("utm_campaign")).toBe("edition");
    expect(url.searchParams.has("ref")).toBe(false);
  });

  it("works for article landings and leaves an intact URL alone", () => {
    const article = `${site}/articles/2026-11-05-x?utm_source=instagram&utm_medium=story&utm_campaign=practical`;
    expect(withLandingUtm(`${site}/cs/articles/2026-11-05-x`, article)).toBe(article);
    expect(withLandingUtm(article, article)).toBe(article);
  });

  it("does not carry a campaign onto a different page", () => {
    const landing = `${site}/?utm_source=threads`;
    expect(withLandingUtm(`${site}/archive`, landing)).toBe(`${site}/archive`);
  });

  it("passes through what it cannot parse", () => {
    expect(withLandingUtm("not a url", `${site}/`)).toBe("not a url");
  });
});

describe("analytics: the campaign event", () => {
  it("reads source/medium and campaign from a landing URL", () => {
    expect(campaignFromUrl(`${site}/?utm_source=threads&utm_medium=post&utm_campaign=edition`)).toEqual({ source: "threads/post", campaign: "edition" });
    expect(campaignFromUrl(`${site}/articles/x?utm_source=Instagram`)).toEqual({ source: "instagram", campaign: "none" });
  });

  it("sends nothing without a clean utm_source", () => {
    expect(campaignFromUrl(`${site}/`)).toBeNull();
    expect(campaignFromUrl(`${site}/?utm_medium=post`)).toBeNull();
    expect(campaignFromUrl(`${site}/?utm_source=${"x".repeat(41)}`)).toBeNull();
    expect(campaignFromUrl(`${site}/?utm_source=a%20b`)).toBeNull();
    expect(campaignFromUrl("nope")).toBeNull();
  });
});
