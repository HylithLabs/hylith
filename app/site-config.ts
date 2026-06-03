import { allSeoKeywords } from "@/lib/seoKeywords";

const defaultSiteUrl = "https://hylith.com";

export const siteConfig = {
  name: "Hylith",
  legalName: "Hylith",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || defaultSiteUrl,
  title: "Hylith | Custom Software & Web App Development Agency",
  description:
    "Hylith builds custom web applications, SaaS platforms, MVPs, and scalable backend systems for startups and businesses.",
  ogDescription:
    "Custom software, web apps, SaaS, MVPs, backend systems, and API development for ambitious startups and growing teams.",
  areaServed: "Worldwide",
  sameAs: ["https://hylith.com"] as const,
  /**
   * Social preview image in /public (Open Graph, Twitter, JSON-LD).
   * Bump `ogImageVersion` after replacing the file to bust Discord/slack caches.
   */
  ogImagePath: "/assets/OGImage.png",
  ogImageVersion: "2",
  locale: "en_US",
  keywords: allSeoKeywords,
} as const;

export const siteContact = {
  email: "hello@hylith.com",
} as const;

export const discoveryMeetingHref = "/signup?callbackUrl=/dashboard/schedule" as const;

export const siteServices = [
  {
    name: "Web application development",
    description:
      "Planning and building fast, scalable web apps with clean architecture, strong UX, and production-ready deployment.",
  },
  {
    name: "Custom software development",
    description:
      "Tailored software systems for internal tools, customer portals, and operational workflows that need to fit the business precisely.",
  },
  {
    name: "SaaS and MVP development",
    description:
      "Startup-focused product builds that help founders validate quickly, launch faster, and evolve the platform without rework.",
  },
  {
    name: "Backend and API development",
    description:
      "Scalable backend services and APIs with reliable data flows, integration points, and long-term maintainability.",
  },
] as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function ogImageUrl() {
  const path = `${siteConfig.ogImagePath}?v=${siteConfig.ogImageVersion}`;
  return absoluteUrl(path);
}

export const ogImageMetadata = {
  url: ogImageUrl(),
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} brand preview`,
  type: "image/png" as const,
};
