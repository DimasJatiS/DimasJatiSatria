"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { Link, usePathname } from "@/i18n/navigation";

type Theme = "night" | "day";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const getTheme = (): Theme => (document.documentElement.dataset.theme === "day" ? "day" : "night");

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
  window.setTimeout(() => root.classList.remove("theme-transition"), 650);
}

const segment = "rounded-full px-3 py-1.5 transition-colors duration-300";
const on = "bg-fg text-surface";
const off = "text-muted hover:text-fg";

export function ThemeToggle() {
  const t = useTranslations("toggle");
  const theme = useSyncExternalStore(subscribe, getTheme, () => "night" as Theme);

  const set = (next: Theme) => next !== theme && applyTheme(next);

  return (
    <div role="group" aria-label={t("theme")} className="label flex rounded-full border border-line p-0.5">
      {(["night", "day"] as const).map((v) => (
        <button key={v} type="button" aria-pressed={theme === v} onClick={() => set(v)} className={`${segment} ${theme === v ? on : off}`}>
          {t(v)}
        </button>
      ))}
    </div>
  );
}

export function LocaleToggle() {
  const t = useTranslations("toggle");
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <div role="group" aria-label={t("language")} className="label flex rounded-full border border-line p-0.5">
      {(["en", "id"] as const).map((l) => (
        <Link key={l} href={pathname} locale={l} hrefLang={l} aria-current={locale === l ? "true" : undefined} className={`${segment} ${locale === l ? on : off}`}>
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
