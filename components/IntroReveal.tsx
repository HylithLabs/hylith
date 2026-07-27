"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useIntro } from "@/components/intro-context";

const EASE = [0.22, 1, 0.36, 1] as const;

type IntroRevealProps = {
  children: React.ReactNode;
  className?: string;
};

/** Slides children down from above the viewport once the home preloader finishes. */
export function IntroFromTop({ children, className = "" }: IntroRevealProps) {
  const { introComplete } = useIntro();
  const shouldReduceMotion = useReducedMotion();
  const show = shouldReduceMotion || introComplete;
  const ref = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(
    () => shouldReduceMotion === true || introComplete,
  );

  useLayoutEffect(() => {
    if (!settled || !ref.current) return;
    // translateY(0) still creates a containing block and breaks ScrollTrigger pin.
    ref.current.style.transform = "none";
  }, [settled]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={settled ? false : show ? { y: 0 } : { y: "-120%" }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.95,
        ease: EASE,
        delay: show && !shouldReduceMotion && !settled ? 0.04 : 0,
      }}
      onAnimationComplete={() => {
        if (show) setSettled(true);
      }}
    >
      {children}
    </motion.div>
  );
}

type IntroFromBottomProps = IntroRevealProps & {
  /**
   * After the slide finishes, strip the transform so GSAP ScrollTrigger
   * pinning keeps working (transform on an ancestor breaks position:fixed).
   */
  releaseTransform?: boolean;
};

/** Slides children up from below the viewport once the home preloader finishes. */
export function IntroFromBottom({
  children,
  className = "",
  releaseTransform = false,
}: IntroFromBottomProps) {
  const { introComplete } = useIntro();
  const shouldReduceMotion = useReducedMotion();
  const show = shouldReduceMotion || introComplete;
  const ref = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(
    () => shouldReduceMotion === true || introComplete,
  );

  useLayoutEffect(() => {
    if (!settled || !releaseTransform || !ref.current) return;
    ref.current.style.transform = "none";
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
    });
  }, [settled, releaseTransform]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={settled ? false : show ? { y: 0 } : { y: "100%" }}
      transition={{
        duration: shouldReduceMotion ? 0 : 1.05,
        ease: EASE,
        delay: show && !shouldReduceMotion && !settled ? 0.1 : 0,
      }}
      onAnimationComplete={() => {
        if (show) setSettled(true);
      }}
    >
      {children}
    </motion.div>
  );
}

type IntroFadeInProps = IntroRevealProps & {
  /** Extra delay after intro completes, in seconds. */
  delay?: number;
};

/** Fades/scales children in once the home preloader finishes. */
export function IntroFadeIn({
  children,
  className = "",
  delay = 0.22,
}: IntroFadeInProps) {
  const { introComplete } = useIntro();
  const shouldReduceMotion = useReducedMotion();
  const show = shouldReduceMotion || introComplete;

  return (
    <motion.div
      className={className}
      initial={false}
      animate={
        show
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 18, scale: 0.92 }
      }
      transition={{
        duration: shouldReduceMotion ? 0 : 0.85,
        ease: EASE,
        delay: show && !shouldReduceMotion ? delay : 0,
      }}
    >
      {children}
    </motion.div>
  );
}
