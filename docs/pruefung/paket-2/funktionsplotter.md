# Prüfprotokoll: `funktionsplotter` – Funktionsplotter mit eigenen Termen

Prüfer: Paket 2 · Datum: 25.10.2026 · Stand: Commit `e7b3313` · Bogen: `scratchpad/pruef/funktionsplotter/funktionsplotter.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Voreinstellung: Nullstellen von $x^2 − 2$: $x = ±\sqrt{2} ≈ ±1{,}41$ ✓; Tiefpunkt $(0 \mid −2)$ ✓; Spur $f(1) = 1 − 2 = −1$, $g(1) = 2 \sin 1 ≈ 2 · 0{,}841 = 1{,}68$ ✓.
  2. $x^3 − 2x − 1$: $(−1)^3 + 2 − 1 = 0$, Rest $x^2 − x − 1 = 0$ → $x = \frac{1 ± \sqrt 5}{2} ≈ 1{,}62$ bzw. $−0{,}62$ → Anzeige x = −1; x ≈ −0,62; x ≈ 1,62 ✓.
  3. Schnitt $x^3 − 3x$ mit $9x − 16$: $x^3 − 12x + 16 = (x − 2)^2(x + 4)$ → $(−4 \mid −52)$ und Berührpunkt $(2 \mid 2)$ ✓; Nullstelle von $9x − 16$: $16/9 ≈ 1{,}78$ ✓; Steigung $f'(2) = 3 · 4 − 3 = 9$ ✓.
  4. $(x + 2)/(x − 2)$ und $(x^2 − 4)/(x − 2)$: Loch $(2 \mid 4)$, Polstelle $x = 2$, Schnittpunkte aus $x + 2 = \frac{x+2}{x-2}$ → $x = −2$ oder $x − 2 = 1$ → $(−2 \mid 0)$, $(3 \mid 5)$ ✓.
  5. $e^{x^2}$ bei $x = 25$: $625 / \ln 10 ≈ 271{,}43$ → $10^{0{,}43} ≈ 2{,}72$ → „2,72 · 10²⁷¹“ ✓ (nach Korrektur).
- **Term-Parser (gründlich geprüft):** eigener Zerleger/Parser ohne `eval`, `Function` oder Objektzugriffe; `alert(1)`, `constructor`, `Math.PI` → „kenne ich nicht“, `__proto__`, `;`, Backtick, Apostroph → „Zeichen kann ich nicht lesen“ ✓. Dezimalkomma und -punkt (`2,5x`, `,5x`), `2,5,3` und `1e5` mit verständlicher Meldung ✓. Implizites Mal (`2x`, `x(x+1)`, `2πx`, `2 sin x cos x`) ✓. Potenzen rechtsassoziativ, `−x^2 = −(x²)` ($x = 3$: −9), `2^-x`, `x⁻¹`, `x²` ✓. `2^3x` = 2³·x und `1/2x` = ½·x (wie dokumentiert, links nach rechts). Funktionen mit/ohne Klammern (`sin x^2` = sin(x²), `sin(x)^2`, `sin²x`), `log_2`, `log₂`, `log_0,5` ✓. Fehler mit Stelle: `2x+`, `sinus(x)` (Vorschlag „sin“), `x2` (mehrdeutig), Klammerfehler, `=`, `y` ✓. Länge 60 Zeichen, 80 Tokens, Tiefe 24 begrenzt.
- **Sonderfälle:** `1/x` und `x/0`, `0/0` bei Division durch 0 → nicht definiert ✓; `sqrt(-1)`, `ln 0`, `x^(1/3)` für $x<0$ → nicht definiert ✓; Polstellen ohne senkrechte Verbindungslinie, `tan` mit Polstellen bei $±π/2, ±3π/2$ ✓. **Fehler gefunden:** (a) Überlauf (z. B. $e^{x^2}$ bei $x = 27$, `exp(1000)`) wurde als „nicht definiert“ gemeldet; (b) sehr große Werte (2ˣ bei $x = 45$: „35184372088832,03“ mit Rundungsrauschen) sprengten die Wertetabelle (Spalte g abgeschnitten, Kopf fehlte); (c) bei sehr steilen stetigen Graphen ($e^{x^2}$ im Standardausschnitt) meldete die Liste „Polstellen und Definitionslücken“ rund 30 falsche „Sprungstellen“ (Rechengenauigkeit). Alle drei behoben (siehe 5.).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** `−` überall, Dezimalkomma in DE, Punkt in EN; ≈ bei gerundeten Werten, = bei exakten ✓.
- **Begriffe wie im Unterricht:** Nullstelle, Berührstelle, Hoch-/Tiefpunkt, Schnittpunkt, Polstelle, Definitionslücke, Rand der Definitionsmenge, Sprungstelle ✓.
- **Neue/ergänzte Tests:** Block „Prüfrunde“ in `tests/funktionsplotter.test.ts`: Vorzeichen/Potenzen/implizites Mal, mehrdeutige Eingaben, keine Code-Ausführung, NaN vs. Überlauf (`compileRaw`), keine falschen Sprünge bei $e^{x^2}$ (vorher 34), echte Sprünge bleiben.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 −1; −0,62; 1,62 ✓. A2 $x = 1$ ($2^1 = 2 = 3 − 1$) ✓. A3 `1/2x` Gerade, `1/(2x)` Hyperbel, Schnitt $(±1 \mid ±0{,}5)$ ✓. A4 Scheitel $(1 \mid a − 1)$, $D = 4 − 4a$, Grenzfall $a = 1$ Berührstelle ✓. A5 Loch $(2 \mid 4)$, Pol $x = 2$ ✓. A6 $f'(2) = 9$, $t(x) = 9x − 16$, H(−1 | 2), T(1 | −2) ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle Ausprobier- und Lösungslinks sowie Fehlerbeispiele geladen (Screenshots in `scratchpad/pruef/funktionsplotter/shots/`) – in Ordnung.
- **Texte vereinfacht/korrigiert:** EN war stark gekürzt (6 statt 9 Ausprobier-Punkte, 3 statt 6 Aufgaben, kürzere Tabelle, Stolpersteine als Behauptungen ohne Auflösung) → vollständig an DE angeglichen. DE und EN: Hinweis zu Zehnerpotenz-Schreibweise und „zu groß“ ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** vollständig, Karten (Terme, Spur, Tabelle) überall sichtbar ✓.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine im Standardzustand; Wertetabelle bei großen Werten vorher abgeschnitten (behoben). Auf dem Handy reicht ein langer Spurwert wie „P(27 | 134217728)“ knapp bis an den Kartenrand (noch lesbar).
- **Touch (Ziehen) und Maus:** Ziehen der Spur am Graphen, Antippen von Graphen und Marken, Einrasten an besonderen Punkten ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (kein Überblenden der Graphen und des Ausschnitts).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** alle Eingaben und Regler über die Einstellungen erreichbar ✓.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Elemente ohne Namen; Zeichenfläche beschrieben; Terme, Spur, besondere Punkte und Wertetabelle zusätzlich als Text ✓.
- **Farben:** Graphen aus `ctx.theme.series` (f blau, g grün, h lila), zusätzlich durch Namensplaketten f/g/h unterschieden; Fehler rot mit Wellenlinie und Text ✓. Feste Werte für Kartenflächen (`#ffffff`, `#151c27` …) – siehe „Für den Kern“.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/funktionsplotter/model.ts` | `locateJump`: Bei erreichter Rechengenauigkeit gilt ein im Verhältnis zu den Werten winziger Unterschied als stetig (keine falschen Sprungstellen bei sehr steilen Graphen). Neue Funktion `compileRaw` (±Infinity bei Überlauf statt NaN). |
| `src/simulations/mathematik/funktionsplotter/index.ts` | Werte ab 10⁹ als Zehnerpotenz („1,07 · 10⁹“, ≈/= passend); Überlauf als „Der Betrag von g(27) ist zu groß für den Rechner.“ bzw. „zu groß“ in der Tabelle statt „nicht definiert“ (Spur, Karte, Tabelle, Ergebnisse). |
| `tests/funktionsplotter.test.ts` | Tests der Prüfrunde ergänzt (siehe 1.). |
| `src/content/simulations/en/funktionsplotter.md` | Inhaltlich an DE angeglichen. |
| `src/content/simulations/de/funktionsplotter.md` | Satz zu großen Werten ergänzt. |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei anderen Simulationen: Theme ohne Farben für Kartenflächen/Ränder/Schrift auf farbigen Flächen; hier fest `#ffffff`, `#151c27`, `#141b26`, `#273142`, `#e3e8ef`, `#253041`, `#edf0f4`. Vorschlag `surface`/`onSeries` im Theme.
- In der Ergebnisleiste läuft auf dem Handy eine lange Spurzeile (mehrere Funktionen) über den rechten Rand hinaus statt umzubrechen (Ergebnis-Kacheln des Kerns).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Entschieden (Leitung):** $0^0$ wie im `termbaum` als nicht definiert. Umgesetzt in `power()`: nur genau Basis 0 und Exponent 0, also `x^0` = 1 für $x \neq 0$, `0^x` = 0 für $x > 0$. `x^0` zeigt jetzt ein Loch bei $(0 \mid 1)$. Nullstellen, Extrema und Schnittpunkte der Voreinstellung und der Beispiele sind unverändert (Test). Hinweis im Lernmaterial DE und EN ergänzt.
- **Entschieden (Leitung):** Vorzeichen direkt nach √ erlaubt: `√-4` wie √(−4) → nicht definiert, `√-x` = √(−x), `√-x^2` = √(−x²). Bestehende Fälle (`√x`, `√4x`, `2√x`, `√(x + 7)`) unverändert, `√`, `√-` und `√*x` bleiben Fehler (Test).

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3047/3047 grün, Build ok.
