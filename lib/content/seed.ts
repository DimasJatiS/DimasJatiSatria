import media from "./media.json";
import type { RawContent, RawImage } from "./types";

// Local fallback (PRD F-12). Only facts stated in the planning docs or the owner's Figma;
// case-study text, years, roles and contact channels are added by the owner in Sanity.
type MediaKey = keyof typeof media;

function cover(slug: MediaKey, title: string): RawImage {
  const c = media[slug].cover;
  return { url: c.color, grayUrl: c.src, width: c.width, height: c.height, alt: { en: `${title} — cover`, id: `${title} — sampul` } };
}

function gallery(slug: MediaKey, title: string): RawImage[] {
  return media[slug].gallery.map((g, i) => ({
    url: g.src,
    width: g.width,
    height: g.height,
    alt: { en: `${title} — screenshot ${i + 1}`, id: `${title} — tangkapan layar ${i + 1}` },
  }));
}

export const seed: RawContent = {
  settings: {
    heroLabel: "LONG LIVE LEARNER",
    heroStatement: {
      en: "Software engineer turning curiosity into *crafted* products",
      id: "Software engineer yang meramu rasa ingin tahu menjadi produk yang *matang*",
    },
    manifesto: {
      en: "I learn by building. Every project adds one more layer of depth, from *interface* to model to server.",
      id: "Saya belajar dengan membangun. Setiap proyek menambah satu lapis kedalaman, dari *antarmuka* ke model hingga server.",
    },
    facts: [
      { en: "UGM · Applied Software Engineering", id: "UGM · Teknologi Rekayasa Perangkat Lunak" },
      { en: "Feb 2027 · 4+ months", id: "Feb 2027 · 4+ bulan" },
      { en: "Onsite or remote", id: "Onsite atau remote" },
      { en: "WIB · UTC+7", id: "WIB · UTC+7" },
    ],
    availability: {
      en: "Available for internship · Feb 2027 · 4+ months · onsite or remote",
      id: "Siap magang · Feb 2027 · 4+ bulan · onsite atau remote",
    },
    showAvailability: true,
  },
  projects: [
    {
      title: "TBXxpert",
      slug: "tbxxpert",
      featured: true,
      order: 1,
      summary: {
        en: "AI app that screens for tuberculosis from cough audio, with medication reminders.",
        id: "Aplikasi AI untuk skrining TBC dari audio batuk, dilengkapi pengingat minum obat.",
      },
      stack: ["Flutter", "FastAPI", "PostgreSQL", "Gemini API", "DNN · HeAR"],
      glyph: "tbxxpert",
      cover: cover("tbxxpert", "TBXxpert"),
      galleryTile: true,
      gallery: gallery("tbxxpert", "TBXxpert"),
    },
    {
      title: "AI CV Screen",
      slug: "ai-cv-screen",
      featured: true,
      order: 2,
      summary: { en: "AI-based CV scoring system.", id: "Sistem penilaian CV berbasis AI." },
      stack: ["Node.js", "Gemini API", "PostgreSQL", "Prisma"],
      glyph: "cv",
      cover: cover("ai-cv-screen", "AI CV Screen"),
      galleryTile: true,
    },
    {
      title: "Inofa",
      slug: "inofa",
      featured: true,
      order: 3,
      summary: {
        en: "Matchmaking platform for web and Android with real-time chat.",
        id: "Platform matchmaking web dan Android dengan chat real-time.",
      },
      stack: ["Laravel", "Tailwind CSS", "MySQL", "Pusher"],
      glyph: "chat",
      cover: cover("inofa", "Inofa"),
      galleryTile: true,
      gallery: gallery("inofa", "Inofa"),
    },
    {
      title: "Bloomarie Store",
      slug: "bloomarie-store",
      order: 4,
      summary: {
        en: "Flower bouquet store with authentication and a payment gateway.",
        id: "Toko buket bunga dengan autentikasi dan payment gateway.",
      },
      stack: ["PHP", "MySQL", "Bootstrap"],
      glyph: "flower",
      cover: cover("bloomarie-store", "Bloomarie Store"),
      galleryTile: true,
      gallery: gallery("bloomarie-store", "Bloomarie Store"),
    },
    {
      title: "SIAKAD",
      slug: "siakad",
      order: 5,
      summary: { en: "Academic information system.", id: "Sistem informasi akademik." },
      stack: ["PHP", "MySQL", "Bootstrap"],
      glyph: "grid",
      cover: cover("siakad", "SIAKAD"),
      galleryTile: true,
      gallery: gallery("siakad", "SIAKAD"),
    },
  ],
  activities: [],
  skills: [
    { title: { en: "Frontend & Creative", id: "Frontend & Kreatif" }, items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GSAP", "three.js / R3F"] },
    { title: { en: "Backend & Data", id: "Backend & Data" }, items: ["Node.js", "PHP / Laravel", "Python / FastAPI", "PostgreSQL", "MongoDB", "Prisma"] },
    { title: { en: "Mobile & AI", id: "Mobile & AI" }, items: ["Flutter", "Kotlin", "Java", "Gemini API", "Audio classification (DNN)"] },
    { title: { en: "Design & Collaboration", id: "Desain & Kolaborasi" }, items: ["Figma", "Photoshop", "Illustrator", "Git", "Event management"] },
  ],
};
