import Link from "next/link";
import { formatCzk, type PartnerBooking, type PartnerPackage, type PartnerPeriod } from "@/lib/partner";
import { localePath, type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

/** One placement as the reader meets it: a name, where it runs, its size and whether it is free. */
export type PartnerFormat = {
  readonly id: string;
  /** The live geometry, or `null` when the slot has no creative size set yet. */
  readonly size: string | null;
  readonly state: "taken" | "free" | "per-edition";
};

/** Build-time facts counted from committed content. Never traffic, which is not measured. */
export type PartnerReach = {
  readonly editions: number;
  readonly since: string;
  readonly sources: number;
  readonly topics: number;
};

type Props = {
  readonly locale: Locale;
  readonly packages: readonly PartnerPackage[];
  readonly booking: PartnerBooking | null;
  readonly formats: readonly PartnerFormat[];
  readonly reach: PartnerReach;
  /** The owner's VAT wording, empty while it is unsettled. */
  readonly vatNote: string;
};

/**
 * The rate card: what can be booked, what it costs, what the magazine actually
 * is, and the rule that paying changes none of the journalism.
 *
 * A server component with no interaction, so the page carries no client
 * JavaScript. Everything it renders is either a dictionary string or a value
 * counted from committed content, and a price it has not been given renders as
 * "on request" instead of a number. The booking destination is a plain anchor:
 * no form, no iframe and no third-party script, so the content security policy
 * is untouched.
 */
export function PartnerRateCard({ locale, packages, booking, formats, reach, vatNote }: Props) {
  const d = dict(locale);
  const t = d.partner;
  // Indexing by a live slot id needs a widened view; an id with no copy is
  // dropped rather than rendered as a bare key. `lib/__tests__/partner.test.ts`
  // fails when a declared slot has no copy, so the drop cannot go unnoticed.
  const slotCopy: Record<string, { name: string; where: string } | undefined> = t.slots;
  const priced = packages.some((entry) => entry.priceCzk !== null);

  const period = (value: PartnerPeriod): string =>
    value === "edition" ? t.perEdition : value === "week" ? t.perWeek : t.perMonth;

  const stateLabel = (state: PartnerFormat["state"]): string =>
    state === "taken" ? t.stateTaken : state === "free" ? t.stateFree : t.statePerEdition;

  return (
    <div className="about-sections partner-card">
      <section id="packages">
        <span className="label" aria-hidden>01</span>
        <div>
          <h2>{t.packagesHeading}</h2>
          {packages.length ? (
            <ul className="partner-packages">
              {packages.map((entry) => {
                const copy = t.packages[entry.id];
                return (
                  <li key={entry.id} className="partner-package">
                    <h3 className="partner-package__name">{copy.name}</h3>
                    <p className="partner-package__summary">{copy.summary}</p>
                    <p className="partner-price">
                      {entry.priceCzk === null ? (
                        <span className="partner-price__request">{t.priceOnRequest}</span>
                      ) : (
                        <>
                          <span className="partner-price__amount">{formatCzk(entry.priceCzk, locale)}</span>{" "}
                          <span className="label label--muted">{period(entry.period)}</span>
                        </>
                      )}
                    </p>
                    <p className="label label--muted partner-package__includes-heading">
                      {t.includesHeading}
                    </p>
                    <ul className="partner-includes">
                      {copy.includes.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="label label--muted route-empty-state">{t.packagesEmpty}</p>
          )}
          <p className="partner-note">{priced ? vatNote || t.vatUnset : t.priceNote}</p>
        </div>
      </section>

      <section id="formats">
        <span className="label" aria-hidden>02</span>
        <div>
          <h2>{t.formatsHeading}</h2>
          <p>{t.formatsIntro}</p>
          <dl className="partner-formats">
            {formats.map((format) => {
              const copy = slotCopy[format.id];
              if (!copy) return null;
              return (
                <div key={format.id} className="def-row partner-format">
                  <dt>
                    <span className="partner-format__name">{copy.name}</span>
                    <span className="label label--muted partner-format__where">{copy.where}</span>
                  </dt>
                  <dd>
                    <span className="partner-format__size">
                      {format.size ?? (format.state === "per-edition" ? t.sponsorBlockSize : t.sizeUnset)}
                    </span>
                    <span className={`partner-state partner-state--${format.state}`}>
                      {stateLabel(format.state)}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section id="reach">
        <span className="label" aria-hidden>03</span>
        <div>
          <h2>{t.reachHeading}</h2>
          <dl className="partner-reach">
            <div>
              <dt>{t.reachEditions}</dt>
              <dd>{reach.editions}</dd>
            </div>
            <div>
              <dt>{t.reachSpan}</dt>
              <dd>{reach.since}</dd>
            </div>
            <div>
              <dt>{t.reachSources}</dt>
              <dd>{reach.sources}</dd>
            </div>
            <div>
              <dt>{t.reachTopics}</dt>
              <dd>{reach.topics}</dd>
            </div>
            <div>
              <dt>{t.reachCadence}</dt>
              <dd>{t.reachCadenceValue}</dd>
            </div>
          </dl>
          <p className="partner-note">{t.reachNote}</p>
        </div>
      </section>

      <section id="rule">
        <span className="label" aria-hidden>04</span>
        <div>
          <h2>{t.rulesHeading}</h2>
          <p>{d.about.sponsorshipBody}</p>
          <p className="partner-rule__link">
            <Link href={`${localePath(locale, "/about")}#sponsorship`}>{t.rulesLink} →</Link>
          </p>
        </div>
      </section>

      <section id="booking">
        <span className="label" aria-hidden>05</span>
        <div>
          <h2>{t.bookHeading}</h2>
          <p>{t.bookBody}</p>
          {booking === null ? (
            <p className="label label--muted route-empty-state">{t.bookUnavailable}</p>
          ) : (
            <p className="partner-booking">
              {booking.kind === "external" ? (
                <a className="cta partner-booking__cta" href={booking.href} target="_blank" rel="noopener noreferrer">
                  {t.bookCta}
                  <span className="sr-only"> {d.sections.opensInNewWindow}</span>
                </a>
              ) : (
                <a className="cta partner-booking__cta" href={booking.href}>
                  {t.bookCta}
                </a>
              )}
              <span className="label label--muted partner-booking__destination">{booking.display}</span>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
