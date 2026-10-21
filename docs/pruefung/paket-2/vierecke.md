# Prüfprotokoll: `vierecke` – Das Haus der Vierecke

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `0c08b22` · Bogen: `scratchpad/pruefung/vierecke/vierecke.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):** Koordinaten in Kästchen, 1 Kästchen = 0,5 cm.
  1. A(0|0), B(4|0), C(4|3), D(0|3): $\vec{AB} = (4|0)$, $\vec{BC} = (0|3)$, Skalarprodukt 0 → vier rechte Winkel; $|AB| = 4 \ne 3 = |BC|$ → **Rechteck, kein Quadrat**. Diagonale $e = \sqrt{4^2 + 3^2} = 5$ Kästchen $= 2{,}5$ cm (in cm-Koordinaten wären es 5 cm), $e = f$. Anzeige: „Rechteck (auch: Parallelogramm, gleichschenkliges Trapez, Trapez, Viereck)“, a = 2 cm, b = 1,5 cm, e = f = 2,5 cm ✓.
  2. A(0|0), B(3|0), C(5|4), D(2|4): $\vec{AB} = \vec{DC} = (3|0)$, $\vec{BC} = \vec{AD} = (2|4)$ → **Parallelogramm**; $\vec{AB} \cdot \vec{BC} = 6 \ne 0$, $9 \ne 20$ → weder Rechteck noch Raute. $\tan\alpha = 4 : 2$ → $\alpha \approx 63{,}4°$, $\beta = 180° − \alpha \approx 116{,}6°$. $e = \sqrt{41} \approx 6{,}40$ Kästchen ≈ 3,2 cm, $f = \sqrt{17} \approx 4{,}12$ Kästchen ≈ 2,1 cm. Anzeige: α ≈ 63°, β ≈ 117°, e ≈ 3,2 cm, f ≈ 2,1 cm, Z = (2,5|2) ✓.
  3. Pfeilform A(9|1), B(14|8), C(9|6), D(4|8): $|AB|^2 = |AD|^2 = 25 + 49 = 74$, $|CB|^2 = |CD|^2 = 25 + 4 = 29$ → Diagonale e Symmetrieachse → **Drachenviereck** (nicht konvex, γ ≈ 224° > 180°), e = 5 Kästchen = 2,5 cm, f = 10 Kästchen = 5 cm ✓.
  4. Quadrat (0|0), (4|0), (4|4), (0|4): alle 8 Arten leuchten, 4 Achsen, Z = (2|2) ✓ (durch Ziehen aus dem Rechteck erzeugt).
- **Einordnung/Toleranz:** Ecken rasten auf Gitterpunkte ein; parallel/senkrecht/gleich lang/symmetrisch werden exakt mit ganzen Zahlen entschieden – keine Toleranzprobleme (weder zu streng noch zu locker). Haus wie im bayerischen Unterricht (symmetriebasiert): Viereck → Trapez, Drachenviereck; Trapez → gleichschenkliges Trapez, Parallelogramm; Rechteck unter gleichschenkl. Trapez und Parallelogramm; Raute unter Parallelogramm und Drachenviereck; Quadrat oben. Konsistenztest (4000 Zufallsvierecke) prüft die Oberbegriffe.
- **Sonderfälle:** Beim Ziehen werden überschlagene Vierecke, doppelte Ecken und drei Ecken auf einer Geraden abgewiesen (Hinweis, Ecke bleibt an der letzten gültigen Stelle) ✓. **Fehler:** Über die Zahlenfelder oder einen Link (z. B. `?ax=2&ay=2&bx=10&by=10&cx=10&cy=2&dx=2&dy=10`) ließ sich ein überschlagenes Viereck einstellen; es wurde als „Gleichschenkliges Trapez“ eingeordnet, mit Innenwinkeln 315° (Summe 720°). Behoben (siehe 5.). Nicht konvexes Drachenviereck zählt als Drachenviereck (im Lernmaterial als Lehrbuch-abhängig gekennzeichnet) ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm mit Dezimalkomma, „=“ bei exakten, „≈“ bei gerundeten Werten; Winkel auf ganze Grad ✓.
- **Begriffe wie im Unterricht:** a, b, c, d; e = [AC], f = [BD]; α … δ; Grundseiten/Schenkel; Symmetriezentrum Z ✓.
- **Neue/ergänzte Tests:** Block „Prüfrunde“ in `tests/vierecke.test.ts`: Rechteck 4 × 3 (kein Quadrat, Diagonalen 5), Parallelogramm (0|0),(3|0),(5|4),(2|4) mit α = arctan 2, Drachenviereck mit Grenzfall Raute, überschlagenes Viereck ungültig, gleichschenkliges Trapez mit gleichen Basiswinkeln.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 (a) w, (b) f, (c) w, (d) f, (e) w ✓. A2: V1 $\vec{AB} = (10|5)$, $\vec{BC} = (−3|6)$, Skalarprodukt 0, Längenquadrate 125/45 → Rechteck ✓; V2 Gegenseiten (9|2), (4|7), Skalarprodukt 50, 85 ≠ 65 → Parallelogramm ✓; V3 $|AB|^2 = |AD|^2 = 50$, $|CB|^2 = |CD|^2 = 61$ → Drachenviereck ✓. A3: D = A + (C − B) = (2|2) + (2|6) = (4|8), Link stimmt; Winkel bei B: (−8|0)·(2|6) = −16 ≠ 0 → kein Rechteck ✓. A4 Raute ✓. A5 ✓. Ausprobieren 3: C und D je um (2|1) verschoben → alle Seiten 10 Kästchen ✓.
- **„Beispiel laden“ geklickt:** Rechteck, Parallelogramm, Pfeilform, überschlagenes Viereck, Aufgabe 3 (Lösung), „Viereck bauen“ (EN, dunkel), „Viereck einordnen“ (Handy) angesehen – in Ordnung.
- **Texte vereinfacht/korrigiert:** EN-Lernmaterial war stark gekürzt (3 statt 5 Aufgaben, Aufgaben 1 und 2 verkürzt, keine Symmetriespalte) → inhaltlich an DE angeglichen. DE und EN: Satz zu ungültigen Vierecken über die Zahlenfelder ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Karopapier, Haus und Karten vollständig; iPad quer mit Papier/Erklärkarte links und Haus rechts; Beamer gut lesbar ✓.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine ✓. Bei sehr kleinen Vierecken am Rand (z. B. 4 × 3 Kästchen in der Ecke) mit Seitenlängen und Diagonalen gleichzeitig wird es eng – vertretbar.
- **Touch (Ziehen) und Maus:** Ecken ziehen (Rechteck → Quadrat durch Ziehen von C und D), Fläche verschieben, Überkreuzen wird verhindert ✓. Fangradius 20–22 px.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Seite regulär; Ecken zusätzlich über Zahlenfelder/Regler einstellbar ✓. Das Antippen im Haus (Einordnen) geht nur per Zeiger – siehe „Für den Kern“.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Elemente ohne Namen; Zeichenfläche beschrieben; Art, Eigenschaften, Seiten/Winkel (jetzt auch Diagonalen) als Ergebnistext ✓.
- **Farben:** aus `ctx.theme.series`; erfüllt/nicht erfüllt zusätzlich durch ✓/✗ und Text, Markierungen durch Form (Pfeile, Striche, Bogen mit Punkt, Strichpunktlinie) ✓. Feste Kartenfarben (`#ffffff`, `#151c27` …) wie bei anderen Simulationen.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/vierecke/index.ts` | Ungültige Lage (überschlagen, doppelte Ecke, drei Ecken auf einer Geraden) aus Zahlenfeldern/Link: keine Einordnung im Haus, keine Markierungen, Eigenschaften „–“, statt Winkeln ein bleibender Hinweis auf dem Papier, in der Karte und im Ergebnistext; „Viereck bauen“ zählt nicht als gelöst, „Einordnen“ nimmt keine Antwort an; Knopf „Beispiel zeigen“ führt zu einem gültigen Viereck. |
| `src/simulations/mathematik/vierecke/index.ts` | Diagonalenlängen e, f: im Ergebnistext, wenn Diagonalen eingeschaltet sind, und an den Diagonalen, wenn zusätzlich „Seitenlängen“ an ist. |
| `tests/vierecke.test.ts` | Tests der Prüfrunde (siehe 1.). |
| `src/content/simulations/en/vierecke.md` | Inhaltlich an DE angeglichen (Tabelle mit Symmetrie, 7 Ausprobier-Punkte, 5 Aufgaben, Unterrichtsideen). |
| `src/content/simulations/de/vierecke.md` | Satz zu ungültigen Vierecken über die Zahlenfelder. |

## 6. Für den Kern (nicht selbst ändern)
- Theme ohne Farbe für Kartenflächen/Schrift auf farbigen Flächen (hier fest `#ffffff`, `#151c27`, `#10161f` …) – wie bei anderen Simulationen, Vorschlag `surface`/`onSeries`.
- Auf der Zeichenfläche angetippte Ziele (Häuschen im Haus, „Beispiel zeigen“, „Nächstes Viereck“) sind nicht per Tastatur erreichbar. Für „Viereck einordnen“ wäre eine Auswahl als Bedienelement nötig (eigener Parameter/Aktion, Kern-Unterstützung für Antwortknöpfe?).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Im Modus „Viereck einordnen“ bleiben die Zahlenfelder der Ecken sichtbar und bedienbar (Ziehen ist gesperrt). Soll die Gruppe dort ausgeblendet werden? (Wirkt sich auf geteilte Aufgaben-Links nicht aus.)
- Nicht konvexe Drachenvierecke zählen als Drachenvierecke (wie im LehrplanPLUS-Umfeld üblich); manche Bücher verlangen Konvexität. Im Lernmaterial bereits als buchabhängig gekennzeichnet – so belassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2898/2898 grün, Build ok.
