# Prüfprotokoll: `bedingte-wahrscheinlichkeit` – Bedingte Wahrscheinlichkeit am Beispiel medizinischer Tests

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `801bde5` · Bogen: `/tmp/boegen3/bedingte-wahrscheinlichkeit.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (Prävalenz 1 %, Sensitivität 90 %, Spezifität 91 %): krank 1000 · 0,01 = 10, davon 10 · 0,9 = 9 positiv, 1 negativ; gesund 990, davon 990 · 0,09 = 89,1 ≈ 89 positiv, 900,9 ≈ 901 negativ (Summe 1000 ✓). P_+(K) = 0,009 : (0,009 + 0,0891) = 0,009 : 0,0981 = 0,09174 ⇒ „≈ 9,2 %“ ✓; mit Anzahlen 9/98 = 9,18 % ✓. P_−(K̄) = 0,9009 : (0,9009 + 0,001) = 0,99889 ⇒ „≈ 99,9 %“ ✓. Bild, Legende, Baum und Ergebnisse zeigen genau diese Werte.
  2. Schnelltest (0,5 %, 80 %, 98 %): 5 krank → 4 positiv, 1 negativ; 995 gesund → 995 · 0,02 = 19,9 ≈ 20 positiv, 975 negativ ✓. P_+(K) = 0,004 : (0,004 + 0,0199) = 0,004 : 0,0239 = 0,16736 ⇒ „≈ 16,7 %“ ✓. Mammographie (0,8 %, 90 %, 93 %): 0,0072 : (0,0072 + 0,06944) = 0,0072 : 0,07664 = 0,09395 ⇒ „≈ 9,4 %“ ✓; Anzahlen 8 → 7 | 1, 992 → 69 | 923 ✓; umgekehrter Baum P(+) = 76/1000 = 7,6 % (exakt 7,664 % ⇒ „7,7 %“) ✓.
  3. Zweittest: neue Prävalenz p₂ = 9/98,1 = 9,174 %; 9 · 0,9 = 8,1 und 89,1 · 0,09 = 8,019 ⇒ 8,1 : 16,119 = 8100/16119 = 100/199 = 0,50251 ⇒ „≈ 50,3 %“ ✓ (Kürzen durch 81). Anzahlen im Bild (je 1000 Personen mit positivem Ersttest): 92 krank → 83 | 9, 908 gesund → 82 | 826 ✓ (0,0917 · 0,9 · 1000 = 82,6; 908 · 0,09 = 81,7).
  4. Aufgabe 5: 0,99 · (1 − s) ≤ 0,009 ⇔ s ≥ 1 − 0,00909 = 99,09 %; mit s = 99,1 %: 0,009 : (0,009 + 0,00891) = 0,5025 ⇒ „≈ 50,3 %“, mit 99,0 %: 0,009 : 0,0189 = 47,6 % ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): Prävalenz 0,1 % (1 Person krank, PPV ≈ 1,0 %), 50 %; Sensitivität/Spezifität 50 und 100 % – alle Ecken ohne NaN (neuer Test). Spezifität 100 %: 0 falsch positive, PPV „= 100 %“ (vorher „≈ 100 %“), leere Gruppe im Fokus gestrichelt. Division durch 0 (keine positiv Getesteten) im Modell als NaN abgefangen, in der Simulation wegen se ≥ 50 % und Prävalenz ≥ 0,1 % nicht erreichbar. **Behoben:** Bei Prävalenz 50 %, Spezifität 99,9 % ergibt die Rundung 0 falsch positive; der Merksatz behauptete dann „Spezifität 100 %“ → Merksatz richtet sich jetzt nach der Spezifität, nicht nach der gerundeten Anzahl.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt`, echtes „−“ ✓. **Behoben:** exakte Werte mit „=“, gerundete mit „≈“ (Formelkasten, Ergebnisse PPV/NPV, Zweittest, Kopfzeile im Fokus); Zwischenbruch im Formelkasten „= 0,0072/0,0766“ war gerundet → jetzt „≈“, wenn die Anzeige rundet. Zahl und „%“ werden beim Zeilenumbruch nicht mehr getrennt (EN-Merksatz brach „9.2 / %“ um).
