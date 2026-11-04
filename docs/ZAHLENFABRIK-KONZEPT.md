# Zahlenfabrik: Kurzkonzept (Entwurf)

Stand 04.11.2026. Idee der Projektleitung. Welt 1 gibt es als grobe Probe zum Ausprobieren unter `/de/zahlenfabrik/` (nicht verlinkt, `GAMES_PUBLIC` in `src/spiele/index.ts`). Ohne Spielfigur: Man sieht die Fabrik von oben. Jedes Level liegt auf einer freien Fläche aus Kästchen (verschieben mit der Hand, zoomen mit zwei Fingern, Mausrad oder +/−); Bänder zieht man über die Kästchen, Maschinen zieht man aus dem Inventar auf die Karte; Felsen und vorgegebene Maschinen (🔒) stehen schon da. Bänder sind ein schmaler, laufender Streifen durch die Feldmitte (auch um Ecken). **Offene Welt** (🌍): Karte 40 × 28 mit 20 Zahlenquellen (nah an der Basis kleine Zahlen, weiter weg größere), Felsgruppen und einer Basis (3 × 3). Quellen geben ohne Ende aus, sobald ein Band vor ihnen liegt; alles, was in der Basis ankommt, zählt (Summe). Bauen geht auch während des Laufs, Bauten, Münzen und Aufträge bleiben im Browser (`world.ts`, Tests `tests/zahlenfabrik-welt.test.ts`). Code: `src/spiele/zahlenfabrik/` (Rechenlogik `model.ts`, Level `levels.ts`, Bauteile und Preise `parts.ts`, Aufträge `orders.ts`, Oberfläche `game.ts`), Tests `tests/zahlenfabrik*.test.ts`.

## Offene Welt: Münzen, Aufträge, Bauteile (Stand 04.11.2026)

- **Münzen:** Jede Zahl, die in der Basis ankommt, bringt so viele Münzen, wie sie groß ist (0 und negative Zahlen bringen nichts). Start mit 40 Münzen. Bänder kosten 1, Maschinen 8–250, Weichen 40–120, Zusammenführer 100/200. Abbauen gibt den vollen Preis zurück.
- **Aufträge an der Basis**, einer nach dem anderen (Liste in `orders.ts`): z. B. „Bring 10 Zahlen zur Basis“, „Liefere 10-mal die 4“, „Liefere 15 gerade Zahlen“, „Liefere nur Primzahlen: 20 hintereinander“ (eine andere Zahl setzt auf 0 zurück), „Liefere 10 Quadratzahlen“, „Liefere 50-mal die 12“. Jeder bringt Münzen und schaltet neue Teile frei; nach den 12 festen Aufträgen kommen endlos neue, schwerere. Gesperrte Teile zeigt das Inventar nur, wenn der aktuelle Auftrag sie freischaltet.
- **Weiche** (gerade?, ÷3?, Prim?, >50?): Was die Frage erfüllt, läuft geradeaus (✓), alles andere biegt zur Seite ab (✗). Antippen dreht; nach vier Drehungen wechselt die Seite (rechts/links).
- **Zusammenführen** (a+b, a×b): Die erste Zahl wartet, bis eine zweite kommt (aus jeder Richtung); dann läuft die Summe bzw. das Produkt weiter.
- **Stau:** Auf jedem Feld liegt höchstens eine Zahl. Ist das nächste Feld belegt und wird nicht frei, wartet die Zahl; eine Quelle wartet, solange ihr Feld belegt ist. Wollen zwei Zahlen aufs selbe Feld, hat die von hinten Vorrang, sonst wechseln sich die Seiten ab. Ein voller Kreis (ab drei Feldern) dreht sich weiter; zwei Zahlen, die sich gegenüberstehen, blockieren sich.
- Anzeige: Auftrag mit Fortschrittsbalken über dem Inventar, Münzen und Stand oben links im Spielfeld, „+n 🪙“ an der Basis, Jubel bei geschafftem Auftrag.

Offen: größere bzw. erweiterbare Karte, Tunnel/Brücke, Level-Welten 2–6, schönere Grafik, Einführung, Tastatur.

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
