# Redakční pravidla pro psaní vydání (2026-09)

Podklad pro prompt BoardlessAI, který píše vydání DNESKAi. Vychází z předstartovního auditu (`docs/audit-2026-09/`). Tento repozitář doručené texty needituje; pravidla platí pro nová vydání upstream.

Web některé chyby opravuje při vykreslení (`lib/typography.ts`): uvozovky, nezlomitelné mezery, pomlčky a několik slepených slov. To je záchranná síť, ne náhrada za správný text. Soubor MDX má odcházet už v pořádku.

## Titulek

- Jedna věta, bez tečky na konci.
- Nejvýš 70 znaků.
- Žádné dvě ani tři věty za sebou („Červ postavený s AI za dva týdny. WordPress bez svého zakladatele. A zákony…“).

## Perex (`dek`)

- Jedna věta, nejvýš 25 slov.
- Jen o hlavním příběhu. Vedlejší zprávy dne patří do Ve zkratce, ne do perexu.

## Proč na tom záleží (`why_it_matters`)

- Každá odrážka nejvýš 15 slov.
- Jen důsledek. Neopakovat fakt, který už zazněl v perexu nebo v „Co se změnilo“.

## Zakázané obraty

- Řečnická otázka s odpovědí („Cena jednoho skenu? Průměrně 25 dolarů.“).
- „srovnání hovoří samo“, „šeptalo se“, „mění hru“, „přelomový“, „zásadní posun“, „stojí za pozornost“.
- Superlativy tam, kde stačí popis.
- Trojice přídavných jmen za sebou.

## Data a dny v týdnu

- Den v týdnu v textu musí odpovídat `published_at` zdroje v časovém pásmu Europe/Prague. 24. 9. 2026 byl čtvrtek, ne středa.
- „V noci na čtvrtek“ a podobné obraty jen tehdy, když to zdroj výslovně uvádí.

## Typografie

- Uvozovky „takto“, nikdy "takto" ani „takto".
- Nezlomitelná mezera (U+00A0) za jednopísmennými předložkami a spojkami k, s, v, z, o, u, a, i a mezi číslem a jednotkou: `25 %`, `8–24 GB`.
- Rozsah a větná pomlčka: půlčtverčíková pomlčka (–) s mezerami ve větě, bez mezer v rozsahu čísel. Nikdy dlouhá pomlčka (—).
- Mezi slovy vždy mezera. V textu z 25. 9. vyšlo „agentnísoustavy“ a „agentnísystémy“.

## Zdroje (`sources[]`)

- `supports` česky, jedna neutrální věta o tom, co zdroj dokládá. Bez hodnocení („watershed moment“) a bez angličtiny. Web tento text zatím nezobrazuje, dokud nebude česky.
- `source_id` vyplnit u každého zdroje z registru `sources.yml`. Podle něj web počítá, kolikrát které vydání ze zdroje čerpalo.
- Titulek zdroje dekódovaný, bez HTML entit (`Google’s`, ne `Google&#8217;s`).

## Ve zkratce a Ke sledování

- `dispatches` a `wire` nesmí sdílet URL. Jeden příběh patří do jednoho seznamu. Web duplicity vyřazuje z Ke sledování, ale správně je neposlat je vůbec.
- `dispatches[].topic` jako štítek z registru témat (`umela-inteligence`, `regulace`…), ne volný text. Neznámý štítek se na webu nezobrazí.

## Ilustrace

- `attribution.author` a `attribution.license` vyplnit vždy. Web z nich skládá „Foto: autor / Pexels“; anglické `attribution.text` nezobrazuje.

## Záznam o dni bez vydání

- `noEditionReason` je provozní údaj a čtenář ho nevidí. Může zůstat anglicky.
- O víkendu záznam `no_edition` nevytvářet. Pokud vznikne, web ho ignoruje.
