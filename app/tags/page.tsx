import { TagChip } from "@/components/TagChip";
import { listTagsByFrequency } from "@/lib/content";

export const dynamic = "force-static";
export const metadata = { title: "Tags" };

export default async function TagsIndex() {
  const tags = await listTagsByFrequency();
  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">tags</p>
      <h1>Topics under transmission.</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "60ch",
          marginBottom: "3em",
        }}
      >
        Every tag that has appeared in at least one issue. Larger counts mean
        the magazine returned to that thread more often.
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {tags.map((t) => (
          <li key={t.tag}>
            <TagChip tag={t.tag} count={t.count} />
          </li>
        ))}
        {tags.length === 0 && (
          <li className="label" style={{ color: "var(--ink-muted)" }}>
            no tags yet.
          </li>
        )}
      </ul>
    </section>
  );
}
