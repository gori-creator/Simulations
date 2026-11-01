# KI-Abenteuer: Konzept und Umsetzung

Stand 01.11.2026. Name „KI-Abenteuer“, roter Faden „Bit, der Roboter, den man trainiert“ und die 6 Bereiche hat die Projektleitung am 01.11. freigegeben. Alle 18 Lektionen sind als erste Fassung gebaut (siehe „Umsetzung“). Bis zur Freigabe nach dem Probespielen ist der Kurs nur über die Adresse erreichbar (`/de/ki-abenteuer/`), nicht verlinkt und nicht in Suchmaschinen (`COURSES_PUBLIC` in `src/kurse/index.ts`).

## Ziel

Ein spielerischer Kurs („Gamification“), der Schülern erklärt, **wie Künstliche Intelligenz funktioniert**: von Daten und Mustern über lernende Modelle bis zu Sprachmodellen. Der Schwerpunkt liegt auf den Grundlagen, nicht auf der Bedienung einzelner KI-Werkzeuge. Hinweise zum sinnvollen Umgang kommen als eigenes, kleines Modul dazu.

## Annahmen (bitte bestätigen oder ändern)

- **Zielgruppe (festgelegt):** ab **Klasse 5**, ohne Vorkenntnisse. Sehr einfache Sprache, kurze Lektionen, viel Ausprobieren, wenig Text. Später eine Vertiefung für ältere Schüler (ab etwa Klasse 8 bis zur Oberstufe) als eigene Stufe.
- **Spielweise (festgelegt):** **sehr gamifiziert**: Der Spielgedanke steht vorne, Erklärungen kommen in kleinen Häppchen.
- **Einsatz:** in der Schule und zu Hause, frei zugänglich, kostenlos.
- **Fortschritt (festgelegt):** zuerst **ohne Konten**, nur lokal im Browser (keine Anmeldung, keine Daten an uns). Das Spielstandsmodul wird aber so gebaut, dass Konten später ergänzt werden können (siehe „Konten später“).
- **Keine echte KI im Netz (festgelegt):** Alle Beispiele laufen im Browser mit kleinen, selbst gerechneten Modellen. Schüler benutzen keine echte KI, auch keinen Chat mit einem Sprachmodell, und es werden keine externen Dienste genutzt. Es geht darum, wie KI funktioniert.
- **Sprachen:** wie bisher Deutsch und Englisch.

## Umsetzung

Der Kurs ist kein Fach im Lehrplan, sondern ein eigener Bereich `src/kurse/` (eigene Adressen, eigene Tests, berührt die Simulationen und Länder-Lehrpläne nicht):

- `src/kurse/ki-abenteuer/index.ts`: Bereiche und Lektionen (Titel, Adresse, Symbol, Dauer, `status`).
- `src/kurse/ki-abenteuer/lessons/<id>.ts`: Schritte einer Lektion – `say` (Bit erzählt), `choice` (Frage, genau eine richtige Antwort), `game` (Spiel), `info` („Für Neugierige“).
- `src/kurse/ki-abenteuer/games/<name>.ts`: die Spiele (Oberfläche ohne innerHTML, Bausteine in `parts/` und `engine/ui.ts`).
- `src/kurse/ki-abenteuer/models/*.ts`: Rechenlogik und Daten der Spiele, getestet in `tests/kurs-*.test.ts`.
- `src/kurse/engine/`: Spielstand (`progress.ts`: XP, 10 Stufen, Sterne, Abzeichen, Serie, Code zum Mitnehmen), Speicher (`store.ts`, Schnittstelle `ProgressStore`), Bit als SVG (`bit.ts`), Karte (`hub.ts`), Lektionsablauf (`lesson.ts`).
- Seiten: `src/views/KursView.astro` (Karte), `src/views/LektionView.astro`; Aussehen `src/styles/kurs.css`; Oberflächentexte `src/kurse/strings.ts`.

**Neue Lektion:** Eintrag in `index.ts`, Datei in `lessons/`, ggf. Spiel in `games/` und Modell mit Test. Danach `npm run verify`. Hinweis: Neue Dateien findet der Testlauf über `import.meta.glob`; meldet ein Test eine fehlende Lektion, obwohl die Datei da ist, den Ordner `node_modules/.vitest-cache` löschen.

**Wertung:** Fehler in Fragen und Spielen ergeben Sterne (0 Fehler: 3, 1–2: 2, sonst 1). XP: 20 + 10 je Stern, beim Wiederholen nur für Verbesserungen; je Abzeichen 20 XP. Lektionen werden der Reihe nach frei; „Alle Lektionen freischalten“ in den Einstellungen der Karte (für Lehrkräfte).

