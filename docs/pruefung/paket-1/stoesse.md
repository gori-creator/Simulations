# Prüfprotokoll: `stoesse` – Elastische und unelastische Stöße

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `a55b4f8` · Bogen: `scratchpad/boegen/stoesse.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus verriet v₁′, v₂′, v_S, Energiewerte und Prozentanteil im Bild und in „Momentan“; uneinheitliche Rundung von Energie und Prozent zwischen Bilanz und Ergebnis; allgemeiner Ziehen-Tipp passte nicht; Aufgabe 3 ohne Aufgaben-Link; neue Aufgabe 6 zu gleichen Massen; EN stark gekürzt; 3 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (elastisch, m₁ = 0,2 kg, v₁ = 0,5 m/s, m₂ = 0,4 kg ruhend): v₁′ = (0,2 − 0,4) · 0,5/0,6 = −0,1667 m/s; v₂′ = 2 · 0,2 · 0,5/0,6 = 0,3333 m/s; v_S = 0,1/0,6 = 0,1667 m/s; E = ½ · 0,2 · 0,25 = 25 mJ vorher und 2,78 + 22,22 = 25 mJ nachher ✓ (Anzeige −0,167/0,333/0,167 m/s, 25 mJ).
  2. Beispiel t-x (teilelastisch k = 0,5, m₂ = 0,6 kg, v₂ = −0,4 m/s): P = 0,1 − 0,24 = −0,14 kg·m/s; v_S = −0,14/0,8 = −0,175 m/s; v₁′ = −0,175 − 0,5 · (0,5 + 0,175) = −0,5125 m/s; v₂′ = −0,175 − 0,5 · (−0,4 + 0,175) = −0,0625 m/s; E vorher 25 + 48 = 73 mJ, nachher 26,27 + 1,17 = 27,44 mJ; ΔE = ½ · 0,15 · 0,75 · 0,9² = 45,56 mJ ✓.
  3. Klettband, gleiche Massen: v′ = 0,1/0,4 = 0,25 m/s; 25 mJ → ½ · 0,4 · 0,0625 = 12,5 mJ (50 %) ✓.
  4. Wand (0,05 kg gegen 2 kg): v₁′ = −1,95 · 0,5/2,05 = −0,476 m/s; v₂′ = 0,05/2,05 = 0,0244 m/s ✓.
  5. Reglergrenze m₁ = m₂ = 2 kg, v₁ = 1 m/s, v₂ = −1 m/s, unelastisch: P = 0, E = 2 · ½ · 2 · 1² J = 2000 mJ → 100 % innere Energie ✓.
  6. Ziehen mit der Maus: Pfeilspitze v₁ um 104 px nach links (Maßstab 0,13 · 808 px ≈ 105 px pro m/s) → v₁ von 0,5 auf −0,5 m/s, „kein Stoß“ ✓.
- **Sonderfälle:** gleiche Geschwindigkeiten oder auseinanderfahrende Gleiter → kein Stoß, keine Division durch 0 (Massen ≥ 0,05 kg); gegenläufig gleich große Impulse → Ruhe; gleiche Massen → Tausch; schwer gegen leicht → leichter fast 2 · v₁; leicht gegen sehr schwer → wie eine Wand. Alle Kombinationen der Reglergrenzen bleiben auf der Bahn (Test).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Die Bilanz zeigte Energien mit 1 Stelle („6,3“), das Ergebnis mit 2 („6,25 mJ“); Prozent im Balken und im Fußtext mit 0, im Ergebnis mit 1 Stelle (A5: 38 % gegen 37,5 %). Jetzt überall mJ mit bis zu 2 und Prozent mit 1 Stelle. Pfeil- und Schwerpunktbeschriftung im Bild mit `fmt.fixed(…, 2)` („0,50 m/s“ neben „−0,17 m/s“).
- **Begriffe wie im Unterricht:** Impuls, Impulserhaltungssatz, elastisch/teilelastisch/vollkommen unelastisch, Stoßzahl k, Schwerpunktsgeschwindigkeit, innere Energie ✓. Lehrbuchformel für v₁′/v₂′ im Lernmaterial, im Ergebnis die gleichwertige Form 2 · v_S − v.
- **Neue/ergänzte Tests:** 3 neue Tests in `tests/stoesse.test.ts` (Aufgabenwerte A1–A6 und t-x-Beispiel; alle Kombinationen der Reglergrenzen auf der Bahn mit Impuls- und Energiebilanz; Sonderfälle Ruhe/gleich schnell/schwer trifft leicht); jetzt 15 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 0,25 m/s, 50 % ✓. A2 −0,167/0,333 m/s, 2,8 + 22,2 = 25 mJ ✓. A3 v₂ = −0,25 m/s, 37,5 mJ ✓. A4 −0,476/0,024 m/s, p₂′ = 0,049 kg·m/s, E₂′ = 0,59 ≈ 0,6 mJ ✓. A5 0,125/0,375 m/s, 15,6 mJ, 37,5 % ✓. Neu A6: gleiche Massen gegeneinander → −0,3 und 0,5 m/s, Impuls 0,04 kg·m/s ✓ (Simulation: 34 mJ vorher = nachher).
- **Aufgabenmodus:** Mit `_hide=1` zeigten nach dem Stoß die Pfeile „v₁′ = −0,17 m/s“, der Schwerpunkt „v_S = 0,17 m/s“, die Energiebilanz Zahlen und „50 %“, der Fußtext „0 % → innere Energie“ und „Momentan“ alle Geschwindigkeiten. Jetzt „? m/s“ an den Pfeilen nach dem Stoß (solange „Nach dem Stoß“ verdeckt), „v_S = ? m/s“ (solange „Geschwindigkeit des Schwerpunkts“ verdeckt), Energie-Zahlen und Prozent weg (solange „Bewegungsenergie“ verdeckt), Fußtext „Impuls erhalten · Wie viel Energie wurde umgewandelt?“, „Momentan“ als `spoiler`.
- **„Beispiel laden“ geklickt:** alle sechs Beispiele und alle Aufgaben- und Ausprobieren-Links geladen und abgespielt; passen zu den Beschreibungen.
- **Texte vereinfacht/korrigiert:** DE: A3 mit Aufgaben-Link (`?type=inel&_hide=1`, v₂ selbst einstellen), A6 neu, Unterrichtsidee zum Aufgabenmodus ergänzt. EN hatte 3 statt 5 Aufgaben, verkürzte Theorie und Ideen → vollständig auf DE-Umfang übersetzt (6 Aufgaben, 6 Ausprobieren-Punkte).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** iPad quer nutzt bereits die Nebeneinander-Aufteilung (`w ≥ 640 || h < 0,9 · w`) mit etwas kleinerer Schrift – gut lesbar, nicht winzig. Handy untereinander, Beschriftungen ≥ 10,5 px. Übrige Geräte in Ordnung.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf; keine Überlappungen gefunden (auch bei 2-kg-Massestapeln an der Reglergrenze; der zweite Pfeil weicht nach oben aus).
- **Touch (Ziehen) und Maus:** Pfeilspitzen mit der Maus gezogen, Wert stimmt (siehe 1.6). Ziehen nur vor dem Start (t = 0).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; alle Werte über Regler erreichbar → kein `setKeyTargets` nötig.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Werte als Text in den Ergebnissen.
- **Farben:** Gleiter, Summe und innere Energie aus `ctx.theme.series`; innere Energie zusätzlich schraffiert, Gleiter mit Masse bzw. Nummer beschriftet, Legende mit Text → nicht nur über Farbe unterscheidbar ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/stoesse/index.ts` | Aufgabenmodus: „?“ an Pfeilen nach dem Stoß und am Schwerpunkt, Energie-Zahlen und Prozent ausgeblendet, eigener Fußtext; „Momentan“ als `spoiler` |
| `src/simulations/physik/stoesse/index.ts` | einheitliche Rundung (mJ bis 2 Stellen, % 1 Stelle in Bilanz, Balken, Fußtext und Ergebnis; Bildbeschriftung v mit `fmt.fixed`, 2 Stellen) |
| `src/simulations/physik/stoesse/index.ts` | eigener `hint` (Pfeilspitzen ziehen, Vorzeichen) statt „markierte Punkte“; Hilfetext zu v₂ |
| `src/content/simulations/de/stoesse.md` | A3 mit Aufgaben-Link, neue A6, Hinweis zum Aufgabenmodus |
| `src/content/simulations/en/stoesse.md` | vollständig auf DE-Umfang übersetzt |
| `tests/stoesse.test.ts` | 3 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- `formatNumber`: −0,0625 aus einer zusammengesetzten Gleitkommarechnung (−0,06249999…) erscheint als „−0,062“ statt „−0,063“; der Zuschlag `4 · EPSILON` reicht dafür nicht. Vorschlag: vor dem Runden auf etwa 12 signifikante Stellen runden.
- Die Simulation hat eigene Helfer `parts`/`richText` für Indizes auf der Zeichenfläche; `subText` aus dem Kern könnte sie ersetzen (nicht umgebaut, Darstellung ist korrekt).

