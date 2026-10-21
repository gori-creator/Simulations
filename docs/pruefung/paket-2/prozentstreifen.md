# Prüfprotokoll: `prozentstreifen` – Prozentstreifen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ccd16f` (Basis) · Bogen: `scratchpad/pruefung/prozentstreifen/prozentstreifen.png` (außerhalb des Repos)

## Ergebnis
korrigiert (eine Geräte-Auffälligkeit und eine Rückfrage offen)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. 25 % von 80: 100 % ≙ 80 → 1 % ≙ 80 : 100 = 0,8 → 25 % ≙ 25 · 0,8 = 20 ✓ (Anzeige „100 % ≙ 80 → 1 % ≙ 0,8 → 25 % ≙ 20“, Bruch 25/100 = 1/4 = 0,25).
  2. 15 % ≙ 36 → G: 1 % ≙ 36 : 15 = 2,4 → 100 % ≙ 240 ✓ (Anzeige „G = 36 · 100/15 = 36 : 0,15 = 240“).
  3. 12 von 48: 12 : 48 = 0,25 = 25 % ✓; Dreisatz 1 % ≙ 0,48 Kinder, 12 : 0,48 = 25.
  4. 20 % Rabatt auf 60 €: 60 € · 0,8 = 48 €, Rabatt 60 € · 0,2 = 12 € ✓ (Rückweg „Wie viel Prozent Rabatt?“: 48 : 60 = 0,8 = 80 % ⇒ Rabatt 20 % ✓).
  5. 50 € + 19 % MwSt: 50 € · 1,19 = 59,50 €, Steuer 9,50 € ✓; 119 € brutto : 1,19 = 100 € ✓.
  6. 84 € nach +20 %: 84 € ≙ 120 % → 1 % ≙ 0,70 € → 100 % ≙ 70 € ✓; falscher Weg 84 € − 20 % von 84 € = 84 € − 16,80 € = 67,20 € (wird als „Falsch … ✗“ angezeigt) ✓.
  7. Sparbuch 1200 € zu 2,5 %: 1 % ≙ 12 €, 2,5 · 12 € = 30 €, Kontostand 1230 € ✓.
- **Sonderfälle:** p = 0 % mit gesuchtem Grundwert (offener Punkt 2): Werteskala, Grundwert-Pille und Szene zeigten den Reglerwert G als Platzhalter („G = 80 ≙ 100 %“, Skala 0 … 80), obwohl G nicht bestimmbar ist; ebenso die Ergebniszeile „Dreisatz“ (… → 100 % ≙ 80) und bei Zinsen „Kontostand 1200 €“. **Korrigiert:** G gilt dann als unbekannt („?“, schraffierter Streifen, Skala nur 0), Dreisatz-Zeile „0 % ≙ 0 → 1 % ≙ ? → 100 % ≙ ?“, Sachzusammenhang ausgeblendet. Das greift auch bei Rabatt 100 % mit gesuchtem Grundwert (neuer Preis ≙ 0 %). Angesehen ✓: Rabatt 100 % (neuer Preis 0 €), p = 150 % (Streifen bis 150 % bzw. 250 % bei Erhöhung), G = 2000, nicht ganzzahlige Kinder (28 · 33 % = 9,24 Kinder mit Warnung). G ≥ 1 per Regler, Division durch 0 abgefangen (NaN → „–“/„?“).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Euro mit Cent (glatte Beträge ohne), „≈“ bei nicht exakten Beträgen, Rabatt „−20 %“ mit echtem Minus, Dezimalkomma über `fmt` ✓.
- **Begriffe wie im Unterricht:**
  - Offener Punkt 1 (W bei Rabatt/MwSt = neuer Preis): fachlich korrekt. Der verminderte bzw. vermehrte Grundwert ist der Prozentwert zum Prozentsatz (100 ∓ p) %. Die Simulation beschriftet ihn als „neuer Preis W“ bzw. „Bruttopreis W“ und zeigt den Satz q = 100 ∓ p am Streifen.
  - Unsauber war nur die Schreibweise bei „Prozentsatz gesucht“: „p % = W/G = 80 %“, während die Karte daneben „Rabatt p = ?“ (20 %) zeigt – p stand für zwei verschiedene Sätze. **Korrigiert:** bei Änderungen jetzt „W/G = 48 €/60 € = 0,8 = 80 %“, darunter „Rabatt: 100 % − 80 % = 20 %“ (Karte und Ergebniszeile).
  - Offener Punkt 3 („1 % ≙ 0,48 Kinder“): als Zwischenschritt des Dreisatzes rechnerisch richtig und als Rechengröße üblich; belassen, siehe Rückfragen.
