# Prüfprotokoll: `doppelspalt` – Doppelspalt und Gitter

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `8e0c4f1` · Bogen: `scratchpad/boegen/doppelspalt.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Rechenlogik fehlerfrei; zu grobe Rundung bei kleinen Winkeln und Abständen, Spaltbreite im Einzelspalt als „0,02 mm“ statt 16,7 µm, Einheitenwechsel mm/cm innerhalb der Tabellenspalte, Messmarke erreichte beim Gitter das 1. Maximum nicht, fehlende Ordnungen unerwähnt, Minimumbedingung, Gitterkonstante und sichtbares Licht fehlten im Material; 2 Aufgaben und 6 Tests ergänzt).

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (λ = 650 nm, g = 0,10 mm, a = 2,0 m): sin α₁ = 650 · 10⁻⁹/10⁻⁴ = 0,0065 → α₁ = 0,3724°; x₁ = 2,0 m · tan 0,3724° = 13,00 mm; Δx ≈ λa/g = 13,0 mm ✓; k_max: g/λ = 153,85 → 153 ✓.
  2. Gitter 500/mm, λ = 500 nm, a = 1 m: g = 2 µm, sin α₁ = 0,25 → 14,48°, x₁ = tan 14,48° = 25,82 cm; α₂ = 30°, x₂ = 57,7 cm; α₃ = 48,59°, x₃ = 1,134 m; g/λ = 4 → k = 4 genau bei 90°, k_max = 3 ✓. Höhe der Maxima (Einzelspalt-Hülle, b = g/6): k = 1: (sin 30°/(π/6))² = 0,912 → Anzeige 91 % ✓.
  3. Einzelspalt: b = 0,1 mm/6 = 16,67 µm; sin α = 650 nm/16,67 µm = 0,039 → x = 2 m · tan(2,236°) = 78,1 mm ✓.
  4. Erstes Minimum Doppelspalt: Δs = λ/2 → sin α = 0,00325 → x = 6,50 mm; Messmarke dort 0 % ✓.
  5. Grenzfall Gitter 1000/mm, λ = 700 nm, a = 5 m: sin α₁ = 0,7 → 44,43°, x₁ = 5 · tan 44,43° = 4,90 m; g/λ = 1,43 → k_max = 1 ✓.
- **Sonderfälle:** Exakt gerechnet (x = a · tan α, sin α = kλ/g), Kleinwinkelnäherung nur als Zusatzzeile beim Spalt, beim Gitter nicht angeboten ✓. λ ≥ g ist mit den Reglern nicht erreichbar (kleinste g = 1 µm > 700 nm); Modell liefert dann k_max = 0, kein Winkel (Test), Anzeige „noFirst“ vorhanden. k · λ = g (90°) wird nicht gezählt ✓. Reglergrenzen g = 0,05/1 mm, gl = 50/1000, λ = 400/700 nm, a = 0,2/5 m geprüft. Bei gl = 1000, λ = 700 nm, a = 5 m lag x₁ = 4,90 m außerhalb des Markenbereichs (max 3000 mm) → Höchstwert auf 5000 mm.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Bei g = 1 mm, a = 0,2 m zeigte die Tabelle α = 0,02°, 0,05°, … und x = 0,1; 0,2; 0,2 mm, Δx = 0,1 mm (richtig 0,080 mm). Jetzt: Winkel unter 1° mit 3 gültigen Ziffern (0,372°; 0,0229°), Längen mit mindestens 2 gültigen Ziffern, Einheit und Stellen einer Tabellenspalte richten sich nach x₁ (vorher „91,1 mm“ neben „10,4 cm“). Ergebnis „x₁ = 2,0 m · tan 0,372° = 13,00 mm“ lässt sich jetzt von Hand bestätigen (mit 0,37° kamen 12,92 mm heraus). Spaltbreite im Einzelspalt „0,02 mm“ → „16,7 µm“ (mit 0,02 mm ergäbe die Handrechnung 65 statt 78 mm).
- **Begriffe wie im Unterricht:** Gangunterschied, Hauptmaxima, Ordnung, Gitterkonstante, Einzelspalt-Hülle, Kleinwinkelnäherung ✓. Schirmabstand heißt hier `a`, Ort des Maximums `x_k` (in Bayern auch e bzw. a_k üblich) – unverändert, weil Schlüssel und Material durchgehend so.
- **Neue/ergänzte Tests:** 6 neue Tests in `tests/doppelspalt.test.ts` (Minima bei (k + ½)λ und A6, fehlende Ordnung k = 6, Sonderfälle λ ≥ g und 90°, Reglergrenzen inkl. Markenbereich, A7 und A3/A4-Werte, Einzelspalt 16,7 µm/78,1 mm); jetzt 11 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 13 mm, 0,37° ✓. A2 52/4 = 13 mm → λ = 13 mm · 0,1 mm/2 m = 650 nm ✓. A3 siehe oben ✓. A4 57,7 cm ≠ 2 · 25,8 cm ✓. A5 N − 1 = 4 Nullstellen, 3 Nebenmaxima ✓. Neu A6: 6,5 mm. Neu A7: tan α = 0,276 → 15,43°, sin = 0,2661 → λ = 532 nm; Näherung g·x/a = 552 nm (+3,8 %).
- **Aufgabenmodus:** `val` ist `resultsParam` ✓; mit `val=0&_hide=1` sind Winkel/Orte der Tabelle „?“, k-Beschriftungen und Δx verdeckt, Ergebnisse „Maxima“ und „Anzahl“ als `spoiler` ✓. Schirmbild, Skala und Messmarke bleiben (Messwerkzeug).
- **„Beispiel laden“ geklickt:** alle fünf Beispiele und alle Links (?xm=13, N=5&env=1, Gitter, Einzelspalt, Aufgaben-Links, neue A6/A7-Links) geladen – zeigen den beschriebenen Zustand.
- **Texte vereinfacht/korrigiert:** DE: Minimumbedingung Δs = (2k + 1) · λ/2, Fall λ ≥ g, Begriff Gitterkonstante g = 1 mm/Strichzahl, Hinweis Kleinwinkelnäherung beim Gitter, fehlende Ordnungen (k = 6, 12, … wegen b = g/6), Absatz „Licht und Farbe“ (380–780 nm, Regler 400–700 nm), A6 und A7 neu, Unterrichtsidee nennt den Schalter statt `val=0`. EN fachlich richtig, kürzer belassen (Projektregel).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout wählt bereits nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`); iPad quer nebeneinander, gut lesbar. Info-Karte hatte auf breiten Bühnen viel Leerraum (max. 6 Zeilen) → bis 10 Zeilen, wenn Platz ist.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine. Rest: Beim Gitter 50/mm steht „k = 6“ über einer fehlenden (dunklen) Ordnung – fachlich der Ort des Maximums, im Ergebnis erklärt.
- **Touch (Ziehen) und Maus:** Messmarke mit der Maus von 20 auf 13,0 mm gezogen, Zeile k = 1 wird hervorgehoben ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur:** Messmarke auch über den Regler „Messmarke x“ bedienbar (Pfeiltaste 4× → 22,0 mm geprüft) → kein `setKeyTargets` nötig.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; alle Werte zusätzlich in den Ergebnissen.
- **Farben:** Lichtfarbe aus der Wellenlänge (Sachfarbe), Rest aus `ctx.theme`; nichts nur über Rot/Grün unterschieden. Eigener `hint` („Die orange Messmarke … ziehen“) statt des allgemeinen Punkte-Tipps.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/doppelspalt/index.ts` | Rundung: Winkel < 1° mit 3 gültigen Ziffern, Längen/Δx/sin/tan mit ≥ 2 gültigen Ziffern, einheitliche Einheit je Tabellenspalte |
| `src/simulations/physik/doppelspalt/index.ts` | Spaltbreite in µm (16,7 µm) im Einzelspalt-Ergebnis |
| `src/simulations/physik/doppelspalt/index.ts` | Hinweis auf fehlende Ordnungen (k = 6, 12, …) im Ergebnis „Anzahl der Maxima“ (DE/EN) |
| `src/simulations/physik/doppelspalt/index.ts` | Messmarke bis 5000 mm (Regler und Ziehen) |
| `src/simulations/physik/doppelspalt/index.ts` | Tabelle bis 10 Zeilen; eigener `hint` |
| `src/content/simulations/de/doppelspalt.md` | Minima, λ ≥ g, Gitterkonstante, Kleinwinkelnäherung beim Gitter, fehlende Ordnungen, Licht und Farbe, A6, A7, Unterrichtsidee |
| `tests/doppelspalt.test.ts` | 6 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Eine Hilfsfunktion „mindestens n gültige Ziffern“ in `fmt` (z. B. `fmt.sig(v, 2)`) wäre nützlich; hier lokal als `digits()` gelöst.
- `simshot.cjs`: Ein Adresse mit „gitter“ im Spec auf der Kommandozeile löst die Git-Schutzprüfung des Worktrees aus; Spec-Datei deshalb mit dem Schreibwerkzeug angelegt (nur Hinweis für andere Prüfer).

## 7. Entscheidungen
- **Messmarken-Höchstwert 3000 → 5000 mm** (kein Schlüssel umbenannt): Größtes erreichbares x₁ ist 5 m · tan(arcsin 0,7) = 4,90 m; nur so lässt sich beim Gitter jede Ordnung 1 messen. Feinere Schritte bleiben über Ziehen und Eingabefeld möglich.
- **Fehlende Ordnungen erklären statt Modell ändern:** b = g/6 ist sinnvoll (deutliche Hülle). Dass k = 6, 12, … fehlen, ist echte Physik und ein guter Gesprächsanlass; Hinweis im Ergebnis und im Material.
- **Höchste Ordnung bleibt k < g/λ** (beim Doppelspalt 153): So rechnet der Unterricht; dass die hohen Ordnungen praktisch zu dunkel sind, erklärt die Hülle.
- **Winkel unter 1° mit 3 gültigen Ziffern:** Sonst ergibt die Handrechnung mit dem angezeigten Winkel einen anderen x-Wert als angezeigt (12,92 statt 13,00 mm).
- **Tabelle verrät im Aufgabenmodus die Anzahl der Zeilen (A3: k bis 3):** belassen, weil das Schirmbild die 7 Linien ohnehin zeigt – das Beobachten ist Teil des Versuchs, gerechnet werden Winkel und Orte.
- **A7 ohne „Aufgabe laden“:** Der Wellenlängenregler würde die Lösung zeigen; der Link steht in der Lösung.
- **EN nicht erweitert:** Projektregel „EN darf kürzer sein“; fachlich korrekt.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3401/3401 grün (148 Dateien), Build ok.
