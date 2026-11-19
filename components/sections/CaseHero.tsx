"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Img } from "@/lib/content/types";
import { gsap, getTier, SCRUB, useGSAP } from "@/lib/motion/gsap";

/** M-22: the case-study media grows from 60% to the full width while the hero is held (sticky). */
export function CaseHero({
  children,
  media,
}: {
  children: React.ReactNode;
  media?: Img;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (getTier() === "still" || !media) return;
      const el = ref.current!.querySelector("[data-media]");
      gsap.fromTo(
        el,
        { scale: 0.6, borderRadius: 20 },
        {
          scale: 1,
          borderRadius: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom bottom",
            scrub: SCRUB,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      data-tone="base"
      className={`${media ? "track track-case" : ""} bg-surface`}
    >
      <div className="sticky-frame flex flex-col pt-[calc(var(--header-h)+48px)]">
        <div className="container-x pb-10">{children}</div>
        {media && (
          <div
            data-media
            className="relative mt-auto aspect-video w-full origin-top overflow-hidden lg:aspect-[21/9]"
          >
            <Image
              src={media.gray}
              alt={media.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
