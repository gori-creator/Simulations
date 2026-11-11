# Zahlenfabrik: Kurzkonzept (Entwurf)

Stand 04.11.2026. Idee der Projektleitung. Welt 1 gibt es als grobe Probe zum Ausprobieren unter `/de/zahlenfabrik/` (nicht verlinkt, `GAMES_PUBLIC` in `src/spiele/index.ts`). Ohne Spielfigur: Man sieht die Fabrik von oben. Jedes Level liegt auf einer freien Fläche aus Kästchen (verschieben mit der Hand, zoomen mit zwei Fingern, Mausrad oder +/−); Bänder zieht man über die Kästchen, Maschinen zieht man aus dem Inventar auf die Karte; Felsen und vorgegebene Maschinen (🔒) stehen schon da. Bänder sind ein schmaler, laufender Streifen durch die Feldmitte (auch um Ecken). **Offene Welt** (🌍): Karte 40 × 28 mit 20 Zahlenquellen (nah an der Basis kleine Zahlen, weiter weg größere), Felsgruppen und einer Basis (3 × 3). Quellen geben ohne Ende aus, sobald ein Band vor ihnen liegt; alles, was in der Basis ankommt, zählt (Summe). Bauen geht auch während des Laufs, Bauten, Münzen und Aufträge bleiben im Browser (`world.ts`, Tests `tests/zahlenfabrik-welt.test.ts`). Code: `src/spiele/zahlenfabrik/` (Rechenlogik `model.ts`, Level `levels.ts`, Bauteile und Preise `parts.ts`, Aufträge `orders.ts`, Oberfläche `game.ts`), Tests `tests/zahlenfabrik*.test.ts`.

## Offene Welt: Münzen, Aufträge, Bauteile (Stand 04.11.2026)

- **Münzen:** Jede Zahl, die in der Basis ankommt, bringt so viele Münzen, wie sie groß ist (0 und negative Zahlen bringen nichts). Start mit 40 Münzen. Bänder kosten 1, Maschinen 8–250, Weichen 40–120, Zusammenführer 100/200. Abbauen gibt den vollen Preis zurück.
- **Aufträge an der Basis**, einer nach dem anderen (Liste in `orders.ts`): z. B. „Bring 10 Zahlen zur Basis“, „Liefere 10-mal die 4“, „Liefere 15 gerade Zahlen“, „Liefere nur Primzahlen: 20 hintereinander“ (eine andere Zahl setzt auf 0 zurück), „Liefere 10 Quadratzahlen“, „Liefere 50-mal die 12“. Jeder bringt Münzen und schaltet neue Teile frei; nach den 12 festen Aufträgen kommen endlos neue, schwerere. Gesperrte Teile zeigt das Inventar nur, wenn der aktuelle Auftrag sie freischaltet.
- **Weiche** (gerade?, ÷3?, Prim?, >50?): Was die Frage erfüllt, läuft geradeaus (✓), alles andere biegt zur Seite ab (✗). Antippen dreht; nach vier Drehungen wechselt die Seite (rechts/links).
- **Zusammenführen** (a+b, a×b): Die erste Zahl wartet, bis eine zweite kommt (aus jeder Richtung); dann läuft die Summe bzw. das Produkt weiter.
- **Stau:** Auf jedem Feld liegt höchstens eine Zahl. Ist das nächste Feld belegt und wird nicht frei, wartet die Zahl; eine Quelle wartet, solange ihr Feld belegt ist. Wollen zwei Zahlen aufs selbe Feld, hat die von hinten Vorrang, sonst wechseln sich die Seiten ab. Ein voller Kreis (ab drei Feldern) dreht sich weiter; zwei Zahlen, die sich gegenüberstehen, blockieren sich.
- Anzeige: Auftrag mit Fortschrittsbalken über dem Inventar, Münzen und Stand oben links im Spielfeld, „+n 🪙“ an der Basis, Jubel bei geschafftem Auftrag.
- **Größere Karte** (72 × 52) in drei Gebieten: Das Startgebiet (40 × 28, wie die frühere Karte) ist offen, zwei Ringe darum kauft man frei (heute 1.500 und 8.000 Münzen, Knopf „🗺️ Neues Gebiet“). Gesperrtes Land liegt unter Nebel; seine Quellen geben noch nichts aus. Weiter draußen geben die Quellen größere Zahlen (Start 1–9, mittlerer Ring 5–24, außen bis 50). Alte Spielstände werden ins neue Raster verschoben (`START_OFFSET`).
- **Brücke** (15 Münzen, ab Auftrag 2): Zahlen laufen geradeaus darüber, waagerecht und senkrecht getrennt – so kreuzen sich zwei Bänder.
- **Leistung:** Ein Takt mit rund 400 Zahlen auf einer voll bebauten Karte braucht etwa 1 ms; im Browser läuft „Schnell“ dabei ohne Ruckeln (höchstens 600 Zahlen gleichzeitig).

## Level-Welten (Stand 04.11.2026)

Sechs Welten mit je sechs Leveln (`levels.ts`, `WORLDS`); in der Leiste wählt man erst die Welt, dann das Level. Jedes Level hat im Test eine Musterlösung, und das Teile-Ziel für den zweiten Stern ist die kleinste gefundene Fabrik (kürzester Weg bzw. kleinste Fabrik mit Weiche, (heute `tests/zahlenfabrik-kapitel.test.ts`), Löser `tests/zahlenfabrik-loeser.ts`).

