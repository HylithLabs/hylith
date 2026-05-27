import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl(siteConfig.ogImagePath)],
    },
  ];
}
