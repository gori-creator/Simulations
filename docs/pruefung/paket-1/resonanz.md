# Prüfprotokoll: `resonanz` – Erzwungene Schwingung und Resonanz

Prüfer: Paket 1 (Vertretung) · Datum: 22.10.2026 · Stand: Commit `afca10e` · Bogen: `scratchpad/boegen/resonanz.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Die Rechenlogik (Pohlsches Rad, RK4) ist fehlerfrei. Korrigiert wurden:
- Rundung mit weggelassenen Endnullen („f_R ≈ 0,5 Hz“, „φ = 7°“ neben „4,9°“).
- Tabellenkopf mit rohem „f_E“.
- Aufgabenmodus: Theorie-Kurven und f_R verrieten die Aufgaben 3 und 5.
- „Theoretische Kurven“ jetzt als `resultsParam`.
- Katastrophen-Etikett links abgeschnitten.
- Zeigerdiagramm zeigte nach der Katastrophe ein sinnloses Δφ.
- Achsenzahl „28“ lag auf der „0“.
- Falscher Ziehen-Tipp.
- Lernmaterial: ω_r/f_R vereinheitlicht, Beispiele (Weinglas, Brücken) und Aufgabe 6 ergänzt.
- 3 Tests ergänzt.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Start (f_E = 0,3 Hz, δ = 0,25 1/s, φ̂_E = 5°):
     - ω₀² = π² = 9,870; ω_E = 1,885, ω_E² = 3,553; ω₀² − ω_E² = 6,317; 2δω_E = 0,942.
     - √(39,90 + 0,888) = 6,386 → Verhältnis 9,870/6,386 = 1,545 → φ̂ = 7,73° ≈ 7,7°.
     - Δφ = arctan(0,942/6,317) = 8,5° ≈ 8°. Anzeige identisch ✓.
  2. Resonanz f_E = f₀ = 0,5 Hz: φ̂ = 5° · ω₀/(2δ) = 5° · π/0,5 = 31,4° (6,28-fach), Δφ = 90°. Theorie und Messung (nach „Einschwingen abwarten“) zeigen beide 31,4° ✓.
  3. Schnelle Erregung f_E = 1 Hz: ω_E² = 39,48; ω₀² − ω_E² = −29,61; 2δω_E = 3,142; √(876,7 + 9,87) = 29,78 → 0,3315 · 5° = 1,66° ≈ 1,7°. Δφ = 180° − arctan(3,142/29,61) = 173,9° ≈ 174° ✓.
  4. Resonanzfrequenz f_R = √(f₀² − δ²/(2π²)), gleichwertig zu ω_R = √(ω₀² − 2δ²):
     - δ = 0,25: √(0,25 − 0,00317) = 0,4968 → 0,497 Hz ✓.
     - δ = 1: √(0,25 − 0,0507) = 0,4465 → 0,446 Hz ✓.
     - δ = 1,5 (Reglergrenze): √(π² − 4,5)/(2π) = 0,369 Hz.
  5. Resonanzkatastrophe (δ = 0,03, φ̂_E = 10°): Theorie 10° · π/0,06 = 523,6°. Die Grenze von 120° wird nach etwa 9 s überschritten ✓.
  6. Ziehen im Resonanzdiagramm auf f_E ≈ 0,65 Hz: ω_E = 4,08, ω_E² = 16,68; Differenz −6,81; 2δω_E = 2,04; √(46,4 + 4,17) = 7,11 → 1,39-fach und Δφ = 180° − arctan(2,04/6,81) = 163° ✓ (Anzeige „1,39-fach“, „163°“).
- **Sonderfälle:**
  - δ = 0 ist nicht einstellbar (Regler ab 0,03). Im Modell wäre die Amplitude bei ω_E = ω₀ unendlich (Test). Die Belastungsgrenze von 120° fängt große Werte ab.
  - f_E = 0 ist nicht einstellbar (Regler ab 0,05 Hz, `readPhasor` teilt durch ω_E). Im Modell gilt dann Verhältnis 1 und Phase 0 (Test).
  - f_E ≫ f₀: Verhältnis ≈ 1/((ω_E/ω₀)² − 1), Phase → 180° (Test).
  - Alle Kombinationen der Reglergrenzen (f_E 0,05/1,5 Hz, δ 0,03/1,5 1/s, φ̂_E 2/15°) liefern endliche Werte und eine Phase in [0; π] (Test).
  - Ab δ ≥ ω₀/√2 gibt es kein Maximum mehr. Das ist über den Regler nicht erreichbar (max. 1,5 < 2,22).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** `fmt.num` ließ Endnullen weg („f_R ≈ 0,5 Hz“ bei δ = 0,08, „φ = 7°“, Tabelle „0,5“ neben „0,28“). Jetzt einheitlich mit `fmt.fixed`:
  - f_R mit 3 Nachkommastellen,
  - Winkel mit 1 Stelle (Δφ ganzzahlig),
  - f_E mit 2 Stellen.
- **Begriffe:** Eigenfrequenz, Erregerfrequenz, Abklingkonstante, Einschwingen/Schwebung, Resonanzkurve, Phasenverschiebung, Zeigerdiagramm, Resonanzkatastrophe, Belastungsgrenze ✓. „ω_r/f_r“ im Material ist auf „ω_R/f_R“ vereinheitlicht, wie in der Simulation.
- **Neue/ergänzte Tests:** `tests/resonanz.test.ts` hat 3 neue Tests, jetzt sind es 10:
  - alle Anzeige- und Aufgabenwerte,
  - Halbwertsbreite Δf ≈ δ/π (per Bisektion),
  - Sonderfälle und Reglergrenzen.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  - A1 (Erregerfrequenz statt Eigenfrequenz) ✓.
  - A2: 0,1 → 0°, 0,5 → 90°, 1,5 Hz → 180°. Amplitude bei 1,5 Hz: ω_E² = 88,83, √(78,96² + 4,71²) = 79,10 → 0,1248 · 5° = 0,62° ≈ 0,6° ✓ (Link zeigt 0,6°, 177°).
  - A3: 5° · π/0,5 = 31,4 ≈ 31° ✓.
  - A4: δ > 10° · π/240° = 0,131 1/s ✓. Der Link mit δ = 0,16 zeigt gemessen 98,1° bzw. Theorie 98,2° (10 · π/0,32 = 98,17) ✓.
  - A5: δ = 1 → f_R = √(π² − 2)/(2π) = 2,805/6,283 = 0,446 ≈ 0,45 Hz ✓. Die Rechnung steht jetzt in der Lösung.
  - A6 neu (Gleichschritt auf Brücken, qualitativ).
- **„Beispiel laden“ geklickt:** alle sechs Beispiele (langsam, Resonanz, schnell, stark/schwach gedämpft, Katastrophe), außerdem alle Aufgaben- und Ausprobieren-Links. „Resonanzkurve aufnehmen“ wurde mit δ = 1 und mit ausgeschalteter Theorie geprüft. Die Messpunkte liegen auf der Theorie, z. B. 0,46 Hz → 23,6°.
- **Texte:**
  - DE: f_R mit Bezug zur Anzeige.
  - DE: neuer Abschnitt „Beispiele“ (Weinglas; Gleichschritt auf Brücken; Millennium Bridge 2000 mit nachträglich eingebauten Dämpfern; Technik).
  - DE: Hinweis zur Mindestdämpfung und zu „Theorie aus“.
  - EN: Lage des Maximums ω_R korrigiert („near f₀“ → „slightly below f₀“). Laut Projektregel sonst nicht ergänzt.

## 3. Geräte (Prüfbogen)
- **Alle Größen, hell/dunkel:** iPad quer ist nebeneinander und gut lesbar (Layout nach Breite und Höhe: `tall` nur bei `w < 640 && h > 0,9 w`). Am Handy ist die Szene oben und die Diagramme darunter. Beamer ist in Ordnung.
- **Überlauf / Überlappungen:** kein Überlauf. Behoben:
  - Das Etikett „Resonanzkatastrophe: Belastungsgrenze überschritten!“ ragte links aus der Szene. Jetzt erscheint der lange Text nur, wenn er passt, sonst „Resonanzkatastrophe!“, und die Pille bleibt in der Szene.
  - Im mitlaufenden t-φ-Diagramm lag die t-Zahl am linken Rand („28“) auf der „0“ der y-Achse. Sie entfällt dort jetzt über `axes({ blocked })`.
- **Touch (Ziehen) und Maus:** Der Punkt auf der f_E-Linie im Resonanzdiagramm lässt sich mit der Maus von 0,3 auf ca. 0,65 Hz ziehen; die Werte stimmen (siehe oben). Der Tipp sprach allgemein von „markierten Punkten“ und nennt jetzt den Punkt auf der gestrichelten Linie. Der Reglerhilfetext ist angepasst.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur:** laut JSON in Ordnung. f_E ist auch über den Regler einstellbar, deshalb kein `setKeyTargets`.
- **Namen und Beschreibung:** Es gibt keine Bedienelemente ohne Namen. Die Canvas-Beschreibung ist vorhanden. Der Tabellenkopf „f_E in Hz“ stand roh mit Unterstrich und wird jetzt als HTML mit `<sub>` ausgegeben.
- **Farben:** Alle Farben kommen aus `ctx.theme.series`. Rad und Erreger sind zusätzlich durch durchgezogene/gestrichelte Linie und Beschriftung unterschieden ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/resonanz/index.ts` | einheitliche Rundung mit `fmt.fixed` (f_R, Momentan, Amplitude, Tabelle) |
| `src/simulations/physik/resonanz/index.ts` | `resultsParam: 'theory'`; Theorie-Kurven nur, wenn das passende Spoiler-Ergebnis aufgedeckt ist (`ctx.isHidden('amp'/'shift')`); f_R in „Eigenfrequenz“ erst mit der Theorie-Amplitude |
| `src/simulations/physik/resonanz/index.ts` | Tabellenkopf mit `<sub>`/`<var>` |
| `src/simulations/physik/resonanz/index.ts` | Katastrophen-Pille passt in die Szene; Zeigerdiagramm ohne Rad-Zeiger/Δφ nach der Katastrophe; t-Zahl am linken Rand per `blocked` |
| `src/simulations/physik/resonanz/index.ts` | eigener `hint`, Hilfetext f_E |
| `src/content/simulations/de/resonanz.md` | ω_R/f_R, Beispiele, Aufgabe 5 mit Rechnung, Aufgabe 6, Hinweise Mindestdämpfung/Theorie aus |
| `src/content/simulations/en/resonanz.md` | Lage des Resonanzmaximums |
| `tests/resonanz.test.ts` | 3 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Kombinierendes Dach `φ̂` (U+0302) sitzt in der Systemschrift sichtbar neben bzw. über dem nächsten Zeichen. Das betrifft:
  - Regler „φ̂_E“ (Dach über dem Index E),
  - Ergebnisse „φ̂ =“,
  - Canvas „Amplitude φ̂ in °“.

  Eine Kernlösung wäre hilfreich, etwa ein Dach-Helfer für `subText`/rich-label oder eine `<var>`-Dach-Klasse mit CSS.
