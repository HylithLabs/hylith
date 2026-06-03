import Link from "next/link";
import Navbar from "@/components/Navbar";
import SmoothScrollBoundary from "@/components/SmoothScrollBoundary";

export type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export default function LegalPage({
  eyebrow,
  title,
  intro,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <>
      <SmoothScrollBoundary />
      <main
        id="main-content"
        className="relative min-h-screen overflow-hidden bg-[#EFEFED] text-[#0F0B0A]"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-24 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-white/50 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-36 top-80 h-80 w-80 rounded-full bg-[#C5DF3B]/20 blur-3xl"
          aria-hidden
        />

        <Navbar />

        <section className="relative mx-auto flex w-full max-w-[1340px] flex-col px-4 pb-16 pt-8 sm:px-6 sm:pb-20 md:px-8 lg:px-10 lg:pt-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0F0B0A]/52">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl text-[clamp(3rem,9vw,7.4rem)] font-medium leading-[0.92] tracking-[-0.06em]">
                {title}
              </h1>
            </div>

            <div className="rounded-[1.5rem] border border-white/70 bg-white/45 p-5 shadow-[0_24px_70px_rgba(15,11,10,0.08)] backdrop-blur-xl sm:p-7 lg:mb-3">
              <p className="text-base font-medium leading-7 tracking-[-0.03em] text-[#0F0B0A]/68 sm:text-lg">
                {intro}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#0F0B0A]/10 pt-4 text-sm font-medium text-[#0F0B0A]/54">
                <span>Last updated: {lastUpdated}</span>
                <Link
                  href="mailto:hello@hylith.com"
                  className="rounded-full bg-[#0F0B0A] px-4 py-2 text-[#EFEFED] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,11,10,0.18)]"
                >
                  hello@hylith.com
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
            <aside className="hidden lg:block">
              <div className="sticky top-8 rounded-[1.35rem] bg-[#0F0B0A] p-5 text-[#EFEFED] shadow-[0_24px_70px_rgba(15,11,10,0.22)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#EFEFED]/48">
                  On This Page
                </p>
                <nav className="mt-5 flex flex-col gap-3 text-sm font-medium text-[#EFEFED]/72">
                  {sections.map((section) => (
                    <a
                      key={section.title}
                      href={`#${slugify(section.title)}`}
                      className="transition hover:text-[#EFEFED]"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="rounded-[1.75rem] bg-white/60 p-5 shadow-[0_24px_70px_rgba(15,11,10,0.07)] ring-1 ring-white/70 backdrop-blur-xl sm:p-8 lg:p-10">
              <div className="space-y-10">
                {sections.map((section, index) => (
                  <section
                    key={section.title}
                    id={slugify(section.title)}
                    className="scroll-mt-8 border-b border-[#0F0B0A]/10 pb-10 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0F0B0A] text-sm font-semibold text-[#EFEFED]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h2 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                          {section.title}
                        </h2>
                        <div className="mt-4 space-y-4 text-[0.98rem] leading-7 tracking-[-0.02em] text-[#0F0B0A]/64 sm:text-[1.05rem]">
                          {section.body.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
