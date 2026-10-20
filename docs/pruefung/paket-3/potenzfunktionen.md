# Prüfprotokoll: `potenzfunktionen` – Potenzfunktionen y = a · xⁿ

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `0563bdf` · Bogen: `/tmp/boegen3/potenzfunktionen.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Beispiel „Kubische Parabel“ (n = 3, a = 0,5, x = 2): f(2) = 0,5 · 2³ = 0,5 · 8 = 4 ⇒ Anzeige „P: f(2) = 0,5 · 2³ = 4“ ✓. Wertetabelle: f(−0,5) = 0,5 · (−0,125) = −0,0625 ⇒ „−0,063“, f(−1) = −0,5, f(−2) = −4 ✓. Steckbrief „streng monoton steigend in ℝ“, W = ℝ ✓.
  2. Beispiel „Gespiegelt“ (n = −3, a = −2, x = 1): f(1) = −2 · 1⁻³ = −2, f(−1) = −2 : (−1) = 2, f(−2) = −2 : (−8) = 0,25, f(−0,5) = −2 : (−0,125) = 16, f(0,5) = −16, f(0) „n. d.“ ⇒ alle Tabellenwerte ✓. Grenzverhalten: x → 0 links: x³ → 0⁻, −2/0⁻ → +∞; rechts −∞ ⇒ „links → +∞, rechts → −∞ (Polstelle)“ ✓; Monotonie: 1/x³ fällt auf beiden Teilen, mal −2 ⇒ „steigend für x < 0 und für x > 0“ ✓.
  3. Symmetrie bei n = 3, x = 1,2: 1,2³ = 1,728 ⇒ P(1,2 | 1,73), P'(−1,2 | −1,73) ✓. **Fehler behoben:** Die Bildunterschrift zeigte „f(−1,2) = −f(1,2) = −1,73“ mit „=“, obwohl 1,728 auf 1,73 gerundet ist → jetzt „≈ −1,73“ (Gleichheitszeichen richtet sich nach der tatsächlich gezeigten Rundung).
  4. Vergleich x² / x⁴: Schnittpunkte x⁴ = x² ⇔ x²(x² − 1) = 0 ⇒ x = −1, 0, 1 ⇒ (−1 | 1), (0 | 0), (1 | 1) ✓; 0,5⁴ = 0,0625 < 0,25 ⇒ „0 < |x| < 1: f(x) > g(x)“ ✓. Vergleich x / x³: „x < −1: f > g; −1 < x < 0: f < g; 0 < x < 1: f > g; x > 1: f < g“, z. B. x = −1,62: −1,62 > (−1,62)³ = −4,25… (Anzeige bei der Fahrt „f(x) = −1,62 > g(x) = −4,27“ für das ungerundete x) ✓.
- **Sonderfälle:** a = 0: „Nullfunktion (keine Potenzfunktion im eigentlichen Sinn)“, Symmetrie-/Vergleichsknopf gesperrt ✓. n = 0: f(x) = 1,5 mit hohlem Punkt bei x = 0, D = ℝ \ {0}, W = {1,5} ✓. n ≤ 0 und x = 0: P springt auf x = ±0,1, Tabelle „n. d.“ ✓. n = m im Vergleich: „Die Graphen sind gleich.“ ✓. Reglergrenzen n = −4 … 6, a = ±3 geprüft.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und echtes Minus überall. **Behoben:** Wertetabelle rundete Werte unter 1 auf zwei Stellen (0,5³ = 0,125 als „0,13“) → jetzt drei Nachkommastellen unter 1 („0,125“, „0,063“).
- **Begriffe wie im Unterricht:** Parabel/Hyperbel n-ter Ordnung, Ursprungsgerade, Streckfaktor, Definitions-/Wertemenge mit ℝ₀⁺, Polstelle, Asymptote – passend.
- **Neue/ergänzte Tests:** `tests/potenzfunktionen.test.ts` um 6 Tests ergänzt (Aufgaben 1–3, 5, 6 aus dem Lernmaterial, Vergleich x / x³ aus Ausprobieren 6, Werte der Beispiele 1,2³ = 1,728, 0,5³ = 0,125, 1,5⁴ = 5,0625, −0,5 · 1,5² = −1,125).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 f(−2) = 0,5 · (−8) = −4 ✓, f(3) = 13,5 ≠ 13 ✓; A2 16a = 8 ⇒ a = 0,5, W = ℝ₀⁺ ✓; A3 (siehe oben) ✓; A4 ✓; A5 (−1 | −1), (0 | 0), (1 | 1), Ursprung fällt für n < 0 weg ✓; A6 n gerade und negativ, z. B. 1/x², W = ℝ⁺ ✓. Lehrplanbezug (Jgst. 9 LB 5, Jgst. 10 LB 4) stimmt mit `lehrplaene/bayern-gymnasium-mathematik.ts`.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle Links im Lernmaterial mit simshot geladen. **Behoben:** Beim Beispiel „Kubische Parabel“ (P(2 | 4)), bei „Hyperbel 2. Ordnung“ und Aufgabe 6 (P(0,5 | 4)) sowie beim Lösungslink zu Aufgabe 1 (A(−2 | −4)) lag P außerhalb des festen Bereichs ±3,2 – zu sehen war nur ein Randpfeil. Jetzt erweitert sich der y-Bereich beim Laden (Beispiel, Link, Ansichtswechsel), bis P im Bild ist; beim Ziehen und an den Reglern bleibt der Maßstab fest.
- **Texte vereinfacht/korrigiert:**
  - DE: Tabelle „n ungerade, n > 0“ ergänzt „(für n = 1 Ursprungsgerade)“; Ausprobieren 1 nennt neben der Farbe das Klassen-Schild im Steckbrief (nicht nur Farbe); Ausprobieren 4 „Rechnung im Bild“ (steht nicht immer unten) und Hinweis auf die markierte Tabellenzeile; Ausprobieren 5 erwähnt die beschrifteten blassen Graphen.
  - EN war deutlich kürzer (Klassentabelle, Sonderfälle, Ausprobieren 4/5 ungerade/7, Aufgaben 5 und 6, vollständige Lösungen zu 2/3/4, Lehrplanhinweis, 0⁰-Stolperstein, Aufgabenmodus fehlten; Aufgaben in anderer Reihenfolge) → auf den Stand der DE-Fassung gebracht, Reihenfolge wie DE.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Unter 640 px Bild über den Karten, sonst Karten rechts; auf dem Tablet waagrechte Tabelle. Kein Überlauf, keine Konsolenfehler (nur 403 bei Schriften über den Symlink), reduzierte Bewegung steht still.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:**
  - **Behoben:** Handy 360 px, Ansicht Familie mit Hyperbeln (z. B. n = −2, n = −3 mit a = −1,5): Im Steckbrief fehlten „Im Unendlichen“, „Nahe 0“ und „Asymptoten“ (abgeschnitten). Jetzt wird das Koordinatensystem am Handy bei Bedarf etwas flacher (bis 42 % statt 50 % der Höhe).
  - **Behoben:** Handy, n = −3, a = −2: Die Rechnung „P: f(1) = …“ unten im Bild verdeckte P und die Beschriftung von Q → steht jetzt oben, wenn P am unteren Rand liegt.
- **Touch (Ziehen) und Maus:** Q(1 | a) bei 1360 px um 82 px nach oben gezogen ⇒ a = 2 (Maßstab ≈ 81 px je Einheit) ✓; P im erweiterten Bereich von x = 2 bis auf den Ursprung gezogen ⇒ x = 0 ✓. Maßstab bleibt beim Ziehen fest.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alle Werte auch über Regler einstellbar, Familien-Chips entsprechen dem Regler n.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. `strings.canvas` ergänzt um die ziehbaren Punkte Q und P, die Rechnung im Bild, die Asymptoten, die beschrifteten Familiengraphen und die Fläche im Vergleich (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Karten- und Pillenhintergrund, Kartenrahmen und Tabellenlinien waren feste rgba-/Hex-Werte → jetzt aus `bg`, `text`, `grid` des Themes (Schatten bleiben neutral). **Behoben:** In der Familien-Ansicht waren die blassen Nachbargraphen nur über die Farbe zuzuordnen (z. B. x² und x⁶ beide blau) → jeder trägt jetzt seinen Namen (x², x⁻⁴ …) links vom Ursprung, je Exponent an eigener Stelle. Im Vergleich sind f und g beschriftet, die Tabellen-Spalten benannt.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/potenzfunktionen/index.ts` | „≈“ statt „=“ in der Symmetrie-Unterschrift, wenn der Wert gerundet gezeigt wird |
| `src/simulations/mathematik/potenzfunktionen/index.ts` | Wertetabelle: drei Nachkommastellen unter 1 (0,125) |
| `src/simulations/mathematik/potenzfunktionen/index.ts` | y-Bereich beim Laden so erweitert, dass P im Bild ist (Beispiele, Links) |
| `src/simulations/mathematik/potenzfunktionen/index.ts` | Familie: blasse Graphen beschriftet |
| `src/simulations/mathematik/potenzfunktionen/index.ts` | Handy: Bild bei Bedarf flacher, Steckbrief nicht mehr abgeschnitten; Rechnung oben, wenn P unten liegt |
| `src/simulations/mathematik/potenzfunktionen/index.ts` | Karten-/Pillenfarben und Linien aus dem Theme; ausführlicher Alt-Text |
| `tests/potenzfunktionen.test.ts` | 6 Tests ergänzt (Aufgaben und Beispielwerte) |
| `src/content/simulations/de/potenzfunktionen.md` | kleine Präzisierungen (n = 1, Klassen-Schild, „Rechnung im Bild“, beschriftete Familie) |
| `src/content/simulations/en/potenzfunktionen.md` | auf den Stand der DE-Fassung gebracht |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2887/2887 grün (126 Dateien), Build ok.
