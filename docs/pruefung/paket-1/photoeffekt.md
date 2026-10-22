# Prüfprotokoll: `photoeffekt` – Photoeffekt

Prüfer: Paket 1 · Datum: 22.10.2026 · Stand: Commit `0cd800a` · Bogen: `scratchpad/boegen/photoeffekt.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Die Rechenlogik war fehlerfrei. Korrigiert wurden:
- „Gegenspannung abgleichen“ rundete U_G ab. Dadurch blieb oft ein Reststrom.
- „Messwert aufnehmen“ nahm bei ausgeschalteter Lampe einen falschen Wert U_G = 0 auf.
- Im Aufgabenmodus verrieten E_Ph und U_G im Bild die Lösung.
- Die Photonen-Anzeige rechnete mit c = 3,00 · 10⁸ m/s, das Ergebnis 7,49 · 10¹⁴ Hz passte dazu nicht.
- Rechenfehler in A1 und A4 des Lernmaterials.
- „Doppelte Intensität“ war 60 % → 100 %.
- Tabellenkopf zeigte „U_G“ mit Unterstrich, der Achsenabschnitt war falsch benannt.
- Ziehen-Tipp passte nicht, die Steigungs-Pille verdeckte die Messpunkte.
- 6 Tests ergänzt.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. Cs, 400 nm (Start):
     - E_Ph = 1239,84 eV·nm / 400 nm = 3,0996 ≈ 3,10 eV
     - E_kin,max = 3,0996 − 1,94 = 1,1596 ≈ 1,16 eV, also U_G = 1,16 V ✓
     - f = 2,998 · 10⁸ / 400 · 10⁻⁹ = 7,495 · 10¹⁴ Hz; 4,136 · 10⁻¹⁵ · 7,495 · 10¹⁴ = 3,100 eV ✓
     - Strom bei U = 0: 2 nA · 60 % = 1,20 nA ✓ (Anzeige „I = 1,20 nA“)
  2. Grenzwerte Cs:
     - f_G = 1,94 / 4,1357 · 10⁻¹⁵ = 4,691 · 10¹⁴ Hz ✓
     - λ_G = 1239,84 / 1,94 = 639,1 nm ✓
     - 650 nm: E_Ph = 1,907 ≈ 1,91 eV < 1,94 eV → keine Elektronen ✓
  3. Zink, 250 nm:
     - E_Ph = 4,959 eV, E_kin,max = 4,959 − 4,34 = 0,619 ≈ 0,62 eV ✓
     - λ_G = 1239,84 / 4,34 = 285,7 nm ✓
  4. Cs, 600 nm: E_Ph = 2,066 eV; U_G = 0,126 V → Abgleich auf 0,13 V, I = 0 ✓.
  5. Messreihe automatisch an Cs, Ausgleichsgerade: h ≈ 4,13 · 10⁻¹⁵ eV·s (Tabellenwert 4,136; Abweichung durch das 0,01-V-Raster) ✓. Zink hat nur 2 Punkte mit Elektronen (250 und 280 nm, λ_G = 286 nm), die Steigung ist trotzdem 4,13 ✓.
  6. Intensität 50 % → 100 % bei U = 0,6 V: I = 1 · (1 − 0,6/1,1596) = 0,483 nA → 0,966 nA, also doppelt; U_G bleibt gleich ✓.
- **Sonderfälle:**
  - Knapp unter f_G: Cs 639 nm gibt E_kin = 0,0003 eV, 640 nm gibt keine Elektronen ✓.
  - Intensität 0: „Lampe aus“, I = 0 ✓. Messwert aufnehmen ergab vorher den Punkt U_G = 0 → jetzt mit Warnung verweigert.
  - Reglergrenzen: λ = 250 nm, U_G für alle Metalle < 4 V (Cs 3,02 V), U-Bereich reicht. λ = 700 nm: bei keinem Metall Elektronen ✓.
  - UV wird als gestrichelte, blassviolette Photonen gezeigt ✓.
  - Kupfer (λ_G = 276,8 nm) hat in der automatischen Messreihe nur einen Punkt → „mindestens zwei Messpunkte nötig“ (siehe Entscheidungen).
- **Austrittsarbeiten:** Cs 1,94; K 2,25; Na 2,28; Li 2,46; Zn 4,34; Cu 4,48 eV. Das sind die üblichen Werte deutscher Schulbuchtabellen. Neuere Tabellen (CRC) nennen etwas größere Werte (Cs ≈ 2,1; Na ≈ 2,4; Cu ≈ 4,5–4,7 eV). Das Lernmaterial weist auf die Abweichungen je nach Quelle und Oberfläche hin ✓.
- **Einheiten, Rundung:** Energien und Spannungen mit 2 Nachkommastellen, f mit 4 gültigen Ziffern (vorher 3 – passte nicht zu „3,00 · 10⁸“). Der Achsenabschnitt der Auswertung heißt jetzt „−W_A ≈ −1,94 eV, also W_A ≈ 1,94 eV“ (vorher „Achsenabschnitt W_A ≈ 1,94“). Kein „−0,00 V“ mehr beim Abgleich ohne Elektronen.
- **Begriffe:** Gegenfeldmethode, Gegenspannung, Grenzfrequenz/-wellenlänge, Austrittsarbeit, Einstein-Gerade, Fotostrom, Sättigungsstrom ✓.
- **Neue/ergänzte Tests:** `tests/photoeffekt.test.ts` hat 6 neue Tests, jetzt 13:
  - h·c und h in eV
  - knapp an λ_G
  - Intensität 0
  - Reglergrenzen
  - Abgleich `zeroVoltage` (aufgerundet, danach kein Strom) für alle Metalle und Wellenlängen
  - Aufgabenwerte A1–A4

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  - A1: Mit c = 3,00 · 10⁸ m/s ist f = 7,50 · 10¹⁴ Hz, im Material stand 7,49 → korrigiert. Ein Hinweis erklärt, warum die Simulation 7,495 zeigt. E_Ph = 3,10 eV, E_kin = 1,16 eV ✓.
  - A2: 4,69 · 10¹⁴ Hz, 639 nm, 1,91 eV ✓.
  - A3: 286 nm ✓.
  - A4: f₂ = c/300 nm = 10,00 · 10¹⁴ Hz, im Material stand 9,99 → korrigiert. h = 1,03 eV / 2,50 · 10¹⁴ Hz = 4,12 · 10⁻¹⁵ eV·s ≈ 6,6 · 10⁻³⁴ J·s ✓.
  - A5: Erklärung richtig. Mit Zahlen aus der Simulation ergänzt (0,48 → 0,97 nA).
- **Aufgabenmodus:** Mit `_hide=1` bzw. `val=0` waren die Ergebnisse verdeckt, aber im Bild standen weiter „E_Ph = 3,10 eV“ (Lösung A1) und „U_G = 1,16 V“ im I-U-Diagramm.
  - Jetzt sind beide über `ctx.isHidden('photon')` bzw. `ctx.isHidden('ekin')` ausgeblendet.
  - W_A bleibt sichtbar, es ist in allen Aufgaben gegeben.
  - Die Einstein-Gerade bleibt. Am Graphen kann man nur ungenau ablesen, das ist gewollt.
- **„Beispiel laden“ geklickt:** alle fünf geladen, dazu alle Aufgaben- und Ausprobieren-Links. „Doppelte Intensität“ (60 → 100 %) heißt jetzt „Volle Intensität (100 %)“. Im Lernmaterial (DE und EN) gibt es zum Verdoppeln jetzt die Links 50 % / 100 %.
- **Texte:** DE: A1, A4 und A5 wie oben; Ausprobieren 3 mit 50 % → 100 %. EN: Ausprobieren 3 korrigiert (kürzer als DE, laut Projektregel zulässig).

## 3. Geräte (Prüfbogen)
- **Geräte:** Handy klein und groß, iPad hoch und quer, Laptop, 1920 und Beamer, jeweils hell und dunkel: keine Überläufe, keine Konsolenfehler.
  - Das Layout wählt schon nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`).
  - iPad quer: nebeneinander, gut lesbar. Strommesser auf dem Handy vollständig (vergrößert geprüft).
