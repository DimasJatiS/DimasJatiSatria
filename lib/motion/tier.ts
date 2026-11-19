export type Tier = "full" | "lite" | "still";

export type TierSignals = {
  override?: string | null;
  reducedMotion: boolean;
  coarsePointer: boolean;
  cores?: number;
  memory?: number;
  saveData?: boolean;
};

// Motion & Artwork §2. Kept self-contained: it is also serialized into the inline head script.
export function detectTier(s: TierSignals): Tier {
  if (s.override === "full" || s.override === "lite" || s.override === "still") return s.override;
  if (s.reducedMotion) return "still";
  if (s.coarsePointer || (s.cores ?? 8) <= 4 || (s.memory ?? 8) <= 4 || s.saveData) return "lite";
  return "full";
}

// Runs before first paint: theme (Night default) + motion tier, no flash.
function boot(detect: typeof detectTier) {
  const d = document.documentElement;
  try {
    d.dataset.theme = localStorage.getItem("theme") === "day" ? "day" : "night";
  } catch {
    d.dataset.theme = "night";
  }
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  d.dataset.motion = detect({
    override: new URLSearchParams(location.search).get("motion"),
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    coarsePointer: matchMedia("(pointer: coarse)").matches,
    cores: n.hardwareConcurrency,
    memory: n.deviceMemory,
    saveData: Boolean(n.connection?.saveData),
  });
}

export const bootScript = `(${boot.toString()})(${detectTier.toString()})`;
