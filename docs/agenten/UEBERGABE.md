# Übergabe: Simulationen mit Hintergrund-Agenten bauen

Dieses Dokument ist für eine neue Claude-Code-Sitzung, die die Arbeit an den geplanten Simulationen weiterführt (Stand 08.10.2026, 20:30 UTC). Erst ganz lesen, dann loslegen. Rückfragen an die Person nur, wenn wirklich etwas fehlt.

## 1. Ziel und Wünsche der Person

- Alle geplanten Simulationen (`planned(...)` in `src/curriculum/*.ts`, Stand Übergabe: 38 fertig, 91 offen, davon 6 angefangen in `docs/agenten/wip/`) nacheinander bauen, **so viele wie möglich**, **ohne Qualitätsverlust**: „extrem hochklassig“, gestaltet und animiert wie ein hochwertiges Lernprodukt, fachlich exakt (Gymnasium Bayern, LehrplanPLUS), DE ausführlich und EN kürzer.
- Keine Abstriche bei Prüfrunden (Screenshots), Modell oder Englisch – das hat die Person ausdrücklich so entschieden.
- Selbstständig weiterarbeiten, bis das Nutzungslimit erreicht ist; nach dem Zurücksetzen von selbst weitermachen (Routine, siehe 6.).
- Bilder: optional, immer mit gezeichneter Ersatzgrafik, jedes Bild mit Prompt in `docs/BILDER.md`. Die Person erzeugt Bilder gesammelt und lädt sie in einen Ordner `Bilder_neu/` im Repository hoch; dann zuschneiden, als WebP nach `src/assets/sims/<id>/` legen (Ablauf wie Commit d3554a6), Upload-Ordner löschen.
- Kommunikation auf Deutsch, knapp, ohne Fachjargon. Die Person ist oft unterwegs und liest am Handy.

## 2. Regeln (verbindlich)

- Git: Entwickeln, committen und pushen nur auf dem Branch, den die Sitzung vorgibt. Ist das ein neuer Branch, ihn zuerst auf den neuesten Stand von `claude/laughing-ritchie-67i4p0` bringen (`git fetch origin claude/laughing-ritchie-67i4p0 && git merge FETCH_HEAD`). Keine Pull Requests ohne Auftrag.
- Commit-Nachrichten auf Deutsch, mit den Schlusszeilen, die die Sitzung vorgibt. Keine Modellbezeichnungen in Commits oder Dateien.
- Die E-Mail-Adresse der Person nie in Code, Commits oder Anfragen verwenden.
- Vor jedem Push `npm run verify` (0 Fehler/Warnungen/Hinweise, alle Tests grün, Build ok).
- `pkill -f "<muster>"` nie in einer Befehlskette mit anderen Befehlen, deren Kommandozeile das Muster enthält (beendet sonst die eigene Shell).

## 3. Dateien

- `docs/agenten/AUFTRAG.md` – Arbeitsanweisung für jeden Agenten (Worktree-Regeln, Leseliste, Bestandteile einer Simulation, Qualitätsmaßstab, Lernmaterial, Prüfen, Bericht).
- `docs/agenten/SPICKZETTEL.md` – Kurzfassung der Kern-API, Muster, Formate (spart Einlesen).
- `docs/agenten/WARTESCHLANGE.md` – Gruppen (je 3 Simulationen), Reihenfolge, Status, Ideen je Simulation.
- `docs/agenten/wip/<Gruppe>/` – gesicherte Arbeit der unterbrochenen Gruppen (siehe 5.).
- `scripts/agenten/simshot.cjs` – Screenshots + Konsolenfehler + Überlauf: `node scripts/agenten/simshot.cjs <port> <ausgabeordner> <spec.json> [filter]`.
- `scripts/agenten/make_artifact.py`, `scripts/agenten/art4.cjs` – Vorschau-Artefakt (siehe 7.).
- Playwright liegt unter `/opt/node22/lib/node_modules/playwright`, Chromium unter `/opt/pw-browsers/chromium` (ggf. Pfade in den Skripten anpassen).

## 4. Ablauf pro Gruppe

