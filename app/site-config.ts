import { allSeoKeywords } from "@/lib/seoKeywords";

const defaultSiteUrl = "https://hylith.com";

export const siteConfig = {
  name: "Hylith",
  legalName: "Hylith",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || defaultSiteUrl,
  title: "Hylith | Custom Software & Web Application Development Agency",
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
    name: "Web Application Development",
    href: "/services/web-app-development",
    description:
      "Planning and building fast, scalable web apps with clean architecture, strong UX, and production-ready deployment.",
  },
  {
    name: "SaaS Development",
    href: "/services/saas-development",
    description:
      "Startup-ready SaaS platforms with authentication, onboarding, subscriptions, and room to grow after launch.",
  },
  {
    name: "MVP Development",
    href: "/services/mvp-development",
    description:
      "Focused MVP builds that help founders validate product direction quickly without overbuilding the first version.",
  },
  {
    name: "Backend Engineering",
    href: "/services/backend-development",
    description:
      "Scalable backend systems with clear data flow, maintainable services, and strong foundations for growth.",
  },
  {
    name: "API Development",
    href: "/services/api-development",
    description:
      "Reliable APIs for product integrations, platform extensions, and internal automation across connected systems.",
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
