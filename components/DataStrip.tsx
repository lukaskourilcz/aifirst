import { SignalStrength } from "./SignalStrength";
import { MODELS } from "@/lib/anthropic/models";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = {
  date: string;
  sourceCount: number;
  tags?: string[];
  signal?: number;
  readingMinutes?: number;
  locale: Locale;
};

export function DataStrip({
  date,
  sourceCount,
  tags,
  signal,
  readingMinutes,
  locale,
}: Props) {
  const t = dict(locale).common;
  return (
    <div
      style={{
        borderBottom: "1px solid var(--hairline)",
        background: "var(--surface-soft)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 20px",
          padding: "10px clamp(16px, 4vw, 24px)",
          fontFamily: "var(--font-display)",
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
        }}
      >
        <span>
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent-cyan)",
              boxShadow: "var(--glow-cyan)",
              marginRight: 10,
              transform: "translateY(-1px)",
            }}
          />
          {t.issue} {date}
        </span>
        <span>{t.sources} {String(sourceCount).padStart(2, "0")}</span>
        {typeof readingMinutes === "number" && (
          <span>{t.readMinutes} {readingMinutes} {t.minutesShort}</span>
        )}
        <span>{t.model} {MODELS.opus}</span>
        {tags?.length ? (
          <span style={{ color: "var(--accent-magenta)" }}>
            {tags.slice(0, 4).map((t) => `#${t}`).join("  ")}
          </span>
        ) : null}
        {typeof signal === "number" && (
          <span style={{ marginLeft: "auto" }}>
            <SignalStrength value={signal} label={t.signal} />
          </span>
        )}
      </div>
    </div>
  );
}
