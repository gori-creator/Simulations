# Prüfprotokoll: `schiefe-ebene` – Schiefe Ebene

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `826ec77` · Bogen: `scratchpad/boegen/schiefe-ebene.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus verriet im Bild F_H, F_N, F_R und den Grenzwinkel; Indizes auf der Zeichenfläche als „F_G“ mit Unterstrich; uneinheitliche Rundung der Kräfte; Beschriftungen „h = … cm“ und „F_R,max“ in Randfällen abgeschnitten bzw. auf der Achse; EN stark gekürzt; Steigung in Prozent ergänzt; 3 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (m = 1 kg, α = 20°, Holz μ_H = 0,5, μ_G = 0,3): F_G = 1 · 9,81 = 9,81 N; F_H = 9,81 · sin 20° = 9,81 · 0,3420 = 3,36 N; F_N = 9,81 · 0,9397 = 9,22 N; F_R,max = 0,5 · 9,22 = 4,61 N; F_R = 0,3 · 9,22 = 2,77 N; 3,36 < 4,61 → haftet ✓ (Anzeige identisch).
  2. Holzklotz bei 35°: a = 9,81 · (sin 35° − 0,3 · cos 35°) = 9,81 · (0,5736 − 0,2458) = 9,81 · 0,3278 = 3,22 m/s² ✓.
  3. Hochziehen mit F_Z = 8,5 N bei 20°: a = (8,5 − 3,36 − 2,77)/1 = 2,38 m/s² ✓; nach 0,42 s v ≈ 0,99 m/s (2,38 · 0,42 = 1,00) ✓.
  4. Wagen mit 3 N bei 20°: a = (3,355 − 3 − 0,005 · 9,22)/1 = 0,31 m/s² hinab ✓.
  5. Reglergrenze α = 70°, m = 5 kg, F_Z = 50 N: F_G = 49,05 N; F_H = 49,05 · 0,9397 = 46,09 N; F_N = 49,05 · 0,3420 = 16,78 N; Haltebereich 46,09 ∓ 8,39 = 37,70 N bis 54,48 N ✓.
  6. Stahl auf Eis bei 10°: a = 9,81 · (0,1736 − 0,01 · 0,9848) = 1,61 m/s²; Weg bis zum Anschlag 0,458 m → t = √(2 · 0,458/1,61) = 0,75 s; Anzeige „t = 0,76 s, unten angekommen“ ✓.
  7. Ziehen mit der Maus am oberen Ende: α = 37° → F_H = 9,81 · 0,6018 = 5,90 N ✓.
- **Sonderfälle:** α = 0°: F_H = 0, F_N = F_G, „bleibt liegen“, keine h-Beschriftung ✓. α = 90° (nur im Modell, Regler bis 70°): F_H = F_G, F_N = 0, a = g ✓ (Test). μ = 0 (eigene Werte): Grenzwinkel 0°, Klotz rutscht schon bei 1° ✓. Haftgrenze tan α = μ_H: F_H = F_R,max, Klotz haftet gerade noch (Vergleich mit Toleranz 1e−9) ✓. μ_G > μ_H wird bei eigenen Werten verhindert ✓. Keine Division durch 0 (a = …/m, m ≥ 0,1 kg).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Kräfte wurden mit `fmt.num` gerundet und dabei Endnullen weggelassen („1,7 N“ neben „9,66 N“, „37,7 N bis 54,48 N“, „α_G ≈ 42°“) → jetzt einheitlich 2 Nachkommastellen (`fmt.fixed`), Grenzwinkel 1 Nachkommastelle, F_Z 1 Nachkommastelle. F_G im Bild hatte 1 Nachkommastelle („9,8 N“) neben „9,81 N“ in der Legende → jetzt 2.
- **Begriffe wie im Unterricht:** Gewichtskraft, Hangabtriebskraft, Normalkraft, Haft-/Gleitreibung, Haft-/Gleitreibungszahl, Grenzwinkel, Kraftmesser, Goldene Regel der Mechanik, Kraftwandler ✓. Steigung in Prozent (tan α) fehlte → im Lernmaterial ergänzt.
- **Neue/ergänzte Tests:** 3 neue Tests in `tests/schiefe-ebene.test.ts` (Sonderfälle α = 0°/90°, μ = 0, Haftgrenze; alle Aufgabenwerte 1–7; Beispielwerte der Ergebnisse und Reglergrenze); jetzt 11 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 F_G = 19,62 N, F_H = 9,81 N, F_N = 19,62 · 0,8660 = 16,99 N ✓; A2 9,81 · 0,34 = 3,34 ≈ 3,3 N (bei 20° 3,36 N) ✓; A3 tan 25° = 0,466 < 0,5 → haftet, α_G = 26,57° ✓; A4 a = 3,22 m/s², t = √(0,8/3,22) = 0,50 s ✓ (Weg bis zum Anschlag 45,8 cm, also messbar); A5 tan 31° = 0,601 ✓ (Link: bei 30° haftet, bei 31° rutscht) ✓; A6 3,36 + 0,3 · 9,22 = 6,12 ≈ 6,1 N, Anfahren 3,36 + 4,61 = 7,96 ≈ 8,0 N ✓. Neu A7: tan α = 0,12 → α = 6,84°, sin 6,84° = 0,119 ≈ 12 %; Wagen bei 7°: 9,81 · sin 7° = 1,20 N ✓.
- **Aufgabenmodus:** Mit `_hide=1` zeigte die Legende im Bild F_H, F_N und F_R mit Betrag (A1, A2, A6 damit sofort gelöst) und das Diagramm die Linie „α_G = 26,6°“ (A3 gelöst). Jetzt: Beträge als „? N“, solange „Zerlegung“ bzw. „Reibung“ verdeckt sind; Grenzwinkel-Linie und -Beschriftung, solange „Grenzwinkel“ verdeckt ist (`ctx.isHidden`). Kurven im Diagramm bleiben (Ablesen ist erwünscht).
- **„Beispiel laden“ geklickt:** alle sechs (Holzklotz bei 20°, rutscht, Stahl auf Eis, Wagen mit Kraftmesser, Klotz hochziehen, Gummi: Grenzwinkel) – passen zu den Beschreibungen. Alle Aufgaben- und Ausprobieren-Links geladen.
- **Texte vereinfacht/korrigiert:** DE: Absatz „Steigung in Prozent“ und Aufgabe 7 ergänzt; Aufgabe 6 bekam „Aufgabe laden“. EN war stark gekürzt (3 statt 7 Aufgaben, 4 statt 6 Ausprobieren-Punkte, ohne Kraftwandler-Erklärung und Stolpersteine im Detail) → vollständig auf DE-Umfang übersetzt; Hinweis, dass μ_s/μ_k in der Simulation μ_H/μ_G heißen. Eigener Tipp-Text unter der Bühne (`hint`): „Zieh das obere Ende der Ebene (Winkel), den Körper oder den Ring des Kraftmessers.“

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** in Ordnung; iPad quer: Szene und Diagramm nebeneinander, gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Bei flacher Ebene (α ≈ 10°) ragte „h = 17 cm“ rechts aus der Szene ins Diagramm → weicht jetzt an die Keilkante (links der Maßlinie) aus. Bei Stahl auf Eis lag „F_R,max“ auf der α-Achse → steht bei kleiner Kurve jetzt darüber. Rest (nicht geändert): Am Anschlag unten rücken „α = …°“, „F_H“ und „F_R“ eng an den Klotz (lesbar dank Hintergrundrand); auf dem Handy ist die Szene wegen der Reserve für 70° eher klein; „α in °“ (Kern-Achsbeschriftung) berührt das Ende der F_N-Kurve.
- **Touch (Ziehen) und Maus:** mit der Maus geprüft: oberes Ende von 20° auf 37° gezogen, Werte stimmen (oben) ✓. Körper und Kraftmesser-Ring sind ebenfalls Griffe.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Loslassen berechnet den Endzustand sofort).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; Winkel und Zugkraft auch über Regler. Die Lage des Körpers auf der Ebene ist nur per Ziehen änderbar – reine Komfortfunktion, daher kein `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; alle Werte zusätzlich als Text in den Ergebnissen.
- **Farben:** Kräfte aus `ctx.theme.series`, jede Kraft im Bild beschriftet und in der Legende benannt – nicht nur über Farbe unterscheidbar ✓. Szene (Tisch, Keil, Materialien) bewusst mit festen Sachfarben, dunkel angepasst.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/schiefe-ebene/index.ts` | Aufgabenmodus: Beträge von F_H, F_N, F_R in der Legende und Grenzwinkel-Linie im Diagramm verdeckt, solange die zugehörigen Ergebnisse verdeckt sind |
| `src/simulations/physik/schiefe-ebene/index.ts` | echte tiefgestellte Indizes (`subText`/`measureSubText`) in Szene, Pillen, Legende und Diagramm (F_G, F_H, F_N, F_R, F_Z, F_{R,max}, α_G) |
| `src/simulations/physik/schiefe-ebene/index.ts` | Kräfte einheitlich mit 2 Nachkommastellen, Grenzwinkel mit 1, F_Z mit 1 (`fmt.fixed`) |
| `src/simulations/physik/schiefe-ebene/index.ts` | „h = … cm“ weicht bei flacher Ebene nach links aus; „F_{R,max}“ bei kleiner Kurve über der Kurve |
| `src/simulations/physik/schiefe-ebene/index.ts` | eigener Tipp-Text (`hint`) statt allgemeinem Ziehen-Hinweis |
| `src/content/simulations/de/schiefe-ebene.md` | Steigung in Prozent (Absatz und Aufgabe 7), „Aufgabe laden“ bei Aufgabe 6 |
| `src/content/simulations/en/schiefe-ebene.md` | auf DE-Umfang ergänzt (Einführung, 6 Ausprobieren-Punkte, 7 Aufgaben, Unterrichtsideen) |
| `tests/schiefe-ebene.test.ts` | 3 neue Tests (Sonderfälle, Aufgabenwerte 1–7, Beispielwerte/Reglergrenzen) |

## 6. Für den Kern (nicht selbst ändern)
- `Plot.text` setzt keine Indizes („F_G“ erscheint mit Unterstrich); hier lokal mit `subText` an `chart.px/py` gelöst. Vorschlag: `Plot.text` erkennt `_` wie `subText`.
- Regler-Beschriftungen zeigen „Zugkraft F_Z“, „Haftreibungszahl μ_H“ mit Unterstrich – Indizes in Parameter-Beschriftungen wären hilfreich (betrifft viele Simulationen).
- Achsbeschriftung der x-Achse („α in °“) liegt im Diagramm auf dem Kurvenende, wenn eine Kurve bei x_max auf 0 fällt.

## 7. Entscheidungen
- **Im Aufgabenmodus nur Beträge verdecken, nicht die Pfeile und Kurven:** Pfeile und Diagramm sind das Werkzeug zum Lösen (Ablesen, Vergleichen); die exakten Zahlen sind die Lösung. „? N“ hält die Legende stabil.
- **Grenzwinkel-Linie im Aufgabenmodus ganz ausgeblendet** (nicht nur die Zahl): Die Linie allein würde bei Aufgabe 3 („rutscht er bei 25°?“) die Antwort zeigen; den Schnittpunkt von F_H und F_R,max kann man weiterhin selbst suchen.
- **Feste Nachkommastellen für Kräfte:** In Legende und Ergebnissen stehen Kräfte untereinander; „1,7 N“ neben „9,66 N“ wirkt ungenau. Zwei Stellen passen zu den Lösungen im Lernmaterial (3,36 N, 9,22 N).
- **Steigung in Prozent nur im Lernmaterial, nicht als weitere Anzeige:** Die Simulation zeigt h und l = 1 m bereits; eine zusätzliche Zahl würde die ohnehin dichte Szene überladen. Die Aufgabe 7 verbindet die Alltagsangabe mit sin/tan; der Link steht in der Lösung, weil der Regler sonst den gesuchten Winkel zeigt.
- **Körperlage ohne Tastaturbedienung:** Sie ändert keine Physik (nur die Startposition); alle fachlichen Größen sind über Regler erreichbar.
- **Englische Indizes H/G statt s/k in der Simulation belassen:** Die Formelzeichen sind über die Ergebnisse mit der deutschen Fassung verbunden; das EN-Material erklärt die Zuordnung (μ_s = μ_H, μ_k = μ_G).

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2926/2926 grün (129 Dateien), Build ok.
