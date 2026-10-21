# Prüfprotokoll: `lgs-grafisch` – Lineare Gleichungssysteme grafisch lösen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` (Basis) · Bogen: `scratchpad/shots/sheet-lgs.png` (nicht im Repo)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-1.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung

## Ergebnis
korrigiert (Fehler im Tariftext behoben, Aufgabenmodus im Bild ergänzt, Texte verbessert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Tarif A 10 € + 5 ct/min, B 4 € + 11 ct/min: 0,05x + 10 = 0,11x + 4 ⇒ 0,06x = 6 ⇒ x = 100, y = 15 ✓. Anzeige „Unter 100 min ist Tarif B günstiger, über 100 min Tarif A. Bei 100 min kosten beide 15,00 €.“ Probe x = 50: A 12,50 €, B 9,50 € → unter 100 min B ✓. Selbst nachgerechnet.
  2. y = x und y = 2x + 1: x = 2x + 1 ⇒ −x = 1 ⇒ x = −1, y = −1 ✓. Anzeige jetzt „−x = 1“ (vorher „−1x = 1“).
  3. Aufgabe 1: x + 1 = −2x + 7 ⇒ 3x = 6 ⇒ S(2 | 3) ✓; Aufgabe 4: S(4/3 | 4/3) ✓.
- **Fehler (behoben):** Tariftext „Bis {min} min … ab {min} min …“ schloss den Gleichstand bei genau {min} min in beide Aussagen ein. Jetzt „Unter … über … Bei {min} min kosten beide …“ (DE/EN).
- **„100,0 min“:** trifft nicht zu, `fmt.num(100, 1)` ergibt „100“. Nicht geändert.
- **Sonderfälle:** parallel (L = { }), identisch, senkrechte Geraden in allgemeiner Form unverändert ✓.
- **Neue/ergänzte Tests:** keine (keine neue Rechenlogik im Modell; Änderung nur in der Textausgabe).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgabenlinks:** alle DE-Aufgabenlinks haben bereits `_hide=1`; geprüft A1 und A5 (1360 hell/dunkel, 390).
- **Texte korrigiert:** DE Ausprobieren 1 (Punkte bei x = 0 und x = 1, „Anzeige → Steigungsdreiecke“ – vorher „Spitze des Steigungsdreiecks“, obwohl die Dreiecke standardmäßig aus sind); Aufgabenmodus-Hinweis an die echten Spoiler angepasst; Stolperstein Widerspruch 0 = 3. EN: Lösungsmenge S statt L (wie gleichungen-grafisch), y-Achsenabschnitt t statt c (c war doppeldeutig mit der rechten Seite in ax + by = c); nur Texte, Param-Keys unverändert.

## 3. Geräte
- **1360 hell/dunkel, 390 hell, EN 1360 und 390:** vollständig, kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit / Aufgabenmodus
- **Befund (behoben):** Mit `_hide=1` waren die Ergebnisse verdeckt, im Bild standen aber weiter der Lösungsstreifen („Genau eine Lösung … S(2 | 3)“), die Beschriftung S(2 | 3), die Koordinaten an den Achsen und die Probe. Jetzt gilt im Aufgabenmodus (`ctx.hidden`): Streifen „Lösung verdeckt: Lies den Schnittpunkt selbst ab und mache die Probe.“, Punkt nur mit „S“, Hilfslinien ohne Zahlen, Probe gesperrt. Neuer Schalter `show` („Anzeige → Lösung anzeigen“) als `resultsParam`, wie in gleichungen-grafisch. „Aufdecken“ schaltet ihn wieder ein.
- **Farben:** nur `ctx.theme` ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/lgs-grafisch/index.ts` | Tariftext DE/EN; „−x“; EN S und t; Schalter `show` + Aufgabenmodus im Bild |
| `src/content/simulations/de/lgs-grafisch.md` | Ausprobieren 1, Aufgabenmodus, Stolperstein |
| `src/content/simulations/en/lgs-grafisch.md` | y = mx + t, S = {…} |

## 6. Für den Kern (nicht selbst ändern)
- Deckt man ein einzelnes Ergebnis auf, endet der Aufgabenmodus im Bild ganz (`isTaskHidden` prüft `revealed.size === 0`). Das ist Kernverhalten und für alle Simulationen gleich.

## 7. Rückfragen
– 

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
