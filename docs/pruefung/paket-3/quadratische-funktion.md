# Prüfprotokoll: `quadratische-funktion` – Quadratische Funktion

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `2ae07f1` · Bogen: `/tmp/boegen3/quadratische-funktion.png`

## Ergebnis
korrigiert (eine Rückfrage zur bayerischen Schreibweise offen)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Beispiel „Nach unten geöffnet, gestaucht“ (a = −0,5, d = 1, e = 3): b = −2ad = −2 · (−0,5) · 1 = 1, c = ad² + e = −0,5 + 3 = 2,5 ⇒ „f(x) = −0,5x² + x + 2,5“ ✓. D = 1² − 4 · (−0,5) · 2,5 = 1 + 5 = 6 (= −4ae = 6) ⇒ „6 – positiv“ ✓. Nullstellen x = (−1 ± √6) : (−1) = 1 ∓ √6 ⇒ −1,449… und 3,449… ⇒ Anzeige jetzt „x₁ ≈ −1,45, x₂ ≈ 3,45“ ✓ (vorher „=“, siehe Korrekturen).
  2. Aufgabe 2 / Lösungslink (a = 2, b = −4, c = −6): d = −b/(2a) = 4/4 = 1, e = c − b²/(4a) = −6 − 16/8 = −8 ⇒ „S(1 | −8)“, „f(x) = 2(x − 1)² − 8“ ✓; D = 16 + 48 = 64, x = (4 ± 8)/4 = −1 bzw. 3 ⇒ „f(x) = 2(x + 1)(x − 3)“ ✓.
  3. Allgemeine Form a = 3, b = 1, c = −1: d = −1/6 ≈ −0,17, e = −1 − 1/12 = −13/12 ≈ −1,08 ⇒ „f(x) ≈ 3(x + 0,17)² − 1,08“, „S(−0,17 | −1,08) (gerundet)“ ✓; D = 1 + 12 = 13, x = (−1 ± √13)/6 ⇒ −0,768… und 0,434… ⇒ „x₁ ≈ −0,77, x₂ ≈ 0,43“ ✓.
  4. Ballwurf (a = −0,2, d = 5, e = 6): b = 2, c = −0,2 · 25 + 6 = 1, D = 4 + 0,8 = 4,8 ✓, x₂ = 5 + √30 = 10,477… ⇒ „x₂ ≈ 10,48“ ✓.
- **Sonderfälle:**
  - a = 0: „keine Parabel, sondern eine lineare Funktion“, kein Scheitel, Ziehpunkte gesperrt ✓. **Fehler behoben:** Bei a = 0 und e = 0 (bzw. b = c = 0) stand „keine reellen Nullstellen“, obwohl f(x) = 0 für alle x gilt → jetzt „jede Zahl x ist Nullstelle (f(x) = 0)“.
  - D = 0 (Beispiel „Doppelte Nullstelle“, Normalparabel): N und S lagen übereinander, die Beschriftung N verschwand unter S → jetzt eine Beschriftung „S = N“.
  - Reglergrenzen: a = ±3, d, e = ±8; S(8 | −8) bei a = −3 ist nach der Korrektur auch am Handy samt Ziehpunkt im Bild.
  - **Fehler behoben (Ziehen in der allgemeinen Form):** b und c sind auf ±20 begrenzt. Wurde der Scheitel z. B. bei a = 3 weiter als x ≈ 2,6 gezogen, schnitten b/c ab und der Scheitel sprang an eine ganz andere Stelle (bis y ≈ −13). Jetzt bleibt die Höhe erhalten und d stoppt am darstellbaren Rand (a = 3, e = 0: |d| ≤ √(20/3) ≈ 2,58; im Test nachgerechnet, mit simshot gezogen: „S(2,58 | −0,02)“). Beim Ziehen des hohlen Punkts (a) wird ein nicht darstellbares a übersprungen.
  - Bekannt, nicht geändert: Wechselt man bei großen Werten (z. B. a = 3, d = 8) von der Scheitelpunktform in die allgemeine Form, werden b und c an ±20 abgeschnitten und die Parabel ändert sich. Die Reglerbereiche zu vergrößern hätte die Bedienung aller anderen Fälle verschlechtert.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und echtes Minus überall (EN: Dezimalpunkt, „S(−0.17, −1.08)“). **Behoben:** Nullstellen, Linearfaktorform, Scheitelpunktform und Scheitel zeigten auch gerundete Werte mit „=“ (z. B. „x₂ = 10,48“, „f(x) = −0,5(x + 1,45)(x − 3,45)“) → jetzt „≈“ bzw. „(gerundet)“, sobald eine Zahl nicht exakt mit zwei Nachkommastellen darstellbar ist; exakte Werte behalten „=“. Diskriminante ist bei Schrittweite 0,1 immer exakt (b² − 4ac bzw. −4ae).
