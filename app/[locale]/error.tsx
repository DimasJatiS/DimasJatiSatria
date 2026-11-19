"use client";

import { useTranslations } from "next-intl";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  return (
    <section className="container-x grid min-h-[70svh] place-content-center gap-6 text-center">
      <h1 className="display text-[clamp(40px,7vw,96px)] font-light">{t("title")}</h1>
      <button type="button" onClick={reset} className="pill pill-accent mx-auto">
        {t("retry")}
      </button>
    </section>
  );
}
