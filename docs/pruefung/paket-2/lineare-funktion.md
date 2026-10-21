# Prüfprotokoll: `lineare-funktion` – Lineare Funktion

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `6f00734` (Merge besondere-linien), darauf dieser Durchgang · Bogen: `scratchpad/pruefung/lineare-funktion/lineare-funktion.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Rechenlogik fehlerfrei; Bezeichnung b → t wie in Bayern, EN-Lernmaterial war stark gekürzt, „=“ bei gerundeter Nullstelle; eine Rückfrage zum Steigungswinkel bei fallenden Geraden)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. m = 2, t = −1: 0 = 2x − 1 ⇒ x₀ = 1 : 2 = 0,5; f(3) = 2 · 3 − 1 = 5 ⇒ P(3|5). Anzeige „x₀ = 0,5 → N(0,5 | 0)“ ✓ (Test).
  2. Gerade durch (1|2) und (4|8): m = (8 − 2) : (4 − 1) = 6 : 3 = 2; t = 2 − 2 · 1 = 0 ⇒ f(x) = 2x ✓ (Test `lineThrough`).
  3. m = −0,5, t = 3: 0 = −0,5x + 3 ⇒ x₀ = 3 : 0,5 = 6. Anzeige „f(x) = −0,5x + 3“, „x₀ = 6 → N(6 | 0)“ ✓ (EN: „N(6, 0)“).
  4. m = 1: tan α = 1 ⇒ α = 45°; Anzeige jetzt „α = 45°“ (vorher „α ≈ 45°“). m = 0,5: α = arctan 0,5 ≈ 26,57° → „α ≈ 26,6°“ ✓.
  5. f = 2x − 1, g = −0,5x + 2: 2x − 1 = −0,5x + 2 ⇒ 2,5x = 3 ⇒ x = 1,2, y = 1,4; m · m₂ = 2 · (−0,5) = −1 ⇒ senkrecht. Anzeige „senkrecht zueinander …, Schnittpunkt S(1,2 | 1,4)“ ✓.
- **Sonderfälle:** m = 0, t = 2: „keine – die Gerade ist parallel zur x-Achse“ ✓; m = 0, t = 0: „f(x) = 0“, „unendlich viele – der Graph liegt auf der x-Achse“ ✓; Ursprungsgerade: x₀ = 0 (kein „−0“) ✓. Senkrechte Geraden: beide Griffe sind nur senkrecht verschiebbar (x = 0 bzw. x = 1 fest), seitliches Ziehen ändert nur m → keine senkrechte Gerade möglich, keine Division durch 0 ✓. Reglergrenzen m = ±5, t = ±8 rechnen korrekt; bei |t| > 7 liegt der t-Griff außerhalb des Startausschnitts (y ∈ [−7; 7]), Regler und Zoom reichen aber.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Term über `term.sum`: echtes Minus, kein „+ −“, kein „1x“, kein „+ 0“ (Test). Neu: Nullstelle und Steigungswinkel mit „≈“ nur, wenn gerundet wird („x₀ ≈ −1,33“ statt „x₀ = −1,33“ bei 1,5x + 2; „α = 45°“).
- **Begriffe wie im Unterricht:** y-Achsenabschnitt hieß überall `b`; andere Simulationen des Projekts (`lgs-grafisch`, `gleichungen-grafisch`) und der bayerische Lehrplan schreiben `y = mx + t`. Anzeige, Reglerbeschriftung, Zeichenfläche („t = …“) und Lernmaterial jetzt mit **t** (EN: **c**, wie in `lgs-grafisch`). Parameter-Schlüssel `b`/`b2` unverändert. Steigungsdreieck hat immer Δx = 1, m = Δy : Δx im Text erklärt.
- **Neue/ergänzte Tests:** `tests/lineare-funktion.test.ts` neu (gab es nicht): Nullstelle inkl. m = 0 und −0, Prüfwerte oben, Gerade durch zwei Punkte inkl. senkrecht → `null`, Steigungswinkel, `isRounded`, Lage zweier Geraden (parallel, identisch, senkrecht, Handytarif S(3|11)), Termanzeige ohne „+ −“/„1x“/„+ 0“. Dazu im Modell `zeroOf`, `slopeAngleDeg`, `lineThrough`, `isRounded`.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 f(x) = −1,5x + 2 ✓; A2 m = 6 : 4 = 1,5, −1 = −3 + t ⇒ t = 2 ✓; A3 x₀ = 2 : 0,5 = 4 ✓; A4 m₂ = −1 : 2 = −0,5 ✓; A5 f(3) = 11, 2x + 5 = x + 8 ⇒ x = 3, darüber ist g günstiger ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 9 Links (DE) geladen, Anzeigen passen zu den Lösungen; A1 mit `_hide=1` zeigt verdeckte Ergebnisse ✓.
- **Texte vereinfacht/korrigiert:** DE: b → t; Satz zu m = 0 (keine Nullstelle bzw. ganze x-Achse) und zu senkrechten Geraden (keine Funktion) ergänzt; A5.2 mit Rechnung, A5.3 „bei 3 GB gleich teuer“; Hinweis für Lehrkräfte zur Bezeichnung t/b. EN: fehlten Aufgabe 3 (Nullstelle), Aufgabe 4 (senkrechte Geraden), Teilaufgaben 1–2 des Handytarifs, ein Stolperstein und die Differenzierung – ergänzt, EN jetzt inhaltlich gleich zu DE.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden, Karten auf dem Tablet da, am Beamer lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Bei S = N (z. B. m = −5, t = 8, m₂ = 5, t₂ = −8) überdeckt N das S – Randfall, nicht geändert. Steigungsdreieck bei kleinem m im Startausschnitt recht klein (Δx = 1).
- **Touch (Ziehen) und Maus:** Ziehen per Maus geprüft (t-Griff: t 1 → 3; Dreiecksspitze: m 0,5 → 2,5; schräges Ziehen ändert nur m). Ziehen läuft über Pointer-Events mit `touch-action: none` aus dem Kern, Finger damit gleich behandelt.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (keine Animation)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Tab-Reihenfolge laut JSON regulär; Regler per Tastatur bedienbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen ✓. Alt-Text „Koordinatensystem mit dem Graphen der linearen Funktion“ – allgemein; Werte stehen in den Ergebnissen.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** nur `ctx.theme.series`/`text`/`muted`; Geraden zusätzlich mit „f“/„g“ beschriftet ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/lineare-funktion/index.ts` | Beschriftungen b/b₂ → t/t₂ (EN c/c₂), Zeichenfläche „t = …“, „=“/„≈“ je nach Rundung bei Nullstelle und Winkel, Nullstelle/Winkel aus dem Modell |
| `src/simulations/mathematik/lineare-funktion/model.ts` | `zeroOf`, `slopeAngleDeg`, `lineThrough`, `isRounded` ergänzt; Kommentare auf t |
| `tests/lineare-funktion.test.ts` | neu (9 Tests) |
| `src/content/simulations/de/lineare-funktion.md` | b → t, m = 0 und senkrechte Geraden erklärt, A5 ausführlicher, Hinweis zur Bezeichnung |
| `src/content/simulations/en/lineare-funktion.md` | b → c, fehlende Aufgaben 3 und 4, A5-Teilaufgaben, Stolperstein, Differenzierung ergänzt |

## 6. Für den Kern (nicht selbst ändern)
- Keine Pflichtänderung. Hinweis: Die Kurzbeschreibung in `src/curriculum/mathematik.ts` nennt keinen Buchstaben – passt.
- Projektweit Bezeichnung des y-Achsenabschnitts vereinheitlichen (DE `t`, EN `c`); `gasgesetze` (Physik, intern) nutzt `b` nur im Kommentar.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Bezeichnung t statt b:** umgesetzt, weil Bayern-Lehrplan und die anderen Geraden-Simulationen `t` verwenden; Hessen-Lehrwerke nutzen teils `b` oder `n` (Hinweis für Lehrkräfte ergänzt). Bitte bestätigen.
- **Steigungswinkel bei fallenden Geraden:** angezeigt als negativer Winkel (m = −0,5 → α ≈ −26,6°). Im Unterricht (Jgst. 9/10) ist teils α ∈ [0°; 180°) üblich (dann 153,4°). Unverändert gelassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3019/3019 grün (130 Dateien), Build ok.
