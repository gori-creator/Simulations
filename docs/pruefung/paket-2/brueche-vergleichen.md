# Prüfprotokoll: `brueche-vergleichen` – Brüche erweitern, kürzen und vergleichen

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `80ed977` (Basis), Korrekturen ab `2d4bc9c` · Bogen: `/tmp/claude-0/-home-user-Simulations/8f85f9ae-3f3f-5aef-94a3-e731ae416460/scratchpad/pruefung/brueche-vergleichen/brueche-vergleichen.png`

## Ergebnis
korrigiert (Darstellung bei wenig Höhe, Beschriftung „Unterschied“, Ersatznamen für große Nenner, reduzierte Bewegung, englisches Lernmaterial, Tests ergänzt); Rechenlogik war fehlerfrei

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung, jeweils geladen und mit der Anzeige verglichen):**
  1. 2/3 und 3/4: kgV(3; 4) = 12, k1 = 12 : 3 = 4, k2 = 12 : 4 = 3 → 8/12 < 9/12, also 2/3 < 3/4. Bögen „·4“ und „·3“, Zahlenstrahl 0,667 links von 0,75 ✓.
  2. 5/8 und 3/5: kgV(8; 5) = 40 → 25/40 > 24/40; Unterschied (25 − 24)/40 = 1/40. Anzeige „25 Vierzigstel sind mehr als 24 Vierzigstel, also gilt 5/8 > 3/5“, „Hauptnenner: kgV(8; 5) = 40“ ✓.
  3. 18/24 vollständig kürzen: ggT(18; 24) = 6 → 18 : 6 = 3, 24 : 6 = 4 → 3/4; Bogen „:6“, „3/4 ist vollständig gekürzt“, Bruchwand 3/4 = 6/8 = 9/12 an derselben Stelle ✓.
  4. Gleiche Zähler 3/7 und 3/8: Achtel sind kleiner als Siebtel → 3/7 > 3/8; Unterschied 3 · 8 − 3 · 7 = 3 → 3/56; Zahlenstrahl 0,429 rechts von 0,375 ✓.
  5. Gleichheit 4/6 und 6/9: kgV(6; 9) = 18 → 12/18 = 12/18; „genauso viel wie“, kein Unterschiedsfeld, beide Punkte an derselben Stelle ✓.
  6. 4/9 und 6/11 über gleiche Zähler: kgV(4; 6) = 12 → 12/27 < 12/22; Anzeige „Siebenundzwanzigstel sind kleiner als Zweiundzwanzigstel“, „1 Stück = 1/27“ bzw. „1/22“ ✓.
- **Erweitern/Kürzen fachlich:** Erweitern = jedes Stück in k Teile schneiden (Zähler und Nenner · k), Kürzen = je k Stücke zusammenfassen (Zähler und Nenner : k), Wert bleibt gleich; Kürzen nur, wenn Zähler und Nenner durch k teilbar (sonst rote Klammer und Schnittmarke, Begründung nach Zähler/Nenner/beiden getrennt) ✓.
- **Sonderfälle:** Zähler 0 (Vergleich über gleiche Zähler nicht möglich → Hinweis „ein Bruch mit dem Zähler 0 ist 0“, Knopf gesperrt); Nenner 1; Zähler > 2 · Nenner wird bei Eingabe auf 2 Ganze begrenzt; Erweitern über Nenner 100 abgelehnt („so fein schneiden wir hier nicht“); „Vollständig kürzen“ bei 0/n → 0/1, bei gekürztem Bruch Hinweis; Division durch 0 nicht möglich (Nenner ≥ 1). Vergleiche exakt über Kreuz, keine Rundung.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** Dezimalanzeige über `fmt.num` mit Komma, „≈“ nur bei nicht abbrechenden Werten (0,667, 0,75) ✓.
- **Begriffe wie im Unterricht:** gleichnamig, Hauptnenner = kgV, ggT, vollständig gekürzt, gleichwertig, Bruchwand ✓. Lehrplanbezug Bayern Jgst. 6, LB 1.1 (und 1.3) stimmt mit `src/curriculum/lehrplaene/` überein.
- **Neue/ergänzte Tests:** `tests/brueche-vergleichen.test.ts`, Block „Prüfrunde“: 18/24 → 3/4 und 24/36 → 2/3 über ggT, Werterhalt beim Erweitern/Kürzen, 6/8 mit 4 nicht kürzbar, Tabelle mit Hauptnenner und erweiterten Zählern (2/3–3/4, 5/8–3/5, 4/6–6/9, 3/4–5/6, 2/3–3/5, 7/12–5/8, 3/8–2/5, 7/4–5/3), gleiche Zähler 3/7 > 3/8 und 3/7 < 6/11, Ordnen aus Aufgabe 6, gleichwertige Brüche zu 1/2, Namen für ungebräuchliche Nenner (`null`).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufg. 1 (2/5 = 8/20; ggT(24; 36) = 12 → 2/3; schrittweise 12/18, 6/9, 2/3), Aufg. 2 (6 : 4 = 1,5), Aufg. 3 (10/15 > 9/15; 14/24 < 15/24; 6/9 = 8/12 = 2/3), Aufg. 4 (6/14 < 6/11), Aufg. 5 (15/40 < 16/40, Unterschied 1/40), Aufg. 6 (14 < 15 < 16 < 18 Vierundzwanzigstel), Aufg. 7 (5/12) – alle richtig. Ausprobieren 1–9 nachgerechnet (u. a. 7/9 = 35/45 < 36/45 = 4/5; 7/4 = 21/12 > 20/12 = 5/3; 1/2 = 2/4 = … = 6/12).
- **„Beispiel laden“ geklickt:** alle sechs Beispiele und die Links aus Ausprobieren/Aufgaben, ohne Fehler (simshot, Screenshots unter `…/pruefung/brueche-vergleichen/shots/` und `shots2/`).
- **Texte korrigiert:**
  - DE Ausprobieren 7: Reihenfolge umgestellt. Vorher „erst mit 2 und 3 kürzen, danach Regler auf 4“ – dann steht 2/3 da, und die Frage zu 12/18 passt nicht mehr. Jetzt erst Regler auf 4 (bei 12/18), dann schrittweise kürzen.
  - EN-Lernmaterial war deutlich kürzer (5 statt 9 Ausprobier-Punkte, 3 statt 7 Aufgaben, Unterrichtsideen verkürzt). An DE angeglichen (gleicher Inhalt, gleiche Links, Namen von Schaltern wie in `ui.ts`).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Ansicht „Vergleichen“ überall vollständig, kein Überlauf.
