"use client";

import { useRef } from "react";
import { Contour } from "@/components/artwork/Contour";
import { Section } from "@/components/ui/Section";
import { splitAccent } from "@/lib/content/text";
import { gsap, getTier, SCRUB, useGSAP } from "@/lib/motion/gsap";

type Props = { index: number; total: number; label: string; manifesto: string; facts: string[] };

export function About({ index, total, label, manifesto, facts }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (getTier() === "still") return;
      const q = gsap.utils.selector(ref);
      // M-11: each word brightens as it is read.
      gsap.fromTo(q("[data-word]"), { opacity: 0.15 }, {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: q("[data-manifesto]")[0], start: "top 70%", end: "bottom 60%", scrub: SCRUB },
      });
      // M-27 / A7: the portrait tunes in from noise (Q1 default: typographic silhouette).
      gsap.timeline({ scrollTrigger: { trigger: q("[data-portrait]")[0], start: "top 70%", once: true } })
        .fromTo(q("[data-noise]"), { opacity: 1 }, { opacity: 0, duration: 0.6, ease: "none" }, 0)
        .fromTo(q("[data-face]"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "none" }, 0);
    },
    { scope: ref },
  );

  // Words are split on the server render so the paragraph stays one readable sentence.
  const words = splitAccent(manifesto).flatMap((seg) =>
    seg.text.split(/(\s+)/).filter(Boolean).map((w) => ({ w, accent: seg.accent })),
  );

  return (
    <Section id="about" tone="inverse" panel index={index} total={total} label={label} className="min-h-[100svh] overflow-hidden">
      <div aria-hidden data-speed="0.7" className="pointer-events-none absolute inset-x-0 -top-[10%] h-[120%]">
        <Contour className="size-full" />
      </div>
      <div ref={ref} className="container-x relative grid gap-12 pt-12 pb-[clamp(96px,14vh,160px)] lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <p data-manifesto className="display text-[clamp(32px,4.6vw,72px)] leading-[1.02] font-medium">
            {words.map(({ w, accent }, i) =>
              /^\s+$/.test(w) ? (
                w
              ) : (
                <span key={i} data-word className={accent ? "accent-word" : undefined}>
                  {w}
                </span>
              ),
            )}
          </p>
          {facts.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-3">
              {facts.map((f) => (
                <li key={f} className="chip bg-surface">
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div data-portrait data-speed="0.7" className="relative order-first aspect-[4/5] w-full max-w-[420px] lg:order-none lg:col-span-4 lg:justify-self-end">
          <div className="media relative size-full border border-line bg-surface">
            <div data-face className="absolute inset-0 grid place-items-center">
              <span className="font-display text-[clamp(96px,14vw,200px)] leading-none font-semibold tracking-[-0.04em]">DJS</span>
              <span className="label absolute bottom-4 left-4 text-muted">Dimas Jati Satria</span>
            </div>
            <div data-noise aria-hidden className="absolute inset-0 bg-[url(/grain.png)] bg-[length:144px] opacity-0 in-data-[motion=still]:hidden" />
          </div>
        </div>
      </div>
    </Section>
  );
}
