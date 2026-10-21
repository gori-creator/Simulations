# Prüfprotokoll: `vierfeldertafel` – Vierfeldertafel und Mengendiagramm

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `dde439b` · Bogen: `/tmp/boegen3/vierfeldertafel.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (Haustier/Geschwister 10, 4, 9, 7): |A| = 10 + 4 = 14, |Ā| = 9 + 7 = 16, |B| = 10 + 9 = 19, |B̄| = 4 + 7 = 11, N = 30 ✓ (Zeilen und Spalten). P(A ∪ B) = 14/30 + 19/30 − 10/30 = 23/30 = 76,67 % ⇒ „≈ 76,7 %“ ✓; P_A(B) = 10/14 = 71,43 % ⇒ „≈ 71,4 %“, P_B(A) = 10/19 = 52,63 % ⇒ „≈ 52,6 %“ ✓. Baum A zuerst: 14/30, 16/30, 10/14, 4/14, 9/16, 7/16 ✓; Baum B zuerst: 19/30 · 10/19 = 10/30 ✓. Flächentreues Mengendiagramm: Test prüft Kreisflächen ∝ 14 und 19, Linse ∝ 10.
  2. 200 Jugendliche (46, 34, 52, 68): |A| = 80, |B| = 98; genau eins = 34 + 52 = 86 von 200 = 43 % exakt; A ∪ B = 80 + 98 − 46 = 132 von 200 = 66 % exakt; P_A(B) = 46/80 = 57,5 % exakt, P_B(A) = 46/98 = 46,94 % ⇒ „≈ 46,9 %“ ✓. **Vorher** stand bei allen „≈ 43,0 %“, „≈ 66,0 %“, „≈ 57,5 %“ → jetzt „= 43 %“, „= 66 %“, „= 57,5 %“, nur gerundete Werte mit „≈“.
  3. Baum umkehren P(A) = 0,33, P_A(B) = 0,5, P_Ā(B) = 0,25: P(A ∩ B) = 0,165 = 33/200, P(Ā ∩ B) = 0,67 · 0,25 = 0,1675 = 67/400, P(Ā ∩ B̄) = 0,5025 = 201/400 ✓; P(B) = 0,165 + 0,1675 = 0,3325 = 133/400 ✓; P_B(A) = 0,165 : 0,3325 = 0,49624 ⇒ „≈ 0,4962“ (vorher „= 0,4962“), P_B̄(A) = 0,165 : 0,6675 = 0,2472 ✓. Prüfwert des Lernmaterials 0,4/0,7/0,2: P(B) = 0,28 + 0,12 = 0,4, P_B(A) = 0,7, Häufigkeiten von 100: 28, 12, 12, 48 ✓.
  4. Einheitsquadrat: P(A ∩ B) = 0,4 · 0,7 = 0,28, P(A) · P(B) = 0,4 · 0,4 = 0,16 ⇒ „abhängig“ ✓; mit 0,6/0,4/0,4: 0,24 = 0,6 · 0,4 ⇒ „unabhängig“ ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): Alle Anzahlen 0: Mengendiagramm „Noch keine Daten“, Brüche „–“, Ergebnis Additionssatz zeigte „0/0 + 0/0 − 0/0 = –“ → jetzt „P(A ∪ B): –“. |A| = 0 bzw. |B| = 0: bedingte Wahrscheinlichkeiten „–“. P(B) = 0 bzw. 1 im Baum: P_B(A) bzw. P_B̄(A) „–“ bzw. 0, keine Division durch 0. A ∩ B = 0 (Kreise berühren sich) und A ⊂ B (Kreis im Kreis) gezeichnet korrekt; Reglergrenzen 0/99 und 0/1 ohne Fehler. Negative Werte nicht einstellbar.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt`, echtes Minus „−“ ✓. **Behoben:** „≈“ auch bei exakten Prozentwerten (Ergebnisse, Infokarte „Alles synchron“) und „=“ bei gerundetem P_B(A) (Infokarte und Ergebnis „Baum umkehren“). Prozentwerte in der Tafel einheitlich mit einer Stelle („40,0 %“) – als Tabellenformat gelassen.
