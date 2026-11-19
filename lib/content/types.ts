import type { PortableTextBlock } from "next-sanity";

/** Raw shapes = what GROQ returns (and what the seed mirrors). Field names follow Spek §5. */
export type I18n<T = string> = { en?: T; id?: T };
export type GlyphId = "tbxxpert" | "cv" | "chat" | "flower" | "grid" | "generic";
export type ActivityType = "education" | "organization" | "competition" | "certification" | "event";

export type RawImage = {
  url: string;
  /** Seed only: pre-baked grayscale file. Sanity images get `sat=-100` from the CDN instead. */
  grayUrl?: string;
  width: number;
  height: number;
  alt?: I18n;
};

export type RawSettings = {
  heroLabel?: string;
  heroStatement?: I18n;
  manifesto?: I18n;
  facts?: I18n[];
  availability?: I18n;
  showAvailability?: boolean;
  email?: string;
  linkedin?: string;
  github?: string;
  repoUrl?: string;
  cvUrl?: string;
};

export type RawDecision = { title?: I18n; body?: I18n; code?: { language?: string; code?: string } };

export type RawProject = {
  title: string;
  slug: string;
  featured?: boolean;
  order?: number;
  summary?: I18n;
  role?: string;
  year?: string;
  duration?: string;
  team?: string;
  stack?: string[];
  glyph?: GlyphId;
  cover?: RawImage;
  galleryTile?: boolean;
  liveUrl?: string;
  repoUrl?: string;
  problem?: I18n<PortableTextBlock[]>;
  process?: I18n<PortableTextBlock[]>;
  results?: I18n<PortableTextBlock[]>;
  decisions?: RawDecision[];
  gallery?: RawImage[];
};

export type RawActivity = {
  title: I18n;
  slug: string;
  org?: string;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
  summary?: I18n;
  body?: I18n<PortableTextBlock[]>;
  cover?: RawImage;
  gallery?: RawImage[];
  url?: string;
  featured?: boolean;
  order?: number;
};

export type RawSkillGroup = { title: I18n; items?: string[]; order?: number };

export type RawContent = {
  settings: RawSettings;
  projects: RawProject[];
  activities: RawActivity[];
  skills: RawSkillGroup[];
};

/** Resolved shapes = one locale, ready for components. */
export type Img = { src: string; gray: string; width: number; height: number; alt: string };

export type Settings = {
  heroLabel: string;
  heroStatement: string;
  manifesto: string;
  facts: string[];
  availability?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  repoUrl?: string;
  cvUrl?: string;
};

export type Decision = { title: string; body: string; code?: { language: string; code: string } };

export type Project = {
  slug: string;
  title: string;
  featured: boolean;
  summary: string;
  role?: string;
  year?: string;
  duration?: string;
  team?: string;
  stack: string[];
  glyph: GlyphId;
  cover?: Img;
  galleryTile: boolean;
  liveUrl?: string;
  repoUrl?: string;
  problem?: PortableTextBlock[];
  process?: PortableTextBlock[];
  results?: PortableTextBlock[];
  decisions: Decision[];
  gallery: Img[];
  /** Only projects with case-study text get a /work/[slug] page (design doc §5.3). */
  hasCase: boolean;
};

export type Activity = {
  slug: string;
  title: string;
  org?: string;
  type: ActivityType;
  startYear?: string;
  endYear?: string;
  summary?: string;
  body?: PortableTextBlock[];
  cover?: Img;
  gallery: Img[];
  url?: string;
  featured: boolean;
  hasDetail: boolean;
};

export type SkillGroup = { title: string; items: string[] };

export type Content = { settings: Settings; projects: Project[]; activities: Activity[]; skills: SkillGroup[] };
