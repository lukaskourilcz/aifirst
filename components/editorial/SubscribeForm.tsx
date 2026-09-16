import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { subscribeChannel } from "@/lib/subscribe";

/**
 * The email half of the rail's subscribe module.
 *
 * It is a server component and a native `<form method="post">`: no client
 * boundary, no fetch, no script, so it adds nothing to the page entry. The
 * address goes straight to the provider configured in `config/subscribe.json`,
 * which is also where `next.config.mjs` derives the `form-action` origin from —
 * without that origin the browser blocks the submission.
 *
 * With no provider configured this renders nothing at all. An empty state here
 * is the Atom link on its own, not a disabled field or a promise of a list that
 * does not exist.
 */
export function SubscribeForm({ locale }: { locale: Locale }) {
  const channel = subscribeChannel();
  if (channel === null) return null;

  const t = dict(locale).sections;
  return (
    <form className="subscribe-form" method="post" action={channel.action}>
      {Object.entries(channel.hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <label className="subscribe-form__label" htmlFor="subscribe-email">
        {t.subscribeEmailLabel}
      </label>
      <input
        id="subscribe-email"
        className="subscribe-form__input"
        type="email"
        name={channel.emailField}
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        required
      />
      <button type="submit" className="cta subscribe-form__submit">
        {t.subscribeEmailSubmit}
      </button>
      <p className="subscribe-form__note">{channel.privacyNote[locale]}</p>
    </form>
  );
}
