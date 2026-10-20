# Mängelliste (Durchsicht der Seite durch die Projektleitung, 20.10.2026)

Diktiert von der Projektleitung beim Durchgehen der Seite, festgehalten von der Vertretung. Noch nicht bearbeitet.

## Startseite

### 1. Vorschaubilder: schwarze Platzhalter statt richtiger Bilder (nur Mathematik)
Die meisten Karten haben ein richtiges Vorschaubild. Bei diesen Mathe-Simulationen erscheint stattdessen eine schwarze Fläche. Das wirkt zufällig und unschön:

- Sinus, Kosinus, Tangens im rechtwinkligen Dreieck (`sin-cos-tan-dreieck`)
- Sinussatz und Kosinussatz (`sinussatz-kosinussatz`)
- Polstellen und Asymptoten gebrochen-rationaler Funktionen (`polstellen-asymptoten`)
- Umkehrfunktionen: Spiegeln an y = x (`umkehrfunktion`)
- Normalverteilung (`normalverteilung`)
- Newton-Verfahren (`newton-verfahren`)
- Ableitungsfunktion grafisch (`ableitungsfunktion`)
- Monotonie, Extrem- und Wendestellen (`kurvendiskussion`)
- Funktionenscharen (`funktionenscharen`)
- Vom Graphen zur Stammfunktion (`stammfunktion-grafisch`)
- Integralfunktion und Hauptsatz (`hauptsatz`)
- Integral als Gesamtänderung: von der Geschwindigkeit zum Weg (`aenderungsrate`)
- Extremwertprobleme (`extremwertprobleme`)
- Taylor-Polynome (`taylor-polynome`)
- Fourier-Reihen (`fourier-reihen`)
- Matrizen als lineare Abbildungen (`matrix-abbildungen`)

**Vermutete Ursache (noch zu prüfen):** Im Lehrplan steht für diese Simulationen `thumb: 'generic'`, oder sie haben keine eigene `thumb.svg`.
**Ziel:** Jede dieser Simulationen bekommt ein eigenes, zum Thema passendes Vorschaubild im Stil der übrigen Karten.

### 2. Nach dem Klick auf eine Karte landet man am Ende der Seite
Klickt man auf die allermeisten Karten, öffnet sich die Simulationsseite unten statt oben. Man muss erst nach oben zur Simulation scrollen. Das ist sehr nervig.

**Vermutete Ursache (noch zu prüfen):** Die Scrollposition der Startseite wird übernommen, oder der Fokus bzw. ein Sprungziel auf der Simulationsseite zieht nach unten. Mögliche Auslöser sind zum Beispiel ein `autofocus`, `scrollIntoView` oder `focus()` beim Laden, oder die Wiederherstellung des Zustands.
**Ziel:** Jede Simulationsseite öffnet oben, mit der Simulation sofort im Blick.

## Simulationsseiten

### 3. Beschreibungstext unter der Überschrift ist oft schwer verständlich
Der kurze Text direkt unter der Überschrift einer Simulation ist oft nicht verständlich genug.

**Vermutete Quelle (noch zu prüfen):** das Feld `summary` im Lehrplan (`src/curriculum/*.ts`), das vermutlich auch auf den Karten erscheint.
**Ziel:** Bei allen Simulationen einfacher formulieren: kurze Sätze, Alltagssprache, Fachbegriffe nur, wo nötig, und für die jeweilige Klassenstufe verständlich. DE und EN gleichermaßen.

### 4. Satz „Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.“ überall streichen
Der Satz soll überall raus.

**Fundstellen (geprüft):**
- Im Lernmaterial der Simulationen (`src/content/simulations/`) steht er 126-mal als „*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*“ und 3-mal als „*Nur Vorschläge – Sie kennen Ihre Klasse am besten.*“.
- Auf Englisch steht er 129-mal als „*Just suggestions – you know your class best.*“.
- Einmal steht er als Halbsatz in einer Aufzählung („… – als Anregung gedacht, denn Sie kennen Ihre Klasse am besten.“). Dort nur den Halbsatz kürzen.

**Ziel:** Alle Vorkommen in DE und EN entfernen. Außerdem in `docs/NEUE-SIMULATION.md` bzw. der Vorlage nachsehen, damit neue Simulationen den Satz nicht wieder mitbringen.
