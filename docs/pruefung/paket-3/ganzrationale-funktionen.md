# Prüfprotokoll: `ganzrationale-funktionen` – Ganzrationale Funktionen: Nullstellen, Vielfachheit und Randverhalten

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `e2678ca` · Bogen: `/tmp/boegen3/ganzrationale-funktionen.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startzustand 0,5 · (x + 2)(x − 0,5)(x − 3): (x + 2)(x − 0,5) = x² + 1,5x − 1; mal (x − 3) = x³ − 1,5x² − 5,5x + 3; mal 0,5 = 0,5x³ − 0,75x² − 2,75x + 1,5 ✓ (Karte, „Schritt für Schritt“ mit genau diesen Zwischenzeilen und Ergebnis). f(0) = 0,5 · 2 · (−0,5) · (−3) = 1,5 ✓. Fernansicht: f(100)/(0,5 · 100³) = 1,02 · 0,995 · 0,97 = 0,984453 → Anzeige „≈ 0,9845“ ✓.
  2. Beispiel „Grad 9“, 0,1 · (x + 2)³(x − 1)⁴(x − 3)²: f(0) = 0,1 · 8 · 1 · 9 = 7,2 ✓; Näherung an x₀ = 1: c = 0,1 · 3³ · (−2)² = 10,8 → „f(x) ≈ 10,8 · (x − 1)⁴“ ✓; an x₀ = 3: c = 0,1 · 5³ · 2⁴ = 200 ✓; an −2: c = 0,1 · (−3)⁴ · (−5)² = 202,5 ✓. Vorzeichen − | + | + | + (Wechsel nur bei −2) ✓. Fernansicht W-Form 0,2 · (x + 3)x²(x − 3): f(100)/(0,2 · 100⁴) = 1,03 · 0,97 = 0,9991 ✓.
  3. Aufgabe „Welcher Term passt?“, −0,4 · (x + 1)²(x − 2,5): (x² + 2x + 1)(x − 2,5) = x³ − 0,5x² − 4x − 2,5; mal −0,4 = −0,4x³ + 0,2x² + 1,6x + 1 ✓ (Ergebnis nach „Term aufdecken“). Grad 12, −3 · (x + 4)⁴x⁴(x − 4)⁴: führender Koeffizient −3, Absolutglied 0, Vorzeichen überall − ✓; Koeffizient von x⁴: −3 · 4⁴ · 4⁴ = −196 608 ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): a = 0 wird beim Regler auf 0,1 gesetzt, beim Ziehen am Griff auf ±0,1 ✓. Nullstellen fallen zusammen (Beispiel „Alle Nullstellen fallen zusammen“: 0,5 · (x − 1)⁴) ✓. Grad 12 mit a = −3: Werte bis über 10⁶, Achse mit Tausender-Abstand ✓. Grad 1 (z = 1, m = 1) und f(x) = x³ ✓. Keine Division durch 0 (`leadingRatio` nur bei x = 100). Über einen Link mit `a=0` (nicht über den Regler) rechnet die Simulation mit 0,1, der Regler zeigt 0 – harmlos, nicht geändert (Ableitung nur bei `source === 'input'`).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und `−` über `fmt` ✓. „≈“ beim Ablesewert nur, wenn er nicht exakt ist (`isExact`) ✓; Näherungen und Verhältnis stets „≈“ ✓; Normalform exakt (Brüche, wenn nicht abbrechend) ✓. **Behoben:** Große Koeffizienten der Normalform standen ohne Tausender-Abstand („49152x⁶ − 196608x⁴“, an der y-Achse dagegen „−1 000 000“) → ab fünf Stellen mit Abstand („49 152x⁶ − 196 608x⁴“).
- **Begriffe wie im Unterricht:** Linearfaktorform, Normalform, Vielfachheit, Schnitt-/Berühr-/Terrassenpunkt, Vorzeichentabelle, Randverhalten, Leitkoeffizient – passend.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/ganzrationale-funktionen.test.ts` (jetzt 26): Aufgabe 1 (f(0) = 1,5, Randverhalten, Vorzeichen + | − | + | −), Aufgabe 5 (f(0,1) = −0,01798, c = −1,8), Ausprobieren 7 Grad 12 (überall negativ) und Grad 9 (negativ nur links von −2, f(0) = 7,2).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 Grad 3, f(0) = −0,4 · 3 · 0,5 · (−2,5) = 1,5 ✓; A2 f(1) = a · 9 · (−1) = −4,5 ⇒ a = 0,5, Normalform 0,5x³ + x² − 2x − 4 ✓; A3 (x − 1)³(x + 3) = x⁴ − 6x² + 8x − 3, mal 0,3 ✓; A4 Tabelle + | − | − | +, f(1) = 0,2 · 4 · 1 · (−2) = −1,6 ✓; A5 f(0,1) = 0,2 · 3,1 · 0,01 · (−2,9) = −0,01798 ✓; A6 ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 9 Beispiele (simshot, 1440 px hell/dunkel) und alle Links im Lernmaterial (u. a. vierfache Nullstelle, Grad 12, Aufgaben mit `info=0`) ✓. **Behoben:** Im Aufgabenmodus (`info=0`, Beispiel „Aufgabe: Welcher Term passt?“, Aufgabe 2) standen die Regler für a, Nullstellen und Vielfachheiten mit ihren Werten sichtbar in den Einstellungen – die Lösung „Term bestimmen“ war direkt ablesbar. Jetzt sind diese Regler bei ausgeschaltetem „Term und Eigenschaften zeigen“ ausgeblendet („Term aufdecken“ bringt sie zurück; Hilfetext ergänzt). Aufgabe 1 lädt jetzt mit `ends=0` (die Randverhaltens-Pfeile verrieten das gesuchte Randverhalten), Aufgabe 4 mit `sign=0&ends=0` (die gefärbten Vorzeichenbereiche markierten genau „wo ist f(x) < 0“).
- **Texte vereinfacht/korrigiert:** EN war stark gekürzt (3 statt 6 Aufgaben, Ausprobieren nur Stichworte, keine Tabelle, Lösungen ohne Rechenweg) → vollständig auf den Stand der DE-Fassung gebracht (Dezimalpunkt). Hilfetext „c · (x − x₀)^m“ zeigte das Zeichen „^“ → „(x − x₀)ᵐ“. DE-Texte sonst verständlich, Sie-/Du-Form passend.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Alle Ansichten vollständig, Karten am Tablet vorhanden (Randverhalten am iPad in Kurzform ohne Skizzen, gewollt). iPad hoch: Bühne breit und flach, Karten rechts eng, aber lesbar. Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** In der Fernansicht lag der Pfeil „f(x) → +∞“ samt Schild unter dem Schild „f(100)/(a · 100ⁿ) ≈ …“ → das Verhältnis-Schild steht jetzt in der rechten Ecke, durch die der Graph das Bild nicht verlässt, und die Pfeil-Beschriftung weicht ihm aus.
- **Touch (Ziehen) und Maus:** Perlen ziehen (auch Verschmelzen), Antippen erhöht die Vielfachheit, Griff für a ziehen – mit der Maus geprüft ✓; Touch-Trefferflächen 24 px, Ablesen per Finger (Lupe/Wert) im Code nachvollzogen.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓. **Behoben:** Beim Verschmelzen von Perlen (Ziehen oder Beispiel „Alle Nullstellen fallen zusammen“) stieg die Meldung „verschmolzen: 1 + 2 + 1 = 4“ auf und blendete 2,2 s lang ein und aus. Bei reduzierter Bewegung entfällt sie jetzt; der Hinweis steht in der Karte „Funktionsterm“. Geprüft (Kontext `reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s) nach: Start, „Blick aus der Ferne“ hin und zurück, „Ausmultiplizieren“, Beispiele Doppelt/Verschmolzen/Grad 9/Aufgabe, „Term aufdecken“, Perle antippen, Perlen verschmelzen, Griff a ziehen, Regler z, Lupe, Term aus – alle 15 Fälle still.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles auch über Regler und Knöpfe bedienbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Elemente; Alt-Text beschreibt Graph, Perlen, Ebenen und Karten; Ergebnisse als Text.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Kartenhintergrund und -rand sowie Schild- und Legendenhintergrund waren feste Hex-/rgba-Werte → jetzt aus `theme.bg`/`theme.text`/`theme.grid`. Fest bleiben nur Schatten und Glanzlichter (Schwarz/Weiß). Vorzeichen sind nie nur über Rot/Grün erkennbar: Flächen liegen über bzw. unter der x-Achse, Tabelle mit „+“/„−“, Pfeile mit Richtung und Beschriftung „f(x) → ±∞“.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/ganzrationale-funktionen/index.ts` | Regler a, z, xᵢ, mᵢ im Aufgabenmodus ausgeblendet; Hilfetext zu `info` |
| `src/simulations/mathematik/ganzrationale-funktionen/index.ts` | Reduzierte Bewegung: keine aufsteigende Verschmelzungs-Meldung |
| `src/simulations/mathematik/ganzrationale-funktionen/index.ts` | Theme-Farben für Karten, Schilder und Legende |
| `src/simulations/mathematik/ganzrationale-funktionen/index.ts` | Fernansicht: Verhältnis-Schild nicht mehr auf dem Randverhaltens-Pfeil |
| `src/simulations/mathematik/ganzrationale-funktionen/index.ts` | Tausender-Abstand in der Normalform; Hilfetext „(x − x₀)ᵐ“ |
| `src/content/simulations/de/ganzrationale-funktionen.md` | Aufgabenlinks 1 und 4 ohne verratende Pfeile/Färbung |
| `src/content/simulations/en/ganzrationale-funktionen.md` | auf den Stand der DE-Fassung gebracht |
| `tests/ganzrationale-funktionen.test.ts` | 4 neue Tests (Aufgaben 1 und 5, Grad 9 und 12) |

## 6. Für den Kern (nicht selbst ändern)
- Der Prüfbogen misst „reduzierte Bewegung“ nur im Startzustand; der Fehler hier zeigte sich erst nach Verschmelzen (Ziehen bzw. Beispiel).
- `_hide=1` verdeckt nur die Ergebnisse, nicht die Regler. Bei Aufgaben „Term bestimmen“ verraten die Regler die Lösung; hier über `visibleIf` gelöst. Ein allgemeiner Kern-Weg (z. B. Regler mit `spoiler: true`, die `_hide` mit verdeckt) wäre für andere Simulationen nützlich.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Lehrplanbezug „Jahrgangsstufe 10, Ganzrationale Funktionen“ und die Vorzeichentabelle mit einer Zeile pro Faktor sind im Lernmaterial bereits als „bitte prüfen“ gekennzeichnet – unverändert.
- Regler im Aufgabenmodus ausgeblendet: Wer im Unterricht Graphen für den Partner einstellen will, stellt jetzt erst mit „Term … zeigen“ ein und schaltet dann aus (so steht es auch in den Unterrichtsideen). Bitte bestätigen, dass das gewünscht ist.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3063/3063 grün (133 Dateien), Build ok.
