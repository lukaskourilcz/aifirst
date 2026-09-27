# Handoff: DNESKAi logotyp a čtvercový znak

## Přehled
Nová vizuální identita publikace DNESKAi (repo `lukaskourilcz/aifirst`). Nahrazuje současný lockup (modrý čtverec „completion mark“ + text DNESKAi v Space Grotesk) dvěma schválenými prvky:

1. **Logotyp** – slovo DNESKAi z Poppins Black převedené na křivky. DNESK v modré, Ai v tmavší modré, A je přisunuté pod nohu K a jejich průnik má třetí, nejtmavší odstín. Písmeno i je zmenšené na 85 %, aby tečka končila ve výšce verzálek.
2. **Čtvercový znak** – dvouřádkové DNES / KAi bílé na téměř černé, s modrým blokovým kurzorem pod ES (odkaz na terminál). Pro favicon, ikony aplikace, avatary na sociálních sítích a jakýkoli čtvercový formát.

Soubory v `brand/` jsou **finální produkční SVG s textem na křivkách** – použijte je přímo, nepřekreslujte je a nesázejte název písmem. Font Poppins není třeba do webu přidávat.

## Co je referenční a co produkční
- `brand/*.svg` a `brand/png/*` – produkční assety, kopírují se beze změny.
- `DNESKAi Final.dc.html` – přehledová tabule (HTML náhled), pouze reference, nekopírovat do repa.

## Barvy
Světlé pozadí (#FFFFFF, #f7f7f5):
- DNESK `#2F5AE6` (stávající blueprint blue)
- Ai `#1A3AB0`
- průnik K × A `#10266F`

Tmavé pozadí (#14161A):
- DNESK `#4D6FF0`
- Ai `#9DB2FF`
- průnik K × A `#D2DCFF`

Čtvercový znak: pozadí `#14161A`, písmo `#FFFFFF`, kurzor `#2F5AE6`.
Jednobarevné verze: `#14161A` nebo `#FFFFFF`, bez průniku (K a A spojené plnou barvou).

## Pravidla použití
- Poměr stran logotypu 6,02 : 1 (viewBox 50 −708 4260 708). Vždy zachovat proporce.
- Ochranná zóna: výška tečky nad i (≈ 27 % výšky logotypu) na všech stranách.
- Minimální výška logotypu 16 px; pod tím používat čtvercový znak.
- Navigace desktop: výška 20 px. Mobil: 18 px. Footer (compact): 16–18 px.
- Světlá verze (`DNESKAi-logo.svg`) na bílé/papírové ploše, tmavá (`-dark`) na `#14161A`, bílá mono (`-mono-white`) na plné modré nebo fotografii, černá mono pro jednobarevný tisk.
- Nikdy: přebarvovat, přidávat stíny, přechody, měnit velikost Ai, sázet název fontem.
- Čtvercový znak se nikdy neořezává do kruhu v produkčních souborech – kruh dělá platforma (avatar). Blikající verze (`-blink`) jen tam, kde se SVG vkládá inline na webu; favicony a avatary používají statickou verzi.

## Změny v repu `aifirst`

### 1. Assety
- Nahrát `brand/*.svg` do `public/brand/` (ponechat `completion-mark.svg`, pokud ho používá stav „Máte přehled“; jako logo se už nepoužívá).
- `app/icon.svg` → nahradit obsahem `DNESKAi-square.svg`.
- Přidat `app/apple-icon.png` (z `png/DNESKAi-square-180.png`) a `public/favicon-32.png`.

### 2. Komponenty
- `components/BrandMark.tsx`: `BrandLockup` renderuje `<img>`/inline SVG logotypu místo tečky + textu. Prop `compact` → výška 18 px, jinak 20 px. Přidat prop `tone: "light" | "dark"` (tmavý lockup pro MobileNav overlay a tmavé plochy). `alt="DNESKAi"`.
- Použití zůstává: `Sidebar.tsx`, `MobileNav.tsx`, `Footer.tsx`, `PrintArticle.tsx` (tisk → `-mono-black`).
- `app/globals.css`: odstranit `.brand-mark`, `.brand-mark__dot`, `.brand-lockup__word` (řádky ~932–941) a `print.css` řádky 44–49; nahradit jednoduchým `.brand-lockup img { height: 20px; width: auto; display: block }` + compact 18 px.

### 3. Open Graph a sdílení
- `app/[lang]/opengraph-image.tsx`: hlavička (čtverec + text) → vložit logotyp jako `<img src={dataUrl}>` výšky 40 px. Případně použít `DNESKAi-og.svg` jako výchozí obrázek pro stránky bez vlastního titulku.
- `lib/og-theme.ts`: přidat `brandAi: "#1a3ab0"`, `brandOverlap: "#10266f"`.
- Share packy a newsletter (`lib/distribution/*`): odkazovat na `public/brand/DNESKAi-logo.svg` / PNG 2000 px.

### 4. Dokumentace a design systém
- `docs/design/BRAND_SYSTEM.md`: sekci „Mark and wordmark“ přepsat podle této specifikace; smazat větu o serifovém wordmarku a o tečce jako samostatné značce. Doplnit sekci „Square mark“.
- `docs/design/DESIGN_SYSTEM.md` řádky 68–69: aktualizovat popis `BrandMark`/`BrandLockup`.
- `CLAUDE.md` řádek 121 a `.claude/skills/caught-up-brand-system/SKILL.md` řádek 15: nahradit „completion mark through BrandMark/BrandLockup“ za „logotyp z public/brand/DNESKAi-logo*.svg přes BrandLockup; čtvercový znak DNESKAi-square.svg pro ikony a avatary“.
- `lib/brand.ts`: přidat
  ```ts
  assets: {
    logo: "/brand/DNESKAi-logo.svg",
    logoDark: "/brand/DNESKAi-logo-dark.svg",
    logoMonoBlack: "/brand/DNESKAi-logo-mono-black.svg",
    logoMonoWhite: "/brand/DNESKAi-logo-mono-white.svg",
    square: "/brand/DNESKAi-square.svg",
    og: "/brand/DNESKAi-og.svg",
  }
  ```
  aby prezentační materiály a sociální příspěvky (Quorum / BoardlessAI social-pack) braly cesty odtud.
- Test `lib/__tests__/brand.test.ts`: doplnit kontrolu, že všechny cesty v `brand.assets` existují v `public/`.

### 5. Ověření
`pnpm verify`, `pnpm e2e` (smoke test na lockup), vizuálně zkontrolovat `/`, mobilní menu, footer, tiskovou stránku a `/opengraph-image`.

## Soubory
- `brand/DNESKAi-logo.svg`, `-dark.svg`, `-mono-black.svg`, `-mono-white.svg`
- `brand/DNESKAi-square.svg`, `-square-blink.svg`
- `brand/DNESKAi-og.svg`, `-og-dark.svg` (1200 × 630)
- `brand/png/` – logo 2000 px (světlé, tmavé, bílé), OG 1200 × 630, čtverec 512 / 180 / 32
- `DNESKAi Final.dc.html` – přehledová tabule
