# Paket 4: binomialverteilung, signifikanztest, e-funktion, koordinaten-3d, skalar-vektorprodukt

## binomialverteilung
1. **Fehler** ASCII-Minus „F(-1)“ (Z. ~1064, ~972, ~961 `F(${s.a - 1})`, `1 − F(${s.k - 1})`): negative Zahl mit echtem „−“ (`fmt.num(…, 0)`).
2. DE Aufgabe 4 (EN Task 2): Link um `&sig=0` ergänzen (σ-Band verrät „μ ± 2σ“). Key `sig` prüfen.
3. EN „At least 0 successes always happens.“ → „There are always at least 0 successes.“
4. DE Z. ~187 „etwa 70 %“ → „rund 68 %“.
5. DE Ideen: Satzteil „die genaue Zuordnung zur Jahrgangsstufe bitte am Lehrplan prüfen“ streichen.

## signifikanztest
1. **Fehler** DE Aufgabe 3, Lösung: Fehldeutung von α. Neu: „… bewiesen ist das nicht. Wäre der Würfel in Ordnung, würde der Test nur mit höchstens etwa 3,4 % Wahrscheinlichkeit so entscheiden.“ Ganzes Material und Anzeige nach ähnlichen Formulierungen („Wahrscheinlichkeit eines Irrtums“) durchsuchen.
2. **Fehler** DE Aufgabe 2 / EN Task 2: Link um `&info=0` ergänzen (sonst β sichtbar). Key `info` prüfen.
3. **Fehler** DE Aufgabe 5: `?alpha=1&info=0&_hide=1`.
4. DE Z. ~227 „liegt immer unter α“ → „ist nie größer als α“.
5. DE Ideen: „α* ≈ 2,8 %“ erklären: „… etwa in 2,8 % der Fälle (tatsächliche Irrtumswahrscheinlichkeit) fälschlich ablehnt.“
6. DE Ideen: Prüfvermerk „bitte am Lehrplan prüfen“ → „Die Gütefunktion kann als Ausblick dienen.“
7. DE Ausprobieren 5: „Stelle p₁ = 0,68 ein und vergleiche die Macht bei n = 50 und n = 200.“ (Link anpassen, falls vorhanden).

## e-funktion
1. EN Steckbrief „S_{y}(0 | 1), no zero“ → „y-intercept (0, 1), no zero“.
2. EN Punkte „(0 | 1)“, „(1 | b)“ → „(0, 1)“, „(1, b)“ (nur EN-Texte; prüfen, wie andere Sims EN-Punkte schreiben – Konvention im Projekt einheitlich halten. Wenn das Projekt in EN überwiegend „( | )“ nutzt, nicht ändern und begründen).
3. EN-Material „W = ℝ⁺“ → „range (0, ∞)“ bzw. „domain ℝ, range (0, ∞)“.
4. Ergebnis „m = f′(1) = e¹ ≈ 2,718 = f(1)“ → „m = f′(1) = f(1) = e¹ ≈ 2,718“.
5. DE Ideen: „Zuordnung bitte am Lehrplan prüfen“ streichen.

## koordinaten-3d
1. **Fehler** Oktanten-Tafel (Z. ~1361, ~894) prüft `show` nicht: bei show=0 „P liegt im Oktanten ?“, Vorzeichen „?“, kein Oktant hervorgehoben. Aufgabe 5 / EN Task 4 testen.
2. „P liegt in IV“ → „P liegt im Oktanten IV“ / „P is in octant IV“.
3. DE Aufgabe 2: „Ein achsenparalleler Quader ABCDEFGH hat die Ecken A(0 | 0 | 0) und G(4 | 3 | 2). …“
4. Z. ~1108/~1028: „=“ statt „≈“, wenn der Wert exakt ist.

## skalar-vektorprodukt
1. „cos φ = −4 / (2,24 · 3)“ → „≈“ vor gerundeten Beträgen (oder √-Schreibweise, wenn es einen Helfer gibt).
2. TASK_SHAPE.angle: „Alle Lösungen liegen auf einem Kegel mit Spitze O um die Richtung −a; jede Mantellinie bildet mit −a 60°.“ / EN „All solutions lie on a cone with apex O around the direction −a; each line on it makes 60° with −a.“ – vorher im Code klären, welcher Winkel/Richtung wirklich gilt, und den Text danach formulieren.
3. EN-Material: „… is the signed length of the projection of b onto a.“
4. Rückfrage Aufgabe 2 (Diagramm zeigt Schnitt bei 45° trotz show=0): Diagramm bei show=0 Kurven zeigen lassen, aber Schnittpunktmarke/Beschriftung verdecken, falls vorhanden; sonst lassen (Entdeckungshilfe) und im Protokoll begründen.
