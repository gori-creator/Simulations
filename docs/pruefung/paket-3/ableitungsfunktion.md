# Prüfprotokoll: `ableitungsfunktion` – Ableitungsfunktion grafisch

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `fd3e3a6` (Ausgangsstand) · Bogen: `/tmp/boegen3/ableitungsfunktion.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startzustand „Tangente läuft“, f(x) = 0,25x³ − 1,5x, x = −2,5: f(−2,5) = 0,25 · (−15,625) + 3,75 = −0,15625 (Anzeige „≈ −0,16“) ✓; f′(−2,5) = 0,75 · 6,25 − 1,5 = 3,1875 (Karte „≈ 3,19“, Ergebnisliste „≈ 3,188“) ✓; nach Ziehen von P auf x = 0,2: f′(0,2) = 0,03 − 1,5 = −1,47 (Anzeige „= −1,47“) ✓.
  2. Produktregel (Beispiel und Aufgabe 5), x = 2, Δx = 0,5: u = 2, v = 2, u′ = 0,5, v′ = 1 ⇒ f′(2) = 0,5 · 2 + 2 · 1 = 3 ✓. Streifen: v · Δu = 2 · 0,25 = 0,5; u · Δv = 2 · (2,5625 − 2) = 1,125; Δu · Δv = 0,25 · 0,5625 = 0,140625 („0,141“); Summe 2,25 · 2,5625 − 4 = 1,765625 („1,766“) ⇒ Δf/Δx = 3,53125 („≈ 3,531“) ✓.
  3. Badewanne (Beispiel), t = 5, h = 2: V(7) = 75 · (1 − cos 0,7π) = 75 · 1,587785 = 119,084; (119,084 − 75)/2 = 22,042 („≈ 22,0419“) ✓; V′(5) = 7,5π ≈ 23,562 L/min ✓; Tabelle h = 1: 75 · (−cos 0,6π) = 75 · 0,309017 = 23,176 („23,1763“) ✓.
  4. Wanderung, x = 0: h′(0) = −200 · (−5) · e^(−6,25) = 1000 · 0,0019305 ≈ 1,93 m/km ≈ 0,19 % (Anzeige „≈ 1,93 m/km (≈ 0,2 %)“) ✓.
  5. Faktor- und Kettenregel (Beispiele): 2 · cos 0,5 = 2 · 0,87758 = 1,755 ✓; 2 · cos 1 = 2 · 0,54030 = 1,081 ✓; mit a = −2 bei x = 2: −2 · cos 2 = −2 · (−0,416) = 0,832 ✓.
  6. Alltagstexte: Auto v(10) = −15 + 30 = 15 m/s = 54 km/h, v(20) = 0 ✓; Sprint a(0) = 9,2 m/s², s = 100 m nach ≈ 9,945 s („etwa 9,9 s“) ✓; Epidemie N(0) = 10 000/200 = 50, Wendepunkt t = ln 199 / 0,4 ≈ 13,2 ✓; Kosten WP(5 | 45), K′(5) = 2,5 ✓; Fahrstuhl WP(8 | 10), v(8) = 5π/8 ≈ 1,96 ✓. Alle f″ der Alltagsbeispiele von Hand abgeleitet (u. a. Wanderung (100(x − 5)² − 200) · e^(…), Epidemie 0,4 · N′ · (1 − 2N/10 000)) ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): Knick |x| (links −1, rechts 1, „nicht differenzierbar“, keine Tangente) ✓; Polstelle 1/x (P springt über 0, Graph unterbrochen, Vorzeichentabelle getrennt) ✓; ln und √x nur für x > 0 ✓; h ≥ 0,001 (keine Division durch 0) ✓; Faktor a < 0 (Spiegelung) ✓; Potenzregel mit negativem x und n < 0 (nur x > 0) ✓; x³ ohne Vorzeichenwechsel ⇒ Terrassenpunkt ✓. **Behoben:** doppelte Minuszeichen beim Einsetzen („−2 · −0,42“, „1 + −0,42“) ⇒ Klammern; Potenzregel bei negativem x stand „3 · −1,5²“ (liest sich als −2,25) ⇒ „3 · (−1,5)²“.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und „−“ über `fmt`, Einheiten bei allen Alltagsbeispielen ✓. **Behoben:**
  - „≈“ stand fest, auch bei exakten Werten („m ≈ 3“, „Δy ≈ −1,5“ bei |x|, „m_s ≈ −1“), umgekehrt „=“ bei gerundeten Werten (Grenzwertkarte, Steigungsdreiecke der Regeln, Summenregel, Ergebnisliste) ⇒ „=“ nur bei exakten, „≈“ bei gerundeten Werten.
  - Gerundete Werte ohne Endnullen täuschten Exaktheit vor (Tabelle „1“ für 0,99998 bei sin x, x = 0, h = 0,01) ⇒ „1,0000“; eingesetzte Werte im Differenzenquotienten ab 100 wurden auf eine Stelle gerundet („119,1 − 75“ bei 22,0419) ⇒ „119,08 − 75“.
  - Doppelte Namen bei Alltagsbeispielen: „h′(0) = h′(0) = m“, „K′ = K′: Grenzkosten“ ⇒ nur noch bei echten Namenswechseln („v(4) = s′(4)“).
- **Begriffe wie im Unterricht:** Tangente, Sekante, Differenzenquotient (rechts-, links-, beidseitig), Steigungsdreieck, Ableitungsfunktion, HP/TP/WP, Terrassenpunkt (Sattelpunkt), VZW, links-/rechtsgekrümmt, Grenzkosten, Kostenkehre ✓.
- **Neue/ergänzte Tests:** `tests/ableitungsfunktion.test.ts` um 6 Tests ergänzt (Produktregel-Streifen bei x = 2, Δx = 0,5; Faktor-/Kettenregel der Beispiele; Wanderung h′(0); Badewanne m_s und V′(5); Vorzeichentabelle von x³ − 3x; Polstelle 1/x in der Vorzeichentabelle). Bestehende 29 Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 f′(2) = 12 − 3 = 9, HP(−1 | 2), TP(1 | −2), WP(0 | 0) ✓. A2 2,1; 1,9; 2 (Abweichung genau h) ✓. A3 f′(x) = 0,75x² − 1,5, Nullstellen ±√2 ≈ ±1,41, f′(0,5) = −1,3125 ✓. A4 v(4) = 9,6 m/s ≈ 34,6 km/h, a = 0 bei t = 10, v(10) = 15 m/s, a(0) = 3 m/s² ✓. A5 f′(0) = 2 · 1 + 0 = 2; (u · v)′(2) = 3 ✓. A6 falsch (Wendestelle), Epidemie nach ≈ 13,2 Tagen ✓. Keine Rechenfehler im Bestand.
- **„Beispiel laden“ geklickt:** alle 25 Beispiele und alle 35 Links des Lernmaterials (simshot, 1440 hell/dunkel, dazu 1920, 1024 und 360). Die Links zeigen den beschriebenen Zustand. **Behoben (Lösung schon sichtbar):**
  - Aufgabe 1 (`show=0`): Die Vorzeichentabelle nannte die Intervallgrenzen ]−2,5; −1[, ]−1; 0[ … und damit die Extrem- und Wendestellen ⇒ innere Grenzen „?“.
  - Aufgabe 2 (`show=0`): Die gestrichelte Grenzwertlinie und der offene Punkt bei h = 0 im Diagramm des Differenzenquotienten zeigten f′(1) = 2 auf der m-Achse ⇒ ohne Werte ausgeblendet (die Kurven bleiben als Werkzeug).
  - Aufgabe 3 (`mode=draw`, ohne `show=0`): Die Ergebnisliste unter der Bühne zeigte „f′(x) = 0,75x² − 1,5“ ⇒ erst nach „Lösung aufdecken“.
  - Aufgabe 4 (`show=0`): Der Hinweis der Karte „Auto“ nannte „Nach 10 s am schnellsten (15 m/s = 54 km/h)“ ⇒ Hinweise der Alltagskarten nur mit Werten.
  - Aufgabe 5 (`show=0`): Karte und Bild zeigten u = 2, u′ = 0,5, v = 2, v′ = 1, „0,5 · 2 + 2 · 1“, „f′(2) = 3“, „Δf/Δx ≈ 3,531“ und die Streifenwerte ⇒ alles „?“. Ebenso werden in allen Regel-Ansichten Δy, Δg, Δh und die Werte im unteren Bild ohne Werte verdeckt.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (Einleitung in zwei Sätzen, 3 statt 8 Ausprobieren-Punkte, 3 statt 6 Aufgaben, Lösungen ohne Rechnung, Ideen 2 Punkte) ⇒ vollständig auf den Stand der DE-Fassung gebracht (Dezimalpunkt, Punkte als (x, y)).
  - DE/EN: Ausprobieren 1 und 7 verwiesen auf Farben („lila Balken“, „rotes Eckstück“) ⇒ „senkrechter Balken, genau f′(x) hoch“ bzw. „kleines Eckstück Δu · Δv“.
  - Lehrplanbezug mit `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` abgeglichen: Jgst. 11, Lernbereich 4.1 (Ableitungsfunktion) ✓ und Jgst. 12, Lernbereich 1.3 (Sinus/Kosinus grafisch) ✓; Text nennt jetzt diese Lernbereiche, dazu 4.2 (Monotonie, Extrem-/Wendestellen) und Jgst. 12, Lernbereich 1 (Produkt- und Kettenregel). Zur Einführung von Faktor-, Summen- und Potenzregel steht weiter „bitte am Lehrplan prüfen“.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Handy und iPad hoch: Bild oben, Karten darunter ✓. Laptop, 1920, Beamer: alle Karten in der Seitenleiste ✓. Dunkelmodus lesbar ✓.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf, keine Konsolenfehler (Bogen). **Behoben:**
  - Laptop, „Sekante → Tangente“: Die dritte Karte „Grenzwert h → 0“ (bei |x| mit „nicht differenzierbar“) fehlte ⇒ passen nicht alle Karten untereinander, entfallen die erklärenden Hinweiszeilen; jetzt alle drei Karten sichtbar.
  - Startzustand: „Δy ≈ 3,19“ lag auf der Beschriftung „HP“ ⇒ die Δy-Pille weicht Merkmal-Beschriftungen aus.
  - Diagramm des Differenzenquotienten: Die Grenzwert-Pille verdeckte die Achsenbeschriftung „m in L/min“ ⇒ Breite begrenzt.
  - Offen (unkritisch): iPad quer zeigt in „Tangente läuft“ nur 2 von 3 Karten (die fehlende Karte „Funktion und Ableitungen“ steht als Legende in den Bildern), in „Sekante → Tangente“ fehlt die Grenzwertkarte (Grenzwerte stehen in der Tabelle und im Diagramm). Handy, „Sekante → Tangente“: die Tabelle h → 0 passt nicht unter die Bühne (Werte in der Ergebnisliste). Wanderung bei x = 0: P liegt auf der Achsenzahl „800“. Beim Startzustand berührt die senkrechte Kathete die Pille „HP“.
- **Touch (Ziehen) und Maus:** P mit der Maus gezogen (x = −2,5 → 0,2: f′(0,2) = −1,47 ✓), Punkt 1 der Skizze im Aufgabenmodus gezogen (Rückmeldung „Vorzeichen stimmt an 1 von 7 Stellen“) ✓; Touch über `addHandle` des Kerns. Der Zieh-Hinweis „Die markierten Punkte lassen sich … ziehen“ steht auch in „Merkmale“, wo es nichts zu ziehen gibt (siehe „Für den Kern“).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen) und eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach „P durchlaufen lassen“ (Tangente, Produkt- und Kettenregel), „Spur löschen“, „h gegen 0 gehen lassen“, „h wieder auf 1“, „Merkmale Schritt für Schritt“, „Lösung aufdecken“, „Skizze zurücksetzen“, allen 25 Beispielen und dem Wechsel aller 5 Ansichten: 39/39 still. Gegenprobe ohne reduzierte Bewegung: Bewegung wird erkannt.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Regler, Auswahl und Knöpfe erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) beschreibt alle fünf Ansichten ✓.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Pillen (rgba), Karten (#ffffff/#151c27, Rand #e1e6ee/#273142) und Bandschrift (#1b2533/#f4f7fb) hatten feste Farben ⇒ aus `theme.bg`/`theme.text` gemischt. Schatten sind weiter neutral schwarz mit Deckkraft. Rot/Grün: HP/TP tragen Beschriftungen, Bänder „↗ steigt/↘ fällt“, Vorzeichentabelle „+/−“, Skizze ✓/✗, Flächen ober-/unterhalb der Achse; Sekante durchgezogen, Tangente gestrichelt; f, f′, f″ in eigenen Bildern mit Legende ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/ableitungsfunktion/index.ts` | „=“/„≈“ nach Exaktheit, Endnullen bei gerundeten Werten, Klammern um negative eingesetzte Zahlen, (−1,5)² bei der Potenzregel |
| `src/simulations/mathematik/ableitungsfunktion/index.ts` | Aufgaben-Links: Intervallgrenzen der Vorzeichentabelle, Grenzwertlinie, f′ in der Ergebnisliste (Aufgabenmodus), Hinweis der Alltagskarte, Werte der Regel-Ansichten ohne „Terme und Werte“ verdeckt |
| `src/simulations/mathematik/ableitungsfunktion/index.ts` | keine doppelten Namen („h′(0) = h′(0)“, „K′ = K′“) |
| `src/simulations/mathematik/ableitungsfunktion/index.ts` | Kartenspalte kompakt, wenn nicht alles passt; Δy-Pille weicht HP/TP/WP aus; Grenzwert-Pille nicht über der Achsenbeschriftung |
| `src/simulations/mathematik/ableitungsfunktion/index.ts` | Pillen, Karten, Bandschrift aus dem Theme statt fester Farben |
| `src/content/simulations/de/ableitungsfunktion.md` | Ausprobieren ohne Farbverweise, Lehrplanbezug nach Lehrplandatei |
| `src/content/simulations/en/ableitungsfunktion.md` | auf den Stand der DE-Fassung gebracht |
| `tests/ableitungsfunktion.test.ts` | 6 Tests ergänzt |

