# Auftrag: kleine Simulationen ausbauen (für jeden Account)

Stand 25.11.2026. Diesen Text kann jede Claude- oder Codex-Sitzung mit Zugriff auf `gori-creator/Simulations` bekommen. Mehrere Accounts arbeiten **gleichzeitig**; die Abstimmung läuft nur über Git. Die **Leitung** (Manager-Sitzung) prüft und mergt.

## 1. Worum es geht

Im November entstanden 50 kleine Simulationen, die Lehrplan-Lücken schließen, aber zu dünn sind (meist unter 1000 Zeilen, oft nur eine Ansicht). Sie liegen **nicht** in `main`, sondern je auf einem Zweig `physik/<id>` bzw. `mathe/<id>` (gestapelt: ein Zweig enthält auch die vorherigen). Liste, Reihenfolge und Maßstab: **`docs/AUSBAU-PRIORITAETEN.md`**. Stand der Arbeit: **`docs/agenten/AUSBAU-BRETT.md`**.

## 2. Eine Aufgabe nehmen (verbindlich, damit nichts doppelt gebaut wird)

1. `git fetch origin` und in `docs/agenten/AUSBAU-BRETT.md` (Stand von `origin/main`) die **erste Zeile mit Status „offen“** in deinem Fach wählen. Was du nicht wählen darfst, steht dort mit „läuft“ oder „PR“.
2. **Prüfen, ob schon jemand dran ist:** Gibt es den Zweig `ausbau/<id>` schon (`git ls-remote --heads origin ausbau/<id>`)? Dann ist die Aufgabe vergeben → nächste nehmen.
3. **Sofort reservieren:** Zweig `ausbau/<id>` von `origin/main` anlegen und **gleich pushen** (`git push -u origin ausbau/<id>`), bevor du baust. Der Zweig ist die Reservierung. Die Leitung trägt ihn ins Brett ein.
4. Höchstens **eine** Aufgabe gleichzeitig pro Sitzung.

## 3. Bauen

- Pflichtlektüre: `CLAUDE.md`, `docs/agenten/AUFTRAG.md` (Abschnitt 0 und 3), `docs/agenten/SPICKZETTEL.md`, `docs/agenten/QUALITAETSSICHERUNG.md`, `docs/AUSBAU-PRIORITAETEN.md` (Abschnitt „Was ausgebaut heißt“).
- **Die kleine Fassung übernehmen:** nur die Dateien dieser einen Simulation vom Zweig `physik/<id>` bzw. `mathe/<id>` holen (`git checkout origin/physik/<id> -- <pfad>`):
  - `src/simulations/<fach>/<id>/`
  - `src/content/simulations/{de,en}/<id>.md`
  - `tests/<id>.test.ts`
  - den Eintrag in `src/curriculum/<fach>.ts` und die Zuordnungen in `src/curriculum/lehrplaene/*.ts` **von Hand** übertragen (nicht die ganzen Dateien übernehmen, sonst kommen die anderen kleinen Simulationen mit)
  - ggf. Ausnahmen in `tests/curriculum.test.ts` (`NOT_IN_CURRICULUM`)
- **Ausbauen** nach `AUSBAU-PRIORITAETEN.md`: 5–7 Ansichten, eine Übung mit Aufgaben, „Prüfen“, „Nächste Aufgabe“ und Punktestand, Alltagsanwendungen, Animation (bei reduzierter Bewegung fester Zustand), 10–20 Beispiele, Lernmaterial DE (60–110 Zeilen) und EN, Tests mit nachgerechneten Lehrbuchwerten. Richtwert 1500–2000 Zeilen in `index.ts` + `model.ts`, lieber mehr Inhalt als mehr Zeilen. Vorbilder: `mathematik/potenzgesetze`, `mathematik/kegelschnitte`, `mathematik/richtungsfeld`, `physik/zeitdilatation`, `physik/dichte-auftrieb`.
- Selbstprüfung nach `QUALITAETSSICHERUNG.md` 4.2/4.3: Screenshot-Bögen Desktop hell/dunkel, Tablet 1024 und 700, Handy 390 hell/dunkel, Aktionen, Extremwerte. Beschriftungen dürfen sich nicht überlappen; gerundete Werte im Bild müssen nachrechenbar bleiben.
- `npm run lehrplan:luecken` und `npm run verify` grün (0 Fehler, 0 Warnungen, alle Tests inkl. `tests/simulations-sicherheit.test.ts`, Build).

## 4. Abgeben

1. `origin/main` einmischen, `npm run lehrplan:luecken` neu, `npm run verify` grün.
2. Committen; der **letzte gepushte Commit** muss `[bilder erneuern]` in der Nachricht haben (neue Simulation braucht Referenzbilder, `docs/BILDTESTS.md`).
3. Pushen und einen **Pull Request nach `main`** öffnen, Titel `Ausbau: <Name>`. Inhalt: was die Simulation zeigt, Zeilenzahl, Prüfwerte (mit Rechnung), Lehrplan-Zuordnungen und neue Lückenzahl, Screenshots, ehrliche Restpunkte.
4. **Nicht selbst mergen.** Die Leitung prüft (Screenshots, mindestens drei Werte nachrechnen), gibt Rückmeldung im Pull Request und mergt.
5. Danach die nächste offene Aufgabe nehmen (Abschnitt 2).

## 5. Regeln

- Nur die Dateien der eigenen Simulation ändern. Gemeinsame Dateien (`src/sim-core/`, `src/i18n/ui.ts`, `tests/curriculum.test.ts`, `docs/BILDER.md`, Länder-Lehrpläne) nur klein und gezielt. `docs/LEHRPLAN-LUECKEN.md` nie von Hand, immer neu erzeugen.
- `docs/agenten/AUSBAU-BRETT.md` pflegt **nur die Leitung** (sonst Konflikte).
- Texte zweisprachig `L('de', 'en')`, Farben über `ctx.theme`, keine externen Ressourcen, Kommentare auf Deutsch.
- Bricht eine Sitzung ab, bleibt der Zweig `ausbau/<id>` stehen; die nächste Sitzung desselben Accounts macht dort weiter. Wird eine Aufgabe aufgegeben, im Pull Request oder per Commit-Nachricht „abgebrochen“ vermerken.
