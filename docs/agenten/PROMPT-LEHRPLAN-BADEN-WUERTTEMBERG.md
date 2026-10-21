# Aufgabe für den Helfer ohne GitHub: Bildungsplan Baden-Württemberg (Mathematik und Physik)

Wie bei Hessen und Bayern: Die Plattform soll die Simulationen nach dem Lehrplan des eigenen Bundeslands sortieren können. Als Nächstes ist **Baden-Württemberg, Gymnasium** dran, zuerst **Mathematik**, dann **Physik**. Pro Fach ein eigener Chat.

## Vorbereitung

1. Auf **bildungsplaene-bw.de** gehen: Allgemein bildende Schulen → **Gymnasium** → Fach **Mathematik** bzw. **Physik**.
2. **Welche Fassung?** Baden-Württemberg stellt gerade auf das neunjährige Gymnasium (G9) um. Gibt es einen Bildungsplan für G9, diesen nehmen; sonst den **Bildungsplan 2016** (G8). Im Zweifel beide hochladen, der Prompt sagt Claude, was zu tun ist.
3. Den Fachplan als **PDF herunterladen** (meist „Bildungsplan … als PDF“ oder „Druckversion“). Wichtig sind der Teil mit den **inhaltsbezogenen Kompetenzen** (Abschnitt 3) für alle Klassen und die Kursstufe.
4. Neuen Chat auf claude.ai öffnen, das PDF hochladen und den **passenden Prompt unten** (Mathematik oder Physik) **komplett** einfügen und abschicken.
5. Schreibt Claude „bitte weiter schreiben“, mit „weiter“ antworten, bis alles fertig ist.
6. Ergebnis speichern:
   - die komplette Antwort als `baden-wuerttemberg-gymnasium-mathematik.md` (bzw. `…-physik.md`)
   - den JSON-Block (Teil C) zusätzlich als `baden-wuerttemberg-gymnasium-mathematik.json` (bzw. `…-physik.json`)
7. Beide Dateien an die Projektleitung schicken.

**Tipp:** Ist das PDF sehr lang, zwei Chats nehmen: einen für die Klassen 5–10 und einen für die Kursstufe. Dann beide JSON-Blöcke schicken; die Projektleitung fügt sie zusammen.

---

## Prompt 1: Mathematik (ab hier bis „Prompt 2“ kopieren)

Du bist Fachdidaktiker:in für Mathematik und hilfst beim Aufbau einer kostenlosen Lernplattform mit interaktiven Simulationen für Schulen in Deutschland. Im Anhang ist der offizielle **Bildungsplan Baden-Württemberg, Gymnasium, Mathematik**.

### Deine Aufgabe

Bereite den Bildungsplan **vollständig und extrem sauber strukturiert** auf und ordne jedem Bereich die passenden Simulationen unserer Plattform zu (Liste ganz unten).

### Regeln

1. **Nur aus den hochgeladenen Dokumenten arbeiten.** Nichts erfinden, nichts aus dem Gedächtnis ergänzen. Was unklar ist oder fehlt, kommt in Teil E „Unklarheiten“.
2. **G8 oder G9 klar benennen.** Steht im Dokument, ob es für das achtjährige (G8) oder das neunjährige Gymnasium (G9) gilt, schreibe das in Teil A. Gibt es beide Fassungen im Anhang, bereite **nur die G9-Fassung** auf und erwähne die andere in Teil E.
3. **Struktur genau wie im Bildungsplan:** Klassenstufe bzw. Doppelklassenstufe (z. B. „Klassen 7/8“) → inhaltsbezogener Bereich mit Nummer und Originalüberschrift (z. B. „3.2.1 Leitidee Zahl – Variable – Operation“ bzw. „3.2.4 Elektrik“) → Unterpunkte. Nummern und Überschriften **wörtlich** übernehmen. Die prozessbezogenen Kompetenzen (Abschnitt 2) **nicht** aufnehmen.
4. **Doppelklassenstufen:** Gilt ein Abschnitt für zwei Klassen (z. B. 7/8), trage ihn bei **beiden** Klassen mit gleichen Nummern und Überschriften ein und vermerke das in `note`.
5. **Kursstufe (Oberstufe):** Bei G8 sind das die Klassen 11 und 12, bei G9 die Klassen 12 und 13. Trage die Kursstufe bei beiden Klassen ein. Unterscheidet der Plan Basisfach und Leistungsfach, kennzeichne Inhalte nur für das Leistungsfach in der Überschrift mit „(nur Leistungsfach)“.
6. **Kurzbeschreibungen in eigenen Worten**, 1–2 einfache Sätze je Bereich, verständlich für Lehrkräfte und Schüler. Keine wörtlichen Zitate außer den Überschriften (Urheberrecht).
7. **Zuordnung der Simulationen:**
   - Nur IDs aus der Liste unten verwenden.
   - Nur zuordnen, wenn die Simulation den Inhalt wirklich trifft, nicht wenn sie „irgendwie verwandt“ ist. Lieber eine weniger.
   - **Klassenstufe beachten:** Jede Simulation hat eine Klassenstufe (z. B. „Kl. 9–10“). Ordne sie nur Klassen **innerhalb** dieses Bereichs zu. Passt sie inhaltlich, aber die Klassenstufe nicht, ordne sie **nicht** zu, sondern liste sie in Teil D unter „Passt inhaltlich, Klassenstufe weicht ab“ (mit Klasse, Bereich und Simulation).
   - Ein Bereich mit Unterpunkten bekommt **keine eigenen** Simulationen; die stehen bei den Unterpunkten.
8. **Lücken finden:** Bereiche ohne passende Simulation in Teil D auflisten, mit einem Vorschlag für eine neue Simulation (Titel und ein Satz Idee).
9. Zu jeder Klasse die **Quelle** angeben: Dokumentname, Seitenzahl und, falls im Dokument eine Internetadresse steht, diese (https).
10. Alles auf Deutsch; zusätzlich je Überschrift und Kurzbeschreibung eine **englische Übersetzung**.

