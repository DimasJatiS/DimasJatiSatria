import { getTranslations } from "next-intl/server";

export async function SkipLink() {
  const t = await getTranslations("a11y");
  return (
    <a href="#main" className="pill pill-accent fixed top-3 left-3 z-[100] -translate-y-24 focus-visible:translate-y-0">
      {t("skip")}
    </a>
  );
}
