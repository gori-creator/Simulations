# Prüfprotokoll: `termbaum` – Termbaum: die Struktur von Termen

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `9e953d3` · Bogen: `scratchpad/pruefung/termbaum/termbaum.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Voreinstellung $(12 − 4) · 3 + 6 : 2$: Klammer $8$, dann $8 · 3 = 24$, $6 : 2 = 3$, zuletzt $24 + 3 = 27$ → Anzeige 27, Termart Summe ✓.
  2. $2 + 3 · 4 = 2 + 12 = 14$; $(2 + 3) · 4 = 5 · 4 = 20$; $20 − 8 − 2 = 12 − 2 = 10$ (nicht 14); $24 : 4 : 2 = 6 : 2 = 3$; $2 · 3² = 2 · 9 = 18$ ✓ (alle als Test).
  3. $−3² + (−3)² = −9 + 9 = 0$: Baum zeigt 3² → 9, (−3)² → 9, Gegenzahl → −9, Summe → 0 ✓.
  4. $3x + 1$ für $x = 2{,}5$: $3 · 2{,}5 = 7{,}5$, $7{,}5 + 1 = 8{,}5$ ✓ (nach Korrektur auch so angezeigt, vorher 5/2 und 17/2).
  5. $2x² − 3x + 1$ für $x = −2$: $8 + 6 + 1 = 15$; für $x = 0{,}5$: $0{,}5 − 1{,}5 + 1 = 0$ ✓.
- **Sonderfälle:** Division durch 0 ($5 : (3 − 3)$, $7 : 0$, $0^{−1}$, $x : (x − 2)$ mit $x = 2$) → „Durch 0 kann man nicht teilen. Der Term hat keinen Wert.“, Termwert „nicht definiert“ ✓. $1/0$ als Bruch → Eingabefehler ✓. $0^0$ nicht definiert ✓. Sehr große Werte → „zu groß“ ✓. Eigener Parser ohne `eval`; ungültige Eingaben (fehlender Operand, Vorzeichen nach Rechenzeichen, Klammerfehler, „=“, unbekannte Variable) mit verständlicher Meldung ✓. Vorzeichen-Minus: $−3² = −9$, $(−3)² = 9$, $−x²$ bei $x = 3$ → −9 ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** exakt mit Brüchen; `−` überall; Dezimalkomma in DE ✓. Fehler: Dezimale Reglerwerte wurden als Bruch angezeigt (behoben).
- **Begriffe wie im Unterricht:** Summe/Differenz/Produkt/Quotient/Potenz, Summand, Minuend/Subtrahend, Faktor, Dividend/Divisor, Basis/Exponent, Gegenzahl ✓. Termart nach der zuletzt ausgeführten Rechnung ✓. Gleichrangiges von links nach rechts ✓, Potenzen rechtsassoziativ ($2^{3^2} = 512$).
- **Neue/ergänzte Tests:** Block „Prüfrunde“ in `tests/termbaum.test.ts`: Standardbeispiele (14, 20, 10, 3, 18, −9/9, 35), Termart von Differenz/Quotient/Produkt/Summe, Reihenfolge bei $24 : 4 : 2$, Division durch 0 (auch über Variable), Einsetzen negativer und dezimaler Werte.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 $16 − 6 = 10$ (Differenz) ✓, A2 $12 − 2 + 25 = 35$ (Summe) ✓, A3 $56 − 24 = 32$ ✓, A4 19/11/15 und 13 ohne Klammern ✓, A5 15 und 0 ✓, A6 −9 und 10 ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** Beispiele und Aufgabenlinks (u. a. −3² + (−3)², Division durch 0, Fehlermeldung $5 · −3$, Aufgabe 5 mit $x = 0{,}5$ in EN) geladen und angesehen – in Ordnung.
- **Texte vereinfacht/korrigiert:** EN-Lernmaterial war stark gekürzt (3 statt 6 Aufgaben, 4 statt 7 Ausprobier-Punkte, keine Tabelle der Termarten) → inhaltlich an DE angeglichen. DE: Hinweis zur Dezimalanzeige ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Baum, Kopfzeile und Hinweis vollständig, gut lesbar ✓.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine ✓.
- **Touch (Ziehen) und Maus:** kein Ziehen; Antippen der Rechnungen funktioniert (Tap-Ziele) ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Schritte ohne Animation, kein Pulsieren).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Tab-Reihenfolge der Seite regulär; alle Bedienelemente erreichbar ✓.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Elemente ohne Namen; Zeichenfläche beschrieben („Termbaum: oben die Zahlen …“); Rechenweg und Termwert zusätzlich als Text ✓.
- **Farben:** Rechenarten aus `ctx.theme.series` (Strich blau, Punkt grün, Potenz orange, Gegenzahl türkis, Variable lila), zusätzlich durch Rechenzeichen und Termart-Namen unterscheidbar ✓. Feste Werte nur für Kartenflächen/Schrift auf Flächen (`#ffffff`, `#18202c`, `#f3f6fa` …) – siehe „Für den Kern“.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/termbaum/index.ts` | Dezimalanzeige auch, wenn eine Variable einen Dezimalwert hat (`useDecimal()`): Regler $x = 2{,}5$ erscheint im Baum, Rechenweg und Termwert als „2,5“ / „8,5“ statt „5/2“ / „17/2“. Layout-Schlüssel berücksichtigt das. |
| `tests/termbaum.test.ts` | Tests der Prüfrunde ergänzt (siehe 1.). |
| `src/content/simulations/en/termbaum.md` | Inhaltlich an DE angeglichen (Tabelle Termarten, 7 Ausprobier-Punkte, 6 Aufgaben, Unterrichtsideen). |
| `src/content/simulations/de/termbaum.md` | Satz zur Dezimalanzeige ergänzt. |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei anderen Simulationen: Theme hat keine Farbe für Kartenflächen und Schrift auf farbigen Flächen; hier fest `#ffffff`/`#18202c`/`#1b2431`/`#f3f6fa`/Randtöne. Vorschlag `surface`/`onSeries` im Theme.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Bei $−3²$ zeigt der Rechenweg nach „3² = 9“ bereits „−9 + …“; der folgende Schritt „Gegenzahl bilden“ ergibt deshalb eine gleich aussehende Zeile („= −9 + 9 (Gegenzahl bilden)“). Im Baum ist der Schritt klar sichtbar. Soll die Zeile zusammengefasst oder als „−(9)“ geschrieben werden?
- Ein Schrägstrich zwischen zwei ganzen Zahlen gilt als Bruch (eine Zahl): $24/4/2$ wird als $\frac{24}{4} : 2$ gelesen (Wert 3 richtig, aber $24/4$ erscheint als Bruchzahl, nicht als Quotient). Ist so dokumentiert; für $:$ gibt es keine Besonderheit.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2893/2893 grün, Build ok.