1. Agent im Hintergrund mit eigenem Worktree starten (Agent-Werkzeug, `isolation: "worktree"`, `run_in_background: true`). Höchstens 3 gleichzeitig, Ports 4401–4403, Arbeitsordner `<scratchpad>/agents/<Gruppe>/`. Auftrag: „Lies `docs/agenten/AUFTRAG.md` …“ plus Port, Arbeitsordner, Fach, die drei IDs mit Titel/Jahrgangsstufe aus dem Lehrplan und die Ideen aus der Warteschlange, passende Vorbilder. (Vorlage: siehe Anhang.)
2. Vor dem Start einmalig `.git/info/attributes` mit `docs/BILDER.md merge=union` anlegen (verhindert Konflikte in der Bilderliste).
3. Nach dem Bericht: 2–4 Screenshots ansehen (zu Bögen zusammensetzen spart Kontext), auf Fehler achten (überlappende Beschriftungen, Zustand Bild ↔ Regler widersprüchlich, Dunkelmodus, Handy). Kleine Fehler selbst im Worktree beheben und dort committen; Größeres per Nachricht an den Agenten zurückgeben.
4. Im Haupt-Checkout `git merge --no-ff --no-edit <worktree-branch>` (Konflikte im Lehrplan: jede Gruppe ersetzt nur ihre eigenen `planned`-Zeilen → beide Seiten übernehmen), `npm run verify`, push, `git worktree remove --force <pfad>`, `git branch -D <branch>`, Warteschlange aktualisieren, nächste Gruppe starten.
5. Unterbricht das Nutzungslimit einen Agenten, ihn nach dem Zurücksetzen per SendMessage (an seine Agent-ID) fortsetzen: Stand im Worktree nennen, „mach dort weiter, committe jede fertige Simulation sofort“. Hatte er noch keinen Worktree mit Änderungen, neu starten.

Bisher fielen bei der Durchsicht u. a. auf: Schaltersymbol zeigte „offen“ bei geschlossenem Stromkreis; Winkelbeschriftung vom Kraftpfeil verdeckt. Solche Dinge immer prüfen.

## 5. Angefangene Gruppen wieder aufnehmen (zuerst erledigen)

In `docs/agenten/wip/` liegt die Arbeit der drei Gruppen, die beim Wechsel liefen. `0001-…patch` usw. sind fertige Commits, `9999-unfertig.patch` ist der nicht committete Rest.

Für jede Gruppe (M06, P04, M03) einen Agenten mit Worktree starten und ihm auftragen, **zuerst** die Patches einzuspielen:
```
git am <repo>/docs/agenten/wip/<Gruppe>/0*.patch      # falls vorhanden
git apply <repo>/docs/agenten/wip/<Gruppe>/9999-unfertig.patch
```
(Patches aus dem Haupt-Checkout lesen, Pfad absolut angeben.) Danach den angefangenen Teil prüfen, fertigstellen und committen, dann die restlichen Simulationen der Gruppe bauen. Fertige Simulationen trotzdem kurz per Screenshot gegenprüfen lassen.

- **M06** (koordinaten-lage ✔, winkel-messen ✔, umfang-flaeche begonnen): Testgruppe für den Spickzettel. Leseliste: `CLAUDE.md`, `docs/agenten/SPICKZETTEL.md`, Vorbilder `mathematik/lgs-grafisch` und `mathematik/zahlengerade` vollständig, weitere nur gezielt mit grep. Am Ende die Rückmeldung zum Spickzettel erbitten. Danach die Qualität mit den bisherigen Gruppen vergleichen: Hält sie mit, bekommen alle weiteren Gruppen diese verkürzte Leseliste (spart viel Kontingent); sonst die volle Leseliste aus `AUFTRAG.md`.
- **P04** (licht-schatten ✔, reflexion halb, linsen offen): Vorbild Optik `physik/brechung`.
- **M03** (brueche-vergleichen fast fertig, Lehrplaneintrag fehlte noch; dezimalbrueche, brueche-rechnen offen): Vorbilder `mathematik/bruchteile`, `zahlengerade`, `primfaktoren`.

Nach dem Zusammenführen einer Gruppe ihren Ordner in `docs/agenten/wip/` löschen und mitcommitten.

## 6. Sicherheitsnetz gegen das Nutzungslimit

