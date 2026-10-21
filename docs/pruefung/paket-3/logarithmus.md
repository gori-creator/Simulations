# Prüfprotokoll: `logarithmus` – Logarithmus als Umkehrung des Potenzierens

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `8a47054` (Ausgangsstand) · Bogen: `/tmp/boegen3/logarithmus.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (b = 2, x = 2): 2² = 4 ⇒ P(2 | 4), Spiegelpunkt P'(4 | 2) auf y = log₂ x, „2² = 4 ⇔ log₂ 4 = 2“ ✓. Lotfußpunkt ((2 + 4)/2 | (2 + 4)/2) = (3 | 3) liegt auf y = x ✓. Wertetabelle 2⁻² = 0,25; 2⁻¹ = 0,5; 2⁰ = 1; 2¹ = 2; 2² = 4; 2³ = 8 ✓. Gezogen auf b = 0,3, x = 2: 0,3² = 0,09 ⇒ „log₀,₃ 0,09 = 2“ (exakt, „=“) ✓; Tabelle 0,3⁻² = 11,11 und 0,3⁻¹ = 3,333 (gerundet) ✓.
  2. Gleichung 2ˣ = 10: 2³ = 8 < 10 < 16 = 2⁴ ⇒ 3 < x < 4 ✓; lg 10 / lg 2 = 1 / 0,30103 = 3,32193 ⇒ „≈ 3,3219“, Pille „x ≈ 3,32“ ✓; Probe 2^3,3219 = e^(3,3219 · 0,693147) = e^2,30258 = 9,99995 ⇒ „≈ 10“ ✓. Gleichung 3ˣ = 50: lg 50 / lg 3 = 1,69897 / 0,47712 = 3,56088 ⇒ „≈ 3,5609“ ✓. Gleichung 1,05ˣ = 2: 0,30103 / 0,021189 = 14,2067 ✓. 0,5ˣ = 8: lg 8 / lg 0,5 = 0,9031 / (−0,3010) = −3, „Ablesen: 0,5⁻³ = 8“ ✓.
  3. Rechengesetze: lg 20 + lg 50 = 1,30103 + 1,69897 = 3 = lg 1000 ✓ (Skala 1, 10, 100, 1000 über 0, 1, 2, 3 ✓). log₂ 48 − log₂ 3 = 5,58496 − 1,58496 = 4 = log₂ 16 ✓. log₃(9⁴) = 4 · log₃ 9 = 4 · 2 = 8, 3⁸ = 6561 = 9⁴ ✓. log₂(3 · 5) = 1,58496 + 2,32193 = 3,90689 ⇒ „≈ 3,9069 = log₂ 15“ ✓; Potenzschreibweise 2^1,58 · 2^2,32 (Hochzahlen gerundet, Summe 3,90) „≈ 2^3,91“ ✓. Gezogenes Pfeilende u = 6,8: log₂ 6,8 = ln 6,8 / ln 2 = 1,91692 / 0,693147 = 2,76553 ⇒ „≈ 2,7655 + 3 ≈ 5,7655 = log₂ 54,4“ ✓.
  - Modell: log über ln y / ln b mit Glätten ganzzahliger Ergebnisse (log₁₀ 1000 = 3 exakt), Basis 0 < b ≠ 1, y > 0, Eingrenzen auch bei fallender Potenz (b < 1: b^k ≥ c > b^(k+1)), Spiegelung (x | y) → (y | x), Überspringen von b = 1 beim Ziehen ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): b = 1 wird beim Ziehen (Punkt B und Regler) übersprungen, getestet: B von 2 nach unten gezogen ⇒ b = 0,3 ✓. y ≤ 0 und unzulässige Basen ⇒ NaN/„keine Lösung“, im Bild „Für c ≤ 0 keine Lösung, denn bˣ > 0“ ✓ (c-Regler beginnt bei 0,01). Kleine c (c < 1,2) bekommen einen engen Ausschnitt; b = 10 bis c = 1000 und b = 0,2 geprüft. Negative Hochzahl r in der Potenzregel (Pfeile nach links) ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und „−“ über `fmt` ✓. **Behoben:**
  - Ergebnisse „Lösung“ bei 2ˣ = 32 zeigten „= 1,5051 / 0,301 = 5“, obwohl lg 32 und lg 2 gerundet sind ⇒ jetzt „≈ 1,5051 / 0,3010 ≈ 5“ (wie im Bild).
  - Logarithmen mit 4 Nachkommastellen jetzt mit Endnullen („1,3010“, „0,3010“, „5,5850“ statt „1,301“, „0,301“, „5,585“ neben „3,5609“); exakte Werte ohne („3“, „0,5“).
  - Zeichenkette „≈ a + b ≈ c“: zweites Zeichen „=“, wenn die gezeigten gerundeten Werte genau das exakte Ergebnis ergeben („≈ 1,3010 + 1,6990 = 3“); erstes Zeichen prüft jetzt beide Logarithmen (vorher nur log u, sodass z. B. „log₂ 4 + log₂ 3 = 2 + 1,585“ entstehen konnte).
  - Potenzschreibweise über dem Lineal: „20 · 50 ≈ 10^1,30 · 10^1,70 = 10³ = 1000“ (vorher „≈ 10³“ trotz exakter Summe), Hochzahlen mit 2 Stellen samt Endnullen; „2^3,91 ≈ 15“ statt „= 15“, wenn die Hochzahl gerundet ist. Gleiches für die „Probe“ in der Karte (2^3,5850 ≈ 12 statt „= 12“).
- **Begriffe wie im Unterricht:** Basis, Logarithmus, Umkehrfunktion, Steckbrief (D, W, Nullstelle, Asymptote, Monotonie), Basiswechsel, Produkt-/Quotienten-/Potenzregel, Eingrenzen ✓. **Behoben:** Bei b = 10 stand überall „log₁₀“, obwohl Beispiel und Lernmaterial „lg“ verwenden ⇒ jetzt „lg“ im Bild (Graphname, Steckbrief, Lineal, Karten) und in den Ergebnissen. ln erscheint nur, wenn „Basis e“ gewählt ist (Beispiel „Natürlicher Logarithmus ln“); Standard und alle Jgst.-10-Aufgaben nutzen log_b und lg ✓. Lehrplanfrage siehe Rückfragen.
- **Neue/ergänzte Tests:** `tests/logarithmus.test.ts` um 6 Tests ergänzt (jetzt 28): Aufgaben 1–6 aus dem Lernmaterial (exakte Werte log₂ 32 = 5, log₃ 1/9 = −2, lg 0,001 = −3, Eingrenzen 2³ < 10 < 2⁴ und 3³ < 50 < 3⁴, Basiswechsel 3,561, Rechengesetze exakt 3/4/8, 0,5ˣ = 8 ⇒ −3 und Eingrenzen bei fallender Potenz, 14,2067), log₀,₃ 0,09 = 2.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 5; −2; −3; 0; 0,5 ✓. A2 3 < x < 4, 3,32, Probe 2^3,32 = 9,987 ≈ 9,99 ✓. A3 3,561, Probe 3^3,561 = e^3,91216 = 50,006 ≈ 50,0 ✓. A4 3; 4; 8 ✓. A5 −3 ✓. A6 14,2 Jahre, im 15. Jahr ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle 16 Links des Lernmaterials mit simshot (1440 hell/dunkel, 1024, 768, 414, 360, DE/EN). Aufgaben-Links A2/A3 (`info=0&_hide=1`): Karte und Pille zeigen „?“, Ergebnisse verdeckt; Graph, S und das Lot bis zur x-Achse bleiben sichtbar – das ist gewollt (grafisches Eingrenzen ist Teil der Aufgabe), die Zahl selbst bleibt verdeckt.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (4 von 6 Aufgaben, 5 von 7 Ausprobieren, Rechengesetz-Aufgabe ohne Potenzregel, Ideen ohne Einstieg und Aufgabenmodus, Stolperstein „Basis 1“ fehlte) ⇒ vollständig auf den Stand der DE-Fassung gebracht, mit Dezimalpunkt.
  - DE/EN neu: Satz zu „=“ (exakt) und „≈“ (gerundet); in Ausprobieren 1 heißt der rote Graph jetzt auch „y = log₂ x“ (nicht nur über die Farbe).
  - Alt-Text der Zeichenfläche (DE/EN) beschreibt jetzt Graphen, Spiegelgerade, P/P' mit Lot, Punkt B, Basen-Chips, Steckbrief, Wertetabelle und die beiden anderen Ansichten.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** iPad hoch/quer und größer: Graph links, Karten rechts (entscheidet Breite ≥ 640 oder Breite ≥ 1,3 · Höhe) ✓. **Behoben:** Am Handy (360/414) war der Steckbrief unten abgeschnitten (Monotonie halb, Umkehrfunktion fehlte). Die Bühne ist am Handy jetzt etwas höher (`aspectNarrow` 0,5 → 0,44) und der Graph bekommt 47 % statt 50 %; der Steckbrief passt vollständig. **Behoben:** Bei 2ˣ = 10 lag die obere Grenze 2⁴ = 16 außerhalb des Bildes; der Ausschnitt nimmt die obere Potenz der Eingrenzung jetzt mit (wenn sie höchstens 2,5 · c ist).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf (Bogen und simshot). Beschriftungen weichen einander aus (eigene Belegungsliste). Kleinigkeit: Bei sehr kleiner Basis (b = 0,3) sitzt „B(1 | 0,3)“ dicht über der x-Achse, bleibt lesbar.
- **Touch (Ziehen) und Maus:** mit der Maus gezogen: P (x = 2 → 1), B (b = 2 → 0,3, über die 1 gesprungen), S (c = 10 → 7,24) und das Pfeilende u (4 → 6,8) ✓. Touch läuft über dieselben Griffe des Kerns (`Plot.addHandle`) bzw. `addTarget` mit größerem Trefferradius für Touch. Der Zieh-Hinweis passt (P, P', B, B', S und Pfeilenden sind ziehbar).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen) und eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach Start, „An y = x spiegeln“ (2×), Basis-Chip, allen 6 Beispielen, „Pfeile aneinanderlegen“, „Lösung zeigen“ und Ziehen von P. **Behoben** (vorher bewegt, gegen den Stand der Leitung gemessen): Nach dem Antippen einer Basis blendete eine Hilfslinie aus; beim Wechsel zwischen Beispielen glitt der Bildausschnitt (Gleichung) bzw. die Skala (Rechengesetze) weiter; „An y = x spiegeln“ blendete das Endbild ein und nach ca. 3 s wieder aus. Jetzt: Ausschnitt und Skala springen, keine Hilfslinie, und die Spiegelung zeigt sofort das stehende Endbild, das bis zur nächsten Änderung oder einem zweiten Klick bleibt.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alle Größen sind auch über Regler/Schalter erreichbar (Basis-Chips im Bild entsprechen Regler b und Schalter e).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text erweitert; Ergebnisse als Text (Kernfrage, Steckbrief, Rechnung, Lösung, Probe).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Kartenhintergrund und -rand, Pillenhintergrund, Trennlinien der Wertetabelle, Mittellinie des Lineals und Schatten waren feste Hex-/rgba-Werte ⇒ jetzt aus `theme.bg`/`theme.text`/`theme.grid` gemischt. Graphen sind beschriftet („y = 2ˣ“, „y = log₂ x“), Asymptoten mit „x = 0“/„y = 0“, P gefüllt und P' hohl; Pfeile der Rechengesetze tragen ihre Logarithmen als Beschriftung. Nichts ist nur über Rot/Grün unterscheidbar.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/logarithmus/index.ts` | „lg“ statt „log₁₀“ bei b = 10 (Bild und Ergebnisse) |
| `src/simulations/mathematik/logarithmus/index.ts` | „=“/„≈“ in Basiswechsel, Rechengesetzen, Potenzschreibweise und Probe; Endnullen bei gerundeten Logarithmen (4 Stellen) und Hochzahlen (2 Stellen) |
| `src/simulations/mathematik/logarithmus/index.ts` | reduzierte Bewegung: stehendes Endbild der Spiegelung, kein Gleiten von Ausschnitt/Skala, keine ausblendende Hilfslinie |
| `src/simulations/mathematik/logarithmus/index.ts` | Handy: höhere Bühne, Steckbrief vollständig; Gleichung: obere Potenz der Eingrenzung im Ausschnitt |
| `src/simulations/mathematik/logarithmus/index.ts` | Theme-Farben für Karten, Pillen, Linien und Schatten; Alt-Text erweitert |
| `src/content/simulations/en/logarithmus.md` | auf den Stand der DE-Fassung gebracht |
| `src/content/simulations/de/logarithmus.md` | Hinweis „=“/„≈“, roter Graph mit Namen |
| `tests/logarithmus.test.ts` | 6 Tests zu den Aufgaben ergänzt (28 insgesamt) |