## 6. Für den Kern (nicht selbst ändern)
- `dragHint` ist nur `true/false`; hier wäre eine Funktion der Werte nützlich (`dragHint: (v) => v.mode !== 'feat'`), damit der Zieh-Hinweis in Ansichten ohne Griffe entfällt.
- Wie bei `sekante-tangente`/`newton-verfahren`: eine gemeinsame Hilfe für „=“/„≈“ mit Endnullen (`fmt.approx`) würde die eigenen `eq`/`A`/`RD` ersetzen.
- `layout.aspectNarrow` je Ansicht (oder eine höhere Bühne, wenn Karten nicht passen) würde am Handy und iPad quer die fehlenden Karten zurückbringen.
- `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts`: Die Ansicht „Merkmale f, f′, f″“ passt auch zu Jgst. 11, Lernbereich 4.2 (dort bisher nur `kurvendiskussion`, `newton-verfahren`); bitte über eine Aufnahme entscheiden.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Faktor-, Summen- und Potenzregel:** In welcher Jahrgangsstufe sie im LehrplanPLUS eingeführt werden, lässt sich aus den Kurzbeschreibungen der Lehrplandatei nicht ablesen; im Lernmaterial steht dazu weiter „bitte am Lehrplan prüfen“.
- **Aufgabe 2 mit `show=0`:** Die Kurven des Differenzenquotienten bleiben sichtbar und laufen bei h = 0 auf 2 zu. Ich habe nur die Grenzwertlinie ausgeblendet, weil das Diagramm das Werkzeug der Ansicht ist. Falls die Aufgabe ganz ohne grafische Hilfe gedacht ist, bitte Bescheid geben.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3111/3111 grün (135 Dateien), Build ok.
