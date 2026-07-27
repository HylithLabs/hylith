"use client";

import dynamic from "next/dynamic";
import { LazySection } from "@/components/lazy-section";
import { IntroFromBottom } from "@/components/IntroReveal";

const Second = dynamic(() => import("@/pages/Second"), { ssr: false });

export default function DeferredSecond() {
  return (
    <LazySection
      className="second-wrapper overflow-hidden"
      fallback={
        <div className="min-h-screen w-full bg-[#EFEFED]" aria-hidden="true" />
      }
    >
      <IntroFromBottom releaseTransform>
        <Second />
      </IntroFromBottom>
    </LazySection>
  );
}
