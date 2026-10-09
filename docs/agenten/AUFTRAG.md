# Auftrag: neue Simulationen für „MINT-Simulationen“

Du baust eine kleine Gruppe neuer interaktiver Simulationen für eine kostenlose, zweisprachige (DE zuerst, EN) Lernseite für Schulen (Astro + TypeScript, Canvas). Es gibt schon über 40 fertige Simulationen; deine müssen **mindestens genauso gut** sein. Maßstab: „extrem hochklassig“, also gestaltet und animiert wie ein hochwertiges Lernprodukt, nicht wie eine Programmierübung. Fachlich exakt, didaktisch klug und schön.

## 0. Arbeitsumgebung (wichtig)

- Du arbeitest in einem **eigenen git-Worktree** (dein aktuelles Verzeichnis, prüfe mit `pwd` und `git rev-parse --abbrev-ref HEAD`). Alle Änderungen nur dort.
- Das Haupt-Checkout `/home/user/Simulations` darfst du **nur lesen**, niemals darin schreiben oder git-Befehle ausführen, die etwas verändern.
- **Niemals** pushen, Branch wechseln, rebasen, `reset --hard` oder Commits anderer verändern. Keine Pull Requests.
- Abhängigkeiten: `[ -e node_modules ] || cp -al /home/user/Simulations/node_modules node_modules` (Hardlinks, schnell). Falls das scheitert: `npm ci --prefer-offline`.
- Entwicklungsserver auf **deinem Port** (steht in deinem Auftrag), im Worktree: `npx astro dev --port <PORT> --background` (Astro 7; Status `npx astro dev status`, Protokoll `npx astro dev logs`). Am Ende `npx astro dev stop`. Startet er nach einem Container-Neustart nicht, die veraltete `.astro/dev.json` im Worktree löschen. Keine Prozesse anderer beenden, nie `pkill`/`killall` benutzen.
- Das Bash-Werkzeug lehnt im Worktree manche Befehle ab (Shell-Variablen, `printf`, mit `&&` verkettete git-Aufrufe). Dateien mit dem Write-Werkzeug schreiben, git-Befehle einzeln ausführen.
- `<DEIN_ORDNER>` ist dein Arbeitsordner für Screenshots und Logs (steht in deinem Auftrag), nicht im Repository.
- Benutze nie die E-Mail-Adresse oder Daten der Person in Code, Commits oder Anfragen.

## 1. Zuerst lesen (gründlich, bevor du schreibst)

Verkürzte Leseliste (seit Gruppe M06 erprobt, Qualität gleich gut):
- `CLAUDE.md` und `docs/agenten/SPICKZETTEL.md` (Kern-API, Muster, Formate, Stolperfallen – verbindlich)
- Die **Vorbilder, die dein Auftrag nennt**, vollständig (`index.ts`, `model.ts`, Lernmaterial DE), dazu `src/simulations/mathematik/umfang-flaeche/` als Beispiel für Karten/Infokästen.
- Lehrplan: `src/curriculum/<fach>.ts` (fertige Einträge als Vorlage), gültige KMK-IDs per `grep` in `src/curriculum/kmk.ts`.
- `docs/BILDER.md` nur, wenn du Bilder vorsiehst (Format der Tabelle und der Abschnitte).
- Alles Weitere (Kern in `src/sim-core/`, `docs/ARCHITEKTUR.md`, Tests) nur **gezielt** mit `grep -n` nachsehen, nicht ganze Dateien lesen.

Weitere gute Vorbilder je nach Thema: `physik/fadenpendel` (Uhr, Diagramm, Energiebalken), `physik/schiefer-wurf` (Ziehen am Pfeil, Bilder mit Ersatzgrafik, Stroboskop), `mathematik/ober-untersummen` (Plot, Griffe, Tween), `mathematik/bruchteile` (TapTarget, Bilder), `mathematik/galtonbrett`/`ziegenproblem` (Zufall, Statistik).

