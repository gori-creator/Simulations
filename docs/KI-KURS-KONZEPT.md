# KI-Kurse: Konzept und Umsetzung

Stand 03.11.2026 (nachts überarbeitet: Merksätze, Wiederholen, Quellen, Handreichung, Animationen, Bilder vorbereitet). Es gibt zwei Kurse auf zwei Stufen, beide als vollständige erste Fassung gebaut:

| Kurs | Für | Begleitung | Umfang | Adresse |
| --- | --- | --- | --- | --- |
| **KI-Abenteuer** | Klasse 5–10 | Bit, ein Roboter, den man trainiert | 9 Welten, 34 Lektionen à 5–8 Minuten (rund 4 Stunden) | `/de/ki-abenteuer/` |
| **KI-Labor** | Klasse 11–13 | Ada, die Laborassistenz (eine schwebende Kugel, benannt nach Ada Lovelace) | 8 Welten, 31 Lektionen à 10–15 Minuten (rund 6 Stunden) | `/de/ki-labor/` |

Beide Kurse stehen auf der Übersichtsseite `/de/ki-kurse/` (englisch `/en/ai-courses/`). Bis zur Freigabe sind sie nur über die Adresse erreichbar, nicht verlinkt und nicht in Suchmaschinen (`COURSES_PUBLIC = false` in `src/kurse/index.ts`).

Freigegeben hat die Projektleitung am 01.11.: Name „KI-Abenteuer“, Bit als roter Faden, die ersten 6 Bereiche. Auf ihren Wunsch vom 02.11. kamen dazu: die zweite Stufe (KI-Labor), mehr Spiel (Welten, Missionen, Wissenskarten), die Geschichte der KI als zweiter roter Faden und die Erweiterung des KI-Abenteuers auf 9 Welten. Diese Erweiterung ist noch nicht durchgesehen (siehe „Offen“).

## Ziel

Die Kurse sollen zeigen, **wie KI funktioniert** und **wie sie entstanden ist**: von Regeln und Suche über das Lernen aus Daten und neuronale Netze bis zu Sprach- und Bildmodellen. Es geht um Grundlagen, nicht um die Bedienung bestimmter KI-Werkzeuge. Jede Welt verbindet drei Blickwinkel (nach dem „Dagstuhl-Dreieck“ der Gesellschaft für Informatik):

- **Wie funktioniert das?** Daten, Merkmale, Modelle, Training, Netze, Sprachmodelle – jedes Mal mit einem echten kleinen Modell zum Anfassen.
- **Wie wirkt das?** Fairness, Feeds und Filterblasen, Fälschungen, Datenschutz, Regeln wie der AI Act.
- **Wie nutze ich das?** Antworten prüfen, lernen statt abschreiben, die eigenen Daten schützen.

## Grundlagen und Quellen

Die Kurse stützen sich auf Bildungsrahmen und auf Forschung zum Lernen über KI. Alles ist in eigenen Worten umgesetzt; übernommen sind nur Ideen.

**Rahmen für KI-Bildung**

