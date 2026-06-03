import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/lib/seo/content";
import { faqPageJsonLd, serializeJsonLd } from "@/lib/seo/json-ld";

type FAQProps = {
  items: readonly FAQItem[];
  title?: string;
  description?: string;
  id?: string;
};

export default function FAQ({
  items,
  title = "Frequently asked questions",
  description = "Straightforward answers to common questions about planning, pricing, and delivery.",
  id = "faq",
}: FAQProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-black/10 pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(faqPageJsonLd(items)),
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] lg:gap-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
            FAQ
          </p>
          <h2
            id={`${id}-title`}
            className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl"
          >
            {title}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-black/60 sm:text-base">
            {description}
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-black/8 bg-white/70 p-5 shadow-sm transition hover:border-black/12"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-medium leading-6 text-black outline-none">
                <span>{item.question}</span>
                <ChevronDown className="mt-0.5 size-4 shrink-0 text-black/45 transition group-open:rotate-180" />
              </summary>
              <div className="mt-4 max-w-3xl text-sm leading-7 text-black/64 sm:text-[0.98rem]">
                <p className="whitespace-pre-line">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
