# Prüfprotokoll: `dreieckskonstruktion` – Kongruenzsätze und Dreieckskonstruktionen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `8c519c3` (Basis) · Bogen: `scratchpad/pruefung/dreieckskonstruktion/dreieckskonstruktion.png` (nicht im Repo)

## Ergebnis
korrigiert (Titel der Ergebniskarte bei SSW/WWW, englisches Lernmaterial ergänzt, ein Link korrigiert, Tests ergänzt); bekannte Darstellungsmängel bei Extremwerten bleiben offen.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. SSS mit a = 3, b = 4, c = 5: x = (b² + c² − a²) : (2c) = (16 + 25 − 9) : 10 = 3,2; y = √(16 − 3,2²) = √5,76 = 2,4, also C = (3,2 | 2,4). Weil 3² + 4² = 5² ist, gilt γ = 90°. Die Anzeige zeigt α ≈ 36,9°, β ≈ 53,1° und γ ≈ 90° ✓
  2. SWS mit b = 4,5, c = 6, α = 50°: a² = 20,25 + 36 − 54 · cos 50° = 56,25 − 34,711 = 21,539, also a ≈ 4,641. Aus sin β = 4,5 · sin 50° : 4,641 ≈ 0,743 folgt β ≈ 48,0° und damit γ ≈ 82,0°. Die Anzeige zeigt a ≈ 4,6 cm, β ≈ 48° und γ ≈ 82° ✓
  3. WSW mit c = 6, α = 50°, β = 60°: γ = 70°, k = 6 : sin 70° = 6,385. Daraus a = k · sin 50° ≈ 4,891 und b = k · sin 60° ≈ 5,530 ✓
  4. SSW mit c = 6, α = 30°, a = 4: t = 6 · cos 30° ± √(16 − 36 · sin² 30°) = 5,196 ± √7 ergibt b ≈ 7,842 oder b ≈ 2,550. Aus sin γ = 6 · 0,5 : 4 = 0,75 folgt γ₁ ≈ 48,6° und γ₂ ≈ 131,4° ✓
     - Mit a = 3 ist h = 6 · sin 30° = 3, der Kreis berührt den Schenkel. Es gibt eine Lösung, b = 5,196 und γ = 90° ✓
     - Mit a = 2 gibt es keine Lösung ✓
  5. SsW-Link mit c = 6, α = 30°, a = 7: b = 5,196 + √(49 − 9) ≈ 11,52 und γ = arcsin(3/7) ≈ 25,4°. Die Anzeige zeigt b ≈ 11,5 cm und γ ≈ 25,4° ✓
  6. Rand des Reglers, SWS mit α = 170°: a = √(56,25 + 53,18) ≈ 10,46, β ≈ 4,3°, γ ≈ 5,7° ✓
- **Sonderfälle:**
  - SSS 2, 3, 6: kein Dreieck, Lücke 1 cm ✓
  - SSS 3, 4, 7 und 1, 1, 2: flach, „C läge auf [AB]“ ✓
  - WSW 100° + 80°: Schenkel parallel ✓
  - WSW 110° + 85°: Schenkel laufen auseinander ✓
  - SSW mit a = c und α ≥ 90°: kein Dreieck ✓
  - Durch die Reglergrenzen (c ≥ 2, Winkel 10–170°) gibt es keine Division durch 0.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:**
  - Längen in cm mit 1 Nachkommastelle, gemessene Winkel mit 1 Nachkommastelle und „≈“ ✓
  - Im Bereich „Ergebnisse“ steht bei SWS β ≈ 48° ohne Nachkommastelle, in der Karte β ≈ 48,0°. Das ist unkritisch.
- **Begriffe:** Kongruenzsätze SSS, SWS, WSW, SsW; SSW und WWW sind keine Kongruenzsätze. Die Konstruktionsbeschreibung ist im Heftstil geschrieben („Zeichne …“, „Trage in A an [AB] den Winkel … an“). In Ordnung.
- **Neue Tests:** neuer Block „Prüfrunde Paket 2“ mit diesen Fällen:
  - SWS mit α = 170°
  - SsW mit c = 6, a = 7, α = 30°
  - γ₁ + γ₂ = 180° (Aufgabe 4)
  - SSS an den Reglergrenzen (flach; gleichschenklig 12, 12, 10)
  - WSW 10° + 10° und 170° + 10°

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgaben 1–6 stimmen; die Werte stehen oben in Abschnitt 1. Aufgabe 6: c · 1,6 = 6,4 cm, das passt zu FAMILY = 1,6 ✓
- **„Beispiel laden“:** Alle 14 Links im DE-Lernmaterial und beide „Aufgabe laden“-Links (`meas=0&_hide=1`, leeres Blatt, Ergebnis verdeckt) wurden geladen. Keine Konsolenfehler, die Anzeigen stimmen.
- **Korrigiert:**
  - DE, „Ausprobieren“ 6: Der SsW-Link sollte „a über 6 cm hinaus“ zeigen, stellte aber c = 5, a = 6, α = 50° ein. Jetzt steht dort `?cs=ssw&c=6&a=7&al=30`.
  - EN: Das englische Lernmaterial war deutlich kürzer. Es fehlten Aufgabe 3 (WSW), Aufgabe 5, Aufgabe 6, die SSW-Fallunterscheidung als Liste, vier Punkte in „Try it“ und Teile der Hinweise für Lehrkräfte. EN wurde inhaltlich an DE angeglichen.

