"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useSyncExternalStore } from "react";
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

/**
 * One icon button. The sun/moon morph is pure CSS keyed on `html[data-theme]` (globals.css),
 * so it is right before hydration and never mismatches.
 */
export function ThemeToggle() {
  const t = useTranslations("toggle");
  const theme = useSyncExternalStore(subscribe, getTheme, () => "night" as Theme);
  const next: Theme = theme === "night" ? "day" : "night";
  const mask = `moon-${useId().replace(/:/g, "")}`;

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={`${t("theme")}: ${t(next)}`}
      title={t(next)}
      className="theme-toggle grid size-9 place-items-center rounded-full border border-line text-fg transition-colors duration-300 hover:border-fg"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="theme-icon">
        <mask id={mask}>
          <rect width="24" height="24" fill="white" />
          <circle className="theme-cut" cx="17" cy="7" r="6" fill="black" />
        </mask>
        <circle className="theme-core" cx="12" cy="12" r="8" fill="currentColor" mask={`url(#${mask})`} />
        <g className="theme-rays" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
            <line key={r} x1="12" y1="1.5" x2="12" y2="3.5" transform={`rotate(${r} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
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
