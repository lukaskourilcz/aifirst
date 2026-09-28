"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModalOverlay } from "./ModalOverlay";
import { SearchGlyph, SEARCH_EVENT } from "./SearchPalette";
import { useWindowEvent } from "@/lib/hooks/useWindowEvent";
import { isCurrentPath } from "@/lib/helpers/path";
import type { NavItem } from "@/lib/sections";

type Props = {
  sections: NavItem[];
  more: NavItem[];
  date: string;
  labels: { menu: string; close: string; sections: string; more: string; search: string };
};

/**
 * The menu drawer below 960 px: sections at 20 px, the „Více" pages at 16 px,
 * search and the date. Opened by the menu button in the 56 px bar or by the
 * „Více" item at the end of the section strip. It reuses ModalOverlay's focus
 * trap, Escape handling and focus restoration.
 */
export function MastheadMenu({ sections, more, date, labels }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useWindowEvent("dneskai:open-menu", () => setOpen(true));

  const link = (item: NavItem, className: string) => (
    <Link
      key={item.key}
      href={item.href}
      className={className}
      aria-current={isCurrentPath(pathname, item.href) ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      {item.label}
    </Link>
  );

  return (
    <>
      <button
        ref={menuRef}
        type="button"
        className="icon-button masthead__menu"
        aria-label={labels.menu}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden className="masthead__bars" />
      </button>

      {open ? (
        <ModalOverlay
          onClose={() => setOpen(false)}
          ariaLabel={labels.menu}
          align="drawer"
          lockScroll
          zIndex={30}
          returnFocusRef={menuRef}
        >
          <div className="drawer">
            <div className="drawer__head">
              <p className="meta">{date}</p>
              <button type="button" className="icon-button drawer__close" aria-label={labels.close} onClick={() => setOpen(false)}>
                <span aria-hidden>✕</span>
              </button>
            </div>
            <nav aria-label={labels.sections} className="drawer__nav">
              {sections.map((item) => link(item, "drawer__item"))}
            </nav>
            <nav aria-label={labels.more} className="drawer__nav drawer__nav--more">
              {more.map((item) => link(item, "drawer__item drawer__item--more"))}
            </nav>
            <button
              type="button"
              className="control drawer__search"
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event(SEARCH_EVENT));
              }}
            >
              <SearchGlyph />
              <span>{labels.search}</span>
            </button>
          </div>
        </ModalOverlay>
      ) : null}
    </>
  );
}
