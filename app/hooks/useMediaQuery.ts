"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const getServerSnapshot = (): boolean => {
    return false;
  };

  const getSnapshot = (): boolean => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }

    const media = window.matchMedia(query);
    media.addEventListener("change", callback);

    return () => {
      media.removeEventListener("change", callback);
    };
  };

  const matches = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return matches;
}
