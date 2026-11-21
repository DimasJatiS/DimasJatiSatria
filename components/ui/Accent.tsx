import { splitAccent } from "@/lib/content/text";

/** Renders `*word*` as the one bronze Corben word of a heading (PRD §5.3). */
export function Accent({ text }: { text: string }) {
  return splitAccent(text).map((s, i) =>
    s.accent ? (
      <em key={i} className="accent-word">
        {s.text}
      </em>
    ) : (
      s.text
    ),
  );
}
