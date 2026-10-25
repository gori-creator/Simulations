# Prüfprotokoll: `prisma-zylinder` – Prisma und Zylinder: Oberfläche und Volumen

Prüfer: Paket 2 · Datum: 25.10.2026 · Stand: Commit `45c2f5d` · Bogen: `scratchpad/pruef/prisma-zylinder/prisma-zylinder.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Sechseckprisma r = 2 cm, h = 4 cm (Start): s = 2 · 2 · sin 30° = 2 cm, ρ = 2 · cos 30° = √3 ≈ 1,732 cm, G = 6 · ½ · 2 · 1,732 ≈ 10,39 cm², u = 12 cm, V = 10,392 · 4 ≈ 41,57 cm³, M = 12 · 4 = 48 cm², O = 2 · 10,392 + 48 ≈ 68,78 cm². Anzeige stimmt.
  2. Dreiecksprisma g = 4, h_g = 3, h = 5: Schenkel √(2² + 3²) = √13 ≈ 3,606 cm, u ≈ 11,21 cm, G = 6 cm², V = 30 cm³, M ≈ 56,06 cm², O ≈ 68,06 cm². Anzeige stimmt.
  3. Zylinder r = 2, h = 4: V = 16π ≈ 50,27 cm³, O = 8π + 16π = 24π ≈ 75,40 cm². Zylindernetz r = 1,5, h = 4: G ≈ 7,07 cm², u = 3π ≈ 9,42 cm, V = 9π ≈ 28,27 cm³, O = 4,5π + 12π = 16,5π ≈ 51,84 cm². Anzeige stimmt.
  4. Anteil n-Eck/Zylinder: n/(2π) · sin(2π/n), n = 6: 82,70 %, n = 25: 98,95 %, n = 26: 99,03 %.
- **Sonderfälle:** Reglergrenzen (n 3–40, r 1–4, g 1–8, h_g 1–6, h 1–8) liefern keine Division durch 0. Nicht ganzzahlige Höhe (h = 2,5) ergibt eine dünnere oberste Schicht, korrekt. Extremfall n = 40, r = 4, h = 8 auf dem Handy geprüft.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm/cm²/cm³ richtig. Dezimalkomma (DE) und Dezimalpunkt (EN) über `fmt`. Bisher stand bei exakten Werten oft „≈“ (u = 6 · 2 cm ≈ 12 cm, V ≈ 32 cm³). Beim Dreieck mit ungeraden Maßen stand dagegen „=“ vor einem gerundeten Wert (½ · 1,5 · 1,5 = 1,13). Korrigiert: „=“ nur bei exakt angezeigten Werten, sonst „≈“.
- **Begriffe wie im Unterricht:** Grundfläche G, Mantel M, Oberfläche O, Umfang u, Umkreisradius. In Ordnung.
- **Neue/ergänzte Tests:** Block „Werte aus dem Lernmaterial“: Aufgaben 1–5 (Dreiecksprisma, Zylinder, Sechseckmantel 48 cm², Dose 241,9 cm²/423,3 cm³, 98,95 %/99,03 %).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Alle fünf stimmen (A1 O ≈ 68 cm², A2 16π/24π, A3 M = 48 cm², A4 π · 7 · 11 ≈ 241,9 cm², π · 3,5² · 11 ≈ 423,3 cm³ < 500 cm³, A5 n = 26).
- **„Beispiel laden“ geklickt:** alle Ausprobier-, Aufgaben- und Lösungslinks sowie alle 6 Voreinstellungen. Bei n = 26 zeigte die Simulation „99 %“, weil auf 1 Stelle gerundet wurde. Das widersprach der Aufgabe („mehr als 99 %“). Jetzt sind es 2 Stellen: 99,03 % bzw. 98,95 %.
- **Texte vereinfacht/korrigiert:** Das EN-Lernmaterial war deutlich kürzer (3 statt 5 Aufgaben, 3 statt 5 Ausprobier-Punkte, keine Lösungswege, gekürzter Lehrkräfte-Teil). Ich habe es vollständig und inhaltlich gleich zum DE-Text neu gefasst. DE ist unverändert (Aufgaben in Du-Form, Lehrkräfte-Teil ohne direkte Anrede).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vollständig, Karten auf dem Tablet vorhanden, am Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** Kein Überlauf. Auf dem Handy (380 px) lief die Rechenkarte im Netz bei großen Werten unter die Zoom-Knöpfe, der Text wurde abgeschnitten. Korrigiert: Die Karte lässt rechts Platz und verkleinert bei Bedarf die Schrift. Restbefund (Randfall, nicht geändert): Bei n = 40, r = 4 wird die obere G-Beschriftung am Rand der angeklappten Fläche knapp. Beim spitzen Dreieck (g = 8, h_g = 1) ragen die Beschriftungen über die schmalen Dreiecke hinaus.
- **Touch (Ziehen) und Maus:** nur Drehen der 3D-Ansicht (Kern `View3D`). Keine eigenen Ziehpunkte.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Stapeln und Abrollen springen über `Tween` sofort ans Ende)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON regulär, alle Bedienelemente erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** Keine Bedienelemente ohne Namen. Die Zeichenfläche hat eine Beschreibung (DE/EN). Die Rechnung steht zusätzlich in den Ergebnissen.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Farben nur aus `ctx.theme` (`series`, `muted`, `text`, `gridMinor`). Kartenhintergründe sind feste rgba-Werte für hell/dunkel, wie in anderen Simulationen. Unterscheidung über Blau/Türkis/Violett/Orange, nicht allein Rot/Grün.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/prisma-zylinder/index.ts` | Hilfsfunktion `eq`: „=“ nur bei exakt angezeigten Werten, sonst „≈“. Gilt in Ergebnissen, Rechenkarte und Beschriftungen (G, M, u). |
| `src/simulations/mathematik/prisma-zylinder/index.ts` | Vergleich mit dem Zylinder auf 2 Nachkommastellen (99,03 % statt „99 %“). |
| `src/simulations/mathematik/prisma-zylinder/index.ts` | Rechenkarte lässt Platz für die Zoom-Knöpfe, Schrift wird bei Bedarf kleiner (mind. 9 px). |
| `src/content/simulations/en/prisma-zylinder.md` | Vollständig zum DE-Text angeglichen (5 Aufgaben mit Lösungswegen, 5 Ausprobier-Punkte, Lehrkräfte-Teil). |
| `tests/prisma-zylinder.test.ts` | Tests für die Werte aus dem Lernmaterial ergänzt. |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3034/3034 grün (131 Dateien), Build ok.
