# Konzept: KI-Grundlagenkurs (Entwurf)

Stand 31.10.2026. Entwurf der Projektleitung und des Assistenten; Zielgruppe, Spielweise und Konten am 31.10. von der Projektleitung festgelegt, der Rest noch nicht freigegeben. Gebaut wird erst nach Freigabe.

## Ziel

Ein spielerischer Kurs („Gamification“), der Schülern erklärt, **wie Künstliche Intelligenz funktioniert**: von Daten und Mustern über lernende Modelle bis zu Sprachmodellen. Der Schwerpunkt liegt auf den Grundlagen, nicht auf der Bedienung einzelner KI-Werkzeuge. Hinweise zum sinnvollen Umgang kommen als eigenes, kleines Modul dazu.

## Annahmen (bitte bestätigen oder ändern)

- **Zielgruppe (festgelegt):** ab **Klasse 5**, ohne Vorkenntnisse. Sehr einfache Sprache, kurze Lektionen, viel Ausprobieren, wenig Text. Später eine Vertiefung für ältere Schüler (ab etwa Klasse 8 bis zur Oberstufe) als eigene Stufe.
- **Spielweise (festgelegt):** **sehr gamifiziert**: Der Spielgedanke steht vorne, Erklärungen kommen in kleinen Häppchen.
- **Einsatz:** in der Schule und zu Hause, frei zugänglich, kostenlos.
- **Fortschritt (festgelegt):** zuerst **ohne Konten**, nur lokal im Browser (keine Anmeldung, keine Daten an uns). Das Spielstandsmodul wird aber so gebaut, dass Konten später ergänzt werden können (siehe „Konten später“).
- **Keine echte KI im Netz (festgelegt):** Alle Beispiele laufen im Browser mit kleinen, selbst gerechneten Modellen. Schüler benutzen keine echte KI, auch keinen Chat mit einem Sprachmodell, und es werden keine externen Dienste genutzt. Es geht darum, wie KI funktioniert.
- **Sprachen:** wie bisher Deutsch und Englisch.

## Aufbau im Projekt

Der Kurs wird ein neues **Fach** neben Mathematik, Physik und Chemie (z. B. `ki`, Titel „KI und Daten“). Die vorhandene Struktur aus Fach, Bereich, Thema und Simulation wird genutzt:

- `src/curriculum/ki.ts`: Bereiche und Themen, Reihenfolge wie im Kurs.
- `src/simulations/ki/<id>/`: je Lektion eine interaktive Simulation (Canvas, wie bisher). Die Rechenlogik steht in `model.ts` und ist getestet.
- `src/content/simulations/{de,en}/<id>.md`: Erklärtext zur Lektion.
- Spielstand, Punkte und Abzeichen in einem kleinen Modul in `src/sim-core/` bzw. `src/lib/`, gespeichert im „Local Storage“ des Browsers.

Alle Regeln aus `CLAUDE.md` gelten unverändert (zweisprachig, Farben nur über `ctx.theme`, keine externen Ressourcen, Tests für Rechenlogik).

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
