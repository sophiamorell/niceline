import type { MetadataRoute } from "next";
import { site } from "@/content";

/**
 * /sitemap.xml. One page today. /line-check stays out while it's a noindex
 * prototype; add it here when it leaves prototype, and each blog post when
 * there is a blog.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://${site.domain}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
