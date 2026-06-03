import type { Metadata } from "next";
import HomePage from "./home-page";
import { ogImageMetadata, ogImageUrl, siteConfig } from "./site-config";
import { homePageJsonLd, serializeJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.title,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    url: siteConfig.url,
    images: [ogImageMetadata],
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    images: [ogImageUrl()],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(homePageJsonLd()),
        }}
      />
      <HomePage />
    </>
  );
}
