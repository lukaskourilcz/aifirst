"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModalOverlay } from "./ModalOverlay";
import { SearchPalette } from "./SearchPalette";
import { BrandLockup } from "./BrandMark";
import type { SearchEntry } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import type { Rail, RailItem } from "@/lib/rail";
import { isCurrentPath } from "@/lib/helpers/path";

type Props = { locale: Locale; rail: Rail; index: SearchEntry[] };

// The rail below 960px: a sticky top bar and a full-screen drawer. The drawer
// borrows ModalOverlay's focus trap, Escape handling and focus restoration
// rather than growing a second dialog implementation.
export function MobileNav({ locale, rail, index }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const item = (entry: RailItem, i?: number) => (
    <Link
      key={entry.key}
      href={entry.href}
      className={`drawer__item${i === undefined ? " drawer__item--secondary" : ""}`}
      aria-current={isCurrentPath(pathname, entry.href) ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      {i !== undefined ? (
        <span aria-hidden className="drawer__index">
          {String(i + 1).padStart(2, "0")}
        </span>
      ) : null}
      <span>{entry.label}</span>
    </Link>
  );

  return (
    <>
      <div className="topbar">
        <button
          ref={menuRef}
          type="button"
          className="topbar__trigger"
          aria-label={rail.labels.menu}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span aria-hidden className="topbar__bars" />
        </button>

        <Link href={rail.primary[0]?.href ?? "/"} className="topbar__brand" aria-label={rail.labels.home}>
          <BrandLockup compact />
        </Link>

        <div className="topbar__search">
          <SearchPalette index={index} locale={locale} />
        </div>
      </div>

      {open ? (
        <ModalOverlay
          onClose={() => setOpen(false)}
          ariaLabel={rail.labels.primary}
          align="drawer"
          lockScroll
          zIndex={30}
          returnFocusRef={menuRef}
        >
          <div className="drawer">
            <div className="drawer__head">
              <BrandLockup compact />
              <button
                type="button"
                className="drawer__close"
                aria-label={rail.labels.close}
                onClick={() => setOpen(false)}
              >
                <span aria-hidden>✕</span>
              </button>
            </div>

            <nav className="drawer__nav" aria-label={rail.labels.primary}>
              {rail.primary.map((entry, i) => item(entry, i))}
              <div className="drawer__divider" aria-hidden />
              <div role="group" aria-label={rail.labels.secondary}>
                {rail.secondary.map((entry) => item(entry))}
              </div>
            </nav>

            <div className="drawer__search">
              <SearchPalette index={index} locale={locale} />
            </div>
          </div>
        </ModalOverlay>
      ) : null}
    </>
  );
}
