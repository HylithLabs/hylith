"use client";

import React, { useEffect, useRef } from "react";

const HeroSection = () => {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  /* Subtle stagger-in on mount for a modern feel */
  useEffect(() => {
    const els = [badgeRef.current, headingRef.current, descRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      el.style.transition = `opacity 0.7s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.12}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.12}s`;
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    });
  }, []);

  return (
    <section
      className="hero section overflow-hidden px-4 sm:px-6 xl:px-0"
      id="home"
    >
      <div className="mt-12 sm:mt-16 lg:mt-20 xl:mt-24">
        <h1
          ref={headingRef}
          className="text-center text-[clamp(2.9rem,14vw,5.6rem)] leading-[0.92] font-medium sm:text-[clamp(4.8rem,12vw,7rem)] lg:text-[6.8rem] xl:text-9xl xl:leading-none"
        >
          <span className="block tracking-[-0.03em] lg:mr-24 xl:mr-72">
            WE COMPLETE
          </span>
          <span className="mx-auto flex flex-col items-center justify-center gap-3 sm:gap-4 lg:flex-row">
            <span
              ref={badgeRef}
              className="hero-badge inline-flex h-11 max-w-full cursor-pointer items-center rounded-full px-5 text-sm font-semibold leading-none whitespace-nowrap sm:h-12 sm:px-7 sm:text-[1rem] xl:h-16 xl:px-10 xl:text-[1.09rem]"
              style={{
                letterSpacing: "0",
                background: "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: `
                  0 10px 40px -10px rgba(0, 0, 0, 0.08),
                  0 4px 15px 0px rgba(0, 0, 0, 0.04),
                  inset 0 2px 4px 0px rgba(255, 255, 255, 0.8),
                  inset 0 -2px 4px 0px rgba(0, 0, 0, 0.05)
                `,
              }}
            >
              Discuss Your System
            </span>
            <span className="tracking-[-0.05em]">YOUR BUSINESS</span>
          </span>
        </h1>
      </div>
      <div ref={descRef} className="pb-16 sm:pb-20">
        {/* Responsive: on mobile, text stacks naturally with smaller font.
            On large screens, maintains the original left-offset layout. */}
        <p className="mx-auto max-w-[36rem] text-center text-lg font-medium tracking-[-0.03em] text-[#666666] capitalize sm:text-2xl sm:tracking-[-0.05em] lg:ml-40 lg:max-w-none xl:ml-96 xl:text-3xl">
          We design and build full-stack systems
        </p>
        <p className="mx-auto max-w-[36rem] text-center text-lg font-medium tracking-[-0.03em] text-[#666666] capitalize sm:text-2xl sm:tracking-[-0.05em] lg:ml-40 lg:max-w-none xl:ml-96 xl:text-3xl">
          where logic and interface work as one.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
