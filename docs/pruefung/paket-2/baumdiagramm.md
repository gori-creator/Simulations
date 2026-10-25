# Prüfprotokoll: `baumdiagramm` – Mehrstufige Zufallsexperimente und Pfadregeln

Prüfer: Paket 2 · Datum: 25.10.2026 · Stand: Commit `1025064` (Basis) · Bogen: `/tmp/claude-0/-home-user-Simulations/8f85f9ae-3f3f-5aef-94a3-e731ae416460/scratchpad/pruef/baumdiagramm/baumdiagramm.png`

## Ergebnis
korrigiert (EN-Lernmaterial an DE angeglichen, Anzeige in der Simulation präzisiert, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung, in der Simulation geladen und Anzeige verglichen):**
  1. Urne 3 rot, 2 blau, ohne Zurücklegen: P(rr) = 3/5 · 2/4 = 6/20 = 3/10; Anzeige „P(rr) = 3/5 · 2/4 = 6/20 = 3/10“ ✓. Mit Zurücklegen 3/5 · 3/5 = 9/25 ✓.
  2. Gleiche Farbe ohne Zurücklegen: 3/10 + 2/5 · 1/4 = 3/10 + 1/10 = 4/10 = 2/5; Anzeige „P(rr) + P(bb) = 3/10 + 1/10 = 2/5“ ✓. Simulation 1000 Durchgänge: 396-mal = 39,6 %, im 95-%-Trichter um 40 % ✓.
  3. Dreimal mit Zurücklegen, mindestens eine rote: 1 − (2/5)³ = 1 − 8/125 = 117/125; Rechenkarte „P(bbb) = 2/5 · 2/5 · 2/5 = 8/125 … = 1 − 8/125 = 117/125“ ✓.
  4. Drei Farben (2 r, 3 b, 1 g), ohne Zurücklegen, alle verschieden: P(rr) = 2/6 · 1/5 = 2/30, P(bb) = 3/6 · 2/5 = 6/30, Summe 8/30 = 4/15, also 1 − 4/15 = 11/15; Anzeige identisch, Ast „0/5“ nach Grün ✓.
  5. Prozent-Anzeige: P(rr) = 60,0 % · 50,0 % = 30,0 % ✓; mindestens eine rote 30 + 30 + 30 = 90,0 % ✓.
- **Sonderfälle:** leere Urne (0/0/0) → „Lege Kugeln in die Urne.“, Aktionen gesperrt, kein Absturz; Nenner 0 in `frac` → 0/1; aufgebrauchte Farbe als gestrichelter 0-Ast (0/3 bei Aufgabe 4, 0/5 bei drei Farben); Urne wird leer (2 r, 1 b, n = 3) → Pfade rrb, rbr, brr je 1/3, Ast „1/1“ am letzten Zug (ungekürzt, korrekt); mit drei Farben höchstens zwei Züge (Hinweis am Regler). Keine Division durch 0 in der Anzeige.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** Brüche exakt; Dezimal auf 3 Stellen über `fmt.num`, Prozent mit 1 Stelle und Dezimalkomma; Minus als „−“.
- **Begriffe wie im Unterricht:** Baumdiagramm, Pfad, 1./2. Pfadregel, Gegenereignis, mit/ohne Zurücklegen, relative Häufigkeit ✓.
- **Neue/ergänzte Tests:** Aufgaben 1–4 und 6 aus dem Lernmaterial (vier Pfade, 13/25, 117/125 mit 7 Pfaden, P = 1 mit Ast 0/3, P(rrb) = 1/3); Randfälle leere Urne, eine Kugel, nur eine Farbe, Nenner 0. 20 Tests grün.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 3/10, 3/10, 3/10, 1/10, Summe 1 ✓; A2 2/5 = 40 % bzw. 9/25 + 4/25 = 13/25 = 52 % ✓; A3 117/125 = 93,6 %, direkt 7 Pfade ✓; A4 P = 1 (Ast 0/3) ✓; A5 11/15 ≈ 73,3 % ✓; A6 2/3 · 1/2 · 1 = 1/3 ✓. Keine Abweichungen.
- **„Beispiel laden“ / Links:** A3, A4, A5, A6, Vergleich, Simulation, Prozent-Ansicht per simshot geladen und angesehen; Anzeigen stimmen. Beispiele im Bogen sichtbar.
- **Texte korrigiert:**
  - DE Ausprobieren 7: „2 roten und 1 blauen Kugel“ → „2 roten Kugeln und 1 blauen Kugel“.
  - EN war stark gekürzt (2 statt 6 Aufgaben, 4 statt 7 Ausprobier-Punkte, Einführung und Unterrichtsideen verkürzt) → inhaltlich vollständig an DE angeglichen.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig, Urne und Baum gut lesbar, Beispiele-Karte auf dem Tablet vorhanden.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine. Auf dem Handy (390 px, Simulation) sind Brüche und Balken klein, aber lesbar.
- **Touch (Ziehen) und Maus:** kein Ziehen; Pfade werden angetippt (Auswahl bei „selbst antippen“), nicht per Skript geprüft.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Ziehen ohne Flug, Simulation sofort, Rechnung sofort vollständig)
- **Tastatur:** Tab-Reihenfolge unauffällig; Bedienung über Standard-Regler, Auswahl und Knöpfe.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text beschreibt Urne, Baum und Ansichten; Pfad, Ereignis und Simulation zusätzlich als Text (Ergebnisse mit r/b/g).
- **Farben:** nur aus `ctx.theme` (series); Rot/Blau gut unterscheidbar. Hinweis: bei drei Farben sind rote und grüne Kugeln im Bild nur über die Farbe unterscheidbar; die Textausgabe nennt die Pfade mit Buchstaben (r/g). Buchstaben auf den Kugeln wären ein kleiner Umbau, hier nicht gemacht.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/baumdiagramm/index.ts` | Urnenkarte (Ziehen/Simulation): „Ereignis: 37 = 37,0 %“ (Anzahl gleich Prozent) → „Ereignis: 37-mal (37,0 %)“, Breite angepasst |
| `src/content/simulations/de/baumdiagramm.md` | Grammatik Ausprobieren 7 |
| `src/content/simulations/en/baumdiagramm.md` | inhaltlich an DE angeglichen (6 Aufgaben, 7 Ausprobier-Punkte, Sonderfälle, Unterrichtsideen) |
| `tests/baumdiagramm.test.ts` | 6 Tests ergänzt (Aufgaben, Randfälle) |

## 6. Für den Kern (nicht selbst ändern)
- Keine.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Keine. Hinweis (optional): In der Rechenkarte heißt es allgemein „P(Gegenereignis) = …“; konkreter wäre z. B. „P(keine rote)“. Bei 3 Farben könnten Kugeln zusätzlich einen Buchstaben tragen (Rot/Grün-Unterscheidung).

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3043/3043 grün (baumdiagramm 20/20), Build ok.
