// One-off import of the local seed (lib/content/seed.ts) into the Sanity dataset.
// Run from studio/: `pnpm exec sanity exec scripts/import-seed.ts --with-user-token`.
// Idempotent (createOrReplace with fixed ids), so re-running overwrites edits made in the Studio.
import { createReadStream } from "node:fs";
import { basename, resolve } from "node:path";
import { getCliClient } from "sanity/cli";
import { seed } from "../../lib/content/seed";
import type { I18n, RawImage } from "../../lib/content/types";

const client = getCliClient({ apiVersion: "2026-11-01" });
const publicDir = resolve(process.cwd(), "../public");
const uploaded = new Map<string, string>();

async function image(img: RawImage | undefined, key?: string) {
  if (!img) return undefined;
  let ref = uploaded.get(img.url);
  if (!ref) {
    const asset = await client.assets.upload("image", createReadStream(resolve(publicDir, `.${img.url}`)), { filename: basename(img.url) });
    ref = asset._id;
    uploaded.set(img.url, ref);
  }
  return { ...(key ? { _key: key } : {}), _type: "altImage", asset: { _type: "reference", _ref: ref }, alt: { _type: "localeString", ...img.alt } };
}
const loc = (type: string, v?: I18n<unknown>) => (v ? { _type: type, ...v } : undefined);
const gallery = async (list: RawImage[] = []) => Promise.all(list.map((g, i) => image(g, `g${i}`)));

const s = seed.settings;
const docs: Record<string, unknown>[] = [
  {
    _id: "siteSettings",
    _type: "siteSettings",
    heroLabel: s.heroLabel,
    heroStatement: loc("localeString", s.heroStatement),
    manifesto: loc("localeText", s.manifesto),
    email: s.email,
    linkedin: s.linkedin,
    github: s.github,
    // The CV is uploaded separately (scripts/upload-cv.ts); keep it when settings are replaced.
    cv: await client.fetch(`*[_id == "siteSettings"][0].cv`),
  },
];
for (const p of seed.projects)
  docs.push({
    _id: `project-${p.slug}`,
    _type: "project",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    featured: Boolean(p.featured),
    order: p.order,
    summary: loc("localeText", p.summary),
    role: p.role,
    year: p.year,
    duration: p.duration,
    team: p.team,
    stack: p.stack,
    glyph: p.glyph,
    galleryTile: p.galleryTile,
    liveUrl: p.liveUrl,
    repoUrl: p.repoUrl,
    problem: loc("localeBlocks", p.problem),
    process: loc("localeBlocks", p.process),
    results: loc("localeBlocks", p.results),
    decisions: p.decisions?.map((d, i) => ({ _key: `d${i}`, title: loc("localeString", d.title), body: loc("localeText", d.body), code: d.code })),
    cover: await image(p.cover),
    gallery: await gallery(p.gallery),
  });
for (const a of seed.activities)
  docs.push({
    _id: `activity-${a.slug}`,
    _type: "activity",
    title: loc("localeString", a.title),
    slug: { _type: "slug", current: a.slug },
    org: a.org,
    type: a.type,
    startDate: a.startDate,
    endDate: a.endDate,
    summary: loc("localeText", a.summary),
    body: loc("localeBlocks", a.body),
    cover: await image(a.cover),
    gallery: await gallery(a.gallery),
    url: a.url,
    featured: a.featured,
    order: a.order,
    glyph: a.glyph,
  });
seed.skills.forEach((g, i) => docs.push({ _id: `skill-${i + 1}`, _type: "skillGroup", title: loc("localeString", g.title), items: g.items, order: i + 1 }));

const tx = client.transaction();
// Imported docs use fixed ids; drop the ones whose slug left the seed (e.g. a renamed project).
const keep = new Set(docs.map((d) => d._id));
const stale = await client.fetch<string[]>(`*[(_type == "project" && _id match "project-*") || (_type == "activity" && _id match "activity-*")]._id`);
for (const id of stale) if (!keep.has(id)) tx.delete(id);
for (const d of docs) tx.createOrReplace(JSON.parse(JSON.stringify(d)) as { _id: string; _type: string });
await tx.commit();
console.log(`imported ${docs.length} documents, ${uploaded.size} images`);
