import { defineField, defineType } from "sanity";
import { requireEn } from "./i18n";

/** Experience timeline (max. 6 featured on Home); entries with a body or images get a detail page. */
export const activity = defineType({
  name: "activity",
  title: "Activity",
  type: "document",
  fields: [
    defineField({ name: "title", type: "localeString", validation: (r) => requireEn(r) as never }),
    defineField({ name: "slug", type: "slug", options: { source: "title.en" }, validation: (r) => r.required() }),
    defineField({ name: "org", title: "Organisation", type: "string" }),
    defineField({ name: "type", type: "string", options: { list: ["education", "organization", "competition", "certification", "event"] }, validation: (r) => r.required() }),
    defineField({ name: "startDate", type: "date", validation: (r) => r.required() }),
    defineField({ name: "endDate", type: "date" }),
    defineField({ name: "summary", type: "localeText" }),
    defineField({ name: "body", type: "localeBlocks" }),
    defineField({ name: "cover", type: "altImage" }),
    defineField({ name: "gallery", type: "array", of: [{ type: "altImage" }] }),
    defineField({ name: "url", type: "url" }),
    defineField({ name: "featured", type: "boolean", initialValue: true, description: "Show on the Home timeline (first 6 by order)." }),
    defineField({ name: "order", type: "number", validation: (r) => r.required() }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title.en", subtitle: "org", media: "cover" } },
});
