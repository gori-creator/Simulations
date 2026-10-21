# Prüfprotokoll: `spiegelung` – Achsen- und Punktspiegelung

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `d7361ba` (Basis) · Bogen: `scratchpad/pruefung/spiegelung/spiegelung.png` (nicht im Repo)

## Ergebnis
korrigiert (fehlende Achse bei P = Q und falscher Umlaufsinn bei entarteter Figur über Regler/Link behoben, Hinweis „Bild außerhalb des Papiers“, englisches Lernmaterial an DE angeglichen, Tests ergänzt).

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (Koordinaten in Kästchen, 1 Kästchen = 0,5 cm):**
  1. Achse x = 3 (P(3|0), Q(3|14)), A(1|2): Abstand 2 Kästchen, A′ = (3 + 2 | 2) = (5|2). Anzeige „A, A′: 1 cm“, A′ im Bild bei (5|2), Verbindung waagerecht mit rechtem Winkel auf s, Strichmarken gleich ✓
  2. Achse y = x (P(0|0), Q(14|14)), A(1|4): Lotfuß ((1 + 4) : 2 | (1 + 4) : 2) = (2,5|2,5), A′ = 2 · (2,5|2,5) − (1|4) = (4|1); Abstand |1 − 4| : √2 ≈ 2,12 Kästchen ≈ 1,1 cm, Anzeige „A: ≈ 1,1 cm“ ✓
  3. Schräge Achse aus Aufgabe 1: P(8|1), Q(12|13), also 3x − y = 23. A(3|6): 9 − 6 − 23 = −20, A′ = A + 2 · 20/10 · (3|−1) = (15|2), Lotfuß (9|4), Abstand 20 : √10 ≈ 6,32 Kästchen ≈ 3,2 cm ✓ (Anzeige „A: ≈ 3,2 cm“). B(7|4): −6 ⇒ B′ = (10,6|2,8), Abstand 6 : √10 ≈ 0,9 cm ✓. C(5|11): −19 ⇒ C′ = (16,4|7,2), ≈ 3,0 cm ✓. |AB| = √20 ≈ 4,47 Kästchen ≈ 2,2 cm ✓
  4. Punktspiegelung an Z(2|2): A(5|3) → (2 · 2 − 5 | 2 · 2 − 3) = (−1|1); Z ist Mitte ((5 − 1) : 2 | (3 + 1) : 2) = (2|2) ✓; |AZ| = √10 ≈ 1,6 cm, Anzeige „≈ 1,6 cm“ ✓. Umlaufsinn ABC und A′B′C′ beide gegen den Uhrzeigersinn, „bleibt gleich“, AB ∥ A′B′ ✓
  5. Viereck A(3|3), B(8|4), C(7|10), D(2|8): Winkel bei A zwischen (5|1) und (−1|5): Skalarprodukt 0 ⇒ 90°, Anzeige „90°“ ohne „≈“ ✓; |AB| = √26 ≈ 2,55 cm, Anzeige „≈ 2,5 cm“ ✓
