import Link from "next/link";
import { SearchPalette } from "./SearchPalette";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buildSearchIndex, getArticle, listArticles } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { brand } from "@/lib/brand";
import { NavLink } from "./NavLink";
import { BrandLockup } from "./BrandMark";
import { classifyPublicHealth } from "@/lib/public-health";
import { SignalStrength } from "./SignalStrength";

function runTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toISOString().slice(11, 16)} UTC`;
}

export async function Sidebar({ locale }: { locale: Locale }) {
  const t = dict(locale).nav;
  const d = dict(locale);
  const lp = localePrefixer(locale);
  const [index, articles] = await Promise.all([
    buildSearchIndex(locale),
    listArticles(locale),
  ]);
  const latestDaily = articles.find((article) => (article.type ?? "daily") === "daily");
  const latestWeekly = articles.find((article) => article.type === "weekly");
  const latest = latestDaily ? await getArticle(latestDaily.slug, locale) : null;
  const dailyAgeHours = latestDaily
    ? Math.floor((Date.now() - new Date(`${latestDaily.date}T06:00:00Z`).getTime()) / 3_600_000)
    : null;
  const weeklyAgeDays = latestWeekly
    ? Math.floor((Date.now() - new Date(`${latestWeekly.date}T07:00:00Z`).getTime()) / 86_400_000)
    : null;
  const status = classifyPublicHealth(dailyAgeHours, weeklyAgeDays === null || weeklyAgeDays > 10);
  const statusTitle = {
    healthy: d.health.healthyTitle,
    degraded: d.health.degradedTitle,
    stale: d.health.staleTitle,
    failed: d.health.failedTitle,
  }[status];
  const generation = latest?.frontmatter.generation;
  const cited = generation?.cited_sources ?? latest?.frontmatter.sources.length;
  const candidates = generation?.source_candidates;
  const cost = generation?.cost
    ? `${generation.cost.amount.toFixed(4)} ${generation.cost.currency}`
    : d.common.unavailable;
  const primaryLabel = locale === "cs" ? "Hlavní navigace" : "Primary navigation";
  const homeLabel = locale === "cs" ? `${brand.name} – domů` : `${brand.name} home`;

  const primary: Array<{ key: string; label: string; href: string }> = [
    { key: "today",   label: t.today,   href: lp("/") },
    { key: "radar",   label: t.radar,   href: lp("/radar") },
    { key: "topics",  label: t.topics,  href: lp("/topics") },
    { key: "weekly",  label: t.weekly,  href: lp("/weekly") },
    { key: "archive", label: t.archive, href: lp("/archive") },
    { key: "about",   label: t.about,   href: lp("/about") },
  ];

  return (
    <aside className="sidebar" aria-label={primaryLabel}>
      <div className="sidebar__head">
        <Link href={lp("/")} className="sidebar__brand" aria-label={homeLabel}>
          <BrandLockup />
        </Link>
        <p className="sidebar__strapline">{d.meta.tagline}</p>
      </div>

      <nav className="nav-rail" aria-label={primaryLabel}>
        {primary.map((item, index) => (
          <NavLink
            key={item.key}
            href={item.href}
            label={item.label}
            index={String(index + 1).padStart(2, "0")}
          />
        ))}
        <div className="nav-divider" aria-hidden />
        <SearchPalette index={index} locale={locale} />
        <LanguageSwitcher locale={locale} />
      </nav>

      <section className="sidebar-status" data-tone={status} aria-label={d.common.publicationStatus}>
        <header className="sidebar-status__header">
          <span aria-hidden className="sidebar-status__dot" />
          <span>{statusTitle}</span>
        </header>
        <dl>
          <div><dt>{d.common.issue}</dt><dd>{latest?.frontmatter.date ?? "—"}</dd></div>
          <div><dt>{d.common.ran}</dt><dd>{runTime(generation?.generated_at)}</dd></div>
          <div>
            <dt>{d.common.candidates}</dt>
            <dd>{candidates === undefined ? "—" : `${candidates} → ${cited ?? "—"}`}</dd>
          </div>
          <div><dt>{d.common.runCost}</dt><dd>{cost}</dd></div>
        </dl>
        {latest?.frontmatter.signal_strength !== undefined ? (
          <div className="sidebar-status__signal">
            <SignalStrength value={latest.frontmatter.signal_strength} label={d.common.signal} />
          </div>
        ) : null}
      </section>
    </aside>
  );
}
