"use client";

import { useRef } from "react";
import { gsap, getTier } from "@/lib/motion/gsap";

/** M-19: the child leans towards the pointer (strength 0.3) inside an 80px field; fine pointers only. */
export function Magnet({ children, strength = 0.3, radius = 80 }: { children: React.ReactNode; strength?: number; radius?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = () => getTier() !== "still" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onMove = (e: React.PointerEvent) => {
    const inner = ref.current?.firstElementChild as HTMLElement | null;
    if (!inner || !active()) return;
    const r = inner.getBoundingClientRect();
    gsap.to(inner, { x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength, duration: 0.4 });
  };
  const onLeave = () => {
    const inner = ref.current?.firstElementChild;
    if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="-m-[var(--r)] inline-block p-[var(--r)]" style={{ ["--r" as string]: `${radius}px` }}>
      <div className="inline-block">{children}</div>
    </div>
  );
}
