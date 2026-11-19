import { SITE_URL } from "@/lib/config/site";
import type { Project, Settings } from "@/lib/content/types";

export function personJsonLd(s: Settings, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dimas Jati Satria",
    jobTitle: "Software Engineer",
    description,
    url: SITE_URL,
    alumniOf: { "@type": "CollegeOrUniversity", name: "Universitas Gadjah Mada" },
    sameAs: [s.linkedin, s.github].filter(Boolean),
  };
}

export function projectJsonLd(p: Project, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.summary,
    url,
    author: { "@type": "Person", name: "Dimas Jati Satria" },
    keywords: p.stack.join(", "),
    ...(p.cover ? { image: p.cover.src.startsWith("http") ? p.cover.src : `${SITE_URL}${p.cover.src}` } : {}),
  };
}

/** JSON in a <script> must not be able to close the tag. */
export const jsonLdString = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