- **Umlaufsinn:** Achsenspiegelung ABC gegen den Uhrzeigersinn ↔ A′B′C′ im Uhrzeigersinn („umgekehrt“) ✓; beim Fähnchen wird das Tuch BCM betrachtet ✓. Punktspiegelung „bleibt gleich“ ✓.
- **Fixpunkte:** Ecke auf der Achse (C(10|10), s: x = 10) zeigt „0 cm“, Bildpunkt = Original, keine Konstruktionslinie ✓; Karte „Fixpunkte und Fixgeraden“ fachlich korrekt (s und alle Senkrechten zu s bzw. alle Geraden durch Z).
- **Symmetrie erkennen:** H (2 Achsen, punktsymmetrisch), T/E (1 Achse), N und Parallelogramm (nur punktsymmetrisch), F und Windrad (keine), gleichseitiges Dreieck (3 Achsen), Stern (5 Achsen, nicht punktsymmetrisch) – auch gedreht (Tests) ✓. Beim H beide Achsen gezogen und Zentrum angetippt, „Prüfen“ → „Richtig – alles gefunden!“ ✓
- **Sonderfälle:**
  - **P = Q** (über Regler oder Link, z. B. `?px=10&py=5&qx=10&qy=5`): vorher keine Achse, „Abstand von s: ≈ – cm“ (NaN), trotzdem „umgekehrt“. **Behoben** (siehe 5.).
  - **Entartete Figur** (Ecken auf einer Geraden, nur über Regler/Link; Ziehen verhindert es): vorher „ABC: im Uhrzeigersinn; A′B′C′: im Uhrzeigersinn (bleibt gleich)“ – fachlich falsch. **Behoben**: Hinweis auf dem Papier, Umlaufsinn „–“.
  - **Bild außerhalb des Papiers** (z. B. Punktspiegelung an Z(2|2)): das Bild wurde ohne Hinweis abgeschnitten. **Hinweis ergänzt.**
  - Figur schneidet die Achse und Zentrum in der Figur: Darstellung korrekt, keine Fehler ✓
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** cm mit 1 Nachkommastelle, „≈“ nur bei gerundeten Werten; EN mit Dezimalpunkt ✓.
- **Begriffe:** Achsenspiegelung, Punktspiegelung, Spiegelachse s, Zentrum Z, Lot, Geodreieck, Umlaufsinn, Fixpunkt, Fixgerade, achsen-/punktsymmetrisch – wie im Unterricht ✓
- **Neue Tests:** Block „Prüfrunde Paket 2“ in `tests/spiegelung.test.ts` (8 Tests): x = 3, y = x, schräge Achse (Aufgabe 1), Fixpunkte, Z(2|2), Drehung um 180°, Figur schneidet Achse / Zentrum in der Figur, Aufgabe 2, entartete Figur.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgabe 1 siehe oben (A′(15|2), B′(10,6|2,8), C′(16,4|7,2), alle auf dem Papier) ✓. Aufgabe 2: Z − A = (6|4), A′ = Z + (6|4) = (16|11), also 12 rechts und 8 über A ✓. Aufgabe 3 (Mittelsenkrechte von [AA′]) ✓. Aufgabe 4 (E: waagerechte Achse) ✓. Aufgabe 5 (Parallelogramm) ✓. Aufgabe 6 ✓.
- **„Beispiel laden“:** alle Links in DE und EN sowie die 6 Beispiele geladen, keine Konsolenfehler, Anzeigen passen zum Text.
- **Korrigiert:** EN war deutlich kürzer (3 statt 6 Aufgaben, 5 statt 7 Punkte „Try it“, keine Tabelle, knappe Hinweise). EN inhaltlich an DE angeglichen. In beiden Sprachen unter „Modell“ ergänzt: Hinweis bei Bild außerhalb des Papiers, Verhalten bei P = Q und bei Ecken auf einer Geraden.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Karten lesbar, Beamer gut. Auf dem iPad quer fehlt die Karte „Konstruieren mit dem Geodreieck“ (gewollt: nur wenn sie ganz passt).
- **Überlauf / Überlappungen:** kein Überlauf. Liegt das Bild teilweise außerhalb, überlappen dort die Beschriftungen „B′C′“ am Rand (jetzt mit Hinweis).
- **Touch (Ziehen) und Maus:** im Symmetrie-Modus Achsen gezogen und Zentrum angetippt (Maus) ✓. Ziehen der Ecken, Achse, Zentrum laufen über dieselben Zeiger-Ereignisse (Fangradius auf schmalen Bildschirmen 22 px); nicht eigens mit Touch emuliert.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur:** keine Bedienelemente ohne Namen (JSON) ✓; alles auch über Regler/Schalter/Aktionen bedienbar, außer dem Einzeichnen von Achsen im Symmetrie-Modus (dort „Lösung zeigen“ und Textanzeige „Symmetrie der Figur“).
- **Beschreibung der Grafik:** Alt-Text beschreibt Karopapier, Figur, Bild, Achse/Zentrum, Konstruktionslinien; Ergebnisse als Textanzeigen ✓
- **Farben:** über `ctx.theme.series`; Original/Bild zusätzlich durch Namen (A/A′) unterschieden, Urteile mit ✓/↺ und Text ✓. Feste Farben nur für Karten- und Hinweishintergründe.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/spiegelung/index.ts` | `separatePQ()` in `update()`: Fallen P und Q über Regler/Link zusammen, rückt der zuletzt bewegte Punkt ein Kästchen weiter (sonst keine Achse, NaN-Abstände). |
| `src/simulations/mathematik/spiegelung/index.ts` | Entartete Figur (über Regler/Link): Hinweis auf dem Papier, Umlaufsinn „–“ statt „im Uhrzeigersinn … bleibt gleich“, Anzeige „Umlaufsinn“ mit Hinweistext. |
| `src/simulations/mathematik/spiegelung/index.ts` | Hinweis „Das Bild liegt zum Teil außerhalb des Karopapiers.“ (`drawNotice`, Hinweisfeld mit Zeilenumbruch); neue Texte `invalidNow`, `offPaper` (DE/EN). |
| `src/content/simulations/en/spiegelung.md` | inhaltlich an DE angeglichen (6 Aufgaben, 7 Punkte „Try it“, Tabelle, Hinweise für Lehrkräfte vollständig) |
| `src/content/simulations/de/spiegelung.md` | „Modell“: Hinweise zu Bild außerhalb, P = Q, Ecken auf einer Geraden |
| `tests/spiegelung.test.ts` | 8 neue Tests (Prüfwerte, Sonderfälle, Aufgaben 1 und 2) |

## 6. Für den Kern (nicht selbst ändern)
- Der allgemeine Tipp unter der Simulation „Die markierten Punkte lassen sich mit Maus oder Finger ziehen.“ (`dragHint`) passt im Modus „Symmetrie erkennen“ nicht ganz (dort zieht man Linien). Ein modusabhängiger Tipp wäre eine Kern-Erweiterung.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Das Papier zeigt nur 0–20 × 0–14 Kästchen ohne Koordinatenachsen mit negativen Werten. Prüfbeispiele mit negativen Bildkoordinaten (z. B. (5|3) an Z(2|2) → (−1|1)) liegen außerhalb und sind nur teilweise sichtbar (jetzt mit Hinweis). Ein Koordinatensystem mit Achsen wäre ein Umbau; bitte entscheiden, ob gewünscht.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2986/2986 grün (davon 21 in `spiegelung`), Build ok.
