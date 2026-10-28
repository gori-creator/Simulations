# Fahrplan bis zur Veröffentlichung (Entwurf, Stand 19.10.2026)

> **Aktuelle Aufgabenliste:** `docs/AUFGABEN.md` (Stand 25.10.2026). Dieser Fahrplan ist der ursprüngliche Plan und wird nicht mehr laufend gepflegt.

Grober Plan für alles, was nach dem Bau der Simulationen kommt. Reihenfolge = Vorschlag. Jede Phase kann mit Claude-Agenten erledigt werden. Wo eine Entscheidung der Projektleitung nötig ist, steht **Entscheidung**.

---

## Phase 0 – Bauen abschließen (läuft)

- Physik: noch 10 Simulationen (Gasgesetze, radioaktiver Zerfall, Feldlinien, Kondensator, Lorentzkraft, Induktion, Doppelspalt, Photoeffekt, Linienspektren, Elektronenbeugung).
- Mathe Teil 1: läuft (Gruppen M13, M08, M18, M26 …).
- Mathe Teil 2: 24 Simulationen überarbeiten (neuer Claude, siehe Übergabe-Nachricht).
- Alle Pull Requests nach `main` mergen.
- Fehlende Bilder (`docs/BILDER-WUNSCHLISTE.md`) erzeugen und einbauen.

## Phase 1 – Große Prüfrunde (je ein Agent, nacheinander)

Erst starten, wenn alle Simulationen auf `main` sind. Jeder Agent arbeitet Simulation für Simulation, schreibt ein Prüfprotokoll (`docs/pruefung/<thema>.md`) und behebt Fehler nach `QUALITAETSSICHERUNG.md`.

| # | Agent | Prüft | Ergebnis |
| --- | --- | --- | --- |
| 1.1 | **Fachprüfung Mathematik/Physik** | Jede Formel, jede Rechenlogik (`model.ts`), jede Anzeige im Bild: stimmt die Mathematik/Physik? Einheiten, Vorzeichen, Rundung, Sonderfälle, Begriffe wie im Unterricht | Protokoll + Korrekturen + zusätzliche Tests |
| 1.2 | **Aufgaben und Texte** | Jede Aufgabe selbst durchrechnen, jede Lösung prüfen, jeden „Beispiel laden“-Link anklicken; Texte verständlich und fehlerfrei machen (DE und EN), einheitlicher Stil und Ton | Protokoll + verbesserte Lernmaterialien |
| 1.3 | **Geräteprüfung** | Jede Simulation auf Handy (klein/groß), iPad hoch/quer, Laptop, großer Bildschirm (1920 px, 2560 px), Beamer-Vollbild; hell/dunkel; Touch und Maus; Safari/Chrome/Firefox | Fotos je Gerät, Mängelliste, Korrekturen |
| 1.4 | **Barrierefreiheit** | Bedienung per Tastatur, Bildschirmleser-Texte, Kontraste, Farbsehschwäche (nicht nur Rot/Grün unterscheiden), Schriftgrößen, „reduzierte Bewegung“ | Protokoll + Korrekturen |
| 1.5 | **Leistung** | Läuft alles flüssig auf schwachen Schul-Tablets? Ladezeit, Bildgrößen, Speicher; Offline-Modus | Messwerte + Optimierungen |
| 1.6 | **Automatische Bildtests** | Für jede Simulation feste Referenzfotos; bei jeder Änderung vergleicht GitHub automatisch, ob sich etwas ungewollt verändert hat | Dauerhafter Schutz vor Rückschritten |

## Phase 2 – Design überholen

- Gesamteindruck der Website: Startseite, Navigation, Suche, Kacheln, Vorschaubilder, einheitliche Farb- und Schriftwelt, Logo.
- Einheitliches „Simulations-Design“: gleiche Karten, Knöpfe, Beschriftungen, Animationen in allen Simulationen.
- Vorgehen: erst 2–3 Design-Entwürfe als Bilder/Vorschauseiten zur Auswahl → **Entscheidung** → dann ein Agent setzt es um, ein zweiter prüft alle Simulationen danach.
- Hängt mit dem neuen Namen zusammen (Phase 4) – sinnvoll gemeinsam.

## Phase 3 – Bundesländer

Ziel: In den Einstellungen das Bundesland wählen (oder „bundeslandunabhängig“); die Seite zeigt dann die Simulationen nach dem Lehrplan dieses Landes (Jahrgangsstufen, Lernbereiche, Begriffe).

- **Technik:** Es gibt schon `src/curriculum/lehrplaene/` mit Bayern (Gymnasium, Mathe). Erweitern um: Auswahl in den Einstellungen (gespeichert im Browser, auch per Link teilbar), Ansicht „nach Jahrgangsstufe“ je Land, Physik-Lehrpläne.
- **Inhalt je Land:** Zuordnung Jahrgangsstufe → Lernbereich → Simulationen, Kurzbeschreibungen in eigenen Worten. Pro Land und Fach ein Agent, der den Lehrplan liest und zuordnet; danach Gegenprobe durch einen zweiten Agenten.
- **Reihenfolge-Vorschlag:** Hessen (Gymnasium, G9) → Baden-Württemberg → Nordrhein-Westfalen → Niedersachsen → übrige.
- **Entscheidung:** Nur Gymnasium oder auch Realschule/Gesamtschule? (Mehr Schularten = mehr Arbeit, aber viel mehr Nutzer.)
- Später: Begriffe, die sich je Land unterscheiden (z. B. „Jahrgangsstufe“/„Klasse“), im Lernmaterial anpassen.

