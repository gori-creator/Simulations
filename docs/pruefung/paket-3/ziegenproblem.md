# Prüfprotokoll: `ziegenproblem` – Ziegenproblem

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `f5ec22d` · Bogen: `/tmp/boegen3/ziegenproblem.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. 3 Türen: Alle 3 · 3 = 9 gleich wahrscheinlichen Paare (Auto, erste Wahl) ausgezählt: Bleiben gewinnt nur bei Auto = Wahl (3 Fälle) ⇒ 3/9 = 1/3 ≈ 33,3 %; Wechseln gewinnt in den 6 übrigen Fällen, weil `remainingDoor` dann genau die Autotür geschlossen lässt ⇒ 6/9 = 2/3 ≈ 66,7 % ✓ (Anzeige „Bleiben: 1/3 ≈ 33,3 %, Wechseln: 2/3 ≈ 66,7 %“). Simulation 1000 Spiele: 34,7 % / 65,3 %, 30,9 % / 69,1 %, 33,0 % / 67,0 % – alle im 95-%-Bereich 2/3 ± 1,96 · √(2/9 : 1000) = 0,667 ± 0,029 ✓.
  2. n Türen: Wechseln gewinnt, wenn die erste Wahl falsch war: (n − 1)/n. n = 4: 3/4 = 75 % (exakt, Anzeige jetzt „= 75 %“, Simulation 1000 Spiele 73,9 %) ✓; n = 10: 9/10 = 90 %, die Moderation öffnet 10 − 2 = 8 Türen (Bild: „8 Türen mit Ziegen sind offen“) ✓, Simulation 1100 Spiele 90,5 % ✓.
  3. Variante „Moderation weiß nichts“ (Aufgabe 4), 3 Türen, Auto o. B. d. A. hinter Tür 1: erste Wahl 1/2/3 je 1/3, Moderation öffnet zufällig eine der 2 anderen ⇒ 6 Fälle je 1/6; bei Wahl 2 bzw. 3 zeigt je ein Fall das Auto (scheidet aus) ⇒ 4 gültige Fälle, Wechseln gewinnt in 2 ⇒ 1/2 ✓. Allgemein: gültig mit 1/n + (n − 1)/n · 1/(n − 1) = 2/n, davon je die Hälfte ⇒ 1/2 für jedes n (als Test).
  4. Aufgabe 5 (neu): P(X ≤ 5) bei n = 10, p = 2/3: Σ C(10, k) · 2ᵏ / 3¹⁰ = (1 + 20 + 180 + 960 + 3360 + 8064)/59 049 = 12 585/59 049 ≈ 0,213 ✓. Aufgabe 6 (neu): 3/4 · 1/2 = 3/8 = 37,5 % (durch Auszählen im Test bestätigt) ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): 3 Türen (Untergrenze) und 10 Türen (Obergrenze) gespielt und simuliert. Keine Spiele: „noch keine Spiele“ bzw. „–“ an den Säulen, keine Division durch 0. Achsenbereich wächst mit (1100 Spiele ⇒ bis 2000). Verlauf wird nach 100 000 Spielen nicht mehr gespeichert (Speichergrenze, Zähler laufen weiter) – in Ordnung.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt` ✓. **Behoben:** Theoretischer Wert stand immer mit „≈“, auch bei exakten Werten („1/10 ≈ 10 %“) → neue Funktion `relationSign`: „1/10 = 10 %“, „1/4 = 25 %“, „1/3 ≈ 33,3 %“. Simulierte Anteile jetzt mit Endnull („33,0 %“ statt „33 %“ neben „67,1 %“), in Ergebnis und an den Säulen.
