# Prüfprotokoll: `feldlinien` – Feldlinien von Punktladungen

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `9100691` · Bogen: `scratchpad/boegen/feldlinien.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Gefunden und behoben:
- Probeladung genau auf einer Ladung zeigte „(0,000 m)² = ∞ N/C“ und eine falsche Summe.
- Bei E = 0 wurde eine Richtung „0°“ genannt; Q = 0 hieß „weg von Q₁“.
- Die E-Pille verdeckte Ladungsbeschriftungen und den Kraftpfeil.
- Übereinanderliegende gleiche Ladungen zeigten nur die Hälfte der Linien.
- „+“ und „−“ der Platten stießen bei kleinem d zusammen.
- Kraft mit Scheingenauigkeit („125,00 µN“); der Ziehen-Tipp passte nicht zum Kondensator.
- Im Lernmaterial fehlten die Kraft auf negative Ladungen und der feldfreie Punkt als Aufgabe.
- 2 Tests ergänzt.

Die Rechenlogik war fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Dipol (Start), q₀ in der Mitte: r = 0,10 m, E₁ = E₂ = 8,988 · 10⁹ · 10⁻⁹ / 0,01 = 898,8 N/C; beide nach rechts → E = 1797,5 ≈ 1798 N/C, 0°; F = 10⁻⁹ C · 1798 N/C = 1,80 µN ✓. Potential 0 V ✓.
  2. „+3 nC und −1 nC“, q₀ bei (0 | 8 cm): r = √(10² + 8²) = 12,81 cm; E₁ = 3 · 8,988 / 0,0164 = 1644 N/C, E₂ = 548 N/C. Vektoren: E⃗₁ = 1644 · (10; 8)/12,81 = (1283,6; 1027,0), E⃗₂ = 548 · (10; −8)/12,81 = (427,9; −342,3); Summe (1711,5; 684,7) → |E| = 1843 ≈ 1844 N/C, arctan(684,7/1711,5) = 21,8° ≈ 22° ✓.
  3. „Drei Ladungen“, q₀ bei (5 | −6 cm): r₁ = 16,16 cm → 344 N/C; r₂ = 7,81 cm → 1473 N/C; r₃ = 15,81 cm, 2 nC → 719 N/C. Summe (319,8 + 943,3 − 227,4; −127,9 + 1131,9 + 682,1) = (1035,7; 1686,1) → 1979 N/C unter 58° ✓. φ = 8,988 · (1/0,1616 − 1/0,0781 − 2/0,1581) = 8,988 · (−19,26) = −173 V ✓.
  4. Mit der Maus auf (0 | 10,5 cm) gezogen (Dipol): r = √(100 + 110,25) = 14,5 cm → je 427,5 N/C; Summe 2 · 427,5 · 10/14,5 = 590 N/C, 0° ✓.
  5. Kondensator U = 5000 V, d = 4 cm (Reglergrenzen), q₀ bei x = 1,5 cm: E = 5000/0,04 = 125 000 N/C; s = 2 − 1,5 = 0,5 cm → φ = 125 000 · 0,005 = 625 V; F = 125 µN ✓.
- **Sonderfälle:**
  - Probeladung genau auf Q₁ (px = −10): Vorher stand dort „(0,000 m)² = ∞ N/C“ und als Summe 225 N/C (nur Q₂). Jetzt erscheint der Hinweis „r = 0, Feldstärke nicht definiert (Division durch 0)“. Kraft und Potential werden ausgeblendet, die Karte zeigt „r = 0: E nicht definiert“.
  - +1 nC und −1 nC am selben Ort: überall feldfrei, keine Linien. Jetzt „E = 0 N/C … feldfreier Punkt“ ohne Richtung.
  - Zwei +1 nC am selben Ort: wirken wie +2 nC. Jetzt 16 statt 8 sichtbare Linien (Startwinkel versetzt).
  - Q = 0: „Q₁ = 0: kein Beitrag“.
  - Nur eine Ladung: Die Vektoraddition entfällt zu Recht.
  - Reglergrenzen (±5 nC, Ecken ±22/±14 cm, Probe ±24/±14 cm): höchstens 40 Linien je Ladung, Pfeil gekappt mit „≫“.
  - Kondensator, Probeladung außen: E = 0 mit Hinweis „außerhalb“ ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** N/C, V, µN und cm/m korrekt, Minus als „−“ ✓. Die Kraft hat jetzt unter 10 µN 2 Nachkommastellen, bis 100 µN eine, darüber keine (statt „125,00 µN“). Große Zahlen stehen ohne Tausendertrennung („125000 N/C“), siehe „Für den Kern“.
- **Begriffe wie im Unterricht:** elektrische Feldstärke, Probeladung, Feldlinien, Äquipotentiallinien, Potential (Bezug unendlich), Vektoraddition/Superposition, homogenes Feld, Randeffekte ✓.
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/feldlinien.test.ts`, jetzt 8 Tests:
  - Sonderfälle r = 0, Q = 0, Ladungen übereinander, Reglergrenzen
  - Werte aus den Beispielen und allen Aufgaben

  Neu im Modell: `chargeAt`, und `pointField(q, 0)` teilt nicht mehr durch 0.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  - A1: 899 N/C; 224,7 ≈ 225 N/C ✓.
  - A2: 1798 N/C, 1,80 µN ✓.
  - A3: 10 000 N/C, 10 µN, 500 V (py = 3, px = 0 → 5 cm von der − Platte, Anzeige 500 V) ✓.
  - Neu A4, zwei gleiche Ladungen, Punkt (0 | 10 cm): r = 14,14 cm, je 449 N/C, senkrecht 2 · 449 · 10/14,14 = 636 N/C. Anzeige 636 N/C, 90° ✓. In der Mitte feldfrei.
  - Neu A5, +1 nC bei −10 cm und +4 nC bei +14 cm: 24 − a = 2a → a = 8 cm → x = −2 cm. Anzeige je 1404 N/C, Summe 0 ✓.
  - Neu A6, Elektron im Kondensator aus A3: 1,6 · 10⁻¹⁹ · 10⁴ = 1,6 · 10⁻¹⁵ N, zur positiven Platte.
