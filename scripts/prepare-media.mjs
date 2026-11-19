// Builds every generated asset once (run `pnpm media`); outputs are committed:
// - public/projects/<slug>/: cover.jpg (grayscale, for the zoom gallery), cover-color.jpg, gallery-N.jpg
// - lib/content/media.json: sizes for the seed content
// - public/grain.png: A6 grain tile (≤ 10 KB)
// - public/hero-fallback-{dark,light}.avif: still frame of the hero shader (lite/still tiers, 404)
// - components/artwork/contour-paths.json: A1 topographic contours (noise field + marching squares)
// Raw owner media lives in projects/ (not committed).
import { mkdir, readdir, writeFile, rm } from "node:fs/promises";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const SOURCES = {
  tbxxpert: { dir: "tbxxpert", cover: "cover.png", gallery: /^tbxpert-\d+\.jpe?g$/ },
  "ai-cv-screen": { dir: "ai-cv-screen", cover: "cover.png", gallery: null },
  inofa: { dir: "inofa", cover: "cover.png", gallery: /^inofa-\d+\.jpe?g$/, max: 6 },
  "bloomarie-store": { dir: "bloomarie-store", cover: "cover.png", gallery: /^bloomarie-\d+\.jpe?g$/ },
  siakad: { dir: "siakad", cover: "siakad-1.png", gallery: /^siakad-[2-9]\.png$/ },
};
const num = (f) => Number(f.match(/(\d+)\./)?.[1] ?? 0);

const media = {};
for (const [slug, src] of Object.entries(SOURCES)) {
  const inDir = new URL(`projects/${src.dir}/`, root);
  const outDir = new URL(`public/projects/${slug}/`, root);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const cover = sharp(new URL(src.cover, inDir).pathname).resize({ width: 1600, withoutEnlargement: true });
  // Gallery tiles are scaled up to 9×, so grayscale is baked into the file (no CSS filter).
  const grayInfo = await cover.clone().grayscale().jpeg({ quality: 72, mozjpeg: true }).toFile(new URL("cover.jpg", outDir).pathname);
  await cover.clone().jpeg({ quality: 76, mozjpeg: true }).toFile(new URL("cover-color.jpg", outDir).pathname);
  const entry = { cover: { src: `/projects/${slug}/cover.jpg`, color: `/projects/${slug}/cover-color.jpg`, width: grayInfo.width, height: grayInfo.height }, gallery: [] };
  if (src.gallery) {
    const files = (await readdir(inDir)).filter((f) => src.gallery.test(f)).sort((a, b) => num(a) - num(b)).slice(0, src.max ?? 8);
    for (const [i, f] of files.entries()) {
      const info = await sharp(new URL(f, inDir).pathname).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 76, mozjpeg: true }).toFile(new URL(`gallery-${i + 1}.jpg`, outDir).pathname);
      entry.gallery.push({ src: `/projects/${slug}/gallery-${i + 1}.jpg`, width: info.width, height: info.height });
    }
  }
  media[slug] = entry;
}
await writeFile(new URL("lib/content/media.json", root), JSON.stringify(media, null, 2) + "\n");

// Deterministic PRNG so every run produces the same assets.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// A6 grain: gray noise, single channel.
const G = 72;
const noise = Buffer.alloc(G * G);
for (let i = 0; i < noise.length; i++) noise[i] = Math.round(rand() * 255);
await sharp(noise, { raw: { width: G, height: G, channels: 1 } }).png({ compressionLevel: 9, palette: false }).toFile(new URL("public/grain.png", root).pathname);

// Hero fallback: blobs + bronze core at the valley floor, same palette as the shader (Spek §4).
const fallback = (bg, blob, blobA, core) => `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
  <defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter></defs>
  <rect width="1600" height="1000" fill="${bg}"/>
  <g filter="url(#b)" fill="${blob}" fill-opacity="${blobA}">
    <circle cx="520" cy="420" r="190"/><circle cx="1080" cy="380" r="210"/><circle cx="800" cy="560" r="170"/><circle cx="300" cy="640" r="140"/>
  </g>
  <circle cx="800" cy="820" r="150" fill="${core}" filter="url(#b)"/>
</svg>`;
for (const [name, svg] of [
  ["dark", fallback("#0A0A0A", "#A3A3A3", 0.35, "#CD7F32")],
  ["light", fallback("#F5F5F2", "#5C5C5C", 0.25, "#9A6230")],
]) {
  await sharp(Buffer.from(svg)).avif({ quality: 40 }).toFile(new URL(`public/hero-fallback-${name}.avif`, root).pathname);
}

// A1 contours: a smooth height field with one peak in the upper-right third, traced with marching squares.
const W = 1440, H = 900, step = 18, cols = W / step + 1, rows = H / step + 1;
const bumps = Array.from({ length: 9 }, () => ({ x: rand() * W, y: rand() * H, s: 120 + rand() * 220, a: (rand() - 0.5) * 0.9 }));
const field = (x, y) => {
  let v = Math.exp(-(((x - 980) / 420) ** 2 + ((y - 300) / 330) ** 2));
  for (const b of bumps) v += b.a * Math.exp(-(((x - b.x) / b.s) ** 2 + ((y - b.y) / b.s) ** 2));
  return v;
};
const grid = Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => field(i * step, j * step)));
const lerp = (a, b, t) => a + (b - a) * t;
const levels = Array.from({ length: 13 }, (_, k) => 0.08 + k * 0.07);
const paths = [];
for (const level of levels) {
  const segs = [];
  for (let j = 0; j < rows - 1; j++)
    for (let i = 0; i < cols - 1; i++) {
      const c = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
      const p = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([x, y]) => [x * step, y * step]);
      const pts = [];
      for (let e = 0; e < 4; e++) {
        const a = c[e], b = c[(e + 1) % 4];
        if ((a < level) !== (b < level)) {
          const t = (level - a) / (b - a);
          pts.push([lerp(p[e][0], p[(e + 1) % 4][0], t), lerp(p[e][1], p[(e + 1) % 4][1], t)]);
        }
      }
      if (pts.length >= 2) segs.push([pts[0], pts[1]]);
      if (pts.length === 4) segs.push([pts[2], pts[3]]);
    }
  // Chain segments into polylines.
  const key = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const unused = new Set(segs.keys());
  const byPoint = new Map();
  segs.forEach((s, idx) => s.forEach((pt) => byPoint.set(key(pt), [...(byPoint.get(key(pt)) ?? []), idx])));
  while (unused.size) {
    const first = unused.values().next().value;
    unused.delete(first);
    const line = [...segs[first]];
    for (let grow = true; grow; ) {
      grow = false;
      for (const idx of byPoint.get(key(line.at(-1))) ?? []) {
        if (!unused.has(idx)) continue;
        unused.delete(idx);
        const [a, b] = segs[idx];
        line.push(key(a) === key(line.at(-1)) ? b : a);
        grow = true;
        break;
      }
    }
    if (line.length < 12) continue;
    // Simplify to ≤ 40 points per path (Motion & Artwork §4, A1).
    const every = Math.max(1, Math.ceil(line.length / 40));
    const pts = line.filter((_, i) => i % every === 0 || i === line.length - 1);
    paths.push({ level, d: "M" + pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join("L") });
  }
}
// Outer to inner, so the draw-in (M-26) runs from the outside towards the peak.
paths.sort((a, b) => a.level - b.level);
await writeFile(new URL("components/artwork/contour-paths.json", root), JSON.stringify(paths.map((p) => p.d)) + "\n");
console.log(`media: ${Object.keys(media).length} projects, ${paths.length} contour paths`);
