# Qualitätssicherung: So entsteht eine Simulation

Stand: 18.10.2026. Gilt für **alle** Claude-Sitzungen, die an diesem Projekt arbeiten (Physik, Mathe Teil 1, Mathe Teil 2).
Diese Datei beschreibt die Vorgehensweise, mit der die bisherigen 70 Simulationen entstanden sind. Sie ergänzt `AUFTRAG.md` (was eine Simulation enthalten muss) um das **Wie**: Arbeitsablauf, Prüfschritte, Abnahme.

Kurzfassung: **Bauen und Prüfen sind getrennte Rollen.** Wer baut, prüft sich selbst gründlich. Danach sieht eine zweite Instanz das Ergebnis mit frischem Blick an, rechnet nach und entscheidet über die Abnahme. Erst dann wird committet, gepusht und berichtet.

---

## 1. Rollen

| Rolle | Wer | Aufgabe |
| --- | --- | --- |
| **Leitung** | die Hauptsitzung, die mit der Person spricht | wählt die nächste Simulation, schreibt den Auftrag, prüft das Ergebnis (Abschnitt 5), führt zusammen, pusht, berichtet |
| **Bau** | genau **ein** Agent (Hintergrund, eigener Worktree, `isolation: "worktree"`) | baut **eine** Simulation nach `AUFTRAG.md`, prüft sich selbst (Abschnitt 4), committet im Worktree, pusht **nicht** |

- Immer nur **eine** Simulation gleichzeitig in Arbeit, höchstens **ein** Bau-Agent.
- Arbeitet eine Sitzung ohne Agenten, übernimmt sie beide Rollen nacheinander. Dann gilt Abschnitt 5 trotzdem: mit Abstand und mit den Augen einer anderen Person auf das eigene Ergebnis schauen.

## 2. Der Ablauf einer Simulation

1. **Auswahl:** nächste offene Gruppe aus `WARTESCHLANGE.md` in deinem Bereich (`ZUSAMMENARBEIT.md`). Dort „läuft (…)“ eintragen.
2. **Auftrag schreiben** (Abschnitt 3).
3. **Bau** (Abschnitt 4), typisch **20–35 Minuten** pro Simulation. Deutlich schneller (unter etwa 15 Minuten) heißt fast immer: Prüfschritte ausgelassen. Dann nicht abnehmen, sondern nachprüfen.
4. **Abnahme durch die Leitung** (Abschnitt 5). Kleinigkeiten behebt die Leitung selbst. Größere Mängel gehen mit konkreter Beschreibung zurück an den Agenten, höchstens zwei Runden.
5. **Zusammenführen:** `git merge --no-ff` des Worktree-Zweigs, `WARTESCHLANGE.md` aktualisieren, `npm run verify`, committen, pushen. Worktree und Zweig aufräumen (`git worktree remove --force …`, `git branch -D …`).
6. **Pull Request nach `main`** (oder bestehenden aktualisieren) und **kurzer Bericht** an die Person (Abschnitt 7).
7. Auf das „weiter“ der Person warten, sofern sie nicht ausdrücklich „mach alles durch“ gesagt hat.

## 3. Der Auftrag an den Bau-Agenten

Ein guter Auftrag ist konkret. Er enthält immer:

- **Pflichtlektüre:** `CLAUDE.md`, `docs/agenten/AUFTRAG.md` (besonders Abschnitt 3 „Schöne Animationen“), `docs/agenten/SPICKZETTEL.md`, `docs/agenten/ZUSAMMENARBEIT.md`, diese Datei.
- **2–3 passende Vorbilder** aus `src/simulations/…`, die **vollständig** gelesen werden. Am besten die neuesten im gleichen Themenfeld, dazu das Lernmaterial einer Vorbild-Simulation als Muster.
- **Fachliche Idee in Stichpunkten:** Hauptansicht, Hauptanimation, Interaktion (was lässt sich ziehen oder antippen), Sonderfälle, Anwendungsbeispiele.
- **Prüfwerte für die Tests**, vorher festgelegt und von Hand nachgerechnet, zum Beispiel: „L = 0,65 m, c = 286 m/s → f₁ = 220 Hz“ oder „6 von 24 → 25 % → 90°“. Diese Werte stehen später in `tests/<id>.test.ts`.
- **Daten:** Port, eigener Screenshot-Ordner, Commit-Schlusszeilen, die ID (`planned(...)` im Lehrplan, `grades`/`kmk` nicht ändern).
- **Abschlussbericht** nach `AUFTRAG.md` Abschnitt 7, mit Pfaden zu 2–3 zusammengesetzten Screenshot-Bögen.

