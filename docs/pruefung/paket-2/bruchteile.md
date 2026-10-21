# Prüfprotokoll: `bruchteile` – Bruchteile darstellen

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `8248338` (Basis), Korrekturen ab `6a403ca` · Bogen: `/tmp/claude-0/-home-user-Simulations/8f85f9ae-3f3f-5aef-94a3-e731ae416460/scratchpad/pruefung/bruchteile/bruchteile.png`

## Ergebnis
korrigiert (Anzeigen in der Simulation, Lernmaterial DE/EN, Tests neu); eine Rückfrage offen

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung, jeweils geladen und mit der Anzeige verglichen):**
  1. 3/4: 3 : 4 = 0,75; 0,75 · 100 = 75 %. ggT(3, 4) = 1, also nicht kürzbar. Anzeige „3 von 4 gleich großen Teilen = 0,75 = 75 %“ ✓.
  2. 1/3 mit k = 2: 1 · 2 / 3 · 2 = 2/6; 1 : 3 = 0,333…, 100 : 3 = 33,33… %. Anzeige „1/3 = 2/6“, „0,3̅“, Prozent jetzt „≈ 33,33 %“ (vorher „= 33,3 %“) ✓.
  3. 7/4: 7 = 1 · 4 + 3, also 1 3/4; 7 : 4 = 1,75 = 175 %. Anzeige „7/4 = 1 3/4“, „1 Ganzes und 3/4 = 1,75 = 175 %“, zwei Pizzen ✓.
  4. 5/8 (Aufgabe 1): 5 : 8 = 0,625 = 62,5 % ✓. 1/12: 1 : 12 = 0,08333… = 0,08̅3̅ → Anzeige „0,083… (Periode 3)“ ✓.
  5. Bruchteile von Größen (nicht in der Simulation, im Lernmaterial ergänzt): 3/4 von 80 € = 80 : 4 · 3 = 60 €; 2/5 von 35 = 35 : 5 · 2 = 14; 2/3 von 1 h = 60 min : 3 · 2 = 40 min ✓.
- **Sonderfälle:**
  - Zähler 0: 0/4 = 0 = 0 %, nichts ausgewählt. „Vollständig gekürzt“ zeigte „0/4 = 0/1“ → jetzt „0/4 = 0“.
  - Zähler = Nenner: 4/4 = 1 = 100 %, alle Stücke ausgewählt. „Vollständig gekürzt“ jetzt „4/4 = 1/1 = 1“.
  - Nenner 1: 3/1 = 3 = 300 %, drei ungeschnittene Pizzen, „nicht kürzbar“ ✓.
  - Vielfache des Nenners: Bildtext zeigte „2 Ganze und 0/4“ (8/4), „3 Ganze und 0/1“ (3/1), „9 Ganze und 0/4“ (36/4) → jetzt „2 Ganze“ usw.
  - Reglergrenzen: z 0…36, n 1…12, k 1…5. Bei Eingabe wird z auf höchstens 3 Ganze begrenzt; per Link (z. B. 36/4) erscheinen 3 Pizzen und „(weitere Ganze sind nicht gezeichnet)“ ✓. Keine Division durch 0 (n ≥ 1, ggT nie 0).
