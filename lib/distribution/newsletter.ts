import fs from "node:fs/promises";
import path from "node:path";
import type { Article } from "../content";
import { localePath, type Locale } from "../i18n/config";
import { siteUrl } from "../config";
import { brand } from "../brand";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type NewsletterArtifact = {
  schemaVersion: 1;
  subject: string;
  previewText: string;
  canonicalUrl: string;
  html: string;
  text: string;
};

export function createNewsletterArtifact(article: Article, locale: Locale): NewsletterArtifact {
  const fm = article.frontmatter;
  const canonicalUrl = `${siteUrl()}${localePath(locale, `/articles/${article.slug}`)}`;
  const subject = `${brand.name}: ${fm.title}`;
  const text = `${fm.title}\n\n${fm.dek}\n\n${canonicalUrl}\n`;
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head><body><main><p>${escapeHtml(brand.name)}</p><h1>${escapeHtml(fm.title)}</h1><p>${escapeHtml(fm.dek)}</p><p><a href="${escapeHtml(canonicalUrl)}">${locale === "cs" ? "Číst vydání" : "Read the edition"}</a></p></main></body></html>`;
  return { schemaVersion: 1, subject, previewText: fm.dek, canonicalUrl, html, text };
}

export async function writeNewsletterArtifact(article: Article, locale: Locale): Promise<string[]> {
  const artifact = createNewsletterArtifact(article, locale);
  const dir = path.join(process.cwd(), "generated", "newsletters", `${article.frontmatter.date}.${locale}`);
  await fs.mkdir(dir, { recursive: true });
  const htmlFile = path.join(dir, "email.html");
  const textFile = path.join(dir, "email.txt");
  const metaFile = path.join(dir, "metadata.json");
  await Promise.all([
    fs.writeFile(htmlFile, `${artifact.html}\n`, "utf8"),
    fs.writeFile(textFile, artifact.text, "utf8"),
    fs.writeFile(metaFile, `${JSON.stringify({ schemaVersion: 1, subject: artifact.subject, previewText: artifact.previewText, canonicalUrl: artifact.canonicalUrl }, null, 2)}\n`, "utf8"),
  ]);
  return [htmlFile, textFile, metaFile];
}
