# Prüfprotokoll: `quadratwurzel` – Quadratwurzeln und das Heron-Verfahren

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `1b3736d` · Bogen: `/tmp/boegen3/quadratwurzel.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Heron für √10 ab x₀ = 3: x₁ = (3 + 10/3) : 2 = 19/6 ≈ 3,166667; 10 : x₁ = 60/19 ≈ 3,157895; x₂ = (19/6 + 60/19) : 2 = (361 + 360)/114 : 2 = 721/228 ≈ 3,162280702; a : x₂ = 2280/721 ≈ 3,162274619; √10 ≈ 3,16227766. Anzeige „x₂ = (3,166667 + 3,157895) : 2 ≈ 3,162280702 · a : x₂ ≈ 3,162274619“, Bruch 721/228, Tabelle „4 Stellen“ ✓
  2. Intervallschachtelung √3, Stufe 2: Proben 1,71² = 2,9241, 1,72² = 2,9584, 1,73² = 2,9929 (alle < 3), 1,74² = 3,0276 > 3 ⇒ [1,73; 1,74], Länge 0,01. Anzeige „1,73 < √3 < 1,74, weil 2,9929 < 3 < 3,0276“ ✓. Zusätzlich √199, Stufe 6: 14 106 735² = 198 999 972 360 225 ⇒ 14,106735² = 198,999972360225 < 199 < 199,000000573696 = 14,106736² ✓
  3. Teilweise Wurzelziehen: 50 = 25 · 2 ⇒ √50 = 5√2 ≈ 5 · 1,4142 ≈ 7,071; 7² = 49 < 50 < 64 = 8²; 7,0711² ≈ 50,0005 ≈ 50. 200 = 100 · 2 ⇒ 10√2 ≈ 14,142; 153 = 9 · 17 ⇒ 3√17 ≈ 3 · 4,1231 ≈ 12,369 ✓
  4. √2 ab x₀ = 2: 3/2, 17/12 ≈ 1,416667, 577/408 ≈ 1,4142157 (Tabelle: 0, 2, 5 richtige Stellen); a : x₃ = 2 : 1,414216 ≈ 1,414211 ✓. Fast-Treffer 41/29 ≈ 1,4138, 99/70 ≈ 1,4143, 239/169 ≈ 1,4142; 41² = 1681 = 2 · 29² − 1 ✓
- **Sonderfälle:** a = 1 (√1 = 1, eine Probe, kein Rest, „– genau“); Quadratzahlen in der Schachtelung (endet sofort, „Nächster Schritt“ gesperrt); x₀ = √a (a = 9, x₀ = 3: Streifenbreite 0, kurzer Übergang); Start mit der kurzen Seite (x₀ < a : x₀, Streifen von der senkrechten Seite); Reglergrenzen a = 200, x₀ = 1 bzw. 20, n = 6 (endlich, nach 8 Schritten auf 10⁻³ genau). Division durch 0 ausgeschlossen (x₀ ≥ 1). Keine negativen Werte möglich. Gleitkomma-Anzeige der Grenzquadrate (lo², hi² auf 2k Stellen) für alle a = 1 … 200 und k = 0 … 6 gegen exakte BigInt-Rechnung geprüft – stimmt überall.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Zahlen über `fmt`, DE Dezimalkomma, EN Dezimalpunkt; Intervalle DE `[1,73; 1,74]`, EN `[1.73, 1.74]`; „=“ nur bei exakten Werten, sonst „≈“. Ohne Einheiten (Flächeninhalt in Einheitsquadraten).
- **Begriffe wie im Unterricht:** Radikand, Quadratzahl, teilweise Wurzelziehen, Heron-Verfahren, Intervallschachtelung, irrational, reelle Zahlen, Beweis durch Widerspruch – passend.
- **Neue/ergänzte Tests:** 4 neue Tests: Heron über den ganzen Reglerbereich (endlich, x · (a : x) = a, ab Schritt 1 nie unter √a); Umlegen bei kurzer Startseite und bei schon quadratischem Rechteck; Intervallschachtelung für alle a = 1 … 200 und Stufen 0 … 6 (Grenzen exakt, Gleitkomma-Anzeige der Quadrate exakt, Probe endet nach höchstens 10 Versuchen); kleinster Radikand a = 1.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 7 < √50 < 8, 5√2 ≈ 7,071 ✓; A2 19/6, 60/19, 721/228 ≈ 3,162281, vier Nachkommastellen richtig (3,16228… gegen 3,16227…) ✓; A3 1,7 < √3 < 1,8 und 1,73 < √3 < 1,74 ✓; A4 x² = a + d² ⇒ x ≥ √a, a : x ≤ √a ✓; A5 577/408 = 1,4142156…, fünf Stellen, 577² = 332 929, 2 · 408² = 332 928, Quadrat = 2 + 1/166 464 ≈ 2,000006 ✓; A6 289 / 288 und 9801 / 9800 ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele sowie alle Links im Lernmaterial (6 Ausprobieren-Links, 4 Aufgaben-Links mit `show=0`, Lösungslinks) geladen – Zustände passen zum Text, mit `show=0` erscheinen Werte im Bild, in Karten und Tabelle als „?“, Ergebnisse als „Aufdecken“. Farbangaben im Text („grüne Ecke“, „blaue Ecke“) stimmen mit dem Bild überein.
- **Texte vereinfacht/korrigiert:** DE Stolperstein „Die Grenzen eines Intervalls werden nicht durch Quadrieren geprüft“ war missverständlich → „… werden geschätzt, aber nicht durch Quadrieren geprüft“. EN war deutlich kürzer als DE: „What is it about?“ (Radikand, √a ≥ 0, Formelzeilen, Schluss zur Irrationalität), alle 6 Ausprobieren-Punkte mit Fragen, Aufgaben 4–6 und alle „Ideas for the classroom“ ergänzt; DE und EN jetzt inhaltlich gleich.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout passt (Handy: Bühne über den Karten; ab 640 px Bühne und Karten nebeneinander). Keine Überlappungen, keine abgeschnittenen Beschriftungen gefunden.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf, keine Konsolenfehler (403 nur Schriften über den Symlink). **Behoben:** In „√2 ist irrational“ verschwand auf Laptop/iPad quer die Karte „Fast-Treffer“, sobald der Beweis länger wurde (ab Schritt 3–4 kein Platz mehr) – Ausprobieren 6 und Aufgabe 6 verweisen aber darauf. Die Karte rückt jetzt bei wenig Platz zusammen und zeigt notfalls nur die ersten Zeilen (mindestens 3/2, 7/5, 17/12); bei 1360 px und Schritt 6/6 sind sechs Fast-Treffer bis 239/169 sichtbar. Auf dem Handy bleibt bei Schritt 6 nur der Beweis (zu wenig Platz) – vertretbar. Ebenso fehlt auf dem Handy in „Quadrat und Wurzel“ die dritte Karte „Quadratzahlen“ (Platz); die Inhalte stehen auch in den Ergebnissen.
- **Touch (Ziehen) und Maus – Fehler behoben:** Beim Ziehen der Ecke passte sich der Maßstab sofort an den neuen Wert an. Dadurch rutschte die Zeichnung unter dem Zeiger weg und der Wert lief davon: Im alten Stand führte das Ziehen der Heron-Ecke von x₀ = 2 auf 1,5 zu x₀ = 1 (Reglerminimum), das Ziehen der grünen Ecke bei a = 50 um zwei Kästchen nach innen zu a = 7 statt etwa 25. Jetzt wird der Maßstab während des Ziehens nur noch vergrößert, wenn das Bild sonst nicht passt, und nach dem Loslassen angepasst. Nachgeprüft: x₀ = 1,5 genau; a = 26 (√26 ≈ 5,1, Zeiger zwischen zwei Rasterpunkten); nach außen um ein Kästchen ergibt a = 67 (leichtes Nachwachsen, weil der Platz knapp wird). Trefferradius 20 px bei Touch (`fs(16, 20)`). Antippen der Teilintervalle in der Intervallschachtelung nur im Code geprüft (Trefferzone ±22 px um die Zahlengerade), nicht eigens im Browser.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge Kopfzeile → Aktionen → Beispiele → Regler laut Bogen; alles auch über Regler und Knöpfe erreichbar (Ziehen und Antippen sind nur Zusatz).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; `strings.canvas` beschreibt alle vier Ansichten und die Karten (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Bedeutungsfarben aus `ctx.theme.series`. Fest im Code sind nur neutrale Karten-, Rahmen- und Chipfarben (weiß/dunkelgrau, je nach `theme.dark`) – ohne Bedeutung. Rot/Grün (zu groß/Rest/Widerspruch gegenüber √a/Ergebnis) ist stets zusätzlich beschriftet („Rest: 1“, „zu groß“, „Widerspruch“, „Ergebnis“), das Zielquadrat ist zusätzlich gestrichelt.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/quadratwurzel/index.ts` | Ziehen: Maßstab (Heron EW/EH, Kästchen SE) beim Ziehen nicht mehr verkleinern, nach dem Loslassen anpassen – kein Davonlaufen von x₀ bzw. a mehr |
| `src/simulations/mathematik/quadratwurzel/index.ts` | Karte „Fast-Treffer“ passt sich dem freien Platz an (weniger/engere Zeilen) statt zu verschwinden; Fußzeile der Tabelle hat festen Platz |
| `tests/quadratwurzel.test.ts` | 4 neue Tests (Reglerbereich Heron, kurze Startseite/Quadrat, Schachtelung für alle a und Stufen inkl. Anzeige-Genauigkeit, a = 1) |
| `src/content/simulations/de/quadratwurzel.md` | Stolperstein zu den Intervallgrenzen klarer formuliert |
| `src/content/simulations/en/quadratwurzel.md` | auf den Stand der DE-Fassung gebracht (Erklärung, 6 Ausprobieren-Punkte, Aufgaben 4–6, Ideen für den Unterricht) |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Zuordnung zum LehrplanPLUS („Lernbereich Quadratwurzeln“, Jgst. 9) steht im Text bereits mit „bitte am Lehrplan prüfen“ – unverändert gelassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2867/2867 grün (125 Dateien), Build ok.