### Lektionen (erste Fassung)

| Bereich | Lektion | Spiel |
| --- | --- | --- |
| 1 Bit erwacht | Hallo, ich bin Bit | Regeln für Katze/Hund – keine Regel schafft alle (höchstens 6 von 9) |
| | KI im Alltag | Karten „KI / keine KI“ |
| | Aus Beispielen lernen | Äpfel und Birnen zeigen, Probe nach jedem Beispiel (nächster Nachbar) |
| 2 Daten und Muster | Gute Merkmale | Merkmal wählen, Bit sortiert Vögel/Säugetiere (Federn 10/10, Fotos 6/10) |
| | Die Grenze finden | Linie zwischen Zitronen und Orangen ziehen |
| | Falsche Daten | drei falsch beschriftete Früchte finden; Probe steigt von 75 % auf 100 % |
| 3 Bit lernt | Frag die Nachbarn | k = 1, 3, 5; Zwergkaninchen als Ausreißer |
| | Der Fragen-Baum | Entscheidungsbaum bauen (am kürzesten: 2 Fragen) |
| | Üben und Prüfen | Überanpassung: Übung gegen Probe je nach Zahl der Nachbarn |
| 4 Bits Gehirn | Ein Neuron | Gewichte und Schwelle für „Kino ja/nein“ |
| | Das Neuron lernt | Perzeptron-Lernregel Schritt für Schritt (rund 30 Schritte) |
| | Bergab lernen | Gradientenabstieg, zwei Täler, Schrittweite (Lernrate) wählen |
| 5 Bilder und Sprache | Bilder sind Zahlen | Smiley aus Zahlen nachmalen (7 × 7) |
| | Zeichen erkennen | Kreuz/Kreis/Strich zeichnen, Probe mit verwackelten Zeichnungen |
| | Das nächste Wort | Wortpaar-Modell aus 11 Sätzen; erfundene, aber richtig klingende Sätze |
| 6 KI und wir | Ist das fair? | nur Turnschuhe gelernt → Sandalen falsch; Beispiele ergänzen |
| | Stimmt das? | Karten „stimmt / stimmt nicht“, Quellen prüfen |
| | Meine Daten | Karten „okay zu teilen / lieber nicht“ |

Offen: Probespielen durch die Projektleitung und mit Schülern; fachliche und sprachliche Durchsicht (Entwurf); Englisch gegenlesen; danach `COURSES_PUBLIC = true` und Hinweis auf der Startseite.

## Kursplan (Vorschlag, 6 Bereiche, rund 20 Lektionen)

Für Klasse 5 bis 7 wird jede Lektion als kleines Spiel gebaut (Ordnen, Sortieren, Raten, Training eines „Haustiers“ oder Roboters). Begriffe wie „Gewicht“ oder „Gradient“ werden erst über Bilder und Spiele eingeführt, die genaue Fachsprache steht in einer ausklappbaren Zusatzerklärung („Für Neugierige“). So kann dieselbe Lektion für ältere Schüler tiefer erklärt werden.

1. **Was ist KI?** Regeln gegen Lernen: ein Spamfilter mit festen Regeln und einer, der aus Beispielen lernt. KI im Alltag erkennen.
2. **Daten und Muster.** Daten sammeln, Merkmale wählen, Ausreißer. Streudiagramm: Wo liegt die Grenze zwischen zwei Gruppen?
3. **Lernen aus Beispielen.** Nächster-Nachbar-Verfahren, Entscheidungsbaum zum Selbstbauen, Training und Test, Überanpassung.
4. **Neuronale Netze.** Ein Neuron, Gewichte und Schwelle, ein Netz verschieben und beobachten, Fehler und Lernrate, Training als „Bergabwandern“ (Gradientenabstieg).
5. **Bilder und Sprache.** Wie ein Bild zu Zahlen wird, Zeichen erkennen, Wörter als Zahlen, Vorhersage des nächsten Wortes, warum Sprachmodelle überzeugend klingen, aber irren können.
6. **KI und Gesellschaft.** Verzerrte Daten und Fairness, Fehlentscheidungen, Datenschutz, Urheberrecht, Umgang mit KI-Antworten (prüfen, nicht blind vertrauen).

