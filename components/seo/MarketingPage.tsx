import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RelatedLink, SeoSection } from "@/lib/seo/content";

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  keywordFocus: string;
  sections: readonly SeoSection[];
  relatedLinks: readonly RelatedLink[];
  ctaLabel: string;
  ctaHref: string;
  footerNote?: string;
};

export default function MarketingPage({
  eyebrow,
  title,
  intro,
  keywordFocus,
  sections,
  relatedLinks,
  ctaLabel,
  ctaHref,
  footerNote,
}: MarketingPageProps) {
  return (
    <main id="main-content" className="min-h-screen bg-[#EFEFED] text-[#0F0B0A]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <header className="grid gap-8 border-b border-black/10 pb-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:gap-12">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
              {eyebrow}
            </p>
            <h1 className="max-w-4xl text-4xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-black/66 sm:text-lg">
              {intro}
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-black/8 bg-white/60 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                Keyword focus
              </p>
              <p className="mt-3 text-lg font-medium leading-7">{keywordFocus}</p>
            </div>

            <div className="rounded-2xl border border-black/8 bg-white/60 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                Related links
              </p>
              <nav className="mt-4 flex flex-col gap-3 text-sm">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 text-black/76 transition hover:text-black"
                  >
                    <ArrowRight className="size-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <Link
              href={ctaHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0F0B0A] px-5 py-3 text-sm font-medium text-[#EFEFED] transition hover:-translate-y-0.5 hover:bg-black"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </aside>
        </header>

        <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
          <div className="space-y-10">
            {sections.map((section, index) => (
              <section
                key={section.heading}
                className="border-b border-black/10 pb-10 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0F0B0A] text-sm font-semibold text-[#EFEFED]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4 text-[0.98rem] leading-7 text-black/64 sm:text-[1.03rem]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-black/8 bg-white/60 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                Contact
              </p>
              <p className="mt-3 text-sm leading-6 text-black/64">
                Start a project conversation, ask about scope, or compare options for
                your product roadmap.
              </p>
              <Link
                href={ctaHref}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-black transition hover:opacity-70"
              >
                <ArrowRight className="size-4 shrink-0" />
                <span>{ctaLabel}</span>
              </Link>
            </div>

            {footerNote ? (
              <div className="rounded-2xl border border-black/8 bg-white/60 p-5 text-sm leading-6 text-black/62 shadow-sm">
                {footerNote}
              </div>
            ) : null}
          </aside>
        </article>
      </div>
    </main>
  );
}