- **Aufgabenmodus:** `val` ist bereits `resultsParam`. Mit `_hide=1` zeigen Karte und Pille „?“, die Ergebnisse sind verdeckt ✓ (A1, A2, A3, A5 geladen).
- **„Beispiel laden“:** Alle sechs Beispiele per Link geladen (Dipol, Einzelladung, zwei gleiche, +3/−1, drei Ladungen, Kondensator); sie passen zu den Beschreibungen. Alle Ausprobieren- und Lösungslinks ebenfalls geladen.
- **Texte vereinfacht/korrigiert:**
  - DE: Ausprobieren 1 fragte „wo zeigt es senkrecht nach unten?“; diese Stelle ist schwer zu finden. Jetzt wird nach der Richtung auf der Mittelsenkrechten gefragt.
  - DE: Absatz zu r = 0 und zur Kraft auf negative Ladungen (F = q · E, entgegen den Feldlinien) ergänzt; Aufgaben 4–6 neu.
  - EN: Kraft auf negative Ladungen und r = 0 in einem Satz ergänzt, Ausprobieren 1 angeglichen. Die neuen Aufgaben sind nicht übersetzt (Projektregel).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Das Layout richtet sich schon nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`). iPad quer zeigt beides nebeneinander, gut lesbar ✓. Dunkelmodus gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:**
  - Kein Überlauf.
  - Die E-Pille lag auf „Q₂ = −1 nC“ (Handy, drei Ladungen) und an der Reglergrenze auf dem Kraftpfeil. Jetzt wählt die Simulation aus 7 Positionen eine, die Ladungen, Beschriftungen, q₀ und Pfeil frei lässt.
  - Kondensator mit d = 4 cm: „+“ und „−“ berührten sich im Spalt. Bei engem Spalt stehen sie jetzt außen.
  - Bleibt: Liegt q₀ direkt neben einer Ladung, kreuzt der Kraftpfeil deren Beschriftung. Das lässt sich nicht vermeiden, der Pfeil hat Vorrang.
- **Touch (Ziehen) und Maus:** Probeladung mit der Maus von (0 | 0) nach (0 | 10,5 cm) gezogen, die Werte stimmen (siehe oben) ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur:** laut JSON in Ordnung. Alle ziehbaren Objekte (Ladungen, Probeladung) haben x/y-Regler, deshalb ist kein `setKeyTargets` nötig.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; alle Werte stehen auch als Text in den Ergebnissen.
- **Farben:** aus `ctx.theme.series`. Positiv und negativ unterscheiden sich zusätzlich durch „+“/„−“ im Kreis und in der Beschriftung, nicht nur durch Rot/Blau ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/feldlinien/model.ts` | `chargeAt` (Probe auf Ladung), `pointField` bei r = 0 ohne Division durch 0 |
| `src/simulations/physik/feldlinien/index.ts` | Ergebnisse und Karte: r = 0 „nicht definiert“, E = 0 ohne Richtung („feldfreier Punkt“), Q = 0 „kein Beitrag“; doppelte k-Konstante durch `pointField` ersetzt |
| `src/simulations/physik/feldlinien/index.ts` | E-Pille weicht Ladungen, Beschriftungen, q₀ und Pfeil aus |
| `src/simulations/physik/feldlinien/index.ts` | Startwinkel versetzt bei übereinanderliegenden gleichnamigen Ladungen; Plattenzeichen außen bei engem Spalt |
| `src/simulations/physik/feldlinien/index.ts` | Kraft-Rundung nach Größe; eigener `hint` je Anordnung |
| `src/content/simulations/de/feldlinien.md` | r = 0, Kraft auf negative Ladung, Ausprobieren 1, Aufgaben 4–6 |
| `src/content/simulations/en/feldlinien.md` | Kraft auf negative Ladung, r = 0, Ausprobieren 1 |
| `tests/feldlinien.test.ts` | 2 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- `formatNumber` setzt keine Tausendertrennung (`useGrouping: false`). Die Simulation zeigt deshalb „125000 N/C“ und „112344 N/C“, im Lernmaterial steht „10 000“. Für Zahlen ab 5 Stellen wäre ein schmales Leerzeichen hilfreich, z. B. als Option `group: true`.
- Ein `hint` als Funktion braucht eine Typangabe am Parameter (`(v: { readonly mode?: unknown }) => …`), sonst verliert TypeScript die Typen von `ctx.params`. Ein Hinweis in `docs/ARCHITEKTUR.md` würde helfen.

