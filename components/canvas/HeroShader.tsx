"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Vector2 } from "three";
import { heroState } from "@/lib/motion/heroState";
import { gsap } from "@/lib/motion/gsap";
import { fragmentShader, vertexShader } from "@/shaders/hero";

function Plane() {
  const { advance, size, viewport } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uZoom: { value: 0 },
      uTheme: { value: document.documentElement.dataset.theme === "day" ? 1 : 0 },
      uPointer: { value: new Vector2(heroState.pointer.x, heroState.pointer.y) },
      uResolution: { value: new Vector2(1, 1) },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr);
  }, [size, viewport.dpr, uniforms]);

  // Driven by the single GSAP ticker (R3F's own loop is off); idle while the hero is off-screen.
  useEffect(() => {
    const tick = (time: number) => {
      if (!heroState.visible) return;
      const { pointer, target } = heroState;
      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;
      uniforms.uTime.value = time;
      uniforms.uZoom.value = heroState.zoom;
      uniforms.uPointer.value.set(pointer.x, pointer.y);
      advance(time * 1000);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance, uniforms]);

  // Night/Day: the uniform follows the DOM in the same 600 ms.
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => gsap.to(uniforms.uTheme, { value: root.dataset.theme === "day" ? 1 : 0, duration: 0.6 }));
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [uniforms]);

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/** M-03: fades in over the static fallback once the first frame is drawn. Falls back after repeated FPS drops. */
export default function HeroShader({ onFallback }: { onFallback: () => void }) {
  const [dpr, setDpr] = useState(1.5);
  const [ready, setReady] = useState(false);
  const declines = useRef(0);

  return (
    <div aria-hidden className="absolute inset-0 transition-opacity duration-[800ms] ease-[var(--ease-out)]" style={{ opacity: ready ? 1 : 0 }}>
      <Canvas
        frameloop="never"
        dpr={dpr}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance", depth: false, stencil: false }}
        onCreated={() => requestAnimationFrame(() => setReady(true))}
        fallback={null}
      >
        <PerformanceMonitor
          onDecline={() => {
            declines.current += 1;
            if (declines.current === 1) setDpr(1);
            else if (declines.current === 2) setDpr(0.75);
            else onFallback();
          }}
        />
        <Plane />
      </Canvas>
    </div>
  );
}
