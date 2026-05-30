import type { Metadata } from "next";
import { siteConfig } from "@/app/site-config";

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
