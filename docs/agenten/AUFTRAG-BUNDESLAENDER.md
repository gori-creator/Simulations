# Auftrag: Weitere Bundesländer (Lehrpläne Mathematik und Physik, Gymnasium)

Briefing der Projektleitung (Stand 26.10.2026) für einen Claude-Agenten **ohne GitHub**. Du bekommst das Paket `bundeslaender-paket.zip` und lieferst Dateien zurück; die Projektleitung baut sie ein und prüft sie.

## Worum es geht

Die Seite bietet kostenlose MINT-Simulationen für Schulen. Wählt man im Zahnrad ein Bundesland, zeigt die Fachseite die Simulationen nach den Jahrgangsstufen **dieses** Landes. Alles, was dort keinem Jahrgang zugeordnet ist, steht darunter bei „Weitere Simulationen“.

Bisher gibt es Bayern, Baden-Württemberg und Hessen, jeweils Gymnasium, Mathematik und Physik. Deine Aufgabe sind **weitere Länder**, in dieser Reihenfolge:

1. Nordrhein-Westfalen
2. Niedersachsen
3. Sachsen
4. Rheinland-Pfalz
5. Schleswig-Holstein
6. Berlin
7. Brandenburg
8. Thüringen
9. Sachsen-Anhalt
10. Mecklenburg-Vorpommern
11. Hamburg
12. Saarland
13. Bremen

**Pro Runde ein Land, beide Fächer.** Erst wenn ein Land fertig abgegeben ist, kommt das nächste.

## Im Paket

- `CLAUDE.md`: Regeln des Projekts.
- `SIMULATIONEN.md`: alle fertigen Simulationen mit **ID**, Titel, Klassenstufen und Kurzbeschreibung. Nur diese IDs verwenden.
- `src/curriculum/lehrplaene/*.ts`: die bisherigen Länder als **Vorlage**. Am klarsten sind `bayern-gymnasium-mathematik.ts` und `hessen-gymnasium-physik.ts` (mit Doppeljahrgangsstufen).
- `src/curriculum/lehrplaene/types.ts`: das Datenformat.
- `docs/lehrplaene/*.md` und `*.json`: die Aufbereitung der bisherigen Länder (Protokoll mit Quellen, Lücken, Annahmen). Genauso sollen deine Protokolle aussehen.
- `tests/curriculum.test.ts`: die Prüfungen, die deine Dateien bestehen müssen (siehe unten).
- `src/curriculum/mathematik.ts`, `physik.ts`: die Simulationen mit ihren Klassenstufen (`grades`), falls du mehr Details brauchst.

## So gehst du vor

1. **Nur amtliche Quellen.** Das sind der Lehrplan bzw. das Kerncurriculum des Kultusministeriums oder Landesinstituts (z. B. NRW: QUA-LiS / schulentwicklung.nrw.de; Niedersachsen: cuvo.nibis.de). Gilt der aktuelle Lehrplan für G8 oder G9? Gibt es eine gymnasiale Oberstufe mit eigenem Lehrplan? Beides im Protokoll festhalten. Keine Schulbuchverlage, keine Foren.
2. **Gliederung übernehmen:** Jahrgangsstufe → Lernbereich (Inhaltsfeld, Kompetenzbereich …) → Unterbereiche.
   - Überschriften so, wie sie im Lehrplan stehen.
   - Kurzbeschreibungen (`summary`) **in eigenen Worten**, ein bis zwei Sätze, Deutsch und Englisch. Nicht abschreiben.
   - Hat der Lehrplan keine Nummern, vergib eigene und vermerke das in der Notiz der Jahrgangsstufe (wie bei Hessen).
