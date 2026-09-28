import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import { photoCreditParts } from "@/lib/labels";

/**
 * The article head (round 2): section label and date, the headline, the dek,
 * then a byline block. „Redaktor" is deliberately empty (owner decision: no
 * name, no avatar). „Ověření" says what the text rests on, and only claims a
 * review when `generation.human_reviewed` is true; it links to the sources and
 * to O magazínu (#redakce), where the language-model statement lives.
 *
 * The photograph follows at 3:2 over nine columns with its caption beside it:
 * the alt text as the caption, then the credit. A drawn plate or a missing
 * photo means no figure at all.
 */
export function IssueMasthead({
  label,
  title,
  dek,
  verification,
  photo,
  photoAlt,
  attribution,
  locale,
}: {
  label: string;
  title: string;
  dek: string;
  /** The „Ověření" sentence, or null for a legacy edition without a generation record. */
  verification: string | null;
  photo: string | null;
  photoAlt: string;
  attribution?: { author: string; license: string; sourceUrl: string };
  locale: Locale;
}) {
  const t = dict(locale).article;
  const credit = attribution ? photoCreditParts(attribution) : null;

  return (
    <>
      <header className="article-head">
        <p className="label label--section article-head__label">{label}</p>
        <h1 id="issue-title" className="article-head__title">{title}</h1>
        <p className="article-head__dek">{dek}</p>
        <dl className="byline">
          <div className="byline__row">
            <dt>{t.editor}</dt>
            <dd className="byline__blank"><span className="sr-only">{t.editorBlank}</span></dd>
          </div>
          {verification ? (
            <div className="byline__row">
              <dt>{t.verification}</dt>
              <dd>
                {verification}{" "}
                <a href="#zdroje">{t.sourcesDown}</a>
                <span aria-hidden> · </span>
                <Link href={`${localePath(locale, "/about")}#redakce`}>{t.provenanceLink}&nbsp;→</Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      {photo ? (
        <figure className="article-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt={photoAlt} width={1600} height={1067} className="article-figure__img" fetchPriority="high" decoding="async" />
          <figcaption className="article-figure__caption">
            {photoAlt ? <span className="article-figure__alt">{photoAlt}</span> : null}
            {credit && attribution ? (
              <span className="meta">
                {credit.prefix}{" "}
                <a href={attribution.sourceUrl} target="_blank" rel="noopener noreferrer">{credit.author}</a>
                {credit.host ? ` / ${credit.host}` : null}
              </span>
            ) : null}
          </figcaption>
        </figure>
      ) : null}
    </>
  );
}
