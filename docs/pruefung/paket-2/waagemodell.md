# Prüfprotokoll: `waagemodell` – Lineare Gleichungen am Waagemodell

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `b50e6a8` (Basis) · Bogen: `scratchpad/pruefung/waagemodell/waagemodell.png` (nicht im Repo)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. $3x + 2 = x + 8$ $\mid -x$ → $2x + 2 = 8$ $\mid -2$ → $2x = 6$ $\mid :2$ → $x = 3$. Probe: $3 \cdot 3 + 2 = 11$, $3 + 8 = 11$. Anzeige nach den Knöpfen „− x“, „− 1“, „− 1“, „: 2“: Kette mit „| − x“, „| − 2“ (zwei Schritte − 1 zusammengefasst), „| : 2“, „L = {3}“, „Probe: 11 = 11 ✓“ ✓.
  2. $2x + 5 = 13$ (EN-Seite): fünfmal „− 1“ → $2x = 8$ (Randnotiz „| − 5“), $\mid :2$ → $x = 4$. Probe $2 \cdot 4 + 5 = 13$ ✓.
  3. $4x = 2x + 6$: zweimal „− x“ → $2x = 6$ („| − 2x“), „: 2“ → $x = 3$. Probe $4 \cdot 3 = 12 = 2 \cdot 3 + 6$ ✓.
  4. $2x = 5$: Teilen geht im Modell nicht (5 Gewichtsstücke lassen sich nicht in 2 gleiche Teile teilen). Hinweis „Rechnerisch: x = 5/2 = 2,5“. Die Waage ist mit $x = 2{,}5$ im Gleichgewicht, die geöffneten Päckchen zeigen 2,5 ✓.
  5. $4x = x + 1$: $3x = 1$, $x = 1/3$. Linke Seite $4 \cdot 1/3 = 4/3$, rechte Seite $1/3 + 1 = 4/3$. **Befund (behoben):** Vorher stand dort „x = 0,33“ und „Probe: 1,33 = 1,33“. Das ist gerundet, und „4 · 0,33 = 1,33“ stimmt nicht. Jetzt stehen dort Brüche: „Jedes Päckchen wiegt 1/3 … 4 · 1/3 = 4/3“.
- **Sonderfälle:**
  - $x + 1 = x + 2$: Hinweis „Die Waage kann nie im Gleichgewicht sein“. Nach „− x“ steht „1 = 2 – Widerspruch, L = { }“, die Waage kippt nach rechts ✓.
  - $2x + 2 = 2x + 2$ (= $2(x + 1)$): „jede Zahl ist Lösung: L = ℚ“, nach zweimal „− x“ bleibt „2 = 2“ ✓. Beim Öffnen stand bisher ohne Erklärung „Jedes Päckchen wiegt 1“. Jetzt steht dabei, dass jedes andere Gewicht genauso passt.
  - Negative Lösung $x + 9 = 3x + 13$ ($x = −2$): Die Waage kippt für jedes Gewicht nach rechts, Hinweis „Grenze des Waagemodells“, „Päckchen öffnen“ ist gesperrt ✓.
  - $x = 0$ (z. B. $2x + 3 = x + 3$): eigener Hinweis ✓. Alle Regler auf 0: „0 = 0“, im Gleichgewicht ✓.
  - Geteilt wird nur, wenn alle Anzahlen teilbar sind. Der Teiler ist mindestens 2, Teilen durch 0 ist also nicht möglich ✓.
- **Waage:** Einseitiges Antippen lässt die Waage animiert zur schwereren Seite kippen. Die Gleichung („x < 5“ bzw. „x + 1 > 1“) steht dann rot mit ✗. Nimmt man auf der anderen Seite dasselbe weg, ist die Waage wieder im Gleichgewicht und es entsteht eine gültige Zeile ✓. Ist die Waage nur zufällig im Gleichgewicht (links x, rechts 3 weg bei x = 3), gilt das nicht als Äquivalenzumformung ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Minus als „−“, Dezimalkomma (DE) bzw. Punkt (EN) ✓. Bei den Nennern 3 und 6 stehen jetzt exakte Brüche statt Werten, die auf 2 Stellen gerundet sind (siehe 5.).
- **Begriffe wie im Unterricht:** Äquivalenzumformung, Lösungsmenge, Probe und die Randnotiz „| − x“, „| : 2“ wie im bayerischen Heft ✓. Im Modell gibt es nur Subtrahieren und Dividieren. Addieren und Multiplizieren nennt der Text, die Simulation bietet sie nicht an (siehe Rückfragen).
- **Neue/ergänzte Tests:** `tests/waagemodell.test.ts` hat 7 Tests mehr (jetzt 15):
  - Prüfwerte 3x + 2 = x + 8, 2x + 5 = 13 und 4x = 2x + 6
  - Kippen bei einseitiger Änderung
  - 2x = 5
  - Sonderfälle „keine Lösung“ und „jede Zahl“
  - `valueText` (Brüche ohne Rundung)
  - Zusammenfassen von Schritten

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  - A1: $x = 4$ (22 = 22) ✓
  - A2: $x = 3$ (15 = 15) ✓
  - A3: $x = 4$ (17 = 17) ✓
  - A4: $x = 3$ (13 = 13) ✓
  - A5: (a) $x = 2$ (11 = 11), (b) $x = −2$ (4 = 4) ✓
  - A6: (a) $5 = 2$ → L = { }, die Waage kippt nach links ✓
