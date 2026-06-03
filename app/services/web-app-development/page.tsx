import type { Metadata } from "next";
import MarketingPage from "@/components/seo/MarketingPage";
import { discoveryMeetingHref } from "@/app/site-config";
import { getServicePage } from "@/lib/seo/content";
import { marketingPageMetadata } from "@/lib/seo/metadata";

const page = getServicePage("web-app-development")!;

export const metadata: Metadata = marketingPageMetadata({
  title: page.seoTitle,
  description: page.description,
  path: "/services/web-app-development",
  keywords: [page.keywordFocus, ...page.secondaryKeywords],
});

export default function WebAppDevelopmentPage() {
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
      footerNote="Web application projects work best when product thinking and delivery live in the same room from the start."
    />
  );
}
