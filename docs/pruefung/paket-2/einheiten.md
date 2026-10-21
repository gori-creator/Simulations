# Prüfprotokoll: `einheiten` – Einheiten umrechnen mit der Einheitentafel

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `b8d30de` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/einheiten/einheiten.png` (außerhalb des Repos)

## Ergebnis
korrigiert (fachlich in Ordnung; Darstellung auf dem Handy, Bogen-Beschriftungen und englisches Lernmaterial verbessert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. $3{,}5\,\text{km}$ in m: km hat Hochzahl 6, m hat 3 (bezogen auf mm) → Komma 3 Stellen nach rechts, $3{,}5 \cdot 1\,000 = 3\,500\,\text{m}$ ✓ (Anzeige „3,5 km = 3 500 m“, „Komma 3 Stellen nach rechts (· 1 000)“).
  2. $2{,}5\,\text{m}^2$ in cm²: $6 - 2 = 4$ Stellen, $2{,}5 \cdot 10\,000 = 25\,000\,\text{cm}^2$ ✓; $1\,\text{ha}$ in m²: $10 - 6 = 4$ Stellen → $10\,000\,\text{m}^2$ ✓; $4\,\text{ha} = 400\,\text{a} = 40\,000\,\text{m}^2$ ✓.
  3. $1{,}2\,\text{l}$ in ml: l liegt in der Spalte dm³ (Hochzahl 6), ml in cm³ (3) → $1{,}2 \cdot 1\,000 = 1\,200\,\text{ml} = 1\,200\,\text{cm}^3$ ✓; $250\,\text{cm}^3 = 0{,}25\,\text{l}$ ✓.
  4. $4{,}05\,\text{t}$ in kg: $4{,}05 \cdot 1\,000 = 4\,050\,\text{kg}$ ✓; in der Tafel bleibt die Null zwischen 4 und 5 stehen, eine Null wird blass ergänzt ✓.
  5. Zeit (keine Kommaverschiebung): $135\,\text{min} : 60 = 2{,}25\,\text{h}$, $135 = 2 \cdot 60 + 15$ → $2\,\text{h}\;15\,\text{min}$ ✓; rückwärts $2{,}25 \cdot 60 = 135\,\text{min}$ ✓; $2\,\text{d} = 2 \cdot 24 \cdot 60 \cdot 60 = 172\,800\,\text{s}$ ✓; $100\,\text{min} : 60 = 1{,}666\ldots$ → Anzeige „≈ 1,666 667 h“ mit Hinweis „gerundet“ und $1\,\text{h}\;40\,\text{min}$ ✓.
- **Umrechnungszahlen im Modell:** Länge 10 (mm–cm–dm–m), 1 000 (m–km); Masse 1 000 (mg–g–kg–t); Fläche 100 (mm² … m², a, ha, km²); Volumen 1 000 (mm³ … m³, 1 dm³ = 1 l, 1 cm³ = 1 ml); Zeit 60/60/24 als Bruch gerechnet ✓. Spalten der Tafel: Länge km/m je 3, dm/cm/mm je 1; Fläche je 2; Masse und Volumen je 3 ✓.
- **Sonderfälle:** 0 („0 km = 0 mm“, eine blasse 0 in der Tafel) ✓; negative Zahlen und „2e3“ werden abgelehnt, Anzeige „Keine gültige Zahl“ ✓; gleiche Einheit („Komma bleibt stehen“) ✓; nicht abbrechende Zeitergebnisse mit „≈“, Rückweg dann gesperrt ✓; über 9 Stellen vor bzw. 6 nach dem Komma abgelehnt ✓. Exakte Rechnung mit BigInt, keine Gleitkommafehler.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** DE Dezimalkomma und schmales Leerzeichen ab 1 000, EN Punkt und Komma ✓. Kein Minus nötig.
- **Begriffe wie im Unterricht:** Größe, Maßzahl, Einheit, Umrechnungszahl, Einheitentafel, Stellen H Z E bzw. z h t ✓.
- **Neue/ergänzte Tests:** `tests/einheiten.test.ts`, Block „Prüfrunde“: alle Prüfwerte der Prüfrunde (3,5 km; 2,5 m²; 1,2 l = 1 200 cm³ = 1 200 ml; 4,05 t; 1 ha; 2,25 h ↔ 135 min), alle Umrechnungszahlen zwischen Nachbareinheiten, die Tafel für 4,05 t → kg und alle Aufgaben des Lernmaterials.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgabe 1 (4 200 m; 0,75 m), 2 (3 500 g; 0,25 kg; 1 200 kg), 3 (250 dm²; 40 000 m²), 4 (1 500 ml; 0,25 l), 5 (2 h 30 min = 2,5 h; 10 800 s), 6 (350 dm²) – alle Lösungen stimmen.
- **„Beispiel laden“ geklickt:** alle Links in DE und EN sowie alle Beispiele der Seitenleiste geladen; Werte stimmen, „Aufgabe laden“ blendet das Ergebnis aus. Zusätzlich „Neue Aufgabe“ + „Umrechnen“ und „Rückweg ⇄“ (3 500 m = 3,5 km) geprüft.
- **Texte vereinfacht/korrigiert:**
  - DE: umständliches Beispiel „250 cm = 2,5 m liest man rückwärts als …“ durch „2,5 m = 250 cm“ ersetzt; „Ideen für den Unterricht“ ohne „vielleicht“/„könnten“, in Sie-Form.
  - EN: war deutlich kürzer als DE (3 statt 6 Aufgaben, 4 statt 7 Versuche, ohne Tabelle). An DE angeglichen: Tabelle der Umrechnungszahlen, gleiche „Try it“-Liste, gleiche 6 Aufgaben mit Lösungen, gleiche Unterrichtsideen.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden, Tafel und Anschauung gut lesbar, auch am Beamer.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf. Behoben: (1) Zeit auf dem Handy – die Wert-Schildchen unter den Stationen („2,25 h“, „135 min“) verdeckten die Beschriftung „: 60“ der unteren Bögen; sie stehen bei schmaler Fläche jetzt tiefer. (2) Einheitentafel – der Bogen schaute durch die Lücke neben „·“ in „· 1000“ und wirkte wie „-·“; die Beschriftung bekommt jetzt einen deckenden Hintergrund. Auf dem Handy stehen „· 60“ und „Sekunde“ eng, bleiben aber lesbar.
- **Touch (Ziehen) und Maus:** kein Ziehen; Antippen der Einheitenköpfe (Tafel) bzw. Stationen (Zeit) wählt die Zieleinheit, Mauszeiger wird zur Hand ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Prüfbogen).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** alle Bedienungen auch über Regler und Knöpfe erreichbar (Antippen in der Tafel ist nur eine Abkürzung zu „Umrechnen in“) ✓.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen ✓; Beschreibung der Zeichenfläche vorhanden (statisch), Aufgabe und Ergebnis stehen als Text in den Ergebnissen ✓.
- **Farben, Kontrast:** Ausgangs- und Zieleinheit blau/orange (Theme-Reihen 0 und 3), zusätzlich durch Position und Text unterscheidbar ✓. Weiße Karten im hellen Modus und Materialfarben (Holzlineal, Messing, Stahl, Uhr) sind fest eingetragen – siehe „Für den Kern“.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/einheiten/index.ts` | Zeit: Wert-Schildchen bei schmaler Fläche tiefer (verdecken „: 60“ nicht mehr); Tafel: Bogen-Beschriftung mit deckendem Hintergrund |
| `src/content/simulations/de/einheiten.md` | Beispiel „2,5 m = 250 cm“ vereinfacht; Unterrichtsideen ohne Konjunktiv |
| `src/content/simulations/en/einheiten.md` | an DE angeglichen (Tabelle, 7 Versuche, 6 Aufgaben, Unterrichtsideen) |
| `tests/einheiten.test.ts` | Prüfwerte der Prüfrunde, 4,05 t in der Tafel, alle Aufgaben des Lernmaterials |

## 6. Für den Kern (nicht selbst ändern)
- Das Theme hat keine Farbe für Karten/Flächen; viele Simulationen (auch diese) tragen deshalb `#ffffff` für helle Karten fest ein. Vorschlag: Theme-Farbe `surface` (bzw. `--plot-surface`) ergänzen. Gegenstände in Materialfarben (Holz, Messing, Stahl) bewusst zulassen und in `QUALITAETSSICHERUNG.md` erwähnen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Englische Eingabe „3,500“:** Das Eingabefeld liest ein Komma immer als Dezimalkomma (auch auf der englischen Seite), „3,500“ wird dort also 3,5. Die EN-Hilfe nennt nur Punkt und Leerzeichen; geteilte DE-Links („3,5“) funktionieren dadurch auf EN. Soll das so bleiben?
- **Lehrplan:** Die Simulation ist Jgst. 5 zugeordnet; Flächen- und vor allem Volumeneinheiten werden je nach Land erst später behandelt. Das Lernmaterial weist darauf hin („bitte am Lehrplan prüfen“). Zuordnung bitte fachlich bestätigen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2860/2860 grün (125 Dateien), Build ok.
