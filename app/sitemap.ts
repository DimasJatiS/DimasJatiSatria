import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getContent } from "@/lib/content/get";
import { absolute, localePath } from "@/lib/seo/metadata";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, activities } = await getContent(routing.defaultLocale);
  const paths = ["", "/work", "/activities", ...projects.map((p) => `/work/${p.slug}`), ...activities.filter((a) => a.hasDetail).map((a) => `/activities/${a.slug}`)];
  return paths.map((path) => ({
    url: absolute(localePath("en", path)),
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, absolute(localePath(l, path))])) },
  }));
}
