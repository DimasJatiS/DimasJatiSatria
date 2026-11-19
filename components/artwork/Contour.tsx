"use client";

import { useRef } from "react";
import { gsap, getTier, useGSAP } from "@/lib/motion/gsap";
import paths from "./contour-paths.json";

/**
 * A1 topographic contours (precomputed in scripts/prepare-media.mjs). The innermost line is the
 * single bronze element. M-26 draws them outside-in once on entry; never scrubbed (paint cost).
 */
export function Contour({ draw = true, className = "" }: { draw?: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    if (!draw || getTier() === "still" || !ref.current) return;
    gsap.fromTo(
      ref.current.querySelectorAll("path"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.2, ease: "power2.out", stagger: 0.04, scrollTrigger: { trigger: ref.current, start: "top 60%", once: true } },
    );
  });

  return (
    <svg ref={ref} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          fill="none"
          stroke={i === paths.length - 1 ? "var(--accent)" : "var(--line)"}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          strokeDasharray={draw ? 1 : undefined}
        />
      ))}
    </svg>
  );
}