- **Neue/ergänzte Tests:** „Prozentsatz gesucht bei Änderungen“ (60 € → 48 €: 80 %, also 20 % Rabatt; 50 € → 59,50 €: 119 %, also 19 % MwSt; 84 € : 1,2 = 70 €).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** DE 1–5 (25 % von 80 € = 20 €; 60 € · 0,8 = 48 €; 50 € · 1,19 = 59,50 €; 119 € : 1,19 = 100 €; 1200 € · 0,025 = 30 €, Kontostand 1230 €; 84 € : 1,2 = 70 €; 1,2 · 0,8 = 0,96) – keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele, alle Links unter „Ausprobieren“, alle „Aufgabe laden“ (mit `show=0`, Ergebnisse als „Aufdecken“) und „Lösung zeigen“ in DE geladen; EN-Startseite, Stolperstein und Aufgabe 3b geladen – Werte stimmen.
- **Texte vereinfacht/korrigiert:** EN hatte nur 3 von 5 Aufgaben (es fehlten „25 % von 80 €“, der Kassenbon a/b und die Frage +20 %/−20 % als eigene Teilaufgabe) und eine kürzere Liste „Try it“. **Ergänzt:** EN jetzt inhaltlich gleich zu DE (7 Schritte „Try it“, Aufgaben 1–5, Hinweis zum Modell, Stolpersteine inkl. 9,24 Kinder). DE unverändert.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, Laptop, 1920, Beamer, hell/dunkel:** alle drei Karten sichtbar, Szene, Streifen und Stolperstein-Streifen lesbar (Handy 360 px mit Stolperstein extra geprüft).
- **iPad hoch und quer (Zwei-Spalten-Aufteilung):** Die Karte „Merke“ fehlt – neben dem Dreisatz ist nur Platz für das Hunderterfeld. Behebbar nur mit Umbau der Kartenaufteilung oder einem anderen Seitenverhältnis (das alle Geräte ändert); nicht umgebaut. Der Stolperstein bleibt auf dem Tablet als zweiter Streifen sichtbar, nur der Merke-Text fehlt.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine.
- **Touch (Ziehen) und Maus:** Griff ziehen geprüft (25 % → 63 %, Werte folgen), Tippen auf Streifen und Hunderterfeld setzt p.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON plausibel, keine Befunde.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text beschreibt Szene, Streifen und Karten (DE/EN).
- **Farben:** nur aus `ctx.theme`; Falsch/richtig am Stolperstein zusätzlich mit Text und ✗/✓, Rabatt zusätzlich schraffiert – nicht allein über Rot/Grün.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/prozentstreifen/index.ts` | Grundwert bei gesuchtem G und Prozentwert-Satz 0 % als unbekannt behandelt (Streifen, Skala, Pille, Szene, Merke, Ergebniszeilen) statt Reglerwert als Platzhalter |
| `src/simulations/mathematik/prozentstreifen/index.ts` | Prozentsatz gesucht bei Rabatt/Erhöhung/MwSt: „W/G = … = 80 %“ statt „p % = …“ (p bleibt der Änderungssatz) |
| `src/content/simulations/en/prozentstreifen.md` | „Try it“ und Aufgaben 1–5 an DE angeglichen, Modellhinweis ergänzt |
| `tests/prozentstreifen.test.ts` | Test „Prozentsatz gesucht bei Änderungen“ |

## 6. Für den Kern (nicht selbst ändern)
- Optional: eine Layout-Option für ein eigenes Seitenverhältnis auf Tablets (z. B. `aspectMedium` in `StageLayout`) würde die fehlende Merke-Karte auf dem iPad ohne Umbau der Simulation lösen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- „1 % ≙ 0,48 Kinder“ (Dreisatz-Zwischenschritt): belassen, weil rechnerisch richtig und üblich. Alternative: im Zwischenschritt die Einheit weglassen („1 % ≙ 0,48“). Bitte entscheiden.
- iPad: Merke-Karte fehlt (siehe 3.) – Umbau der Kartenaufteilung oder Kern-Option gewünscht?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2943/2943 grün (126 Dateien), Build ok.
