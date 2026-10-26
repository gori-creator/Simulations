# Prüfprotokoll: `interferenz` – Interferenz zweier Kreiswellen

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `b1c216d` · Bogen: `scratchpad/boegen/interferenz.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Δφ = 360° zählte die Ordnungen falsch: „k = −2 … 4“; Fernfeld- und Knotenlinien-Hinweise bei Δφ ≠ 0 fachlich falsch; Aufgabenmodus verriet s₁, s₂ und Δs auf der Karte; „d = 6 cm“ wurde von Linien durchkreuzt und las sich wie „d ⊨ 6 dm“; uneinheitliche Rundung; neue Aufgabe 7 zur Phasenverschiebung; 8 Tests ergänzt). Rechenlogik im Kern fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (d = 6 cm, λ = 2 cm, P = (3 | 10)): s₁ = √(6² + 10²) = √136 = 11,662 cm; s₂ = 10,00 cm; Δs = 1,662 cm = 0,831 λ; A = 2 · |cos(π · 0,831)| = 2 · 0,862 = 1,72 ŷ; δ = 360° · 0,831 = 299,1° ✓ (Anzeige 11,66 / 10,00 / 0,83 λ / 1,72 ŷ / 299,1°).
  2. Bauchlinien d = 3λ: |k| ≤ 6/2 = 3 → k = −3 … 3, 7 Linien, davon 2 (|Δs| = d) auf der Verbindungsachse; Knotenlinien Δs = ±1, ±3, ±5 cm → 6 ✓. Allgemein 2 · ⌊d/λ⌋ + 1 (Test für 9 Wertepaare).
  3. Fernfeld d = 3λ: sin α₁ = 1/3 → α₁ = 19,5°; α₂ = arcsin(2/3) = 41,8°; α₃ = 90° (Achse) ✓. d = 4 cm, λ = 1,2 cm: α₁ = arcsin 0,3 = 17,5° ✓ (Bild).
  4. Δφ = 90°: Δs = (k − ¼) · 2 cm = −4,5; −2,5; −0,5; 1,5; 3,5; 5,5 cm → 6 Bauchlinien; erste rechts α₁ = arcsin(1,5/6) = 14,5° ✓ (Bild); in P: δ = 299,1° + 90° = 29,1°, A = 2 · cos 14,6° = 1,94 ŷ ✓.
  5. Gegenphasig, d = 0,8 cm, λ = 2,4 cm, P = (3 | 10): s₁ = 10,56, s₂ = 10,33, Δs = 0,23 cm = 0,10 λ; δ = 34,5° + 180° = 214,5°; A = 2 · |cos 107,3°| = 0,59 ŷ ✓; keine Bauchlinie (Δs = ±1,2 cm > d), nur die Knotenlinie Δs = 0.
  6. Reglergrenze d = 14 cm, λ = 1 cm, P = (10,5 | 17): s₁ = √(17,5² + 17²) = 24,40; s₂ = √(3,5² + 17²) = 17,36; Δs = 7,04 λ → A = 2 · |cos(0,04π)| = 1,98 ŷ „Maximum“ ✓; f = 20 Hz; 29 Bauch-, 28 Knotenlinien.
- **Sonderfälle:** d = 0 ist über den Regler nicht erreichbar (min 0,5 cm); das Modell liefert dann leere Linienlisten ohne Fehler (Test). d < λ/2 → keine Knotenlinie ✓; d < λ → nur k = 0 ✓; Δφ = 180° → Mitte Knotenlinie ✓. **Fehler:** Δφ = 360° ging als 2π in die Ordnungen ein → Lösungstext „k = −2 … 4“ statt „−3 … 3“. Jetzt `phaseRad()` im Modell (auf [0, 2π) gebracht). **Fehler:** Bei Δφ ≠ 0 behauptete das Fernfeld „außer der Mittelsenkrechten keine weitere Bauchlinie“, obwohl die Mitte z. B. bei 180° eine Knotenlinie ist; außerdem wurden nur Winkel rechts der Mitte gelistet, obwohl das Muster unsymmetrisch ist. Jetzt bei Δφ ≠ 0 alle Richtungen mit Vorzeichen und ein passender Satz, wenn es keine Bauchlinie gibt. Gleiches für „Für d < λ/2 gibt es keine Knotenlinie“ (gilt nur gleichphasig).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** `fmt.num` ließ Endnullen weg („s₂ = 10 cm“ neben „11,66 cm“, „A = 0 ŷ“, „1,4 · λ“), f stand oben mit 1, unten mit 2 Stellen. Jetzt s, Δs, Δs/λ, A, y mit festen 2 Stellen, Winkel mit 1 Stelle, f überall mit höchstens 1 Stelle.
- **Begriffe wie im Unterricht:** Wellenwanne, Erreger, Gangunterschied, Phasenunterschied, Knoten-/Bauchlinie, Ordnung, Interferenzhyperbeln, Zeigerdiagramm, Kohärenz ✓.
- **Neue/ergänzte Tests:** 8 neue Tests in `tests/interferenz.test.ts` (360° = 0°, Aufgaben 1–7, 2·⌊d/λ⌋+1, Sonderfälle und Reglergrenzen, Startwerte); jetzt 18 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 s₂ = 8, s₁ = √(36 + 64) = 10, Δs = 2 cm = λ → Maximum, 2ŷ ✓. A2 2/1,6 = 1,25; A = 2 · |cos 1,25π| = 1,41 ŷ, Zeiger senkrecht ✓. A3 |k| ≤ 3,5 → 7; Knoten |Δs| = 1, 3, 5, 7 → 8 (2 auf der Achse) ✓. A4 δ = 3π → A = 0; Bauchlinien ±1, ±3, ±5 → 6 ✓. A5 17,5°/36,9°/64,2°, 7 Linien ✓. A6 λ = 5 · sin 23,6° = 2,00 cm, f = 10 Hz ✓. Neu A7 (Δφ = 90°): Δs₀ = −0,5 cm, Linie rückt zu E₁, 6 Bauchlinien – mit der Simulation abgeglichen.
- **Aufgabenmodus:** Mit `_hide=1` zeigte die Karte bei A1/A2 „s₁ = 10 cm, s₂ = 8 cm“. Jetzt werden s₁, s₂, Δs (Karte, Strecken, Pille an P) über `ctx.isHidden('ds')`, A und Einordnung über `isHidden('amp')`, der Winkel im Bild über `isHidden('far')` verdeckt. Aufdecken von „Gangunterschied“ zeigt gezielt nur s₁, s₂, Δs (geprüft).
- **„Beispiel laden“ geklickt:** alle sechs Beispiele und alle Ausprobieren-, Aufgaben- und Lösungslinks geladen; passen zu den Beschreibungen.
- **Texte vereinfacht/korrigiert:** DE: „Korken P (den Messpunkt)“, neue A7. EN unverändert (kürzer erlaubt, fachlich richtig).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout wählt schon nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`), iPad quer nebeneinander ✓. Alle Ansichten lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. „d = 6 cm“ war ohne Hintergrund und wurde von Bauch-/Knotenlinien durchkreuzt („d ⊨ 6 dm“) → jetzt als Pille. „λ = … cm“ und die Legende bekamen bei vielen Linien einen dunklen Rand (d = 14 cm geprüft).
- **Touch (Ziehen) und Maus:** P mit der Maus verschoben (Werte folgen, s₁ = 13,30 / s₂ = 14,59 cm), E₂ nach außen gezogen (d = 12,2 cm, 13 Bauchlinien) ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur:** Tab-Reihenfolge laut JSON in Ordnung. E₁, E₂ und P sind nur Komfort; alles ist über Regler (d, x, y von P) erreichbar → kein `setKeyTargets`.
- **Namen für Bildschirmleser:** keine unbenannten Bedienelemente; Canvas-Beschreibung vorhanden; alle Werte zusätzlich als Text in den Ergebnissen.
- **Farben:** aus `ctx.theme.series`; Bauch- und Knotenlinien zusätzlich durch durchgezogen/gestrichelt und Legende unterscheidbar; y₁/y₂/y beschriftet ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/interferenz/model.ts` | neu `phaseRad(deg)`: Δφ auf [0, 2π) (360° = 0°) |
| `src/simulations/physik/interferenz/index.ts` | Phase normiert; Fernfeld-Text bei Δφ ≠ 0 mit allen Richtungen (Vorzeichen) und richtigem Satz ohne Bauchlinie; „keine Knotenlinie“-Satz je nach Phase |
| `src/simulations/physik/interferenz/index.ts` | Aufgabenmodus gezielt über `ctx.isHidden('ds' / 'amp' / 'far')` statt nur `val` |
| `src/simulations/physik/interferenz/index.ts` | einheitliche Rundung (`fmt.fixed`), f überall 1 Stelle |
| `src/simulations/physik/interferenz/index.ts` | „d = … cm“ als Pille; λ-Maßstab und Legende mit dunklem Rand |
| `src/content/simulations/de/interferenz.md` | Korken = Messpunkt; neue Aufgabe 7 (Δφ = 90°) |
| `tests/interferenz.test.ts` | 8 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Keine dringenden Punkte. Wunsch: ein `pill`/`richText` mit Index und Rand im Kern (hier lokal gebaut, ähnlich in anderen Wellen-Simulationen).

## 7. Entscheidungen
- **Δφ = 360° wie 0° behandeln** (im Modell normiert): Der Regler reicht bis 360°, physikalisch ist das dasselbe; sonst verschiebt sich die Zählung k.
- **Bei Δφ ≠ 0 alle Fernfeld-Richtungen mit Vorzeichen** (negativ = links der Mittelsenkrechten): Das Muster ist dann unsymmetrisch, nur die rechte Hälfte zu zeigen wäre irreführend.
- **Diagramm y(t) und Zeigerdiagramm bleiben im Aufgabenmodus sichtbar:** Ablesen aus dem Graphen ist erwünscht und ungenau; gerechnet wird mit s₁, s₂, Δs, und die sind jetzt verdeckt. Das Wellenbild selbst zeigt ohnehin, ob P ruhig ist.
- **Knotenlinien auf der Achse (|Δs| = d) mitzählen** (A3: 8 Knotenlinien) – wie bisher, im Text erklärt und in der Simulation als „davon … auf der Verbindungsachse“ ausgewiesen; passt zu 2·⌊d/λ⌋ + 1 beim Startzustand d = 3λ.
- **Neue Aufgabe 7 nur auf Deutsch:** EN darf kürzer sein.
- **Kein `setKeyTargets`:** E₁, E₂, P haben vollwertige Regler.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3439/3439 grün (149 Dateien), Build ok.
