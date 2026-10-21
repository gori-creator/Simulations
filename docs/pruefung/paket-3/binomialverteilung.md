# Prüfprotokoll: `binomialverteilung` – Binomialverteilung

Prüfer: Paket 3, Befunde B (Paket 4) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: simshot 1360 hell/dunkel, 390, EN, alle Aufgabenlinks

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-4.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. B(10; 0,5), a = 0, b = 4: F(4) = (1 + 10 + 45 + 120 + 210)/1024 = 386/1024 = 0,37695 ⇒ Anzeige „F(4) − F(−1) ≈ 0,3770“ und „= 0,3770 − 0“ ✓.
  2. σ-Umgebung bei B(10; 0,5): P(4 ≤ X ≤ 6) = (210 + 252 + 210)/1024 = 672/1024 = 65,63 % ✓ (Anzeige „≈ 65,63 %“).
  3. Aufgabe 4: μ = 100 · 0,5 = 50, σ = √25 = 5, [40; 60] ist die 2σ-Umgebung ✓.
- **Sonderfälle:** k = 0 bei „mindestens“ (P(X ≥ 0) = 1 − F(−1) = 1) und a = 0 bei „zwischen“ geprüft (Bild, Karte, Treppenfunktion).
- **Vorzeichen:** **Behoben:** In der Karte und an der Treppenfunktion stand bei a = 0 bzw. k = 0 „F(-1)“ mit ASCII-Minus (`F(${s.a - 1})`, `1 − F(${s.k - 1})`). Jetzt über `fmt.num(…, 0)` (echtes „−“) an allen vier Stellen.
- **Neue/ergänzte Tests:** keine (nur Anzeige, keine Rechenlogik geändert).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgabenlinks:** alle 5 DE- und 3 EN-Links geladen; Ergebnisse verdeckt. **Behoben:** DE Aufgabe 4 / EN Task 2 zeigten die σ-Umgebungen mit „μ ± 2σ“ und damit die Antwort auf „Welche Umgebung ist das?“ ⇒ Link um `sig=0` ergänzt (Schlüssel `sig` vorhanden, Schalter „Erwartungswert μ und σ-Umgebungen“). Bild geprüft: kein Band, keine Beschriftung.
- **Texte:** EN-Hinweis „At least 0 successes always happens.“ ⇒ „There are always at least 0 successes.“; DE „etwa 70 %“ ⇒ „rund 68 %“ (σ-Umgebung); Ideen: Satzteil „die genaue Zuordnung zur Jahrgangsstufe bitte am Lehrplan prüfen“ gestrichen (Entscheidung der Projektleitung).

## 3. Geräte
- 1360 hell/dunkel, 390 px, EN: keine Überlappung, kein Überlauf, keine Konsolenfehler (simshot).

## 4. Barrierefreiheit
- Keine Änderung an Bewegung, Farben oder Bedienelementen in diesem Durchgang.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/binomialverteilung/index.ts` | F(−1) mit echtem Minus; EN-Hinweis „There are always at least 0 successes.“ |
| `src/content/simulations/de/binomialverteilung.md` | Aufgabe 4 mit `sig=0`; „rund 68 %“; Lehrplan-Satzteil gestrichen |
| `src/content/simulations/en/binomialverteilung.md` | Task 2 mit `sig=0` |

## 6. Für den Kern
- nichts

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0; Tests 3374/3376 – die zwei Fehlschläge sind Zeitüberschreitungen (5 s) in `tests/grenzverhalten.test.ts` auf dem ausgelasteten Rechner, unabhängig von diesem Durchgang (Datei und Simulation unverändert); alle Tests dieser Simulation grün; Build ok (396 Seiten).
