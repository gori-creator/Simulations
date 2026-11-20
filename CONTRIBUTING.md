# Mitmachen bei Scitura

Scitura ist eine offene Lernplattform (Open Source, OER) mit interaktiven Simulationen für Mathe und Physik. Schön, dass du mitmachen willst! *English version below.*

## Was du beitragen kannst

| Beitrag | Wie |
| --- | --- |
| **Fehler melden** (falsche Formel, Tippfehler, etwas geht nicht) | [Issue „Fehler“](../../issues/new?template=fehler.md) oder das [Kontaktformular](https://scitura.de/de/kontakt/) |
| **Idee für eine Simulation** | [Issue „Idee“](../../issues/new?template=idee.md) – oder schau in die Liste der Lücken: [`docs/LEHRPLAN-LUECKEN.md`](docs/LEHRPLAN-LUECKEN.md) |
| **Eine eigene Simulation bauen** | Anleitung mit fertigen Prompts für KI-Assistenten: [`docs/MITMACHEN-SIMULATION.md`](docs/MITMACHEN-SIMULATION.md) |
| **Texte verbessern, übersetzen** (Lernmaterial, Englisch) | Pull Request auf `src/content/` |
| **Aufgaben für den Unterricht** | Pull Request auf das Lernmaterial der Simulation |

Ohne GitHub? Schick deine Idee oder deine Dateien über das [Kontaktformular](https://scitura.de/de/kontakt/), wir bauen sie ein.

## Offiziell und Community

Auf der Seite gibt es zwei Arten von Simulationen:

- **Offiziell (ohne Kennzeichen):** von Scitura fachlich und didaktisch geprüft.
- **Community (gelbes Abzeichen):** von dir gebaut. Sie ist **technisch geprüft** (alle Tests grün, Sicherheitsprüfung, Code angesehen), aber **fachlich noch nicht**. Dein Name steht auf der Seite. Nach der fachlichen Prüfung wird sie offiziell; das Abzeichen fällt weg, dein Name bleibt in der Versionsgeschichte und in der Liste der Mitwirkenden.

Im Code steht das im Lehrplan-Eintrag:

```ts
community: { author: 'Dein Name oder GitHub-Name', url: 'https://github.com/dein-name' },
```

## Ablauf eines Pull Requests

1. **Fork** anlegen, einen Zweig erstellen (`sim/<id>`).
2. Simulation bauen (Anleitung: [`docs/NEUE-SIMULATION.md`](docs/NEUE-SIMULATION.md), mit KI: [`docs/MITMACHEN-SIMULATION.md`](docs/MITMACHEN-SIMULATION.md)).
3. `npm run verify` muss grün sein (Typprüfung, alle Tests, Build).
4. Pull Request öffnen und die Vorlage ausfüllen (Screenshots hell und dunkel, Handy und Computer).
5. Wir schauen drüber, geben Rückmeldung und übernehmen ihn als **Community-Simulation**.

### Was ein Community-Pull-Request ändern darf

Damit wir Beiträge sicher prüfen können, ändert ein Pull Request mit einer neuen Simulation **nur**:

- `src/simulations/<fach>/<id>/` (Umsetzung, Rechenlogik, Vorschaubild)
- `src/content/simulations/{de,en}/<id>.md` (Lernmaterial)
- den eigenen Eintrag in `src/curriculum/<fach>.ts` (mit `community: { … }`)
- `tests/<id>.test.ts` (Tests der Rechenlogik)
- optional Bilder in `src/assets/sims/<id>/` und ihre Einträge in `docs/BILDER.md`

Änderungen am Kern (`src/sim-core/`), an der Seite, an Abhängigkeiten (`package.json`) oder an den Abläufen (`.github/`) bitte als **eigenen** Pull Request mit Begründung.

### Regeln (verbindlich, prüft zum Teil ein Test)

- **Nur rechnen und zeichnen:** Eine Simulation importiert nur aus `src/sim-core` und aus ihrem eigenen Ordner. Kein Netzwerk (`fetch` …), kein Speicher der Seite (`localStorage`, Cookies), kein `eval`, kein `innerHTML`, kein Zugriff auf die übrige Seite, keine externen Dateien. Das prüft `tests/simulations-sicherheit.test.ts`.
- **Keine externen Ressourcen** zur Laufzeit (keine CDNs, Webfonts, Analytics) – Datenschutz an Schulen.
- **Zweisprachig:** alle Texte mit `L('deutsch', 'english')`; Zahlen über `ctx.fmt` (Dezimalkomma im Deutschen, Minus als `−`).
- **Farben** nur über `ctx.theme`, damit hell und dunkel funktionieren.
- **Rechenlogik** in `model.ts` mit Tests (nachgerechnete Werte, Sonderfälle).
- **Fachlich sauber:** Formeln, Einheiten und Begriffe wie im Schulbuch; Unsicheres als Entwurf kennzeichnen.
- **Bilder** sind optional, immer mit gezeichneter Ersatzgrafik; jedes Bild mit Prompt in `docs/BILDER.md`. Keine Personen, Marken oder fremden Werke.
- Kommentare und Doku auf Deutsch, Bezeichner auf Englisch (Englisch in Kommentaren ist bei Beiträgen auch in Ordnung).
- Alle Details: [`CLAUDE.md`](CLAUDE.md) und [`docs/agenten/QUALITAETSSICHERUNG.md`](docs/agenten/QUALITAETSSICHERUNG.md).

## Lizenz deiner Beiträge

Mit einem Beitrag stellst du ihn unter die Lizenzen des Projekts: **Code unter MIT** ([LICENSE](LICENSE)), **Texte, Aufgaben und Bilder unter CC BY-SA 4.0** ([LICENSE-INHALTE.md](LICENSE-INHALTE.md)). Du bestätigst, dass du die Rechte daran hast (selbst geschrieben, selbst erzeugt oder passend lizenziert).

## Umgang miteinander

Freundlich, sachlich, hilfsbereit – siehe [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Sicherheitslücken bitte nicht öffentlich melden, sondern wie in [SECURITY.md](SECURITY.md) beschrieben.

## Lokal starten

```bash
npm install
npm run dev       # http://localhost:4321
npm run verify    # vor jedem Pull Request
```

Voraussetzung: Node.js 22.12 oder neuer.

---

## English

Scitura is an open learning platform (open source, OER) with interactive maths and physics simulations. Contributions are welcome:

- **Report mistakes or ideas** via issues or the [contact form](https://scitura.de/en/contact/).
- **Build a simulation**: follow [`docs/NEUE-SIMULATION.md`](docs/NEUE-SIMULATION.md) or the AI-assisted guide with ready-made prompts [`docs/MITMACHEN-SIMULATION.md`](docs/MITMACHEN-SIMULATION.md) (German, prompts work in English too).
- Contributed simulations are published as **community simulations** (yellow badge, your name shown): technically reviewed (tests, security check, code review), not yet reviewed for content. After a content review they become official.
- A simulation may only import from `src/sim-core` and its own folder and must not use network, storage, `eval`, `innerHTML` or the rest of the page (checked by `tests/simulations-sicherheit.test.ts`). All texts bilingual via `L('de', 'en')`.
- Run `npm run verify` before opening a pull request.
- Licences: code MIT, content CC BY-SA 4.0. By contributing you agree to license your contribution accordingly.
