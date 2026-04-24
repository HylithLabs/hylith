"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { WordRotate } from "@/components/ui/word-rotate";
import { ArrowRight, Globe, Link2, MessageCircleMore } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WHAT_WE_DO = [
  "World-Class Digital",
  "Collaborate Success",
  "Full-Bunch Fridays",
  "Unlock Potential",
  "Outstanding Service",
  "Celebrate Success",
  "Exceed Expectations",
  "Expect Creativity",
  "Obsess Over Detail",
  "Embrace Change",
  "High-Five",
  "Value Relationships",
  "Party",
];

const WHAT_WE_DONT = [
  "Work Weekends",
  "Resist Change",
  '"Make It Pop"',
  "Sacrifice Quality For Profit",
  "Overpromise",
  "Accept Mediocrity",
  "Outsource",
  "Lose At Mario Kart",
  "Free Pitches",
  "Egos",
  "Cut Corners",
  "Deal",
];

const SOCIALS = [
  { label: "Website", href: "https://hylith.com", icon: Globe },
  { label: "Behance", href: "https://www.behance.net", icon: Link2 },
  {
    label: "Contact",
    href: "https://www.linkedin.com",
    icon: MessageCircleMore,
  },
];


function ValueColumn({ items, title }: { items: string[]; title: string }) {
  const splitIndex = Math.ceil(items.length / 2);
  const firstGroup = items.slice(0, splitIndex);
  const secondGroup = items.slice(splitIndex);

  return (
    <div className="py-10">
      <p className="text-2xl font-medium tracking-[-0.03em] text-[#0F0B0A]">
        {title}
      </p>

      <div className="mt-5 grid grid-cols-2 tracking-[-0.03em] font-medium gap-x-6 gap-y-2 text-xl leading-6 text-[#0F0B0A]/58 md:gap-x-10">
        <ul className="space-y-1">
          {firstGroup.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <ul className="space-y-1">
          {secondGroup.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const Fifth = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!lineRef.current || !footerRef.current || !stageRef.current) {
        return;
      }

      gsap.set(footerRef.current, {
        autoAlpha: 0,
        y: 180,
      });

      gsap.set(lineRef.current, {
        autoAlpha: 0,
        scaleX: 0,
        transformOrigin: "center center",
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top bottom-=80",
          toggleActions: "play none none reverse",
        },
      });

      timeline.to(
        lineRef.current,
        {
          autoAlpha: 1,
          duration: 0.65,
          ease: "power3.out",
          scaleX: 1,
        }
      );

      timeline.to(
        footerRef.current,
        {
          autoAlpha: 1,
          duration: 1,
          ease: "power4.out",
          y: 0,
        },
        "-=0.1"
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#EFEFED] text-[#0F0B0A]"
    >
      <div className="mx-auto flex w-full max-w-[1340px] flex-col px-6 pb-6  md:px-8  lg:px-10">
        <div className="w-full">
          <h2 className="w-full text-[clamp(2.35rem,5vw,5.1rem)] leading-[0.98] tracking-[-0.01em]">
            Above All, We Believe In Human Relationships, Exceptional Outcomes,
            And Having Fun Along The Way.
          </h2>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2  lg:gap-16">
          <ValueColumn items={WHAT_WE_DO} title="What We Do" />
          <ValueColumn items={WHAT_WE_DONT} title="What We Don't" />
        </div>

        <button className="mt-12 inline-flex w-fit cursor-pointer  flex-col items-start  text-left text-[1rem] font-medium tracking-[-0.04em] md:text-[1.2rem]">
          <span className="inline-flex items-center text-4xl gap-2">
            Let&apos;s Make
            <ArrowRight className="size-10  md:size-10" />
          </span>
          <span className="flex items-center text-4xl gap-2">
            Something{" "}
            <WordRotate
              words={[
                "Click",
                "Epic",
                "Fun",
                "Delightful",
                "Beautiful",
                "Extraordinary",
              ]}
            />
          </span>
        </button>

        <div
          ref={stageRef}
          className="relative mt-16 overflow-hidden pt-10 md:pt-14"
        >
          <div className="pointer-events-none mb-6 md:mb-8">
            <div
              ref={lineRef}
              className="h-[4px] scale-x-0 rounded-full bg-[#0F0B0A] opacity-0"
            />
          </div>

          <footer
            ref={footerRef}
            className="rounded-[26px] bg-[#0F0B0A] px-6 py-6 text-[#EFEFED] opacity-0 shadow-[0_24px_70px_rgba(15,11,10,0.22)] md:px-8 md:py-7"
          >
            <div className="flex min-h-[8.5rem] flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="flex items-start">
                <Image
                  alt="Hylith logo"
                  className="h-auto w-[3.4rem] brightness-0 invert"
                  height={54}
                  priority={false}
                  src="/assets/logo.svg"
                  width={156}
                />
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                <div className="flex items-center gap-3 text-[#EFEFED]/72">
                  {SOCIALS.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      aria-label={label}
                      className="transition-transform duration-300 hover:-translate-y-0.5"
                      href={href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon className="size-[0.92rem]" strokeWidth={1.7} />
                    </a>
                  ))}
                  <a
                    className="ml-3 text-[0.76rem] tracking-[0.02em] text-[#EFEFED]/58"
                    href="mailto:hello@hylith.com"
                  >
                    hello@hylith.com
                  </a>
                </div>

                <div className="text-[0.72rem] tracking-[0.02em] text-[#EFEFED]/52">
                  <p>© Hylith 2026</p>
                  <p>Privacy | Terms And Conditions</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default Fifth;
