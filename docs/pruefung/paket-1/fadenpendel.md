# Prüfprotokoll: `fadenpendel` – Fadenpendel

Prüfer: Paket 1 (Prüf-Agent) · Datum: 22.10.2026 · Stand: Commit `6a98ea0` · Bogen: `scratchpad/boegen/fadenpendel.png` und `scratchpad/fadenpendel/bogen-graphs/fadenpendel-large.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus verriet T₀ auf dem Mond und beim Sekundenpendel im Bild, in Hinweisen und in „Gemessene Periodendauer“; Aufgaben-Link A1 setzte schon die Lösung l = 0,99 m; Hilfetext zur Dämpfung enthielt eine Entwickler-Notiz und kombinierende Zeichen; uneinheitliche Rundung durch weggelassene Endnullen; Achsenlinie lief durch den Diagrammtitel; „l = …“ überlappte „φ = …“ bei kleinen Winkeln; allgemeiner Ziehen-Tipp; Näherung T ≈ T₀ · (1 + φ₀²/16) fehlte im Lernmaterial; 2 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Rechnet die Simulation exakt?** Ja. Die Bewegung wird mit sin φ numerisch gelöst (Runge-Kutta 4. Ordnung, Schritt 0,5 ms), die exakte Periodendauer über das arithmetisch-geometrische Mittel (gleichwertig zum elliptischen Integral). Die Kleinwinkelnäherung läuft als gestricheltes „Geisterpendel“ mit, die Reihe 1 + φ₀²/16 + 11φ₀⁴/3072 steht als Vergleichskurve im Diagramm T/T₀. Jetzt auch im Lernmaterial erklärt.
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (l = 1 m, Erde): T₀ = 2π · √(1/9,81) = 6,2832 · 0,31928 = 2,006 s; f = 1/2,006 = 0,498 Hz ✓ (Anzeige „2,006 s“, „0,498 Hz“).
  2. φ₀ = 20°, m = 0,5 kg: h = 1 · (1 − cos 20°) = 1 − 0,93969 = 0,0603 m; E_pot = 0,5 · 9,81 · 0,0603 = 0,296 J; v_max = √(2 · 9,81 · 0,0603) = √1,1832 = 1,09 m/s ✓ (Anzeige „0,296 J (h = 0,0603 m)“, „1,09 m/s“).
  3. φ₀ = 90°: AGM(1; cos 45° = 0,70711): a₁ = 0,85355, b₁ = 0,84090; a₂ = 0,84723, b₂ = 0,84721 → 0,84721; T/T₀ = 1/0,84721 = 1,1803; T = 2,006 · 1,1803 = 2,368 s, also +18,0 % ✓ (EN-Anzeige „2.368 s – 18.0 %“). Reihe: φ₀ = π/2 = 1,5708 → 1 + 2,4674/16 + 11 · 6,0881/3072 = 1 + 0,15421 + 0,02180 = 1,1760 ✓.
  4. φ₀ = 120°: T/T₀ = 1,3729 → T = 2,754 s ✓; Fadenkraft unten F_S = m · g · (3 − 2 · cos 120°) = 4 · m · g ✓ („unten: 4,00 · m · g“); schlaff ab |φ| = arccos(⅔ · (−0,5)) = arccos(−0,3333) = 109,5° ✓.
  5. Mond, 1 m: T₀ = 2π · √(1/1,62) = 6,2832 · 0,78567 = 4,937 s ✓; gemessene Periode bei 20°: 4,937 · 1,0077 = 4,975 s, Anzeige 4,974 s ✓ (Messung über Nulldurchgang der Winkelgeschwindigkeit).
  6. Dämpfung k = 0,2 1/s: γ = 0,1 1/s, t½ = ln 2/0,1 = 6,93 s ✓ („t½ = 6,9 s“ im Diagramm).
  7. Reglergrenze φ₀ = 170°: T/T₀ = 1/AGM(1; cos 85° = 0,08716) = 2,439 ✓ (Anzeige 2,4394), bei l = 2,5 m T₀ = 3,172 s, T = 7,737 s ✓.
- **Sonderfälle:** φ₀ = 0: Hinweis „Das Pendel hängt still“, Ergebnisse „keine Schwingung“, Messknopf gesperrt, keine Division durch 0 (Test). φ₀ nahe 180°: Regler bis ±170°, Modell liefert bei 180° `Infinity` ohne Absturz (Test). |φ₀| > 90°: starre Stange statt Faden, deutlich gekennzeichnet; Fadenkraft-Diagramm färbt den „schlaffen“ Bereich. l = 0,2 m und 2,5 m: Szene skaliert sinnvoll, Diagramme passen. Negative Auslenkung: Vorzeichen der Rückstellkraft stimmt (Test).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** `fmt.num` ließ Endnullen weg („√(1 m / …)“, „φ = 20°“ neben „φ = −58,9°“, „E_pot = 0 J“ neben „0,049 J“, Säulen „0,3“ neben „0,296“). Jetzt `fmt.fixed` mit fester Stellenzahl; Energie-Ergebnis mit 3 gültigen Ziffern (`fmt.sig`): „0,296 J (h = 0,0603 m)“ statt „0,2958 J (h = 0,0603 m)“; Abweichung in % mit 1 statt 2 Nachkommastellen („37,3 %“ statt „37,29 %“).
- **Begriffe wie im Unterricht:** Periodendauer, Frequenz, Rückstellkraft, Fadenkraft, Ortsfaktor, Lage-/Bewegungsenergie, Kleinwinkelnäherung, Sekundenpendel, Abklingkonstante ✓. Kein φ̂ mit kombinierendem Dach, durchgehend φ₀.
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/fadenpendel.test.ts` (alle Aufgabenwerte A1–A5 und die 0,8 % aus den Unterrichtsideen, Genauigkeit der Reihe bis 60°; Sonderfälle φ₀ = 0, 180°, 170°, Längen 0,2/2,5 m, numerische Periode bei 170°/2,5 m gegen die exakte, Vorzeichen der Rückstellkraft); jetzt 16 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 l = 9,81 · (1/π)² = 0,994 m ✓. A2 T² = 2,016; 4,040; 6,052 s²; Σ l·T² = 1,008 + 4,040 + 9,077 = 14,126; Σ l² = 3,5; k = 4,036 s²/m; g = 39,478/4,036 = 9,78 m/s² ✓. A3 4,94 s, Faktor 2,46 ✓. A4 1,09 m/s; 3 · 0,5 · 9,81 = 14,7 N ✓. A5 18 %, 2,37 s, Begründung schlaff ✓. Keine Abweichungen.
- **Aufgabenmodus:** Mit `_hide=1` zeigten bei A3 (Mond) die Pille „T₀ = 4,94 s“, der Hinweis „T₀ ist 2,46-mal so lang“, das Ergebnis „Periodendauer (Kleinwinkelnäherung)“ und „Gemessene Periodendauer 4,974 s“ die Lösung. Jetzt sind „Periodendauer (Kleinwinkelnäherung)“ und „Gemessene Periodendauer“ `spoiler`; im Bild „T₀ = ? s“, Planeten- und Sekundenpendel-Hinweis ausgeblendet, T-Klammer im φ(t)-Diagramm nur „T“, „T ≈ …“-Pille, T/T₀-Etikett und Titelwert im Diagramm „Große Auslenkung“ verdeckt, solange das jeweilige Ergebnis verdeckt ist. A2: Steigung und „g ≈ …“-Pille im T²-l-Diagramm verdeckt, solange „Auswertung“ verdeckt ist (Messtabelle bleibt als Werkzeug).
- **„Beispiel laden“ geklickt:** alle sieben über die gleichwertigen Links (Kleine Auslenkung, Große Auslenkung 120°, Diagramme 70°, Messreihe 6°, Sekundenpendel, Mond, Gedämpft) – passen zu den Beschreibungen; alle Ausprobieren- und Aufgaben-Links geladen. Messreihe dreimal (1,0/2,0/0,5 m) gestoppt: g ≈ 9,83 m/s² mit Reaktionszeit, plausibel.
- **Texte vereinfacht/korrigiert:** DE: Abschnitt „große Auslenkung“ um die Schulnäherung T ≈ T₀ · (1 + φ₀²/16), den Hinweis „Simulation rechnet numerisch exakt“ und eine kurze Erklärung des AGM ergänzt; Dämpfung ohne $\dot\varphi$ erklärt; Ausprobieren 5 „ab zwei Längen unter den Ergebnissen, ab drei im Diagramm“ (stand „ab drei“, Ergebnis erscheint aber schon bei zwei); Ausprobieren 6 „antippen“ statt „ziehen“; A1-Link `?l=1` mit Auftrag „so einstellen, dass T₀ = 2,00 s“ (vorher `?l=0.99&_hide=1` = Lösung). EN: Schulnäherung und „numerisch exakt“ ergänzt (EN darf kürzer sein, sonst fachlich richtig). Ergebnistext „wird gemessen …“ (auch im Stillstand) → „erscheint nach der ersten vollen Schwingung“.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Ansicht „Pendel“ (Standardbogen) und „Große Auslenkung“ (zweiter Bogen) in Ordnung; iPad quer nutzt bereits das Nebeneinander-Layout (`w ≥ 640 || w ≥ 1,3 h`). Alle fünf Ansichten zusätzlich bei 1360 px und 390 px geprüft.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Behoben: senkrechte Linie der aktuellen Auslenkung lief durch den Titelwert „T = 2,754 s“ (Titelwerte haben jetzt einen Hintergrund); bei kleinen Winkeln lag „l = 0,50 m“ auf „φ = 2°“ (Längenbeschriftung jetzt auf der anderen Seite des Fadens). Rest (nicht geändert): „h = 8,6 cm“ berührt bei etwa 20–25° die Stativstange; bei φ₀ = 90° liegt die Kugel auf dem Stativarm (gleiche Höhe wie die Aufhängung); bei −170° und l = 2,5 m drängen sich die Kraftbeschriftungen an der Kugel.
- **Touch (Ziehen) und Maus:** Kugel mit der Maus von 20° auf 24° gezogen → schwingt los, h = 1 · (1 − cos 24°) = 0,0865 m, E = 0,5 · 9,81 · 0,0865 = 0,424 J ✓. Antippen der Diagramme (Zeitmarke, Länge, Winkel) funktioniert.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (beide Bögen).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung. Ziehen der Kugel und Antippen der Diagramme sind Komfort; alles ist über Regler (Auslenkung, Länge) und Knöpfe (Loslassen, Messen, Abspielen) erreichbar → kein `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; alle Werte zusätzlich als Text in den Ergebnissen.
- **Farben:** nur `ctx.theme.series`; Kräfte und Energien zusätzlich beschriftet (F_G, F_R, F_S, E_pot, E_kin, W_R), Planeten in der Legende benannt ✓. Szene (Raum, Stativ, Tisch) mit festen Sachfarben, dunkel angepasst.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/fadenpendel/index.ts` | Aufgabenmodus: „Periodendauer (Kleinwinkelnäherung)“ und „Gemessene Periodendauer“ als `spoiler`; T₀-Pille, Hinweise, T-Klammer, T/T₀-Etikett, Diagrammtitel, Steigung und g-Pille über `ctx.isHidden` verdeckt |
| `src/simulations/physik/fadenpendel/index.ts` | einheitliche Rundung (`fmt.fixed`, Energie-Ergebnis mit `fmt.sig` 3 Ziffern, % mit 1 Stelle) |
| `src/simulations/physik/fadenpendel/index.ts` | Hilfetext Dämpfung ohne Entwickler-Notiz und ohne kombinierende Zeichen (φ̇) |
| `src/simulations/physik/fadenpendel/index.ts` | eigener `hint` je Ansicht statt „Die markierten Punkte lassen sich ziehen“ |
| `src/simulations/physik/fadenpendel/index.ts` | Titelwerte der Diagramme mit Hintergrund; Längenbeschriftung bei kleinen Winkeln auf der anderen Fadenseite; Text „erscheint nach der ersten vollen Schwingung“ |
| `src/content/simulations/de/fadenpendel.md` | Näherung 1 + φ₀²/16, „rechnet numerisch exakt“, AGM erklärt; Dämpfung; Ausprobieren 5/6; A1-Link ohne Lösung |
| `src/content/simulations/en/fadenpendel.md` | Näherung und „numerisch exakt“ ergänzt |
| `tests/fadenpendel.test.ts` | 2 neue Tests (Aufgabenwerte, Sonderfälle/Reglergrenzen) |

