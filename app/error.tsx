"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = dict(DEFAULT_LOCALE).error;
  useEffect(() => {
    // Surface in browser devtools; in production, hook a real logger here.
    console.error("[route-error]", error);
  }, [error]);

  return (
    <section className="status-page">
      <p className="kicker kicker--accent">{t.kicker}</p>
      <h1 className="status-page__code">500</h1>
      <p className="status-page__body">{t.body}</p>
      {error.digest ? <p className="kicker status-page__digest">{t.digest} {error.digest}</p> : null}
      <div className="status-page__actions">
        <button type="button" onClick={reset} className="kicker status-page__retry">
          {t.retry}
        </button>
        <Link href="/" className="kicker">
          ← {t.home}
        </Link>
      </div>
    </section>
  );
}
