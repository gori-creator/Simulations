# Prüfprotokoll: `wellen-ausbreitung` – Transversal- und Longitudinalwellen

Prüfer: Paket 1 (Vertretung) · Datum: 21.10.2026 · Stand: Commit `11d93c3` · Bogen: `scratchpad/boegen/wellen-ausbreitung.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus verriet λ im Bild und Δt = x/c im y(t)-Diagramm; bei kurzer Wellenlänge an den Reglergrenzen zeigte die Kette ein falsches Bild ohne Hinweis; Marken „Verdichtung/Verdünnung“ überlappten die Beschriftung; „Momentan“ mit springender Stellenzahl; unpassender Ziehen-Tipp; Lernmaterial um Wellenträger-Aufgabe, Momentbild/Zeitbild und Modellgrenze ergänzt; 2 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startbild (f = 0,8 Hz, c = 1,2 m/s, ŷ = 10 cm, Nr. 10): λ = 1,2/0,8 = 1,5 m, T = 1/0,8 = 1,25 s ✓. Startzeit: Partner bei 1 + 1,5 = 2,5 m → Front bei 2,8 m → t = 2,8/1,2 = 2,333 s ✓ („t = 2,33 s“). τ = 2,333 − 1/1,2 = 1,5 s, φ = 2π · 0,8 · 1,5 = 2,4π → y = 10 · sin(0,4π) = 9,51 cm ✓ („9,5 cm“); v = 0,1 · 2π · 0,8 · cos(0,4π) = 0,155 m/s ✓ („0,16 m/s“). Phasenrückstand x/λ = 1/1,5 = 0,67 Perioden = 240° ✓.
  2. Zeiger-Beispiel (f = 1 Hz, c = 1,6 m/s, Nr. 4): λ = 1,6 m, Startzeit max(2,4; 2,0 + 0,3)/1,6 = 1,5 s; y = 10 · sin(2π · (1,5 − 0,25)) = 10 · sin(2,5π) = 10 cm ✓. Zeiger alle 0,5 m: Δφ = 2π · 0,5/1,6 = 112,5° ✓ (im Bild sichtbar).
  3. Einzelpuls (Nr. 20): t = 0,42 · 4/1,2 + 0,625/2 = 1,7125 s ✓ („1,71 s“); Front 1,2 · 1,7125 = 2,055 m; y(2 m) = 10 · sin(2π · 0,8 · 0,0458) = 2,28 cm ✓ („2,3 cm“); Wellenberg bei 1,2 · (1,7125 − 0,3125) = 1,68 m ✓; Pulslänge λ/2 = 0,75 m ✓.
  4. Longitudinal (f = 0,6 Hz, ŷ = 12 cm): λ = 2 m, t = 3,2/1,2 = 2,667 s; y(1 m) = 12 · sin(2π · 0,6 · 1,833) = 12 · sin(0,2π) = 7,05 cm ✓ („7,1 cm“); Verdichtungen (φ = 2πn) bei 3,2 m (Front) und 1,2 m, Verdünnungen bei 2,2 m und 0,2 m ✓; 2π · 0,12/2 = 0,38 < 1 → keine Überholwarnung ✓.
  5. Dehnung ∂y/∂x = −v/c folgt aus y = y_E(t − x/c) ✓; Verdichtung bei φ = 0 (Teilchen am schnellsten in Ausbreitungsrichtung) ✓.
- **Sonderfälle:** Reglergrenze f = 2 Hz, c = 0,2 m/s → λ = 0,1 m = Teilchenabstand: Alle Teilchen schwingen gleichphasig, die Kette sah bewegungslos aus, Verdichtungsmarken überlappten – ohne Hinweis. Jetzt: `chainResolves` im Modell (λ ≥ 3 Teilchenabstände = 0,3 m), Pille „λ zu klein für die Kette“, Erklärung unter „Hinweis“, Verdichtungsmarken dann aus. f = 0,2 Hz, c = 2 m/s → λ = 10 m > Kette: kein gleichphasiger Partner, λ-Klammer entfällt, Zeitfenster 20 s ✓. Start (t = 0): Ruhe, Front bei 0 ✓. Überholen bei der Longitudinalwelle (2πŷ/λ ≥ 1) wird gemeldet ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** „Momentan“ zeigte y, v und Frontlage mit `fmt.num` (Stellenzahl sprang beim Abspielen) → jetzt `fmt.fixed` (Front 2, y 1, v 2 Stellen). Minus als „−“ ✓.
- **Begriffe wie im Unterricht:** Erreger, Wellenträger, Ausbreitungsgeschwindigkeit, Wellenfront, Wellenberg/-tal, Verdichtung/Verdünnung, gleichphasig/gegenphasig, Phasenunterschied ✓. „Momentbild“/„Zeitbild“ als gebräuchliche Zweitnamen im Material ergänzt.
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/wellen-ausbreitung.test.ts` (Prüfwerte 1–4 und Aufgabenwerte; Reglergrenzen kurze/lange Wellenlänge, Auflösungsgrenze, Wellenfront); jetzt 13 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 T = 1,25 s, λ = 1,5 m ✓. A2 T = 8/10 = 0,8 s, f = 1,25 Hz, c = 0,8 · 1,25 = 1,0 m/s ✓. A3 Δt = 3/1,2 = 2,5 s, Δφ = 2π · 3/1,5 = 4π ✓. A4 c gleich, T und λ halbiert (0,625 s, 0,75 m im Bild) ✓. A5 Verdichtung an der Nullstelle mit fallendem y(x) ✓ (passt zu Modell und Bild). A6 340/440 = 0,773 m; 340/50 = 6,8 m ✓. Neu A7: 1480/440 = 3,36 ≈ 3,4 m.
- **Aufgabenmodus:** Mit `_hide=1` stand „λ = 1,5 m“ an der Klammer in Kette und Momentaufnahme und „Δt = x/c = 2,5 s“ im y(t)-Diagramm (Lösung A3). Jetzt nur „λ“ bzw. „Δt“, solange „Wellenlänge“ bzw. „Markiertes Teilchen“ verdeckt sind.
- **„Beispiel laden“ geklickt:** alle sechs Beispiele und alle Aufgaben-/Ausprobieren-Links geladen; Zustände passen zu den Beschreibungen.
- **Texte vereinfacht/korrigiert:** DE: Momentbild/Zeitbild ergänzt; Ausprobieren 6 war missverständlich („von Teilchen zu Teilchen“, die Zeiger stehen aber nur alle 0,5 m bzw. 1 m) → „gegenüber seinem linken Nachbarn“, mit Formel zum Prüfen; A6 nennt 343 m/s bei 20 °C; neue A7 (gleicher Ton in Wasser: f bleibt, c und λ ändern sich); Modellgrenze unter „Ideen für den Unterricht“. EN fachlich korrekt, darf kürzer sein → unverändert.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung. iPad quer (1024 × 768) nutzt das Nebeneinander-Layout der Diagramme (untereinander nur bei `w < 640 && h > 0,9 w`), Szene groß genug. Handy: Kurzbeschriftungen („transversal“, „Front“, „y(x) in cm“) greifen.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Marken „Verdichtung/Verdünnung“ lagen bei kurzer Wellenlänge unter der Beschriftung → Marken unter Beschriftungen werden nicht mehr gezeichnet. Rest: Bei λ ≈ 0,3 m kreuzen die gestrichelten Hilfslinien der λ-Klammer in der Momentaufnahme die Beschriftung leicht.
- **Touch (Ziehen) und Maus:** Teilchen in der Kette mit der Maus gezogen (Nr. 10 → Nr. 35) ✓; Momentaufnahme antippen markiert, y(t) antippen setzt die Zeitmarke. Der Tipp unter der Bühne sprach von „markierten Punkten“ → eigener `hint`.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung. Antippen der Kette ist Komfort: Das markierte Teilchen ist auch über den Regler „Markiertes Teilchen Nr.“ wählbar, die Zeit über Abspielen/Zurück → kein `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Werte zusätzlich in den Ergebnissen.
- **Farben:** Diagramm- und Teilchenfarben aus `ctx.theme.series`; markiertes Teilchen zusätzlich größer und mit „Nr.“, Partner mit Ring und „λ“, Front gestrichelt mit Text – nicht nur über Farbe ✓. Szene (Kurbelscheibe, Maßband) mit festen Sachfarben, dunkel angepasst.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/wellen-ausbreitung/model.ts` | `MIN_RESOLVED_WAVELENGTH`, `chainResolves` (Auflösungsgrenze der Kette) |
| `src/simulations/physik/wellen-ausbreitung/index.ts` | Aufgabenmodus: λ-Wert und Δt-Wert im Bild verdeckt |
| `src/simulations/physik/wellen-ausbreitung/index.ts` | Hinweis und Pille bei λ < 0,3 m, Verdichtungsmarken dann aus |
| `src/simulations/physik/wellen-ausbreitung/index.ts` | keine Marken unter den Beschriftungen „Verdichtung/Verdünnung“ |
| `src/simulations/physik/wellen-ausbreitung/index.ts` | „Momentan“ mit fester Stellenzahl; eigener `hint` statt `dragHint` |
| `src/content/simulations/de/wellen-ausbreitung.md` | Momentbild/Zeitbild, Ausprobieren 6, 343 m/s, neue A7, Modellgrenze |
| `tests/wellen-ausbreitung.test.ts` | 2 neue Tests (Prüfwerte/Aufgaben, Reglergrenzen/Auflösung) |

