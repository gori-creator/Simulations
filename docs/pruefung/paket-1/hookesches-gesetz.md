# Prüfprotokoll: `hookesches-gesetz` – Hookesches Gesetz

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `67dc04d` · Bogen: `scratchpad/boegen/hookesches-gesetz.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Formelzeichen im Bild und im Ergebnis „Momentan“ mit echtem Index statt „F_G“/„F_Feder“, überdehnte Messwerte in der Tabelle zusätzlich mit „*“ statt nur über die Farbe, „wiegt knapp 1 N“ ersetzt, Hinweis zu g ≈ 10 N/kg, Lernmaterial EN auf DE-Umfang ergänzt, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):** g = 9,81 N/kg, Elastizitätsgrenze einer neuen Feder bei s = 25 cm, darüber halbe Federhärte.
  1. Messreihe automatisch (D = 20 N/m, 50-g-Stücke): 150 g → F = 0,15 kg · 9,81 N/kg = 1,4715 N → „1,47“; s = 1,4715 N / 20 N/m = 0,0736 m → „7,4 cm“ ✓; 400 g → 3,924 N / 20 N/m = 19,6 cm ✓; Steigung der Ursprungsgeraden „D ≈ 20 N/m“ ✓.
  2. Nebeneinander, D₁ = 20 N/m, D₂ = 60 N/m, 200 g: D = 80 N/m, s = 1,962 N / 80 N/m = 0,0245 m → „2,5 cm“ ✓; Kräfte 1,962 N · 20/80 = 0,49 N und 1,47 N (Last hängt bei ¾ des Stangenabstands Richtung harter Feder) ✓; „D = D₁ + D₂ = 80 N/m“ ✓.
  3. Beispiel „Feder überdehnen“ (10 · 100 g, D = 20 N/m): F = 9,81 N; Grenze 20 N/m · 0,25 m = 5 N; s = 0,25 m + (9,81 − 5) N / 10 N/m = 0,731 m → „73,1 cm“ ✓; bleibend 4,81 N · (1/10 − 1/20) m/N = 0,2405 m → „24,1 cm“ ✓; danach 300 g: 0,2405 m + 2,943 N / 20 N/m = 38,8 cm (Anzeige beim Einschwingen 38,6 cm) ✓.
  4. Hintereinander 20/20 N/m, 200 g: 1/D = 1/20 + 1/20 → D = 10 N/m, s = 1,962 N / 10 N/m = 19,6 cm, je Feder 9,8 cm ✓; Grenze der Anordnung min(5 N, 5 N) = 5 N ✓.
  - Modell geprüft: bleibende Verlängerung `(Y − Y₀)·(1/(D·½) − 1/D)` ist stetig und auch bei wiederholtem Überdehnen konsistent; Bisektion für nebeneinander monoton ✓.
- **Sonderfälle:** 0 Massestücke → s = 0, kein Pfeil, Punkt (0|0) wird bei der automatischen Messreihe eingetragen ✓; negative Kraft wird auf 0 begrenzt ✓; genau an der Elastizitätsgrenze (5 N) noch nicht überdehnt ✓; Maximum 10 · 100 g an D = 10 N/m bleibt im Bild (Maßstab passt sich an) ✓; Division durch 0: D ≥ 10 N/m über den Regler, Ursprungsgerade erst ab 2 elastischen Punkten mit s > 0 ✓; Federn lassen sich beim Ziehen nicht unter die Ruhelänge stauchen ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** N mit 2, cm mit 1 Nachkommastelle, D in N/m und N/cm; Dezimalkomma über `fmt` ✓.
- **g:** durchgehend 9,81 N/kg (Modell, Ergebnis „Hookesches Gesetz“, Lernmaterial). Hinweis für Klassen mit g ≈ 10 N/kg jetzt im Lernmaterial (DE und EN), wie bei `hebelgesetz`.
- **Begriffe wie im Unterricht:** Gewichtskraft, Federkraft, Verlängerung, Federhärte (Hinweis auf „Federkonstante“ im Lernmaterial), Ursprungsgerade, Elastizitätsgrenze, Federkraftmesser ✓. „Ein Massestück von 100 g wiegt knapp 1 N“ vermischte Masse und Kraft → „Auf ein Massestück von 100 g wirkt eine Gewichtskraft von knapp 1 N“.
- **Neue/ergänzte Tests:** 3 neue Tests in `tests/hookesches-gesetz.test.ts` (alle Aufgaben des Lernmaterials, Beispiel „Feder überdehnen“ mit 73,1 cm/24,1 cm und Grenzfall 5 N, nebeneinander 20/60 N/m); jetzt 8 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 0,3 kg · 9,81 N/kg = 2,94 N ✓; A2 1,962 N / 0,0981 m = 20 N/m ✓ (Link zeigt 9,8 cm); A3 2,943 N / 25 N/m = 11,8 cm ✓; A4 1 N / 50 N/m = 2 cm ✓ (Link mit 500 g bleibt unter der Grenze 12,5 N); A5 19,6 cm, je 9,8 cm, nebeneinander 4,9 cm ✓; A6 qualitativ ✓. Links mit simshot geladen, Werte stimmen.
- **„Beispiel laden“ geklickt:** alle sechs (Start, weiche Feder, harte Feder, hintereinander, nebeneinander, überdehnen) – passen.
- **Texte vereinfacht/korrigiert:** DE: „wiegt“ ersetzt, Modell-Hinweis zu g. EN war stark gekürzt (Einführung ohne Rechenbeispiel, 4 statt 5 Ausprobieren-Punkte, 2 statt 6 Aufgaben, knappe Unterrichtsideen) → auf DE-Umfang ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung; auf Handy und iPad quer stehen Stativ und Diagramm untereinander, beide gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf. Kraftpfeile waren mit „F_G“ und „F_Feder“ (sichtbarer Unterstrich) beschriftet → jetzt mit tiefgestelltem Index; ebenso im Ergebnis „Momentan“ (`<sub>`).
- **Touch (Ziehen) und Maus:** mit der Maus geprüft: Massestücke nach unten ziehen und loslassen → Feder schwingt gedämpft, Kraftpfeile ändern sich ✓; Kasten antippen hängt ein Stück an, Stapel antippen nimmt eins ab ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Feder springt direkt in die Ruhelage)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; Anhängen/Abnehmen auch über Knöpfe und Regler.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Kraft, Verlängerung und Messtabelle stehen als Text in den Ergebnissen.
- **Farben:** aus `ctx.theme`; überdehnte Messwerte waren in der Tabelle nur farbig markiert → jetzt zusätzlich „*“ mit Erklärung unter der Tabelle. Im Diagramm liegen sie zusätzlich in der beschrifteten Fläche oberhalb der Elastizitätsgrenze. Feder, Massestücke und Stativ haben feste Materialfarben.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/hookesches-gesetz/index.ts` | Pfeilbeschriftungen mit tiefgestelltem Index (`arrow`) |
| `src/simulations/physik/hookesches-gesetz/index.ts` | Ergebnis „Momentan“ als HTML mit F<sub>G</sub> |
| `src/simulations/physik/hookesches-gesetz/index.ts` | Messtabelle: „*“ bei überdehnten Messwerten und Erklärung (`overMark`, DE/EN) |
| `src/content/simulations/de/hookesches-gesetz.md` | „wiegt knapp 1 N“ ersetzt; Hinweis zu g ≈ 10 N/kg |
| `src/content/simulations/en/hookesches-gesetz.md` | auf DE-Umfang ergänzt (Einführung, 5 Ausprobieren-Punkte, 6 Aufgaben, Unterrichtsideen) |
| `tests/hookesches-gesetz.test.ts` | 3 neue Tests mit den nachgerechneten Werten |

## 6. Für den Kern (nicht selbst ändern)
- Wieder eigener Code für tiefgestellte Indizes im Canvas (hier in `arrow`). Ein gemeinsamer Helfer in `src/sim-core/draw.ts` (vgl. `hebelgesetz`, `energieerhaltung`) bleibt sinnvoll.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Das Überdehnen ist ein bilineares Modell (Elastizitätsgrenze bei 25 cm, danach halbe Federhärte). Das steht im Lernmaterial als stark vereinfacht. So belassen?
- Die automatische Messreihe trägt auch den Punkt (0|0) in die Tabelle ein. Das ist fachlich richtig (Nullmessung). Gewünscht?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2887/2887 grün (125 Dateien), Build ok.
