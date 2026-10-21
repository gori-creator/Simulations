# Prüfprotokoll: `koordinaten-lage` – Punkte, Geraden und Kreise: Lagebeziehungen

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `7e4d852` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/koordinaten-lage/koordinaten-lage.png` (außerhalb des Repos)

## Ergebnis
korrigiert (eine Anregung offen, siehe Rückfragen)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Länge [AB] mit A(1 | 1), B(7 | 5): √(6² + 4²) = √52 ≈ 7,21 → Anzeige „≈ 7,2 cm“ ✓. Länge von (0 | 0) bis (3 | 4): √(9 + 16) = 5 → exakt 5 cm (Test).
  2. Abstand P(9 | 1) von g = AB mit A(2 | 2), B(8 | 5): u = (6, 3), P − A = (7, −1), |6·(−1) − 3·7| / √45 = 27 / 6,708 ≈ 4,02 → „≈ 4,0 cm“ ✓. Waagerechte Gerade y = 2, P(5 | 7): Lotfußpunkt F(5 | 2), Abstand 5 cm ✓.
  3. Kreis um M(5 | 4), r = 3, Gerade durch (1 | 1) und (9 | 1): Abstand 3 = r → Tangente, T(5 | 1) ✓. Gerade x = 9: Abstand 4 > 3 → Passante ✓. Gerade durch (2 | 2), (8 | 5), r = 5: |6·2 − 3·3| / √45 = 3/6,708 ≈ 0,45 → „≈ 0,4 cm < r“, Sekante ✓.
  4. Senkrecht: g durch (2 | 2), (8 | 5), h durch (4 | 7), (6 | 3): (6, 3)·(2, −4) = 12 − 12 = 0 → g ⊥ h, S(5,6 | 3,8) ✓.
  5. Punkt–Kreis: (2 | 5) liegt auf dem Kreis um (2 | 2) mit r = 3 (Abstand 3) ✓ (Modellfunktion `pointCircle`, Test).
- **Sonderfälle:** **Fehler gefunden:** A = B (bzw. C = D) ist über die Regler und über Links erreichbar (die Ziehgriffe verhindern es, die Regler nicht). Folgen vorher: Modus Lage „g und h sind identisch“ (falsch), C = D „g ∥ h, Abstand ≈ 0,9 cm“ (falsch), Modus Kreis „Tangente … T(NaN | NaN)“, Modus Punkte „Länge 0 cm“, „h senkrecht/parallel stellen“ setzte D auf C. Jetzt: Hinweis „A und B müssen verschieden sein …“ (bzw. C und D) in Zeichenfläche und Ergebnis, nur die Punkte werden gezeichnet, Aktionen gesperrt. Punkte auf den Achsen (0 | y), Reglergrenzen 0…10 bzw. 0…8, r = 0,5…6: unauffällig.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** cm, Dezimalkomma über `ctx.fmt`, „=“ bei exakten, „≈“ bei auf mm gerundeten Längen ✓. Punkte als (x | y) mit senkrechtem Strich, erst x, dann y; EN (x, y) ✓.
- **Begriffe wie im Unterricht:** Strecke [AB], Halbgerade [AB, Gerade AB, Streckenlänge AB mit Strich, g ⊥ h, g ∥ h, Lot, Lotfußpunkt F, Passante/Tangente/Sekante, Radius/Durchmesser – passend für Jgst. 5 (Bayern). Parallel/senkrecht werden anschaulich mit dem Geodreieck begründet (Mittellinie bzw. Parallelen zur Zeichenkante), nicht über Steigungen ✓. Punkte liegen auf ganzen Einheiten (1 Einheit = 1 cm = 2 Kästchen); halbe Einheiten gibt es nur beim Radius.
- **Punkte-Spiel:** Bewertung richtig/vertauscht/um eins verzählt/falsch geprüft (auch (0 | 4) ↔ (4 | 0) = vertauscht, (3 | 3) kann nicht vertauscht sein). Zufall über `Math.random` – jede Runde anders, das ist gewollt; Rechenlogik nimmt einen Zufallsgenerator entgegen, die Tests laufen mit `seededRandom` und sind wiederholbar. Kein Punkt zweimal hintereinander, Ablese-Optionen immer 4 verschiedene im Bild ✓.
- **Neue/ergänzte Tests:** `tests/koordinaten-lage.test.ts` – Prüfwerte (Längen 5 und ≈ 7,2, Punkt–Kreis innen/auf/außen, Passante x = 9, Abstand ≈ 4,0) und Bewertung bei Achsenpunkten.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgabe 1 D(1 | 7) ✓; Aufgabe 3 D(5 | 5), (6 | 3), (7 | 1) ✓; Aufgabe 4 Abstand 4 cm bzw. 5 cm ✓; Aufgabe 5 Tangenten y = 1, y = 7, Gerade x = 9 Passante ✓; Aufgabe 6 zwölf Gitterpunkte, zehn im Bild ✓.
- **„Beispiel laden“ geklickt:** alle Presets und Links der Aufgaben 1, 4, 5, 6 geladen. Aufgabe 1: Der Link setzte C(1 | 7), D(6 | 7) – im Text heißt aber (6 | 7) C. Korrigiert auf C(6 | 7), D(1 | 7) (DE und EN).
- **Texte:** DE-Stolperstein „Der Abstand wird nicht senkrecht, sondern entlang irgendeiner Verbindung gemessen“ klarer formuliert. EN um die Aufgabe „Parallel and distance“ ergänzt (Abstand Punkt–Gerade fehlte dort ganz).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch, Laptop, 1920, Beamer, hell/dunkel:** gut lesbar.
- **iPad quer (1024 × 768):** Die Bühne ist dort ca. 630 px breit, die Simulation nahm deshalb das Handy-Layout in einer querformatigen Bühne: Koordinatensystem nur ca. 260 px breit, die Erklärkarte fehlte. Jetzt breites Layout auch bei querliegender Bühne ab 560 px. Dabei Überstände behoben (Hinweis „(x | y): erst …“, Erklärtext über der Längenzeile, Schilder „y: nach oben“ im Spiel).
- **Laptop, Modus Lage ohne Geodreieck:** Der Erklärtext in der Karte „Prüfen mit dem Geodreieck“ lag unter dem Knopf „Geodreieck anlegen“. Kartenhöhe richtet sich jetzt nach dem Text, Text wird nie überdeckt.
- **Touch und Maus:** Ziehen über die Griffe der Plot-Bibliothek, Antippen der Gitterpunkte im Spiel geprüft (Treffer, Rückmeldung, Weg „erst nach rechts, dann nach oben“).
- Kleinigkeit (nicht geändert): Beschriftung „S“ liegt bei der Standardlage dicht an „D(6 | 3)“.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Tweens Dauer 0, Pulsieren aus)
- **Tastatur:** Regler, Schalter, Aktionen über die Seitenleiste erreichbar; das Spiel (Antippen auf der Zeichenfläche) ist nur mit Zeiger bedienbar → „Für den Kern“.
- **Namen, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text beschreibt die Zeichenfläche allgemein, Ergebnisse (Punkte, Lage, Abstand, Punktestand) stehen als Text daneben.
- **Farben:** nur `ctx.theme`. Richtig/falsch im Spiel zusätzlich mit ✓/✗ und Text; die Verlaufspunkte unterschieden sich nur durch Grün/Rot → falsche Antworten jetzt als Ring.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/koordinaten-lage/index.ts` | A = B / C = D: Hinweis statt falscher Lage bzw. NaN, Aktionen gesperrt, unendlicher Linienbereich nicht gemerkt |
| `src/simulations/mathematik/koordinaten-lage/index.ts` | Breites Layout auch bei querliegender Bühne ≥ 560 px (iPad quer) |
| `src/simulations/mathematik/koordinaten-lage/index.ts` | Geodreieck-Karte: Text überlappt den Knopf nicht mehr; Hinweis-, Frage- und Schildertexte passen sich der Kartenbreite an; Erklärtext überdeckt die Längenzeile nicht |
| `src/simulations/mathematik/koordinaten-lage/index.ts` | Verlaufspunkte im Spiel: falsch als Ring (nicht nur Farbe) |
| `src/content/simulations/de/koordinaten-lage.md` | Link Aufgabe 1 (C/D wie im Text), Stolperstein „Abstand“ klarer |
| `src/content/simulations/en/koordinaten-lage.md` | Link Task 1, neue Task 3 „Parallel and distance“ |
| `tests/koordinaten-lage.test.ts` | Prüfwerte und Spielbewertung an Achsenpunkten |

