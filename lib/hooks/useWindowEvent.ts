import { useEffect, useRef } from "react";

// Subscribe to one or more `window` events for the lifetime of the component,
// cleaning the listener(s) up on unmount. The handler is kept in a ref and
// always called by its latest version, so callers never need a dependency
// array and the subscription is set up exactly once.
//
//   useWindowEvent("keydown", onKey);
//   useWindowEvent(["scroll", "resize"], onScroll, { passive: true });
export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K | K[],
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const types = Array.isArray(type) ? type : [type];
  // Stable key so the effect only re-subscribes when the event names change.
  const key = types.join(",");

  useEffect(() => {
    const listener = (event: Event) =>
      handlerRef.current(event as WindowEventMap[K]);
    for (const name of types) window.addEventListener(name, listener, options);
    return () => {
      for (const name of types)
        window.removeEventListener(name, listener, options);
    };
    // `types` is derived from `key`; `options` is treated as stable by callers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
