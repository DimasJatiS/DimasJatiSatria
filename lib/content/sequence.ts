import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getContent } from "./get";
import { mediaSet } from "./resolve";
import type { GlyphId, Img } from "./types";

export type SequenceItem = { key: string; href: string; title: string; label: string; images: Img[]; glyph: GlyphId };

/**
 * One pass through everything: every project, then every activity with a detail page, then back to
 * Contact on Home. "Next" never wraps around to the first item.
 */
export async function getSequence(locale: Locale): Promise<SequenceItem[]> {
  const { projects, activities } = await getContent(locale);
  const t = await getTranslations("case");
  const a = await getTranslations("activity");
  const nav = await getTranslations("nav");
  return [
    ...projects.map((p) => ({ key: `work-${p.slug}`, href: `/work/${p.slug}`, title: p.title, label: t("related"), images: mediaSet(p.cover, p.gallery), glyph: p.glyph })),
    ...activities
      .filter((x) => x.hasDetail)
      .map((x) => ({ key: `activity-${x.slug}`, href: `/activities/${x.slug}`, title: x.title, label: a("related"), images: mediaSet(x.cover, x.gallery), glyph: x.glyph })),
    { key: "contact", href: "/#contact", title: nav("contact"), label: t("home"), images: [], glyph: "chat" },
  ];
}

/** Every other stop in order; `start` points at the one right after `key`. */
export function relatedFor(sequence: SequenceItem[], key: string) {
  const i = sequence.findIndex((s) => s.key === key);
  return { items: sequence.filter((_, j) => j !== i), start: i };
}