- **Begriffe wie im Unterricht:** Vierfeldertafel, Randsummen, Schnitt/Vereinigung/Gegenereignis, Additionssatz, Pfad- und Summenregel, bedingte Wahrscheinlichkeit P_A(B), umgekehrter Baum, natürliche Häufigkeiten, (stochastisch) unabhängig – passend.
- **Neue/ergänzte Tests:** 6 neue Tests in `tests/vierfeldertafel.test.ts`: leere Tafel ohne Division durch 0, Aufgabe 3 (86 von 200, 132 von 200), Mengendiagramm disjunkt/Teilmenge, „Tafel ergänzen“: die Rechenschritte aller drei Vorgaben ergeben für drei Datensätze genau die richtigen Werte, umgekehrter Baum über das Reglerraster (Pfadregel in beide Richtungen, 0 ≤ P_B(A) ≤ 1), Unabhängigkeit aus Aufgabe 6. Bestehende Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 4, 9, 16, 7 ✓; A2 23/30 ≈ 76,7 %, Gegenereignis 1 − 7/30 ✓; A3 43 % ✓; A4 19/30, 11/30, 10/19, 9/19, 4/11, 7/11 ✓; A5 0,40, 0,70, 28 Personen ✓; A6 0,24 = 0,6 · 0,4, 12/30 = 8/20 ✓; A7 0,24 = 0,4 · 0,6 ✓. Keine Rechenfehler.
- **„Beispiel laden“ geklickt:** alle 8 Beispiele und alle Links (Ausprobieren 1–8, Aufgaben, Lösungen) mit simshot bei 360, 1024 und 1440 px, hell/dunkel; Zustände passen zum Text. **Behoben:**
  - Aufgabe 5 („Baum umkehren“): Beim Laden standen P(B), P_B(A), umgekehrter Baum und Tafel schon im Bild. Der Schalter `show` gilt jetzt auch in „Baum umkehren“: aus ⇒ nur der gegebene Baum und P(A) sichtbar, Rest „?“ (auch die Strichstärken verraten nichts). Link mit `show=0`. Beschriftung des Schalters „Innere Felder anzeigen“ → „Ergebnisse anzeigen“ mit Hilfetext für beide Ansichten (Schlüssel unverändert).
  - Aufgabe 6 („Zeige, dass …“): Die Infokarte zeigte sofort „A und B sind unabhängig: …“ → Link mit `show=0` (Randsummen bleiben sichtbar, |A ∩ B| = 12 steht im Text).
  - Lösung Aufgabe 7 („ändert sich anders“) war ungenau – beim Verschieben der rechten Linie bleibt P(A ∩ B) gleich → konkretes Beispiel mit P_Ā(B) = 0,2: P(B) = 0,36, P(A) · P(B) = 0,144.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (Ausprobieren 6 von 8, Aufgaben 3 von 7, keine Tafel, Unterrichtsideen gekürzt) → auf den Stand der DE-Fassung gebracht, Dezimalpunkt.
  - Linktexte kurz; kein waagerechter Überlauf (Bogen).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Unter 640 px alle Karten untereinander (Tafel, Mengendiagramm, Baum, Info), sonst zweispaltig; keine Karte fällt weg. Dunkelmodus lesbar. Am Handy sind die Brüche in der Tafel von „Baum umkehren“ klein (ca. 9 px), aber lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** Am Handy (360/414) überdeckten sich die Bruch-Pillen der zweiten Baumstufe (10/14 über 4/14, 0,7 über 0,3) → Pillen halten jetzt mindestens eine halbe Pillenhöhe Abstand zum Knoten.
- **Touch (Ziehen) und Maus:** Ziehen nur im Einheitsquadrat (drei Teilungslinien). **Behoben:** Beim Anfassen sprang die Linie bis zu 12 px unter den Zeiger → Griffversatz bleibt; gemessen: P_A(B)-Linie 10 px neben dem Griff angefasst, 50 px nach unten ⇒ 0,7 → 0,56 (= 50/358 px), P(A) 7 px daneben, 36 px ⇒ 0,4 → 0,5. Einrasten auf Unabhängigkeit (±0,02) bleibt. **Behoben:** Der Hinweis „Die markierten Punkte lassen sich mit Maus oder Finger ziehen“ stand in allen vier Ansichten, obwohl es keine Punkte und nur im Einheitsquadrat etwas zu ziehen gibt → `dragHint` entfernt; die Karte „Einheitsquadrat“ sagt „Linien ziehen“, der Regler-Hilfetext ebenso. Touch nicht gesondert simuliert, gleiche Zeigerereignisse.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Auswahl/Regler/Aktionen erreichbar (Ereignis über „Ereignis“, Felder ergänzen über „Nächsten Wert erschließen“, Linien über die Regler).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) beschreibt alle vier Ansichten.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Kartenhintergrund, Kartenrand, Pillenhintergrund und weiße Schrift auf Knoten/gefüllten Pillen waren feste Hex-/rgba-Werte → `th().bg`, `th().text`, `th().grid`. Fest bleiben nur Schatten. A/B sind überall beschriftet (Kreise, Knoten, Tafelköpfe, Quadratseiten), Teilflächen im Einheitsquadrat tragen Namen und Wert; abgeleitete Äste zusätzlich gestrichelt; „abhängig/unabhängig“ steht als Text.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/vierfeldertafel/index.ts` | Theme-Farben statt fester Hex-/rgba-Werte (Karten, Pillen, Schrift auf Knoten) |
| `src/simulations/mathematik/vierfeldertafel/index.ts` | „=“ bei exakten, „≈“ bei gerundeten Werten (Prozente, P_B(A)); leere Tafel ohne „0/0“ |
| `src/simulations/mathematik/vierfeldertafel/index.ts` | Astbeschriftungen der zweiten Stufe überdecken sich am Handy nicht mehr |
| `src/simulations/mathematik/vierfeldertafel/index.ts` | Griffversatz beim Ziehen der Linien; `dragHint` entfernt |
| `src/simulations/mathematik/vierfeldertafel/index.ts` | Schalter `show` („Ergebnisse anzeigen“) auch in „Baum umkehren“ |
| `src/content/simulations/de/vierfeldertafel.md` | Aufgaben 5 und 6 mit `show=0`; Lösung Aufgabe 7 präzisiert |
| `src/content/simulations/en/vierfeldertafel.md` | auf den Stand der DE-Fassung gebracht |
| `tests/vierfeldertafel.test.ts` | 6 neue Tests (Sonderfälle, Aufgabe 3/6, Mengendiagramm, Rechenschritte, umgekehrter Baum) |

## 6. Für den Kern (nicht selbst ändern)
- `dragHint` ist nur an/aus für die ganze Simulation und nennt „Punkte“. Für Simulationen mit mehreren Ansichten wäre ein Hinweis je Ansicht (oder ein eigener Text) hilfreich.
- Wie bei den anderen Prüfungen: ein allgemeiner Griffversatz beim Ziehen in `sim-core`.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Zuordnung „Jahrgangsstufe 9 (Vierfeldertafel, Additionssatz) und 11 (bedingte Wahrscheinlichkeit, umgekehrter Baum)“ ist im Lernmaterial als „bitte am Lehrplan prüfen“ gekennzeichnet; unverändert gelassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2917/2917 grün (127 Dateien), Build ok.
