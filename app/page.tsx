"use client";
import Navbar from "@/components/Navbar";
import Lenis from "lenis";
import { useEffect } from "react";
import HeroSection from "@/pages/HeroSection";
import Second from "@/pages/Second";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
    });

    // GSAP <-> Lenis sync
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
    </main>
  );
}