- **Welt 2 Rückwärts (Kl. 5):** Die Maschinen stehen schon da (🔒), man wählt die **Startzahl** (− / Zahl / +). Genau eine Startzahl im erlaubten Bereich passt (im Test geprüft). Beispiele: ×3 → 24 (Start 8), ÷2 dann +5 → 50 (Start 90), ×5, +15, ÷2 → 40 (Start 13).
- **Welt 3 Sortieren (Kl. 5–6):** Die Quelle gibt eine Folge aus (z. B. 1 … 9), zwei oder drei **Lager mit Regeln** („✓ gerade?“ bzw. „✗ gerade?“ = der Rest). Weichen gerade?, ÷3?, ÷4?, >10?; mit Rechnen vor der Weiche (1, 3, 5, 7 → +1 → Vielfache von 4) und mit zwei Weichen für drei Lager (Reihenfolge der Weichen zählt).
- **Welt 4 Primzahlen (Kl. 5–6):** Primzahl-Weiche (2 … 10, 11 … 17, 2x + 1) und **Zerlegen in Primfaktoren**: 12, 60 und 210 so lange teilen, bis 1 im Lager ankommt.
- **Welt 5 Terme (Kl. 7–8):** x = 1 … 5, das Lager will die **Wertetabelle der Reihe nach**: x + 3, 2x, 3x + 1 (Punkt vor Strich), 2 · (x + 1) (Klammer zuerst), 5x − 2, 4 · (x + 1) mit zweimal ×2. Unter der Karte steht die Tabelle x / Lager will / angekommen.
- **Welt 6 Funktionen (Kl. 8–9):** neue Maschine **x²**; f(x) = x², x² + 1, (x + 1)², 2x², die Gerade 3x − 1 mit x = 0 … 4 (Wert −1) und die Parabel x² − 4 mit x = −2 … 2.

## Aussehen und Gefühl (Stand 04.11.2026)

- **Gezeichnete Grafik** (`art.ts`, eigene SVG-Formen statt Emojis, die auf jedem Gerät anders aussehen): Quelle mit Trichter und rauchendem Schornstein, Maschine mit Zahnrad und Schrauben, Weiche als Gabel, Zusammenführer, Lager als Kiste, Basis als Haus, Felsbrocken mit Licht und Schatten, Brücke als Bogen. Ein kleiner Ausguss zeigt, wohin ein Teil die Zahl weitergibt. Farben über CSS-Variablen (hell/dunkel).
- **Sanfte Bewegungen:** Maschinen ruckeln kurz beim Rechnen (Zahnrad dreht sich), Quellen beim Ausgeben, Lager und Basis hüpfen beim Empfangen. Bei „Bewegung reduzieren“ bleibt alles ruhig.
- **Einführung beim ersten Start** (`intro.ts`, ohne Spielfigur): vier Karten mit einer kleinen laufenden Fabrik (3 → +2 → 5); Überspringen, Pfeiltasten, Esc. Über „❓ Anleitung“ wieder aufrufbar.
- **Töne** (`sound.ts`, standardmäßig aus, Knopf „🔇 Töne aus/🔊 Töne an“): selbst erzeugte kurze Klänge (Web Audio, keine Dateien) für Bauen, Abbauen, Liefern, Fehler, Level geschafft, Auftrag geschafft, Gebiet gekauft.

## Tastatur und Barrierefreiheit (Stand 04.11.2026)

- Die Karte ist mit Tab erreichbar (Rolle „application“, Beschriftung mit den Tasten). **Pfeiltasten** wählen ein Feld (Rahmen, Karte scrollt mit), **Leertaste/Enter** setzt das gewählte Teil bzw. dreht es, **Umschalt + Pfeil** zieht ein Band, **Entf** baut ab, **H/B/A** wählen Hand, Band, Abbauen, **1–9** die Teile im Inventar, **P** startet/pausiert, **+/−** zoomen, **F** passt ein.
- Jedes gewählte Feld wird für Bildschirmleser angesagt („Feld 6, 5: +2, Richtung rechts“, „Lager, will die 5“, „Quelle mit 3“, „Fels“ …), ebenso der Werkzeugwechsel. Meldungen stehen in einem Statusbereich (`aria-live`).
- Level 1 lässt sich ganz mit der Tastatur lösen (im Browser geprüft).

## Mehr Level, Bilder, Rückgängig (Stand 04.11.2026)

- **Profi-Level 7 und 8 in jeder Welt** (🔥 in der Leiste): z. B. „Aus 7 wird 50“ und „Aus 4 wird 99“ mit Umwegen, vier Maschinen rückwärts (Start 14), Rückwärts mit x² (Start 7), drei Lager mit der Falle „10 ist Vielfaches von 5 und gerade“, Zerlegen von 360 (sechs Faktoren), Primzahlzwillinge, 3 · (x + 2) − 1, 4 · (x − 3) mit negativen Werten, (2x)² (zwei Wege), Scheitelpunktform (x − 1)² − 1.
- **Welt 7 „Meisterprüfung“** (6 Level): Rückwärts mit Quadrat, drei Lager „prim / gerade / Rest“ (die 2!), **Rechnen nach der Weiche** (gerade ×10, ungerade +100), Halbieren und Primzahl prüfen, 2x² − 3, großes Finale mit x² und drei Lagern.
- Alle neuen Level mit Musterlösung im Test; Teile-Ziel = kleinste gefundene Fabrik (Löser kann jetzt auch Maschinen hinter der Weiche).
- **Eigene Bilder** statt gezeichneter Grafik möglich: Prompts in `docs/ZAHLENFABRIK-BILDER.md`, Ablage `src/assets/zahlenfabrik/`; ohne Datei bleibt die gezeichnete Grafik.
- **Rückgängig** (Knopf und Strg + Z): macht den letzten Bauschritt rückgängig (eine Geste = ein Schritt), in der offenen Welt mit Münzen.

## Aufgeräumte Oberfläche und Bilder (Stand 04.11.2026)

