import Link from "next/link";

type Props = {
  from: string;
  to: string;
  coveredSlugs: string[];
  titlesBySlug?: Map<string, string>;
};

export function WeeklyBadge({
  from,
  to,
  coveredSlugs,
  titlesBySlug,
}: Props) {
  return (
    <aside
      style={{
        margin: "0 0 32px",
        padding: 16,
        border: "1px solid var(--hairline)",
        borderLeft: "2px solid var(--accent-magenta)",
        background:
          "linear-gradient(180deg, rgba(255,79,216,0.05), transparent)",
      }}
    >
      <p
        className="label"
        style={{ color: "var(--accent-magenta)", marginBottom: 8 }}
      >
        weekly digest · {from} → {to}
      </p>
      <p
        className="label"
        style={{ color: "var(--ink-muted)", marginBottom: 12 }}
      >
        covering {coveredSlugs.length} daily issue
        {coveredSlugs.length === 1 ? "" : "s"}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {coveredSlugs.map((slug) => (
          <li
            key={slug}
            style={{
              padding: "4px 0",
              fontSize: "0.85rem",
            }}
          >
            <Link
              href={`/articles/${slug}`}
              style={{
                color: "var(--ink-primary)",
                borderBottom: "1px dashed var(--hairline)",
              }}
            >
              {titlesBySlug?.get(slug) ?? slug}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