- AI4K12, „Five Big Ideas in AI“ (Touretzky, Gardner-McCune, Martin & Seehorn 2019, AAAI): Wahrnehmung, Darstellung und Schlussfolgern, Lernen, natürliche Interaktion, gesellschaftliche Wirkung. Jede Idee hat mindestens eine Welt (Sehen und Sprache, Regeln und Suche, Lernen aus Daten und Netze, Chatbots, „KI und wir“).
- UNESCO (2024), „AI competency framework for students“: vier Dimensionen (menschzentrierte Haltung, Ethik der KI, KI-Techniken und -Anwendungen, Gestaltung von KI-Systemen) in drei Stufen (verstehen, anwenden, gestalten). Das KI-Abenteuer zielt vor allem auf „verstehen“ und „anwenden“, das KI-Labor auch auf „gestalten“ (eigene Netze, Belohnungsmodelle, Fairness-Schwellen).
- Dagstuhl-Erklärung der Gesellschaft für Informatik (2016): technologische, gesellschaftlich-kulturelle und anwendungsbezogene Perspektive („Drei Blickwinkel“ auf der Übersichtsseite).
- KMK, „Handlungsempfehlung für die Bildungsverwaltung zum Umgang mit Künstlicher Intelligenz in schulischen Bildungsprozessen“ (10.10.2024): konstruktiv-kritischer Umgang statt Verbot; KI-Kompetenz als Teil der Bildung in der digitalen Welt.
- KI-Verordnung der EU (Verordnung (EU) 2024/1689), Art. 4 „KI-Kompetenz“ (gilt seit 2. Februar 2025): Wer KI einsetzt, soll für ausreichende KI-Kompetenz sorgen. Die Kurse sind ein Baustein dafür.
- Long & Magerko (2020), „What is AI Literacy? Competencies and Design Considerations“ (CHI 2020): u. a. Erklärbarkeit, Daten in Zusammenhang stellen, schrittweise aufdecken („unveil gradually“), Vorwissen aufgreifen, niedrige Einstiegshürde – alles Leitlinien der Kurse.

**Was Schüler über KI denken (Vorstellungen)**

- Mertala, Fagerlund & Calderon (2022), Computers and Education: AI 3, 100095: 195 finnische Fünft- und Sechstklässler; die Rolle von **Daten** kam in ihren Erklärungen praktisch nicht vor, KI wurde oft **menschenähnlich** beschrieben. Folgerung: technische Grundlagen alltäglicher KI zeigen, besonders Daten. Darum beginnt das KI-Abenteuer mit „Aus Beispielen lernen“ und hat eine eigene Welt „Daten und Muster“.
- Marx, Leonhardt & Bergner (2023), Computers and Education: AI 5, 100169 (Übersicht über 18 Studien zu Vorstellungen und Einstellungen von Schülern der Sekundarstufe zu KI).
- Experience AI (Raspberry Pi Foundation und Google DeepMind): Vermenschlichung von KI in Sprache und Bildern vermeiden, weil sie davon ablenkt, dass Menschen KI bauen und verantworten. Umsetzung hier: Klartext-Kästen und keine Roboter-Gesichter auf den Kursbildern.

**Lernen**

- Vermuten, beobachten, erklären („Predict – Observe – Explain“, White & Gunstone 1992): die Vermutungsfragen vor den Spielen.
- Abrufen statt nur wiederlesen (Testing-Effekt, Roediger & Karpicke 2006, Psychological Science 17(3), 249–255) und verteilt wiederholen (Cepeda et al. 2006, Psychological Bulletin 132(3), 354–380): Merksätze am Ende jeder Lektion und das Wiederholen je Welt.
- Ohne Computer verstehen: „AI Unplugged“ (Lindner, Seegerer & Romeike 2019, FAU Erlangen-Nürnberg, aiunplugged.org) als Ideenquelle für die Vorschläge „Ohne Computer“ in der Handreichung für Lehrkräfte.

**Fachliche Quellen:** Jede Wissenskarte nennt ihre Originalquelle (`src/kurse/<kurs>/quellen.ts`), sichtbar auf der Karte im Album und am Ende der Lektion.

## Leitlinien