## 6. Für den Kern (nicht selbst ändern)
- Im Englischen schreibt `fmt.point` Punkte als „(2, 1)“ (Ergebnisse), im Bild steht wie in vielen Simulationen „(2 | 1)“. Eine gemeinsame Regel für EN wäre gut.
- Wie bei `cavalieri`/`exponentielles-wachstum`: eine gemeinsame Hilfe für „=“/„≈“ mit Endnullen (`fmt.approx`) würde die eigenen `exactTo`/`eqs`/`eqSum` ersetzen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **ln: Jahrgangsstufe 11 oder 12?** Der Auftrag nennt „ln erst ab Jgst. 11“, `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` führt die natürliche Exponentialfunktion (12.1.2) und die natürliche Logarithmusfunktion (12.4.3) in Jahrgangsstufe 12. Das Lernmaterial (DE/EN) sagt „Oberstufe (Jahrgangsstufe 12) – bitte am Lehrplan prüfen“ und passt damit zur Lehrplandatei. Bitte am LehrplanPLUS klären; ggf. Lehrplandatei und Text gemeinsam anpassen. Die Simulation selbst nutzt ln nur bei gewählter Basis e.
- **Lösung grafisch sichtbar im Aufgabenmodus:** Bei A2/A3 zeigen S und das Lot auf der x-Achse ungefähr, wo die Lösung liegt (zwischen 3 und 4). Für das Eingrenzen ist das gewollt; soll das Lot bei verdeckten Ergebnissen erst mit „Lösung zeigen“ erscheinen?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3080/3080 grün (134 Dateien), Build ok.
