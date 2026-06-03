import type { Metadata } from "next";
import {
  absoluteUrl,
  ogImageMetadata,
  ogImageUrl,
  siteConfig,
} from "@/app/site-config";
import LegalPage, { type LegalSection } from "../legal-page";

const title = "Terms And Conditions";
const description =
  "Terms and conditions for using Hylith's website, services, and digital product work.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/terms-and-conditions"),
    siteName: siteConfig.name,
    images: [ogImageMetadata],
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImageUrl()],
  },
};

const sections: LegalSection[] = [
  {
    title: "Agreement To These Terms",
    body: [
      "By accessing hylith.com, booking a consultation, or working with Hylith, you agree to these Terms and Conditions. If you do not agree with these terms, please do not use the website or services.",
      "These terms apply to website visitors, prospective clients, and clients unless a separate written agreement says otherwise.",
    ],
  },
  {
    title: "Our Services",
    body: [
      "Hylith designs and builds digital products, websites, interfaces, and full-stack systems. Project scope, timelines, fees, deliverables, and responsibilities are defined in the relevant proposal, statement of work, invoice, or written agreement.",
      "We may update, refine, or discontinue parts of the website at any time to keep the experience accurate and useful.",
    ],
  },
  {
    title: "Client Responsibilities",
    body: [
      "Clients are responsible for providing accurate information, timely feedback, required access, brand assets, approvals, and any content needed to complete agreed work.",
      "Delays in feedback, approvals, content, payments, or access may affect timelines and delivery dates.",
    ],
  },
  {
    title: "Payments And Project Changes",
    body: [
      "Payment terms are provided in the applicable proposal, invoice, or agreement. Unless agreed otherwise, invoices must be paid by the due date shown on the invoice.",
      "Requests outside the agreed scope may require a separate estimate, timeline adjustment, or written approval before work begins.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "Unless a separate written agreement says otherwise, project deliverables transfer to the client after full payment has been received, excluding Hylith's pre-existing tools, reusable code, processes, templates, and know-how.",
      "Hylith may display completed work in portfolios, case studies, proposals, and marketing materials unless confidentiality terms or a written agreement restrict this.",
    ],
  },
  {
    title: "Website Use",
    body: [
      "You agree not to misuse the website, attempt to disrupt its operation, copy content without permission, introduce malicious code, or use the website in a way that violates applicable laws.",
      "Website content is provided for general information. We aim for accuracy, but we do not guarantee that every detail is complete, current, or error-free.",
    ],
  },
  {
    title: "Limitation Of Liability",
    body: [
      "To the fullest extent permitted by law, Hylith is not liable for indirect, incidental, consequential, special, or punitive damages arising from website use or services.",
      "Our total liability for service-related claims is limited to the amount paid for the specific work giving rise to the claim, unless applicable law requires otherwise.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about these terms can be sent to hello@hylith.com. We may update these terms from time to time, and the latest version will be posted on this page.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={title}
      intro="The practical ground rules for using our website and working with Hylith. Clear expectations make better projects, fewer surprises, and smoother collaboration."
      lastUpdated="June 3, 2026"
      sections={sections}
    />
  );
}
