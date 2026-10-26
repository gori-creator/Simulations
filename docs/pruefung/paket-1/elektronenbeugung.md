# Prüfprotokoll: `elektronenbeugung` – Elektronenbeugung

Prüfer: Paket 1 · Datum: 22.10.2026 · Stand: Commit `70f9bbe` · Bogen: `scratchpad/boegen/elektronenbeugung.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus `_hide=1` verriet bei eingeschalteten Werten λ, v, r₁, r₂ im Bild und λ in der Messtabelle; U-Anzeige an der Röhre war bei „Werte aus“ unnötig verdeckt; falscher Ziehen-Tipp; Bragg-Bedingung ohne Ordnung, Relativistik nur für 4 kV angegeben; Auswertung verschwieg die systematische Abweichung durch die Kleinwinkelnäherung; Aufgabe 2 ohne Aufgaben-Link; neue Aufgabe 6; 4 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. U = 4 kV: v = √(2 · 1,602·10⁻¹⁹ · 4000 / 9,109·10⁻³¹) = √(1,407·10¹⁵) = 3,751·10⁷ m/s; p = 9,109·10⁻³¹ · 3,751·10⁷ = 3,417·10⁻²³ kg·m/s; λ = 6,626·10⁻³⁴ / 3,417·10⁻²³ = 1,939·10⁻¹¹ m = 19,4 pm; Faustformel 1,226 nm/√4000 = 19,39 pm ✓ (Anzeige „3,75 · 10⁷ m/s“, „3,42 · 10⁻²³“, „19,4 pm“).
  2. Ring 1 bei 4 kV: sin θ₁ = 19,39/426 = 0,04552 → θ₁ = 2,61°, 2θ₁ = 5,22°, r₁ = 135 mm · tan 5,22° = 135 · 0,09132 = 12,33 mm ≈ 12,3 mm; Näherung 135 · 19,39/213 = 12,29 mm ✓. Ring 2: sin θ₂ = 19,39/246 = 0,0788 → θ₂ = 4,52°, r₂ = 135 · tan 9,04° = 21,49 ≈ 21,5 mm (Näherung 21,3 mm) ✓.
  3. U = 8 kV (Reglergrenze): λ = 1,226/√8000 nm = 13,71 pm; sin θ₁ = 0,03219, r₁ = 135 · tan(3,689°) = 8,70 mm; r₂ = 15,1 mm ✓ (Bild „8,7 mm“, „15,1 mm“, „13,7 pm“).
  4. U = 2 kV (Reglergrenze): λ = 27,42 pm; r₁ = 17,5 mm, r₂ = 135 · tan(2 · asin(27,42/246)) = 135 · 0,2272 = 30,7 mm – passt auf Schirm (45 mm), Diagramm (bis 40 mm) und Messkreis (bis 40 mm) ✓.
  5. Graphit-Netzebenenabstände geprüft: a = 0,246 nm; d₁ = a · √3/2 = 0,213 nm (innerer Ring), d₂ = a/2 = 0,123 nm (äußerer Ring) ✓. L = 13,5 cm entspricht dem üblichen Schulgerät ✓.
  6. Auswertung (Messreihe ohne Rauschen, 2,5–8 kV): Ursprungsgerade durch r = L · tan 2θ ergibt d₁ = 0,2123 nm (−0,3 %), d₂ = 0,1217 nm (−1,0 %) – systematisch durch r ≈ Lλ/d; jetzt im Text benannt.
- **Sonderfälle:** U = 0 → λ = ∞, `ringRadius` liefert `null`, `electronSpeed(−5)` = 0 (Test); Regler 2–8 kV, Messkreis 3–40 mm; λ > 2d → kein Bragg-Winkel (`null`). Höhere Ordnung k: `braggAngle(d, λ, k)` richtig (sin θ verdoppelt sich), gezeichnet wird nur k = 1 (Hauptringe) – im Material erklärt. Relativistische Korrektur: 0,2 % bei 4 kV, 0,39 % bei 8 kV → nicht nötig, im Material mit beiden Werten begründet.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** einheitlich: λ in pm mit 1 Stelle, r in mm mit 1 Stelle, θ in ° mit 2 Stellen, Zehnerpotenzen mit 3 gültigen Ziffern und echtem „−“ ✓.
- **Begriffe wie im Unterricht:** Elektronenbeugungsröhre, Glühkathode, Anode, Beschleunigungsspannung, de-Broglie-Wellenlänge, Netzebenen, Bragg-Bedingung, Glanzwinkel/Ablenkung 2θ, Linearisierung ✓.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/elektronenbeugung.test.ts` (Sonderfälle/Reglergrenzen, Bragg höherer Ordnung, Aufgabenwerte A3/A4/A6, systematischer Fehler der Auswertung); jetzt 13 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 3,75·10⁷ m/s; 3,42·10⁻²³ kg·m/s; 19,4 pm ✓. A2 θ₁ = 2,61°, r₁ = 12,3 mm ✓. A3 λ = 17,34 pm, d₁ = 135 · 17,34/11,0 = 212,8 pm ≈ 0,213 nm ✓ (Simulation: r₁ = 11,02 mm). A4 12,3/1,414 = 8,7 mm ✓ (exakt 8,70). A5 Herleitung ✓. Neue A6: λ = 10 · 0,213/135 nm = 15,78 pm, √U = 1226/15,78 = 77,7 → U ≈ 6,0 kV; bei 6,0 kV zeigt die Simulation r₁ = 10,06 mm, der Messkreis 10 mm „liegt auf Ring 1“ ✓. A7 (Licht) ✓.
- **Aufgabenmodus:** Mit `_hide=1` und eingeschalteten Werten zeigte das Bild λ, v, r₁, r₂ (Ringpillen und Karte „Elektronen als Welle“), die Messtabelle λ in pm. Jetzt über `ctx.isHidden('lam')` bzw. `ctx.isHidden('ring')`: v/λ und r₁/r₂ einzeln „?“, Ringpillen weg, λ-Spalte fehlt bis zum Aufdecken (geprüft: nach „Aufdecken“ von λ erscheint die Spalte, r bleibt „?“).
- **„Beispiel laden“ geklickt:** alle fünf (4 kV, 2,5 kV, 7,5 kV, Linearisierung, Ring ausmessen) und alle Aufgaben-/Lösungslinks; „Messreihe automatisch“ mit 8 Punkten und Ausgleichsgeraden geprüft.
- **Texte vereinfacht/korrigiert:** DE: Bragg-Bedingung mit k · λ und Hinweis „nur 1. Ordnung gezeichnet“; Relativistik mit 4 und 8 kV; A2 mit Aufgaben-Link; neue A6, alte A6 → A7. EN: „first order“ ergänzt; sonst fachlich korrekt, bewusst kürzer (Projektregel).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung. iPad quer nutzt bereits das Nebeneinander-Layout (`w ≥ 640 || w ≥ 1,3 h`), Röhre, Schirm und Diagramm gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Rest (nicht geändert): Die Skalenzahl „10“ auf dem Schirm wird teils vom Messkreis-Pfeil gekreuzt; auf schmalen Bühnen fehlt die Beschriftung „Anode“ (zu wenig Platz, absichtlich).
- **Touch (Ziehen) und Maus:** Griff des Messkreises mit der Maus gezogen (18 → 4,5 mm), Regler folgt ✓. Tipp unter der Bühne passte nicht („markierte Punkte“) → eigener `hint`.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Muster sofort vollständig).
- **Tastatur:** keine Bedienelemente ohne Namen; Messkreis zusätzlich über den Regler „Messkreis: Radius“ → kein `setKeyTargets` nötig.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** Canvas-Beschreibung vorhanden; alle Werte zusätzlich in den Ergebnissen.
- **Farben:** Diagramm über `ctx.theme.series`, Ringe zusätzlich beschriftet (Ring 1/Ring 2, r₁/r₂); Röhre/Schirm mit festen Sachfarben ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/elektronenbeugung/index.ts` | Aufgabenmodus: Werte im Bild über `ctx.isHidden('lam'/'ring')`, λ-Spalte der Messtabelle verdeckt, Abgleich beim Aufdecken |
| `src/simulations/physik/elektronenbeugung/index.ts` | U-Pille an der Röhre zeigt U immer (Eingabe, keine Lösung) |
| `src/simulations/physik/elektronenbeugung/index.ts` | eigener `hint` statt allgemeinem Ziehen-Tipp |
| `src/simulations/physik/elektronenbeugung/index.ts` | Auswertung nennt die ≈ 1 % Abweichung von d₂ durch die Kleinwinkelnäherung (DE/EN) |
| `src/content/simulations/de/elektronenbeugung.md` | Bragg mit Ordnung k, Relativistik 4/8 kV, Link zu A2, neue A6 (Spannung für r₁ = 10 mm) |
| `src/content/simulations/en/elektronenbeugung.md` | „first order“ bei der Bragg-Bedingung |
| `tests/elektronenbeugung.test.ts` | 4 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- `hiddenChange` wird nur gerufen, wenn sich `ctx.hidden` insgesamt ändert, nicht beim Aufdecken eines einzelnen Spoilers. HTML-Ergebnisse, die von `ctx.isHidden(key)` abhängen (hier die λ-Spalte der Tabelle), müssen das selbst in `render` abgleichen. Ein Aufruf auch bei Einzel-Aufdecken (z. B. `hiddenChange(hidden, key)`) wäre hilfreich.

## 7. Entscheidungen
- **Canvas-Werte über `ctx.isHidden` statt nur über `val`:** Ein geteilter Aufgaben-Link ohne `val=0` hätte sonst alle Lösungen im Bild gezeigt. `val=0` verdeckt über `resultsParam` weiterhin alles.
- **U im Bild immer sichtbar:** U ist die eingestellte Größe und steht ohnehin am Regler; „U“ ohne Wert wirkte wie ein Fehler.
- **Theoriekurven im Diagramm bleiben im Aufgabenmodus:** Ablesen ist ungenau (≈ ±1 mm) und das Diagramm ist das Werkzeug zur Linearisierung; Aufgabe 3 nennt r₁ ohnehin.
- **Messkreis-Häkchen „liegt auf Ring k“ bleibt:** Es ist das Messwerkzeug, nicht die Lösung (die Lösungen fragen λ bzw. d).
- **Keine relativistische Rechnung und keine Ringe höherer Ordnung im Bild:** Korrektur < 0,4 % im Reglerbereich; höhere Ordnungen sind im Schulgerät kaum sichtbar. Beides im Material erklärt, im Modell (`deBroglieRelativistic`, `braggAngle(…, k)`) vorhanden und getestet.
- **Kugelkolben nicht modelliert:** ebener Schirm mit r = L · tan 2θ, im Material als Vereinfachung genannt (Abweichung wenige Prozent).
- **Neue Aufgabe 6 (Umkehraufgabe U aus r):** Bisher wurde nur vorwärts gerechnet; die Aufgabe nutzt den Messkreis zur Kontrolle.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3477/3477 grün (151 Dateien), Build ok.
