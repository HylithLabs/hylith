"use client";

import dynamic from "next/dynamic";
import { LazySection } from "@/components/lazy-section";

const Third = dynamic(() => import("@/pages/Third"), { ssr: false });

export default function DeferredThird() {
  return (
    <LazySection
      fallback={<div className="h-[200vh] w-full bg-white" aria-hidden="true" />}
    >
      <Third />
    </LazySection>
  );
}
