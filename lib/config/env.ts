import "server-only";
import { z } from "zod";

// Every variable is optional: a missing or malformed value is logged and treated as
// "not configured" so the site still renders from seed content (PRD F-12).
const schema = z.object({
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().regex(/^[a-z0-9-]+$/).optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().regex(/^[a-z0-9_-]+$/).default("production"),
  SANITY_REVALIDATE_SECRET: z.string().min(16).optional(),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  CONTACT_FROM_EMAIL: z.string().min(3).optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(10).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(10).optional(),
});

function read() {
  const raw = Object.fromEntries(Object.keys(schema.shape).map((k) => [k, process.env[k] || undefined]));
  const out: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema.shape)) {
    const parsed = (field as z.ZodType).safeParse(raw[key]);
    if (parsed.success) out[key] = parsed.data;
    else console.error(`[env] ${key} is invalid and will be ignored`);
  }
  return out as z.infer<typeof schema>;
}

export const env = read();

export const sanityConfigured = Boolean(env.NEXT_PUBLIC_SANITY_PROJECT_ID);
export const contactConfigured = Boolean(
  env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL && env.CONTACT_TO_EMAIL && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY,
);
