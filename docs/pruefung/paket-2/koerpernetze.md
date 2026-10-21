# Prüfprotokoll: `koerpernetze` – Netze und Oberflächen von Körpern

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `cac848a` (Basis) · Bogen: `scratchpad/pruefung/koerpernetze/koerpernetze.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Würfel a = 3 cm: O = 6 · 3² = 6 · 9 = 54 cm². Anzeige: „O = 6 · a² = 6 · (3 cm)² = 54 cm²“ ✓. Würfel a = 5 cm: 6 · 25 = 150 cm² ✓ (Aufgabe 6).
  2. Quader 4 × 3 × 2 cm: O = 2 · (12 + 8 + 6) = 2 · 26 = 52 cm². Anzeige identisch ✓.
  3. Pyramide a = 6, hₐ = 5: O = 36 + 4 · ½ · 6 · 5 = 36 + 4 · 15 = 96 cm². Anzeige „36 cm² + 4 · 15 cm² = 96 cm²“ ✓. Körperhöhe h = √(25 − 9) = 4 (Test vorhanden).
  4. Zylinder r = 2, h = 5: O = 2π · 4 + 2π · 2 · 5 = 8π + 20π = 28π ≈ 87,96 cm². Anzeige „25,13 cm² + 62,83 cm² ≈ 87,96 cm²“ ✓.
  5. Prisma (gleichseitiges Dreieck a = 3, h = 4): G = √3/4 · 9 ≈ 3,897; O = 2G + M = 7,79 + 3 · 3 · 4 = 43,79 cm² ✓ (Anzeige „2 · G + 3 · a · h“, also M = 3ah).
  6. Pyramide aus geteiltem Link a = 6, hₐ = 3 (< a/2 + 0,5): gerechnet mit hₐ = 3,5 → 36 + 4 · 10,5 = 78 cm², Hinweis wird angezeigt ✓.
- **Würfelnetze:** 15 Netze, davon 11 gültig (1, 2, 4, 5, 6, 8 = Typ 1-4-1 (6 Stück); 9, 11, 12 = 2-3-1 (3); 14 = 2-2-2; 15 = 3-3), 4 ungültig (3, 7, 10, 13). Die Prüfung faltet das Netz wirklich und vergleicht die Flächenmittelpunkte: alle 11 gültigen erkannt, alle 4 ungültigen mit genau einer doppelten und einer offenen Fläche. Die 11 gültigen sind paarweise verschieden (Test mit Normalform über Drehungen/Spiegelungen). Würfelaugen: Gegenseiten ergeben 7 (Test).
- **Kanten passen beim Falten:** Würfel: alle Ecken jedes gültigen Netzes landen auf den 8 Würfelecken, je 3 Flächen pro Ecke (neuer Test). Prisma: Dreiecksecken liegen auf Rechteckecken (neuer Test). Pyramide: alle Dreiecke treffen sich in der Spitze (bestehender Test). Zylinder: Mantel liegt auf dem Zylinder, Umfang des 61-Ecks = 2πr (bestehender Test).
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): alle Regler haben Mindestwerte > 0 (a, b, c, h, hₐ ≥ 1; r ≥ 0,5). hₐ < a/2 + 0,5 wird bei Eingabe angehoben, bei geteilten Links mit Hinweis ersetzt; `pyramidBaseAngle` schützt gegen 0. Netz-Nr. wird auf 1…15 begrenzt.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm/cm² überall, Dezimalkomma über `fmt.num` (DE „87,96“, EN „87.96“). Gerundete Werte mit „≈“ (Prisma, Zylinder, Dreiecke beim Prisma).
- **Begriffe wie im Unterricht:** Netz, Oberflächeninhalt O, Grund-/Deckfläche, Mantel, Seitenhöhe hₐ, Körperhöhe h. ✓
- **Neue/ergänzte Tests:** Block „Prüfrunde: Werte von Hand nachgerechnet“ in `tests/koerpernetze.test.ts` (Oberflächen 54/52/96/28π/43,79; Würfelecken aller gültigen Netze; Prisma-Dreiecke an den Rechteckkanten).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 (3, 7, 10, 13 falsch) ✓; A2 Spielwürfel Netz 9: Sechs = liegen bleibende Fläche am linken Ende der Dreierreihe, Eins am rechten Ende ✓, 2/5 oben/unten, 3/4 ✓ (mit Würfelaugen-Bild abgeglichen); A3 52 cm² ✓; A4 9 + 24 = 33 cm² ✓; A5 u = 3π ≈ 9,42 cm, M = 12π ≈ 37,70 cm², 2G = 4,5π ≈ 14,14 cm², O = 16,5π ≈ 51,84 cm² ✓; A6 150 : 6 = 25 → a = 5 cm ✓. „Weniger als ein Promille“ (61-Eck mit gleichem Umfang): Flächenverhältnis π/(61 · tan(π/61)) ≈ 0,99912 ✓.
- **„Beispiel laden“ geklickt:** alle Links in DE geladen (Netz 3, Netz 9 mit/ohne Augen, Zylinder 55 %, Pyramide, Quader, a = 5), dazu Zylinder r = 2/h = 5, Netz 10 gefaltet, EN-Seite Zylinder. Falsche Netze zeigen „doppelt“ und „offen“ als Text, nicht nur farbig.
- **Texte vereinfacht/korrigiert:**
  - EN-Lernmaterial war deutlich kürzer als DE (Prisma-Zeile der Tabelle, Ausprobieren 3–6, Aufgaben Spielwürfel, Pyramide, Rückwärts gedacht, Lösungsbegründungen zu A1, Lehrplanbezug fehlten) → auf DE-Stand gebracht.
  - DE „Die rote Kante“ → „Die farbig hervorgehobene Kante u = 2πr“ (Farbe ist `--series-2`, im Dunkelmodus rosa).
  - Hinweis `haFix` sagte „hₐ muss größer als a/2 sein“, korrigiert wurde aber schon ab hₐ < a/2 + 0,5 cm → Text DE/EN an das tatsächliche Verhalten angepasst; im Lehrkräfte-Abschnitt ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden, Karten auf dem Tablet da, Infokasten oben links lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Kleinigkeiten: Beim gefalteten Körper kann die Flächenbeschriftung auf stark verkürzten Seitenflächen über die Kante ragen; bei der Pyramide liegt „15 cm²“ auf der gestrichelten Höhe. Nicht störend, nicht geändert.
- **Touch (Ziehen) und Maus:** Ziehen dreht die Ansicht (Maus geprüft), Tippen wählt eine Fläche, Gegenfläche wird gestrichelt markiert, Anzeige „Quadrat: 3 cm × 3 cm = 9 cm² · gegenüber: gleich groß“ ✓. Falt-Animation weich (Tween, inOutCubic, 2,2 s).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (kein automatisches Drehen; `Tween.play` springt bei reduzierter Bewegung sofort ans Ziel)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Tab-Reihenfolge laut JSON regulär; Bedienelemente aus dem Kern.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text der Zeichenfläche: „Körpernetz, das sich in 3D zu einem Körper faltet; die Ansicht lässt sich drehen“ – allgemein, die Ergebnisse (Würfelnetz ja/nein, Flächen, Oberfläche) stehen als Text in den Ergebniskarten.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Flächen aus `theme.series`, Mischungen mit Weiß/Schwarz über `mixColor`. Fehler im Netz zusätzlich mit Text „doppelt“/„offen“ und Strichelung. ✓

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/koerpernetze/index.ts` | Hinweis `haFix` (DE/EN) an tatsächliche Grenze hₐ ≥ a/2 + 0,5 cm angepasst |
| `src/content/simulations/de/koerpernetze.md` | „rote Kante“ → „farbig hervorgehobene Kante“; Hinweis zur hₐ-Grenze der Simulation |
| `src/content/simulations/en/koerpernetze.md` | auf DE-Stand gebracht (Tabelle, Ausprobieren, alle 6 Aufgaben, Unterrichtsideen) |
| `tests/koerpernetze.test.ts` | Werte von Hand, Würfelecken aller gültigen Netze, Prisma-Kanten |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Simulation verwendet für die Höhe der Seitendreiecke `hₐ` (Schulbücher teils `h_s`). Bleibt so, da konsistent in Simulation und Lernmaterial.
- Der Regler „Kante a“ heißt beim Quader auch „Kante a“, obwohl er dort die Länge ist (b = Breite, c = Höhe). Unkritisch, ggf. später eigene Beschriftung.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2901/2901 grün (125 Dateien), Build ok.
