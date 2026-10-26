# Paket 6: ober-untersummen, hauptsatz, stammfunktion-grafisch, matrix-abbildungen

## ober-untersummen
1. **Fehler** Aufgabe 1: Ergebnisliste zeigt U₄/O₄ sofort. `_hide=1` verdeckt nur `spoiler`-Readouts → `sum`, `table` als `spoiler: true` markieren (prüfen, dass die Sim ohne _hide normal aussieht) oder `show` + `resultsParam` wie in anderen Sims; Link entsprechend.
2. Z. ~211 Trenner „·“ → „U₄ ≈ 1,75; O₄ ≈ 3,75; Differenz O₄ − U₄ ≈ 2“.
3. model.ts `extremes(…, 32)`: Extremwerte im Streifen exakt bestimmen (Ränder + Nullstellen von f′, für die vorhandenen Funktionen analytisch oder mit Bisektion/Nachiteration). Test mit 0,5x³ − 2x auf [−2; 3], n = 1: U₁ = −7,6980 (nachrechnen). Tests für die Sim anlegen (`tests/ober-untersummen.test.ts`), es gibt noch keine.
4. DE Z. ~334 „U_n ≤ A ≤ O_n“ → „Dann liegt das Integral immer dazwischen … (für f ≥ 0 ist das die Fläche).“
5. **Fehler** EN „integral and area are the same even when …“ → „treating the integral and the area as the same even when …“
6. DE Aufgabe 2: „… also mindestens n = 81.“
7. START.sin `[0, 6.28]` → `[0, 6.3]` (Raster 0,05).
8. a > b: nur Anzeige prüfen; wenn einfach, ∫ₐᵇ mit Vorzeichen; sonst im Protokoll begründen.
9. √x bei a < 0: auf Definitionsbereich begrenzen (vorhandenes `clampToDomain` o. ä. nutzen).

## hauptsatz
1. **Fehler** APP_META `fSrc`/`FSrc` feste Kommas („1,5t²“, „37,5“, „0,3x²“, …) erscheinen in EN → zweisprachig `L('…0,5…', '…0.5…')` wie in stammfunktion-grafisch.
2. **Fehler** solar „(6 – 18 Uhr)“ → EN „(6 a.m. – 6 p.m.)“.
3. **Fehler** „Wachstumsfaktor k“ → „Wachstumskonstante k“ / „Growth constant k“.
4. Readout `fn` verrät F(x) bei show=0 (Aufgaben 1, 2, 5) → F-Zeile bei show=0 „?“. Auch das Bild der Ansicht „Berechnen“ im Browser prüfen.
5. Trenner „·“ in `bal`, `riem` → „;“.
6. „Frequenz b“ → „Faktor b (Periode 2π/b)“ / „factor b (period 2π/b)“.
7. lake.note → „In den ersten drei Monaten fließt mehr zu als ab, von Monat 3 bis 9 umgekehrt.“ (am Modell prüfen).

## stammfunktion-grafisch
1. **Fehler** Aufgabe 1 (DE + EN): Link `…&show=0&_hide=1`; im Modus „draw“ F erst nach Aufdecken zeigen (Readouts `fn`, `ivp`).
2. **Fehler** DE Aufgabe 4: Randminimum. Aufgabe „im Zeitraum 0 ≤ t ≤ 10 h“, Lösung „… bei t = 1 h und am Rand t = 10 h (je 55/3 m³)“ – V(10) nachrechnen.
3. **Fehler** park.note → „Zwischen 7 und 17 Uhr fahren mehr Autos ein als aus, davor und danach umgekehrt.“ / EN entsprechend (Zeitraum am Modell prüfen).
4. **Fehler** Readout `at` „· F(2) = 0,67“ → „… = Steigung von F an der Stelle 2; F(2) = 0,67“.
5. **Fehler** „Wachstumsfaktor k“ → „Wachstumskonstante k“ / „Growth constant k“.
6. model.ts Sparkonto endet bei −40 €: Bereich so ändern, dass das Konto nicht negativ wird (z. B. [0; 10]), sofern kein Aufgabenlink/Preset davon abhängt; sonst Text anpassen.
7. lift.note: DE/EN einheitlich „die Höhenänderung (abwärts negativ)“.
8. Trenner „·“ in `ivp`, `feat`, `area`, `sit` → „;“.
9. „Frequenz b“ → „Faktor b (Periode 2π/b)“.
10. EN „terrace point“ (falls vorhanden) → „saddle point“.

## matrix-abbildungen
1. **Fehler** Z. ~2437 prod: „A·B = …; B·A = …; also A·B ≠ B·A“.
2. **Fehler** EN „the largest eigenvalue decides …“ → „the eigenvalue of largest absolute value“.
3. **Fehler** EN „Rotations have complex eigenvalues.“ → „Rotations by φ ≠ 0°, 180° have non-real eigenvalues.“
4. Trenner „·“ in `det`, `eig`, `lim` → „;“.
5. DE Ausprobieren 4 „g · h“ → „Grundseite · Höhe des Parallelogramms“.
6. Rückfrage: Überschreibt `ex=market` im Link den Wert `n=2` (Aufgabe 6)? Im Browser prüfen, Link ggf. anpassen.
