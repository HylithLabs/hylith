import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingPage from "@/components/seo/MarketingPage";
import { blogPosts, getBlogPost } from "@/lib/seo/content";
import { marketingPageMetadata } from "@/lib/seo/metadata";
import { problemBasedBlogKeywords } from "@/lib/seoKeywords";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  return marketingPageMetadata({
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: [post.keywordFocus, ...problemBasedBlogKeywords],
    type: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <MarketingPage
      eyebrow="Blog"
      title={post.title}
      intro={post.intro}
      keywordFocus={post.keywordFocus}
      sections={post.sections}
      relatedLinks={post.relatedLinks}
      ctaLabel="Talk to Hylith"
      ctaHref="/contact"
      footerNote="The right implementation choices make it easier to launch once and keep improving without rebuilding the whole product."
    />
  );
}
