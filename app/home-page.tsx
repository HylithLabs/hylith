"use client";

import { useEffect } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/pages/HeroSection";
import Second from "@/pages/Second";
import Third from "@/pages/Third";
import Forth from "@/pages/Forth";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HomePage() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <main>
      <Navbar />
      <HeroSection />
      <Second />
      <Third/>
      <Forth/>
    </main>
  );
}
