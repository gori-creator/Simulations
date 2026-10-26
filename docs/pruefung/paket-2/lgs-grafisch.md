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

## Zweite Prüfung (Paket 2, 25.10.2026)

Unabhängiger zweiter Durchgang auf dem Zweig `pruefung/paket-2`, danach mit dem Stand oben zusammengeführt (beide Korrekturen sind enthalten).

Prüfer: Paket 2 · Datum: 25.10.2026 · Stand: Commit `3e0905d` · Bogen: `/tmp/claude-0/-home-user-Simulations/8f85f9ae-3f3f-5aef-94a3-e731ae416460/scratchpad/pruef/lgs-grafisch/lgs-grafisch.png`

### Ergebnis
korrigiert

### 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startwerte I: y = 2x − 1, II: y = −x + 5: 2x − 1 = −x + 5 ⇒ 3x = 6 ⇒ x = 2, y = 2 · 2 − 1 = 3. Anzeige S(2 | 3), Probe „2 · 2 − 1 = 3 ✓ · −2 + 5 = 3 ✓“ ✓
  2. Krummer Schnittpunkt y = x, y = −0,5x + 2: x = −0,5x + 2 ⇒ 1,5x = 2 ⇒ x = 4/3 ≈ 1,33, y = 4/3. Anzeige „S ≈ (1,3 | 1,3) – exakt S(4/3 | 4/3)“, Gleichsetzen „1,5x = 2“ ✓
  3. Tarife A 10 € + 5 ct/min, B 4 € + 11 ct/min: 0,05x + 10 = 0,11x + 4 ⇒ 6 = 0,06x ⇒ x = 100, Kosten 10 + 0,05 · 100 = 15 €. Anzeige „Bis 100 min ist Tarif B günstiger, ab 100 min Tarif A. Bei 100 min kosten beide 15,00 €.“ ✓ Mit p₂ = 9 ct: 6 = 0,04x ⇒ x = 150, 10 + 7,50 = 17,50 € ✓
  4. Allgemeine Form x = 3 (1·x + 0·y = 3) und 2y = −4: S(3 | −2), Probe „3 = 3 ✓ · 2 · (−2) = −4 ✓“ ✓
  5. Außerhalb: y = 0,25x + 10, y = −0,25x − 10: 0,5x = −20 ⇒ x = −40, y = 0; Ansicht passt sich an, S(−40 | 0) ✓
- **Sonderfälle:** a = b = 0 → „keine Gerade“, kein Absturz; zwei senkrechte Geraden parallel bzw. identisch korrekt; gleiche Grundgebühr (Schnitt bei 0 min) → „immer günstiger“; Minutenpreis 0 → waagerechte Gerade; Schnittpunkt außerhalb → Pfeil am Rand mit Koordinaten.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** durchgängig `−` und Dezimalkomma (EN Punkt). Korrigiert: Steigungsdreieck im Tarifmodus zeigte „4,4 €“ → jetzt „4,40 €“; Gleichsetzen zeigte „−1x = −2“ → jetzt „−x = −2“.
- **Begriffe wie im Unterricht:** Normalform y = mx + t, Lösungsmenge L = {(2 | 3)}, L = { }, Gleichsetzungsverfahren, Probe – passend zu Bayern Jgst. 8.
- **Neue/ergänzte Tests:** `tests/lgs-grafisch.test.ts`: Aufgaben 1, 2, 3b, 5 (9 ct), 6 nachgerechnet; Tarif-Grenzfälle (gleiche Grundgebühr, Schnitt bei negativer Zeit, gleiche Tarife, Minutenpreis 0); Brüche/negative Werte/senkrechte Geraden.

### 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgabe 1 (2 | 3), 2 (3 | 3), 3 a) keine, b) unendlich viele, c) (0 | 1), 4 (4/3 | 4/3), 5 100 min/15 € bzw. 150 min/17,50 €, 6 (7 | 3) – alle richtig.
- **„Beispiel laden“ geklickt:** alle sechs Beispiele, alle Aufgaben- und „Zeigen“-Links (u. a. `_hide=1` verdeckt die Ergebnisse) – Anzeigen stimmen mit den Lösungen überein.
- **Texte vereinfacht/korrigiert:** EN war stark gekürzt (2 statt 6 Aufgaben, 3 statt 6 Ausprobier-Punkte, ohne Tabelle und Unterrichtsideen) → EN vollständig an DE angeglichen. DE und EN: Hinweis zu `_hide=1` nennt jetzt alle verdeckten Ergebnisse (Lage, Lösungsmenge, Gleichsetzen, Probe, Tarif).

