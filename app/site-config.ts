const defaultSiteUrl = "https://hylith.com";

export const siteConfig = {
  name: "Hylith",
  legalName: "Hylith",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || defaultSiteUrl,
  title: "Hylith | Modern By Design, Trusted By Purpose",
  description:
    "Hylith designs and builds full-stack systems where logic and interface work as one.",
  ogDescription:
    "Modern product, engineering, and full-stack system design for ambitious businesses.",
  areaServed: "Worldwide",
  sameAs: ["https://hylith.com"] as const,
  /**
   * Social preview image in /public (Open Graph, Twitter, JSON-LD).
   * Bump `ogImageVersion` after replacing the file to bust Discord/slack caches.
   */
  ogImagePath: "/assets/OGImage.png",
  ogImageVersion: "2",
  locale: "en_US",
  keywords: [
    "Hylith",
    "hylith",
    "full-stack systems",
    "product engineering",
    "web development agency",
    "modern web development agency",
    "software design",
    "system design",
    "UI engineering",
  ],
} as const;

export const siteContact = {
  email: "hello@hylith.com",
} as const;

/** Primary services — aligned with on-page copy in `pages/Forth.tsx`. */
export const siteServices = [
  {
    name: "End-to-end product execution",
    description:
      "From the first idea to a live product — strategy, design, development, and launch as one seamless process with zero handoff friction.",
  },
  {
    name: "Web development",
    description:
      "Designs turned into fast, accessible digital products with clean code, modern stack, performance tuning, and SEO fundamentals.",
  },
] as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function ogImageUrl() {
  const path = `${siteConfig.ogImagePath}?v=${siteConfig.ogImageVersion}`;
  return absoluteUrl(path);
}

/** Shared OG/Twitter image object — use in layout AND page metadata (page overrides layout). */
export const ogImageMetadata = {
  url: ogImageUrl(),
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} brand preview`,
  type: "image/png" as const,
};
