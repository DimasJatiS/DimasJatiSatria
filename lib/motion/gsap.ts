"use client";

import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type { Tier } from "./tier";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
gsap.defaults({ ease: "power3.out", duration: 0.7 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const getTier = (): Tier => (document.documentElement.dataset.motion as Tier | undefined) ?? "still";
export const isMobile = () => window.matchMedia("(max-width: 639px)").matches;
/** Scrub inertia used by every scroll-linked tween (PRD §5.5). */
export const SCRUB = 0.8;
