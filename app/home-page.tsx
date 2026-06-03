import Link from "next/link";
import Navbar from "@/components/Navbar";
import SmoothScrollBoundary from "@/components/SmoothScrollBoundary";
import HeroSection from "@/pages/HeroSection";
import DeferredSecond from "@/components/deferred-second";
import DeferredThird from "@/components/deferred-third";
import DeferredForth from "@/components/deferred-forth";
import DeferredFifth from "@/components/deferred-fifth";
import { siteServices } from "./site-config";

export default function HomePage() {
  return (
    <>
      <SmoothScrollBoundary />
      <main id="main-content">
        <Navbar />
        <HeroSection />
        <section
          aria-labelledby="ai-readable-summary"
          className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10"
        >
          <div className="rounded-2xl border border-black/8 bg-white/60 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
              AI readable summary
            </p>
            <h2
              id="ai-readable-summary"
              className="mt-3 text-2xl font-medium tracking-[-0.04em] sm:text-3xl"
            >
              What Hylith does
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/64 sm:text-base">
              Hylith is a custom software development company specializing in SaaS,
              web apps, MVPs, backend systems, and APIs. We plan and build products
              that are easy to understand, launch, and extend.
            </p>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                Service summary
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {siteServices.map((service) => (
                  <li
                    key={service.name}
                    className="rounded-xl border border-black/8 bg-[#EFEFED]/70 p-4"
                  >
                    <Link
                      href={service.href}
                      className="block text-base font-medium tracking-[-0.02em] text-black transition hover:opacity-70"
                    >
                      {service.name}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-black/62">
                      {service.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <DeferredSecond />
        <DeferredThird />
        <DeferredForth />
        <DeferredFifth />
      </main>
    </>
  );
}
