import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { caseStudies } from "@/lib/seo/content";
import { marketingPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Case Studies",
  description:
    "Selected case study snapshots showing how Hylith approaches SaaS launches, custom software, and API-driven products.",
  path: "/case-studies",
  keywords: [
    "custom software development company",
    "web application development agency",
    "SaaS development company",
    "startup software development",
  ],
});

export default function CaseStudiesPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#EFEFED] text-[#0F0B0A]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <header className="space-y-4 border-b border-black/10 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
            Case Studies
          </p>
          <h1 className="max-w-4xl text-4xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Case studies for startup software and product teams
          </h1>
          <p className="max-w-3xl text-base leading-7 text-black/66 sm:text-lg">
            These summaries show the kind of work Hylith is built around: product
            launches, internal software, backend foundations, and platform expansion.
          </p>
        </header>

        <section className="grid gap-6">
          {caseStudies.map((study, index) => (
            <article
              key={study.title}
              className="rounded-2xl border border-black/8 bg-white/60 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">
                    {study.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-black/64">{study.summary}</p>
                  <p className="mt-4 text-sm leading-6 text-black/72">{study.outcome}</p>
                </div>

                <div className="flex flex-col gap-2 lg:min-w-72">
                  {study.services.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      className="inline-flex items-center gap-2 text-sm font-medium text-black transition hover:opacity-70"
                    >
                      <ArrowRight className="size-4 shrink-0" />
                      <span>{service.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
