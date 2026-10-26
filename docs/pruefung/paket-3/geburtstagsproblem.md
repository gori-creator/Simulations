# Prüfprotokoll: `geburtstagsproblem` – Geburtstagsproblem simulieren

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `7e9ad23` · Bogen: `/tmp/boegen3/geburtstagsproblem.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. n = 23, 365 Tage: P(alle verschieden) = 365!/((365 − 23)! · 365²³) = 365/365 · 364/365 · … · 343/365 = 0,492703 ⇒ P(mind. zwei gleich) = 1 − 0,4927 = 0,5073 = 50,73 % ✓ (Lehrbuchwert ≈ 50,7 %; Ergebnis „≈ 50,73 %“, Diagramm „50,7 %“, Rechenkarte „≈ 1 − 0,4927 = 50,73 %“). Kontrolle n = 22: 1 − 0,524305 = 47,57 % < 50 %, also kleinste Gruppe mit über 50 % ist 23 ✓ (Marke „n = 23“ im Diagramm).
  2. n = 25, „an meinem Geburtstag“: 1 − (364/365)²⁵ = 1 − 0,93371 = 0,06629 ≈ 6,63 % ✓ (Anzeige „≈ 6,63 %“, Diagramm „6,6 %“). Über 50 % erst ab 253 anderen: 1 − (364/365)²⁵³ = 0,5005, 1 − (364/365)²⁵² = 0,4991 ✓ („über 50 % erst ab n = 253“).
  3. 12 Monate, n = 6: 1 − 12 · 11 · 10 · 9 · 8 · 7 / 12⁶ = 1 − 665 280/2 985 984 = 1 − 0,2228 = 77,72 % ✓; n = 5: 1 − 95 040/248 832 = 61,81 % ✓; n = 13: Faktor 0/12, P = 1, Anzeige „n = 13 > 12: P = 1 (Schubfachprinzip)“ ✓.
  4. Paare n = 12: 12 · 11/2 = 66, Näherung 1 − (364/365)⁶⁶ = 16,6 %, exakt 16,7 % ✓. n = 23: 253 Paare, Näherung 50,0 % ✓.
  5. Simulation 100 Klassen à 23: 53 Treffer ⇒ h = 53/100 = 0,530, 95-%-Bereich 0,507 ± 1,96 · √(0,507 · 0,493/100) = 0,507 ± 0,098 ⇒ 0,409 bis 0,605 ✓ (Anzeige identisch). 1000 Klassen: 529/1000 = 52,9 % im Bereich 0,476 … 0,538 ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): n = 2 (Untergrenze) 1/365 ≈ 0,27 %; n = 70 (Obergrenze) 99,92 %; n > Anzahl der Fächer (Monat/Wochentag): Faktor 0, P = 1, Hinweis „Person 13 findet keinen freien Monat!“. Große Zahlen: kein 365! – das Produkt wird schrittweise gebildet (keine Überläufe). Leere Statistik: „–“ bzw. „noch keine Klasse“, keine Division durch 0 (`band95` mit N = 0 → [0; 1]). **Behoben:** `pairs(0)` lieferte −0 → jetzt 0.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt`, Minus `−` ✓. **Behoben:** Gerundete Werte standen mit „=“ („P = 0,507“, „P(alle 29 verschieden) = 0,3190“, „P = 1 − (364/365)²⁵ = 6,63 %“ in der Paar-Ansicht, „P(mind. zwei gleich) = 1 − 0,4313 = …“), exakte mit „≈“ („h = 47/100 ≈ 0,470“). Neue Funktion `relation` setzt „=“ nur bei exakten Werten. Häufigkeit jetzt mit Endnull („53,0 %“ statt „53 %“ neben „50,7 %“; Ergebnis „50 von 100 Klassen = 50,0 %“).
