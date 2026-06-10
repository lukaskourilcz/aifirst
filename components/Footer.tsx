import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function Footer({ locale }: { locale: Locale }) {
  const d = dict(locale);
  return (
    <footer
      style={{
        borderTop: "1px solid var(--hairline)",
        marginTop: 96,
        padding: "48px 0 64px",
        background: "rgba(5, 7, 13, 0.6)",
      }}
    >
      <div
        className="container footer-grid"
      >
        <div>
          <p
            className="label"
            style={{ color: "var(--accent-cyan)", marginBottom: 8 }}
          >
            aifirst<span style={{ color: "var(--accent-magenta)" }}>.</span>
          </p>
          <p style={{ color: "var(--ink-muted)", margin: 0, maxWidth: "52ch" }}>
            {d.footer.description}
          </p>
        </div>
        <p className="label" style={{ textAlign: "right", margin: 0 }}>
          {d.common.transmissionOngoing}
        </p>
      </div>
    </footer>
  );
}
