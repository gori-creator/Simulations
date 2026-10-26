# Prüfprotokoll: `schiefer-wurf` – Waagerechter und schiefer Wurf

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `51c229f` · Bogen: `scratchpad/boegen/schiefer-wurf.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Die Rechenlogik ist fehlerfrei. Korrigiert wurden:
- Im Aufgabenmodus verrieten Bild und „Momentan“ Flugzeit, Wurfweite, Scheitelhöhe und Aufprallgeschwindigkeit.
- Die Rundung war uneinheitlich („15 m/s“ neben „22,19 m/s“, „75,1 m“ neben „45,66 m“).
- v_x und v_y an den Pfeilen standen ohne Einheit.
- Kleine Überlappungen: Achsenzahlen unter den Anzeigen oben links, „x = …“ auf den Achsenzahlen, Diagrammwerte über Kurve und „t in s“.
- Der Zeitpunkt im Energiediagramm stand hinter dem Kurvenende.
- Der allgemeine Ziehen-Tipp war zu ungenau.
- EN war stark gekürzt (3 statt 5 Aufgaben).
- Neu: Aufgabe 6 (Mond) und ein Absatz zur Auftreffgeschwindigkeit; 2 Tests ergänzt.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Start (v₀ = 15 m/s, α = 30°, h₀ = 0): T = 2 · 15 · 0,5/9,81 = 1,529 s; w = 225 · sin 60°/9,81 = 194,9/9,81 = 19,86 m; h = 7,5²/19,62 = 2,87 m; Bahngleichung g/(2v₀² cos²α) = 9,81/(2 · 225 · 0,75) = 0,0291, tan 30° = 0,577 → „y = −0,0291x² + 0,577x“ ✓ (Anzeige 1,53 s; 19,86 m; 2,87 m).
  2. Waagerecht vom Turm (10 m/s, 20 m): T = √(40/9,81) = 2,019 s; w = 20,19 m; v_y = 9,81 · 2,019 = 19,81 m/s; v = √(100 + 392,4) = 22,19 m/s; Richtung arctan(19,81/10) = 63,2° → „22,2 m/s unter 63°“ ✓; c = 9,81/200 = 0,0491 → „y = −0,0491x² + 20“ ✓.
  3. Zerlegung (14 m/s, 50°): v_x = 14 · cos 50° = 9,00 m/s; v_y0 = 14 · sin 50° = 10,72 m/s; T = 2 · 10,72/9,81 = 2,186 s; w = 196 · sin 100°/9,81 = 19,68 m; h = 10,72²/19,62 = 5,86 m ✓ (Superposition „9,00 m/s · t“, „10,72 m/s · t − 4,905 m/s² · t²“).
  4. Zielwurf (18 m | 2 m, 15 m/s): a = 9,81 · 324/450 = 7,063; 7,063 tan²α − 18 tan α + 9,063 = 0; D = 324 − 256,05 = 67,95; tan α = (18 ∓ 8,243)/14,126 = 0,691 bzw. 1,858 → 34,6° und 61,7° ✓; v_min² = 9,81 · (2 + √328) = 197,3 → 14,05 m/s ✓.
  5. Aus 20 m mit 10 m/s: tan α = 10/√(100 + 392,4) = 0,4506 → 24,3°; w_max = (10/9,81) · 22,19 = 22,62 m ✓ (Anzeige „α ≈ 24,3° (w ≈ 22,62 m)“).
  6. Luftwiderstand Fußball: k = 1,2 · 0,25 · π · 0,11²/(2 · 0,43) = 0,01326 1/m, v_E = √(9,81/0,01326) = 27,2 m/s (plausibel). Bei 28 m/s und 35° ohne Luft 784 · sin 70°/9,81 = 75,10 m; mit Luft numerisch 45,66 m (−39 %), bester Winkel 40,8° ✓ (wie im Material: 45,7 m; ≈ 41°).
  7. Mond: 225 · sin 60°/1,62 = 120,28 m ✓; Aufgabe 6: √(40/1,62) = 4,969 s, w = 49,69 m, v = √(100 + 8,05²) = 12,84 m/s.
- **Sonderfälle:**
  - α = 90°: v_x wird exakt 0 gesetzt, Weite 0 m, Bahngleichung „senkrechter Wurf: x = 0“, Hinweis „senkrechter Wurf – Weite 0“; v₀ = 40 m/s ergibt T = 8,155 s, h = 81,55 m ✓.
  - α = 0 bei h₀ = 0: „kein Flug“, Werfen gesperrt, Hinweis im Bild.
  - α < 0 vom Boden: ebenfalls „kein Flug“. α = −45° aus 40 m mit 40 m/s: T = 1,175 s ✓.
  - v₀ = 0 ist über den Regler nicht möglich (min 1 m/s). Im Modell gibt es dafür freien Fall bzw. „kein Flug“ ohne Division durch 0 (neuer Test).
  - Reglergrenzen: v₀ = 1 m/s mit α = 80° → T = 0,201 s. v₀ = 40 m/s, h₀ = 40 m auf dem Mond → w = 1026 m, Ausschnitt passt sich an ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:**
  - Vorher ließ `fmt.num` Endnullen weg, die Stellenzahl war gemischt (T mit 3 Stellen, Aufprall mit 2, Bild mit 1).
  - Jetzt einheitlich mit `fmt.fixed`: Zeiten 2 Stellen; Strecken in den Ergebnissen 2 Stellen, im Bild 1 Stelle (Scheitel/Wurfweite 2); Geschwindigkeiten 1 Stelle; Winkel-Ergebnisse 1 Stelle.
  - Eingaben (v₀, α, h₀, Ziel) bleiben ohne Endnullen.
- **Begriffe wie im Unterricht:** Superposition, Flugzeit, Wurfweite, Steighöhe/maximale Höhe, Scheitel, Bahngleichung, Aufprallgeschwindigkeit, Komponenten v_x, v_y ✓.
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/schiefer-wurf.test.ts`. Sie decken alle Werte aus Aufgaben und Ausprobieren ab, außerdem Reglergrenzen und Sonderfälle (90° vom Turm, Fallzeit unabhängig von v₀, v₀ = 0). Jetzt 18 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Alle Lösungen stimmen (Rechnungen oben):
  - A1: 2,16 s; 22,9 m; 5,73 m.
  - A2: 19,86 m; 8,60/2,87 m; 2,65/1,53 s.
  - A3: 2,02 s; 20,2 m; 22,2 m/s.
  - A4: 34,6°/61,7°; 14,05 m/s.
  - A5: 75,1 m; 45,7 m; 41°.
