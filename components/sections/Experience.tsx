"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Activity } from "@/lib/content/types";
import { gsap, getTier, isMobile, SCRUB, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

type Props = { index: number; total: number; label: string; items: Activity[] };

/**
 * Timeline (max. 6) with the A2 climbing path: a dashed zig-zag through the row markers and one
 * bronze "climber" that follows the scroll (M-28). Straight line on mobile; M-17 line when still.
 */
export function Experience({ index, total, label, items }: Props) {
  const t = useTranslations("activity");
  const ref = useRef<HTMLOListElement>(null);
  const [path, setPath] = useState<{ d: string; w: number; h: number } | null>(null);
  const [motionPath, setMotionPath] = useState(false);

  // Only this section uses MotionPathPlugin, so it stays out of the initial bundle.
  useEffect(() => {
    import("gsap/MotionPathPlugin").then(({ MotionPathPlugin }) => {
      gsap.registerPlugin(MotionPathPlugin);
      setMotionPath(true);
    });
  }, []);

  useGSAP(
    () => {
      const list = ref.current!;
      const tier = getTier();
      const markers = gsap.utils.toArray<HTMLElement>("[data-marker]", list);

      // The path is rebuilt from the marker positions on refresh (resize), never per frame.
      const build = () => {
        const col = list.querySelector<HTMLElement>("[data-path-col]")!;
        const w = col.offsetWidth;
        const h = list.offsetHeight;
        const straight = isMobile();
        // Through every marker (centre of the column), swinging left/right in between.
        const ys = markers.map((m) => m.offsetTop + m.offsetHeight / 2);
        // The trail ends a little below the last marker, inside the section (the next one paints over its edge).
        const end = Math.min(h - 16, (ys.at(-1) ?? 0) + 96);
        const pts = ys.flatMap((y, i) => {
          const next = ys[i + 1] ?? end;
          return [[w / 2, y], [straight ? w / 2 : i % 2 ? w * 0.85 : w * 0.15, (y + next) / 2]];
        });
        const d = `M${w / 2} 0` + pts.map(([x, y]) => `L${x} ${y}`).join("") + `L${w / 2} ${end}`;
        setPath({ d, w, h });
      };
      build();
      ScrollTrigger.addEventListener("refreshInit", build);

      if (tier === "still") {
        markers.forEach((m) => (m.style.opacity = "1"));
        return () => ScrollTrigger.removeEventListener("refreshInit", build);
      }
      markers.forEach((m) =>
        gsap.fromTo(m, { opacity: 0.3 }, { opacity: 1, duration: 0.3, scrollTrigger: { trigger: m, start: "top 70%", toggleActions: "play none none reverse" } }),
      );
      return () => ScrollTrigger.removeEventListener("refreshInit", build);
    },
    { scope: ref },
  );

  // M-28: the climber rides the path; re-created when the path changes.
  useGSAP(
    () => {
      if (!path || !motionPath) return;
      const climber = ref.current!.querySelector("[data-climber]");
      const route = ref.current!.querySelector("[data-route]");
      if (getTier() === "still") {
        gsap.set(climber, { motionPath: { path: route as SVGPathElement, align: route as SVGPathElement, alignOrigin: [0.5, 0.5], start: 1, end: 1 } });
        return;
      }
      gsap.fromTo(
        climber,
        { motionPath: { path: route as SVGPathElement, align: route as SVGPathElement, alignOrigin: [0.5, 0.5], start: 0, end: 0 } },
        {
          motionPath: { path: route as SVGPathElement, align: route as SVGPathElement, alignOrigin: [0.5, 0.5], start: 0, end: 1 },
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 70%", scrub: SCRUB },
        },
      );
    },
    { scope: ref, dependencies: [path?.d, motionPath] },
  );

  const period = (a: Activity) => [a.startYear, a.endYear && a.endYear !== a.startYear ? a.endYear : undefined].filter(Boolean).join(" — ");

  return (
    <Section id="experience" tone="base" panel index={index} total={total} label={label}>
      <ol ref={ref} className="container-x relative grid grid-cols-[40px_1fr] pt-12 pb-[clamp(96px,14vh,160px)] lg:grid-cols-12">
        <li aria-hidden data-path-col className="pointer-events-none absolute inset-y-0 left-[var(--gutter)] w-10 lg:left-[calc(var(--gutter)+(100%-2*var(--gutter))*2/12)] lg:w-[calc((100%-2*var(--gutter))/12)]">
          {path && (
            <svg width={path.w} height={path.h} className="overflow-visible">
              <path data-route d={path.d} fill="none" stroke="var(--fg-muted)" strokeWidth="1.5" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
              <circle data-climber r="5" fill="var(--accent)" />
            </svg>
          )}
        </li>
        {items.map((a) => {
          const title = (
            <>
              <span className="text-[clamp(20px,2vw,28px)] leading-snug font-medium">{a.title}</span>
              {a.summary && <span className="mt-2 block max-w-[60ch] text-muted">{a.summary}</span>}
            </>
          );
          return (
            <li key={a.slug} className="col-span-full grid grid-cols-subgrid border-t border-line py-8">
              <p data-speed="1.1" className="label col-start-2 text-accent lg:col-span-2 lg:col-start-1">
                {period(a)}
              </p>
              <span data-marker className="col-start-1 row-start-1 mt-1 size-2 justify-self-center rounded-full bg-fg lg:col-start-3 lg:row-start-auto" />
              <div className="col-start-2 lg:col-span-7 lg:col-start-4">
                {a.hasDetail ? (
                  <Link href={`/activities/${a.slug}`} className="group block hover:text-accent">
                    {title} <span aria-hidden>→</span>
                  </Link>
                ) : (
                  title
                )}
                <p className="label mt-3 text-muted">{[t(`types.${a.type}`), a.org].filter(Boolean).join(" · ")}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
