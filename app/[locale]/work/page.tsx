import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { IndexGrid } from "@/components/sections/IndexGrid";
import { Accent } from "@/components/ui/Accent";
import type { Locale } from "@/i18n/routing";
import { getContent } from "@/lib/content/get";
import { mediaSet } from "@/lib/content/resolve";
import { stripAccent } from "@/lib/content/text";
import { alternates } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("work");
  return { title: stripAccent(t("indexTitle")), alternates: alternates((await getLocale()) as Locale, "/work") };
}

export default async function WorkIndex() {
  const { projects } = await getContent((await getLocale()) as Locale);
  const t = await getTranslations("work");

  return (
    <section data-tone="base" className="bg-surface text-fg">
      <div className="container-x pt-[calc(var(--header-h)+clamp(48px,10vh,120px))] pb-12">
        <h1 className="display text-[clamp(56px,11vw,176px)]" data-line-mask>
          <Accent text={t("indexTitle")} />
        </h1>
      </div>
      <IndexGrid
        view={t("view")}
        cards={projects.map((p) => ({
          key: p.slug,
          href: `/work/${p.slug}`,
          title: p.title,
          meta: p.stack.slice(0, 2).join(" · "),
          summary: p.summary,
          images: mediaSet(p.cover, p.gallery),
          glyph: p.glyph,
        }))}
      />
    </section>
  );
}