## 3. Geräte (Prüfbogen)
- **Alle Ansichten, hell und dunkel:** Die Karten sind vollständig. Auf dem Tablet ist die Schrift in den Karten klein (ca. 11 px, bekannt), aber lesbar. Am Beamer ist alles lesbar.
- **Überlappungen:**
  - Kein Überlauf.
  - Bekannt: Bei SWS mit α = 170° überlappen sich die Beschriftungen „α = 170°“ und „a ≈ 10,5 cm“.
  - „γ ≈ 5,7°“ wird am linken Papierrand abgeschnitten, in der Planfigur verdeckt die Beschriftung b den Punkt C.
  - Auf dem Handy (360 px) wird C₁ im SSW-Beispiel oben rechts knapp angeschnitten.
  - Ein Versuch mit mehr seitlichem Rand hat nur den Rand verschoben und den Griff über die Beschriftung gelegt. Er wurde wieder zurückgenommen, siehe Abschnitt 7.
- **Touch und Maus:** Griffe an B, C, an den Schenkeln und an den Radien sind vorhanden (Code und Tipp-Zeile). Ein Ziehtest wurde im Bogen nicht eigens gemacht.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (bei `reduced` springt die Ansicht sofort auf den letzten Schritt)
- **Tastatur:** Die Tab-Reihenfolge ist logisch. Alle Bedienelemente haben Namen (JSON: keine ohne Namen).
- **Beschreibung der Grafik:** Der Alt-Text beschreibt Papier, Werkzeuge, Planfigur, Konstruktionsbeschreibung und Ergebniskarte ✓
- **Farben:**
  - Das Urteil ist immer auch mit ✓, ✗ oder ⚠ und Text gekennzeichnet, also nicht nur über Rot/Grün ✓
  - Die Werkzeuge (Holz und Metall von Zirkel, Bleistift und Geodreieck), das Papier und die Kartenhintergründe verwenden feste Hex- bzw. rgba-Farben je Hell/Dunkel statt `ctx.theme`. Das ist als Darstellung von Gegenständen vertretbar, siehe Abschnitt 6.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/dreieckskonstruktion/index.ts` | Titel der Ergebniskarte: bei SSW (a < c) und WWW „SSW: kein Kongruenzsatz“ bzw. „WWW: kein Kongruenzsatz“ statt fälschlich „Kongruenzsatz SSW/WWW“ (EN: „SSA/AAA: no congruence criterion“) |
| `src/content/simulations/de/dreieckskonstruktion.md` | SsW-Link in „Ausprobieren“ 6 passend zum Text (c = 6, a = 7, α = 30°) |
| `src/content/simulations/en/dreieckskonstruktion.md` | inhaltlich an DE angeglichen: alle 6 Aufgaben, 7 Punkte in „Try it“, SSW-Fälle, Hinweise für Lehrkräfte |
| `tests/dreieckskonstruktion.test.ts` | 5 neue Tests (Reglergrenzen, SsW-Link, γ₁ + γ₂ = 180°) |

## 6. Für den Kern (nicht selbst ändern)
- Das Theme hat keine Farben für Gegenstände (Holz, Metall, Papier, Kartenhintergrund). Mehrere Simulationen mit Werkzeugen setzen deshalb eigene Hex-Werte. Vorschlag: Variablen wie `--plot-paper` und `--plot-card` ins Theme aufnehmen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Für die Beschriftungen bei Extremwerten fehlt eine Kollisionsvermeidung:
  - „α = 170°“ und „a ≈ …“ überlappen sich, „γ“ wird am Papierrand abgeschnitten.
  - In der Planfigur überlappen b und C.
  - Auf dem Handy wird C₁ angeschnitten.
  - Eine Lösung bräuchte einen Umbau der Beschriftungsplatzierung. Er ist hier nicht gemacht und sollte gesondert beauftragt werden.
- Bei SSW mit a = c lautet die Bedingungszeile „a ≥ c: Gegenwinkel der größeren Seite ✓“. Bei gleich langen Seiten ist „größere“ ungenau, und bei α ≥ 90° folgt darauf sogar „✗ kein Dreieck“. Fachlich ist das richtig (gleichschenklig, zwei Basiswinkel ≥ 90° sind unmöglich), die Formulierung könnte aber verwirren. Bitte entscheiden, ob für a = c eine eigene Zeile nötig ist.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2973/2973 grün (128 Dateien), Build ok.
