"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, useScroll, useSpring } from "motion/react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  // scrollYProgress is the document scroll position normalised to 0–1.
  const { scrollYProgress } = useScroll();

  // A spring gives the bar weight — it eases toward the scroll position
  // instead of tracking it 1:1, which reads as smoother on fast flicks and
  // trackpad momentum. Honour reduced-motion by binding straight to the raw
  // progress (no spring lag) for readers who opt out of animation.
  const reduceMotion = useReducedMotion();
  const spring = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  // Drive the transform through a ref rather than a <motion.div> so we avoid
  // pulling Motion's full component runtime into the bundle — the hooks alone
  // are the lean part of the library.
  useEffect(() => {
    const source = reduceMotion ? scrollYProgress : spring;
    const apply = (v: number) => {
      const el = barRef.current;
      if (el) el.style.transform = `scaleX(${v})`;
    };
    apply(source.get());
    return source.on("change", apply);
  }, [reduceMotion, scrollYProgress, spring]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 11,
        pointerEvents: "none",
        background: "var(--color-stone)",
      }}
    >
      <div
        ref={barRef}
        style={{
          height: "100%",
          transformOrigin: "left",
          transform: "scaleX(0)",
          background: "var(--color-blueprint-blue)",
        }}
      />
    </div>
  );
}
