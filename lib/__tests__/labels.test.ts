import { describe, expect, it } from "vitest";
import { hostOf, sourceName, topicLabel } from "../labels";
import type { Source } from "../sources";

const registry: Source[] = [
  { id: "the-verge", type: "rss", name: "The Verge" },
  { id: "hn-frontpage", type: "hn", name: "Hacker News (front page)" },
];

describe("topicLabel", () => {
  it("maps Czech and legacy English slugs", () => {
    expect(topicLabel("umela-inteligence")).toBe("Umělá inteligence");
    expect(topicLabel("kyberneticka-bezpecnost")).toBe("Kybernetická bezpečnost");
    expect(topicLabel("amd-nvidia")).toBe("AMD a Nvidia");
    expect(topicLabel("dev-tools")).toBe("Nástroje pro vývojáře");
    expect(topicLabel("ai")).toBe("Umělá inteligence");
  });

  it("returns null for an unknown slug, never the slug", () => {
    expect(topicLabel("neznamy-stitek")).toBeNull();
    expect(topicLabel("")).toBeNull();
  });

  it("passes free-text Czech labels through and translates known English ones", () => {
    expect(topicLabel("AI bezpečnost")).toBe("AI bezpečnost");
    expect(topicLabel("autonomní vozidla")).toBe("Autonomní vozidla");
    expect(topicLabel("Cybersecurity")).toBe("Kybernetická bezpečnost");
  });
});

describe("sourceName", () => {
  it("names the wire feeds by service", () => {
    expect(sourceName("tensorfeed", registry)).toBe("TensorFeed");
    expect(sourceName("hn-frontpage", registry)).toBe("Hacker News");
    expect(sourceName("github-ai-releases", registry)).toBe("GitHub");
  });

  it("resolves registry ids and keeps free-text names", () => {
    expect(sourceName("the-verge", registry)).toBe("The Verge");
    expect(sourceName("Lago / GitHub", registry)).toBe("Lago / GitHub");
  });

  it("falls back to the host without www", () => {
    expect(sourceName("unknown-feed", registry, "https://www.wsj.com/economy/x")).toBe("wsj.com");
    expect(hostOf("not a url")).toBe("");
  });
});
