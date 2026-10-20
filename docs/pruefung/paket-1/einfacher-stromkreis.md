# Prüfprotokoll: `einfacher-stromkreis` – Einfacher Stromkreis

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `0c2b4b2` · Bogen: `scratchpad/boegen/einfacher-stromkreis.png` (außerhalb des Repos)

## Ergebnis
korrigiert (abgeschnittene Schaltzeichen-Legende, irreführender Vergleich beim Kurzschluss mit Motor/Klingel, Beispielname „Kurzschluss mit Sicherung“, Überlappung auf dem Handy, Lernmaterial EN ergänzt, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):** Modell I = U / (R_i + R_Prüfstrecke + R_Sicherung + R_Last) mit U = 4,5 V, R_i = 0,7 Ω.
  1. Lampe, Schalter geschlossen: I = 4,5 V / (0,7 + 15) Ω = 0,2866 A → Anzeige „I ≈ 0,29 A“ ✓. P = 0,2866² · 15 = 1,232 W = 91 % von 1,35 W → T = 2700 K · 0,9126^¼ ≈ 2639 K, Lampe leuchtet fast voll ✓. Motor: 4,5 / 18,7 = 0,2406 A → „0,24 A“ ✓; Klingel: 4,5 / 22,7 = 0,1982 A → „0,20 A“ ✓ (vorher „0,2 A“, s. u.).
  2. Kurzschluss (Lampe ∥ Leitung 0,03 Ω): R_Last = 15 · 0,03 / 15,03 = 0,02994 Ω; I = 4,5 / 0,72994 = 6,165 A → „6,2 A“ ✓; Verhältnis 6,165 / 0,2866 = 21,5 → „etwa 22-mal“ ✓. Durch die Lampe nur 0,1846 V / 15 Ω = 12 mA, Wendel ≈ 550 K → dunkel ✓. Motor/Klingel: ebenfalls 6,2 A, aber 6,165 / 0,2406 ≈ 26 bzw. 6,165 / 0,1982 ≈ 31 – die Anzeige sagte dort „22-mal so groß wie mit Lampe“ → korrigiert auf „26-mal (31-mal) so groß wie ohne Kurzschluss“.
  3. Bleistiftmine (6 Ω): I = 4,5 / 21,7 = 0,2074 A → „0,21 A“ ✓; P = 0,645 W (48 %), T ≈ 2245 K, Leuchten ((2245 − 800)/1900)² ≈ 0,58 → „leuchtet schwächer“ ✓.
  4. Sicherung (0,05 Ω, 1 A): normal 4,5 / 15,75 = 0,286 A < 1 A → bleibt ganz ✓; mit Kurzschluss 4,5 / 0,77994 = 5,77 A > 1 A → schmilzt nach 0,35 s durch, danach I = 0 A und Text „Erst die Ursache beseitigen …“ ✓. „Neue Sicherung einsetzen“ bei liegender Brücke → schmilzt erneut ✓.
