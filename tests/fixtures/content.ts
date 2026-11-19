import { seed } from "@/lib/content/seed";
import type { RawContent } from "@/lib/content/types";

// Dev/test only (CONTENT_FIXTURES=1, ignored in production builds). Clearly fake data that
// exercises every optional path: timeline + detail page, case study, contact channels.
const blocks = (text: string) => [{ _type: "block", _key: text.slice(0, 8), style: "normal", markDefs: [], children: [{ _type: "span", _key: "s", text, marks: [] }] }];

export const fixtures: RawContent = {
  ...seed,
  settings: { ...seed.settings, email: "hello@example.com", linkedin: "https://www.linkedin.com/in/example", github: "https://github.com/example", repoUrl: "https://github.com/example/portfolio" },
  projects: seed.projects.map((p) =>
    p.slug === "tbxxpert"
      ? {
          ...p,
          role: "Example role",
          year: "2025",
          problem: { en: blocks("Example problem statement (fixture)."), id: blocks("Contoh pernyataan masalah (fixture).") },
          process: { en: blocks("Example process (fixture).") },
          decisions: [{ title: { en: "Example decision" }, body: { en: "Why this choice was made (fixture)." }, code: { language: "ts", code: "const answer = 42;" } }],
          results: { en: blocks("Example result (fixture).") },
        }
      : p,
  ),
  activities: [
    { slug: "example-education", title: { en: "Example education" }, org: "Example University", type: "education", startDate: "2023-08-01", endDate: "2027-07-01", order: 1, body: { en: blocks("Example body (fixture).") } },
    { slug: "example-competition", title: { en: "Example competition" }, org: "Example org", type: "competition", startDate: "2025-05-01", order: 2 },
    { slug: "example-organization", title: { en: "Example organization" }, type: "organization", startDate: "2024-02-01", order: 3 },
    { slug: "example-certification", title: { en: "Example certification" }, type: "certification", startDate: "2024-10-01", order: 4 },
  ],
};