- **„Beispiel laden“ geklickt:** alle sechs Beispiele und die Links im Lernmaterial (u. a. 4x + 2 = 2x + 6, keine Lösung, Grenze, Aufgabe 5a/5b, 6a). Die Anzeigen sind wie erwartet.
- **Texte korrigiert:**
  - EN war stark gekürzt. Es fehlten Ausprobieren 4–7, die Aufgaben 2, 3, 5 und 6, die Bayern-Zuordnung und die Hinweise. EN ist jetzt inhaltlich gleich zu DE.
  - DE/EN: neuer Ausprobieren-Punkt $2x = 5$.
  - DE/EN: Aufgabe 6 (b) ist jetzt $2x + 2 = 2(x + 1)$, mit Ausmultiplizieren und einem Link zur Waage.
  - DE/EN: neue Hinweise zu Addieren/Multiplizieren (Sie-Form) und zur Bedienung mit der Tastatur.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vollständig, Karten auf dem Tablet vorhanden, Beamer lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine. Auf dem kleinen Handy ist die Umformungsspalte unter der Waage kurz. Ältere Zeilen werden dann ausgeblendet (gewollt).
- **Touch und Maus:** Antippen bzw. Klicken der Päckchen und Gewichtsstücke mit der Maus geprüft. Beim Überfahren wird der Gegenstand hervorgehoben. Mit dem Finger läuft es über den Kern-`TapTarget` (Pointer-Ereignisse). Ziehen ist nicht vorgesehen.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓. Der Balken springt sofort auf den Zielwinkel und schwingt nicht nach. Die Gruppenrahmen beim Teilen entfallen.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON regulär ✓. Einseitiges Wegnehmen geht nur mit dem Zeiger (siehe Rückfragen).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen ✓. Die Grafik ist beschrieben. Gleichung, Umformungskette und Zustand der Waage („kippt nach links – die linke Seite ist schwerer“) stehen als Text in den Ergebnissen ✓.
- **Farben:** Rot und Grün kommen nur zusätzlich zu Zeichen vor (=, <, >, ✗, ✓) ✓. Textfarbe und Hintergrund waren an mehreren Stellen fest eingetragen: Termkarten, Relationszeichen, Hinweiszeile und Schildchen. Sie kommen jetzt aus `theme.text` bzw. `theme.bg`. Die Szene (Wand, Tisch, Messing, Holz, Schachteln) behält ihre eigenen Materialfarben. Das ist eine Fotoszene, hell und dunkel sind aufeinander abgestimmt.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/waagemodell/model.ts` | `valueText()` neu: ganze Zahl, abbrechende Dezimalzahl oder Bruch, ohne Rundung |
| `src/simulations/mathematik/waagemodell/index.ts` | Päckchengewicht, Probe und Schildchen exakt (1/3 statt 0,33). Neuer Text `openedAll` für L = ℚ. Termkarten, Relationszeichen, Hinweis und Schildchen mit `theme.text`/`theme.bg` |
| `src/content/simulations/de/waagemodell.md` | Ausprobieren 2x = 5, Aufgabe 6 (b) mit 2(x + 1), Hinweise zu Addieren/Multiplizieren und zur Tastatur |
| `src/content/simulations/en/waagemodell.md` | inhaltlich an DE angeglichen |
| `tests/waagemodell.test.ts` | 7 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Das Modell bietet nur „beide Seiten −“ und „: n“. „Beide Seiten +“ (Hinzulegen) und negative Zahlen (z. B. Ballons als Gegengewicht) wären ein Umbau. Text und Simulation benennen diese Grenze (Hinweis bei negativer Lösung).
- Einseitiges Wegnehmen (die kippende Waage) geht nur mit Maus oder Finger, nicht mit der Tastatur. Eine Tastaturbedienung der Gegenstände wäre ein Umbau.
- Die Randnotiz steht mit Leerzeichen („| − 2“). Im Heft ist auch „| −2“ üblich. Beides ist gebräuchlich, deshalb nicht geändert.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3002/3002 grün (129 Dateien), Build ok.
