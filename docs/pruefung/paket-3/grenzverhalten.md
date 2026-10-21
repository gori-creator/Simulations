# Prüfprotokoll: `grenzverhalten` – Grenzverhalten und Asymptoten

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `48745e8` (Ausgangsstand) · Bogen: `/tmp/boegen3/grenzverhalten.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (2x + 1)/(x − 1) = 2 + 3/(x − 1), x → +∞, ε = 0,5: 3/(x − 1) < 0,5 ⇔ x − 1 > 6 ⇔ x > 7 ⇒ „x_ε = 7“ (Bild, Karte, Ergebnis) ✓. ε = 0,35: x − 1 > 3/0,35 = 8,5714 ⇒ x_ε ≈ 9,57 ✓ (Karte jetzt „3/0,35 ≈ 8,57“, vorher „= 8,57“). Wertetabelle: f(10) = 21/9 = 2,3333, |f − 2| = 0,3333; f(100) = 201/99 = 2,0303; f(1000) = 2003/999 = 2,003003 ⇒ „2,0030 / 0,0030“; f(10 000) = 20 001/9999 = 2,00030 ⇒ „2,0003 / 3,00 · 10⁻⁴“ ✓; x = 1 „n. def.“ ✓. Annäherung von oben (3/(x − 1) > 0 für x > 1) ✓, für x → −∞ von unten, x_ε = 1 − 3/0,5 = −5 ✓.
  2. (3x² + 1)/(x² + 1) = 3 − 2/(x² + 1), ε = 0,2: 2/(x² + 1) < 0,2 ⇔ x² > 9 ⇔ |x| > 3 ⇒ x_ε = 3 ✓; ε = 0,15: √(2/0,15 − 1) = √12,333 = 3,5119 ⇒ „x_ε ≈ 3,51“ ✓ (Karte jetzt „|x| > √(2/0,15 − 1)“ statt der gerundeten Wurzel „√12,33“ hinter „⇔“). Immer von unten, da 2/(x² + 1) > 0 ✓.
  3. 2ˣ/(2ˣ + 1): x → −∞, ε = 0,2: 2ˣ < 0,2/0,8 = 0,25 ⇔ x < −2 ⇒ „x_ε = −2“ ✓; Tabelle f(−1) = 0,5/1,5 = 0,3333, f(−2) = 0,25/1,25 = 0,2 (genau ε, rot, nicht im Schlauch ✓), f(−5) = 1/33 = 0,0303, f(−10) = 1/1025 = 9,76 · 10⁻⁴ ✓. x → +∞, ε = 0,15: 1/(2ˣ + 1) < 0,15 ⇔ 2ˣ > 5,667 ⇔ x > log₂ 5,667 = 2,5025 ⇒ „x_ε ≈ 2,50“ ✓.
  4. sin(x)/x, ε = 0,1: größte Lösung von |sin x| = 0,1x ist 8,4232 (sin 8,4232 = sin 2,1400 = 0,8423) ⇒ „x_ε ≈ 8,42“ ✓; sicher ab |x| > 1/0,1 = 10 ✓; Tabelle sin 10/10 = −0,0544, sin 100/100 = −0,0051, sin 1000/1000 = 8,27 · 10⁻⁴ ✓. x · 2⁻ˣ, ε = 0,25: 4 · 2⁻⁴ = 0,25 ⇒ „x_ε = 4“ (numerisch, als exakt erkannt) ✓. 2x/(x² + 1), x → −∞, ε = 0,35: (1 + √(1 − 0,1225))/0,35 = 1,93675/0,35 = 5,5336 ⇒ „x_ε ≈ −5,53“ ✓.
  5. 0,1x³ − x, Probe-Schlauch um 3, ε = 0,5: 0,1x³ − x = 3,5 bei x = 4,2665 ⇒ „verlässt den Schlauch: x ≈ 4,27“ ✓; f(x) > 100 ab 10,33 (0,1 · 10,334³ − 10,334 = 100,03) ✓; Gradregel 3 > 0 ⇒ +∞, für x → −∞ ungerade Differenz ⇒ −∞ ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): Definitionslücken (x = 1, x = 0) als „n. def.“ und Lücke im Graphen ✓. Großes ε: 2ˣ/(2ˣ + 1) mit ε = 1 bzw. 2x/(x² + 1) mit ε = 1 (Rand nur bei x = ±1 berührt) ⇒ „gilt für alle x“ bzw. x_ε = 1 ✓. Bestimmte Divergenz: kein x_ε, Probe-Schlauch, „nie im Schlauch“ für 0,1x³ − x links ✓. ε = 0,05: x_ε = 61 ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und „−“ über `fmt` ✓. **Behoben:**
  - „=“ hinter gerundeten Zwischenwerten in der ε-Karte („3/0,35 = 8,57“, „1/0,15 = 6,67“, „2/0,15 = 13,33“, „1/0,15 − 1 = 5,67“) ⇒ jetzt „≈“; hinter „⇔“ stehen keine gerundeten Zahlen mehr (√(2/ε − 1), log₂(1/ε − 1), log₂(ε/(1 − ε)) symbolisch, wenn nicht exakt).
  - „für alle x > 8,42“ (Karte, Ergebnisse, Erfolgsmeldung) war bei x_ε ≈ 8,4232 knapp falsch ⇒ bei gerundetem x_ε jetzt „für alle x > x_ε ≈ 8,42“, bei exaktem weiter „für alle x > 7“.
  - Endnullen bei gerundeten Werten (Tabelle „2,0030 / 0,0030“ statt „2,003 / 0,003“, „3,00 · 10⁻⁴“, „x_ε ≈ 2,50“), exakte ohne („7“, „0,2“, „−1“). Werte nahe 0 stehen in der f(x)-Spalte als Zehnerpotenz wie in der Abstandsspalte (vorher „−0,000031“ und „0,00000095“), zusätzliche Stellen nur noch dort, wo 4 Stellen genau L zeigen würden (vorher „2,00030“).
- **Begriffe wie im Unterricht:** Grenzwert, waagrechte Asymptote, Annäherung von oben/unten, bestimmte Divergenz, Zählergrad/Nennergrad, Leitkoeffizient, Einschachteln ✓.
- **Neue/ergänzte Tests:** `tests/grenzverhalten.test.ts` um 3 Tests ergänzt (jetzt 24): Randbedingung |f(x_ε) − L| = ε für alle Reglerwerte und alle geschlossenen Formen; nachgerechnete Bild- und Aufgabenwerte (9,5714; 3,5119; 2,5025; −2; −5,5336; f(11) = 122,1; Schranke 100 bei 10,33; f(−2) = 0,2); Annäherung von oben/unten für alle 14 Fälle mit Grenzwert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 0 (Grad 1 < 2) ✓. A2 x > 7, x > 31, f(10) ≈ 2,333, f(100) ≈ 2,0303 ✓. A3 x_ε = ±3, f(x) < 3 ✓. A4 x_ε = −2 ✓. A5 Grenzwert 0, sicher ab 10, genau 8,42 ✓. A6 4,27; f(11) = 122,1; 10,33 ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 7 Beispiele und alle Links des Lernmaterials (simshot, 1440/1024/768/360, hell/dunkel, DE/EN). Aufgabe 1 (`info=0&_hide=1`): Asymptote, Schlauch, Grenzwert, Ergebnisse und der Fall der Gradregel („Welcher Fall?“) verdeckt; die Wertetabelle zeigt f(x) – gewollt, die Aufgabe sagt „Nutze die Wertetabelle“.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (3 von 6 Aufgaben, 5 von 7 Ausprobieren, keine Gradregel-Tabelle, Ideen ohne Einsatz/Modell, Stolperstein „Taschenrechner“ fehlte) ⇒ vollständig auf den Stand der DE-Fassung gebracht, mit Dezimalpunkt.
  - DE/EN: Probe-Schlauch in Ausprobieren 7 über seine Beschriftung „L = 3 ?“ statt über „rot“; Satz zu „=“/„≈“ im Abschnitt Modell; Stolperstein „Taschenrechner zeigt genau L“ verständlicher.
  - Im Bild: Kartentexte schrieben „x_ε“ als Klartext mit Unterstrich ⇒ umformuliert bzw. als Formelzeile gesetzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Handy: Bild oben, Zeitleiste, Karten darunter, alles vollständig ✓. Laptop/1920/Beamer: vier Karten ✓. **Behoben:** Am iPad hoch (768) und quer (1024) fehlte die vierte Karte (Gradregel bzw. Einschachteln). Im knappen Modus zeigt die Gradregel-Karte jetzt nur den zutreffenden Fall mit Ergebnis („Grad Z = Grad N: f(x) → 2/1 = 2“), die Einschachteln-/Exponential-Karte nur die Zeile zur gewählten Richtung, die Funktionskarte eine kurze Fassung der Annäherung – alle vier Karten passen.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf (Bogen, simshot). Beschriftungen weichen einander aus. Hinweis: Der Bogen fotografiert während der Einstiegsanimation, daher dort Zwischenwerte wie „x_ε = 6,87“ – nach 3,5 s stehen die Endwerte (eigene Fotos).
- **Touch (Ziehen) und Maus:** Schlauchrand (ε, rastet auf 0,05), Probe-Schlauch (c), Punkt P und Zeitleiste mit der Maus gezogen ✓; Touch über `addTarget` mit größeren Trefferradien, Finger auf der Fläche liest Werte ab. Zieh-Hinweis passt.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen) und eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach Start, „x nach außen laufen lassen“, 2× „ε verkleinern“, „Zurück zum Anfang“, Abspielen, allen 7 Beispielen, Funktions-/Richtungswechsel, ε-Regler, „Grenzwert aufdecken“, Schlauch aus und Ziehen von P: 19/19 still.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alle Größen über Regler/Auswahl/Knöpfe erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. Alt-Text (DE/EN) erweitert: gepunktete Mittellinie, „< ε“/„≥ ε“, Zeitleiste, Einschachteln, Probe-Schlauch mit ×-Marke, Schranken.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Karten-, Pillen-, Griff- und Zeitleistenflächen, Ränder, Schatten, Glanzlichter und das Abspielsymbol waren feste Hex-/rgba-Werte ⇒ jetzt aus `theme.bg`/`theme.text` gemischt. **Behoben (Rot/Grün):** Graphenstücke außerhalb des Schlauchs (rot) tragen eine gepunktete Mittellinie, die grünen Stücke jenseits von x_ε sind durchgezogen; die Abstandsbeschriftung an P und beim Ablesen endet mit „< ε“ bzw. „≥ ε“. Zeitleiste: Kurve unter/über der gestrichelten ε-Linie (Lage), x_ε gestrichelt markiert. Offen, aber unkritisch: In der Wertetabelle ist die Abstandsspalte nur farbig, der Vergleich mit ε ergibt sich aus den Zahlen.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/grenzverhalten/index.ts` | Theme-Farben statt fester Hex-/rgba-Werte (Karten, Pillen, Griffe, Zeitleiste, Schatten, Glanz) |
| `src/simulations/mathematik/grenzverhalten/index.ts` | „≈“ hinter gerundeten Zwischenwerten, symbolische Schritte hinter „⇔“, „x > x_ε ≈ …“ bei gerundetem x_ε, Endnullen, Zehnerpotenz für Werte nahe 0 |
| `src/simulations/mathematik/grenzverhalten/index.ts` | Rot/Grün: gepunktete Mittellinie außerhalb des Schlauchs, „< ε“/„≥ ε“ an P und beim Ablesen; Alt-Text erweitert |
| `src/simulations/mathematik/grenzverhalten/index.ts` | iPad hoch/quer: knappe Fassungen von Gradregel-, Einschachteln-/Exponential- und Funktionskarte, vierte Karte passt; Kartentexte ohne „x_ε“ im Klartext |
| `src/content/simulations/en/grenzverhalten.md` | auf den Stand der DE-Fassung gebracht |
| `src/content/simulations/de/grenzverhalten.md` | Probe-Schlauch über Beschriftung statt Farbe, Satz zu „=“/„≈“, Stolperstein verständlicher |
| `tests/grenzverhalten.test.ts` | 3 Tests ergänzt (24 insgesamt) |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `logarithmus`: eine gemeinsame Hilfe für „=“/„≈“ mit Endnullen (`fmt.approx`) würde die eigenen `eqS`/`NX` ersetzen.
- Lehrplandatei: ggf. `grenzverhalten` zusätzlich in Jgst. 11, Lernbereich 2 eintragen (siehe Rückfragen).
- Der Prüfbogen fotografiert Simulationen mit Einstiegsanimation mitten im Zählen (hier „x_ε = 6,87“ statt 7). Eine Wartezeit von etwa 3,5 s vor dem Foto würde Fehlalarme vermeiden.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Lehrplan:** `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` ordnet die Simulation Jahrgangsstufe 11, Lernbereich 1 („Grenzverhalten für x → ±∞ …“) zu; das passt zu `grades: [11, 11]` und zum Lernmaterial. Lernbereich 2 derselben Datei („Gebrochen-rationale Funktionen – Grenzwerte und Asymptoten“, waagrechte Asymptoten) nennt nur `polstellen-asymptoten`, obwohl diese Simulation die Gradregel und waagrechte Asymptoten gebrochen-rationaler Funktionen zeigt. Soll `grenzverhalten` dort zusätzlich eingetragen werden? (Lehrplandatei nicht geändert.)
- **ε-Schlauch:** Wie weit die ε-Vorstellung im LehrplanPLUS ausgeführt wird, bleibt im Lernmaterial als „bitte am Lehrplan prüfen“ markiert. Ebenso offen: ob sin(x)/x und x · 2⁻ˣ in Jgst. 11 als Beispiele passen oder eher Vertiefung sind.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3089/3089 grün (134 Dateien), Build ok.