## 1a. Vorhandene Bausteine

- **3D:** `src/sim-core/view3d.ts` (`View3D`, `mesh3d`, `foldNet`, `vec3`, `shade`, `mixColor`, `Camera3D`, …), Beschreibung in `docs/ARCHITEKTUR.md` („3D-Ansichten“), Vorbilder `mathematik/koerpernetze`, `mathematik/quader-volumen`, `mathematik/prisma-zylinder`. Für alles Räumliche diesen Baustein benutzen, nicht neu erfinden.
- **Freie Texteingabe:** Parametertyp `text` (z. B. für Terme), sicherer Term-Parser ohne `eval` als Vorbild in `mathematik/termbaum/model.ts`.
- Neuere Vorbilder mit hoher Qualität: `mathematik/termbaum`, `mathematik/waagemodell`, `mathematik/lgs-grafisch`, `mathematik/primfaktoren`, `physik/hebelgesetz`, `physik/einfacher-stromkreis`, `physik/bewegungsdiagramme` (mehrere synchronisierte Diagramme, Zeitmarke), `physik/freier-fall` (mehrere Modi, Reaktionstest), `physik/hookesches-gesetz` (Messreihe, TapTargets).

## 2. Was zu einer fertigen Simulation gehört

Für jede Simulation `<id>` (die ID steht bereits als `planned('<id>', …)` im Lehrplan):

1. `src/simulations/<fach>/<id>/model.ts`: reine Rechenlogik ohne Zeichnen, gut kommentiert (Deutsch), Bezeichner Englisch.
2. `src/simulations/<fach>/<id>/index.ts`: `defineSimulation({...})`, `id` = Ordnername. Die Registry findet den Ordner automatisch.
3. `src/simulations/<fach>/<id>/thumb.svg`: eigenes Vorschaubild für die Karte. Format: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">…</svg>`, **nur** `currentColor` (Abstufung über `fill-opacity`/`stroke-opacity`), keine Texte, keine festen Farben, kein Gitter (das zeichnet die Karte selbst). Stil wie die vorhandenen in `src/components/SimThumb.astro`: kräftige Linien 3–5 px, runde Enden, ein klares Motiv.
4. `tests/<id>.test.ts`: Tests der Rechenlogik (fachlich prüfende Werte, Grenzfälle). **Eigene Datei pro Simulation**, keine bestehenden Testdateien ändern.
5. `src/content/simulations/de/<id>.md`: Lernmaterial (siehe 4.), `src/content/simulations/en/<id>.md`: kürzere englische Fassung.
6. Lehrplan `src/curriculum/<fach>.ts`: **genau** die Zeile `planned('<id>', …)` an derselben Stelle durch einen vollständigen `ready`-Eintrag ersetzen (`id`, `status: 'ready'`, `slug: L('de-slug', 'en-slug')` eindeutig, `title` wie bisher oder besser, `summary` 1–2 Sätze DE/EN, `grades` **unverändert**, `kmk` (vorhandene behalten, passende ergänzen), `keywords` DE/EN, `thumb: 'generic'`). Andere Einträge nicht anfassen.
7. Optional Bilder (siehe 5.).

**Nicht ändern:** `README.md`, `src/simulations/registry.ts`, `src/components/SimThumb.astro`, `src/curriculum/types.ts`, Bayern-Lehrplan, bestehende Simulationen und Tests. Änderungen am Kern `src/sim-core/` nur, wenn es wirklich nicht anders geht. Dann **rein ergänzend** (keine bestehende Signatur ändern), mit Test, und im Bericht erwähnen.

## 3. Qualitätsmaßstab für die Simulation