- **Überlappungen:** Die Pille „h ≈ 4,13 · 10⁻¹⁵ eV·s“ lag oben rechts auf den Messpunkten und der Ausgleichsgeraden. Jetzt steht sie unten rechts, dort liegt die Gerade nie (geprüft mit Cs und Zn).
- **Maus:** Den Drehknopf der Spannungsquelle gezogen: U ändert sich, die Anzeige folgt ✓. Der Tipp lautete „Die markierten Punkte lassen sich ziehen“. Jetzt steht dort ein eigener `hint` zum Drehknopf.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓. Abgleich und Messreihe arbeiten dann sofort.
- **Tastatur:** Laut JSON in Ordnung. Den Drehknopf ersetzt der Regler „Gegenspannung U“ vollständig, deshalb kein `setKeyTargets`.
- **Namen:** keine Bedienelemente ohne Namen. Canvas-Beschreibung vorhanden, Werte stehen auch in den Ergebnissen.
- **Farben:**
  - Diagramme nutzen `ctx.theme.series`. Gerät, Lichtfarbe und Metalle haben Sachfarben.
  - Zustände stehen zusätzlich als Text („keine Elektronen“, „I = 0“).
  - Ob Strom fließt, zeigen Zeiger und Text, nicht nur eine Farbe: keine reine Rot/Grün-Unterscheidung ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/photoeffekt/model.ts` | neu `zeroVoltage`: U_G auf das 0,01-V-Raster **aufgerundet** (ohne −0) |
| `src/simulations/physik/photoeffekt/index.ts` | Abgleich und Messreihe mit `zeroVoltage`; „Strom null“ unter 0,005 nA (= Anzeige „0,00 nA“) statt 0,02 nA |
| `src/simulations/physik/photoeffekt/index.ts` | Messwert bei Lampe aus verweigert, eigene Warnung „Lampe aus: Ohne Licht ist der Strom immer null.“ |
| `src/simulations/physik/photoeffekt/index.ts` | Aufgabenmodus: E_Ph-Pille und U_G-Etikett über `ctx.isHidden` |
| `src/simulations/physik/photoeffekt/index.ts` | Photonen-Anzeige mit c = 2,998 · 10⁸ m/s und f mit 4 Ziffern; Tabellenkopf mit `<sub>`; Achsenabschnitt „−W_A“ |
| `src/simulations/physik/photoeffekt/index.ts` | eigener `hint` (Drehknopf), Beispiel „Volle Intensität (100 %)“, Steigungs-Pille unten rechts |
| `src/content/simulations/de/photoeffekt.md` | A1 7,50 · 10¹⁴ Hz mit Hinweis, A4 f₂ = 10,00 · 10¹⁴ Hz und ΔU, A5 Zahlen, Ausprobieren 3 mit 50/100 % |
| `src/content/simulations/en/photoeffekt.md` | Ausprobieren 3 mit 50/100 % |
| `tests/photoeffekt.test.ts` | 6 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Nichts Zwingendes.
- Ein Hinweis: Der Ziehen-Tipp `dragHint` spricht immer von „markierten Punkten“. Für Drehknöpfe und Schieber auf der Bühne wäre ein zweiter allgemeiner Text („Bedienelemente im Bild lassen sich drehen/ziehen“) hilfreich.

## 7. Entscheidungen
- **U_G beim Abgleich aufrunden statt runden:** Nur so ist der Strom danach wirklich null. Gerundet blieb z. B. bei 600 nm mit 0,12 V ein Reststrom von 0,09 nA. Messpunkte liegen dadurch höchstens 0,01 V über U_G, die Steigung bleibt 4,13 · 10⁻¹⁵ eV·s.
- **„Strom null“ = Anzeige 0,00 nA:** Bisher galt alles unter 0,02 nA als null. Damit ließen sich bei kleiner Intensität deutlich zu kleine U_G aufnehmen. Jetzt gilt die Anzeigegenauigkeit. Bei sehr kleiner Intensität (5 %) bleibt ein Messfehler von höchstens etwa 5 %, wie bei einem echten Strommesser.
- **Messwert bei Lampe aus verweigert:** Ohne Licht ist I = 0 bei jeder Spannung. Das ist kein Messwert für U_G und würde die Ausgleichsgerade verfälschen.
- **W_A im Aufgabenmodus sichtbar:** Die Angabe steht in allen Aufgaben. Verborgen werden nur E_Ph und U_G. Der Statustext „E_Ph < W_A: keine Elektronen“ bleibt, denn die fehlenden Elektronen sieht man ohnehin.
- **c in der Anzeige auf 2,998 · 10⁸ m/s:** Die Simulation rechnet mit dem genauen Wert. So passt die angezeigte Rechnung (7,495 · 10¹⁴ Hz) zur Zahl. Das Lernmaterial rechnet weiter mit 3,00 · 10⁸ m/s, wie im Unterricht üblich, und erklärt den Unterschied.
- **Beispiel umbenannt statt Werte geändert:** P = 120 % gibt es nicht. „Volle Intensität (100 %)“ beschreibt den Zustand richtig. Zum Verdoppeln führen im Lernmaterial die Links 50 % / 100 %.
- **Austrittsarbeiten unverändert:** Es sind die verbreiteten Schulbuchwerte, und auf Abweichungen je nach Quelle wird hingewiesen.
- **Kupfer mit nur einem Punkt in der automatischen Messreihe belassen:** λ ≥ 250 nm ist die Reglergrenze. Die Meldung „mindestens zwei Messpunkte“ ist richtig und zeigt, dass Kupfer kurzwelliges UV braucht.
- **Kein `setKeyTargets` für den Drehknopf:** Der Regler „Gegenspannung U“ bietet dieselbe Funktion per Tastatur.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3476/3476 grün (151 Dateien), Build ok.
