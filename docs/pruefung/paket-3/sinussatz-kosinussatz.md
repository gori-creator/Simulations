# Prüfprotokoll: `sinussatz-kosinussatz` – Sinussatz und Kosinussatz

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `1a63efc` · Bogen: `/tmp/boegen3/sinussatz-kosinussatz.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start A(1|1), B(10|1), C(4|6): a = √(6² + 5²) = √61 ≈ 7,81 cm, b = √(3² + 5²) = √34 ≈ 5,83 cm, c = 9 cm ✓; h_c = 6 − 1 = 5 cm ✓; Fläche ½ · 9 · 5 = 22,5 cm² ✓; 2r = abc : (2 · 45) = 7,810 · 5,831 · 9 : 45 ≈ 9,11 cm ✓; Kosinussatz-Ansicht: a² + b² − c² = 61 + 34 − 81 = 14 = 2ab · cos γ, also ab · cos γ = 7 ⇒ Bild „− ab · cos γ = 7“, Karte „61 + 34 − 14 = 81“ ✓. Ziehen von B um 80 px nach rechts (≈ 43,3 px je cm) ⇒ B(11,8 | 1), c = 10,8 cm ✓.
  2. SSW a = 4, c = 6, α = 30°: sin γ = 6 · 0,5 : 4 = 0,75 ⇒ γ₁ = 48,59°, γ₂ = 131,41°; β₁ = 101,41°, β₂ = 18,59°; b₁ = 4 · sin 101,41° : 0,5 = 7,842 ⇒ „≈ 7,84 cm“, b₂ = 8 · sin 18,59° = 2,550 ⇒ „≈ 2,55 cm“ ✓; Flächen ½ · 7,842 · 6 · 0,5 = 11,76 cm², ½ · 2,550 · 6 · 0,5 = 3,83 cm² ✓. a = 3: sin γ = 1 ⇒ genau ein Dreieck, γ = 90°, b = 6 · cos 30° = 5,196 ⇒ „≈ 5,20 cm“ ✓. a = 2: sin γ = 1,5 > 1 ⇒ „Kein Dreieck“ ✓. a = 7 (a ≥ c): eine Lösung, γ ≈ 25,38°, b ≈ 11,52 cm ✓.
  3. Vermessung s = 200 m, 70°, 60°: γ = 50°; |AT| = 200 · 0,8660 : 0,7660 = 226,1 m, |BT| = 200 · 0,9397 : 0,7660 = 245,3 m, d = 226,1 · 0,9397 = 212,5 m ✓. See 450 m / 600 m / 70°: c² = 202 500 + 360 000 − 540 000 · 0,34202 = 377 809 m², c ≈ 614,7 m ✓; Aufgabe 5 (300/400/50°): c² = 250 000 − 154 269 = 95 731, c ≈ 309,4 m ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): SSW vollständig: sin γ > 1 → keins, sin γ = 1 (auch mit Rundungsfehler bei 6 · sin 30° : 3) → eins, a ≥ c → eins, sonst zwei; α ≥ 90° nur für a > c. SSS mit 2 + 3 = 5 und WSW mit α + β ≥ 180° → „Kein Dreieck“ mit Begründung. Flache Dreiecke (Fläche ≈ 0, Winkel < 5°) zeigen einen Hinweis statt Division durch 0. Reglergrenzen (a = 0,5, c = 12, α = 1° bzw. 179°; WSW 1° + 1°) liefern gültige Dreiecke.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma, cm/m/°/cm², echtes Minus ✓. **Behoben:** Gerundete Werte verloren Endnullen („b ≈ 4,3 cm“, „sin β = 0,64“, „γ ≈ 126°“, „α ≈ 76,1°“ bei 2 Stellen, „b ≈ 5,2 cm“) → gerundete Werte jetzt mit allen Stellen („≈ 4,30 cm“, „0,640“), exakte weiter ohne („c = 9 cm“). Ergebnis „Satz“ beim Kosinussatz zeigte immer „≈“, auch bei exakten Werten (Pythagoras 64 + 36 = 100, stumpfes Beispiel 62,5 + 18,5 + 40 = 121) → „=“ nur bei exakten Werten. SSW ohne Lösung: „≈ 1,5 > 1“ → „= 1,5 > 1“. Flächeninhalt im Löser nur mit 1 Stelle („≈ 15,2 cm²“) gegenüber Lernmaterial „≈ 15,16 cm²“ → 2 Stellen.
- **Begriffe wie im Unterricht:** Sinussatz, Kosinussatz, Umkreisdurchmesser 2r, Höhe h_c mit Fußpunkt F, SSS/SWS/WSW/SSW wie bei den Kongruenzsätzen, sin⁻¹/cos⁻¹ wie am Taschenrechner – passend.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/sinussatz-kosinussatz.test.ts`: Flächen aus Aufgabe 3, α = 90° (nur a > c), Reglergrenzen SSW/WSW, 3000 zufällige SSW-Eingaben prüfen die Anzahl 0/1/2 gegen die Regel und dass jede Lösung a, c, α wirklich hat. Bestehende Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 c = √39 ≈ 6,24 cm, A = 15,16 cm² ✓; A2 82,82°, 41,41°, 55,77° ✓; A3 s. o. ✓; A4 226,1 m, 245,3 m, 212,5 m ✓; A5 309,4 m ✓; A6 Begründungen stimmig ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle Links (Ausprobieren, Aufgaben, Lösungen, „Beispiel zeigen“) mit simshot bei 360, 1024 und 1440 px geladen; Zustände passen zum Text (stumpfer Winkel in B = 135°, F außerhalb ✓; γ = 90°-Beispiel 8/6/10 ✓). **Behoben:** Ausprobieren 2 („Beweis abspielen … die Rechnung entsteht Zeile für Zeile“) – die Karte „Beweisidee: Höhe h_c“ fehlte am iPad quer (1024) und am Handy (360), weil sie unter der Balkenkarte keinen Platz hatte. Nach „Beweis abspielen“ steht die Beweiskarte jetzt vorn, wenn beide nicht untereinander passen (bis zur nächsten Änderung).
- **Texte vereinfacht/korrigiert:**
  - DE: Der SSW-Fall war nur mit einem Beispiel erklärt → kurze Übersicht keine/eine/zwei Lösungen (und stumpfes α) ergänzt.
  - EN war deutlich kürzer (Ausprobieren 4 von 6, Aufgaben 3 von 6, Beweisidee, Flächenformel und Unterrichtsideen gekürzt) und nutzte das Dezimalkomma („0{,}75“, „226{,}1 m“) → auf den Stand der DE-Fassung gebracht, mit Dezimalpunkt.
  - Linktexte kurz gehalten; kein waagerechter Überlauf (Bogen).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Unter 640 px Bild über Karten, sonst Karten rechts. Ohne „Beweis abspielen“ entfällt die Flächenkarte bzw. die Beweiskarte bei wenig Platz (Flächeninhalt steht auch in den Karten der anderen Modi); im Löser entfällt bei SSW mit zwei Lösungen die Flächenkarte am Laptop (Lernmaterial nennt die Flächen nur in der Lösung). Dunkelmodus lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Am Handy (360) liegt die h_c-Pill teils unter der γ-Pill, bei SSW die β₂-Pill nahe am Eckennamen B – lesbar, nicht geändert.
