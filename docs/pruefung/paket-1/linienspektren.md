# Prüfprotokoll: `linienspektren` – Linienspektren und Energieniveaus

Prüfer: Paket 1 (Vertretung) · Datum: 22.10.2026 · Stand: Commit `244af46` · Bogen: `scratchpad/boegen/linienspektren.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Rechenlogik und Tabellenwerte (H, He, Na, Hg) sind richtig. Korrigiert wurden:
- Aufgabenmodus: Mit `_hide=1` allein (ohne `val=0`) standen ΔE, f, λ und die Farbe weiter im Bild.
- Aufgabe 4 (Quecksilber) wurde mit genau dem gesuchten Übergang geladen: Termschema, Atombild und „Übergang“ verrieten das Niveau 6³P₂.
- Hβ (486 nm) hieß in der Simulation „blau“, im Lernmaterial „blaugrün“.
- Regler „Oberes Niveau“ über 6 bei Wasserstoff sprang auf Lyman-α (2 → 1) statt auf das höchste Niveau.
- Zehnerpotenz konnte „10,00 · 10¹⁴“ zeigen (Mantisse nicht vorher gerundet).
- Rechnung zeigte c = 3,00 · 10⁸ m/s neben h = 6,626 · 10⁻³⁴ J · s; jetzt 2,998 · 10⁸ m/s.
- Termschema: Achsenpfeil schnitt „E in eV“, „−13,60“ am Kartenrand angeschnitten, Ionisierungslinie lief durch „n = 6“; auf dem Handy berührte „E in eV“ den Titel.
- Pfeile im Termschema waren nur per Antippen wählbar; jetzt auch per Tastatur.
- 3 Tests ergänzt, 1 Test angepasst.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Hα (n = 3 → 2): E₃ = −13,6/9 = −1,511 eV, E₂ = −3,400 eV, ΔE = 1,889 eV = 1,889 · 1,602 · 10⁻¹⁹ J = 3,026 · 10⁻¹⁹ J. f = 3,026 · 10⁻¹⁹ / 6,626 · 10⁻³⁴ = 4,567 · 10¹⁴ Hz. λ = 2,998 · 10⁸ / 4,567 · 10¹⁴ = 656,4 nm (bzw. 1239,8/1,889 = 656,4 nm). Anzeige: 1,89 eV, 3,03 · 10⁻¹⁹ J, 4,57 · 10¹⁴ Hz, 656 nm, rot ✓.
  2. Lyman-α (2 → 1): ΔE = −3,40 − (−13,60) = 10,20 eV, f = 10,2 · 1,602 · 10⁻¹⁹ / 6,626 · 10⁻³⁴ = 2,466 · 10¹⁵ Hz, λ = 1239,8/10,2 = 121,6 nm, UV. Anzeige 10,20 eV, 2,47 · 10¹⁵ Hz, 122 nm, „ultraviolett – unsichtbar“ ✓. Lyman 4 → 1: 13,6 · 15/16 = 12,75 eV, λ = 97,2 nm ✓.
  3. Na-D (3p → 3s): ΔE = 5,1391 − 3,0347 = 2,1044 eV, λ = 1239,8/2,1044 = 589,2 nm, f = 5,09 · 10¹⁴ Hz, gelb ✓.
  4. Hg grün (7³S₁ → 6³P₂): (7,7305 − 5,4606) eV = 2,2699 eV, λ = 546,2 nm ✓; außerdem 253,7 / 404,7 / 435,8 / 577,0 / 579,1 / 365,0 nm aus den Niveaus nachgerechnet ✓. He: 3³D → 2³P 2,1095 eV → 587,7 nm (Vakuum), 3¹D → 2¹P 668,0 nm, 2³P → 2³S 1083 nm ✓.
  5. Seriengrenzen: Balmer 1239,8/3,40 = 364,7 nm, Lyman 1239,8/13,6 = 91,2 nm (Ionisierung) ✓ (neuer Test).
- **Sonderfälle:**
  - Gleiche Niveaus (u = l) und l > u: hellste Linie vom oberen Niveau (3 → 2) ✓.
  - Reglergrenze u = 10 bei Wasserstoff (6 Niveaus): vorher Lyman-α, jetzt 6 → 5 (bzw. 6 → l, wenn l passt).
  - Ungültiges Element im Link → Wasserstoff ✓.
  - n → ∞ ist nicht wählbar (nur 6 Niveaus); die Seriengrenze steht als Aufgabe 5 im Lernmaterial und ist durch die Ionisierungslinie im Termschema dargestellt.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** Energien mit 2 Nachkommastellen, J und Hz mit 3 gültigen Ziffern, λ auf ganze nm (unter 100 nm auf 0,1 nm), Tabelle auf 0,1 nm. Minus als „−“, negative Werte in Klammern ✓. λ ist die Vakuumwellenlänge (He 587,7 statt 587,6 nm in Luft); bei 0,1 nm Abweichung ohne Bedeutung für den Unterricht.
- **Begriffe:** Energieniveau, Termschema, Grundzustand, Ionisierung, Lyman-/Balmer-/Paschen-Serie, Emission/Absorption ✓.
- **Neue/ergänzte Tests:** Sonderfälle (u > Zahl der Niveaus, u = l, l > u, alle Kombinationen ergeben gültigen Übergang), Seriengrenzen und Zusammenrücken der Balmer-Linien, Lösungen der Aufgaben 1–4. Farbtest: 486 nm jetzt „cyan“ (blaugrün), 470 nm und 434 nm „blau“.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  1. Hβ: E₄ = −0,85 eV, ΔE = 2,55 eV = 4,09 · 10⁻¹⁹ J, f = 6,17 · 10¹⁴ Hz, λ = 486 nm ✓.
  2. Lyman-α: 10,2 eV → 122 nm, UV ✓.
  3. Na: 1240/589 = 2,10 eV ✓; Erklärung der Absorption (Wiederaussendung in alle Richtungen) ✓.
  4. Hg: 1240/546 = 2,27 eV, −2,71 − 2,27 = −4,98 eV → 6³P₂ (−4,977 eV) ✓.
  5. Balmer-Grenze 365 nm ✓. 6. Ionisieren: λ ≤ 91 nm ✓.
- **„Beispiel laden“ und Aufgaben-Links:** alle 6 Beispiele und alle Links geladen (simshot), keine Fehler. Aufgabe 1–3 verdecken jetzt alles; Aufgabe 4 neu verlinkt.
- **Texte korrigiert:** DE: Hinweis zur Rundung präzisiert (Bild ganze nm, Tabelle 0,1 nm); Aufgabe 4 mit Prüfhinweis („passenden Pfeil antippen“). EN ist kürzer (Projektregel), fachlich richtig, keine Änderung.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Aufteilung nebeneinander ab 640 px bzw. Breite ≥ 1,3 · Höhe, sonst untereinander. iPad quer nutzt die Höhe gut ✓.
- **Überlappungen:** im Termschema behoben (siehe oben). He-Termschema auf iPad quer eng, aber lesbar.
- **Touch und Maus:** Pfeile im Termschema und Linien auf dem Schirm antippbar (Treffer 9 px), Zeiger wird zur Hand ✓. Kein Ziehen vorgesehen (`dragHint: false`), Hinweis „Übergang antippen“ steht in der Karte.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Spektrum sofort fertig).
- **Tastatur:** Regler für oberes/unteres Niveau; neu `ctx.setKeyTargets` für alle Pfeile im Termschema (Name „Übergang n = 4 → n = 1“, ohne Wellenlänge, damit nichts verraten wird). Mit simshot geprüft: Fokus, 3 × Pfeil rechts, Enter wählt 4 → 1 ✓.
- **Namen:** alle Bedienelemente benannt, Grafikbeschreibung vorhanden ✓.
- **Farben:** UI aus `ctx.theme`; Spektralfarben aus der Wellenlänge (fachlich nötig). Farbe steht immer zusätzlich als Wort („rot“, „ultraviolett – unsichtbar“) und als λ in nm ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/linienspektren/index.ts` | Werte im Bild über `ctx.isHidden('photon')` statt `p.val` (greift auch bei `_hide=1`); Zehnerpotenz mit vorher gerundeter Mantisse; c = 2,998 · 10⁸ m/s in der Rechnung; Termschema: „E in eV“ neben die Pfeilspitze, mehr Rand links bei H, Ionisierungslinie endet vor den Beschriftungen, Abstand zum Titel auf kleinen Karten; `ctx.setKeyTargets` für die Pfeile |
| `src/simulations/physik/linienspektren/model.ts` | `colorNameOf`: blau bis 480 nm, danach blaugrün (Hβ); `resolveTransition` begrenzt u auf die Zahl der Niveaus |
| `src/content/simulations/de/linienspektren.md` | Aufgabe 4 lädt 7³S₁ → 6³P₀ (404,7 nm) statt der Lösung; Rundungshinweis |
| `tests/linienspektren.test.ts` | 3 neue Tests, Farbtest angepasst |