1. **Erst vermuten, dann ausprobieren, dann erklären.** Viele Lektionen beginnen mit einer Vermutungsfrage („Was glaubst du?“). Dort gibt es keine falschen Antworten; die Auflösung kommt nach dem Spiel.
2. **Echte Modelle statt Attrappen.** Jedes Spiel rechnet mit einem kleinen, selbst geschriebenen Modell im Browser (k-nächste Nachbarn, Entscheidungsbaum, Perzeptron, Q-Lernen, Sprachmodell aus Wortpaaren, Entrauschen …). Was ein Text behauptet (z. B. „Lernrate 0,2 schaukelt sich auf“, „Alpha-Beta braucht weniger als ein Fünftel der Knoten“), ist durch Tests in `tests/kurs-*.test.ts` abgesichert.
3. **Klartext statt Vermenschlichung.** Bit und Ada sagen „ich denke“ und „ich habe gelernt“, weil das Geschichten trägt. Kästen „Klartext“ (`info` mit `tone: 'plain'`) sagen dann nüchtern, was wirklich passiert: Es wird gezählt, verglichen und gerechnet. Die erste Lektion stellt das klar („Wer ist Bit?“).
4. **Geschichte als roter Faden.** Jede Lektion schenkt eine Wissenskarte mit Jahr (von 1763 bis heute). Die Karten sammeln sich in einem Album auf der Kurskarte, nach Jahr sortiert. Welten tragen Zeitspannen, Zeitstrahl-Spiele ordnen Meilensteine, die letzte Mission jedes Kurses blickt auf die ganze Geschichte zurück.
5. **Fachsprache in Stufen.** Im KI-Abenteuer gibt es keine Formeln; Fachwörter stehen in Kästen „Für Neugierige“. Das KI-Labor benutzt die echten Begriffe und zeigt Formeln (`info` mit `formula`), etwa für kleinste Quadrate, Entropie, Softmax oder die Q-Lern-Regel.
6. **Verantwortung in jeder Welt, nicht nur am Ende.** Schon ELIZA hat eine Hilfe-Regel (bei Sätzen wie „Ich will nicht mehr leben“ nennt sie die Nummer gegen Kummer 116 111), der Chatbot zeigt „freundlich heißt nicht richtig“, der Steckbrief lehrt, Grenzen offen zu sagen.
7. **Keine echte KI im Netz.** Schüler benutzen keinen Chat mit einem Sprachmodell, es werden keine externen Dienste aufgerufen, und nichts verlässt den Browser.

## Spielmechanik

- **Lektion** = Folge von Schritten (`src/kurse/types.ts`): `say` (Begleitung erzählt), `choice` (Frage mit genau einer richtigen Antwort), `predict` (Vermutung ohne Wertung), `game` (Spiel), `info` („Für Neugierige“, „Klartext“, optional mit Formel).
- **Sterne:** Fehler in Fragen und Spielen zählen (0 Fehler: 3 Sterne, 1–2: 2, sonst 1).
- **XP:** 20 + 10 je Stern; beim Wiederholen nur für Verbesserungen; je Abzeichen 20 XP. XP lassen sich jederzeit aus Sternen und Abzeichen neu berechnen (`computeXp`).
- **Stufen:** 10 je Kurs mit eigenen Namen (KI-Abenteuer: Funke … Meister; KI-Labor: Lochkarte, Relais, Röhre … Supercomputer). Bit und Ada verändern ihr Aussehen mit der Stufe.
- **Abzeichen:** eines je Welt (Symbol der Welt), ein Abschlussabzeichen je Kurs und „Kartensammler“ für 10 Wissenskarten.
- **Missionen:** Die letzte Lektion vieler Welten ist eine Mission, die das Gelernte zusammenführt (im KI-Labor jede Welt).
- **Kurskarte:** Welten als Pfad mit Stationen; geschaffte Stationen mit Sternen, gesperrte mit Schloss, die nächste mit „Weiter“. Darunter Album und Abzeichen.
- **Serie:** Tage in Folge, nur lokal sichtbar. Kein Druck, keine Strafen.
- **Keine Bestenlisten** und keine Vergleiche zwischen Schülern.
- **Merksätze und Spickzettel:** Jede Lektion endet mit einem Merksatz („Das nimmst du mit“). Auf der Kurskarte sammelt jede Welt die Merksätze geschaffter Lektionen als Spickzettel.
- **Wiederholen:** Je Welt fünf gemischte Fragen aus den geschafften Lektionen mit Sofort-Rückmeldung (Abrufübung). Das beste Ergebnis zählt (2 XP je richtiger Antwort, nur für Verbesserungen), Abzeichen „Gutes Gedächtnis“ für eine fehlerfreie Runde, Hinweis „Zeit zum Wiederholen“ nach drei Tagen.
- **Animationen:** Figuren bewegen beim Sprechen den Mund; am Ende einer Lektion zählen die XP hoch, der Balken wächst, beim Stufenaufstieg verwandelt sich die Figur sichtbar (alte und neue Gestalt); auf der Karte wird die gerade geschaffte Station gefeiert. Spiele zeigen Vorgänge in Bewegung (Bit läuft durchs Labyrinth, k-Means-Fähnchen gleiten). Alles respektiert „Bewegung reduzieren“.
- **Bilder:** optional, 84 Prompts in `docs/KI-KURS-BILDER.md` (Titelbilder, Weltbilder, Wissenskarten); ohne Bilder bleibt die gezeichnete Darstellung.
- **Für Lehrkräfte:** Handreichung je Kurs (`/de/ki-abenteuer/lehrkraefte/`, `/de/ki-labor/lehrkraefte/`, druckbar): Einsatz im Unterricht, je Welt Lektionen mit Merksätzen, Lernziele, typische Fehlvorstellungen mit Richtigstellung, Gesprächsimpulse, eine Idee ohne Computer und die Quellen der Wissenskarten. Inhalte in `src/kurse/<kurs>/lehrkraefte.ts`. Dazu „Alle Lektionen freischalten“ in den Einstellungen der Karte und Spielstand per Code mitnehmen.

