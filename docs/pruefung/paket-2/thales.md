# Prüfprotokoll: `thales` – Satz des Thales

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `a120380` (Basis) · Bogen: `scratchpad/pruefung/thales/thales.png` (nicht im Repo)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. A(−3|0), B(3|0), C(0|3): $\vec{CA} = (−3|−3)$, $\vec{CB} = (3|−3)$, Skalarprodukt $−9 + 9 = 0$ ⇒ γ = 90°. Anzeige „γ ≈ 90° – rechter Winkel“ ✓.
  2. C(3·cos 60°|3·sin 60°) = (1,5|2,598): α = 60°/2 = 30° (Umfangswinkel zum Mittelpunktswinkel 60°), β = 90° − 30° = 60° ✓ (Test). Ebenso φ = 70° (Aufgabe 1): α = 35°, β = 55°, ∠AMC = 180° − 70° = 110°; Anzeige „α ≈ 35°, β ≈ 55°“ ✓.
  3. „C innerhalb“ C(0,8|1,4): $\vec{CA} = (−3,8|−1,4)$, $\vec{CB} = (2,2|−1,4)$, Skalarprodukt $−8,36 + 1,96 = −6,4$; $|CA| = \sqrt{16,4} ≈ 4,050$, $|CB| = \sqrt{6,8} ≈ 2,608$; cos γ ≈ −0,606 ⇒ γ ≈ 127,3° ✓ (stumpf, innerhalb).
  4. „C außerhalb“ C(−1,2|3,8): Skalarprodukt $(−1,8)(4,2) + (−3,8)(−3,8) = 6,88$; $|CA| = \sqrt{17,68} ≈ 4,205$, $|CB| = \sqrt{32,08} ≈ 5,664$; cos γ ≈ 0,2889 ⇒ γ ≈ 73,2° ✓ (spitz, außerhalb).
  5. Frei C(1,8|2,4) (genau auf dem Kreis, 1,8² + 2,4² = 9): α = arctan(2,4/4,8) ≈ 26,6°, β = arctan(2,4/1,2) ≈ 63,4° ✓ (EN-Anzeige 26.6°/63.4°).
  6. C(0,3|3): Skalarprodukt $−8,91 + 9 = 0,09$, |CA|·|CB| ≈ 4,460·4,036 ≈ 18,00 ⇒ γ ≈ 89,7°, außerhalb ✓.
