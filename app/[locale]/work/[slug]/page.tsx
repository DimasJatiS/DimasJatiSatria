import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Glyph } from "@/components/artwork/Glyph";
import { CaseHero } from "@/components/sections/CaseHero";
import { RichText } from "@/components/ui/RichText";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getContent } from "@/lib/content/get";
import { jsonLdString, projectJsonLd } from "@/lib/seo/jsonld";
import { absolute, alternates, localePath } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { projects } = await getContent(routing.defaultLocale);
  return projects.filter((p) => p.hasCase).map((p) => ({ slug: p.slug }));
}

async function load(slug: string) {
  const locale = (await getLocale()) as Locale;
  const { projects } = await getContent(locale);
  const cases = projects.filter((p) => p.hasCase);
  const i = cases.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  return { locale, project: cases[i]!, next: cases.length > 1 ? cases[(i + 1) % cases.length] : undefined };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { locale, project } = await load(slug);
  return { title: project.title, description: project.summary, alternates: alternates(locale, `/work/${slug}`) };
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const { locale, project: p, next } = await load(slug);
  const t = await getTranslations("case");
  const w = await getTranslations("work");

  const meta = [
    [t("role"), p.role],
    [t("duration"), p.duration ?? p.year],
    [t("team"), p.team],
    [t("stack"), p.stack.join(", ")],
  ].filter(([, v]) => v) as [string, string][];

  const block = (title: string, body: React.ReactNode) => (
    <section className="grid gap-6 border-t border-line py-14 lg:grid-cols-12">
      <h2 className="label text-accent lg:col-span-3">{title}</h2>
      <div className="lg:col-span-8 lg:col-start-5">{body}</div>
    </section>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(projectJsonLd(p, absolute(localePath(locale, `/work/${p.slug}`)))) }} />
      <CaseHero media={p.cover}>
        <Link href={{ pathname: "/", hash: "work" }} className="label link-underline text-muted">
          ← {t("back")}
        </Link>
        <div className="mt-8 flex items-end justify-between gap-6">
          <h1 className="display text-[clamp(48px,10vw,168px)] font-normal" data-line-mask>
            {p.title}
          </h1>
          <Glyph glyph={p.glyph} animate className="mb-2 hidden size-24 shrink-0 text-muted sm:block" />
        </div>
        <p className="mt-6 max-w-[48ch] text-[clamp(18px,1.6vw,22px)] text-muted">{p.summary}</p>
      </CaseHero>

      <div data-tone="inverse" className="relative bg-surface text-fg">
        <div className="container-x pb-24">
          <dl className="grid grid-cols-2 gap-6 py-12 lg:grid-cols-5">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="label text-muted">{k}</dt>
                <dd className="mt-2">{v}</dd>
              </div>
            ))}
            {(p.liveUrl || p.repoUrl) && (
              <div>
                <dt className="label text-muted">{t("links")}</dt>
                <dd className="mt-2 flex gap-4">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="link-underline">{w("live")} ↗</a>}
                  {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="link-underline">{w("source")} ↗</a>}
                </dd>
              </div>
            )}
          </dl>
          {p.problem && block(t("problem"), <RichText value={p.problem} />)}
          {p.process && block(t("process"), <RichText value={p.process} />)}
          {p.decisions.length > 0 &&
            block(
              t("decisions"),
              <ol className="space-y-12">
                {p.decisions.map((d, i) => (
                  <li key={i}>
                    <h3 className="text-2xl font-medium">
                      <span className="label mr-3 text-accent">{String(i + 1).padStart(2, "0")}</span>
                      {d.title}
                    </h3>
                    {d.body && <p className="mt-3 max-w-[68ch] whitespace-pre-line text-muted">{d.body}</p>}
                    {d.code && (
                      <pre className="mt-5 overflow-x-auto rounded-xl border border-line bg-[color-mix(in_srgb,var(--fg)_5%,transparent)] p-5 font-mono text-sm leading-relaxed">
                        <code data-language={d.code.language}>{d.code.code}</code>
                      </pre>
                    )}
                  </li>
                ))}
              </ol>,
            )}
          {p.results && block(t("results"), <RichText value={p.results} />)}
          {p.gallery.length > 0 &&
            block(
              t("gallery"),
              <div className="grid gap-6 sm:grid-cols-2">
                {p.gallery.map((img, i) => (
                  <div key={img.src} data-speed={i % 2 ? "1.08" : "0.94"} className="media relative">
                    <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 1024px) 40vw, 92vw" className="h-auto w-full" />
                  </div>
                ))}
              </div>,
            )}
        </div>
      </div>

      {next && (
        <Link href={`/work/${next.slug}`} data-tone="base" className="group block bg-surface text-fg">
          <div className="container-x py-[clamp(96px,16vh,200px)]">
            <p className="label text-muted">{t("next")}</p>
            <p className="display mt-4 text-[clamp(56px,12vw,200px)] font-normal transition-colors group-hover:text-accent">{next.title} →</p>
          </div>
        </Link>
      )}
    </>
  );
}