- **Layout:** Kopfleiste (Welt/Level, Knöpfe „🗂️ Level“, „❓ Anleitung“, Töne), großes Spielfeld, rechts eine Seitenleiste mit drei Karten: Ziel (Tipp, Auftrag, Zahlen, Wertetabelle), Bauteile, Steuerung (Start groß, darunter Schnell, Ein Takt, Stopp, Rückgängig, Leeren). Bedienungstexte zum Aufklappen. Meldungen erscheinen als Einblendung über dem Spielfeld.
- **Level-Auswahl** als eigenes Fenster: oben die offene Welt, darunter je Welt eine Karte mit Klassenstufe, Sternen und den Leveln (Profi-Level mit 🔥).
- Tablet: Seitenleiste unter dem Spielfeld in zwei Spalten; Handy: eine Spalte, Bauteile und Start direkt unter dem Spielfeld, Spielfeld nur so hoch wie die Karte, Zoom mit zwei Fingern (nur „Alles zeigen“ als Knopf).
- **Bilder eingebaut** (14 Stück, `src/assets/zahlenfabrik/`, WebP, zusammen etwa 180 KB): Quelle, Maschine, Weiche (gedreht, bei „nein“ links gespiegelt), Zusammenführer, Lager leer/voll, Basis, drei Felsen, Brücke, Boden hell/dunkel, Münze. Die gezeichnete Grafik bleibt als Ersatz.

- **Feinschliff:** eigene Linien-Symbole statt Emojis (`icons.ts`) auf allen Knöpfen, in der Anzeige und in Meldungen; Bauteile als Bildkacheln mit Vorschau des Teils, Preis mit Münze; Ziel-Karte mit Kennzahlen (Teile, Geliefert bzw. Münzen, Verloren) und Sterne-Zielen als Abzeichen (werden golden, solange sie erreichbar sind); Kopfleiste mit Welt, Klassenstufe und „Profi“-Abzeichen; Level-Auswahl mit Welt-Nummer, Fortschrittsbalken und „Profi“-Marke; am Handy nur Symbole in der Kopfleiste.

## Kapitel mit wachsendem Werkzeugkasten (Stand 04.11.2026)

Wunsch der Projektleitung: Am Anfang ein Tutorial, danach nach und nach neue Bauteile, jedes mit eigener Erklärung. Alle Bauteile nimmt man mit, damit die Werkzeuge nicht mehr die Lösung verraten.

- **13 Kapitel** statt 7 Welten (`levels.ts`, `CHAPTERS`), 66 Level: 1 Bänder, 2 Plus-, 3 Minus-, 4 Mal-, 5 Geteilt-Maschine, 6 Rückwärts rechnen (Startzahl), 7–10 Weichen „gerade?“, „teilbar durch …?“, „größer als …?“, „Primzahl?“, 11 Wertetabellen, 12 Quadrat-Maschine, 13 Meisterprüfung. Profi-Level sind markiert (`pro`).
- **Werkzeugkasten** (`kit.ts`): Ein Level bekommt alle Bauteile aus seinem Kapitel und allen davor (`kitFor`). Maschinen und Weichen sind **einstellbar**: Plus/Minus 1–10, Mal/Geteilt 2–10, „teilbar durch“ 2–10, „größer als“ 0–100. Die Zahl stellt man unter dem Werkzeugkasten ein (− / Zahl / +, Tastatur `<` `>`); ein Teil mit anderer Zahl antippen gibt ihm die neue Zahl.
- **Grenze für Maschinen** (`maxMachines`): z. B. „Aus 4 wird 99 mit höchstens zwei Maschinen“ (nur +7, ×9). Rückwärts-Level haben 0 (nur Bänder). Die Anzeige zeigt „Maschinen 1/2“; eine Maschine zu viel wird mit Hinweis abgelehnt.
- **Erklärkarten** (`lessons.ts`, ersetzt `intro.ts`): beim ersten Start „Willkommen“ (Bänder, der Werkzeugkasten wächst), dann beim ersten Öffnen eines Kapitels die Karten zum neuen Bauteil mit kleiner Szene (laufende Fabrik, Kachel mit Zahl-Einstellung, Weiche mit ✓/✗, Wertetabelle). Gesehenes merkt sich der Browser (`spiel:zahlenfabrik:neu`); „Neu: … · Erklärung“ in der Aufgabe und „Anleitung“ öffnen sie wieder. Neue Teile tragen im Werkzeugkasten das Schild „Neu“.
- **Tests** (`tests/zahlenfabrik-kapitel.test.ts`): Jedes Level hat eine Musterlösung, die nur Teile aus dem eigenen Werkzeugkasten mit erlaubten Zahlen benutzt und die Grenze einhält; Teile-Ziel = kleinste gefundene Fabrik. Ein Löser zählt alle Rechenwege: Grenzen sind knapp (mit einer Maschine weniger unlösbar), bei „Aus 4 wird 99“ und „Aus 100 wird 3“ gibt es genau einen Weg, anderswo mehrere (z. B. 2 · (x + 1) = 2x + 2, (2x)² = 4x²).
- Alle Kapitel sind frei wählbar (Unterricht: Lehrkraft springt zum passenden Kapitel). Alte Sterne der Welten-Level gelten nicht mehr (neue Kennungen `c1-1` …).

## Neue Bausteine und viele schwere Level (Stand 04.11.2026)

