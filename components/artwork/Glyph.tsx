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
 * A3 glyphs for projects and activities on a 96×96 grid: monoline `currentColor`, a faint
 * secondary shape and exactly one bronze element that loops. Parts assemble once in view
 * (GSAP on `[data-part]` groups); the loops are CSS on inner elements (`g-*`, globals.css),
 * so GSAP's SVG transforms and the CSS animations never touch the same node.
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
          // M-25: loop only while visible (the still tier returned above).
          const io = new IntersectionObserver(([e]) => svg.toggleAttribute("data-live", Boolean(e?.isIntersecting)));
          io.observe(svg);
          svg.addEventListener("glyph:dispose", () => io.disconnect(), { once: true });
        },
      });
      return () => svg.dispatchEvent(new Event("glyph:dispose"));
    },
    { dependencies: [animate] },
  );

  const s = { fill, stroke: "currentColor", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const line = { ...s, fill: "none" };
  const faint = { ...line, opacity: 0.45 };
  const bronze = { ...line, stroke: "var(--accent)" };
  const dot = { fill: "var(--accent)", stroke: "none" };

  return (
    <svg ref={ref} viewBox="0 0 96 96" aria-hidden className={`glyph ${className}`}>
      <defs>
        <pattern id={pattern} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill="currentColor" />
        </pattern>
      </defs>

      {glyph === "tbxxpert" && (
        // Lungs with a cough waveform inside (TBXpert): the bars breathe.
        <>
          <path data-part d="M44 18v24c0 6-5 8-10 9-9 2-16 12-16 26 0 5 3 7 7 7 10 0 19-6 19-18M52 18v24c0 6 5 8 10 9 9 2 16 12 16 26 0 5-3 7-7 7-10 0-19-6-19-18" {...faint} />
          {[
            [30, 40, 56],
            [39, 32, 64],
            [48, 24, 72],
            [57, 32, 64],
            [66, 40, 56],
          ].map(([x, y1, y2], i) => (
            <g key={x} data-part>
              <line className="g-eq" style={{ animationDelay: `${i * 140}ms` }} x1={x} y1={y1} x2={x} y2={y2} {...(i === 2 ? bronze : line)} strokeWidth={3} />
            </g>
          ))}
        </>
      )}

      {glyph === "cv" && (
        // A CV being read: the bronze scan line passes over the text.
        <>
          <path data-part d="M28 12h28l14 14v58H28zM56 12v14h14" {...faint} />
          {[
            [38, 24],
            [48, 28],
            [58, 20],
            [68, 26],
          ].map(([y, w]) => (
            <path key={y} data-part d={`M36 ${y}h${w}`} {...line} />
          ))}
          <g data-part>
            <path className="g-scan" d="M22 22h52" {...bronze} strokeWidth={2} />
          </g>
        </>
      )}

      {glyph === "chat" && (
        // Two people talking (Innofa: chat, contract, escrow): the reply is being typed.
        <>
          <path data-part d="M14 16h42a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H32l-10 8v-8h-2a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z" {...faint} />
          <path data-part d="M82 44H42a6 6 0 0 0-6 6v16a6 6 0 0 0 6 6h24l10 8v-8h6a6 6 0 0 0 6-6V50a6 6 0 0 0-6-6z" {...s} />
          <g data-part>
            {[52, 62, 72].map((x, i) => (
              <circle key={x} className="g-dot" style={{ animationDelay: `${i * 0.2}s` }} cx={x} cy="58" r="2.5" {...dot} />
            ))}
          </g>
        </>
      )}

      {glyph === "flower" && (
        // A bouquet flower (Bloomarie): petals turn slowly around a bronze heart.
        <>
          <path data-part d="M48 58v28M48 76c7-1 12-6 13-14-8 1-12 6-13 14z" {...faint} />
          <g data-part>
            <g className="g-spin">
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx="48" cy="24" rx="8" ry="13" transform={`rotate(${r} 48 38)`} {...s} />
              ))}
            </g>
          </g>
          <circle data-part cx="48" cy="38" r="5" {...dot} />
        </>
      )}

      {glyph === "grid" && (
        // Graduation cap (SIAKAD, education): the bronze tassel swings.
        <>
          <path data-part d="M26 46v16c0 6 10 12 22 12s22-6 22-12V46" {...faint} />
          <path data-part d="M48 22l38 16-38 16-38-16z" {...s} />
          <g data-part>
            <g className="g-swing">
              <path d="M86 38v20" {...bronze} />
              <circle cx="86" cy="61" r="3" {...dot} />
            </g>
          </g>
        </>
      )}

      {glyph === "shard" && (
        // A crystal shard inside a closing battle-royale zone (Shardfall).
        <>
          <path data-part d="M34 46h28M48 22v54" {...faint} />
          <path data-part d="M48 22l14 24-14 30-14-30z" {...s} />
          <g data-part>
            <circle className="g-zone" cx="48" cy="48" r="38" {...bronze} strokeDasharray="4 6" />
          </g>
        </>
      )}

      {glyph === "chain" && (
        // Portfolio chart (ChainFolio): holdings as bars, the bronze value line keeps redrawing.
        <>
          <path data-part d="M14 14v66h70" {...faint} />
          {(
            [
              [24, 14],
              [38, 24],
              [52, 18],
              [66, 32],
            ] as const
          ).map(([x, h]) => (
            <rect key={x} data-part x={x} y={76 - h} width="8" height={h} rx="2" {...s} />
          ))}
          <g data-part>
            <path className="g-draw" d="M20 58l14-14 14 6 14-20 16-10" pathLength={100} {...bronze} strokeWidth={2} />
          </g>
        </>
      )}

      {glyph === "trophy" && (
        // Competition trophy: a bronze spark twinkles above the cup.
        <>
          <path data-part d="M32 24h-8c0 10 4 15 10 16M64 24h8c0 10-4 15-10 16M48 54v10M38 64h20v10H38zM32 80h32" {...faint} />
          <path data-part d="M32 18h32v14c0 13-7 22-16 22s-16-9-16-22z" {...s} />
          <g data-part>
            <path className="g-twinkle" d="M76 8l2.5 5.5L84 16l-5.5 2.5L76 24l-2.5-5.5L68 16l5.5-2.5z" {...dot} />
          </g>
        </>
      )}

      {glyph === "stopwatch" && (
        // Running: a stopwatch whose bronze hand keeps going.
        <>
          <path data-part d="M42 16h12M48 16v10M70 30l5-5M48 34v4M68 56h-4M48 76v-4M28 56h4" {...faint} />
          <circle data-part cx="48" cy="56" r="26" {...s} />
          <g data-part>
            <path className="g-hand" d="M48 56V38" {...bronze} strokeWidth={2} />
          </g>
          <circle data-part cx="48" cy="56" r="2.5" fill="currentColor" stroke="none" />
        </>
      )}

      {glyph === "pulse" && (
        // Medical team: a heart with a bronze heartbeat running through it.
        <>
          <path data-part d="M48 80C30 68 14 56 14 39c0-10 8-18 17-18 7 0 13 4 17 10 4-6 10-10 17-10 9 0 17 8 17 18 0 17-16 29-34 41z" {...faint} />
          <path data-part d="M76 10v12M70 16h12" {...line} />
          <g data-part>
            <path className="g-draw" d="M8 52h22l5-10 7 22 7-30 6 18h33" pathLength={100} {...bronze} strokeWidth={2} />
          </g>
        </>
      )}

      {glyph === "generic" && (
        // Summit: a peak with a bronze sun rising behind it.
        <>
          <path data-part d="M6 80h84" {...faint} />
          <g data-part>
            <circle className="g-rise" cx="64" cy="28" r="7" {...dot} />
          </g>
          <path data-part d="M10 80l28-44 14 20 10-12 24 36z" {...s} />
        </>
      )}
    </svg>
  );
}
