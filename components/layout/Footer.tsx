import { getTranslations } from "next-intl/server";

export async function Footer({ repoUrl }: { repoUrl?: string }) {
  const t = await getTranslations("footer");
  const a11y = await getTranslations("a11y");
  return (
    <footer data-tone="base" className="bg-surface text-muted">
      <div className="label container-x flex flex-col gap-3 border-t border-line py-8 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Dimas Jati Satria</p>
        <p>
          {t("built")}
          {repoUrl && (
            <>
              {" · "}
              <a href={repoUrl} target="_blank" rel="noreferrer" className="link-underline text-fg">
                {t("source")} ↗<span className="sr-only"> ({a11y("external")})</span>
              </a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