- **22 Kapitel, 115 Level.** Neue Kapitel: Rest-Maschine (`mod n`, Rest beim Teilen, z. B. Wochentage: 3, 10, 17, 24, 31 → mod 7), Quersummen-Maschine (`QS`, Neunerprobe), Wurzel-Maschine (`√x`, nur bei Quadratzahlen, sonst bleibt die Fabrik stehen), Weiche „Quadratzahl?“, **Verteiler** (jede Zahl als Kopie in zwei Richtungen), **Zusammenführer** „Summe“ und „Produkt“ (wartet auf je eine Zahl aus zwei Richtungen, der Reihe nach), **Brücke** (Wege kreuzen sich), dazu **Rätsel-Werkstatt** (10 Level) und **Funktionen-Detektiv** (9 Wertetabellen ohne angegebene Regel).
- Mit Verteiler und Zusammenführer entstehen Terme wie x + x, x · x, x² + x, x³, (x + 1)(x − 1), x(x + 2), x³ − x und x² + (x + 1)²; Verteiler, Zusammenführer und Weichen zählen nicht als Maschinen, daher gehen z. B. x · x „ohne Maschine“ und x(x + 2) „mit einer Maschine“.
- **Rätsel mit genau einem Weg:** Ein Suchprogramm hat Aufgaben gefunden, die mit allen Bauteilen und der Grenze für Maschinen genau eine Lösung haben (z. B. 2 → 329: ×9, x², +5; 8 → 1606: ×5, x², +6; Wertetabelle 5, 1, 3, 7, 2: ×4, −9, QS). Die Tests prüfen das mit einem Löser (genau ein Weg, mit einer Maschine weniger keiner).
- Rechenlogik: Level können jetzt Verteiler, Zusammenführer und Brücken (`model.ts`, `emit` = Anzahl der Zahlen aus der Quelle). Werkzeugkasten in Gruppen (Maschinen, Weichen, Verteilen & Kreuzen); Weichen und Verteiler richten ihre Seite beim Setzen nach vorhandenen Bändern aus. Vorgegebene Weichen und Verteiler tragen ein Schloss.
- „Zerlege 360“ in der Meisterprüfung ist durch „Aus 8 wird 1606“ ersetzt (mit der Rest-Maschine wäre es zu leicht).

## Werkstatt, Großmeister, Tagesrätsel, Tipps (Stand 05.11.2026)

- **27 Kapitel, 140 Level** in sieben Abschnitten (`PARTS`): Grundlagen, Weichen und Teilbarkeit, Terme und Funktionen, Fabrik-Technik, Rätsel, Neue Werkstatt, Großmeister.
- **Neue Bausteine:** Vorzeichen-Maschine `±`, Betrags-Maschine `|x|`, Spiegel-Maschine `⇄` (Ziffern umdrehen, 120 → 21), Runden-Maschine `≈10/≈100/≈1000` (kaufmännisch, Einstellung als Zehnerpotenz) und **Wechsel-Weiche** (abwechselnd geradeaus und zur Seite, unabhängig von der Zahl; mit Zusammenführer dahinter werden Paare verrechnet: 1·2, 3·4, 5·6).
- **Großmeister** (10 Level, alle Bauteile): eindeutige Rätsel wie 15 → 2603 (⇄, x², +2), 22 → −1024 (+10, x², ±), 44 → 1906 (x², ≈100, +6), Wertetabellen wie 9, 71, 52, 33, 14 (×8, +1, ⇄) und Paar-Level mit Wechsel-Weiche.
- **Tagesrätsel und Zufallsrätsel** (`daily.ts`, `solver.ts`): „Aus a wird b“ mit allen Bauteilen, höchstens drei Maschinen und genau einem Weg; das Tagesrätsel hängt nur vom Datum ab (gleich für alle), das Zufallsrätsel ist jedes Mal neu. Die Sterne des Tagesrätsels werden gespeichert.
- **Tipp-Knopf** (Löser für Rechenketten): erst „Mit n Maschinen geht es“, dann die erste Maschine, dann eine ganze Lösung; bei Leveln mit Weichen ein allgemeiner Tipp.
- **Rechenweg** in der Aufgabe: zeigt beim Bauen, was aus der ersten Zahl wird (3 → +2 → 5 → Lager ✓/✗, oder wo der Weg endet).
- **Level-Auswahl** mit „Weiterspielen“ (erstes Level ohne Stern), Sternen gesamt, Tages- und Zufallsrätsel, offener Welt und Abschnitten mit Zwischenständen.

## Zwei Quellen statt Verteiler, offene Welt neu, Bilder Runde 2 (Stand 05.11.2026)

- **Zwei Quellen statt Verteiler:** Level können mehrere Quellen haben (`more` in `model.ts`, geben im selben Takt aus). Der Verteiler ist aus dem Werkzeugkasten entfernt. Neues frühes Kapitel **Zusammenführer** (Kapitel 7, nach „Rückwärts rechnen“): zwei Quellen und Zusammenführer „Summe“, „Differenz“ (größere − kleinere), „Produkt“, „Quotient“ (größere ÷ kleinere, nur wenn glatt). Die Terme (x · x, x³, x(x + 2) …) heißen jetzt „Terme mit zwei Quellen“; die Brücken-Level 2 und 3 haben eine zweite Quelle statt eines festen Verteilers.
- **Offene Welt neu:** keine Maschinen mehr, die eine einzelne Zahl verändern (kein +1, ×3 …). Neue Zahlen entstehen nur durch Zusammenführer (+, −, ×, ÷) zweier Ströme; Weichen filtern (gerade, ÷3, >50, prim, Quadratzahl). **Münzen je Zahl statt nach Größe** (1 Münze je Zahl, 5 für eine zum Auftrag passende) – damit lässt sich kein unendliches Geld mehr erzeugen. Neue Auftragsliste. Alte Spielstände (Version < 4) starten neu, mit einem Hinweis.
- **Bilder Runde 2 eingebaut** (36 Stück, `src/assets/zahlenfabrik/`): eigene Maschinen für +, −, ×, ÷, x² und Weichen für gerade, teilbar, größer als, prim; Bäume, Busch, großer Fels und Kisten mischen sich unter die Felsen; Nebel über gesperrtem Land; Sterne, Pokal (Kapitel mit allen Sternen), Konfetti beim Sieg, Staubwolke und Funke als Effekte in der offenen Welt, Zahnrad beim Bauen eines Rätsels; Kapitelbilder in Erklärkarten und Auswahl, Titelbild in der Einführung.
- Vorschläge für später: `docs/ZAHLENFABRIK-VORSCHLAEGE.md`.

