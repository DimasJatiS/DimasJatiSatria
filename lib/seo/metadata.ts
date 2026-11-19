import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/config/site";

/** Path for a locale under `as-needed` prefixing: `/work/x` (en) or `/id/work/x` (id). */
export const localePath = (locale: Locale, path: string) => (locale === routing.defaultLocale ? path || "/" : `/${locale}${path}`);

/** Canonical + hreflang for one route (F-06, PRD §10 SEO). */
export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: { ...Object.fromEntries(routing.locales.map((l) => [l, localePath(l, path)])), "x-default": localePath("en", path) },
  };
}

export const absolute = (path: string) => `${SITE_URL}${path}`;