- **Touch (Ziehen) und Maus:** Ecken, Baum, Standlinie und Orte am See ziehbar; der Maßstab bleibt beim Ziehen fest (Neuausrichtung erst nach dem Loslassen). **Behoben:** Beim Anfassen sprang der Punkt um bis zu 20 px unter den Zeiger (Griffversatz fehlte) → Versatz wird jetzt beibehalten; gemessen: B um 80 px ⇒ genau +1,8 cm, y unverändert. Touch nicht gesondert simuliert, gleiche Zeigerereignisse.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles auch über Regler/Auswahl einstellbar (Fälle auch über „Gegeben“).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) beschreibt alle Ansichten.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Karten-, Papier-, Pillen- und Chiphintergrund, Rahmen, Halo der Eckennamen, Maßstabsleiste, Dreibein, Hover-Ring am Baum und weiße Schrift auf farbigen Flächen waren feste Hex-/rgba-Werte → jetzt aus `th().bg`, `th().text`, `th().grid`, `th().axis`. Fest bleiben Schatten und Materialfarben der Lagepläne (Wiese, Wasser, Ufer, Baumkrone, Häuser) ohne Bedeutung. Seite und Gegenwinkel sind immer mit Namen beschriftet; das zweite SSW-Dreieck ist gestrichelt und mit C₂, γ₂, b₂ benannt; Korrekturrechtecke zusätzlich schraffiert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/sinussatz-kosinussatz/index.ts` | Theme-Farben statt fester Hex-/rgba-Werte (Karten, Papier, Pillen, Chips, Halo, Maßstab, Dreibein) |
| `src/simulations/mathematik/sinussatz-kosinussatz/index.ts` | gerundete Werte mit Endnullen; „=“ statt „≈“ bei exakten Werten (Ergebnis Kosinussatz, SSW ohne Lösung); Fläche mit 2 Stellen |
| `src/simulations/mathematik/sinussatz-kosinussatz/index.ts` | Beweiskarte nach „Beweis abspielen“ auch auf Tablet/Handy sichtbar |
| `src/simulations/mathematik/sinussatz-kosinussatz/index.ts` | Griffversatz beim Ziehen (Punkt springt nicht unter den Zeiger) |
| `src/content/simulations/de/sinussatz-kosinussatz.md` | Übersicht SSW: keine/eine/zwei Lösungen |
| `src/content/simulations/en/sinussatz-kosinussatz.md` | auf den Stand der DE-Fassung gebracht, Dezimalpunkt |
| `tests/sinussatz-kosinussatz.test.ts` | 4 neue Tests (SSW-Regel über das Reglerfeld, Grenzen, α = 90°, Flächen A3) |

## 6. Für den Kern (nicht selbst ändern)
- Nichts Neues. (Wie bei `sin-cos-tan-dreieck`: Ein allgemeiner Griffversatz beim Ziehen in `sim-core` wäre für alle Simulationen hilfreich.)

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Zuordnung „Jahrgangsstufe 10, Lernbereich Sinus- und Kosinussatz“ ist im Lernmaterial als „bitte am Lehrplan prüfen“ gekennzeichnet; unverändert gelassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2911/2911 grün (127 Dateien), Build ok.
