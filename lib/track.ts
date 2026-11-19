import { track as vercelTrack } from "@vercel/analytics";

/** PRD §2 CTA metrics. Custom events need a Vercel Pro plan; on Hobby this is a harmless no-op. */
export function track(event: "cv" | "contact_form" | "email" | "linkedin" | "github") {
  try {
    vercelTrack(event);
  } catch {}
}
