"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // set initial value
    setMatches(media.matches);

    // update the state when the media query changes
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    // clean up
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// development
export function useIsDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

// detect mobile
export function useIsMobileOrTablet(): boolean {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const isDevelopment = useIsDevelopment();
  const isSmallScreen = useMediaQuery("(max-width: 1180px)");

  useEffect(() => {
    if (isDevelopment) {
      setIsMobileOrTablet(isSmallScreen);
      return;
    }

    // for development
    const checkIfMobileOrTablet = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(
          userAgent
        );
      const hasTouchScreen =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const hasOrientationSupport = typeof window.orientation !== "undefined";

      return isMobile || (hasTouchScreen && hasOrientationSupport);
    };

    setIsMobileOrTablet(checkIfMobileOrTablet());
  }, [isDevelopment, isSmallScreen]);

  return isMobileOrTablet;
}
