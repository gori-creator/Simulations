# Architektur

Die Website ist eine **statische Seite**, die mit [Astro](https://astro.build) gebaut wird. Es gibt keinen Server und keine Datenbank: Alles, was die Seite „weiß“, steckt im Quellcode (Lehrplan, Texte) oder in der Adresse (Einstellungen einer Simulation). Das macht das Hosting kostenlos und den Datenschutz einfach.

```
Lehrplan (curriculum/*.ts) ──► Routen (lib/routes.ts) ──► Seiten (pages/[lang]/…)
                                                            │
Lernmaterial (content/*.md) ────────────────────────────────┤
                                                            ▼
                               SimulationShell.astro (HTML-Gerüst)
                                                            │  Browser
                                                            ▼
                     sim-core/host.ts ──► registry ──► simulations/<fach>/<id>
                     (Regler, Teilen, URL, Animation)      (zeichnet mit Plot/Surface)
```

## 1. Lehrplan als Datenquelle

`src/curriculum/` beschreibt **alle** Inhalte: Fächer → Bereiche → Themen → Simulationen.

- Jede Simulation hat eine stabile `id`, Titel in beiden Sprachen, Klassenstufen (`grades`), KMK-Bezüge (`kmk`) und einen `status`:
  - `planned` – im Lehrplan vorgesehen, erscheint im Katalog als „In Planung“.
  - `ready` – umgesetzt; braucht zusätzlich `slug`, `summary` und `thumb` und bekommt eine eigene Seite.
- `curriculum/kmk.ts` enthält die Leitideen bzw. Kompetenzbereiche und Basiskonzepte der KMK-Bildungsstandards. Die Zuordnung ist ein erster Entwurf und sollte fachdidaktisch geprüft werden.
- Klassenstufen über 13 stehen für die Universität.
- Innerhalb eines Bereichs sind Themen und Simulationen nach Klassenstufe sortiert (ein Test prüft das).

**Länder-Lehrpläne** (`src/curriculum/lehrplaene/`) ergänzen die Gliederung nach Thema um eine Gliederung nach Jahrgangsstufe. Aktuell hinterlegt: Mathematik am bayerischen Gymnasium (LehrplanPLUS, Jgst. 5–13). Jeder Lernbereich hat Nummer und Überschrift wie im Lehrplan, eine Kurzbeschreibung in eigenen Worten und die IDs der passenden Simulationen. Daraus entstehen die Seiten „Nach Jahrgangsstufe“ (`/de/mathematik/bayern-gymnasium/jahrgangsstufe-7/`) und der Lehrplanbezug auf jeder Simulationsseite. Weitere Bundesländer oder Schularten werden als zusätzliche Datei ergänzt.

Übersichtsseiten, Katalog, Fortschrittsbalken und Navigation werden vollständig aus diesen Daten erzeugt.

## 2. Routen und Mehrsprachigkeit

- Alle Adressen beginnen mit der Sprache: `/de/…` und `/en/…`. `/` leitet zur gemerkten bzw. Browsersprache weiter.
- `lib/routes.ts` beschreibt Seiten als `Route` (z. B. `{ kind: 'simulation', id: 'einheitskreis' }`) statt als festen Pfad. Daraus entstehen die sprachabhängigen Adressen (`/de/mathematik/funktionen/einheitskreis/` ↔ `/en/mathematics/functions/unit-circle/`). So findet der Sprachumschalter immer die passende Übersetzung, und `hreflang`-Links stimmen.
- `pages/[lang]/[...slug].astro` erzeugt alle Unterseiten aus `allRoutes()` und reicht sie an die passende Ansicht in `views/` weiter.
- UI-Texte stehen in `i18n/ui.ts`. Deutsch ist die Referenz: fehlt ein Schlüssel im Englischen, meldet TypeScript einen Fehler.
- Fehlt englisches Lernmaterial, wird das deutsche mit Hinweis angezeigt.
- Alle internen Links laufen über `href()`/`withBase()`, damit die Seite auch unter einem Unterpfad (GitHub Pages) funktioniert.

## 3. Simulations-Kern (`src/sim-core`)

Der Kern trennt **was eine Simulation zeigt** (in `simulations/…`) von **allem Drumherum** (Host). Eine Simulation ist ein Objekt aus `defineSimulation({...})`:

| Teil | Aufgabe |
| --- | --- |
| `params` | Parameter (Zahl, Schalter, Auswahl) mit Bereich, Schrittweite, Standardwert, Beschriftung, optional `group` und `visibleIf` |
| `readouts` | Ergebnisfelder; `spoiler: true` wird im Aufgabenmodus verdeckt |
| `presets` | Beispiel-Einstellungen |
| `animated`, `layout`, `dragHint`, `strings` | Abspielen-Knopf, Seitenverhältnis (auch eigenes für schmale Bildschirme), Hinweistext, eigene Texte |
| `actions` | Knöpfe unter der Bühne (z. B. „Würfeln“, „Wechseln“), optional mit `visibleIf`; Beschriftung/Aktivierung zur Laufzeit über `ctx.setAction()` |
| `images` | optionale Bilder aus `src/assets/sims/<id>/` (Liste in `docs/BILDER.md`); fehlt ein Bild, zeichnet die Simulation eine Ersatzgrafik |
| `mount(ctx)` | baut die Simulation auf und gibt `{ update, render, tick?, action?, resetTime?, resetView?, destroy? }` zurück |

**Host (`host.ts`)** – erzeugt aus den Definitionen automatisch Regler (`controls.ts`), Ergebnisliste, Beispiel-Knöpfe und kümmert sich um:

- **Zustand in der Adresse** (`url-state.ts`): nur abweichende Werte, z. B. `?m=2&b=-1`. Steuerparameter: `_lock=1` (Regler gesperrt), `_hide=1` (Ergebnisse verdeckt). Werte aus Links werden geprüft, gerundet und begrenzt.
- **Teilen**: Link + QR-Code (`qr.ts`, wird erst bei Bedarf geladen), großer QR-Code für den Beamer.
- **Animation**: `Clock` + `requestAnimationFrame`; `tick(dt)` bekommt Sekunden. Für Physik gibt es `FixedStepper` (feste Zeitschritte) und `rk4` (Runge-Kutta) in `clock.ts`/`numeric.ts`.
- **Vollbild**, **Bildexport** (`export.ts`), **Hell/Dunkel** (`theme.ts` liest CSS-Variablen).
- **Links im Lernmaterial** wie `[Beispiel](?a=2)` laden die Einstellung ohne Neuladen der Seite.

Änderungen über `ctx.set()` werden gesammelt (Microtask), dann ruft der Host einmal `update(changed, source)` auf, aktualisiert Regler und Adresse und zeichnet im nächsten Frame neu. `source` sagt, woher die Änderung kommt (`init`, `input`, `replace`, `sim`), damit Simulationen abgeleitete Werte nur bei Bedienung von Hand umrechnen.

**Zeichnen** – `Surface` (Canvas, scharf auf hochauflösenden Displays, Größenänderungen, Zeiger-Ereignisse) und `Plot` (Koordinatensystem):

- Gitter, Achsen (auch in Vielfachen von π oder in Grad), Funktionsgraphen mit Erkennung von Sprüngen, Geraden, Strecken, Pfeile, Punkte, Kreise, Bögen, Flächen, Texte.
- Zoomen (Strg + Mausrad, Pinch, Schaltflächen) und Verschieben.
- **Ziehbare Punkte** über `plot.addHandle({ get, set, axis?, enabled? })`.
- Mehrere Koordinatensysteme auf einer Fläche (`region`), z. B. Einheitskreis + Graph.
- Diagramme mit festem Bereich und Platz für Achsenzahlen: `plot.setRangePadded(x, y, { left, bottom, … })`.
- Gezeichnet wird im „Immediate Mode“: `render()` zeichnet jedes Mal alles neu.

**Spiele und Experimente ohne Koordinatensystem** – `TapTarget` (antippbare Bereiche, z. B. Türen), `Tween`/`ease` (Übergänge wie Aufklappen oder Umlegen; berücksichtigen „reduzierte Bewegung“), Zeichenhilfen in `draw.ts` (`roundRect`, `drawImageFit`, `softShadow`, `text`, `withAlpha`) und `ImageStore` (lädt die optionalen Bilder, `ctx.images.get(key)` liefert `null`, solange ein Bild fehlt).

**3D-Ansichten** – `view3d.ts` (nur Canvas 2D, kein WebGL). Weltkoordinaten wie im Unterricht: x₁ schräg nach vorn, x₂ nach rechts, x₃ nach oben.

- `View3D` ist wie `Plot` ein Zeigerziel der `Surface` (eigener Bereich über `region`): Drehen per Ziehen (Azimut/Elevation, begrenzt, mit Nachlaufen), Zoom (Pinch, Strg+Mausrad, Schaltflächen), Antippen (`onTap` + `pick()` liefert die `id` der obersten Fläche) und ziehbare 3D-Punkte (`addHandle` in einer Ebene oder entlang einer Geraden). Drehen ist auch bei gesperrten Reglern erlaubt.
- Gezeichnet wird zwischen `begin()` und `end()`: `face`, `mesh` (Polygonnetz mit sichtbaren und gestrichelten verdeckten Kanten), `segment`/`polyline`/`arrow`, `point`, `label`, `axes` (Pfeile, Teilstriche, x₁/x₂/x₃), `grid`, `shadow`. Alles wird nach Tiefe sortiert (Maleralgorithmus); Ebenen `back`/`scene`/`front` steuern Ausnahmen. Flächen werden mit einfacher Beleuchtung (Lambert) aus der Grundfarbe aufgehellt bzw. abgedunkelt.
- `Camera3D` rechnet ohne DOM (perspektivisch oder orthografisch, Welt → Bildschirm, Sichtstrahl), `mesh3d` erzeugt Quader, Prisma, Pyramide, Zylinder, Kegel und Kugel, `foldNet` faltet Körpernetze, `vec3` enthält Vektorhilfen.

**Formatierung** – `format.ts` (Dezimalkomma, echtes Minuszeichen, Vielfache von π, Punkte als `(1,5 | 2)` bzw. `(1.5, 2)`) und `formula.ts` (Terme wie `0,5x − 2` korrekt zusammensetzen).

## 4. Lernmaterial und Formeln

Markdown in `src/content/simulations/<sprache>/<id>.md`. Formeln werden mit `$…$` bzw. `$$…$$` geschrieben und **beim Build** mit KaTeX gesetzt (`tooling/katex-markdown.mjs`) – der Browser lädt dafür kein JavaScript. Lösungen stehen in `<details>`-Blöcken.

## 5. Offline-Fähigkeit

`tooling/service-worker.mjs` erzeugt nach dem Build eine `sw.js`, die alle Seiten und Dateien vorab speichert. Seiten werden „zuerst Netzwerk, sonst Cache“ geladen (Updates kommen sofort an), Dateien „zuerst Cache“. Der Cache-Name enthält einen Hash über alle Dateien, sodass alte Versionen automatisch entfernt werden.

## 6. Gestaltung

`src/styles/global.css` enthält das Design-System als CSS-Variablen (Farben für hell/dunkel, Fachfarben, Abstände, Bedienelemente). Simulationen verwenden **nur** die Variablen `--plot-*` und `--series-1 … --series-6` über `ctx.theme`, damit sie in beiden Farbschemata gut aussehen. Es werden keine externen Schriftarten geladen.

## 7. Qualitätssicherung

- `npm run check` – strenge Typprüfung.
- `npm test` – Unit-Tests für Kernfunktionen und Modelle sowie **Konsistenztests**: eindeutige IDs, Texte in allen Sprachen, gültige KMK-Bezüge, jede fertige Simulation ist registriert und hat Lernmaterial, gültige Beispiele, eindeutige Adressen, Links im Lernmaterial setzen nur gültige Werte, alle Bilder stehen in `docs/BILDER.md`.
- GitHub Actions: `ci.yml` prüft Branches und Pull Requests, `deploy.yml` veröffentlicht `main`.