### Ausgabeformat (genau so)

**Teil A – Überblick**
- Bundesland, Schulart, Fach, Name und Stand des Bildungsplans, G8 oder G9, welche Klassen.
- Tabelle: Klasse | Abschnitt (z. B. „Klassen 7/8“) | Anzahl Bereiche | Anzahl zugeordneter Simulationen.

**Teil B – Bildungsplan im Detail**, je Klasse:

```
## Klasse 8   (Quelle: <Dokument>, S. 24–31, <Adresse>)
### 3.2.1 <Originalüberschrift>
- Kurz (DE): …
- Kurz (EN): …
- Simulationen: `id-1`, `id-2`
- Unterpunkte:
  - 3.2.1.1 <Originalüberschrift> – Kurz: … – Simulationen: …
```

**Teil C – JSON** in genau dieser Struktur (für den direkten Einbau):

```json
{
  "id": "baden-wuerttemberg-gymnasium-mathematik",
  "subject": "mathematik",
  "slug": { "de": "baden-wuerttemberg-gymnasium", "en": "baden-wuerttemberg-gymnasium" },
  "state": { "de": "Baden-Württemberg", "en": "Baden-Württemberg" },
  "schoolType": { "de": "Gymnasium", "en": "Gymnasium" },
  "sourceName": "Bildungsplan",
  "grades": [
    {
      "grade": 8,
      "sourceUrl": "https://www.bildungsplaene-bw.de/…",
      "note": { "de": "…", "en": "…" },
      "units": [
        {
          "code": "3.2.1",
          "title": { "de": "…", "en": "…" },
          "summary": { "de": "…", "en": "…" },
          "simulations": ["pythagoras"],
          "parts": [ { "code": "3.2.1.1", "title": { "de": "…", "en": "…" }, "summary": { "de": "…", "en": "…" }, "simulations": [] } ]
        }
      ]
    }
  ]
}
```

Hinweise zum JSON:
- **Jede Klasse genau einmal** in `grades` (keine zwei Einträge mit derselben Zahl). Gibt es für eine Klasse mehrere Fassungen (z. B. Basis- und Leistungsfach), alles in diesen einen Eintrag und die Unterschiede in der Überschrift kennzeichnen.
- `note`, `summary`, `simulations` und `parts` dürfen fehlen, wenn sie leer sind.
- `code` ist innerhalb einer Klasse eindeutig.
- `sourceUrl` beginnt immer mit `https://`. Steht keine Adresse im Dokument, nimm `https://www.bildungsplaene-bw.de` und vermerke das in Teil E.
- Gültiges JSON: doppelte Anführungszeichen, keine Kommentare, kein Komma am Ende.

**Teil D – Lücken und Vorschläge**
- Bereiche ohne passende Simulation, je mit Vorschlag für eine neue Simulation.
- „Passt inhaltlich, Klassenstufe weicht ab“ (siehe Regel 7).

**Teil E – Unklarheiten**
Alles, was du nicht sicher zuordnen oder lesen konntest.

Arbeite gründlich Klasse für Klasse. Wenn die Antwort zu lang wird, höre nach einer vollständigen Klasse auf und schreibe „Weiter mit Klasse X – bitte ‚weiter‘ schreiben“. Den JSON-Block (Teil C) erst ganz am Ende vollständig ausgeben.

### Unsere Mathematik-Simulationen (ID – Titel – Klassenstufe: Kurzbeschreibung)

