# Befunde Abschnitt B (Prüfer ohne GitHub, 21.10.2026)

Textprüfung (Fach, Aufgaben, Texte) der 15 Simulationen aus Abschnitt B durch einen Account ohne GitHub. Die Projektleitung hat entschieden, was umgesetzt wird (Spalte „Umsetzen“). Allgemein:

- **Englisches Lernmaterial darf kürzer sein** (Projektregel, `QUALITAETSSICHERUNG.md`). Fehlende Aufgaben werden *nicht* nachübersetzt; fachliche Fehler und falsche Fachbegriffe im Englischen werden behoben.
- **`_hide`** ist ein Kernparameter (`sim-core`), kein Fehler.
- **Lehrplanbezug:** Die Plattform führt mehrere Bundesländer (`src/curriculum/lehrplaene/`); „Bezug als Entwurf“-Vermerke bleiben, bis eine Lehrkraft bestätigt.
- `fmt.num` gibt echtes „−“ aus und kürzt keine Nullen (`fmt.num(5, 3)` = „5,000“); wo ganzzahlige Werte sauberer wirken, `fmt.num(x, d, { trim: true })` o. ä. nur, wenn es die Funktion schon gibt (nicht `sim-core` ändern).
