# Bauanleitung: pyramide-kegel-kugel („Pyramide, Kegel und Kugel“, Jgst. 10, Mathematik)

Stand: 13.10.2026. Vorarbeit liegt als Patch in `docs/agenten/wip/M24/9999-unfertig.patch` (Modell, Tests und eine weit fortgeschrittene Ansicht, ca. 2 500 Zeilen). **Nicht neu bauen, sondern fertigstellen.** Allgemeine Regeln: `docs/agenten/AUFTRAG.md` und `SPICKZETTEL.md`.

## 0. Einstieg
1. Eigenen Worktree anlegen, Patch einspielen: `git apply docs/agenten/wip/M24/9999-unfertig.patch`, danach `npm run verify` (Basisstand muss grün sein; sonst zuerst Fehler beheben).
2. Dev-Server auf dem vorgegebenen Port, Screenshot-Werkzeuge wie in AUFTRAG.md Abschnitt 6.

## 1. Vorhandener Umfang (nicht ändern, nur prüfen)
- Körper (`body`): Pyramide (regelmäßiges n-Eck, `n`, Grundkante `a`, Höhe `h`), Kegel (`r`, `h`), Kugel (`r`).
- Modi (`mode`): **Maße** (Höhe, Seitenhöhe/Mantellinie, rechtwinklige Hilfsdreiecke nach Pythagoras, `tri`), **Volumen** (Umschütten `pour` in drei Schüttungen: Pyramide/Kegel füllt Prisma/Zylinder zu ⅓; Kugel nach Archimedes `arch`: Halbkugel + Kegel = Zylinder), **Oberfläche** (Abwickeln `open`: Pyramidennetz, Kegelmantel als Kreissektor; Kugel als Zerlegung in Pyramiden `split`).
- Anzeige: `cyl` (Zylinder um die Kugel), `calc` (Rechnung im Bild). Anzeigefelder G, Strecken, V, M, O, Vergleich (Spoiler-Felder).
- Voreinstellungen: start, cone, pour, archimedes, sector, split.
- Modell (`model.ts`, `formula.ts`) mit Tests in `tests/pyramide-kegel-kugel.test.ts`.

## 2. Offene Punkte (Reihenfolge einhalten)
Bekannte Mängel aus der letzten Prüfrunde:
1. Fragezeile in der Aufgabenkarte, Beschriftung des Anzeigefelds.
2. Kugel: Karte und Beschriftungen (Archimedes-Ansicht).
3. Netze: Beschriftungen und Farben; Beschriftung am Kegelnetz (Sektor, Bogenlänge = Grundkreisumfang) ohne Überlappung.
4. Geteilte Ansicht „Kugel aus Pyramiden“: einzelne Pyramide freistellen.
Danach:
5. **Lernmaterial** `src/content/simulations/de/pyramide-kegel-kugel.md` (derzeit Platzhalter) ausführlich, EN kürzer. Gliederung: Worum geht es? · Bausteine (Höhe h, Seitenhöhe h_a, Mantellinie s, Radius r; Zusammenhänge per Pythagoras) · Pyramide (V = ⅓·G·h, M, O) · Kegel (V = ⅓·π·r²·h, M = π·r·s, O) · Kugel (V = ⁴⁄₃·π·r³, O = 4·π·r²; Archimedes, Zerlegung in Pyramiden mit Höhe r) · Aufgaben mit Lösung (je 1 pro Körper, zahlenmäßig geprüft gegen `formula.ts`) · typische Fehler (⅓ vergessen, r mit d verwechseln, s mit h verwechseln) · Lehrplanbezug Bayern Gymnasium Jgst. 10 (in eigenen Worten, Unsicheres als Entwurf kennzeichnen).
6. Vorschaubild `thumb.svg` (Kegel, Pyramide, Kugel nebeneinander, Farben über CSS-Variablen).
7. Lehrplan: Eintrag in `src/curriculum/mathematik.ts` auf `ready` setzen, Jahrgangsstufe und Optionen unverändert lassen; Eintrag in `src/curriculum/lehrplaene/` prüfen. Konsistenztests nicht abschwächen.

## 3. Prüfumfang (begrenzt, aber nicht weglassen)
Je ein Bild: Desktop 1360 hell (Pyramide Maße, Kegel Volumen nach dem Umschütten, Kugel Archimedes, Kegelnetz offen 100 %), Desktop dunkel (ein Zustand), Tablet 700 (Volumen), Handy 390 (Oberfläche). Zusätzlich Extremwerte (a = 1, h = 10; r = 5, h = 1; n = 3 und n = Maximum). Danach höchstens eine Korrekturrunde.

## 4. Fachliche Eckdaten (zum Gegenprüfen)
Kegel r = 3, h = 4: s = 5; V = 12π ≈ 37,70 cm³; M = 15π ≈ 47,12 cm²; O = 24π ≈ 75,40 cm². Kugel r = 2,5: V ≈ 65,45 cm³; O ≈ 78,54 cm². Quadratische Pyramide a = 4, h = 5: V = 80/3 ≈ 26,67 cm³; Seitenhöhe h_a = √29 ≈ 5,39 cm. Zahlen in der Anzeige mit Dezimalkomma (`ctx.fmt`).

## 5. Abschluss
`npm run verify` grün, Zwischen- und Endcommit (deutsche Nachricht mit den Schlusszeilen der Sitzung), kein Push in andere Zweige, kurzer Bericht: was geprüft, was bewusst offen, Bilderliste (voraussichtlich keine Bilder).
