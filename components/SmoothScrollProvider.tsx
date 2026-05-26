"use client";

import { useEffect } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    const root = document.documentElement;

    ScrollTrigger.scrollerProxy(root, {
      scrollTop(value?: number) {
        if (value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: root.style.transform ? "transform" : "fixed",
    });

    const refreshScrollTriggers = () => ScrollTrigger.refresh();

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    requestAnimationFrame(refreshScrollTriggers);

    if ("fonts" in document) {
      void document.fonts.ready.then(refreshScrollTriggers);
    }

    window.addEventListener("resize", refreshScrollTriggers);
    window.addEventListener("load", refreshScrollTriggers, { once: true });

    return () => {
      window.removeEventListener("resize", refreshScrollTriggers);
      ScrollTrigger.scrollerProxy(root, {});
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
    };
  }, []);

  return null;
}
