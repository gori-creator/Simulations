# Prüfprotokoll: `induktion` – Elektromagnetische Induktion

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `d3a2b5a` · Bogen: `scratchpad/boegen/induktion.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Generator-Spule falsch gezeichnet: Bild und Rechnung widersprachen sich; Stromrichtung im Bild bei allen drei Versuchen unabhängig vom Vorzeichen bzw. beim Magneten verkehrt; Aufgabenmodus `_hide=1` verriet Û, Rechnung und Momentanwert im Bild; Diagramm beim Generator nur zu einem Drittel genutzt; Scheingenauigkeit „1256,64 V“; keine Tastaturbedienung für Magnet und Stab; unpassender Ziehen-Tipp beim Generator; EN-Artikel „a N pole“; 4 Tests und Aufgabe 7 ergänzt). Rechenlogik in `model.ts` fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Stab auf Schienen (Start): U = B · l · v = 0,50 T · 0,20 m · 2,0 m/s = 0,200 V; I = U/R = 0,200 V / 2 Ω = 0,100 A; F = B · I · l = 0,5 · 0,1 · 0,2 = 0,010 N ✓. Doppelte Geschwindigkeit: 0,5 · 0,2 · 4 = 0,400 V ✓. Per Tastatur mit v = 0,5 m/s: U = 0,5 · 0,2 · 0,5 = 0,050 V, I = 0,025 A, F = 0,5 · 0,025 · 0,2 = 0,0025 ≈ 0,003 N ✓ (Anzeige identisch).
  2. Generator (Beispiel): ω = 2π · 5 Hz = 31,42 1/s; Û = 100 · 0,10 T · 0,010 m² · 31,42 1/s = 3,14 V; U_eff = 3,14/√2 = 2,22 V; T = 0,2 s ✓. Momentanwerte: bei φ = 39°: 3,1416 · sin 39° = 3,1416 · 0,6293 = 1,98 V ✓; bei φ = 312°: 3,1416 · (−0,7431) = −2,33 V ✓; doppelte Frequenz bei φ = 276°: 6,283 · (−0,9945) = −6,25 V ✓.
  3. Magnet und Spule (Feld auf der Achse eines Zylindermagneten, Br = 1,2 T, L = 8 cm, R = 1,2 cm): z = 5 cm → B = 0,6 · (0,13/0,13055 − 0,05/0,05142) = 0,6 · 0,02338 = 0,0140 T; dB/dz = 0,6 · R² · [(0,13² + R²)^−1,5 − (0,05² + R²)^−1,5] = 8,64·10⁻⁵ · (449,4 − 7355) = −0,597 T/m; mit n = 100, A = π · (2 cm)² = 12,57 cm², v = −0,3 m/s (Annähern): U = −n · A · dB/dz · v = −100 · 1,2566·10⁻³ · (−0,597) · (−0,3) = −0,0225 V ✓ (Test).
  4. Reglergrenze Generator n = 500, B = 1 T, A = 400 cm², f = 10 Hz: Û = 500 · 1 · 0,04 · 62,83 = 1257 V, U_eff = 889 V; Messbereich ± 3000 V reicht ✓.
- **Sonderfälle:** Magnet in Ruhe (auch in der Spule): U = 0, Text „Ruht der Magnet …“ ✓. v = 0 bzw. ω = 0 sind über die Regler nicht erreichbar (min 0,5 m/s bzw. 0,5 Hz); im Modell geben `motionalVoltage(…, 0)`, `generatorPeak(…, 0)` 0, `current(U, 0)` und `inducedFromSamples(…, dt = 0)` 0 ohne Division durch 0 (Test). Stab im Automatikbetrieb steht an den Enden 0,5 s still → U = 0 ✓. Vorzeichenwechsel: Annähern U < 0, Entfernen U > 0, beim Generator Wechsel nach jeder halben Periode ✓. Fluss im ganzen Zugbereich des Magneten (z = −3 … 30 cm) monoton – kein Vorzeichenwechsel beim bloßen Hineinschieben (Test).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Spannungen jetzt einheitlich mit etwa 3 gültigen Ziffern (0,200 V; 3,14 V; 62,8 V; 1257 V) statt fest 2 Nachkommastellen („1256,64 V“). Rechnung: ω mit 1 Nachkommastelle wie im Lernmaterial (31,4 1/s statt 31,42 in der Ergebnisliste und 31,4 im Bild), A in m² ohne Endnullen („0,01 m²“ statt „0,0100 m²“), T und f ohne Endnullen, F mit 3 Stellen (0,010 N wie in Aufgabe 2). Digitalanzeige „U = 0,000 V“ war bei −0,0004 V rot → Farbe jetzt nach dem gerundeten Wert.
- **Begriffe wie im Unterricht:** Fluss, Flussdichte, Windungszahl, Induktionsgesetz, Lenzsche Regel, Scheitelwert Û, Effektivwert, Periodendauer, Flächennormale ✓.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/induktion.test.ts` (Magnetwert von Hand, Sonderfälle, Reglergrenzen, Aufgabenwerte A2/A4/A6/A7); jetzt 8 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 0,20 V ✓. A2 0,10 A; 0,010 N; P = F · v = 0,020 W = U · I ✓. A3 31,4 1/s; 3,14 V; 2,22 V; 0,2 s ✓. A4 6,28 V; 0,1 s ✓. A5 Nordpol/Südpol ✓ (passt zum Bild: „induzierter Pol N“, „Abstoßung“). A6 ΔΦ = 0,2 T · 20·10⁻⁴ m² = 4,0·10⁻⁴ Wb; 500 · 4,0·10⁻⁴/0,1 = 2,0 V ✓. Neu A7: U = Û · sin φ → 1,57 V bei 30°, 3,14 V bei 90°.
- **„Beispiel laden“ geklickt:** alle sechs (Magnet, dreifache Windungszahl, Stab, doppelte Geschwindigkeit, Generator 3,14 V, doppelte Frequenz 6,28 V) – passen zu den Beschreibungen; alle Aufgaben- und Ausprobieren-Links geladen.
- **Aufgabenmodus:** `_hide=1` (A3, A7) zeigte im Bild Û = 3,14 V, die Rechenkarte und den Digitalwert, weil das Bild nur den Schalter `val` prüfte. Jetzt verdecken `ctx.isHidden('calc')` (Rechenkarte, Û-Linie, Kraft F am Stab) und `ctx.isHidden('now')` (Digitalwert, n · Φ und U beim Magneten). `val` bleibt `resultsParam`.
- **Texte vereinfacht/korrigiert:** DE: Hinweis zur Tastaturbedienung unter „Zur Darstellung“; A6-Lösung ordnet Feldänderung gegenüber Flächenänderung ein; neue A7 (Stellung der Spule). EN: „an N pole“ statt „a N pole“ (Lenz-Text), Stolperstein „coil faces the field“ → „coil area is perpendicular to the field“ (eindeutig). EN bleibt kürzer (Projektregel).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout wählt schon nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`), iPad quer nebeneinander ✓. Generator auf dem Handy: Titel „Generator“ lag auf dem N-Pol, „zum Spannungsmesser“ auf dem S-Pol → Höhe der Pole jetzt aus dem Platz unter dem Titel und über den Schleifringen berechnet.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Skala des Spannungsmessers bei ± 3000 V auf kleinem Zifferblatt: „−1500 0 1500“ überlappten → bei Bereichen ab 1000 V nur drei Zahlen. Diagramm nutzte den Messbereich (± 10 V bei Û = 3,14 V) → eigener „runder“ Bereich knapp über dem Scheitel (± 4 V).
- **Touch (Ziehen) und Maus:** Magnet und Stab per Maus ziehbar (schaltet „automatisch“ ab) ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Magnet und Stab waren nur per Ziehen bewegbar → `ctx.setKeyTargets`: Enter schiebt den Magneten mit 0,25 m/s in die Spule bzw. zieht ihn heraus; der Stab fährt gleichmäßig mit dem eingestellten v ans andere Ende (dann gilt genau U = B · l · v). Geprüft mit simshot (Fokus auf `.sim__stage--keys`, Enter) ✓.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Tastaturziele mit Namen („Magnet in die Spule schieben“ usw.).
- **Farben:** Diagramm/Pfeile aus `ctx.theme.series`; Pole zusätzlich mit N/S beschriftet, Vorzeichen der Spannung zusätzlich als „−“ – nicht nur über Rot/Grün.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/induktion/index.ts` | Generator: Spule richtig zur Normalen gezeichnet (φ = 0 Kante zum Betrachter, Fluss maximal; φ = 90° volle Breite, Fluss null) |
| `src/simulations/physik/induktion/index.ts` | Stromrichtung: Punkte folgen dem Vorzeichen (vorher `flow · sgn`, immer gleiche Richtung); Pfeil an der Spule umgedreht (Lenz) |
| `src/simulations/physik/induktion/index.ts` | Aufgabenmodus über `ctx.isHidden('calc'/'now')` |
| `src/simulations/physik/induktion/index.ts` | Diagrammbereich, Spannungen mit 3 gültigen Ziffern, Formate der Rechnung, Farbe der Digitalanzeige, Skala ab 1000 V |
| `src/simulations/physik/induktion/index.ts` | Generator-Szene auf dem Handy ohne Überlappungen |
| `src/simulations/physik/induktion/index.ts` | Tastaturziele für Magnet und Stab, eigener `hint` je Versuch, EN „an N pole“ |
| `src/content/simulations/de/induktion.md` | Tastatur-Hinweis, A6 Feld- vs. Flächenänderung, neue A7 |
| `src/content/simulations/en/induktion.md` | Stolperstein eindeutig formuliert |
| `tests/induktion.test.ts` | 4 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Das Tastaturziel liegt auf dem Bühnen-Element (`.sim__stage--keys`), nicht auf der Zeichenfläche; das Beispiel im Kopf von `simshot.cjs` (`["focus","[data-sim-root] canvas"]`) trifft es nicht. Beispiel dort anpassen.
- Wie bei anderen Simulationen: eigene `richText`/`parts`-Hilfen für Indizes (`U_[eff]`) – könnten auf `subText` umgestellt werden; keine sichtbaren Fehler, daher nicht angefasst.

