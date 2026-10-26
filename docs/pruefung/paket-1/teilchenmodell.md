# Prüfprotokoll: `teilchenmodell` – Teilchenmodell und Temperatur

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `2bc4f84` · Bogen: `scratchpad/boegen/teilchenmodell.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Ergebnis „Temperatur und Teilchenbewegung“ verrät in Aufgabe 1 die Lösung nicht mehr, missverständliches „J · Teilchen“ aufgelöst, „zugeführte Energie Q = P · t“ durch die tatsächlich zugeführte bzw. abgegebene Energie ersetzt, kein Zeilenumbruch zwischen Zahl und Einheit, 273,15 K im Lernmaterial, Lernmaterial EN auf DE-Umfang ergänzt, Tests ergänzt; eine Rückfrage zum Histogramm beim schnellen Schmelzen)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):** k = 1,380649 · 10⁻²³ J/K, Masse eines Wasserteilchens m = 2,9915 · 10⁻²⁶ kg, Probe 0,5 kg.
  1. Bewegung bei 20 °C: T = 20 + 273,15 = 293,15 K; E = 3/2 · k · T = 1,5 · 1,380649 · 10⁻²³ · 293,15 J = 6,07 · 10⁻²¹ J → Anzeige „6,07 · 10⁻²¹ J“ ✓; v̄ = √(8kT/(πm)) = √(3,238 · 10⁻²⁰ / 9,398 · 10⁻²⁶) m/s = √344 530 m/s = 587 m/s → „590 m/s“ ✓. Ebenso −20 °C → 253 K, 5,24 · 10⁻²¹ J, 545 m/s → „550“ ✓; 100 °C → 373 K, 7,73 · 10⁻²¹ J, 662 m/s → „660“ ✓; Verhältnis √(373,15/273,15) = 1,169 ✓ (v ~ √T).
  2. Heizen mit 1000 W ab −20 °C: Eis erwärmen 0,5 kg · 2100 J/(kg·K) · 20 K = 21 kJ → 21 s ≈ 0,35 min; Schmelzen 0,5 kg · 334 kJ/kg = 167 kJ → 167 s = 2,8 min (Plateau im Diagramm von ≈ 0,35 bis ≈ 3,1 min ✓, Anzeige „≈ 2,8 min“ ✓); Wasser 0 → 100 °C 0,5 · 4190 · 100 J = 209,5 kJ → 100 °C bei 397,5 s ≈ 6,6 min (Diagramm ✓); Verdampfen 0,5 · 2257 kJ = 1128,5 kJ → „≈ 1129 kJ“, 18,8 min ✓. Halbe Schmelzwärme 83,5 kJ → „50 % flüssig“ ✓.
  3. Diffusion 10 °C/70 °C: η(10 °C) = 2,414 · 10⁻⁵ · 10^(247,8/143,15) Pa·s = 1,30 mPa·s, η(70 °C) = 2,414 · 10⁻⁵ · 10^(247,8/203,15) = 0,40 mPa·s (Tabellen 1,31 bzw. 0,40 ✓); Faktor (343,15/283,15) · (1,30/0,40) = 1,212 · 3,25 = 3,93 → Anzeige „3,9-mal so oft“ ✓; mittlere Geschwindigkeit 577 bzw. 635 m/s → „580“/„640“ ✓. η(20 °C) = 1,002 mPa·s, η(100 °C) = 0,279 mPa·s (Tabelle 0,282) ✓.
- **Sonderfälle:** 0 K: `meanSpeed`, `meanKineticEnergy`, `thermalSpeed` sind 0, unter 0 K durch `max(0, …)` begrenzt (Regler ohnehin −30 … 130 °C) ✓. Genau 0 °C bzw. 100 °C gelten als fest bzw. flüssig (Beginn des Plateaus) ✓. Obergrenze 130 °C / Untergrenze −30 °C: Platte schaltet ab, Hinweis im Bild ✓. Thermometer von −20 °C auf 91 °C gezogen: Zustand springt sauber auf flüssig ✓. Keine Division durch 0 (Leistung ≥ 200 W, Tauschrate > 0).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** über `fmt` ✓; negative Temperaturen in der Kelvin-Rechnung geklammert „(−20) + 273 K“ ✓. Zwischen Zahl und Einheit brach die Zeile teils um („580 / m/s“, „10 / °C“) → jetzt geschütztes Leerzeichen in allen Texten mit Platzhaltern.
- **Begriffe wie im Unterricht:** durchgehend „Teilchen“; im Lernmaterial stand einmal „Wassermoleküle“ → „Wasserteilchen“ (wie in der Anzeige „Warum schneller?“). Fehlvorstellung „Teilchen werden größer/wärmer“ wird im Lernmaterial ausdrücklich angesprochen ✓. Teilchen werden nicht größer gezeichnet, nur die Farbe zeigt die Geschwindigkeit ✓.
  - Ergebnis „Momentan“: „zugeführte Energie Q = P · t“ stimmte nicht, sobald man zwischendurch die Platte ausschaltet oder die Leistung ändert, und beim Kühlen stand eine negative „zugeführte“ Energie da → jetzt „zugeführte Energie Q = … kJ“ bzw. beim Kühlen „abgegebene Energie Q = … kJ“ (Betrag); toter Ausdruck `(p.heat === 'off' ? 0 : 0) +` entfernt.
  - Ergebnis „Temperatur und Teilchenbewegung“: „… ≈ 6,07 · 10⁻²¹ J · Teilchen im Mittel ≈ 590 m/s schnell“ las sich wie ein Produkt „J · Teilchen“ → eigener Satz in neuer Zeile.
- **Neue/ergänzte Tests:** 5 neue Tests in `tests/teilchenmodell.test.ts` (Kelvin und 0 K, angezeigte Werte 6,07 · 10⁻²¹ J/590/550/660 m/s, Aufgaben 2 und 3 mit 167 kJ/1128,5 kJ/334 s/397,5 s, Phasengrenzen, Diffusion 3,93 und 580/640 m/s); jetzt 23 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 293 K, 253 K, 373 K; 373/293 = 1,27 → 27 % ✓. A2 167 000 J / 500 W = 334 s ≈ 5,6 min ✓ (Link zeigt das Plateau). A3 2257/334 = 6,76 ≈ 6,8 ✓. A4, A5 qualitativ ✓ (A5-Link zeigt 4,6-mal so oft bei 80 °C/10 °C).
  - Der Link „Aufgabe laden“ von A1 (`?T=20&_hide=1`) zeigte im Ergebnis „Temperatur und Teilchenbewegung“ sofort „293 K“ → das Ergebnis ist jetzt als `spoiler` markiert und wird im Aufgabenmodus verdeckt.
- **„Beispiel laden“ geklickt:** alle sechs (Eis bei −20 °C, Vom Eis zum Dampf, Schmelzen bei 0 °C, Dampf abkühlen, Gas mit Pfeilen, Diffusion) – passen; „Dampf abkühlen“ zeigt „Kondensieren … die Energie wird frei“ ✓.
- **Texte vereinfacht/korrigiert:** DE: Hinweis „genau 273,15 K, zum Rechnen genügt meist 273 K“; „Wassermoleküle“ → „Wasserteilchen“. EN war stark gekürzt (Einführung ohne Formelblock und Hinweise zur Darstellung, 5 statt 8 Ausprobieren-Punkte, 3 statt 5 Aufgaben, knappe Unterrichtsideen) → auf DE-Umfang ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung; auf dem Handy stehen Zylinder, Diagramm und Histogramm untereinander.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf, keine Überlappungen. Im Canvas keine Formelzeichen mit Index (nur „ϑ in °C“, „v in m/s“), daher kein Index-Problem.
- **Touch (Ziehen) und Maus:** mit der Maus geprüft: Thermometer ziehen stellt die Temperatur ein (−20 → 91 °C, Zustand wechselt) ✓; Teilchen antippen zeigt seine Spur, daneben tippen beendet ✓; „Tinte eintropfen“ ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (laut JSON trotz zufälliger Teilchenbewegung)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; alles auch über Regler und Auswahlfelder bedienbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung DE/EN vorhanden; Zustand, Anteile, Temperatur und Durchmischung stehen als Text in den Ergebnissen.
- **Farben:** aus `ctx.theme`; Geschwindigkeit blau → rot (kein Rot/Grün), zusätzlich Histogramm mit Achse; kalt/warm zusätzlich beschriftet.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/teilchenmodell/index.ts` | Ergebnis „Temperatur und Teilchenbewegung“ als `spoiler` (Aufgabe 1 verrät die Lösung nicht mehr) und Satz „Die Teilchen sind im Mittel …“ statt „J · Teilchen“ (DE/EN) |
| `src/simulations/physik/teilchenmodell/index.ts` | Ergebnis „Momentan“: zugeführte bzw. abgegebene Energie statt „Q = P · t“ (`nowStateCool`, DE/EN), toten Ausdruck entfernt |
| `src/simulations/physik/teilchenmodell/index.ts` | `tr`: geschütztes Leerzeichen zwischen Zahl und Einheit |
| `src/content/simulations/de/teilchenmodell.md` | 273,15 K ergänzt, „Wassermoleküle“ → „Wasserteilchen“ |
| `src/content/simulations/en/teilchenmodell.md` | auf DE-Umfang ergänzt (Einführung, 8 Ausprobieren-Punkte, 5 Aufgaben, Unterrichtsideen) |
| `tests/teilchenmodell.test.ts` | 5 neue Tests mit den nachgerechneten Werten |

## 6. Für den Kern (nicht selbst ändern)
- Geschütztes Leerzeichen zwischen Zahl und Einheit wäre allgemein sinnvoll (z. B. in `fmt` oder in der Ergebnis-Ausgabe des Hosts); hier lokal in `tr` gelöst.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Beim schnellen Schmelzen (1000 W) zeigt das Histogramm im Bild kurzzeitig „Ø 640 m/s“, obwohl 0 °C einer mittleren Geschwindigkeit von 570 m/s entsprechen (bei 200 W: 600 m/s; ohne Heizen: 570 m/s ✓). Ursache ist vermutlich Lageenergie, die beim Lösen der Gitterfedern frei wird und die der Thermostat nur verzögert abführt. Das widerspricht leicht der Aussage „die Energie macht die Teilchen nicht schneller“. Thermostat beim Rollenwechsel straffer einstellen?
- Ergebnis „Temperatur und Teilchenbewegung“ ist jetzt `spoiler`; damit ist es auch verdeckt, wenn die Ergebnisse unter der Bühne ausgeblendet sind. In Ordnung so?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2892/2892 grün (125 Dateien), Build ok.
