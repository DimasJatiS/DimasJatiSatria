import { defineField, defineType } from "sanity";

// Every translatable field is { en, id } (Spek §5). English is required where the field is;
// an empty Indonesian value falls back to English on the site.
const both = (type: "string" | "text", rows?: number) => [
  defineField({ name: "en", title: "English", type, ...(rows ? { rows } : {}) }),
  defineField({ name: "id", title: "Bahasa Indonesia", type, ...(rows ? { rows } : {}) }),
];

export const localeString = defineType({ name: "localeString", title: "Text (EN + ID)", type: "object", fields: both("string") });
export const localeText = defineType({ name: "localeText", title: "Long text (EN + ID)", type: "object", fields: both("text", 4) });

const blocks = {
  type: "array" as const,
  of: [
    {
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Subheading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Accent (italic)", value: "em" },
          { title: "Code", value: "code" },
        ],
      },
    },
  ],
};
export const localeBlocks = defineType({
  name: "localeBlocks",
  title: "Rich text (EN + ID)",
  type: "object",
  fields: [defineField({ name: "en", title: "English", ...blocks }), defineField({ name: "id", title: "Bahasa Indonesia", ...blocks })],
});

export const altImage = defineType({
  name: "altImage",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [defineField({ name: "alt", title: "Alt text", type: "localeString", validation: (r) => r.required() })],
});

/** Requires the English value of a { en, id } field. */
export const requireEn = (r: { custom: (fn: (v: { en?: unknown } | undefined) => true | string) => unknown }) =>
  r.custom((v) => (v?.en ? true : "English is required"));
