# Prüfprotokoll: `kugeln` – Kugeln, Geraden und Ebenen

Prüfer: Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-2.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung · Datum: 21.10.2026 · Stand: Commit `0ed8bd9`, darauf dieser Durchgang (Zweig `befunde-b-2`) · Bogen: Screenshots im Scratchpad (`befb2/`, außerhalb des Repos)

## Ergebnis
korrigiert (Trenner in den Ergebnissen, Vektorpfeile, √-Schreibweise, „=“/„≈“, EN-Begriff für die Passante, Aufgabe 1)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. *(selbst)* Tangentialebene, $M(1 \mid 2 \mid 3)$, $B(3 \mid 4 \mid 4)$: $\vec n = \vec b - \vec m = (2, 2, 1)$, $\vec n \cdot \vec b = 6 + 8 + 4 = 18$ → $T: 2x_1 + 2x_2 + x_3 = 18$ ✓.
  2. *(selbst)* Ebene $x_1 + x_2 + x_3 = 8$: $d = |6 - 8| / \sqrt3 \approx 1{,}15$, $\rho = \sqrt{9 - 4/3} \approx 2{,}77$ ✓ (Anzeige jetzt „/ √3 ≈ 1,15“, „≈ 2,77“).
  3. *(selbst)* Gerade $(5, 2, 0) + t \cdot (0, 0, 1)$: $16 + 0 + (t - 3)^2 = 9 \iff t^2 - 6t + 16 = 0$, $D = 36 - 64 = -28$, Abstand $4 > 3$ ✓.
  4. Ebene $x_3 = 5$: $d = 2$, $\rho = \sqrt5 \approx 2{,}24$ (Befundliste) ✓.
- **Rundung:** „=“ nur bei exakten Werten (Viertelraster wie in der Karte), sonst „≈“ – jetzt auch bei $d$ und $\rho$ in Ergebnis und Karte.
- **Begriffe:** EN „passing line“ ist nicht üblich → „line that misses the sphere“ (in der Karte kurz „line misses K“).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgabe 1:** Die Kugelgleichung steht im Aufgabenmodus in Karte und Ergebnisliste. Entscheidung: Auftrag umformuliert („Stelle zuerst selbst die Kugelgleichung auf (die Simulation zeigt sie zur Kontrolle) und prüfe dann …“) statt `spoiler`, weil die Karte die Gleichung auch bei verdeckten Ergebnissen zeigt und sie in den anderen Aufgaben Angabe ist.
- **EN:** „passing line“ an drei Stellen ersetzt.

## 3. Geräte (Prüfbogen)
- **1360 px hell/dunkel, 390 px hell/dunkel, Tangentialebene, Sekante, Passante (EN), Ebene mit √3, Aufgabe 1:** keine Überlappungen, kein Überlauf.
- Der kombinierende Pfeil U+20D7 wurde in Chromium als Kästchen gezeichnet (Karte und Ergebnisliste) → in der Karte gezeichnete Pfeile, in der Ergebnisliste ein HTML-Pfeil über dem Buchstaben.
- Die lange EN-Lageangabe überdeckte die Beschriftung „Position“ → gekürzt.

## 4. Barrierefreiheit
- Pfeil in der Ergebnisliste `aria-hidden`, der Bildschirmleser liest „n = b − m“. Sonst unverändert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/kugeln/index.ts` | Rechnung Tangentialebene „n⃗ = b⃗ − m⃗ = (…); n⃗ · b⃗ = 18“ (HTML-Pfeile `vecH`); Gerade „… = 0; D = …“; Ebene „/ √3“ über `normText` (auch Karte); „=“/„≈“ bei d und ρ; Karte „Normalenvektor MB⃗ = b⃗ − m⃗“ mit gezeichneten Pfeilen (`rowVec`); EN-Begriffe |
| `src/content/simulations/de/kugeln.md` | Aufgabe 1 umformuliert |
| `src/content/simulations/en/kugeln.md` | „passing line“ → „line that misses the sphere“ |

Alle Ergebnisse auf „ · “ als Trenner durchgesehen: nur die beiden genannten Stellen; sonst steht „·“ nur als Malpunkt (Skalarprodukt, $t \cdot \vec u$).

## 6. Für den Kern (nicht selbst ändern)
- Ein gemeinsamer Helfer für Vektorpfeile im Canvas und in Ergebnissen wäre nützlich (U+20D7 ist in Systemschriften unzuverlässig; `feldlinien` nutzt ihn ebenfalls).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
