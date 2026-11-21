type Props = {
  id: string;
  tone: "base" | "inverse";
  /** Enters as a 24px-radius plate over the previous tone (M-09). */
  panel?: boolean;
  /** Screen-reader heading only; sections show no visible number or name. */
  label: string;
  className?: string;
  children: React.ReactNode;
};

/** Shared section frame: tone, panel plate and hairline grid (A5). */
export function Section({ id, tone, panel, label, className = "", children }: Props) {
  const other = tone === "base" ? "inverse" : "base";
  return (
    <section id={id} data-tone={tone} aria-labelledby={`${id}-label`} className={`relative text-fg ${panel ? "" : "bg-surface"} ${className}`}>
      {panel && (
        <>
          <div aria-hidden data-tone={other} className="absolute inset-x-0 top-0 h-[100svh] bg-surface" />
          <div aria-hidden className="panel-bg" />
        </>
      )}
      <div aria-hidden className="grid-lines">
        <div />
      </div>
      <div className="relative pt-[clamp(80px,12vh,140px)]">
        <h2 id={`${id}-label`} className="sr-only">
          {label}
        </h2>
        {children}
      </div>
    </section>
  );
}