- **Ein starkes Bild**: Jede Simulation hat eine klare, schöne Hauptansicht mit durchdachter Komposition, sauberer Typografie (Beschriftungen über `text()`/`plot.text`), weichen Schatten, Verläufen und Tiefe wo passend (siehe Vorbilder). Keine überlappenden oder abgeschnittenen Beschriftungen, keine leeren Flächen, keine winzigen Elemente.
- **Animation mit Sinn**: Übergänge mit `Tween`/`ease` (z. B. beim Umschalten, Zerlegen, Verdoppeln), zeitabhängige Vorgänge mit `animated: true` und der Uhr (`ctx.clock`, `tick(dt)`), physikalische Vorgänge mit `FixedStepper`/`rk4` wo nötig. `prefersReducedMotion` respektieren (siehe Vorbilder).
- **Direkte Interaktion**: Ziehbare Punkte/Griffe (`plot.addHandle`, `enabled: () => !ctx.locked`), antippbare Objekte (`TapTarget`), Aktionen (`actions`) für Vorgänge wie „Starten“, „Würfeln“, „Zerlegen“. `dragHint: true`, wenn man ziehen kann.
- **Regler** (`params`) mit kurzen, stabilen Schlüsseln (nie mit `_` beginnend), sinnvollen Bereichen und Schritten. `visibleIf` für abhängige Regler. Abgeleitete Werte nur bei `source === 'input'` per `ctx.set()`.
- **Ergebnisse** (`readouts`) informativ, mit Formeln (`{ html }` mit `.frac` usw. wie in Vorbildern), Werte mit `ctx.fmt` (Dezimalkomma, `−`). Was eine Aufgabe verraten würde: `spoiler: true`.
- **Beispiele** (`presets`): 3–6 lehrreiche Voreinstellungen.
- **Layout**: `layout: { aspect, aspectNarrow }` so wählen, dass es auf dem Desktop (1360 px) **und** auf dem Handy (390 px breit) gut aussieht. Auf schmalen Bildschirmen Beschriftungen kürzen oder umstellen, Schriftgrößen nicht unter ca. 11 px.
- **Farben nur über `ctx.theme`** (`--plot-*`, `--series-*`); Hell- **und** Dunkelmodus müssen gut aussehen.
- **Fachlich exakt**: Formeln, Einheiten, Begriffe wie im deutschen Schulunterricht (Bayern, Gymnasium). Physik mit SI-Einheiten. Unsicheres im Lernmaterial nicht behaupten.
- **Leistung**: flüssig auch auf schwachen Schul-Tablets (keine unnötigen Neuberechnungen pro Frame, Pfade cachen).
- Texte immer zweisprachig mit `L('de', 'en')`.

## 4. Lernmaterial (Deutsch ausführlich, Englisch kürzer)

Frontmatter nur mit `description:` (ein Satz, **in doppelten Anführungszeichen**, sonst bricht z. B. „1 : 3 : 5“ den YAML-Parser). Abschnitte DE: **Worum geht es?** (Erklärung mit Formeln, KaTeX `$…$`, Dezimalkomma `{,}`), **Ausprobieren** (nummerierte Entdeckungsaufträge, gern mit Links `[Beispiel laden](?key=wert)`), **Aufgaben** (3–6 Aufgaben mit steigendem Anspruch, Lösungen in `<details><summary>Lösung anzeigen</summary>` … `</details>` mit Leerzeilen innen; `_hide=1` verdeckt Ergebnisse, `_lock=1` sperrt), **Hinweise für Lehrkräfte** (Einsatz, typische Fehlvorstellungen, Bezug zum Lehrplan). Ca. 60–110 Zeilen. EN: „What is it about?“, „Try it“, „Tasks“ (mit Lösungen), „Notes for teachers“ (kürzer). Alle Links dürfen nur gültige Werte setzen (ein Test prüft das).

## 5. Bilder (optional, sparsam)

Nur dort, wo ein fotorealistisches Bild die Simulation wirklich schöner oder anschaulicher macht (Hintergrundszene, reales Objekt wie Stahlkugel, Laser, Lupe, Waage, Planet …). Abstrakte Mathematik braucht meist **keine** Bilder.

