# Briefing für die Prüf-Agenten der großen Prüfrunde

Stand: 20.10.2026. Verfasst von der Vertretung der Projektleitung, die Paket 1 selbst prüft und die Abnahme macht.

## Deine Aufgabe

Du prüfst **ein Paket** aus `docs/pruefung/pakete.md`, Simulation für Simulation, in der dort angegebenen Reihenfolge:

- **Paket 2:** Mathematik Jgst. 5–8, 43 Simulationen
- **Paket 3:** Mathematik Jgst. 9–12, 42 Simulationen

Pro Simulation gibt es **einen Durchgang** mit vier Teilen: Fach, Aufgaben/Texte, Geräte und Barrierefreiheit. Gefundene Fehler behebst du gleich mit. Plane **etwa 20 Minuten pro Simulation** ein. Die Hintergründe stehen in `docs/pruefung/PLAN.md`.

`fadenpendel` und `brechung` sind ausgenommen, weil sie noch überarbeitet werden.

## Vor dem Start einmal lesen

1. `CLAUDE.md` (Konventionen: Deutsch, `L('de','en')`, Dezimalkomma über `ctx.fmt`, Minus als `−`, Farben nur über `ctx.theme`, Parameter-Schlüssel nie umbenennen)
2. `docs/agenten/QUALITAETSSICHERUNG.md`
3. `docs/pruefung/PLAN.md` und `docs/pruefung/VORLAGE.md`

## Arbeitsweise

- **Zweig:** `git fetch origin && git checkout -b pruefung/paket-<N> origin/main`. Falls das Prüfwerkzeug `scripts/agenten/pruefbogen.cjs` noch nicht in `main` ist, gehe stattdessen von `origin/claude/hopeful-bardeen-9cogca` aus.
- **Bau-Agent:** pro Simulation einer, im eigenen Worktree, immer nur einer gleichzeitig. Danach prüfst du selbst nach und mergst in deinen Paket-Zweig.
- **Dev-Server:** `npx astro dev --port <eigener Port>`. Paket 2 nimmt 4520, Paket 3 nimmt 4530, damit es keine Überschneidung gibt.

### Pro Simulation

1. **Prüfbogen erzeugen:**
   ```
   node scripts/agenten/pruefbogen.cjs <port> <ordner> <adresse aus pakete.md> <id>
   ```
   Das dauert ca. 45 s. Es entstehen ein Bogen mit Handy klein/groß, iPad hoch/quer, Laptop, 1920 px und Beamer, jeweils hell und dunkel, sowie eine JSON-Datei mit den Befunden: reduzierte Bewegung, Konsolenfehler, waagerechter Überlauf, Bedienelemente ohne Namen und Tab-Reihenfolge. Die Bögen **nicht committen**, sie gehören in einen eigenen Ordner außerhalb des Repos.
2. **Fach:**
   - `model.ts` und alle Anzeigen im Bild prüfen.
   - Mindestens 3 Werte von Hand nachrechnen und die Rechnung ins Protokoll schreiben.
   - Sonderfälle prüfen: 0, negativ, Reglergrenzen, Division durch 0.
   - Einheiten, Rundung und Begriffe wie im Unterricht prüfen.
   - Fehlende Tests ergänzen in `tests/<id>.test.ts`.
3. **Aufgaben und Texte:**
   - Jede Aufgabe im Lernmaterial (`src/content/simulations/{de,en}/<id>.md`) selbst rechnen.
   - Jedes Beispiel („Beispiel laden“) einmal laden und ansehen. `node scripts/agenten/simshot.cjs` hilft dabei.
   - Texte verständlich und fehlerfrei machen, in DE und EN gleich.
   - Stil: kurze Sätze, Lehrkräfte in der Sie-Form, Aufgaben an Schüler in der Du-Form.
4. **Geräte:** Den Bogen durchsehen: Überlappungen, abgeschnittene Beschriftungen, fehlende Karten auf dem Tablet, Lesbarkeit am Beamer. Ziehen mit Finger und Maus prüfen, wo die Simulation Ziehen anbietet.
5. **Barrierefreiheit (Teil der Simulation):**
   - Reduzierte Bewegung muss stillstehen.
   - Jedes Bedienelement braucht einen Namen.
   - Farben nur aus dem Theme, und nichts darf nur über Rot/Grün unterscheidbar sein.
6. **Beheben:**
   - Nur in `src/simulations/<fach>/<id>/`, im Lernmaterial der Simulation und in `tests/<id>.test.ts`.
   - Danach `npm run verify` mit 0/0/0, alle Tests grün, Build ok.
7. **Protokoll:** `docs/pruefung/paket-<N>/<id>.md` nach `VORLAGE.md` schreiben und in `pakete.md` den Haken setzen.

### Was du nicht änderst

- **`src/sim-core/`, `src/i18n/ui.ts`, `src/curriculum/*.ts`, Seiten und Layouts:** Was dort nötig wäre, kommt ins Protokoll unter „Für den Kern“. Die Vertretung sammelt und erledigt das.
- **Parameter-Schlüssel:** nie umbenennen, weil sie in geteilten Links stehen.
- **Fehler und Verbesserungen:** Seit dem 20.10. gilt die Anweisung der Projektleitung, alles, was falsch ist oder besser werden soll, automatisch umzusetzen. Rückfragen sind nicht mehr nötig. Entscheide selbst nach dem Prinzip „fachlich richtig, für die Klassenstufe verständlich, im Zweifel einfacher“. Schreib die Entscheidung mit Begründung ins Protokoll unter „Entscheidungen“. Nur echte Lehrplan-Fragen (Zuordnung zu Land oder Jahrgangsstufe) bleiben als Entwurf gekennzeichnet.
- **Konsistenztests:** nicht abschwächen.

## Abgabe

- **Pull Request:** je 8 Simulationen einer nach `main`, Titel „Prüfrunde Paket <N>, Teil <k>: <id>, <id>, …“. Im Text pro Simulation eine Zeile: Ergebnis, wichtigste Korrektur, nachgerechnete Werte.
- **Nicht selbst mergen.** Die Vertretung nimmt ab: 2 von 8 voll, bei den übrigen prüft sie Protokoll und Bogen. Danach mergt sie.
- **Commits:** Commit-Nachrichten auf Deutsch. Keine Modellnamen und keine E-Mail-Adressen in Dateien oder Commits.
- **Limit:** Wenn dein Nutzungslimit naht, committe und pushe den Zwischenstand. Schreib außerdem in den PR, bei welcher Simulation du stehst.

## Fragen

Fragen gehen an die Projektleitung, und die gibt sie an die Vertretung weiter. Antworten kommen über dieselbe Stelle oder als Kommentar in deinem PR.
