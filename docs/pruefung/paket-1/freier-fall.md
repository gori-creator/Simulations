# Prüfprotokoll: `freier-fall` – Freier Fall

Prüfer: Paket 1 (Vertretung) · Datum: 21.10.2026 · Stand: Commit `c1f9032` · Bogen: `scratchpad/boegen/freier-fall.png` (außerhalb des Repos)

## Ergebnis
korrigiert (iPad quer nutzte das Handy-Layout mit flacher Szene und gestauchten Diagrammen; Aufgabenmodus verriet Fallzeit, Aufprallgeschwindigkeit und das Verhältnis 1 : 3 : 5 : 7 im Bild und in „Momentan“; uneinheitliche Rundung; „v_E“ mit Unterstrich und auf der Achsbeschriftung; falscher Ziehen-Tipp im Reaktionstest; Rundungsfehler in Aufgabe 5; EN stark gekürzt; km/h-Umrechnung ergänzt; 2 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (h = 20 m, Erde): t = √(2 · 20/9,81) = √4,077 = 2,019 s ≈ 2,02 s; v = √(2 · 9,81 · 20) = √392,4 = 19,81 m/s ≈ 19,8 m/s; · 3,6 = 71,3 ≈ 71 km/h ✓ (Anzeige identisch).
  2. Stroboskop Δt = 0,4 s: Δs₁ = ½ · 9,81 · 0,16 = 0,785 m; 3 · 0,785 = 2,354 m; 5 · 0,785 = 3,924 m; 7 · 0,785 = 5,494 m; 9 · 0,785 = 7,063 m → „0,78; 2,35; 3,92; 5,49; 7,06 m → 1 : 3 : 5 : 7 : 9“ ✓ (bei T = 2,02 s fünf Abstände, das sechste Bild bei 2,4 s fehlt zu Recht).
  3. Mond, 20 m: t = √(40/1,62) = √24,69 = 4,969 ≈ 4,97 s; v = 1,62 · 4,969 = 8,05 m/s → 29 km/h ✓.
  4. Kugel mit der Maus auf s = 10,97 m gezogen: t = √(2 · 10,97/9,81) = 1,4955 ≈ 1,50 s; v = 9,81 · 1,4955 = 14,67 ≈ 14,7 m/s; · 3,6 = 52,8 ≈ 53 km/h ✓.
  5. Fallröhre: Kugel ohne Luft √(3/9,81) = 0,553 s, mit v_E = 75 m/s 0,55 s ✓; Feder mit v_E = 0,6 m/s ≈ 1,5/0,6 + (0,6/9,81) · ln 2 = 2,500 + 0,042 = 2,54 s ✓. Endgeschwindigkeit der Stahlkugel Ø 3 cm plausibel: m = 7850 · (4/3)π · 0,015³ = 0,111 kg, v_E = √(2mg/(ρ c_w A)) = √(2,178/(1,2 · 0,47 · 7,07·10⁻⁴)) ≈ 74 m/s ✓.
  6. Reaktionstest: Lineal 50 cm → t = √(1/9,81) = 0,319 s = „mehr als 319 ms“ ✓.
  7. Reglergrenze h = 1 m, Jupiter, Δt = 0,05 s: t = √(2/24,79) = 0,284 s; v = √(2 · 24,79) = 7,04 m/s; Δs₁ = ½ · 24,79 · 0,0025 = 0,031 m ✓.
- **Sonderfälle:** h = 0 ist über den Regler nicht möglich (min 1 m); im Modell liefern `fallTime`, `impactSpeed`, `dragFallTime` 0 ohne Division durch 0 (Test). Reglergrenzen h = 1/100 m, Δt = 0,05/1 s geprüft; bei Δt > Fallzeit kein Verhältnis (weniger als 2 Abstände) ✓. Mit Luftwiderstand: `lnCosh` ohne Überlauf, sehr lange Fallzeit ≈ h/v_E + (v_E/g) · ln 2 (Test). Reaktionstest: negative Strecke → 0.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** `fmt.num` ließ Endnullen weg („v = 7 m/s“ neben „7,04 m/s“, „s = 20 m“, „v = 8 m/s“), Momentan zeigte v mit 2, Fallzeit-Ergebnis mit 1 Stelle; Δs-Liste mischte 3 und 2 Nachkommastellen. Jetzt einheitlich mit `fmt.fixed`: t 2 Stellen, s 2 Stellen, v 1 Stelle (Fallturm) bzw. 2 Stellen (Röhre), alle Δs mit gleicher Stellenzahl.
- **Begriffe wie im Unterricht:** Fallgesetze, Fallbeschleunigung/Ortsfaktor, Fallzeit, Aufprallgeschwindigkeit, Stroboskop, Endgeschwindigkeit, Luftwiderstand, Reaktionszeit/Reaktionsweg ✓. Umrechnung m/s ↔ km/h fehlte als Erklärung → ergänzt.
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/freier-fall.test.ts` (Sonderfälle und Reglergrenzen; alle Aufgabenwerte 1–7, Röhren- und Linealwerte); jetzt 7 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 2,02 s; 19,8 m/s; 71 km/h ✓. A2 siehe oben ✓, Zuwachs 9,81 · 0,16 = 1,57 m ✓. A3 4,97 s; √(9,81/1,62) = √6,056 = 2,46 ≈ 2,5 ✓. A4 ½ · 9,81 · 4 = 19,62 ≈ 19,6 m ✓ (Link h = 19,5 m → 1,99 s, jetzt als „nächster Reglerwert“ erklärt). A5 √(0,36/9,81) = 0,1916 ≈ 0,19 s ✓; Reaktionsweg 13,89 · 0,1916 = 2,66 m → stand als „≈ 2,6 m“ (Rechnung mit gerundetem 0,19) → jetzt 13,9 · 0,192 ≈ 2,7 m. A6 Erklärung fachlich richtig ✓. Neu A7: Apfel aus 5 m: √98,1 = 9,90 m/s · 3,6 = 35,7 ≈ 36 km/h.
- **Aufgabenmodus:** Mit `_hide=1` zeigten die Pillen „t = 4,97 s“ und „v = 8 m/s“ am Ende des Falls sowie „Momentan“ die Lösung von A1/A3/A7, die Zahlen 1, 3, 5, 7, 9 an der Δs-Leiste die Lösung von A2. Jetzt: „t = ? s“, „v = ? m/s“ solange „Fallzeit“ und „Momentan“ verdeckt sind; „Momentan“ ist `spoiler`; Vielfache an der Leiste fehlen, solange „Abstände“ verdeckt ist (Leiste selbst bleibt).
- **„Beispiel laden“ geklickt:** alle sechs (Fallturm 20 m, Mond, 80 m/0,5 s, Röhre mit Luft, Röhre luftleer, Reaktionstest) – passen zu den Beschreibungen; alle Aufgaben- und Ausprobieren-Links geladen.
- **Texte vereinfacht/korrigiert:** DE: Absatz „Umrechnen in km/h“, Ausprobieren 2 nennt den ziehbaren Punkt im Diagramm, Steigungsdreieck und Fläche; A4 Hinweis zum Reglerwert; A5 Rundung; A7 neu. EN hatte 2 statt 6 Aufgaben, 4 Ausprobieren-Punkte und kaum Unterrichtsideen → vollständig auf DE-Umfang übersetzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** iPad quer war die Schwachstelle: Bühne ca. 630 × 420 px, Layout wählte nur nach der Breite (< 640 → untereinander) → Szene 200 px hoch, Diagramme ca. 90 px, „Δt = 1 s“ abgeschnitten, Pillen über dem Steigungsdreieck. Jetzt nach Breite **und** Höhe (`w ≥ 640 || w ≥ 1,3 h`) nebeneinander – alle drei Experimente geprüft, gut lesbar. Übrige Geräte in Ordnung.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. „v_E ≈ 0,6 m/s“ lag rechts auf „t in s“ → jetzt mittig über der Linie. Erste Δs-Zahl „1“ fehlte meist (Abschnitt < 10 px) → wird ab 4 px gezeichnet. Rest (nicht geändert): auf dem Mond mit Δt = 0,4 s sind die ersten Abschnitte so kurz, dass „1“ und „3“ fehlen; im Reaktionstest berühren die ms-Zahlen am Lineal knapp die Finger.
- **Touch (Ziehen) und Maus:** Kugel im Fallturm mit der Maus von 0 auf 10,97 m gezogen, Werte stimmen (oben) ✓. Punkt im t-s-Diagramm ebenfalls Griff.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; Fallen lassen, Abspielen, Zeitleiste über Knöpfe; Fangen mit Leertaste oder Knopf „Fangen!“. Ziehen der Kugel ist Komfort (Zeit über Abspielen/Zurück erreichbar) → kein `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Werte zusätzlich als Text in den Ergebnissen.
- **Farben:** Diagrammfarben aus `ctx.theme.series`; Kugel/Feder in Kurven zusätzlich beschriftet („Kugel“, „Feder“, „Kugel = Feder“), Luft/Vakuum als Text – nicht nur über Farbe unterscheidbar ✓. Szene (Fallturm, Röhre, Lineal) mit festen Sachfarben, dunkel angepasst.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/freier-fall/index.ts` | Layout nebeneinander auch auf flachen Bühnen (iPad quer) |
| `src/simulations/physik/freier-fall/index.ts` | Aufgabenmodus: t/v-Pillen „?“, „Momentan“ als `spoiler`, Δs-Vielfache ausgeblendet |
| `src/simulations/physik/freier-fall/index.ts` | einheitliche Rundung mit `fmt.fixed` (Momentan, Fallzeit, Pillen, Δs-Liste, Röhre) |
| `src/simulations/physik/freier-fall/index.ts` | „v_E“ mit `subText` (echter Index), mittig über der Linie statt auf der Achsbeschriftung; erste Δs-Zahl auch bei kurzem Abschnitt |
| `src/simulations/physik/freier-fall/index.ts` | eigener Tipp (`hint`) statt „Die markierten Punkte lassen sich ziehen“ (passte nicht zum Reaktionstest) |
| `src/content/simulations/de/freier-fall.md` | km/h-Umrechnung, Ausprobieren 2 erweitert, A4 Reglerwert, A5 Rundung 2,7 m, neue A7 |
| `src/content/simulations/en/freier-fall.md` | vollständig auf DE-Umfang übersetzt (7 Aufgaben, 5 Ausprobieren-Punkte, Unterrichtsideen) |
| `tests/freier-fall.test.ts` | 2 neue Tests (Sonderfälle/Reglergrenzen, Aufgabenwerte) |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `schiefe-ebene`: `Plot.text` setzt keine Indizes (hier „v_E“ lokal mit `subText` an `plotV.px/py`).
- Ein dynamischer `hint` je Modus (Funktion statt fester Text) wäre hilfreich: Der Tipp muss hier Fallturm und Reaktionstest gleichzeitig abdecken.

## 7. Entscheidungen
- **Stoppuhr und Tacho im Aufgabenmodus verdeckt** (auch während des Falls): Sonst liest man A1, A3 und A7 am Ende des Falls direkt ab. Die Kurven und Achsen bleiben – Ablesen am Graphen ist ungenau und erwünscht. Mit „Aufdecken“ von „Momentan“ oder „Fallzeit“ erscheinen die Werte wieder.
- **„Momentan“ als `spoiler`:** zeigt am Ende genau Fallzeit und Aufprallgeschwindigkeit. Wirkt nur mit `_hide=1`; normal bleibt es sichtbar.
- **Δs-Leiste bleibt im Aufgabenmodus, nur die Zahlen 1, 3, 5, 7 verschwinden:** Die Leiste ist das Werkzeug zum Messen, die Zahlen sind die Lösung von A2.
- **v im Fallturm mit 1 Nachkommastelle, s und t mit 2:** passt zu den Lösungen im Lernmaterial (19,8 m/s, 2,02 s, 0,78 m) und vermeidet Scheingenauigkeit.
- **Seitenlayout ab `w ≥ 1,3 · h`:** Regel aus der Qualitätssicherung; Handy (hohe Bühne) bleibt untereinander.
- **A4-Link auf 19,5 m belassen** und erklärt, statt den Reglerschritt (0,5 m) zu ändern: Der Schritt ist für den Unterricht sinnvoll, 19,5 m ergibt 1,99 s ≈ 2 s.
- **Neue Aufgabe 7 (km/h)** statt einer weiteren Anzeige: Die Simulation zeigt km/h bereits; die Umrechnung war im Material nur benutzt, nicht erklärt.
- **Endgeschwindigkeiten (75 m/s, 0,6 m/s) unverändert:** Stahlkugel nachgerechnet (≈ 74 m/s), Feder als Näherung im Material gekennzeichnet.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2970/2970 grün (131 Dateien), Build ok.
