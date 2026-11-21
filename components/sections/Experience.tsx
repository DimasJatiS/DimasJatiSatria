"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Activity } from "@/lib/content/types";
import { gsap, getTier, isMobile, SCRUB, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

type Props = { label: string; items: Activity[] };

/**
 * Timeline (max. 6) with the A2 climbing path: a dashed zig-zag through the row markers and one
 * bronze "climber" that follows the scroll (M-28). Straight line on mobile; M-17 line when still.
 * Rows with a detail page are links as a whole; on fine pointers the cursor becomes a disc that
 * inverts the colours under it.
 */
export function Experience({ label, items }: Props) {
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

  // Inverting cursor disc: follows the pointer inside the list, grows over linked rows.
  useGSAP(
    () => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const list = ref.current!;
      const disc = list.querySelector<HTMLElement>("[data-disc]")!;
      const d = getTier() === "still" ? 0.01 : 0.35;
      gsap.set(disc, { xPercent: -50, yPercent: -50, scale: 0 });
      const qx = gsap.quickTo(disc, "x", { duration: d, ease: "power3" });
      const qy = gsap.quickTo(disc, "y", { duration: d, ease: "power3" });
      let on = false;
      const show = (next: boolean) => {
        if (next === on) return;
        on = next;
        gsap.to(disc, { scale: next ? 1 : 0, duration: d, ease: "power3.out", overwrite: "auto" });
      };
      const move = (e: PointerEvent) => {
        const r = list.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const hit = Boolean((e.target as Element).closest("[data-link]"));
        // Entering a row: start at the pointer instead of flying in from the last spot.
        if (hit && !on) {
          qx(x, x);
          qy(y, y);
        } else {
          qx(x);
          qy(y);
        }
        show(hit);
      };
      const leave = () => show(false);
      list.addEventListener("pointermove", move);
      list.addEventListener("pointerleave", leave);
      return () => {
        list.removeEventListener("pointermove", move);
        list.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  const period = (a: Activity) => [a.startYear, a.endYear && a.endYear !== a.startYear ? a.endYear : undefined].filter(Boolean).join(" — ");

  return (
    <Section id="experience" tone="base" panel label={label}>
      <ol ref={ref} className="container-x relative grid grid-cols-[40px_1fr] pt-12 pb-[clamp(96px,14vh,160px)] lg:grid-cols-12">
        <li aria-hidden data-path-col className="pointer-events-none absolute inset-y-0 left-[var(--gutter)] w-10 lg:left-[calc(var(--gutter)+(100%-2*var(--gutter))*2/12)] lg:w-[calc((100%-2*var(--gutter))/12)]">
          {path && (
            <svg width={path.w} height={path.h} className="overflow-visible">
              <path data-route d={path.d} fill="none" stroke="var(--fg-muted)" strokeWidth="1.5" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
              <circle data-climber r="5" fill="var(--accent)" />
            </svg>
          )}
        </li>
        <li aria-hidden data-disc className="pointer-events-none absolute top-0 left-0 z-10 hidden size-32 rounded-full bg-white mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block" />
        {items.map((a) => {
          const title = (
            <>
              <span className="text-[clamp(20px,2vw,28px)] leading-snug font-medium">{a.title}</span>
              {a.summary && <span className="mt-2 block max-w-[60ch] text-muted">{a.summary}</span>}
            </>
          );
          return (
            <li
              key={a.slug}
              data-link={a.hasDetail || undefined}
              className="relative col-span-full grid grid-cols-subgrid border-t border-line py-8 data-[link]:[@media(hover:hover)_and_(pointer:fine)]:cursor-none"
            >
              <p data-speed="1.1" className="label col-start-2 text-accent lg:col-span-2 lg:col-start-1">
                {period(a)}
              </p>
              <span data-marker className="col-start-1 row-start-1 mt-1 size-2 justify-self-center rounded-full bg-fg lg:col-start-3 lg:row-start-auto" />
              <div className="col-start-2 lg:col-span-7 lg:col-start-4">
                {a.hasDetail ? (
                  // The link's ::before covers the whole row, so the row is one click target.
                  <Link href={`/activities/${a.slug}`} className="block before:absolute before:inset-0 before:content-['']">
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
