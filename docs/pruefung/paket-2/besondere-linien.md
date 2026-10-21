# Prüfprotokoll: `besondere-linien` – Umkreis, Inkreis und besondere Linien im Dreieck

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `9b17d4c` (Merge winkelsumme), darauf dieser Durchgang · Bogen: `scratchpad/pruefung/besondere-linien/besondere-linien.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Rechenlogik fehlerfrei; EN-Lernmaterial war stark gekürzt, Begründung in Aufgabe 6 lückenhaft, kleinere Darstellungsmängel)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Prüfdreieck A(0|0), B(6|0), C(2|4) (in der Simulation um (2|2) verschoben): S = ((0 + 6 + 2) : 3 | (0 + 0 + 4) : 3) = (8/3 | 4/3); U = (3|1), denn |UA|² = 9 + 1 = 10, |UB|² = 9 + 1 = 10, |UC|² = 1 + 9 = 10, r = √10 ≈ 3,16 ✓ (Anzeige 3,16 cm). H = 3S − 2U = (8 − 6 | 4 − 2) = (2|2) ✓. |HS| = |(2/3 | −2/3)| = 2√2/3 ≈ 0,94, |SU| = √2/3 ≈ 0,47 ✓ (Anzeige „0,94 : 0,47“, H(4|4), S(4,67|3,33), U(5|3) nach Verschiebung).
  2. Inkreis desselben Dreiecks: a = √32 ≈ 5,657, b = √20 ≈ 4,472, c = 6, u ≈ 16,129, A = 12; ρ = 2A : u = 24 : 16,129 ≈ 1,488 ✓; W = (a·A + b·B + c·C) : u = ((0 + 26,833 + 12) : 16,129 | 24 : 16,129) ≈ (2,408 | 1,488) ✓ (Anzeige ρ ≈ 1,49 cm, drei gleiche Balken 1,49 cm).
  3. Rechtwinklig A(0|0), B(4|0), C(0|3) (verschoben um (2|2)): U = Mitte von [BC] = (2|1,5), r = 2,5; H = A; ρ = (3 + 4 − 5) : 2 = 1 ✓ (Anzeige H(2|2), U(4|3,5), Hinweis „rechtwinklig: H = A, U = Mitte von [BC]“).
  4. Beispiel „Stumpfwinklig“ A(2|2), B(12|2), C(4,5|4,5): A = ½ · 10 · 2,5 = 12,5 cm²; h_c = 2,5; a = √62,5 ≈ 7,906, h_a = 25 : 7,906 ≈ 3,16; b = √12,5 ≈ 3,536, h_b ≈ 7,07 ✓. H: Höhe von C ist x = 4,5; Höhe von A ⊥ BC: −7,5(x − 2) + 2,5(y − 2) = 0 → bei x = 4,5: y = 9,5 → H(4,5|9,5) ✓.
  5. Grundeinstellung A(3|2), B(12,5|2,5), C(7|9,5): 2A = 9,5 · 7,5 − 0,5 · 4 = 69,25, A ≈ 34,63 cm² ✓; c = √90,5 ≈ 9,513, h_c ≈ 7,28 ✓. Schwerpunkt-Beispiel: S = (22 : 3 | 13,5 : 3) ≈ (7,33 | 4,5), |AM_a| = √(64 + 20,25) ≈ 9,18 → 6,12 : 3,06 ✓.
- **Sonderfälle:** Ecken auf einer Geraden → „kein Dreieck“, U/H/Euler = null (Test); gleichseitig mit Toleranz 0,4 % (wegen Einrasten auf 0,5 cm sonst nie erreichbar) → „U = W = S = H“; sehr stumpf (H ≈ (4|34)) → H liegt außerhalb des Bildausschnitts, jetzt mit Hinweis (siehe Korrekturen); Reglergrenzen 0,5 … 15,5 bzw. 0,5 … 11,5 cm.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** ✓ (`fmt.num`, cm, cm², ≈ bei gerundeten Werten). Seitenhalbierenden-Balken zeigten „6,1 : 3,1“ (wirkt nicht wie 2 : 1) → jetzt zwei Nachkommastellen wie in den Messwerten („6,12 : 3,06“).
- **Begriffe wie im Unterricht:** Mittelsenkrechte, Winkelhalbierende, Seitenhalbierende, Höhe, Umkreis-/Inkreismittelpunkt, Schwerpunkt, Höhenschnittpunkt, Euler-Gerade, Thaleskreis ✓. Inkreismittelpunkt heißt im DE durchgehend W (Bild, Karten, Messwerte, Lernmaterial); die Tabelle im Lernmaterial nennt „W (oft auch I)“, im EN durchgehend I (EN-Text nennt jetzt „German books: W“) ✓.
- **Neue/ergänzte Tests:** Aufgaben 1/2 (U, r, H, W, ρ), Aufgabe 5 (S, U, H, |HS|, |SU|), Stumpf-Beispiel (H, h_a, h_b, h_c), entartetes Dreieck (null). 30/30 grün.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1: |BC| = √(64 + 36) = 10, U(6|5), r = 5, H = A(2|2) ✓; 2: ½ · 24 · ρ = 24 → ρ = 2, W(4|4) ✓ (Simulation zeigt W ≈ (4|4), ρ ≈ 2 cm); 3: U bzw. W ✓; 4: ⅔ · 6 = 4 cm ✓; 5: S(11/3|7/3), HS ≈ 0,94, SU ≈ 0,47 ✓ (Simulation identisch); 6: siehe Korrektur.
- **„Beispiel laden“ / Links geklickt:** alle 6 Beispiele und alle Links (Ausprobieren 2–7, Aufgaben-Links mit `pt=0&_hide=1`, Lösungs-Links) geladen; zeigen den beschriebenen Zustand. „Fast gleichseitig“ (C(8|8,9)) wird als gleichseitig erkannt (Toleranz, s. o.).
- **Texte korrigiert:** DE Aufgabe 6: Begründung „jede Mittelsenkrechte ist zugleich Winkelhalbierende“ war unbegründet → jetzt über sechs kongruente rechtwinklige Dreiecke (Hypotenuse r, Kathete ρ, Kongruenzsatz SsW); Hinweis auf die (schwerere) Umkehrung beim gleichschenkligen Dreieck ergänzt. **EN war stark gekürzt** (5 statt 7 Ausprobier-Punkte, 3 statt 6 Aufgaben, kürzere Unterrichtsideen) → vollständig an DE angeglichen (gleiche Tabelle, Begründungen, 7 Ausprobier-Punkte, 6 Aufgaben mit denselben Links und Lösungen, gleiche Unterrichtsideen und Stolpersteine).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout passt (breit: Papier + Karten nebeneinander; Handy: untereinander), Karten vollständig, Beamer lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf (JSON). Behoben: Hinweisschild unten auf dem Papier wurde am Handy abgeschnitten („… Seiten und Höhen v“) → auf schmalem Papier kurze Fassung; „M_a“ wurde beim Halbieren vom Lineal verdeckt → Namen der Seitenmitten werden über Lineal/Geodreieck gezeichnet (bekannter Punkt erledigt).
- **Noch offen (bekannt, nicht umgebaut):** Geodreieck bei langen Höhen sehr groß; bei sehr stumpfen Dreiecken liegen H und C dicht beieinander bzw. H außerhalb des Bildausschnitts (Ansicht folgt H bewusst nur bis 1,6 · Dreiecksgröße; jetzt mit Hinweis „H liegt weit außerhalb, nicht mehr im Bild“).
- **Touch (Ziehen) und Maus:** Ecken ziehbar (Trefferradius 18 px Maus / 22 px Touch), rasten auf 0,5 cm ein; Werte folgen.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON plausibel; Ecken zusätzlich über Zahlenfelder/Regler, Schritte über Aktionsknöpfe ✓.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text beschreibt Karopapier, Werkzeuge, Linienarten, Kreise, Karten ✓; Messwerte (Dreieck, Schnittpunkt, Eigenschaft, Konstruktion) als Text.
- **Farben:** Linienarten über `ctx.theme.series`; ok/schlecht zusätzlich mit ✓/✗ und Text. Die Werkzeuge (Zirkel, Lineal, Bleistift, Geodreieck), Papier und Pappe nutzen feste Gegenstandsfarben (je hell/dunkel) – bewusst realistisch, nicht als Datenfarben; nicht geändert (siehe Rückfragen).

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/besondere-linien/index.ts` | Namen der Seitenmitten (M_a …) werden gezeichnet, nachdem Lineal/Geodreieck liegen – nicht mehr verdeckt |
| `src/simulations/mathematik/besondere-linien/index.ts` | Sonderfall-Schild: kurze Fassung auf schmalem Papier (Handy), Hinweis „U/H liegt weit außerhalb, nicht mehr im Bild“, wenn der Punkt außerhalb des Bildausschnitts liegt |
| `src/simulations/mathematik/besondere-linien/index.ts` | Balken „Teilung 2 : 1“ mit zwei Nachkommastellen (wie die Messwerte) |
| `tests/besondere-linien.test.ts` | 4 neue Tests (Aufgaben 1/2 und 5, Stumpf-Beispiel, entartetes Dreieck) |
| `src/content/simulations/de/besondere-linien.md` | Aufgabe 6: Begründung U = W ⇒ gleichseitig über SsW; Umkehrung beim gleichschenkligen Dreieck erwähnt |
| `src/content/simulations/en/besondere-linien.md` | vollständig an DE angeglichen (gleiche Ausprobier-Punkte, Aufgaben, Lösungen, Unterrichtsideen) |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Gleichseitig-Toleranz 0,4 %: Das Dreieck A(4|2), B(12|2), C(8|8,9) wird als „gleichseitig: U = W = S = H“ angezeigt, obwohl die Messwerte U ≈ (8|4,29), H ≈ (8|4,32) leicht abweichen. Wegen des Einrastens auf 0,5 cm ist ein exakt gleichseitiges Dreieck sonst nicht erreichbar; ich halte das für sinnvoll. Soll im Schild „(fast) gleichseitig“ stehen?
- Feste Gegenstandsfarben für Werkzeuge, Papier und Pappe (ca. 30 Stellen) statt Theme-Farben: bewusst so gestaltet? Ein Umbau auf Theme-Variablen wäre größer.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3010/3010 grün (129 Dateien), Build ok (364 Seiten).
