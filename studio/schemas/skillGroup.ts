import { defineField, defineType } from "sanity";
import { requireEn } from "./i18n";

export const skillGroup = defineType({
  name: "skillGroup",
  title: "Skill group",
  type: "document",
  fields: [
    defineField({ name: "title", type: "localeString", validation: (r) => requireEn(r) as never }),
    defineField({ name: "items", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({ name: "order", type: "number" }),
  ],
  preview: { select: { title: "title.en" } },
});