## Entscheidungen
- **Hβ heißt „blaugrün“:** In Schulbüchern wird die 486-nm-Linie als blaugrün/türkis bezeichnet, Hγ (434 nm) als blau bzw. violett. Die Grenze blau/blaugrün liegt jetzt bei 480 nm statt 490 nm. Betroffen sind sonst nur He 501,6 nm (blieb blaugrün) und keine weitere Linie der Tabellen.
- **Aufgabe 4 lädt einen Nachbarübergang:** Jeder Zustand der Simulation hat einen gewählten Übergang. Lädt man den gesuchten, steht die Lösung im Termschema und im (nicht verdeckbaren) Ergebnis „Übergang“. Der Übergang 7³S₁ → 6³P₀ zeigt dasselbe Startniveau und verrät nichts; zum Prüfen tippt man den Pfeil an.
- **„Übergang“ bleibt offen (kein `spoiler`):** Es nennt nur die Ausgangsdaten der Rechenaufgaben (Niveaus und Energien). Als `spoiler` würde es in jeder Aufgabe die Angaben verstecken.
- **c mit 2,998 · 10⁸ m/s:** Gleiche Genauigkeit wie h (4 Ziffern), passt zum gerechneten Wert.
- **u über der Zahl der Niveaus → höchstes Niveau:** Wer den Regler bei Wasserstoff nach rechts schiebt, erwartet einen Sprung von weit oben, nicht Lyman-α.
- **Seriengrenze (n → ∞) nicht als wählbarer Übergang:** Das Termschema zeigt E = 0 als Ionisierungslinie; die Grenze wird in Aufgabe 5 gerechnet. Ein eigener Übergang ins Kontinuum würde Termschema und Spektrum unnötig verkomplizieren.

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3469/3469 grün (151 Dateien), Build ok.