## KI-Abenteuer (Klasse 5–10)

| Welt | Lektion | Spiel | Karte |
| --- | --- | --- | --- |
| 1 🔌 Bit erwacht | Hallo, ich bin Bit | Regeln für Katze/Hund – keine Regel schafft alle; Klartext „Wer ist Bit?“ | 1956 |
| | KI im Alltag | Karten „KI / keine KI“ | 2011 |
| | Aus Beispielen lernen | Äpfel und Birnen zeigen, Probe nach jedem Beispiel (nächster Nachbar) | 1951 |
| 2 🕰️ Bits Vorfahren (1950–1997) | Mensch oder Maschine? | chatten und raten: Mensch oder Programm? | 1950 |
| | Der erste Chatbot | mit ELIZA schreiben und ihre Regeln entdecken | 1966 |
| | Bit rechnet voraus (Mission) | Steinchen-Spiel gegen Bit, das alle Spielverläufe durchrechnet | 1997 |
| 3 📊 Daten und Muster | Gute Merkmale | Merkmal wählen, Bit sortiert Vögel und Säugetiere | 1936 |
| | Die Grenze finden | Linie zwischen Zitronen und Orangen ziehen | 1995 |
| | Falsche Daten | falsch beschriftete Früchte finden, Probe steigt | 2021 |
| 4 🧭 Bit lernt | Frag die Nachbarn | k = 1, 3, 5; ein Ausreißer täuscht nur k = 1 | 1967 |
| | Der Fragen-Baum | Entscheidungsbaum bauen | 1986 |
| | Gruppen ohne Etiketten | Gruppen finden ohne Beschriftung (k-Means) | 1967 |
| | Üben und Prüfen | Übungs- gegen Probefehler (Überanpassung) | 1974 |
| | Bits Steckbrief (Mission) | aus einem Prüfbericht ehrlich einen Steckbrief (Model Card) ausfüllen | 2019 |
| 5 🧠 Bits Gehirn | Ein Neuron | Gewichte und Schwelle für „Kino ja/nein“ | 1943 |
| | Das Neuron lernt | Perzeptron-Lernregel Schritt für Schritt | 1958 |
| | Bergab lernen | Gradientenabstieg, Schrittweite wählen | 1847 |
| | Neuronen im Team | drei „Zäune“ (Neuronen) grenzen gemeinsam eine Insel ein | 1986 |
| 6 🖼️ Bilder und Sprache | Bilder sind Zahlen | Smiley aus Zahlen malen | 1957 |
| | Zeichen erkennen | Zeichen zeichnen, Probe mit verwackelten Zeichnungen | 1989 |
| | Das nächste Wort | Wortpaar-Modell; erfundene, aber richtig klingende Sätze | 1948 |
| | Die Wörter-Landkarte | neue Wörter einordnen; König − Mann + Frau = ? | 2013 |
| 7 🍪 Lernen durch Belohnung | Ausprobieren oder Bewährtes? | 20 Tage Eisdielen wählen, danach drei Strategien im Vergleich | 1952 |
| | Das Labyrinth | Bit lernt durch Belohnung den Weg zum Keks (Q-Lernen) | 2016 |
| | Das Streichholz-Spiel (Mission) | Schachteln mit Perlen lernen das Spiel (Idee von MENACE) | 1961 |
| 8 ✨ Bit wird kreativ | Bit wird ein Chatbot | erst lesen (zählen), dann Daumen (Rückmeldung); freundlich heißt nicht richtig | 2022 |
| | Bilder aus Rauschen | Bild verrauschen, dann aus Rauschen ein Bild „aufräumen“ | 2022 |
| | Echt oder Fake? | Karten „Vorsicht, prüfen!“ oder „spricht eher für echt“ | 2023 |
| 9 🤝 KI und wir | Ist das fair? | nur Turnschuhe gelernt → Sandalen falsch; Beispiele ergänzen | 2018 |
| | Mein Feed | Empfehlungen verstärken sich zur Filterblase | 2006 |
| | Stimmt das? | Aussagen prüfen, Quellen suchen | 2023 |
| | Meine Daten | „okay zu teilen“ oder „lieber nicht“ | 2018 |
| | KI schlau nutzen | hilft beim Lernen, Lernen fällt aus oder riskant? | 2024 |
| | Bits Zeitreise (Mission) | zehn Meilensteine der KI in die richtige Reihenfolge bringen | 2026 |

