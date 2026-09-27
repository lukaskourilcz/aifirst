import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function EditorsNote({ note, locale }: { note?: string; locale: Locale }) {
  if (!note) return null;
  const label = dict(locale).article.editorsNote;
  return (
    <aside aria-label={label} className="editors-note">
      <p className="kicker kicker--accent editors-note__label">{label}</p>
      <p className="editors-note__body">{note}</p>
    </aside>
  );
}
