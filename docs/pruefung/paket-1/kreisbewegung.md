# Prüfprotokoll: `kreisbewegung` – Kreisbewegung und Zentripetalkraft

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `e25ad78` · Bogen: `scratchpad/boegen/kreisbewegung.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Die Rechenlogik war fehlerfrei. Korrigiert wurden: Der Aufgabenmodus verriet v, F_Z und die Grenzwerte im Bild und in „Bewegung“. Die Indizes liefen über die eigene Schreibweise „F_[Z]“ statt über den Kern. Die Rundung war uneinheitlich („4,4 N“ neben „4,39 N“, „7 m/s“ neben „19,8 m/s“). Weitere Punkte: „1 Umläufe“, „F_max“/„v_max“ mit Unterstrich in den Ergebnissen, Unicode-Indizes „vₘₐₓ“/„rₘᵢₙ“ im Diagramm, μ ohne Index. Im Lernmaterial fehlten Drehzahl, Zentrifugalkraft als Scheinkraft und der Looping. Die EN-Fassung war stark gekürzt. 2 Tests wurden ergänzt.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Start (r = 0,8 m, T = 1,2 s, m = 0,2 kg): v = 2π · 0,8/1,2 = 5,0265/1,2 = 4,189 ≈ 4,19 m/s; f = 1/1,2 = 0,833 ≈ 0,83 Hz; ω = 2π/1,2 = 5,236 ≈ 5,24 1/s; a = 4,189²/0,8 = 17,546/0,8 = 21,93 m/s² (Probe ω²r = 27,42 · 0,8 = 21,93); F = 0,2 · 21,93 = 4,386 ≈ 4,39 N ✓.
  2. Reißgrenze bei 30 N: v = √(30 · 0,8/0,2) = √120 = 10,95 m/s; T = 2π · √(0,16/30) = 2π · 0,07303 = 0,459 ≈ 0,46 s ✓. Damit reißt die Schnur im Beispiel T = 0,4 s, das Beispiel T = 0,6 s reißt nicht (F = 17,55 N).
  3. Auto (1200 kg, 15 m/s, r = 50 m, trocken): F = 1200 · 225/50 = 5400 N = 5,40 kN; a = 4,50 m/s² = 0,46 g; T = 2π · 50/15 = 20,94 ≈ 20,9 s; ω = 0,30 1/s; v_max = √(0,8 · 9,81 · 50) = √392,4 = 19,81 ≈ 19,8 m/s = 71 km/h; F_H,max = 0,8 · 1200 · 9,81 = 9418 N ≈ 9,42 kN ✓.
  4. Glatteis (μ = 0,1, 10 m/s): F = 1200 · 100/50 = 2,40 kN > F_H,max = 0,1 · 1200 · 9,81 = 1,18 kN → rutscht ✓; a = μ · g = 0,98 m/s² ✓; v_max = √49,05 = 7,0 m/s = 25 km/h ✓.
  5. Ziehen mit der Maus: Kugel radial von 0,8 m auf 1,15 m gezogen → v = 2π · 1,15/1,2 = 6,02 m/s, F = 0,2 · 6,021²/1,15 = 6,31 N ✓. Spitze des v-Pfeils nach außen gezogen → T = 0,60 s, v = 8,38 m/s ✓.
- **Sonderfälle:** Reglergrenzen r = 0,2 m, T = 3 s, m = 0,05 kg → v = 0,42 m/s, F = 0,0439 N (jetzt „0,044 N“ statt „0,04 N“). Bei r = 1,5 m, T = 0,2 s, m = 1 kg ist F = 1480 N, jede Schnur reißt sofort. Mit 5 N liegt die Reißgrenze bei T = 3,44 s, also über dem Regler – richtig angezeigt. Auto r = 10 m, v = 40 m/s, 2500 kg → 400 kN, v_max = 8,9 m/s ✓. Für T → groß gehen v, a und F gegen 0; für r → klein bei fester Umlaufdauer geht F → 0, bei fester Geschwindigkeit F → ∞. Die Regler verhindern r = 0 und T = 0, Ziehen klemmt v auf ≥ 0,05 m/s, und der Host begrenzt T, r und vc. Keine Division durch 0.
- **Einheiten, Rundung:** `fmt.num` ließ Endnullen weg. Jetzt `fmt.fixed`: Kräfte überall gleich (N mit 2 Stellen, unter 1 N mit 3 Stellen; kN mit 2 Stellen) in Pfeilbeschriftung, Kraftvergleich, Diagrammpunkt und Ergebnis. v (Schnur) hat 2 Stellen, v (Auto) 1 Stelle, a 2 Stellen, ω 2 Stellen, T (Auto) 1 Stelle. Die Reißkraft steht ganzzahlig („30 N“) wie am Regler.
- **Begriffe:** Bahngeschwindigkeit, Umlaufdauer, Frequenz, Drehzahl (U/min), Winkelgeschwindigkeit, Zentripetalbeschleunigung und -kraft, Haftreibungszahl μ_H ✓. „Zentrifugalkraft“ wird nur als Scheinkraft im mitbewegten System erklärt (neu).
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/kreisbewegung.test.ts`: alle Aufgabenwerte A1–A7 und das Standard-Auto, außerdem Sonderfälle und Reglergrenzen. Jetzt sind es 10 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  - A1: 4,19 m/s; 21,9 m/s²; 4,39 N ✓
  - A2: 0,46 s ✓
  - A3: 19,8 m/s = 71 km/h; √245,25 = 15,66 m/s = 56 km/h ✓
  - A4: Die Masse kürzt sich heraus ✓
  - A5: 100/0,981 = 101,9 ≈ 102 m ✓
  - Neu A6 (Waschmaschine 1200 U/min, r = 0,25 m): f = 20 Hz, ω = 125,7 1/s, v = 31,4 m/s, a = 15 791 · 0,25 = 3948 m/s² ≈ 402 g
  - Neu A7 (Looping r = 6 m): v_min = √(9,81 · 6) = √58,86 = 7,67 m/s ≈ 28 km/h
