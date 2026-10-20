# Prüfprotokoll: `licht-schatten` – Licht und Schatten

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `8a552c8` · Bogen: `scratchpad/boegen/licht-schatten.png` (außerhalb des Repos)

## Ergebnis
korrigiert (eine englische Anzeige, Lernmaterial EN ergänzt, DE vereinfacht, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Punktförmige Lampe, Standard (Lampe 10 cm, Scheibe 40 cm, G = 10 cm, Schirm 100 cm): a = 30 cm, b = 90 cm, S = 10 cm · 90/30 = 30 cm. Anzeige „S = 30 cm“ ✓
  2. Ausgedehnte Lampe d = 8 cm (Beispiel „Ausgedehnte Lampe“): S_Kern = (10·90 − 8·60)/30 = 420/30 = 14 cm, S_außen = (900 + 480)/30 = 46 cm. Anzeige „Kernschatten 14 cm · mit Halbschatten 46 cm“ ✓ (Breiten unabhängig von der Höhe der Lampe – im Test geprüft)
  3. d = 16 cm, G = 4 cm: Spitze des Kernschattenkegels bei x = 10 + 30 · 8/(8 − 2) = 50 cm < 100 cm → kein Kernschatten; S_Kern = (360 − 960)/30 = −20 cm, S_außen = (360 + 960)/30 = 44 cm. Anzeige „kein Kernschatten · Halbschatten 44 cm“ ✓
  4. Zwei Lampen bei y = ±5 cm: Lampe 1 (y = −5): Ränder −5 + (5+5)·3 = 25 und −5 + (−5+5)·3 = −5 → [−5; 25]; Lampe 2 → [−25; 5]; Überlappung 10 cm. Anzeige „30 cm · 30 cm · Kernschatten 10 cm“ ✓
  5. Grenzen: a = 3 cm, b = 50 cm, G = 20 cm → S = 1000/3 ≈ 333,3 cm (Anzeige mit Hinweis „größer als der Schirm“) ✓; a = 95 cm, b = 100 cm, G = 2 cm → S = 200/95 ≈ 2,1 cm ✓. Nach Ziehen der Scheibe auf a = 14 cm: S = 10 · 90/14 ≈ 64,3 cm ✓
- **Sonderfälle:** Abstände ≥ 3 cm werden in `update` erzwungen (keine Division durch 0); Schirm hinter der Kegelspitze → nur Halbschatten mit eigenem Text; zwei Lampen ohne Überlappung → „kein Kernschatten“; Finsternisse: total/partiell/ringförmig/Halbschattenfinsternis per Test abgedeckt.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** über `fmt.num`, echtes Minus, cm überall ✓
- **Begriffe wie im Unterricht:** Kernschatten, Halbschatten, Randstrahlen, punktförmige/ausgedehnte Lichtquelle, Schattenraum/Schattenbild ✓
- **Neue/ergänzte Tests:** 7 Tests in `tests/licht-schatten.test.ts` (Aufgaben 1–3, Höhenunabhängigkeit, Reglergrenzen nah/fern, Kegelspitze d = 16/G = 4, zwei Lampen ohne Überlappung); jetzt 26 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 32 cm ✓, A2 a = 40 cm ✓, A3 14 cm/46 cm/Ring 16 cm ✓, A4–A6 (Erklärungen) fachlich richtig ✓. Alle Links setzen gültige Werte.
- **„Beispiel laden“ geklickt:** alle sechs (Punktförmige Lampe, Ausgedehnte Lampe, Zwei Lampen, Farbige Schatten, Sonnenfinsternis, Mondfinsternis) – Anzeigen passen zum Bild.
- **Texte vereinfacht/korrigiert:** DE: „vergrößerte Zentralprojektion“ durch eine Erklärung für Jgst. 6/7 ersetzt. EN: fehlende Aufgaben 3–5 (Kern-/Halbschatten, farbige Schatten, Wer sieht die Finsternis?) und fehlende Ausprobier-Punkte (zwei Lampen, ringförmige Finsternis, Abspielen) ergänzt, damit DE und EN gleichwertig sind.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten in Ordnung; iPad quer nutzt das breite Layout.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine gefunden.
- **Touch (Ziehen) und Maus:** Ziehen der Scheibe (Lage) und des Durchmesser-Griffs mit der Maus geprüft ✓; Finger nur über dieselben Griffe (Pointer-Ereignisse), nicht separat getestet.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON sinnvoll; alle Regler per Tastatur bedienbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas mit Beschreibung (`canvas`-Text).
- **Farben:** Theme-Farben für Griffe und Oberflächen; Lichtfarben sind physikalisch (rot/grün beim Versuch „farbige Schatten“) – dort aber immer zusätzlich per Lage und Beschriftung („Halbschatten“, Legende „nur Grün/nur Rot“) unterscheidbar.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/licht-schatten/index.ts` | Formelanzeige auf Englisch zeigte „S<sub>Kern</sub>“ → jetzt „S<sub>umbra</sub>“ |
| `src/content/simulations/de/licht-schatten.md` | „Zentralprojektion“ durch einfache Erklärung ersetzt |
| `src/content/simulations/en/licht-schatten.md` | Aufgaben 3–5 und Ausprobier-Punkte ergänzt, Lösung A1/A6 an DE angeglichen |
| `tests/licht-schatten.test.ts` | 7 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- `src/curriculum/physik.ts`: Die englische Kurzbeschreibung sagt „full shadow and half shadow“, die Simulation und das Lernmaterial verwenden „umbra and penumbra“. Vorschlag: „… see how the umbra and penumbra form“.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Lehrplanbezug im DE-Lernmaterial („bayerisches Gymnasium, Jgst. 7“) ist als Entwurf gekennzeichnet; im Repo gibt es dafür nur eine hessische Zuordnung. Bitte am LehrplanPLUS prüfen.
- Bei d > G und Schirm hinter der Kegelspitze zeigt die Formelanzeige einen negativen Wert („≈ −20 cm → kein Kernschatten“). Fachlich korrekt, für Jgst. 6/7 aber evtl. verwirrend – lassen oder nur „kein Kernschatten“ zeigen?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2864/2864 grün (125 Dateien), Build ok.
