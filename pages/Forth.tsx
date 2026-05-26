"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

/* =========================
   DATA
========================= */

const data = [
  {
    id: "01",
    title: "End-To-End Execution.",
    tags: ["Strategy", "Design", "Development", "Launch"],
    content:
      "From the first idea to a live, breathing product — we handle everything. Strategy, design, development, and launch, executed as one seamless process with zero handoff friction.",
  },
  {
    id: "02",
    title: "Web Development.",
    content:
      "We turn designs into real, functional digital products – fast, accessible, and built to perform. Clean code, modern stack, and obsessive attention to the details that matter.",
    tags: ["Frontend", "Backend", "Performance", "Deployment", "Basic SEO"],
  },
];

const reviews = [
  {
    name: "Fatima Rahman",
    username: "@fatimarahman · Founder, PadmaPay",
    text: "We came to Hylith with a half-built product and a lot of moving parts. They didn't just ship features — they helped us rethink the whole flow. Launch was three weeks ahead of schedule.",
    gradient: "from-emerald-200 to-teal-400",
  },
  {
    name: "Arif Hossain",
    username: "@arifhossain · Head of Product, Dhaka Commerce",
    text: "Most agencies treat design and engineering like separate projects. Hylith doesn't. Our admin panel finally feels like it belongs to the same product as our marketing site.",
    gradient: "from-amber-200 to-orange-400",
  },
  {
    name: "Nusrat Jahan",
    username: "@nusratjahan · COO, Northline BD",
    text: "Clear updates, no jargon, and they actually listened when we said our team wasn't technical. The handoff docs alone saved us weeks of back-and-forth with our internal devs.",
    gradient: "from-violet-300 to-fuchsia-400",
  },
  {
    name: "Tanvir Islam",
    username: "@tanvirislam · CTO, Riverbank Systems",
    text: "Performance was non-negotiable for us — thousands of daily users on older phones and slower networks. They caught bottlenecks we hadn't even flagged and the Lighthouse scores speak for themselves.",
    gradient: "from-sky-300 to-indigo-400",
  },
  {
    name: "Samira Chowdhury",
    username: "@samirachowdhury · Brand Director",
    text: "I was nervous about our rebrand getting lost in translation once it hit code. It didn't. Typography, spacing, motion — everything landed exactly how we presented it in Figma.",
    gradient: "from-rose-200 to-pink-400",
  },
  {
    name: "Rafiqul Alam",
    username: "@rafiqulalam · Small business owner, Chattogram",
    text: "I'm not a tech person. I just needed something that worked and looked professional. Hylith walked me through every decision without making me feel stupid. Worth every taka.",
    gradient: "from-lime-200 to-green-400",
  },
  {
    name: "Tasnim Karim",
    username: "@tasnimkarim · Startup founder",
    text: "From first call to production in under two months. Strategy session on Monday, clickable prototype by Friday, live beta six weeks later. I've never moved this fast with an agency in Bangladesh.",
    gradient: "from-cyan-200 to-blue-400",
  },
  {
    name: "Shahidul Hasan",
    username: "@shahidulhasan · Engineering lead",
    text: "Clean codebase, sensible stack choices, and zero 'we'll fix it after launch' moments. Our team inherited the project and didn't have to rewrite a single module.",
    gradient: "from-stone-300 to-zinc-500",
  },
];

/* =========================
   REVIEW CARD
========================= */

const ReviewCard = ({ review }: any) => {
  return (
    <div className="w-[280px] md:w-[320px] p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-black/5 shadow-sm hover:scale-[1.03] transition-transform duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient}`}
        />
        <div>
          <p className="text-sm font-medium text-black">{review.name}</p>
          <p className="text-xs text-black/50">{review.username}</p>
        </div>
      </div>

      <p className="text-sm text-black/70 leading-relaxed">
        {review.text}
      </p>
    </div>
  );
};

/* =========================
   MAIN COMPONENT
========================= */

const Forth = () => {
  const [active, setActive] = useState<string | null>("02");

  return (
    <section
      id="what-we-do"
      className="w-full min-h-screen flex flex-col justify-center items-center px-6 py-30 gap-16 bg-[#EFEFED]"
    >
      {/* ================= Accordion ================= */}
      <div className="w-full max-w-7xl rounded-3xl bg-[#F8F8F6] shadow-sm border border-black/5 p-8 md:p-10">
        {data.map((item, index) => {
          const isOpen = active === item.id;

          return (
            <div key={item.id}>
              <div
                onClick={() => setActive(isOpen ? null : item.id)}
                className="flex items-start justify-between gap-4 cursor-pointer py-6"
              >
                <div className="flex gap-6">
                  <span className="text-sm text-black/40 mt-1">
                    {item.id}
                  </span>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-black">
                      {item.title}
                    </h2>

                    <div
                      className={cn(
                        "transition-all duration-500 overflow-hidden",
                        isOpen ? "max-h-60 mt-4" : "max-h-0"
                      )}
                    >
                      <p className="text-black/60 max-w-xl text-sm md:text-base leading-relaxed">
                        {item.content}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-3 py-1 rounded-full bg-black/5 text-black/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glass Button */}
                <div
                  style={{
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
                  className="w-9 h-9 flex items-center justify-center text-[#666] font-semibold rounded-full"
                >
                  {isOpen ? "−" : "+"}
                </div>
              </div>

              {index !== data.length - 1 && (
                <div className="h-px bg-black/10" />
              )}
            </div>
          );
        })}
      </div>

      {/* ================= Marquee Reviews ================= */}
      <div className="w-full max-w-7xl relative overflow-hidden space-y-1 ">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-linear-to-r from-[#EFEFED] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-linear-to-l from-[#EFEFED] to-transparent z-10" />

        {/* Row 1 */}
        <Marquee pauseOnHover className="[--duration:25s]">
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </Marquee>

        {/* Row 2 */}
        <Marquee
          reverse
          pauseOnHover
          className="[--duration:30s]"
        >
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Forth;
