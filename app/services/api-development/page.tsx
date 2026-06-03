import type { Metadata } from "next";
import MarketingPage from "@/components/seo/MarketingPage";
import { getServicePage } from "@/lib/seo/content";
import { marketingPageMetadata } from "@/lib/seo/metadata";

const page = getServicePage("api-development")!;

export const metadata: Metadata = marketingPageMetadata({
  title: page.seoTitle,
  description: page.description,
  path: "/services/api-development",
  keywords: [page.keywordFocus, ...page.secondaryKeywords],
});

export default function ApiDevelopmentPage() {
  return (
    <MarketingPage
      eyebrow="Services"
      title={page.title}
      intro={page.intro}
      keywordFocus={page.keywordFocus}
      sections={page.sections}
      relatedLinks={page.relatedLinks}
      ctaLabel={page.ctaLabel}
      ctaHref="/contact"
      footerNote="An API is easiest to trust when its shape is predictable enough for both internal teams and external systems to rely on it."
    />
  );
}
