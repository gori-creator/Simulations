# Prüfprotokoll: `baumdiagramm` – Mehrstufige Zufallsexperimente und Pfadregeln

Prüfer: Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-2.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung · Datum: 21.10.2026 · Stand: Commit `0ed8bd9`, darauf dieser Durchgang (Zweig `befunde-b-2`) · Bogen: Screenshots im Scratchpad (`befb2/`, außerhalb des Repos)

## Ergebnis
korrigiert (Grammatik „1 Pfad gehört“, Ergebnis „P = 0“ mit Kontext, Lernmaterial DE)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. *(selbst)* Aufgabe 5: $\frac26 \cdot \frac15 + \frac36 \cdot \frac25 = \frac{2}{30} + \frac{6}{30} = \frac{8}{30} = \frac{4}{15}$, also $1 - \frac{4}{15} = \frac{11}{15}$. Die Ergebnisliste addiert sechs Pfade: $\frac15 + \frac1{15} + \frac15 + \frac1{10} + \frac1{15} + \frac1{10} = \frac{22}{30} = \frac{11}{15}$ ✓.
  2. *(selbst)* $P(rr) = \frac35 \cdot \frac24 = \frac{6}{20} = \frac{3}{10}$ ✓.
  3. Aufgabe 3: $1 - (2/5)^3 = 117/125 = 93{,}6\,\%$ (Befundliste) ✓.
- **Sonderfälle:** leeres Ereignis („selbst antippen“ ohne Pfad): Die Ergebnisliste zeigte nur „0“ → „Kein Pfad gehört zum Ereignis: P = 0“. Bei genau einem Pfad stand „P(rr) = 3/10 = 3/10“ → jetzt „P(rr) = 3/10“.

## 2. Aufgaben und Texte (DE und EN)
- DE Ausprobieren 7: „mit 2 roten Kugeln und einer blauen Kugel“.
- DE Aufgabe 4: Link mit `show=0&_hide=1` (Param `show` vorhanden; $P = 1$ ist die gesuchte Antwort).
- DE Aufgabe 5: Zwischenschritt „8/30 = 4/15“.
- Karte: „1 Pfad gehört / n Pfade gehören zum Ereignis“, EN „1 path belongs / n paths belong“.

## 3. Geräte (Prüfbogen)
- **1360 px hell/dunkel, 390 px, Aufgabe 4 und 5, ein Pfad (DE/EN), leeres Ereignis:** keine Überlappungen, kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Unverändert; Ergebnisse als Text.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/baumdiagramm/index.ts` | Singular/Plural in der Karte; Ergebnis `ev` mit Kontext bei 0 Pfaden, ohne Wiederholung bei 1 Pfad |
| `src/content/simulations/de/baumdiagramm.md` | Ausprobieren 7, Link Aufgabe 4, Aufgabe 5 mit gekürztem Bruch |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
