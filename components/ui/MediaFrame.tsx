import Image from "next/image";
import type { Img } from "@/lib/content/types";

/**
 * One image, or a row of portrait images side by side at the same height (columns sized by their
 * ratios), so portrait photos are never cropped into a landscape box. Grayscale by default; with
 * `hover` the colour version fades in on hover of a parent `.group`.
 */
export function MediaFrame({ images, sizes, color = false, hover = false, priority = false }: { images: Img[]; sizes: string; color?: boolean; hover?: boolean; priority?: boolean }) {
  return (
    <div className="grid size-full gap-[2px]" style={{ gridTemplateColumns: images.map((i) => `${(i.width / i.height).toFixed(3)}fr`).join(" ") }}>
      {images.map((img) => (
        <div key={img.src} className="relative overflow-hidden">
          <Image src={color ? img.src : img.gray} alt={img.alt} fill sizes={sizes} priority={priority} className="object-cover" />
          {hover && !color && img.gray !== img.src && (
            <Image src={img.src} alt="" aria-hidden fill sizes={sizes} className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          )}
        </div>
      ))}
    </div>
  );
}