- **Begriffe wie im Unterricht:** Prävalenz, Sensitivität P_K(+), Spezifität P_K̄(−), positiver/negativer Vorhersagewert P_+(K)/P_−(K̄), richtig/falsch positiv/negativ, natürliche Häufigkeiten, umgekehrter Baum, Satz von Bayes, Basisraten-Fehler – passend, Schreibweise P_A(B) wie in Bayern.
- **Neue/ergänzte Tests:** 6 neue Tests in `tests/bedingte-wahrscheinlichkeit.test.ts`: Aufgabe 2, Aufgabe 3 (einschließlich 10 000 Frauen), 10 000 Personen im Lernmaterial (90 | 10 | 891 | 9009), Aufgabe 5 (Schwelle 99,09 %), Ausprobieren 4 (Sensitivität 50 %), Reglerecken. Bestehende Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 9 | 1 | 89 | 901, ≈ 9,2 % ✓; A2 ≈ 16,7 % ✓; A3 ≈ 9,4 %, 7,2 gegen 69,4 ✓; A4 100/199 ≈ 50,3 %, 8,1 und 8,019 ≈ 8,02 ✓; A5 99,09 % ✓. Keine Rechenfehler.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle Links (Ausprobieren 1–6, Aufgaben, Lösungen) mit simshot (1440/1024/768/360 px, hell/dunkel); Zustände passen zum Text. **Behoben:**
  - Aufgabe 1 („Bestimme die vier Gruppen …“) zeigte mit `show=0` die Lösung trotzdem: Anzahlen in der Legende, Kopfzeile „98 positiv getestet“, Satz „9 von 98 positiv Getesteten sind krank“, Ergebnis „1000 Personen“ und der Merksatz „die meisten positiven Ergebnisse sind falsch positiv“. Damit waren auch Aufgabe 2 und 4 praktisch gelöst. Jetzt blendet der Schalter `show` (neu „Ergebnisse anzeigen“, Schlüssel unverändert) alle Anzahlen und Vorhersagewerte als „?“ aus: Legende, Kopfzeile, Fokusansicht, Kennzahlen-Karte, Baumknoten, erste Stufe des umgekehrten Baums, Zwischenbruch und Häufigkeitszeile der Bayes-Formel; das Ergebnis „1000 Personen“ ist jetzt verdeckbar (`spoiler`); statt des Merksatzes steht ein Tipp. Im umgekehrten Baum verraten auch die Strichstärken nichts mehr. Prävalenz, Sensitivität und Spezifität bleiben sichtbar.
  - Ausprobieren 1 fragte nach „orangen und roten Personen“ → nach den positiv Getesteten; Hinweis auf den Punkt für Kranke. Ausprobieren 2: Hinweis, dass der Link den Endzustand zeigt.
- **Texte vereinfacht/korrigiert:**
  - DE: gerundete Rechnung 9/98 und 10 000 Personen (ganze Zahlen) ergänzt; Aufgabe 3 mit 10 000 Frauen (72 gegen 694,4 ≈ 694); Hinweis zum Aufgabenmodus; vorsichtiger Satz zur ärztlichen Abklärung. Lehrplan mit `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` abgeglichen: Jgst. 11, Lernbereich 3 „Bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit“ (dort „z. B. medizinische Tests“) → Einsatzzeile entsprechend; ob die Formel von Bayes ausdrücklich verlangt ist, bleibt „bitte am Lehrplan prüfen“.
  - Merksatz vorsichtiger: „Bei einer seltenen Krankheit können die meisten positiven Ergebnisse falsch positiv sein – auch bei einem guten Test. Hier ist das so.“ (vorher als allgemeines Gesetz formuliert).
  - EN war stark gekürzt (Ausprobieren 5 von 6 ohne Fragen, Aufgaben 3 von 5, kein NPV, keine Unterrichtsideen außer zwei) → auf den Stand der DE-Fassung gebracht, Dezimalpunkt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Ab 640 px Bühne zweispaltig (Bild + Kennzahlen-Karte), darunter einspaltig; iPad hoch nutzt die breite Aufteilung mit Legende 2 × 2, iPad quer und Laptop einreihig. Keine Karte fällt weg; Dunkelmodus lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** Am Handy war der Merksatz in der Kennzahlen-Karte abgeschnitten („… falsch positiv –“) → Karte bekommt am Handy feste ca. 270 px. Am Handy lagen im Baum die Astbeschriftungen der zweiten Stufe (9,2 %, 90,8 %, 0,11 %, 99,9 %) unter den Blattkästen → schmale Kästen, erste Stufe weiter links, Beschriftung zwischen den Kästen gehalten, Schrift 10,5 px.
