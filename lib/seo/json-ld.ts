import { absoluteUrl, ogImageUrl, siteConfig, siteContact, siteServices } from "@/app/site-config";
import type { FAQItem } from "@/lib/seo/content";

/** JSON-LD for the marketing homepage — keep in sync with visible on-page copy. */
export function homePageJsonLd() {
  const organizationId = absoluteUrl("/#organization");
  const websiteId = absoluteUrl("/#website");
  const webpageId = absoluteUrl("/#webpage");
  const businessId = absoluteUrl("/#business");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        url: siteConfig.url,
        description: siteConfig.description,
        logo: absoluteUrl("/assets/logo.svg"),
        image: ogImageUrl(),
        email: siteContact.email,
        sameAs: [...siteConfig.sameAs],
      },
      {
        "@type": "ProfessionalService",
        "@id": businessId,
        name: siteConfig.name,
        url: siteConfig.url,
        image: ogImageUrl(),
        description: siteConfig.ogDescription,
        email: siteContact.email,
        parentOrganization: { "@id": organizationId },
        areaServed: siteConfig.areaServed,
        knowsAbout: siteConfig.keywords,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${siteConfig.name} services`,
          itemListElement: siteServices.map((service, index) => ({
            "@type": "Offer",
            position: index + 1,
            itemOffered: {
              "@type": "Service",
              name: service.name,
              description: service.description,
              provider: { "@id": businessId },
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": organizationId },
        inLanguage: "en-US",
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: siteConfig.url,
        name: siteConfig.title,
        description: siteConfig.description,
        isPartOf: { "@id": websiteId },
        about: { "@id": businessId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: ogImageUrl(),
        },
      },
    ],
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function faqPageJsonLd(items: readonly FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
