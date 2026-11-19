"use client";

import { useId, useRef } from "react";
import type { GlyphId } from "@/lib/content/types";
import { gsap, getTier, useGSAP } from "@/lib/motion/gsap";

type Props = {
  glyph: GlyphId;
  variant?: "line" | "halftone";
  /** Assemble when scrolled into view (M-24) and loop while visible (M-25). */
  animate?: boolean;
  className?: string;
};

/**
 * A3 project glyphs on a 96×96 grid: monoline, `currentColor`, exactly one bronze element.
 * Idle loops are CSS (transform/opacity only) and run only while the glyph is on screen.
 */
export function Glyph({ glyph, variant = "line", animate = false, className = "" }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const pattern = `ht-${useId().replace(/:/g, "")}`;
  const fill = variant === "halftone" ? `url(#${pattern})` : "none";

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg || !animate) return;
      const tier = getTier();
      if (tier === "still") return;
      const parts = svg.querySelectorAll("[data-part]");
      gsap.from(parts, {
        y: 24,
        scale: 0.9,
        opacity: 0,
        stagger: 0.04,
        duration: 0.6,
        transformOrigin: "50% 50%",
        scrollTrigger: { trigger: svg, start: "top 85%", once: true },
        onComplete: () => {
          if (tier !== "full") return;
          // M-25: loop only while visible.
          const io = new IntersectionObserver(([e]) => svg.toggleAttribute("data-live", Boolean(e?.isIntersecting)));
          io.observe(svg);
          svg.addEventListener("glyph:dispose", () => io.disconnect(), { once: true });
        },
      });
      return () => svg.dispatchEvent(new Event("glyph:dispose"));
    },
    { dependencies: [animate] },
  );

  const s = { fill, stroke: "currentColor", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const };
  const accent = { fill: "var(--accent)", stroke: "none" };

  return (
    <svg ref={ref} viewBox="0 0 96 96" aria-hidden className={`glyph ${className}`}>
      <defs>
        <pattern id={pattern} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill="currentColor" />
        </pattern>
      </defs>
      {glyph === "tbxxpert" &&
        // Five sound bars whose tops trace two lungs around a trachea (G1).
        [
          { x: 22, h: 40 },
          { x: 33, h: 54 },
          { x: 45, h: 66, accent: true },
          { x: 57, h: 54 },
          { x: 68, h: 40 },
        ].map((b, i) => (
          <rect
            key={i}
            data-part
            className="g-bar"
            style={{ animationDelay: `${i * 120}ms` }}
            x={b.x}
            y={82 - b.h}
            width={b.accent ? 6 : 8}
            height={b.h}
            rx={b.accent ? 3 : 4}
            {...(b.accent ? accent : s)}
          />
        ))}
      {glyph === "cv" && (
        <>
          <path data-part d="M26 14h32l14 14v54H26z" {...s} />
          <path data-part d="M58 14v14h14" {...s} fill="none" />
          {[38, 48, 58, 68].map((y, i) => (
            <path key={y} data-part d={`M34 ${y}h${i % 2 ? 22 : 30}`} {...s} fill="none" />
          ))}
          <rect data-part className="g-scan" x="22" y="20" width="54" height="2" rx="1" {...accent} />
        </>
      )}
      {glyph === "chat" && (
        <>
          <path data-part d="M12 18h44a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H30l-10 8v-8h-2a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6z" {...s} />
          <path data-part d="M84 48H44a6 6 0 0 0-6 6v14a6 6 0 0 0 6 6h24l10 8v-8h6a6 6 0 0 0 6-6V54a6 6 0 0 0-6-6z" {...s} />
          <path data-part d="M50 50v-4" stroke="var(--accent)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          {[52, 62, 72].map((x, i) => (
            <circle key={x} data-part className="g-dot" style={{ animationDelay: `${i * 0.4}s` }} cx={x} cy="61" r="2.5" fill="currentColor" />
          ))}
        </>
      )}
      {glyph === "flower" && (
        <>
          <g className="g-spin" data-part>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="48" cy="30" rx="10" ry="18" transform={`rotate(${r} 48 48)`} {...s} />
            ))}
          </g>
          <circle data-part cx="48" cy="48" r="6" {...accent} />
        </>
      )}
      {glyph === "grid" && (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} data-part x={14 + (i % 3) * 24} y={14 + Math.floor(i / 3) * 24} width="20" height="20" rx="3" {...s} />
          ))}
          <rect className="g-cell" x="14" y="14" width="20" height="20" rx="3" {...accent} />
        </>
      )}
      {glyph === "generic" && (
        <>
          {[38, 28, 18].map((r) => (
            <ellipse key={r} data-part cx="48" cy="50" rx={r} ry={r * 0.78} {...s} />
          ))}
          <circle data-part cx="48" cy="50" r="5" {...accent} />
        </>
      )}
    </svg>
  );
}
