# Prüfprotokoll: `skalar-vektorprodukt` – Skalarprodukt und Vektorprodukt

Prüfer: Paket 3, Befunde B (Paket 4) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: simshot 1360 hell/dunkel, 390, EN, alle Aufgabenlinks, „Alle Lösungen zeigen“ (Winkel 120°, DE hell/EN dunkel)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-4.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. a = (1 | 2 | 0), b = (−2 | −1 | 0): a · b = −2 − 2 = −4, |a| = |b| = √5, cos φ = −4/5 = −0,8, φ = 143,13° ⇒ Anzeige „cos φ = −4 / (√5 · √5) = −0,8, φ ≈ 143,1°“ ✓.
  2. Start a = (1 | 2 | 0), b = (0 | 1 | 2): a · b = 2, cos φ = 2/5 = 0,4, φ = 66,42° ✓.
  3. Aufgabe „Winkel 120°“, a = (1 | 1 | 0): b = (−1 | 0 | 1) ⇒ cos φ = −1/(√2 · √2) = −0,5 ⇒ 120°; mit −a: cos = +0,5 ⇒ 60° ✓.
- **„≈“ bei gerundeten Beträgen (behoben):** „cos φ = −4 / (2,24 · 3)“ stand mit „=“, obwohl 2,24 gerundet ist. Neuer Helfer `normForm` in `model.ts`: Betrag als Zahl, wenn exakt (|(2, 2, 1)| = 3), als Wurzel, wenn das Quadrat exakt ist (√5), sonst gerundet; nur dann „≈“. Gilt für das Ergebnis „Geometrisch“ und die Zeile „|a| · |b|“ der Tafel. „=“/„≈“ auch für cos φ (3 Stellen) und φ (1 Stelle). In der Ansicht „Winkel drehen“ jetzt cos/sin mit Endnull („0,940“ statt „0,94“, bei der Sichtprüfung gefunden).
- **Lösungsmenge 120° (geprüft, Text korrigiert):** Im Code zeichnet `coneShape(−a, 60°)` einen Kegel mit Spitze O, Achse −a und halbem Öffnungswinkel 60°; ein Winkel von 120° zu a ist genau ein Winkel von 60° zu −a. Der alte Text „Kegel um a (Öffnung 2 · 60° um −a)“ war missverständlich ⇒ „Alle Lösungen liegen auf einem Kegel mit Spitze O um die Richtung −a; jede Mantellinie bildet mit −a 60°.“ / EN „All solutions lie on a cone with apex O around the direction −a; each line on it makes 60° with −a.“
- **Neue/ergänzte Tests:** `tests/skalar-vektorprodukt.test.ts` um 3 Tests ergänzt: `normForm` (Zahl/Wurzel/Näherung), `exactTo` (−4/(√5 · 3) nicht exakt, 0,5 exakt), Aufgabe 120°: drei Lösungen bilden mit a 120° und mit −a 60° und gelten als gelöst.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgabenlinks:** alle 4 DE und 2 EN geladen, Ergebnisse verdeckt ✓.
- **Rückfrage Aufgabe 2 (Diagramm zeigt den Schnitt bei 45°):** Im Diagramm gibt es keine Schnittpunktmarke und keine Beschriftung am Schnitt – nur die beiden Kurven, die Gitterlinien bei 45°/90°/135° und die Punkte am aktuellen Winkel (20°). Nach Vorgabe gelassen: Das Ablesen des Schnitts ist die gewollte Entdeckungshilfe; begründen (|a · b| = |a × b| ⇔ |cos φ| = sin φ) muss man weiter selbst. Der Hinweis „φ = 45° bzw. 135°“ erscheint nur genau bei diesen Winkeln und ist im Aufgabenmodus verdeckt.
- **Texte:** EN-Material „… is the length of the projection …“ ⇒ „… is the signed length of the projection of b onto a.“

## 3. Geräte
- 1360 hell/dunkel, 390, EN: Der längere Lösungsmengen-Text passt in die Hinweisbox (DE und EN); kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Keine Änderung in diesem Durchgang.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/skalar-vektorprodukt/model.ts` | `exactTo`, `normForm` |
| `src/simulations/mathematik/skalar-vektorprodukt/index.ts` | „=“/„≈“ und √-Schreibweise bei cos φ und |a| · |b|; Lösungsmenge 120° neu formuliert; cos/sin mit Endnull |
| `src/content/simulations/en/skalar-vektorprodukt.md` | „signed length“ |
| `tests/skalar-vektorprodukt.test.ts` | 3 Tests ergänzt |

## 6. Für den Kern
- nichts

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0; Tests 3374/3376 – die zwei Fehlschläge sind Zeitüberschreitungen (5 s) in `tests/grenzverhalten.test.ts` auf dem ausgelasteten Rechner, unabhängig von diesem Durchgang (Datei und Simulation unverändert); alle Tests dieser Simulation grün; Build ok (396 Seiten).
