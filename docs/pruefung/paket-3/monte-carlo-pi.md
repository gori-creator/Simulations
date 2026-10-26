# Prüfprotokoll: `monte-carlo-pi` – Monte-Carlo-Methode: π mit Zufall bestimmen

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `350bac4` · Bogen: `/tmp/boegen3/monte-carlo-pi.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Viertelkreis, 1000 Punkte, k = 782 (Bild): π ≈ 4 · 782/1000 = 3128/1000 = 3,128 – exakt, daher „= 3,128“ ✓. Abweichung |3,128 − 3,14159| = 0,01359 ⇒ „≈ 0,0136“ ✓. Anteil 782/1000 = 78,2 % ✓.
  2. 3000 Punkte, k = 2371: 4 · 2371/3000 = 9484/3000 = 3,16133… ⇒ jetzt „≈ 3,1613“ (vorher „= 3,1613“, obwohl gerundet). Anteil 2371/3000 = 79,033 % ⇒ jetzt „≈ 79,0 %“ (vorher „79 %“ ohne Endnull und ohne „≈“). Abweichung 3,16133 − 3,14159 = 0,01974 ⇒ „≈ 0,0197“ ✓.
  3. Trichter (95 %-Bereich): p = π/4 = 0,785398, p(1 − p) = 0,785398 · 0,214602 = 0,168548, √ = 0,410546; Halbbreite 1,96 · 4 · 0,410546/√n = 3,2187/√n. n = 100 000: 3,2187/316,23 = 0,01018 ≈ 0,01 (Aufgabe 3) ✓; n = 1000: 0,1018. Für 0,001: n = (3,2187/0,001)² ≈ 10,36 Mio. ⇒ „etwa 10 Millionen“ ✓.
  4. Ganzer Kreis, 1000 Punkte, k = 784: 4 · 784/1000 = 3,136, Abweichung 0,0056 ✓. Flächenverhältnis π · 1²/2² = π/4 ✓; Trefferprüfung über (2x − 1)² + (2y − 1)² ≤ 1 ✓.
  - Mit festem Startwert geprüft: 2000 Versuchsreihen à 1000 Punkte – zwischen 93 % und 97 % der Schätzwerte liegen im Trichter (Test).
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): n = 0: `estimatePi` liefert NaN, Anzeigen zeigen „Punkte setzen, um zu beginnen“ bzw. „–“, keine Division durch 0. n = 1: Schätzwert 0 oder 4 (EN-Link geprüft: „4 · 1/1 = 4“). Rand x² + y² = 1 zählt als Treffer. Geschwindigkeit 1–2000/s, höchstens 20 000 Punkte je Bild; ab 120 000 Punkten wird nur noch gezählt (Hinweis im Bild). Der Trichter ist für kleine n (Normalnäherung) nur grob, für n < 10 füllt er die ganze Höhe – im Lernmaterial jetzt erwähnt.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt` ✓. **Behoben:** „=“ auch bei gerundetem Schätzwert; Anteil in Prozent ohne Endnull; Abweichung ohne „≈“ (π ist irrational, daher immer gerundet). Jetzt „=“ nur bei exaktem 4 · k/n (ganzzahlige Prüfung `estimateIsExact`), sonst „≈“ mit vier Nachkommastellen.
- **Begriffe wie im Unterricht:** Einheitsquadrat, Viertelkreis, Kreiszahl π, Schätzwert, Flächenverhältnis, Satz des Pythagoras – passend. Zuordnung Jgst. 10 steht so in `src/curriculum/lehrplaene/` (Simulation von Zufallsexperimenten).
- **Neue/ergänzte Tests:** neue Datei `tests/monte-carlo-pi.test.ts` mit 11 Tests: Trefferprüfung (Rand, ganzer Kreis), Schätzwerte aus dem Protokoll, n = 0, „=“/„≈“, Annäherung an π mit Startwert, Trichterbreite (3,22/√n, Aufgabe 3 und 4: 100-mal mehr Punkte ⇒ 10-mal schmaler, √25 = 5), Abdeckung ≈ 95 %. Bestehender Test in `tests/new-models.test.ts` unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 Anteil ≈ π/4, ·4 ✓; A2 π/4 ✓; A3 0,0102 bei 100 000, 10,4 Mio. für 0,001 ✓; A4 25 000 Punkte, Abweichung √25 = 5-mal kleiner ✓. Keine Rechenfehler.
- **„Beispiel laden“ geklickt:** alle 4 Beispiele (Viertelkreis, Ganzer Kreis, Schnell, Lineare Achse) und alle Links (`?shape=full` zweimal, `?speed=1000`) mit simshot bei 360, 768, 1024, 1440 und 1920 px, hell/dunkel, mit 1 bis 3000 Punkten. Zustände passen zum Text. Kein Link zeigt eine Lösung vorab (Aufgabe 2: Link steht in der Lösung). Die Abweichung von π ist als Spoiler verdeckt.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (2 von 4 Aufgaben, ohne Stolpersteine, ohne Ausprobieren 4) → auf den Stand der DE-Fassung gebracht.
  - Zufallsstreuung ergänzt (DE/EN): Schätzwert ist selbst zufällig, Streuung ~ 1/√n; Ausprobieren 2 „Vergleicht eure Werte in der Klasse“; neuer Stolperstein „Bei 1000 Punkten stimmen immer zwei Nachkommastellen“ (typische Abweichung ≈ 4 · 0,4105/√1000 ≈ 0,05); A4 ergänzt: Einzelne können trotzdem näher an π liegen.
  - A3-Lösung mit der Formel für die Trichterbreite (3,22/√n) und der Rechnung für 100 000.
  - Trichter erklärt: punktweiser 95 %-Bereich, Normalnäherung, grob für kleine n, eine Kurve darf ihn verlassen. Schalter „Trichter (95 % der Versuchsreihen)“ → „Trichter (95 % der Schätzwerte)“ – der Bereich gilt für jedes n einzeln, nicht für ganze Versuchsreihen.
  - Ausprobieren 4: „drücke Abspielen“ ergänzt (der Link setzt nur die Geschwindigkeit). Neue Unterrichtsidee „Schätzwerte sammeln“ im Anregungston.
  - Alt-Text (DE/EN) beschreibt jetzt Punkte (rund/eckig), Zähler, Diagramm, π-Linie und Trichter.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** **Behoben:** Am iPad (hoch und quer) war die Bühne breit (Seitenverhältnis 1,8), aber schmaler als 700 px – es griff das Handy-Layout: winziges Quadrat oben, flaches Diagramm darunter ohne y-Beschriftung. Jetzt nebeneinander, sobald die Bühne breiter als 700 px oder 1,25-mal so breit wie hoch ist. Handy bleibt untereinander, Diagramm dort klein, aber lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** Die Zähler-Pillen „784 im Kreis“/„216 außerhalb“ überlappten sich im kleinen Feld (iPad quer) → links- bzw. rechtsbündig, bei Platzmangel übereinander. Starthinweis „Punkte setzen, um zu beginnen“ war linksbündig ab der Diagrammmitte und am rechten Rand abgeschnitten → zentriert zwischen 3,5 und π, bei Bedarf zweizeilig.
