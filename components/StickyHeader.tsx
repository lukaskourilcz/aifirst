"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCurrentPath } from "@/lib/helpers/path";
import type { NavItem } from "@/lib/sections";
import { SearchGlyph, SEARCH_EVENT } from "./SearchPalette";

type Props = {
  /** Row 1 (date · logotype · search), rendered on the server. */
  top: ReactNode;
  /** The 20 px logotype shown in the condensed bar. */
  miniBrand: ReactNode;
  homeHref: string;
  sections: NavItem[];
  more: NavItem[];
  shortDate: string;
  labels: { sections: string; more: string; search: string; home: string };
};

/**
 * The masthead's one piece of client code. The header is sticky with a
 * negative top equal to row 1, so only the section bar stays on screen; an
 * observer on a sentinel of row 1's height toggles `is-condensed`, which
 * brings the small logotype, the short date and a search button into the bar.
 *
 * It also marks the current section. On an article the section comes from the
 * page's `data-section`, because the path alone does not say which section an
 * article belongs to.
 */
export function StickyHeader({ top, miniBrand, homeHref, sections, more, shortDate, labels }: Props) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [condensed, setCondensed] = useState(false);
  const [articleSection, setArticleSection] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setCondensed(!entry?.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setArticleSection(document.querySelector<HTMLElement>("[data-section]")?.dataset.section ?? null);
  }, [pathname]);

  const current = (item: NavItem) =>
    articleSection ? item.key === articleSection : isCurrentPath(pathname, item.href);

  return (
    <>
      <div ref={sentinel} className="masthead__sentinel" aria-hidden />
      <header className={condensed ? "masthead is-condensed" : "masthead"}>
        {top}
        <div className="masthead__bar">
          <Link href={homeHref} className="masthead__mini-brand" aria-label={labels.home} tabIndex={condensed ? 0 : -1}>
            {miniBrand}
          </Link>
          <nav className="section-bar" aria-label={labels.sections}>
            <ul className="section-bar__list">
              {sections.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="section-bar__link"
                    aria-current={current(item) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="section-bar__more">
                {/* Desktop: a native disclosure, no script. */}
                <details className="more-menu">
                  <summary className="section-bar__link">{labels.more}</summary>
                  <ul className="more-menu__list">
                    {more.map((item) => (
                      <li key={item.key}>
                        <Link href={item.href} aria-current={isCurrentPath(pathname, item.href) ? "page" : undefined}>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
                {/* Below 960: the last strip item opens the menu drawer. */}
                <button
                  type="button"
                  className="section-bar__link section-bar__more-button"
                  onClick={() => window.dispatchEvent(new Event("dneskai:open-menu"))}
                >
                  {labels.more}
                </button>
              </li>
            </ul>
          </nav>
          <span className="masthead__mini-tools">
            <span className="meta">{shortDate}</span>
            <button
              type="button"
              className="icon-button"
              aria-label={labels.search}
              tabIndex={condensed ? 0 : -1}
              onClick={() => window.dispatchEvent(new Event(SEARCH_EVENT))}
            >
              <SearchGlyph />
            </button>
          </span>
        </div>
      </header>
    </>
  );
}
