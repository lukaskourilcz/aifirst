#!/usr/bin/env tsx
import { getArticle, listArticles } from "../lib/content.js";
import { writeNewsletterArtifact } from "../lib/distribution/newsletter.js";
import { writeArticleDistributionPack } from "../lib/distribution/share.js";
import { LOCALES } from "../lib/i18n/config.js";

async function main() {
  const shareFiles: string[] = [];
  const newsletterFiles: string[] = [];

  for (const locale of LOCALES) {
    const summaries = await listArticles(locale);
    for (const summary of summaries) {
      const article = await getArticle(summary.slug, locale);
      if (!article) continue;
      shareFiles.push(await writeArticleDistributionPack(article, locale));
      if (article.frontmatter.type === "weekly") {
        newsletterFiles.push(...await writeNewsletterArtifact(article, locale));
      }
    }
  }

  console.log(JSON.stringify({
    status: "ok",
    shareFiles: shareFiles.length,
    newsletterFiles: newsletterFiles.length,
  }));
}

main().catch((error) => {
  console.error("[artifacts] FAILED:", error);
  process.exit(1);
});
