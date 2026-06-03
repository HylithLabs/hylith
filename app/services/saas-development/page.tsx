import type { Metadata } from "next";
import MarketingPage from "@/components/seo/MarketingPage";
import { discoveryMeetingHref } from "@/app/site-config";
import { getServicePage } from "@/lib/seo/content";
import { marketingPageMetadata } from "@/lib/seo/metadata";

const page = getServicePage("saas-development")!;

export const metadata: Metadata = marketingPageMetadata({
  title: page.seoTitle,
  description: page.description,
  path: "/services/saas-development",
  keywords: [page.keywordFocus, ...page.secondaryKeywords],
});

export default function SaaSDevelopmentPage() {
  return (
    <MarketingPage
      eyebrow="Services"
      title={page.title}
      intro={page.intro}
      keywordFocus={page.keywordFocus}
      sections={page.sections}
      relatedLinks={page.relatedLinks}
      faqItems={page.faqItems}
      ctaLabel={page.ctaLabel}
      ctaHref={discoveryMeetingHref}
      footerNote="A SaaS platform usually gets easier to sell when the foundation is simple, visible, and ready for measured growth."
    />
  );
}
