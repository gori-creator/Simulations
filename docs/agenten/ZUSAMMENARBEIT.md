# Zusammenarbeit (ab 18.10.2026)

Zwei Personen arbeiten mit je eigenem Claude Code am Projekt.

## Wer macht was

| Bereich | Wer | Arbeitszweig |
| --- | --- | --- |
| **Physik** (Gruppen `P…` in `WARTESCHLANGE.md`, `src/curriculum/physik.ts`, `src/simulations/physik/`) | Projektinhaber | `claude/sleepy-goodall-ddchwy` |
| **Mathematik** (Gruppen `M…`, `src/curriculum/mathematik.ts`, `src/simulations/mathematik/`) | Kollege | eigener Zweig, z. B. `claude/…` oder `mathe/<gruppe>` |

Ausnahme: `diagramme` (Gruppe M16) war beim Wechsel schon in Arbeit und wird noch auf dem Physik-Zweig fertiggestellt.

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