## KI-Labor (Klasse 11–13)

| Welt | Lektion | Experiment | Karte |
| --- | --- | --- | --- |
| 1 🧩 Was heißt hier Intelligenz? (1950–1980) | Das Imitationsspiel | Turing-Test, Kritik (chinesisches Zimmer) | 1950 |
| | ELIZA unter der Haube | Regeln mit Rang, Pronomen spiegeln, Hilfe-Regel | 1966 |
| | Wissen in Regeln (Mission) | Expertensystem mit Vorwärtsverkettung | 1976 |
| 2 ♟️ Suchen und Spielen (1956–2016) | Den Weg finden | Breiten-, Tiefen-, gierige Suche und A* im Vergleich | 1968 |
| | Minimax und Alpha-Beta | Tic-Tac-Toe: 549 946 Knoten, mit Alpha-Beta ein Bruchteil | 1997 |
| | Zufall als Ratgeber (Mission) | Hex gegen Monte-Carlo-Züge | 2016 |
| 3 📈 Lernen aus Daten (1763–1995) | Die beste Gerade | Methode der kleinsten Quadrate | 1805 |
| | Gradientenabstieg | Lernrate: 0,12 läuft, 0,2 schaukelt sich auf | 1847 |
| | Überanpassung | Polynom Grad 9: Trainingsfehler 0, Testfehler groß | 1974 |
| | Der Spamfilter | naiver Bayes mit Wortwahrscheinlichkeiten | 1763 |
| | Bäume aus Information (Mission) | ID3 mit Entropie und Informationsgewinn | 1986 |
| 4 🧠 Neuronale Netze (1943–1989) | Neuronen als Logik | UND, ODER, NICHT mit Schwellen | 1943 |
| | Rosenblatts Perzeptron | Lernregel, lineare Trennbarkeit | 1958 |
| | Der erste KI-Winter | XOR-Problem und Zeitstrahl der Erwartungen | 1969 |
| | Die verborgene Schicht | XOR mit zwei verborgenen Neuronen | 1986 |
| | Backpropagation | Kettenregel auf einem Rechengraphen | 1970 |
| | Netz-Spielplatz (Mission) | kleines Netz trainieren, Schichten und Neuronen wählen | 1989 |
| 5 👁️ Maschinen sehen (1959–2015) | Faltung: Filter für Bilder | Kantenfilter selbst anwenden | 1959 |
| | Der Durchbruch 2012 | Fehlerraten im ImageNet-Wettbewerb | 2012 |
| | Täuschung für Netze (Mission) | gegnerisches Beispiel (FGSM): kleine Änderung, falsches Ergebnis | 2013 |
| 6 💬 Maschinen sprechen (1948–2022) | Tokens | Byte-Pair-Encoding von Hand | 2016 |
| | Wörter als Vektoren | Analogien mit Kosinus-Ähnlichkeit | 2013 |
| | Das nächste Token | n-Gramm-Modell mit Temperatur | 1948 |
| | Aufmerksamkeit | „Der Ball passte nicht in den Koffer, weil er zu groß/klein war“ | 2017 |
| | Vom Modell zum Assistenten (Mission) | Belohnungsmodell aus Vergleichen (RLHF), Belohnungs-Hacking | 2022 |
| 7 🎮 Lernen durch Belohnung (1952–2016) | Erkunden oder ausnutzen | mehrarmige Banditen, ε-gierig | 1952 |
| | Q-Lernen (Mission) | Gitterwelt mit γ und ε | 1989 |
| 8 ⚖️ Generative KI und Verantwortung (2014–heute) | Aus Rauschen wird Bild | Diffusion mit bestem Entrauscher für kleine Datensätze | 2020 |
| | Fairness messen | gleiche Annahmequoten oder gleiche Trefferquoten – beides geht nicht | 2016 |
| | Regeln für KI | Risikoklassen des AI Act zuordnen | 2024 |
| | Die letzte Mission (Mission) | Meilensteine ordnen, eigene Position beziehen | 2026 |