- **Strecke:** Im zweiten und dritten Ganzen standen an den Teilstrichen wieder „1/4, 2/4, 3/4“ statt „5/4, 6/4, 7/4“ (Stelle auf dem Zahlenstrahl falsch beschriftet) → jetzt vom Nullpunkt aus gezählt.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** Dezimalkomma DE / Punkt EN ✓; Prozent über `fmt.num`. Bei periodischen Brüchen ist der Prozentwert gerundet → „≈“ statt „=“ (Bildtext und Ergebnisfeld). Keine negativen Werte möglich.
- **Begriffe wie im Unterricht:** Zähler, Nenner, gleich große Teile, Erweitern, Kürzen, gemischte Zahl, Periode ✓. EN „period“ → „recurring“ (passend zum Beispiel „One third (recurring)“).
- **Gleich große Teile:** Pizza in gleiche Winkel, Kuchen und Strecke in gleich breite Teile ✓.
- **Neue/ergänzte Tests:** `tests/bruchteile.test.ts` neu (11 Tests): 3/4, 5/8, periodische Brüche (1/3, 1/6, 5/6, 1/12, 1/7), Erweitern/Kürzen, 7/4 = 1 3/4, Zähler 0, Zähler = Nenner, Nenner 1, 8/4 ohne Rest, ggT nie 0, ganzer Reglerbereich (Ziffern ergeben den Wert). Bestehende Tests in `batch2-models.test.ts` unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 5/8 = 0,625 = 62,5 % ✓; A2 2/3 = 8/12 ✓; A3 8/12 < 9/12, Unterschied 1/12 ✓; A4 1/6 = 0,16̅, 5/6 = 0,83̅ ✓. Neu A5 (60 €, 14, 40 min) und A6 (0/4 = 0, 4/4 = 1, 3/1 = 3).
- **„Beispiel laden“ / Links:** alle fünf Beispiele und alle Links (Ausprobieren, Aufgabe laden, In der Simulation zeigen, neue Links aus A5/A6) geladen; Anzeigen stimmen.
- **Texte korrigiert:**
  - DE: Absatz „Bruchteil einer Größe“ (3/4 von 80 €) in „Worum geht es?“; Aufgaben 5 und 6 neu; Hinweis „Bilder … siehe `docs/BILDER.md`“ (Entwicklerhinweis) ersetzt durch Hinweis zu Bruchteilen von Größen.
  - EN war stark gekürzt (2 von 4 Aufgaben, 3 von 5 Ausprobier-Punkten) → inhaltlich an DE angeglichen.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden, keine Überlappungen; Handy: Bild oben, Bruch darunter.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine. Bildtext wird bei Platzmangel verkleinert (mind. 10 px).
- **Bilder vorhanden / fehlend:** mit blockierten Fotos zeichnet die Simulation Pizza (Teig, Tomate, Käse, Salami) und Streuselkuchen; Auswahl, Abdunkeln und Schnitte funktionieren gleich ✓. Mit Fotos ✓.
- **Antippen (TapTarget):** Maus-Klick auf Pizzastück 2 → z = 2; Finger-Tippen (Touch-Emulation) auf erstes Kuchenstück → z = 1 ✓. Nochmaliges Tippen auf das letzte ausgewählte Stück wählt es ab. Kein Ziehen angeboten.
- Hinweis: Beim Kuchen-Foto sind die gestrichelten Erweiterungs-Schnitte (k > 1) recht schwach sichtbar; Bruch wird aber daneben angezeigt.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur:** Tab-Reihenfolge unauffällig; alles auch über Regler bedienbar (Antippen ist nur eine Abkürzung).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text allgemein („Ganzes, … ausgewählte Teile sind hervorgehoben“), der konkrete Bruch steht in den Ergebnisfeldern als Text.
- **Farben:** Hervorhebung über Theme (`series`), feste Lebensmittelfarben für Pizza/Kuchen; nicht ausgewählte Teile werden aufgehellt bzw. abgedunkelt und ausgewählte herausgezogen – nicht nur über Farbe unterscheidbar.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/bruchteile/index.ts` | Strecke: Teilstriche als 5/4, 6/4 … statt erneut 1/4 im zweiten Ganzen; „2 Ganze“ statt „2 Ganze und 0/4“; „≈“ bei gerundetem Prozentwert periodischer Brüche (Bild und Ergebnisfeld); „Vollständig gekürzt“ zeigt „0/4 = 0“ bzw. „8/4 = 2/1 = 2“; EN „recurring“ statt „period“ |
| `src/content/simulations/de/bruchteile.md` | Absatz Bruchteil einer Größe; Aufgaben 5 (Größen) und 6 (Sonderfälle); Entwicklerhinweis zu Bildern ersetzt |
| `src/content/simulations/en/bruchteile.md` | inhaltlich an DE angeglichen |
| `tests/bruchteile.test.ts` | neu, 11 Tests |

## 6. Für den Kern (nicht selbst ändern)
- Prüfbogen-Werkzeug: Die Tab-Reihenfolge in der JSON endet nach 12 Einträgen im Seitenkopf; die Bedienelemente der Simulation erscheinen dort nicht.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Bruchteile von Größen und Mengen (3/4 von 80 €, 2/5 von 35, 2/3 von 1 h) kann die Simulation selbst nicht darstellen; sie stehen jetzt nur im Lernmaterial. Soll die Simulation eine Anzeige „Bruchteil von … (Größe)“ bekommen? Das wäre ein Umbau (neuer Parameter, Beschriftung der Teile) und wurde hier nicht gemacht.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2916/2916 grün (bruchteile 11/11), Build ok.
