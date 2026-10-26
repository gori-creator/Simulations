# Prüfprotokoll: `kreiszahl-pi` – Kreisumfang, Kreisfläche und die Zahl π

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` (Basis) · Bogen: `scratchpad/shots/sheet-pi.png` (nicht im Repo)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-1.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung

## Ergebnis
korrigiert (fachlich richtig; Texte, englische Formelzeichen und Grafikbeschreibung verbessert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Standard d = 2 cm: U = π · 2 cm ≈ 6,283 cm ✓ (Anzeige „U = π · 2 cm ≈ 6,283 cm“, EN „C = π · 2 cm ≈ 6.283 cm“).
  2. Sechseck: untere Schranke 6 · sin 30° = 3, obere 6 · tan 30° = 2√3 ≈ 3,4641 ✓ (Anzeige „3 < π < 3,4641“). Selbst nachgerechnet.
  3. 96-Eck: 96 · sin(1,875°) ≈ 3,14103 und 96 · tan(1,875°) ≈ 3,14271 ✓, passt zu Archimedes' 3 10/71 ≈ 3,1408 < π < 3 1/7 ≈ 3,1429.
  4. Aufgabe 1: π · 70 cm ≈ 219,9 cm; 1000 m : 2,199 m ≈ 454,7 → etwa 455 Umdrehungen ✓ (aus der Befundliste, selbst bestätigt).
- **Sonderfälle:** Reglergrenzen d = 1 und 4 cm, m = 3 bis 96; „Eckenzahl verdoppeln“ ist über 48 gesperrt ✓.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** über `fmt.num`, Nullen werden nicht angehängt („3 < π“) ✓.
- **Begriffe:** EN nutzt jetzt durchgehend C (circumference) statt U, auch in den Ergebnissen (vorher „U : d = π“ im Englischen).
- **Neue/ergänzte Tests:** keine (keine neue Rechenlogik).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 (siehe oben), A2 (706,9 cm² gegen 628,3 cm²) ✓, A3 ✓, A4 (6r = 3d) ✓.
- **„Beispiel laden“:** Sechseck, 48 Sektoren und „Abrollen“ (EN) angesehen, Anzeigen wie beschrieben.
- **Texte korrigiert:** DE A1 mit Einheiten und Zwischenwert 454,7; A4 „3 < π < 3,4641 (die Simulation zeigt diese Werte)“ und schärfere Begründung (Kreisbogen länger als Sechseckseite); Verweis auf `docs/BILDER.md` aus dem Lernmaterial gestrichen. EN: C statt U, A1-Lösung mit Rechenweg. Fehlende EN-Aufgaben nicht nachübersetzt (Projektregel).

## 3. Geräte
- **1360 hell/dunkel, 390 hell:** vollständig, keine Überlappungen, kein Überlauf, keine Konsolenfehler.
- **Touch/Maus:** keine Ziehpunkte, Bedienung über Knöpfe.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** unverändert (Tweens springen ans Ende).
- **Beschreibung der Grafik:** um den Archimedes-Modus ergänzt („… oder der zwischen zwei Vielecke eingeschlossen wird“ / „… or which is trapped between two polygons“).
- **Farben:** nur `ctx.theme` ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/kreiszahl-pi/index.ts` | EN-Ergebnisse mit C; Grafikbeschreibung DE/EN um Archimedes ergänzt |
| `src/content/simulations/de/kreiszahl-pi.md` | A1 Einheiten/Rundung, A4 Schranke 3,4641 und Begründung, Bilder-Verweis gestrichen |
| `src/content/simulations/en/kreiszahl-pi.md` | C statt U, A1 mit Rechenweg |

## 6. Für den Kern (nicht selbst ändern)
– 

## 7. Rückfragen
– 

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.

## Zweite Prüfung (Paket 2, 25.10.2026)

Unabhängiger zweiter Durchgang auf dem Zweig `pruefung/paket-2`, danach mit dem Stand oben zusammengeführt (beide Korrekturen sind enthalten).

Prüfer: Paket 2 · Datum: 25.10.2026 · Stand: Basis `3e0905d` · Bogen: `scratchpad/pruefung/kreiszahl-pi/kreiszahl-pi.png` (außerhalb des Repos)

### Ergebnis
korrigiert

### 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. d = 2 cm: U = π · 2 cm = 2π cm ≈ 6,283 cm (Anzeige stimmt). d = 4 cm: U = 4π cm ≈ 12,566 cm ✓.
  2. r = 1 cm: A = π · 1² = π cm² ≈ 3,142 cm²; d = 1 cm → r = 0,5 cm: A = 0,25π cm² ≈ 0,785 cm² ✓. Umgelegte Breite bei n = 12, r = 1: 12 · sin 15° = 12 · 0,258819 ≈ 3,1058 cm ✓; n = 4, r = 0,5: 4 · 0,5 · sin 45° = √2 ≈ 1,4142 cm ✓.
  3. Archimedes: m = 6 → 6 · sin 30° = 3, 6 · tan 30° = 2√3 ≈ 3,4641 ✓; m = 96 → 96 · sin 1,875° ≈ 3,14103, 96 · tan 1,875° ≈ 3,14271, also 3,1410 < π < 3,1427 ✓; m = 3 → 3 · sin 60° ≈ 2,5981, 3 · tan 60° = 3√3 ≈ 5,1962 ✓.
  4. Prüfwerte Lernmaterial: r = 3 cm → U = 6π ≈ 18,85 cm, A = 9π ≈ 28,27 cm²; d = 10 cm → U = 10π ≈ 31,42 cm (als Test abgesichert).
  5. Abrollen: Strecke = π · d; unter dem Boden 3 · d plus Rest (π − 3) · d ≈ 0,14 d ✓.
