"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Sunrise } from "@/components/artwork/Sunrise";
import { ContactForm } from "@/components/forms/ContactForm";
import { CopyButton } from "@/components/ui/CopyButton";
import { Section } from "@/components/ui/Section";
import { TextPressure } from "@/components/ui/TextPressure";
import type { Settings } from "@/lib/content/types";
import { gsap, getTier, SCRUB, useGSAP } from "@/lib/motion/gsap";

type Props = {
  index: number;
  total: number;
  label: string;
  panel: boolean;
  settings: Settings;
  /** live = keys present; note = dev without keys; hidden = production without keys. */
  form: { mode: "live"; siteKey: string } | { mode: "note" | "hidden" };
};

export function Contact({ index, total, label, panel, settings, form }: Props) {
  const t = useTranslations("contact");
  const a11y = useTranslations("a11y");
  const ref = useRef<HTMLDivElement>(null);

  // M-29: the sun rises behind the horizon; the horizon lines stay put. Held 80vh in `full`.
  useGSAP(
    () => {
      const tier = getTier();
      if (tier === "still") return;
      const sun = ref.current!.querySelector("[data-sun]");
      const full = tier === "full";
      // Rises while the intro scrolls in; in `full` it finishes inside the 80vh sticky hold.
      gsap.fromTo(
        sun,
        { yPercent: 100 },
        {
          yPercent: full ? 45 : 0,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "top top",
            scrub: SCRUB,
          },
        },
      );
      if (full)
        gsap.fromTo(
          sun,
          { yPercent: 45 },
          {
            yPercent: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: ref.current,
              start: "top top",
              end: "bottom bottom",
              scrub: SCRUB,
            },
          },
        );
    },
    { scope: ref },
  );

  const links = [
    settings.linkedin && {
      href: settings.linkedin,
      label: "LinkedIn",
      track: "linkedin",
    },
    settings.github && {
      href: settings.github,
      label: "GitHub",
      track: "github",
    },
  ].filter(Boolean) as { href: string; label: string; track: string }[];

  return (
    <Section
      id="contact"
      tone="base"
      panel={panel}
      index={index}
      total={total}
      label={label}
    >
      <div ref={ref} className="track track-sun">
        <div className="sticky-frame container-x flex flex-col pt-10">
          <h3 className="display text-[clamp(56px,11vw,184px)] leading-[0.9] font-normal">
            <TextPressure text={t("title").toUpperCase()} />
            <span className="block">
              <span className="accent-word">{t("titleAccent")}</span>.
            </span>
          </h3>
          <Sunrise className="mt-auto pt-10" />
        </div>
      </div>
      <div className="container-x grid gap-16 pb-[clamp(64px,10vh,120px)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          {form.mode === "live" && <ContactForm siteKey={form.siteKey} />}
          {form.mode === "note" && (
            <p className="rounded-xl border border-dashed border-line p-5 text-muted">
              {t("notConfigured")}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-5 lg:col-span-4 lg:col-start-9">
          {settings.email && (
            <div>
              <p className="label text-muted">{t("email")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${settings.email}`}
                  className="link-underline text-[clamp(20px,2vw,28px)]"
                  data-track="email"
                >
                  {settings.email}
                </a>
                <CopyButton
                  value={settings.email}
                  label={t("copy")}
                  done={t("copied")}
                />
              </div>
            </div>
          )}
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="link-underline w-fit text-xl"
              data-track={l.track}
            >
              {l.label} ↗<span className="sr-only"> ({a11y("external")})</span>
            </a>
          ))}
          {settings.cvUrl && (
            <a
              href="/cv.pdf"
              className="link-underline w-fit text-xl"
              data-track="cv"
            >
              CV ↓
            </a>
          )}
          {settings.availability && (
            <p className="label flex items-center gap-2 text-accent">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {settings.availability}
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