## Brüche, Gleichungen, Abnehmer, Kopieren, Baukasten, ruhigere Oberfläche (Stand 05.11.2026)

- **Brüche** (Kapitel „Brüche“, Klasse 6): Bruch-Maschine `x/n` (teilt immer, Ergebnis als gekürzter Bruch, z. B. 3/4) und Kehrwert-Maschine `1/x`. Zahlen sind weiterhin Kommazahlen; Lager vergleichen mit kleiner Toleranz, Anzeige als Bruch (Nenner bis 1000). Level: 3 → 3/2, 3 → 3/4, Kürzen 6 → 2/3, Stammbrüche, 1/2 + 1/3 = 5/6 mit zwei Quellen, x/(x + 1), x/2 + x/3.
- **Gleichungen** (Klasse 7–8): x + 7 = 12, 3x = 21, 3x + 5 = 20, 2(x − 3) = 10 als Rückwärts-Level; dazu **Waagen** mit zwei Quellen, die dasselbe gewählte x ausgeben (`more[].pick`): Jede Seite wird ausgerechnet, ein fester Zusammenführer „Differenz“ vergleicht, das Lager will 0 (2x + 3 = x + 7, 5x − 4 = 3x + 6, x² = 4x + 5). Im Test passt jeweils genau ein x.
- **Abnehmer am Kartenrand** (offene Welt, `world.ts`): sechs Gebäude in den Ringen kaufen bestimmte Zahlen (24, Quadratzahlen, Primzahlen, Vielfache von 7, 100, über 200) für 8–25 Münzen. Sie arbeiten erst ab Auftrag 7 (`BUYERS_FROM`) und nur in freigekauftem Land; andere Zahlen nehmen sie nicht an.
- **Auswählen, Verschieben, Kopieren**: Werkzeug „Auswählen“ (Rahmen ziehen), dann Kopieren (beliebig oft einfügen, Drehen um 90°), Verschieben, Löschen; in der offenen Welt mit Münzen, im Level mit Maschinen-Grenze; Esc bricht ab.
- **Baukasten** (`custom.ts`): eigene Level bauen (Quelle, Lager, Felsen, Größe, Zahlen der Quelle, Wunsch des Lagers, Maschinen-Grenze, Werkzeugkasten bis Kapitel n), testen und als Link teilen (`#eigen=…`, Base64 im Link, kein Server).
- **Ruhigere Oberfläche**: Seitenleiste als eine Fläche mit Abschnitten statt Karten, Werkzeuge als leichte Symbole statt Kacheln, Nebenknöpfe ohne Rahmen, Kopfleiste ohne Rahmen, Level-Auswahl mit ruhigen Flächen.
- Bilder Runde 3 angefordert (37 Prompts in `docs/ZAHLENFABRIK-BILDER.md`).

## Höhere Preise in der offenen Welt (Stand 05.11.2026)

- Wunsch der Projektleitung: Man soll auf neue Teile sparen müssen. Nur die Preise steigen, alles andere bleibt (1 Münze je Zahl, 5 für eine zum Auftrag passende, Belohnungen und Abnehmer wie bisher).
- Band 2, Brücke 50, Zusammenführer + 60, − 120, × 250, ÷ 300, Weichen gerade? 150, ÷3? 250, >50? 250, Primzahl? 400, Quadratzahl? 400 Münzen; neue Gebiete 1.500 und 8.000 Münzen (vorher 400 und 2.500).

- **Zusammenführer nur für zwei verschiedene Stränge** (offene Welt): Die zweite Zahl muss aus einer anderen Richtung kommen (eine Zahl vom selben Band wartet davor), und beide müssen aus verschiedenen Quellen stammen (jede Zahl merkt sich ihre Quellen, `Item.src`). So kann sich kein Strom mit sich selbst addieren oder malnehmen, auch nicht über einen Kreis zurück; eine unpassende Zahl geht verloren.

- **Bilder Runde 3 eingebaut** (37 Stück): eigene Maschinen für Rest, Quersumme, Wurzel, Vorzeichen, Betrag, Spiegel, Runden, Bruch, Kehrwert und eine neutrale Maschine; Weiche „Quadratzahl?“, Wechsel-Weiche, vier Zusammenführer (Summe, Differenz, Produkt, Quotient), drei Abnehmer, Auswählen- und Baukasten-Bild, Kapitelbilder für alle übrigen Kapitel. Erklärkarten zeigen jetzt das passende Bild je Maschine bzw. Weiche.

## Maschinen mit Gedächtnis: Zähler und Sammler (Stand 09.11.2026)

Erster Schritt des Ausbaus „tiefer und spannender“ (Wunsch der Projektleitung, 09.11.2026). Neuer Abschnitt **„Maschinen mit Gedächtnis“** hinter dem Großmeister, damit die Rätsel der früheren Kapitel eindeutig bleiben.