- Die alte stündliche Routine `trig_0182DZL5mq2p1jdrQxyWB7Tf` (gehört zur alten Sitzung) ist deaktiviert; **löschen** (`delete_trigger`).
- In der neuen Sitzung eine eigene Routine anlegen, die in diese Sitzung feuert (z. B. stündlich, Minute 57). Inhalt: „Laufen Agenten, nichts tun. Sonst: fertige Worktrees prüfen, mergen, pushen, unterbrochene Agenten fortsetzen bzw. nächste Gruppen starten (max. 3), wie in `docs/agenten/UEBERGABE.md` beschrieben. Sind alle Gruppen fertig, Routine löschen und der Person eine Zusammenfassung samt Bilderliste geben.“
- Erfahrung: pro 5-Stunden-Fenster schaffen die Agenten etwa 3–4 Simulationen (je Gruppe ca. 650 000–700 000 Agenten-Token).

## 7. Vorschau für die Person

Private Vorschau-Seite: https://claude.ai/artifact/1KXjcofFJftkxuighSKLYm (Version 5, Stand mit Bildern). Aktualisieren nach größeren Fortschritten:
1. `BASE_PATH=/__B__ npx astro build --outDir <sp>/dist-art`
2. `python3 scripts/agenten/make_artifact.py <sp>/dist-art <sp>/vorschau`
3. In `<sp>/vorschau`: `mv _astro assets` und in allen `.html/.js/.css` `_astro/` → `assets/` ersetzen.
4. Testen: `python3 -m http.server 4400` in `<sp>/vorschau`, `node scripts/agenten/art4.cjs <seiten…>` (prüft Zeichenfläche und Fehler).
5. Artifact: erst `read` bzw. `list` mit `scope: "files"` auf die URL, dann `publish` mit `url`, `root: <sp>/vorschau`, `file_path: <sp>/vorschau/start.html`, `files: [{path}, …]` (alle Dateien außer `start.html`, max. 255 pro Aufruf).

## 8. Bekannte Eigenheiten

- `registry.ts` findet Simulationen automatisch; eigene Vorschaubilder als `thumb.svg` im Simulationsordner (nur `currentColor`).
- Neuer Kern-Parametertyp `text` (Termeingabe), 3D-Baustein `src/sim-core/view3d.ts`.
- Nach Unterbrechungen kann eine veraltete `.astro/dev.json` im Worktree den Dev-Server blockieren → löschen.
- `node_modules` im Worktree: `cp -al /home/user/Simulations/node_modules node_modules` (Hardlinks).

## Anhang: Vorlage für den Agenten-Auftrag

```
Gruppe <G>: Baue drei neue <Fach>-Simulationen für die Lernseite „MINT-Simulationen“ (Gymnasium Bayern).

Deine vollständige Arbeitsanweisung steht in docs/agenten/AUFTRAG.md (im Repository) – lies sie zuerst ganz und halte dich genau daran. Zusätzlich hilfreich: docs/agenten/SPICKZETTEL.md. Passende Vorbilder: <…>.

Qualitätsmaßstab: „extrem hochklassig“, mindestens so gut wie die besten vorhandenen Simulationen; gründliche Screenshot-Prüfung in mehreren Runden (Desktop hell/dunkel, Handy 390 px, Zustände nach Aktionen, Extremwerte). Lernmaterial DE ausführlich, EN kürzer. Das Nutzungslimit kann dich unterbrechen; committe jede fertige Simulation sofort.

Deine Daten:
- PORT: <4401|4402|4403>
- DEIN_ORDNER: <scratchpad>/agents/<G>
- Fach: <mathematik|physik> (src/curriculum/<fach>.ts)

Simulationen (in dieser Reihenfolge, jede sofort nach Fertigstellung committen):
1. `<id>` – „<Titel>“ (Jgst. <…>). Ideen: <aus WARTESCHLANGE.md, ausformuliert>
2. …
3. …

Die IDs stehen bereits als planned(...) im Lehrplan; grades unverändert lassen. Bilder nur, wo sie wirklich etwas bringen, immer mit Ersatzgrafik und Eintrag in docs/BILDER.md.

Am Ende: Abschlussbericht wie in Abschnitt 7 des Auftrags.
```
