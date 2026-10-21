# Prüfprotokoll: `vektoren-3d` – Vektoren addieren und vervielfachen (3D)

Prüfer: Paket 3 (Befunde Abschnitt B, Paket 5) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: eigener Ordner im Scratchpad (`shots/vektoren-3d-*.png`, nicht committet)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-5.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. Aufgabe 1: a + b = (2 | 4 | 0) + (1 | −1 | 3) = (3 | 3 | 3), |a + b| = √27 ≈ 5,196 ≈ 5,20; |a| = √20 ≈ 4,472, |b| = √11 ≈ 3,317, |a| + |b| ≈ 7,789 ≈ 7,79. Anzeige am Handy „√27 ≈ 5,2“, „4,47 und 3,32“ ✓.
  2. Aufgabe 3: 2r + s = 0 und 4r − s = 0 ⇒ r = s = 0 ⇒ dritte Komponente 0 ≠ 3; `bestRS` liefert Restabstand > 0 ✓.
  3. Aufgabe 4: |(0 | 3 | 4)| = √25 = 5, a⁰ = (0 | 0,6 | 0,8) (aufgedeckt im Bild und in „Rechnung“) ✓.
- **Sonderfälle:** unverändert (Nullvektor, a ∥ b).
- **Neue/ergänzte Tests:** `tests/vektoren-3d.test.ts` um 3 Tests ergänzt (Zahlen der Kontrolle in Aufgabe 1, c nicht in der Ebene, Einheitsvektor zu (0 | 3 | 4)).

## 2. Aufgaben und Texte (DE und EN)
- **Befunde umgesetzt (im Code bestätigt):**
  1. Aufgabe 4 (`show=0`): Die Zeile „a⁰ = 1/5 · (…) = (0 | 0,6 | 0,8)“ zeigte 1/|a|; die Komponenten waren nur teilweise als „?“ verdeckt ⇒ jetzt „a⁰ = 1/? · (0 | 3 | 4) = ?“.
  2. Aufgabe 3: Link ohne `show=0`, die Pille „c liegt nicht in der Ebene – unmöglich (Abstand …)“ verriet die Antwort ⇒ Link `…&show=0&_hide=1`; bei `show=0` steht (solange c nicht getroffen ist, unabhängig von der Lage von c) „Liegt c in der Ebene von a und b?“. Zusätzlich wird bei `show=0` das gestrichelte Lot von c auf die Ebene nicht gezeichnet, weil es die Antwort ebenfalls zeigte.
  3. DE-Lösung zu Aufgabe 1: Die „Kontrolle“ mit (1 | 2 | 3) + (2 | −1 | 0) und |(2 | 3 | 6)| = 7 passte nicht zur Aufgabe ⇒ „|a + b| = √27 ≈ 5,20 < |a| + |b| = √20 + √11 ≈ 7,79 – die Längen addieren sich nicht.“ (nachgerechnet, s. o.).
- **Aufgabenlinks geprüft:** alle 5 DE- und 3 EN-Aufgabenlinks: keine Lösung sichtbar.
- Kein Vektorpfeil U+20D7 verwendet (Pfeile werden gezeichnet).

## 3. Geräte
- **1360 hell, 1360 dunkel, 390, EN 1360:** kein Überlauf, keine Konsolenfehler. **Behoben:** In „Länge und Einheitsvektor“ war die Überschrift „Finde 5 ganzzahlige Vektoren mit |a| = 3:“ bei 1360 px rechts abgeschnitten ⇒ Schrift wird bei Platzmangel verkleinert.
- Offen (unkritisch): Der gezeichnete Pfeil über „a⁰“ reicht über die hochgestellte 0.

## 4. Barrierefreiheit
- Keine Änderung an Bewegung, Tastatur oder Farben.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/vektoren-3d/index.ts` | Einheitsvektor-Zeile bei `show=0` verdeckt; Frage statt „unmöglich“, kein Lot bei `show=0`; Überschrift Länge-3-Aufgabe passt |
| `src/content/simulations/de/vektoren-3d.md` | Aufgabe 3 mit `show=0`; Kontrolle in Aufgabe 1 ersetzt |
| `tests/vektoren-3d.test.ts` | 3 Tests ergänzt |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3380/3380 grün (148 Dateien), Build ok.
