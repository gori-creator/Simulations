# Prüfprotokoll: `doppler-effekt` – Doppler-Effekt

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `5c7451a` (inkl. Zwischenstand eines unterbrochenen Prüfdurchgangs) · Bogen: `scratchpad/boegen/doppler-effekt.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus zeigte Frequenzen, α und λ-Werte im Bild nur abhängig vom Schalter, nicht von `_hide`; „Ma = 1,00 < 1“ bei v_Q = 339 m/s; λ_v = „0,002 m“ passte nicht zu f_v = 149 600 Hz; auf dem Handy waren „α = 30,0°“ und die Radialkomponenten in der Karte rechts abgeschnitten; uneinheitliche Rundung; unpassender Ziehen-Tipp; Lösungen von A1/A4 erklären jetzt die Abweichung durch den Seitenabstand; 4 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startbild (f_Q = 440 Hz, v_Q = 34 m/s, d = 20 m, x_B = 40 m, t = 2,95 s): Anzeige 440 Hz · 340/(340 − 33,0) = 440 · 340/307 = 487,3 Hz ✓.
  2. „Direkt an der Straße“ (d = 6 m, x_B = 20 m, Start x₀ = −134 m, t = 2,95 s): Laufzeitgleichung näherungsweise 154 − 34τ = 340 · (2,95 − τ) → τ ≈ 2,775 s, Quelle bei x = −39,7 m; Δx = 59,7 m, Δy = 6 m → cos = 0,995, v_Q,r = 33,83 m/s → f_B = 440 · 340/306,17 = 488,6 Hz ✓ (Anzeige 488,6 Hz).
  3. Beobachter läuft (v_B = 34 m/s, ruhende Quelle): 440 · 374/340 = 484,0 Hz ✓; beide bewegt (Anzeige 536,4 Hz bei v_Q,r = v_B,r = 33,6 m/s): 440 · 373,6/306,4 = 536,5 ≈ 536,4 Hz (Rundung der Komponenten) ✓; Formel ohne Seitenabstand 440 · 374/306 = 537,8 Hz.
  4. Wellenlängen: λ_v = 306/440 = 0,695 m, λ_h = 374/440 = 0,850 m, λ₀ = 340/440 = 0,773 m ✓; Mach 2: λ_h = 1020/440 = 2,318 m, f_h = 340/2,318 = 146,7 Hz ✓.
  5. Machscher Kegel: v_Q = 700 m/s → sin α = 0,486, α = 29,06° ≈ 29,1° ✓; v_Q = 341 m/s → α = arcsin(0,99707) = 85,6° ✓; Mach 2 → 30,0° ✓.
  6. Überschall mit v_B = −40 m/s, f = 1000 Hz: Anzeige 1000 · (340 + 25,2)/(340 + 441,2) = 467,5 Hz ✓ (Vorzeichen der Radialkomponenten plausibel: Quelle entfernt sich, Beobachter läuft hinterher).
- **Sonderfälle:** v_Q = 0 → 440,0 Hz, λ = 0,773 m ✓. v_Q = c: `wavelengthAhead` liefert `null` („vorn: keine Wellen“), Machzahl-Text „Schallmauer“, `arrivals` nutzt den linearen Zweig (a = 0) ohne Division durch 0; bei d ≥ 6 m ist v_Q,r < c, also endliche (große) Frequenzen, sonst `Infinity` → „Stille“-Zweig, nie NaN (Test). v_Q = 339 m/s: f_v = 149 600 Hz, Diagramm wird abgeschnitten, kein Absturz. v_Q > c: Stille vor dem Kegel, Knall, danach zwei Signale (Test vorhanden). Reglergrenzen f = 200/1000 Hz, v_Q = 700 m/s, v_B = ±40 m/s, d = 6/40 m, x_B = ±110 m geprüft.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Alle Werte jetzt mit `fmt.fixed` (f 1 Stelle, λ 3 Stellen, Ma 2 Stellen, α 1 Stelle), Radialkomponente 0 ohne „−0,0“. Neu: Ma knapp neben 1 mit 3 Stellen (0,997 / 1,003) statt „1,00 < 1“; λ_v unter 0,01 m mit 5, unter 0,1 m mit 4 Stellen, damit c/λ_v zur angezeigten Frequenz passt. Zahl und Einheit im Bild mit `withUnit`.
- **Schallgeschwindigkeit:** überall einheitlich c = 340 m/s (Modell, Pillen, Texte, Aufgaben); im Lernmaterial ergänzt: 15 °C, bei 20 °C 343 m/s.
- **Begriffe wie im Unterricht:** Quelle/Beobachter, f_Q/f_B, Wellenfront, Wellenlänge vorn/hinten, Machzahl, Schallmauer, Machscher Kegel, Überschallknall ✓.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/doppler-effekt.test.ts` (Prüfwert A1 mit Seitenabstand; Aufgabenwerte 2–6; Grenzfälle v_Q = 0, 339, 341, 700 m/s und v_Q = c ohne NaN; Reglergrenzen v_B); jetzt 20 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 488,9 Hz / 400 Hz ✓. A2 0,695 m, 0,85 m, 0,773 m ✓. A3 484 Hz ✓. A4 537,8 Hz / 360 Hz ✓. A5 (c + v)/(c − v) = 1,2 → v = 340 · 0,2/2,2 = 30,9 m/s = 111 km/h ✓ (Link v_Q = 31: 371/309 = 1,2006). A6 α = 30°, 3000 m/tan 30° = 5196 m, /680 m/s = 7,6 s ✓.
- **Aufgabenmodus:** Links mit `val=0&_hide=1` geprüft: Karte „? Hz“, Diagramm ohne Achsenzahlen und Grenzlinien-Werte, Klammern nur „22 λ_v“, α-Wert verdeckt, alle Ergebnisse verdeckt ✓. Wird nur „Wellenlängen“ aufgedeckt, erscheinen die λ-Werte an den Klammern.
- **„Beispiel laden“ geklickt:** alle sechs (Vorbeifahrt, direkt an der Straße, Beobachter läuft, beide bewegt, Schallmauer, Mach 2) und alle Aufgaben-/Ausprobieren-Links geladen; Zustände passen.
- **Texte vereinfacht/korrigiert:** DE: 343 m/s bei 20 °C ergänzt; A1 und A4 erklären, warum die Simulation wegen 6 m Seitenabstand etwas weniger zeigt (488,6 bzw. 536,4 Hz). Hilfetext zu v_Q zeigt jetzt km/h passend zum Wert und den Bezug zu c. EN fachlich korrekt, darf kürzer sein → unverändert.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung; iPad quer nutzt das breite Layout mit Diagramm und Karte nebeneinander, gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Handy bei Überschall: „α = 30,0°“ lag rechts außerhalb, sobald das Flugzeug das Bild verlassen hatte → am Rand begrenzt. Karte auf dem Handy: „v_Q,r = … · v_B,r = …“ rechts abgeschnitten → volle Zeile nur, wenn sie passt, sonst nur v_Q,r. Rest (nicht geändert): Bei v_Q = c berührt „v_Q = 340 m/s“ die gestaute Wellenfront.
- **Touch (Ziehen) und Maus:** Beobachter mit der Maus gezogen (d 20 → 40 m, x_B 40 → −31 m), Regler folgen, f_B = 447,3 Hz passend ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung. Ziehen des Beobachters ist Komfort; Abstand und Standort sind über die Regler d und x_B erreichbar → kein `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Werte zusätzlich in den Ergebnissen.
- **Farben:** aus `ctx.theme.series`; höher/tiefer zusätzlich als Text („höher als f_Q“, Skala „tiefer/höher“), Kegel und Knall beschriftet – nicht nur über Farbe ✓.
- **Ton:** startet nur auf Knopfdruck („Ton anhören“), Standard aus ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/doppler-effekt/index.ts` | Aufgabenmodus: Werte im Bild über `ctx.hidden` (Schalter `val` ist `resultsParam`), λ-Werte an den Klammern über `ctx.isHidden('lam')` |
| `src/simulations/physik/doppler-effekt/index.ts` | einheitliche Rundung mit `fmt.fixed`, Radialkomponente ohne „−0,0“, Ma knapp neben 1 mit 3 Stellen, λ_v bei kleinen Werten mit mehr Stellen |
| `src/simulations/physik/doppler-effekt/index.ts` | Handy: α-Beschriftung am Rand begrenzt, Radialkomponenten nur wenn sie passen |
| `src/simulations/physik/doppler-effekt/index.ts` | eigener `hint`, Hilfetext zu v_Q als Funktion, „tiefer/höher“ über `strings`, „Momentan“ mit `<var>` |
| `src/content/simulations/de/doppler-effekt.md` | 343 m/s bei 20 °C; A1/A4 Abweichung durch Seitenabstand erklärt |
| `tests/doppler-effekt.test.ts` | 4 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- nichts

