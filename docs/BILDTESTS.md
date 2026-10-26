# Automatische Bildtests

Schützt vor ungewollten Änderungen im Aussehen (`docs/FAHRPLAN.md`, Punkt 1.6).

## Was geprüft wird

- Von jeder Simulation gibt es zwei **Referenzbilder** in `tests/bildtests/referenz/`: `<id>-hell.png` und `<id>-dunkel.png`.
- **Was ein Bild zeigt:**
  - Fotografiert wird die **Zeichenfläche** (Bühne) in der **Startansicht**.
  - Die Seite ist deutsch, das Fenster 1280 × 900 Pixel groß, mit Pixeldichte 1.
  - Regler, Texte und die übrige Seite gehören nicht dazu. So schlagen Änderungen am Seiten-Design nicht an.
- **Damit jeder Lauf dasselbe Bild liefert:**
  - Die Seite läuft mit „reduzierter Bewegung“, deshalb stehen Dauer-Animationen still.
  - Die Uhr der Seite ist angehalten und wird nur in festen Schritten vorgestellt.
  - Der Zufall (`Math.random`) liefert immer dieselbe Folge.
- **Wann geprüft wird:** Bei **jedem Push** vergleicht GitHub Actions („Bildtests“, `.github/workflows/bildtests.yml`) neue Fotos mit den Referenzbildern.
  - Die Bildtests sind ein eigener Prüfschritt neben „Prüfen“ und dauern etwa 3 Minuten (davon 1 Minute Build).
  - `npm run verify` bleibt davon unberührt.
- **Kleine Abweichungen sind erlaubt** (`scripts/bildtests/vergleich.mjs`):
  - Ein Pixel zählt erst als verschieden, wenn ein Farbkanal um mehr als 32 (von 255) abweicht.
  - Ein Bild gilt als gleich, wenn höchstens 0,01 % seiner Pixel verschieden sind, bei üblicher Größe etwa 40–50 Pixel.
  - Zum Vergleich: Eine geänderte Schriftfarbe in einem kleinen Etikett macht schon 70–150 Pixel aus und wird gemeldet.

## Wenn die Bildtests rot sind

1. In GitHub die Aktion „Bildtests“ öffnen. Die **Zusammenfassung** listet jedes abweichende Bild mit der Zahl der verschiedenen Pixel.
2. Das Artefakt **„bildtests-ergebnis“** herunterladen. Es enthält:
   - `neu/`: wie die Zeichenfläche jetzt aussieht.
   - `unterschied/`: das Referenzbild blass, Abweichungen **rot**.
3. Entscheiden, ob die Änderung gewollt ist:
   - **Ungewollt:** den Fehler beheben und erneut pushen.
   - **Gewollt** (neues Aussehen, neue Simulation, Farbkorrektur): Referenzbilder erneuern, siehe unten.

Auch „Referenzbild fehlt“ (neue Simulation) und Fehler auf der Seite (`pageerror`) machen die Bildtests rot.

## Referenzbilder bewusst erneuern

Die Referenzbilder entstehen **immer in GitHub Actions**: Dort laufen der Browser und die Schriften in einem festen Container. Auf anderen Rechnern sehen Schriften anders aus, deshalb taugen dort erzeugte Bilder nicht als Referenz.

**Weg 1 – über die Commit-Nachricht** (geht auf jedem Zweig):

1. Die gewollte Änderung committen und in die Commit-Nachricht `[bilder erneuern]` schreiben, z. B. `Neue Farben für Etiketten [bilder erneuern]`.
2. Pushen. Die Aktion „Bildtests“ erzeugt dann alle Referenzbilder neu und committet die geänderten als „Referenzbilder erneuert“ auf denselben Zweig.
3. Danach `git pull`, damit der neue Commit auch lokal da ist.

**Weg 2 – per Knopf:**

1. In GitHub unter **Actions → Bildtests → Run workflow** den Arbeitszweig wählen.
2. Den Haken „Referenzbilder neu erzeugen“ setzen und starten.

Der Knopf erscheint erst, wenn die Aktion auf `main` liegt. Bitte nicht auf `main` selbst erneuern, sondern auf dem Arbeitszweig vor dem Pull Request.

**Danach prüfen:**

- Im Pull Request zeigt GitHub unter „Files changed“ jedes geänderte Referenzbild als Vorher/Nachher („2-up“, „Swipe“, „Onion Skin“).
- Prüfen, dass sich **nur das Gewollte** geändert hat.
- Unveränderte Bilder werden nicht neu committet.

**Hinweise:**

- Nach einem Commit der Aktion laufen die Prüfungen nicht von selbst: „Prüfen“ im Pull Request wartet auf Freigabe („action_required“), die Bildtests starten gar nicht. Das ist eine Regel von GitHub. Mit dem nächsten eigenen Push laufen wieder alle Prüfungen; ist nichts mehr zu ändern, die wartende Prüfung in GitHub freigeben (Knopf „Approve and run“).
- Wird eine Simulation gelöscht, entfernt das Erneuern ihre Referenzbilder.
- Bei einem Wechsel der Container-Version (Zeile `image:` im Workflow, dazu `playwright@…`) alle Referenzbilder erneuern.

## Lokal ausprobieren

```sh
npm install --no-save playwright@1.64.1 && npx playwright install chromium
npm run build
npm run bildtests               # alle vergleichen
npm run bildtests -- ohm stamm  # nur Simulationen, deren ID das enthält
npm run bildtests -- --erneuern # Referenzbilder lokal überschreiben (nicht committen!)
```

**Lokale Ergebnisse:**

- Ergebnisse landen in `bildtests-ergebnis/`; der Ordner ist von Git ausgenommen.
- Ohne den Container weichen die Schriften ab. Lokal sind die Bildtests deshalb nur für Vorher/Nachher auf demselben Rechner sinnvoll:
  1. Auf dem alten Stand mit `--erneuern` Bilder erzeugen.
  2. Dann ändern und vergleichen.
  3. Danach die Referenzbilder mit `git checkout tests/bildtests/referenz` zurückholen.

**Genau wie in GitHub, mit Docker:**

```sh
docker run --rm -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.64.1-noble \
  bash -c "npm ci && npm install --no-save playwright@1.64.1 && npm run build && npm run bildtests"
```

## Was die Bildtests nicht prüfen

- Beispiele, Bedienung (Ziehen, Tastatur) sowie Handy- und Beamergrößen
- Regler, Messwerte und Texte neben der Zeichenfläche

Dafür gibt es die Rechentests in `tests/` und den Prüfbogen (`scripts/agenten/pruefbogen.cjs`).