- `einheiten` – Einheiten umrechnen mit der Einheitentafel (Kl. 5): Lege eine Größe in die Einheitentafel und sieh, wie beim Umrechnen das Komma wandert. Für Länge, Masse, Fläche, Volumen und Zeit.
- `koerpernetze` – Netze und Oberflächen von Körpern (Kl. 5–8): Falte Netze von Würfel, Quader, Prisma, Pyramide und Zylinder in 3D zum Körper und berechne die Oberfläche.
- `koordinaten-lage` – Punkte, Geraden und Kreise: Lagebeziehungen (Kl. 5): Punkte im Koordinatensystem setzen und ablesen, Strecken und Geraden zeichnen und prüfen, ob sie parallel oder senkrecht sind.
- `massstab` – Maßstab: Karte und Wirklichkeit (Kl. 5): Miss auf einer Karte mit dem Lineal und rechne mit dem Maßstab aus, wie weit es in Wirklichkeit ist.
- `primfaktoren` – Primfaktorzerlegung und Teilbarkeit (Kl. 5–6): Zerlege Zahlen in ihre Primfaktoren, prüfe Teilbarkeitsregeln und finde Primzahlen mit einem Sieb. Daraus ergeben sich auch ggT und kgV.
- `stellenwerte` – Stellenwertsystem und Runden (Kl. 5): Zehn Plättchen werden zu einem größeren gebündelt. So verstehst du, wie unsere Zahlen aufgebaut sind, liest große Zahlen und rundest sie.
- `termbaum` – Termbaum: die Struktur von Termen (Kl. 5–7): Gib einen Term ein und sieh ihn als Rechenbaum. So wird klar, in welcher Reihenfolge gerechnet wird.
- `umfang-flaeche` – Umfang und Flächeninhalt von Rechtecken (Kl. 5): Lege ein Rechteck mit Quadraten aus und lass eine Ameise einmal herumlaufen. So unterscheidest du Flächeninhalt und Umfang.
- `vierecke` – Das Haus der Vierecke (Kl. 5–7): Ziehe an den Ecken eines Vierecks und sieh, ob es ein Quadrat, Rechteck, Parallelogramm oder eine andere Art ist.
- `winkel-messen` – Winkel schätzen und messen (Kl. 5): Lege das Geodreieck richtig an und miss Winkel. Mit Winkelarten und einem Schätzspiel.
- `zaehlprinzip` – Zählprinzip und Baumdiagramm (Kl. 5–8): Wie viele Outfits oder Eiskombinationen gibt es? Ein Baumdiagramm wächst Stufe für Stufe, und du siehst, warum man die Möglichkeiten multipliziert.
- `zahlengerade` – Ganze Zahlen an der Zahlengeraden addieren und subtrahieren (Kl. 5): Ein Frosch hüpft auf der Zahlengeraden und zeigt, wie man mit negativen Zahlen plus und minus rechnet. Dazu Beispiele mit Thermometer und Konto.
- `zehnerpotenzen` – Potenzen, Zehnerpotenzen und Größenordnungen (Kl. 5–6): Zoome vom Sandkorn bis zur Erde: Jeder Schritt macht das Bild zehnmal so groß. So lernst du Potenzen und das Schreiben sehr großer und sehr kleiner Zahlen.
- `bruchteile` – Bruchteile darstellen (Kl. 6): Teile Pizza, Kuchen oder eine Strecke in gleich große Stücke und färbe einige davon. So siehst du, was ein Bruch bedeutet.
- `brueche-rechnen` – Brüche multiplizieren und dividieren am Rechteckmodell (Kl. 6): Zwei Streifen überlagern sich in einem Rechteck: Die gemeinsame Fläche ist das Produkt der Brüche. Auch das Teilen durch einen Bruch wird anschaulich.
- `brueche-vergleichen` – Brüche erweitern, kürzen und vergleichen (Kl. 6): Vergleiche zwei Brüche als Streifen oder Kreise. Beim Erweitern werden die Stücke feiner, der Anteil bleibt aber gleich.
- `dezimalbrueche` – Endliche und periodische Dezimalbrüche (Kl. 6): Teile schriftlich, bis sich ein Rest wiederholt. So siehst du, warum manche Brüche als Dezimalzahl enden und andere sich endlos wiederholen.
- `diagramme` – Diagramme lesen und kritisch prüfen (Kl. 6): Stelle dieselben Daten als Säulen-, Linien-, Kreisdiagramm und mehr dar und entdecke, wie Diagramme täuschen können.
- `flaechen-zerlegen` – Parallelogramm, Dreieck und Trapez durch Zerlegen und Ergänzen (Kl. 6): Zerlege Parallelogramm, Dreieck und Trapez und setze sie neu zusammen. So findest du ihre Flächenformeln.
- `gesetz-grosse-zahlen` – Gesetz der großen Zahlen (Kl. 6–9): Wirf eine Münze, einen Würfel oder einen Reißnagel tausendmal: Je öfter du wirfst, desto näher kommt die relative Häufigkeit der Wahrscheinlichkeit.
- `proportional` – Direkte und indirekte Proportionalität (Kl. 6–8): Doppelt so viele Äpfel kosten doppelt so viel. Bild, Tabelle und Graph zeigen gemeinsam, wann eine Zuordnung proportional ist, mit Dreisatz.
- `prozentstreifen` – Prozentstreifen (Kl. 6–7): Am Prozentstreifen siehst du, wie Grundwert, Prozentsatz und Prozentwert zusammenhängen. Mit Alltagsbeispielen wie Rabatt, Mehrwertsteuer und Umfrage.
- `quader-volumen` – Volumen von Quadern mit Einheitswürfeln (Kl. 6): Fülle einen Quader Reihe für Reihe mit kleinen Würfeln. So wird klar, warum das Volumen Länge mal Breite mal Höhe ist.
- `besondere-linien` – Umkreis, Inkreis und besondere Linien im Dreieck (Kl. 7–8): Konstruiere die besonderen Linien im Dreieck. Je drei davon schneiden sich immer in einem Punkt, zum Beispiel im Mittelpunkt von Umkreis und Inkreis.
- `binomische-formeln` – Binomische Formeln am Quadrat (Kl. 7): Die drei binomischen Formeln als Flächen: Ein Quadrat zerfällt in kleinere Quadrate und Rechtecke.
- `boxplot` – Mittelwert, Median und Boxplot (Kl. 7): Ziehe Datenpunkte auf dem Zahlenstrahl und sieh, wie sich Mittelwert, Median und Boxplot sofort verändern.
- `dreieckskonstruktion` – Kongruenzsätze und Dreieckskonstruktionen (Kl. 7): Konstruiere Dreiecke aus drei gegebenen Stücken mit Lineal und Zirkel, Schritt für Schritt wie im Heft. Manchmal gibt es keine, eine oder zwei Lösungen.
- `lineare-funktion` – Lineare Funktion (Kl. 7–9): Verändere Steigung und y-Achsenabschnitt einer Geraden und lies Steigungsdreieck und Nullstelle ab.
- `mittelsenkrechte` – Mittelsenkrechte und Winkelhalbierende (Kl. 7): Ziehe einen Punkt und vergleiche seine Abstände. So entdeckst du Mittelsenkrechte und Winkelhalbierende und konstruierst sie mit Zirkel und Lineal.
- `spiegelung` – Achsen- und Punktspiegelung (Kl. 7): Spiegle eine Figur an einer Achse oder an einem Punkt und sieh, wie die Konstruktion entsteht.
- `thales` – Satz des Thales (Kl. 7): Ziehe einen Punkt auf dem Halbkreis: Der Winkel dort ist immer ein rechter Winkel.
- `waagemodell` – Lineare Gleichungen am Waagemodell (Kl. 7): Lineare Gleichungen auf einer Balkenwaage lösen: Was du auf beiden Seiten gleich machst, hält die Waage im Gleichgewicht.
- `winkel-geradenkreuzung` – Winkel an Geradenkreuzungen (Kl. 7): Drehe Geraden und sieh, welche Winkel gleich groß bleiben. An parallelen Geraden gibt es Stufen- und Wechselwinkel.
- `winkelsumme` – Innenwinkelsumme in Dreieck und Vieleck (Kl. 7): Reiße die Ecken eines Dreiecks ab und lege sie zusammen: Sie ergeben immer 180°. Auch für Vierecke und Vielecke.
- `baumdiagramm` – Mehrstufige Zufallsexperimente und Pfadregeln (Kl. 8–10): Ziehe Kugeln aus einer Urne, mit oder ohne Zurücklegen. Das Baumdiagramm und die Pfadregeln zeigen, wie man Wahrscheinlichkeiten berechnet.
- `funktion-zuordnung` – Funktion oder nicht? Zuordnungen und ihre Graphen (Kl. 8): Setze Pfeile zwischen zwei Mengen und sieh sofort, ob die Zuordnung eine Funktion ist, als Pfeilbild, Tabelle und Graph.
- `funktionsplotter` – Funktionsplotter mit eigenen Termen (Kl. 8–13): Gib bis zu drei eigene Funktionsterme ein und sieh ihre Graphen, mit Wertetabelle, Nullstellen und Schnittpunkten.
- `gleichungen-grafisch` – Gleichungen grafisch lösen: Schnittpunkte von Graphen (Kl. 8–9): Zeichne beide Seiten einer Gleichung als Graphen. Die Lösungen liegen dort, wo sich die Graphen schneiden.
- `hyperbel` – Hyperbeln und ihre Asymptoten (Kl. 8): Verschiebe und strecke eine Hyperbel und sieh, wie sie sich ihren Asymptoten nähert.
- `kreiszahl-pi` – Kreisumfang, Kreisfläche und die Zahl π (Kl. 8): Ein Rad rollt ab, und Kreisstücke werden zu einem Rechteck gelegt. So entdeckst du die Zahl π und die Formeln für Umfang und Fläche des Kreises.
- `lgs-grafisch` – Lineare Gleichungssysteme grafisch lösen (Kl. 8): Zwei Gleichungen sind zwei Geraden. Ihr Schnittpunkt ist die Lösung, die du ablesen und durch Einsetzen prüfen kannst.
- `prisma-zylinder` – Prisma und Zylinder: Oberfläche und Volumen (Kl. 8): Staple Schichten und rolle den Mantel ab. So siehst du, wie man Volumen und Oberfläche von Prisma und Zylinder berechnet.
- `pythagoras` – Satz des Pythagoras (Kl. 8–9): Quadrate über den Seiten eines rechtwinkligen Dreiecks und ein Puzzle-Beweis zeigen: a² + b² = c².
- `einheitskreis` – Einheitskreis (Kl. 9–10): Sinus, Kosinus und Tangens am Einheitskreis und wie daraus die Sinuskurve entsteht.
- `extremwert-parabel` – Extremwertaufgaben mit Parabeln (Kl. 9): Welches Gehege hat die größte Fläche? Bild und Graph zeigen das Maximum, erst durch Probieren, dann genau berechnet.
- `galtonbrett` – Galtonbrett (Kl. 9–12): Kugeln fallen durch Nagelreihen und sammeln sich in Fächern. So entsteht die Form der Binomialverteilung.
- `parabel-drei-punkte` – Parabel durch drei Punkte (Kl. 9): Ziehe drei Punkte, und die passende Parabel geht immer durch alle drei. Die Gleichung wird Schritt für Schritt berechnet.
- `potenzfunktionen` – Potenzfunktionen y = a · xⁿ (Kl. 9–10): Ändere den Exponenten und sieh, wie sich der Graph von y = a · xⁿ verwandelt. Mit Symmetrie und gemeinsamen Punkten.
- `quadratische-funktion` – Quadratische Funktion (Kl. 9–10): Strecke, spiegle und verschiebe Parabeln und lies Scheitelpunkt und Nullstellen ab.
- `quadratwurzel` – Quadratwurzeln und das Heron-Verfahren (Kl. 9): Ein Rechteck wird Schritt für Schritt zum Quadrat mit gleicher Fläche. So findest du die Quadratwurzel und lernst ein altes Näherungsverfahren kennen.
- `sin-cos-tan-dreieck` – Sinus, Kosinus und Tangens im rechtwinkligen Dreieck (Kl. 9–10): Im rechtwinkligen Dreieck hängt das Verhältnis zweier Seiten nur vom Winkel ab. Daraus entstehen Sinus, Kosinus und Tangens, mit Beispielen wie Rampe oder Leiter.
- `sinussatz-kosinussatz` – Sinussatz und Kosinussatz (Kl. 9–10): Berechne Seiten und Winkel in beliebigen Dreiecken mit Sinussatz und Kosinussatz. Ein Helfer zeigt, welcher Satz zu deiner Aufgabe passt.
- `strahlensaetze` – Strahlensätze (Kl. 9): Verschiebe eine Parallele und sieh, dass alle Streckenverhältnisse gleich bleiben. Damit berechnest du unbekannte Längen, zum Beispiel die Höhe eines Baumes.
- `vergroessern` – Ähnliche Figuren: Wie wachsen Fläche und Volumen? (Kl. 9): Vergrößere Strecken, Flächen und Körper. Bei doppelter Länge wird die Fläche viermal und das Volumen achtmal so groß.
- `vierfeldertafel` – Vierfeldertafel und Mengendiagramm (Kl. 9–11): Vierfeldertafel, Mengendiagramm und Baumdiagramm zeigen dieselben Daten und hängen zusammen. Wer eins verändert, sieht die anderen mitlaufen.
- `cavalieri` – Prinzip von Cavalieri (Kl. 10): Schiebe einen Münzstapel schief: Die Form ändert sich, das Volumen bleibt gleich. Das ist das Prinzip von Cavalieri.
- `exponentielles-wachstum` – Exponentielles Wachstum und Zerfall (Kl. 10): Seerosen auf dem Teich, Zinseszins und Zerfall: Exponentielles Wachstum im Vergleich mit linearem Wachstum.
- `ganzrationale-funktionen` – Ganzrationale Funktionen: Nullstellen, Vielfachheit und Randverhalten (Kl. 10–11): Ziehe die Nullstellen eines Polynoms und sieh, ob der Graph die x-Achse schneidet oder nur berührt. Dazu das Verhalten weit draußen.
- `geburtstagsproblem` – Geburtstagsproblem simulieren (Kl. 10): Wie wahrscheinlich ist es, dass zwei in der Klasse am selben Tag Geburtstag haben? Schon ab 23 Personen ist es wahrscheinlicher als nicht.
- `logarithmus` – Logarithmus als Umkehrung des Potenzierens (Kl. 10–12): Der Logarithmus beantwortet die Frage: Hoch wie viel ergibt diese Zahl? Mit Graphen, Rechengesetzen und Exponentialgleichungen.
- `monte-carlo-pi` – Monte-Carlo-Methode: π mit Zufall bestimmen (Kl. 10): Zufällige Punkte fallen auf ein Quadrat mit einem Kreis darin. Aus dem Anteil im Kreis lässt sich π schätzen.
- `pyramide-kegel-kugel` – Pyramide, Kegel und Kugel (Kl. 10): Wasser umschütten zeigt: Eine Pyramide fasst ein Drittel des Prismas. Dazu Volumen und Oberfläche von Pyramide, Kegel und Kugel, drehbar in 3D.
- `sinusfunktion` – Allgemeine Sinusfunktion (Kl. 10–11): Verändere Amplitude, Periode und Verschiebung einer Sinuskurve mit Reglern oder durch Ziehen.
- `ziegenproblem` – Ziegenproblem (Kl. 10): Spiele selbst oder simuliere tausende Spiele: Lohnt es sich, die Tür zu wechseln?
- `ableitungsfunktion` – Ableitungsfunktion grafisch (Kl. 11–12): Eine Tangente gleitet am Graphen entlang und zeichnet dabei die Steigung als neuen Graphen: die Ableitungsfunktion.
- `bedingte-wahrscheinlichkeit` – Bedingte Wahrscheinlichkeit am Beispiel medizinischer Tests (Kl. 11): Ein medizinischer Test ist positiv, aber wie wahrscheinlich ist man wirklich krank? 1000 Personen zeigen, warum die Antwort oft überrascht.
- `grenzverhalten` – Grenzverhalten und Asymptoten (Kl. 11): Was passiert mit einem Graphen, wenn x sehr groß wird? Ein Punkt läuft nach außen, und eine Lupe zeigt, wie nah er der Asymptote kommt.
- `kurvendiskussion` – Monotonie, Extrem- und Wendestellen (Kl. 11–12): Untersuche einen Graphen Schritt für Schritt: Nullstellen, Hoch- und Tiefpunkte, Wendepunkte und wo er steigt oder fällt.
- `newton-verfahren` – Newton-Verfahren (Kl. 11): Finde eine Nullstelle näherungsweise mit Tangenten. Jeder Schritt bringt dich näher, aber manchmal geht es auch schief.
- `polstellen-asymptoten` – Polstellen und Asymptoten gebrochen-rationaler Funktionen (Kl. 11–12): Ziehe Nullstellen und Polstellen eines Bruchterms und sieh, wie sich der Graph verändert. Mit Asymptoten und Lücken im Graphen.
- `sekante-tangente` – Von der Sekante zur Tangente (Kl. 11): Lass einen Punkt Q auf P zulaufen: Aus der Sekante wird die Tangente und aus der mittleren Steigung die Ableitung.
- `transformationen` – Graphen verschieben, strecken und spiegeln (Kl. 11): Verschiebe, strecke und spiegle Graphen Schritt für Schritt und sieh, wie sich der Funktionsterm ändert.
- `binomialverteilung` – Binomialverteilung (Kl. 12): Das Histogramm der Binomialverteilung: Wähle einen Bereich und lies die Wahrscheinlichkeit direkt ab.
- `e-funktion` – Die natürliche Exponentialfunktion (Kl. 12): Warum ist die Zahl e so besonders? Bei der e-Funktion sind Graph und Ableitung genau gleich.
- `funktionenscharen` – Funktionenscharen (Kl. 12–13): Viele Graphen auf einmal: Ändere den Parameter k und sieh, wie die Hochpunkte auf einer Kurve wandern.
- `geraden-ebenen` – Geraden und Ebenen im Raum (Kl. 12–13): Ein Punkt läuft auf einer Geraden durch den Raum, eine Ebene wird aufgespannt. Mit den verschiedenen Formen der Gleichungen, drehbar in 3D.
- `hauptsatz` – Integralfunktion und Hauptsatz (Kl. 12–13): Die Fläche unter einem Graphen wächst mit. Ihre Änderungsrate ist genau die Funktion selbst: Das ist der Hauptsatz.
- `koordinaten-3d` – Punkte und Körper im räumlichen Koordinatensystem (Kl. 12): Setze Punkte im räumlichen Koordinatensystem, drehe die Ansicht und berechne Abstände mit dem Satz des Pythagoras.
- `matrix-abbildungen` – Matrizen als lineare Abbildungen (Kl. 12–14): Eine Matrix verformt die Ebene: Ziehe die Pfeile und sieh, wie sich ein Gitter dreht, streckt oder spiegelt.
- `ober-untersummen` – Integral als Flächenbilanz (Rechtecksummen) (Kl. 12–13): Fülle die Fläche unter einem Graphen mit Rechtecken. Je mehr Rechtecke, desto genauer wird der Wert des Integrals.
- `signifikanztest` – Einseitiger Signifikanztest: Fehler 1. und 2. Art (Kl. 12): Ein Test entscheidet zwischen zwei Vermutungen. Farbige Flächen zeigen, wie oft er sich irren kann.
- `skalar-vektorprodukt` – Skalarprodukt und Vektorprodukt (Kl. 12): Das Skalarprodukt verrät den Winkel zwischen zwei Vektoren, das Vektorprodukt einen senkrechten Vektor und eine Fläche.
- `stammfunktion-grafisch` – Vom Graphen zur Stammfunktion (Kl. 12–13): Die Höhe eines Graphen wird zur Steigung eines neuen Graphen, der Stammfunktion. Mit Alltagsbeispielen wie dem Kontostand.
- `umkehrfunktion` – Umkehrfunktionen: Spiegeln an y = x (Kl. 12): Spiegle einen Graphen an der Geraden y = x und erhalte die Umkehrfunktion. So siehst du, wann eine Funktion umkehrbar ist.
- `vektoren-3d` – Vektoren addieren und vervielfachen (3D) (Kl. 12): Ziehe Vektorpfeile im Raum, addiere sie und vervielfache sie. Die Rechnung steht daneben in Spaltenschreibweise.
- `aenderungsrate` – Integral als Gesamtänderung: von der Geschwindigkeit zum Weg (Kl. 13): Aus der Geschwindigkeit eines Autos wird der zurückgelegte Weg: Die Fläche unter der Kurve zeigt die Gesamtänderung.
- `extremwertprobleme` – Extremwertprobleme (Kl. 13): Welche Schachtel fasst am meisten, welche Dose braucht am wenigsten Blech? An fünf Alltagsproblemen findest du mit der Ableitung das Optimum.
- `kugeln` – Kugeln, Geraden und Ebenen (Kl. 13): Eine Kugel im Raum wird von Ebenen und Geraden geschnitten oder berührt. Mit Kugelgleichung und Tangentialebene.
- `lage-abstaende` – Lagebeziehungen und Abstände im Raum (Kl. 13): Wie liegen zwei Geraden oder Ebenen zueinander? Schneiden sie sich, sind sie parallel? Dazu Schnittpunkte, Winkel und Abstände in 3D.
- `normalverteilung` – Normalverteilung (Kl. 13): Die Glockenkurve: Wahrscheinlichkeiten sind Flächen unter der Kurve. Mit Sigma-Regeln und Beispielen wie Abfüllanlagen.
- `rotationskoerper` – Rotationskörper (Kl. 13): Die Fläche unter einem Graphen dreht sich um die x-Achse und wird zu einem Körper. Sein Volumen wird mit Scheiben berechnet.
- `taylor-polynome` – Taylorpolynome (Kl. 13–14): Polynome schmiegen sich immer besser an eine Funktion an, Summand für Summand. So rechnet auch ein Taschenrechner.
- `fourier-reihen` – Fourier-Reihen (Kl. 14): Rechteck, Sägezahn und andere Formen entstehen aus vielen Sinusschwingungen. Auf Wunsch kannst du sie auch anhören.

