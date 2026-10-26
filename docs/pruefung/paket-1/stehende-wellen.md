# Prüfprotokoll: `stehende-wellen` – Stehende Wellen

Prüfer: Paket 1 (Vertretung) · Datum: 22.10.2026 · Stand: Commit `8c105e8` · Bogen: `scratchpad/boegen/stehende-wellen.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Der Aufgabenmodus verriet alle Lösungen im Bild: Eigenfrequenzen in Kopfzeile, Karte und Frequenzleiter, λ und λ/2 an der Klammer, die Liste der Eigenfrequenzen beim Erreger. Weitere Fehler: Aufgabe 1 fragte nach c, das am Regler steht; bei λ/4 > L zeigte „Knoten und Bäuche“ den leeren Text „…: m.“; Karte und Ergebnis „Punkt P“ urteilten mit verschiedenen Spielräumen über Knoten und Bauch; die Rundung schwankte (183 Hz neben 183,3 Hz, „0,5“ neben „0,167“, „Ŷ = 1 · a“); der Ziehen-Tipp und die Reglerhilfe zu f passten nicht zu jedem Thema; „1 Bäuche“. Neue Aufgabe zum Kundtschen Rohr, 3 Tests ergänzt. Die Rechenlogik ist fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startbild (festes Ende, f = 660 Hz, c = 286 m/s, d = 0,11 m): λ = 286/660 = 0,4333 m, λ/2 = 0,217 m ✓. d/λ = 0,11/0,4333 = 0,254 → A = 2 · |sin(2π · 0,254)| = 2 · 0,9997 = 2,00 ŷ, „Bauch“ ✓ (λ/4 = 0,108 m).
  2. P mit der Maus auf d = 0,21 m gezogen: d/λ = 0,4846 → A = 2 · |sin(3,045)| = 2 · 0,0966 = 0,19 ŷ, „dazwischen“ ✓.
  3. Gedackte Pfeife (L = 0,5 m, c = 340 m/s, n = 2): L = 3 · λ/4 → λ₂ = 4 · 0,5/3 = 0,667 m, f₂ = 340/0,667 = 510 Hz = 3 · f₁ ✓. Bewegung: Knoten bei 0 und 0,333 m, Bäuche bei 0,167 und 0,5 m ✓. Druck umgekehrt ✓.
  4. Grenzwerte (fest–lose, L = 1,5 m, c = 100 m/s, n = 6): f₁ = 100/6 = 16,7 Hz, f₆ = 11 · 16,67 = 183,3 Hz, λ₆ = 6/11 = 0,545 m ✓.
  5. Melde (L = 1,2 m, c = 240 m/s): f₁ = 240/2,4 = 100 Hz. Bei 150 Hz (ν = 1,5) gilt ohne Dämpfung |sin(k(L−x))/sin(kL)| ≤ 1, angezeigt „Ŷ ≈ 1,0 · a, keine Resonanz“ ✓. Bei 300 Hz: Ŷ ≈ 1/sinh(0,111) = 9,0 · a, Knoten 0; 0,4; 0,8; 1,2 m ✓.
  6. Kundtsches Rohr (beidseitig geschlossen, L = 0,51 m, n = 6): f₆ = 6 · 340/1,02 = 2000 Hz, λ/2 = 0,085 m ✓.
  7. f = 1500 Hz, c = 100 m/s, d = 0,11 m: d/λ = 1,65 → A = 2 · |sin(3,3π)| = 1,62 ŷ ✓.
- **Sonderfälle:** n = 1 (Grundschwingung, für fest–lose λ = 4L) ✓. n = 6 und kleinste/größte f₁ (16,7 bzw. 833 Hz) ✓. Mit f = 10 Hz und c = 500 m/s ist λ = 50 m ≫ L. Dann gibt es nur den Knoten am Ende. Vorher stand „Bäuche bei …: m.“, jetzt „keine (das Seil ist kürzer)“. Eine Frequenz zwischen den Eigenfrequenzen (150 Hz bei f₁ = 100 Hz) zeigt „keine Resonanz“ und „keine ausgeprägten Knoten und Bäuche“ ✓. Bei ν = 45 (f = 1500 Hz, L = 1,5 m, c = 100 m/s) nennt der Text jetzt nur die ersten 7 Knoten und dann „…“, vorher waren es 46.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** `fmt.num` ließ Endnullen weg. Frequenzen stehen jetzt überall einheitlich da: ab 100 Hz ganzzahlig, darunter mit 1 Nachkommastelle (vorher „183,3 Hz“ im Ergebnis neben „183 Hz“ im Bild, und in der Leiter stand „17“ statt 16,7). Knoten- und Bauchlisten haben einheitlich 3 Nachkommastellen. Ŷ, ν und „Momentan“ haben eine feste Stellenzahl.
- **Begriffe wie im Unterricht:** Knoten/Bauch, Phasensprung, festes/loses Ende, Grund- und Oberschwingung, Eigenfrequenz, gedackte Pfeife, Schnelle- und Druckknoten, Resonanz, Melde-Versuch ✓.
- **Neue/ergänzte Tests:** `pointKind` neu im Modell (eine gemeinsame Regel für Karte und Ergebnis). 3 neue Tests: Aufgabenwerte A1–A4 und A6, Reglergrenzen (16,7/183,3/833,3/5000 Hz, λ ≫ L), Punkt P (Bauch, Knoten, dazwischen). Jetzt 18 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  - A1: λ₁ = 1,3 m, f₁ = 220 Hz; λ₂ = 0,65 m, f₂ = 440 Hz; λ₃ = 0,433 m, f₃ = 660 Hz ✓.
  - A2: Knoten bei 0; 0,217; 0,433; 0,65 m, Bäuche bei 0,108; 0,325; 0,542 m ✓.
  - A3: offen 340/680/1020 Hz, gedackt 170/510/850 Hz ✓.
  - A4: Resonanz bei n · 100 Hz; bei 300 Hz drei Bäuche, Knotenabstand 0,4 m ✓.
  - A5: vierfache Spannkraft ✓.
  - A6 (neu): λ = 0,17 m, c = 340 m/s ✓.
- **Aufgabenmodus:** Mit `_hide=1` standen die Lösungen im Bild:
  - A1/A3: f₁ und λ₁ in Kopfzeile und Karte, alle Eigenfrequenzen an der Leiter.
  - A2: λ in der Kopfzeile, λ/2 an der Klammer.
  - A4: f₁ in der Kopfzeile, „nächste Eigenfrequenz“ und die Liste im nicht verdeckten Ergebnis.

  Jetzt ist „Wellenlänge und Frequenz“ ein `spoiler`. Solange es verdeckt ist (`ctx.isHidden('main')`), zeigen Bild und Karten „?“ bzw. nur „λ/2“, „λ/4“.
- **„Beispiel laden“ geklickt:** alle sechs Beispiele (u. a. Melde f₂: Ŷ = 9,0 · a, Knoten 0; 0,325; 0,65 m). Dazu alle Ausprobieren-, Aufgaben- und Lösungslinks. Die Zustände passen zu den Beschreibungen.
- **Texte vereinfacht/korrigiert:**
  - DE A1 umformuliert: c ist gegeben, gefragt sind λ und f. Der Rückweg c = 2L · f₁ steht in der Lösung.
  - Neue A6 zum Kundtschen Rohr (war Schwerpunkt, fehlte bisher).
  - EN Task 1 ebenso angepasst. Sonst ist EN fachlich korrekt und darf kürzer sein, daher unverändert.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung. iPad quer nutzt das Nebeneinander-Layout (`w ≥ 640 || w ≥ 1,3 h`). Handy (390 px) mit Kurztexten, Aufgabenmodus geprüft.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf, keine Überlappungen gefunden. Rest: Bei extremem ν (z. B. 45, f = 1500 Hz an langem, langsamem Seil) wirkt das Seil des Erregers zackig (120 Abschnitte, ca. 5 pro λ). Die K-Marken liegen dann dicht an dicht. Fachlich stimmt es, nur die Darstellung ist grob.
- **Touch (Ziehen) und Maus:** P mit der Maus von 0,11 m auf 0,21 m gezogen, die Werte stimmen (oben). Das Ziehen in der Resonanzkurve rastet an f_n ein. Das Antippen der Leiter wechselt n.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung. Alle antippbaren Dinge haben einen Regler (P → „Abstand vom Ende“, Leiter → „Ordnung n“, Kurve → „Frequenz f“), deshalb kein `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** Es gibt keine Bedienelemente ohne Namen. Die Canvas-Beschreibung ist vorhanden.
- **Farben:** nur aus `ctx.theme.series`. Hinlaufende, reflektierte und überlagerte Welle sind zusätzlich beschriftet bzw. in der Legende (y_h, y_r, y) und unterscheiden sich in der Strichstärke. K/B stehen als Buchstaben da ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/stehende-wellen/model.ts` | `pointKind` (Knoten/Bauch/dazwischen, Spielraum 1 % von λ) |
| `src/simulations/physik/stehende-wellen/index.ts` | „Wellenlänge und Frequenz“ als `spoiler`; f, λ, λ/2, λ/4 und die Leiterwerte im Aufgabenmodus verdeckt |
| `src/simulations/physik/stehende-wellen/index.ts` | „keine (das Seil ist kürzer)“ statt leerer Liste; Resonanz-Knotenliste gekürzt |
| `src/simulations/physik/stehende-wellen/index.ts` | einheitliche Rundung (Frequenzen, Listen, Ŷ, ν, Momentan); „1 Bauch“ |
| `src/simulations/physik/stehende-wellen/index.ts` | Karte und Ergebnis „Punkt P“ mit derselben Regel |
| `src/simulations/physik/stehende-wellen/index.ts` | `hint` je Thema; Reglerhilfe zu f („beim Erreger“) |
| `src/content/simulations/de/stehende-wellen.md` | A1 umformuliert, neue A6 Kundtsches Rohr |
| `src/content/simulations/en/stehende-wellen.md` | Task 1 wie DE |
| `tests/stehende-wellen.test.ts` | 3 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- nichts

## 7. Entscheidungen
- **„Wellenlänge und Frequenz“ als `spoiler`:** Es enthält in allen drei Themen die Lösung (λ bei A2, f_n bei A1/A3, die Liste der Eigenfrequenzen bei A4). Die Werte im Bild hängen gezielt an `ctx.isHidden('main')`. Mit dem Aufdecken dieses Ergebnisses erscheinen sie wieder. Ohne `_hide` ändert sich nichts.
- **Kein `resultsParam`:** Der Schalter „Knoten und Bäuche markieren“ ist ein Werkzeug. Als `resultsParam` würde er beim Ausschalten auch Punkt P und Resonanz verdecken.
- **Punkt-P-Karte bleibt im Aufgabenmodus sichtbar:** P ist das Messwerkzeug zum Prüfen von A2, und das Lineal bleibt auch. Gelöst wird über die Rechnung, die Simulation dient zur Kontrolle.
- **A1 umformuliert statt Regler versteckt:** c steht ohnehin am Regler. Jetzt ist c gegeben, gefragt sind λ und f (im Bild verdeckt). Den Rückweg c = 2L · f₁ nennt die Lösung.
- **Spielraum 1 % von λ für „Knoten“/„Bauch“:** P läuft in 1-cm-Schritten. Das alte Ergebnis verlangte A < 0,02 ŷ (praktisch unerreichbar) bei A > 1,98 ŷ für Bäuche (leicht erreichbar). Die Karte urteilte schon nach 1 %, jetzt gilt für beide dieselbe Regel.
- **Frequenzen ab 100 Hz ganzzahlig, darunter mit 1 Stelle:** f₁ kann bis 16,7 Hz sinken; „17“ wäre ungenau, „183,3“ ist Scheingenauigkeit.
- **Neue A6 (Kundtsches Rohr):** Das Rohr war im Material nur erwähnt. Die Aufgabe übt „Knotenabstand = λ/2“ an einem Realexperiment und passt zu einem beidseitig geschlossenen Rohr mit n = 6.
- **Grobe Darstellung bei sehr großem ν nicht geändert:** Mehr Abschnitte würden die Rechenzeit vervielfachen. Der Fall tritt nur an Reglergrenzen auf.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3466/3466 grün (151 Dateien), Build ok.
