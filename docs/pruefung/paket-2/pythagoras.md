# Prüfprotokoll: `pythagoras` – Satz des Pythagoras

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` (Basis) · Bogen: `scratchpad/shots/sheet-py.png` (nicht im Repo)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-1.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung

## Ergebnis
korrigiert (fachlich richtig; Texte und Grafikbeschreibung verbessert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. 3-4-5: 9 + 16 = 25 = 5², Anzeige „a = 3, b = 4, c = 5“ und „a² + b² = 9 + 16 = 25 = c²“ ✓.
  2. Gleichschenklig a = b = 3: c = √18 ≈ 4,243, Anzeige „c ≈ 4,243“ und c² = 18 ✓. Selbst nachgerechnet.
  3. Aufgabe 1: √(2,25 + 4) = √6,25 = 2,5 cm ✓; EN Leiter √(25 − 1,96) = √23,04 = 4,8 m ✓; 7-24-25: 49 + 576 = 625 ✓, 5-6-8: 61 ≠ 64 ✓.
- **Rückfrage „c = 5,000“:** trifft nicht zu. `fmt.num` hängt keine Nullen an, die Anzeige lautet bereits „c = 5“ (bei nicht exaktem c „≈“ mit 3 Stellen). Nicht geändert.
- **Sonderfälle:** Reglergrenzen 1 und 6, flaches Dreieck 1,5/5 im Puzzle ✓.
- **Neue/ergänzte Tests:** keine (keine neue Rechenlogik).

## 2. Aufgaben und Texte (DE und EN)
- **Ziehbare Ecken geprüft:** Es gibt genau zwei, A (auf der x-Achse, Farbe von b) und B (auf der y-Achse, Farbe von a). Daher „Ziehe die beiden farbigen Eckpunkte …“.
- **Texte korrigiert:** DE Ausprobieren 1 („Beim 3-4-5-Dreieck geht das genau. Gilt a² + b² = c² auch beim gleichschenkligen Dreieck?“). EN: Satz mit Voraussetzung („In every right triangle …“), Umkehrung mit „right angle opposite c“, Ausprobieren 1 an DE angeglichen. Fehlende EN-Aufgaben nicht nachübersetzt.

## 3. Geräte
- **1360 hell, 1360 dunkel (Puzzle), 390 hell (gleichschenklig):** vollständig, keine Überlappungen, kein Überlauf, keine Konsolenfehler.
- **Touch/Maus:** Ziehpunkte über den Kern-Griff wie bisher.

## 4. Barrierefreiheit
- **Beschreibung der Grafik:** deckt jetzt beide Ansichten ab: „Rechtwinkliges Dreieck mit Quadraten über den drei Seiten oder Puzzle-Beweis mit vier Dreiecken im Quadrat mit der Seite a + b“ (EN entsprechend). Die Beschreibung wird beim Start einmal gesetzt, deshalb ein Satz für beide Ansichten.
- **Farben:** nur `ctx.theme`; Quadrate zusätzlich mit a², b², c² beschriftet ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/pythagoras/index.ts` | Grafikbeschreibung DE/EN für beide Ansichten |
| `src/content/simulations/de/pythagoras.md` | Ausprobieren 1 präzisiert |
| `src/content/simulations/en/pythagoras.md` | Satz und Umkehrung mit Voraussetzung, Ausprobieren 1 |

## 6. Für den Kern (nicht selbst ändern)
– 

## 7. Rückfragen
– 

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.

## Zweite Prüfung (Paket 2, 25.10.2026)

Unabhängiger zweiter Durchgang auf dem Zweig `pruefung/paket-2`, danach mit dem Stand oben zusammengeführt (beide Korrekturen sind enthalten).

Prüfer: Paket 2 · Datum: 25.10.2026 · Stand: Commit `b43e2fb` (Basis) · Bogen: `scratchpad/pruef/pythagoras/pythagoras.png` (nicht im Repo)

### Ergebnis
korrigiert

### 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. a = 3, b = 4: a² + b² = 9 + 16 = 25, c = √25 = 5. Anzeige „a = 3, b = 4, c = 5“ und „a² + b² = 9 + 16 = 25 = c²“ ✓; Quadrate zeigen „= 9“, „= 16“, „= 25“ ✓.
  2. a = 1,5, b = 2: 2,25 + 4 = 6,25, c = √6,25 = 2,5 (exakt, daher „=“). Anzeige „c = 2,5“, „c² = 6,25“ ✓.
  3. a = 1,5, b = 5: 2,25 + 25 = 27,25, c = √27,25 ≈ 5,2202 → „c ≈ 5,22“ (3 Nachkommastellen, Endnull entfällt) ✓. Ebenso a = 1,5, b = 4: √18,25 ≈ 4,2720 → „c ≈ 4,272“ ✓; a = 8, b = 1: √65 ≈ 8,0623 → „c ≈ 8,062“ ✓.
  4. Puzzle-Beweis a = 3, b = 4: (a + b)² = 49, vier Dreiecke 4 · ½ · 3 · 4 = 24, frei 49 − 24 = 25 = c² = a² + b² ✓ (jetzt als Test für sechs Fälle).
