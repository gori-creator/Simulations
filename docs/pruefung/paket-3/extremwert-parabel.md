# Prüfprotokoll: `extremwert-parabel` – Extremwertaufgaben mit Parabeln

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `26655c1` · Bogen: `/tmp/boegen3/extremwert-parabel.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Gehege an der Mauer, L = 40 m, x = 6 m: y = 40 − 2 · 6 = 28 m, A = 6 · 28 = 168 m². Scheitelform −2(x² − 20x) = −2((x − 10)² − 100) = −2(x − 10)² + 200, also S(10 | 200). Anzeige: „x = 6 m: y = 28 m, A = 168 m²“, „S(10 | 200)“ ✓
  2. Rechteck im Dreieck, a = 80 cm, b = 60 cm, x = 16 cm: h = 60 − 60/80 · 16 = 60 − 12 = 48 cm, A = 16 · 48 = 768 cm². A(x) = −0,75x² + 60x = −0,75(x − 40)² + 0,75 · 1600 = −0,75(x − 40)² + 1200. Anzeige: h = 48 cm, A = 768 cm², S(40 | 1200), halbe Dreiecksfläche 80 · 60 / 4 = 1200 ✓
  3. Eintrittspreis p = 12 €, n = 200, k = 25: E(x) = (12 + x)(200 − 25x) = −25x² − 100x + 2400 = −25(x² + 4x) + 2400 = −25((x + 2)² − 4) + 2400 = −25(x + 2)² + 2500. Preis 10 €, 200 + 50 = 250 Besucher, 10 · 250 = 2500 €. Anzeige „Eine Preissenkung lohnt sich: größter Erlös 2500 € beim Preis 10 € statt 12 €, dann kommen 250 Besucher.“ ✓
  4. Zusätzlich „Maximum suchen“ bei p = 8 €, n = 300, k = 20: x = 3,5 €, p = 11,50 €, n = 300 − 70 = 230, E = 11,5 · 230 = 2645 € ✓
- **Sonderfälle:** Randwerte x = 0 bzw. x = hi (offenes Intervall, Hinweis „Randwert“), Preissenkung (Scheitel bei negativem x), Leitkoeffizient −1 („−(x² − 14x)“, Notiz „−1 ausklammern“), nicht abbrechende Brüche (a = 120, b = 20: −1/6 als gestapelter Bruch). Reglergrenzen: Scheitel liegt immer im Bereich der x-Regler (größte Preiserhöhung (600/5 − 2)/2 = 59 € ≤ 60 €). Division durch 0 ausgeschlossen (a ≥ 20, k ≥ 5).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** durchgehend über `fmt`, echtes Minus, Einheiten m/m², cm/cm², €; EN mit Dezimalpunkt und `(0, 100)` als Intervallschreibweise.
- **Begriffe wie im Unterricht:** Hauptbedingung, Nebenbedingung, Zielfunktion, Definitionsbereich ]0; 20[, quadratische Ergänzung, binomische Formel, Scheitelform – passend.
- **Fehler gefunden (Wertetabelle):** Liegt der aktuelle Wert zwischen zwei Rasterwerten, wurde die eingeschobene Zeile beim Maximum nicht berücksichtigt. Beispiel Aufgabe 4 (p = 4, n = 600, k = 50, x = 4): Tabelle zeigte 4 → 3200 €, markierte aber 5 → 3150 € grün als größten Wert und schrieb „Größter Tabellenwert bei x = 5 €“. Behoben: Das Maximum wird über alle angezeigten Zeilen bestimmt; „links und rechts symmetrisch“ nur noch, wenn das Maximum ein Rasterwert ist.
- **Neue/ergänzte Tests:** Wertetabelle mit Scheitel zwischen zwei Rasterwerten (Raster −2,5 … 10, Rastermaximum 3150 € < 3200 € bei x = 4); Reglergrenzen aller Situationen (Scheitel im Reglerbereich).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 −2(x − 15)² + 450 ✓; A2 −(x − 7)² + 49 ✓; A3 −0,4(x − 50)² + 1000, Dreieck 2000 cm² ✓; A4 −50(x − 4)² + 3200, 8 € und 400 Gäste ✓; A5 −2(x − 6)² + 72, Boden 12 cm ✓; A6 Begründung über Nullstellen/Symmetrie ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele bzw. ihre Links und alle Links im Lernmaterial (DE 7 Ausprobieren-Links, 3 Aufgaben-Links mit `sol=0&_hide=1`, 5 Lösungslinks; EN neu dazu) geladen – Zustände passen zum Text, Ergebnisse verdeckt, wo vorgesehen.
- **Texte vereinfacht/korrigiert:** DE Ausprobieren 2: „Zwischen welchen Tabellenwerten liegt das Maximum?“ passte nicht (x = 10 ist selbst Tabellenwert) → „Bei welchem Tabellenwert ist die Fläche am größten?“. EN um die fehlenden Inhalte ergänzt (Ausprobieren: Dreieck und Regenrinne; Aufgaben: Quadrat bei festem Umfang, Rechteck im Dreieck), Aufgaben neu nummeriert, Dezimalpunkt im EN-Text.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Karten vorhanden, Layout passend (Handy: Szene, Graph, Karte untereinander; ab 640 px nebeneinander).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen (behoben):**
  - Handy, Rechteck im Dreieck: „a = 100 cm“ lag auf der Hypotenuse, „h = 20 cm“ war links abgeschnitten → Ränder aus der Breite der Beschriftungen berechnet.
  - Handy, Gehege: „x = 12,3 m“ links abgeschnitten (Rand zu schmal für zwei Nachkommastellen) → linker Rand aus der Pillenbreite; die Flächenzahl lag bei breitem, flachem Gehege auf dem Griff → an der Mauer unter die Maßlinie y, ohne Mauer über das Gehege.
  - Handy, Graph: „x in cm“ stand über dem rechten Endpunkt des Definitionsbereichs → bei schmaler Bühne rechts mehr Platz im Achsenbereich.
  - Kein waagerechter Überlauf, keine Konsolenfehler (403 nur Schriften über den Symlink).
- **Touch (Ziehen) und Maus:** Ziehen am Graphenpunkt mit der Maus geprüft (x wandert, Werte folgen); Griff in der Szene hat Touch-Trefferradius 28 px.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge Kopfzeile → Bedienelemente laut Bogen, alles über Regler/Auswahl erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; `strings.canvas` beschreibt Szene, Graph und Karte (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Bedeutungsfarben aus `ctx.theme.series`; Materialfarben der Ersatzgrafik (Ziegel, Holz, Blech) sind fest im Code, tragen aber keine Bedeutung. Scheitel (grüner Ring, Beschriftung S(…)) und aktueller Punkt (gefüllt, Beschriftung A(x)) unterscheiden sich auch in Form und Text; in der Tabelle zusätzlich der Hinweistext.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/extremwert-parabel/index.ts` | Wertetabelle: Maximum über alle angezeigten Zeilen, Hinweistext passend |
| `src/simulations/mathematik/extremwert-parabel/index.ts` | Dreieck: Ränder für „a = …“ und „h = …“ aus Textbreite; Gehege: linker Rand aus Pillenbreite, Flächenzahl nicht mehr auf dem Griff; Graph: rechts mehr Platz bei schmaler Bühne |
| `tests/extremwert-parabel.test.ts` | 2 neue Tests (Tabelle mit Scheitel zwischen Rasterwerten, Reglergrenzen) |
| `src/content/simulations/de/extremwert-parabel.md` | Frage zu Ausprobieren 2 präzisiert |
| `src/content/simulations/en/extremwert-parabel.md` | fehlende Ausprobieren-Punkte und Aufgaben ergänzt, Dezimalpunkt |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Ein geteilter Link mit x außerhalb des Bereichs beim Eintrittspreis (z. B. `xp=20` bei hi = 15) zeigt den Hinweis „Randwert: keine Fläche mehr“ – beim Erlös passt „Fläche“ nur im Bild-Sinn. Nur über Links erreichbar (Regler werden begrenzt); Wortlaut bitte bei Gelegenheit entscheiden.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2859/2859 grün (125 Dateien), Build ok.
