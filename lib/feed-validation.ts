// An offline validator for the syndication documents this repository generates:
// the Atom feeds and the Google News sitemap.
//
// The W3C Feed Validation Service needs a public URL and a network call, which
// a release gate cannot have. This checks the same document against the subset
// of RFC 4287 that the service reports as errors, so a malformed or invalid
// feed fails the build instead of a reader's reader.
//
// It is deliberately hand-written: nothing in the dependency tree parses XML,
// and adding a parser to validate output we generate ourselves would cost more
// than it proves.

import { NEWS_SITEMAP_MAX_ENTRIES } from "./feed";

export type XmlElement = {
  name: string;
  attrs: Record<string, string>;
  children: XmlElement[];
  text: string;
};

const NAME_START = /[A-Za-z_:]/;
const ATTRIBUTE = /([A-Za-z_:][-A-Za-z0-9._:]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>`]+))/g;
const UNESCAPED_AMPERSAND = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9A-Fa-f]+);)/;

/** RFC 3339, which is the date construct Atom requires. A bare `YYYY-MM-DD` is not one. */
export const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function localName(name: string): string {
  const colon = name.indexOf(":");
  return colon === -1 ? name : name.slice(colon + 1);
}

// The closing `>` of a start tag, skipping any that sits inside a quoted
// attribute value.
function findTagEnd(xml: string, from: number): number {
  let quote: string | null = null;
  for (let i = from; i < xml.length; i += 1) {
    const char = xml[i];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === ">") return i;
  }
  return -1;
}

export function parseXml(xml: string): { root: XmlElement | null; errors: string[] } {
  const errors: string[] = [];
  const stack: XmlElement[] = [];
  let root: XmlElement | null = null;
  let declarations = 0;
  let index = 0;

  const addText = (raw: string) => {
    if (!raw) return;
    if (UNESCAPED_AMPERSAND.test(raw)) errors.push("unescaped `&` in character data");
    const current = stack[stack.length - 1];
    if (current) current.text += raw;
    else if (raw.trim()) errors.push("character data outside the root element");
  };

  while (index < xml.length) {
    const lt = xml.indexOf("<", index);
    if (lt === -1) {
      addText(xml.slice(index));
      break;
    }
    addText(xml.slice(index, lt));

    if (xml.startsWith("<!--", lt)) {
      const end = xml.indexOf("-->", lt);
      if (end === -1) {
        errors.push("unterminated comment");
        break;
      }
      index = end + 3;
      continue;
    }
    if (xml.startsWith("<![CDATA[", lt)) {
      const end = xml.indexOf("]]>", lt);
      if (end === -1) {
        errors.push("unterminated CDATA section");
        break;
      }
      const current = stack[stack.length - 1];
      if (current) current.text += xml.slice(lt + 9, end);
      index = end + 3;
      continue;
    }
    if (xml.startsWith("<?", lt)) {
      const end = xml.indexOf("?>", lt);
      if (end === -1) {
        errors.push("unterminated processing instruction");
        break;
      }
      if (xml.startsWith("<?xml", lt)) {
        declarations += 1;
        if (declarations > 1) errors.push("more than one XML declaration");
        else if (lt !== 0) errors.push("the XML declaration must start the document");
      }
      index = end + 2;
      continue;
    }
    if (xml.startsWith("<!", lt)) {
      const end = findTagEnd(xml, lt);
      if (end === -1) {
        errors.push("unterminated declaration");
        break;
      }
      index = end + 1;
      continue;
    }
    if (xml.startsWith("</", lt)) {
      const end = findTagEnd(xml, lt);
      if (end === -1) {
        errors.push("unterminated end tag");
        break;
      }
      const name = xml.slice(lt + 2, end).trim();
      const open = stack.pop();
      if (!open) errors.push(`</${name}> closes an element that was never opened`);
      else if (open.name !== name) errors.push(`<${open.name}> is closed by </${name}>`);
      index = end + 1;
      continue;
    }

    const end = findTagEnd(xml, lt);
    if (end === -1) {
      errors.push("unterminated start tag");
      break;
    }
    let inner = xml.slice(lt + 1, end);
    const selfClosing = inner.endsWith("/");
    if (selfClosing) inner = inner.slice(0, -1);
    const first = inner[0];
    if (!first || !NAME_START.test(first)) {
      errors.push(`malformed start tag \`<${inner.slice(0, 40)}>\``);
      index = end + 1;
      continue;
    }
    const nameMatch = /^[A-Za-z_:][-A-Za-z0-9._:]*/.exec(inner);
    const name = nameMatch ? nameMatch[0] : inner;
    const attrRegion = inner.slice(name.length);
    const attrs: Record<string, string> = {};
    ATTRIBUTE.lastIndex = 0;
    const spans: Array<[number, number]> = [];
    let match: RegExpExecArray | null;
    while ((match = ATTRIBUTE.exec(attrRegion)) !== null) {
      spans.push([match.index, match.index + match[0].length]);
      const [, key, doubleQuoted, singleQuoted, unquoted] = match;
      if (unquoted !== undefined) {
        errors.push(`<${name}> attribute \`${key}\` must have a double-quoted value`);
      } else if (singleQuoted !== undefined) {
        errors.push(`<${name}> attribute \`${key}\` must use double quotes`);
      }
      const value = doubleQuoted ?? singleQuoted ?? unquoted ?? "";
      if (UNESCAPED_AMPERSAND.test(value)) {
        errors.push(`<${name}> attribute \`${key}\` contains an unescaped \`&\``);
      }
      if (key !== undefined) attrs[key] = decodeEntities(value);
    }
    let leftover = "";
    let cursor = 0;
    for (const [start, stop] of spans) {
      leftover += attrRegion.slice(cursor, start);
      cursor = stop;
    }
    leftover += attrRegion.slice(cursor);
    if (leftover.trim()) {
      errors.push(`<${name}> has malformed attributes near \`${leftover.trim().slice(0, 40)}\``);
    }

    const element: XmlElement = { name, attrs, children: [], text: "" };
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(element);
    else if (root) errors.push(`a second root element <${name}> follows <${root.name}>`);
    else root = element;
    if (!selfClosing) stack.push(element);
    index = end + 1;
  }

  for (const unclosed of [...stack].reverse()) errors.push(`<${unclosed.name}> is never closed`);
  if (!root) errors.push("the document has no root element");
  return { root, errors };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function child(element: XmlElement, name: string): XmlElement | undefined {
  return element.children.find((candidate) => localName(candidate.name) === name);
}

