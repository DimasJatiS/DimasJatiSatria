"use client";

import { useRef } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { rowRatio } from "@/lib/content/resolve";
import type { Img } from "@/lib/content/types";
import { gsap, getTier, isMobile, SCRUB, useGSAP } from "@/lib/motion/gsap";

/**
 * Case-study opening (W-01/W-02): the title gets a full frame of its own, centred. Scrolling on,
 * the media arrives in its own sticky frame and grows until it fills the screen at its own ratio
 * (no cropping); a pair of portrait images zooms as one container.
 */
export function CaseHero({ children, media }: { children: React.ReactNode; media: Img[] }) {
  const ref = useRef<HTMLElement>(null);
  const ratio = rowRatio(media);

  useGSAP(
    () => {
      if (getTier() === "still" || media.length === 0) return;
      gsap.fromTo(
        "[data-media]",
        { scale: isMobile() ? 0.9 : 0.75, borderRadius: 24 },
        { scale: 1, borderRadius: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom bottom", scrub: SCRUB } },
      );
    },
    { scope: ref, dependencies: [ratio] },
  );

  return (
    <>
      <section data-tone="base" className="flex min-h-[100svh] flex-col bg-surface pt-[calc(var(--header-h)+24px)] pb-8 text-fg">
        <div className="container-x flex flex-1 flex-col">{children}</div>
      </section>
      {media.length > 0 && (
        <section ref={ref} data-tone="base" className="track track-case bg-surface">
          <div className="sticky-frame grid place-items-center">
            <div
              data-media
              className="relative overflow-hidden will-change-transform"
              style={{ aspectRatio: ratio.toFixed(4), width: `min(100%, calc(100svh * ${ratio.toFixed(4)}))` }}
            >
              <MediaFrame images={media} priority sizes={media.length > 1 ? "50vw" : "100vw"} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
