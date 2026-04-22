import type { Metadata } from "next";
import HomePage from "./home-page";
import { absoluteUrl, siteConfig } from "./site-config";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    url: siteConfig.url,
  },
  twitter: {
    title: siteConfig.title,
    description: siteConfig.ogDescription,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: siteConfig.name,
      legalName: siteConfig.legalName,
      url: siteConfig.url,
      description: siteConfig.description,
      logo: absoluteUrl("/assets/logo.svg"),
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      publisher: {
        "@id": absoluteUrl("/#organization"),
      },
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": absoluteUrl("/#webpage"),
      url: siteConfig.url,
      name: siteConfig.title,
      description: siteConfig.description,
      isPartOf: {
        "@id": absoluteUrl("/#website"),
      },
      about: {
        "@id": absoluteUrl("/#organization"),
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomePage />
    </>
  );
}
