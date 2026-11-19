"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { parallaxDistance } from "@/lib/motion/parallax";
import { gsap, getTier, isMobile, SCRUB, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * One loop for everything (Motion & Artwork §3): Lenis is driven by the GSAP ticker and feeds
 * ScrollTrigger. Also owns the page-wide effects: M-10 parallax, M-09 panels, M-23 line masks,
 * M-20 scrambled labels. Section-specific motion lives in each section.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    if (getTier() === "still") return;
    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.12 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  useGSAP(
    () => {
      if (!location.hash) window.__lenis?.scrollTo(0, { immediate: true, force: true });
      const tier = getTier();
      if (tier === "still") return;
      const small = isMobile() || tier === "lite";

      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const speed = Number(el.dataset.speed);
        const section = el.closest("section") ?? el;
        const d = () => parallaxDistance(speed, section.offsetHeight, window.innerHeight, small);
        gsap.fromTo(
          el,
          { y: () => -d() / 2 },
          { y: () => d() / 2, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: SCRUB, invalidateOnRefresh: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>(".panel-bg").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: isMobile() ? 0.96 : 0.92, y: () => window.innerHeight * (isMobile() ? 0.03 : 0.06) },
          { scaleX: 1, y: 0, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "top 40%", scrub: SCRUB, invalidateOnRefresh: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-line-mask]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 110, stagger: 0.08, duration: 0.7, scrollTrigger: { trigger: el, start: "top 80%", once: true } }),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-scramble]").forEach((el) => {
        const text = el.textContent ?? "";
        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true,
          onEnter: () => gsap.to(el, { duration: 0.4, ease: "none", scrambleText: { text, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", speed: 0.8 } }),
        });
      });

      ScrollTrigger.sort();
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