- **Begriffe wie im Unterricht:** Baumdiagramm, Pfadregel, relative Häufigkeit, empirisches Gesetz der großen Zahlen – passend. „Gewinnanteil“ wird im Lernmaterial jetzt ausdrücklich als relative Häufigkeit erklärt und von der Wahrscheinlichkeit abgegrenzt.
- **Neue/ergänzte Tests:** neue Datei `tests/ziegenproblem.test.ts` mit 11 Tests: 1/n und (n − 1)/n, Autotür bleibt bei falscher Wahl zu, vollständige Auszählung für n = 3/4/10, Simulation 10 Türen, Variante ohne Wissen (Auszählung, 6 Fälle/4 gültig/2 Gewinne), „=“/„≈“, Aufgaben 2, 3, 5, 6. Bestehende Tests in `tests/new-models.test.ts` unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 2/3 · 1 = 2/3 ✓; A2 ± 0,029 ✓ – **behoben:** Bereich „63,7 % … 69,6 %“ ergänzt und der Satz zur 95-%-Schwankung verständlicher formuliert; A3 1/10, 9/10, acht geöffnete Türen ✓; A4 1/2 ✓ (Fallliste jetzt als Aufzählung, Hinweis: Die Simulation spielt nur nach den Originalregeln).
- **„Beispiel laden“ geklickt:** alle 3 Beispiele (3 Türen, 10 Türen, Simulation) normal und mit reduzierter Bewegung; alle Links (`?doors=10`, `?mode=simulate`, neu `?mode=simulate&doors=4`) mit eigenem Playwright-Skript (Klick in die Zeichenfläche, 360/414/768/1024/1440 px, hell/dunkel, DE/EN) geladen. Kein Link verrät eine Lösung, die nicht schon in der Aufgabe steht (Ausprobieren 4 bittet ausdrücklich, zuerst zu überlegen, da die Linien „Wechseln: 3/4“ die Antwort zeigen).
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (2 von 4 Aufgaben, 3 Ausprobieren-Punkte nur als Stichwort, Unterrichtsideen gekürzt) → auf den Stand der DE-Fassung gebracht (Dezimalpunkt im Englischen).
  - Neu in DE/EN: Abschnitt „Häufigkeit und Wahrscheinlichkeit“, Aufgabe 5 „Häufigkeit oder Wahrscheinlichkeit?“ (5 von 10 Gewinnen beim Wechseln), Aufgabe 6 „Vier Türen, nur eine wird geöffnet“ (3/8), Ausprobieren 4 (vier Türen).
  - Kurze Sätze statt Gedankenstrich-Ketten; Unterrichtsideen in der Sie-Form („Lassen Sie die Klasse vorher abstimmen …“, „Sammeln Sie …“). Der interne Verweis auf `docs/BILDER.md` im Lernmaterial für Lehrkräfte entfernt. Lehrplanbezug „Jahrgangsstufe 10“ mit „bitte am Lehrplan prüfen“.
  - Alt-Text der Zeichenfläche (DE/EN) beschreibt jetzt Markierungen, Ergebnisrahmen und den Simulationsmodus.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Spielmodus überall gut, Bühne bildfüllend, Beamer gut lesbar. **Behoben (iPad quer):** Im Simulationsmodus war die Bühne dort 632 × 362 px breit und flach, wegen `w >= 640` kam aber das Handy-Layout (Säulen untereinander, nur 150 px hoch) → Layout jetzt nach Breite **und** Seitenverhältnis (`w >= 480 && w/h > 1.2`): Säulen und Diagramm nebeneinander.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** Am Handy mit 10 Türen waren die Markierungsrahmen der äußeren Türen am Rand abgeschnitten, benachbarte Rahmen überlappten (Abstand 8 px, Rahmen 9 px außen) und „erste Wahl“/„endgültige Wahl“ liefen über den Rand → Rand und Abstand aus der Rahmenbreite berechnet, Rahmen bei kleinen Türen schmaler, Beschriftung verkleinert sich bei Bedarf und wird an den Rand geklemmt. Im Simulationsmodus lag der Wert „31,3 %“ auf der gestrichelten Linie der Wahrscheinlichkeit → steht jetzt über Säule und Linie. Bei verlorener Runde schimmerte der blaue Wahlrahmen durch den gestrichelten Ergebnisrahmen → Ergebnisrahmen ersetzt ihn.