## Phase 4 – Name, Marke, Domain

- Name: **Scitura** (entschieden am 27.10.2026), Logo 01 in Marineblau (`docs/design/coin-reise-v13/`).
- Prüfen: Domain frei (.de), keine Verwechslung mit bestehenden Marken (Suche beim DPMA/EUIPO), keine Konflikte mit Schulbuchverlagen.
- Logo und Farben passend zum neuen Design: erledigt (Startseite eingebaut am 28.10.2026).
- **Entscheidung:** Name.

## Phase 5 – Rechtliches und Veröffentlichung

*(Kein Rechtsrat – vor dem Start sollte das jemand mit Rechtskenntnis prüfen, z. B. eine Anwältin/ein Anwalt für IT-Recht oder eine Beratungsstelle.)*

- **Impressum:** Wer ist verantwortlich? Name, ladungsfähige Anschrift, Kontakt. Bei privatem Projekt evtl. Lösung über eine Adresse/einen Dienst, damit die Privatadresse nicht öffentlich ist.
- **Datenschutzerklärung:** Die Seite sammelt keine Daten und setzt keine Cookies – trotzdem muss beschrieben werden, was der Hoster (z. B. GitHub Pages) an Verbindungsdaten speichert. Für Schulen wichtig: Hoster in der EU ist ein starkes Argument.
- **Bilder:** Nutzungsrechte der KI-Bilder prüfen (Bedingungen des verwendeten Bildgenerators), Liste in `docs/BILDER.md`.
- **Fremde Bausteine:** Lizenzen der verwendeten Software (z. B. KaTeX, Astro) im Projekt nennen.
- **Lehrpläne:** Nur eigene Kurzbeschreibungen, keine kopierten Lehrplantexte (ist bereits so angelegt).
- **Hosting:** GitHub Pages (kostenlos, USA) oder EU-Hoster mit eigener Domain. **Entscheidung.**
- **Barrierefreiheit:** Erklärung zur Barrierefreiheit (für öffentliche Stellen Pflicht, für private Projekte empfehlenswert).

## Phase 6 – Open Source oder nicht?

**Entscheidung** – zum Besprechen:

| Möglichkeit | Vorteile | Nachteile |
| --- | --- | --- |
| Offen, Code unter MIT-Lizenz | Andere können frei mitmachen und weiterverwenden; Vertrauen bei Schulen | Andere dürfen es auch kommerziell nutzen |
| Offen, Code unter AGPL/GPL | Wer es verändert, muss seine Änderungen ebenfalls offenlegen | Für manche Partner abschreckend |
| Inhalte (Texte, Aufgaben) unter CC BY-SA | Lehrkräfte dürfen Material frei verwenden und anpassen, Namensnennung bleibt | – |
| Geschlossen | Volle Kontrolle, spätere Vermarktung leichter | Weniger Vertrauen, keine Mitarbeit von außen |

Ein häufiger Weg für Bildungsprojekte: Code offen (MIT oder AGPL) + Inhalte unter CC BY-SA. Das Repository ist im Moment **öffentlich**.

## Phase 7 – Start und danach

- Testphase mit 2–5 Lehrkräften und einer Klasse: Rückmeldungen sammeln, nachbessern.
- Kontaktweg für Fehlermeldungen (Formular ohne Datensammlung oder E-Mail).
- Bekannt machen: Fachgruppen, Lehrerfortbildungen, Bildungsserver der Länder, Social Media.
- Weitere Ideen: Arbeitsblätter als PDF zu jeder Simulation, Lehrkräfte-Modus (Aufgabenlinks mit verdeckten Lösungen gibt es schon), Chemie, Englisch-Version ausbauen, Suche nach Lehrplanbegriffen.

---

## Aufgaben für Helfer ohne GitHub

Alles ohne Programmierung und ohne GitHub; Ergebnisse per Mail/Messenger an die Projektleitung.

1. **Bilder erzeugen** nach `docs/BILDER-WUNSCHLISTE.md` (oben: fehlende Bilder mit fertigen Prompts).
2. **Testen wie ein Schüler/eine Lehrkraft** auf eigenen Geräten (Handy, Tablet, Laptop) über die Vorschau-Seite: Was hakt, ist unklar, sieht schlecht aus? Je Fund: Name der Simulation, Gerät, Screenshot, ein Satz.
3. **Aufgaben nachrechnen** (Lernmaterial unter jeder Simulation) und Fehler melden.
4. **Englische Texte gegenlesen** (falls gute Englischkenntnisse).
5. **Namensideen sammeln** und vorprüfen (Domain frei? Gibt es schon etwas mit dem Namen?).
6. **Lehrplan-Recherche Hessen:** Kerncurricula Mathematik und Physik (Gymnasium) heraussuchen und je Jahrgangsstufe die Themen stichpunktartig auflisten – das ist die Vorlage für Phase 3.
7. **Lehrkräfte finden**, die in Phase 7 testen würden.
8. **Vergleich mit anderen Angeboten** (z. B. GeoGebra, LEIFIphysik, PhET): Was machen die gut, was fehlt dort, was können wir besser?
