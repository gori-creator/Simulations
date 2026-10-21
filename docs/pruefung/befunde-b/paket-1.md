# Paket 1: kreiszahl-pi, pythagoras, prisma-zylinder, lgs-grafisch, gleichungen-grafisch

## kreiszahl-pi
1. EN-Material: fehlende Aufgaben nicht nachübersetzen. In EN `C` statt `U` für den Umfang verwenden (Bild Z. ~100 nutzt schon „C = π · d“; Ergebnisliste Z. ~144–146 und `lernmaterial-en` angleichen: „C = π · d = 2π · r“, „C : d = π ≈ 3.14159…“).
2. Canvas-Beschreibung (Barrierefreiheit, Z. ~83) um den Archimedes-Modus ergänzen: „Kreis, dessen Umfang abgerollt, dessen Fläche umgelegt oder der zwischen zwei Vielecke eingeschlossen wird“ / „A circle whose circumference is rolled out, whose area is rearranged or which is trapped between two polygons“.
3. DE Aufgabe 1 (Z. ~42): Einheiten und Rundung: „U = π · 70 cm ≈ 219,9 cm ≈ 2,2 m. Für 1000 m braucht man 1000 m : 2,199 m ≈ 454,7, also etwa 455 Umdrehungen.“
4. DE Z. ~70: „3 < π < 3,4641 (die Simulation zeigt diese Werte)“ statt 3,46.
5. DE Z. ~75: Begründung schärfen: „Jeder Kreisbogen zwischen zwei Ecken ist länger als die Sechseckseite darunter. Also ist der Kreisumfang größer als 3d, und es gilt π > 3.“
6. DE Z. ~86: Verweis auf `docs/BILDER.md` streichen.

## pythagoras
1. EN-Material: Satz mit Voraussetzung: „In every right triangle, the areas of the squares on the two legs add up to the area of the square on the hypotenuse: a² + b² = c²“. Umkehrung: „… the triangle is right-angled, with the right angle opposite c.“ (Fehlende Aufgaben nicht nachübersetzen.)
2. DE Z. ~31: „Ziehe die beiden farbigen Eckpunkte und zähle die Kästchen in den Quadraten. Beim 3-4-5-Dreieck geht das genau. Gilt a² + b² = c² auch beim gleichschenkligen Dreieck?“ (Vorher prüfen, wie viele Ecken ziehbar sind.)
3. Canvas-Beschreibung (Z. ~106/115) für beide Ansichten: „Rechtwinkliges Dreieck mit Quadraten über den drei Seiten oder Puzzle-Beweis mit vier Dreiecken im Quadrat mit der Seite a + b“ / EN entsprechend.
4. Rückfrage: Zeigt die Ergebnisliste „c = 5,000“? Wenn ja und exakt: „c = 5“.

## prisma-zylinder
1. EN Task 3: „What is the smallest number of vertices n for which the prism has more than 99 % of the cylinder’s volume? Try it in the simulation.“ plus Ladelink wie im DE.
2. Hilfetext zu r (Z. ~60) ergänzen: „Beim n-Eck: Radius des Umkreises. In der Rechnung ist s die Seitenlänge und ρ der Inkreisradius (Höhe der Teildreiecke).“ / EN entsprechend.
3. EN Ergebnisliste/Bild: Formelzeichen erklären: „Lateral area: M = u · h (u = perimeter of the base)“, „Surface area: O = 2 · G + M (G = base area)“. Zeichen selbst bleiben (Grundsatz: Formelzeichen wie im deutschen Unterricht, EN erklärt sie).
4. Z. ~183: „u ≈ 4,00 cm + 2 · 3,61 cm ≈ 11,21 cm“ (≈ statt = vor Summe mit gerundetem Wert).
5. DE Z. ~7: „Ein (gerades) Prisma hat zwei deckungsgleiche, parallele Flächen: die Grundfläche und die Deckfläche. Die Seitenflächen sind Rechtecke.“
6. DE Z. ~66: Begründung „Zwei Seiten jedes Dreiecks sind Umkreisradien. Das Dreieck ist also gleichschenklig, und seine Basiswinkel sind gleich groß: (180° − 60°) : 2 = 60°. Es ist gleichseitig, die Sechseckseite ist so lang wie der Radius.“
7. DE Z. ~104: „Man erwartet, dass sich das Volumen beim doppelten Radius verdoppelt. Tatsächlich wird es viermal so groß.“
8. DE Z. ~99: Bedienweg nennen („unter Anzeige → … ausschalten (in Links: calc=0)“), echten Reglernamen aus `index.ts` nehmen.
9. Prüfen: „3,0 Schichten“ beim Stapeln? Wenn ganzzahlig, ohne Nachkommastelle.

