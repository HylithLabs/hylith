"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { IntroContext } from "@/components/intro-context";
import Preloader from "@/components/Preloader";
import { consumeSkipHomeIntro } from "@/lib/home-intro";

export default function HomeIntro({
  children,
}: {
  children: React.ReactNode;
}) {
  const [introComplete, setIntroComplete] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  // Skip before paint when arriving from an in-app redirect (e.g. logout).
  // Reload and external visits have no flag, so the preloader still runs.
  useLayoutEffect(() => {
    if (consumeSkipHomeIntro()) {
      setIntroComplete(true);
      setShowPreloader(false);
    }
  }, []);

  const handleComplete = useCallback(() => {
    setIntroComplete(true);
    setShowPreloader(false);
  }, []);

  return (
    <IntroContext.Provider value={{ introComplete }}>
      {showPreloader ? <Preloader onComplete={handleComplete} /> : null}
      {children}
    </IntroContext.Provider>
  );
}
