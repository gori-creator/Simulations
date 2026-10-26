# Prüfprotokoll: `ober-untersummen` – Integral als Flächenbilanz (Rechtecksummen)

Prüfer: Paket 3 (Befunde Abschnitt B, Paket 6) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: Scratchpad `shots/ou/`

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-6.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. f(x) = 0,5x³ − 2x auf [−2; 3], n = 1: f′(x) = 1,5x² − 2 = 0 ⇒ x = √(4/3) ≈ 1,1547; f(1,1547) = 0,7698 − 2,3094 = −1,5396 (genau −8/(3√3)). Ränder f(−2) = 0, f(3) = 7,5 ⇒ U₁ = 5 · (−1,5396) = −7,6980, O₁ = 5 · 7,5 = 37,5 ✓ (Bild: „U₁ ≈ −7,698; O₁ ≈ 37,5“).
  2. Aufgabe 1: Δx = 0,5; U₄ = 0,5 · (0 + 0,25 + 1 + 2,25) = 1,75; O₄ = 0,5 · (0,25 + 1 + 2,25 + 4) = 3,75; Differenz 2 ✓.
  3. √x auf [0; 4] (Link mit a = −2): ∫ = ⅔ · 4^1,5 = 16/3 ≈ 5,3333 ✓.
  4. a = 2, b = 0: ∫₂⁰ x² dx = −8/3 ≈ −2,6667 ✓.
- **Sonderfälle:** a > b: Summen über [min; max], das Integral jetzt mit Vorzeichen („∫₂⁰ … = −∫₀² … ≈ −2,6667“). √x mit a < 0: Grenzen werden auf den Definitionsbereich begrenzt (Rechnung, Grenzlinien, Griffe; beim Regler wird der Wert auf 0 zurückgesetzt, ein Link mit a = −2 rechnet ab 0).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** über `fmt.num` ✓; Trenner „·“ in der Summenzeile durch „;“ ersetzt: „U₄ ≈ 1,75; O₄ ≈ 3,75; Differenz O₄ − U₄ ≈ 2“.
- **Begriffe:** Unter-/Obersumme, Flächenbilanz ✓.
- **Neue Tests:** `tests/ober-untersummen.test.ts` (9 Tests): U₁ = −7,698 und O₁ = 37,5, Hochpunkt im Streifen, sin-Extremstellen, Scheitel von x², numerische Nachbesserung ohne Extremstellenangabe, Aufgaben 1–3, vertauschte Grenzen, U ≤ ∫ ≤ O für alle Funktionen. Bestehende Tests in `batch2-models.test.ts` unverändert grün.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 siehe oben; A2 8/n < 0,1 ⇔ n > 80, also mindestens n = 81 (ergänzt); A3 F(3) − F(−2) = 1,125 − (−2) = 3,125 ✓.
- **Links geladen:** alle DE-Links und die Aufgabenlinks DE/EN. Aufgabe 1 (`?_hide=1`): Summe, Integral und Tabelle verdeckt („Aufdecken“) ✓. Im Bild sind nur die Rechtecke sichtbar (Werkzeug).
- **Texte:** DE „Dann liegt das Integral immer dazwischen … (für f ≥ 0 ist das die Fläche)“; DE Hinweis zur Berechnung auf exakte Bestimmung angepasst; EN Stolperstein „treating the integral and the area as the same …“.

## 3. Geräte
- 1360 hell/dunkel, 390 hell, EN 1360: kein Überlauf, keine Konsolenfehler. Funktionsetikett oben links jetzt mit Theme-Hintergrund. Am Handy berührt das Etikett „f(x) = x²“ die y-Achsenbeschriftung (unkritisch, Bestand).

## 4. Barrierefreiheit
- Keine Änderung an Bewegung/Tastatur; Farben des Etiketts jetzt aus `ctx.theme` (vorher feste rgba-Werte).

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/ober-untersummen/model.ts` | Extremwerte im Streifen exakt (Ränder + analytische Stellen mit f′ = 0 je Funktion), sonst Abtastung mit Nachiteration (Goldener Schnitt) |
| `src/simulations/mathematik/ober-untersummen/index.ts` | `sum`, `table` als `spoiler`; Trenner „;“; START sin [0; 6,3]; Integral mit Vorzeichen bei a > b; Grenzen auf Definitionsbereich; Etikett-Farbe aus Theme |
| `src/content/simulations/de/ober-untersummen.md` | Integral zwischen U und O, „mindestens n = 81“, Berechnungshinweis |
| `src/content/simulations/en/ober-untersummen.md` | Stolperstein korrigiert |
| `tests/ober-untersummen.test.ts` | neu |

## 6. Für den Kern
– 

## 7. Rückfragen
- Befund 8 (a > b): umgesetzt als Integral mit Vorzeichen; die Summen bleiben bewusst Summen über [min(a, b); max(a, b)], weil Rechtecke mit negativer Breite im Unterricht nicht vorkommen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests grün, Build ok.