- **Zähler-Maschine** (`1,2,3`, Kapitel 30): gibt jeder Zahl ihre Nummer – die erste wird zur 1, die zweite zur 2 … egal, was hineinkommt. Jeder Zähler zählt für sich. Level: 7, 7, 7, 7 → 1, 2, 3, 4; Zweierreihe aus Durcheinander (Zähler, ×2); Quadratzahlen aus allem (Zähler, x²); ungerade Zahlen (drei Maschinen); „Erste, zweite, dritte“ mit Weiche „gerade?“; Zahl mal Nummer mit zwei Quellen und Produkt.
- **Sammel-Maschine** (`Σx`, Kapitel 31): gibt die Summe aller Zahlen bisher aus. Level: Dreieckszahlen 1, 3, 6, 10, 15; Zehnerreihe aus 10, 10, 10, 10; Quadratzahlen aus 1, 3, 5, 7, 9; „Spartopf“ (sammeln, dann Weiche „größer als 40?“ trennt die Gesamtsumme 45 von den Zwischenständen); doppelt gesammelt 2, 6, 12, 20, 30; aus Dreien Dreieckszahlen (Zähler, dann Sammler); Dreieckszahlen rückwärts mit zwei Quellen und Differenz (T(x) − x = T(x − 1)).
- Rechenlogik (`model.ts`): `isStateful`, `applyMem` (Stand je Feld in `State.mem`), `applySeq` (eine Maschine auf eine ganze Folge, der Reihe nach). Löser und Tests rechnen Folgen damit der Reihe nach; das Tages- und Zufallsrätsel lässt Gedächtnis-Maschinen außen vor (Ziel immer > 10, damit kein Abkürzungsweg über Zähler und Runden entsteht).
- Bilder: ohne eigenes Bild das allgemeine Maschinenbild, umgefärbt (Zähler blaugrün, Sammler violett), in der gezeichneten Grafik mit Zählpunkten bzw. Haufen. Prompts für alle neuen Teile des Ausbaus (auch die der nächsten Schritte): `docs/ZAHLENFABRIK-BILDER.md`, Runde 4.

## Puffer-Maschine und Weiche „ganze Zahl?“ (Stand 09.11.2026, Schritt 2)

- **Puffer-Maschine** (`x₋₁`, Kapitel 32 im Abschnitt „Maschinen mit Gedächtnis“): hält immer eine Zahl fest; kommt die nächste, gibt sie die alte weiter und behält die neue (am Anfang liegt die 0 drin). Level: 4, 9, 2, 7 → 0, 4, 9, 2; verspätet verdoppelt; mit zwei Quellen und Zusammenführer vergleicht man Nachbarn: Abstände der Quadratzahlen (1, 3, 5, 7, 9), Nachbarn addieren (Fibonacci 1, 2, 3, 5, 8, 13), Kontostände → Zugänge, Zahl mal Vorgängerin; zwei Puffer verschieben um zwei.
- **Weiche „ganze Zahl?“** (`ganz?`, Kapitel nach den Brüchen, Klasse 6): ganze Zahlen geradeaus, Brüche zur Seite (`isWhole`, mit Toleranz für Rundungsreste). Level: ganz oder Bruch sortieren; durch 3 teilen und die ganzen Ergebnisse trennen; Halbe zurückholen (×2 hinter der Weiche); Kehrwert ganz (nur die 1 bleibt ganz).
- Ohne eigenes Bild: allgemeine Maschine bzw. Weiche, umgefärbt; gezeichnet mit Sanduhr bzw. ganzem und angeschnittenem Kreis.

## Schleife: Verteiler und Rückführung (Stand 10.11.2026, Schritt 3)

- Der **Verteiler** (jede Zahl als Kopie geradeaus und zur Seite) ist zurück im Werkzeugkasten – aber erst im späten Kapitel **„Schleife“** (Kapitel 34, Klasse 7–9). In allen Kapiteln davor gibt es ihn weiterhin nicht (Test), dort kommen mehrere Zahlen aus mehreren Quellen.
- **Schleife:** Die Quelle gibt nur **eine einzige Zahl** aus (`emit: 1`). Eine Kopie geht ins Lager, die andere läuft über Bänder im Kreis zurück. Mit einer Maschine im Kreis entsteht eine Folge.
- Level: 3, 5, 7, 9, 11 (+2 im Kreis); 1, 2, 4, 8, 16, 32 (×2); Zählen ohne Ende (Zähler im Kreis, vor dem Verteiler); Quadratzahlen im Kreis (Zähler im Kreis, x² dahinter); **Fibonacci** 1, 1, 2, 3, 5, 8, 13 (zwei Verteiler, Puffer, Zusammenführer „Summe“: die Zahl trifft im Kreis auf ihre Vorgängerin); Dreieckszahlen im Kreis (Zähler, +1, Summe); **3x+1-Folge** 6, 3, 10, 5, 16, 8, 4, 2, 1 (Weiche „gerade?“ im Kreis: ÷2 bzw. ×3, +1).
- Tests: Jede Musterlösung gewinnt; ersetzt man die Verteiler durch Bänder, gewinnt keine (die Rückführung ist nötig).
- Verteiler-Bild: `verteiler.webp`, sobald vorhanden; bis dahin die Weiche türkis umgefärbt.

## Rätsel mit Regeln, Vergleich mit der Musterlösung, Bestwerte (Stand 10.11.2026, Schritt 4)

- **Nebenbedingungen** (`levels.ts`: `ban`, `maxBelts`; Logik in `rules.ts`, Tests `tests/zahlenfabrik-regeln.test.ts`):
  - **Verbotene Bauteile** („ohne Plus- und Mal-Maschine“): fehlen im Werkzeugkasten des Levels (`kitFor`), die Regel steht bei der Aufgabe.
  - **Höchstens n Bänder:** Der Weg ist länger als die erlaubten Bänder; Maschinen zählen nicht als Bänder und müssen die Lücken füllen (z. B. +1, −1, ±, ± heben sich auf). Anzeige „Bänder 7/5“ (rot, wenn zu viele); mit zu vielen Bändern startet die Fabrik nicht und sagt, wie viele zu viel sind.
