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
    name: "John",
    username: "@john",
    text: "I'm at a loss for words. This is amazing. I love it.",
    gradient: "from-green-200 to-green-400",
  },
  {
    name: "Jack",
    username: "@jack",
    text: "I've never seen anything like this before. It's amazing. I love it.",
    gradient: "from-yellow-400 to-green-400",
  },
  {
    name: "Jill",
    username: "@jill",
    text: "I don't know what to say. I'm speechless. This is amazing.",
    gradient: "from-blue-500 to-pink-500",
  },
  {
    name: "James",
    username: "@james",
    text: "I'm at a loss for words. This is amazing. I love it.",
    gradient: "from-green-500 to-blue-500",
  },
  {
    name: "Jane",
    username: "@jane",
    text: "I'm at a loss for words. This is amazing. I love it.",
    gradient: "from-pink-500 to-orange-400",
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
