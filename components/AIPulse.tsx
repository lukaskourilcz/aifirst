import { Sparkline } from "./Sparkline";
import type { Pulse } from "@/lib/pulse";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = { pulse: Pulse; locale: Locale };

// Map a free-text status string to a semantic colour. Operational is the
// mint accent; anything hinting at partial/degraded is amber; outages red;
// unknown falls back to the muted slate.
function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === "operational" || s === "ok" || s === "up") return "var(--color-mint)";
  if (/(degrad|partial|minor|maintenance)/.test(s)) return "#e8a33d";
  if (/(down|outage|major|critical)/.test(s)) return "#e5484d";
  return "var(--color-slate)";
}

const hairline = "1px solid var(--hairline)";

export function AIPulse({ pulse, locale }: Props) {
  const t = dict(locale).pulse;
  const nf = new Intl.NumberFormat(locale);
  const price = (v: number | null) => (v == null ? "—" : `$${v}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
      {/* Model pricing & intelligence */}
      {pulse.models.length > 0 && (
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <p className="label label--accent" style={{ margin: 0 }}>
              {t.modelsHeading}
            </p>
            {pulse.modelsUpdated && (
              <span className="label" style={{ color: "var(--color-slate)" }}>
                {t.updated} {pulse.modelsUpdated}
              </span>
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "var(--text-body-sm)",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 12px 8px 0", borderBottom: hairline }}>
                    <span className="label">{t.colModel}</span>
                  </th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: hairline }}>
                    <span className="label">{t.colInput}</span>
                  </th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: hairline }}>
                    <span className="label">{t.colOutput}</span>
                  </th>
                  <th style={{ textAlign: "right", padding: "8px 0 8px 12px", borderBottom: hairline }}>
                    <span className="label">{t.colIntel}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pulse.models.map((m) => (
                  <tr key={m.id}>
                    <td style={{ padding: "10px 12px 10px 0", borderBottom: hairline }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      {m.provider && (
                        <span style={{ color: "var(--color-slate)" }}> · {m.provider}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px", borderBottom: hairline, fontFamily: "var(--font-mono)" }}>
                      {price(m.inputPrice)}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px", borderBottom: hairline, fontFamily: "var(--font-mono)" }}>
                      {price(m.outputPrice)}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 0 10px 12px", borderBottom: hairline, fontFamily: "var(--font-mono)", color: "var(--color-blueprint-blue)", fontWeight: 600 }}>
                      {m.tfii == null ? "—" : m.tfii.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="label" style={{ color: "var(--color-slate)", marginTop: 8 }}>
            {t.priceNote}
          </p>
        </section>
      )}

      {/* Provider service status */}
      {pulse.services.length > 0 && (
        <section>
          <p className="label label--accent" style={{ marginBottom: 12 }}>
            {t.statusHeading}
          </p>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 8,
            }}
          >
            {pulse.services.map((s) => (
              <li
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  border: hairline,
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: statusColor(s.status),
                    flexShrink: 0,
                  }}
                />
                <span style={{ minWidth: 0, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.name}
                </span>
                <span className="label" style={{ color: "var(--color-slate)" }}>
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* npm package momentum */}
      {pulse.packages.length > 0 && (
        <section>
          <p className="label label--accent" style={{ marginBottom: 4 }}>
            {t.packagesHeading}
          </p>
          <p className="label" style={{ color: "var(--color-slate)", marginBottom: 16 }}>
            {t.downloads30d}
          </p>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {pulse.packages.map((p) => (
              <li
                key={p.name}
                style={{ padding: 16, border: hairline, borderRadius: "var(--radius-cards)" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <code style={{ fontSize: "var(--text-body-sm)", fontWeight: 600 }}>
                    {p.name}
                  </code>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-body-sm)", color: "var(--color-blueprint-blue)" }}>
                    {nf.format(p.total)}
                  </span>
                </div>
                <Sparkline data={p.series} width={280} height={48} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="label" style={{ color: "var(--color-slate)" }}>
        {t.source}
      </p>
    </div>
  );
}
