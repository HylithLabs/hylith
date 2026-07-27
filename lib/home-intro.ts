const SKIP_HOME_INTRO_KEY = "hylith:skip-home-intro";

/** Mark the next homepage visit in this tab to skip the preloader (e.g. after logout). */
export function markSkipHomeIntro() {
  try {
    sessionStorage.setItem(SKIP_HOME_INTRO_KEY, "1");
  } catch {
    // sessionStorage may be unavailable
  }
}

/** Consume a one-shot skip flag. Returns true if the preloader should be skipped. */
export function consumeSkipHomeIntro(): boolean {
  try {
    if (sessionStorage.getItem(SKIP_HOME_INTRO_KEY) === "1") {
      sessionStorage.removeItem(SKIP_HOME_INTRO_KEY);
      return true;
    }
  } catch {
    // sessionStorage may be unavailable
  }
  return false;
}
