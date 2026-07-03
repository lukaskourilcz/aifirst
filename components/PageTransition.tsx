import * as React from "react";

// React's View Transitions component ships under the experimental channel that
// Next aliases in when `experimental.viewTransition` is set (next.config.mjs).
// On React 15/19 that export is `unstable_ViewTransition`; the stable `react`
// types don't declare it, so we reach for it defensively and fall back to a
// plain passthrough when it's absent (older React, flag off, SSR of a build
// without it). That keeps the component a safe no-op instead of a crash.
type ViewTransitionComponent = React.ComponentType<{ children: React.ReactNode }>;

const ViewTransition = (
  React as unknown as { unstable_ViewTransition?: ViewTransitionComponent }
).unstable_ViewTransition;

/**
 * Wraps the per-route content so navigations animate through the browser's
 * native View Transitions API. The animation itself (a crossfade, with the
 * sidebar anchored) lives in app/globals.css and is disabled under
 * prefers-reduced-motion. Adds nothing to the client bundle beyond what React
 * already ships, and degrades to an instant swap where unsupported.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  if (!ViewTransition) return <>{children}</>;
  return <ViewTransition>{children}</ViewTransition>;
}
