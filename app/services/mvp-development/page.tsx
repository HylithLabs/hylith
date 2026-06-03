import type { Metadata } from "next";
import MarketingPage from "@/components/seo/MarketingPage";
import { getServicePage } from "@/lib/seo/content";
import { marketingPageMetadata } from "@/lib/seo/metadata";

const page = getServicePage("mvp-development")!;

export const metadata: Metadata = marketingPageMetadata({
  title: page.seoTitle,
  description: page.description,
  path: "/services/mvp-development",
  keywords: [page.keywordFocus, ...page.secondaryKeywords],
});

export default function MVPDevelopmentPage() {
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
      footerNote="The best MVPs are opinionated. They prove one important thing well enough to justify the next investment."
    />
  );
}
