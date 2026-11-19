"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/** One delegated listener for every `[data-track]` link (CV pill, email, LinkedIn, GitHub). */
export function Tracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (el) track(el.dataset.track as Parameters<typeof track>[0]);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