- **Aufgabenmodus:** Mit `_hide=1` waren sichtbar: „v = 4,19 m/s“ und „F_Z = 4,39 N“ an den Pfeilen, „nötig: … = 4,39 N“ im Kraftvergleich, „4,4 N“ am Diagrammpunkt und v in „Bewegung“ (Lösung A1). Außerdem zeigten die Grenzmarken im Diagramm die Lösungen zu A2, A3 und A5. Jetzt steht dort „?“. Die Marken v_max, r_min und die Reißgrenze sind ausgeblendet, und „Bewegung“ zeigt nur r, T und f. Nach dem Aufdecken wird alles neu berechnet (`hiddenChange`).
- **„Beispiel laden“ geklickt:** alle sechs Beispiele und alle Links (T = 0,6; T = 0,4; chart = r; trace = 1; nasse Fahrbahn; Glatteis; Aufgaben 1–5). Sie passen zu den Beschreibungen.
- **Texte:** In DE kamen hinzu: Drehzahl, Bahngeschwindigkeit/ω = 2πf, ein Absatz „Zentrifugalkraft?“, die Probe ω²r in A1, Ausprobieren 5 (Spur) und die Aufgaben A6/A7. Die EN-Fassung hatte 2 statt 5 Aufgaben und wurde vollständig auf den DE-Umfang übersetzt.

