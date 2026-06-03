import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/seo/content";
import { marketingPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Blog",
  description:
    "Practical startup software articles on SaaS planning, MVP scope, backend architecture, and web app development decisions.",
  path: "/blog",
  keywords: [
    "how to build a SaaS application",
    "cost of building a web app in 2026",
    "MVP development guide for startups",
    "how to build scalable backend architecture",
  ],
});

export default function BlogIndexPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#EFEFED] text-[#0F0B0A]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <header className="space-y-4 border-b border-black/10 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
            Blog
          </p>
          <h1 className="max-w-4xl text-4xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Startup software insights for founders and product teams
          </h1>
          <p className="max-w-3xl text-base leading-7 text-black/66 sm:text-lg">
            These articles are built around the questions founders actually ask when
            planning a web app, a SaaS product, or a new backend foundation.
          </p>
        </header>

        <section className="grid gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-black/8 bg-white/60 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-medium tracking-[-0.04em]">
                    <Link href={`/blog/${post.slug}`} className="hover:opacity-70">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-black/64">{post.description}</p>
                  <p className="mt-3 text-sm font-medium text-black/72">
                    Keyword focus: {post.keywordFocus}
                  </p>
                </div>

                <div className="flex flex-col gap-2 lg:min-w-72">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-black transition hover:opacity-70"
                  >
                    <ArrowRight className="size-4 shrink-0" />
                    <span>Read article</span>
                  </Link>
                  {post.relatedLinks.slice(0, 2).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-2 text-sm text-black/70 transition hover:text-black"
                    >
                      <ArrowRight className="size-4 shrink-0" />
                      <span>{link.label}</span>
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
