# Umsetzung im Astro-Projekt (28.10.2026)

Der Entwurf aus diesem Ordner ist in die echte Seite eingebaut. Die Dateien hier bleiben unverändert als Referenz; produktiv gelten die Dateien unter `src/`.

## Was wo steht

| Teil | Datei |
|---|---|
| Name „Scitura“, Themenfarbe #183365 | `src/config/site.ts`, `public/manifest.webmanifest` |
| Logo in der Kopfleiste (dunkel, im dunklen Farbschema hell) | `src/components/Logo.astro`, `src/assets/brand/scitura-logo.png`, `src/styles/global.css` (`.brand__logo`) |
| Browser- und App-Icons | `public/favicon.png` (64 px, transparent), `public/icons/*` (aus der Masterdatei verkleinert); `favicon.svg` entfällt |
| Startseite | `src/pages/[lang]/index.astro` mit `src/components/home/HomeHero.astro`, `HomeExperiment.astro`, `HomeCatalog.astro` |
| Stile der Startseite | `src/styles/home.css` (aus `style.css` zusammengefasst, nur Variante 1, alles unter `.scitura-home`) |
| Skulptur und Münzbahn | `src/lib/home/sculpture.ts` (aus `sculpture.js`, Zahlen unverändert) |
| Achterbahn | `src/lib/home/energy-stage.ts` (aus `stage.ts`; lädt die echte Simulation über die Registry) |
| Katalogfilter | `src/lib/home/catalog.ts` |
| Pause und reduzierte Bewegung | `src/lib/home/motion.ts`, Knopf in `src/components/Header.astro` (nur Startseite) |
| Texte DE/EN | `src/i18n/ui.ts` (`home.*`) |
| Exporte für die Einbettung | `src/sim-core/index.ts` (`KeyTargetLayer`, `defaultValues`, `sanitize`, `readTheme`, Typ `ParamValues`) |

## Abweichungen vom Prototyp (bewusst)

- **Kopfleiste:** Die bestehende Kopfleiste der Seite bleibt (Fächer, Katalog, Lehrkräfte, Sprache, Bundesland, Farbschema, Menü), mit Scitura-Logo und -Name. Der Pause-Knopf des Entwurfs sitzt dort, nur auf der Startseite. Unter 375 px Breite zeigt sie nur das Logo, der Name bleibt für Bildschirmleser lesbar.
- **Fußleiste:** die bestehende Fußleiste mit Scitura (Impressum, Datenschutz, Quellcode). Entwurfsnummer und Variantenvergleich entfallen.
- **Katalog:** die normalen Simulationskarten (`SimCard`) mit Fachfarben, Klassenstufe und Bundesland-Etiketten, in der ruhigeren Darstellung des Entwurfs. Anzahlen werden aus dem Lehrplan gezählt (heute 129), Klassenfilter aus `GRADE_BANDS`. Die Bundesland-Sortierung gilt auch hier.
- **Sprachwechsel und Links:** über das vorhandene Sprachrouting und `href()`; keine Query-Parameter, keine localhost-Verweise. Funktioniert mit Unterpfad (`BASE_PATH`).
- **Achterbahn:** Regler-Bereiche und Startwerte stammen aus der Simulation selbst; die Simulation wird erst geladen, wenn die Bühne in Sichtweite kommt. Die Zeichenfläche folgt dem Farbschema der Seite (im dunklen Schema dunkel, wie auf der Simulationsseite).
- **Dunkles Farbschema:** Einstieg und Katalog verwenden die dunklen Farben der Seite; der Achterbahn-Bereich bleibt dunkelblau.
- **Ersatzgrafik der Skulptur:** gleiche Form wie im Entwurf, ohne den Körnungsfilter; sie steht auch ohne JavaScript da.

## Prüfung

- `npm run verify`: Typprüfung, Tests und Build ohne Fehler, Warnungen oder Hinweise.
- Browser (Chromium, WebGL über SwiftShader), DE und EN bei 320, 360, 390, 700, 768, 1024, 1150, 1360 und 1600 px: kein waagerechtes Scrollen, keine Konsolenfehler.
- Abnahmepunkte aus `ABNAHME.md`, automatisch geprüft:
  - Titel, Favicon (PNG), Manifest, Themenfarbe, Logo
  - Fachlinks, Katalog vollständig, alle Vorschaubilder, Fachfilter (Physik, Chemie mit Hinweis), Suche (auch „Grosse Zahlen“ ohne ß), Klassenfilter, „Alle anzeigen“
  - Achterbahn: Laden beim Erreichen, Bahnform, Regler per Tastatur, Reibung, Masse, Zeitlupe, eigene Bahn mit Punktereglern, Losfahren, Pause, Zurücksetzen, Bühne per Tab erreichbar
  - Link zur vollständigen Simulation mit allen Einstellungen, auch unter `/Simulations/`
  - Pause-Knopf hält die Skulptur an und startet sie wieder; mit „reduzierter Bewegung“ startet die Seite pausiert, die Münze bleibt in der Skulptur, kein Autostart
  - Sprachwechsel; keine externen Anfragen; Unterseiten ohne Fehler und ohne Pause-Knopf
- Sichtprüfung hell und dunkel, 1360 und 390 px.

## Offene Einschränkungen

- Nicht geprüft: Safari, Firefox, echte Mobilgeräte (Laufzeit der Skulptur, Touch-Ziehen auf der Bühne). WebGL lief nur über SwiftShader.
- Logo und Icons sind Rasterbilder (PNG), keine Vektordatei. Das Favicon ist 64 px groß; in 16 px wirkt das Zeichen sehr fein.
- Der wörtliche Prompt der Logo-Studie liegt nicht vor (`LOGO-HERKUNFT.md`, `docs/BILDER.md`).
- `export-preview.cjs`, `build-preview.cjs`, `stage.ts/js` und `catalog.js` in diesem Ordner gehören zum Prototyp (alter Stand der Schnittstellen); sie sind von der Typprüfung ausgenommen (`tsconfig.json`).
