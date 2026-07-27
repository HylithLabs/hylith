"use client";

import { useCallback, useState } from "react";
import { IntroContext } from "@/components/intro-context";
import Preloader from "@/components/Preloader";

export default function HomeIntro({
  children,
}: {
  children: React.ReactNode;
}) {
  const [introComplete, setIntroComplete] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

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