- **Touch (Ziehen) und Maus:** Die Simulation bietet kein Ziehen an (nur Schaltflächen und Regler), kein `dragHint`.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen). **Behoben:** Der Bogen prüft nur den Startzustand. Eigene Messung (reduzierte Bewegung, zwei Bilder im Abstand von 1,5 s): Vorher bewegte sich das Bild nach „1 Punkt“ (Ring), „10/100/1000 Punkte“ (Punkte erscheinen nacheinander über 0,6–1,2 s). Jetzt erscheinen die Punkte sofort ohne Ring; alle vier Knöpfe und die drei Beispiele (jeweils mit 100 Punkten) stehen still. Nach „Abspielen“ (von Hand gestartet) kommen weiter Punkte hinzu, ohne Ringe.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Schaltflächen/Regler erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Ergebnisse als Text (n, k mit Anteil, Schätzwert, Abweichung); Alt-Text erweitert.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Blatt (`#1c2230`/`#fffdf8`), Kreisfläche (rgba) und Pillenhintergründe (rgba) waren feste Farben → `theme.bg`, `withAlpha(theme.series[0])`, `withAlpha(theme.bg)`. Treffer und Nicht-Treffer unterschieden sich nur über die Farbe (Blau/Rosa) → Nicht-Treffer jetzt als kleine Quadrate (Punkte, Einblend-Animation und Marker in den Zähler-Pillen), Treffer rund. Zusätzlich trennt der Kreisbogen die beiden Gruppen.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/monte-carlo-pi/index.ts` | Layout nebeneinander auch bei breiter, aber schmaler Bühne (iPad) |
| `src/simulations/mathematik/monte-carlo-pi/index.ts` | Reduzierte Bewegung: Punkte sofort, ohne Ring und ohne Warteschlange |
| `src/simulations/mathematik/monte-carlo-pi/index.ts` | Nicht-Treffer als Quadrate; Theme-Farben für Blatt, Kreisfläche, Pillen |
| `src/simulations/mathematik/monte-carlo-pi/index.ts` | „=“/„≈“ und Endnullen bei Schätzwert, Anteil und Abweichung |
| `src/simulations/mathematik/monte-carlo-pi/index.ts` | Zähler-Pillen überlappen nicht mehr; Starthinweis zentriert/umbrochen; Trichter-Beschriftung; Alt-Text |
| `src/simulations/mathematik/monte-carlo-pi/model.ts` | `estimateIsExact` (ganzzahlige Prüfung für „=“) |
| `src/content/simulations/de/monte-carlo-pi.md` | Zufallsstreuung, Trichter-Erklärung, A3-Formel, Stolperstein, Unterrichtsidee |
| `src/content/simulations/en/monte-carlo-pi.md` | auf den Stand der DE-Fassung gebracht |
| `tests/monte-carlo-pi.test.ts` | neu, 11 Tests |

## 6. Für den Kern (nicht selbst ändern)
- Wie schon bei `galtonbrett`: Der Prüfbogen misst „reduzierte Bewegung“ nur im Startzustand; hier wurde der Fehler erst nach einem Knopfdruck sichtbar. Vorschlag: im Bogen zusätzlich die erste Aktion (`primary`) auslösen und erneut vergleichen.
- `Plot.textPx` ist standardmäßig linksbündig; Hinweistexte, die mittig gemeint sind, rutschen leicht aus dem Diagramm. Ein Hinweis in `docs/agenten/SPICKZETTEL.md` wäre hilfreich.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Zufall nicht reproduzierbar:** Die Simulation nutzt `Math.random` (wie `galtonbrett`). Für den Klassenvergleich (Ausprobieren 2, Aufgabe 4) ist das gewollt; die Rechenlogik ist mit `seededRandom` getestet. Bitte einheitlich entscheiden.
- **Trichter für kleine n:** Die Normalnäherung ist für n < 10 kaum sinnvoll (Halbbreite > 1). Ich habe das nur im Lernmaterial erwähnt und die Darstellung nicht geändert; denkbar wäre, den Trichter erst ab n = 10 zu zeichnen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2968/2968 grün (130 Dateien), Build ok.
