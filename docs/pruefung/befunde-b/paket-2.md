# Paket 2: aenderungsrate, kugeln, baumdiagramm, extremwertprobleme, funktionsplotter

## aenderungsrate
1. DE Z. ~86: „verläuft stückweise linear (als Streckenzug) durch …“
2. Ergebnisliste: „± 0“ vermeiden – beim Wert 0 nur „0“.
3. Readout `sum`: „=“ statt „≈“, wenn exakt (wie in der Karte, `eq(sum, 2)`).
4. DE: einheitlich „Jahrgangsstufe 13“ (statt „13. Klasse“).
5. model.ts `signedAreas`: `s.abs(Math.min(t, s.T))` wie bei `distance`; Test ergänzen.
6. EN: Aufgabennummern prüfen (DE-Aufgabe 6 heißt in EN „Task 5“ – in Ordnung, wenn EN gekürzt ist; nur sicherstellen, dass EN-Verweise auf Nummern stimmen).

## kugeln
1. **Fehler** Readout Tangentialebene: „·“ als Trenner wirkt wie Produkt. `n⃗ = b⃗ − m⃗ = (…); n⃗ · b⃗ = 18` bzw. Trenner „;“.
2. **Fehler** Readout Gerade: „t² − 16t + 55 = 0 · D = 36“ → Trenner „;“. Alle Readouts der Sim auf „ · “ als Trenner durchsehen.
3. Readout Ebene: „/ 1,73“ → wie im Bild „√3“ (gleiche Helfer-Funktion nutzen).
4. Readout ρ: „=“ wenn exakt, sonst „≈“.
5. Aufgabe 1 „Gib die Kugelgleichung an“: Gleichung ist im Aufgabenmodus sichtbar → `spoiler: true` für das Readout oder Auftrag umformulieren.
6. „Normalenvektor B − M“ → „Normalenvektor MB⃗ = b⃗ − m⃗“.
7. EN „passing line“ für Passante: prüfen; üblich ist „non-intersecting line“ oder „line that misses the sphere“ → „line missing the sphere (passant)“ – kurz und klar wählen.

## baumdiagramm
1. **Fehler** Z. ~966: „1 Pfad gehören“ → „1 Pfad gehört / n Pfade gehören“, EN „1 path belongs / n paths belong“.
2. DE Link Aufgabe 4 (Z. ~82): `&show=0&_hide=1` ergänzen (Param `show` prüfen).
3. DE Z. ~43: „mit 2 roten Kugeln und einer blauen Kugel“.
4. DE Z. ~98: „8/30 = 4/15“.
5. Readout `ev`, das nur „0“ zeigt: mit Kontext „P(…) = 0“.

## extremwertprobleme
1. **Fehler** META.rect `ux: 'LE', uz: 'FE'` auch in EN → zweisprachig („units“ / „square units“); alle Einheiten der Sim prüfen.
2. „Optimum ist {pct} % davon“ → „Das Optimum beträgt {pct} % des aktuellen Werts.“ (Bezug im Code prüfen, ggf. umgekehrt).
3. DE Z. ~59: „Eine Ecke liegt im Ursprung, die gegenüberliegende Ecke P(u ∣ f(u)) …“
4. „V(0) = V(10) = 0“ bei D = ]0; 10[: „V(x) → 0 für x → 0 und x → 10“ (DE und Bild).
5. EN „where he enters the water“ → „where the lifeguard enters the water“.

## funktionsplotter
1. DE Z. ~22: Potenzen rechtsassoziativ: „… nur Potenztürme werden von oben nach unten gerechnet: 2^3^2 = 2⁹.“ (Parser prüfen!)
2. DE Tabelle Z. ~18: Bedeutung bei exp(x) ergänzen.
3. DE Links Aufgabe 3 und 6: `&_hide=1` ergänzen.
4. EN `cross`: Bezeichnung „S“ wie DE (oder „P“) ergänzen.
5. `e_mismatch`: „… – die Klammern passen nicht zusammen.“ (Meldung genauer, falls passend).
6. 0^0 = 1: so lassen (JS-Konvention), im DE-Material ggf. Hinweis „0^0 wird als 1 gerechnet“. Nur ergänzen, wenn es eine Stolperstein-Liste gibt.
