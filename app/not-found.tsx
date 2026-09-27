import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export default function NotFound() {
  const t = dict(DEFAULT_LOCALE).notFound;
  return (
    <section className="status-page">
      <p className="kicker kicker--accent">{t.kicker}</p>
      <h1 className="status-page__code">404</h1>
      <p className="status-page__body">{t.body}</p>
      <Link href="/" className="kicker">
        ← {t.home}
      </Link>
    </section>
  );
}