---

## Prompt 2: Physik (ab hier bis zum Ende kopieren)

Du bist Fachdidaktiker:in für Physik und hilfst beim Aufbau einer kostenlosen Lernplattform mit interaktiven Simulationen für Schulen in Deutschland. Im Anhang ist der offizielle **Bildungsplan Baden-Württemberg, Gymnasium, Physik**.

### Deine Aufgabe

Bereite den Bildungsplan **vollständig und extrem sauber strukturiert** auf und ordne jedem Bereich die passenden Simulationen unserer Plattform zu (Liste ganz unten).

### Regeln

1. **Nur aus den hochgeladenen Dokumenten arbeiten.** Nichts erfinden, nichts aus dem Gedächtnis ergänzen. Was unklar ist oder fehlt, kommt in Teil E „Unklarheiten“.
2. **G8 oder G9 klar benennen.** Steht im Dokument, ob es für das achtjährige (G8) oder das neunjährige Gymnasium (G9) gilt, schreibe das in Teil A. Gibt es beide Fassungen im Anhang, bereite **nur die G9-Fassung** auf und erwähne die andere in Teil E.
3. **Struktur genau wie im Bildungsplan:** Klassenstufe bzw. Doppelklassenstufe (z. B. „Klassen 7/8“) → inhaltsbezogener Bereich mit Nummer und Originalüberschrift (z. B. „3.2.1 Leitidee Zahl – Variable – Operation“ bzw. „3.2.4 Elektrik“) → Unterpunkte. Nummern und Überschriften **wörtlich** übernehmen. Die prozessbezogenen Kompetenzen (Abschnitt 2) **nicht** aufnehmen.
4. **Doppelklassenstufen:** Gilt ein Abschnitt für zwei Klassen (z. B. 7/8), trage ihn bei **beiden** Klassen mit gleichen Nummern und Überschriften ein und vermerke das in `note`.
5. **Kursstufe (Oberstufe):** Bei G8 sind das die Klassen 11 und 12, bei G9 die Klassen 12 und 13. Trage die Kursstufe bei beiden Klassen ein. Unterscheidet der Plan Basisfach und Leistungsfach, kennzeichne Inhalte nur für das Leistungsfach in der Überschrift mit „(nur Leistungsfach)“.
6. **Kurzbeschreibungen in eigenen Worten**, 1–2 einfache Sätze je Bereich, verständlich für Lehrkräfte und Schüler. Keine wörtlichen Zitate außer den Überschriften (Urheberrecht).
7. **Zuordnung der Simulationen:**
   - Nur IDs aus der Liste unten verwenden.
   - Nur zuordnen, wenn die Simulation den Inhalt wirklich trifft, nicht wenn sie „irgendwie verwandt“ ist. Lieber eine weniger.
   - **Klassenstufe beachten:** Jede Simulation hat eine Klassenstufe (z. B. „Kl. 9–10“). Ordne sie nur Klassen **innerhalb** dieses Bereichs zu. Passt sie inhaltlich, aber die Klassenstufe nicht, ordne sie **nicht** zu, sondern liste sie in Teil D unter „Passt inhaltlich, Klassenstufe weicht ab“ (mit Klasse, Bereich und Simulation).
   - Ein Bereich mit Unterpunkten bekommt **keine eigenen** Simulationen; die stehen bei den Unterpunkten.
