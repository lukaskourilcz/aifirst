import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function EditorsNote({ note, locale }: { note?: string; locale: Locale }) {
  if (!note) return null;
  return (
    <aside
      aria-label="editor's note"
      style={{
        margin: "0 0 24px",
        padding: "12px 16px",
        borderLeft: "3px solid var(--color-blueprint-blue)",
        background: "var(--color-paper)",
        borderRadius: "0 var(--radius-lg) var(--radius-lg) 0",
      }}
    >
      <p className="label" style={{ color: "var(--color-blueprint-blue)", marginBottom: 4 }}>
        {dict(locale).article.editorsNote}
      </p>
      <p
        style={{
          color: "var(--color-ink-black)",
          margin: 0,
          lineHeight: 1.55,
          fontSize: "var(--text-body-sm)",
        }}
      >
        {note}
      </p>
    </aside>
  );
}
