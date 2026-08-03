import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

const boardlessAdmin = "https://quorum-site-chi.vercel.app/admin";

export const dynamic = "force-static";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminMigrationPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang: locale } = await params;
  const czech = locale === "cs";
  return (
    <PageShell
      kicker={dict(locale).admin.kicker}
      title={czech ? "Provoz je v BoardlessAI." : "Operations live in BoardlessAI."}
      kickerTone="warning"
      intro={czech
        ? "DNESKAi je statická čtečka. Chráněný admin v BoardlessAI uchovává české i anglické podklady pro Instagram a Threads spolu s provozním stavem."
        : "DNESKAi is a static reader. The protected BoardlessAI admin stores the English and Czech Instagram and Threads drafts alongside operating state."}
    >
      <p className="admin-migration__action">
        <Link href={boardlessAdmin} target="_blank" rel="noreferrer noopener">
          {czech ? "Otevřít BoardlessAI Admin ↗" : "Open BoardlessAI Admin ↗"}
        </Link>
      </p>
    </PageShell>
  );
}