8. **Lücken finden:** Bereiche ohne passende Simulation in Teil D auflisten, mit einem Vorschlag für eine neue Simulation (Titel und ein Satz Idee).
9. Zu jeder Klasse die **Quelle** angeben: Dokumentname, Seitenzahl und, falls im Dokument eine Internetadresse steht, diese (https).
10. Alles auf Deutsch; zusätzlich je Überschrift und Kurzbeschreibung eine **englische Übersetzung**.
11. **Naturphänomene und Technik (NwT) oder BNT** (Biologie, Naturphänomene und Technik, Klassen 5/6) nur aufnehmen, wenn das PDF ausdrücklich physikalische Inhalte enthält; dann als eigene Klasse mit Hinweis in `note`.

### Ausgabeformat (genau so)

**Teil A – Überblick**
- Bundesland, Schulart, Fach, Name und Stand des Bildungsplans, G8 oder G9, welche Klassen.
- Tabelle: Klasse | Abschnitt (z. B. „Klassen 7/8“) | Anzahl Bereiche | Anzahl zugeordneter Simulationen.

**Teil B – Bildungsplan im Detail**, je Klasse:

```
## Klasse 8   (Quelle: <Dokument>, S. 24–31, <Adresse>)
### 3.2.1 <Originalüberschrift>
- Kurz (DE): …
- Kurz (EN): …
- Simulationen: `id-1`, `id-2`
- Unterpunkte:
  - 3.2.1.1 <Originalüberschrift> – Kurz: … – Simulationen: …
```

