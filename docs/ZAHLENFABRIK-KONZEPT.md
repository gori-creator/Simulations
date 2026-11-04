# Zahlenfabrik: Kurzkonzept (Entwurf)

Stand 04.11.2026. Idee der Projektleitung. Welt 1 gibt es als grobe Probe zum Ausprobieren unter `/de/zahlenfabrik/` (nicht verlinkt, `GAMES_PUBLIC` in `src/spiele/index.ts`). Ohne Spielfigur: Man sieht die Fabrik von oben. Jedes Level liegt auf einer freien Fläche aus Kästchen (verschieben mit der Hand, zoomen mit zwei Fingern, Mausrad oder +/−); Bänder zieht man über die Kästchen, Maschinen zieht man aus dem Inventar auf die Karte; Felsen und vorgegebene Maschinen (🔒) stehen schon da. Bänder sind ein schmaler, laufender Streifen durch die Feldmitte (auch um Ecken). **Offene Welt** (🌍): Karte 40 × 28 mit 20 Zahlenquellen (nah an der Basis kleine Zahlen, weiter weg größere), Felsgruppen und einer Basis (3 × 3). Quellen geben ohne Ende aus, sobald ein Band vor ihnen liegt; alles, was in der Basis ankommt, zählt (Summe). Bauen geht auch während des Laufs, Bauten, Münzen und Aufträge bleiben im Browser (`world.ts`, Tests `tests/zahlenfabrik-welt.test.ts`). Code: `src/spiele/zahlenfabrik/` (Rechenlogik `model.ts`, Level `levels.ts`, Bauteile und Preise `parts.ts`, Aufträge `orders.ts`, Oberfläche `game.ts`), Tests `tests/zahlenfabrik*.test.ts`.

## Offene Welt: Münzen, Aufträge, Bauteile (Stand 04.11.2026)

- **Münzen:** Jede Zahl, die in der Basis ankommt, bringt so viele Münzen, wie sie groß ist (0 und negative Zahlen bringen nichts). Start mit 40 Münzen. Bänder kosten 1, Maschinen 8–250, Weichen 40–120, Zusammenführer 100/200. Abbauen gibt den vollen Preis zurück.
- **Aufträge an der Basis**, einer nach dem anderen (Liste in `orders.ts`): z. B. „Bring 10 Zahlen zur Basis“, „Liefere 10-mal die 4“, „Liefere 15 gerade Zahlen“, „Liefere nur Primzahlen: 20 hintereinander“ (eine andere Zahl setzt auf 0 zurück), „Liefere 10 Quadratzahlen“, „Liefere 50-mal die 12“. Jeder bringt Münzen und schaltet neue Teile frei; nach den 12 festen Aufträgen kommen endlos neue, schwerere. Gesperrte Teile zeigt das Inventar nur, wenn der aktuelle Auftrag sie freischaltet.
- **Weiche** (gerade?, ÷3?, Prim?, >50?): Was die Frage erfüllt, läuft geradeaus (✓), alles andere biegt zur Seite ab (✗). Antippen dreht; nach vier Drehungen wechselt die Seite (rechts/links).
- **Zusammenführen** (a+b, a×b): Die erste Zahl wartet, bis eine zweite kommt (aus jeder Richtung); dann läuft die Summe bzw. das Produkt weiter.
- **Stau:** Auf jedem Feld liegt höchstens eine Zahl. Ist das nächste Feld belegt und wird nicht frei, wartet die Zahl; eine Quelle wartet, solange ihr Feld belegt ist. Wollen zwei Zahlen aufs selbe Feld, hat die von hinten Vorrang, sonst wechseln sich die Seiten ab. Ein voller Kreis (ab drei Feldern) dreht sich weiter; zwei Zahlen, die sich gegenüberstehen, blockieren sich.
- Anzeige: Auftrag mit Fortschrittsbalken über dem Inventar, Münzen und Stand oben links im Spielfeld, „+n 🪙“ an der Basis, Jubel bei geschafftem Auftrag.
- **Größere Karte** (72 × 52) in drei Gebieten: Das Startgebiet (40 × 28, wie die frühere Karte) ist offen, zwei Ringe darum kauft man frei (400 und 2.500 Münzen, Knopf „🗺️ Neues Gebiet“). Gesperrtes Land liegt unter Nebel; seine Quellen geben noch nichts aus. Weiter draußen geben die Quellen größere Zahlen (Start 1–9, mittlerer Ring 5–24, außen bis 50). Alte Spielstände werden ins neue Raster verschoben (`START_OFFSET`).
- **Brücke** (15 Münzen, ab Auftrag 2): Zahlen laufen geradeaus darüber, waagerecht und senkrecht getrennt – so kreuzen sich zwei Bänder.
- **Leistung:** Ein Takt mit rund 400 Zahlen auf einer voll bebauten Karte braucht etwa 1 ms; im Browser läuft „Schnell“ dabei ohne Ruckeln (höchstens 600 Zahlen gleichzeitig).

## Level-Welten (Stand 04.11.2026)

Sechs Welten mit je sechs Leveln (`levels.ts`, `WORLDS`); in der Leiste wählt man erst die Welt, dann das Level. Jedes Level hat im Test eine Musterlösung, und das Teile-Ziel für den zweiten Stern ist die kleinste gefundene Fabrik (kürzester Weg bzw. kleinste Fabrik mit Weiche, `tests/zahlenfabrik-welten.test.ts`, Löser `tests/zahlenfabrik-loeser.ts`).

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
