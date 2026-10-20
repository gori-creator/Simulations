# Prüfprotokoll: `zaehlprinzip` – Zählprinzip und Baumdiagramm

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `d408122` (Basis), Korrekturen in `67b257c` · Bogen: `/tmp/claude-0/-home-user-Simulations/8f85f9ae-3f3f-5aef-94a3-e731ae416460/scratchpad/pruefung/zaehlprinzip/zaehlprinzip.png`

## Ergebnis
korrigiert (Lernmaterial DE/EN, Tests ergänzt); eine Rückfrage offen

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung, jeweils in der Simulation geladen und Anzeige verglichen):**
  1. Produktregel: 2 Hosen · 3 T-Shirts · 2 Mützen = 2 · 3 = 6, 6 · 2 = 12 Outfits; Anzeige „2 · 3 · 2 = 12 Outfits“, 12 Blätter im Baum ✓ (Prüfpunkt 3 · 2 · 2 = 12, hier mit Mützen statt Schuhen).
  2. Zahlenschloss, 3 Ringe à 10 Ziffern: 10 · 10 · 10 = 10³ = 1000 Codes; Anzeige „10 · 10 · 10 = 1000 Codes“, „10³ = 1000“ ✓.
  3. 4 Ziffern ohne Wiederholung aus 10: 10 · 9 = 90, 90 · 8 = 720, 720 · 7 = 5040; Anzeige „10 · 9 · 8 · 7 = 5040 Codes“, Kurzform 10!/6! = 3 628 800 / 720 = 5040 ✓.
  4. Reihenfolgen von 4 Personen: 4! = 4 · 3 · 2 · 1 = 24; Anzeige „4! = 4 · 3 · 2 · 1 = 24 Reihenfolgen“, 24 Kärtchen A–D ✓.
  5. Podest 8 · 7 · 6 = 56 · 6 = 336 ✓; 8! = 40 320 ✓; 10⁵ = 100 000 ✓.
- **Baumdiagramm:** Anzahl Blätter = Produkt, jeder Pfad genau ein Ergebnis-Kärtchen. Große Bäume (z. B. 10⁴, 10⁵, 8!) werden gekürzt: erster Ast aufgeklappt, übrige zugeklappt mit „10 Pfade“, „1000 Pfade“, „+6 · 600 Pfade“; gezeichnete plus zugeklappte Pfade = Gesamtzahl (Test vorhanden).
- **Sonderfälle:** Stufe mit 1 Möglichkeit (1 · 1 · 1 = 1 Outfit, 3 · 1 · 2 = 6) ✓. 0 Möglichkeiten nur ohne Wiederholung bei mehr Stufen als Dingen: 3 · 2 · 1 · 0 = 0 Codes, Baum zeigt 6 Sackgassen mit „×“, Hinweis „Nicht möglich …“ als Text ✓. Regler-Minimum 1 bzw. 2, also keine 0 per Regler; bei Eingabe wird „Plätze ≤ Läufer“ usw. nachgeführt, nur per Link (Aufgabe 6) entsteht der 0-Fall – gewollt. Keine Division.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** nur ganze Zahlen; DE Tausendertrennung ab 5 Stellen mit schmalem Leerzeichen (10 000), EN mit Komma ✓.
- **Begriffe wie im Unterricht:** „Zählprinzip“, „Baumdiagramm“, „Pfad“, „mit/ohne Wiederholung“, „Fakultät“ (mit Erklärung). Keine Fachbegriffe wie „Permutation“/„Variation“ in Oberfläche oder Lernmaterial (nur in Bezeichnern im Code).
- **Neue/ergänzte Tests:** 12 Outfits, 1000 Codes, 5040, 4! = 24; Blätter = Produkt und jeder Pfad einmal; Stufe mit 1 Möglichkeit; Sackgassen 3 · 2 · 1 · 0 (6 Sackgassen). 17 Tests grün.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 2 · 5 · 3 = 30 ✓; A2 10³ = 1000, 1000 · 2 s = 2000 s ≈ 33 min 20 s ✓; A3 6 · 5 · 4 = 120, 6³ = 216, Differenz 96 ✓; A4 336 und 8! = 40 320 ✓; A5 2 · h · 3 = 24 → h = 4 ✓; A6 5040 und 3 · 2 · 1 · 0 = 0 ✓.
- **„Beispiel laden“ / Links:** alle sechs Beispiele und alle Links aus „Ausprobieren“, „Aufgabe laden“, „In der Simulation zeigen“ (DE) geladen; Anzeigen stimmen. EN-Seite stichprobenartig (Sackgassen, 4!) geladen ✓.
- **Texte korrigiert:**
  - DE „Ausprobieren“ 2: „Nimm eine **vierte** Mütze hinzu“ passte nicht zum Link (`c=3`, Standard 2 Mützen) → „dritte Mütze“ (12 neue Äste, 12 neue Outfits).
  - DE Aufgabe 3: schiefer Satz („Der Unterschied von 96 Eistüten sind …“) → „Die 216 − 120 = 96 zusätzlichen Eistüten sind genau die, in denen mindestens eine Sorte mehrfach vorkommt.“
  - EN war stark gekürzt (3 von 6 Aufgaben, 4 von 7 Ausprobier-Punkten, keine „Load task“-Links, kürzere Unterrichtsideen) → EN inhaltlich an DE angeglichen.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden, keine Überlappungen. Im Bogen steht in vielen Ansichten „Ergebnisse: 0 Outfits“ – nur der Zeitpunkt (Baum wächst noch, Aufnahme nach 1,2 s); nach 4 s stehen 24 Kärtchen (eigene Aufnahmen).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine. Auf dem Handy (360 px) sind beim 5-stelligen Code Kärtchen und Baum-Beschriftungen sehr klein, aber lesbar und ohne Überlappung; nur Hinweis.
- **Touch (Ziehen) und Maus:** kein Ziehen angeboten; Antippen von Pfaden/Kärtchen nicht per Skript geprüft.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur:** Tab-Reihenfolge unauffällig; Bedienung über Standard-Regler, Schalter und Knöpfe.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text beschreibt Baum, Kärtchen und Produkt; Ergebnisse zusätzlich als Text.
- **Farben:** Theme-Farben bzw. feste Gegenstandsfarben, zusätzlich über Symbol/Buchstabe/Ziffer unterscheidbar (Läufer A–H, Ziffern 0–9); nichts nur über Rot/Grün.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/content/simulations/de/zaehlprinzip.md` | „vierte“ → „dritte Mütze“; Satz zu den 96 Eistüten neu formuliert |
| `src/content/simulations/en/zaehlprinzip.md` | inhaltlich an DE angeglichen (6 Aufgaben, 7 Ausprobier-Punkte, Links, Unterrichtsideen) |
| `tests/zaehlprinzip.test.ts` | 4 Tests ergänzt (Prüfwerte, Blätter = Produkt, Stufe mit 1 Möglichkeit, Sackgassen) |

## 6. Für den Kern (nicht selbst ändern)
- Prüfbogen-Werkzeug: Aufnahmen nach 1,2 s zeigen wachsende Simulationen im Zwischenzustand („0 Outfits“). Ggf. Wartezeit erhöhen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Ergebnisfeld „Kurz geschrieben“ zeigt ohne Wiederholung (k < n) den Bruch n!/(n − k)! (z. B. 10!/6!). Das steht nicht im Lernmaterial und geht über Jgst. 5–8 hinaus (Feld ist zuklappbar). Beibehalten, weglassen oder im Lernmaterial kurz erklären?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2905/2905 grün (zaehlprinzip 17/17), Build ok.