3. **Doppeljahrgangsstufen** (z. B. 5/6, 7/8): Die Lernbereiche stehen bei beiden Jahrgängen gleich. Eine Simulation steht nur bei den Jahrgängen, die in ihre Klassenstufen fallen; Vorbild ist Hessen. Oberstufe ohne Jahrgangsangabe: Einführungsphase = 11, Qualifikationsphase = 12/13 (G9). Das ist eine Annahme und kommt in die Notiz.
4. **Simulationen zuordnen:** Lies die Kurzbeschreibung in `SIMULATIONEN.md` und ordne nur zu, was **wirklich** zum Lernbereich passt, nicht bloß „irgendwie verwandt“. Eine Simulation darf bei mehreren Lernbereichen stehen.
5. **Ziel: jede Simulation steht bei mindestens einem Jahrgang.** Was im Lehrplan des Landes wirklich nicht vorkommt, kommt auf die Ausnahmeliste, jeweils mit Grund (z. B. „Taylorpolynome: nicht im Kernlehrplan“).
6. **Klassenstufe passt nicht?** Wird ein Thema im Land in einer Jahrgangsstufe unterrichtet, die außerhalb der `grades` der Simulation liegt (z. B. Binomialverteilung erst in 13), dann **nicht** einfach weglassen. Schreib es in die Liste „Klassenstufen erweitern“ (ID, bisher, neu, Lernbereich, Fundstelle). Die Projektleitung erweitert dann die Klassenstufen.
7. **Unsicheres kennzeichnen:** In der Notiz der Jahrgangsstufe bzw. im Protokoll „Entwurf, bitte am Lehrplan prüfen“ dazuschreiben. Nichts erfinden: Findest du einen Lehrplan nicht, melde das, statt zu raten.

## Regeln, die die Tests prüfen

- `id` = `<land>-gymnasium-<fach>`, z. B. `nordrhein-westfalen-gymnasium-mathematik`. `slug` z. B. `L('nordrhein-westfalen-gymnasium', 'north-rhine-westphalia-gymnasium')`. `state` z. B. `L('Nordrhein-Westfalen', 'North Rhine-Westphalia')`.
- Jede Jahrgangsstufe nur einmal. Jede hat `sourceUrl` mit `https://`.
- Nummern innerhalb einer Jahrgangsstufe sind eindeutig. Unterbereiche beginnen mit der Nummer des Lernbereichs plus Punkt (`2` → `2.1`) oder plus Leerzeichen und Klammer (`3.1.1` → `3.1.1 (1)–(4)`).
- **Ein Lernbereich hat entweder Unterbereiche oder eigene Simulationen, nie beides.** Simulationen also an die Unterbereiche hängen.
- Nur IDs aus `SIMULATIONEN.md`, nur aus dem passenden Fach, und die Jahrgangsstufe muss innerhalb der Klassenstufen der Simulation liegen (siehe Punkt 6).
- Alle Texte Deutsch und Englisch über `L('…', '…')`, keine leeren Texte.
- Im Kopf der Datei ein Kommentar mit der genauen Quelle (Titel, Ausgabe, Stand), wie in den Vorlagen.

## Abgabe (je Land)

Ein ZIP `<land>.zip` mit:

1. `src/curriculum/lehrplaene/<land>-gymnasium-mathematik.ts` und `…-physik.ts`
2. `docs/lehrplaene/<land>-gymnasium-mathematik.md` und `.json`, ebenso für Physik. Aufbau wie bei Hessen: Überblick, Lehrplan im Detail mit Zuordnung, Teil „Nicht zugeordnet“ mit Grund, Annahmen, unsichere Zuordnungen. Die JSON-Datei enthält dieselben Daten wie die `.ts` (Vorlage: `docs/lehrplaene/hessen-gymnasium-mathematik.json`).
3. `ABGABE.md` mit:
   - Quellen (Links, Stand)
   - **Ausnahmeliste** je Fach: ID → Grund
   - **Klassenstufen erweitern:** ID, bisher, neu, Lernbereich, Fundstelle
   - Abdeckung je Fach: „x von 93 Mathe / y von 36 Physik zugeordnet“
   - Offene Fragen und unsichere Stellen

Den Eintrag in `src/curriculum/lehrplaene/index.ts`, die Tests und `npm run verify` übernimmt die Projektleitung. Du kannst sie nicht ausführen. Prüfe die Regeln oben deshalb selbst sorgfältig.

**Kommst du an dein Nutzungslimit:** Gib ab, was fertig ist (lieber ein Fach vollständig als zwei halb), und schreib in `ABGABE.md`, wo du stehst.
