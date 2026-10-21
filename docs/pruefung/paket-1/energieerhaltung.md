# Prüfprotokoll: `energieerhaltung` – Energieerhaltung (Achterbahn)

Prüfer: Paket 1 (Vertretung) · Datum: 21.10.2026 · Stand: Commit `e28ee41` · Bogen: `scratchpad/boegen/energieerhaltung.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Zwei Fehler in der Rechenlogik: Bei großer Reibung kam der Wagen nie zur Ruhe, und am Prellbock entstand Energie. Außerdem: Der Aufgabenmodus verriet die Lösung von A4 und den Abstand zur Mindesthöhe. Die Rundung war uneinheitlich, der Tipp unter der Bühne passte nicht, und die Messpunkte ließen sich nicht mit der Tastatur setzen. Zwei Beschriftungen überlappten. EN war stark gekürzt. Neu sind A6 („zu niedrig gestartet“), ein Hinweis zu 10 N/kg und 4 Tests. Die Formeln und Lösungen waren richtig.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Start Hügel, h₀ = 20 m, m = 400 kg: E_pot = 400 · 9,81 · 20 J = 78 480 J ≈ 78,5 kJ ✓ (Säule und Ergebnis). Tiefster Punkt ohne Reibung: v = √(2 · 9,81 · 20) = √392,4 = 19,81 m/s ≈ 71 km/h ✓.
  2. Looping aus 20 m (A4): v_oben = √(2 · 9,81 · 8) = √156,96 = 12,53 m/s ✓. F_G = 3924 N, F_Z = 400 · 156,96/6 = 10 464 N → Anzeige „10,5 kN ≥ 3,9 kN“ ✓. F_N = 6540 N ✓.
  3. Looping aus 10 m bzw. 14 m (Messreihe): Abheben in (2 · 10 + 6)/3 = 8,67 m (Bild „h = 8,7 m“) ✓ bzw. (28 + 6)/3 = 11,33 m (Bild „h = 11,4 m“, numerisch mit Toleranz 0,02 g) ✓.
  4. Tal, 15 m, μ = 0,02 (A5): Die Simulation kehrt in 13,41 m um. W_R = 6,24 kJ, nachgerechnet 400 · 9,81 · 1,59 J = 6,24 kJ ✓. Summe 400 · 9,81 · 15 J = 58,86 kJ ≈ 58,9 kJ ✓. Looping mit μ = 0,02: Bisektion ergibt 17,03 m ≈ 17 m ✓.
  5. Messpunkt per Tastatur im Tal (h₀ = 20 m) in h = 2,47 m: v = √(2 · 9,81 · 17,53) = 18,5 m/s ✓. E_pot = 9,7 kJ, E_kin = 68,7 kJ, Summe 78,4 ≈ 78,5 kJ (Rundung) ✓.
  6. Grenzwerte: h₀ = 26 m, m = 800 kg → 800 · 9,81 · 26 J = 204 048 J (Test). h₀ = 2 m, Hügel, μ = 0,06 → Summe 7,8 kJ = 400 · 9,81 · 2 J ✓.
- **Sonderfälle:**
  - **μ = 0,06 (Reglergrenze), Fehler:** Auf dem Hügel-Parcours (h₀ = 2 m und 20 m) kam der Wagen nie zur Ruhe. Er „zitterte“ 90 s lang mit v ≈ 10⁻⁴ m/s, weil RK4 bei wechselndem sign(v) innerhalb eines Schritts keinen Nulldurchgang liefert. Folgen: Die Uhr lief 90 s, und der Hinweis „Wagen steht: … % Reibungswärme“ erschien nie. Jetzt hält die Haftreibung den Wagen fest, sobald er innerhalb des Schritts zur Ruhe käme. Der Rest ½v² wird als Wärme verbucht, die Bilanz bleibt exakt.
  - **Stillstand als Umkehrpunkt:** Mit Reibung zählte jeder Rechenschritt in Ruhe als neuer Umkehrpunkt (300 Einträge). Jetzt zählt er nur einmal.
  - **Start bergauf (eigene Bahn, h₀ < Punkt 1), Fehler:** Der Wagen prallte in jedem Schritt gegen den Prellbock. Dabei wuchs W_R auch ohne Reibung (etwa 0,8 kJ in 24 s, Energie aus dem Nichts). Jetzt bleibt der Wagen stehen. Der Hinweis lautet jetzt „Am Start ist die Bahn zu flach oder steigt an“ statt „zu flach“.
  - **Weitere Sonderfälle:** h₀ = 0 ist nicht einstellbar (min 2 m). `speedAtHeight(0, 0) = 0` ist getestet. Liegt h₀ über der Bahn, wird es auf die Bahnhöhe begrenzt (`placeStart`). Wagen schafft den Hügel nicht: Er kehrt genau in h₀ um (Test, A6). Reglergrenzen m = 100/800 kg und h₀ = 2/26 m sind geprüft.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Uneinheitlich, denn `fmt.num` ließ Endnullen weg („h = 20 m“ neben „13,3 m“, „v = 13 m/s“ neben „12,6 m/s“, „Summe = 102 kJ“, „W_R = 0 kJ“). Die Höchstgeschwindigkeit stand mit 2 Stellen da (17,16), die Lösung mit 17,2. Jetzt gilt `fmt.fixed`: h, v und Energien mit 1 Nachkommastelle, v oben und Kräfte im Looping mit 2. Eingestellte Werte (h₀, μ, Stützpunkte) bleiben ohne Endnullen.
- **Begriffe wie im Unterricht:** Lageenergie/Höhenenergie, Bewegungsenergie, innere Energie/Reibungswärme, Energieerhaltungssatz, Zentripetalkraft und Gewichtskraft passen ✓. Ergänzt: „Energieentwertung“ und g = 9,81 m/s² = 9,81 N/kg mit Hinweis zu 10 N/kg (wie in `hebelgesetz`) sowie kJ = 1000 J.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/energieerhaltung.test.ts`, jetzt 18:
  - Aufgabenwerte A1 bis A5
  - μ = 0,06: Der Wagen kommt auf jeder Bahn zur Ruhe, mit nur einem Umkehrpunkt am Ende.
  - Sonderfälle: Höhe 0, Start bergauf ohne Energiegewinn, h₀ = 26 m, Hügel nicht geschafft
  - Massen 100/800 kg

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  - A1: √(2 · 9,81 · 15) = 17,16 ≈ 17,2 m/s ≈ 62 km/h ✓
  - A2: 78 480 J, 39 240 J, 14,0 m/s ✓
  - A3: 7,67 m/s, 11,3 m, 8,86 m/s ✓
  - A4: siehe oben ✓
  - A5: 13,4 m, 6,2 kJ, 58,9 kJ, 17 m ✓
  - Neu A6: Umkehr in 12 m vor dem 14-m-Hügel, im Tal √(2 · 9,81 · 10) = 14,0 m/s.
