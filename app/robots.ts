import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "./site-config";

const privatePaths = [
  "/api/",
  "/admin",
  "/dashboard",
  "/login",
  "/signup",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...privatePaths],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
