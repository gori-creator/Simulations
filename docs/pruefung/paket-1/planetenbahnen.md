# Prüfprotokoll: `planetenbahnen` – Planetenbahnen und Keplersche Gesetze

Prüfer: Paket 1 (Vertretung) · Datum: 22.10.2026 · Stand: Commit `debf5e9` · Bogen: `scratchpad/boegen/planetenbahnen.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus verriet im Bild fast alle Lösungen: v_K/v_F an den Ringen, v, v_P, v_A, a, b, e, ε, T, Δt = T/n, Flächen und Energiewerte, weil die Zeichnung nur den Schalter „Zahlenwerte im Bild“ abfragte und nicht `ctx.hidden`; „Momentan“ zeigte r und v; Zahlen mit wechselnder Stellenzahl („v₀ = 36 km/s“ neben „29,78 km/s“, „v_K ≈ 22 km/s“); „T = …“ auch bei einem Sturz; „1 Umläufe“; Hilfetext mit „v_K“/„v_F“ mit Unterstrich; Aufgabe 4 lud die Tabelle mit der Lösung; Aufgaben 3 und 5 passten in der Rundung nicht zur Anzeige; 4 Tests ergänzt). Rechenlogik fehlerfrei, numerische Bahn driftet nicht.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Kreisbahngeschwindigkeit bei 1 AE: G·M☉ = 6,674·10⁻¹¹ · 1,989·10³⁰ = 1,3275·10²⁰ m³/s²; / 1,496·10¹¹ m = 8,873·10⁸ m²/s²; √ = 29 788 m/s ≈ 29,8 km/s; v_F = √2 · 29,79 = 42,12 km/s ✓ (Anzeige 29,78 / 42,12 km/s mit IAU-Wert G·M☉ = 1,32712·10²⁰).
  2. Standardbahn r₀ = 1 AE, v₀ = 36 km/s (Start im Perihel): q = v₀/v_K = 36/29,785 = 1,2087, q² = 1,4609; r_A = r₀ · q²/(2 − q²) = 1,4609/0,5391 = 2,710 AE; a = (1 + 2,710)/2 = 1,855 AE; ε = q² − 1 = 0,461; v_A = 36 · 1/2,710 = 13,28 km/s; T = a^{3/2} = 1,855 · √1,855 = 2,526 a ✓ (Anzeige 1,85 AE, 0,461, 13,28 km/s, 2,526 a; Tabelle 1,855 / 2,526 / 2,975).
  3. Sturz r₀ = 0,3 AE, v₀ = 2 km/s: fast radialer Fall, a ≈ r₀/2 = 0,150 AE, Fallzeit ≈ T/2 = π·√(0,15³/4π²) a = π · 0,009247 a = 0,02905 a = 10,6 d ✓ (Bild: Absturz bei t = 10,6 d).
  4. Energie bei 46 km/s: ½ · (46 000)² = 10,58·10⁸ J/kg; G·M/r = 1,32712·10²⁰/1,496·10¹¹ = 8,87·10⁸ J/kg; E = +1,71·10⁸ J/kg > 0 → Hyperbel ✓.
  5. Halley-Link r₀ = 0,59 AE, v₀ = 54,38 km/s: v_K = 29,785/√0,59 = 38,776 km/s; q² = (54,38/38,776)² = 1,96667; a = 0,59/(2 − 1,96667) = 17,7 AE; T = 17,73^{3/2} = 74,7 a ✓.
  6. Keplerkonstante 4π²/(G·M☉) = 39,478/1,32712·10²⁰ = 2,975·10⁻¹⁹ s²/m³ ✓ (Tabellenfuß).
- **Langzeit (numerische Integration):** Leapfrog mit fester Schrittweite. Über 200 Umläufe: Standardbahn Energie relativ < 3·10⁻⁶, a < 10⁻⁹, Drehimpuls 10⁻¹³ (Rundung); Halley Energie < 8·10⁻⁵, a < 10⁻⁴; Periheldrehung durch das Verfahren < 0,06°. Kein sichtbares Wegdriften – neuer Test.
- **Sonderfälle:** v₀ = 0 (nur im Modell, Regler ab 2 km/s): Bahn wird als Sturz erkannt, Fallzeit aus 1 AE 64,6 d (bekannter Wert) – Test. Reglergrenzen: v₀ = 2 km/s bei r₀ = 0,3 AE → Sturz mit Meldung; bei r₀ = 5,5 AE → extreme Ellipse (ε = 0,975) ohne Sturz; v₀ = 80 km/s ist bei r₀ ≥ 1 AE für alle Massen Flucht, bei r₀ = 0,3 AE und M = 3 M☉ (v_F = 133 km/s) gebunden – getestet. α = 30°/150° symmetrisch ✓. Parabel beim Knopf „v₀ = v_F“ ✓.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** `fmt.num` ließ Endnullen weg; jetzt `fmt.fixed` (Geschwindigkeiten im Text 2, im Bild 1 Nachkommastelle). Eigene `sig()`-Funktion durch `fmt.sig` ersetzt. „T = … d“ in Tagen ab T ≥ 10 a ohne Nachkommastelle („27 273 d“ mit Tausendertrennung). Pille oben zeigt bei einem Sturz kein „T“ mehr.
- **Begriffe:** Fahrstrahl, Perihel/Aphel, große/kleine Halbachse, lineare/numerische Exzentrizität, Kreisbahn-/Fluchtgeschwindigkeit, Flächensatz – wie im Unterricht ✓.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/planetenbahnen.test.ts` (Langzeitdrift über 200 Umläufe, v₀ = 0 freier Fall, Reglergrenzen, alle Aufgabenwerte); jetzt 23 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 29,8 km/s, T = 2π · 1,496·10¹¹/2,979·10⁴ = 3,156·10⁷ s = 365 d ✓. A2 siehe 4. ✓. A3 v_A = 13,3 km/s ✓; a = 1,855 AE stand als „≈ 1,86“, die Simulation zeigt 1,85 (rechnet mit r_A = 2,7099) → Rechnung ausgeschrieben und erklärt; e = 0,855 AE, ε = 1,71/3,71 = 0,461. A4 1,524^{1,5} = 1,88 a; ∛(11,86²) = 5,20 AE ✓. A5 T = 17,8^{1,5} = 75,1 a, r_A = 35,0 AE ✓; die verlinkte Bahn hat wegen des Reglerschritts a = 17,7 AE, T = 74,7 a → Hinweis ergänzt. A6 M = 4π² · 3,348·10³³/(6,674·10⁻¹¹ · 9,960·10¹⁴) = 1,99·10³⁰ kg ✓.
- **Aufgabenmodus:** Mit `_hide=1` stand im Bild weiter alles (Ringe „v_K = 29,8 km/s“, Pfeile mit v, Halbachsen, ε in der Pille, „T = 365 d“, „Δt = T/12 = 30,4 d“, „je 0,262 AE²“, Energiebalken). Jetzt hängen alle Zahlen im Bild an `ctx.hidden` (deckt auch „Zahlenwerte im Bild“ aus ab), Δt erscheint als „Δt = T/12“, die Bahnform-Pille erst nach Aufdecken von „Bahnform“ (Ausnahme: Sturz), „Momentan“ ist `spoiler`.
- **„Beispiel laden“:** alle sechs (Ellipse, Kreisbahn, Aphel, Hyperbel, Mars mit Planeten, Halley) und alle Aufgaben- und Ausprobieren-Links geladen, passen zu den Texten. A4 lud die Tabelle mit Mars’ T = 1,881 a und Jupiters a = 5,203 AE → Aufgabenlink jetzt ohne Tabelle, die Lösung verlinkt sie.
- **Texte:** Hilfetext zu v₀ ohne „v_K“/„v_F“ (Hilfetexte setzen keinen Index): „Der innere Ring zeigt die Kreisbahngeschwindigkeit, der äußere die Fluchtgeschwindigkeit.“ „Umläufe: n“ statt „1 Umläufe“. EN (kürzer, erlaubt): A2-Rundung und A3-Link wie DE korrigiert, Lösungslink zur Tabelle ergänzt.