**Teil C – JSON** in genau dieser Struktur (für den direkten Einbau):

```json
{
  "id": "baden-wuerttemberg-gymnasium-physik",
  "subject": "physik",
  "slug": { "de": "baden-wuerttemberg-gymnasium", "en": "baden-wuerttemberg-gymnasium" },
  "state": { "de": "Baden-Württemberg", "en": "Baden-Württemberg" },
  "schoolType": { "de": "Gymnasium", "en": "Gymnasium" },
  "sourceName": "Bildungsplan",
  "grades": [
    {
      "grade": 8,
      "sourceUrl": "https://www.bildungsplaene-bw.de/…",
      "note": { "de": "…", "en": "…" },
      "units": [
        {
          "code": "3.2.1",
          "title": { "de": "…", "en": "…" },
          "summary": { "de": "…", "en": "…" },
          "simulations": ["ohmsches-gesetz"],
          "parts": [ { "code": "3.2.1.1", "title": { "de": "…", "en": "…" }, "summary": { "de": "…", "en": "…" }, "simulations": [] } ]
        }
      ]
    }
  ]
}
```

Hinweise zum JSON:
- **Jede Klasse genau einmal** in `grades` (keine zwei Einträge mit derselben Zahl). Gibt es für eine Klasse mehrere Fassungen (z. B. Basis- und Leistungsfach), alles in diesen einen Eintrag und die Unterschiede in der Überschrift kennzeichnen.
- `note`, `summary`, `simulations` und `parts` dürfen fehlen, wenn sie leer sind.
- `code` ist innerhalb einer Klasse eindeutig.
- `sourceUrl` beginnt immer mit `https://`. Steht keine Adresse im Dokument, nimm `https://www.bildungsplaene-bw.de` und vermerke das in Teil E.
- Gültiges JSON: doppelte Anführungszeichen, keine Kommentare, kein Komma am Ende.

