import type { Metadata } from "next";
import {
  absoluteUrl,
  ogImageMetadata,
  ogImageUrl,
  siteConfig,
} from "@/app/site-config";
import LegalPage, { type LegalSection } from "../legal-page";

const title = "Privacy Policy";
const description =
  "Privacy policy explaining how Hylith collects, uses, and protects information from website visitors, leads, and clients.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/privacy-policy"),
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
    title: "Information We Collect",
    body: [
      "We collect information you choose to provide, such as your name, email address, company details, project notes, messages, scheduling details, and any files or context you share with us.",
      "We may also collect basic technical information, such as device type, browser type, pages visited, referral source, and usage data through analytics tools.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use information to respond to inquiries, schedule calls, prepare proposals, deliver services, manage client relationships, improve our website, maintain security, and meet legal or administrative requirements.",
      "We do not sell your personal information.",
    ],
  },
  {
    title: "Cookies And Analytics",
    body: [
      "Our website may use cookies and analytics technologies to understand traffic, improve performance, and learn how visitors interact with the site.",
      "You can control cookies through your browser settings. Disabling cookies may affect parts of the website experience.",
    ],
  },
  {
    title: "Sharing Information",
    body: [
      "We may share information with service providers who help us operate the website, manage communication, process scheduling, host infrastructure, or deliver project work.",
      "We may also disclose information if required by law, to protect our rights, or to prevent misuse, fraud, or security issues.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We keep information only as long as reasonably needed for the purposes described in this policy, including client communication, project records, legal obligations, security, and business administration.",
      "When information is no longer needed, we take reasonable steps to delete, anonymize, or securely store it.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use reasonable technical and organizational safeguards to protect information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
      "If you believe your information has been affected by a security issue, contact us as soon as possible at hello@hylith.com.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may request access, correction, deletion, or restriction of personal information where applicable law gives you those rights.",
      "To make a privacy request, contact hello@hylith.com. We may need to verify your identity before completing certain requests.",
    ],
  },
  {
    title: "Policy Updates",
    body: [
      "We may update this Privacy Policy as our website, services, tools, or legal obligations change. The latest version will always be posted on this page with the updated date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title={title}
      intro="How we handle information with the same care we bring to product work: only what we need, used clearly, and protected responsibly."
      lastUpdated="June 3, 2026"
      sections={sections}
    />
  );
}
