import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Create media query list
    const mql: MediaQueryList = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );

    // Type for both modern and legacy events
    const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile("matches" in event ? event.matches : mql.matches);
    };

    // Initial value
    setIsMobile(mql.matches);

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => {
        mql.removeEventListener("change", onChange);
      };
    }

    // Legacy Safari fallback WITHOUT using 'any'
    const legacyListener = (e: MediaQueryListEvent) => onChange(e);

    mql.addListener(legacyListener);
    return () => {
      mql.removeListener(legacyListener);
    };

  }, []);

  return isMobile;
}