Jede Lektion hat: eine Frage, eine Simulation zum Ausprobieren, eine kurze Erklärung und 2 bis 4 Aufgaben mit sofortiger Rückmeldung.

## Spielmechanik

- **Punkte (XP)** für gelöste Aufgaben, mehr für Aufgaben ohne Hinweis.
- **Abzeichen** je Bereich und für Besonderes (z. B. „Hast den Fehler im Modell gefunden“).
- **Weg durch den Kurs:** eine Karte mit freigeschalteten Lektionen. Jede Lektion schaltet die nächste frei, wiederholen ist immer möglich.
- **Serie:** Tage in Folge lernen, nur lokal sichtbar. Kein Druck, keine Strafen.
- **Keine Bestenlisten und keine Vergleiche zwischen Schülern** (Datenschutz, kein Wettbewerbsdruck).
- Wer den Fortschritt behalten will, kann ihn als Datei oder Code **exportieren und wieder importieren**.
- Figuren, Farben und Töne sind kindgerecht, aber nicht kindisch, damit ältere Schüler es auch mögen. Töne sind aus und lassen sich nicht erzwingen (Barrierefreiheit, reduzierte Bewegung wie auf der Startseite).

## Konten später (offen halten)

Der Spielstand wird hinter einer kleinen Schnittstelle gespeichert (`ProgressStore` mit `load`, `save`, `export`, `import`). Heute schreibt sie in den Local Storage. Später kann dieselbe Schnittstelle an einen Server mit Anmeldung angeschlossen werden, ohne dass die Lektionen geändert werden müssen. Dafür sind dann nötig (nicht Teil dieser Phase):

- ein Server und eine Datenbank, Einwilligung und Datenschutzprüfung, besonders für Kinder unter 16 (Eltern bzw. Schule);
- eine Lösung, die ohne Klarnamen auskommt (z. B. Klassencode oder Pseudonym);
- Angaben in Impressum und Datenschutzerklärung und ein Löschweg für Nutzerdaten.

## Technik und Aufwand

- Rechnen im Browser: kleine Modelle (Punktwolken, ein paar Neuronen, einfache Zeichenerkennung) laufen ohne Server und ohne große Bibliothek.
- Nichts Neues im Hosting: statische Dateien auf STRATO wie bisher.
- Grober Aufwand: etwa 1 Lektion (Simulation, Text, Aufgaben, Tests) entspricht dem Aufwand einer bisherigen Simulation. Das Spielgerüst (Spielstand, Karte, Abzeichen) kommt einmalig dazu. Ein erster Bereich mit 3 bis 4 Lektionen reicht für einen Test mit Schülern.

## Recht und Datenschutz

- Ohne Konten und ohne Übertragung bleibt die Datenschutzerklärung fast unverändert. Es kommt nur der Spielstand im Local Storage dazu (ein Satz im Abschnitt „Speicherung im Browser“).
- **Würden später echte KI-Dienste oder Konten genutzt**, braucht es eine neue Prüfung (Auftragsverarbeitung, Minderjährige, Einwilligung). Das ist nicht Teil dieses Konzepts.
- Fachliche Aussagen (besonders zu Sprachmodellen, Fairness, Urheberrecht) sorgfältig formulieren und von einer fachkundigen Person prüfen lassen. Unsicheres als Entwurf kennzeichnen.
- Bilder und Beispieldaten selbst erzeugen oder frei lizenzieren; Herkunft in `docs/BILDRECHTE.md` eintragen.

## Vorgehen

1. Konzept freigeben und Annahmen bestätigen (Zielgruppe, nur lokaler Fortschritt, keine echte KI im Netz).
2. **Gerüst:** neues Fach `ki`, Spielstand-Modul, Kursseite mit Karte.
3. **Bereich 1 und 2** als erster Test (rund 6 Lektionen), mit Schülern ausprobieren.
4. Rückmeldungen einbauen, dann Bereiche 3 bis 6.
5. Texte fachlich und sprachlich prüfen lassen, dann veröffentlichen.

## Offene Entscheidungen der Projektleitung

- Name des Fachs (z. B. „KI und Daten“, „KI verstehen“, „KI-Abenteuer“).
- Soll der Kurs auf der Startseite als eigenes Fach neben den MINT-Fächern erscheinen?
- Sollen Lehrkräfte später etwas sehen können (z. B. Klassencode)? Das ginge nur mit Server und ist zunächst nicht vorgesehen.
- Welche Spielfigur bzw. welcher rote Faden trägt den Kurs (z. B. ein Roboter, den man trainiert)?