- **Kapitel „Rätsel mit Regeln“** (Kapitel 35, 9 Level): „Nur fünf Bänder“ (die 7 bleibt die 7), 4 → 64 ohne Mal (+4, x²), 5 → 20 ohne Plus und Mal (x², −5), 4 → 12 ohne Plus und Mal (x², −4), 5 → 20 mit vier Bändern, 5 → 255 ohne Plus und Minus (×3, ⇄, ×5), 3 → 36 ohne Quadrat und Mal (+10, ⇄, +5), 3 → 80 ohne Grundrechenarten (x², x², ≈10), 2 → 100 mit drei Bändern ohne Mal. Bei den Verbots-Rätseln gibt es mit der Maschinen-Grenze **genau einen Weg**, ohne das Verbot mindestens drei (Test).
- **Vergleich nach dem Sieg:** „Deine Fabrik hat 12 Teile. Geht es mit 3 Teilen weniger?“ bzw. „so klein wie die Musterlösung!“ (Maßstab ist `par`, die kleinste bekannte Fabrik aus den Tests).
- **Endgegner** (Schritt 5, letztes Kapitel, 5 Level, alle „Profi“): große Fabriken, die viele Bauteile zugleich brauchen; jede Musterlösung im Test, zusammen 15 verschiedene Bauteil-Arten.
  1. *Das Zählwerk:* 5, 5, 5, 5, 5, 5 → Zähler → Weiche „gerade?“ → oben x² (4, 16, 36), unten Sammler (1, 4, 9).
  2. *Zweierpotenzen:* Schleife mit ×2 aus einer 1; Weiche „Quadratzahl?“ → oben √ (1, 2, 4, 8, 16), unten Quersumme (2, 8, 5, 11).
  3. *Fibonacci sortiert:* Fibonacci-Schleife (zwei Verteiler, Puffer, Summe), dann Weiche „gerade?“: 2, 8, 34 und 1, 1, 3, 5, 13, 21.
  4. *Die Differenzen-Maschine:* zwei Quellen mit Kubikzahlen; zweimal Nachbarn vergleichen (Puffer, Differenz, Verteiler) → 1, 6, 12, 18, 24.
  5. *Das große Finale:* 1 … 8, Wechsel-Weiche und Produkt → 2, 12, 30, 56; Kopie über ×4, +1, √ → 3, 7, 11, 15 (4n(n+1)+1 = (2n+1)²).
- **Bestwerte:** wenigste Teile je Level, gespeichert neben den Sternen (`spiel:zahlenfabrik`, Feld `best`) – nur im eigenen Browser, kein Vergleich mit anderen. Anzeige „Dein Bestwert: 9 Teile“ bei der Aufgabe, „Neuer Bestwert!“ beim Unterbieten.


## Offene Welt: Erz-Arten und zwei neue Abnehmer (Stand 10.11.2026, Schritt 6)

Die Regeln der offenen Welt bleiben, wie sie sind (nur Zusammenführer und Weichen, Zusammenführer nur für zwei verschiedene Stränge, 1 Münze je Zahl bzw. 5 für eine passende, Preise unverändert).

- **Erz-Arten** (`world.ts`, `Spawner.ore`/`values`, `ORE_VALUES`): sechs besondere Quellen, die reihum eine ganze Zahlenreihe ausgeben und dann von vorn anfangen. Im mittleren Ring eine **Zähl-Quelle** (1 … 12) und eine **Quadratzahl-Quelle** (1, 4, 9 … 100), im äußeren Ring zwei **Primzahl-Quellen** (2, 3, 5 … 29), eine Quadratzahl- und eine Zähl-Quelle. Im Startgebiet gibt es keine. Aufschrift „1,2,3“, „n²“ bzw. „Prim“; ohne eigenes Bild die grüne Quelle umgefärbt.
- **Zwei neue Abnehmer** in den äußeren Ecken: „Vielfache von 12“ (10 Münzen) und „Dreieckszahlen“ (12 Münzen, `isTriangular`).
- **Alte Spielstände bleiben:** Alle bisherigen Quellen, Felsen und Abnehmer stehen an ihrem Platz (eigene Zufallsfolge für die Erz-Quellen, neue Abnehmer hinten in der Liste; Test). Nur wer im äußeren Ring genau auf einem der acht neuen Felder gebaut hatte, verliert dort das Teil.

## Ruhiges Design im Stil der Webseite (Stand 11.11.2026)

Der Spiel-Look „Bunte Werkstatt“ ist durch ein ruhiges Design ersetzt, das zur übrigen Webseite passt (Farben, Schrift, Karten und Knöpfe aus `global.css`, hell und dunkel). Neue Titelseite im Aufbau der Startseite, Aufgabe in einem Satz unter dem Titel, Seitenleiste in der Reihenfolge Start → Werkzeugkasten → Tipp und Kennzahlen, neutraler Boden. Einzelheiten: `docs/ZAHLENFABRIK-DESIGN.md` (Kasten am Anfang).

Offen: Freigabe durch die Projektleitung (`GAMES_PUBLIC`, Link in Kopfleiste/Startseite).

## Idee

Ein Fabrik-Spiel mit Zahlen: Zahlen laufen über Förderbänder durch Rechenmaschinen. Wer die Maschinen geschickt verbindet, erfüllt Aufträge. Dabei lernt man Rechenwege, Umkehroperationen, Teilbarkeit und später Terme und Funktionen. Eigener Name, eigene Grafik, eigene Level: kein Nachbau eines bestehenden Spiels.

## Spielprinzip

