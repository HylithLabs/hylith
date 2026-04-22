export const siteConfig = {
  name: "Hylith",
  legalName: "Hylith",
  url: "https://hylith.com",
  title: "Hylith | Modern By Design, Trusted By Purpose",
  description:
    "Hylith designs and builds full-stack systems where logic and interface work as one.",
  ogDescription:
    "Modern product, engineering, and full-stack system design for ambitious businesses.",
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
