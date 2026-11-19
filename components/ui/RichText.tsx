import { PortableText, type PortableTextBlock, type PortableTextComponents } from "next-sanity";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
    h3: ({ children }) => <h4 className="mt-8 text-xl font-medium">{children}</h4>,
    blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 border-accent pl-5 text-xl">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5">{children}</ul>,
    number: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5">{children}</ol>,
  },
  marks: {
    em: ({ children }) => <em className="accent-word">{children}</em>,
    code: ({ children }) => <code className="rounded bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" && /^(https?:|mailto:|\/)/.test(value.href) ? value.href : undefined;
      const external = href?.startsWith("http");
      return (
        <a href={href} className="link-underline text-accent" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};

/** Portable text from Sanity, rendered by React (no raw HTML). */
export function RichText({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="max-w-[68ch] text-[17px] leading-relaxed">
      <PortableText value={value} components={components} />
    </div>
  );
}