- **Begriffe wie im Unterricht:** Gegenereignis, Pfadregel, relative Häufigkeit, empirisches Gesetz der großen Zahlen, Schubfachprinzip – passend. **Behoben:** „niemand an 15. Mai“/„niemand an September“ → „niemand am 15. Mai“/„im September“.
- **Neue/ergänzte Tests:** 5 neue Tests in `tests/geburtstagsproblem.test.ts`: Formel bei n = 22/23/70, alle Aufgaben des Lernmaterials (0,82 %, 65,4 % mit 95-%-Bereich, 435 Paare/69,7 %, 6,6 %/300 Paare, Wochentage 65,0 % und sicher ab 8), Näherung = „mein Geburtstag“ bei 253, Sonderfälle (0/1 Person, Faktor 0, leere Klasse), „=“/„≈“. Bestehende Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 1 − 364 · 363/365² = 0,0082 ✓; A2 65,45 % ≈ 65,4 %, ≈ 654 von 1000, Bereich 0,625 … 0,684 ✓ (Lauf: 660/1000); A3 435 Paare, 69,68 % ✓; A4 6,63 % ✓, 25 · 24/2 = 300 Paare ✓, 56,87 % ≈ 56,9 % ✓; A5 1 − 840/2401 = 65,01 % ✓, sicher ab 8 ✓; A6 (Modellkritik) fachlich richtig. Tabelle 11,7/50,7/70,6/97,0 % ✓, Monat 61,8 % ✓.
- **„Beispiel laden“ geklickt:** alle 8 Beispiele (bei reduzierter Bewegung und normal) sowie alle Links aus „Ausprobieren“ und den Aufgaben mit simshot (1440/768/360 px, hell/dunkel). **Behoben:** Der Link zu Aufgabe 3 („Wie viele Paare bilden 30 Personen?“) zeigte die Lösung „30 Personen: 435 Paare“ im Bild und in der Rechenkarte → bei „Wahrscheinlichkeiten anzeigen“ aus steht jetzt „?“ statt der Paarzahl (auch im Exponenten der Näherung und in der Klassenansicht).
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (3 von 6 Aufgaben, 5 von 7 Ausprobieren, Erklärungen und Unterrichtsideen gekürzt) → auf den Stand der DE-Fassung gebracht (Dezimalpunkt im Englischen).
  - „rot mit, grün ohne gemeinsamen Geburtstag“ und „die rote Kurve“ → über Form/Namen beschrieben („gefüllt mit, hell mit Rand ohne“, „Kurve der relativen Häufigkeit“).
  - Unterrichtsidee in der Sie-Form („Lassen Sie vor der Rechnung schätzen …“), neue Idee „Gruppen vergleichen“ (DE/EN).
  - Alt-Text der Zeichenfläche (DE/EN) beschreibt jetzt alle vier Ansichten mit ihren Markierungen.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** iPad hoch und quer: Zeichenfläche ≥ 640 px, Kalender links groß, Diagramm und Rechenkarte rechts – passt. Laptop/1920/Beamer gut lesbar, Dunkelmodus lesbar. **Behoben:** Am Handy waren die Monatsnamen im Kalender der Ansicht „Rechnung“ übereinander gedrängt (Zeilen ≈ 7 px) → Bühne am Handy höher (`aspectNarrow` 0,56 → 0,5), Monatsschrift passt sich der Zeilenhöhe an, bei sehr flachen Zeilen wird nur jeder zweite Monat beschriftet.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** Die Legende der Rechnung (zwei Zeilen mit Hintergrund) lag über den Säulen 10 … 13 (gestapelte Säulen reichen immer bis 100 %) → jetzt eine Zeile über dem Diagramm. Die Beschriftung „n = 23“ wurde von der Kurve durchkreuzt → mit Hintergrund. Bei „Beide Fragen vergleichen“ waren die zwei Kurven nur über die Farbe zu unterscheiden → beschriftet („mind. zwei gleich“, „an meinem Tag“).
