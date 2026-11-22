# Eine Simulation beitragen – mit KI-Assistent

Diese Anleitung führt dich Schritt für Schritt zu einer eigenen Simulation für Scitura, die als **Community-Simulation** auf der Seite erscheint. Du brauchst keine Programmier-Erfahrung, aber einen **KI-Assistenten, der im Projekt arbeiten kann** (z. B. Claude Code, OpenAI Codex, Cursor, GitHub Copilot im Agent-Modus oder ein vergleichbares Werkzeug). Ein reiner Chat ohne Zugriff auf die Dateien reicht nicht: Der Assistent muss Dateien lesen, ändern und Befehle ausführen können.

Regeln und Ablauf des Pull Requests: [`CONTRIBUTING.md`](../CONTRIBUTING.md). Technische Details: [`NEUE-SIMULATION.md`](NEUE-SIMULATION.md).

---

## 0. Vorbereitung (einmalig, ca. 15 Minuten)

1. **GitHub-Konto** anlegen (kostenlos) und das Projekt **forken**: Knopf „Fork“ auf <https://github.com/gori-creator/Simulations>.
2. **Node.js 22.12 oder neuer** installieren (<https://nodejs.org>).
3. Deinen Fork herunterladen und starten:

   ```bash
   git clone https://github.com/<dein-name>/Simulations.git
   cd Simulations
   npm install
   npm run dev          # Seite unter http://localhost:4321
   ```

4. Den KI-Assistenten im Ordner `Simulations` öffnen.

## 1. Thema wählen

- **Geplante Simulationen:** Im Katalog (<https://scitura.de/de/simulationen/>) stehen viele Einträge mit „In Planung“. Im Code sind das `planned(...)`-Einträge in `src/curriculum/mathematik.ts` bzw. `physik.ts`. Diese IDs sind schon festgelegt.
- **Lehrplan-Lücken:** [`LEHRPLAN-LUECKEN.md`](LEHRPLAN-LUECKEN.md) listet Themen der Länder-Lehrpläne ohne Simulation.
- Kurz ein **Issue „Idee“** öffnen („Ich baue <Thema>“), damit nicht zwei Leute dasselbe bauen.

Gute Themen: etwas, das man **bewegen, verändern und beobachten** kann (Regler, Ziehen, Animation). Weniger gut: reine Rechenübungen.

## 2. Die Prompts

Setze in den Prompts `<THEMA>`, `<ID>`, `<FACH>` (`mathematik` oder `physik`) und `<KLASSE>` ein. Gib die Prompts **nacheinander** ein und schau dir nach jedem Schritt das Ergebnis an.

### Prompt 1 – Einlesen und Plan (noch nichts bauen)

```text
Du arbeitest im Projekt Scitura (interaktive Mathe-/Physik-Simulationen für Schulen,
Astro + TypeScript + Canvas). Lies zuerst vollständig: CLAUDE.md, CONTRIBUTING.md,
docs/NEUE-SIMULATION.md, docs/agenten/AUFTRAG.md, docs/agenten/QUALITAETSSICHERUNG.md
und docs/agenten/SPICKZETTEL.md.

Ich möchte eine Community-Simulation zum Thema „<THEMA>“ für Klasse <KLASSE> bauen
(ID: <ID>, Fach: <FACH>). Suche 2–3 fertige Simulationen mit ähnlichem Thema in
src/simulations/ und lies sie komplett als Vorbild, dazu ihr Lernmaterial in
src/content/simulations/de/.

Baue noch nichts. Schreib mir einen kurzen Plan:
1. Was sieht man (Hauptansicht), was bewegt sich (Animation), was kann man ziehen
   oder einstellen (Regler, Schalter, Beispiele)?
2. Welche Formeln und Fachbegriffe kommen vor (genau wie im Schulbuch)?
3. 4–6 Prüfwerte, die du von Hand nachrechnest (Eingabe → erwartetes Ergebnis),
   für die Tests.
4. Welche Sonderfälle gibt es (0, negative Werte, sehr große Werte)?
5. Welche Vorbilder hast du gelesen?
```

> Lies den Plan genau. Stimmen die Formeln? Würdest du das im Unterricht so zeigen? Korrigiere den Plan, bevor du weitermachst.

### Prompt 2 – Bauen

```text
Gut, setz den Plan jetzt um. Halte dich streng an die Regeln aus CLAUDE.md und
CONTRIBUTING.md:
- Grundgerüst mit: npm run new:sim -- <ID> --subject <FACH> (bei Animation mit --animated)
- Code nur in src/simulations/<FACH>/<ID>/ (index.ts, model.ts, optional thumb.svg);
  Importe nur aus ../../../sim-core und aus dem eigenen Ordner
- Kein Netzwerk, kein localStorage, kein eval, kein innerHTML, kein document.* –
  nur über ctx arbeiten (tests/simulations-sicherheit.test.ts prüft das)
- Alle Texte zweisprachig mit L('deutsch', 'english'), Zahlen über ctx.fmt
  (Dezimalkomma, Minus als −), Farben nur über ctx.theme
- Rechenlogik in model.ts, Tests mit deinen Prüfwerten in tests/<ID>.test.ts
- Im Lehrplan (src/curriculum/<FACH>.ts) den Eintrag auf status: 'ready' setzen,
  mit slug, title, summary, grades, kmk, keywords und
  community: { author: '<DEIN NAME>', url: 'https://github.com/<dein-name>' }
- Keine Dateien außerhalb der in CONTRIBUTING.md genannten ändern
Führe am Ende npm run verify aus und behebe alle Fehler, bis alles grün ist.
```

### Prompt 3 – Lernmaterial

```text
Schreib jetzt das Lernmaterial in src/content/simulations/de/<ID>.md und
src/content/simulations/en/<ID>.md, im Aufbau wie bei den Vorbildern:
kurze Erklärung mit Formeln (KaTeX), „Ausprobieren“-Aufträge mit Links auf
Einstellungen (?param=wert), 3–5 Aufgaben mit Lösungen zum Aufklappen und
Ideen für den Unterricht. Fachlich sauber, für Klasse <KLASSE> verständlich,
kurze Sätze. Prüfe jede Zahl in den Lösungen mit der Rechenlogik aus model.ts nach.
Danach npm run verify.
```

### Prompt 4 – Selbst prüfen

```text
Prüfe deine Simulation jetzt mit den Augen einer kritischen Lehrkraft, nach
docs/agenten/QUALITAETSSICHERUNG.md:
1. Starte die Seite (npm run build && npm run preview) und öffne sie mit
   Playwright: Computer 1360 px hell, Handy 390 px dunkel mit Touch
   (Dunkelmodus: localStorage.setItem('theme','dark') vor dem Laden).
   Mach Screenshots, sieh sie dir an: Ist alles lesbar, nichts abgeschnitten,
   kein waagrechtes Scrollen, keine Fehler in der Konsole?
2. Probiere alle Regler bis an die Grenzen und alle Beispiele aus.
3. Rechne 3 angezeigte Werte von Hand nach.
4. Lies das Lernmaterial auf Fehler, Tippfehler und falsche Lösungen.
Liste alles auf, was dir auffällt, behebe es und führe npm run verify aus.
Gib mir am Ende die Pfade der Screenshots.
```

### Prompt 5 – Text für den Pull Request

```text
Schreib mir den Text für den Pull Request nach .github/PULL_REQUEST_TEMPLATE.md:
was die Simulation zeigt, für welche Klasse, welche Formeln, wie getestet,
welche Prüfwerte, offene Fragen. Kurz und sachlich.
```

### Optional – Bilder

Bilder sind nicht nötig (die Simulation zeichnet alles selbst). Wenn du doch Fotos willst (z. B. eine Wippe, ein Auto), halte dich an den Stil und die Regeln in [`BILDER.md`](BILDER.md): fotorealistisch, freigestellt, keine Personen, keine Marken. Trag jedes Bild mit Prompt in `docs/BILDER.md` ein und sorge für eine gezeichnete Ersatzgrafik.

## 3. Pull Request einreichen

```bash
git checkout -b sim/<ID>
git add -A
git commit -m "Community-Simulation: <THEMA>"
git push -u origin sim/<ID>
```

Dann auf GitHub „Compare & pull request“ klicken, den Text aus Prompt 5 einfügen und **Screenshots** anhängen.

## 4. Was danach passiert

1. Die automatischen Prüfungen laufen (Typprüfung, Tests, Sicherheitsprüfung, Build).
2. Wir sehen uns den Code und die Seite an und geben Rückmeldung im Pull Request. Meist gibt es eine kleine Runde mit Verbesserungen.
3. Nach der Übernahme erscheint die Simulation auf scitura.de mit dem Abzeichen **Community** und deinem Namen.
4. Nach der fachlichen Prüfung wird sie zu einer offiziellen Simulation.

## Checkliste vor dem Pull Request

- [ ] `npm run verify` ist grün.
- [ ] Nur erlaubte Dateien geändert (siehe CONTRIBUTING.md).
- [ ] `community: { author: … }` im Lehrplan-Eintrag.
- [ ] Deutsch **und** Englisch vollständig (Oberfläche und Lernmaterial).
- [ ] Prüfwerte von Hand nachgerechnet und als Tests eingetragen.
- [ ] Screenshots: Computer hell, Handy dunkel.
- [ ] Am Handy bedienbar (Ziehen mit dem Finger, nichts zu klein).
- [ ] Keine fremden Bilder, Texte oder Code übernommen.
