"use client";

import { useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  PROMOTION_PLATFORMS,
  type PromotionPlatform,
  type PromotionPost,
} from "@/lib/promotion";

const LOCALE_LABEL: Record<Locale, string> = { en: "English", cs: "Čeština" };
const PLATFORM_LABEL: Record<PromotionPlatform, string> = {
  instagram: "Instagram",
  threads: "Threads",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      className="label"
      style={{
        background: "transparent",
        color: copied ? "var(--color-blueprint-blue)" : "var(--ink-muted)",
        border: "1px solid var(--color-fog)",
        padding: "2px 10px",
        cursor: "pointer",
      }}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

function CaptionBlock({
  platform,
  text,
}: {
  platform: PromotionPlatform;
  text: string;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span className="label" style={{ color: "var(--ink-primary)" }}>
          {PLATFORM_LABEL[platform]}
        </span>
        <CopyButton text={text} />
      </div>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: 0,
          padding: "12px 14px",
          border: "1px solid var(--color-fog)",
          background: "var(--color-paper)",
          fontFamily: "var(--font-sans, inherit)",
          fontSize: "0.9rem",
          lineHeight: 1.55,
          color: "var(--ink-primary)",
        }}
      >
        {text}
      </pre>
    </div>
  );
}

function PostCard({ post, locale }: { post: PromotionPost; locale: Locale }) {
  const c = post.byLocale[locale];
  return (
    <article
      style={{
        border: "1px solid var(--color-fog)",
        background: "var(--color-surface, var(--color-paper))",
        padding: 20,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
          alignItems: "start",
        }}
        className="promotion-card__grid"
      >
        <div>
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt={c.title}
              style={{
                width: "100%",
                aspectRatio: "3 / 2",
                objectFit: "cover",
                border: "1px solid var(--color-fog)",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "3 / 2",
                border: "1px dashed var(--color-fog)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink-muted)",
                fontSize: "0.8rem",
              }}
              className="label"
            >
              no image
            </div>
          )}
          <p
            className="label"
            style={{ marginTop: 10, color: "var(--ink-muted)" }}
          >
            {post.date} · shared across platforms
          </p>
        </div>

        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.35rem", lineHeight: 1.2 }}>
            {c.title}
          </h2>
          <p
            style={{
              margin: 0,
              color: "var(--ink-muted)",
              fontSize: "0.95rem",
              lineHeight: 1.5,
            }}
          >
            {c.summary}
          </p>
          {PROMOTION_PLATFORMS.map((p) => (
            <CaptionBlock key={p} platform={p} text={c[p]} />
          ))}
        </div>
      </div>
    </article>
  );
}

export function PromotionGallery({ posts }: { posts: PromotionPost[] }) {
  const [locale, setLocale] = useState<Locale>("en");

  if (posts.length === 0) {
    return (
      <p style={{ color: "var(--ink-muted)" }}>
        No promotion posts yet. They are generated alongside each daily issue.
      </p>
    );
  }

  return (
    <div>
      <div
        role="group"
        aria-label="language"
        style={{ display: "inline-flex", gap: 0, marginBottom: 24 }}
      >
        {LOCALES.map((l) => {
          const active = l === locale;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              aria-pressed={active}
              className="label"
              style={{
                padding: "6px 14px",
                cursor: "pointer",
                border: "1px solid var(--color-fog)",
                background: active
                  ? "var(--color-blueprint-blue)"
                  : "transparent",
                color: active ? "var(--color-paper)" : "var(--ink-muted)",
              }}
            >
              {LOCALE_LABEL[l]}
            </button>
          );
        })}
      </div>

      {posts.map((post) => (
        <PostCard key={post.date} post={post} locale={locale} />
      ))}

      <style>{`
        @media (max-width: 640px) {
          .promotion-card__grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
