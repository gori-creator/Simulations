# Prüfprotokoll: `pyramide-kegel-kugel` – Pyramide, Kegel und Kugel

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `d4df08e` (Ausgangsstand) · Bogen: `/tmp/boegen3/pyramide-kegel-kugel.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startzustand, quadratische Pyramide a = 6 cm, h = 4 cm: G = 36 cm², h_a = √(4² + 3²) = 5 cm, s = √(4² + (3√2)²) = √34 ≈ 5,83 cm (Anzeige „√(4² + 4,24²) cm ≈ 5,83 cm“), V = ⅓ · 36 · 4 = 48 cm³, M = 4 · ½ · 6 · 5 = 60 cm², O = 96 cm², Prisma 144 cm³ ✓. Hilfsdreieck „Seitenfläche“: s² = h_a² + (a/2)² = 25 + 9 = 34 ✓.
  2. Fünfeckspyramide a = 6 cm, h = 4 cm (Hilfsdreieck Seitenkante): ρ = 3 / tan 36° = 4,129 cm, R = 3 / sin 36° = 5,104 cm; G = 5 · ½ · 6 · 4,129 = 61,94 cm²; h_a = √(16 + 17,05) = 5,75 cm; s = √(16 + 26,05) = 6,48 cm; V = 61,94 · 4 / 3 = 82,58 cm³; M = 15 · 5,749 = 86,23 cm² ✓ (alles wie angezeigt). Sechseck n = 6: R = a = 6 cm, s = √52 ≈ 7,21 cm, G = 54√3 ≈ 93,53 cm², Dreieck je 3√43 ≈ 19,67 cm² ✓.
  3. Kegel r = 3 cm, h = 4 cm: s = 5 cm, V = 12π ≈ 37,70 cm³, M = 15π ≈ 47,12 cm², O = 24π ≈ 75,40 cm², α = 360° · 3/5 = 216°, Bogen 2π · 3 ≈ 18,85 cm, Zylinder 36π ≈ 113,10 cm³ ✓.
  4. Kugel r = 2,5 cm (Beispiel Archimedes): Zylinder (h = r) π · 2,5³ ≈ 49,09 cm³, V = ⁴⁄₃π · 15,625 ≈ 65,45 cm³, O = 25π ≈ 78,54 cm², Zylinder (h = 2r) 31,25π ≈ 98,17 cm³ ✓.
  - Modell: h_a = √(h² + ρ²) (Seitenhöhe zur Kantenmitte), s = √(h² + R²) (Seitenkante zur Ecke), M = n · ½ · a · h_a, Kegelmantel π r s, Sektorwinkel 360° · r/s, Abwicklung mit gleicher Bogenlänge 2πr ✓. Pyramidenhöhe h und Seitenhöhe h_a werden sauber getrennt. Umschütten: Wasser im gezeichneten Vielflach wird auf das exakte Volumen umgerechnet ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): Alle Regler beginnen bei ≥ 1 (kein 0, keine negativen Werte, kein Teilen durch 0). Grenzen n = 3 … 8, a = 1 … 8, h = 1 … 10, r = 1 … 5 als Test: s² = h_a² + (a/2)², s > h_a > h, Gefäßvolumen = ⅓ · G · h; Sektorwinkel immer zwischen 0° und 360° ✓. Ziehgriffe klemmen an den Reglergrenzen (a: 6 → 8 beim Überziehen).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `ctx.fmt` ✓. **Behoben:** Gerundete Werte ohne Endnull („≈ 37,7 cm³“, „≈ 75,4 cm²“, „≈ 113,1 cm³“, „ρ = 5,2“, „R ≈ 5,1 cm“); jetzt exakt ⇒ „=“ ohne Endnullen, gerundet ⇒ „≈“ mit zwei (bei Winkeln einer) Stellen, in Karte, Schildern und Ergebnissen. Feste „≈“ bei möglicherweise exakten Werten ersetzt (Schild „R ≈ 6 cm“ beim Sechseck, Netzschild „G = …“ am Handy ohne Relationszeichen-Prüfung). In der Mantelzeile stand „M = … ≈ 6 · ½ · 6 cm · 6,56 cm“ mit dem Relationszeichen von M statt von h_a.
- **Begriffe wie im Unterricht:** Grundfläche G, Mantel M, Oberfläche O, Seitenhöhe h_a, Seitenkante s, Mantellinie s, Inkreis-/Umkreisradius, Kreissektor – passend. **Behoben:** Ergebnis „√(h² + (ρ)²)“ mit überflüssiger Klammer → „√(h² + ρ²)“.
- **Neue/ergänzte Tests:** `tests/pyramide-kegel-kugel.test.ts` +5 Tests (jetzt 15): Aufgabe 1 und 3, Sechseckspyramide, alle n mit Reglergrenzen (Pythagoras-Beziehungen, Gefäßvolumen), Kegel an den Reglergrenzen und gerundete Werte 37,70/75,40. Bestehende Tests unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 h_a = √29 ≈ 5,39 cm, V = 80/3 ≈ 26,67 cm³, M = 8√29 ≈ 43,08 cm², O ≈ 59,08 cm² ✓; A2 s = 5 cm, 12π ≈ 37,70 cm³, 15π ≈ 47,12 cm², 24π ≈ 75,40 cm² ✓; A3 ≈ 65,45 cm³, 25π ≈ 78,54 cm², Zylinder ≈ 98,17 cm³, ⅔ ≈ 66,7 % ✓. **Behoben:** In A1 stand „4 · ½ · 4 cm · 5,39 cm ≈ 43,08“ – mit dem gerundeten 5,39 ergibt sich 43,12; jetzt mit √29 gerechnet.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle Links (Ausprobieren 1–6, Aufgaben 1–3 und Lösungslinks) mit simshot (1360 hell/dunkel, 1024, 390). Aufgabenlinks setzen `calc=0` und `_hide=1`: im Bild nur gegebene Maße und Symbole (h_a, s ohne Zahl), Ergebnisse verdeckt ✓. **Behoben:** Lösungslink von A3 zeigte den Archimedes-Versuch (Zylinder der Höhe r), gefragt ist der Zylinder der Höhe 2r → jetzt `?body=kugel&r=2.5&cyl=1` (Karte „V_Kugel = ⅔ · V_Zylinder“).
- **Texte vereinfacht/korrigiert:**
  - DE „Bausteine“: Die Formel „s² = h² + r²“ stand ohne Zuordnung neben h_a der Pyramide, obwohl s dort die Seitenkante ist. Jetzt getrennt: quadratische Pyramide h_a² = h² + (a/2)², s² = h² + (d/2)² = h_a² + (a/2)²; Kegel s² = h² + r²; dazu der Hinweis, dass Seitenhöhe und Seitenkante verschiedene Strecken sind.
  - EN war stark gekürzt (3 von 6 Ausprobieren, Lösungen ohne Rechenweg und Lösungslinks, A3 ohne Prozentfrage, Unterrichtsideen ohne Modell und Einsatz) → vollständig auf den Stand der DE-Fassung gebracht, mit Dezimalpunkt.
  - Alt-Text der Zeichenfläche (DE/EN) nennt jetzt die beschrifteten Strecken, die Füllmarken und die Rechenkarte.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Szene und Karte überall vorhanden; am Handy steht die Karte über der Szene, das Dreieck in wahrer Größe entfällt dort bewusst. iPad hoch nutzt das breite Layout (Bühne nicht gestaucht). Umschüttszene am iPad quer eher klein, aber lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** Mantelzeile im Pyramidennetz (n ≥ 5) wurde auf ca. 10 px verkleinert → auf zwei Zeilen verteilt. Füllmarke „⅓“ im Archimedes-Versuch stand im Dunkelmodus hell auf hellem Wasser → jetzt mit Schild. Beim Sechsecknetz berührt das Schild „a = 6 cm“ knapp das Flächenschild darunter (lesbar).
- **Touch (Ziehen) und Maus:** Griffe an der Spitze (h) und an der Kantenmitte (a bzw. r) mit der Maus gezogen: h 4 → 5,5 cm, a 6 → 8 cm (Grenze) ohne Sprung. Touch läuft über denselben Zeigerweg von View3D (nicht gesondert per CDP geprüft). Der Hinweis „Die markierten Punkte lassen sich ziehen“ steht auch bei „Volumen“ und „Oberfläche“, wo es keine Griffe gibt (siehe „Für den Kern“).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen). **Behoben:** Eigene Messung (`reducedMotion: 'reduce'`, Bild direkt nach der Aktion und 1,5 s später): Nach Wechsel von Körper oder Thema, nach allen 6 Beispielen und bei „Zerlegen“ der Kugel glitt der Bildausschnitt (Zoom/Verschiebung) noch etwa eine Sekunde nach. Jetzt springt er bei reduzierter Bewegung sofort. Danach still: Umschütten (Pyramide, Kegel, Archimedes), Abwickeln (Pyramide, Kegel), Zerlegen, Hilfsdreieck wechseln, Körper/Thema wechseln, alle 6 Beispiele.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alle Größen auch über Regler einstellbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text erweitert; Ergebnisse als Text mit Rechnung.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Kartenhintergrund, Kartenrand und Schilder (Pillen) waren feste rgba-/Hex-Werte → jetzt aus `theme.bg`/`theme.text`/`theme.grid`. Fest bleiben nur Licht-/Schattenmischungen mit Weiß/Schwarz. Strecken sind farbig **und** beschriftet (h, h_a, s, a/2, R, r); im Netz Grundfläche blau, Mantel grün, beide mit Flächenschild – keine reine Rot/Grün-Unterscheidung.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/pyramide-kegel-kugel/index.ts` | Endnullen bei gerundeten Werten, „=“/„≈“ nach Exaktheit (R-Schild, Netzschild G, Mantelzeile), „(ρ)²“ → „ρ²“ |
| `src/simulations/mathematik/pyramide-kegel-kugel/index.ts` | Reduzierte Bewegung: Bildausschnitt springt sofort |
| `src/simulations/mathematik/pyramide-kegel-kugel/index.ts` | Theme-Farben für Karte und Schilder; Füllmarken mit Schild; Mantelzeile im Netz zweizeilig; Alt-Text erweitert |
| `src/content/simulations/de/pyramide-kegel-kugel.md` | Pythagoras-Beziehungen nach Körper getrennt, A1 mit √29, Lösungslink A3 |
| `src/content/simulations/en/pyramide-kegel-kugel.md` | auf den Stand der DE-Fassung gebracht |
| `tests/pyramide-kegel-kugel.test.ts` | +5 Tests (Aufgaben, Sechseck, Reglergrenzen) |

## 6. Für den Kern (nicht selbst ändern)
- `dragHint` ist nur `true`/`false`. Hier gibt es Griffe nur im Thema „Maße“; bei „Volumen“ und „Oberfläche“ ist der Hinweis irreführend. Vorschlag: `dragHint` auch als Funktion der Werte (`(v) => v.mode === 'masse'`) erlauben.
- Wie bei `cavalieri`: `fmt.num` lässt Endnullen weg; hier wieder eigene Hilfe (`exact` + `fmt.fixed`). Vorschlag: gemeinsame Hilfe `fmt.approx(value, decimals) → { rel, text }`.
- Der Prüfbogen misst reduzierte Bewegung nur im Startzustand; der Fehler hier zeigte sich erst nach Beispielen bzw. Themenwechsel (Kamera gleitet). Vorschlag: Bogen lädt zusätzlich ein Beispiel und vergleicht direkt danach.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Lehrplanbezug „Jahrgangsstufe 10, Körperberechnung“ steht weiter als Entwurf im Lernmaterial; nicht gegen den LehrplanPLUS geprüft.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3048/3048 grün (132 Dateien), Build ok.
