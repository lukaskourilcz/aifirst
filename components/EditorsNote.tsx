import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function EditorsNote({ note, locale }: { note?: string; locale: Locale }) {
  if (!note) return null;
  return (
    <aside
      aria-label="editor's note"
      style={{
        position: "relative",
        margin: "0 0 32px",
        padding: "16px 20px 16px 28px",
        border: "1px solid var(--hairline)",
        borderLeft: "2px solid var(--accent-amber)",
        background:
          "linear-gradient(180deg, rgba(255,181,71,0.04), transparent)",
      }}
    >
      <p
        className="label"
        style={{ color: "var(--accent-amber)", marginBottom: 8 }}
      >
        {dict(locale).article.editorsNote}
      </p>
      <p
        style={{
          fontStyle: "italic",
          color: "var(--ink-primary)",
          margin: 0,
          lineHeight: 1.55,
        }}
      >
        {note}
      </p>
    </aside>
  );
}
