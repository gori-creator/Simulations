# Prüfprotokoll: `lorentzkraft` – Lorentzkraft und Fadenstrahlrohr

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `369a202` · Bogen: `scratchpad/boegen/lorentzkraft.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Geschwindigkeit in „Bahnradius“ als „10,27 · 10⁶ m/s“ statt „1,03 · 10⁷ m/s“; „aus 1 Messwerten“; Untertitel auf dem Handy von der Hand-Karte verdeckt; Zeigefinger der Hand ohne Hinweis „hinein“; Aufgabe 2 mit 0,998 statt 0,997 mT; im Lernmaterial fehlten sin α, v ∥ B, rechte Hand für positive Ladungen, F = I · l · B und die Umlaufzeit; 3 neue Aufgaben, 4 neue Tests). Rechenlogik fehlerfrei, Richtung der Kraft stimmt.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startzustand U = 200 V, I = 1,4 A: B = (4/5)^1,5 · 1,2566 · 10⁻⁶ · 130 · 1,4/0,15 = 0,71554 · 1,2566 · 10⁻⁶ · 1213,3 = 1,0910 mT ✓ („1,091 mT“); v = √(2 · 1,7588 · 10¹¹ · 200) = √(7,035 · 10¹³) = 8,388 · 10⁶ m/s ✓; r = 8,388 · 10⁶/(1,7588 · 10¹¹ · 1,0910 · 10⁻³) = 0,04371 m = 4,37 cm, d = 8,74 cm ✓; F = 1,602 · 10⁻¹⁹ · 8,388 · 10⁶ · 1,091 · 10⁻³ = 1,466 · 10⁻¹⁵ N ✓ („1,47 · 10⁻¹⁵ N“).
  2. Aufgabe 3, U = 250 V, I = 1,71 A: B = 0,77927 mT/A · 1,71 A = 1,3326 mT; v = 9,378 · 10⁶ m/s; r = 9,378 · 10⁶/(1,7588 · 10¹¹ · 1,3326 · 10⁻³) = 4,001 cm → d = 8,00 cm, liegt auf der Marke ✓; e/m = 500/((1,3326 · 10⁻³)² · 0,04²) = 500/2,841 · 10⁻⁹ = 1,760 · 10¹¹ C/kg ✓ (Simulation nach „Messwert aufnehmen“: 1,760 · 10¹¹, Abweichung 0,1 %).
  3. Automatische Messreihe, U = 300 V auf 8 cm: Strom für r = 4 cm, auf 0,01 A gerundet: I = 1,87 A → B = 1,457 mT, v = √(2 · 1,7588 · 10¹¹ · 300) = 1,027 · 10⁷ m/s, r = 1,027 · 10⁷/(1,7588 · 10¹¹ · 1,457 · 10⁻³) = 4,01 cm ✓; Ausgleichsgerade über 7 Punkte 1,764 · 10¹¹ C/kg (Abweichung durch auf 0,01 A gerundete Ströme) ✓.
  4. Kleinster Kreis U = 100 V, I = 3 A: B = 2,338 mT, r = 5,931 · 10⁶/(1,7588 · 10¹¹ · 2,338 · 10⁻³) = 1,44 cm → d ≈ 2,9 cm; für d = 2 cm wären bei 100 V I = 4,33 A nötig → Marke 2 cm unerreichbar (jetzt im Material erklärt und im Test festgehalten).
  5. Neue Aufgabe 4: T = 2π/(1,76 · 10¹¹ · 1,0 · 10⁻³) = 3,57 · 10⁻⁸ s = 35,7 ns; neue Aufgabe 5: F_G = 9,11 · 10⁻³¹ · 9,81 = 8,94 · 10⁻³⁰ N, F/F_G = 1,466 · 10⁻¹⁵/8,94 · 10⁻³⁰ = 1,64 · 10¹⁴; neue Aufgabe 6: r_p = 4,37 cm · √1836 = 4,37 · 42,85 = 187 cm.
- **Richtung (Drei-Finger-Regel):** Elektron fliegt am Austritt nach oben (+y), B in die Ebene (−z). F = q · v × B = (−e) · (y × (−z)) = (−e) · (−x) = +x → nach rechts; Kreismitte rechts von der Kanone, Umlauf im Uhrzeigersinn ✓. Linke Hand: Daumen v, Zeigefinger B, Mittelfinger F = −(Daumen × Zeigefinger) = +x ✓. Konvention: linke Hand für Elektronen, im Bild, in der Hand-Karte und im Material einheitlich; rechte Hand (positive Ladung, technische Stromrichtung) jetzt im Material erklärt.
- **Sonderfälle:** I = 0 → B = 0, Strahl geradeaus bis ans Glas, „r → ∞ (B = 0)“, „Ohne Magnetfeld fliegen die Elektronen geradeaus“, F = 0 ✓; „Strahl auf nächste Marke“ funktioniert auch bei B = 0 (nimmt 10 cm) ✓. U = 100…300 V, I bis 3 A: Strahl trifft erst ab d > 12,35 cm das Glas, Anzeige „Strahl trifft das Glas“ ✓. v ∥ B und Ladungsvorzeichen sind im Gerät nicht einstellbar → im Material erklärt und im Modell (`lorentzForce` mit Winkel) getestet.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** B 3 Stellen in mT, r und d 2 Stellen in cm, v und F mit 3 geltenden Ziffern in Zehnerpotenz. Fehler: Ergebnis „Bahnradius“ schrieb v immer als „… · 10⁶“ (bei U ≥ 285 V „10,27 · 10⁶ m/s“, Rechenkarte zugleich „1,03 · 10⁷ m/s“) → jetzt normiert wie in der Karte. Zehnerpotenz-Helfer rundet die Mantisse jetzt sicher unter 10 (9,996 → 1,00 · 10^(e+1)).
- **Begriffe wie im Unterricht:** Fadenstrahlrohr, Helmholtzspulen, Beschleunigungsspannung, spezifische Ladung, Lorentzkraft als Zentripetalkraft, Drei-Finger-Regel (UVW) ✓.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/lorentzkraft.test.ts` (Start- und Aufgabenwerte 1–5; Umlaufzeit unabhängig von U, r ~ √U; Sonderfälle B = 0, α = 0, α = 30°, Ladungsvorzeichen, U ≤ 0; Reglergrenzen: Marken 4–10 cm erreichbar, 2 cm nicht, automatische Messreihe trifft 8 cm); jetzt 9 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 0,779 mT ✓. A2 v = 8,39 · 10⁶ m/s, r = 4,77 cm ✓; Simulationswert mit I = 1,28 A: B = 0,997 mT (stand 0,998), r = 4,78 cm → korrigiert. A3 1,76 · 10¹¹ C/kg ✓. Neu A4–A6 (oben).
- **Aufgabenmodus:** Mit `val=0&_hide=1` sind B und Bahnradius verdeckt, Rechenkarte zeigt „?“, Pillen im Bild aus ✓. „Spezifische Ladung aus der Messreihe“ bleibt offen (siehe Entscheidungen).
- **„Beispiel laden“ geklickt:** alle sechs Beispiele über die Adressen (Standard, B ≈ 1 mT, Marke 8 cm, ohne Feld, starkes Feld, Linke-Hand-Regel), alle Aufgaben- und Ausprobieren-Links, „Strahl auf nächste Marke“ + „Messwert aufnehmen“, „Messreihe automatisch“ ✓.
- **Texte vereinfacht/korrigiert:** DE: allgemeine Formel mit sin α und Fall v ∥ B; Drei-Finger-Regel mit linker Hand (Elektronen) und rechter Hand (positive Ladung/technische Stromrichtung); Verbindung zu F = I · l · B (Leiterschaukel); Umlaufzeit T = 2π m/(e B); Hinweis, dass die Marke 2 cm nicht erreichbar ist; Ausprobieren 3 mit konkreter Richtungsangabe; „Linken-Hand-Regel“ → „Linke-Hand-Regel“; Stolperstein „rechte Hand“ präzisiert, neuer Stolperstein v ∥ B. EN: fachlich richtig, kürzer (zulässig), unverändert.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Seitenlayout schon nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`), iPad quer nebeneinander und gut lesbar ✓. Handy: Hand-Karte lag über dem Untertitel „Helmholtzspulen: n = 130, R = 15 c…“ → Untertitel blendet auf schmaler Bühne bei eingeschalteter Hand aus (n und R stehen auch am Regler).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Rest (nicht geändert): Die Vektoren v und F wandern mit einem Elektron mit und streifen kurzzeitig die Kanone bzw. „Durchmesser in cm“ – nur vorübergehend, Beschriftungen mit dunklem Rand lesbar.
- **Touch (Ziehen) und Maus:** kein Ziehen vorgesehen (`dragHint: false`); Bedienung über Regler und Knöpfe ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; Spulenstrom per Pfeiltaste geprüft (1,40 → 1,43 A, Kreis und Werte folgen). Keine antippbaren Objekte → kein `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden.
- **Farben:** Diagramm und Vektoren aus `ctx.theme.series`; Strahl, Spulen und Glas als feste Sachfarben auf immer dunklem Rohr. v, F, B zusätzlich beschriftet, nicht nur über Farbe unterscheidbar ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/lorentzkraft/index.ts` | v im Ergebnis „Bahnradius“ normiert (1,03 · 10⁷ statt 10,27 · 10⁶); Mantisse sicher unter 10 |
| `src/simulations/physik/lorentzkraft/index.ts` | „aus 1 Messwert“ / „aus 7 Messwerten“ (EN „1 data point“) |
| `src/simulations/physik/lorentzkraft/index.ts` | Untertitel auf schmaler Bühne unter der Hand-Karte ausgeblendet; Hand-Wert einmal pro Bild berechnet |
| `src/simulations/physik/lorentzkraft/index.ts` | Hand-Legende „Zeigefinger: B ⊗“ (Feld zeigt in die Ebene) |
| `src/simulations/physik/lorentzkraft/model.ts` | `lorentzForce` mit Winkel α (F = q v B sin α), neue `orbitPeriod` (T = 2π m/(e B)) |
| `src/content/simulations/de/lorentzkraft.md` | sin α, v ∥ B, Drei-Finger-Regel links/rechts, F = I · l · B, Umlaufzeit, Marke 2 cm, A2 0,997 mT, neue A4–A6, Stolpersteine |
| `tests/lorentzkraft.test.ts` | 4 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Keine neuen Punkte.

## 7. Entscheidungen
- **„Spezifische Ladung aus der Messreihe“ nicht als `spoiler`:** Der Wert entsteht erst, wenn man selbst misst („Messwert aufnehmen“ oder Messreihe). Das ist die experimentelle Bestimmung von e/m und kein Verraten. Als `spoiler` würde er außerdem verdeckt, sobald jemand „Werte im Bild anzeigen“ (`resultsParam`) ausschaltet, und das würde die Messreihe unbrauchbar machen.
- **`val` bleibt `resultsParam`, B und Bahnradius bleiben `spoiler`:** passt – der Schalter verbirgt genau B, v, r und F im Bild.
- **Marke 2 cm bleibt** und wird im Material erklärt, statt den Stromregler auf 4,5 A zu erweitern: Das echte Schulgerät hat ebenfalls eine Marke, die man kaum erreicht; die Regler-Grenze 3 A ist realistisch.
- **Leiterkraft F = I · l · B, sin α und Umlaufzeit nur im Material und Modell**, nicht als neue Anzeige: Die Simulation zeigt das Fadenstrahlrohr (v ⊥ B). Die Zusammenhänge gehören fachlich dazu, eine eigene Leiterschaukel wäre eine neue Simulation.
- **Neue Aufgabe 5 (F gegen F_G)** begründet, warum die Gewichtskraft der Elektronen vernachlässigt wird; **Aufgabe 6 (Protonen)** übt die Richtung mit der rechten Hand und zeigt r ~ √m.
- **Untertitel statt Hand-Karte verschieben:** Die Karte weiter unten würde auf dem Handy den Strahl verdecken.
- **EN nicht erweitert** (Projektregel); fachlich geprüft, keine Fehler.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3435/3435 grün (149 Dateien), Build ok.
