import type { Metadata } from "next";
import HomePage from "./home-page";
import { ogImageMetadata, ogImageUrl, siteConfig } from "./site-config";
import { homePageJsonLd, serializeJsonLd } from "@/lib/seo/json-ld";

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
    images: [ogImageMetadata],
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
