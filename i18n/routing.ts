import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "id"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // `/` is always English; visitors switch with the EN | ID toggle.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
