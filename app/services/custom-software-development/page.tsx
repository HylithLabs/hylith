import type { Metadata } from "next";
import MarketingPage from "@/components/seo/MarketingPage";
import { getServicePage } from "@/lib/seo/content";
import { serializeJsonLd, servicePageJsonLd } from "@/lib/seo/json-ld";
import { marketingPageMetadata } from "@/lib/seo/metadata";

const page = getServicePage("custom-software-development")!;

export const metadata: Metadata = marketingPageMetadata({
  title: page.seoTitle,
  description: page.description,
  path: "/services/custom-software-development",
  keywords: [page.keywordFocus, ...page.secondaryKeywords],
});

export default function CustomSoftwareDevelopmentPage() {
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
        footerNote="Custom systems are strongest when the codebase reflects the actual business process instead of forcing the team to adapt to generic software."
      />
    </>
  );
}
