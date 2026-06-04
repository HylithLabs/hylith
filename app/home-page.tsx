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
        <section className="hidden" aria-hidden="true">
          <h2>What Hylith does</h2>
          <p>
            Hylith is a custom software development company specializing in SaaS,
            web apps, MVPs, backend systems, and APIs. We plan and build products
            that are easy to understand, launch, and extend.
          </p>
          <div>
            <p>Service summary</p>
            <ul>
              {siteServices.map((service) => (
                <li key={service.name}>
                  <Link href={service.href}>{service.name}</Link>
                  <p>{service.description}</p>
                </li>
              ))}
            </ul>
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