## lgs-grafisch
1. **Fehler** Tariftext (Z. ~138): DE „Unter {min} min ist Tarif {below} günstiger, über {min} min Tarif {above}. Bei {min} min kosten beide {cost} €.“ EN „Below {min} min tariff {below} is cheaper, above {min} min tariff {above}. At {min} min both cost €{cost}.“ (Platzhalter `cost` ggf. ergänzen.)
2. Z. ~343: „−1x“ vermeiden: `dm.num === -dm.den ? '−x'`.
3. Lösungsmenge in EN „S = {…}“ statt „L“ (wie gleichungen-grafisch).
4. EN: c₁ doppeldeutig (y-Achsenabschnitt und rechte Seite). In EN für den y-Achsenabschnitt `t` wie im DE verwenden oder für die rechte Seite einen anderen Buchstaben – nur Texte, keine Param-Keys ändern.
5. Aufgabenmodus: Wenn der Lösungsstreifen bei `_hide=1` sichtbar bleibt, die Lösungszeilen als `spoiler` markieren oder einen `resultsParam`-Schalter wie in gleichungen-grafisch (`show`) ergänzen; Aufgabenlinks im DE mit `_hide=1`/`show=0` versehen.
6. DE Z. ~127: „Bei parallelen Geraden führt das Rechnen auf einen Widerspruch wie 0 = 3. Dieser wird fälschlich als „x = 0“ gedeutet.“
7. DE Z. ~124: „Mit _hide=1 werden die Ergebnisse (Lage, Lösungsmenge, Rechnung, Probe, Tarif) verdeckt.“ (an echte Spoiler anpassen).
8. DE Z. ~37: Steigungsdreiecke sind aus: „Ziehe die markierten Punkte: den y-Achsenabschnitt (bei x = 0) und den Punkt bei x = 1. Mit „Anzeige → Steigungsdreiecke“ siehst du die Steigung.“ (echten Namen nehmen).
9. Prüfen „100,0 min“ → ganzzahlig ohne Nachkomma.

## gleichungen-grafisch
1. **Fehler** DE Aufgabe 4 / EN Task 3: Intervallhalbierung x² = 3. Nach 4 Schritten [1,6875; 1,75] ist die erste Nachkommastelle noch nicht sicher (1,75 → 1,8). Richtig: nach 6 Schritten [1,71875; 1,734375], beide Grenzen runden auf 1,7. Lösung neu schreiben (Schritte 5 und 6 ergänzen, „genauer √3 ≈ 1,732“). Mit dem Modell nachprüfen (`agreedDigits`).
2. **Fehler** „kein Parabel/Hyperbel“: `a0: 'a = 0: Der Graph ist {kind}, sondern eine Parallele zur x-Achse'`, `kindQuad: 'keine Parabel'`, `kindHyp: 'keine Hyperbel (mit Lücke bei x = d)'`, `kindAbs: 'kein Betragsgraph'`; EN analog prüfen (`kindHyp: 'hyperbola (with a gap at x = d)'` nur falls EN-Satz „not a … “ lautet). Lücke nur, wenn sie wirklich besteht (a = 0 ⇒ Funktion e mit D = ℝ \ {d}).
3. DE Tabelle „Wie viele Lösungen?“: Zeilen „schneiden sich in genau einem Punkt | eine Lösung“ und „… in drei Punkten | drei Lösungen“.
4. DE Z. ~85: „Multiplizieren mit x (erlaubt, da x ≠ 0) ergibt … Beide Lösungen liegen in D.“
5. DE Ideen: „Bei x² = 2 meldet die Simulation die zweite Nachkommastelle (1,41) erst nach 11 Schritten als sicher.“ (nachprüfen).
6. KIND_OPTIONS EN: `L('Betrag', 'Absolute value')` statt nur Symbol (falls DE-Label Text ist).
