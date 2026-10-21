# Prüfprotokoll: `galtonbrett` – Galtonbrett

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `2ae6700` · Bogen: `/tmp/boegen3/galtonbrett.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. n = 4, p = 0,5 (Aufgabe 1): P(X = 2) = C(4; 2) · 0,5² · 0,5² = 6 · 1/16 = 0,375 = 37,5 % ✓. Theorie-Anzeige: μ = 4 · 0,5 = 2, σ = √(4 · 0,5 · 0,5) = √1 = 1 ⇒ jetzt „σ = … = 1“ (vorher „≈ 1“). Pascal-Zahlen an den Nägeln 1 | 1 1 | 1 2 1 | 1 3 3 1 ✓.
  2. n = 8, p = 0,7 (Beispiel „Schief“): μ = 8 · 0,7 = 5,6, σ = √(8 · 0,7 · 0,3) = √1,68 = 1,2961 ⇒ jetzt „≈ 1,30“ (vorher „≈ 1,3“ ohne Endnull). P(X = 6) = 28 · 0,7⁶ · 0,3² = 28 · 0,117649 · 0,09 = 0,2965 ⇒ Erwartungsstrich bei 1000 Kugeln auf 296,5; gezählt im Bild 290 bzw. 300 ✓. Fach 0: 0,3⁸ · 1000 = 0,07 ⇒ Strich am Boden ✓.
  3. n = 16, p = 0,5 (Beispiel „16 Reihen“): μ = 8, σ = √(16 · 0,25) = 2 ⇒ jetzt „= 2“ (vorher „≈ 2“). Unterste Nagelreihe (Reihe 15) Mitte C(15; 7) = 15!/(7! · 8!) = 6435 wie im Bild; Wege ins Fach 8: 6435 + 6435 = 12 870 = C(16; 8), P = 12 870/65 536 ≈ 19,6 %.
  4. n = 6 (Aufgabe 2): unterste Reihe 1, 5, 10, 10, 5, 1 ✓, C(6; 3) = 20 = 10 + 10; erwartete Anzahl Fach 3 bei 1000 Kugeln 1000 · 20/64 = 312,5, gezählt 323 ✓.
  - Binomialkoeffizient: schrittweise C(n−k+i; i), jeder Zwischenwert ganzzahlig, daher bis n = 16 exakt (Test: Pascal-Regel, Symmetrie, Zeilensumme 2ⁿ). Fach = Anzahl der R im Weg ✓ (Anzeige „Letzte Kugel“ mehrfach nachgezählt, z. B. R R L R R L L R → 5).
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): Leere Fächer: Versuchswerte „–“, keine Division durch 0. Eine Kugel: x̄ = Fach, s = 0. n = 1 (Reglergrenze): zwei Fächer, Glockenkurve wird bei n < 2 nicht gezeichnet – **behoben:** die Legende zeigte „N(μ; σ²)“ trotzdem. p = 0,05/0,95 (Grenzen): Verteilung am Rand, alle Werte endlich; p = 0 oder 1 nicht einstellbar. n · p hat bei allen Reglerwerten höchstens zwei Nachkommastellen (Test), daher „μ = …“ immer exakt.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt` ✓. **Behoben:** x̄, s und σ standen immer mit „≈“ und ohne Endnull („x̄ ≈ 5, s ≈ 0“ bei einer Kugel, „σ ≈ 1,3“). Jetzt „=“ bei exakten Werten (x̄ = 3,6, σ = 2), sonst „≈“ mit zwei Stellen („s ≈ 1,00“, „σ ≈ 1,30“).
- **Begriffe wie im Unterricht:** Bernoulli-Versuch, Bernoulli-Kette, Binomialverteilung B(n; p), Binomialkoeffizient, Pascal’sches Dreieck, Erwartungswert μ, Standardabweichung σ, Laplace-Bedingung σ > 3 – passend. Die empirische Standardabweichung s wird mit 1/N berechnet (wie bei Häufigkeitsverteilungen in Bayern üblich).
- **Zufall reproduzierbar?** Die Simulation nutzt bewusst `Math.random` (siehe Rückfragen). Die Rechenlogik ist trotzdem prüfbar: neue Funktion `dropBalls(n, p, Anzahl, random)` in `model.ts` (für „1000 sofort“) – mit `seededRandom` reproduzierbar getestet.
- **Neue/ergänzte Tests:** neue Datei `tests/galtonbrett.test.ts` mit 15 Tests: Binomialkoeffizienten (Lehrbuchwerte, Pascal-Regel/Symmetrie/2ⁿ bis n = 16, k außerhalb), Fach-Wahrscheinlichkeiten (Aufgabe 1, n = 8/p = 0,7, Summe 1 und Erwartungswert über das ganze Reglerraster, Spiegelbild aus Aufgabe 4, μ/σ aus Aufgabe 3), Kugelwege (Fach = Anzahl R, Reproduzierbarkeit mit Startwert, 40 000 Kugeln nähern B(10; 0,7) an), leere Fächer, eine Kugel, „=“/„≈“. Bestehender Test in `tests/new-models.test.ts` unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 6/16 = 37,5 % ✓; A2 C(6; 3) = 20 = 10 + 10 ✓; A3 μ = 7, σ = √2,1 = 1,449 ≈ 1,45 ✓ (Simulation mit 1000 Kugeln: x̄ ≈ 6,99); A4 C(n; k) = C(n; n − k), P₀,₃(X = k) = P₀,₇(X = n − k) ✓. Keine Rechenfehler.
- **„Beispiel laden“ geklickt:** alle 4 Beispiele und alle Links (Ausprobieren 2–4, Lösungen 1–3) mit simshot bei 360, 1024 und 1440 px, hell/dunkel, jeweils mit 10 bzw. 1000 Kugeln; Zustände passen zum Text. Die Aufgaben selbst enthalten keine Links; die Links stehen in den Lösungen. Die Theorie-Anzeige (μ, σ) ist als Spoiler verdeckt.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (Aufgaben 2 von 4, Erklärungen und Unterrichtsideen gekürzt) → auf den Stand der DE-Fassung gebracht, Dezimalpunkt.
  - „Die roten Markierungen“ → „Die waagerechten Striche (in der Legende „B(n; p)“)“ – nicht nur über die Farbe beschrieben.
  - Ausprobieren 4: Hinweis, dass bei n = 16, p = 0,5 σ = 2 ist und die Laplace-Bedingung noch nicht erfüllt ist, die Kurve aber gut passt (vorher Widerspruch zur Faustregel oben).
  - Neue Unterrichtsidee „Gruppen vergleichen“ (DE/EN).
  - Alt-Text der Zeichenfläche nennt jetzt auch nummerierte Fächer, Wege an den Nägeln, Erwartungsstriche und Glockenkurve.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Brett, Fächer und Legende in allen Größen vollständig; keine Karten, die wegfallen. Dunkelmodus: Holz abgedunkelt, Beschriftungen hell. Am Handy (360 px) mit n = 16 stehen die Fachnummern 10–16 eng, sind aber lesbar; Pascal-Zahlen und Zähler werden dort bewusst ausgeblendet (zu wenig Platz).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** Die Anzahl über einem Fach lag im Kugelstapel (bei 4 Kugeln und 3 Kugeln je Reihe im Stapel) bzw. auf dem Erwartungsstrich (z. B. „323“ bei n = 6) → steht jetzt über Stapel bzw. Säule und Strich.