- **Sonderfälle:** a, b ≥ 1 (Regler), keine Division durch 0. Grenzen 1 und 8 (a = 8, b = 1) dargestellt, ohne Überlauf. Kästchenraster bei halben Längen korrekt (Randstreifen halber Breite).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `ctx.fmt` ✓ (EN Punkt ✓). „=“ vs. „≈“ für c wird richtig unterschieden. Keine negativen Werte.
- **Begriffe wie im Unterricht:** Katheten, Hypotenuse, Kathetenquadrat, Hypotenusenquadrat, Umkehrung ✓.
- **Neue/ergänzte Tests:** `tests/pythagoras.test.ts` neu: Seitenlängen a, b, c und Fläche ½ab aller Dreiecke in beiden Anordnungen; freie Fläche (a + b)² − 2ab = a² + b² in beiden Anordnungen; starre Bewegung (Seitenlängen bleiben) bei 0 … 1; Lösungswerte der Aufgaben.

### 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 √(2,25 + 4) = 2,5 cm ✓; A2 √(100 − 36) = 8 cm ✓; A3 √(25 − 1,96) = √23,04 = 4,8 m ✓; A4 49 + 576 = 625 = 25² ✓, 25 + 36 = 61 < 64 ⇒ stumpf ✓.
- **„Beispiel laden“ geklickt:** alle vier Beispiele und alle Links (`?a=3&b=3`, `?mode=puzzle`, `?mode=puzzle&a=1.5&b=5`, `?a=1.5&b=2`, neu `?a=6&b=8`) geladen, Anzeige passt. Puzzle umlegen (auch halb) angesehen: Dreiecke bewegen sich starr, a² und b² erscheinen.
- **Texte vereinfacht/korrigiert:** EN war deutlich kürzer (es fehlten Aufgabe „Kathete berechnen“, Ausprobieren 3, Satz in Worten, Puzzle-Aufzählung, Beweis-Idee für den Unterricht). EN vollständig an DE angeglichen. Aufgabe 2 (DE/EN) bekommt Link „In der Simulation zeigen“ (a = 6, b = 8); dafür Reglerbereich erweitert.

### 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles sichtbar, Karten vollständig, Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Bei flachen Dreiecken (a = 1,5, b = 4…5) lagen die Seitenbeschriftungen „c“ und „b“ übereinander („cb“) → „c“ steht jetzt außen an der Hypotenuse.
- **Touch (Ziehen) und Maus:** Ziehen der Ecken lief davon: Der Ausschnitt wurde bei jedem Zug neu eingepasst, dadurch wuchs b beim Ziehen bis zum Maximum (Test: Zug um ca. 2 Einheiten ergab b = 8 statt 4). Jetzt bleibt der Ausschnitt während des Ziehens fest und wird beim Loslassen neu eingepasst (Test: b = 4 ✓).

### 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Tab-Reihenfolge laut JSON in Ordnung; Regler und Schalter bedienbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen. Die Beschreibung der Zeichenfläche war fest „Dreieck mit Quadraten“, auch im Puzzle-Modus → jetzt dynamisch (Darstellung, a, b, Seite a + b, welche Fläche frei ist).
- **Farben:** nur aus `ctx.theme`; a/b/c zusätzlich durch Beschriftung unterschieden ✓. Kontrast hell/dunkel ausreichend.

### 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/pythagoras/index.ts` | Reglerbereich a, b bis 8 (statt 6), damit Aufgabe 2 (6-8-10) einstellbar ist |
| `src/simulations/mathematik/pythagoras/index.ts` | Ausschnitt beim Ziehen eingefroren (Ecke läuft nicht mehr davon) |
| `src/simulations/mathematik/pythagoras/index.ts` | Beschriftung „c“ außen an der Hypotenuse (keine Überlappung mit „b“) |
| `src/simulations/mathematik/pythagoras/index.ts` | Dynamische Beschreibung der Zeichenfläche; ungenutzter Text `hyp` entfernt |
| `src/simulations/mathematik/pythagoras/index.ts` | Schalter „Kästchen zum Abzählen“ nur in der Quadrat-Ansicht (wirkt im Puzzle nicht) |
| `src/content/simulations/de/pythagoras.md` | Link „In der Simulation zeigen“ bei Aufgabe 2 |
| `src/content/simulations/en/pythagoras.md` | Vollständig an DE angeglichen (4 Aufgaben, 3 Ausprobier-Punkte, Unterrichtsideen) |
| `tests/pythagoras.test.ts` | Neu (4 Tests) |

### 6. Für den Kern (nicht selbst ändern)
- Der Hinweis „Tipp: Die markierten Punkte lassen sich … ziehen“ (`dragHint`) erscheint auch im Puzzle-Modus, in dem es keine ziehbaren Punkte gibt. Wünschenswert: `dragHint` als Funktion der Werte (z. B. `(v) => v.mode === 'squares'`).
- `Plot` könnte den Zieh-Zustand (z. B. `plot.dragging`) öffentlich machen; die Simulation behilft sich mit eigenen Pointer-Ereignissen.

### 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
keine

### Prüfung
`npm run verify`: astro check 0/0/0, Tests 3037/3037 grün (132 Dateien), Build ok.
