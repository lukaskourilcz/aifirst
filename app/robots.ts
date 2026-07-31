import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/health", "/stats", "/trends", "/colophon"] },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
