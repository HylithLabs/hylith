import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteContact } from "@/app/site-config";
import { marketingPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Contact",
  description:
    "Start a conversation about custom software, web apps, SaaS platforms, MVPs, backend systems, or API development.",
  path: "/contact",
  keywords: [
    "custom software development company",
    "web application development agency",
    "SaaS development company",
    "MVP development services",
  ],
});

export default function ContactPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#EFEFED] text-[#0F0B0A]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <header className="space-y-4 border-b border-black/10 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
            Contact
          </p>
          <h1 className="max-w-4xl text-4xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Let&apos;s talk about your next build
          </h1>
          <p className="max-w-3xl text-base leading-7 text-black/66 sm:text-lg">
            If you are planning a custom software project, web application, SaaS
            launch, MVP, backend rebuild, or API integration, this is the place to
            start.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <div className="space-y-4 rounded-2xl border border-black/8 bg-white/60 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              Email
            </p>
            <a
              href={`mailto:${siteContact.email}`}
              className="inline-flex items-center gap-2 text-xl font-medium text-black transition hover:opacity-70"
            >
              <span>{siteContact.email}</span>
              <ArrowRight className="size-5 shrink-0" />
            </a>
            <p className="text-sm leading-6 text-black/62">
              For project inquiries, include the product goal, current stage, and any
              timeline constraints you already know.
            </p>
          </div>

          <aside className="space-y-4 rounded-2xl border border-black/8 bg-white/60 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              Services
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/services/web-app-development" className="transition hover:opacity-70">
                Web application development agency
              </Link>
              <Link
                href="/services/custom-software-development"
                className="transition hover:opacity-70"
              >
                Custom software development company
              </Link>
              <Link href="/services/saas-development" className="transition hover:opacity-70">
                SaaS development company
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