- **Aufgabenmodus:**
  - A4 (`_hide=1`): Der Titel des Kraftdiagramms zeigte „h₀ = 20 m: 10,5 kN ≥ 3,9 kN“, die Fahne „oben: v = 12,53 m/s“. Jetzt steht dort nur „h₀ = 20 m“ bzw. „oben: v = ? m/s“, solange „Looping“ verdeckt ist.
  - Entdeckungsaufgabe: „Knapp verfehlt: 0,5 m zu niedrig“ verriet die Mindesthöhe. Der Hinweis erscheint nur noch, wenn „Theorie zur Aufgabe“ aufgedeckt ist.
- **„Beispiel laden“ und Links:** Alle 8 Beispiele (über die Links gleichen Inhalts) und alle Aufgaben- und Ausprobieren-Links sind geladen. Sie zeigen den beschriebenen Zustand ✓.
- **Texte:**
  - DE: Absatz zur Energieentwertung. Ausprobieren 3 fragt jetzt nicht mehr „Wohin verschwindet die Energie?“ (widersprach dem Stolperstein), sondern nach der Energieform. A5 zeigt die Summe mit Rechnung, A6 ist neu, dazu der Modellhinweis zu g und kJ.
  - EN: Es fehlten A4 und A5, der Text war stark gekürzt. Jetzt ist EN vollständig auf DE-Umfang übersetzt (6 Aufgaben, 7 Ausprobieren-Punkte, Unterrichtsideen).

