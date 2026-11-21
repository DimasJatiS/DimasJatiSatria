import { getTranslations } from "next-intl/server";
import { Contour } from "@/components/artwork/Contour";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <section data-tone="base" className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-surface text-fg">
      {/* Still frame of the hero shader (Spek §4 fallback) + A1 contours, both static. */}
      <div aria-hidden className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-fallback-dark.avif" alt="" className="size-full object-cover in-data-[theme=day]:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-fallback-light.avif" alt="" className="hidden size-full object-cover in-data-[theme=day]:block" />
        <Contour draw={false} className="absolute inset-0 size-full opacity-60" />
      </div>
      <div className="container-x relative text-center">
        <p className="label text-accent">404</p>
        <h1 className="display mt-4 text-[clamp(48px,9vw,140px)]">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("body")}</p>
        <Link href="/" className="pill pill-accent mt-8">
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
