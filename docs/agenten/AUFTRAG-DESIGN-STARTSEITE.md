# Auftrag: Neues Design und Startseiten-Animation (Übergabe an einen Codex-Agenten)

Briefing der Projektleitung, Stand 22.10.2026. Der Auftraggeber (Nutzer) gibt dir zusätzlich eigene Hinweise und Vorbild-Bilder – die haben Vorrang vor diesem Dokument.

## 1. Projekt in Kürze

- Kostenlose, interaktive MINT-Simulationen für Schulen (Mathematik 93, Physik 36, Chemie in Vorbereitung), Repository `gori-creator/Simulations`.
- Technik: statische Astro-Seite, TypeScript, Canvas. Zweisprachig (Deutsch ist Referenz, Englisch vollständig).
- **Pflicht zuerst lesen:** `CLAUDE.md`, `docs/ARCHITEKTUR.md`, `docs/agenten/ZUSAMMENARBEIT.md`, `docs/agenten/QUALITAETSSICHERUNG.md`.
- **Harte Regeln:**
  - Keine externen Ressourcen zur Laufzeit (keine CDNs, Webfonts, Analytics) – Datenschutz an Schulen. Systemschriften; npm-Pakete nur, wenn sie mitgebaut werden und es wirklich nötig ist.
  - Keine Konten, keine gespeicherten Nutzerdaten, kein Fortschritt/keine Punkte. Erlaubt: Einstellungen im `localStorage` (Bundesland, Dunkelmodus).
  - Alle Texte zweisprachig über `src/i18n/ui.ts` bzw. `L('de','en')`; deutsche Zahlen mit Dezimalkomma, echtes Minus „−“.
  - Barrierefreiheit: echte `<button>`/`<a>`, Tastatur, Kontrast ≥ 4,5 : 1, `prefers-reduced-motion` respektieren (Animationen aus bzw. ruhig), automatisch wechselnde Inhalte pausierbar.
  - Simulationen selbst (Canvas-Darstellung in `src/simulations/`, `src/sim-core/`) **nicht** umgestalten – nur die Seiten drumherum.
  - Vor jedem Commit `npm run verify` (Typprüfung, Tests, Build) – 0 Fehler, 0 Warnungen, 0 Hinweise.
- **Arbeitsweise (ohne GitHub):** Du bekommst das Projekt als ZIP (`simulations-projekt.zip`, Stand von `main`). Entpacken, `npm ci`, `npm run dev` für die Vorschau, `npm run verify` vor jeder Abgabe. Lege direkt nach dem Entpacken ein lokales Git an (`git init && git add -A && git commit -m Ausgangsstand`), damit deine Änderungen nachvollziehbar sind.
- **Abgabe:** als ZIP mit **nur den geänderten und neuen Dateien** in ihrer Ordnerstruktur **und** zusätzlich als Patch (`git diff Ausgangsstand > design.patch`, neue Dateien vorher mit `git add -N .` erfassen), dazu eine kurze Liste, was du geändert hast, und Screenshots. Die Projektleitung prüft und bringt es ins Repository.

## 2. Wo wir stehen: der Entwurf

Der abgestimmte Entwurf liegt in `docs/design/entwurf-startseite/` (Dateien aus einem Design-Werkzeug: je Datei eine Seite als HTML mit Inline-Styles und einem kleinen Logik-Block `class Component` am Ende – lies sie als Referenz für Aufbau, Farben, Abstände, Texte und Rechenlogik; sie laufen nicht eigenständig).

