export const siteConfig = {
  name: "Hylith",
  legalName: "Hylith",
  url: "https://hylith.com",
  title: "Hylith | Modern By Design, Trusted By Purpose",
  description:
    "Hylith designs and builds full-stack systems where logic and interface work as one.",
  ogDescription:
    "Modern product, engineering, and full-stack system design for ambitious businesses.",
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
