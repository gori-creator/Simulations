# Prüfprotokoll: `linsen` – Linsen und Bildentstehung

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `bbee2f5` · Bogen: `scratchpad/boegen/linsen.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Ergebnis „Anwendung“ verriet im Aufgabenmodus die Bildeigenschaften → `spoiler`; Schirm auf der optischen Bank oben abgeschnitten auf iPad quer; Zeilenumbruch zwischen Zahl und Einheit; „D = 1/f = 13,3 dpt“ jetzt mit „≈“; Aufgabe 2 sprachlich falsch; EN auf DE-Umfang ergänzt; 8 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (f = 10 cm, g = 15 cm, G = 5 cm): 1/b = 1/10 − 1/15 = 1/30 → b = 30 cm; B/G = 30/15 = 2 → B = 10 cm; f < g < 2f: reell, umgekehrt, vergrößert ✓ (Anzeige „b = 30 cm“, „B = 2 · 5 cm = 10 cm“).
  2. Kamera (g = 35 cm, G = 8 cm): b = 10 · 35 / 25 = 14 cm; B/G = 14/35 = 0,4 → B = 3,2 cm; verkleinert ✓.
  3. Zerstreuungslinse (f = −10 cm, g = 20 cm, G = 8 cm): b = (−10 · 20)/(20 + 10) = −6,67 cm → „≈ −6,7 cm (negativ: virtuelles Bild vor der Linse)“; B/G = 6,67/20 = 0,33 → B ≈ 2,7 cm, aufrecht, verkleinert ✓; D = 1/(−0,1 m) = −10 dpt ✓.
  4. Gegenstand mit der Maus auf g = 31 cm gezogen: b = 310/21 = 14,76 cm → „≈ 14,8 cm“, B = 5 · 0,476 = 2,38 cm → „≈ 2,4 cm“ ✓.
  5. Optische Bank (Blende d = 6 cm → a = 3 cm, s = 25 cm, b = 30 cm): Unschärfekreis-Radius 3 · |25 − 30|/30 = 0,5 cm → Ø 10 mm ✓.
- **Sonderfälle:** g = f → „kein Bild (b → ∞)“, Strahlen parallel, kein Brennpunktstrahl ✓; g = 2f → b = 2f, gleich groß ✓; g sehr groß → b → f ✓; g = 21 cm bei f = 20 cm → b = 420 cm, Bild außerhalb, Pille „Bild bei b = 420 cm →“ ✓; Reglergrenzen f = 4/g = 50 (b ≈ 4,3 cm) und f = 20/g = 2 (b ≈ −2,2 cm, B ≈ 13,3 cm bei G = 12 cm) ✓; Bank: g ≤ f → „kein reelles Bild“, b > 70 cm → Hinweis „zu weit für die Bank“ ✓. Division durch 0 bei g = f abgefangen (`null`).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm mit 1 Nachkommastelle, Maßstab 2 Nachkommastellen, „=“/„≈“ je nach Rundung ✓. Brechkraft zeigte „D = 1/f = 13,3 dpt“ (f = 7,5 cm) mit „=“ → jetzt „≈“. Zwischen Zahl und Einheit geschütztes Leerzeichen (vorher Umbruch „2,5 · 4 | cm“ in den Ergebnissen auf dem Handy).
- **Begriffe wie im Unterricht:** Sammel-/Zerstreuungslinse, Brennpunkt, Brennweite, Gegenstandsweite g, Bildweite b, Gegenstandsgröße G, Bildgröße B, Parallel-, Mittelpunkt-, Brennpunktstrahl, reell/virtuell, umgekehrt/aufrecht, vergrößert/verkleinert, Abbildungsmaßstab, Brechkraft in dpt, Blende, Schärfentiefe ✓.
- **Neue/ergänzte Tests:** 8 neue Tests in `tests/linsen.test.ts` (Sonderfälle und Reglergrenzen, Brechkraft, Aufgaben 1–5 mit den Werten aus dem Lernmaterial, Ausprobieren 8 und Startwert Unschärfekreis); jetzt 23 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 b = 50/3 ≈ 16,7 cm, B ≈ 2,7 cm, reell/umgekehrt/verkleinert ✓; A2 1/g = 1/10 − 1/50 = 4/50 → g = 12,5 cm, B = 3 · 4 = 12 cm ✓; A3 b = −24 cm, B = 12 cm ✓; A4 b = 250/45 ≈ 5,6 cm bzw. 100/15 ≈ 6,7 cm; Links mit s = 5,5 / 6,5 cm zeigen ein scharfes Schirmbild (Unschärfe 0,6 mm bzw. 1,5 mm < 3 mm) ✓; A5 b = −6 cm, B = 2 cm ✓; A6 Herleitung ✓.
- **Aufgabenmodus:** Das Ergebnis „Anwendung“ (z. B. „g > 2f: reell, umgekehrt, verkleinert …“) war nicht verdeckt und beantwortete die Frage „Welche Eigenschaften hat das Bild?“ in A1 → jetzt `spoiler`. Im Bild wird mit `show=0` nichts verraten (b = ?, B = ?).
- **„Beispiel laden“ geklickt:** alle sechs (Projektor, Kamera, Lupe, g = f, Zerstreuungslinse, Bild scharf stellen) und „Scharf stellen“ – passen. Alle Aufgaben- und Lösungslinks geladen.
- **Texte vereinfacht/korrigiert:** A2 „Ein 3 cm großes Bild soll … scharf erscheinen“ (gemeint ist das Dia) → „Das Bild eines 3 cm großen Dias …“. EN war stark gekürzt (3 statt 6 Aufgaben, 5 statt 8 Ausprobieren-Punkte, ohne Tabelle, Brechkraft und optische Bank) → vollständig auf DE-Umfang übersetzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** in Ordnung; iPad quer: Konstruktion groß genug, Karte zweispaltig.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Optische Bank auf iPad quer (1024 × 768): Der Schirm ragte oben aus der Zeichenfläche → Höhe des Ausschnitts von 36 auf 40 cm erhöht (Schirm + 3 cm Rand), auf allen Größen nachgesehen. Rest (nicht geändert): Bei der Zerstreuungslinse liegen „virtuelles Bild“ und „B“ dicht an den gestrichelten Rückverlängerungen (mit Hintergrundrand lesbar); auf dem Handy rücken auf der Bank bei g ≈ 13 cm „F“ und der Kerzenfuß eng zusammen.
- **Touch (Ziehen) und Maus:** mit der Maus geprüft: Gegenstand ziehen → g = 31 cm (Werte oben) ✓; Schirm ziehen → s = 34,5 cm ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; alles auch über Regler einstellbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; alle Werte stehen als Text in den Ergebnissen.
- **Farben:** Strahlen aus `ctx.theme.series`, mit Legende; Bildeigenschaften als beschriftete Chips – nicht nur über Farbe unterscheidbar ✓. Bank-Szene bewusst dunkel (Kerzenlicht).

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/linsen/index.ts` | Ergebnis „Anwendung“ als `spoiler` |
| `src/simulations/physik/linsen/index.ts` | `tr` und `cm`: geschütztes Leerzeichen zwischen Zahl und Einheit (cm, mm, dpt) |
| `src/simulations/physik/linsen/index.ts` | Brechkraft mit „=“/„≈“ je nach Rundung (DE/EN) |
| `src/simulations/physik/linsen/index.ts` | optische Bank: Ausschnitt 40 cm hoch, Schirm auf flacher Bühne nicht mehr oben abgeschnitten |
| `src/content/simulations/de/linsen.md` | Aufgabe 2 sprachlich korrigiert (Dia statt Bild) |
| `src/content/simulations/en/linsen.md` | auf DE-Umfang ergänzt (Einführung mit Tabelle, 8 Ausprobieren-Punkte, 6 Aufgaben, Unterrichtsideen) |
| `tests/linsen.test.ts` | 8 neue Tests (Sonderfälle, Brechkraft, Aufgaben, Blende) |

## 6. Für den Kern (nicht selbst ändern)
- Geschütztes Leerzeichen zwischen Zahl und Einheit wieder lokal in `tr`/`cm` gelöst (wie `kraefteaddition`). Tiefgestellte Indizes waren hier nicht nötig (keine Formelzeichen mit Index im Bild).

## 7. Entscheidungen
- **„Anwendung“ als `spoiler`:** Der Text nennt die Bildeigenschaften und damit die Lösung von Aufgabe 1. Außerhalb des Aufgabenmodus bleibt er sichtbar; mit „Bild und Strahlen zeigen“ aus erscheint er wie die anderen Ergebnisse erst nach „Aufdecken“.
- **Brennpunkte beidseitig „F“** (statt F und F′) belassen: im Unterricht verbreitet, Lage aus der Zeichnung eindeutig.
- **„2F“ auch bei der Zerstreuungslinse** belassen: stört nicht und hilft beim Vergleich mit der Sammellinse.
- **Bank-Ausschnitt 40 cm statt neues Layout:** kleinste Änderung, die den Schirm auf iPad quer vollständig zeigt; auf Laptop und Handy bleibt das Bild praktisch unverändert.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2909/2909 grün (125 Dateien), Build ok.