function childrenNamed(element: XmlElement, name: string): XmlElement[] {
  return element.children.filter((candidate) => localName(candidate.name) === name);
}

function required(element: XmlElement, name: string, where: string, errors: string[]): XmlElement | undefined {
  const found = child(element, name);
  if (!found) {
    errors.push(`${where}: missing <${name}>`);
    return undefined;
  }
  if (!found.text.trim()) errors.push(`${where}: <${name}> is empty`);
  return found;
}

function requiredDate(element: XmlElement, name: string, where: string, errors: string[]): void {
  const found = required(element, name, where, errors);
  if (!found) return;
  const value = found.text.trim();
  if (value && !RFC3339.test(value)) {
    errors.push(`${where}: <${name}> "${value}" is not an RFC 3339 date-time`);
  }
}

function hasNamedAuthor(element: XmlElement): boolean {
  return childrenNamed(element, "author").some((author) => (child(author, "name")?.text ?? "").trim().length > 0);
}

function linkErrors(element: XmlElement, where: string, errors: string[]): void {
  for (const link of childrenNamed(element, "link")) {
    if (!(link.attrs.href ?? "").trim()) errors.push(`${where}: <link> without an href`);
    // An enclosure without a media type is the defect that made every drawn
    // SVG plate announce itself as a WebP photograph.
    if (link.attrs.rel === "enclosure" && !(link.attrs.type ?? "").trim()) {
      errors.push(`${where}: enclosure <link> without a type`);
    }
  }
}

/**
 * Every validity error a feed can carry, in document order. An empty array
 * means the document is a well-formed Atom feed the release gate accepts.
 */