| Datei | Inhalt |
|---|---|
| `Main.dc.html` | **Startseite PC, aktuellster Stand** (illustrierte Szene oben, Fächer-Karten, „Probier's direkt aus“, Kartenliste) |
| `ScrollDemo.dc.html` | **Scroll-Animation:** goldene Kugel fällt beim Scrollen durch die Seite (Landepunkte und Bewegungslogik im Logik-Block) |
| `Mobil.dc.html` | Startseite Handy – **noch im vorigen Stand**, muss an `Main` angeglichen werden („Mini-Version der PC-Seite“) |
| `Simulation.dc.html` | Simulationsseite (abgenommen) |
| `Beamer.dc.html` | Beamer-Modus (Idee, abgenommen als Richtung) |
| `*Dunkel.dc.html` | Dunkelmodus-Fassungen (Thema `dunkel`); die von `Main` passt noch **nicht** zum neuen Stand |

Der Nutzer kann dir den Entwurf auch als Link oder Screenshots zeigen.

### Was der Nutzer gut findet (beibehalten)

- **Aufbau wie bisher**, aber deutlich moderner und hochwertiger; seriös genug für Lehrkräfte.
- **Simulationsseite:** oben rechts Aktionen „QR-Code und Link“, „Beamer-Modus“, „Vollbild“; links die Bühne (hell, **nicht** schwarz), rechts eine aufgeräumte Karte mit Beispielen und Reglern; darunter das Lernmaterial als **Reiter nebeneinander**: Worum geht es? · Ausprobieren · Aufgaben · Für Lehrkräfte · Lehrplanbezug.
- **Schaufenster auf der Startseite:** Rotation der 8 eindrucksvollsten, bewegten Simulationen (Freier Fall, Fadenpendel, Doppler-Effekt, Interferenz, Galtonbrett, Planetenbahnen, Lorentzkraft, Fourier-Reihen) – alle 6 s automatisch, mit Vor/Zurück, Pause, Punkten.
- **Satz zum Mitrechnen**, der immer zur gezeigten Simulation passt, z. B. „Ein Ball fällt aus [− 20 m +] Höhe. Auf dem Mond ist er nach 4,97 s unten …“. Die wichtigsten Einstellungen jeder Simulation (Regler + Auswahl, z. B. Erde/Mond/Mars) sind direkt dort bedienbar; Satz und Animation reagieren sofort. Rechenlogik und Texte aller 8 Sätze: Logik-Block in `Main.dc.html` (`LIVE`).
- **Fächer** als Karten (Mathematik, Physik, Chemie „bald“).
- **Handy:** eine Mini-Version der PC-Seite, gleiche Inhalte untereinander.
- **Dunkelmodus:** einheitlich dunkel (nichts gemischt) und gut lesbar.
- **Beamer-Modus:** nur die Simulation groß, große Messwerte und Knöpfe, Schrift größer/kleiner, Esc beendet, Tastenhilfen.
- **Neueste Richtung (Vorbilder vom Nutzer, Dribbble-artig):** eine große **illustrierte Szene** oben – geschichtete Wellen wie Papierschnitt in Indigo/Violett mit warmem Gold/Orange, darin hängende/schwebende MINT-Objekte (Pendelkugel, Planet mit Ring, Stroboskop-Ball, schwebende Formel-Schilder), **weiche Wellen als Abschnittsübergänge**, Fächer-Karten mit kleinen eigenen Illustrationen.
- **Scroll-Animation:** Ein Objekt aus der Szene oben rechts (die goldene Pendelkugel) **fällt beim Runterscrollen** in den nächsten Abschnitt und landet dort, beim Weiterscrollen fällt sie wieder weiter (Physik-Karte → Bühne „Probier's aus“ → Karte „Freier Fall“). Fallbewegung beschleunigt wie im freien Fall, kleiner Hüpfer bei der Landung, rückwärts beim Hochscrollen.

### Was der Nutzer **nicht** will

- Spiel-Elemente mit Fortschritt, Sternen, Stufen, Abzeichen, Namen, Konten.
- „Wissenswelt“ als Sechseck-Karte, „Periodensystem der Simulationen“.
- **Den „KI-generierten Look“:** Leucht-Verläufe im Hintergrund, Rasterhintergrund, schwebende Glas-Kopfleiste, überall Mono-Schrift, generische Template-Optik.
- Dunkle Bühne in hellen Seiten / gemischtes Hell-Dunkel.

## 3. Dein Auftrag

**Ziel:** Die Startseite oben (Szene + Scroll-Animation) **deutlich cooler** machen – auf dem Niveau hochwertiger Agentur-/Dribbble-Seiten, aber seriös und ohne KI-Look – und danach das Design sauber in die echte Seite einbauen.

1. **Szene oben und Scroll-Animation ausarbeiten.**
   - Richtig illustrierte Szene statt einfacher Formen. Der Nutzer erzeugt dafür Bilder (Prompts siehe Abschnitt 5) – frag ihn danach oder nach weiteren Vorbildern.
   - Tiefe durch Ebenen (Parallaxe beim Scrollen), sanfte Eigenbewegung (Pendel schwingt, Planet schwebt), die fallende Kugel als roter Faden durch die Seite.
   - Leistung: nur `transform`/`opacity` animieren; bevorzugt CSS-Scroll-Animationen (`animation-timeline: scroll()/view()`) mit schlankem JS-Fallback; 60 fps auf einem Schul-Tablet; bei `prefers-reduced-motion` stehen alle Elemente ruhig an ihrem Platz.
2. **Mit dem Nutzer abstimmen** (Zwischenstände als Screenshots, hell/dunkel, PC 1360 px und Handy 390 px). Er gibt dir weitere Hinweise.
3. **Einbau in die Seite** (erst nach Freigabe):
   - Farben/Abstände/Typografie als Design-Tokens in `src/styles/global.css` (hell und dunkel, Dunkelmodus über die vorhandene Umschaltung).
   - Kopfleiste (`src/components/Header.astro`), Startseite (`src/pages/[lang]/index.astro`), Karten (`src/components/SimCard.astro`), Fach-/Bereichsseiten (`src/views/`), Simulationsseite (`src/views/SimulationView.astro`, `src/components/SimulationShell.astro`) mit Reitern und Aktionen.
   - Schaufenster mit **echten Simulationen** in vorbereiteten Einstellungen statt Zeichnungen, wo das flüssig läuft (sonst gezeichnete Animation).
   - Beamer-Modus als neue Funktion (Tasten, Esc, Schriftgröße), Texte DE/EN.
   - Vorhandene Logik nicht brechen: Bundesland-Einstellung (`src/lib/region.ts`, nur im Zahnrad), geteilte Links/URL-Zustand, `resultsParam`, QR-Code, Vollbild.
4. **Prüfen und abgeben:** `npm run verify` grün, Screenshots hell/dunkel, 1360 px und 390 px (z. B. mit Playwright oder `node scripts/agenten/simshot.cjs`, Kopf der Datei lesen; Pfade darin ggf. anpassen), Abgabe wie in Abschnitt 1 beschrieben, mit Vorher/Nachher.

## 4. Nicht anfassen

`src/simulations/**`, `src/sim-core/**` (außer reinem Styling über vorhandene CSS-Variablen nach Rücksprache), `src/curriculum/**`, `docs/pruefung/**`, `docs/BILDER-WUNSCHLISTE.md` (in `docs/BILDER.md` nur eigene Einträge für die Design-Bilder ergänzen). Parallel laufen im Repository andere Arbeiten (Physik-Prüfrunde, Bilder) – deshalb nur die Dateien ändern, die für das Design nötig sind.

## 5. Bilder für die Szene (Prompts für den Nutzer)

An jeden Prompt anhängen: `flat vector illustration, layered paper-cut style, soft gradients, deep indigo and violet with warm orange and golden yellow accents, soft long shadows, clean modern Dribbble style, no text, no letters, no people`

1. **Hintergrund-Szene**, breit (z. B. 2560 × 1280): layered paper-cut night sky of flowing wave layers from light lavender to deep indigo in the top right corner, tiny stars, left half fades to plain white for text, subtle orbits and a dotted trajectory curve.
2. **Goldene Kugel** (die fallende Kugel), transparent: glossy golden sphere like a pendulum bob, yellow-to-orange gradient, soft highlight upper left.
3. **Planet mit Ring**, transparent: small stylised planet with craters, light blue to indigo, bright orange tilted ring.
4. **Mondsichel**, transparent: large crescent moon, golden yellow to orange, soft craters.
5. **Kleine Deko-Teile**, transparent: tiny glass prism with rainbow ray, small magnet, little atom symbol, two small stars, tiny comet – separated.

Ablage der Bilder: `src/assets/design/` (WebP, sinnvoll komprimiert), jeweils mit Prompt in `docs/BILDER.md` eintragen; immer eine gezeichnete Ersatzgrafik vorsehen.