- **Überlappungen / abgeschnittene Beschriftungen (behoben):**
  - Die Plakette „Unterschied …“ zwischen den Streifen wurde vom zweiten Streifen überdeckt (Bruch nicht lesbar) – jetzt nach den Streifen gezeichnet.
  - „Brüche ordnen“ bei geringer Höhe der Zeichenfläche (z. B. iPad quer, ca. 700 × 440): Plaketten am Zahlenstrahl ragten in die Rückmeldezeile. Karten und Abstände werden jetzt gestaucht.
  - Bruchwand bei geringer Höhe: 12 Zeilen à ca. 10 px, Beschriftungen unlesbar. Jetzt Zeilen mindestens 13 px (dann 6–11 Zeilen, die Zeile des eingestellten Nenners immer dabei), Plakettenschrift passt in die Zeile.
- **Touch (Ziehen) und Maus:** Streifen antippen/ziehen setzt den Zähler, Kreissektoren antippen, Bruchwand antippen wählt den Bruch – geprüft per Code und Klick; Hit-Bereiche passen.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen). Zusätzlich das kurze Wackeln bei falschem Tipp (<, =, >), abgelehntem Kürzen und falscher Karte bei reduzierter Bewegung abgeschaltet; Tweens sind bereits über den Kern abgeschaltet.
- **Tastatur:** alle Einstellungen und Aktionen über Regler/Knöpfe erreichbar; das Raten (<, =, >) und das Ordnen-Spiel gehen nur auf der Zeichenfläche (Lösung aber über „Vergleichszeichen sofort zeigen“ bzw. „Auflösen“ und Ergebnisfelder zugänglich).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text beschreibt Streifen/Kreise, Zahlenstrahl, Erweitern/Kürzen ✓.
- **Farben:** nur aus `ctx.theme` (Reihen 0–4). Die beiden Brüche Blau/Orange, richtig/falsch zusätzlich mit ✓/✗, gestrichelter Klammer und Text – nicht nur über Rot/Grün ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/brueche-vergleichen/index.ts` | Unterschieds-Plakette über die Streifen gelegt (`drawDifference` in Fläche und Beschriftung geteilt) |
| `src/simulations/mathematik/brueche-vergleichen/index.ts` | Ersatzname für Nenner ohne gebräuchlichen Namen: DE „110-tel“, EN „pieces of 1/110“ (vorher im Englischen „110-tel“, beim gleichen Zähler leerer Name) |
| `src/simulations/mathematik/brueche-vergleichen/index.ts` | „Brüche ordnen“: Karten/Abstände bei geringer Höhe stauchen |
| `src/simulations/mathematik/brueche-vergleichen/index.ts` | Bruchwand: Zeilenhöhe mindestens 13 px, Plakettenschrift an Zeilenhöhe angepasst |
| `src/simulations/mathematik/brueche-vergleichen/index.ts` | Wackeln bei reduzierter Bewegung aus |
| `src/content/simulations/de/brueche-vergleichen.md` | Ausprobieren 7 umformuliert |
| `src/content/simulations/en/brueche-vergleichen.md` | an DE angeglichen (alle Ausprobier-Punkte, 7 Aufgaben, Unterrichtsideen) |
| `tests/brueche-vergleichen.test.ts` | Prüfrunden-Tests (siehe oben) |

## 6. Für den Kern (nicht selbst ändern)
- Der Zieh-Hinweis unter der Simulation lautet „Die markierten Punkte lassen sich mit Maus oder Finger ziehen“. Hier zieht man aber Streifen bzw. tippt Kreise und Bruchwand an; die Punkte am Zahlenstrahl sind nicht ziehbar. Wünschenswert wäre ein simulationseigener Hinweistext (z. B. `dragHint: L('…','…')`).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2926/2926 grün (126 Dateien), Build ok (364 Seiten).
