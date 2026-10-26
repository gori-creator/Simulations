# Prüfprotokoll: `reflexion` – Reflexion am ebenen Spiegel

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `a7d9689` · Bogen: `scratchpad/boegen/reflexion.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Meldung bei streifendem Einfall, abgeschnittener Hinweis im Winkelspiegel, Lernmaterial EN ergänzt, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Aufgabe 2 / Link `?la=30&tilt=10`: α = 30° − 10° = 20°; reflektierter Strahl vorher 2·0 − 30 = −30°, jetzt 2·10 − 30 = −10° → Drehung 20° = 2 · 10°. Anzeige „α = 20° · α′ = 20°“, „90° − α = 70°“, „dreht sich um 20°“ ✓. Ebenso `?la=40&tilt=15`: α = 25°, 90° − 25° = 65°, Drehung 30° ✓.
  2. Spiegelbild, Grundeinstellung (g = 25 cm, h = 18 cm, Auge 50 cm vor dem Spiegel in 32 cm Höhe): Sehlinie Auge → Bildpunkt schneidet den Spiegel bei t = 50/75 = 2/3. Fuß: y = 32 − 32 · 2/3 ≈ 10,7 cm; Flamme: y = 32 − (32 − 18) · 2/3 ≈ 22,7 cm; Länge 18 · 50/75 = 12 cm. Anzeige „Von 10,7 cm bis 22,7 cm Höhe (12 cm lang)“ ✓. Nach Ziehen der Kerze auf g = 13 cm: t = 50/63, Fuß 32 − 25,4 = 6,6 cm, Flamme 32 − 11,1 = 20,9 cm. Anzeige „6,6 cm bis 20,9 cm (14,3 cm)“ ✓.
  3. Beispiel „Zu kleiner Spiegel“ (Auge ex = 42, Spiegel 14–24 cm): t = 42/67; Fuß y = 32 − 32 · 0,627 ≈ 11,9 cm < 14 → verfehlt; Flamme y = 32 − 14 · 0,627 ≈ 23,2 cm ✓ → „Das Auge sieht nur die Flamme“ ✓.
  4. Aufgabe 4 (Modell): Auge über der Kerze (40 cm), Kerze 30 cm: Fuß bei 40/2 = 20 cm, Spitze bei (40 + 30)/2 = 35 cm, unabhängig von g = 30 oder 40 cm. Anzeige beide Male „20 cm bis 35 cm (15 cm lang)“ ✓.
  5. Winkelspiegel: 90° → 360 : 90 − 1 = 3 Bilder ✓, 60° → 5 ✓, 45° → 7 ✓ (Anzeige jeweils gleich); 120° (ungerade) bei Figurlage 36 % → 3 Bilder mit Hinweis „keine gerade Zahl“ ✓.
- **Sonderfälle:** senkrechter Einfall `?la=0` → α = α′ = 0°, 90° − α = 90° ✓; fast streifend `?la=85` → α = 85°, 5° zur Fläche ✓; genau streifend (`?la=85&tilt=−5`, α = 90°) meldete „trifft die Rückseite“ → korrigiert (s. u.); Rückseite `?la=70&tilt=−30` (α = 100°) → Meldung, kein reflektierter Strahl, „Messwert aufnehmen“ trägt nichts ein ✓. Spiegel-Unter-/Oberkante halten 3 cm Abstand (in `update` nur bei `source === 'input'`) ✓. Gegenstand hinter dem Spiegel wird nicht gesehen (Test).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm und ° überall, Dezimalkomma über `fmt.num` (EN Punkt) ✓; Winkel als Beträge angezeigt ✓.
- **Begriffe wie im Unterricht:** Einfallslot/Lot, Einfallswinkel, Reflexionswinkel, Gegenstandsweite g, Bildweite b, virtuelles Bild, Winkelspiegel ✓.
- **Neue/ergänzte Tests:** 12 Tests in `tests/reflexion.test.ts` (Aufgaben 1, 2, 4, 5, 6, Ausprobieren „Spiegel um 15°“, senkrechter und streifender Einfall, Grundeinstellung Spiegelbild, Beispiel „Zu kleiner Spiegel“, Gegenstand hinter dem Spiegel, Abstand zum Scharnier); jetzt 31 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 65°/65°/130° ✓, A2 20°, Drehung 20° ✓, A3 3 m, 2 m/s ✓, A4 0,80 m/1,65 m/0,85 m ✓, A5 7 / 60° / 60° ✓, A6 zwei Spiegelungen → nicht seitenverkehrt, Drehung um 180° ✓. Alle Links setzen gültige Werte und zeigen den beschriebenen Zustand.
- **„Beispiel laden“ geklickt:** alle sechs (Reflexionsgesetz, Spiegel drehen, Kerze vor dem Spiegel, Zu kleiner Spiegel, Winkelspiegel 90°, Winkelspiegel 60°) – Anzeigen passen zum Bild. `_hide=1` in Aufgabe 2 verdeckt die Winkel („Aufdecken“) ✓.
- **Texte vereinfacht/korrigiert:** DE in Ordnung (kurze Sätze, Du-Form in Aufgaben). EN war deutlich kürzer: Ausprobieren-Punkte 2, 4, 8, Aufgabe „Turning the mirror“, Aufgabe 5 a/c, Aufgabe 6 und die Stolpersteine/Ideen ergänzt; Lösungen und Links an DE angeglichen.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten in Ordnung; iPad quer nutzt das breite Layout, Messreihe und Diagramm daneben.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** Im Winkelspiegel (1360 px, φ = 120°) wurde der Hinweis „Tippe auf ein Bild, um seinen Lichtweg zu …“ mitten im Satz abgeschnitten, wenn die zweite Zeile nicht mehr passte → korrigiert. Sonst nichts gefunden.
- **Touch (Ziehen) und Maus:** mit der Maus geprüft: Laser ziehen (α 40° → 76°), Spiegelende ziehen (Drehung, α → 14°), Kerze ziehen (g 25 → 13 cm), Bild im Winkelspiegel antippen („Spiegel 1 dann Spiegel 2 – nicht seitenverkehrt“) ✓. Finger über dieselben Pointer-Ereignisse, nicht separat getestet.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON sinnvoll; alle Werte auch über Regler einstellbar (Laser, Drehung, Kerze, Auge, Spiegelkanten, Winkel, Figur).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas mit Beschreibung (`canvas`-Text); alle Ergebnisse zusätzlich als Text in der Ergebnisliste. Das Antippen einzelner Bilder im Winkelspiegel geht nur mit Zeiger (siehe „Für den Kern“).
- **Farben:** nur `ctx.theme`; seitenverkehrt/nicht seitenverkehrt zusätzlich über Fähnchenrichtung und Zahl der Spiegelungen unterscheidbar; Laser rot, aber immer mit Beschriftung α/α′.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/reflexion/index.ts` | Bei α = ±90° eigene Meldung „Das Licht streift genau an der Spiegelfläche entlang“ statt „trifft die Rückseite“ (Bild und Ergebnis) |
| `src/simulations/physik/reflexion/index.ts` | Tipp-Hinweis im Winkelspiegel nur zeigen, wenn er ganz hineinpasst (vorher halber Satz) |
| `src/content/simulations/en/reflexion.md` | fehlende Ausprobier-Punkte, Aufgaben 2, 5 a/c, 6 und Unterrichtsideen ergänzt; gleichwertig zu DE |
| `tests/reflexion.test.ts` | 12 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Tastaturbedienung für antippbare Canvas-Ziele (`TapTarget`): Die Bilder im Winkelspiegel lassen sich nur mit Zeiger auswählen. Eine allgemeine Lösung (z. B. Pfeiltasten auf dem Canvas wechseln die Auswahl) wäre im Kern sinnvoll.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Lehrplanbezug im DE-Lernmaterial („bayerisches Gymnasium, Physik Jgst. 7, Vorbereitung in Natur und Technik“) ist als Entwurf gekennzeichnet; bitte am LehrplanPLUS prüfen.
- Das Diagramm „Anzahl der Bilder bei anderen Winkeln“ zählt bei ungeradem 360° : φ nach der Lage der Figur (z. B. 4 Bilder knapp über 90°). Das entspricht der Konstruktion, ist für Jgst. 7 aber anspruchsvoll – lassen oder nur für die geraden Fälle zeigen?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2876/2876 grün (125 Dateien), Build ok.
