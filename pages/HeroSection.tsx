"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

const glassBadgeStyle = {
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
} as const;

/* ── Mobile hero collage tile data ── */
const HERO_TILES = [
  { src: "/assets/nahinCartoon.png", alt: "Nahin", bg: "#125E5E", row: 0, col: 0 },
  { src: "/assets/RaiyanCartoon.png", alt: "Raiyan", bg: "#120E0D", row: 0, col: 2 },
  { src: "/assets/JotirmoyCartoon.png", alt: "Jotirmoy", bg: "#C5DF3B", row: 1, col: 1 },
  { src: "/assets/RaiyanCartoon.png", alt: "Raiyan", bg: "#120E0D", row: 2, col: 0 },
  { src: "/assets/nahinCartoon.png", alt: "Nahin", bg: "#125E5E", row: 2, col: 2 },
] as const;

const HeroSection = () => {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [badgeRef.current, headingRef.current, descRef.current, cardRef.current];
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
      className="hero section overflow-hidden px-5 pb-8 sm:px-6 sm:pb-10 lg:px-4 xl:px-0"
      id="home"
    >
      <div className="mt-8 sm:mt-12 lg:mt-20 xl:mt-24">
        <h1
          ref={headingRef}
          className="text-left text-[clamp(2.65rem,11.5vw,3.75rem)] leading-[0.92] font-medium uppercase tracking-[-0.03em] sm:text-[clamp(3rem,12vw,4.25rem)] lg:text-center lg:text-[6.8rem] lg:normal-case xl:text-9xl xl:leading-none"
        >
          <span className="block lg:mr-24 xl:mr-72">WE COMPLETE</span>

          <span className="mt-3 flex flex-col items-start gap-4 lg:mx-auto lg:mt-0 lg:flex-row lg:items-center lg:justify-center lg:gap-4">
            <span
              ref={badgeRef}
              className="hero-badge order-2 inline-flex h-12 w-full max-w-[17.5rem] cursor-pointer items-center justify-center rounded-full px-6 text-[0.95rem] font-semibold leading-none lg:order-1 lg:h-11 lg:w-auto lg:max-w-none lg:px-5 lg:text-sm lg:whitespace-nowrap xl:h-16 xl:px-10 xl:text-[1.09rem]"
              style={glassBadgeStyle}
            >
              Discuss Your System
            </span>
            <span className="order-1 tracking-[-0.05em] lg:order-2">
              YOUR BUSINESS
            </span>
          </span>
        </h1>
      </div>

      <div
        ref={descRef}
        className="mt-8 max-w-[22rem] sm:mt-10 sm:max-w-md lg:mx-auto lg:mt-0 lg:max-w-none lg:pb-20"
      >
        <p className="text-left text-base leading-snug font-medium tracking-[-0.03em] text-[#666666] capitalize sm:text-lg lg:ml-40 lg:max-w-none lg:text-center lg:text-2xl lg:tracking-[-0.05em] xl:ml-96 xl:text-3xl">
          We Design And Build Full-Stack Systems
        </p>
        <p className="mt-1 text-left text-base leading-snug font-medium tracking-[-0.03em] text-[#666666] capitalize sm:text-lg lg:mt-0 lg:ml-40 lg:max-w-none lg:text-center lg:text-2xl lg:tracking-[-0.05em] xl:ml-96 xl:text-3xl">
          Where Logic And Interface Work As One.
        </p>
      </div>

      {/* ── Mobile / Tablet: Dark team card ── */}
      <div
        ref={cardRef}
        className="hero-mobile-card relative mt-8 sm:mt-10 xl:hidden"
      >
        <div className="relative overflow-visible rounded-[1.25rem] bg-[#0F0B0A] px-5 pb-8 pt-7 sm:rounded-[1.5rem] sm:px-7 sm:pb-9 sm:pt-9">
          {/* Avatar collage grid */}
          <div className="hero-collage-grid mx-auto">
            {HERO_TILES.map((tile, i) => (
              <div
                key={`hero-tile-${i}`}
                className="hero-collage-tile overflow-hidden"
                style={{
                  gridRow: tile.row + 1,
                  gridColumn: tile.col + 1,
                  backgroundColor: tile.bg,
                }}
              >
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  width={116}
                  height={116}
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Bottom text & logo badge */}
          <div className="mt-7 sm:mt-9">
            <h2 className="text-[2.65rem] leading-[0.9] font-black tracking-[-0.01em] text-white uppercase sm:text-5xl">
              TOGETHER
            </h2>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[0.9rem] font-medium tracking-[-0.02em] text-[#888888] sm:text-base">
                  Ideas • Logic • Interface
                </p>
                <p className="mt-0.5 text-[0.9rem] font-medium tracking-[-0.02em] text-[#888888] sm:text-base">
                  All Working As One.
                </p>
              </div>

              {/* Colorful gradient brain badge overlapping the bottom-right edge */}
              <div className="absolute -bottom-3 -right-2 z-10 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95 sm:h-14 sm:w-14">
                <svg
                  viewBox="0 0 100 100"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="leftHemisphere" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <linearGradient id="rightHemisphere" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  
                  {/* Left Hemisphere (Pink-to-Purple Gradient) */}
                  <path
                    d="M48,15 C30,15 20,28 20,48 C20,62 28,68 32,72 C36,76 38,82 44,82 C46,82 48,80 48,76 C48,72 44,70 44,66 C44,62 48,60 48,54 C48,48 44,46 44,40 C44,34 48,32 48,26 Z"
                    fill="url(#leftHemisphere)"
                  />
                  
                  {/* Right Hemisphere (Blue-to-Teal Gradient) */}
                  <path
                    d="M52,15 C70,15 80,28 80,48 C80,62 72,68 68,72 C64,76 62,82 56,82 C54,82 52,80 52,76 C52,72 56,70 56,66 C56,62 52,60 52,54 C52,48 56,46 56,40 C56,34 52,32 52,26 Z"
                    fill="url(#rightHemisphere)"
                  />
                  
                  {/* Styled central line / brain folds details */}
                  <circle cx="48" cy="22" r="2.5" fill="#ffffff" opacity="0.8" />
                  <circle cx="52" cy="22" r="2.5" fill="#ffffff" opacity="0.8" />
                  <circle cx="42" cy="36" r="2" fill="#ffffff" opacity="0.7" />
                  <circle cx="58" cy="36" r="2" fill="#ffffff" opacity="0.7" />
                  <circle cx="34" cy="50" r="2" fill="#ffffff" opacity="0.6" />
                  <circle cx="66" cy="50" r="2" fill="#ffffff" opacity="0.6" />
                  <circle cx="44" cy="62" r="1.8" fill="#ffffff" opacity="0.7" />
                  <circle cx="56" cy="62" r="1.8" fill="#ffffff" opacity="0.7" />
                </svg>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
