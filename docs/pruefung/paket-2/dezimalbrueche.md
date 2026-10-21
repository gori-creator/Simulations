# Prüfprotokoll: `dezimalbrueche` – Endliche und periodische Dezimalbrüche

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `9c2824b` (Basis), Korrekturen ab `de21227` · Bogen: `/tmp/claude-0/-home-user-Simulations/8f85f9ae-3f3f-5aef-94a3-e731ae416460/scratchpad/pruefung/dezimalbrueche/dezimalbrueche.png`

## Ergebnis
korrigiert (Zahlenstrahl-Lupe zeigt bei kurzer Periode mehrere Stufen, englisches Lernmaterial vervollständigt, Text Restekreis präzisiert, Tests ergänzt); Rechenlogik war fehlerfrei

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung, jeweils geladen und mit der Anzeige verglichen):**
  1. 3/8: 30 : 8 = 3 R 6, 60 : 8 = 7 R 4, 40 : 8 = 5 R 0 → 0,375; 8 = 2³ → erweitern mit 125: 375/1000. Anzeige „0,375“, „endlicher Dezimalbruch, 3 Nachkommastellen“, Reste 3, 6, 4, 0 ✓.
  2. 1/7: 10 : 7 = 1 R 3, 30 : 7 = 4 R 2, 20 : 7 = 2 R 6, 60 : 7 = 8 R 4, 40 : 7 = 5 R 5, 50 : 7 = 7 R 1 → Rest 1 kehrt wieder → 0,142857̅, Periodenlänge 6 < 7 ✓.
  3. 1/6: 10 : 6 = 1 R 4, 40 : 6 = 6 R 4 → Rest 4 wiederholt sich → 0,16̅ (gemischt periodisch, Vorperiode 1, Periode 1); 6 = 2 · 3 → Faktor 2 Vorperiode, Faktor 3 Periode. Periodenstrich nur über der 6 ✓.
  4. 5/12: 50 : 12 = 4 R 2, 20 : 12 = 1 R 8, 80 : 12 = 6 R 8 → 0,416̅; 12 = 2² · 3 → Vorperiode max(2; 0) = 2 ✓.
  5. 3/15: erst kürzen, ggT = 3 → 1/5 = 2/10 = 0,2; Anzeige „3/15 = 1/5 = 0,2“, „endlich, 1 Nachkommastelle“, Nenner (gekürzt) 5 ✓. 7/20 = 35/100 = 0,35 ✓. 1/3 = 0,3̅ ✓.
  6. 7/4 (unecht): 7 : 4 = 1 R 3, 30 : 4 = 7 R 2, 20 : 4 = 5 R 0 → 1,75 = 175/100; Rechenblatt zeigt „− 4“ für den ganzzahligen Teil ✓.
- **Sonderfälle:** Zähler 0 ist über den Regler nicht erreichbar (min 1), `?z=0` wird auf 1 begrenzt; das Modell liefert für 0/n trotzdem „ganz“ = 0 (Test). Ganze Zahl 12/4 = 3: „ganze Zahl“, Rest 0 ✓. Längste Periode 1/47 (46 Ziffern) und 99/47 am Handy: Anzeige mit „…“ gekürzt, Restekreis dicht, aber lesbar. Keine Division durch 0 (Nenner min 2).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma DE / Punkt EN, Minus als „−“ im Rechenblatt, keine Rundung (exakt ganzzahlig gerechnet) ✓.
- **Begriffe wie im Unterricht:** endlich, rein/gemischt periodisch, Periode, Vorperiode, Periodenstrich ✓. Regel „vollständig gekürzter Nenner nur mit den Primfaktoren 2 und 5“ korrekt formuliert.
- **Neue/ergänzte Tests:** Standardbeispiele (7/20, 1/7, 1/3, 1/6, 3/15 mit Vorhersage und Zehnerpotenz, 7/4), Zähler 0, neue Funktionen `digitAt`/`remainderAt` (Ziffern und Reste über die Periode hinaus), `levelBounds` für 1/3 auf Stufe 3.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgaben 1–6 und alle Ausprobieren-Punkte nachgerechnet (u. a. 3/16 = 1875/10000 = 0,1875; 7/40 = 0,175; 5/6 = 0,83̅; 4/15 = 0,26̅; 3/14 = 0,2142857̅ mit Periode 142857; Reste von 1/13: 1, 10, 9, 12, 3, 4 und von 2/13: 2, 7, 5, 11, 6, 8; 0,36 periodisch = 36/99 = 4/11; 1/48 = 0,02083̅; 1/49 Periode 42). Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle sechs Beispiele und alle Links im Lernmaterial geladen. Auffällig: „Lupe: 1/3“ zeigte nur die Zehntel-Stufe, die Frage „Warum sieht jede Stufe gleich aus?“ ließ sich so nicht beantworten → behoben.
- **Texte vereinfacht/korrigiert:** Englisches Lernmaterial war deutlich kürzer (3 statt 6 Aufgaben, 5 statt 8 Ausprobieren-Punkte, Unterrichtsideen gekürzt) → vollständig an DE angeglichen. Restekreis-Text „nur die Reste 1 bis m“ → „außer 0 nur die Reste 1 bis m“ (DE/EN).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig, Karten auf dem Tablet vorhanden, am Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Bei Nenner 47 am Handy sind die Restezahlen am Kreis sehr dicht (Grenzfall, hinnehmbar). Am Handy (nur 1 Lupen-Stufe Platz) steht das „⋮“ neben dem Titel – unauffällig.
- **Touch (Ziehen) und Maus:** Tippen aufs Blatt = nächste Stelle, Ziehen verschiebt das Rechenblatt, Tippen auf Rest bzw. Kachel funktioniert.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON regulär; alle Funktionen auch über Regler/Aktionen erreichbar (Tippen auf Rest/Kachel entspricht Zähler-/Nenner-Regler).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text der Zeichenfläche beschreibt Rechenblatt, Restekreis/Lupe und Ergebnis.
- **Farben:** aus `ctx.theme` (Papierfarben als feste Werte für hell/dunkel, wie im Bestand). Endlich (grün) / periodisch (orange) wird zusätzlich durch Text unterschieden (Periodenstrich, Art-Schild, Primfaktoren); gemischt periodische Kacheln haben eine diagonale Teilung.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/dezimalbrueche/model.ts` | neu `digitAt`, `remainderAt` (Ziffern/Reste über die Periode hinaus); `levelBounds` nutzt `digitAt` statt mit Nullen aufzufüllen |
| `src/simulations/mathematik/dezimalbrueche/index.ts` | Lupe: bei periodischen Brüchen so viele Stufen, wie Platz ist (1/3: 0,3 / 0,33 / 0,333); Restekreis-Text „außer 0 nur die Reste 1 bis m“ |
| `src/content/simulations/en/dezimalbrueche.md` | inhaltlich an DE angeglichen (alle Aufgaben, Ausprobieren, Unterrichtsideen) |
| `tests/dezimalbrueche.test.ts` | Standardbeispiele, Zähler 0, `digitAt`/`remainderAt`/`levelBounds` |

## 6. Für den Kern (nicht selbst ändern)
– keine –

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Tafel zählt bei „Endlich bei k von 49 Nennern“ auch ganze Zahlen mit (z. B. 3/3 = 1). Fachlich vertretbar; bitte bestätigen, dass das so bleiben soll.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2929/2929 grün, Build ok.
