# Prüfprotokoll: `mittelsenkrechte` – Mittelsenkrechte und Winkelhalbierende

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `ef22f2a` (Basis) · Bogen: `scratchpad/pruefung/mittelsenkrechte/mittelsenkrechte.png` (nicht im Repo)

## Ergebnis
korrigiert (Absturz bei A = B bzw. G = H über Regler oder Link behoben, englisches Lernmaterial an DE angeglichen, Tests ergänzt).

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung, Koordinaten in Kästchen, 1 Kästchen = 0,5 cm):**
  1. A(1|1), B(7|1): M = ((1 + 7) : 2 | (1 + 1) : 2) = (4|1). [AB] ist waagerecht, also ist m die senkrechte Gerade x = 4. Die Anzeige zeichnet m bei x = 4 mit rechtem Winkel in M ✓. Mit P(3|5): |PA| = √(2² + 4²) = √20 ≈ 4,47 Kästchen ≈ 2,2 cm, |PB| = √(4² + 4²) ≈ 5,66 Kästchen ≈ 2,8 cm, „näher an A“ ✓
  2. A(0|0), B(4|4): M = (2|2), Steigung von [AB] = 1, also Steigung von m = −1 und m: y = −x + 4. Die Gerade geht im Bild durch (0|4) und (4|0) ✓. Mit P(0|5): |PA| = 5 Kästchen = 2,5 cm (ohne „≈“), |PB| = √(16 + 1) ≈ 4,12 Kästchen ≈ 2,1 cm ✓
  3. Winkel 60° (th = 0): Halbierende bei 30°, Anzeige „α = 60°, α/2 = 30°“, beide Teilwinkel mit 30° beschriftet ✓. Punkt (√3|1) auf w: Abstand zu beiden Schenkeln 1 (Test).
  4. Aufgabe 4 (Spielplatz): m von A(4|9), B(15|12): 11x + 3y = 11 · 9,5 + 3 · 10,5 = 136; Straße y = 3 + x/10. Also 11,3x = 127, x ≈ 11,24, y ≈ 4,12; |TA| = √(7,239² + 4,876²) ≈ 8,73 Kästchen ≈ 4,4 cm. Anzeige „T (≈ 11,2 | ≈ 4,1), |TA| = |TB| ≈ 4,4 cm“ ✓
  5. Aufgabe 6 (Funkmast): m_AB: 6x + y = 57, m_AC: x + 2y = 19,5 ⇒ x = 94,5/11 ≈ 8,59, y = 60/11 ≈ 5,45; r = √(5,591² + 3,455²) ≈ 6,57 Kästchen ≈ 3,3 cm. Anzeige „U (≈ 8,6 | ≈ 5,5), r ≈ 3,3 cm; spitzwinklig“ ✓
  6. Umkreis rechtwinklig A(4|2), B(16|2), C(4|11): U = Mitte von [BC] = (10|6,5), r = 15 : 2 = 7,5 Kästchen ≈ 3,8 cm ✓. Stumpfwinklig A(2|3), B(18|3), C(7|6): U = (10|−14/3 ≈ −4,7), r ≈ 5,5 cm, „U liegt außerhalb“ ✓
