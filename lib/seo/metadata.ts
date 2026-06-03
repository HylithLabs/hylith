import type { Metadata } from "next";
import { absoluteUrl, ogImageMetadata, ogImageUrl, siteConfig } from "@/app/site-config";

/** Routes that must not appear in search indexes. */
export const privateRouteMetadata: Metadata = {
  robots: { index: false, follow: false },
};

export function pageTitle(segment: string): Metadata {
  return {
    title: segment,
    description: siteConfig.description,
    ...privateRouteMetadata,
  };
}

type MarketingMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  type?: "website" | "article";
};

export function marketingPageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
}: MarketingMetadataInput): Metadata {
  return {
    title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      images: [ogImageMetadata],
      locale: siteConfig.locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl()],
    },
  };
}
