# Prüfprotokoll: `sin-cos-tan-dreieck` – Sinus, Kosinus und Tangens im rechtwinkligen Dreieck

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `512f778` · Bogen: `/tmp/boegen3/sin-cos-tan-dreieck.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (α = 35°, c = 6 cm): a = 6 · sin 35° = 6 · 0,5736 = 3,441… ⇒ „a ≈ 3,44 cm (Gegenkathete)“ ✓; b = 6 · cos 35° = 6 · 0,8192 = 4,915… ⇒ „b ≈ 4,91 cm“ ✓; sin α = 3,44 : 6 ≈ 0,574 ✓; tan 35° = 0,7002 ⇒ jetzt „≈ 0,700“ (vorher „≈ 0,7“, siehe Korrekturen). Gezogen von B um 100 px nach rechts (≈ 58 px je cm): Vektor (386 | 200) px ⇒ α = arctan(200/386) ≈ 27,4° → 27°, c = 434,7/58 ≈ 7,5 cm ⇒ Anzeige „c = 7,5 cm“, „sin 27° ≈ 0,454“ ✓ (B bleibt unter dem Zeiger, Maßstab fest).
  2. Winkel berechnen, 3-4-5-Dreieck: sin α = 3 : 5 = 0,6 ⇒ α = sin⁻¹(0,6) = 36,869…° ⇒ „α ≈ 36,87°“ ✓; Ankathete √(25 − 9) = 4 cm ✓; β = 90° − 36,87° = 53,13° ✓. Sonderfall go = 6, hy = 5: 6 : 5 = 1,2 > 1 ⇒ „kein Dreieck möglich“ ✓.
  3. Rampe 6 %, h = 0,5 m: tan α = 0,06 ⇒ α = 3,434° ⇒ „≈ 3,43°“ ✓; l = 0,5 : 0,06 = 8,333 m ✓; s = √(8,333² + 0,5²) = √69,69 = 8,348 m ⇒ „≈ 8,35 m“ ✓; Vergleich tan 6° = 0,1051 ⇒ „6° ≙ 10,5 %“ ✓.
  4. Leiter 4 m, 70°: h = 4 · 0,9397 = 3,759 m, e = 4 · 0,3420 = 1,368 m ⇒ „3,76 m“, „1,37 m“, „sicher (65° bis 75°)“ ✓. Turm d = 50 m, 32°: x = 50 · 0,6249 = 31,24 m, h = 32,74 m ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): α nur 5°…85° (tan 90° tritt im Dreieck nicht auf; in der Tabelle „n. def.“ ✓). α = 85°, c = 10: tan ≈ 11,43, b ≈ 0,87 cm – die Längenangabe b wurde dabei von den Eckennamen A und C verdeckt → behoben. Rückwärts: Kathete = Hypotenuse (z. B. 12/12) ist „kein Dreieck“ ✓, beim Tangens geht jedes Verhältnis ✓. Rampe 2 %/1,5 m → 75 m waagrecht, Bild passt sich an ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma, cm/m/°/% überall. „=“ nur bei exakten Werten (sin 30° = 0,5, tan 45° = 1, sin α = 0,6), sonst „≈“ ✓. **Behoben:** Gerundete Werte verloren Endnullen („tan 35° ≈ 0,7“, „tan 85° ≈ 11,43“ bei 3 Stellen) → gerundete Werte jetzt mit allen Stellen („≈ 0,700“), exakte weiter ohne Endnullen („0,5“).
- **Begriffe wie im Unterricht:** Gegenkathete, Ankathete, Hypotenuse, Bezugswinkel, Höhenwinkel, Steigung in %, Umkehrtaste sin⁻¹ – passend.
- **Neue/ergänzte Tests:** 6 neue Tests in `tests/sin-cos-tan-dreieck.test.ts` (Aufgabe 2 mit sin β = cos α, Beispiel „Bezugswinkel β“, tan 85°, Reglergrenzen im Dreieck, Rückwärts an den Grenzen inkl. Kathete = Hypotenuse, Rampe an den Grenzen). Bestehende Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 a = 3 cm, b = 3√3 ≈ 5,20 cm ✓; A2 sin β ≈ 0,819, cos β ≈ 0,574 ✓; A3 36,87°, 4 cm ✓; A4 3,43°, 8,33 m, 8,35 m ✓; A5 3,76 m, 1,37 m ✓; A6 31,24 m + 1,5 m = 32,74 m ✓; A7 Begründungen stimmig. Ungenau war in A7a „ab 45° ist die Gegenkathete länger“ (bei 45° sind beide gleich) → „für α > 45°“.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle 12 verschiedenen Links (Ausprobieren, Aufgaben, Lösungen) mit simshot bei 360, 1024 und 1440 px geladen; Anzeigen stimmen mit dem Text überein. **Behoben:** Im Einheitskreis fehlte die im Lernmaterial genannte „Tabelle der besonderen Werte“ auf dem iPad quer (1024) und am Handy (360), weil die Karte nicht mehr in die Spalte passte → Karten-Reihenfolge Einheitskreis, Besondere Werte, Zusammenhänge, Graph; bei wenig Platz entfallen jetzt Zusammenhänge/Graph (stehen auch unter „Ergebnisse“).
- **Texte vereinfacht/korrigiert:**
  - EN war deutlich kürzer (Ausprobieren 4 von 7, Aufgaben 3 von 7, Unterrichtsideen gekürzt, Herleitung ähnlicher Dreiecke, Rückwärtsrechnen und besondere Werte nur knapp) → auf den Stand der DE-Fassung gebracht.
  - DE/EN: Die drei Definitionen stehen untereinander (vorher eine sehr breite Formelzeile, am Handy nur seitlich scrollbar).
  - DE/EN: Linktext „Gegenkathete länger als die Hypotenuse“ verursachte am Handy (360 px) 16 px waagerechten Überlauf (Links brechen nicht um) → Frage als Satz, Link „Sonderfall“.
  - EN-Bild: „Rest:“ → „Remaining:“.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Unter 640 px Bild über Karten, sonst Karten rechts. Am iPad quer und am Handy (klein) entfällt im Modus „Seitenverhältnisse“ der Graph „Werte von 0° bis 90°“ aus Platzgründen; das Lernmaterial verweist nicht darauf (Alt-Text sagt jetzt „wenn Platz ist“). Dunkelmodus lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** Überlauf 16 px am Handy behoben (s. o.). **Behoben:** „Winkel berechnen“ bei 1024 px: Zeile „Gegeben: Gegenkathete = 3 cm, Hypotenuse …“ und „Rest: … β = 90° − …“ waren am Kartenrand abgeschnitten → werden bei Bedarf auf zwei Zeilen umbrochen. Nach dem Lösen stand an der berechneten Seite nur „= 4 cm“ → „Ankathete = 4 cm“. b-Angabe bei α nahe 90° (s. o.).
- **Touch (Ziehen) und Maus:** Ecke B mit der Maus gezogen, Wert wie berechnet (s. 1.1), Maßstab läuft beim Ziehen nicht weg (Neuausrichtung erst nach dem Ziehen). Touch nicht gesondert simuliert, gleiche Zeigerereignisse.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles auch über Regler/Knöpfe einstellbar (Bezugswinkel auch per Knopf).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. Alt-Text (DE/EN) ergänzt: Tabelle der besonderen Werte, Schritt-für-Schritt-Lösung mit Sonderfall, Graphen nur bei Platz.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Karten-, Papier- und Pillenhintergrund, Rahmen, Tabellenlinie, Halo der Eckennamen und der Einschub „Was heißt p %?“ waren feste Hex-/rgba-Werte → jetzt aus `th().bg`, `th().text`, `th().grid`. Fest bleiben Schatten und Materialfarben der Szenen (Himmel, Boden, Wand, Ziegel, Leiter, Turm, Rollstuhl) ohne Bedeutung. Gegenkathete (rot) und Ankathete (blau) sind immer zusätzlich beschriftet; „sicher“ (grün) mit ✓ und Text; Graphen tragen die Namen sin, cos, tan.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/sin-cos-tan-dreieck/index.ts` | Theme-Farben statt fester Hex-/rgba-Werte (Karten, Papier, Pillen, Rahmen, Halo, Einschub) |
| `src/simulations/mathematik/sin-cos-tan-dreieck/index.ts` | gerundete Werte mit festen Nachkommastellen („≈ 0,700“) |
| `src/simulations/mathematik/sin-cos-tan-dreieck/index.ts` | Einheitskreis: Tabelle der besonderen Werte vor „Zusammenhänge“ (bleibt auf Tablet/Handy sichtbar) |
| `src/simulations/mathematik/sin-cos-tan-dreieck/index.ts` | „Aufgabe“ und „Rest“ umbrechen statt abschneiden; „Ankathete = 4 cm“ statt „= 4 cm“; EN „Remaining“ |
| `src/simulations/mathematik/sin-cos-tan-dreieck/index.ts` | kurze Kathete b: Längenangabe unter den Eckennamen; Alt-Text DE/EN ergänzt |
| `src/content/simulations/de/sin-cos-tan-dreieck.md` | Definitionen untereinander, Link ohne Überlauf, A7a „für α > 45°“ |
| `src/content/simulations/en/sin-cos-tan-dreieck.md` | auf den Stand der DE-Fassung gebracht |
| `tests/sin-cos-tan-dreieck.test.ts` | 6 neue Tests |

## 6. Für den Kern (nicht selbst ändern)
- Lernmaterial-Links (`[…](?…)`) brechen nicht um; ein langer Linktext erzeugt am Handy waagerechten Überlauf. Eine Prüfung der Linklänge oder ein Umbruch im Seitenstil wäre hilfreich.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Zuordnung „Jahrgangsstufe 9 (rechtwinkliges Dreieck), Einheitskreis als Überleitung zu Jgst. 10“ ist im Lernmaterial als „bitte am Lehrplan prüfen“ gekennzeichnet; unverändert gelassen.
- „Rollstuhlgerechte Rampen dürfen höchstens 6 % steigen (DIN 18040)“ und die Leiter-Faustregel 65°–75° stammen aus dem Bestand; plausibel, nicht an den Normtexten geprüft.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2907/2907 grün (127 Dateien), Build ok.
