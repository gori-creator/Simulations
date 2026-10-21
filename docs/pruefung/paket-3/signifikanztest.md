# Prüfprotokoll: `signifikanztest` – Einseitiger Signifikanztest: Fehler 1. und 2. Art

Prüfer: Paket 3, Befunde B (Paket 4) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: simshot 1360 hell/dunkel, 390, EN, alle Aufgabenlinks

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-4.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. Aufgabe 1 (B(20; 0,5)): P(X ≥ 15) = (15 504 + 4845 + 1140 + 190 + 20 + 1)/2²⁰ = 21 700/1 048 576 = 0,0207 ≤ 0,05 ✓; Ā = {15; …; 20}.
  2. Start (n = 50, p₀ = 0,6): Anzeige „P(X ≥ 37) ≈ 0,0280 ≤ 0,05, P(X ≥ 36) ≈ 0,0540“ passt zum Lernmaterial ✓; x = 38 ∈ Ā ⇒ Ablehnung ✓.
  3. Ausprobieren 5: p₁ = 0,68, n = 50 ⇒ Anzeige β ≈ 77,3 %, Macht ≈ 22,7 % (Summe 100 %) ✓.
- **Neue/ergänzte Tests:** keine (keine Rechenlogik geändert).

## 2. Aufgaben und Texte (DE und EN)
- **Fehldeutung von α (behoben):** DE Aufgabe 3, Lösung: „ein Irrtum hat höchstens etwa 3,4 % Wahrscheinlichkeit“ ⇒ „bewiesen ist das nicht. Wäre der Würfel in Ordnung, würde der Test nur mit höchstens etwa 3,4 % Wahrscheinlichkeit so entscheiden.“ Material (DE/EN) und Anzeige nach ähnlichen Formulierungen durchsucht: nur der Fachbegriff „tatsächliche Irrtumswahrscheinlichkeit“ (= P(Fehler 1. Art) bei p = p₀) kommt vor, er ist korrekt und bleibt.
- **Aufgabenlinks (behoben):** DE Aufgabe 2 / EN Task 2 ohne `info=0` zeigten β in Bild und Tafel ⇒ `info=0` ergänzt. DE Aufgabe 5 jetzt `?alpha=1&info=0&_hide=1` (vorher Ablehnungsbereich und β sichtbar). Schlüssel `info` vorhanden (Schalter „Ablehnungsbereich und Wahrscheinlichkeiten im Bild“). Bild geprüft: Grenze „X ≥ ?“, Tafel „?“, Gütefunktion „?“.
- **Texte:** „liegt immer unter α“ ⇒ „ist nie größer als α“; Ideen „α* ≈ 2,8 %“ erklärt („etwa in 2,8 % der Fälle (tatsächliche Irrtumswahrscheinlichkeit α*) fälschlich ablehnt“); Prüfvermerk zur Gütefunktion ⇒ „Die Gütefunktion kann als Ausblick dienen.“; Ausprobieren 5 ⇒ „Stelle p₁ = 0,68 ein und vergleiche die Macht bei n = 50 und n = 200.“ mit zwei Links (`?p1=0.68` und der bisherige `?n=200&x=135&p1=0.68`).

## 3. Geräte
- 1360 hell/dunkel, 390 px (auch Aufgabe 5), EN: keine Überlappung, kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Keine Änderung in diesem Durchgang.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/content/simulations/de/signifikanztest.md` | Lösung A3 (α richtig gedeutet), Links A2/A5 mit `info=0`, „nie größer als α“, α*-Erklärung, Gütefunktion-Satz, Ausprobieren 5 |
| `src/content/simulations/en/signifikanztest.md` | Task 2 mit `info=0` |

## 6. Für den Kern
- nichts

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0; Tests 3374/3376 – die zwei Fehlschläge sind Zeitüberschreitungen (5 s) in `tests/grenzverhalten.test.ts` auf dem ausgelasteten Rechner, unabhängig von diesem Durchgang (Datei und Simulation unverändert); alle Tests dieser Simulation grün; Build ok (396 Seiten).
