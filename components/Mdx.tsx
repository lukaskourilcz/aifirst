import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { GlowLink } from "./GlowLink";

const components = {
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <GlowLink href={href ?? "#"}>{children}</GlowLink>
  ),
};

export function Mdx({ source }: { source: string }) {
  return (
    <div className="article-body">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
