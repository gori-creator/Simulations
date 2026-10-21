# Prüfprotokoll: `winkelsumme` – Innenwinkelsumme in Dreieck und Vieleck

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `01cdac9` (Merge winkel-geradenkreuzung), darauf dieser Durchgang · Bogen: `scratchpad/pruefung/winkelsumme/winkelsumme.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Rechenlogik fehlerfrei; die Winkel im Bild waren anders gerundet als in der Karte, bei sehr stumpfen Dreiecken überdeckten sich Winkel-Etiketten)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startdreieck A(2|1,5), B(13,5|2,5), C(8|10,5): α = arctan(9 : 6) − arctan(1 : 11,5) = 56,31° − 4,97° = 51,34°; β = (180° + 4,97°) − (180° − arctan(8 : 5,5)) = 184,97° − 124,51° = 60,46°; γ = 180° − 51,34° − 60,46° = 68,20°. Anzeige 51,3° + 60,5° + 68,2° = 180° ✓ (Bild, Karte und Messwerte gleich).
  2. Nach dem Ziehen C(6|8): α = arctan(6,5 : 4) − 4,97° = 58,39° − 4,97° = 53,42°; β = 184,97° − (180° − arctan(5,5 : 7,5)) = 184,97° − 143,75° = 41,22°; γ = 85,36°. Anzeige 53,4° + 41,2° + 85,4° = 180,0° ✓.
  3. Rechtwinkliges Dreieck (Beispiel, Aufgabe 2) A(3|2), B(11|2), C(3|8): α = 90°, β = arctan(6 : 8) = 36,87°, γ = 53,13° ✓.
  4. Vielecke: (n − 2) · 180° → 4: 360°, 5: 540°, 6: 720°, 8: 1080°, 9: 1260°, 10: 1440° ✓; regelmäßig 5: 540° : 5 = 108°, 6: 120°, 7: 900° : 7 ≈ 128,6°, 9: 140°, 10: 144° ✓ (Tabelle, Karte, Messwerte). Fünfeck (Beispiel): 93,2° + 127,4° + 95,7° + 112,2° + 111,5° = 540,0° ✓.
  5. Nicht konvexes Sechseck (Beispiel): bei D(8|6,5) liegen außen 2 · arctan(6 : 4,5) = 106,26°, innen 360° − 106,26° = 253,74° (überstumpf, rot markiert, Bogen auf der richtigen Seite); bei F 223,60°; Summe 720° ✓; Zerlegung in 4 Dreiecke von B aus, Hinweis „Zerlegt wird hier von einer anderen Ecke aus“ ✓.
- **Begründungen:** Abreißen: α und β drehen sich je um 180° um die Mitte von [AC] bzw. [BC] an die Ecke C und bilden mit γ einen gestreckten Winkel an der Parallelen zu [AB] ✓. Beweis: Parallele g durch C, α′ = α und β′ = β als Wechselwinkel (Z-Figur wird hervorgehoben), α′ + γ + β′ = 180° ✓.
- **Sonderfälle:** drei Ecken auf einer Geraden oder zwei Ecken aufeinander werden beim Ziehen verweigert (Hinweis im Bild); Grenzen 0 … 16 bzw. 0 … 12; sehr flaches Dreieck (Link im Lernmaterial) läuft, die abgerissenen Stücke sind dann klein. Überschlagenes Vieleck: keine Innenwinkel, Kreuzungsstelle markiert, Hinweis „Formel gilt nur für einfache Vielecke“ (bewusst erlaubt, siehe Rückfragen).
- **Rundung:** Winkel auf 0,1° gerundet, nach dem Verfahren der größten Reste so verteilt, dass die Summe genau 180° bzw. (n − 2) · 180° ergibt (z. B. C(0|5): 114,78° + 15,46° + 49,76°; einfach gerundet 114,8 + 15,5 + 49,8 = 180,1, angezeigt 114,8° + 15,4° + 49,8° = 180°). Ganzzahlig würde 59,6 + 60,2 + 60,2 → 60 + 60 + 60 (Test). Messwerte mit „≈“, wo gerundet wurde.
- **Einheiten, Vorzeichen (−), Dezimalkomma:** ✓ (`fmt.num`, echtes Minus, „°“).
- **Begriffe wie im Unterricht:** Innenwinkel, Außenwinkel, Wechselwinkel, gestreckter Winkel, überstumpf/einspringend, konvex, regelmäßig ✓.
- **Neue/ergänzte Tests:** Startdreieck (Prüfwerte, summentreue Rundung), C(0|5) mit Rundungsdifferenz, ganzzahlig 59,6/60,2/60,2 → 60/60/60, Außenwinkel eines nicht konvexen Vierecks summentreu 360°, Beispiel-Sechseck (720°, einspringende Ecken D und F, 253,74°, 4 Dreiecke).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1: 180° − 48° − 67° = 65° ✓; 2: 180° − 90° − 36,9° = 53,1° ✓; 3: 6 · 180° = 1080°, 1080° : 8 = 135° ✓; 4: 1260° : 180° = 7 = n − 2 → n = 9 ✓; 5: 360° : 40° = 9, 180° − 40° = 140° = 7 · 180° : 9 ✓; 6: 80° · n = 360° → n = 4,5 (gibt es nicht), 360° − 120° = 240° (überstumpf) ✓. EN (4 Aufgaben) gleich ✓.
- **„Beispiel laden“ / Links geklickt:** alle 6 Beispiele und alle Links (flaches Dreieck, Außenwinkel, Fünfeck, Sechseck, Überkreuzung, Achteck, Neuneck, Aufgabe 2 mit `_hide`) – zeigen den beschriebenen Zustand.
- **Texte korrigiert:** Stolperstein „sein Ergänzungswinkel gemessen“ → „statt seiner der Winkel auf der Außenseite (360° minus Innenwinkel) gemessen“ (eindeutiger).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout passt (Tablet nebeneinander, Handy untereinander), Karten vollständig, Beamer lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** Überlauf keiner. Behoben: Etiketten α und γ überdeckten sich bei sehr stumpfen Dreiecken (z. B. C(0|5)); „(n − 2)“ wurde in den Hinweiskarten umbrochen; „180°“ stand in schmalen Zerlegungsdreiecken direkt an einer Ecke.
- **Touch (Ziehen) und Maus:** Ecke C per Finger (CDP-Touch) nach (11|9,5) und per Maus nach (6|8) gezogen, Werte folgen ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON plausibel; Ecken zusätzlich über Regler bzw. Textfeld einstellbar ✓.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** alle Bedienelemente benannt; Alt-Text beschreibt Karopapier, Winkel, Abreißen, Beweis, Zerlegung, Außenwinkel ✓.
- **Farben:** nur `ctx.theme` (Serienfarben); einspringende Ecken zusätzlich per Text („einspringende Ecke bei D, F“) und überstumpfem Bogen erkennbar, nicht nur über Farbe ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/winkelsumme/index.ts` | Winkel-Etiketten im Bild nutzen nach dem Mitzählen dieselben summentreu gerundeten Werte wie Karte und Messwerte (vorher z. B. β = 15,5° im Bild, 15,4° in der Karte); Außenwinkel-Etiketten summentreu (regelmäßig: alle 360° : n) |
| `src/simulations/mathematik/winkelsumme/index.ts` | „=“/„≈“ in den Messwerten am angezeigten Wert gemessen, beim regelmäßigen n-Eck am exakten Wert (vorher „α ≈ 144°“ im regelmäßigen Zehneck) |
| `src/simulations/mathematik/winkelsumme/index.ts` | Winkel-Etiketten weichen einander aus (keine Überdeckung bei sehr stumpfen Dreiecken/engen Vielecken); „(n − 2)“ wird nicht mehr umbrochen; „180°“ nur in genügend breiten Zerlegungsdreiecken |
| `tests/winkelsumme.test.ts` | 3 neue Tests (Prüfwerte, summentreue Rundung, Beispiel-Sechseck) |
| `src/content/simulations/de/winkelsumme.md` | Stolperstein überstumpfer Winkel klarer formuliert |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Prüfpunkt „Überschlagen verhindern“: Im Dreieck werden entartete Lagen verhindert. Im Vieleck dürfen sich Seiten beim Ziehen bewusst überkreuzen; die Simulation markiert die Kreuzung, zeigt keine Innenwinkel und erklärt, dass die Formel nur für einfache Vielecke gilt (Lernmaterial verlinkt diesen Fall ausdrücklich). Ich halte das für didaktisch sinnvoll und habe es nicht geändert. Soll das Überschlagen stattdessen verhindert werden?
- EN-Lernmaterial ist kürzer (ohne Aufgabe 2 „rechtwinkliges Dreieck“ und Knobelaufgabe) – laut Auftrag zulässig.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3006/3006 grün (129 Dateien), Build ok (364 Seiten).