### 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle ohne Befund; Beispielkarten auf dem Tablet sichtbar; Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Auf dem Handy (360 px) lag die Probe-Karte im Tarifmodus über den x-Achsen-Zahlen → Nachtrag: Karte sitzt bei schmaler Fläche im Tarifmodus jetzt über der x-Achse (vorher/nachher: `handy-tarif-vorher.png` / `shots/handy-tarif.png` im Bogen-Ordner). Bei sehr großem Ausschnitt (S weit außen) rücken die beiden Ziehpunkte bei x = 0 und x = 1 eng zusammen – nicht geändert.
- **Touch (Ziehen) und Maus:** Ziehpunkte (y-Achsenabschnitt, Steigungspunkt, Verschiebepunkt in allgemeiner Form, Grundgebühr/Minutenpreis) per Code geprüft, rasten auf die Reglerschritte; Hinweis „Tipp: … ziehen“ vorhanden.

### 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Prüfbogen). Zusätzlich korrigiert: Das „Aufploppen“ des Schnittpunkts beim Wechsel des Lösungsfalls lief auch bei reduzierter Bewegung → jetzt abgeschaltet.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge der Seitenleiste wie erwartet; alle Regler per Tastatur bedienbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Zeichenfläche „Koordinatensystem mit zwei Geraden und ihrem Schnittpunkt“, alle Werte zusätzlich als Text unter „Ergebnisse“.
- **Farben:** Geraden/Schnittpunkt aus `ctx.theme.series`; Geraden zusätzlich mit „I“/„II“ bzw. „A“/„B“ beschriftet, Probe mit ✓/✗ – nicht nur über Farbe unterscheidbar. Feste Farben nur für Karten/Handyfoto-Overlay (Hintergrund/Schatten), wie in anderen Simulationen.

### 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/lgs-grafisch/index.ts` | Gleichsetzen: Koeffizient −1 als „−x“ statt „−1x“ |
| `src/simulations/mathematik/lgs-grafisch/index.ts` | Steigungsdreieck Tarif: Geldbetrag mit zwei Nachkommastellen („4,40 €“) |
| `src/simulations/mathematik/lgs-grafisch/index.ts` | „Aufploppen“ des Schnittpunkts bei reduzierter Bewegung abgeschaltet |
| `src/content/simulations/en/lgs-grafisch.md` | EN vollständig an DE angeglichen (Einführung, Tabelle, 6 Ausprobier-Punkte, 6 Aufgaben, Unterrichtsideen) |
| `src/content/simulations/de/lgs-grafisch.md` | `_hide=1`-Hinweis nennt alle verdeckten Ergebnisse |
| `tests/lgs-grafisch.test.ts` | 3 neue Testfälle (Aufgaben, Tarif-Grenzfälle, Darstellung) |
| `src/simulations/mathematik/lgs-grafisch/model.ts`, `index.ts` | Nachtrag: `crossesAtNegativeTime()`; Tarifvergleich nennt bei Schnittpunkt bei negativer Zeit einen Hinweis (DE/EN), Test ergänzt |
| `src/simulations/mathematik/lgs-grafisch/index.ts` | Nachtrag: Probe-Karte auf schmaler Fläche im Tarifmodus über der x-Achse |

### 6. Für den Kern (nicht selbst ändern)
- keine

### 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Tarifmodus mit Schnittpunkt bei negativer Gesprächszeit (z. B. A 4 € + 5 ct, B 10 € + 11 ct): Banner und Lösungsmenge melden mathematisch korrekt „genau eine Lösung S(−100 | −1)“, der Tarifvergleich sagt „Tarif A ist bei jeder Gesprächszeit günstiger“. Soll im Sachkontext ein Hinweis ergänzt werden? **Entschieden (Leitung): ja.** Umgesetzt: „Der Schnittpunkt liegt bei negativer Zeit und hat im Sachzusammenhang keine Bedeutung – Tarif A ist immer günstiger.“ (EN entsprechend), Test in `tests/lgs-grafisch.test.ts`.

### Prüfung
`npm run verify`: astro check 0/0/0, Tests 3028/3028 grün (130 Dateien), Build ok.
