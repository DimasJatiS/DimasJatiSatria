import type { Locale } from "@/i18n/routing";
import type { Activity, Content, GlyphId, I18n, Img, Project, RawContent, RawImage, RawProject, Settings } from "./types";

const GLYPHS: GlyphId[] = ["tbxxpert", "cv", "chat", "flower", "grid", "generic"];

/** Field in the visitor's language, English when the Indonesian translation is still empty. */
export function pick<T>(value: I18n<T> | undefined, locale: Locale): T | undefined {
  if (!value) return undefined;
  const local = value[locale];
  const isEmpty = local == null || (typeof local === "string" && local.trim() === "") || (Array.isArray(local) && local.length === 0);
  return isEmpty ? value.en : local;
}

const isSanityAsset = (url: string) => url.startsWith("https://cdn.sanity.io/");

export function resolveImage(img: RawImage | undefined, locale: Locale, fallbackAlt: string): Img | undefined {
  if (!img?.url) return undefined;
  const sanity = isSanityAsset(img.url);
  const sized = (extra: string) => (sanity ? `${img.url}?w=1600&fit=max&auto=format${extra}` : img.url);
  return {
    src: sized(""),
    gray: img.grayUrl ?? (sanity ? sized("&sat=-100") : img.url),
    width: img.width,
    height: img.height,
    alt: pick(img.alt, locale) ?? fallbackAlt,
  };
}

const year = (date?: string) => (date && /^\d{4}/.test(date) ? date.slice(0, 4) : undefined);
const nonEmpty = <T,>(blocks?: T[]) => (blocks && blocks.length > 0 ? blocks : undefined);

function resolveProject(p: RawProject, locale: Locale): Project {
  const decisions = (p.decisions ?? [])
    .map((d) => ({
      title: pick(d.title, locale) ?? "",
      body: pick(d.body, locale) ?? "",
      code: d.code?.code ? { language: d.code.language ?? "text", code: d.code.code } : undefined,
    }))
    .filter((d) => d.title || d.body);
  const problem = nonEmpty(pick(p.problem, locale));
  return {
    slug: p.slug,
    title: p.title,
    featured: Boolean(p.featured),
    summary: pick(p.summary, locale) ?? "",
    role: p.role,
    year: p.year,
    duration: p.duration,
    team: p.team,
    stack: p.stack ?? [],
    glyph: p.glyph && GLYPHS.includes(p.glyph) ? p.glyph : "generic",
    cover: resolveImage(p.cover, locale, p.title),
    galleryTile: p.galleryTile !== false,
    liveUrl: p.liveUrl,
    repoUrl: p.repoUrl,
    problem,
    process: nonEmpty(pick(p.process, locale)),
    results: nonEmpty(pick(p.results, locale)),
    decisions,
    gallery: (p.gallery ?? []).flatMap((g, i) => resolveImage(g, locale, `${p.title} ${i + 1}`) ?? []),
    hasCase: Boolean(problem || decisions.length),
  };
}

export function resolveContent(raw: RawContent, locale: Locale): Content {
  const s = raw.settings;
  const settings: Settings = {
    heroLabel: s.heroLabel || "LONG LIVE LEARNER",
    heroStatement: pick(s.heroStatement, locale) ?? "",
    manifesto: pick(s.manifesto, locale) ?? "",
    facts: (s.facts ?? []).flatMap((f) => pick(f, locale) ?? []).slice(0, 5),
    availability: s.showAvailability === false ? undefined : pick(s.availability, locale),
    email: s.email || undefined,
    linkedin: s.linkedin || undefined,
    github: s.github || undefined,
    repoUrl: s.repoUrl || undefined,
    cvUrl: s.cvUrl || undefined,
  };
  const byOrder = <T extends { order?: number }>(a: T, b: T) => (a.order ?? 99) - (b.order ?? 99);
  const activities: Activity[] = [...raw.activities].sort(byOrder).map((a) => {
    const body = nonEmpty(pick(a.body, locale));
    const cover = resolveImage(a.cover, locale, pick(a.title, locale) ?? a.slug);
    const gallery = (a.gallery ?? []).flatMap((g, i) => resolveImage(g, locale, `${pick(a.title, locale)} ${i + 1}`) ?? []);
    return {
      slug: a.slug,
      title: pick(a.title, locale) ?? a.slug,
      org: a.org,
      type: a.type ?? "event",
      startYear: year(a.startDate),
      endYear: year(a.endDate),
      summary: pick(a.summary, locale),
      body,
      cover,
      gallery,
      url: a.url,
      featured: a.featured !== false,
      hasDetail: Boolean(body || cover || gallery.length),
    };
  });
  return {
    settings,
    projects: [...raw.projects].sort(byOrder).map((p) => resolveProject(p, locale)),
    activities,
    skills: [...raw.skills].sort(byOrder).map((g) => ({ title: pick(g.title, locale) ?? "", items: g.items ?? [] })),
  };
}

export type Tile = { kind: "cover"; project: Project } | { kind: "glyph"; project: Project };

/**
 * Work zoom gallery (Spek 2.4, M-12): 7 slots in a 3×3 grid whose last row is one wide tile.
 * Featured covers take the centre (index 4), the wide tile (6) and the first tile (0);
 * the other slots show project glyphs. Works for any number of projects ≥ 1.
 */
export function buildGalleryTiles(projects: Project[], slots = 7): Tile[] {
  const pool = projects.filter((p) => p.galleryTile);
  if (pool.length === 0) return [];
  const covers = pool.filter((p) => p.featured && p.cover);
  const coverSlots = [4, 6, 0].slice(0, covers.length);
  const glyphPool = [...pool.filter((p) => !covers.includes(p)), ...pool];
  const tiles: Tile[] = [];
  let g = 0;
  for (let i = 0; i < slots; i++) {
    const c = coverSlots.indexOf(i);
    tiles.push(c >= 0 ? { kind: "cover", project: covers[c]! } : { kind: "glyph", project: glyphPool[g++ % glyphPool.length]! });
  }
  return tiles;
}
