import Link from "next/link";

export default function NotFound() {
  return (
    <section
      className="container"
      style={{ padding: "120px 24px", textAlign: "center" }}
    >
      <p
        className="label label--accent"
        style={{ letterSpacing: "0.4em" }}
      >
        signal lost
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
        That transmission isn&rsquo;t in our archive.
      </p>
      <Link href="/" className="label">
        ⟵ return to the latest issue
      </Link>
    </section>
  );
}
