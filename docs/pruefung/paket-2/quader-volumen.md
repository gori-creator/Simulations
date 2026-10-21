# Prüfprotokoll: `quader-volumen` – Volumen von Quadern mit Einheitswürfeln

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `51e3794` (Basis) · Bogen: `scratchpad/pruefung/quader-volumen/quader-volumen.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Quader 4 × 3 × 2 cm: 1 Reihe = 4 Würfel, 1 Schicht = 3 · 4 = 12 Würfel, 2 Schichten · 12 = 24 Würfel; V = 4 · 3 · 2 cm³ = 24 cm³. Zählhilfe „1 Reihe: 4 Würfel / 1 Schicht: 3 Reihen · 4 = 12 Würfel / 2 Schichten · 12 = 24 Würfel / V = 4 · 3 · 2 cm³ = 24 cm³“, Ergebnis „24 cm³ = 0,024 dm³ = 0,024 Liter = 24 ml“ ✓.
  2. Würfel a = 3 cm: V = 3³ = 27 cm³ ✓ (Anzeige 27 cm³ = 0,027 dm³).
  3. 10 × 10 × 10 cm (größter Quader, Reglergrenze 10): 10 · 10 · 10 = 1000 Würfel, 1000 cm³ = 1 dm³ = 1 Liter = 1000 ml ✓; alle 1000 Zellen der Füllreihenfolge verschieden (Test).
  4. Einheit m, 10 × 10 × 10: 1000 m³ = 1 000 000 dm³ = 1 000 000 Liter ✓ (Gruppierung mit schmalem Leerzeichen ab 10 000).
  5. Aquarium 6 × 3 × 4 dm: 72 dm³ = 72 Liter = 72 000 cm³ = 0,072 m³ ✓.
- **Gleiches Volumen bei verschiedenen Maßen:** 24 = 2 · 3 · 4 = 1 · 4 · 6 = 1 · 3 · 8 = 2 · 2 · 6 (genau vier mit Kanten ≤ 10, Test); 8 × 3 × 1 zeigt ebenfalls 24 cm³ ✓.
- **Sonderfälle:** Regler 1…10, ganzzahlig, kein 0 oder negativ möglich. 1 × 1 × 1: „1 Einheitswürfel (voll)“, 1 cm³ = 0,001 dm³ ✓. Bei b = 1 bzw. c = 1 entfallen die doppelten Zeilen der Zählhilfe (`stageOf` bevorzugt den größeren Füllstand). Keine Division.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt.num` (DE „0,024“, EN „0.024“), cm³/dm³/m³/Liter/ml korrekt, Umrechnungszahl 1000. Oberfläche wird nicht angezeigt.
- **Begriffe wie im Unterricht:** Volumen, Einheitswürfel, Reihe, Schicht, Länge a, Breite b, Höhe c, Grundfläche G ✓.
- **Neue/ergänzte Tests:** Block „Prüfrunde, Werte von Hand nachgerechnet“ in `tests/quader-volumen.test.ts` (4 × 3 × 2 Reihe/Schicht/Volumen, Würfel 27 und 1000 = 1 l, Grenzen 1 und 10 × 10 × 10, die vier 24er-Quader, Aufgabenwerte 72 / 72 l / Faktor 8).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 6 · 4 · 3 = 72 ✓; A2 vier Quader (1·3·8, 1·4·6, 2·2·6, 2·3·4), mit längeren Kanten 1·2·12 und 1·1·24 ✓; A3 120 / 240 / 480 cm³ ✓ (Link 10 × 6 × 8 = 480 ✓); A4 72 dm³ = 72 l ✓; A5 3000 cm³, 2,5 l, 500 l ✓.
- **„Beispiel laden“ geklickt:** alle Beispiele und Links in DE (Quader 5 × 3 × 4, Würfel 3 × 3 × 3, Nur eine Schicht, Hoher Turm, 1 Liter, Aquarium, Aufgabe 1 mit verdeckten Ergebnissen und ohne Zählhilfe, Lösungen, 4 × 3 × 2, 8 × 3 × 1, 10 × 6 × 8) und EN (Aquarium voll, 1 Liter, 1 × 1 × 1 dm) geladen, Anzeigen stimmen.
- **Texte vereinfacht/korrigiert:**
  - EN-Lernmaterial war deutlich kürzer (Ausprobieren 2/3/5, Aufgaben „Gleiches Volumen“ und „Einheiten umrechnen“, Teilaufgaben zum Verdoppeln, mm³, ml, Lehrplanbezug fehlten) → auf DE-Stand gebracht.
  - EN-Anzeige: „1 litres“ und „1 unit cubes“ → Einzahl „1 litre“ / „1 unit cube“.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig, Zählhilfe-Karte oben links lesbar, Kantenbeschriftungen nicht abgeschnitten.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Bei 10 × 10 × 10 berührt die Beschriftung „1 cm³“ knapp den Vergleichswürfel; nicht störend.
- **Touch (Ziehen) und Maus:** Ziehen dreht die Ansicht (Maus geprüft, Kantenbeschriftungen wandern mit); Ecken-Griffe ändern a, b, c (gerundet, 1…10). Füllanimation weich (Würfel fallen mit `outCubic`, erst einzeln, dann Reihen, dann Schichten, auch 10 × 10 × 10 unter 13 s).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Füllen springt sofort ans Ziel; zusätzlich springt jetzt auch der Bildausschnitt beim Ändern der Maße sofort statt weich nachzuführen).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Tab-Reihenfolge laut JSON regulär; Bedienelemente aus dem Kern.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text „Quader aus Glas, der mit Einheitswürfeln gefüllt wird; die Ansicht lässt sich drehen“. Zahlen stehen zusätzlich als Text in den Ergebniskarten.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Würfel aus `theme.series` (Reihe orange, Schichten blau/türkis im Wechsel), Bedeutung steht als Text in der Zählhilfe. Kartenhintergrund und Aufhellungen nutzen feste Weiß-/Schwarzwerte (wie in anderen 3D-Simulationen), sonst Theme.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/quader-volumen/index.ts` | Einzahl „1 unit cube“ / „1 litre“ (EN) in Ergebnis und Zählhilfe; reduzierte Bewegung: Bildausschnitt springt sofort |
| `src/content/simulations/en/quader-volumen.md` | auf DE-Stand gebracht (Erklärung, Ausprobieren 1–5, Aufgaben 1–5, Unterrichtsideen) |
| `tests/quader-volumen.test.ts` | Werte von Hand, Grenzen, 24er-Quader, Aufgabenwerte |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Ziffern ab 1000 werden erst ab 10 000 gruppiert („1000 cm³“, aber „72 000 cm³“). Entspricht DIN-Praxis für vierstellige Zahlen; bleibt so.
- Die Zählhilfe schreibt „V = 4 · 3 · 2 cm³“ (Einheit nur am Ende), die Ergebniskarte „4 cm · 3 cm · 2 cm“. Beides üblich, Lernmaterial nutzt die erste Form.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2942/2942 grün (126 Dateien), Build ok.