## 6. Für den Kern (nicht selbst ändern)
- nichts

## 7. Entscheidungen
- **Kein `resultsParam`:** Der Schalter „Wellenlänge λ messen“ ist ein Messwerkzeug, kein Lösungsschalter; als `resultsParam` würde er beim Ausschalten auch alle Ergebnisse verdecken. Stattdessen zeigt die Klammer im Aufgabenmodus nur „λ“ – Messen am Maßband bleibt möglich.
- **Reglerbereiche unverändert, stattdessen Hinweis:** f bis 2 Hz und c ab 0,2 m/s bleiben (geteilte Links, lehrreicher Grenzfall). Unter λ = 0,3 m (weniger als drei Teilchen pro Wellenlänge) erscheint ein Hinweis; die Kurve der Momentaufnahme bleibt richtig. Grenze 0,3 m, weil die Welle dort im Bild noch erkennbar ist (geprüft mit f = 2 Hz, c = 0,6 m/s).
- **Δt-Klammer im Aufgabenmodus nur als „Δt“:** Die Klammer bleibt als Ablesehilfe, die Zahl ist die Lösung von A3.
- **Neue Aufgabe 7 (Schall in Wasser)** statt einer weiteren Anzeige: zeigt „c hängt vom Wellenträger ab, f vom Erreger“ von der anderen Seite als A4.
- **340 m/s in A6 belassen**, 343 m/s bei 20 °C ergänzt: Schulbücher rechnen meist mit 340 m/s.
- **Ausprobieren 6 ohne festen Zeigerabstand formuliert:** Je nach Bühnenbreite stehen die Zeiger alle 0,5 m oder 1 m.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3375/3375 grün (148 Dateien), Build ok.
