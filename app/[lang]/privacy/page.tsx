import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import type { Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";

export const dynamic = "force-static";

const title = "Ochrana soukromí";
const intro = "Jak tým DNESKAi zachází s údaji návštěvníků webu a lidí, kteří komunikují s instagramovým účtem @dneskai prostřednictvím aplikace OwnDashboard DNESKAi.";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title, description: intro, alternates: localeAlternates(lang, "/privacy") };
}

const sections = [
  {
    id: "kontakt",
    title: "Kdo za zpracováním stojí a jak nás kontaktovat",
    body: <>Za provoz magazínu dneskai.vercel.app, účtu @dneskai a interní aplikace OwnDashboard DNESKAi odpovídá tým DNESKAi. Dotazy k soukromí a žádosti o uplatnění práv nám pošlete soukromou zprávou na <a href="https://www.instagram.com/dneskai/" target="_blank" rel="noopener noreferrer">Instagram @dneskai</a>. Na začátku zprávy uveďte „Soukromí“. Žádost vyřizuje člověk; neposílejte hesla, přístupové tokeny ani kopie dokladů.</>,
  },
  {
    id: "web",
    title: "Návštěva webu",
    body: <>Magazín můžete číst bez účtu. Vercel zajišťuje hosting a při doručení stránky zpracovává technické údaje požadavku, například IP adresu, adresu stránky, čas a údaje o prohlížeči. Vercel Web Analytics nám poskytuje souhrnné statistiky návštěvnosti: navštívené stránky, odkazující web, přibližnou oblast, typ zařízení a prohlížeče. U kampaní měříme také zdroj a označení kampaně z parametrů UTM. Pro tuto analytiku nepoužíváme cookies ani reklamní identifikátory a nespojujeme ji s instagramovými účty. Vercel uvádí, že identifikátor návštěvy obnovuje po 24 hodinách; podrobnosti popisuje v <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">informacích o Web Analytics</a>.</>,
  },
  {
    id: "instagram",
    title: "Instagram a aplikace OwnDashboard DNESKAi",
    body: <>OwnDashboard DNESKAi je interní nástroj pro správu vlastního účtu @dneskai, přípravu a schvalování příspěvků, jejich publikování a vyřizování reakcí. Prostřednictvím rozhraní Meta zpracovává údaje připojeného profesionálního účtu, jeho identifikátor a uživatelské jméno, údaje o jeho příspěvcích a jejich publikaci. Přístup vychází z oprávnění, která provozovatel účtu udělil aplikaci. Návštěvník webu se do aplikace nepřihlašuje a aplikace nezískává přístup k jeho soukromému instagramovému účtu jen tím, že navštíví tento web.</>,
  },
  {
    id: "komentare",
    title: "Komentáře a soukromé odpovědi",
    body: <>U vybraných příspěvků může aplikace přečíst identifikátor, text a čas komentáře, aby rozpoznala zveřejněné klíčové slovo a odeslala předem schválenou soukromou odpověď, případně také odpověď pod komentář. Automatická odpověď slouží k doručení materiálu, o který si komentářem řeknete. Aplikace si pro tento účel neukládá text komentáře, uživatelské jméno komentujícího ani jeho uživatelský identifikátor. Uchovává identifikátor komentáře a příspěvku, rozpoznané klíčové slovo, čas a stav doručení, aby stejnou odpověď neposlala opakovaně. Tento postup nečte celou příchozí schránku. Soukromé zprávy, které nám pošlete, zůstávají v prostředí Instagramu a tým je může vyřídit ručně.</>,
  },
  {
    id: "ucel",
    title: "Účely a právní základy",
    body: <>Údaje používáme k doručení webu, jeho zabezpečení, vyhodnocení souhrnné návštěvnosti, správě vlastního instagramového obsahu a vyřízení komunikace či požadovaného materiálu. Vycházíme z oprávněného zájmu na provozu a zabezpečení publikace a na odpovědi na vaši žádost. Pokud je pro konkrétní zpracování nutný souhlas, vyžádáme jej předem a můžete jej odvolat. Zákonné povinnosti, například vyřízení žádosti o ochranu údajů, plníme na základě příslušného právního předpisu. Údaje nepoužíváme k rozhodování s právními nebo obdobně závažnými účinky ani k vytváření reklamních profilů.</>,
  },
  {
    id: "sluzby",
    title: "Kdo údaje zpracovává",
    body: <>Přístup k provozním záznamům má oprávněný provozovatel aplikace. Vercel poskytuje hosting a analytiku, Supabase ukládá neveřejné provozní záznamy a publikační podklady a Meta poskytuje Instagram a jeho rozhraní. Pro přípravu redakčních návrhů používáme Anthropic; automatické odpovědi na komentáře používají schválený text a neposílají komentáře ani soukromé zprávy modelu. Do LangSmith v regionu EU posíláme omezenou technickou diagnostiku a otisky dat, bez textu komentářů, zpráv, zadání či přístupových údajů; aktuální základní doba uchování těchto diagnostických záznamů je 14 dní. Údaje neprodáváme. Dodavatelé mohou zpracovávat údaje i mimo Evropský hospodářský prostor; jejich ochranu a případné předávání upravují příslušné smluvní podmínky a mechanismy podle GDPR. Samotné používání Instagramu se řídí také <a href="https://privacycenter.instagram.com/policy/" target="_blank" rel="noopener noreferrer">zásadami ochrany soukromí Meta</a>.</>,
  },
  {
    id: "uchovani",
    title: "Doba uchování a zabezpečení",
    body: <>Publikační podklady a záznamy o doručených odpovědích uchováváme po dobu, kdy je potřebujeme ke správě účtu, zabránění duplicitním odpovědím a řešení chyb. Pro identifikátory odpovědí nyní nemáme nastavenou pevnou automatickou lhůtu výmazu; potřebu uchování posuzujeme při žádosti o výmaz a při ukončení dané činnosti. Údaje odstraníme, jakmile pro ně nemáme potřebný účel nebo jiný zákonný důvod. Přístup omezujeme na provozovatele a nezveřejňujeme interní provozní záznamy na čtenářském webu. Technické logy, zálohy a zprávy v Instagramu mají také pravidla uchování příslušného dodavatele.</>,
  },
  {
    id: "vymaz-udaju",
    title: "Jak požádat o výmaz údajů",
    body: <>Pošlete soukromou zprávu účtu <a href="https://www.instagram.com/dneskai/" target="_blank" rel="noopener noreferrer">@dneskai</a> s textem „Soukromí: žádost o výmaz“. Uveďte svůj instagramový účet a odkaz na dotčený příspěvek nebo komentář, pokud jej máte. Ověříme pouze údaje potřebné k přiřazení žádosti, odstraníme související záznamy pod naší kontrolou, pro které nemáme další zákonný důvod, a sdělíme vám výsledek. Když nám nemůžete napsat, otevřete profil @dneskai a využijte dostupnou možnost kontaktu. Výmaz u nás sám neodstraní váš původní komentář nebo konverzaci z Instagramu; ty můžete spravovat přímo v Instagramu. Provozovatel připojeného účtu může také odvolat oprávnění aplikace v nastavení Meta.</>,
  },
  {
    id: "prava",
    title: "Vaše práva a změny těchto zásad",
    body: <>V rozsahu GDPR můžete požádat o přístup, opravu, výmaz, omezení zpracování a případně přenositelnost údajů, vznést námitku proti zpracování založenému na oprávněném zájmu nebo odvolat souhlas. Na žádost odpovíme zpravidla do jednoho měsíce; o případném zákonném prodloužení vás informujeme. Můžete podat stížnost u <a href="https://uoou.gov.cz/" target="_blank" rel="noopener noreferrer">Úřadu pro ochranu osobních údajů</a> nebo příslušného dozorového úřadu. Při změně zpracování aktualizujeme tuto stránku a datum účinnosti.</>,
  },
];

export default function PrivacyPage() {
  return (
    <PageShell kicker="Soukromí" title={title} intro={intro}>
      <p className="meta">Účinné od <time dateTime="2026-10-23">23. října 2026</time></p>
      <nav aria-label="Obsah zásad ochrany soukromí" className="trust-links">
        <a href="#kontakt">Kontakt</a>
        <a href="#instagram">Instagram a aplikace</a>
        <a href="#vymaz-udaju">Výmaz údajů</a>
      </nav>
      <div className="about-sections">
        {sections.map((section, index) => (
          <section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
            <span className="label" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
