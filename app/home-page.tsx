import Navbar from "@/components/Navbar";
import SmoothScrollBoundary from "@/components/SmoothScrollBoundary";
import HeroSection from "@/pages/HeroSection";
import DeferredSecond from "@/components/deferred-second";
import DeferredThird from "@/components/deferred-third";
import DeferredForth from "@/components/deferred-forth";
import DeferredFifth from "@/components/deferred-fifth";

export default function HomePage() {
  return (
    <>
      <SmoothScrollBoundary />
      <main id="main-content">
        <Navbar />
        <HeroSection />
        <DeferredSecond />
        <DeferredThird />
        <DeferredForth />
        <DeferredFifth />
      </main>
    </>
  );
}