- **Aufgabenmodus:** Mit `_hide=1` zeigte das Bild am Ende „Wurfweite: 22,94 m“, „Scheitel: 5,73 m“, t = 2,16 s und v (Pillen, Messwerte-Karte, Kacheln auf dem Handy, Pfeile). „Momentan“ war nicht verdeckt. Jetzt gilt:
  - „Momentan“ ist ein `spoiler`.
  - Alle Momentanwerte im Bild zeigen „?“, solange „Momentan“ verdeckt ist.
  - Scheitel- und Wurfweite-Etikett zeigen „?“, solange „Maximale Höhe“ bzw. „Wurfweite“ verdeckt sind.
  - Die Winkelmarken im Diagramm zeigen „beste: ?°“, solange „Größte Wurfweite“ verdeckt ist.
- **„Beispiel laden“ und Links:** alle 7 Beispiele, alle Ausprobieren-Links und Aufgaben-Links (inkl. neuer A6) geladen. Sie passen zu den Beschreibungen.
- **Texte:**
  - DE: Absatz zu Wurfweite beim waagerechten Wurf, Bahngeschwindigkeit √(v_x² + v_y²) und Auftreffgeschwindigkeit √(v₀² + 2gh₀); neue Aufgabe 6 (waagerechter Wurf auf dem Mond).
  - EN: vollständig auf DE-Umfang übersetzt (6 Aufgaben, 7 Ausprobieren-Punkte, Unterrichtsideen).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Die Layoutwahl nach Breite **und** Höhe ist schon vorhanden (`w ≥ 640 || w ≥ 1,3 h`). iPad quer zeigt Szene und Diagramme nebeneinander und ist gut lesbar (Zerlegung, Luftwiderstand und Zielwurf eigens bei 1024 px geprüft). Handy: Szene oben, Kacheln bzw. Diagramme darunter.
- **Überlauf / Überlappungen:** kein Überlauf, keine Konsolenfehler (nur die bekannten KaTeX-403). Behoben:
  - Achsenzahlen „20/30/70“ lagen unter den Anzeigen oben links bzw. an „y in m“. Sie werden jetzt oberhalb der Anzeigenunterkante weggelassen.
  - „x = … m“ lag auf den Achsenzahlen und ist jetzt ein Etikett mit Hintergrund.
  - Die Diagrammwerte kreuzten Kurve, Gitter und „t in s“. Jetzt sind es Etiketten, die nahe der t-Achse nach oben ausweichen.
  - Im Energiediagramm stand der Punkt nach dem Aufprall hinter dem Kurvenende. Jetzt bleibt er am Kurvenende, nur die Zeitlinie läuft weiter.
