import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Topic } from "@/lib/topics/config";

export function TopicMedia({ topic, locale, compact = false }: { topic: Topic; locale: Locale; compact?: boolean }) {
  if (!topic.cover) return null;
  return (
    <figure className={compact ? "topic-media topic-media--compact" : "topic-media"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={topic.cover.path}
        alt={topic.cover.alt[locale]}
        loading="lazy"
        decoding="async"
        style={{ "--topic-position": topic.cover.position ?? "center" } as CSSProperties}
      />
    </figure>
  );
}