- **Sonderfälle:** offener Schalter (auch mit Brücke und Sicherung) → I = 0, Sicherung bleibt ganz ✓; Nichtleiter (R = ∞) → I = 0 ohne Division durch ∞-Probleme ✓; leere Prüfstrecke → „Die Prüfstrecke ist offen“ ✓. Batterie verkehrt herum und defekte Lampe sind in der Simulation nicht vorgesehen (siehe Rückfragen). Reduzierte Bewegung: Sicherung schmilzt trotzdem (Neuzeichnen läuft über `heat`) ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** A und V, Dezimalkomma über `fmt` ✓; Stromstärke jetzt immer mit zwei Nachkommastellen (`fmt.fixed`), vorher „0,2 A“ neben „0,29 A“; Kurzschluss eine Nachkommastelle ✓; Minus als „−“ an Pol und Text ✓.
- **Begriffe wie im Unterricht:** geschlossener/offener Stromkreis, Leiter/Nichtleiter (Isolator), Kurzschluss, Sicherung, technische Stromrichtung (+ → −) vs. Elektronen (− → +) außerhalb der Batterie ✓. Schaltzeichen nach DIN EN 60617: Batterie langer dünner Strich = Plus, kurzer dicker = Minus ✓, Glühlampe Kreis mit Kreuz ✓, Motor Kreis mit M ✓, Sicherung Rechteck mit durchgehendem Leiter ✓, Schalter als Schließer ✓, Verzweigung mit Punkt ✓.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/einfacher-stromkreis.test.ts` (Stromstärken Lampe/Motor/Klingel/Graphit, Kurzschlusswerte und Verhältnisse 22/26/31, Sicherung normal/Kurzschluss/offen, Helligkeit Metall/Graphit); jetzt 11 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 Schaltplan Batterie–Schalter–Motor in Reihe ✓ (Link zeigt `view=plan` mit Motor); A2 vier Leiter (Büroklammer, Münze, Alufolie, Graphit), vier Nichtleiter ✓; A3 Elektronen überall vorhanden, Driftgeschwindigkeit Bruchteile mm/s ✓; A4 Leitung fast ohne Widerstand, I etwa 20-mal so groß (Simulation 21,5) ✓; A5 Draht schmilzt nicht → keine Unterbrechung ✓. Alle Links setzen gültige Werte; `_hide=1` verdeckt die Ergebnisse.
- **„Beispiel laden“ geklickt:** alle sechs. „Kurzschluss mit Sicherung“ lud nur einen Stromkreis mit Sicherung ohne Kurzschluss (passend zum Ausprobieren-Punkt 6 „Baue eine Sicherung ein und stelle dann den Kurzschluss her“) → umbenannt in „Stromkreis mit Sicherung“ (ID `fuse` unverändert). Übrige Beispiele passen zu Bild und Ergebnissen.
- **Texte vereinfacht/korrigiert:** DE in Ordnung; Ausprobieren 2 um „oder tippe sie an“ ergänzt (Touch). EN war etwa halb so lang: Einführung (Elektronen, technische Stromrichtung, Schaltzeichen-Liste, Leiter, Kurzschluss/Sicherung), alle 7 Ausprobieren-Punkte, Aufgaben 1, 3 und 5, Unterrichtsideen (Einsatz, Modell, Stolpersteine, Sicherheit) ergänzt; jetzt gleichwertig zu DE.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten in Ordnung; Handy: Aufbau über Schaltplan, Legende entfällt bei Platzmangel.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** (a) Schaltzeichen-Legende bei 1360 px: „Schalter (geschlosse…“ am rechten Rand abgeschnitten → Legende misst jetzt die Beschriftungen und nimmt eine Spalte bzw. verkleinert die Schrift. (b) Handy 360 px: Pille „Sicherung durchgeschmolzen“ verdeckte „Schalter“ → auf schmalen Bildschirmen kurz „durchgeschmolzen“ (rot an der Sicherung). Kein waagerechter Überlauf.
- **Touch (Ziehen) und Maus:** Antippen mit der Maus geprüft: Schalter im Bild schließt den Stromkreis ✓; Brücke, Gegenstände und Sicherung über dieselben Tap-Ziele. Kein Ziehen angeboten.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Elektronen als ruhende Pfeile/Punkte, Motor und Klingel ohne Bewegung)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON sinnvoll; alles, was man im Bild antippen kann, auch über Schalter/Auswahl/Aktionen erreichbar (Schalter, Kurzschluss, Sicherung, neue Sicherung, Gegenstand, nächster Gegenstand).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Zustand, Stromstärke und Stromrichtung als Text in den Ergebnissen.
- **Farben:** Diagramm-/Hinweisfarben aus `ctx.theme`; die Fotos/Bauteile (Batterie, Kabel, Glühwendel nach Temperatur) nutzen feste Materialfarben – als gegenständliche Darstellung vertretbar. Leiter/Nichtleiter im Protokoll zusätzlich als Wort, Kurzschluss mit ⚠ und Text, also nicht nur Rot/Grün.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/einfacher-stromkreis/index.ts` | Kurzschluss-Anzeige vergleicht mit demselben Gerät ohne Kurzschluss („wie ohne Kurzschluss“ statt „wie mit Lampe“) |
| `src/simulations/physik/einfacher-stromkreis/index.ts` | Stromstärke immer mit zwei Nachkommastellen (`fmt.fixed`) |
| `src/simulations/physik/einfacher-stromkreis/index.ts` | Schaltzeichen-Legende: keine abgeschnittenen Beschriftungen mehr |
| `src/simulations/physik/einfacher-stromkreis/index.ts` | Handy: kurze Beschriftung „durchgeschmolzen“ statt Überlappung mit „Schalter“ |
| `src/simulations/physik/einfacher-stromkreis/index.ts` | Beispiel `fuse` heißt „Stromkreis mit Sicherung“ |
| `src/content/simulations/en/einfacher-stromkreis.md` | auf DE-Umfang ergänzt (Einführung, 7 Ausprobieren-Punkte, 5 Aufgaben, Unterrichtsideen) |
| `src/content/simulations/de/einfacher-stromkreis.md` | Ausprobieren 2: „oder tippe sie an“ |
| `tests/einfacher-stromkreis.test.ts` | 4 neue Tests mit den nachgerechneten Werten |

## 6. Für den Kern (nicht selbst ändern)
- nichts

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Sonderfälle „Batterie verkehrt herum“ und „Lampe defekt (Wendel durchgebrannt)“ gibt es nicht. Verkehrt gepolt ändert bei Lampe nur die Richtung (Motor dreht andersherum) – als Erweiterung sinnvoll? Eine defekte Lampe wäre ein guter Fall für „offener Stromkreis trotz geschlossenem Schalter“.
- Das Klingel-Schaltzeichen (Halbkreis über einem Strich mit zwei Anschlüssen) entspricht der üblichen Schulbuchform; bitte an DIN EN 60617 gegenprüfen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2880/2880 grün (125 Dateien), Build ok.