- **Touch (Ziehen) und Maus:** Kein Ziehen (`dragHint: false` passt). Tippen/Zeigen auf Legende oder Blatt hebt eine Gruppe hervor; geprüft mit Maus.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ – Startzustand laut JSON; selbst geprüft mit `reducedMotion: 'reduce'` (zwei Fotos im Abstand von 1,5 s gleich) nach „Nur die positiv Getesteten“ (hin und zurück), „Ablauf neu zeigen“, „Zweiten Test machen“ (hin und zurück), drei Beispielen, „Baum umkehren“ und Zweittest im Baum. „Ablauf neu zeigen“ tut bei reduzierter Bewegung nichts (bewusst).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Aktionen, Regler und Auswahl erreichbar (Hervorheben einer Gruppe nur mit Zeiger, ist Zusatz).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) beschreibt Symbolbild, Kennzahlen, Baum und Formel.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Kartenhintergrund und Knotenhintergrund waren im Hellmodus fest `#ffffff` → `th().bg`. Fest bleiben nur Schatten. **Behoben:** Richtig positiv (rot, `series[1]`) und falsch positiv (orange, `series[3]`) unterschieden sich nur durch den Farbton – für Rot-Grün-Schwäche kaum trennbar. Kranke tragen jetzt einen Punkt auf dem Körper (ausgestanzt bei „richtig positiv“, gefüllt bei „falsch negativ“), in Bild, Legende und Baumblättern; negativ = blass/Umriss, positiv = gefüllt. Alle Gruppen sind zusätzlich beschriftet.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/bedingte-wahrscheinlichkeit/index.ts` | Theme-Farbe statt `#ffffff` (Karten, Knoten) |
| `src/simulations/mathematik/bedingte-wahrscheinlichkeit/index.ts` | Punkt für Kranke in den Personen-Symbolen (nicht nur Farbe) |
| `src/simulations/mathematik/bedingte-wahrscheinlichkeit/index.ts` | `show` blendet alle Anzahlen/Vorhersagewerte aus („?“), Ergebnis „1000 Personen“ verdeckbar, Tipp statt Merksatz, Strichstärken neutral; Beschriftung „Ergebnisse anzeigen“ |
| `src/simulations/mathematik/bedingte-wahrscheinlichkeit/index.ts` | „=“/„≈“ je nach Rundung; Merksatz zu Spezifität 100 % richtig ausgelöst und vorsichtiger formuliert; „%“ nicht abtrennbar |
| `src/simulations/mathematik/bedingte-wahrscheinlichkeit/index.ts` | Handy: Kennzahlen-Karte höher, Baum-Beschriftungen frei |
| `src/content/simulations/de/bedingte-wahrscheinlichkeit.md` | 10 000 Personen, Ausprobieren 1/2 präzisiert, Lehrplanzeile abgeglichen, Aufgabenmodus, ärztliche Abklärung |
| `src/content/simulations/en/bedingte-wahrscheinlichkeit.md` | auf den Stand der DE-Fassung gebracht |
| `tests/bedingte-wahrscheinlichkeit.test.ts` | 6 neue Tests (Aufgaben 2, 3, 5, 10 000 Personen, Sensitivität 50 %, Reglerecken) |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Lehrplan: Jgst. 11, Lernbereich 3 laut Projektdatei bestätigt. Ob der Satz von Bayes als Formel im LehrplanPLUS ausdrücklich steht (oder nur Baum/Vierfeldertafel), bitte prüfen; im Lernmaterial weiter als „bitte am Lehrplan prüfen“ gekennzeichnet.
- Die Beispielwerte (Schnelltest 80 %/98 %, Mammographie 0,8 %/90 %/93 %) sind als „vereinfacht“ gekennzeichnet und liegen im Bereich üblicher Lehrbuchwerte; nicht an Primärquellen geprüft.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3086/3086 grün (134 Dateien), Build ok.
