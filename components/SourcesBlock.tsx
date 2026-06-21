import type { SourceRef } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { ogImageFor } from "@/lib/og";

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
        marginTop: 48,
        paddingTop: 24,
        borderTop: "1px solid var(--color-fog)",
      }}
    >
      <p className="label" style={{ marginBottom: 16 }}>
        {dict(locale).article.sources}
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {sources.map((s, i) => {
          const thumb = ogImageFor(s.url);
          return (
            <li
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "64px 1fr",
                gap: 12,
                alignItems: "start",
                padding: 12,
                background: "var(--color-canvas)",
                border: "1px solid var(--color-fog)",
                borderRadius: "var(--radius-cards)",
              }}
            >
              {thumb ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumb}
                  alt=""
                  loading="lazy"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-fog)",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <span
                  aria-hidden
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-fog)",
                    background: "var(--color-paper)",
                    display: "inline-block",
                  }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <p
                  className="label"
                  style={{ color: "var(--color-slate)", margin: "0 0 4px" }}
                >
                  {String(i + 1).padStart(2, "0")} ·{" "}
                  {new URL(s.url).hostname.replace(/^www\./, "")}
                </p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    fontSize: "var(--text-body-sm)",
                    fontWeight: 500,
                    color: "var(--color-ink-black)",
                  }}
                >
                  {s.title}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
