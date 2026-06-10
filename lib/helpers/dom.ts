// True when a keyboard event originated inside a text-entry field, so
// global shortcut handlers can bail out. Shared by the search palette
// and the keyboard-help overlay.
export function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(
    el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable),
  );
}