- **Sonderfälle:** d von 1 bis 10 cm (kein 0/negativ möglich); n = 4 und 48, m = 3 und 96 angesehen. Fehler: bei m = 3 und m = 4 ragte das umbeschriebene Vieleck aus dem Bild (Ausschnitt war fest ±1,35 r) → behoben (Ausschnitt richtet sich nach dem Vieleck). Verdoppeln über 96 ist gesperrt ✓.
- **Einheiten, Rundung, ≈/=:** Anzeige „Mit Zahlen“ zeigt jetzt zusätzlich das exakte Vielfache von π („= 2π cm ≈ 6,283 cm“). Beschriftung „0,14 d“ war gerundet ohne „≈“ → „≈ 0,14 d“. Schranken im Bild: m = 96 zeigte „3,141“ (abgeschnittene Null) → „≈ 3,1410“; exakte Werte (3 beim Sechseck, 4 beim Quadrat) ohne „≈“. Alle gerundeten Schranken (4 und 5 Stellen) schließen π für m = 3…96 weiterhin ein (Test).
- **Begriffe:** EN-Anzeige hieß „U“, die EN-Beschriftung im Bild „C“ → EN-Anzeige jetzt durchgehend „C“.
- **Neue Tests:** `tests/kreiszahl-pi.test.ts` (Prüfwerte, Archimedes 6/96, gerundete Schranken für alle m, Breite der umgelegten Sektoren, Ausdehnung des umbeschriebenen Vielecks).

### 2. Aufgaben und Texte (DE und EN)
- **Aufgaben gerechnet:** Fahrrad 70π ≈ 219,9 cm, 1000 : 2,199 ≈ 454,7 → 455 ✓; Pizza 225π ≈ 707 cm², 200π ≈ 628 cm² ✓; Sektoren und Sechseck (6r = 3d) ✓. Archimedes 3 10/71 ≈ 3,14085 > 3,1408, 3 1/7 ≈ 3,142857 < 3,1429 ✓.
- **Korrigiert:** DE „1000 : 2,199“ mit Einheiten und Zwischenergebnis; Sechseck-Schranke „π < 3,46“ → „π < 2√3 ≈ 3,464“; Hinweis ergänzt, dass Archimedes vorsichtig gerundet hat und die Simulation die genauen Schranken 3,1410/3,1427 zeigt; neue Aufgabe 1 (r = 3 cm, d = 10 cm, exakt und gerundet); Lehrkräfte-Hinweis in Sie-Form, mit Hinweis auf reduzierte Bewegung.
- **EN war stark gekürzt** (2 statt 4 Aufgaben, Kurzlösungen, Ideen-Abschnitt nur eine Zeile) → vollständig neu, inhaltlich gleich zu DE (5 Aufgaben, 3 Ausprobier-Punkte).
- **Beispiele/Links geladen:** alle 5 Beispiele und alle Links im Lernmaterial (flaeche n=12/48, archimedes, m=96) – in Ordnung.

### 3. Geräte (Prüfbogen)
- Alle Größen hell/dunkel ohne Überlauf, ohne Konsolenfehler. Nach Korrektur m = 3/4 auch auf dem Handy vollständig sichtbar.
- Auffällig, aber nicht geändert: Im Modus „Umfang“ ist auf dem Handy (Hochformat, aspectNarrow 0,85) unter dem Rad viel Leerraum, das Rad ist klein – liegt an der waagerechten Abrollstrecke.
- Kein Ziehen angeboten.

### 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Tween springt ans Ende).
- **Tastatur/Namen:** keine Bedienelemente ohne Namen ✓.
- **Grafikbeschreibung:** nannte nur Umfang und Fläche → Archimedes-Vielecke ergänzt (DE/EN).
- **Farben:** nur Theme-Farben; die Grauwerte der gezeichneten Ersatz-Radgrafik (ohne Foto) sind fest im Code (`#c8ced8`/`#4a5160`) – unkritisch, Ersatzgrafik. Ein-/umbeschrieben zusätzlich über Beschriftung unterscheidbar.

### 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/kreiszahl-pi/model.ts` | `outerExtent()` für den Bildausschnitt |
| `src/simulations/mathematik/kreiszahl-pi/index.ts` | Ausschnitt bei m = 3/4; exaktes π-Vielfaches in „Mit Zahlen“; „≈ 0,14 d“; Schranken im Bild mit „≈“ und 4 festen Stellen; EN „C“; Alt-Text |
| `tests/kreiszahl-pi.test.ts` | neu |
| `src/content/simulations/de/kreiszahl-pi.md` | Aufgabe 1 neu, Rechnungen/≈ präzisiert, Archimedes-Hinweis |
| `src/content/simulations/en/kreiszahl-pi.md` | vollständig an DE angeglichen |

### 6. Für den Kern (nicht selbst ändern)
- keine

### 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- ~~Durchmesser-Regler nur 1–4 cm~~ – entschieden: Bereich auf 1–10 cm erweitert, damit die Prüfwerte (r = 3 cm, d = 10 cm) einstellbar sind. Darstellung bei d = 10 cm in allen drei Themen angesehen (Ausschnitt skaliert mit), Schlüssel `d` unverändert.

### Prüfung
`npm run verify`: astro check 0/0/0, Tests 3030/3030 grün (131 Dateien), Build ok.
