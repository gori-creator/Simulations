# Prüfprotokoll: `hyperbel` – Hyperbeln und ihre Asymptoten

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `e8506bf` (Basis), Korrekturen in `45c7506` und diesem Commit · Bogen: `scratchpad/pruefung/hyperbel/hyperbel.png` (nicht im Repo)

## Ergebnis
korrigiert (eine Rückfrage offen)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. a = 2, b = 1, c = 3: f(3) = 2/(3 − 1) + 3 = 1 + 3 = 4 → im Bild P(3 | 4), Ergebnis „P(3 | 4): (x − 1) · (y − 3) = 2 · 1 = 2“ ✓
  2. Gleiche Hyperbel: f(0) = 2/(0 − 1) + 3 = −2 + 3 = 1 → „S_y(0 | 1)“ ✓; Nullstelle 2/(x − 1) = −3 ⇔ x − 1 = −2/3 ⇔ x = 1/3 → „x₀ = b − a/c = 0,33“ ✓; D = ℝ \ {1}, W = ℝ \ {3}, Asymptoten x = 1, y = 3 ✓
  3. a = −3, b = −2, c = −1,5: Term „f(x) = −3/(x + 2) − 1,5“ (kein „− −“/„+ −“) ✓; Nullstelle x = −2 − (−3)/(−1,5) = −2 − 2 = −4 ✓; f(0) = −1,5 − (−3)/(−2) = −1,5 − 1,5 = −3 ✓; Äste im II. und IV. Quadranten (bezogen auf Z(−2 | −1,5)), steigend ✓
  4. Wertetabelle x → b für a = −2, b = 1, c = −1: f(1,01) = −2/0,01 − 1 = −201, f(1,001) = −2001 ✓