- `hint` ist reiner Text: Ein Index wie „f_E“ wird dort nicht gesetzt (hier umgangen durch „Erregerfrequenz“ ohne Formelzeichen).
- `hiddenChange` meldet nur Wechsel von `ctx.hidden`. Ein einzelnes Aufdecken, das `ctx.hidden` nicht ändert, kommt nicht an (hier über einen Vergleich in `render` gelöst). Ein Rückruf je Aufdecken wäre einfacher.

## 7. Entscheidungen
- **„Theoretische Kurven“ als `resultsParam`:** Die beiden Spoiler sind genau die Theorie-Werte. „Theorie aus“ heißt dann: Vorhersage nur aus den Messpunkten (Ausprobieren 5), und „Aufdecken“ schaltet die Theorie wieder ein.
- **Messwerte bleiben im Aufgabenmodus sichtbar:** Messen ist das Experiment und dient bei den Aufgaben 3/4 als „Prüfen“. Verdeckt werden nur die berechneten Werte, die Theorie-Kurven und f_R. Am Graphen abzulesen ist ungenau und erwünscht.
- **f_R hängt am Spoiler „Amplitude (Theorie)“**, weil f_R die Lösung von Aufgabe 5 verrät.
- **Rad-Zeiger nach der Resonanzkatastrophe ausgeblendet:** Das Rad steht an der Grenze, eine Phase ist dann nicht definiert. Vorher zeigte das Diagramm z. B. „Δφ = 76°“.
- **Regler-Untergrenzen unverändert** (δ ≥ 0,03, f_E ≥ 0,05 Hz): Damit gibt es keine Division durch null. Der unendliche Grenzfall wird im Material erklärt.
- **Beispiele ohne Tacoma-Brücke:** Ihr Einsturz gilt fachlich als selbsterregte Schwingung (Flattern), nicht als klassische Resonanz. Gewählt wurden Weinglas, Gleichschritt und Millennium Bridge.
- **EN nicht erweitert**, nur der fachliche Fehler (Lage des Maximums) behoben.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3458/3458 grün (151 Dateien), Build ok.
