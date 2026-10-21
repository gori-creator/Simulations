# Prüfprotokoll: `cavalieri` – Prinzip von Cavalieri

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `6d3de3f` (Ausgangsstand) · Bogen: `/tmp/boegen3/cavalieri.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Beispiel „Schiefe Pyramide“ (a = 5 cm, h = 6 cm, s = −3 cm, z = 2,5 cm, n = 10): b = 5 · (6 − 2,5)/6 = 2,9167 cm ⇒ „b ≈ 2,92 cm“, A = 2,9167² = 8,507 cm² ⇒ „≈ 8,51 cm²“ ✓. V = ⅓ · 25 · 6 = 50 cm³ ⇒ jetzt „= 50 cm³“ (vorher „≈ 50“). Stapel: G · h · (n + 1)(2n + 1)/(6n²) = 150 · 11 · 21/600 = 57,75 cm³ ⇒ „= 57,75 cm³ (+15,5 %)“ ✓ (57,75/50 = 1,155).
  2. Beispiel „Kugelvolumen“ (r = 3 cm, z = 1,5 cm, n = 10): A₁ = π(9 − 2,25) = 6,75π = 21,206 cm² ⇒ „≈ 21,21 cm²“; A₂ = 9π − 2,25π = 6,75π ✓ (gleich). V_Halbkugel = 27π − 9π = 18π = 56,549 ⇒ „≈ 56,55 cm³“; V_Kugel = 36π = 113,097 ⇒ jetzt „≈ 113,10 cm³“ (vorher „113,1“ ohne Endnull). Stapel: 27π · (1 − 9 · 19/600) = 19,305π = 60,649 ⇒ „≈ 60,65 cm³ (+7,3 %)“ ✓.
  3. Kegel r = 3 cm, h = 5 cm, n = 4 (Aufgabe 5): Radien 3; 2,25; 1,5; 0,75 cm, Dicke 1,25 cm: π · 1,25 · (9 + 5,0625 + 2,25 + 0,5625) = 21,09375π = 66,268 ⇒ „≈ 66,27 cm³“; Formel 45π · 5 · 9/96 = 21,09375π ✓; Kegel 15π = 47,12 cm³, 66,27/47,12 = 1,406 ⇒ „+40,6 %“ ✓. Querschnitt bei z = 2: ρ = 3 · 3/5 = 1,8 cm (jetzt „= 1,8 cm“), A = 3,24π = 10,18 cm² ✓.
  4. Startzustand Zylinder r = 3, h = 5: A = 9π = 28,274 ⇒ „≈ 28,27 cm²“, V = 45π = 141,372 ⇒ „≈ 141,37 cm³“, Stapel exakt gleich ✓. Prisma a = 4, h = 5: A = 16 cm², V = 80 cm³ ⇒ jetzt „= 80 cm³“ auch in den Ergebnissen (vorher „≈ 80“).
  - Modell geprüft: Querschnitte von Körper 2 sind nur seitlich verschoben (c(t) = s·t + 4k·t(1 − t)), Außenmaß wie Körper 1 ⇒ gleiche Fläche in jeder Höhe; Restkörper: Kreisring mit Innenradius z (Kegel mit Spitze unten, r = h) ✓. Stapelformeln (Kegel/Pyramide Σk² = n(n+1)(2n+1)/6, Halbkugel πr³(1 − (n−1)(2n−1)/(6n²))) nachgerechnet ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): z = 0 (Grundfläche), z = h bzw. z = r (Spitze/Pol: A = 0, Anzeige „= 0 cm²“); z > h wird begrenzt, beim Wechsel des Vergleichs bzw. von h nur bei `source === 'input'` angepasst ✓. s negativ (Beispiel Pyramide) ✓. n = 2 … 49 und „∞ (glatt)“ ✓. Kein Teilen durch 0 (H > 0 durch Reglergrenzen, V > 0).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt` ✓. **Behoben:** „≈“ stand auch bei exakten Werten (Prisma/Pyramide V = 80, 60, 50 cm³ in den Ergebnissen, b = 3,6 cm, ρ = 1,8 cm, Stapel 57,75 cm³), gerundete Werte ohne Endnull („113,1“, Lösung im Lernmaterial sagt 113,10). Jetzt einheitlich: exakt ⇒ „=“ ohne Endnullen, gerundet ⇒ „≈“ mit zwei Stellen (Karte, Schilder A₁/A₂, Ergebnisse). Scheibendicke in den Ergebnissen jetzt „h : n ≈ 0,42 cm“ (vorher ohne Relationszeichen).