## 3. Geräte (Prüfbogen)
- **Geräte:** Handy klein/groß, iPad hoch/quer, Laptop, 1920 px und Beamer, hell und dunkel: Die Layouts wählen schon nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`). iPad quer ist nebeneinander und gut lesbar, auch Energie-Diagramme und Looping.
- **Überlauf / Überlappungen:** Kein Überlauf. Behoben:
  - In der Looping-Ansicht und in der Aufgabe kreuzte „Starthöhe h₀ = 10 m“ den Kreis (Handy und Desktop). Die Beschriftung steht jetzt rechts neben dem Looping.
  - Auf der eigenen Bahn lag die Beschriftung auf Stützpunkt 2. Jetzt wird eine freie Stelle ohne Schiene und Stützpunkt gesucht.
  - In der Messreihe (Handy) überdeckte „Tippe hier, um h₀ zu wählen“ die Beschriftung v_min. Der Text steht jetzt über der Linie.
- **Touch (Ziehen) und Maus:** Mit der Maus geprüft: Den Wagen an der Startrampe ziehen (h₀ 12 → 26 m, begrenzt) ✓, Stützpunkt 2 ziehen (14 → 26 m) ✓. Der Tipp unter der Bühne lautete „Die markierten Punkte lassen sich ziehen“, das passte nicht. Jetzt gibt es einen eigenen `hint` für Wagen, Stützpunkte, Messpunkte und Diagramme.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur:** Laut JSON in Ordnung. Messpunkte ließen sich bisher nur antippen. Jetzt gibt es `ctx.setKeyTargets`: neun gleich verteilte Stellen der Schiene mit Ansage der Höhe. Enter setzt bzw. entfernt einen Messpunkt (mit Playwright geprüft: Punkt 4 → Messpunkt in 2,5 m, Tabelle ✓). h₀ und die Stützpunkte sind über Regler erreichbar, die Zeit über Abspielen.
- **Namen für Bildschirmleser:** Keine Bedienelemente ohne Namen. Die Canvas-Beschreibung ist vorhanden, alle Werte stehen zusätzlich in den Ergebnissen.
- **Farben:** Diagramme und Säulen nehmen `ctx.theme.series`. Die Energieformen sind beschriftet (E_pot, E_kin, W_R), nicht nur farbig. Erfolg und Misserfolg in der Messreihe unterscheiden sich durch Punkt und Kreuz, nicht nur durch Grün/Rot ✓. Die Szene (Schiene, Wagen) hat feste Sachfarben, im Dunkelmodus angepasst.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/energieerhaltung/model.ts` | Haftreibung stoppt den Wagen sicher (kein Zittern bei μ = 0,06). Ruhe am Prellbock ohne Energiegewinn. Stillstand zählt nur einmal als Umkehrpunkt. |
| `src/simulations/physik/energieerhaltung/index.ts` | Einheitliche Rundung mit `fmt.fixed` |
| `src/simulations/physik/energieerhaltung/index.ts` | Aufgabenmodus: Kräfte-Titel, „oben: v = ?“, „Knapp verfehlt“ verdeckt |
| `src/simulations/physik/energieerhaltung/index.ts` | Starthöhen-Beschriftung ohne Überlappung (Looping rechts, sonst freie Stelle). Text der leeren Messreihe über v_min |
| `src/simulations/physik/energieerhaltung/index.ts` | Eigener `hint`. Tastatur-Messpunkte (`setKeyTargets`). Text „zu flach oder steigt an“ |
| `src/content/simulations/de/energieerhaltung.md` | Energieentwertung, Ausprobieren 3, A5 mit Rechnung, neue A6, g in N/kg mit 10-N/kg-Hinweis, kJ |
| `src/content/simulations/en/energieerhaltung.md` | Vollständig auf DE-Umfang übersetzt |
| `tests/energieerhaltung.test.ts` | 4 neue Tests (Aufgabenwerte, μ max, Sonderfälle, Massen) |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `freier-fall`: Ein `hint` je Ansicht (Funktion statt fester Text) wäre hilfreich. Hier muss ein Tipp Wagen, Stützpunkte, Messpunkte und Diagramme gleichzeitig abdecken.
- `simshot.cjs` kennt keine Tastenschritte. Ein Schritt `["key","ArrowRight"]` würde Tastaturprüfungen ohne eigenes Skript erlauben.

## 7. Entscheidungen
- **Live-Werte (v-Pille, Tacho, Säulen, Messpunkte) bleiben im Aufgabenmodus sichtbar.** Anders als bei `freier-fall`: A2 und A6 verlangen ausdrücklich, mit einem Messpunkt zu prüfen. Die Fahrt ist hier das Messinstrument. Verdeckt bleiben die fertigen Rechenergebnisse (Höchstgeschwindigkeit, Looping-Rechnung, Theorie) und neu die Zahlen, die A4 direkt beantworten.
- **F_Z-Kurve und Punkt im Kraftdiagramm bleiben im Aufgabenmodus:** Ablesen am Graphen ist ungenau und erwünscht, verdeckt ist nur die Zahl im Titel.
- **„Knapp verfehlt: … m zu niedrig“ nur bei aufgedeckter Theorie:** Der Hinweis nennt sonst direkt die Mindesthöhe der Entdeckungsaufgabe.
- **Rundung:** h, v und Energien mit 1 Nachkommastelle passen zu den Lösungen (17,2 m/s, 14,0 m/s, 58,9 kJ). Geschwindigkeit oben und Kräfte im Looping haben 2 Stellen wie in A3/A4 (7,67 m/s, 12,53 m/s). Eingestellte Größen bleiben ohne Endnullen.
- **Haftreibung im Modell statt kleinerem Rechenschritt:** Der Stopp verbucht ½v² als Wärme. Die Energiebilanz bleibt exakt, der Rechenaufwand gleich.
- **Tastatur über neun feste Stellen** statt eines frei wandernden Cursors: einfach, vorhersagbar und mit Höhe angesagt. Genaue Stellen bleiben dem Antippen bzw. dem Diagramm vorbehalten.
- **g = 9,81 N/kg mit Hinweis zu 10 N/kg** wie in `hebelgesetz` und `hookesches-gesetz`. Die Simulation rechnet weiter mit 9,81.
- **Neue Aufgabe 6** deckt den Sonderfall „schafft den Hügel nicht, Umkehr in h₀“ ab, der bisher nur im Text vorkam.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2994/2994 grün (133 Dateien), Build ok.
