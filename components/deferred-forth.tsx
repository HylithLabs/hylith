"use client";

import dynamic from "next/dynamic";
import { LazySection } from "@/components/lazy-section";

const Forth = dynamic(() => import("@/pages/Forth"), { ssr: false });

export default function DeferredForth() {
  return (
    <LazySection
      fallback={<div className="min-h-screen w-full bg-[#EFEFED]" aria-hidden="true" />}
    >
      <Forth />
    </LazySection>
  );
}