## 7. Entscheidungen
- **Generator-Zeichnung neu orientiert statt Formel geändert:** Rechnung (Φ = B · A · cos φ, U = Û · sin φ) und Lernmaterial sind richtig; falsch war nur das Bild (volle Spulenbreite = Fläche parallel zum Feld, aber dort Fluss maximal angezeigt). Jetzt passen Bild, Normalenpfeil, φ-Anzeige und Kurven zusammen.
- **Stromrichtung nachgerechnet und vereinheitlicht:** U > 0 heißt Umlauf rechtshändig um die Feld- bzw. Normalenrichtung. Magnet nähert sich → U < 0 → Strom vorne in der Spule nach oben → linkes Spulenende Nordpol (Lenz) ✓. Stab nach rechts → Strom im Stab nach oben, Kreis gegen den Uhrzeigersinn ✓.
- **Aufgabenmodus mit `isHidden` je Ergebnis** statt `ctx.hidden` (global falsch nach Aufdecken). Zeiger des Spannungsmessers und φ-Anzeige bleiben: Ablesen am Zeiger ist ungenau und erwünscht, φ braucht A7.
- **Diagramm mit eigenem Bereich, Messgerät behält 1-3-10-Bereiche:** Schulmessgeräte haben diese Bereiche; das Diagramm soll die Kurve aber groß zeigen.
- **Tastatur: Magnet nur bis z = 3 cm** (wie der Automatikbetrieb): Das Modell rechnet die Spule als eine Windung in der Mitte; fährt die Stirnfläche bis zur Spulenmitte, entsteht eine übertrieben hohe Spitze (≈ 5 V bei n = 300).
- **Windungszahl bleibt `n`** (nicht `N`): projektweit einheitlich (auch `lorentzkraft`), Lernmaterial durchgehend mit n.
- **Neue Aufgabe 7** zur Stellung der Spule, weil gerade dieser Punkt im Bild falsch war und häufig verwechselt wird.

## Offene Kleinigkeiten
- Beim Ziehen lässt sich der Magnet bis z = −3 cm schieben; dort ist die Spitze wegen der Einwindungs-Näherung zu groß (siehe oben). Nicht geändert, weil das Ziehen frei bleiben soll.
- Im Automatikbetrieb fährt der Stab bei 2 m/s in 0,28 s über die Schienen (echte Zeit) – kurz, aber im Diagramm gut sichtbar.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3405/3405 grün (148 Dateien), Build ok.