## 3. Geräte (Prüfbogen)
- **Alle Geräte, hell/dunkel:** Layout wählt nach Seitenverhältnis (`w > h` nebeneinander) – iPad quer (Bühne ≈ 640 × 400) zeigt Szene und Tabelle nebeneinander, gut lesbar. Handy untereinander, Schrift ≥ 10,5 px. Beamer und 1920 in Ordnung.
- **Überlauf / Überlappungen:** kein Überlauf, keine Konsolenfehler (nur die harmlosen KaTeX-403). Beschriftungen weichen einander aus (`labelAt`). Rest (nicht geändert): Bei sehr flachen Ellipsen (Sturz, Halley) liegen Sektor-Nummern und „a“/„e“ eng beieinander.
- **Ziehen mit der Maus:** Pfeilspitze von v₀ = 46 auf 32,98 km/s gezogen, Bahn und Ergebnisse folgen ✓; Startpunkt (r₀) ziehbar, Einrasten auf v_K/v_F.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur:** Tab-Reihenfolge laut JSON in Ordnung. Ziehen ist Komfort; alle Werte über Regler und Knöpfe („Kreisbahn: v₀ = v_K“, „Fluchtgeschwindigkeit“) erreichbar → kein `setKeyTargets`.
- **Namen:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Werte zusätzlich als Text in den Ergebnissen.
- **Farben:** Diagramme und Pfeile aus `ctx.theme.series`; Weltraum und Planeten mit Sachfarben. Bahnform zusätzlich als Text, Energien mit Namen an den Balken – nichts nur über Farbe.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/planetenbahnen/index.ts` | Zahlen im Bild über `ctx.hidden` statt nur `num` (Ringe, Pfeile, Halbachsen, ε, T, Faden, Flächen, Tabelle, Energiebalken); „Δt = T/n“ ohne Wert im Aufgabenmodus; Bahnform-Pille über `ctx.isHidden('kind')`; „Momentan“ als `spoiler` |
| `src/simulations/physik/planetenbahnen/index.ts` | einheitliche Rundung mit `fmt.fixed`, `fmt.sig` statt eigener Funktion, Tage ab 10 a ganzzahlig, kein „T“ bei Sturz, „Umläufe: n“ |
| `src/simulations/physik/planetenbahnen/index.ts` | Hilfetext v₀ ohne Unterstrich-Indizes |
| `src/content/simulations/de/planetenbahnen.md` | A3 Rechnung mit 1,855 AE und Hinweis auf Anzeige 1,85; A4-Link ohne Tabelle; A5 Hinweis auf Reglerwert (a ≈ 17,7 AE, T ≈ 74,7 a) |
| `src/content/simulations/en/planetenbahnen.md` | Task 2 Rundung, Task 3 Link ohne Tabelle, Lösungslink zur Tabelle |
| `tests/planetenbahnen.test.ts` | 4 neue Tests (Langzeitdrift, v₀ = 0, Reglergrenzen, Aufgabenwerte) |

## 6. Für den Kern (nicht selbst ändern)
- `help`-Texte der Regler setzen keinen Index; eine Auszeichnung wie bei Beschriftungen („v_K“ → v<sub>K</sub>) würde Umformulierungen ersparen.
- Die Bahnform-Pille verschwindet auch bei „Zahlenwerte im Bild“ aus, weil `isHidden` nicht zwischen `_hide=1` und `resultsParam` unterscheidet. Eine Abfrage „nur Aufgabenmodus“ wäre für Etiketten ohne Zahl hilfreich.

## 7. Entscheidungen
- **`ctx.hidden` statt `p.num` in der Zeichnung:** `num` ist `resultsParam`, also deckt `ctx.hidden` beide Fälle ab (Schalter aus und `_hide=1`). Vorher wirkte der Aufgabenmodus nur in der Ergebnisliste.
- **Uhr (t) bleibt im Aufgabenmodus sichtbar,** auch die Zeitachse der Diagramme: Eine Umlaufdauer abzulesen ist Messen, nicht Nachschlagen, und dauert einen ganzen Umlauf. Verdeckt sind nur fertig berechnete Werte (T, Δt = T/n). Anders als bei `freier-fall`, wo die Stoppuhr die Lösung sofort zeigte.
- **„Momentan“ als `spoiler`:** zeigt im Aphel genau v_A (A3) und r_A (A5).
- **Bahnform-Pille im Aufgabenmodus ausgeblendet** (A2 fragt „Kehrt er zurück?“); die gestrichelte Vorhersage bleibt, sie ist Teil des Experiments. Ein Sturz wird immer gemeldet.
- **A4-Link ohne Tabelle,** statt Planetenwerte im Aufgabenmodus zu verstecken: Die Tabelle mit realen Daten bleibt so überall vollständig.
- **Halley-Link bei v₀ = 54,38 km/s belassen:** 54,39 ergäbe a = 18,1 AE; der Reglerschritt 0,01 ist sinnvoll. Abweichung im Text erklärt, sie zeigt zugleich, wie empfindlich weite Bahnen auf v₀ reagieren.
- **Geschwindigkeiten mit fester Stellenzahl** (Text 2, Bild 1 Nachkommastelle): passt zu den Lösungen (29,8 km/s, 13,3 km/s) und vermeidet „36 km/s“ neben „29,78 km/s“.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3455/3455 grün (151 Dateien), Build ok.
