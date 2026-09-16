import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/health", "/stats", "/trends", "/colophon"] },
    ],
    // The general sitemap plus the Google News sitemap, which covers only the
    // last two days of editions and is a separate document by specification.
    sitemap: [`${siteUrl()}/sitemap.xml`, `${siteUrl()}/news-sitemap.xml`],
  };
}
