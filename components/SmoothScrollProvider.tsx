"use client";

import { useEffect } from "react";
import {
  registerLenis,
  scrollToAnchor,
  unregisterLenis,
} from "@/lib/smooth-scroll-anchor";

export default function SmoothScrollProvider() {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });

      registerLenis(lenis);

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

      const onAnchorClick = (event: MouseEvent) => {
        const anchor = (event.target as Element | null)?.closest(
          'a[href^="#"]',
        );
        if (!(anchor instanceof HTMLAnchorElement)) return;

        const hash = anchor.getAttribute("href");
        if (!hash || hash === "#") return;

        if (!scrollToAnchor(hash)) return;

        event.preventDefault();
      };

      document.addEventListener("click", onAnchorClick, true);

      const scrollInitialHash = () => {
        const { hash } = window.location;
        if (hash) scrollToAnchor(hash);
      };

      requestAnimationFrame(scrollInitialHash);

      cleanup = () => {
        window.removeEventListener("resize", refreshScrollTriggers);
        document.removeEventListener("click", onAnchorClick, true);
        ScrollTrigger.scrollerProxy(root, {});
        gsap.ticker.remove(rafCallback);
        unregisterLenis();
        lenis.destroy();
      };
    };

    void init();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