- **Befund (behoben):** Im freien Modus passten Lage, Winkelart und Zeichnung nicht zusammen. Die Lage „auf dem Kreis“ hatte eine Toleranz von 0,003 im Abstand, die Winkelart 0,05°, das Rechtwinkelzeichen (und die grüne Farbe) 0,5°. Auf dem 0,1er-Raster gab es 44 widersprüchliche Punkte, z. B. C(2,6|1,5): „auf dem Thaleskreis“, aber „γ ≈ 89,9° – spitz“; C(3|0,1): „auf dem Thaleskreis“ bei γ ≈ 89,0°; C(0,3|3): Rechtwinkelzeichen bei γ ≈ 89,7°, „außerhalb“. Jetzt bestimmt `angleKind()` die Winkelart über die Lage zum Thaleskreis (strenge Toleranz). Rechtwinkelzeichen und Farbe hängen an derselben Art. Auf dem Raster liegen genau C(0|±3), (±1,8|±2,4), (±2,4|±1,8) auf dem Kreis.
- **Sonderfälle:** C = A bzw. C = B (φ = 180° / 0°): „kein Dreieck“. Mit Beweisidee stand dort vorher „β ≈ –°“ bzw. „α ≈ –°“ (NaN). Jetzt steht dort „kein Dreieck …“, und es werden keine Bögen gezeichnet. C auf der Geraden AB im freien Modus (cy = 0, innen γ = 180°, außen γ = 0°): „kein Dreieck“ ✓. Unterhalb von AB (φ > 180°) gilt der Satz ✓. Reglergrenzen cx ±5, cy ±4 bleiben im Bild.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Gradzeichen und Dezimalkomma über `fmt.num` ✓, eine Nachkommastelle, ganze 90° ohne „,0“.
- **Begriffe wie im Unterricht:** Thaleskreis, Umkehrung, gleichschenklig, Basiswinkel ✓. Beweisidee-Anzeige vorher „α + β = 90,0°, also γ = α + β = 90°“ (Messwert als Begründung). Jetzt steht dort die Begründung: „γ = α + β und α + β + γ = 180°, also 2γ = 180° und γ = 90°“.
- **Neue/ergänzte Tests:** `tests/thales.test.ts` (9 Tests): Prüfwerte C(0|3) und 60°, α = φ/2 und α + β = 90°, Aufgabe 1, Beispiele innen/außen, C = A/B, C auf AB, Lage unterhalb, Raster-Konsistenz von Winkelart und Lage (Umkehrung).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1: β = 180° − 90° − 35° = 55°, ∠AMC = 180° − 2·35° = 110° ✓. A2: AC = √(36 − 16) = √20 ≈ 4,47 cm, Konstruktion stimmig, zwei kongruente Lösungen ✓. A3 ✓. A4 (Tangenten über Thaleskreis über MP) ✓.
- **„Beispiel laden“ geklickt:** alle (phi=170, phi=70&proof=1, innen, außen, „C innerhalb zeigen“), Anzeigen wie erwartet.
- **Texte korrigiert:** EN fehlten „C ganz nah an A oder B“, die Aufgabe „Inside or outside?“, die Lösungsschritte bei A2, der Hinweis auf zwei Lösungen, der Abschnitt „Animation“. EN ist jetzt inhaltlich gleich zu DE. DE/EN Lehrkräfte: Bayern-Zuordnung genauer (Lernbereich Kongruenz und besondere Dreiecke, dort auch Tangentenkonstruktion), Sie-Form. Neuer Hinweis zu den 0,1er-Schritten im freien Modus. Der Aufgabenmodus-Text stimmt jetzt (siehe 4.).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vollständig, Karten auf dem Tablet vorhanden, Beamer lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine. Bei C = B verdeckt die Beschriftung C den Buchstaben B (gewollt, der Fall ist „kein Dreieck“).
- **Touch (Ziehen) und Maus:** Ziehen mit der Maus im freien Modus geprüft (γ ≈ 122,6° nach dem Ziehen), Ziehen auf dem Kreis rastet auf ganze Grad. Ziehen mit dem Finger läuft über den Kern-Griff (Pointer-Ereignisse) wie bei den anderen Simulationen.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON regulär ✓
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen ✓. Die Grafik ist beschrieben („Thaleskreis über der Strecke AB mit Dreieck ABC und dem Winkel bei C“).
- **Farben:** nur `ctx.theme`. Die Winkelart steht zusätzlich als Text und am Rechtwinkelzeichen, α/β sind beschriftet ✓. Neu: Mit „Ergebnisse verdecken“ war der Winkel im Bild (Beschriftung „γ = 90°“, grüne Farbe, Rechtwinkelzeichen) weiter sichtbar. Neuer Schalter `val` („Winkelgröße im Bild anzeigen“, `resultsParam`): Ist er aus, ist der Winkel neutral gefärbt, mit Bogen statt Rechtwinkelzeichen und nur mit „γ“ beschriftet.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/thales/model.ts` | `angleKind()` neu: Winkelart über die Lage zum Thaleskreis, entartet bei C auf AB |
| `src/simulations/mathematik/thales/index.ts` | Lage, Winkelart, Rechtwinkelzeichen und Farbe passen zusammen. Kein „–°“ bei C = A/B mit Beweisidee. Begründung in der Beweisidee-Anzeige. Neuer Schalter `val` als `resultsParam`. Entartet: neutrale Farbe. Kommentar in `tick` berichtigt |
| `src/content/simulations/en/thales.md` | inhaltlich an DE angeglichen (fehlende Aufgabe, Ausprobieren-Punkt, Lösungsschritte, Unterrichtsideen) |
| `src/content/simulations/de/thales.md` | Bayern-Zuordnung, Aufgabenmodus, Hinweis zum 0,1er-Raster |
| `tests/thales.test.ts` | neu, 9 Tests |

## 6. Für den Kern (nicht selbst ändern)
- Die alten Thales-Tests stehen in `tests/new-models.test.ts`. Sie bleiben unverändert. Die neuen Tests sind in `tests/thales.test.ts`.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Tangentenkonstruktion gibt es nur als Aufgabe 4, nicht in der Simulation. Ein eigener Modus (Punkt P, Thaleskreis über MP) wäre ein Umbau und ist deshalb nicht umgesetzt.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2995/2995 grün (129 Dateien), Build ok.
