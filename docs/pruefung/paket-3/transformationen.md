# Prüfprotokoll: `transformationen` – Graphen verschieben, strecken und spiegeln

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `e798516` (vor der Prüfung) · Bogen: `/tmp/boegen3/transformationen.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startbild g(x) = 2 · (x − 1)² − 2 (a = 2, b = 1, c = 1, d = −2): Bildpunkt (x/b + c | a·y + d): (2 | 4) ↦ (2/1 + 1 | 2 · 4 − 2) = (3 | 6), (−2 | 4) ↦ (−1 | 6), (0 | 0) ↦ (1 | −2) = Scheitel. Nullstellen: (x − 1)² = 1 ⇒ x = 0; x = 2. g(0) = 2 · 1 − 2 = 0. W_g = [−2; ∞[. Anzeige Karte und Ergebnisse identisch ✓
  2. Wurzel a = 1, b = −1, c = 2, d = 0: (4 | 2) ↦ (4/(−1) + 2 | 2) = (−2 | 2); −(x − 2) ≥ 0 ⇔ x ≤ 2 ⇒ D_g = ]−∞; 2], W_g = [0; ∞[; g(−2) = √4 = 2; Nullstelle x = 2. Term „√(−(x − 2)) = √(2 − x)“ ✓
  3. Exponentialfunktion a = −1, b = 1, c = 1, d = 3: (−1 | 0,5) ↦ (0 | −0,5 + 3) = (0 | 2,5); Bild von (0 | 1): (1 | 2); W_g = ]−∞; 3[ (Asymptote y = 3 gehört nicht dazu); Nullstelle 2^(x − 1) = 3 ⇒ x = 1 + log₂ 3 = 1 + 1,58496 = 2,585 ⇒ Anzeige „x ≈ 2,58“ ✓
  4. Hyperbel g(x) = 2/(x + 1) + 1: (1 | 1) ↦ (0 | 3), (2 | 0,5) ↦ (1 | 2); Asymptoten x = −1, y = 1; Nullstelle 2/(x + 1) = −1 ⇒ x = −3; D = ℝ \ {−1}, W = ℝ \ {1} ✓
  5. Sinus a = 2, b = 2, d = 1: Periode 2π/2 = π, W = [1 − 2; 1 + 2] = [−1; 3]; Nullstellen in [0; π[: sin(2x) = −1/2 ⇒ 2x = 7π/6 bzw. 11π/6 ⇒ x = 1,833 bzw. 2,880 ⇒ „x ≈ 1,83; x ≈ 2,88 (in einer Periode ab c)“ ✓; (π/2 | 1) ↦ (π/4 | 3) ✓
  6. Vertauschte Reihenfolge f = x³, b = 3, c = 1: f(x − 1) gestaucht ⇒ f(3x − 1) = f(3(x − 1/3)), Verschiebung c/b = 0,333 ⇒ jetzt „c/b ≈ 0,33 statt c = 1“ (vorher „= 0,33“) ✓
- **Ziehen:** Anker von (1 | −2) um +67 px / −66 px (33,6 px je Einheit, iPad quer) ⇒ c = 3, d = 0, Term „2 · (x − 3)²“ ✓. Formpunkt von (2 | 0) um 4 Einheiten nach unten ⇒ a = (−4 − (−2))/1 = −2, b = 1/(2 − 1) = 1 ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): b = 0 wird übersprungen (±0,1, Hinweis in der Karte), keine Division durch 0. a = 0: „g(x) = −2“, W = {−2}, Hinweis „konstante Funktion“ ✓. b < 0: Wurzel-D wechselt die Seite, Spiegelung an der y-Achse ✓. a < 0: W nach unten offen ✓. Hyperbel b < 0 und Wurzel mit a, b < 0 neu getestet. Reihenfolge der Schritte b → c → a → d stimmt mit g(x) = a · f(b(x − c)) + d überein; Vergleich „erst verschieben“ ergibt korrekt a · f(bx − c) + d.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma, echtes Minus, DE-Intervalle „]−∞; 2]“, EN „(−∞, 2]“ ✓. **Behoben:** gerundete Werte standen mit „=“: 1/b (Streckpfeil), c/b (Schrittkarte, Bild, Hinweis), b³ und 1/b in den Hinweisen, die gleichwertige Schreibweise (z. B. „≈ 0,33/(x − 1)“ bei b = 3), die Periode 2π/|b| ohne π-Bruch und das Ergebnis der Punkt-Rechnung beim Darüberfahren → jetzt „≈“, wenn nicht exakt.
- **Begriffe wie im Unterricht:** Definitionsmenge/Wertemenge, Scheitel, Knickpunkt, Symmetriezentrum, Asymptote, Streckung/Stauchung ✓.
- **Neue/ergänzte Tests:** 6 neue Tests in `tests/transformationen.test.ts`: Wurzel mit a, b < 0 (D, W, Randpunkt, Nullstelle −3,25), Exponential-W offen, Hyperbel mit b < 0 (Nullstelle 1,5), Bildpunkt mit b = 3 und a < 0, (2x − 4)² ist um 2 verschoben, Sinus-Nullstellen 7π/12 und 11π/12.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 Knick (−2 | 3), 2 nach rechts ⇒ 1 nach unten ⇒ a = −0,5 ✓. A2 (2 | 4) ↦ (1 | 5), g(1) = 0,5 · 4 + 3 = 5 ✓. A3 (2x − 4)² = (2(x − 2))² ⇒ um 2 nach rechts ✓. A4 b = 2π/π = 2, W = [−1; 3] ✓. A5 D = ]−∞; 2], g(−2) = 2 ✓. A6 s. o. ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 7 Beispiele und alle Links aus „Ausprobieren“ und den Aufgaben (simshot, 1440/1024/768/360 px, hell/dunkel, DE/EN).
  - **Behoben:** Aufgabe 1 („Aufgabe laden“ mit `info=0`) und das Beispiel „Aufgabe: Welcher Term gehört zum Graphen?“ zeigten die Lösung in den Reglern (a = −0,5, c = −2, d = 3). Die Regler a, b, c, d sind im Aufgabenmodus jetzt ausgeblendet (wie bei `sinusfunktion`); „Term aufdecken“ blendet sie wieder ein. Außerdem spielte „Abspielen“ im Aufgabenmodus die Zwischenstufen f(bx), f(b(x − c)) … ab und verriet so die Parameter einzeln → dort jetzt ohne Wirkung.
- **Texte vereinfacht/korrigiert:**
  - DE/EN, Regler-Hilfen und Alt-Text: „grüner Ankerpunkt“, „roter Formpunkt“ (Rot/Grün, Farbe hängt vom Theme ab) → „runder Ankerpunkt (c | d)“, „rautenförmiger Formpunkt“ (die Griffe sind Kreis bzw. Raute).
  - DE: Periode „2π/b“ → „2π/|b|“; Idee „Term erraten“ nennt die ausgeblendeten Regler; Hinweis zur reduzierten Bewegung unter „Modell“.
  - EN war deutlich kürzer (Tabelle der Schritte, „Warum zuerst b“, „Gut zu wissen“, Ausprobieren 5–7, Aufgaben 2 „Ein Punkt wandert“, 5 „Gespiegelte Wurzel“ und 6 b, Lösungswege, Einsatz/Lehrplan, Stolpersteine als Liste fehlten) → auf den Stand der DE-Fassung gebracht (Dezimalpunkt, EN-Intervalle).
- **Lehrplan:** „Jahrgangsstufe 11, Lernbereich 1 Spezielle Eigenschaften von Funktionen“ stimmt mit `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` überein.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Handy: Bild, Zeitleiste, vier Karten untereinander ✓. Laptop/1920/Beamer: Karten rechts, vollständig ✓. **Behoben:** Am iPad hoch (768) und quer (1024) fehlte die Karte „Eigenschaften von g“ (und teils Zeilen der Schrittkarte). Kurzfassungen sind jetzt knapper (Funktionsterm ohne allgemeine Form, Schrittkarte ohne f-Zeile), und reicht der Platz dann noch nicht, wird die Kartenspalte leicht verkleinert (höchstens auf 80 %, am iPad ca. 90–97 %). Alle vier Karten sind bei allen sieben Grundfunktionen sichtbar (geprüft bei 1024 px: Parabel, Wurzel, Sinus, Hyperbel, Exponentialfunktion, Vergleich, Aufgabe). Dunkelmodus gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf, keine Konsolenfehler (nur 403 bei Schriften über den Symlink). Kleinigkeit: Bei 1/x mit b = 3 verdeckt das Stufenschild oben links teilweise die Asymptotenbeschriftung „x = 1“ während der Schrittfolge.
- **Touch (Ziehen) und Maus:** Anker und Formpunkt mit Maus und Finger (CDP-Touch, 8 px neben dem Griff aufgesetzt) gezogen ✓, Seite scrollt dabei nicht. Zeitleiste anklickbar/ziehbar.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ – Bogen (Start) und eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s) in 20 Fällen: Start, „Schritt für Schritt abspielen“ (+ Schritt vor/zurück), „Abspielen“ (einmal, zweimal), Schritt zurück, alle 6 weiteren Beispiele, „Neue Aufgabe“, „Term aufdecken“, Abspielen im Aufgabenmodus, Reihenfolge „Vergleich“, Wechsel auf sin x, a < 0, b < 0. **Behoben** (Stand der Leitung bewegte sich in 8 von 20 Fällen): „Schritt für Schritt abspielen“ und „Abspielen“ liefen sprunghaft weiter (alle ca. 2,6 s eine Stufe); „Term aufdecken“ startete die Schrittfolge selbst; die Spiegelungsmeldung „a < 0: Spiegelung …“ blendete ein und aus (Beispiele Wurzel/Exponentialfunktion, Vorzeichenwechsel). Jetzt: „Schritt für Schritt abspielen“ springt auf Schritt 1 und bleibt stehen, „Abspielen“ geht eine Stufe weiter, „Term aufdecken“ und Reihenfolgewechsel spielen nichts ab, keine Spiegelungsmeldung (steht in der Schrittkarte); die Spiegelachse pulsiert vorsorglich nicht.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alle Größen auch über Regler und Knöpfe (Schritt vor/zurück).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Elemente. `strings.canvas` ohne Farbbezug, ergänzt um Asymptoten, Nullstellen-Ringe und Aufgabenmodus (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Kartenfläche/-rand, Pillen, Zeitleiste (Fläche, Rand, offene Knoten, Knopf), Schrift auf Plaketten und Abspielsymbol sowie Schatten/Glanz waren feste Hex-/rgba-Werte → jetzt aus `theme.bg`/`theme.text` gemischt (wie bei `grenzverhalten`). f gestrichelt und beschriftet „f“, g durchgezogen und beschriftet „g“, Vergleich h beschriftet „h“; Anker rund, Formpunkt Raute; Parameterfarben stehen immer mit Buchstaben (Plaketten a, b, c, d).

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/transformationen/index.ts` | Regler a, b, c, d im Aufgabenmodus ausgeblendet; Abspielen dort ohne Wirkung |
| `src/simulations/mathematik/transformationen/index.ts` | Reduzierte Bewegung: Schrittfolge springt statt abzuspielen, kein Selbststart, keine Spiegelungsmeldung, kein Pulsieren |
| `src/simulations/mathematik/transformationen/index.ts` | iPad: knappere Kurzfassungen, Kartenspalte bei Bedarf verkleinert (≥ 80 %), alle vier Karten sichtbar |
| `src/simulations/mathematik/transformationen/index.ts` | Theme-Farben statt fester Hex-/rgba-Werte (Karten, Pillen, Zeitleiste, Plaketten, Schatten) |
| `src/simulations/mathematik/transformationen/index.ts` | „≈“ statt „=“ bei gerundeten Werten (1/b, c/b, b³, 1/b, Periode, gleichwertige Schreibweise, Punkt-Rechnung) |
| `src/simulations/mathematik/transformationen/index.ts` | Hilfetexte und Alt-Text ohne Rot/Grün („runder Ankerpunkt“, „rautenförmiger Formpunkt“) |
| `tests/transformationen.test.ts` | 6 neue Tests (D/W, Nullstellen, Bildpunkte, Reihenfolge) |
| `src/content/simulations/de/transformationen.md` | Punkte nach Form statt Farbe, 2π/\|b\|, Aufgabenmodus und reduzierte Bewegung erwähnt |
| `src/content/simulations/en/transformationen.md` | auf den Stand der DE-Fassung gebracht |

