"use client";

import { createContext, useContext } from "react";

export type IntroContextValue = {
  /** True once the home preloader has finished its exit. */
  introComplete: boolean;
};

export const IntroContext = createContext<IntroContextValue>({
  introComplete: true,
});

export function useIntro() {
  return useContext(IntroContext);
}