- **Sonderfälle:**
  - **A = B** (über Regler oder Link, z. B. `?ax=4&ay=5&bx=4&by=5`): vorher in allen Themen Konsolenfehler `TypeError: Cannot read properties of undefined` (die Konstruktion hatte keine Kreisschnittpunkte), die Zeichenfläche blieb teilweise leer. Ziehen verhinderte A = B schon, Regler und Links nicht. **Behoben**, siehe Abschnitt 5.
  - **G = H** (Straße ohne Richtung, nur über Regler/Link): vorher „|PA| ≈ – cm“ (NaN). **Behoben** auf dieselbe Weise.
  - C = A im Umkreis: „A, B und C liegen auf einer Geraden … kein Umkreis“ ✓ (hinnehmbar, Ziehen verhindert es ohnehin).
  - Winkel 0° und über 180°: nicht einstellbar (Regler 20–180°, Ziehen der Schenkel ebenfalls auf 20–180° begrenzt) ✓. 180°: w ist die Senkrechte in S, Abstände über Halbgeraden (Lot bzw. Abstand zum Scheitel) ✓. 20° geprüft ✓.
  - Zu kleiner Zirkelradius: In der Simulation ist der Radius nicht einstellbar, er wird automatisch mit Faktor 0,56–0,72 · |AB| gewählt, also immer > |AB|/2. Der Fall „keine Schnittpunkte“ kommt nur in Aufgabe 2 (Text) vor. Siehe Abschnitt 7.
  - A und B benachbart (|AB| = 1 Kästchen) und maximal weit (A(0|0), B(20|14)): Konstruktion läuft durch, S₁/S₂ auf dem Papier ✓
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** cm mit 1 Nachkommastelle, „=“ bei exakten, „≈“ bei gerundeten Werten; bei fast gleichen Längen 2 Stellen (z. B. „= 2,5 cm“ und „≈ 2,55 cm“) ✓. Minus als „−“ (U ≈ −4,7) ✓. EN mit Dezimalpunkt ✓.
- **Begriffe:** Mittelsenkrechte, Winkelhalbierende, Ortslinie, Lot, Scheitel, Schenkel [SA, Raute, Drachenviereck, Umkreismittelpunkt – wie im Unterricht ✓
- **Neue Tests:** Block „Prüfrunde Paket 2“ in `tests/mittelsenkrechte.test.ts`: A(1|1)/B(7|1) → x = 4, A(0|0)/B(4|4) → y = −x + 4 (Gitterpunkte), 60° → 30° mit gleich langen Loten, Zirkelradius zu klein/genau halb/größer, Aufgaben 1, 4 und 6.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgabe 1: P(7|9): |PA| = √(3² + 4²) = 5, |PB| = 5 Kästchen ⇒ 2,5 cm ✓; Q(9|6): |QA| = √26 ≈ 2,55 cm ≈ 2,5 cm, |QB| = √18 ≈ 2,12 cm ≈ 2,1 cm ✓. Aufgabe 2: 2,5 + 2,5 < 6 ✓. Aufgabe 3 (Spiegelung) ✓. Aufgabe 4 und 6 siehe oben ✓. Aufgabe 5: Straße (12|0)–(9|11) hat Richtung (−3|11) ⊥ (11|3) und 11 · 12 + 3 · 0 = 132 ≠ 136 ⇒ kein Treffpunkt ✓; Straße x = 10 bei A(6|8), B(14|8) ⇒ jeder Punkt ✓.
- **„Beispiel laden“:** alle 18 Links im DE- und alle Links im EN-Lernmaterial sowie die 6 Beispiele geladen: keine Konsolenfehler, Anzeigen passen zum Text, `_hide=1` verdeckt T bzw. U („Aufdecken“).
- **Korrigiert:** EN war deutlich kürzer (3 statt 6 Aufgaben, 5 statt 7 Punkte in „Try it“, kein Abschnitt zu Lot/Scheitel, verkürzte Hinweise). EN inhaltlich an DE angeglichen. In beiden Sprachen unter „Modell“ ergänzt: Winkelbereich 20°–180° und Verhalten bei A = B.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Karten vorhanden, Text lesbar, Beamer gut lesbar.
- **Überlauf / Überlappungen:** kein Überlauf. Kleinigkeiten: Liegt P am oberen Papierrand, berühren sich die Beschriftungen „P“ und „m“; bei A(0|0), B(4|4) sitzt „M“ dicht am Rechter-Winkel-Zeichen. Unkritisch.
- **Touch (Ziehen) und Maus:** Ziehen von B mit der Maus geprüft (B wandert, Abstände aktualisieren sich); B auf A ziehen wird verhindert ✓. Touch läuft über dieselben Zeiger-Ereignisse der Surface (Fangradius auf schmalen Bildschirmen 22 px statt 18 px); nicht eigens mit Touch emuliert.
- **Konstruktion:** „Alles abspielen“ läuft für beide Konstruktionen bis „✓ Fertig!“ durch (Mittelsenkrechte nach 14 s fertig; Winkelhalbierende im kopflosen Browser erst nach 25–40 s, obwohl die Teilschritte nur rund 15 s dauern. Ursache nicht untersucht, evtl. Bildtakt des Testbrowsers; bitte bei der Abnahme einmal von Hand ansehen.)

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Schritte springen ohne Animation ans Ende)
- **Tastatur:** Tab-Reihenfolge logisch, keine Bedienelemente ohne Namen (JSON) ✓. Die Knöpfe „Nächster Schritt/Von vorn“ in der Karte sind zusätzlich als echte Aktionsknöpfe vorhanden ✓
- **Beschreibung der Grafik:** Alt-Text beschreibt Karopapier, Strecke/Winkel, P, Ortslinie, Konstruktion, Straße und Umkreis ✓; Ergebnisse als Textanzeigen (Abstände, Winkel, Spur, Schritt, T, U) ✓
- **Farben:** A/B bzw. Schenkel über `ctx.theme.series`, Urteil immer auch als Text („näher an A“, „gleich weit“) ✓. Feste Farben nur für Stift, Trennlinien und Schrift auf farbigem Grund (`#10161f`/`#ffffff`) – als Darstellung vertretbar.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/mittelsenkrechte/index.ts` | Neue Funktion `separate()` in `update()`: Fallen A und B (bzw. G und H) über Regler oder Link zusammen, rückt der zuletzt bewegte Punkt ein Kästchen in seiner Bewegungsrichtung weiter (ohne Richtung: nach rechts, am Rand nach links). Behebt den Absturz in allen Themen und NaN-Anzeigen; Regler lassen sich weiter „durch“ den anderen Punkt schieben. |
| `src/content/simulations/en/mittelsenkrechte.md` | inhaltlich an DE angeglichen (6 Aufgaben, 7 Punkte „Try it“, Hinweise für Lehrkräfte vollständig) |
| `src/content/simulations/de/mittelsenkrechte.md` | „Modell“: Winkelbereich und Verhalten bei A = B ergänzt |
| `tests/mittelsenkrechte.test.ts` | 5 neue Tests (Prüfwerte, Zirkelradius, Aufgaben 1/4/6) |

## 6. Für den Kern (nicht selbst ändern)
- Keine neuen Punkte. (Wie bei `dreieckskonstruktion`: Das Theme hat keine Farbe für den Stift/Gegenstände.)

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Der Zirkelradius der Konstruktion ist fest (automatisch > |AB|/2). Den lehrreichen Fall „Radius zu klein – die Bögen schneiden sich nicht“ (Aufgabe 2) kann man nicht ausprobieren. Ein Regler für den Radius mit Hinweis „Die Bögen schneiden sich nicht“ wäre ein Ausbau (neuer Parameter, Konstruktionsschritte anpassen) und ist hier nicht gemacht. Bitte entscheiden, ob gewünscht.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2978/2978 grün (davon 26 in `mittelsenkrechte`), Build ok (364 Seiten).
