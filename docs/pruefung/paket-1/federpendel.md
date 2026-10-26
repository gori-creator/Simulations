# Prüfprotokoll: `federpendel` – Federpendel

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `968717b` (vor der Prüfung) · Bogen: `scratchpad/boegen/federpendel.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus verriet v̂, â und die Energie über Diagrammwerte, „Momentan“ und Energiezahlen, die T-Pille stand auch bei `_hide=1`; uneinheitliche Rundung „3,2“ neben „2,67“, „0,5 Hz“ neben „0,92 Hz“; Periodenklammer überlappte das Wert-Etikett bei harter Feder; halb verdeckte Zeitachsen-Zahl an der Fensterkante; „s₀“-Beschriftung unter dem Federkraft-Pfeil; „F_R“ (im Projekt Reibungskraft) für die resultierende Kraft; irreführende Frage in Ausprobieren 6; 1 Aufgabe und 6 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (m = 0,5 kg, D = 20 N/m, ŷ = 8 cm): T = 2π · √(0,5/20) = 2π · 0,15811 = 0,9935 s → „0,993 s“, Pille „0,99 s“ ✓; f = 1/0,9935 = 1,0066 → „1,01 Hz“ ✓; ω = √40 = 6,3246 → „6,32 1/s“ ✓; v̂ = 0,08 · 6,3246 = 0,506 → „0,51 m/s“ ✓; â = 0,08 · 40 = 3,20 m/s² ✓; s₀ = 0,5 · 9,81/20 = 0,2453 m → „24,5 cm“ ✓.
  2. Momentaufnahme t = 2,50 s (φ₀ = −90°): Phase 6,3246 · 2,5 − π/2 = 14,2405 → − 4π = 1,6741; y = 8 · sin 1,6741 = 7,96 cm (Anzeige „8,0 cm“) ✓; v = 0,506 · cos 1,6741 = −0,052 m/s („−0,05 m/s“) ✓; a = −40 · 0,0796 = −3,18 m/s² ✓; E_pot = ½ · 20 · 0,0796² = 0,0634 J, Summe ½ · 20 · 0,08² = 0,0640 J ✓.
  3. Weiche Feder m = 1 kg, D = 10 N/m: T = 2π · √0,1 = 1,987 s ✓, s₀ = 9,81/10 = 98,1 cm ✓, â = 0,1 · 10 = 1,00 m/s² ✓. Harte Feder m = 0,1 kg, D = 60 N/m, ŷ = 1 cm: T = 2π · √(1/600) = 0,2565 → „0,257 s“ ✓, f = 3,90 Hz ✓, ω = √600 = 24,49 ✓, â = 0,01 · 600 = 6,00 m/s² ✓, s₀ = 0,981/60 = 1,6 cm ✓.
  4. Vergleich vierfache Masse: T_A = 2π√(0,25/20) = 0,702 s, T_B = 2π√(1/20) = 1,405 s, Verhältnis 2,00 ✓. Vierfache Federhärte: T_A = 2π√(0,3/10) = 1,088 s, T_B = 0,544 s ✓.
  5. Dämpfung δ = 2 1/s (Reglergrenze) bei m = 1 kg, D = 10 N/m: ω_d = √(10 − 4) = 2,449 → „2,45“, T_d = 2π/2,449 = 2,565 s ✓. Energie „vollständig“ in Ruhe: Spannenergie ½ · 10 · 0,981² = 4,812 J, Lageenergie 1 · 9,81 · 0,08 = 0,785 J ✓; innere Energie 0,045 J = ½ D ŷ² (0,032 J) + Anfangs-Bewegungsenergie ½ · 1 · (2 · 0,08)² (0,0128 J) ✓ (siehe Entscheidungen).
- **Sonderfälle:** Amplitude 0 über den Regler nicht möglich (min 1 cm, Ziehen klemmt auf 1–10 cm); im Modell bleibt der Körper in der Ruhelage, Zeigerlänge 0 (Test). Aperiodischer Grenzfall bei den Reglergrenzen nicht erreichbar (ω₀ ≥ √10 > δ_max = 2), `dampedPeriod` liefert sonst ∞ (Test). Keine Division durch 0 (m ≥ 0,1, D ≥ 10).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** berechnete Werte jetzt mit `fmt.fixed`: T, T_d, T_B und Stoppuhr-T 3 Stellen, f, ω, v̂, â, v, a, Verhältnis 2 Stellen, s₀ und y 1 Stelle, Energie 3 bzw. 4 Stellen (vorher „3,2“ neben „2,67“, „0 J“, „0,064 J“ neben „0,0634 J“). Eingabewerte (m, D, ŷ) bleiben ohne Endnullen. Minus über `formatNumber` als `−`.
- **Begriffe wie im Unterricht:** Elongation, Amplitude, Nullphasenwinkel, Federhärte, Ruhelage, Rückstellkraft, lineares Kraftgesetz, Zeigerdiagramm, Spann-/Lage-/Bewegungsenergie ✓. Resultierende Kraft hieß „F_R“ (im Projekt sonst Reibungskraft, z. B. `schiefe-ebene`) → „F_res“ (EN „F_net“).
- **Neue/ergänzte Tests:** 6 neue Tests in `tests/federpendel.test.ts` (Amplitudenunabhängigkeit numerisch, Reglergrenzen weich/hart/δ_max, Amplitude 0, Phasenbeziehung y–v–a, alle Aufgabenwerte A1–A7, Anfangsgeschwindigkeit bei Dämpfung); jetzt 15 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 0,99 s / 1,01 Hz ✓. A2 D = 4π² · 0,4/1,26² = 9,95 ≈ 10 N/m ✓ (Link m = 0,4, D = 10 → 1,257 s). A3 vierfache Masse bzw. Viertel der Federhärte ✓. A4 v̂ = 0,51 m/s, â = 3,2 m/s² ✓. A5 2π√(0,245/9,81) = 0,993 s ✓, Link m = 1, D = 40 → s₀ = 24,5 cm, T = 0,993 s ✓. A6 ✓. Neu A7 (Energie): E = ½ · 20 · 0,08² = 0,064 J; bei y = 4 cm ½Dy² = 0,016 J → E_kin = 0,048 J → v = √(0,192) = 0,44 m/s.
- **Aufgabenmodus:** Mit `_hide=1` zeigten T-Pille und Periodenklammer T, die Diagrammwerte an der Zeitmarke sowie „Momentan“ v̂/â (A4), die Energiezahlen die Lösung von A7. Jetzt: T-Pille und Klammer nach `isHidden('T')`; v-/a-Werte im Diagramm und Energiezahlen nach `isHidden('now')`; „Momentan“ ist `spoiler`. Kurven, Balken und y-Wert bleiben (Werkzeuge zum Messen).
- **„Beispiel laden“ geklickt:** alle sechs (Start, vierfache Masse, vierfache Federhärte, angestoßen, gedämpft, Kräfte/Energie) und alle Aufgaben- und Ausprobieren-Links (`?per=0&_hide=1`, `?_hide=1`, `?m=0.4&D=10`, `?m=1&D=40`, `?phi=0`, `?amp=2`, Vergleiche, `?damp=0.3&graphs=y`, `?energy=full&vec=F&graphs=yv`) – passen zu den Beschreibungen.
- **Texte vereinfacht/korrigiert:** DE: Ausprobieren 6 fragte „Warum ändert sich die Bewegungsenergie so wenig?“ – sie wechselt aber vollständig zwischen 0 und ½Dŷ²; klein ist sie nur gegenüber Spann- und Lageenergie → neu formuliert (Umwandlung hauptsächlich zwischen Spann- und Lageenergie). Modell-Hinweis zu den Kraftpfeilen (F_F, F_G, F_res = −D·y) und zur Anfangsgeschwindigkeit bei Dämpfung; neue A7. EN: nur der fachliche Hinweis zur Dämpfung ergänzt (EN darf kürzer sein).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung. iPad quer (1024 × 768) nutzt bereits das Nebeneinander-Layout (Umschaltung nur bei `w < 640 && h > 0,9 w`), Diagramme gut lesbar. Handy: Szene über den Diagrammen, Schrift ≥ 10,5 px.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Behoben: Periodenklammer „T“ lag bei harter Feder auf dem Wert-Etikett (Etikett links der Zeitmarke) → Klammer endet davor; Zeitachsen-Zahl „0,5“ halb unter der Fensterkante → mit `plot.axes({ blocked })` weggelassen; „s₀ = 1,6 cm“ unter dem Federkraft-Pfeil → bei „Kräfte“ wird der Platz des längsten Pfeils freigehalten. Rest: bei sehr harter Feder liegen „F_G“ und „F_res“ dicht nebeneinander (lesbar).
- **Touch (Ziehen) und Maus:** Körper mit der Maus gezogen (→ ŷ = 2,5 cm, φ₀ = −90°) und Zeigerspitze gezogen (→ ŷ = 8 cm, φ₀ = 45°, Gesetz „sin(6,32 1/s · t + π/4)“) ✓; Diagramm antippen setzt die Zeitmarke.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung. Ziehen von Körper und Zeiger ist Komfort: Amplitude und Nullphasenwinkel sind Regler, Start/Stoppuhr Knöpfe → kein `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden. Eigener `hint` statt „Die markierten Punkte lassen sich ziehen“: nennt Körper, Zeigerspitze und Zeitmarke.
- **Farben:** alle Kurven und Pfeile aus `ctx.theme.series`, zusätzlich beschriftet (y/v/a, F_F/F_G/F_res, A/B auch gestrichelt) – nicht nur über Farbe unterscheidbar ✓. Szene mit festen Sachfarben, dunkel angepasst.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/federpendel/index.ts` | Aufgabenmodus: T-Pille/Periodenklammer nach `isHidden('T')`, v-/a-Werte im Diagramm und Energiezahlen nach `isHidden('now')`, „Momentan“ als `spoiler` |
| `src/simulations/physik/federpendel/index.ts` | einheitliche Rundung mit `fmt.fixed` (Ergebnisse, Momentan, Diagrammwerte, Energie, s₀) |
| `src/simulations/physik/federpendel/index.ts` | Periodenklammer weicht dem Wert-Etikett aus; `plot.axes({ blocked })` an der Fensterkante; Platz für Federkraft-Pfeil über s₀-Beschriftung (`forceScale`) |
| `src/simulations/physik/federpendel/index.ts` | „F_R“ → „F_res“ (EN „F_net“); eigener `hint`; Hilfetext zum Schalter „Periodendauer anzeigen“ (`resultsParam`) |
| `src/content/simulations/de/federpendel.md` | Ausprobieren 6 neu formuliert, Modell-Hinweise (Kraftpfeile, Dämpfungsstart), neue A7 (Energie) |
| `src/content/simulations/en/federpendel.md` | fachlicher Hinweis zum Dämpfungsstart |
| `tests/federpendel.test.ts` | 6 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Die Simulation hat eine eigene `richText`-Hilfe mit der Schreibweise `F_[G]`; seit es `subText` gibt, könnte sie darauf umgestellt werden (kein Fehler, nur Doppelung).
- `resultsParam` verdeckt bei „aus“ alle `spoiler`-Ergebnisse. Bei Simulationen, deren Schalter fachlich nur einen Wert betrifft (hier „Periodendauer anzeigen“), verschwindet damit auch „Momentan“. Ein Hinweis in `types.ts` oder eine Möglichkeit, einzelne Spoiler vom Schalter auszunehmen, wäre hilfreich.

## 7. Entscheidungen
- **„Momentan“ als `spoiler`, v-/a-Werte und Energiezahlen im Aufgabenmodus verdeckt:** Sonst liest man A4 (v̂, â) und A7 (Energie) direkt ab. Kurven, Achsen, Balken und der y-Wert bleiben – Ablesen am Graphen ist ungenau und erwünscht. Wie bei `freier-fall`.
- **Folge für den Schalter „Periodendauer anzeigen“ (`resultsParam`):** Steht er auf „aus“, sind auch „Momentan“ und Energiezahlen verdeckt. Das passt zu A1 (`?per=0&_hide=1`) und steht jetzt im Hilfetext des Schalters. Schlüssel und Beschriftung unverändert.
- **Anfangszustand bei Dämpfung unverändert:** Das Modell startet so, dass y = ŷ·e^(−δt)·sin(ω_d t + φ₀) exakt gilt; bei φ₀ = −90° hat der Körper dann v₀ = δ·ŷ (bei δ = 0,3 1/s nur 2,4 cm/s). „Echtes Loslassen aus der Ruhe“ würde das angezeigte Gesetz ungenau machen. Im Lernmaterial (Modell) erklärt und per Test abgesichert.
- **T in Ergebnissen mit 3, in der Pille mit 2 Stellen:** Der Vergleich mit der Stoppuhr (ebenfalls 3 Stellen) braucht die dritte Stelle; im Bild reicht 0,99 s.
- **„F_res“ statt „F_R“:** „F_R“ steht im Projekt für die Reibungskraft (z. B. `schiefe-ebene`); „F_res“ ist im Unterricht eindeutig.
- **Ausprobieren 6 umformuliert statt gestrichen:** Die Beobachtung (Bewegungsenergie klein gegen Spann- und Lageenergie) ist lehrreich, nur die Frage war schief.
- **Neue Aufgabe 7 (Energie):** Energieerhaltung ½Dy² + ½mv² ist ein fachlicher Schwerpunkt, hatte aber keine Aufgabe. Nicht ins Englische übernommen (Projektregel).

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3411/3411 grün (148 Dateien), Build ok.
