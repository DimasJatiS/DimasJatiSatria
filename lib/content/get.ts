import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { client } from "@/sanity/client";
import { contentQuery } from "@/sanity/queries";
import { resolveContent } from "./resolve";
import { seed } from "./seed";
import type { RawContent } from "./types";

export const CONTENT_TAG = "sanity";

const loadRaw = cache(async (): Promise<RawContent> => {
  if (process.env.CONTENT_FIXTURES === "1" && process.env.NODE_ENV !== "production") return (await import("@/tests/fixtures/content")).fixtures;
  if (!client) return seed;
  try {
    const data = await client.fetch<Partial<RawContent>>(contentQuery, {}, { next: { revalidate: 3600, tags: [CONTENT_TAG] } });
    // An empty dataset falls back per collection, so the site never renders empty.
    return {
      settings: data.settings ?? seed.settings,
      projects: data.projects?.length ? data.projects : seed.projects,
      activities: data.activities ?? [],
      skills: data.skills?.length ? data.skills : seed.skills,
    };
  } catch (error) {
    // shortcut: seed output is cached like a normal page until the next revalidation (1 h) or webhook; add a short-lived cache if Sanity outages become common.
    console.error("[content] Sanity fetch failed, rendering the local seed", error);
    return seed;
  }
});

export const getContent = cache(async (locale: Locale) => resolveContent(await loadRaw(), locale));