## 7. Entscheidungen
- **Zwischenstand des unterbrochenen Durchgangs übernommen**, nach Prüfung: `show()` = `!ctx.hidden` ist richtig, weil `val` bereits `resultsParam` ist (Schalter aus ⇒ `ctx.hidden`). Die dort eingeführte Machzahl mit 2 Stellen erzeugte aber „1,00 < 1“ → korrigiert.
- **c = 340 m/s beibehalten** statt 343 m/s: Schulbücher rechnen meist mit 340 m/s, alle Aufgaben bauen darauf auf; 343 m/s bei 20 °C als Hinweis im Material.
- **Seitenabstand in A1/A4 erklärt statt d = 0 zu erlauben:** d ≥ 6 m verhindert die Division durch 0 bei v_Q = c und hält den Beobachter neben der Fahrbahn; die Abweichung (0,3 bzw. 1,4 Hz) ist lehrreich.
- **Radialkomponenten auf dem Handy gekürzt statt kleiner geschrieben:** Die Schrift ist schon 11,5 px; v_Q,r ist der wichtigere Anteil, der vollständige Wert steht in den Ergebnissen.
- **Machzahl-Pille im Aufgabenmodus sichtbar:** Ma = v_Q/c folgt direkt aus der Eingabe und verrät keine Aufgabe.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3409/3409 grün (148 Dateien), Build ok.