## 7. Entscheidungen
- **Probeladung genau auf einer Ladung: kein Zahlenwert, sondern der Hinweis „r = 0, nicht definiert“.** ∞ oder eine Summe ohne diese Ladung wäre fachlich falsch. Das gilt nur bei genau r = 0 (die Regler gehen in 0,5-cm-Schritten). Bei kleinem r bleiben die großen Werte sichtbar; im Bild entfällt der Pfeil wie bisher („zu nah an einer Ladung“).
- **E < 0,5 N/C gilt als 0 und bekommt keine Richtung.** Die Anzeige rundet ohnehin auf 0, und eine Richtung „0°“ wäre irreführend.
- **Die Probeladung bleibt fest bei +1 nC**, ohne neuen Regler. Die Richtung bei negativer Ladung behandeln der Text und Aufgabe 6 (Elektron). Ein weiterer Parameter würde die Oberfläche überladen.
- **Neue Aufgaben 4–6** decken die fehlenden Schwerpunkte ab: Vektoraddition mit Komponenten, feldfreier Punkt, negative Ladung. In A5 liegt Q₂ bei 14 cm, damit der feldfreie Punkt auf dem 0,5-cm-Raster liegt (x = −2 cm).
- **Unicode-Indizes (Q₁, E₂, q₀) auf der Zeichenfläche bleiben**, statt `subText` zu nehmen. Sie werden im Bogen sauber dargestellt, und es gibt keine Unterstrich-Schreibweise.
- **Kraft-Rundung nach Größe** (0,90 µN; 10,0 µN; 125 µN): passt zu den Lösungen (1,80 µN, 10 µN) und vermeidet Scheingenauigkeit.
- **EN nur fachlich ergänzt**, die neuen Aufgaben sind nicht übersetzt (Projektregel „EN darf kürzer sein“).

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3377/3377 grün (148 Dateien), Build ok.