## 4. Selbstprüfung beim Bau (Pflicht)

### 4.1 Rechenlogik zuerst
- Die gesamte Fachlogik steht in `model.ts`, ohne Zeichencode. Tests in `tests/<id>.test.ts` mit **bekannten Lehrbuchwerten** (nicht nur „läuft ohne Fehler“), Sonderfällen (0, Grenzwerte, „keine Lösung“) und einer Plausibilitätsprüfung über viele Zufallswerte, wo möglich.
- Exakte Werte, wo die Schule exakt rechnet (Brüche gekürzt, π, Wurzeln). Rundung erst in der Anzeige.

### 4.2 Screenshot-Runden
Werkzeug: `node scripts/agenten/simshot.cjs <port> <ordner> <spec.json>` (Bedienung im Kopf der Datei; Tastaturbedienung mit `["focus","css"]` und `["key","ArrowRight"]`). Bilder mit Python/PIL zu **Bögen** zusammensetzen und jeden Bogen ansehen.

Pflicht-Ansichten in **jeder** Runde:

| Ansicht | Warum |
| --- | --- |
| Desktop hell, 1360 px | Hauptansicht |
| Desktop dunkel, 1360 px | Kontrast, Farben über `ctx.theme` |
| Tablet 1024 px und 700 px | Die Bühne ist dort etwa 620 px breit, aber flach. Layout nach Breite **und** Höhe wählen (z. B. `w >= 640 \|\| w >= h * 1.3` → Nebeneinander-Layout). Häufigste Fehlerquelle! |
| Handy 390 px, hell und dunkel | Schriftgrößen ≥ 11 px, nichts abgeschnitten |
| 1–2 Zustände nach Aktionen | Animation mittendrin und am Ende |
| Extremwerte der Regler | größter/kleinster Wert, Sonderfälle |

Höchstens zwei Korrekturrunden, dann Bericht mit ehrlich benannten Restpunkten.

### 4.3 Checkliste für jeden Bogen
- [ ] Keine Beschriftung überlappt eine andere oder wird von Karten, Zoom-Knöpfen oder Chips verdeckt.
- [ ] Nichts ist am Bildrand abgeschnitten. Anzeigen, die einem Objekt folgen, **an den Rand klemmen**.
- [ ] Keine leeren Flächen, keine winzigen Elemente. Die Hauptsache ist groß und in der Mitte.
- [ ] Dunkelmodus: Texte lesbar, Bilder nicht zu grell (ggf. abdunkeln).
- [ ] Tablet: Layout passt zur flachen Bühne.
- [ ] Zahlen mit Dezimalkomma und echtem Minus `−`, Einheiten vorhanden.
- [ ] Keine Konsolenfehler und kein horizontaler Überlauf (meldet `simshot`).
- [ ] Animationen: Nichts springt. Zahlen zählen, Elemente blenden ein, kurze Einstiegsanimation. Mit `prefersReducedMotion` alles sofort.
- [ ] Tastatur: Alles, was man im Bild nur antippen kann (Türen, Knoten, Knöpfe im Bild), ist mit `ctx.setKeyTargets` angemeldet; was man zieht, hat einen Regler. Meldungen, die nur im Bild stehen, mit `ctx.announce` ansagen.
- [ ] Etiketten auf Farbflächen: Schriftfarbe über `textOn(fläche, ctx.theme)` statt festem Weiß (sonst im Dunkelmodus oft nur 2,5 : 1).
- [ ] „=“/„≈“ über `ctx.fmt.rel`/`ctx.fmt.approx` statt eigener Helfer.

### 4.4 Lernmaterial
- DE ausführlich (60–110 Zeilen), EN kürzer, Aufbau nach `AUFTRAG.md` Abschnitt 4.
- **Jede Lösung selbst nachrechnen.** Jeder Link `[…](?key=wert)` setzt nur gültige Werte (ein Test prüft das) und zeigt genau den beschriebenen Zustand.
- „Ideen für den Unterricht“ im Anregungston, nie belehrend. Unsicheres zum Lehrplanbezug als „bitte am Lehrplan prüfen“ kennzeichnen.

### 4.5 Bilder (falls vorhanden)
- Immer eine gezeichnete Ersatzgrafik, die alleine hochwertig aussieht. **Einmal mit umbenannten Bilddateien prüfen.**
- Seitenverhältnis wahren, nie verzerren. Vorab skalieren (`src/sim-core/sprites.ts`), nicht pro Frame.
- Passt ein geliefertes Bild nicht (Perspektive, Auflösung, Marke, Text im Bild): **nicht einbauen**, in `docs/BILDER.md` unter „Nicht eingebaute Bilder“ begründen und einen besseren Prompt vorschlagen.