- **Touch (Ziehen) und Maus:** Pfeilspitze mit der Maus gezogen, Winkel 30° → 41° übernommen und v₀ angepasst ✓. Abwurfpunkt, Zielscheibe, Ball entlang der Bahn und Diagramme (Zeit bzw. Winkel) sind Griffe.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur:** laut JSON in Ordnung. Alles, was sich ziehen lässt (v₀, α, h₀, Ziel), hat Regler; die Zeit läuft über Abspielen/Zurück. Deshalb kein `setKeyTargets`.
- **Namen für Bildschirmleser:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Werte zusätzlich als Text in den Ergebnissen.
- **Farben:** Bahn und Diagramme kommen aus `ctx.theme.series`. „mit Luft/ohne Luft“ sind auch durch durchgezogen/gestrichelt und die Legende unterscheidbar. Die Zielscheibe hat feste Sachfarben; Treffer/zu kurz/zu weit stehen als Text da.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/schiefer-wurf/index.ts` | Aufgabenmodus: „Momentan“ als `spoiler`; Momentanwerte, Scheitel, Wurfweite und Winkelmarken im Bild „?“, solange die zugehörigen Ergebnisse verdeckt sind |
| `src/simulations/physik/schiefer-wurf/index.ts` | einheitliche Rundung mit `fmt.fixed`; Einheiten an v_x und v_y |
| `src/simulations/physik/schiefer-wurf/index.ts` | Achsenzahlen nicht unter den Anzeigen oben links; x-Wert und Diagrammwerte als Etiketten; Ausweichen vor „t in s“; Energiepunkt am Kurvenende |
| `src/simulations/physik/schiefer-wurf/index.ts` | eigener `hint` statt des allgemeinen Ziehen-Tipps |
| `src/content/simulations/de/schiefer-wurf.md` | waagerechte Wurfweite, Bahn-/Auftreffgeschwindigkeit, neue Aufgabe 6 |
| `src/content/simulations/en/schiefer-wurf.md` | vollständig auf DE-Umfang übersetzt |
| `tests/schiefer-wurf.test.ts` | 2 neue Tests (Aufgabenwerte, Reglergrenzen/Sonderfälle) |

## 6. Für den Kern (nicht selbst ändern)
- `Plot.axes()` könnte einen Sperrbereich für Achsenzahlen annehmen (z. B. „über y-Pixel … keine Zahlen“). Hier ist das lokal über `yAxis.format` gelöst, mit der Anzeigenunterkante aus dem vorigen Bild.
- Die x-Achsenbeschriftung „x in m“ berührt auf dem Handy knapp die letzte Achsenzahl. Das ist ein allgemeines Thema von `Plot` (letzte Zahl ausblenden, wenn die Beschriftung darüber liegt).

## 7. Entscheidungen
- **Alle Momentanwerte im Bild folgen „Momentan“** und werden im Aufgabenmodus „?“, auch während des Flugs. Sonst liest man A1, A3 und A6 am Ende direkt ab (wie bei `freier-fall`). Bahn, Stroboskop und Achsen bleiben, denn Ablesen am Graphen ist ungenau und erwünscht.
- **Wurfweite und Scheitel im Bild nur verdeckt, solange ihr Ergebnis verdeckt ist.** Wer „Wurfweite“ aufdeckt, sieht sie auch im Bild.
- **A5 (Luftwiderstand) hat keine eigene Sonderregel.** Die Werte sind dort Beobachtung, aber im Aufgabenmodus gilt dieselbe Regel wie überall. Die Kurven reichen für die geforderten „drei Unterschiede“.
- **Rundung:** Zeiten 2 Stellen (passt zu 2,16 s; 2,02 s im Material), Strecken 2 Stellen, Geschwindigkeiten 1 Stelle (passt zu 22,2 m/s und zum Reglerschritt 0,5 m/s). Die bisherige Flugzeit mit 3 Stellen war Scheingenauigkeit.
- **v_x und v_y mit Einheit** an den Pfeilen, wie schon v. Der Platz reicht, Texte werden an den Rand geklemmt.
- **Neue Aufgabe 6 (Mond, waagerecht)** statt einer weiteren Anzeige. Sie übt T = √(2h/g), w = v₀ · T und die Auftreffgeschwindigkeit an einem neuen Ort und zeigt den Faktor √(g_E/g_M).
- **Reglerbereiche unverändert** (v₀ ab 1 m/s, α von −45° bis 90°): v₀ = 0 wäre nur freier Fall, dafür gibt es `freier-fall`.
- **Kein `setKeyTargets`:** Alle Griffe haben einen gleichwertigen Regler.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2994/2994 grün (133 Dateien), Build ok.
