# Prüfprotokoll: `polstellen-asymptoten` – Polstellen und Asymptoten gebrochen-rationaler Funktionen

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `69a5e4d` (Ausgangsstand) · Bogen: `/tmp/boegen3/polstellen-asymptoten.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startzustand f(x) = (x − 1)/(x + 2): D = ℝ \ {−2}, Nullstelle 1, Pol −2 mit VZW; (x − 1) : (x + 2) = 1 Rest −3 ⇒ f(x) = 1 − 3/(x + 2), y = 1 ✓; f(0) = −1/2 = −0,5 ✓. Wertetabelle: f(−2,1) = −3,1/(−0,1) = 31, f(−1,9) = −2,9/0,1 = −29, f(−2,001) = −3,001/(−0,001) = 3001, f(−1,999) = −2999 (Anzeige „3 001“, „−2 999“) ✓; Näherung f(x) ≈ −3/(x + 2) (c = −2 − 1 = −3) ✓.
  2. Schräg: (x² − 1)/(x − 2): Tafel x · (x − 2) = x² − 2x abziehen → 2x − 1; 2 · (x − 2) = 2x − 4 abziehen → Rest 3 ⇒ y = x + 2 ✓; f(0) = −1/(−2) = 0,5 ✓; Abstand bei x = 40: 3/38 ≈ 0,079 ✓; Pol 2 links −∞ (f(1,99) = 2,9601/(−0,01) < 0), rechts +∞ ✓.
  3. Näherungsparabel: 0,5(x + 2)x(x − 2)/(x + 1), Zähler 0,5x³ − 2x; Tafel 0,5x² → Rest −0,5x² − 2x; −0,5x → Rest −1,5x; −1,5 → Rest 1,5 ⇒ y = 0,5x² − 0,5x − 1,5 ✓ (Bild und Karte); Probe (0,5x² − 0,5x − 1,5)(x + 1) + 1,5 = 0,5x³ − 2x ✓.
  4. Lücke (x² − 1)/(x − 1): Loch (1 | 2), Wertetabelle 1,9 / 2,1 / 1,99 / 2,01 …, lim = 2 ✓. 2x/(x² − 4): Pole ±2 mit VZW, y = 0, Vorzeichen − | + | − | + ✓, punktsymmetrisch ✓. 2x²/(x − 1)²: Pol 1 ohne VZW (+∞ | +∞), y = 2 ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): a = 0 (Nullfunktion mit Löchern, keine Polstelle, Hinweis im Bild und in den Karten) ✓; negatives a, Pol der Ordnung 3 an der Reglergrenze 5, (x − 1)/(x − 1)² (Pol, nicht Lücke), (x − 1)²/(x − 1) (Loch auf der x-Achse, keine Nullstelle), 0 als Definitionslücke („kein Schnittpunkt (0 ∉ D)“) im Modell richtig. Schnittpunkt mit der Asymptote an einer Lücke wird korrekt verworfen.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma, „−“ und Tausender-Abstand über `fmt` ✓. **Behoben:** Steckbrief „f(0) = …“ und „lim f(x) = …“ standen immer mit „=“, auch bei gerundeten Werten (z. B. f(0) = −1/3 bei (x − 1)/(x + 3)) ⇒ „≈“, wenn gerundet. Offen gelassen wie bei `kurvendiskussion`: Punkte in Pillen (Lücke, Schnittpunkt) ohne „≈“.
- **Begriffe wie im Unterricht:** Definitionsmenge, Definitionslücke, Polstelle mit/ohne VZW, behebbare Lücke, waagrechte/schräge/senkrechte Asymptote, Näherungskurve, Polynomdivision mit Rest, Leitkoeffizient ✓.
- **Neue/ergänzte Tests:** `tests/polstellen-asymptoten.test.ts` um 5 Tests ergänzt (Lücke mit nicht abbrechendem y = 2/3 neben Pol und verworfenem Asymptoten-Schnitt; negatives a mit doppeltem Pol; dreifacher Pol an der Reglergrenze; f(0) = −1/3; Loch auf der x-Achse). Bestehende 24 Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1–A7 siehe oben; A4 f(−2,01) = −3,01/(−0,01) = 301, f(−1,99) = −2,99/0,01 = −299 ✓; A6 x² − 2x − 3 = x² + 2x − 3 ⇔ x = 0, f(0) = (1 · (−3))/(3 · (−1)) = 1 ✓; A7 2x²/(x − 1)² ✓. Keine Rechenfehler im Bestand.
- **„Beispiel laden“ geklickt:** alle 8 Beispiele und alle Links (simshot, 1440 hell/dunkel, dazu 1024, 768, 360, EN). Die Links zeigen den beschriebenen Zustand; Ziehen der Perle bei 2 in den Ring bei 1 (Ausprobieren 2) kürzt wie beschrieben. **Behoben (Lösung schon sichtbar bei `show=0`):**
  - Funktionsterm-Karte strich gemeinsame Faktoren durch und zeigte „= x + 1 für x ≠ 1“ (Lösung von Aufgabe 2) ⇒ verdeckt kein Durchstreichen, kein gekürzter Term.
  - Senkrechte Asymptoten und Pillen „x = ?“ verrieten, welche Nennernullstelle Polstelle ist; die Pille „Lücke (? | ?)“ verriet die Lücke ⇒ verdeckt ausgeblendet (Graph, Perlen und Ringe bleiben als Kontrolle).
  - Ergebnisliste: Die Zeile „Behebbare Lücken“ erschien nur, wenn es eine Lücke gab ⇒ immer da („keine“). Ebenso im Steckbrief die Zeilen „Behebbare Lücke“ und „Symmetrie“: verdeckt immer gezeigt.
  - Titel der Wertetabelle „Annäherung an die Polstelle/Lücke …“ und Farben der Vorzeichentabellen-Kopfzeile verrieten Pol bzw. Lücke ⇒ verdeckt neutral („Annäherung an x = −2“).
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (4 statt 8 Ausprobieren-Punkte, 3 statt 7 Aufgaben, Lösungen ohne Rechnung, keine Tabelle der Gradregel, Ideen 3 Punkte) ⇒ vollständig auf den Stand der DE-Fassung gebracht, mit Dezimalpunkt.
  - DE/EN fachlich präzisiert: behebbare Lücke nur, wenn der Faktor im Zähler mindestens so oft vorkommt wie im Nenner; Beispiel (x − 1)/(x − 1)² ist ein Pol.
  - DE/EN: Perle und Ring auch über die Form beschrieben („ein Punkt“, „ein Kreis mit Kreuz“); Hinweis auf „Z“/„N“ in der Vorzeichentabelle.
  - Lehrplanbezug mit `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` abgeglichen: Jgst. 11, Lernbereich 2 und Jgst. 12, Lernbereich 4.1 (dort `polstellen-asymptoten` eingetragen) ⇒ im Text genannt. „Bitte am Lehrplan prüfen“ bleibt nur für die Näherungskurven (siehe Rückfragen).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Handy und iPad hoch: Bild oben, Karten darunter ✓; iPad quer, Laptop, 1920, Beamer: Karten rechts ✓; Dunkelmodus lesbar ✓.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf, keine Konsolenfehler (Bogen, vorher und nachher). Offen (unkritisch): Bei eingeblendeter Polynomdivision fehlt bei 1440 und iPad quer die Steckbrief-Karte (Werte stehen in der Ergebnisliste); am iPad quer ist die Asymptoten-Karte im Startzustand verkürzt. Die Beschriftungen „+∞“/„−∞“ an den Polpfeilen liegen teils auf dem Graphen.
- **Touch (Ziehen) und Maus:** Perle mit der Maus in den Ring gezogen (x = 2 → 1): Faktor kürzt sich, Lücke (1 | 2) ✓. Touch über `addTarget` mit größerem Trefferbereich, ein Finger auf der Fläche zeigt den Funktionswert an dieser Stelle. Zieh-Hinweis passt (Perlen und Ringe sind ziehbar).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen). Eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach Start, „Punkt entlanglaufen lassen“, „Polynomdivision Schritt für Schritt“, „Blick aus der Ferne“, Wertetabelle, „Eigenschaften aufdecken“, Kürzen über den Regler, Zählergrad ändern und allen 8 Beispielen: 16/16 still. Gegenprobe ohne reduzierte Bewegung: 16/16 bewegt.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles auch über Regler, Schalter und Knöpfe erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) beschreibt Graph, Perlen, Ringe, Asymptoten, Vorzeichenstreifen und Karten ✓.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Pillen und Fernansicht-Legende (rgba), Karten (#ffffff/#151c27, Rand #e1e6ee/#273142) hatten feste Farben ⇒ aus `theme.bg`/`theme.text` gemischt; Schatten und Glanzlicht bleiben neutral. **Behoben:** In der Vorzeichentabelle waren Zähler- und Nennerfaktoren nur über Grün/Rot unterscheidbar ⇒ Kürzel „Z“/„N“ (EN „N“/„D“) vor jedem Faktor. Sonst: Perle (Punkt) vs. Ring (Kreis mit Kreuz), Vorzeichenstreifen mit „+/−“ und Lage über/unter der Achse, Polpfeile mit Richtung und „±∞“, Ergebniszeile mit „0“, „||“ und „○“, Asymptote gestrichelt ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/polstellen-asymptoten/index.ts` | Pillen, Karten und Legende aus dem Theme statt fester Farben |
| `src/simulations/mathematik/polstellen-asymptoten/index.ts` | verdeckt: kein Kürzen im Term, keine Pol-Linien/-Pillen, keine Lücken-Pille, neutrale Wertetabelle und Vorzeichen-Kopfzeile, Steckbrief- und Ergebniszeilen immer vorhanden |
| `src/simulations/mathematik/polstellen-asymptoten/index.ts` | „≈“ bei gerundetem f(0) und Grenzwert |
| `src/simulations/mathematik/polstellen-asymptoten/index.ts` | Vorzeichentabelle: „Z“/„N“ vor den Faktoren |
| `src/content/simulations/de/polstellen-asymptoten.md` | Lücke/Pol präzisiert, Formen beschrieben, Lehrplanbezug nach Lehrplandatei, verdeckte Inhalte genannt |
| `src/content/simulations/en/polstellen-asymptoten.md` | auf den Stand der DE-Fassung gebracht |
| `tests/polstellen-asymptoten.test.ts` | 5 Tests ergänzt |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `ableitungsfunktion`/`kurvendiskussion`: eine höhere Bühne bzw. `aspectNarrow` je Zustand würde bei eingeblendeter Polynomdivision die Steckbrief-Karte zurückbringen.
- Eine gemeinsame Hilfe für „=“/„≈“ (`fmt.approx`) würde das eigene `eqS` ersetzen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Näherungskurven (Zählergrad > Nennergrad + 1):** Die Lehrplandatei nennt für Jgst. 11, LB 2 nur waagrechte, schräge und senkrechte Asymptoten. Ob Näherungskurven im Unterricht vorkommen sollen, bitte am Lehrplan prüfen (Hinweis im Lernmaterial belassen).
- **Verdeckte Ergebnisse:** Graph, Perlen und Ringe bleiben sichtbar, das Loch im Graphen ist also bei Aufgabe 2 erkennbar. Ich habe den Graphen als Kontrolle gelassen; falls die Aufgaben ganz ohne Graph gedacht sind, bitte Bescheid geben.
- **„Keine Asymptote“ bei aufgehender Division** (z. B. (x² − 1)/(x − 1) = x + 1): Die Simulation nennt die Gerade nicht Asymptote, sondern „f(x) = x + 1 für x ∈ D“. Das halte ich für richtig; bitte bestätigen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3120/3120 grün (135 Dateien), Build ok.
