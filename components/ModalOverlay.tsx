"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useWindowEvent } from "@/lib/hooks/useWindowEvent";

type Props = {
  // Called when the user dismisses the overlay (backdrop click or Escape).
  onClose: () => void;
  // Accessible name for the dialog.
  ariaLabel: string;
  // Where the panel sits vertically: "start" hugs the top (search), "center"
  // centres it (keyboard help).
  align?: "start" | "center";
  // Stacking order; the keyboard-help overlay sits above the search palette.
  zIndex?: number;
  // Max panel width in px.
  width?: number;
  returnFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

// The shared full-screen dialog chrome: a blurred backdrop that closes on
// click or Escape, wrapping a bordered panel that swallows clicks. Used by the
// search palette and the keyboard-help overlay.
export function ModalOverlay({
  onClose,
  ariaLabel,
  align = "center",
  zIndex = 20,
  width = 640,
  returnFocusRef,
  children,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    requestAnimationFrame(() => (first ?? panel)?.focus());
    return () => previous?.focus();
  }, [returnFocusRef]);

  useWindowEvent("keydown", (e) => {
    if (e.key === "Escape") onClose();
    if (e.key !== "Tab") return;
    const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [])].filter((item) => item.getClientRects().length > 0);
    if (!focusable.length) {
      e.preventDefault();
      panelRef.current?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: align === "start" ? "flex-start" : "center",
        justifyContent: "center",
        padding: "10vh 24px",
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(${width}px, 100%)`,
          border: "1px solid var(--color-folio-black)",
          background: "var(--color-newsprint-cream)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
