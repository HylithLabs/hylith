import type Lenis from "lenis";

const ANCHOR_OFFSET = -48;
const SCROLL_DURATION = 3;

/** Cubic ease-in-out (0 → 1). */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const scrollOptions = {
  offset: ANCHOR_OFFSET,
  duration: SCROLL_DURATION,
  easing: easeInOut,
} as const;

let lenisRef: Lenis | null = null;

export function registerLenis(lenis: Lenis) {
  lenisRef = lenis;
}

export function unregisterLenis() {
  lenisRef = null;
}

export function scrollToAnchor(hash: string) {
  if (!hash.startsWith("#") || hash === "#") return false;

  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return false;

  if (lenisRef) {
    lenisRef.scrollTo(target, scrollOptions);
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.history.pushState(null, "", hash);
  return true;
}

export function scrollToTop() {
  if (lenisRef) {
    lenisRef.scrollTo(0, { duration: SCROLL_DURATION, easing: easeInOut });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
