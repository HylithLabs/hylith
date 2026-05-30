"use client";

import Navbar from "@/components/Navbar";
import SmoothScrollBoundary from "@/components/SmoothScrollBoundary";
import HeroSection from "@/pages/HeroSection";
import Second from "@/pages/Second";
import Third from "@/pages/Third";
import Forth from "@/pages/Forth";
import Fifth from "@/pages/Fifth";

export default function HomePage() {
  return (
    <>
      <SmoothScrollBoundary />
      <main id="main-content">
        <Navbar />
        <HeroSection />
        <Second />
        <Third />
        <Forth />
        <Fifth />
      </main>
    </>
  );
}