## 6. Für den Kern (nicht selbst ändern)
- Die Bühne wechselt das Seitenverhältnis über die Fensterbreite (`@media (max-width: 640px)`), viele Simulationen schalten ihr Layout aber über die Bühnenbreite (`surface.width >= 640`). Bei Fenstern um 1024 px (iPad quer) ist die Bühne < 640 px breit, aber querformatig – das betrifft vermutlich weitere Simulationen. Vorschlag: im Kern eine gemeinsame Hilfe „breites Layout?“ (z. B. `surface.wide`) anbieten.
- Antippen auf der Zeichenfläche (`TapTarget`) ist nicht per Tastatur erreichbar; für Spiele wäre eine Tastaturbedienung (Pfeiltasten + Enter) im Kern sinnvoll.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Lage **Punkt zu Kreis** (innen/auf/außen) ist im Modell vorhanden (`pointCircle`) und getestet, wird in der Simulation aber nicht angezeigt. Soll sie im Modus „Kreis und Gerade“ ergänzt werden (z. B. für A und B)? Das wäre eine kleine Erweiterung, kein Fehler.
- EN „Passant“ für Passante ist im Englischen unüblich (eher „non-intersecting line“ / „line that misses the circle“). Nicht geändert, weil die Bezeichnung auch in der Zeichnung steht und eine Umbenennung abgestimmt werden sollte.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2862/2862 grün (davon 15 in `tests/koordinaten-lage.test.ts`), Build ok (364 Seiten).
