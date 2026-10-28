# Auftrag: Weitere Bundesländer (Lehrpläne Mathematik und Physik, Gymnasium)

Briefing der Projektleitung (Stand 26.10.2026) für einen Claude-Agenten mit GitHub-Zugriff auf `gori-creator/Simulations`. Lies zuerst `CLAUDE.md`. Arbeite auf einem eigenen Zweig von `main` (z. B. `lehrplan/nordrhein-westfalen`), am Ende Pull Request nach `main`, **nicht selbst mergen**.

## Worum es geht

Die Seite bietet kostenlose MINT-Simulationen für Schulen. Wählt man im Zahnrad ein Bundesland, zeigt die Fachseite die Simulationen nach den Jahrgangsstufen **dieses** Landes. Alles, was dort keinem Jahrgang zugeordnet ist, steht darunter bei „Weitere Simulationen“.

**Fertig** (in `main`, Gymnasium, Mathematik und Physik): Baden-Württemberg, Bayern, Berlin, Brandenburg, Hessen, Niedersachsen, Nordrhein-Westfalen, Rheinland-Pfalz, Sachsen, Sachsen-Anhalt, Schleswig-Holstein.

**Offen**, in dieser Reihenfolge (das erste noch nicht fertige Land ist dran, außer die Projektleitung nennt ein anderes):

1. Thüringen
2. Mecklenburg-Vorpommern
3. Hamburg
4. Saarland
5. Bremen

Vor dem Start prüfen, welche Länder schon in `src/curriculum/lehrplaene/` liegen (`main` aktuell holen), und nach dem Merge das Land oben von „Offen“ nach „Fertig“ verschieben.

**Pro Runde ein Land, beide Fächer.** Erst wenn ein Land fertig abgegeben ist, kommt das nächste.

## Was du brauchst

- `CLAUDE.md`: Regeln des Projekts.
- `src/curriculum/lehrplaene/*.ts`: die bisherigen Länder als **Vorlage**. Am klarsten sind `bayern-gymnasium-mathematik.ts` und `hessen-gymnasium-physik.ts` (mit Doppeljahrgangsstufen). Format: `src/curriculum/lehrplaene/types.ts`.
- `src/curriculum/mathematik.ts`, `physik.ts`: alle Simulationen mit ID, Kurzbeschreibung (`summary`) und Klassenstufen (`grades`). Nur fertige (`status: 'ready'`) zuordnen.
- `docs/lehrplaene/*.md` und `*.json`: die Aufbereitung der bisherigen Länder (Protokoll mit Quellen, Lücken, Annahmen). Genauso sollen deine Protokolle aussehen.
- `tests/curriculum.test.ts`: die Prüfungen, insbesondere „passt zu den Klassenstufen der Simulationen“ und „ordnet jede fertige Simulation einem Jahrgang zu“ mit der Ausnahmeliste `NOT_IN_CURRICULUM`.

## So gehst du vor

1. **Quelle sind die Lehrpläne, die dir die Projektleitung gibt** (PDFs bzw. Dateien des Kultusministeriums oder Landesinstituts). Nur diese verwenden, nicht im Netz nach anderen Fassungen suchen. Keine Schulbuchverlage, keine Foren.
   - **Vorher prüfen, ob alles da ist:** Sekundarstufe I **und** gymnasiale Oberstufe, je Mathematik und Physik. Fehlt etwas, ist eine Datei unleserlich oder unklar, welche Fassung gilt: **bei der Projektleitung nachfragen**, nicht raten.
   - Die Lehrplan-Dateien selbst **nicht** ins Repository legen (Urheberrecht); nur Titel, Stand und Link angeben.
   - Im Protokoll festhalten: Titel, Ausgabe und Stand jeder Datei; ob G8 oder G9; welcher Teil (Sek. I, Oberstufe) aus welcher Datei stammt.
   - `sourceUrl` je Jahrgangsstufe: der amtliche Link zu genau dieser Datei, wenn er in ihr steht oder die Projektleitung ihn nennt. Sonst die Startseite des Ministeriums bzw. Landesinstituts, mit Vermerk in `ABGABE.md`.
2. **Gliederung übernehmen:** Jahrgangsstufe → Lernbereich (Inhaltsfeld, Kompetenzbereich …) → Unterbereiche.
   - Überschriften so, wie sie im Lehrplan stehen.
   - Kurzbeschreibungen (`summary`) **in eigenen Worten**, ein bis zwei Sätze, Deutsch und Englisch. Nicht abschreiben.
   - Hat der Lehrplan keine Nummern, vergib eigene und vermerke das in der Notiz der Jahrgangsstufe (wie bei Hessen).