- **Begriffe wie im Unterricht:** Querschnitt, Grundfläche G, Höhe als senkrechter Abstand, schiefer/gerader Körper, Halbkugel, Restkörper/„Zylinder ohne Kegel“ – passend. **Behoben:** In der Kugelkarte stand „V₂ = V_Zylinder − V_Kegel“ und danach „V₁ = πr³ − ⅓πr³“ (V₁ ist die Halbkugel); jetzt „V₁ = V₂ = V_Zylinder − V_Kegel“, damit die Folgerung sichtbar ist.
- **Neue/ergänzte Tests:** `tests/cavalieri.test.ts` +8 Tests (jetzt 21): Aufgaben 1, 2, 4, 5 aus dem Lernmaterial nachgerechnet (inkl. verschobenem Körper), neue Funktion `isExactTo` („=“/„≈“) mit Rundungsfall 3,6000000000000005 und allen Prisma-Reglerwerten. Bestehende Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 24π ≈ 75,40 cm³ ✓; A2 b = 3,6 cm, A = 12,96 cm², V = 60 cm³ ✓; A3 h = 4 cm, r = 1,25 cm, 6,25π ≈ 19,63 cm³ ✓; A4 5π ≈ 15,71 cm², 36π ≈ 113,10 cm³ ✓; A5 ≈ 66,27 cm³ vs. 47,12 cm³, ≈ 41 % ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle Links (Ausprobieren 1, 2, 4, 5, 6; Aufgaben 1, 2, 4, 5 und deren Lösungslinks) mit simshot (1440 hell/dunkel, 1024, 768, 360); Zustände passen zum Text. Aufgabenlinks setzen `calc=0` und `_hide=1`: Karte und Schilder zeigen nur Formeln ohne Zahlen, Ergebnisse verdeckt. Das Diagramm A(z) lässt den Querschnitt grob ablesen (Achse in 10er/20er-Schritten) – als Kontrolle unkritisch.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (3 von 5 Aufgaben, 4 von 6 Ausprobieren, keine Lösungslinks, Erklärung zu Kegel/Pyramide und Scheiben fehlte, Lehrplanhinweis ohne „Entwurf“) → vollständig auf den Stand der DE-Fassung gebracht, mit Dezimalpunkt.
  - „am orangen Griff“ → „am Griff mit dem Schild „z = … cm““; „Die orange Fläche“ → „Die schraffierte orange Fläche“ (DE/EN) – nicht nur über Farbe beschrieben.
  - Alt-Text der Zeichenfläche nennt jetzt auch die schraffierten Schnittflächen, die Formelkarte und das Diagramm A(z).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Szene, Karte und Diagramm in allen Größen vorhanden; am Handy stehen Karte und Diagramm unter der Szene (die Zeile „V₁ = V₂ = V_Zylinder − V_Kegel“ und die Stapelzeile entfallen dort bewusst aus Platzgründen; die Stapelwerte stehen in den Ergebnissen). Am iPad hoch ist die Kartenschrift klein, aber lesbar. Dunkelmodus: gute Lesbarkeit.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf, keine Überlappungen gefunden. Die Formelzeilen werden bei Platzmangel verkleinert; die zuerst probierte längere Kugelzeile „V₁ = V₂ = πr³ − …“ wurde dadurch zu klein und ist wieder verworfen.
- **Touch (Ziehen) und Maus:** Griff der Schnittebene mit Maus und Touch (CDP-Touch) gezogen: kein Sprung beim ersten Schritt (z bleibt 1,5), 12 px ⇒ z = 2, gleichmäßig bis zur Grenze z = r. Griffe für s und k folgen dem Zeiger (y₂ wird während des Ziehens eingefroren). `dragHint` passt (markierte Punkte sind ziehbar).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen) und eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach „Ebene durchfahren“, „Gerade stellen“, allen 6 Beispielen, Wechsel auf „Pyramide“ und Drehen der Ansicht: überall still. „Ebene durchfahren“ tut bei reduzierter Bewegung nichts (ohne Rückmeldung) – siehe Rückfragen.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alle Größen auch über Regler/Schaltflächen einstellbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) erweitert; Ergebnisse als Text mit Rechnung.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Kartenhintergrund, Kartenrand, Schilder (Pillen) und das Gleichheitszeichen auf dem orangen Kreis waren feste Hex-/rgba-Werte → jetzt aus `theme.bg`/`theme.text`/`theme.grid`. Die Abtönung der Körperfarben mischt jetzt mit `theme.bg` statt mit festem Dunkelblau. Fest bleiben nur Licht-/Schattenmischungen (Weiß/Schwarz für Beleuchtung, Schlagschatten). Körper 1/2 sind blau/lila (kein Rot/Grün) und zusätzlich beschriftet; im Diagramm durchgezogen gegen gestrichelt; Schnittflächen zusätzlich schraffiert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/cavalieri/index.ts` | „=“ bei exakten, „≈“ mit Endnullen bei gerundeten Werten (Karte, Schilder, Ergebnisse); Scheibendicke mit „h : n ≈ …“ |
| `src/simulations/mathematik/cavalieri/index.ts` | Kugelkarte: „V₁ = V₂ = V_Zylinder − V_Kegel“ |
| `src/simulations/mathematik/cavalieri/index.ts` | Theme-Farben für Karten, Schilder, Gleichheitszeichen, Abtönung; Alt-Text erweitert |
| `src/simulations/mathematik/cavalieri/model.ts` | `isExactTo(value, decimals)` |
| `src/content/simulations/de/cavalieri.md` | Griff und Schnittfläche nicht nur über Farbe beschrieben |
| `src/content/simulations/en/cavalieri.md` | auf den Stand der DE-Fassung gebracht |
| `tests/cavalieri.test.ts` | +8 Tests (Aufgaben, „=“/„≈“) |

## 6. Für den Kern (nicht selbst ändern)
- `fmt.num` lässt Endnullen weg; bei „≈“-Werten braucht jede Simulation eigene Logik (`fixed` + Exaktheitsprüfung, hier `isExactTo`, in `galtonbrett` `roundedRelation`). Vorschlag: gemeinsame Hilfe im Kern, z. B. `fmt.approx(value, decimals) → { rel, text }`.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **„Ebene durchfahren“ bei reduzierter Bewegung:** Die Schaltfläche bewirkt dann nichts. Möglich wäre, die Ebene in wenigen Sprüngen (z. B. 0, h/4, h/2 …) ohne Übergang zu zeigen oder die Schaltfläche auszublenden. Bitte entscheiden, welches Verhalten gewünscht ist.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2938/2938 grün (128 Dateien), Build ok.
