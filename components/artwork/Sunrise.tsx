/**
 * A4 sunrise: a bronze disc rising behind the top horizon line, with six hairlines that get
 * closer towards the bottom. The disc is clipped by the horizon box and never sits behind text.
 */
export function Sunrise({ className = "" }: { className?: string }) {
  const gaps = [0, 30, 54, 72, 86, 96];
  return (
    <div aria-hidden className={`relative ${className}`}>
      <div className="relative h-[min(27vw,420px)] overflow-hidden">
        <div data-sun className="absolute bottom-[max(-9vw,-140px)] left-1/2 -ml-[min(18vw,280px)] aspect-square w-[min(36vw,560px)] rounded-full bg-accent" />
      </div>
      <div className="relative h-24">
        {gaps.map((top) => (
          <span key={top} className="absolute inset-x-0 h-px bg-[color-mix(in_srgb,var(--fg)_28%,transparent)]" style={{ top }} />
        ))}
      </div>
    </div>
  );
}
