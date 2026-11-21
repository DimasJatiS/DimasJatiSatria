"use client";

import { useRef } from "react";
import { Section } from "@/components/ui/Section";
import type { SkillGroup } from "@/lib/content/types";
import { gsap, getTier, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

type Props = { label: string; groups: SkillGroup[] };

export function Skills({ label, groups }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // M-16: 40 px/s, × (1 + |velocity| / 1000), direction follows the scroll; rows run opposite ways.
  useGSAP(
    () => {
      if (getTier() === "still") return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-marquee]", ref.current);
      let widths = rows.map((r) => r.scrollWidth / 2);
      const measure = () => (widths = rows.map((r) => r.scrollWidth / 2)); // on resize only
      const offsets = rows.map(() => 0);
      let direction = 1;
      const st = ScrollTrigger.create({ trigger: ref.current, start: "top bottom", end: "bottom top", onRefresh: measure });
      const tick = (_t: number, dt: number) => {
        if (!st.isActive) return;
        const v = st.getVelocity();
        if (v !== 0) direction = Math.sign(v);
        const step = (40 * (1 + Math.abs(v) / 1000) * dt) / 1000;
        rows.forEach((row, i) => {
          const w = widths[i]!;
          offsets[i] = (offsets[i]! + step * direction * (i % 2 ? 1 : -1)) % w;
          gsap.set(row, { x: offsets[i]! > 0 ? offsets[i]! - w : offsets[i]! });
        });
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: ref },
  );

  const words = groups.flatMap((g) => g.items);
  const half = Math.ceil(words.length / 2);
  const lines = [words.slice(0, half), words.slice(half)];

  return (
    <Section id="skills" tone="inverse" panel label={label} className="overflow-hidden">
      <div ref={ref}>
        {/* The marquee is decorative; screen readers get the plain list. */}
        <ul className="sr-only">
          {words.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <div aria-hidden className="flex flex-col gap-2 pt-12 pb-[clamp(96px,14vh,160px)] text-muted">
          {lines.map((line, i) => (
            <div key={i} data-marquee className="flex w-max whitespace-nowrap">
              {[0, 1].map((copy) => (
                <span key={copy} className="display pr-[0.4em] text-[clamp(48px,7.5vw,120px)]">
                  {line.map((w) => `${w} · `).join("")}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
