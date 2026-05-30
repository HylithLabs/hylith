"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HiArrowLongRight } from "react-icons/hi2";
import Image from "next/image";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Pixels per grid unit in the float path (keep subtle). */
const FLOAT_STEP_PX = 9;

/** Full loop duration — one slow drift through the entire path. */
const FLOAT_LOOP_SECONDS = 32;

/** Drift path: (0,0) → (1,0) → … → (0,0) */
const FLOAT_OFFSETS = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: -1 },
  { x: 2, y: -2 },
  { x: 3, y: -3 },
  { x: 2, y: -2 },
  { x: 2, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 2 },
  { x: -2, y: 2 },
  { x: -3, y: 3 },
  { x: -2, y: 2 },
  { x: -1, y: 2 },
  { x: 0, y: 1 },
  { x: 0, y: 0 },
] as const;

const TEAM_AVATAR_SOURCES = [
  "/assets/JotirmoyCartoon.png",
  "/assets/RaiyanCartoon.png",
  "/assets/nahinCartoon.png",
] as const;

const TILE_SIZE = 109;
const TILE_GAP_X = 160;
const TILE_GAP_Y = 16;

/** Pull top-left outward left & bottom-right outward right (increase for more skew). */
const SKEW_SPREAD = 60;

const RIGHT_COL = TILE_SIZE + TILE_GAP_X;
const CENTER_LEFT = (RIGHT_COL + TILE_SIZE) / 2 - TILE_SIZE / 2;
const ROW2_TOP = TILE_SIZE + TILE_GAP_Y;
const ROW3_TOP = (TILE_SIZE + TILE_GAP_Y) * 2;

/**
 * Five staggered positions — each row picks an image from TEAM_AVATAR_SOURCES.
 * Adding a file to that array alone is not enough; assign it to a slot here.
 */
const AVATAR_TILES = [
  { src: TEAM_AVATAR_SOURCES[2], alt: "Nahin", left: -SKEW_SPREAD, top: 0 },
  { src: TEAM_AVATAR_SOURCES[1], alt: "Raiyan", left: RIGHT_COL, top: 0 },
  {
    src: TEAM_AVATAR_SOURCES[0],
    alt: "Jotirmoy",
    left: CENTER_LEFT,
    top: ROW2_TOP,
  },
  { src: TEAM_AVATAR_SOURCES[1], alt: "Raiyan", left: 0, top: ROW3_TOP },
  {
    src: TEAM_AVATAR_SOURCES[2],
    alt: "Nahin",
    left: RIGHT_COL + SKEW_SPREAD,
    top: ROW3_TOP,
  },
] as const;

const COLLAGE_WIDTH = RIGHT_COL + TILE_SIZE + SKEW_SPREAD * 2;
const COLLAGE_HEIGHT = ROW3_TOP + TILE_SIZE;

const COLLAPSED = {
  scale: 0.9,
  borderRadius: 40,
  backgroundColor: "#0F0B0A",
} as const;

const EXPANDED = {
  scale: 1,
  borderRadius: 0,
  backgroundColor: "#0F0B0A",
} as const;

const PIN_SCROLL_DISTANCE = "+=200%";
const DESKTOP_MQ = "(min-width: 1280px)";

