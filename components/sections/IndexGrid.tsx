import { Glyph } from "@/components/artwork/Glyph";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Link } from "@/i18n/navigation";
import type { GlyphId, Img } from "@/lib/content/types";

export type IndexCard = { key: string; href?: string; title: string; meta: string; summary?: string; images: Img[]; glyph: GlyphId };

// Staggered two-column rhythm from the wireframe; repeats for any number of cards.
const LAYOUT = ["lg:col-span-7", "lg:col-span-5 lg:mt-40", "lg:col-span-5", "lg:col-span-6 lg:col-start-7 lg:mt-28", "lg:col-span-6 lg:col-start-3"];

/** Shared card grid of /work and /activities. Cards without a detail page are not links. */
export function IndexGrid({ cards, view }: { cards: IndexCard[]; view: string }) {
  return (
    <ol className="container-x grid gap-x-6 gap-y-16 pb-[clamp(96px,16vh,200px)] lg:grid-cols-12">
      {cards.map((c, i) => {
        const body = (
          <>
            <div className="media relative aspect-[4/3] bg-[color-mix(in_srgb,var(--fg)_6%,var(--surface))]">
              {c.images.length > 0 ? (
                <MediaFrame images={c.images} hover sizes={c.images.length > 1 ? "(min-width: 1024px) 25vw, 46vw" : "(min-width: 1024px) 50vw, 92vw"} />
              ) : (
                <span className="grid size-full place-items-center">
                  <Glyph glyph={c.glyph} animate className="size-1/3 text-muted transition-colors group-hover:text-accent" />
                </span>
              )}
              {c.href && <span className="label absolute right-4 bottom-4 rounded-full bg-surface px-3 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">{view} →</span>}
            </div>
            <div className="label mt-4 flex justify-between gap-4">
              <span className="transition-colors group-hover:text-accent">
                {c.title}
              </span>
              <span className="shrink-0 text-right text-muted">{c.meta}</span>
            </div>
            {c.summary && <p className="mt-2 max-w-[52ch] text-muted">{c.summary}</p>}
          </>
        );
        return (
          <li key={c.key} className={LAYOUT[i % LAYOUT.length]} data-speed={i % 2 ? "1.06" : "0.96"}>
            {c.href ? (
              <Link href={c.href} className="group block">
                {body}
              </Link>
            ) : (
              <div className="group">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
