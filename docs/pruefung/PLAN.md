# Große Prüfrunde – optimierter Ablauf

Stand: 20.10.2026, Entwurf der Vertretung der Projektleitung. Grundlage ist die Tabelle „Phase 1“ der Projektleitung (1.1 Fachprüfung, 1.2 Aufgaben und Texte, 1.3 Geräte, 1.4 Barrierefreiheit, 1.5 Leistung, 1.6 automatische Bildtests).

## Die vier Hebel

1. **Ein Durchgang pro Simulation statt vier.** 1.1 bis 1.4 lesen dieselben Dateien (`model.ts`, `index.ts`, Lernmaterial). Getrennte Agenten müssten jede Simulation viermal einlesen und verstehen. Ein Agent, der in einem Durchgang Fach, Aufgaben/Texte, Geräte und Barrierefreiheit prüft, spart etwa 40 % der Zeit und vermeidet Konflikte zwischen den Phasen.
2. **Alles Gemeinsame zuerst und nur einmal.** Darstellungsmodus, Scrollen, Englisch, Tastatur und Bildschirmleser im Kern, Kontraste der Farb-Tokens, Prüfwerkzeuge: Das wird einmal im Kern gelöst (Phase 0). Danach muss es keiner der 129 Durchgänge mehr anfassen.
3. **Maschinen prüfen, Menschen und Leitung schauen nur hin.** Ein Werkzeug erzeugt pro Simulation einen Fotobogen mit allen Geräten, Hell und Dunkel, und den Ergebnissen der automatischen Barrierefreiheits- und Kontrastprüfung. Der Agent prüft den Bogen statt zwölf Einzelaufnahmen. Die Leitung nimmt jede vierte Simulation voll ab, bei den übrigen prüft sie Protokoll und Bogen.
4. **Nach Simulationen aufteilen, nicht nach Phasen.** Jeder Account bekommt ein festes Paket mit eigenen Ordnern. Gemeinsame Dateien (`src/sim-core/`, `src/i18n/ui.ts`, `src/curriculum/*.ts`) ändert in Phase 1 nur der Kern-Account. Dann gibt es kaum Merge-Konflikte.

## Pakete

| Paket | Inhalt | Anzahl |
|---|---|---|
| A | Physik (alle, inkl. der vier aus T04) | 36 |
| B | Mathematik Jgst. 5–7 | 34 |
| C | Mathematik Jgst. 8–10 | 30 |
| D | Mathematik Jgst. 11–13 (die umfangreichsten Simulationen, darum weniger) | 29 |

Die genaue Liste erzeugt der Kern-Account aus `src/curriculum/*.ts` (Feld `grades`, erste Zahl) als `docs/pruefung/pakete.md`.

## Phase 0 – Vorbereitung (Tag 1, alles parallel)

**Kern-Account (K)**, nur gemeinsame Dateien:
- Mängelliste Punkt 2 (Seite öffnet unten), Punkt 8 (Dunkelmodus beim Seitenwechsel), Punkt 9 (Englisch), Punkt 7 (Zähler entfernen) und der Schalter „Werte zeigen“, falls der Hauptmanager ihn noch nicht fertig hat.
- **Barrierefreiheit im Kern:** Tastaturbedienung von Reglern, Schaltern und Aktionen, sichtbarer Fokus, Beschriftungen für Bildschirmleser, Kontraste aller `--plot-*`- und `--series-*`-Tokens in Hell und Dunkel, Farbsehschwäche (Reihenfolge der Serienfarben plus Strichart/Marker), reduzierte Bewegung zentral über die Uhr.
- **Prüfwerkzeug** `scripts/agenten/pruefbogen.cjs <id>` erstellt für jede Simulation:
  - einen Fotobogen in sechs Größen: 360, 414, 768 hoch, 1024 quer, 1440, 1920, jeweils hell und dunkel, dazu eine Beamer-Ansicht im Vollbild
  - einen Touch-Test (Ziehen) und einen Tastatur-Test (Tab-Reihenfolge)
  - eine Messung der Barrierefreiheit (axe-core, falls installierbar, sonst eigene Prüfungen: Beschriftungen, Kontrast)
  - die Ladezeit und Bildgrößen
  - eine Prüfung der reduzierten Bewegung (zwei Fotos im Abstand von 1,5 s müssen gleich sein)
  - Ergebnis: `docs/pruefung/boegen/<id>.png` plus `<id>.json`
- **Vorlage für das Prüfprotokoll** (`docs/pruefung/VORLAGE.md`): eine Seite pro Simulation, Abschnitte Fach, Aufgaben/Texte, Geräte, Barrierefreiheit, Ergebnis.

**Accounts A–D**, nur Inhalte ohne Kern-Berührung:
- **A:** T04 einbauen, sobald die ZIPs da sind (sonst mit Paket A beginnen, die vier zuletzt).
- **B:** Mängelliste Punkt 1, 16 Vorschaubilder (`thumb.svg`). Die Einträge in `mathematik.ts` sammelt B und übergibt sie als einen Commit.
- **C:** Mängelliste Punkt 3 und 4: alle 129 Kurzbeschreibungen (`summary`) einfacher formulieren, DE und EN, in einem Commit. Den Satz „Sie kennen Ihre Klasse am besten“ per Skript überall entfernen.
- **D:** Mängelliste Punkt 5, Lehrplan Bayern Gymnasium Physik.
- Mängelliste Punkt 6 (Bundesland-Einstellung) ist eine neue Funktion mit Kern-Berührung. Sie macht K nach Phase 1, damit die Prüfrunde nicht wartet.

