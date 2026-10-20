# Prüfprotokoll: `massstab` – Maßstab: Karte und Wirklichkeit

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `bb5b91a` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/massstab/massstab.png` (außerhalb des Repos)

## Ergebnis
korrigiert (fachlich in Ordnung; Lineal-Beschriftung, Fahnen auf dem Handy, Griffgröße für Finger, Aufgabe 5 und englisches Lernmaterial verbessert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. $1 : 25\,000$, $4\,\text{cm}$: $4 \cdot 25\,000 = 100\,000\,\text{cm} = 1\,000\,\text{m} = 1\,\text{km}$ ✓ (Rechnen und Karte Kirche → Bahnhof, Anzeige „4 cm · 25 000 = 100 000 cm = 1 000 m = 1 km“).
  2. $1 : 50\,000$, $3{,}5\,\text{km}$: $3{,}5\,\text{km} = 350\,000\,\text{cm}$, $350\,000 : 50\,000 = 7\,\text{cm}$ ✓ (Anzeige „350 000 cm : 50 000 = 7 cm“).
  3. $1 : 100$, $12\,\text{m}$: $12\,\text{m} = 1\,200\,\text{cm}$, $1\,200 : 100 = 12\,\text{cm}$ ✓.
  4. Maßstab aus $6\,\text{cm} \hat{=} 1{,}5\,\text{km}$: $150\,000\,\text{cm} : 6\,\text{cm} = 25\,000$ → $1 : 25\,000$ ✓.
  5. Vergrößerung $10 : 1$: Ameise $5\,\text{mm} \cdot 10 = 5\,\text{cm}$, zurück $5\,\text{cm} : 10 = 0{,}5\,\text{cm} = 5\,\text{mm}$ ✓; Sandkorn $50 : 1$: $0{,}4\,\text{mm} \cdot 50 = 2\,\text{cm}$ ✓.
  6. Messwerkzeug (mit dem Finger gezogen): Kirche → Punkt B bei $1 : 25\,000$: $5{,}7\,\text{cm} \cdot 25\,000 = 142\,500\,\text{cm} = 1\,425\,\text{m} = 1{,}425\,\text{km}$ ✓. Rundung auf 1 mm: $12{,}5\,\text{m} \hat{=} 0{,}5\,\text{mm}$ → 1 mm, $12{,}4\,\text{m}$ → 0 mm ✓.
- **Modell:** Längen intern als ganze Zahl in µm, daher exakt (auch 0,4 mm). Kartenlänge wird wie mit dem Lineal auf 1 mm gerundet, die wirkliche Länge aus diesem gemessenen Wert berechnet (im Lernmaterial erklärt). Wegstrecke: kürzester Weg im Straßennetz, jeder Abschnitt auf 1 mm gerundet und addiert.
- **Sonderfälle:** Strecke 0 (beide Griffe aufeinander) → „0,0 cm“, „0 m“ ✓; Rechnen mit 0 cm bzw. 0 m → Hinweis „Bitte Längen größer als 0 eingeben“ ✓; ungültige Maßstäbe (0, negativ, NaN) liefern im Modell `null` ✓; nicht aufgehende Divisionen werden mit „≈“ gekennzeichnet ✓; Reglergrenzen (cm 0–40, rw 0–100 000 m) unkritisch.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** DE Dezimalkomma und schmales Leerzeichen ab 1 000, EN Punkt und Komma ✓. Kartenlänge immer mit einer Nachkommastelle („4,0 cm“). Kein Minus nötig. Im Bogen zeigen einige Bilder „3,9 cm“: das ist das Hochzählen der Zahl während der Einblendung (mit reduzierter Bewegung sofort 4,0 cm).
- **Begriffe wie im Unterricht:** Maßstab, Maßstabszahl, Maßstabsleiste, Luftlinie, Wegstrecke, Vergrößerung/Verkleinerung, „≙“ ✓.
- **Neue/ergänzte Tests:** `tests/massstab.test.ts`, Block „Prüfrunde“: alle Prüfwerte (1 : 25 000/4 cm; 1 : 50 000/3,5 km; 1 : 100/12 m; 6 cm ≙ 1,5 km), Vergrößerung Ameise/Sandkorn, Rundungsgrenze des Messwerkzeugs, Aufgabe 2 (500 m) und Aufgabe 6 (Wegstrecke 10,7 cm = 2 675 m) mit der echten Landschaft.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1 ($1{,}5\,\text{km}$), 2 ($10\,\text{cm} \to 500\,\text{m}$, Schule–Rathaus $\sqrt{480^2+140^2} = 500\,\text{m}$), 3 ($10\,\text{cm}$), 4 ($1 : 50\,000$), 5 ($5\,\text{cm}$; $2\,\text{cm}$), 6 (Abschnitte $0{,}7+1{,}1+0{,}5+1{,}7+3{,}8+2{,}6+0{,}3 = 10{,}7\,\text{cm}$; $2{,}5\,\text{km}$ und $2\,675\,\text{m}$, Unterschied $175\,\text{m}$) – alle Lösungen stimmen. Prüfstrecken: Kirche–Bahnhof $\sqrt{600^2+800^2} = 1\,000\,\text{m}$, Kirche–Aussichtsturm $3\,000\,\text{m}$, Kirche–Badestelle $2\,500\,\text{m}$ ✓.
- **„Beispiel laden“ geklickt:** alle Links in DE und EN und alle Beispiele der Seitenleiste geladen; Werte stimmen, `show=0` blendet das Ergebnis aus.
- **Auffälligkeit Aufgabe 5:** „Aufgabe laden“ öffnete die Ansicht Vergrößern, die das gesuchte Ergebnis (5 cm) groß zeigt (dort gibt es kein „Ergebnis sofort anzeigen“). Link entfernt, stattdessen „Rechne zuerst selbst …“; in der Lösung Links zu Ameise und Sandkorn.
- **Texte vereinfacht/korrigiert:**
  - DE: „Zentimeter ihres Lineals“ → „des gezeichneten Lineals“; „Ideen für den Unterricht“ ohne „vielleicht“/„könnten“, in Sie-Form.
  - EN: war deutlich kürzer (4 statt 6 Aufgaben, 4 statt 6 Versuche; Aufgabe 4 fragte nach einem 2 cm langen Objekt, der Lösungslink zeigte aber den 7 mm langen Marienkäfer). An DE angeglichen: gleiche Erklärung, 6 Versuche, 6 Aufgaben mit Lösungen und Links, Unterrichtsideen und Stolpersteine.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden, Karte, Lineal und Rechenkarten gut lesbar, auch am Beamer.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf. Behoben: (1) waagerechtes Lineal (Rechnen, Vergrößern) – „cm“ am Ende verdeckte die letzte Zahl („6“/„5“, beim kleinen 1-cm-Lineal die „1“); das Lineal hat rechts jetzt mehr Platz. (2) Rechnen auf dem Handy – die linke Fahne stach in die Beschriftung „Wirklichkeit“; die Fahnen sind bei niedriger Fläche kürzer.
- **Touch (Ziehen) und Maus:** Griff B mit simuliertem Finger (Touch-Ereignisse, 414 px) gezogen: Strecke und Rechnung folgen, die Seite scrollt dabei nicht ✓. Griffe hatten nur 32 px Trefferfläche → auf 44 px vergrößert. Antippen von Orten setzt Start/Ziel, Antippen der Maßstabs-Chips wechselt den Maßstab ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Prüfbogen).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** alle Messungen auch über die Regler „Start A/Ziel B“ (in m) und die Auswahl erreichbar; Ziehen ist nur eine Abkürzung ✓.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen ✓; Beschreibung der Zeichenfläche vorhanden (statisch), Messung und Rechnung stehen als Text in den Ergebnissen ✓.
- **Farben, Kontrast:** Kartenlänge (Magenta), Maßstab (Violett), Wirklichkeit (Petrol) aus dem Theme, zusätzlich durch Beschriftung unterscheidbar ✓. Kartenfarben (Wald, Wasser, Papier) und das Holzlineal sind Materialfarben und fest eingetragen, ebenso `#ffffff` für helle Flächen – siehe „Für den Kern“.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/massstab/index.ts` | Lineal rechts verlängert („cm“ verdeckt die letzte Zahl nicht mehr); Fahnen in „Wirklichkeit“ bei niedriger Fläche kürzer; Griffe mit 44 px Trefferfläche; Ergebnis „0 m“ statt „0 mm“ bei Strecke 0 (wie in der Karte) |
| `src/content/simulations/de/massstab.md` | Aufgabe 5 ohne „Aufgabe laden“ (zeigte das Ergebnis), Lösungslinks Ameise und Sandkorn; Hinweis zum Lineal klarer; Unterrichtsideen in Sie-Form ohne Konjunktiv |
| `src/content/simulations/en/massstab.md` | an DE angeglichen (Erklärung, 6 Versuche, 6 Aufgaben, Unterrichtsideen); falscher Lösungslink in der alten Aufgabe 4 entfällt |
| `tests/massstab.test.ts` | Prüfwerte der Prüfrunde, Vergrößerung, Rundung des Messwerkzeugs, Aufgaben 2 und 6 mit der Landschaft |

## 6. Für den Kern (nicht selbst ändern)
- `dragHint` gilt für die ganze Simulation: Der Tipp „Die markierten Punkte lassen sich mit Maus oder Finger ziehen“ steht auch in den Ansichten Vergrößern und Rechnen, wo nichts gezogen werden kann. Vorschlag: `dragHint` auch als Funktion der Parameter zulassen (wie `visibleIf`).
- Wie bei `einheiten`: Theme-Farbe für helle Flächen/Karten (`surface`) fehlt; Materialfarben (Holzlineal, Kartenfarben) bewusst zulassen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Rechnen mit ungültigen Werten (0 cm/0 m) zeigt im Kästchen „Maßstab“ kurz „1 : 0“; der Lösungsweg weist richtig auf „Längen größer als 0“ hin. Soll dort statt „1 : 0“ ein „?“ stehen?
- Lehrplan-Zuordnung (Jgst. 5, Größen/Maßstab, LehrplanPLUS Gymnasium) ist im Lernmaterial als „bitte am Lehrplan prüfen“ gekennzeichnet; bitte fachlich bestätigen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2869/2869 grün (125 Dateien), Build ok.
