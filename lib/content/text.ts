export type Segment = { text: string; accent: boolean };

/** Splits "turning curiosity into *crafted* products" into plain and accent (Instrument Serif) parts. */
export function splitAccent(text: string): Segment[] {
  return text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) => (part.startsWith("*") && part.endsWith("*") && part.length > 2 ? { text: part.slice(1, -1), accent: true } : { text: part, accent: false }));
}

export const stripAccent = (text: string) => text.replace(/\*([^*]+)\*/g, "$1");