- **Raster** (z. B. 8 × 6 Felder), auf das man Teile setzt und dreht.
- **Quelle:** gibt Zahlen aus (z. B. immer 3, oder 1, 2, 3, …).
- **Förderband:** bringt Zahlen ein Feld weiter.
- **Maschinen:** `+n`, `−n`, `×n`, `÷n` (nur wenn es aufgeht), `x²`.
- **Weichen:** gerade/ungerade, „teilbar durch n“, „Primzahl?“, „größer als n“.
- **Zusammenführen:** zwei Zahlen werden zu ihrer Summe oder ihrem Produkt.
- **Lager (Ziel):** nimmt nur die richtigen Zahlen an.
- **Ablauf:** Bauen, dann „Start“. Die Zahlen laufen sichtbar Schritt für Schritt, auch langsam oder einzeln. Falsche Zahlen leuchten rot auf.

## Aufträge und Level (Vorschlag)

| Welt | Inhalt | Beispiel-Auftrag | ab Klasse |
| --- | --- | --- | --- |
| 1 Grundrechnen | +, −, ×, ÷ | „Mach aus 3 eine 20.“ | 5 |
| 2 Rückwärts | Umkehroperationen | „Ins Lager kommt 50. Was muss in die Quelle?“ | 5 |
| 3 Sortieren | gerade/ungerade, Teilbarkeit | „Nur Vielfache von 3 ins Lager A, der Rest in B.“ | 5–6 |
| 4 Primzahlen | Primzahl-Weiche, Zerlegen | „Zerlege 60 in Primfaktoren.“ | 5–6 |
| 5 Terme | Maschinen als Rechenvorschrift | „Baue 3x + 1 für x = 1 … 5.“ | 7–8 |
| 6 Funktionen | Wertetabelle am Lager | „Das Lager will die Werte von x².“ | 8–9 |

Je Welt etwa 6–8 Level, die schwerer werden.

## Spielgefühl

- Sterne je Level: Auftrag geschafft, mit wenigen Teilen, mit wenigen Takten.
- Bestenwert pro Level („Deine Fabrik: 7 Teile – geht es mit 6?“).
- Neue Maschinen werden nach und nach freigeschaltet.
- Spielstand nur im Browser, ohne Konto (wie beim KI-Abenteuer, gleiche Speicher-Schnittstelle).
- Sandkasten-Modus: frei bauen, ohne Auftrag.

## Technik

- Statisch im Browser, keine externen Dienste.
- Rechenlogik (Takt-Simulation, Prüfung der Aufträge) in einer eigenen Datei mit Tests.
- Bedienung mit Maus, Touch und Tastatur; am Handy einfache Level mit kleinem Raster.
- Ablage z. B. `src/spiele/zahlenfabrik/`, eigene Adresse `/de/zahlenfabrik/`.

## Recht

Ideen und Spielmechaniken sind frei. Nicht übernehmen: fremde Namen, Logos, Grafiken, Texte, Level oder Code. Keine 1:1-Nachbildung im Aussehen.

## Offene Fragen an die Projektleitung

- Name: „Zahlenfabrik“ oder etwas anderes?
- Erst Welt 1–4 (Klasse 5–6) als Probe?
- Eigene Spielfigur oder Bit aus dem KI-Abenteuer als Fabrikleiter?

## Sterne, Meldungen, Preise (10.11.2026)

- **Sterne nur für die Fabrik, nicht für den ersten Versuch:** ★ geschafft, ★★ mit höchstens `par + max(2, par/4)` Teilen (`goodPar`), ★★★ so klein wie die Musterlösung (`par`). Fehlversuche kosten keinen Stern mehr – jeder Stern lässt sich später noch holen. Alte Spielstände bekommen Sterne aus dem gespeicherten Bestwert nachgetragen.
- **Ziel „alle Sterne sammeln“:** Fortschrittsbalken für alle Sterne in der Level-Auswahl; wenn jedes Level geschafft ist, führt „Fehlende Sterne holen“ zum ersten Level ohne ★★★. Nach dem Sieg steht da, wie viele Teile der nächste Stern erlaubt.
- **Meldungen:** jede Einblendung hat ein X zum Wegklicken; reine Hinweise verschwinden nach ein paar Sekunden von selbst.
- **Offene Welt:** Bänder kosten beim Ziehen jetzt denselben Preis wie im Inventar (2 Münzen). Vorher kostete Ziehen 1 Münze, Abbauen gab aber 2 zurück – damit ließ sich Geld vermehren.

## 3D-Look (10.11.2026)

- **Gekippter Boden:** Das Spielfeld wird um 34° nach hinten geneigt (`perspective` + `rotateX` auf `.zf-world`). Einpassen, Zoomen und Verschieben rechnen weiter flach; `toFlat()` rechnet Bildschirmpunkte auf den geneigten Boden zurück (Tippen, Ziehen, Zoomen mit Mausrad und zwei Fingern).
- **Aussehen:** warmer Sandboden mit Kacheln und dicker Vorderkante, Bänder als Gleise mit Schwellen (laufen beim Start mit) und runden Kurven, Teile und Felsen mit Kante und Schatten, Zahlen stehen aufrecht auf dem Gleis. Nur CSS und SVG, keine neuen Bilder.
- **Handy gerade, PC in 3D:** am Handy (bis 640 px) standardmäßig von oben mit derselben Grafik.
- **Umschalten:** Würfel-Knopf unter den Zoom-Knöpfen schaltet zwischen 3D und „von oben“ (merkt sich der Browser, `spiel:zahlenfabrik:ansicht`).
- Angeregt von einem Spiel mit Zügen auf Sandboden (Blickwinkel, warme Farben, dicke Umrisse); keine Bilder oder Figuren daraus übernommen.