## 6. Für den Kern (nicht selbst ändern)
- Im Lehrplan steht für `fadenpendel` `thumb: 'generic'`, obwohl `thumb.svg` existiert. `SimThumb` zeigt eine vorhandene `thumb.svg` vorrangig, die Karte zeigt also das richtige Bild – nur der Eintrag ist irreführend und könnte bei Gelegenheit angepasst werden.
- Der Prüfbogen schreibt im Titel `&amp=` als `&=` (HTML-Entität `&amp` im Seitentitel des Bogens); die Seite selbst lädt richtig.
- `simshot.cjs` arbeitet immer mit 1000 px Höhe; für flache Bühnen (iPad quer) mit Parametern hilft nur `pruefbogen.cjs` mit Adresse samt Abfrage – eine Höhenangabe in `simshot` wäre praktisch.

## 7. Entscheidungen
- **„Periodendauer (Kleinwinkelnäherung)“ als `spoiler`:** Das Ergebnis ist die Lösung von A3 (Mond). Es wirkt nur mit `_hide=1`; normal bleibt es sichtbar. Weil dadurch `ctx.hidden` bei allen `_hide`-Links gilt, ist die T₀-Pille dort „?“ – deshalb lädt A1 jetzt ohne `_hide`.
- **A1-Link `?l=1` statt `?l=0.99&_hide=1`:** Der alte Link stellte die Lösung ein, und der Hinweis „Sekundenpendel: T₀ ≈ 2,00 s“ erschien sofort. Jetzt suchen die Schüler die Länge selbst mit der T₀-Anzeige als Werkzeug.
- **„Gemessene Periodendauer“ als `spoiler`:** zeigt bei A3 nach einer Schwingung 4,974 s. In „Periodendauer messen“ ist die Messtabelle das Werkzeug, sie bleibt sichtbar.
- **Messtabelle und Stoppuhr im Aufgabenmodus sichtbar, nur Steigung/g verdeckt:** A2 verlangt die Auswertung, nicht das Messen.
- **AGM im Ergebnis belassen, im Lernmaterial erklärt und Schulnäherung ergänzt:** Die Rechnung ist exakt und für Interessierte nachvollziehbar; für Jgst. 10–12 genügt T ≈ T₀ · (1 + φ₀²/16) (bis 60° auf 0,5 % genau, Test).
- **Rundung fest statt „Endnullen weglassen“:** springende Breiten und gemischte Stellenzahlen beim Schwingen vermeiden; Energie mit 3 gültigen Ziffern passt zu den Lösungen (0,296 J; 0,0603 m; 1,09 m/s).
- **Kein `setKeyTargets`:** Ziehen und Antippen haben vollwertige Regler/Knöpfe als Ersatz.
- **Parameter `damping` (k mit γ = k/2) unverändert:** Schlüssel steht in geteilten Links; Hilfetext erklärt γ = k/2 jetzt ohne Formelzeichen mit Punkt.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3484/3484 grün (151 Dateien), Build ok. (Ein erster Lauf hatte unter Last einen Zeitüberschreitungs-Fehler in `tests/radioaktiver-zerfall.test.ts`; einzeln und im zweiten Gesamtlauf grün, nicht von dieser Prüfung betroffen.)
