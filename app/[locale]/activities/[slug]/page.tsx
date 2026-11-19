import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CaseHero } from "@/components/sections/CaseHero";
import { RichText } from "@/components/ui/RichText";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getContent } from "@/lib/content/get";
import { alternates } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { activities } = await getContent(routing.defaultLocale);
  return activities.filter((a) => a.hasDetail).map((a) => ({ slug: a.slug }));
}

async function load(slug: string) {
  const locale = (await getLocale()) as Locale;
  const list = (await getContent(locale)).activities.filter((a) => a.hasDetail);
  const i = list.findIndex((a) => a.slug === slug);
  if (i < 0) notFound();
  return { locale, activity: list[i]!, next: list.length > 1 ? list[(i + 1) % list.length] : undefined };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { locale, activity } = await load(slug);
  return { title: activity.title, description: activity.summary, alternates: alternates(locale, `/activities/${slug}`) };
}

export default async function ActivityPage({ params }: Params) {
  const { slug } = await params;
  const { activity: a, next } = await load(slug);
  const t = await getTranslations("activity");
  const period = [a.startYear, a.endYear].filter(Boolean).join(" — ");

  return (
    <>
      <CaseHero media={a.cover}>
        <Link href={{ pathname: "/", hash: "experience" }} className="label link-underline text-muted">
          ← {t("back")}
        </Link>
        <p className="label mt-8 text-accent">{[t(`types.${a.type}`), a.org, period].filter(Boolean).join(" · ")}</p>
        <h1 className="display mt-4 text-[clamp(40px,8vw,128px)] font-normal" data-line-mask>
          {a.title}
        </h1>
        {a.summary && <p className="mt-6 max-w-[52ch] text-[clamp(18px,1.6vw,22px)] text-muted">{a.summary}</p>}
        {a.url && (
          <a href={a.url} target="_blank" rel="noreferrer" className="label link-underline mt-6 inline-block">
            {t("link")} ↗
          </a>
        )}
      </CaseHero>
      <div data-tone="inverse" className="bg-surface text-fg">
        <div className="container-x grid gap-16 py-20">
          {a.body && <RichText value={a.body} />}
          {a.gallery.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {a.gallery.map((img) => (
                <div key={img.src} className="media relative">
                  <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 1024px) 40vw, 92vw" className="h-auto w-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {next && (
        <Link href={`/activities/${next.slug}`} data-tone="base" className="group block bg-surface text-fg">
          <div className="container-x py-[clamp(80px,14vh,180px)]">
            <p className="label text-muted">{t("next")}</p>
            <p className="display mt-4 text-[clamp(40px,8vw,128px)] font-normal transition-colors group-hover:text-accent">{next.title} →</p>
          </div>
        </Link>
      )}
    </>
  );
}