- **Begriffe wie im Unterricht:** Scheitelpunktform, allgemeine Form, Linearfaktorform, Streckfaktor, gestreckt/gestaucht, Diskriminante, doppelte Nullstelle – passend. **Behoben:** Linearfaktorform zeigte „2(x)²“ bzw. „(x)(x − 3)“ → jetzt „2x²“ bzw. „x(x − 3)“.
- **Neue/ergänzte Tests:** neue Datei `tests/quadratische-funktion.test.ts` mit 14 Tests (Umrechnen beider Richtungen, Aufgaben 1–4, Beispiele „Keine Nullstellen“/„Doppelte Nullstelle“, D = −4ae, a = 0, gerundet/exakt, Begrenzung beim Ziehen). Die bestehenden Modelltests in `tests/simulations.test.ts` bleiben unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 S(−2 | −4,5), a = 0,5, (x + 2)² = 9 ⇒ −5 und 1 ✓; A2 2x² − 4x − 6, Nullstellen −1, 3 ✓; A3 D = −8 / 0 (x = 2) / 4 (x = ±2) ✓; A4 höchster Punkt 6 m bei x = 5, Landung 5 + √30 ≈ 10,5 m ✓ (Start in h(0) = 1 m Höhe, „wie weit“ also ab x = 0 – passt).
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle 10 Links im Lernmaterial (DE und EN gleich) mit simshot geladen, Anzeigen stimmen. **Behoben:** Beim Lösungslink zu Aufgabe 2 lag S(1 | −8) unterhalb des Bildes (y-Bereich ab −6). Jetzt wird der Bereich beim Laden (Start, Link, Beispiel, Zurücksetzen) so erweitert, dass S und der Punkt (d + 1 | e + a) im Bild sind; beim Ziehen und an den Reglern bleibt der Maßstab fest. Beim Ballwurf liegt x₂ ≈ 10,48 knapp am Rand – das Lernmaterial verlangt dort ausdrücklich Herauszoomen.
- **Texte vereinfacht/korrigiert:**
  - EN war deutlich kürzer: Quadratische Ergänzung, Nullstellen-Tabelle, Ausprobieren 4 (Streckfaktor-Dreieck), Aufgaben 2 und 3, ausführliche Lösung zu 1, Einsatz, Stolpersteine einzeln, regionale Unterschiede (pq/abc), Hinweis zur bayerischen Schreibweise fehlten → auf den Stand der DE-Fassung gebracht.
  - DE/EN: Ausprobieren 4 nennt jetzt den ziehbaren hohlen Punkt; neue Unterrichtsidee „Gerundete Werte“ (≈ und exakter Wert 5 + √30).
  - EN-Hilfetext zur Schreibweise nennt wie DE den LehrplanPLUS.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Unter 640 px Bild über Einstellungen und Ergebnissen, sonst Einstellungen rechts; Ergebnisse stehen bei breiten Ansichten unter den Einstellungen (Seitenlayout des Kerns). Kein Überlauf, keine Konsolenfehler (nur 403 bei Schriften über den Symlink).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** Überlappung N/S bei doppelter Nullstelle behoben (s. o.). Neue Beschriftung „y = x²“ am linken Ast der Normalparabel liegt in allen Bögen frei. Am Handy (360 px) mit S(8 | −8), a = −3 waren Scheitel und Ziehpunkt am Rand angeschnitten → durch den erweiterten Ladebereich jetzt im Bild.
- **Touch (Ziehen) und Maus:** Scheitel bei 1360 px um 72 px nach rechts und oben gezogen ⇒ S(2 | 2) (36 px je Einheit), Punkt bleibt unter dem Zeiger ✓. Allgemeine Form, a = 3: Scheitel stoppt am darstellbaren Rand statt zu springen ✓. Maßstab bleibt beim Ziehen fest.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (keine Animation)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles auch über Regler einstellbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. `strings.canvas` war nur „Koordinatensystem mit dem Graphen …“ → beschreibt jetzt f, S, N1/N2, gestrichelte Normalparabel und Symmetrieachse, die beiden Ziehpunkte und das Dreieck (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Alle Farben aus `ctx.theme` (keine festen Hex-/rgba-Werte). Normalparabel war nur über Grau und Strichart erkennbar → jetzt zusätzlich mit „y = x²“ beschriftet; f, S, N sind beschriftet, Symmetrieachse gestrichelt.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/quadratische-funktion/index.ts` | „≈“/„(gerundet)“ bei gerundeten Nullstellen, Formen und Scheitel |
| `src/simulations/mathematik/quadratische-funktion/index.ts` | Linearfaktorform „2x²“/„x(x − 3)“ statt „2(x)²“/„(x)(x − 3)“ |
| `src/simulations/mathematik/quadratische-funktion/index.ts` | a = 0 und f ≡ 0: „jede Zahl x ist Nullstelle“ |
| `src/simulations/mathematik/quadratische-funktion/index.ts` | Bereich beim Laden erweitert (S und Ziehpunkt im Bild) |
| `src/simulations/mathematik/quadratische-funktion/index.ts` | Allgemeine Form: Scheitel/a beim Ziehen auf den Bereich von b, c begrenzt |
| `src/simulations/mathematik/quadratische-funktion/index.ts` | „S = N“ bei doppelter Nullstelle; Beschriftung „y = x²“; ausführlicher Alt-Text; EN-Hilfetext |
| `src/simulations/mathematik/quadratische-funktion/model.ts` | `isRounded`, `clampVertexForGeneral`, `fitsGeneral` |
| `tests/quadratische-funktion.test.ts` | neu, 14 Tests |
| `src/content/simulations/de/quadratische-funktion.md` | hohler Ziehpunkt, Unterrichtsidee „Gerundete Werte“ |
| `src/content/simulations/en/quadratische-funktion.md` | auf den Stand der DE-Fassung gebracht |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Hilfetext und Lernmaterial sagen, der LehrplanPLUS Bayern schreibe die Scheitelpunktform als a · (x + d)² + e. Das habe ich nicht am Lehrplantext überprüfen können; bitte bestätigen (sonst Hilfetext und Unterrichtsidee anpassen). Unverändert gelassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2901/2901 grün (127 Dateien), Build ok.
