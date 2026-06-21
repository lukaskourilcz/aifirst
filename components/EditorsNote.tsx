import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function EditorsNote({ note, locale }: { note?: string; locale: Locale }) {
  if (!note) return null;
  return (
    <aside
      aria-label="editor's note"
      style={{
        margin: "0 0 32px",
        padding: "16px 20px",
        borderLeft: "2px solid var(--color-signal-yellow)",
        background: "var(--color-margin-white)",
      }}
    >
      <p className="label" style={{ marginBottom: 8 }}>
        {dict(locale).article.editorsNote}
      </p>
      <p
        style={{
          fontStyle: "italic",
          color: "var(--color-folio-black)",
          margin: 0,
          lineHeight: 1.55,
        }}
      >
        {note}
      </p>
    </aside>
  );
}