- **Graph:** Jeder Ast wird einzeln über x = b + u mit u = ±√|a|·eᵗ gezeichnet – keine senkrechte Verbindungslinie über die Polstelle (im Bild bestätigt). Punktsymmetrie zu Z(b | c) ist im Modell erfüllt (Test ergänzt).
- **Sonderfälle:** a = 0 wird abgefangen: Gerade y = c mit offenem Kreis bei x = b, Steckbrief „a = 0: keine Hyperbel“, W = {c}, Aktionen „P laufen lassen“ gesperrt. Fehler gefunden: Bei a = 0 und c = 0 zeigte „Nullstelle“ „keine“ (richtig: jedes x ≠ b), bei a = 0 und b = 0 hieß es „für b = 0 ist die y-Achse Asymptote“ (bei a = 0 gibt es keine Asymptote) → beides korrigiert. c = 0: „keine Nullstelle“ ✓, b = 0: kein S_y ✓. Reglergrenzen (a ±8, b ±6, c ±5) unauffällig; P hält Abstand 0,1 von der Polstelle (keine Division durch 0).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Minus als „−“, Dezimalkomma DE / Punkt EN, Werte auf 2 bzw. 3 Stellen ✓
- **Begriffe wie im Unterricht:** Polstelle, senkrechte/waagrechte Asymptote, Definitions-/Wertemenge, Quadranten bezüglich der Asymptoten ✓
- **Neue/ergänzte Tests:** Prüfwerte a = 2, b = 1, c = 3 (f(3), f(0), Nullstelle, Asymptoten, c wird nie angenommen), Punktsymmetrie zu Z, a < 0 → II./IV. Quadrant, a = 0 (konstant mit Lücke). 15 Tests grün.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1: 12/1,5 = 8, 12/3 = 4, 12/6 = 2 ✓. A2: f(3) = −2/1 + 1 = −1, (3 − 2)(−1 − 1) = −2 = a ✓. A3: N(−1 | 0), f(0) = −1,5 + 1 = −0,5 ✓. A4: 2/(x + 1) < 0,01 ⇔ x > 199 ✓, Abstände 0,02 / 0,002 ✓. A5: a + c = 5, a/4 + c = 2 ⇒ a = 4, c = 1; Probe f(4) = 2 ✓.
- **„Beispiel laden“ geklickt:** alle Links gültig; Prüfwert-, a < 0-, a = 0-, Aufgabe-2-, Polstellen-Lauf- und Schritt-für-Schritt-Ansicht als Screenshot angesehen, unauffällig.
- **Texte vereinfacht/korrigiert:** EN war deutlich kürzer (2 Ausprobier-Punkte und 2 Aufgaben fehlten, Einleitung und Unterrichtsideen gekürzt) → EN vollständig an DE angeglichen. DE/EN Ausprobier-Punkt 7: „Q liegt immer 1 rechts von Z und a darüber“ stimmte nicht (Q springt auf die andere Seite, wenn P bei x − b = 1 liegt; für a < 0 liegt Q darunter; Fläche ist |a|) → präzisiert. Aufgabe 2: Hinweis „im Bild ablesen (nicht an den Reglern)“, weil die Regler die Werte zeigen.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden; auf dem Handy Graph oben, Steckbrief und Tabelle darunter; Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Die Beschriftung „y = 1/x“ der Grundfunktion lag bei manchen Einstellungen (z. B. a = −3, b = −2, c = −1,5, u = 1) im Rechteck → wird dort jetzt ausgelassen.
- **Touch (Ziehen) und Maus:** Griffe Z (Asymptotenkreuz, verschiebt b und c), Q (Streckfaktor, nur senkrecht), P (auf dem Graphen, nur waagrecht) über `plot.addHandle` – Maus und Finger. Werte gleiten weich (animiertes Verschieben), „Erst strecken, dann verschieben“ animiert Schritt für Schritt.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Schritt-Animation und Lauf entfallen dann)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON regulär ✓
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text der Zeichenfläche beschreibt Graph, Asymptoten, P, Rechteck, Steckbrief, Tabelle ✓
- **Farben:** nur `ctx.theme` (Serienfarben); P (orange) und Rechteck/Q (grün) zusätzlich durch Beschriftung und Form unterscheidbar ✓

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/hyperbel/index.ts` | Ergebnisse bei a = 0: Nullstelle „alle x ≠ b“ für c = 0, y-Achse „keiner – 0 gehört nicht zu D“ für b = 0 |
| `src/simulations/mathematik/hyperbel/index.ts` | Beschriftung „y = 1/x“ nicht mehr im Rechteck an P |
| `src/content/simulations/de/hyperbel.md` | Ausprobier-Punkt 7 (Lage von Q) präzisiert, Aufgabe 2 Hinweis „nicht an den Reglern“ |
| `src/content/simulations/en/hyperbel.md` | vollständig an DE angeglichen (alle 7 Ausprobier-Punkte, 5 Aufgaben, Unterrichtsideen) |
| `index.ts` (Leitung) | Nullstelle zeigt „≈“, wenn gerundet wird (x ≈ 0,33 statt x = 0,33) |
| `tests/hyperbel.test.ts` | 4 Tests ergänzt (Prüfwerte, Punktsymmetrie, a < 0, a = 0) |

## 6. Für den Kern (nicht selbst ändern)
- Ableseaufgaben mit `_hide=1`: Die Regler zeigen a, b, c weiterhin an, damit ist die Lösung von Aufgabe 2 sichtbar. Wünschenswert wäre eine Möglichkeit, bei Aufgabenlinks die Reglerwerte zu verdecken (betrifft vermutlich viele Ablese-Aufgaben).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- „Ideen für den Unterricht“: „Die Schreibweise a/(x − b) + c entspricht der Scheitelpunktform der Parabel – die Animation knüpft daran an.“ In Bayern (Gymnasium) kommen quadratische Funktionen erst in Jgst. 9; in Jgst. 8 kann die Animation daran also nicht anknüpfen. Vorschlag: „… entspricht der Scheitelpunktform der Parabel (Jgst. 9) – dort lässt sich an diese Animation anknüpfen.“ Bitte fachlich bestätigen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3025/3025 grün, Build ok.
