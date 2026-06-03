import type { MetadataRoute } from "next";
import { blogPosts, servicePages } from "@/lib/seo/content";
import { absoluteUrl, ogImageUrl } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [ogImageUrl()],
    },
    {
      url: absoluteUrl("/case-studies"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [ogImageUrl()],
    },
    {
      url: absoluteUrl("/blog"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [ogImageUrl()],
    },
    {
      url: absoluteUrl("/contact"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [ogImageUrl()],
    },
    {
      url: absoluteUrl("/privacy-policy"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
      images: [ogImageUrl()],
    },
    {
      url: absoluteUrl("/terms-and-conditions"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
      images: [ogImageUrl()],
    },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = servicePages.map((page) => ({
    url: absoluteUrl(`/services/${page.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.9,
    images: [ogImageUrl()],
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
    images: [ogImageUrl()],
  }));

  return [...coreRoutes, ...serviceRoutes, ...blogRoutes];
}