## 6. Für den Kern (nicht selbst ändern)
- Der Zieh-Hinweis („Die markierten Punkte lassen sich … ziehen“) bleibt im Aufgabenmodus sichtbar, obwohl Anker und Formpunkt dort fehlen (wie bei `sinusfunktion`). Ein `dragHint` als Funktion der Werte wäre hilfreich.
- Der Knopf „Abspielen“ des Hosts lässt sich nicht abhängig von Werten ausblenden (hier im Aufgabenmodus nutzlos). Ein `visibleIf`/`playable(values)` für die Uhr wäre hilfreich.
- Wie schon bei anderen Simulationen: Der Prüfbogen misst reduzierte Bewegung nur im Startzustand; die Fehler hier zeigten sich erst nach Knöpfen und Beispielen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Reduzierte Bewegung: „Schritt für Schritt abspielen“ springt auf Schritt 1, danach geht es mit „Schritt vor“ weiter (statt sprunghaft selbst weiterzulaufen). Ist dieses Verhalten so gewünscht?
- iPad: Die Kartenspalte wird bei Platzmangel bis auf 80 % verkleinert (Kartenschrift dann ca. 10–11 px). Am iPad liegt der Faktor bei 90–97 %; lesbar, aber klein. Alternativ könnte eine Karte (z. B. Punkte) am iPad entfallen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3105/3105 grün (135 Dateien), Build ok.
