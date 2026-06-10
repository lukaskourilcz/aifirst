import type { SourceRef } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function SourcesBlock({
  sources,
  locale,
}: {
  sources: SourceRef[];
  locale: Locale;
}) {
  if (!sources?.length) return null;
  return (
    <section
      aria-label="Sources"
      style={{
        marginTop: 64,
        paddingTop: 32,
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <p className="label" style={{ marginBottom: 16 }}>
        {dict(locale).article.sources}
      </p>
      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 12,
          counterReset: "src",
        }}
      >
        {sources.map((s, i) => (
          <li
            key={s.id}
            style={{
              counterIncrement: "src",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 16,
              alignItems: "baseline",
            }}
          >
            <span
              aria-hidden
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                color: "var(--accent-magenta)",
                letterSpacing: "0.18em",
              }}
            >
              [{String(i + 1).padStart(2, "0")}]
            </span>
            <a href={s.url} target="_blank" rel="noreferrer noopener">
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
