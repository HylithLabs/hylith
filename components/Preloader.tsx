"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface PreloaderProps {
  onComplete: () => void;
}

const EASE = [0.87, 0, 0.13, 1] as const;
const CYCLE_S = 2.5;
const TIMES = [0, 0.5, 1, 1] as const;
const EXIT_DURATION_S = 0.9;
/** Clock + brand fade out before the nested boxes start expanding. */
const CHROME_EXIT_S = 0.3;

function waitForPageReady(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || document.readyState === "complete") {
      resolve();
      return;
    }
    const onLoad = () => {
      window.removeEventListener("load", onLoad);
      resolve();
    };
    window.addEventListener("load", onLoad);
  });
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function PreloaderClock() {
  const [time, setTime] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(formatClock(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.p
      className="pointer-events-none absolute top-6 right-6 z-10 font-medium tabular-nums tracking-[-0.04em] text-[#0F0B0A] sm:top-8 sm:right-8 sm:text-lg xl:top-10 xl:right-10 xl:text-xl"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: CHROME_EXIT_S, ease: "easeInOut" },
      }}
    >
      {time}
    </motion.p>
  );
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (shouldReduceMotion) {
      setVisible(false);
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();

    void waitForPageReady().then(() => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      const cycleMs = CYCLE_S * 1000;
      // Wait for the current pulse cycle to finish so the exit doesn't cut
      // the loop off mid-scale.
      const remainder = elapsed % cycleMs;
      const wait = remainder === 0 ? 0 : cycleMs - remainder;
      setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, wait);
    });

    return () => {
      cancelled = true;
    };
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-100 flex h-screen w-full items-center justify-center bg-white"
          exit={{
            opacity: 0,
            transition: {
              duration: 0.4,
              ease: "easeInOut",
              delay: EXIT_DURATION_S + CHROME_EXIT_S,
            },
          }}
        >
          <PreloaderClock />
          <motion.p
            className="pointer-events-none absolute bottom-6 left-6 z-10 text-2xl font-medium tracking-[-0.04em] text-[#0F0B0A] sm:bottom-8 sm:left-8 sm:text-3xl xl:bottom-10 xl:left-10 xl:text-4xl"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: CHROME_EXIT_S, ease: "easeInOut" },
            }}
          >
            Hylith
          </motion.p>

          <motion.div
            animate={{ scale: [1.05, 0.5, 1.05, 1.05] }}
            exit={{
              scale: 1,
              height: "100%",
              width: "100%",
              transition: {
                duration: EXIT_DURATION_S + 0.15,
                ease: EASE,
                delay: CHROME_EXIT_S,
              },
            }}
            transition={{
              duration: CYCLE_S,
              times: [...TIMES],
              ease: EASE,
              repeat: Infinity,
              delay: 0.45,
              repeatDelay: 0,
            }}
            className="z-9 flex h-[70vmin] w-[80vmin] items-center justify-center rounded-4xl bg-black"
          >
            <motion.div
              animate={{ scale: [1.34, 1.2, 1.34, 1.34] }}
              exit={{
                scale: 1,
                height: "100%",
                width: "100%",
                transition: {
                  duration: EXIT_DURATION_S,
                  ease: EASE,
                  delay: CHROME_EXIT_S + 0.3,
                },
              }}
              transition={{
                duration: CYCLE_S,
                times: [...TIMES],
                ease: EASE,
                repeat: Infinity,
                delay: 0.3,
                repeatDelay: 0,
              }}
              className="flex h-[70%] w-[70%] items-center justify-center rounded-4xl bg-white"
            >
              <motion.div
                animate={{ scale: [1.88, 1.7, 1.88, 1.88] }}
                exit={{
                  scale: 1,
                  height: "100%",
                  width: "100%",
                  transition: {
                    duration: EXIT_DURATION_S,
                    ease: EASE,
                    delay: CHROME_EXIT_S + 0.45,
                  },
                }}
                transition={{
                  duration: CYCLE_S,
                  times: [...TIMES],
                  ease: EASE,
                  repeat: Infinity,
                  delay: 0.15,
                  repeatDelay: 0,
                }}
                className="z-9 flex h-[50%] w-[50%] items-center justify-center rounded-4xl bg-black"
              >
                <motion.div
                  animate={{ scale: [1.84, 1.7, 1.84, 1.84] }}
                  exit={{
                    scale: 1,
                    height: "100%",
                    width: "100%",
                    transition: {
                      duration: EXIT_DURATION_S,
                      ease: EASE,
                      delay: CHROME_EXIT_S + 0.6,
                    },
                  }}
                  transition={{
                    duration: CYCLE_S,
                    times: [...TIMES],
                    ease: EASE,
                    repeat: Infinity,
                    delay: 0,
                    repeatDelay: 0,
                  }}
                  className="z-9 flex h-[50%] w-[50%] items-center justify-center rounded-4xl bg-white"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
