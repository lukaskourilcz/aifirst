import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { MdxLink } from "./MdxLink";
import { slugify } from "@/lib/text";

function nodeText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(nodeText).join("");
  }
  if (children && typeof children === "object" && "props" in (children as object)) {
    const nested = (children as { props?: { children?: ReactNode } }).props
      ?.children;
    return nested ? nodeText(nested) : "";
  }
  return "";
}

function AnchoredHeading({
  level,
  children,
}: {
  level: 2 | 3;
  children?: ReactNode;
}) {
  const id = slugify(nodeText(children));
  const Tag = (`h${level}` as unknown) as "h2" | "h3";
  return (
    <Tag id={id} className="anchored">
      <a
        href={`#${id}`}
        aria-label={`link to section: ${nodeText(children)}`}
        className="anchor-link"
      >
        <span aria-hidden>§</span>
      </a>
      {children}
    </Tag>
  );
}

const components = {
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <MdxLink href={href ?? "#"}>{children}</MdxLink>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <AnchoredHeading level={2}>{children}</AnchoredHeading>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <AnchoredHeading level={3}>{children}</AnchoredHeading>
  ),
};

export function Mdx({ source }: { source: string }) {
  return (
    <div className="article-body">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
