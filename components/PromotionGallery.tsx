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
      className="label promotion-copy"
      data-copied={copied}
      aria-live="polite"
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
    <div className="promotion-caption">
      <div className="promotion-caption__head">
        <span className="label">
          {PLATFORM_LABEL[platform]}
        </span>
        <CopyButton text={text} />
      </div>
      <pre>
        {text}
      </pre>
    </div>
  );
}

function PostCard({ post, locale }: { post: PromotionPost; locale: Locale }) {
  const c = post.byLocale[locale];
  return (
    <article className="promotion-card">
      <div className="promotion-card__grid">
        <div>
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt={c.title}
              className="promotion-card__image"
            />
          ) : (
            <div className="label promotion-card__no-image">
              no image
            </div>
          )}
          <p className="label label--muted promotion-card__date">
            {post.date} · shared across platforms
          </p>
        </div>

        <div className="promotion-card__copy">
          <h2>
            {c.title}
          </h2>
          <p>
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
      <p className="route-empty-state">
        No promotion posts yet. They are generated alongside each daily issue.
      </p>
    );
  }

  return (
    <div>
      <div role="group" aria-label="language" className="promotion-languages">
        {LOCALES.map((l) => {
          const active = l === locale;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              aria-pressed={active}
              className="label"
            >
              {LOCALE_LABEL[l]}
            </button>
          );
        })}
      </div>

      {posts.map((post) => (
        <PostCard key={post.date} post={post} locale={locale} />
      ))}
    </div>
  );
}
