/** Shared, allocation-free state between the hero scroll timeline and the shader (no React re-renders). */
export const heroState = {
  zoom: 0,
  visible: true,
  pointer: { x: 0.5, y: 0.22 },
  target: { x: 0.5, y: 0.22 },
};
