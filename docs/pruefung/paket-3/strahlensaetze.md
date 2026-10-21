# Prüfprotokoll: `strahlensaetze` – Strahlensätze

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `0e81b29` · Bogen: `/tmp/boegen3/strahlensaetze.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. V-Figur (Standard): |ZA| = 3 cm, |ZB| = 4 cm, 40°, k = 2 ⇒ |ZA′| = 6 cm, |ZB′| = 8 cm; |AB| = √(9 + 16 − 24 · cos 40°) = √(25 − 18,385) = √6,615 ≈ 2,572 cm, |A′B′| = 2 · 2,572 ≈ 5,14 cm. Abschnitte 3 : 3 = 4 : 4; „Achtung“-Zeile |AA′| : |ZA| = 3 : 3 = 1 ≠ 2. Anzeige „≈ 2,57 cm“, „≈ 5,14 cm“, „3 : 3 = 4 : 4“ ✓
  2. Rechenmodus (Beispiel „Abschnitte“): |ZA| = 2,5 cm, k = 2,4 ⇒ |ZA′| = 6 cm, |AA′| = 3,5 cm; x : 3 cm = 3,5 cm : 2,5 cm ⇒ x = 3,5 · 3 : 2,5 = 4,2 cm; Probe 4,2 : 3 = 1,4 = 3,5 : 2,5. Anzeige „x = 4,2 cm“, Probe „4,2 : 3 = 1,4 = 1,4 : 1“ ✓
  3. Baumhöhe: Sonnenhöhe 36,87°, tan 36,87° ≈ 0,75 ⇒ Stabschatten 1,5 : 0,75 = 2,00 m, Baumschatten 12 : 0,75 = 16,00 m; h = 1,5 m · 16 : 2 = 12 m. Anzeige „h = 12 m (wirklich: 12 m)“, Lupe 36,9° ✓
  4. Teich: w = 24 m, k = 4 ⇒ |A′B′| = 24 : 4 = 6 m, |AB| = 4 · 6 m = 24 m ✓. Nicht parallel (Faktoren 2 und 1,4): Richtung AB von A(2,298 | 1,928) nach B(4 | 0) ⇒ −48,57°, A′B′ von A′(4,596 | 3,857) nach B′(5,6 | 0) ⇒ −75,41°, Differenz 26,84° ≈ 26,8°; |A′B′| = √(1,004² + 3,857²) ≈ 3,99 cm. Anzeige „26,8°“, „≈ 3,99 cm“, „≈ 1,55 ≠ 2“ ✓
  5. X-Figur (Beispiel): |ZA| = 4, |ZB| = 5, k = −0,75 ⇒ |ZA′| = 3, |ZB′| = 3,75; Abschnitte über Z: |AA′| = 7, |BB′| = 8,75, 4 : 7 = 5 : 8,75 ✓
- **Sonderfälle:** k = 1 (Karte: „k = 1: A′ = A und B′ = B – keine Abschnitte“, Maßzahl nur einmal); k < 1 (Verkleinerung, Text „A′ liegt zwischen Z und A“); sehr spitzer (10°) und stumpfer Winkel (150°) an den Reglergrenzen; ungültiges |AB| im Rechenmodus (Dreiecksungleichung) wird in den gültigen Bereich gelegt und der Regler nachgeführt; Division durch 0 ausgeschlossen (|ZA|, |ZB| ≥ 1, k ≥ 0,2; Abschnitte-Verhältnis bei k = 1 als „nicht definiert“ abgefangen). Baumhöhe aus auf Zentimeter gemessenen Schatten weicht höchstens 0,2 m von der wahren Höhe ab (Sonnenhöhe 60°, kurzer Schatten) – bewusst „gemessen“, angezeigt mit „≈“.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm in den Figuren, m in den Anwendungen; „=“ nur bei exakten Werten, sonst „≈“; DE Dezimalkomma, EN Punkt; negativer Faktor in der X-Figur als „k = −0,75“ mit echtem Minus.
- **Begriffe wie im Unterricht:** 1. und 2. Strahlensatz, Abschnitte, zentrische Streckung, Streckfaktor, ähnliche Dreiecke, Umkehrung, V-/X-Figur, Fluchtstäbe – passend.
- **Neue/ergänzte Tests:** 4 neue Tests: Beispiel „Nicht parallel“ (26,8°, |A′B′| = 3,99 cm); Gegenbeispiel B″ hat denselben Abstand von A′ wie B′; Rechenmodus an allen Reglergrenzen (|ZA|, |ZB|, |AB|, k, V/X) – Lösung endlich und gleich der Länge in der Figur, |AB| im gültigen Bereich; Baumhöhe aus gemessenen Schatten über den ganzen Reglerbereich höchstens 0,2 m daneben.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 x = 4 · 6 : 3 = 8 cm ✓; A2 3,5 · 3 : 2,5 = 4,2 cm, 2,5 : 3,5 = 3 : 4,2 ≈ 0,714 ✓; A3 3 · 10 : 4 = 7,5 cm, falsch mit 6 : 4 = 1,5 ⇒ 4,5 cm ✓ (Figur 3-4-5-Dreieck, Winkel 36,87°); A4 7,5 · 5 : 12,5 = 3 cm ✓; A5 1,5 · 16 : 2 = 12 m ✓; A6 4 · 6 = 24 m ✓; A7 6 : 3 = 2 ≠ 5,6 : 4 = 1,4, nötig |ZB′| = 8 cm ✓. Keine Rechenfehler.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele sowie alle Links im Lernmaterial (8 Ausprobieren-Links, 6 Aufgaben-Links mit `show=0`, Lösungslinks) geladen – Zustände passen zum Text, mit `show=0` steht „x“ bzw. „h = ?“, „AB = ?“ im Bild und „Aufdecken“ bei den Ergebnissen.
- **Texte vereinfacht/korrigiert:** DE Ausprobieren 1 sprach von „weißen Teilstrichen im unteren Balken“ – im Dunkelmodus sind die Striche dunkel, und jede Zeile hat zwei Balken → „Teilstriche in den dicken Balken“. Aufgabe 5 hatte keine Frage → „Berechne die Höhe des Baums.“ Aufgabe 7: „Kreis … trifft den zweiten Strahl im Allgemeinen zweimal“ stimmt nicht immer (der zweite Punkt kann auf der Verlängerung über Z liegen) → „kann die Gerade ZB zweimal treffen“. Umkehrung des 1. Strahlensatzes: Bedingung „beide auf derselben Seite von Z“ war mehrdeutig → „entweder beide auf derselben Seite von Z wie A und B oder beide auf der anderen“ (DE und EN). EN war deutlich kürzer (4 statt 7 Aufgaben, 6 statt 8 Ausprobieren-Punkte, Formeln und Ideen gekürzt) → vollständig auf den Stand der DE-Fassung gebracht.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout passt (Handy: Bühne über den Karten; ab 640 px nebeneinander, iPad hoch mit zwei Kartenspalten). Kein Überlauf, keine Konsolenfehler (nur 403 bei Schriften über den Symlink).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen – behoben:**
  - Ohne Parallelen fehlte auf Laptop, iPad quer und Handy die Karte „Nicht parallel“ (Umkehrung, Gegenbeispiel B″), weil sie als dritte Karte keinen Platz mehr fand – Ausprobieren 5 und Aufgabe 7 verweisen aber darauf. Sie steht jetzt direkt nach dem Streckenvergleich; bei 1360 px sind Streckenvergleich, „Nicht parallel“ und 2. Strahlensatz zu sehen, auf dem Handy Streckenvergleich und „Nicht parallel“.
  - Auf dem Handy berührte die äußere Maßzahl am oberen Strahl („6 cm“) die Kopfzeile („V-Figur k = 2“, „AB nicht parallel …“). Der obere Rand für die Figur ist jetzt größer (Handy 76 px statt 52 px, sonst 84 px statt 62 px).
  - Verbleibend (vertretbar): Bei 10° am Handy liegen die Namen A/B und die Maßzahlen eng beieinander; bei „Nicht parallel“ am Handy steht B″ nahe an der Winkelangabe 40°. Bei 1360 px fehlt die vierte Karte „Ähnliche Dreiecke“ (Inhalt auch im Lernmaterial und im Ergebnis „Dreieck ZA′B′ ist ähnlich zu ZAB“).
- **Touch (Ziehen) und Maus:** Der Maßstab bleibt beim Ziehen fest (nur nach dem Loslassen neu eingepasst), es läuft nichts weg. Nachgeprüft bei 1360 px (65,3 px/cm): A′ von 6 cm auf die Stelle 4,53 cm gezogen ⇒ k = 1,5 (ZA′ = 4,5 cm); A auf 4,0 cm ⇒ a = 4; A′ nach außen auf 6,58 cm ⇒ k = 2,2. Trefferradius 22 px bei Touch (`fs(18, 22)`).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge Kopfzeile → Aktionen → Beispiele → Regler laut Bogen; alles auch über Regler erreichbar (Ziehen ist Zusatz).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; `strings.canvas` beschreibt Figur, Karten, Rechenmodus und beide Anwendungen (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Bedeutungsfarben aus `ctx.theme.series`. Karten-, Papier- und Pillenhintergrund, Rahmen, Namens-Umrandung und Teilstriche waren feste Hex-/rgba-Werte → jetzt aus `th().bg`, `th().text`, `th().grid`. Fest bleiben Materialfarben der Szenen (Himmel, Wiese, Baum, Wasser, Sonne, rot-weißer Stab, Fluchtstäbe) – ohne Bedeutung, Punkte sind beschriftet. „Parallel/nicht parallel“ (grün/orange) ist immer zusätzlich durch ✓/✗, „≠“, „verschieden“ und gestrichelte Hilfslinien unterscheidbar.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/strahlensaetze/index.ts` | Karte „Nicht parallel“ vor dem 1. Strahlensatz, damit sie bei wenig Platz nicht wegfällt |
| `src/simulations/mathematik/strahlensaetze/index.ts` | größerer oberer Rand der Figur (Maßzahlen nicht mehr an der Kopfzeile) |
| `src/simulations/mathematik/strahlensaetze/index.ts` | neutrale Hintergrund-/Rahmenfarben aus dem Theme statt fester Werte |
| `tests/strahlensaetze.test.ts` | 4 neue Tests (Beispiel „Nicht parallel“, B″, Reglergrenzen Rechenmodus, Baumhöhe gemessen) |
| `src/content/simulations/de/strahlensaetze.md` | Teilstriche, Frage in Aufgabe 5, Kreis-Aussage in Aufgabe 7, Bedingung der Umkehrung präzisiert |
| `src/content/simulations/en/strahlensaetze.md` | auf den Stand der DE-Fassung gebracht (Erklärung, 8 Ausprobieren-Punkte, 7 Aufgaben, Ideen für den Unterricht) |

## 6. Für den Kern (nicht selbst ändern)
- `withAlpha` (`src/sim-core/draw.ts`) gibt Farben, die nicht als `#rrggbb` vorliegen, ohne Transparenz zurück. Hier unkritisch (Theme-Farben sind Hex), für die Pillen wurde trotzdem `mixColor(bg, bg, 0, alpha)` verwendet.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Lehrplanbezug (Jgst. 9) und die Darstellung der X-Figur mit negativem Streckfaktor stehen im Text bereits mit „bitte am Lehrplan prüfen“ – unverändert gelassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2871/2871 grün (125 Dateien), Build ok.