- In `images: { key: 'datei.webp' }` deklarieren, mit `ctx.images.get(key)` holen; **immer** eine gezeichnete Ersatzgrafik, wenn `null` (die Bilder existieren noch nicht! Die Person generiert sie später). Die Ersatzgrafik muss alleine hochwertig aussehen.
- Dateinamen: Kleinbuchstaben, Ziffern, Bindestriche, `.webp`.
- In `docs/BILDER.md` eintragen: eine Zeile **ans Ende der Tabelle „Übersicht“** im vorhandenen Format, und einen Abschnitt `## <Titel>` mit `### \`datei.webp\` – …` **ans Ende der Datei** im vorhandenen Format (Größe in px, Hintergrund deckend/transparent, wie das Motiv liegen muss, Prompt auf Englisch). Prompts: keine Texte, Logos, Marken, keine Personen; Bildausschnitt so genau beschreiben, dass die Simulation das Bild exakt platzieren kann (z. B. „the object fills the entire square image edge to edge“).

## 6. Prüfen (Pflicht, gründlich)

1. `npx vitest run`: alles grün.
2. `npx astro check`: 0 errors, 0 warnings, 0 hints.
3. `npx astro build`: muss durchlaufen. Die Seiten-URL deiner Simulation findest du z. B. mit `find dist -path "*<de-slug>*" -name index.html`.
4. **Screenshots** mit `node scripts/agenten/simshot.cjs <PORT> <DEIN_ORDNER>/shots <DEIN_ORDNER>/spec.json`. Die Spec-Datei ist ein JSON-Array von `["name", "/de/<fach>/<bereich>/<slug>/?key=wert", breite, "light"|"dark", [schritte]]`, Schritte: `["action","id"]`, `["play"]`, `["wait",ms]`, `["click",x,y]`, `["drag",x1,y1,x2,y2]` (Koordinaten relativ zur Zeichenfläche), `["set","key",wert]` (Regler/Schalter/Auswahl wie von Hand bedienen – so lassen sich auch Übergänge prüfen), `["text","Beschriftung"]` (Element mit genau diesem Text anklicken, z. B. ein Beispiel), `["sel","css"]`. Das Skript meldet Fehler in der Konsole und horizontalen Überlauf.
   - Pro Simulation mindestens: Desktop hell (1360), Desktop dunkel, **Tablet (1024 und 700)**, Handy (390), dazu Zustände nach Aktionen/Animation und Extremwerte der Regler. Tablet-Breiten sind heikel (siehe Spickzettel, Abschnitt 7).
   - **Sieh dir jeden Screenshot an** (Read-Tool) und verbessere alles, was nicht hervorragend aussieht. Mehrere Runden sind normal.
5. Lernmaterial-Seite im Screenshot oder im HTML kurz prüfen (Formeln gerendert, Links funktionieren).

## 7. Abschließen

- Das Nutzungslimit kann dich jederzeit unterbrechen (du wirst später fortgesetzt). Deshalb: pro fertiger Simulation **sofort committen** (nur deine Dateien `git add <pfade>`), Nachricht auf Deutsch, z. B. `Neue Simulation: Freier Fall`, mit Leerzeile und genau diesen Schlusszeilen:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_019nyYJcM6dv7breR6K6SSe8
  ```
- Nicht pushen. Dev-Server beenden.
- **Bericht** (deine letzte Nachricht, knapp und vollständig):
  - Branch-Name und Commit-Hashes (`git log --oneline -5`), Worktree-Pfad
  - pro Simulation: ID, URL-Pfad, was sie zeigt/kann (2–4 Zeilen), Regler-Schlüssel, Aktionen
  - Bilder pro Simulation: Datei, Größe, Hintergrund, Prompt (wörtlich)
  - Kern-Änderungen (falls doch nötig), offene Punkte/Bedenken
  - Pfade der 2 aussagekräftigsten Screenshots pro Simulation
  - Ergebnis von vitest/astro check/build