**Teil D – Lücken und Vorschläge**
- Bereiche ohne passende Simulation, je mit Vorschlag für eine neue Simulation.
- „Passt inhaltlich, Klassenstufe weicht ab“ (siehe Regel 7).

**Teil E – Unklarheiten**
Alles, was du nicht sicher zuordnen oder lesen konntest.

Arbeite gründlich Klasse für Klasse. Wenn die Antwort zu lang wird, höre nach einer vollständigen Klasse auf und schreibe „Weiter mit Klasse X – bitte ‚weiter‘ schreiben“. Den JSON-Block (Teil C) erst ganz am Ende vollständig ausgeben.

### Unsere Physik-Simulationen (ID – Titel – Klassenstufe: Kurzbeschreibung)

- `licht-schatten` – Licht und Schatten (Kl. 6–7): Verschiebe Lampe, Gegenstand und Schirm und sieh, wie Kernschatten und Halbschatten entstehen. Dazu Sonnen- und Mondfinsternis.
- `reflexion` – Reflexion am ebenen Spiegel (Kl. 6–8): Richte einen Laser auf einen Spiegel und miss die Winkel. Dazu das Spiegelbild einer Kerze.
- `bewegungsdiagramme` – Gleichförmige und beschleunigte Bewegung (t-s- und t-v-Diagramme) (Kl. 7–10): Ein Auto fährt gleichmäßig oder wird schneller. Dabei entstehen live die Diagramme für Weg, Geschwindigkeit und Beschleunigung.
- `einfacher-stromkreis` – Einfacher Stromkreis (Kl. 7–8): Baue einen Stromkreis aus Batterie, Schalter und Lampe, als Aufbau und als Schaltplan. Ist der Kreis geschlossen, leuchtet die Lampe.
- `hebelgesetz` – Hebelgesetz (Kl. 7–8): Hänge Gewichte an einen Hebel und bring ihn ins Gleichgewicht. Dazu Hebel aus dem Alltag wie Schubkarre und Flaschenöffner.
- `hookesches-gesetz` – Hookesches Gesetz (Kl. 7–8): Hänge Gewichte an eine Feder und miss, wie weit sie sich dehnt. Doppelte Kraft heißt doppelte Dehnung.
- `teilchenmodell` – Teilchenmodell und Temperatur (Kl. 7–8): Heize Eis zu Wasser und Dampf und sieh, wie sich die Teilchen dabei bewegen. Dazu ein Diagramm der Temperatur.
- `brechung` – Brechung und Totalreflexion (Kl. 8–10): Ein Lichtstrahl knickt beim Übergang in Glas oder Wasser ab. Bei flachem Winkel kann er nicht mehr hinaus: Totalreflexion, wie in der Glasfaser.
- `kraefteaddition` – Kräfte addieren und zerlegen (Kl. 8–10): Zwei Kräfte ziehen an einem Punkt. Mit dem Kräfteparallelogramm findest du die Gesamtkraft oder zerlegst eine Kraft in zwei.
- `linsen` – Linsen und Bildentstehung (Kl. 8–10): Verschiebe eine Kerze vor einer Linse und konstruiere das Bild mit drei besonderen Strahlen. Auf dem Schirm wird es scharf.
- `ohmsches-gesetz` – Ohmsches Gesetz (Kl. 8–9): Stelle die Spannung ein und miss die Stromstärke. So entsteht die Kennlinie und du entdeckst das Ohmsche Gesetz.
- `reihe-parallel` – Reihen- und Parallelschaltung (Kl. 8–9): Schalte Lampen hintereinander oder nebeneinander und miss Strom und Spannung an verschiedenen Stellen.
- `schiefe-ebene` – Schiefe Ebene (Kl. 8–10): Ein Klotz liegt auf einer schrägen Ebene. Ab welchem Winkel rutscht er? Die Gewichtskraft wird dazu in zwei Teile zerlegt.
- `energieerhaltung` – Energieerhaltung (Achterbahn) (Kl. 9–10): Ein Wagen fährt Achterbahn: Energie-Säulen zeigen, wie sich Lageenergie und Bewegungsenergie ineinander umwandeln.
- `freier-fall` – Freier Fall (Kl. 9–10): Lass eine Kugel auf Erde, Mond oder Mars fallen und sieh, wie sie immer schneller wird. Dazu Kugel und Feder mit und ohne Luft.
- `gasgesetze` – Gasgesetze (Kl. 9–13): Ein Gas in einem Zylinder mit Kolben: Ändere Druck, Volumen oder Temperatur und sieh, wie sich die anderen Größen verhalten.
- `radioaktiver-zerfall` – Radioaktiver Zerfall und Halbwertszeit (Kl. 9–12): Viele Atomkerne zerfallen zufällig, und ein Zählrohr knackt. Trotzdem ist nach jeder Halbwertszeit ungefähr die Hälfte übrig.
- `doppler-effekt` – Doppler-Effekt (Kl. 10–12): Ein Krankenwagen fährt vorbei, und der Ton wird tiefer. Die Wellenfronten zeigen warum. Auf Wunsch zum Anhören.
- `fadenpendel` – Fadenpendel (Kl. 10–12): Lenke ein Pendel aus, lass es los und miss, wie lange eine Schwingung dauert. Wovon hängt das ab? Auch mit großen Winkeln und Dämpfung.
- `federpendel` – Federpendel (Kl. 10–12): Ein Körper schwingt an einer Feder auf und ab. Diagramme zeigen Ort, Geschwindigkeit und Energie während der Schwingung.
- `kreisbewegung` – Kreisbewegung und Zentripetalkraft (Kl. 10–11): Eine Kugel kreist an einer Schnur, ein Auto fährt durch eine Kurve. Welche Kraft hält sie auf der Kreisbahn?
- `schiefer-wurf` – Waagerechter und schiefer Wurf (Kl. 10–11): Wirf einen Ball unter einem Winkel und sieh seine Bahn. Welcher Winkel trägt am weitesten? Auch auf Mond und Mars.
- `stoesse` – Elastische und unelastische Stöße (Kl. 10–11): Zwei Gleiter stoßen auf einer Luftkissenbahn zusammen. Vorher und nachher wird verglichen, was erhalten bleibt.
- `wellen-ausbreitung` – Transversal- und Longitudinalwellen (Kl. 10–12): Eine Welle läuft durch eine Kette von Teilchen. Jedes Teilchen schwingt nur auf der Stelle, quer oder längs zur Laufrichtung.
- `doppelspalt` – Doppelspalt und Gitter (Kl. 11–13): Laserlicht fällt durch einen Doppelspalt oder ein Gitter. Auf dem Schirm entsteht ein Muster aus hellen und dunklen Streifen.
- `feldlinien` – Feldlinien von Punktladungen (Kl. 11–12): Verschiebe elektrische Ladungen und sieh, wie sich ihre Feldlinien verändern. Mit Messung von Feldstärke und Kraft.
- `induktion` – Elektromagnetische Induktion (Kl. 11–13): Schiebe einen Magneten in eine Spule oder drehe eine Spule im Magnetfeld: Es entsteht eine Spannung. So funktioniert ein Generator.
- `interferenz` – Interferenz zweier Kreiswellen (Kl. 11–13): Zwei Kreiswellen überlagern sich und verstärken sich an manchen Stellen, an anderen löschen sie sich aus.
- `kondensator` – Lade- und Entladekurve des Kondensators (Kl. 11–12): Ein Kondensator lädt sich über einen Widerstand auf und entlädt sich wieder. Die Diagramme zeigen, wie Spannung und Strom sich mit der Zeit ändern.
- `lorentzkraft` – Lorentzkraft und Fadenstrahlrohr (Kl. 11–13): Elektronen fliegen in einem Magnetfeld auf einer leuchtenden Kreisbahn. Aus dem Radius bestimmst du eine Eigenschaft des Elektrons.
- `planetenbahnen` – Planetenbahnen und Keplersche Gesetze (Kl. 11–13): Starte einen Planeten mit eigener Geschwindigkeit und sieh, ob er auf einer Ellipse kreist oder davonfliegt. Mit den Keplerschen Gesetzen.
- `resonanz` – Erzwungene Schwingung und Resonanz (Kl. 11–13): Ein Motor treibt ein schwingendes Rad an. Trifft der Motor genau den richtigen Takt, schwingt das Rad besonders stark: Resonanz.
- `stehende-wellen` – Stehende Wellen (Kl. 11–13): Eine Welle wird am Ende zurückgeworfen, und es entsteht ein festes Muster aus Knoten und Bäuchen, wie auf einer Gitarrensaite.
- `elektronenbeugung` – Elektronenbeugung (Kl. 12–14): Elektronen treffen auf eine dünne Graphitschicht und bilden Ringe auf dem Schirm, wie es nur Wellen tun.
- `linienspektren` – Atommodelle und Linienspektren (Kl. 12–13): Ein Elektron springt zwischen den Energiestufen eines Atoms und sendet dabei Licht einer bestimmten Farbe aus. So entsteht das Linienspektrum.
- `photoeffekt` – Photoeffekt (Kl. 12–13): Licht trifft auf ein Metall und löst Elektronen heraus, aber nur ab einer bestimmten Farbe. So zeigt sich, dass Licht aus Photonen besteht.