function TeamAvatarCollage({ onImageLoad }: { onImageLoad: () => void }) {
  const collageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const collage = collageRef.current;
      if (!collage) return;

      const tiles = gsap.utils.toArray<HTMLElement>(".avatar-tile", collage);
      if (!tiles.length) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) return;

      const segmentDuration =
        FLOAT_LOOP_SECONDS / (FLOAT_OFFSETS.length - 1);

      const timelines: gsap.core.Timeline[] = [];

      tiles.forEach((tile, index) => {
        gsap.set(tile, { x: 0, y: 0, force3D: true });

        const tl = gsap.timeline({
          repeat: -1,
          delay: index * 0.65,
          defaults: {
            ease: "sine.inOut",
            duration: segmentDuration,
          },
        });

        for (let i = 1; i < FLOAT_OFFSETS.length; i++) {
          const point = FLOAT_OFFSETS[i];
          tl.to(tile, {
            x: point.x * FLOAT_STEP_PX,
            y: point.y * FLOAT_STEP_PX,
          });
        }

        timelines.push(tl);
      });

      return () => {
        timelines.forEach((tl) => tl.kill());
      };
    },
    { scope: collageRef },
  );

  return (
    <div
    id="team"
      ref={collageRef}
      className="team-avatar-collage relative shrink-0 overflow-visible"
    >
      <div
        className="team-avatar-collage__inner relative"
        style={{ width: COLLAGE_WIDTH, height: COLLAGE_HEIGHT }}
      >
        {AVATAR_TILES.map((tile, index) => (
          <div
            key={`avatar-${index}`}
            className="avatar-tile absolute overflow-hidden will-change-transform"
            style={{
              left: tile.left,
              top: tile.top,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          >
            <Image
              src={tile.src}
              alt={tile.alt}
              width={116}
              height={116}
              className="size-full object-cover"
              onLoad={onImageLoad}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const Second = () => {
  const wrapperRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const refreshScroll = () => ScrollTrigger.refresh();

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const section = sectionRef.current;
      if (!wrapper || !section) return;

      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MQ, () => {
        gsap.set(section, {
          ...COLLAPSED,
          transformOrigin: "center center",
        });
        gsap.set(".second-copy", { color: "#EEEEE8" });
        gsap.set(".second-link", { borderColor: "#EEEEE8" });

        const approach = gsap.to(section, {
          ...EXPANDED,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 75%",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });


        const pinned = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: PIN_SCROLL_DISTANCE,
            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        pinned
          .to({}, { duration: 2, ease: "none" })
          .to(section, {
            ...COLLAPSED,
            ease: "none",
            duration: 1,
          })
          .to(
            ".second-copy",
            { color: "#EEEEE8", ease: "none", duration: 1 },
            "<",
          )
          .to(
            ".second-link",
            { borderColor: "#EEEEE8", ease: "none", duration: 1 },
            "<",
          );

        return () => {
          approach.scrollTrigger?.kill();
          approach.kill();
          pinned.scrollTrigger?.kill();
          pinned.kill();
        };
      });

      mm.add("(max-width: 1279px)", () => {
        gsap.set(section, EXPANDED);
        gsap.set(".second-copy", { color: "#0F0B0A" });
        gsap.set(".second-link", { borderColor: "#0F0B0A" });
      });

      requestAnimationFrame(refreshScroll);

      return () => mm.revert();
    },
    { scope: wrapperRef },
  );

  return (
    <section ref={wrapperRef} className="second-wrapper overflow-hidden">
      <div
        ref={sectionRef}
        className="second-section relative min-h-screen w-full px-6 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16 xl:grid xl:min-h-screen xl:grid-cols-2 xl:items-stretch xl:gap-x-28 xl:px-28 xl:py-24"
      >
        {/* Left column */}
        <div className="flex min-w-0 flex-col justify-between gap-14 sm:gap-20 xl:min-h-[calc(100vh-9rem)] xl:gap-0">
          <div className="hidden xl:block xl:pt-8">
            <TeamAvatarCollage onImageLoad={refreshScroll} />
          </div>

          <div className="second-copy mt-8 flex max-w-full flex-col text-3xl leading-[0.9] font-regular tracking-[-0.03em] sm:text-4xl sm:leading-[0.86] md:text-5xl xl:mt-auto xl:max-w-2xl xl:text-6xl xl:leading-[0.8] xl:text-nowrap xl:pb-10">
            <h2 >
              Beautiful form that
            </h2>
            <h2 >
              connects with people and
            </h2>
            <h2 >
              lives beyond trends
            </h2>
          </div>
        </div>

        {/* Right column — headline top-right, links bottom */}
        <div className="mt-14 flex min-w-0 flex-col justify-between gap-16 sm:mt-16 sm:gap-20 xl:mt-0 xl:min-h-[calc(100vh-9rem)] xl:gap-0">
          <div className="second-copy flex w-full flex-col items-end text-right leading-[0.88] font-black tracking-[-0.03em] uppercase xl:pt-10">
            <h2 className="text-[clamp(2.35rem,5.4vw,5.75rem)]">Together,</h2>
            <h2 className="text-[clamp(2.35rem,5.4vw,5.75rem)]">we create</h2>
            <h2 className="text-[clamp(2.35rem,5.4vw,5.75rem)]">solutions</h2>
          </div>

          {/* Mobile links */}
          <div className="mt-6 flex w-full flex-wrap items-end justify-between gap-x-8 gap-y-5 pb-2 sm:justify-end sm:gap-x-20 xl:hidden">
            <a
              href="#work"
              className="second-link second-copy flex h-7 min-w-30 cursor-pointer items-center justify-between gap-3 border-b-2 border-[#0F0B0A] text-[0.95rem] font-medium"
            >
              <span>Our Work</span>
              <HiArrowLongRight size={24} className="shrink-0" />
            </a>
            <a
              href="/signup?callbackUrl=/dashboard/schedule"
              className="second-link second-copy flex h-7 min-w-30 cursor-pointer items-center justify-between gap-3 border-b-2 border-[#0F0B0A] text-[0.95rem] font-medium"
            >
              <span>Discuss</span>
              <HiArrowLongRight size={24} className="shrink-0" />
            </a>
          </div>
        </div>

        {/* Desktop: Our Work ~center, Discuss far right */}
        <div className="pointer-events-none absolute inset-x-28 bottom-20 hidden xl:block">
          <a
            href="#work"
            className="second-link second-copy pointer-events-auto absolute bottom-0 left-[56%] flex h-7 min-w-30 -translate-x-1/2 cursor-pointer items-center justify-between gap-4 border-b-2 border-[#0F0B0A] text-[0.95rem] font-medium"
          >
            <span>Our Work</span>
            <HiArrowLongRight size={24} className="shrink-0" />
          </a>
          <a
            href="/signup?callbackUrl=/dashboard/schedule"
            className="second-link second-copy pointer-events-auto absolute right-0 bottom-0 flex h-7 min-w-30 cursor-pointer items-center justify-between gap-4 border-b-2 border-[#0F0B0A] text-[0.95rem] font-medium"
          >
            <span>Discuss</span>
            <HiArrowLongRight size={24} className="shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Second;
