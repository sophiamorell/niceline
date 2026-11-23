import type { MetadataRoute } from "next";
import { release, site } from "@/content";
import { willTheyFindYou } from "@/content-durango";

/**
 * /sitemap.xml. The home page, plus the Durango landing page once it is listed
 * in the nav (release.showDurangoNav). /line-check stays out while it's a noindex
 * prototype; add it here when it leaves prototype, and each blog post when
 * there is a blog.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    {
      url: `https://${site.domain}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
  if (release.showDurangoNav) {
    pages.push({
      url: `https://${site.domain}${willTheyFindYou.path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }
  return pages;
}
