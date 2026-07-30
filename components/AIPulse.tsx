import { Sparkline } from "./Sparkline";
import type { Pulse } from "@/lib/pulse";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import type { CSSProperties } from "react";

type Props = { pulse: Pulse; locale: Locale };

function statusTone(status: string): "complete" | "warning" | "correction" | "neutral" {
  const s = status.toLowerCase();
  if (s === "operational" || s === "ok" || s === "up") return "complete";
  if (/(degrad|partial|minor|maintenance)/.test(s)) return "warning";
  if (/(down|outage|major|critical)/.test(s)) return "correction";
  return "neutral";
}

export function AIPulse({ pulse, locale }: Props) {
  const t = dict(locale).pulse;
  const nf = new Intl.NumberFormat(locale);
  const price = (v: number | null) => (v == null ? "—" : `$${v}`);
  const maxModelScore = Math.max(1, ...pulse.models.map((model) => model.tfii ?? 0));

  return (
    <div className="ai-pulse">
      {/* npm package momentum */}
      {pulse.packages.length > 0 && (
        <section>
          <p className="label label--accent ai-pulse__section-label">
            {t.packagesHeading}
          </p>
          <p className="label label--muted ai-pulse__downloads-label">
            {t.downloads30d}
          </p>
          <ul className="ai-pulse__packages">
            {pulse.packages.map((p) => (
              <li key={p.name}>
                <div className="ai-pulse__package-head">
                  <code>
                    {p.name}
                  </code>
                  <span className="ai-pulse__package-total">
                    {nf.format(p.total)}
                  </span>
                </div>
                <Sparkline data={p.series} width={280} height={48} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Model pricing & intelligence */}
      {pulse.models.length > 0 && (
        <section>
          <div className="ai-pulse__heading">
            <p className="label label--accent">
              {t.modelsHeading}
            </p>
            {pulse.modelsUpdated && (
              <span className="label label--muted">
                {t.updated} {pulse.modelsUpdated}
              </span>
            )}
          </div>
          <div className="table-scroll" tabIndex={0} role="region" aria-label={t.modelsHeading}>
            <table className="ai-pulse__table">
              <thead>
                <tr>
                  <th>
                    <span className="label">{t.colModel}</span>
                  </th>
                  <th>
                    <span className="label">{t.colIntel}</span>
                  </th>
                  <th>
                    <span className="label">{t.colInput}</span>
                  </th>
                  <th>
                    <span className="label">{t.colOutput}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pulse.models.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="ai-pulse__model">{m.name}</span>
                      {m.provider && (
                        <span className="ai-pulse__provider"> · {m.provider}</span>
                      )}
                    </td>
                    <td className="ai-pulse__numeric ai-pulse__score">
                      {m.tfii == null ? "—" : (
                        <span className="ai-pulse__score-readout">
                          <span className="ai-pulse__score-track" aria-hidden>
                            <span
                              style={{
                                "--score-width": `${Math.round((m.tfii / maxModelScore) * 100)}%`,
                              } as CSSProperties}
                            />
                          </span>
                          <span>{m.tfii.toFixed(1)}</span>
                        </span>
                      )}
                    </td>
                    <td className="ai-pulse__numeric">
                      {price(m.inputPrice)}
                    </td>
                    <td className="ai-pulse__numeric">
                      {price(m.outputPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="label label--muted ai-pulse__note">
            {t.priceNote}
          </p>
        </section>
      )}

      {/* Provider service status */}
      {pulse.services.length > 0 && (
        <section>
          <p className="label label--accent ai-pulse__section-label">
            {t.statusHeading}
          </p>
          <ul className="ai-pulse__services">
            {pulse.services.map((s) => (
              <li key={s.name}>
                <span aria-hidden className="ai-pulse__status-dot" data-tone={statusTone(s.status)} />
                <span className="ai-pulse__service-name">
                  {s.name}
                </span>
                <span className="label label--muted">
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="label label--muted">
        {t.source}
      </p>
    </div>
  );
}
