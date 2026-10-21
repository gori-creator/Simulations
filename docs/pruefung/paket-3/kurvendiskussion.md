# Prüfprotokoll: `kurvendiskussion` – Monotonie, Extrem- und Wendestellen

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `7f11f0a` (Ausgangsstand) · Bogen: `/tmp/boegen3/kurvendiskussion.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startzustand f(x) = x³ − 3x, x₀ = −2: f(−2) = −8 + 6 = −2, f′(−2) = 3 · 4 − 3 = 9, n = −2 + 18 = 16 ⇒ t(x) = 9x + 16 (Karte) ✓; f″(−2) = 6 · (−2) = −12 („Rechtskurve“) ✓; Steigungsdreieck Δx = 0,25 ⇒ Δy = 2,25 ✓. Nach Ziehen von P auf x = −0,6: f′(−0,6) = 3 · 0,36 − 3 = −1,92 (Anzeige) ✓. Nach Ziehen des y-Achsen-Punkts auf d = 2,4: H(−1 | 4,4), T(1 | 0,4), W(0 | 2,4), einzige Nullstelle ≈ −2,04 (f(−2,04) ≈ 0,03) ✓.
  2. W-Form x⁴ − 2x²: f′ = 4x³ − 4x ⇒ T(±1 | −1), H(0 | 0) ✓; f″ = 12x² − 4 = 0 ⇒ x = ±1/√3 ≈ ±0,58, f = 1/9 − 2/3 = −5/9 ≈ −0,56 ✓; f‴(±0,58) = 24 · (±0,577) ≈ ±13,86 (Karte) ✓; f′(−2) = −32 + 8 = −24, P(−2 | 8) ✓.
  3. Vollständig −0,25x⁴ + x³: H(3 | −20,25 + 27 = 6,75) ✓, f″(3) = −27 + 18 = −9 ✓, W₁(0 | 0) = TP, W₂(2 | −4 + 8 = 4) ✓, Nullstellen 0 (dreifach), 4 ✓; f′(1) = −1 + 3 = 2, P(1 | 0,75) ✓.
  4. Aufgabe x³ − 3x² + 2: H(0 | 2), T(2 | −2), W(1 | 0), Nullstellen 1 und 1 ± √3 ≈ −0,73; 2,73 ✓; in x₀ = −1: P(−1 | −2), f′(−1) = 3 + 6 = 9, t(x) = 9x + 7, f″(−1) = −12 ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): x³ (Terrassenpunkt = Wendepunkt mit waagrechter Tangente), x⁴ (f″(0) = 0, trotzdem Tiefpunkt, „kein Wendepunkt“), x³ + cx mit c ≥ 0 (keine Kandidaten), Geraden/Konstante (Hinweis „f′ ist konstant“), Parabel (f″ konstant) sind in Modell und Anzeige richtig; keine Division. Vorzeichen in den Intervallen werden über Testwerte bestimmt, auch bei Nullstellen ohne VZW.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und „−“ über `fmt` ✓. **Behoben:**
  - Schritte 5 und 6 schrieben „x = −0,58“ bei gerundeten Stellen ⇒ „x ≈ −0,58“, „x = −1“ nur bei exakten Werten.
  - Tangentengleichung stand mit „=“ auch bei gerundeten Koeffizienten ⇒ „≈“, wenn n oder m gerundet ist.
  - Verdeckte Ergebnisse zeigten „x₁ ?“ ohne Gleichheitszeichen ⇒ „x₁ = ?“.
  - Offen gelassen: Punkte in Pillen und Ergebnisliste (z. B. W(−0,58 | −0,56)) stehen ohne „≈“, wie im Unterricht üblich.
- **Begriffe wie im Unterricht:** notwendige/hinreichende Bedingung, Kandidaten, VZW, Hoch-, Tief-, Terrassenpunkt, Wendepunkt, f″-Kriterium, Links-/Rechtskurve, streng monoton steigend/fallend, Vielfachheit ✓. Abkürzung „TP“ für den Terrassenpunkt siehe Rückfragen.
- **Neue/ergänzte Tests:** `tests/kurvendiskussion.test.ts` um 4 Tests ergänzt (Startzustand mit Tangente 9x + 16 und f″(−2) = −12; Aufgabe 5 vollständig mit Tangente 9x + 7; x³ + cx nur für c < 0 mit Extrempunkten; Krümmungs- und Monotonieintervalle von −0,25x⁴ + x³). Bestehende 26 Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 T(0 | 0), H(2 | 4), f″(0) = 6, f″(2) = −6, W(1 | 2), Monotonie ✓. A2 T(±1 | −1), H(0 | 0), W(±1/√3 | −5/9) ✓. A3 x³ (kein VZW), x⁴ (VZW − → +) ✓. A4 siehe oben, Krümmung rechts | links | rechts mit Grenzen 0 und 2 ✓. A5 siehe oben, (x − 1)(x² − 2x − 2) = x³ − 3x² + 2 ✓. Ausprobieren 2: t(x) = 9x − 16 bei x₀ = 2 (f(2) = 2, n = 2 − 18) ✓. Keine Rechenfehler im Bestand.
- **„Beispiel laden“ geklickt:** alle 7 Beispiele und alle Links des Lernmaterials (simshot, 1440 hell/dunkel, dazu 1024, 768, 360; EN 1440). Die Links zeigen den beschriebenen Zustand. **Behoben (Lösung schon sichtbar):**
  - Aufgabe 1 (`show=0`), Schritt 7: Die Karte zeigte „steigend in [? ; ?]“, „fallend in ]−∞; ?] und [?; ∞[“, „linksgekrümmt in ]−∞; ?[“ und verriet so das Monotonie- und Krümmungsmuster ⇒ verdeckt nur noch „steigend in ?“ usw. mit Hinweis „Gibt es kein solches Intervall, schreibe „keines“.“
  - Alle Aufgaben mit `show=0`: Beim Ziehen rastete P an den waagrechten Tangenten ein („f′(2) = 0: waagrecht“), beim Wandern pulsierten Ringe an den Kandidaten ⇒ beides nur bei sichtbaren Ergebnissen.
  - Bleibt bewusst sichtbar: Graph von f′ (Werkzeug der Simulation) und die Zahl der Spalten in den Vorzeichentabellen (siehe Rückfragen).
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (Einleitung in zwei Absätzen, 3 statt 5 Ausprobieren-Punkte, 2 statt 5 Aufgaben, Lösungen ohne Rechnung, Ideen 3 Punkte) ⇒ vollständig auf den Stand der DE-Fassung gebracht (Dezimalpunkt, Punkte als (x, y), Hinweis auf die deutschen Kürzel H, T, TP, W im Bild). Die frühere EN-Aufgabe „Tangent“ steht jetzt wie in DE unter Ausprobieren 2.
  - DE/EN: „grün wo positiv, rot wo negativ“ ergänzt um „oberhalb der Achse (+) … unterhalb (−)“.
  - Lehrplanbezug mit `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` abgeglichen: Jgst. 11, Lernbereich 4.2 (dort `kurvendiskussion` eingetragen) ✓; Symmetrie, Randverhalten, Vielfachheit passen zu Jgst. 10, Lernbereich 4 „Ganzrationale Funktionen“ und Jgst. 11, Lernbereich 1. Text nennt jetzt diese Lernbereiche; „bitte am Lehrplan prüfen“ entfällt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Handy und iPad hoch: Bilder oben, Karten darunter ✓. Laptop, 1920, Beamer: Karten rechts ✓. Dunkelmodus lesbar ✓.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf, keine Konsolenfehler (Bogen). **Behoben:** iPad quer, Schritt 7: „streng monoton steigend in ]−∞; −1] und [1; ∞[“ war rechts abgeschnitten ⇒ passt die Zeile nicht, stehen die Intervalle in einer zweiten Zeile. Offen (unkritisch): iPad quer und Laptop zeigen in Schritt 7 nicht alle Karten (Steckbrief, teils Vorzeichentabelle von f″ entfallen; Werte stehen in der Ergebnisliste); am Handy fehlen in Schritt 7 Tangenten- und Steckbriefkarte. Die gestrichelte P-Linie läuft über das Ende der Legende „f″(x) = …“. EN 1440, Schritt 7 mit x₀ = 1: Die Pille „m = f′(1) = 2“ berührt „TP(0 | 0) = W“.
- **Touch (Ziehen) und Maus:** P mit der Maus gezogen (x = −2 → −0,6, f′ = −1,92 ✓), y-Achsen-Punkt gezogen (d = 2,4 ✓); Touch über `addHandle` des Kerns. Der Zieh-Hinweis passt (P und y-Achsen-Punkt sind ziehbar).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen). **Behoben:** Nach „Nächster Schritt“ blendete der Schrittitel ein und der aktuelle Schrittpunkt pulsierte auch bei reduzierter Bewegung (Messung am Ausgangsstand: ab Schritt 3 „bewegt“). Jetzt eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach Start, 6 × „Nächster Schritt“, „Schritt zurück“, „Von vorn“, „Tangente wandern lassen“, allen 7 Beispielen und „Ergebnisse aufdecken“: 18/18 still. Gegenprobe ohne reduzierte Bewegung: Bewegung wird erkannt.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Regler, Schalter und Knöpfe erreichbar (Schrittpunkte zusätzlich über den Regler „Schritt“).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) beschreibt Bilder, Hilfslinien, P und Karten ✓.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Pillen (rgba), Karten (#ffffff/#151c27, Rand #e1e6ee/#273142), Bandschrift (#1b2533/#f4f7fb), offene Schrittpunkte und Ziffern (#ffffff) hatten feste Farben ⇒ aus `theme.bg`/`theme.text` gemischt. Schatten und Glanzlicht bleiben neutral. Rot/Grün: Bänder „↗ steigt/↘ fällt“, „∪ links/∩ rechts“, Vorzeichentabellen „+/−“ und Pfeile, VZW-Pillen „+ → −“, Flächen ober-/unterhalb der Achse; f, f′, f″ in eigenen Bildern mit Legende; Wendetangente und Tangente in P unterscheiden sich durch Länge und Lage ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/kurvendiskussion/index.ts` | Pillen, Karten, Bandschrift und Schrittpunkte aus dem Theme statt fester Farben |
| `src/simulations/mathematik/kurvendiskussion/index.ts` | reduzierte Bewegung: kein Einblenden des Schrittitels, kein Puls des Schrittpunkts, kein Dauer-Neuzeichnen |
| `src/simulations/mathematik/kurvendiskussion/index.ts` | „=“/„≈“ bei Stellen in Schritt 5/6 und bei der Tangentengleichung; „x₁ = ?“ |
| `src/simulations/mathematik/kurvendiskussion/index.ts` | verdeckt: Schritt 7 ohne Intervallmuster, kein Einrasten/Pulsieren an Kandidaten |
| `src/simulations/mathematik/kurvendiskussion/index.ts` | lange Intervallzeilen in Schritt 7 umbrechen |
| `src/content/simulations/de/kurvendiskussion.md` | Farbverweis ergänzt, Lehrplanbezug nach Lehrplandatei |
| `src/content/simulations/en/kurvendiskussion.md` | auf den Stand der DE-Fassung gebracht |
| `tests/kurvendiskussion.test.ts` | 4 Tests ergänzt |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `ableitungsfunktion`: `layout.aspectNarrow` je Zustand bzw. eine höhere Bühne, wenn Karten nicht passen, würde am Handy und iPad quer die fehlenden Karten (Steckbrief, Tangente) zurückbringen.
- Eine gemeinsame Hilfe für „=“/„≈“ (`fmt.approx`) würde das eigene `eqS` ersetzen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Kürzel „TP“ für den Terrassenpunkt:** In vielen Schulbüchern steht „TP“ für den Tiefpunkt; die Simulation nutzt H, T und TP (Terrassenpunkt), auch in EN. Bitte entscheiden, ob z. B. „TeP“ besser passt (Parameter sind nicht betroffen).
- **Verdeckte Ergebnisse:** Die Zahl der Spalten in den Vorzeichentabellen (und der Zeilen „x₁ = ?; x₂ = ?“) zeigt, wie viele Kandidaten es gibt, und der Graph von f′ bleibt sichtbar. Ich habe beides als Werkzeug gelassen. Falls die Aufgaben ganz ohne diese Hilfe gedacht sind, bitte Bescheid geben.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3115/3115 grün (135 Dateien), Build ok.
