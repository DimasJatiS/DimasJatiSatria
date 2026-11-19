import { z } from "zod";

/** F-08 contact message. Field-level messages are i18n keys under `form.errors`. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "name").max(80, "name"),
  email: z.email("email").max(200, "email"),
  company: z.string().trim().max(120, "company").optional().default(""),
  message: z.string().trim().min(10, "message").max(4000, "message"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type FieldErrors = Partial<Record<keyof ContactInput | "captcha", string>>;
export type ContactState = { status: "idle" | "success" | "invalid" | "error" | "rateLimited"; errors?: FieldErrors };

/** In-memory sliding window per instance; Vercel Firewall rate-limits the route in front of it. */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.delete(hits.keys().next().value!); // bound memory
    return true;
  };
}
