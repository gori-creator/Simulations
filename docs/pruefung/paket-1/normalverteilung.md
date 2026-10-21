# Prüfprotokoll: `normalverteilung` – Normalverteilung

Prüfer: Paket 1 (Befunde B) · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` · Bogen: `scratchpad/shots/n-*.png` (außerhalb des Repos)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-3.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert (Φ für jede Normalverteilung statt F; Aufgabe 5 verriet n = 101; „k + 0,5“ fest mit Komma; „stauchen mit σ“).

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. IQ 115 bis 130: z₁ = 15/15 = 1, z₂ = 30/15 = 2 → F(130) − F(115) = Φ(2) − Φ(1) = 0,9772 − 0,8413 = 0,1359 ≈ 13,6 % ✓ (Karte und Ergebnis).
  2. P(X ≤ 130) = F(130) = Φ(2,00) ≈ 0,9772 ✓.
  3. Aufgabe 5: σ² = 0,09 n > 9 ⇔ n > 100 → ab n = 101; bei n = 20: σ = √1,8 ≈ 1,342, z = (1,5 − 2)/1,342 ≈ −0,37 ✓ (Bild).
  4. Binomial n = 100, p = 0,5, k = 55: Φ((55,5 − 50)/5) = Φ(1,1) ≈ 0,8643, exakt 0,8644 ✓.
- **Bezeichnungen:** Die Verteilungsfunktion von N(μ; σ²) heißt jetzt F, Φ nur für N(0; 1): Karte „P(X ≤ b) = F(b) = Φ(z)“, „1 − F(a)“, „F(b) − F(a)“; Ergebnis „P(X ≤ 130) = F(130) = Φ(2)“; Diagramm „Verteilungsfunktion F(x) = P(X ≤ x)“ mit Marken F(a), F(b), nach „Standardisieren“ Φ(z₁), Φ(z₂) (bei einer Grenze Φ(z)); Schaltername „Verteilungsfunktion F zeigen“ (Key `cdf` unverändert); Hinweis „im Diagramm der Verteilungsfunktion wächst F(b) − F(a)“.
- **Dezimalkomma:** „k + 0,5“ im Bild und in der Karte über `fmt.num(0.5, 1)` (EN „0.5“).
- **Standardisieren:** „mit dem Faktor 1/σ strecken bzw. stauchen“ (Karte, Hilfetext, DE/EN-Lernmaterial).
- **Neue/ergänzte Tests:** keine (Rechenlogik unverändert).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgabe 5:** Link jetzt `?mode=binom&bn=20&bp=0.1&bk=1&show=0&_hide=1` (Key `show` geprüft); in der Karte „erst ab n = ? ist σ > 3“. Zusätzlich wird im Aufgabenmodus der schattierte Bereich „σ > 3“ im Fehlerdiagramm ausgeblendet, weil er bei n ≈ 100 beginnt und die Lösung zeigt.
- **Einführung DE:** „F(x) = P(X ≤ x) … F(b) − F(a) … Für N(0; 1) heißt sie Φ; F(x) = Φ((x − μ)/σ), z. B. P(X ≤ 130) = F(130) = Φ(2,00)“; EN entsprechend. Ausprobieren 1 und Unterrichtsideen auf F umgestellt; Lösungen mit Φ(z) bleiben (Argument ist z).
- **„Beispiel laden“ geklickt:** Start, IQ zwischen 115 und 130 (mit und ohne Standardisieren), IQ ≤ / ≥ 130, Binomial n = 100, Aufgabe 5, englische Seite ✓.

## 3. Geräte
- **1360 px hell/dunkel, 390 px:** Die neue, längere Zeile „Verschieben um μ, mit dem Faktor 1/σ strecken bzw. stauchen“ wurde rechts abgeschnitten → auf zwei Zeilen verteilt, erneut geprüft. Kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Unverändert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/normalverteilung/index.ts` | F statt Φ für N(μ; σ²) in Karte, Ergebnis, Diagramm, Hinweis, Schaltername; nMin mit `Q()`, Bereich σ > 3 im Aufgabenmodus aus; `fmt.num(0.5, 1)`; Standardisieren-Text zweizeilig, Hilfetext |
| `src/content/simulations/de/normalverteilung.md` | F/Φ-Erklärung, Faktor 1/σ, Aufgabe 5 mit `show=0`, Ausprobieren 1, Ideen |
| `src/content/simulations/en/normalverteilung.md` | F/Φ, Faktor 1/σ, Ideen |

## 6. Für den Kern (nicht selbst ändern)
–

## 7. Entscheidungen
- **Bereich „σ > 3“ im Aufgabenmodus ausgeblendet:** über den Befund hinaus, weil er die Lösung von Aufgabe 5 grafisch zeigt.
- **Φ(z₁), Φ(z₂) im standardisierten Diagramm:** Nach dem Standardisieren ist die Achse z, deshalb wäre „Φ(b)“ (b = 130) falsch.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3371/3371 grün (148 Dateien), Build ok.