## Umsetzung

Die Kurse sind kein Fach im Lehrplan, sondern ein eigener Bereich `src/kurse/` (eigene Adressen und Tests; Simulationen und Länder-Lehrpläne bleiben unberührt):

- `src/kurse/index.ts`: Liste der Kurse (`COURSES`), Schalter `COURSES_PUBLIC`.
- `src/kurse/<kurs>/index.ts`: Welten, Lektionen (Titel, Adresse, Symbol, Dauer, Wissenskarte, Mission), Stufennamen, Begleitung, Abschlussabzeichen.
- `src/kurse/<kurs>/lessons/<id>.ts`: Schritte einer Lektion.
- `src/kurse/<kurs>/games/<name>.ts`: Spiele (Oberfläche ohne innerHTML, Bausteine in `parts/` und `engine/ui.ts`).
- `src/kurse/<kurs>/models/*.ts`: Rechenlogik und Daten, getestet in `tests/kurs-*.test.ts`.
- `src/kurse/gemeinsam/`: Spiele und Modelle, die beide Kurse nutzen (Karten, Sortieren, Zeitstrahl, Turing, ELIZA, Nim, Wortvektoren, Sprachmodell, Banditen, Gitterwelt, Diffusion). Findet ein Kurs ein Spiel nicht selbst, lädt `loaders.ts` es von hier.
- `src/kurse/engine/`: Spielstand (`progress.ts`), Speicher (`store.ts`), Begleitung als SVG (`bit.ts`, `guide.ts`), Kurskarte (`hub.ts`), Lektionsablauf (`lesson.ts`).
- Seiten: `src/views/KurseView.astro` (Übersicht), `KursView.astro` (Karte), `LektionView.astro`; Aussehen `src/styles/kurs.css`; Oberflächentexte `src/kurse/strings.ts`.

**Neue Lektion:** Eintrag in `<kurs>/index.ts` (mit Wissenskarte), Datei in `lessons/`, bei Bedarf Spiel in `games/` und Modell mit Test, dann `npm run verify`. Neue Dateien findet der Testlauf über `import.meta.glob`. Meldet ein Test eine fehlende Lektion, obwohl die Datei da ist, die Ordner `node_modules/.vitest-cache` und `node_modules/.vite` löschen.