- **Touch (Ziehen) und Maus:** Kein Ziehen; Türen werden angetippt. Mit Maus und mit Touch-Kontext (`hasTouch`, 390 px, Tippen auf Tür → Wahl, Tippen auf dieselbe Tür → „Bleiben“) geprüft ✓. Tippen auf eine Tür nach Spielende startet direkt ein neues Spiel ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen). **Behoben:** Nach einer Aktion bewegte sich das Bild (Türen öffneten sich über ≈ 1 s nacheinander; gemessen auf dem Stand der Leitung, Port 4530: „MOVES“ nach Türwahl, „Wechseln“, neuem Spiel per Tippen). Jetzt sind die Türen bei reduzierter Bewegung sofort offen. Gemessen (Kontext mit `reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s) nach Türwahl, „Wechseln“, „Bleiben“, neuem Spiel per Tippen, „Neues Spiel“, „Statistik löschen“, „100/1000 Spiele“ und den Beispielen „3 Türen“, „10 Türen“, „Simulation“ – alle 10 Fälle still. „Automatisch spielen“ läuft nur nach ausdrücklichem Start weiter (wie bei `monte-carlo-pi`).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung. „Bleiben“, „Wechseln“ und „Neues Spiel“ sind Knöpfe, die **erste Wahl** einer Tür geht aber nur durch Antippen der Zeichenfläche (siehe „Für den Kern“). Der Simulationsmodus ist vollständig per Tastatur bedienbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Ergebnisse als Text; Alt-Text erweitert.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Gewinn/Niete wurde am Ergebnisrahmen nur über Grün/Rot unterschieden → Gewinn durchgezogener Rahmen mit ✓-Plakette, Niete gestrichelter Rahmen mit ✗-Plakette, Meldung mit ✓/✗. Die „andere Tür“ (grün) war nur über die Farbe von „Deine Wahl“ (blau) zu unterscheiden → beschriftet. Beschriftungen unter den Türen jetzt weiß statt blau (blau auf der dunklen Bühne war schwach). Im Diagramm waren die Kurven nur über die Farbe zuzuordnen → Linien beschriftet („Wechseln: 2/3“, „Bleiben: 1/3“). Rahmen-, Säulen- und Kurvenfarben aus `ctx.theme`. Fest bleiben bewusst: Bühne (immer dunkel, Foto bzw. gezeichneter Ersatz), Schrift auf der Bühne (weiß), Ersatzgrafiken für Tür, Ziege und Auto, Meldungsfarben auf der dunklen Bühne – Theme-Farben hätten dort im hellen Modus zu wenig Kontrast. Die Ersatzgrafiken (ohne Bilddateien) wurden in diesem Durchgang nicht eigens mit umbenannten Bildern geprüft; der Code ist unverändert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/ziegenproblem/index.ts` | Reduzierte Bewegung: Türen sofort offen |
| `src/simulations/mathematik/ziegenproblem/index.ts` | Gewinn/Niete mit Strichart und ✓/✗; „andere Tür“ beschriftet; Kurven im Diagramm beschriftet; Alt-Text DE/EN |
| `src/simulations/mathematik/ziegenproblem/index.ts` | Türen-Layout am Handy (Rand, Abstand, Rahmen, Beschriftung geklemmt); Simulationslayout nach Breite und Seitenverhältnis (iPad quer); Säulenwert über der Linie |
| `src/simulations/mathematik/ziegenproblem/index.ts` | „=“/„≈“ beim theoretischen Wert, Endnull bei simulierten Anteilen |
| `src/simulations/mathematik/ziegenproblem/model.ts` | `relationSign`; `playRoundUninformed` (Variante aus Aufgabe 4, für Tests) |
| `src/content/simulations/de/ziegenproblem.md` | Häufigkeit/Wahrscheinlichkeit, Aufgaben 5 und 6, Ausprobieren 4, Bereich in A2, kürzere Sätze, Sie-Form |
| `src/content/simulations/en/ziegenproblem.md` | auf den Stand der DE-Fassung gebracht |
| `tests/ziegenproblem.test.ts` | neu, 11 Tests |

## 6. Für den Kern (nicht selbst ändern)
- Die erste Türwahl ist nur über die Zeichenfläche möglich (`TapTarget`), nicht per Tastatur oder Bildschirmleser. Ein Kern-Weg für tastaturbedienbare Trefferflächen in der Zeichenfläche (oder dynamische Aktionsknöpfe „Tür 1 … Tür n“) wäre hilfreich.
- Wie schon bei `monte-carlo-pi`/`geburtstagsproblem`: Der Prüfbogen misst „reduzierte Bewegung“ nur im Startzustand; hier zeigte sich der Fehler erst nach dem Antippen einer Tür (Zeichenfläche, nicht über einen Knopf erreichbar).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Variante „Moderation weiß nichts“ ist nur Aufgabe im Lernmaterial (jetzt mit Test abgesichert). Soll sie als eigener Modus in die Simulation (neuer Parameter, ungültige Spiele zählen nicht)? Das wäre eine Erweiterung, kein Fehler.
- Lehrplanbezug „Jahrgangsstufe 10“ (mehrstufige Zufallsexperimente, bedingte Wahrscheinlichkeit) bitte am bayerischen Lehrplan prüfen; im Lernmaterial entsprechend gekennzeichnet.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3059/3059 grün (133 Dateien), Build ok.