## 5. Abnahme durch die Leitung (der wichtigste Schritt)

Die Leitung verlässt sich **nicht** auf den Bericht des Agenten. Sie prüft selbst:

1. **Screenshot-Bögen ansehen**, mindestens Desktop, Tablet und Handy, dazu einen Aktionszustand. Mit der Checkliste aus 4.3.
2. **Mindestens drei Werte aus den Bildern von Hand nachrechnen.** Beispiele aus der Praxis:
   - Doppler: 440 Hz · 340/(340 − 33) = 487,3 Hz ✓
   - Interferenz: Δs = 0,83 λ → A = 2·|cos(π·0,83)| = 1,72 ✓
   - Extremwert: A(x) = x(40 − 2x) → Maximum bei x = 10 m, 200 m² ✓

   Stimmt ein Wert nicht, ist die Simulation **nicht abgenommen**.
3. **Fachliche Plausibilität:** Begriffe wie im bayerischen Unterricht, Vorzeichen, Einheiten, Sonderfälle (gegenphasig, Grenzwinkel, „keine Lösung“).
4. **Kleinigkeiten selbst beheben**, zum Beispiel eine am Rand abgeschnittene Anzeige oder eine Beschriftung unter dem Diagrammtitel. Danach neuer Screenshot als Beleg.
5. `npm run verify` nach dem Zusammenführen: **0 Fehler, 0 Warnungen, 0 Hinweise, alle Tests grün, Build ok.** Nie Tests abschwächen oder überspringen, um grün zu werden.

## 6. Typische Fehler aus der bisherigen Arbeit

| Fehler | Gegenmittel |
| --- | --- |
| Tablet nutzt das Handy-Layout, alles gestaucht | Layout nach Breite **und** Höhe wählen |
| Beschriftung unter dem Diagrammtitel oder hinter Zoom-Knöpfen | Abstand zum Titel-Chip berechnen, Knopfbereich freihalten |
| Anzeige läuft mit einem Objekt aus dem Bild | Position an den Rand klemmen |
| Zeiger- oder Pfeillängen passen nicht zum Wert | Längen aus dem echten Verhältnis berechnen |
| Diagrammbereich enthält den aktuellen Wert nicht | Bereich aus Daten **und** aktuellem Zustand bilden |
| Foto in falscher Perspektive (Seite statt oben) | nicht einbauen, neuen Prompt vorschlagen |
| Zahlen im Foto widersprechen der Simulation | Bereich im Foto übermalen bzw. ausschneiden |
| Agent bricht wegen Nutzungsgrenze ab | Stand bleibt im Worktree; denselben Agenten fortsetzen, nicht neu starten |

## 7. Bericht an die Person

Die Person liest auf dem Handy. Deshalb **deutsch, kurz, ohne Fachjargon**:

- Was ist fertig (Name der Simulation, neue Gesamtzahl)?
- Was zeigt sie (3–5 Punkte in Alltagssprache)?
- Was wurde geprüft? Nachgerechnete Werte nennen, „Gesamtprüfung ohne Fehler“.
- Ehrlich: Was nur aus dem Bericht bekannt ist (z. B. „Bewegungen nicht auf Fotos sichtbar“) und welche Kleinigkeiten offen sind.
- Was kommt als Nächstes?

## 8. Abnahme-Checkliste (vor jedem Pull Request)

- [ ] Fachlogik in `model.ts`, Tests mit Lehrbuchwerten in `tests/<id>.test.ts`
- [ ] Screenshot-Runden: Desktop hell und dunkel, Tablet 1024 und 700, Handy 390, Aktionen, Extremwerte; Checkliste 4.3 erfüllt
- [ ] Mindestens drei Werte von der Leitung nachgerechnet
- [ ] Animationen weich, Einstiegsanimation, `prefersReducedMotion`
- [ ] Lernmaterial DE und EN, Lösungen nachgerechnet, Links gültig, Ton stimmt
- [ ] Lehrplan-Eintrag `ready`, `grades` unverändert
- [ ] `npm run verify` grün (0/0/0, alle Tests, Build)
- [ ] `WARTESCHLANGE.md` aktualisiert, nur die eigenen Dateien geändert
- [ ] Bericht an die Person mit Restpunkten
