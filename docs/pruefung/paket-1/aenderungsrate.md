# Prüfprotokoll: `aenderungsrate` – Integral als Gesamtänderung

Prüfer: Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-2.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung · Datum: 21.10.2026 · Stand: Commit `0ed8bd9`, darauf dieser Durchgang (Zweig `befunde-b-2`) · Bogen: Screenshots im Scratchpad (`befb2/`, außerhalb des Repos)

## Ergebnis
korrigiert (Ergebnisliste ohne „± 0“, „=“ bei exakter Rechtecksumme, `signedAreas` nur bis T, Texte DE)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. *(selbst)* Tank, $t = 20$, $n = 4$, linker Rand: $\Delta t = 5$, Höhen $4, 3, 2, 1$ → $S_4 = 5 \cdot 10 = 50$ L; exakt $4 \cdot 20 - 0{,}1 \cdot 400 = 40$ L → Fehler $+10$ L. Anzeige „S₄ (linker Rand) = 50 L; Fehler +10 L“ ✓.
  2. *(selbst)* Auto, $t = 10$, $n = 2$, Mitte: $5 \cdot (5 + 15) = 100$ m = exakt $10^2$ m → Anzeige „S₂ (Mitte) = 100 m; Fehler 0 m“ (vorher „≈“ und „±0“) ✓.
  3. *(selbst)* Tank $t = 30$, $V(0) = 30$ L: $+40$ L und $-10$ L, $\int_0^{30} |r| = 50$ L, $V(30) = 60$ L ✓ (Anzeige EN „50 L“, „60 L“).
  4. Aufgabe 4 (aus der Befundliste übernommen): $60 - 30 = 30$ m, Wegzähler $90$ m ✓.
- **Sonderfälle:** $t = 0$: „Δs = 0 m“, „0 m + 0 m = 0 m“, „Fehler 0 m“ – kein „± 0“ mehr. `signedAreas` rechnete für $t > T$ mit ungeklemmtem `change(t)`/`abs(t)` (Tank, $t = 50$: $-90$ L statt $-40$ L) → jetzt wie `distance` mit $\min(t, T)$.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** echtes „−“, Dezimalkomma über `fmt.num` ✓.
- **Begriffe wie im Unterricht:** Änderungsrate, Bestand, Gesamtänderung, Rechtecksumme ✓.
- **Neue/ergänzte Tests:** `tests/aenderungsrate.test.ts`: Flächenanteile zu Aufgabe 3 ($+40$/$-10$ L), keine Zählung hinter $T$ (Tank $t = 50$, Rangieren $t = 99$), pos − neg = `distance`.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben:** Lösungen laut Befundliste korrekt; Aufgabe 6 („Aufgabe laden“) geladen, Ergebnisse verdeckt ✓.
- **EN-Nummern:** EN ist gekürzt (DE-Aufgabe 6 = EN „Task 5“). EN enthält keine Verweise auf Aufgabennummern → nichts zu ändern.
- **Texte korrigiert:** DE Aufgabe 6 „verläuft stückweise linear (als Streckenzug) durch …“; Beschreibung „für die Jahrgangsstufe 13“ statt „13. Klasse“.

## 3. Geräte (Prüfbogen)
- **1360 px hell/dunkel, 390 px, Aktionszustände (Mitte, Tank n = 4, t = 0, Aufgabe 6, EN dunkel):** keine Überlappungen, kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Unverändert; Ergebnisse stehen als Text in der Liste, Farben aus `ctx.theme`.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/aenderungsrate/index.ts` | Helfer `Sr`: Wert 0 nur als „0“; Rechtecksumme mit `eq(sum, 2)`; Trenner „;“ statt „·“ vor „Fehler“; Bestand „+ 0“ statt „± 0“ |
| `src/simulations/mathematik/aenderungsrate/model.ts` | `signedAreas` klemmt `t` auf `T` |
| `src/content/simulations/de/aenderungsrate.md` | Streckenzug-Formulierung, „Jahrgangsstufe 13“ |
| `tests/aenderungsrate.test.ts` | neuer Test zu `signedAreas` |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
