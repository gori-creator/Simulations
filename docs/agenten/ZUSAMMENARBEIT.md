# Zusammenarbeit (ab 18.10.2026)

Zwei Personen arbeiten mit je eigenem Claude Code am Projekt.

## Wer macht was

| Bereich | Wer | Arbeitszweig |
| --- | --- | --- |
| **Physik** (Gruppen `P…` in `WARTESCHLANGE.md`, `src/curriculum/physik.ts`, `src/simulations/physik/`) | Projektinhaber | `claude/sleepy-goodall-ddchwy` |
| **Mathematik** (Gruppen `M…`, `src/curriculum/mathematik.ts`, `src/simulations/mathematik/`) | Kollege | eigener Zweig, z. B. `claude/…` oder `mathe/<gruppe>` |

### Mathematik aufgeteilt auf zwei Sitzungen (ab 18.10.2026)

Die restlichen Mathe-Gruppen bauen zwei Claude-Sitzungen parallel, jede auf ihrem eigenen Zweig, jede mit eigenen Pull Requests nach `main`:

| Teil | Gruppen (in dieser Reihenfolge) | Zweig |
| --- | --- | --- |
| **Mathe Teil 1** | M16 (boxplot), M25, M17, M02, M13, M08, M18, M26 | `claude/jolly-allen-y0ef9g` |
| **Mathe Teil 2** | M09, M14, M04, M10, M15, M19, M20, M21, M22 | eigener Zweig, z. B. `mathe/teil-2` |

Wer eine Gruppe beginnt, trägt in `WARTESCHLANGE.md` „läuft (Mathe 1)“ bzw. „läuft (Mathe 2)“ ein. Wer mit seinem Teil fertig ist, nimmt sich offene Gruppen vom Ende des anderen Teils und trägt das vorher ein.

Ausnahme: `diagramme` (Gruppe M16) war beim Wechsel schon in Arbeit und ist auf dem Physik-Zweig fertiggestellt (18.10.).

## Zweige

- **`main`** ist der geprüfte gemeinsame Stand. Niemand arbeitet direkt darauf.
- Jeder arbeitet auf seinem eigenen Zweig, der von `main` abzweigt, und holt sich regelmäßig den neuesten Stand (`git fetch origin main && git merge origin/main`).
- Fertige Arbeit kommt per **Pull Request nach `main`**. Vor dem Pull Request: `npm run verify` grün (0 Fehler/Warnungen/Hinweise, alle Tests, Build).

## Gemeinsam genutzte Dateien (Konfliktgefahr)

Diese Dateien ändern beide – dort nur kleine, gezielte Änderungen und vor dem Pull Request `main` einmischen:

- `docs/agenten/WARTESCHLANGE.md` – beim Start einer Gruppe dort „läuft (Mathe)“ bzw. „läuft (Physik)“ eintragen, damit nichts doppelt gebaut wird.
- `docs/BILDER.md` – nur Zeilen anhängen (Zusammenführen mit `merge=union`, siehe `.gitattributes`).
- `src/sim-core/` (gemeinsamer Kern) – Änderungen nur, wenn nötig, klein halten und im Pull Request erwähnen.
- `src/i18n/ui.ts`, `src/lib/routes.ts`, `tests/` (gemeinsame Tests) – möglichst nicht ändern.

## Arbeitsweise (für beide Claude-Sitzungen)

- Vor dem Start lesen: `CLAUDE.md`, `docs/agenten/AUFTRAG.md`, `docs/agenten/SPICKZETTEL.md`, diese Datei.
- Eine Simulation nach der anderen; danach `npm run verify`, committen, pushen auf den eigenen Zweig, kurz berichten.
- Qualitätsmaßstab und „Schöne Animationen“: `AUFTRAG.md`, Abschnitt 3. Ton im Lernmaterial („Ideen für den Unterricht“): Anregung, nie belehrend.
- Bilder: `docs/BILDER.md`, Wunschliste `docs/BILDER-WUNSCHLISTE.md`; neue Bilder werden in `incoming/` hochgeladen.
