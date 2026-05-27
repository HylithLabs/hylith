"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";

gsap.registerPlugin(useGSAP);

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

const HERO_TILES = [
  {
    src: "/assets/nahinCartoon.png",
    alt: "Nahin",
    bg: "#125E5E",
    row: 0,
    col: 0,
  },
  {
    src: "/assets/RaiyanCartoon.png",
    alt: "Raiyan",
    bg: "#120E0D",
    row: 0,
    col: 2,
  },
  {
    src: "/assets/JotirmoyCartoon.png",
    alt: "Jotirmoy",
    bg: "#C5DF3B",
    row: 1,
    col: 1,
  },
  {
    src: "/assets/RaiyanCartoon.png",
    alt: "Raiyan",
    bg: "#120E0D",
    row: 2,
    col: 0,
  },
  {
    src: "/assets/nahinCartoon.png",
    alt: "Nahin",
    bg: "#125E5E",
    row: 2,
    col: 2,
  },
] as const;

const REVEAL_DELAY = 0.35;
const REVEAL_STAGGER = 0.2;

/** Overflow clip only — outer keeps flex/order classes from the original layout. */
function RevealClip({
  children,
  className = "",
  innerClassName = "",
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={["shrink-0 overflow-hidden pb-0.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={["hero-reveal will-change-transform", innerClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

interface HeroSectionProps {
  isLoaded?: boolean;
}

function DiscussCta({ className = "" }: { className?: string }) {
  return (
    <motion.span
      layoutId="hero-button"
      className={[
        "hero-badge z-50 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full px-6 text-[0.95rem] font-semibold leading-none sm:h-13 lg:h-11 lg:w-auto lg:max-w-none lg:px-5 lg:text-sm lg:whitespace-nowrap xl:h-16 xl:px-10 xl:text-[1.09rem]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={glassBadgeStyle}
      transition={{
        layout: {
          type: "tween",
          ease: "easeInOut",
          duration: 1.2,
        },
      }}
    >
      Discuss Your System
    </motion.span>
  );
}

const HeroSection = ({ isLoaded = true }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root || !isLoaded) return;

      const reveals = gsap.utils.toArray<HTMLElement>(".hero-reveal", root);
      if (!reveals.length) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(reveals, { clearProps: "all" });
        return;
      }

      gsap.set(reveals, { y: 100, opacity: 0 });

      gsap.to(reveals, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: "power1.inOut",
        stagger: REVEAL_STAGGER,
        delay: REVEAL_DELAY,
      });
    },
    { scope: sectionRef, dependencies: [isLoaded] },
  );

  return (
    <section
      ref={sectionRef}
      className="hero section overflow-hidden px-4 pb-10 sm:px-6 sm:pb-12 lg:px-4 lg:pb-8 xl:px-0"
      id="home"
    >
      <div className="mt-5 sm:mt-10 lg:mt-20 xl:mt-24">
        <h1 className="text-left text-[clamp(2.35rem,10.5vw,3.5rem)] leading-[0.94] font-medium uppercase tracking-[-0.03em] sm:text-[clamp(2.75rem,11vw,4rem)] lg:text-center lg:text-[6.8rem] lg:normal-case xl:text-9xl xl:leading-none">
          <RevealClip>
            <span className="block lg:mr-24 xl:mr-72">WE COMPLETE</span>
          </RevealClip>
          <RevealClip className="mt-1.5 sm:mt-2 lg:hidden">
            <span className="block tracking-[-0.05em] leading-none">
              YOUR BUSINESS
            </span>
          </RevealClip>
          <div className="mt-3 hidden w-full lg:block">
            <div className="mx-auto inline-flex w-fit flex-row items-center justify-start gap-4">
              {isLoaded ? (
                <RevealClip className="flex items-center justify-start p-8 -m-8">
                  <DiscussCta />
                </RevealClip>
              ) : (
                <span className="h-11 w-[150px] xl:h-16 xl:w-[200px]" aria-hidden />
              )}
              <RevealClip className="flex items-center">
                <span className="tracking-[-0.05em] leading-none">
                  YOUR BUSINESS
                </span>
              </RevealClip>
            </div>
          </div>
        </h1>
      </div>

      <div className="hero-mobile-copy mt-5 sm:mt-7 lg:mx-auto lg:mt-0 lg:max-w-none lg:pb-20">
        <RevealClip>
          <p className="text-left text-[0.9375rem] leading-[1.35] font-medium tracking-[-0.03em] text-[#666666] sm:text-lg lg:ml-40 lg:text-center lg:text-2xl lg:leading-snug lg:tracking-[-0.05em] xl:ml-96 xl:text-3xl">
            We design and build full-stack systems
          </p>
        </RevealClip>

        <RevealClip className="mt-1 lg:mt-0">
          <p className="text-left text-[0.9375rem] leading-[1.35] font-medium tracking-[-0.03em] text-[#666666] sm:text-lg lg:ml-40 lg:text-center lg:text-2xl lg:leading-snug lg:tracking-[-0.05em] xl:ml-96 xl:text-3xl">
            where logic and interface work as one.
          </p>
        </RevealClip>
      </div>

      <div className="mt-5 w-full sm:mt-6 lg:hidden">
        {isLoaded ? (
          <RevealClip className="w-full">
            <DiscussCta />
          </RevealClip>
        ) : (
          <span className="block h-12 w-full sm:h-13" aria-hidden />
        )}
      </div>

      <div className="hero-mobile-card relative mt-6 sm:mt-8 xl:hidden">
        <div className="hero-mobile-card-inner relative overflow-hidden rounded-[1.125rem] bg-[#0F0B0A] px-4 pb-7 pt-6 shadow-[0_24px_48px_-28px_rgba(15,11,10,0.55)] sm:rounded-[1.5rem] sm:px-7 sm:pb-9 sm:pt-9">
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

          <div className="mt-6 sm:mt-9">
            <RevealClip>
              <h2 className="text-[clamp(2.25rem,11vw,3rem)] leading-[0.92] font-black tracking-[-0.01em] text-white uppercase sm:text-5xl">
                TOGETHER
              </h2>
            </RevealClip>
            <div className="mt-3 flex items-end justify-between gap-4 pr-1">
              <div className="min-w-0 flex-1">
                <RevealClip>
                  <p className="text-[0.875rem] font-medium tracking-[-0.02em] text-[#888888] sm:text-base">
                    Ideas • Logic • Interface
                  </p>
                </RevealClip>
                <RevealClip className="mt-0.5">
                  <p className="text-[0.875rem] font-medium tracking-[-0.02em] text-[#888888] sm:text-base">
                    All Working As One.
                  </p>
                </RevealClip>
              </div>

              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:scale-110 active:scale-95 sm:h-14 sm:w-14"
                aria-hidden
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <defs>
                    <linearGradient
                      id="leftHemisphere"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <linearGradient
                      id="rightHemisphere"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M48,15 C30,15 20,28 20,48 C20,62 28,68 32,72 C36,76 38,82 44,82 C46,82 48,80 48,76 C48,72 44,70 44,66 C44,62 48,60 48,54 C48,48 44,46 44,40 C44,34 48,32 48,26 Z"
                    fill="url(#leftHemisphere)"
                  />
                  <path
                    d="M52,15 C70,15 80,28 80,48 C80,62 72,68 68,72 C64,76 62,82 56,82 C54,82 52,80 52,76 C52,72 56,70 56,66 C56,62 52,60 52,54 C52,48 56,46 56,40 C56,34 52,32 52,26 Z"
                    fill="url(#rightHemisphere)"
                  />
                  <circle
                    cx="48"
                    cy="22"
                    r="2.5"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                  <circle
                    cx="52"
                    cy="22"
                    r="2.5"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                  <circle cx="42" cy="36" r="2" fill="#ffffff" opacity="0.7" />
                  <circle cx="58" cy="36" r="2" fill="#ffffff" opacity="0.7" />
                  <circle cx="34" cy="50" r="2" fill="#ffffff" opacity="0.6" />
                  <circle cx="66" cy="50" r="2" fill="#ffffff" opacity="0.6" />
                  <circle
                    cx="44"
                    cy="62"
                    r="1.8"
                    fill="#ffffff"
                    opacity="0.7"
                  />
                  <circle
                    cx="56"
                    cy="62"
                    r="1.8"
                    fill="#ffffff"
                    opacity="0.7"
                  />
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