- **Touch (Ziehen) und Maus:** Im Diagramm lässt sich n mit der Maus ziehen (gemessen: 100 px nach rechts ⇒ n = 25 → 48); Tippen setzt n auf die Zeigerposition (gewollt). Tippen im Kalender setzt „mein Geburtstag“ (Monat: 1 − (11/12)⁸ = 50,15 % ✓). Touch nicht gesondert simuliert (gleiche Zeigerereignisse). **Behoben:** Der Hinweis „Die markierten Punkte lassen sich … ziehen“ passte nicht (es gibt keine ziehbaren Punkte, in „Viele Klassen“ gar nichts zu ziehen) → `dragHint` entfernt; der Regler-Hilfetext „Auch direkt im Diagramm ziehen.“ bleibt.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen) und selbst gemessen (Kontext mit `reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s) nach „Neue Klasse“, „100 Klassen“, „1000 Klassen“, „Noch einmal Schritt für Schritt“, „Neue Klasse“ in der Paar-Ansicht, Ansichtswechsel, „gleicher Monat“ und den Beispielen „Rechnung“, „Paare“, „Monat“, „13 Personen“, „Mein Geburtstag“, „1000 Klassen“ – alle 14 Fälle still.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Schaltflächen und Regler erreichbar (Ziehen nur als Ergänzung).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Ergebnisse als Text (Formel mit Wert, Simulation, diese Klasse); Alt-Text erweitert.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Kacheln der Simulation unterschieden „mit“/„ohne gemeinsamen Tag“ nur über Rot/Grün → Treffer gefüllt, ohne Treffer hell mit Rand. Kartenfläche, Kartenrand und Schildhintergrund waren feste Hex-/rgba-Werte → aus `theme.bg`/`theme.text`. Weiße Schrift auf gefüllten Schildern war im Dunkelmodus auf den hellen Reihenfarben schwach → Schrift in `theme.bg` (hell weiß, dunkel dunkel). Fest bleiben nur Schatten und der Glanzpunkt der Kugeln.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/geburtstagsproblem/index.ts` | Kacheln nicht nur über Rot/Grün; Theme-Farben für Karten, Schilder, Schrift auf Schildern; Kurven bei „Beide Fragen“ beschriftet |
| `src/simulations/mathematik/geburtstagsproblem/index.ts` | „=“/„≈“ je nach Rundung, Endnull bei h; „am 15. Mai“/„im September“ |
| `src/simulations/mathematik/geburtstagsproblem/index.ts` | Paarzahl bei ausgeblendeten Werten „?“ (Aufgabe 3) |
| `src/simulations/mathematik/geburtstagsproblem/index.ts` | Legende der Rechnung über dem Diagramm; „n = 23“ mit Hintergrund; Monatsnamen am Handy; `aspectNarrow` 0,5; `dragHint` entfernt; Alt-Text |
| `src/simulations/mathematik/geburtstagsproblem/model.ts` | `relation` („=“/„≈“), `pairs` ohne −0 |
| `src/content/simulations/de/geburtstagsproblem.md` | Kacheln/Kurve nicht über Farbe beschrieben; Sie-Form; Idee „Gruppen vergleichen“ |
| `src/content/simulations/en/geburtstagsproblem.md` | auf den Stand der DE-Fassung gebracht |
| `tests/geburtstagsproblem.test.ts` | 5 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- `dragHint` ist nur an/aus und spricht immer von „markierten Punkten“. Hier wäre ein eigener Text („n im Diagramm ziehen“) bzw. ein Hinweis je Ansicht hilfreich (wie schon bei `vierfeldertafel` angemerkt).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Bei „gleicher Wochentag“ wird „mein Wochentag“ als (Tag im Jahr − 1) mod 7 bestimmt, ohne Bezug zu einem echten Kalenderjahr. Für die Wahrscheinlichkeit egal; falls gewünscht, könnte der Regler einen echten Wochentag zeigen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2957/2957 grün (129 Dateien), Build ok.
