// Spek §4: 4 gray metaballs (SDF circles + smooth-min, k = 0.35) and one bronze core,
// per-pixel grain, one full-screen triangle pair, no textures.
export const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uZoom;
uniform float uTheme;
uniform vec2 uPointer;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);

  // Each ball orbits a fixed point (radius 0.05–0.15, period 14–30 s).
  float d = 10.0;
  d = smin(d, length(p - vec2(-0.42, 0.10) - 0.12 * vec2(cos(uTime / 14.0), sin(uTime / 14.0))) - 0.20, 0.35);
  d = smin(d, length(p - vec2(0.38, 0.14) - 0.15 * vec2(sin(uTime / 22.0), cos(uTime / 22.0))) - 0.24, 0.35);
  d = smin(d, length(p - vec2(0.02, -0.02) - 0.08 * vec2(cos(uTime / 30.0), sin(uTime / 18.0))) - 0.17, 0.35);
  d = smin(d, length(p - vec2(-0.70, -0.20) - 0.05 * vec2(sin(uTime / 26.0), cos(uTime / 26.0))) - 0.14, 0.35);
  float field = smoothstep(0.22, -0.18, d);

  // Bronze core: follows the (already lerped) pointer, rises to the centre and grows with uZoom.
  // Storyboard: small at p 0, ~60% of the screen at p 0.5, full bronze at p 1.
  vec2 corePos = mix(vec2((uPointer.x - 0.5) * aspect, uPointer.y - 0.5), vec2(0.0), smoothstep(0.0, 0.6, uZoom));
  float coreR = mix(0.09, 0.4, smoothstep(0.0, 0.5, uZoom)) + 1.6 * max(aspect, 1.0) * smoothstep(0.5, 1.0, uZoom);
  float core = smoothstep(coreR, coreR * 0.15, length(p - corePos));

  vec3 bg = mix(vec3(0.039), vec3(0.961, 0.961, 0.949), uTheme);
  vec3 ball = mix(vec3(0.639), vec3(0.361), uTheme);
  vec3 bronze = mix(vec3(0.804, 0.498, 0.196), vec3(0.604, 0.384, 0.188), uTheme);

  vec3 col = mix(bg, ball, field * mix(0.35, 0.25, uTheme));
  col = mix(col, bronze, core);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 97.0) - 0.5) * mix(0.08, 0.05, uTheme);
  gl_FragColor = vec4(col, 1.0);
}
`;
