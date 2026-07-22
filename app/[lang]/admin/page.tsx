import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { githubRepo } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminMigrationPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const repo = githubRepo();
  const czech = locale === "cs";
  return (
    <PageShell kicker={dict(locale).admin.kicker} title={czech ? "Provozní ovládání se přesouvá." : "Operations are moving."} kickerTone="warning">
      <p style={{ maxWidth: "65ch", color: "var(--ink-muted)" }}>
        {czech
          ? "Caught Up už na veřejném webu neudržuje druhou operátorskou konzoli. Generování a obnovu lze bezpečně spouštět v GitHub Actions; OwnDashboard se připojí jako volitelná řídicí vrstva, až bude nakonfigurován."
          : "Caught Up no longer maintains a second operator console on the public site. Generation and recovery remain safely available in GitHub Actions; OwnDashboard can become the optional control plane once configured."}
      </p>
      <Link href={`https://github.com/${repo}/actions`} target="_blank" rel="noreferrer noopener">
        GitHub Actions ↗
      </Link>
    </PageShell>
  );
}