3. **Doppeljahrgangsstufen** (z. B. 5/6, 7/8): Die Lernbereiche bei beiden Jahrgängen gleich eintragen; aufeinanderfolgende Jahrgänge mit gleichen Lernbereichen fasst die Seite automatisch zu einer Stufe „5/6“ zusammen (alternativ direkt eine Stufe mit `toGrade`). Eine Simulation steht nur bei den Jahrgängen, die in ihre Klassenstufen fallen; Vorbild ist Hessen. Oberstufe ohne Jahrgangsangabe: Einführungsphase = 11, Qualifikationsphase = 12/13 (G9). Das ist eine Annahme und kommt in die Notiz.
4. **Simulationen zuordnen:** Lies die Kurzbeschreibung (`summary`) in `src/curriculum/<fach>.ts` und ordne nur zu, was **wirklich** zum Lernbereich passt, nicht bloß „irgendwie verwandt“. Eine Simulation darf bei mehreren Lernbereichen stehen.
5. **Ziel: jede Simulation steht bei mindestens einem Jahrgang.** Was im Lehrplan des Landes wirklich nicht vorkommt, kommt auf die Ausnahmeliste, jeweils mit Grund (z. B. „Taylorpolynome: nicht im Kernlehrplan“).
6. **Klassenstufe passt nicht?** Wird ein Thema im Land in einer Jahrgangsstufe unterrichtet, die außerhalb der `grades` der Simulation liegt (z. B. Binomialverteilung erst in 13), dann **nicht** einfach weglassen: die `grades` der Simulation in `src/curriculum/<fach>.ts` erweitern (nur so weit wie nötig) und im Pull Request auflisten (ID, bisher, neu, Lernbereich, Fundstelle). Den Test nicht abschwächen. Wird dadurch die Sortierung nach Klassenstufe verletzt, die Simulation innerhalb ihres Bereichs passend einsortieren (gleicher Bereich = gleiche Adresse).
7. **Unsicheres kennzeichnen:** In der Notiz der Jahrgangsstufe bzw. im Protokoll „Entwurf, bitte am Lehrplan prüfen“ dazuschreiben. Nichts erfinden: Steht etwas nicht in den gelieferten Lehrplänen, melde das, statt zu raten.

## Regeln, die die Tests prüfen

- `id` = `<land>-gymnasium-<fach>`, z. B. `nordrhein-westfalen-gymnasium-mathematik`. `slug` z. B. `L('nordrhein-westfalen-gymnasium', 'north-rhine-westphalia-gymnasium')`. `state` z. B. `L('Nordrhein-Westfalen', 'North Rhine-Westphalia')`.
- Jede Jahrgangsstufe nur einmal. Jede hat `sourceUrl` mit `https://`.
- Nummern innerhalb einer Jahrgangsstufe sind eindeutig. Unterbereiche beginnen mit der Nummer des Lernbereichs plus Punkt (`2` → `2.1`) oder plus Leerzeichen und Klammer (`3.1.1` → `3.1.1 (1)–(4)`).
- **Ein Lernbereich hat entweder Unterbereiche oder eigene Simulationen, nie beides.** Simulationen also an die Unterbereiche hängen.
- Nur IDs fertiger Simulationen, nur aus dem passenden Fach, und die Jahrgangsstufe muss innerhalb der Klassenstufen der Simulation liegen (siehe Punkt 6).
- Alle Texte Deutsch und Englisch über `L('…', '…')`, keine leeren Texte.
- Im Kopf der Datei ein Kommentar mit der genauen Quelle (Titel, Ausgabe, Stand), wie in den Vorlagen.

## Einbau und Abgabe (je Land)

1. `src/curriculum/lehrplaene/<land>-gymnasium-mathematik.ts` und `…-physik.ts` anlegen und in `src/curriculum/lehrplaene/index.ts` eintragen (Liste `STATE_CURRICULA` und Kommentar, alphabetisch nach Land).
2. `docs/lehrplaene/<land>-gymnasium-<fach>.md` und `.json`: Aufbau wie bei Hessen (Überblick, Lehrplan im Detail mit Zuordnung, „Nicht zugeordnet“ mit Grund, Annahmen, unsichere Zuordnungen). Die JSON-Datei enthält dieselben Daten wie die `.ts`.
3. Ausnahmen mit Grund in `NOT_IN_CURRICULUM` (`tests/curriculum.test.ts`) eintragen.
4. `npm run lehrplan:luecken` (erneuert `docs/LEHRPLAN-LUECKEN.md`, sonst schlägt ein Test fehl), dann `npm run verify`: 0 Fehler, 0 Warnungen, 0 Hinweise, alle Tests grün. Die Bildtests ändern sich nicht (Lehrpläne stehen nicht in den Simulationen).
5. **Sichtprüfung:** `npm run build` und `npx astro preview`. Dann im Zahnrad das neue Land wählen. Fachseite Mathe und Physik ansehen, ebenso die Lehrplan-Übersicht des Landes mit „Weitere Simulationen“ und eine Jahrgangsseite. Jeweils bei 1360 px und 390 px; Screenshots z. B. mit `node scripts/agenten/simshot.cjs` (Kopf der Datei lesen).
6. In `docs/AUFGABEN.md` den Stand vermerken.
7. **Pull Request nach `main`** mit:
   - Quellen (Titel, Stand, Links)
   - Abdeckung je Fach („x von 93 Mathe / y von 36 Physik“)
   - Ausnahmen mit Grund
   - erweiterte Klassenstufen
   - unsichere Stellen und offene Fragen

**Kommst du an dein Nutzungslimit:** committen, pushen und im Pull Request notieren, wo du stehst (lieber ein Fach vollständig als zwei halb).
