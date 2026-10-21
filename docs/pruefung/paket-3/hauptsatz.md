# Prüfprotokoll: `hauptsatz` – Integralfunktion und Hauptsatz

Prüfer: Paket 3 (Befunde Abschnitt B, Paket 6) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: Scratchpad `shots/hs/`

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-6.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. ∫₋₁² (0,5x² − 1) dx = [x³/6 − x] = (4/3 − 2) − (−1/6 + 1) = −0,667 − 0,833 = −1,5 ✓ (Ergebnis „Integral“).
  2. Auto: 0,5 · 5 · 15 + 15 · 15 + 0,5 · 5 · 15 = 37,5 + 225 + 37,5 = 300 m ✓.
  3. Solaranlage 6–18 Uhr: E = 48/π · (1 − cos π) = 96/π ≈ 30,56 kWh ✓.
  4. Grenzkosten: K_v(10) = 100 − 150 + 100 = 50 GE ✓.
  5. Stausee q(t) = 3 cos(πt/6): q > 0 für 0 ≤ t < 3, q < 0 für 3 < t < 9, q > 0 für 9 < t ≤ 12 ⇒ neuer Hinweistext stimmt; V maximal bei t = 3.
- **Begriffe:** „Wachstumskonstante k“ / „growth constant k“; „Faktor b (Periode 2π/b)“ / „factor b (period 2π/b)“.
- **Einheiten/Trenner:** `bal`, `riem` (und gleichartig `feat`) mit „;“ statt „·“.
- **Tests:** Rechenlogik unverändert, keine neuen Tests nötig.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgabenlinks (show=0, _hide=1) geladen:** DE 1–6, EN 1–3. Neu: Die Stammfunktion steht bei „Werte zeigen“ aus als „F(x) = ?“ (bzw. „s(t) = ?“, „K_v(x) = ?“) – in der Ergebnisliste (`fn`), in der Karte „Funktion und Stammfunktion“, im Rechenweg (Ansicht „Berechnen“, Schritt ①) und in der Pille über dem F-Graphen. Im Bild „Berechnen“ geprüft: keine Lösung sichtbar; die Kurvenschar F + C bleibt als Werkzeug sichtbar.
- **Texte:** APP_META `fSrc`/`FSrc` zweisprachig (EN mit Dezimalpunkt, z. B. „1.5t²“, „37.5“, „0.3x²“); Solar EN „(6 a.m. – 6 p.m.)“; Stausee-Hinweis DE/EN „In den ersten drei Monaten fließt mehr zu als ab, von Monat 3 bis 9 umgekehrt, danach wieder mehr zu.“ (Zusatz „danach wieder mehr zu“ nach dem Modell, Monat 9–12).

## 3. Geräte
- 1360 hell/dunkel, 390, EN 1360/390 dunkel: kein Überlauf, keine Konsolenfehler. Am Handy überdecken die Achsentitel „v in m/s“/„s in m“ die Funktionspillen teilweise (Bestand, unkritisch).

## 4. Barrierefreiheit
- Keine Änderung nötig.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/hauptsatz/index.ts` | `fSrc`/`FSrc` als `L(…)`; Solar EN; Wachstumskonstante; Faktor b (Periode); Stausee-Hinweis; F bei show=0 „?“ (Ergebnis, Karten, Rechenweg, Pille); Trenner „;“ |

## 6. Für den Kern
– 

## 7. Rückfragen
- Der Graph der Integralfunktion bzw. der Schar F + C bleibt bei show=0 sichtbar; grobe Werte lassen sich ablesen (gewollt als Werkzeug, wie in anderen Sims).

## Prüfung
`npm run verify`: astro check 0/0/0, Tests grün, Build ok.
