import type { Metadata } from "next";
import MarketingPage from "@/components/seo/MarketingPage";
import { getServicePage } from "@/lib/seo/content";
import { serializeJsonLd, servicePageJsonLd } from "@/lib/seo/json-ld";
import { marketingPageMetadata } from "@/lib/seo/metadata";

const page = getServicePage("backend-development")!;

export const metadata: Metadata = marketingPageMetadata({
  title: page.seoTitle,
  description: page.description,
  path: "/services/backend-development",
  keywords: [page.keywordFocus, ...page.secondaryKeywords],
});

export default function BackendDevelopmentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(servicePageJsonLd(page)),
        }}
      />
      <MarketingPage
        eyebrow="Services"
        title={page.title}
        intro={page.intro}
        keywordFocus={page.keywordFocus}
        sections={page.sections}
        relatedLinks={page.relatedLinks}
        faqItems={page.faqItems}
        ctaLabel={page.ctaLabel}
        ctaHref="/contact"
        footerNote="Backend work pays off when contracts stay clear, data paths stay explicit, and the team can extend the system without fear."
      />
    </>
  );
}
