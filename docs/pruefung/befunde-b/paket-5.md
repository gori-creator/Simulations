# Paket 5: umkehrfunktion, vektoren-3d, geraden-ebenen, funktionenscharen

## umkehrfunktion
1. **Fehler** Z. ~1623: bei show=0 alle Zeilen der Umkehrfunktion verdecken (`S(inv)` für alle), nicht nur die gewählte (Aufgabe 3, `dom=all&show=0`).
2. **Fehler** Z. ~1650/1659/1680: Steigung m, (f⁻¹)′ und Δx/Δy bei show=0 verdecken (Aufgabe 5).
3. **Fehler** Z. ~1656/1678: Bei show=0 „f′(0) = ?“, Hinweise „senkrechte Tangente“ / „Division durch 0“ ausblenden (Aufgabe 6).
4. Z. ~1588 „Die Äste haben verschiedene Vorzeichen.“ → „Auf dem linken Ast sind alle Funktionswerte negativ, auf dem rechten positiv.“ (EN entsprechend; Inhalt im Code prüfen).
5. EN „D_{f⁻¹} = W_f“ → EN „R_f“ (range), im EN-Material erklären.

## vektoren-3d
1. **Fehler** Z. ~1468 Einheitsvektor-Zeile bei show=0 verdecken („1/?“, „?“) (Aufgabe 4).
2. **Fehler** DE Aufgabe 3: Link `…&show=0&_hide=1`; Hinweis Z. ~1169 „c liegt nicht in der Ebene – unmöglich“ bei !show ersetzen durch „Liegt c in der Ebene von a und b?“.
3. DE Z. ~49 „Zur Kontrolle: …|(2 | 3 | 6)| = 7“ passt nicht zur Aufgabe → ersetzen durch „|a + b| = √27 ≈ 5,20 < |a| + |b| ≈ 7,79“ (nachrechnen!).

## geraden-ebenen
1. DE Z. ~15 / EN Z. ~9: „Ist z. B. u₃ = 0, verläuft g parallel zur x₁x₂-Ebene oder liegt in ihr.“

## funktionenscharen
1. **Fehler** Z. ~1662 (und model.ts ~221) „Die Kurven sind gegeneinander verschoben.“ → „Zwei Scharkurven unterscheiden sich überall um (k₂ − k₁) · eˣ ≠ 0.“ / „Two members always differ by (k₂ − k₁) · eˣ ≠ 0.“ – vorher am Term der Schar prüfen.
2. **Fehler** EN „terrace point“ → „saddle point“ (Z. ~115, ~333, EN-Material Z. ~7). Gilt auch für stammfunktion-grafisch (Paket 6) – dort macht es der andere Helfer.
3. EN-Kürzel H/T/TP/W/E → Max/Min/SP/I (nur EN).
4. Z. ~1933 „Extrempunkte: Terrassenpunkt (0 | 0)“ → „Extrempunkte: keine (Terrassenpunkt (0 | 0))“ / EN entsprechend.
5. EN „k ∈ [−3; 3]“ → „[−3, 3]“.
