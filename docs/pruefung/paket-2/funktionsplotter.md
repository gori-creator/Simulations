# Prüfprotokoll: `funktionsplotter` – Funktionsplotter mit eigenen Termen

Prüfer: Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-2.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung · Datum: 21.10.2026 · Stand: Commit `0ed8bd9`, darauf dieser Durchgang (Zweig `befunde-b-2`) · Bogen: Screenshots im Scratchpad (`befb2/`, außerhalb des Repos)

## Ergebnis
korrigiert (Rechenregel für Potenztürme, Tabelle, Aufgabenlinks, EN-Schnittpunkte mit „S“, Fehlermeldung, Hinweis zu 0^0)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Parser geprüft:** `exponents()` liest den Exponenten über `unaryPower()` → `power()` → wieder `exponents()`, rechnet also rechtsassoziativ: `2^3^2` = $2^{(3^2)} = 2^9 = 512$ (Test vorhanden in `tests/funktionsplotter.test.ts`). Der DE-Satz „sonst von links nach rechts“ stimmte für Potenzen nicht → ergänzt.
- **Nachgerechnet:**
  1. *(selbst)* `2^3^2 + 0^x` an der Stelle 0: $512 + 0^0 = 513$; die Wertetabelle zeigt 513, für $x > 0$ 512, für $x < 0$ „–“ ✓.
  2. *(selbst)* $2^x = 3 - x$: $x = 1$, $S(1 \mid 2)$; Anzeige DE „S(1 | 2)“, EN jetzt „S(1, 2)“ ✓.
  3. Aufgabe 1: Nullstellen $-1$ und $\frac{1 \pm \sqrt5}{2} \approx -0{,}62;\ 1{,}62$ (Befundliste) ✓.
- **0^0:** bleibt 1 (JS-Konvention); Hinweis in der Stolperstein-Liste ergänzt.

## 2. Aufgaben und Texte (DE und EN)
- DE Tabelle: Bedeutung von `exp(x)` ergänzt.
- DE Aufgabe 3 und 6: `&_hide=1` ergänzt.
- Fehlermeldung `e_mismatch`: „… – die Klammern passen nicht zusammen.“ (EN „… – the brackets do not match.“), geprüft mit `(x+1]`.
- EN-Marke für Schnittpunkte trägt jetzt „S“ wie im Deutschen (P ist der Spurpunkt).

## 3. Geräte (Prüfbogen)
- **1360 px hell/dunkel, 390 px; Aufgabe 2 (DE/EN), 3, 6, Klammerfehler (DE 1360, EN 390 dunkel):** keine Überlappungen, kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Unverändert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/funktionsplotter/index.ts` | EN-Schnittpunkt „S(…)“, `e_mismatch` DE/EN genauer |
| `src/content/simulations/de/funktionsplotter.md` | Potenztürme, `exp(x)`, `_hide=1` bei Aufgabe 3 und 6, Stolperstein 0^0 |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
