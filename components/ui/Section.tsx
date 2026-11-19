type Props = {
  id: string;
  tone: "base" | "inverse";
  /** Enters as a 24px-radius plate over the previous tone (M-09). */
  panel?: boolean;
  index: number;
  total: number;
  label: string;
  className?: string;
  children: React.ReactNode;
};

/** Shared section frame: tone, panel plate, hairline grid (A5) and the `02 / 06 ABOUT` label (M-20). */
export function Section({ id, tone, panel, index, total, label, className = "", children }: Props) {
  const other = tone === "base" ? "inverse" : "base";
  const pad = (n: number) => String(n).padStart(2, "0");
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
      <div className="relative">
        <h2 id={`${id}-label`} className="label container-x pt-[clamp(96px,14vh,160px)]">
          <span className="text-accent">{pad(index)}</span>
          <span className="text-muted">{` / ${pad(total)} `}</span>
          <span data-scramble>{label}</span>
        </h2>
        {children}
      </div>
    </section>
  );
}
