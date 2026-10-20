# Prüfprotokoll: `kraefteaddition` – Kräfte addieren und zerlegen

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `a7df590` · Bogen: `scratchpad/boegen/kraefteaddition.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Formelzeichen im Bild mit echtem Index statt „F_R“/„F_G“/„F_S“, Rest-Resultierende „F_R = 0 N“ am Ring bei geschlossenem Krafteck entfernt, falsche Formel „F · cos 150°“ bei senkrechter Zerlegung, Spoiler für Aufgaben, Federwaagen bei `vals=0` verdeckt, „1-Fachen“ ersetzt, Lernmaterial EN auf DE-Umfang ergänzt, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):** Richtungen als Winkel gegen die Waagerechte nach rechts, gegen den Uhrzeigersinn positiv; g = 9,81 N/kg.
  1. Start (4 N bei 0°, 3 N bei 90°): F_R = √(4² + 3²) N = √25 N = 5 N, Richtung arctan(3/4) = 36,9° → „F_R = 5 N in Richtung 37°“ ✓.
  2. Schlepper (5 N bei 30° und −30°, γ = 60°): F_R² = 25 + 25 + 2 · 5 · 5 · cos 60° = 75 → F_R = 8,66 N → „8,7 N“ ✓ (= 2 · 5 · cos 30°).
  3. Zerlegen 8 N bei 30° in 0°/90°: 8 · cos 30° = 6,93 N → „6,9 N“, 8 · sin 30° = 4 N ✓. Zerlegen 6 N bei −90° in 170°/10°: Winkel zwischen den Richtungen 160°, je Komponente 6 N / (2 · sin 10°) = 17,28 N → „17,3 N“ ✓ (zusammen 34,6 N, viel mehr als 6 N).
  4. Lampe 2 kg, α = 10°: F_G = 2 · 9,81 = 19,62 N; F_S = 19,62 N / (2 · 0,17365) = 56,49 N → „56,5 N“ ✓. Wäscheleine 1,5 kg, 5°: F_G = 14,72 N, F_S = 14,72 / (2 · 0,08716) = 84,4 N, Verhältnis 1/(2 · sin 5°) = 5,74 ✓ (unter dem Messbereich 100 N). Lampe nach oben gezogen auf 13°: 19,62 / (2 · 0,22495) = 43,6 N ✓.
- **Sonderfälle:** F₁ = 0 → F_R = F₂ ✓; gleich große Kräfte bei 180° → 0 ✓ (Anzeige „F_R = 0 N – die Kräfte heben sich auf“, Pille „Gleichgewicht“); gleich große Kräfte unter 120° → F_R = F ✓; parallele Zerlegungsrichtungen → Hinweis „lässt sich nicht zerlegen“ ✓; α = 2° (Reglergrenze) bei 10 kg → 1405,5 N, „Messbereich überschritten!“ ✓; F_S bei α → 0 unendlich, Regler beginnt bei 2° ✓.
  - Fehler: Beim Krafteck aus Aufgabe 3 (w3 = −143°) bleibt rechnerisch 0,011 N übrig. Das Ergebnis zeigte „F_R = 0,0 N in Richtung …°“, im Bild hing ein Pfeil „F_R = 0 N“ am Ring. Jetzt gilt überall dieselbe Schwelle 0,05 N (= Rundung der Anzeige auf 0,1 N): Ergebnis „F_R = 0 N – die Kräfte heben sich auf“, kein Restpfeil.
  - Fehler: Senkrechte Zerlegung mit F im 2. Quadranten (z. B. 5 N bei 150° in 0°/90°) zeigte „F₁ = F · cos 150° = 4,3 N“ (cos 150° ist negativ). Jetzt wird der spitze Winkel zur Richtungsgeraden genommen: „F · cos 30° = 4,3 N, F · sin 30° = 2,5 N“ ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** N mit 1 Nachkommastelle, Winkel ganzzahlig, Dezimalkomma und „−“ über `fmt` ✓. Zwischen Zahl und Einheit jetzt geschütztes Leerzeichen in allen Texten mit Platzhaltern (lokal in `tr`).
- **Begriffe wie im Unterricht:** Kraftpfeil, Betrag, Richtung, Angriffspunkt, Resultierende (Ersatzkraft), Kräfteparallelogramm, Aneinanderhängen/Krafteck, Gegenkraft, Kräftegleichgewicht, Komponenten, Seilkraft, Gewichtskraft, Federwaage ✓. „1-Fachen der Gewichtskraft“ bei α = 30° → „Jedes Seil zieht genau mit der Gewichtskraft.“
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/kraefteaddition.test.ts` (Sonderfälle: Kraft 0, gleich große Kräfte bei 60°/120°/180°, Gegenkraft, Zerlegung bei 150°; alle Aufgaben des Lernmaterials mit den Werten oben); jetzt 9 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 √(36 + 64) = 10 N, arctan(8/6) = 53,1° ✓; A2 8,7 kN ✓; A3 Gegenkraft 5 N bei 36,9° + 180° = 216,9° ≙ −143° ✓ (Krafteck schließt sich, Rest < 0,05 N); A4 6,9 N und 4 N ✓; A5 56,5 N ≈ 2,9 · F_G ✓; A6 sin α = ½ → 30°, bei 5° das 5,74-Fache ✓. Alle Links mit simshot geladen.
- **Aufgabenmodus:** A1/A2/A4 verrieten die Lösung über das nicht verdeckte Ergebnis „Vergleich“ („Die Resultierende ist 10 N groß“, „Zusammen 10,9 N“) → `spoiler`. A5 verriet sie über „Vergleich“ (das 2,88-Fache) und über die Federwaagen/Diagramm-Pille „56,5 N“ → „Vergleich“ ist `spoiler`, `vals=0` verdeckt jetzt auch die Anzeigen der Federwaagen und die Pille „F_S = …“, der Link von A5 setzt `vals=0`; „Lösung zeigen“-Link bei A5 ergänzt.
- **„Beispiel laden“ geklickt:** alle sechs (3 N und 4 N, drei Kräfte aneinander, Gleichgewicht, Kraft zerlegen, Lampe, Wäscheleine) – passen.
- **Texte vereinfacht/korrigiert:** DE: „Entgegengesetzt: F_R = F₁ − F₂“ um „größere minus kleinere Kraft, bei Gleichheit 0 N“ ergänzt; bei der Zerlegung gesagt, was α ist (Winkel zwischen F und Richtung 1). EN war stark gekürzt (3 statt 6 Aufgaben, 5 statt 6 Ausprobieren-Punkte, ohne allgemeine Formel und Sonderfälle) → vollständig auf DE-Umfang übersetzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung; auf iPad quer ist die Bühne groß genug (Parallelogramm und Lampenszene gut lesbar). Lampe zusätzlich bei 1024 px und 390 px (α = 2°, 10 kg) angesehen.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf. Beschriftungen „F_R“, „F_G“, „F_S“ (sichtbarer Unterstrich) im Bild, in den Pillen und im Diagramm → jetzt mit tiefgestelltem Index. Rest: Bei der Zerlegung kann die Beschriftung „Richtung 2“ eine Komponentenbeschriftung berühren, wenn deren Spitze genau am Richtungsgriff liegt (z. B. F = 5 N bei 150°); bei α = 2° auf dem Handy rücken die Pfeile am Knoten eng zusammen (Extremfall). Nicht geändert.
- **Touch (Ziehen) und Maus:** mit der Maus geprüft: Pfeilspitze F₁ ziehen → 3,5 N bei 60° (Einrasten auf 15° und halbe Newton) ✓; Lampe nach oben ziehen → α = 13°, 43,6 N ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; alles auch über Regler einstellbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Resultierende, Rechnung, Komponenten und Seilkraft stehen als Text in den Ergebnissen.
- **Farben:** Kraftpfeile aus `ctx.theme.series`, jeder Pfeil zusätzlich beschriftet (F₁, F₂, F₃, F_R, Gegenkraft) – nicht nur über Farbe unterscheidbar ✓. Feste Materialfarben für Ring, Seil, Holz, Lampe, Hemd.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/kraefteaddition/index.ts` | Canvas-Text mit tiefgestelltem Index (`richParts`/`richDraw` in `haloText`, `pill` und Diagramm-Beschriftungen) |
| `src/simulations/physik/kraefteaddition/index.ts` | Schwelle 0,05 N für „F_R = 0“ im Ergebnis, für den Resultierenden-Pfeil und die Gegenkraft |
| `src/simulations/physik/kraefteaddition/index.ts` | senkrechte Zerlegung: spitzer Winkel in „F · cos γ / F · sin γ“ |
| `src/simulations/physik/kraefteaddition/index.ts` | „Vergleich“ (Addieren/Zerlegen und Lampe) als `spoiler`; `vals=0` verdeckt Federwaagen-Anzeigen und F_S-Pille |
| `src/simulations/physik/kraefteaddition/index.ts` | `tr`: geschütztes Leerzeichen zwischen Zahl und Einheit; „genau mit der Gewichtskraft“ statt „1-Fachen“ (DE/EN) |
| `src/content/simulations/de/kraefteaddition.md` | Entgegengesetzt/Gleichheit, Bedeutung von α bei der Zerlegung, A5 mit `vals=0` und Lösungslink, Hinweis zu `vals=0` |
| `src/content/simulations/en/kraefteaddition.md` | auf DE-Umfang ergänzt (Einführung, 6 Ausprobieren-Punkte, 6 Aufgaben, Unterrichtsideen) |
| `tests/kraefteaddition.test.ts` | 2 neue Tests (Sonderfälle, Aufgaben) |

## 6. Für den Kern (nicht selbst ändern)
- Wieder eigener Code für tiefgestellte Indizes im Canvas (wie `hebelgesetz`, `hookesches-gesetz`). Ein gemeinsamer Helfer in `src/sim-core/` bleibt sinnvoll, ebenso ein Weg, `Plot.text` mit Index zu schreiben.
- Geschütztes Leerzeichen zwischen Zahl und Einheit wieder lokal in `tr` gelöst.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- `vals=0` („Beträge an den Pfeilen“) verdeckt jetzt auch die Anzeigen der Federwaagen und die Pille „F_S = …“ im Diagramm, damit Aufgabe 5 nicht sofort beantwortet ist. Die Kurve im Diagramm bleibt sichtbar (Ablesen als Kontrolle). In Ordnung so, oder soll der Schalter eine eigene Beschriftung bekommen?
- Aufgabe 3 lädt mit eingeblendeter Resultierender (5 N am Krafteck sichtbar) – als Hilfe gedacht, die Aufgabe verlangt das Einstellen. So belassen?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2901/2901 grün (125 Dateien), Build ok.
