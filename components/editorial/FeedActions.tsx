import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function FeedActions({ locale, topicSlug, weekly = false }: { locale: Locale; topicSlug?: string; weekly?: boolean }) {
  const d = dict(locale);
  const href = topicSlug
    ? localePath(locale, `/topics/${topicSlug}/feed.xml`)
    : localePath(locale, weekly ? "/weekly/feed.xml" : "/feed.xml");
  return (
    <aside className="feed-actions" aria-label={d.common.atomFeed}>
      <div>
        <p className="label">{d.common.atomFeed}</p>
        <strong>{topicSlug ? d.topics.feed : weekly ? d.home.followWeekly : d.home.followEveryIssue}</strong>
      </div>
      <a href={href} type="application/atom+xml">{d.common.atomFeed} ↗</a>
    </aside>
  );
}
