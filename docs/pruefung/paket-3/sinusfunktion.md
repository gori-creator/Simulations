# Prüfprotokoll: `sinusfunktion` – Allgemeine Sinusfunktion

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `52be7ca` · Bogen: `/tmp/boegen3/sinusfunktion.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Aufgabe 1 (a = 2, b = 2, c = π/4, d = 1): p = 2π/2 = π; W = [1 − 2; 1 + 2] = [−1; 3]; Hochpunkt bei c + p/4 = π/4 + π/4 = π/2 mit f(π/2) = 2 · sin(2 · π/4) + 1 = 2 · 1 + 1 = 3; f(0) = 2 · sin(−π/2) + 1 = −1. Anzeige „f(x) = 2 · sin(2(x − π/4)) + 1“, Bild „p = π“, „|a| = 2“ ✓
  2. Modell Tageslänge (a = 3,8, b = 0,52, c = 2,7, d = 0,2): p = 2π/0,52 = 12,083 ⇒ „p = 2π / b ≈ 12,08“ (vorher „= 12,08“); W = [0,2 − 3,8; 0,2 + 3,8] = [−3,6; 4] ⇒ 12 h − 3,6 h = 8,4 h und 12 h + 4 h = 16 h; Hochpunkt bei 2,7 + 12,08/4 = 5,72 (≈ 21. Juni) ✓
  3. a = −2,5, b = 0,1, c = −2π (cPi = −24), d = −4: p = 2π/0,1 = 20π ≈ 62,83; W = [−4 − 2,5; −4 + 2,5] = [−6,5; −1,5]; Anzeige „f(x) = −2,5 · sin(0,1(x + 2π)) − 4“, „um 2π nach links; um 4 nach unten“, „an der Mittellinie gespiegelt (a < 0)“ ✓
  4. b = 3: p = 2π/3 ≈ 2,09 ⇒ „p = 2π / b = 2π/3 ≈ 2,09“ ✓. Kosinus-Beispiel cPi = −6: sin(x + π/2) = cos x ⇒ „f(x) = sin(x + π/2)“, „um π/2 nach links“ ✓
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): b ≥ 0,1 (keine Division durch 0, Periodengriff setzt b nur bei Länge > 0,2). a = 0: W = [d; d], Graph waagerecht ✓. a < 0: Griff sitzt am Tiefpunkt, Text „gespiegelt“ ✓. c = 0 / d = 0: „in x-Richtung: keine“ ✓. Reglergrenzen b = 0,1 (p = 20π): Periodenmarke läuft rechts aus dem Bild (Ausschnitt auf 40 Einheiten begrenzt) – vertretbar.
- **Phasenverschiebung (Vorzeichen):** Schreibweise „x − c“: c > 0 nach rechts; Schreibweise „x + c“: Umschalten dreht c um, der Graph bleibt (simshot: cPi = 3 ⇒ cPi = −3, weiterhin „um π/4 nach rechts“, Term „sin(x − π/4)“) ✓. Ziehen des Punkts (c | d) um 57 px nach rechts/oben ⇒ c = π/3, d = 1 (Einrasten in π/12) ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma, echtes Minus ✓. **Behoben:** Periode ohne π-Bruch stand mit „=“ (2π/b ist nie endlich dezimal) → „≈“, im Bild „p ≈ 12,08“. In EN Intervall „[−3.6, 4]“ statt „[−3.6; 4]“.
- **Begriffe wie im Unterricht:** **Behoben:** „Wertebereich“ → „Wertemenge“ (wie in den übrigen Funktions-Simulationen). Regler „Amplitude a“ → „Faktor a (Amplitude |a|)“, weil a negativ sein kann. Lernmaterial nennt jetzt Bogenmaß (π ≙ 180°).
- **Neue/ergänzte Tests:** Neue Datei `tests/sinusfunktion.test.ts` (11 Tests): Funktionswerte Aufgabe 1, Spiegelung bei a < 0, cos = um π/2 verschobener Sinus, Tageslängen-Modell (16 h / 8,4 h), Perioden, Periodizität, Wertemenge, erster Hochpunkt, Ausschnitt für Links.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 s. o. ✓ (zusätzlich: c = 5π/4 ebenfalls richtig, in „x + c“-Schreibweise c = −π/4). A2 p = 2π/3, in [0; 2π] genau 3 Schwingungen ✓. A3 (16 + 8,33)/2 = 12,17 ⇒ d ≈ 0,2; (16 − 8,33)/2 = 3,83 ⇒ a ≈ 3,8; b = 2π/12 = 0,524 ≈ 0,52; Maximum 21. Juni ⇒ t ≈ 5,7, c = 5,7 − 3 = 2,7 ✓.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle Links (a = 3, d = 1, b = 2, b = 0,5, cPi = 3, cPi = −6, base = cos, Aufgabe 1, b = 3, Modell) mit simshot.
  - **Behoben:** Aufgabe 1 zeigte die Lösung: Regler mit a = 2, b = 2, c = π/4, d = 1 sichtbar und im Bild „|a| = 2“, „p = π“, Mittellinie und Punkte. Neuer Schalter `info` („Werte und Hilfslinien zeigen“, `resultsParam`): aus ⇒ Regler a, b, c, d, Hilfslinien, Punkte und Ergebnisse verdeckt, Ziehen aus. „Aufdecken“ schaltet zurück. Aufgabenlink jetzt mit `info=0`.
  - **Behoben:** Modell Tageslänge (Beispiel und Link aus A3) und b = 0,5 zeigten nur x ∈ [−7; 7], die Periodenmarke war abgeschnitten, das Jahr nicht ganz sichtbar. Bei Links, Beispielen und Zurücksetzen wird der Ausschnitt jetzt so gewählt, dass die erste Periode und die Wertemenge sichtbar sind (`fitView`, Standardzustand unverändert); beim Bedienen springt nichts.
- **Texte vereinfacht/korrigiert:**
  - DE/EN: Punkte hießen „roter/grüner/violetter Punkt“ (Farben hängen vom Theme ab, Rot/Grün) → „Punkt (c | d) auf der Mittellinie, an dem die Periode beginnt“, „Hochpunkt“, „hohler Punkt am Ende der Periode“.
  - DE/EN: Bogenmaß-Hinweis, Lösung A1 mit weiteren Verschiebungen und Bayern-Schreibweise, Idee „Aufgabenmodus“.
  - EN war unvollständig (Ausprobieren 4, Aufgabe 3 Tageslänge, Lösungsweg A1 und Wertemenge, Stolpersteine als Liste, Einheitskreis, Bayern-Schreibweise fehlten) → auf den Stand der DE-Fassung gebracht (Dezimalpunkt).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Standard-Layout (Bühne links, Einstellungen rechts bzw. darunter), alles lesbar, dunkel gut. Kein Überlauf, keine Konsolenfehler (nur 403 bei Schriften über den Symlink). Modell am Handy (360 px) geprüft: ganze Periode sichtbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** nach der Korrektur keine; bei b = 0,1 bleibt die Periodenmarke rechts offen (s. o.).
- **Touch (Ziehen) und Maus:** Ziehen des Punkts (c | d) mit Einrasten geprüft ✓; Amplituden- und Periodengriff unverändert. Im Aufgabenmodus verschiebt Ziehen nur die Ansicht.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (keine Animation; Ausschnittwechsel ohne Übergang)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alle Größen auch über Regler.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Elemente. `strings.canvas` war allgemein → beschreibt jetzt Graph (durchgezogen), Grundfunktion (gestrichelt), Mittellinie, Amplitudenstrecke, Periodenklammer und die drei ziehbaren Punkte (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** nur `ctx.theme`. f durchgezogen und dick, Vergleichsfunktion gestrichelt; Amplitude beschriftet „|a| = …“, Periode „p = …“, Periodenende hohl. Rot/Grün-Bezug im Text entfernt.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/sinusfunktion/index.ts` | Aufgabenmodus `info` (Regler, Hilfslinien, Punkte, Ergebnisse verdeckt; `resultsParam`) |
| `src/simulations/mathematik/sinusfunktion/index.ts` | Ausschnitt bei Links/Beispielen/Zurücksetzen an erste Periode angepasst |
| `src/simulations/mathematik/sinusfunktion/index.ts` | Periode „≈“ statt „=“ (Anzeige und Bild); EN-Intervall mit Komma |
| `src/simulations/mathematik/sinusfunktion/index.ts` | „Wertemenge“, „Faktor a (Amplitude \|a\|)“, ausführlicher Alt-Text |
| `src/simulations/mathematik/sinusfunktion/model.ts` | `fitView`, `DEFAULT_VIEW` |
| `tests/sinusfunktion.test.ts` | neu, 11 Tests |
| `src/content/simulations/de/sinusfunktion.md` | Wertemenge, Bogenmaß, Punkte nach Rolle statt Farbe, Aufgabenlink `info=0`, Lösung A1 ergänzt, Idee Aufgabenmodus |
| `src/content/simulations/en/sinusfunktion.md` | auf den Stand der DE-Fassung gebracht |

## 6. Für den Kern (nicht selbst ändern)
- Der Zieh-Hinweis („Die markierten Punkte lassen sich … ziehen“) bleibt im Aufgabenmodus sichtbar, obwohl dort keine Punkte gezeigt werden. Ein `dragHint` als Funktion der Werte wäre hilfreich.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Standard-Schreibweise ist „a · sin(b(x − c)) + d“; laut Lernmaterial schreibt der LehrplanPLUS Bayern „x + c“ (dort umschaltbar). Soll der Standard auf „x + c“ wechseln? Lernmaterial und Links sind auf „x − c“ ausgelegt.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3074/3074 grün (134 Dateien), Build ok.
