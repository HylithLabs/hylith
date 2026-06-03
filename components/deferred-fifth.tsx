"use client";

import dynamic from "next/dynamic";
import { LazySection } from "@/components/lazy-section";

const Fifth = dynamic(() => import("@/pages/Fifth"), { ssr: false });

export default function DeferredFifth() {
  return (
    <LazySection
      fallback={<div className="min-h-screen w-full bg-[#EFEFED]" aria-hidden="true" />}
    >
      <Fifth />
    </LazySection>
  );
}
