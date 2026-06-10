import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export default function NotFound() {
  const t = dict(DEFAULT_LOCALE).notFound;
  return (
    <section
      className="container"
      style={{ padding: "120px 24px", textAlign: "center" }}
    >
      <p
        className="label label--accent"
        style={{ letterSpacing: "0.4em" }}
      >
        {t.kicker}
      </p>
      <h1
        style={{
          fontSize: "clamp(3rem, 10vw, 8rem)",
          color: "var(--accent-magenta)",
          marginTop: "0.5em",
        }}
      >
        404
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2em" }}>
        {t.body}
      </p>
      <Link href="/" className="label">
        ⟵ {t.home}
      </Link>
    </section>
  );
}
