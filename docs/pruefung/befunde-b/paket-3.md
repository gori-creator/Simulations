# Paket 3: taylor-polynome, fourier-reihen, rotationskoerper, normalverteilung, lage-abstaende

## taylor-polynome
1. **Fehler** Z. ~1925: „Bei sin x um 0 sind alle geraden Ableitungen 0“ erscheint bei jedem Tₙ = Tₙ₋₁. Nur bei sin und a = 0 zeigen; bei cos um 0: „Bei cos x um 0 sind alle ungeraden Ableitungen 0.“; sonst allgemeine Formulierung („Die n-te Ableitung ist an der Stelle a gleich 0.“).
2. **Fehler** Z. ~1125/1884/1894 „< 0,01“ fest mit Komma → `fmt.num(0.01, 2)`.
3. **Fehler** DE/EN „Wie viele Summanden …? – n = 9“: T₉ hat 10 Summanden → „Also Grad n = 9, das sind 10 Summanden“ / „degree n = 9, i.e. 10 terms“.
4. Z. ~1912 „Partialsummen 1, 2, 3, …“ → „wachsen über alle Grenzen (bei a = 0: 1, 2, 3, …)“.
5. model.ts Z. ~265 Kommentar „φ ≈ 0,2444“ → „φ ≈ 0,2441 ≈ 14,0°“ (nachrechnen).
6. Z. ~2008 „φ = 20° ≈ 0,3491“ → „… ≈ 0,3491 rad“.

## fourier-reihen
1. **Fehler** Z. ~1853 „exakt ab N = 8“ fest → höchstes k mit cₖ ≠ 0 berechnen.
2. **Fehler** Z. ~664 „nur cos-Glieder“ (Puls) nur bei φ = 0.
3. **Fehler** EN Z. ~60 „first harmonic“ für k = 2 → „second harmonic (first overtone, k = 2)“.
4. Z. ~269/152: „Rechteck mit 3 Teilschwingungen“ → „Rechteck bis k = 3“; Regler „Höchste Ordnung N“ / „Highest order N“ (nur Label, Key bleibt).
5. DE Z. ~17: „Fejér beseitigt das Überschwingen, Lanczos verringert es stark.“
6. Z. ~2052 „f(x − 90°)“ → „f(x − π/2)“.
7. Z. ~275 „ungerade Obertöne“ → „ungeradzahlige Teiltöne (k = 1, 3, 5, …)“ / „odd harmonics“.
8. Z. ~190 „w = 100 % das Dreieck“ → „ein (um 90° verschobenes) Dreieck“ (nachprüfen).
9. DE Z. ~11: „… Oberschwingungen; alle zusammen heißen Harmonische.“
10. Z. ~2046 „1 sin x“ → Koeffizient 1 weglassen.
11. Lanczos-Konvention sinc(πk/(N+1)): so lassen, im Code-Kommentar begründen, falls nicht schon.

## rotationskoerper
1. **Fehler** DE Z. ~46: Griff ändert nur m. Auftrag: Link `?fn=kegel&m=0.5&a=0&b=4` (Keys prüfen) und „Ziehe, bis m doppelt so groß ist …“.
2. Z. ~393 `N(v, 3)` für m²/k² → genug Stellen (0,0025 statt 0,003).
3. „kleinster Wert (innen)“ → „kleinster Radius (innen)“, „größter Radius (außen)“; DE Z. ~25 analog (|f(x)|).

## normalverteilung
1. **Fehler** Φ doppeldeutig: für N(μ; σ²) `F` verwenden, Φ nur für N(0; 1): Readouts Z. ~1311/1314/1326/902 und DE Z. ~13 (EN Z. ~7): „F(x) = P(X ≤ x) … F(b) − F(a); für N(0; 1) heißt sie Φ.“ So entsteht „P(X ≤ 130) = F(130) = Φ(2,00)“.
2. **Fehler** DE Aufgabe 5: Link mit `&show=0` (Key prüfen) und `nMin` in der Karte mit `Q()` verdecken.
3. **Fehler** Z. ~1609/1151 „k + 0,5“ fest mit Komma → `fmt.num(0.5, 1)`.
4. Z. ~1348 / DE Z. ~17 „stauchen mit σ“ → „mit dem Faktor 1/σ strecken bzw. stauchen“.

## lage-abstaende
1. Z. ~1407 „+ −2 · t“ → Vorzeichen wie Z. ~1294 (es gibt dafür vermutlich schon einen Helfer, z. B. `dotTerms`/`signed`).
2. DE Z. ~41/42: Schnittpunkte außerhalb des Bildes: „… liegt außerhalb des Bildes – lies ihn in den Ergebnissen ab.“