## 7. Entscheidungen
- **Pfeile, Balken und Diagramme bleiben im Aufgabenmodus sichtbar, nur die Zahlen verschwinden:** Die Bewegung ist der Versuch; grobes Ablesen am Pfeil oder Diagramm ist als Kontrolle erwünscht, die genauen Werte sind die Lösung.
- **Auch die Energie vorher ist verdeckt:** 37,5 mJ (A3) und 25 mJ (A1/A2) gehören zu den Lösungen. Der Gesamtimpuls bleibt sichtbar, weil er nur die gegebenen Werte zusammenfasst.
- **„Momentan“ als `spoiler`:** zeigt nach dem Stoß genau v₁′ und v₂′.
- **Energie in mJ mit bis zu 2 Stellen:** passt zu den Lösungen (6,25 mJ, 12,5 mJ, 27,44 mJ); große Werte wie 2000 mJ bleiben in mJ, damit vorher und nachher immer dieselbe Einheit haben.
- **Neue Aufgabe 6 (gleiche Massen gegeneinander)** statt eines weiteren Beispiels: Der Geschwindigkeitstausch kam bisher nur als Ausprobieren-Punkt vor.
- **Formel im Ergebnis „v′ = 2 · v_S − v“ belassen:** gleichwertig zur Lehrbuchformel im Lernmaterial und zeigt den Bezug zum Schwerpunkt.
- **Lehrplanbezug (Jgst. 10/11, Bayern) bleibt als Entwurf gekennzeichnet.**

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3008/3008 grün (135 Dateien), Build ok.
