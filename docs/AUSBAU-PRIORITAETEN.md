# Ausbau der 49 kleinen Simulationen – Reihenfolge

Stand: 25. November 2026.

49 Simulationen wurden im November gebaut, um Lehrplan-Lücken zu schließen. Sie sind aber zu klein (meist unter 1000 Zeilen, oft nur eine Ansicht). Deshalb sind sie **nicht** in `main`. Vor der Übernahme soll jede auf den Umfang der großen Simulationen gebracht werden (Vorbilder: `potenzgesetze`, `kegelschnitte`, `richtungsfeld`).

## Was „ausgebaut“ heißt

- 5–7 Ansichten statt einer (Auswahl „Ansicht“)
- eine Übung mit Aufgaben, „Prüfen“, „Nächste Aufgabe“ und Punktestand
- Anwendungen aus dem Alltag
- Animation zum Abspielen, wo es passt (bei reduzierter Bewegung fester Zustand)
- deutlich mehr Beispiele (10–20)
- Lernmaterial DE und EN mit Aufgaben und Links in die Ansichten
- Tests für die Rechenlogik
- Richtwert: 1500–2000 Zeilen Code

## Wo die kleinen Fassungen liegen

Jede kleine Fassung liegt auf einem eigenen Zweig: `physik/<id>` bzw. `mathe/<id>`, zum Beispiel `physik/druck` oder `mathe/vorzeichenregeln`. Die Zweige sind gestapelt, enthalten also auch die vorherigen Simulationen. Zum Übernehmen nur die Dateien der einen Simulation holen:

- `src/simulations/<fach>/<id>/`
- `src/content/simulations/{de,en}/<id>.md`
- `tests/<id>.test.ts`
- den Eintrag in `src/curriculum/<fach>.ts`
- die Zuordnungen in `src/curriculum/lehrplaene/*.ts`

Danach `npm run lehrplan:luecken` ausführen und `npm run verify`.

Die geschlossenen Pull Requests dazu sind #247–#299.

## Reihenfolge

Sortiert nach Zahl der Länder und Lernbereiche, in denen das Thema vorkommt; bei Gleichstand zuerst die unteren Klassen.

### Erste Wahl (15)

| # | ID | Simulation | Klassen | Länder | Lernbereiche |
|--:|---|---|---|--:|--:|
| 1 | `newtonsche-gesetze` | Newton’sche Gesetze | 7–12 | 13 | 24 |
| 2 | `druck` | Druck und Hydraulik | 7–10 | 13 | 21 |
| 3 | `waermetransport` | Wärmetransport und Klima | 5–13 | 13 | 23 |
| 4 | `waermeausdehnung` | Wärmeausdehnung, Anomalie des Wassers | 6–10 | 13 | 19 |
| 5 | `ladungen-coulomb` | Ladung und Coulomb’sches Gesetz | 6–12 | 13 | 18 |
| 6 | `vorzeichenregeln` | Vorzeichenregeln (Mathe) | 5–8 | 13 | 15 |
| 7 | `farben` | Farben: Prisma und Farbmischung | 6–10 | 12 | 17 |
| 8 | `stromwirkungen` | Wirkungen und Gefahren des Stroms | 5–9 | 9 | 12 |
| 9 | `ungleichungen` | Lineare Ungleichungen (Mathe) | 6–9 | 9 | 12 |
| 10 | `leistung` | Arbeit und Leistung | 7–11 | 10 | 12 |
| 11 | `polarisation` | Polarisation und Brechung | 10–13 | 13 | 29 |
| 12 | `em-spektrum` | Elektromagnetisches Spektrum | 10–13 | 13 | 22 |
| 13 | `schwingkreis` | Schwingkreis und Selbstinduktion | 11–13 | 13 | 18 |
| 14 | `teilchen-felder` | Geladene Teilchen in Feldern | 10–13 | 13 | 16 |
| 15 | `kernspaltung` | Kernspaltung und Kernfusion | 9–13 | 13 | 15 |

### Zweite Wahl (11)

| ID | Simulation | Klassen | Länder | Lernbereiche |
|---|---|---|--:|--:|
| `treibhauseffekt` | Treibhauseffekt | 8–13 | 13 | 17 |
| `waermekraftmaschine` | Wärmekraftmaschine und Wärmepumpe | 8–13 | 13 | 19 |
| `potentialtopf` | Potentialtopf | 12–13 | 13 | 19 |
| `wechselstrom` | Wechselstrom und Zeigerdiagramm | 11–13 | 13 | 15 |
| `kleine-schritte` | Methode der kleinen Schritte | 10–13 | 13 | 15 |
| `strahlenschutz` | Strahlenschutz | 8–13 | 13 | 14 |
| `drehimpuls` | Drehimpuls und Trägheitsmoment | 10–13 | 13 | 14 |
| `mach-zehnder` | Mach-Zehnder-Interferometer | 12–13 | 13 | 16 |
| `doppelpendel` | Doppelpendel und Chaos | 11–13 | 13 | 14 |
| `roentgen` | Röntgenstrahlung | 11–13 | 9 | 21 |
| `minkowski` | Minkowski-Diagramm | 11–13 | 9 | 13 |

### Kann warten (23)

Meist Wahlthemen, die nur in 1–7 Ländern vorkommen.

| ID | Simulation | Klassen | Länder |
|---|---|---|--:|
| `schleifenbahn` | Schleifenbahnen der Planeten | 9–13 | 7 |
| `uneigentliche-integrale` | Uneigentliche Integrale | 12–13 | 7 |
| `standardmodell` | Standardmodell | 11–13 | 5 |
| `laser` | Laser | 11–13 | 4 |
| `solarzelle` | Solarzelle | 8–11 | 4 |
| `baendermodell` | Bändermodell | 11–13 | 3 |
| `kreisgleichung` | Kreisgleichung und Tangenten | 10–13 | 3 |
| `stroemung` | Strömung und Bernoulli | 7–13 | 3 |
| `zahlensysteme` | Zahlensysteme | 5–8 | 3 |
| `verteilungen` | Weitere Verteilungen | 12–13 | 2 |
| `folgen-reihen` | Folgen und Reihen | 10–12 | 2 |
| `bauzeichnungen` | Baupläne | 8–10 | 2 |
| `sensoren` | Sensoren | 7–10 | 2 |
| `parameterkurven` | Parameterkurven und Polarkoordinaten | 10–13 | 2 |
| `tunneleffekt` | Tunneleffekt | 12–13 | 1 |
| `dynamische-systeme` | Dynamische Systeme, Chaos, Fraktale | 12–13 | 1 |
| `platonische-koerper` | Platonische Körper | 7–10 | 1 |
| `goldener-schnitt` | Der goldene Schnitt | 9–10 | 1 |
| `lineare-optimierung` | Lineare Optimierung | 8–10 | 1 |
| `aussagenlogik` | Aussagenlogik | 7–10 | 1 |
| `funktionen-zwei-variablen` | Funktionen mit zwei Veränderlichen | 12–13 | 1 |
| `strategiespiele` | Strategiespiele (Nim) | 5–7 | 1 |
| `optische-taeuschungen` | Optische Täuschungen | 5–7 | 1 |
