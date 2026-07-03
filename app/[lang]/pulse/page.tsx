import { PageShell } from "@/components/PageShell";
import { AIPulse } from "@/components/AIPulse";
import { loadPulse } from "@/lib/pulse";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export default async function PulsePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).pulse;
  const pulse = loadPulse();

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      {pulse ? (
        <AIPulse pulse={pulse} locale={locale} />
      ) : (
        <p style={{ color: "var(--ink-muted)" }}>{t.empty}</p>
      )}
    </PageShell>
  );
}