- **Touch (Ziehen) und Maus:** Die Simulation bietet kein Ziehen an (nur Schaltflächen und Regler), kein `dragHint`.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen). **Behoben:** Der Bogen prüft nur den leeren Startzustand; mit eigener Messung (reduzierte Bewegung, zwei Bilder im Abstand von 250 ms) bewegte sich das Bild nach „1 Kugel“, „10 Kugeln“, „100 Kugeln“ und „1000 sofort“ (Kugelflug, Aufleuchten des Fachs). Jetzt landen die Kugeln sofort im Fach, das Aufleuchten entfällt, die Säulen wachsen ohne Übergang – alle vier Messungen stehen still. Nach „Abspielen“ (von Hand gestartet) kommen weiter Kugeln hinzu, aber sprunghaft ohne Flug.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Schaltflächen/Regler erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) erweitert, Ergebnisse als Text (Weg der letzten Kugel, x̄, s, μ, σ).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Pillen der Pascal-Zahlen, Fachnummern und Legende sowie deren Schrift und das Aufleuchten waren feste Hex-/rgba-Werte → `theme.bg`/`theme.text`. Fest bleiben bewusst die „Materialfarben“ (Holz-Ersatzgrafik, Messingnägel, Trennwände, Trichter, Schatten, Ersatz-Kugeln), die ein echtes Holzbrett nachbilden und für das Foto `holzbrett.webp` nur als Ersatz dienen. Erwartungswerte (waagerechte Striche) und Glockenkurve (Kurve) unterscheiden sich durch die Form, Legende beschriftet.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/galtonbrett/index.ts` | Reduzierte Bewegung: Kugeln landen sofort, kein Aufleuchten, „100 Kugeln“ ohne Warteschlange |
| `src/simulations/mathematik/galtonbrett/index.ts` | „=“ bei exakten, „≈“ mit Endnull bei gerundeten Werten (x̄, s, σ) |
| `src/simulations/mathematik/galtonbrett/index.ts` | Theme-Farben für Pillen, Beschriftungen, Rückwand und Aufleuchten |
| `src/simulations/mathematik/galtonbrett/index.ts` | Anzahl über dem Fach überdeckt Kugelstapel und Erwartungsstrich nicht mehr; Legende „N(μ; σ²)“ nur bei n ≥ 2; Alt-Text erweitert |
| `src/simulations/mathematik/galtonbrett/model.ts` | `dropBalls` (Kugeln zählen, mit Zufallsquelle) und `roundedRelation` („=“/„≈“) |
| `src/content/simulations/de/galtonbrett.md` | Erwartungsstriche nicht über Farbe beschrieben; Laplace-Hinweis bei 16 Reihen; Idee „Gruppen vergleichen“ |
| `src/content/simulations/en/galtonbrett.md` | auf den Stand der DE-Fassung gebracht |
| `tests/galtonbrett.test.ts` | neu, 15 Tests |

## 6. Für den Kern (nicht selbst ändern)
- Der Prüfbogen misst „reduzierte Bewegung“ nur im Startzustand. Bei Simulationen, deren Animation erst durch eine Schaltfläche beginnt (hier „1 Kugel“), bleibt ein Fehler so unentdeckt. Vorschlag: nach dem ersten Bild die erste Aktion (`primary`) auslösen und erneut vergleichen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Zufall nicht reproduzierbar:** Die Kugeln nutzen `Math.random`, nicht `seededRandom` wie `binomialverteilung`. Ich habe das bewusst so gelassen: Mit festem Startwert würden alle Geräte einer Klasse dieselben Kugeln werfen, und der Gruppenvergleich (neue Unterrichtsidee) wäre wertlos. Die Rechenlogik ist über `dropBalls` mit Startwert getestet. Bitte entscheiden, ob einheitlich `seededRandom` gewünscht ist.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2932/2932 grün (128 Dateien), Build ok.
