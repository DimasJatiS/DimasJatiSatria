import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import id from "@/messages/id.json";
import { buildGalleryTiles, pick, resolveContent, resolveImage } from "@/lib/content/resolve";
import { seed } from "@/lib/content/seed";
import { splitAccent, stripAccent } from "@/lib/content/text";
import { existsSync } from "node:fs";

const keys = (o: object, prefix = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

describe("messages", () => {
  it("en and id have the same keys", () => expect(keys(id).sort()).toEqual(keys(en).sort()));
});

describe("pick", () => {
  it("falls back to English when Indonesian is empty", () => {
    expect(pick({ en: "Hi", id: " " }, "id")).toBe("Hi");
    expect(pick({ en: "Hi", id: "Halo" }, "id")).toBe("Halo");
    expect(pick(undefined, "en")).toBeUndefined();
  });
});

describe("splitAccent", () => {
  it("marks *word* as the accent", () => {
    expect(splitAccent("into *crafted* products")).toEqual([
      { text: "into ", accent: false },
      { text: "crafted", accent: true },
      { text: " products", accent: false },
    ]);
    expect(stripAccent("into *crafted* products")).toBe("into crafted products");
  });
});

describe("resolveImage", () => {
  it("asks the Sanity CDN for a grayscale variant", () => {
    const img = resolveImage({ url: "https://cdn.sanity.io/images/p/d/a.jpg", width: 10, height: 10 }, "en", "x")!;
    expect(img.gray).toContain("sat=-100");
    expect(img.alt).toBe("x");
  });
});

describe("seed", () => {
  const content = resolveContent(seed, "id");
  it("resolves both languages without empty required text", () => {
    expect(content.settings.heroStatement).toContain("*");
    expect(content.projects.every((p) => p.summary.length > 0)).toBe(true);
  });
  it("has no case-study pages until the owner writes them", () => expect(content.projects.some((p) => p.hasCase)).toBe(false));
  it("only references media that exists", () => {
    for (const p of content.projects) for (const img of [p.cover!, ...p.gallery]) {
      expect(existsSync(`public${img.src}`)).toBe(true);
      expect(existsSync(`public${img.gray}`)).toBe(true);
    }
  });
});

describe("buildGalleryTiles", () => {
  const projects = resolveContent(seed, "en").projects;
  it("puts the first featured cover in the centre and fills 7 slots", () => {
    const tiles = buildGalleryTiles(projects);
    expect(tiles).toHaveLength(7);
    expect(tiles[4]).toMatchObject({ kind: "cover", project: { slug: "tbxxpert" } });
    expect(tiles.filter((t) => t.kind === "cover")).toHaveLength(3);
  });
  it("still fills every slot with a single project, and is empty without projects", () => {
    expect(buildGalleryTiles(projects.slice(0, 1))).toHaveLength(7);
    expect(buildGalleryTiles([])).toEqual([]);
  });
});