export function atomFeedErrors(xml: string): string[] {
  const { root, errors } = parseXml(xml);
  if (!root) return errors;

  if (localName(root.name) !== "feed") {
    errors.push(`the root element is <${root.name}>, not <feed>`);
    return errors;
  }
  if (root.attrs.xmlns !== "http://www.w3.org/2005/Atom") {
    errors.push("<feed> must declare the Atom namespace http://www.w3.org/2005/Atom");
  }

  required(root, "id", "feed", errors);
  required(root, "title", "feed", errors);
  requiredDate(root, "updated", "feed", errors);

  const self = childrenNamed(root, "link").find((link) => link.attrs.rel === "self");
  if (!self) errors.push('feed: missing <link rel="self">');
  else if (self.attrs.type !== "application/atom+xml") {
    errors.push('feed: <link rel="self"> must declare type="application/atom+xml"');
  }
  linkErrors(root, "feed", errors);

  const entries = childrenNamed(root, "entry");
  const feedAuthored = hasNamedAuthor(root);
  const seenIds = new Set<string>();

  entries.forEach((entry, index) => {
    const where = `entry ${index + 1}`;
    const id = required(entry, "id", where, errors);
    required(entry, "title", where, errors);
    requiredDate(entry, "updated", where, errors);
    requiredDate(entry, "published", where, errors);
    if (!child(entry, "summary") && !child(entry, "content")) {
      errors.push(`${where}: needs a <summary> or a <content>`);
    }
    // RFC 4287 section 4.1.1: an entry needs an author of its own unless the
    // feed supplies one.
    if (!feedAuthored && !hasNamedAuthor(entry)) {
      errors.push(`${where}: no <author> here and none on the feed`);
    }
    const value = id?.text.trim();
    if (value) {
      if (seenIds.has(value)) errors.push(`${where}: duplicate <id> ${value}`);
      seenIds.add(value);
    }
    linkErrors(entry, where, errors);
  });

  return errors;
}

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const NEWS_NS = "http://www.google.com/schemas/sitemap-news/0.9";

/** An ISO 639 code, optionally with a region, which is what `news:language` accepts. */
const LANGUAGE = /^[a-z]{2,3}(-[A-Za-z]{2,8})?$/;

const ABSOLUTE_URL = /^https?:\/\/[^\s]+$/;

/**
 * Every error a Google News sitemap can carry, in document order. An empty
 * array means the document satisfies the news-sitemap specification: the two
 * namespaces, at most 1,000 `<url>` elements, and a complete `<news:news>`
 * block with a publication name, a language, an RFC-3339 publication date and a
 * title on every one of them.
 */
export function newsSitemapErrors(xml: string): string[] {
  const { root, errors } = parseXml(xml);
  if (!root) return errors;

  if (localName(root.name) !== "urlset") {
    errors.push(`the root element is <${root.name}>, not <urlset>`);
    return errors;
  }
  if (root.attrs.xmlns !== SITEMAP_NS) {
    errors.push(`<urlset> must declare the sitemap namespace ${SITEMAP_NS}`);
  }
  if (root.attrs["xmlns:news"] !== NEWS_NS) {
    errors.push(`<urlset> must declare the news namespace ${NEWS_NS} as xmlns:news`);
  }

  const urls = childrenNamed(root, "url");
  if (urls.length > NEWS_SITEMAP_MAX_ENTRIES) {
    errors.push(`${urls.length} <url> elements exceeds the ${NEWS_SITEMAP_MAX_ENTRIES}-entry limit`);
  }

  const seenLocations = new Set<string>();
  urls.forEach((url, index) => {
    const where = `url ${index + 1}`;
    const location = required(url, "loc", where, errors)?.text.trim();
    if (location) {
      if (!ABSOLUTE_URL.test(location)) errors.push(`${where}: <loc> "${location}" is not an absolute http(s) URL`);
      if (seenLocations.has(location)) errors.push(`${where}: duplicate <loc> ${location}`);
      seenLocations.add(location);
    }

    const news = child(url, "news");
    if (!news) {
      errors.push(`${where}: missing <news:news>`);
      return;
    }
    const publication = child(news, "publication");
    if (!publication) {
      errors.push(`${where}: missing <news:publication>`);
    } else {
      required(publication, "name", `${where} publication`, errors);
      const language = required(publication, "language", `${where} publication`, errors)?.text.trim();
      if (language && !LANGUAGE.test(language)) {
        errors.push(`${where}: <news:language> "${language}" is not a language code`);
      }
    }
    requiredDate(news, "publication_date", `${where} news`, errors);
    required(news, "title", `${where} news`, errors);
  });

  return errors;
}