**Abschluss von Phase 0:** Die Leitung mergt alles nach `main`. Ab dann ist `main` die Grundlage für Phase 1.

## Phase 1 – ein Durchgang pro Simulation (Tag 2–3)

Jeder Account arbeitet sein Paket ab, Simulation für Simulation, mit einem Bau-Agenten im Worktree. Zeitbudget: **etwa 20 Minuten pro Simulation**, einschließlich Korrekturen.

1. Fotobogen erzeugen (`pruefbogen.cjs`).
2. **Fach (1.1):**
   - `model.ts` und alle Anzeigen prüfen: Formeln, Einheiten, Vorzeichen, Rundung, Sonderfälle (0, negativ, Grenzen der Regler), Begriffe wie im Unterricht.
   - Mindestens 3 Werte selbst nachrechnen.
   - Fehlende Tests ergänzen.
3. **Aufgaben und Texte (1.2):**
   - Jede Aufgabe im Lernmaterial selbst rechnen und jedes „Beispiel laden“ anklicken.
   - DE und EN verständlich und einheitlich formulieren. Stilvorgabe: kurze Sätze, Sie-Form für Lehrkräfte, Du-Form in Aufgaben.
4. **Geräte (1.3):** Den Fotobogen durchsehen: Überlappungen, abgeschnittene Beschriftungen, fehlende Karten auf dem Tablet, Lesbarkeit am Beamer.
5. **Barrierefreiheit (1.4, nur der Teil, der die Simulation selbst betrifft):** Texte für Bildschirmleser zur Grafik (Beschreibung des Bildinhalts), Farben nur aus dem Theme, nichts nur über Rot/Grün unterscheiden.
6. Fehler beheben. `npm run verify` muss 0/0/0 ergeben.
7. Prüfprotokoll `docs/pruefung/<paket>/<id>.md` nach Vorlage schreiben.

**Rhythmus:** Je 8 Simulationen ein Pull Request nach `main`. Die Leitung nimmt davon 2 voll ab und prüft bei den übrigen 6 Protokoll und Bogen, dann mergt sie. Kleine PRs halten den Engpass bei der Leitung klein.

**Kern-Account K in Phase 1:**
- **Leistung (1.5):** Bildgrößen (webp, `srcset`), Aufteilung der Skripte (Code-Splitting je Simulation), Speicherverhalten bei langen Animationen, Offline-Modus (Service Worker).
- Messung auf einem gedrosselten Profil (CPU 4× langsamer, langsames Netz) als Ersatz für ein schwaches Schul-Tablet.
- Danach Punkt 6 (Bundesland-Einstellung).

## Phase 2 – Abschluss (Tag 4)

- **Automatische Bildtests (1.6, Account K):** Erst jetzt, weil sich die Referenzfotos sonst bei jeder Korrektur ändern.
  - Je Simulation drei Referenzfotos (Handy, Tablet, Desktop) im festen Zustand: Uhr angehalten, reduzierte Bewegung an, feste Schrift.
  - Ein GitHub-Workflow vergleicht bei jedem PR mit einer Toleranz.
  - Die Referenzfotos werden ausschließlich auf Linux und Chromium erzeugt, damit es keine Fehlalarme durch andere Schriftdarstellung gibt.
- **Menschliche Stichprobe (Projektleitung, ca. 2–3 h):** echtes iPad mit Safari, ein älteres Schul-Tablet, der Beamer im Klassenraum, VoiceOver oder NVDA bei 3–4 Simulationen. Agenten haben hier nur Chromium. Echte Geräte und Bildschirmleser können sie nicht ersetzen.
- Mängel daraus werden als kleine Nachbesserung erledigt.

## Dauer

Rechnung:

| Posten | Aufwand |
|---|---|
| 129 Simulationen × ca. 20 min | ~43 h |
| Phase 0 | ~14 h |
| Leistung und Bildtests | ~9 h |
| **Gesamt** | **~66 Agentenstunden** |

Gegenüber vier getrennten Phasen (~85 h) ist das etwa ein Viertel weniger. Gerechnet sind 8–10 produktive Stunden pro Account und Tag (Nutzungslimits).

| Accounts | Dauer | Aufteilung |
|---|---|---|
| 1 | ~7–8 Arbeitstage | K und alle Pakete nacheinander |
| 2 | ~4 Tage | K + A, dann B, C, D je zur Hälfte |
| 3 | ~3 Tage | K, A + B, C + D |
| 4 | **~2,5–3 Tage** | K (macht Paket A mit), B, C, D |

Mehr als 4 Accounts lohnen sich nicht: Die Leitungsabnahme und die Kern-Arbeit sind der Engpass.

## Regeln für alle Accounts

- Erst starten, wenn Phase 0 in `main` ist.
- `src/sim-core/`, `src/i18n/ui.ts` und `src/curriculum/*.ts` ändert in Phase 1 nur K. Braucht ein Paket dort etwas, schreibt der Account es ins Protokoll unter „Für den Kern“. K sammelt diese Punkte.
- Bestehende Parameter-Schlüssel nie umbenennen, weil sie in geteilten Links stehen.
- Unsichere fachliche Punkte nicht stillschweigend ändern, sondern im Protokoll unter „Rückfrage“ eintragen.
- Konsistenztests nicht abschwächen.
