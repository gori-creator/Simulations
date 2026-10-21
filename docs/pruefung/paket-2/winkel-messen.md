# Prüfprotokoll: `winkel-messen` – Winkel schätzen und messen

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `0ca9516` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/winkel-messen/winkel-messen.png` (außerhalb des Repos)

## Ergebnis
korrigiert (eine Rückfrage zur Tastaturbedienung des Schätzspiels offen)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Beispiel „Überstumpfer Winkel“ (α = 230°, [SA bei 10°): [SB liegt bei 10° + 230° = 240°. Geodreieck an [SB (φ = 240°), anderer Schenkel bei 10° − 240° = −230° ≙ 130° über der Kante → äußere Skala 130°, α = 360° − 130° = 230°. Anzeige: „130° (äußere Skala) → α = 360° − 130° = 230°“ ✓. Vollkreis an [SA: 240° − 10° = 230° direkt ✓.
  2. Aufgabe 2 (α = 40°, [SA bei 180°): Kante auf [SA, [SB bei 220°; Lage über der Kante 220° − 180° = 40° → äußere Skala 40°, innere 180° − 40° = 140° (Leons Fehler) ✓.
  3. Grenze 181° ([SA bei 0°): an [SB (181°) angelegt, [SA liegt bei 0° − 181° ≙ 179° → β = 179° außen, innen 1°, α = 360° − 179° = 181° ✓ (Anzeige im Bild bestätigt, als Test ergänzt).
  4. Ziehen mit der Maus: Griff B von 70° auf 135° gezogen → α = 135° − 20° = 115°, „stumpfer Winkel“, Geodreieck folgt, „115° (äußere Skala)“ ✓. Griff A auf ≈ −20,5° gezogen → α = 70° − 340° ≙ 90° (Einrasten ±2°), „rechter Winkel“ ✓.
  5. Aufgabe 4 (Uhr): 360° : 60 min = 6°/min; 10 min → 60°, 45 min → 270° ✓.
- **Winkelarten und Grenzen:** `angleType` mit strikten Grenzen: 0° Nullwinkel, 1°/89° spitz, 90° recht, 91°/179° stumpf, 180° gestreckt, 181°/359° überstumpf, 360° Vollwinkel ✓ (wie im bayerischen Unterricht).
- **Skalen:** Innen/außen je nach Lage der Kante richtig; überstumpf am Geodreieck nur über den Ergänzungswinkel, an [SA angelegt meldet die Anleitung „liegt nicht unter der Skala“ ✓.
- **Sonderfälle:** α = 0° (Ablesen 0°), 180° (180° außen), 360°: Geodreieck zeigte „0° (äußere Skala)“ ohne Hinweis auf α → jetzt als Ergänzungswinkel „0° → α = 360° − 0° = 360°“. Vollkreis zeigt 360° ✓. Keine Division.
- **Schätzspiel:** Zufall über `Math.random`, ≈ 35 % spitz, 35 % stumpf, 30 % überstumpf, nie 90°/180°, Zeichnen in 5°-Schritten, neue Aufgabe ≥ 15° von der vorigen entfernt. Bewertung: Betrag der Abweichung, 3/2/1/0 Punkte bis 3°/10°/20°/darüber – fair und nachvollziehbar; Ergebnis zeigt verlangt/geantwortet/Abweichung, gestrichelter Geisterschenkel und Abweichungsbogen.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** nur ganze Grad; `−` in allen Formeln; Durchschnitt über `fmt.num` ✓.
- **Begriffe wie im Unterricht:** Scheitel, Schenkel [SA/[SB, ∢ASB gegen den Uhrzeigersinn, Ergänzungswinkel, Nullpunkt, Zeichenkante ✓.
- **Neue/ergänzte Tests:** Grenze 179°, Null-/gestreckter/Vollwinkel am Geodreieck, 181° über [SB, `deviation` symmetrisch, `points(20)`, `dragAngle` ohne Magnet (Zeichnen), Zufallsaufgaben mit Abstand ≥ 15° und Vielfalt.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1 (Winkelarten), 2 (40°/140°), 3 (β = 65°, α = 295°), 4 (60°/270°), 5 (112°, 38°, 205°) ✓.
- **„Beispiel laden“ geklickt:** alle Beispiele und Aufgabenlinks geladen; Abweichung: Der Link „270° zeigen“ (Uhr) zeigte mit [SA bei 90° das falsche Winkelfeld (gegen den Uhrzeigersinn von 12 Uhr nach 3 Uhr) statt der vom Minutenzeiger überstrichenen Fläche → `a1=180`, mit Satz zur Drehrichtung.
- **Texte:** EN-Lernmaterial war stark gekürzt (ohne Nullwinkel, ohne Aufgaben 1 und 5, nur 4 Ausprobieren-Punkte, kürzere Lehrkräfte-Hinweise) → an DE angeglichen. In DE und EN die Punktewertung des Schätzspiels für Lehrkräfte ergänzt. EN-Merksatz zum rechten Winkel („small square or …“) an DE angeglichen (Viertelkreis mit Punkt).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Karten vollständig, Seitenspalte bei iPad quer, Karten unter der Fläche bei Handy/iPad hoch; Schrift am Beamer lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine gefunden.
- **Touch (Ziehen) und Maus:** Schenkel A und B per Maus gezogen (siehe oben), Einrasten bei 0°/90°/180°/270°/360°, kein Sprung über 0°/360°. Geodreieck verschiebbar/drehbar, rastet am Scheitel und an den Schenkeln ein. Touch läuft über Pointer-Events des Kerns.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Tweens springen ans Ende).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Regler, Auswahl und Aktionen erreichbar; „Messgerät anlegen“ ersetzt das Ziehen. Schätzspiel: Schätzwert und gezeichneter Winkel nur auf der Zeichenfläche einstellbar → Rückfrage.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Ergebnisse (Winkel, Winkelart, Ablesung, Punktestand) als Ausgaben. Alt-Text statisch (nennt immer „Geodreieck“).
- **Farben:** nur aus `ctx.theme` (series/text/muted/bg; Kartenflächen wie in den anderen Simulationen fest hell/dunkel). Winkelart wird zusätzlich als Text genannt, Punkte als Text – nichts nur über Rot/Grün.
- **Spoiler:** Bei „Winkelgröße anzeigen“ aus verriet die Merke-Karte über den Merksatz die Winkelart (z. B. „Spitze Winkel sind …“ in Aufgabe 2) → jetzt nur die Schätzhilfe.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/winkel-messen/index.ts` | Merke-Karte bei verdeckter Größe ohne Winkelart (nur Schätzhilfe); EN-Text `tipRecht` an DE angeglichen |
| `src/simulations/mathematik/winkel-messen/model.ts` | Vollwinkel am Geodreieck: Ablesung 0° als Ergänzungswinkel (Anzeige „α = 360° − 0° = 360°“) |
| `tests/winkel-messen.test.ts` | Grenzen 179°/181°, Null-/gestreckter/Vollwinkel, Abweichung, Zeichnen ohne Magnet, Zufallsaufgaben |
| `src/content/simulations/de/winkel-messen.md` | Uhr-Link `a1=180` mit Erklärung; Punktewertung des Schätzspiels |
| `src/content/simulations/en/winkel-messen.md` | an DE angeglichen (Nullwinkel, alle 5 Aufgaben, 7 Ausprobieren, Lehrkräfte-Hinweise, Uhr-Link) |

## 6. Für den Kern (nicht selbst ändern)
- Die Beschreibung der Zeichenfläche (`aria-label`) ist nur beim Start setzbar; eine Möglichkeit, sie zur Laufzeit zu ändern (z. B. „Vollkreis“ statt „Geodreieck“, aktueller Winkel), wäre hilfreich.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Tastatur im Schätzspiel:** Schätzwert (Leiste, −/+) und das Zeichnen von [SB gehen nur per Maus/Finger auf der Zeichenfläche. Für Tastatur/Bildschirmleser bräuchte es z. B. einen Regler „Deine Schätzung“ bzw. „gezeichneter Winkel“ in der Steuerleiste (neuer Parameter, nur im Spielmodus sichtbar). Das ist ein Umbau des Spielablaufs – bitte entscheiden.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2879/2879 grün (125 Dateien), Build ok.
