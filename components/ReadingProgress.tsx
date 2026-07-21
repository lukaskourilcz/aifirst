"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWindowEvent } from "@/lib/hooks/useWindowEvent";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const update = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    });
  }, []);

  useWindowEvent("scroll", update, { passive: true });
  useWindowEvent("resize", update, { passive: true });
  useEffect(() => {
    update();
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); };
  }, [update]);

  return (
    <div aria-hidden className="reading-progress">
      <div ref={barRef} />
    </div>
  );
}