## 3. Geräte (Prüfbogen)
- **Alle Geräte, hell/dunkel:** in Ordnung, kein Überlauf, keine Konsolenfehler. iPad quer (Bühne ca. 630 × 395 px) nutzt bereits ein eigenes Mischlayout: oben Szene und Diagramm nebeneinander, unten der Kraftvergleich. Die Szene ist kleiner als am Laptop, aber gut lesbar.
- **Überlappungen:** Keine störenden. Rest, nicht geändert: Auf dem Handy liegen im Auto-Diagramm „Schnee“/„Eis“ knapp neben „v in m/s“. Die Radiusbeschriftung „r = 0,8 m“ liegt dicht neben „F_Z = …“.
- **Maus:** Kugel (Radius), Spitze des v-Pfeils und Diagrammpunkt mit der Maus gezogen, Werte stimmen (siehe 1.5).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur:** Laut JSON in Ordnung. Alle ziehbaren Größen sind auch über Regler erreichbar, deshalb kein `setKeyTargets`.
- **Namen:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden.
- **Farben:** Pfeile und Kurven aus `ctx.theme.series`. Der Zustand „hält/reißt/rutscht“ steht zusätzlich als Text in der Plakette, ist also nicht nur über Rot/Grün erkennbar. Fahrbahn, Auto und Kugel sind feste Sachfarben, dunkel angepasst.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/kreisbewegung/index.ts` | Eigene Index-Schreibweise `F_[Z]` samt Parser ersetzt durch Kern-`subText`/`measureSubText` (`F_Z`, `a_Z`, `F_{H,max}`, `μ_H`); Diagramm `v_max`/`r_min` über `Plot.text` |
| `src/simulations/physik/kreisbewegung/index.ts` | Aufgabenmodus: v/F_Z an Pfeilen, Kraftvergleich und Diagrammpunkt als „?“, Grenzmarken ausgeblendet, „Bewegung“ ohne v; `hiddenChange` |
| `src/simulations/physik/kreisbewegung/index.ts` | einheitliche Rundung (`fmt.fixed`, `forceText`); „Umläufe: 1“ statt „1 Umläufe“; Grenze-Ergebnis als HTML mit echten Indizes; μ_H statt μ |
| `src/simulations/physik/kreisbewegung/index.ts` | eigener `hint` (was sich ziehen lässt) |
| `src/content/simulations/de/kreisbewegung.md` | Drehzahl, ω = 2πf, Zentrifugalkraft als Scheinkraft, Probe in A1, Ausprobieren 5, A6 Waschmaschine, A7 Looping |
| `src/content/simulations/en/kreisbewegung.md` | vollständig auf DE-Umfang übersetzt |
| `tests/kreisbewegung.test.ts` | 2 neue Tests (Aufgabenwerte, Sonderfälle/Reglergrenzen) |

## 6. Für den Kern (nicht selbst ändern)
- Ergebnis-Texte (`ctx.readout` als Text) setzen `_` nicht als Index. Hier wurde deshalb auf HTML mit `<sub>` umgestellt. Ein Helfer für Ergebnistexte mit Index wäre praktisch.
- Ein dynamischer `hint` je Versuch wäre hilfreich: Die Kugel lässt sich nur im Schnur-Versuch ziehen.

## 7. Entscheidungen
- **Index über den Kern statt „F_[Z]“:** Die Darstellung ist einheitlich mit den anderen Simulationen, und rund 50 Zeilen eigener Parser fallen weg. `F_{H,max}` braucht Klammern, weil der Kern nach `_` nur Buchstaben und Ziffern nimmt.
- **„Bewegung“ im Aufgabenmodus nur bei der Schnur gekürzt:** Dort ist v Teil der Lösung von A1. Beim Auto ist v vorgegeben, deshalb bleiben v, T und ω sichtbar, ebenso der v-Pfeil.
- **Grenzmarken (v_max, r_min, Reißgrenze) im Aufgabenmodus aus, Kurven und Grenzlinien bleiben:** Die Marke ist die Lösung. Am Schnittpunkt Kurve/Grenzlinie ungefähr abzulesen ist erwünscht.
- **Kraft unter 1 N mit 3 Stellen:** An der Reglergrenze (0,044 N) wäre „0,04 N“ zu grob. Sonst gelten 2 Stellen, passend zu „4,39 N“ im Lernmaterial.
- **Neue Aufgaben A6 (U/min) und A7 (Looping) ohne Simulations-Link:** Drehzahl und Mindestgeschwindigkeit im Looping gehören zum Thema. Für einen Looping-Versuch wäre ein neuer Modus nötig, das wäre im Zweifel zu viel. Deshalb sind es reine Rechenaufgaben.
- **Layout unverändert:** iPad quer hat bereits ein passendes Mischlayout. Das Desktop-Layout ab 560 px würde den Kraftvergleich zu schmal machen (Text passt nicht).
- **Index „Z“ auch in EN beibehalten** (statt a_c): Er passt zur Simulation, die in beiden Sprachen F_Z zeigt.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2990/2990 grün (133 Dateien), Build ok.