## Konten später

Heute bleibt der Spielstand im Local Storage (`kurs:<kurs-id>`). Die Kurse sind so gebaut, dass Konten später ohne Änderung an Lektionen dazukommen können:

- Alle Zugriffe laufen über die Schnittstelle `ProgressStore` (`store.ts`). Mit `setStoreFactory()` lässt sich ein anderer Speicher einsetzen, etwa einer, der zusätzlich mit einem Server abgleicht.
- XP werden nicht blind gespeichert, sondern lassen sich aus Sternen und Abzeichen neu berechnen (`computeXp`). Damit kann ein Server den Stand prüfen.
- `mergeProgress()` führt zwei Spielstände verlustfrei zusammen (beste Sterne, alle Abzeichen, neuere Serie). Das nutzt schon heute „Code einlesen“; später gleicht es Gerät und Konto ab.

Für Konten wären dann nötig (nicht Teil dieser Phase): Server und Datenbank; Einwilligung und Datenschutzprüfung, besonders für Kinder unter 16 (Eltern bzw. Schule); eine Lösung ohne Klarnamen (Klassencode oder Pseudonym); Angaben in Impressum und Datenschutzerklärung; ein Löschweg.

## Materialien

Die Projektleitung hat Materialien zur Verfügung gestellt. Sie dienten nur als Anregung; alle Texte, Beispiele und Spiele sind selbst geschrieben, nichts ist übernommen:

- klicksafe, „KI and me“ (Material für die pädagogische Praxis, Lizenz CC BY-NC): Themen KI im Alltag, Fälschungen, Datenschutz, Empfehlungen und Filterblasen, kluge Nutzung.
- Experience AI, Leitfaden für Lehrkräfte (Raspberry Pi Foundation und Google DeepMind, Lizenz CC BY-NC-ND – keine Bearbeitung erlaubt, daher nur Ideen): keine Vermenschlichung von KI (Grundlage der Klartext-Kästen), Modell-Steckbriefe, Verzerrung durch Daten.
- TU Chemnitz, Vorlesung „KI 01 – Einleitung“ und HTWK Leipzig, „Grundlagen der Künstlichen Intelligenz“ (Hochschulfolien): Geschichte (Turing-Test, Dartmouth 1956, ELIZA, Expertensysteme, KI-Winter), Suche und Spiele, Perzeptron und Backpropagation. Für Klasse 5–10 stark vereinfacht.

## Recht und Datenschutz

- Ohne Konten und ohne Übertragung ändert sich die Datenschutzerklärung kaum: Der Spielstand im Local Storage steht im Abschnitt „Speicherung im Browser“.
- **Würden später echte KI-Dienste oder Konten genutzt**, braucht es eine neue Prüfung (Auftragsverarbeitung, Minderjährige, Einwilligung).
- Fachliche Aussagen (besonders zu Sprachmodellen, Fairness, AI Act, Urheberrecht) sind sorgfältig formuliert, aber noch von einer fachkundigen Person zu prüfen. Bis dahin gelten sie als Entwurf.
- Es gibt keine Bilder aus fremden Quellen; alles ist gezeichnet (SVG, Emoji) oder gerechnet.

## Offen

- Probespielen durch die Projektleitung und mit Schülern beider Stufen.
- Fachliche Durchsicht (Entwurf), besonders Wissenskarten mit Jahreszahlen, KI-Labor-Formeln, AI Act.
- Englische Texte gegenlesen lassen.
- Danach `COURSES_PUBLIC = true` (Link in der Kopfleiste, Suchmaschinen) und Hinweis auf der Startseite.
- Später möglich: kurze Handreichung für Lehrkräfte je Welt (Ziele, Dauer, Gesprächsimpulse), dritte Stufe, Konten.
