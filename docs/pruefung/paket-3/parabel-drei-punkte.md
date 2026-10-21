# Prüfprotokoll: `parabel-drei-punkte` – Parabel durch drei Punkte

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `7cc543b` · Bogen: `/tmp/boegen3/parabel-drei-punkte.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startzustand P₁(−1 | 1,5), P₂(2 | 3), P₃(4 | −1): I a − b + c = 1,5; II 4a + 2b + c = 3; III 16a + 4b + c = −1. IV = II − I: 3a + 3b = 1,5; V = III − I: 15a + 5b = −2,5. 5·IV − 3·V: −30a = 15, a = −1/2; aus IV: −1,5 + 3b = 1,5, b = 1; aus I: −0,5 − 1 + c = 1,5, c = 3. Probe f(4) = −8 + 4 + 3 = −1 ✓. Scheitel x = −b/(2a) = 1, y = −0,5 + 1 + 3 = 3,5. Anzeige „f(x) = −½x² + x + 3“, „S(1 | 3,5)“ ✓
  2. Gezogen P₁ auf (−1 | 0): IV 3a + 3b = 3, V 15a + 5b = −1 → 15a + 5(1 − a) = −1, a = −3/5, b = 8/5, c = b − a = 11/5. Scheitel x = (8/5)/(6/5) = 4/3, y = 11/5 + (64/25)/(12/5) = 11/5 + 16/15 = 49/15 ≈ 3,267. Anzeige a = −3/5 = −0,6, b = 8/5 = 1,6, c = 11/5 = 2,2; Rechenweg „−30a = 18 ⇒ a = −3/5“ ✓; Scheitel jetzt „S(4/3 | 49/15) ≈ S(1,333 | 3,267)“ (vorher nur gerundet ohne ≈, s. u.).
  3. P₁(−3 | 0), P₂(0 | 3), P₃(4 | 1): c = 3 aus II; IV 9a − 3b = −3, V 16a + 4b = −2; 4·IV + 3·V: 84a = −18, a = −3/14; b = 3a + 1 = 5/14. Anzeige „84a = −18 ⇒ a = −3/14“, „4·IV + 3·V“, Term „f(x) ≈ −0,21x² + 0,36x + 3“ ✓. Scheitel 5/6 | 529/168 ≈ (0,833 | 3,149) ✓
  4. Scheitelform-Beispiel (−1 | 2), (1 | −2), (2 | −1): 2 = a(−1 − 1)² − 2 → 4a = 4, a = 1; f(x) = x² − 2x − 1; Probe f(2) = 1² − 2 = −1 ✓. Nullstellenform-Beispiel: 4 = a(1 + 1)(1 − 3) = −4a, a = −1, f(x) = −x² + 2x + 3 ✓
- **Sonderfälle:** gleiches x mit verschiedenem y → „0 = −4,5, II − I: Widerspruch!“, senkrechte gestrichelte Linie mit „x = 1“, Hinweis „gleiches x: keine Funktion“ ✓; zwei Punkte gleich → „0 = 0, immer wahr“, Schar gestrichelter Parabeln ✓; alle drei gleich → im Bild „durch diesen einen Punkt“, im Ergebnisfeld stand aber „P₁ und P₂ fallen zusammen. Es bleiben nur zwei Gleichungen …“ (falsch, es bleibt nur eine) → behoben; Punkte auf einer Geraden → a = 0, „Gerade, keine Parabel“ ✓; Punkt auf der y-Achse → c direkt abgelesen ✓. Division durch 0 tritt nicht auf (Sonderfälle vorher abgefangen, aCoef ≠ 0 bei verschiedenen x). Reglergrenzen ±6 im 0,5er-Raster: Zähler/Nenner bleiben sichere Ganzzahlen (neuer Test).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** durchgehend `fmt`, echtes Minus; Term im Bild auf zwei Stellen mit „≈“ bei Rundung. Scheitel (Ergebnisfeld und Bild) wurde bei nicht abbrechenden Werten gerundet ohne „≈“ angezeigt → behoben (Ergebnisfeld: Bruch und gerundeter Wert; Bild: „S ≈ (…)“). Anwendungen mit Achsen „x in m“, „y in m“.
- **Begriffe wie im Unterricht:** Ansatz, Einsetzen, Additionsverfahren, Scheitelform, Nullstellenform, Probe, Symmetrieachse – passend.
- **Neue/ergänzte Tests:** Scheitel des Startzustands; nicht abbrechender Scheitel 4/3 | 49/15 exakt; drei zusammenfallende Punkte; Nullstellenform mit Nullstelle im Ursprung; Reglergrenzen (±6, ±5,5, ±0,5) mit Ganzzahl-Sicherheit und Übereinstimmung Rechenweg/direkte Lösung (4 neue Tests, 16 gesamt).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 c = 1, a + b = −1, 4a + 2b = 2 → 2a = 4, f(x) = 2x² − 3x + 1 ✓; A2 1 = 4a − 3, a = 1, x² − 4x + 1, (0 | 1) liegt drauf ✓; A3 4 = −8a, a = −½, −½x² + x + 4 ✓; A4 2b = 4, 5,25a + 3 = 3 → a = 0, c = 1, Gerade y = 2x + 1 ✓; A5 16a + y_S = 1, 4a + y_S = 4 → a = −¼, y_S = 5, −¼x² − ½x + 4,75, Landepunkt −1 + √20 ≈ 3,47 (Ball fliegt in der Simulation bis zur größeren Nullstelle 3,47) ✓; A6 a = −1/5, f(3) = −9/5 + 5 = 3,2 m ✓. Keine Rechenfehler.
- **„Beispiel laden“ geklickt:** alle 7 Beispiele und alle Links im Lernmaterial (DE 7 Ausprobieren-Links, 1 Aufgabenlink mit `calc=0&_hide=1`, 6 Lösungslinks) geladen – Zustände passen zum Text; Aufgabenlink verdeckt Rechenweg und Ergebnisse, die Parabel bleibt sichtbar.
- **Texte vereinfacht/korrigiert:** DE A5: „(Einheit 1 m)“ → „(Koordinaten in m)“, Hilfsvariable „e“ → „y_S“ (wie im Ansatz oben), Landepunkt als Antwortsatz. EN um fehlende Inhalte ergänzt (Ausprobieren: Normalparabel, zusammenfallende Punkte, Scheitelform; Aufgaben: Nullstellenform und Wurfbahn, Begründung zu „Parabel oder nicht?“, Ansatz in A2), Hinweis zum Lehrplan und zum Rechenweg in „Ideas for the classroom“.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Karten vorhanden; Handy: Koordinatensystem oben, Rechenweg-Karte darunter; ab 640 px nebeneinander. Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine gefunden. Punktbeschriftungen werden im Bild gehalten; liegt der Scheitel auf/nahe einem Punkt, wird „S(…)“ ausgeblendet (gewollt). Kein waagerechter Überlauf, keine Konsolenfehler (403 nur Schriften über den Symlink).
- **Touch (Ziehen) und Maus:** Ziehen von P₁ mit der Maus geprüft (rastet auf 0,5 ein, Rechenweg und Ergebnisse folgen, siehe Wert 2); Ziehen läuft über die Griffe von `Plot` (Zeiger-Ereignisse, also auch Touch).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Schritt-Animation und Ballwurf entfallen dann; Rechenweg steht sofort vollständig da).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** alles über Regler, Auswahl und Schalter erreichbar; Reihenfolge laut Bogen passend.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. `strings.canvas` um Sonderfälle und Anwendungen (Ball, Brückenbogen) ergänzt (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Bedeutungsfarben aus `ctx.theme.series`; Karten-Hintergrund, Rahmen, Trennlinien und Pillen-Hintergrund waren feste Hex-Werte → jetzt aus `th().bg`, `th().grid`, `th().gridMinor`. Materialfarben (Erde, Stein, Fahrbahn) bleiben fest, tragen aber keine Bedeutung. Punkte sind zusätzlich über Namen P₁/P₂/P₃ und römische Ziffern I/II/III unterscheidbar; Sonderfälle über Strichart (gestrichelt) und Text.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/parabel-drei-punkte/index.ts` | Ergebnis „Sonderfall“ bei drei zusammenfallenden Punkten mit richtigem Text |
| `src/simulations/mathematik/parabel-drei-punkte/index.ts` | Scheitel im Ergebnisfeld exakt als Bruch mit „≈“-Näherung; im Bild „S ≈ (…)“ bei Rundung |
| `src/simulations/mathematik/parabel-drei-punkte/index.ts` | Karten-/Pillenfarben aus dem Theme statt fester Hex-Werte; Alt-Text ergänzt (DE/EN) |
| `tests/parabel-drei-punkte.test.ts` | 4 neue Tests (Scheitel, Bruch-Scheitel, Sonderfälle, Reglergrenzen) |
| `src/content/simulations/de/parabel-drei-punkte.md` | Aufgabe 5: Einheitenangabe, y_S statt e, Antwortsatz |
| `src/content/simulations/en/parabel-drei-punkte.md` | fehlende Ausprobieren-Punkte und Aufgaben ergänzt, Lehrplanhinweis |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Schreibweise „S ≈ (1,33 | 3,27)“ im Bild ist knapp; alternativ „S(≈ 1,33 | ≈ 3,27)“. Bitte bei Gelegenheit einheitlich festlegen.
- „Ball werfen“ tut bei reduzierter Bewegung nichts (ohne Hinweis). Für die Barrierefreiheit unkritisch, aber eventuell als Standbild der Landestelle sinnvoll.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2863/2863 grün (125 Dateien), Build ok.
