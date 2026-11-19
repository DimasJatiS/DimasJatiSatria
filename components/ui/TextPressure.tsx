"use client";

import { useRef } from "react";
import { gsap, getTier, useGSAP } from "@/lib/motion/gsap";

/**
 * M-18 (TextPressure pattern, written for Clash Display's weight axis): letters near the
 * pointer get heavier. Runs on the GSAP ticker only while the pointer is over the title.
 */
export function TextPressure({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = ref.current!;
      if (getTier() === "still" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-ch]"));
      const weights = chars.map(() => 400);
      let centres: number[][] = [];
      let pointer: number[] | null = null;
      const measure = () => (centres = chars.map((c) => { const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));

      const tick = () => {
        let moving = false;
        chars.forEach((c, i) => {
          const [x = 0, y = 0] = centres[i] ?? [];
          const target = pointer ? 400 + 300 * Math.max(0, 1 - Math.hypot(pointer[0]! - x, pointer[1]! - y) / 320) : 400;
          const w = weights[i]! + (target - weights[i]!) * 0.15;
          if (Math.abs(w - weights[i]!) > 0.5) moving = true;
          weights[i] = w;
          c.style.fontVariationSettings = `"wght" ${w.toFixed(0)}`;
        });
        if (!moving && !pointer) gsap.ticker.remove(tick);
      };
      const enter = (e: PointerEvent) => { measure(); pointer = [e.clientX, e.clientY]; gsap.ticker.add(tick); };
      const move = (e: PointerEvent) => { pointer = [e.clientX, e.clientY]; };
      const leave = () => { pointer = null; };
      root.addEventListener("pointerenter", enter);
      root.addEventListener("pointermove", move);
      root.addEventListener("pointerleave", leave);
      return () => {
        gsap.ticker.remove(tick);
        root.removeEventListener("pointerenter", enter);
        root.removeEventListener("pointermove", move);
        root.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden data-ch className="inline-block whitespace-pre">
          {ch}
        </span>
      ))}
    </span>
  );
}
