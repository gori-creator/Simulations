# Prompt: Lehrplan Bayern, Gymnasium, Physik (Mängelliste Punkt 5)

Für einen Helfer **ohne GitHub**, in einem neuen Chat auf claude.ai.

## Vorbereitung (für den Helfer)

1. Auf **lehrplanplus.bayern.de** gehen, Schulart **Gymnasium**, Bereich **Fachlehrpläne**.
2. Für jede Jahrgangsstufe die Seite öffnen und als PDF speichern (Browser: Drucken → „Als PDF speichern“):
   - **Natur und Technik, Jahrgangsstufe 7** (dort steckt der erste Physikunterricht)
   - **Physik, Jahrgangsstufen 8, 9, 10, 11, 12 und 13** (falls es auch „Physik 7“ gibt, diese ebenfalls)
   - **Natur und Technik 5 und 6** nur, falls dort physikalische Inhalte stehen (zum Beispiel Stoffe, Teilchen, Energie)
3. Alle PDFs in den neuen Chat hochladen. Wird es zu viel, zwei Chats nehmen: einen für 7–10 und einen für 11–13.
4. Den **gesamten Text ab „Der Prompt“** als erste Nachricht einfügen und abschicken.
5. Schreibt Claude „bitte weiter schreiben“, dann „weiter“ antworten, bis alles fertig ist.
6. Die komplette Antwort als **Markdown-Datei** speichern, zum Beispiel `bayern-gymnasium-physik.md`, und an die Projektleitung schicken. Den JSON-Block (Teil C) zusätzlich als `bayern-gymnasium-physik.json`.

---

## Der Prompt (ab hier alles kopieren)

Du bist Fachdidaktiker:in für Physik und hilfst beim Aufbau einer kostenlosen Lernplattform mit interaktiven Simulationen für Schulen in Deutschland. Im Anhang sind die offiziellen Fachlehrpläne **LehrplanPLUS Bayern, Gymnasium (G9)** für **Physik** (und „Natur und Technik“, soweit sie Physik enthalten).

### Deine Aufgabe

Bereite den Lehrplan **vollständig und extrem sauber strukturiert** auf und ordne jedem Lernbereich die passenden Simulationen unserer Plattform zu (Liste ganz unten).

### Regeln

1. **Nur aus den hochgeladenen Dokumenten arbeiten.** Nichts erfinden, nichts aus dem Gedächtnis ergänzen. Was unklar ist oder fehlt, kommt in Teil E „Unklarheiten“.
2. **Struktur genau wie im Lehrplan:** Jahrgangsstufe → Lernbereich (mit Nummer und Originalüberschrift, z. B. „Ph 8 1 …“) → Unterbereiche (1.1, 1.2 …). Nummern und Überschriften **wörtlich** übernehmen. Stundenrichtwerte, wenn angegeben, in Klammern dazu.
3. **Kurzbeschreibungen in eigenen Worten**, 1–2 einfache Sätze je Bereich, verständlich für Lehrkräfte und Schüler. Keine wörtlichen Lehrplanzitate außer den Überschriften (Urheberrecht).
4. **Natur und Technik:** Nur die physikalischen Lernbereiche aufnehmen. Bei der Jahrgangsstufe in `note` vermerken, dass Physik dort Teil des Fachs „Natur und Technik“ ist.
5. **Oberstufe (11–13):** Wenn der Lehrplan verschiedene Kurse, Profile, Wahlpflichtbereiche oder Ausbildungsrichtungen unterscheidet, genau so wiedergeben und in der Überschrift kennzeichnen (z. B. „(nur Profil …)“).
6. **Zuordnung der Simulationen:**
   - Nur IDs aus der Liste unten verwenden.
   - Nur zuordnen, wenn die Simulation den Inhalt wirklich trifft, nicht wenn sie „irgendwie verwandt“ ist. Lieber eine weniger.
   - **Klassenstufe beachten:** Jede Simulation hat eine Klassenstufe (z. B. „Kl. 9–10“). Ordne sie nur Jahrgangsstufen **innerhalb** dieses Bereichs zu. Passt eine Simulation inhaltlich, aber die Klassenstufe nicht, ordne sie **nicht** zu, sondern liste sie in Teil D unter „Passt inhaltlich, Klassenstufe weicht ab“ (mit Jahrgangsstufe, Lernbereich und Simulation).
   - Ein Lernbereich mit Unterbereichen bekommt **keine eigenen** Simulationen; die stehen bei den Unterbereichen.
7. **Lücken finden:** Lernbereiche ohne passende Simulation in Teil D auflisten, mit einem Vorschlag für eine neue Simulation (Titel und ein Satz Idee).
8. Zu jeder Jahrgangsstufe die **Quelle** angeben: Dokumentname und, falls im Dokument eine Internetadresse steht, diese (https).
9. Alles auf Deutsch; zusätzlich je Überschrift und Kurzbeschreibung eine **englische Übersetzung**.

### Ausgabeformat (genau so)

**Teil A – Überblick**
- Bundesland, Schulart, Fach, Name und Stand des Lehrplans, G9, welche Jahrgangsstufen.
- Tabelle: Jahrgangsstufe | Fach (Physik bzw. Natur und Technik) | Anzahl Lernbereiche | Anzahl zugeordneter Simulationen.

**Teil B – Lehrplan im Detail**, je Jahrgangsstufe:

```
## Jahrgangsstufe 8   (Quelle: <Dokument>, <Adresse>)
### Ph 8 1 <Originalüberschrift> (ca. 20 Std.)
- Kurz (DE): …
- Kurz (EN): …
- Simulationen: `id-1`, `id-2`
- Unterbereiche:
  - 1.1 <Originalüberschrift> – Kurz: … – Simulationen: …
```

**Teil C – JSON** in genau dieser Struktur (für den direkten Einbau):

```json
{
  "id": "bayern-gymnasium-physik",
  "subject": "physik",
  "slug": { "de": "bayern-gymnasium", "en": "bavaria-gymnasium" },
  "state": { "de": "Bayern", "en": "Bavaria" },
  "schoolType": { "de": "Gymnasium", "en": "Gymnasium" },
  "sourceName": "LehrplanPLUS",
  "grades": [
    {
      "grade": 8,
      "sourceUrl": "https://www.lehrplanplus.bayern.de/…",
      "note": { "de": "…", "en": "…" },
      "units": [
        {
          "code": "1",
          "title": { "de": "…", "en": "…" },
          "summary": { "de": "…", "en": "…" },
          "simulations": ["ohmsches-gesetz"],
          "parts": [ { "code": "1.1", "title": { "de": "…", "en": "…" }, "summary": { "de": "…", "en": "…" }, "simulations": [] } ]
        }
      ]
    }
  ]
}
```

Hinweise zum JSON:
- `note`, `summary`, `simulations` und `parts` dürfen fehlen, wenn sie leer sind.
- `code` ist innerhalb einer Jahrgangsstufe eindeutig (ohne „Ph 8“, nur „1“, „1.1“ …).
- `sourceUrl` beginnt immer mit `https://`.
- Gültiges JSON: doppelte Anführungszeichen, keine Kommentare, kein Komma am Ende.

**Teil D – Lücken und Vorschläge**
- Lernbereiche ohne passende Simulation, je mit Vorschlag für eine neue Simulation.
- „Passt inhaltlich, Klassenstufe weicht ab“ (siehe Regel 6).

**Teil E – Unklarheiten**
Alles, was du nicht sicher zuordnen oder lesen konntest.

Arbeite gründlich Jahrgangsstufe für Jahrgangsstufe. Wenn die Antwort zu lang wird, höre nach einer vollständigen Jahrgangsstufe auf und schreibe „Weiter mit Jahrgangsstufe X – bitte ‚weiter‘ schreiben“. Den JSON-Block (Teil C) erst ganz am Ende vollständig ausgeben.

### Unsere Physik-Simulationen (ID – Titel – Klassenstufe: Kurzbeschreibung)

- `bewegungsdiagramme` – Gleichförmige und beschleunigte Bewegung (t-s- und t-v-Diagramme) (Kl. 7–10): Ein Auto fährt gleichmäßig oder wird schneller. Dabei entstehen live die Diagramme für Weg, Geschwindigkeit und Beschleunigung.
- `freier-fall` – Freier Fall (Kl. 9–10): Lass eine Kugel auf Erde, Mond oder Mars fallen und sieh, wie sie immer schneller wird. Dazu Kugel und Feder mit und ohne Luft.
- `hookesches-gesetz` – Hookesches Gesetz (Kl. 7–8): Hänge Gewichte an eine Feder und miss, wie weit sie sich dehnt. Doppelte Kraft heißt doppelte Dehnung.
- `hebelgesetz` – Hebelgesetz (Kl. 7–8): Hänge Gewichte an einen Hebel und bring ihn ins Gleichgewicht. Dazu Hebel aus dem Alltag wie Schubkarre und Flaschenöffner.
- `kraefteaddition` – Kräfte addieren und zerlegen (Kl. 8–10): Zwei Kräfte ziehen an einem Punkt. Mit dem Kräfteparallelogramm findest du die Gesamtkraft oder zerlegst eine Kraft in zwei.
- `schiefe-ebene` – Schiefe Ebene (Kl. 8–10): Ein Klotz liegt auf einer schrägen Ebene. Ab welchem Winkel rutscht er? Die Gewichtskraft wird dazu in zwei Teile zerlegt.
- `energieerhaltung` – Energieerhaltung (Achterbahn) (Kl. 9–10): Ein Wagen fährt Achterbahn: Energie-Säulen zeigen, wie sich Lageenergie und Bewegungsenergie ineinander umwandeln.
- `stoesse` – Elastische und unelastische Stöße (Kl. 10–11): Zwei Gleiter stoßen auf einer Luftkissenbahn zusammen. Vorher und nachher wird verglichen, was erhalten bleibt.
- `schiefer-wurf` – Waagerechter und schiefer Wurf (Kl. 10–11): Wirf einen Ball unter einem Winkel und sieh seine Bahn. Welcher Winkel trägt am weitesten? Auch auf Mond und Mars.
- `kreisbewegung` – Kreisbewegung und Zentripetalkraft (Kl. 10–11): Eine Kugel kreist an einer Schnur, ein Auto fährt durch eine Kurve. Welche Kraft hält sie auf der Kreisbahn?
- `planetenbahnen` – Planetenbahnen und Keplersche Gesetze (Kl. 11–13): Starte einen Planeten mit eigener Geschwindigkeit und sieh, ob er auf einer Ellipse kreist oder davonfliegt. Mit den Keplerschen Gesetzen.
- `fadenpendel` – Fadenpendel (Kl. 10–12): Lenke ein Pendel aus, lass es los und miss, wie lange eine Schwingung dauert. Wovon hängt das ab?
- `federpendel` – Federpendel (Kl. 10–12): Ein Körper schwingt an einer Feder auf und ab. Diagramme zeigen Ort, Geschwindigkeit und Energie während der Schwingung.
- `resonanz` – Erzwungene Schwingung und Resonanz (Kl. 11–13): Ein Motor treibt ein schwingendes Rad an. Trifft der Motor genau den richtigen Takt, schwingt das Rad besonders stark: Resonanz.
- `wellen-ausbreitung` – Transversal- und Longitudinalwellen (Kl. 10–12): Eine Welle läuft durch eine Kette von Teilchen. Jedes Teilchen schwingt nur auf der Stelle, quer oder längs zur Laufrichtung.
- `doppler-effekt` – Doppler-Effekt (Kl. 10–12): Ein Krankenwagen fährt vorbei, und der Ton wird tiefer. Die Wellenfronten zeigen warum. Auf Wunsch zum Anhören.
- `interferenz` – Interferenz zweier Kreiswellen (Kl. 11–13): Zwei Kreiswellen überlagern sich und verstärken sich an manchen Stellen, an anderen löschen sie sich aus.
- `stehende-wellen` – Stehende Wellen (Kl. 11–13): Eine Welle wird am Ende zurückgeworfen, und es entsteht ein festes Muster aus Knoten und Bäuchen, wie auf einer Gitarrensaite.
- `einfacher-stromkreis` – Einfacher Stromkreis (Kl. 7–8): Baue einen Stromkreis aus Batterie, Schalter und Lampe, als Aufbau und als Schaltplan. Ist der Kreis geschlossen, leuchtet die Lampe.
- `ohmsches-gesetz` – Ohmsches Gesetz (Kl. 8–9): Stelle die Spannung ein und miss die Stromstärke. So entsteht die Kennlinie und du entdeckst das Ohmsche Gesetz.
- `reihe-parallel` – Reihen- und Parallelschaltung (Kl. 8–9): Schalte Lampen hintereinander oder nebeneinander und miss Strom und Spannung an verschiedenen Stellen.
- `feldlinien` – Feldlinien von Punktladungen (Kl. 11–12): Verschiebe elektrische Ladungen und sieh, wie sich ihre Feldlinien verändern. Mit Messung von Feldstärke und Kraft.
- `kondensator` – Lade- und Entladekurve des Kondensators (Kl. 11–12): Ein Kondensator lädt sich über einen Widerstand auf und entlädt sich wieder. Die Diagramme zeigen, wie Spannung und Strom sich mit der Zeit ändern.
- `lorentzkraft` – Lorentzkraft und Fadenstrahlrohr (Kl. 11–13): Elektronen fliegen in einem Magnetfeld auf einer leuchtenden Kreisbahn. Aus dem Radius bestimmst du eine Eigenschaft des Elektrons.
- `induktion` – Elektromagnetische Induktion (Kl. 11–13): Schiebe einen Magneten in eine Spule oder drehe eine Spule im Magnetfeld: Es entsteht eine Spannung. So funktioniert ein Generator.
- `licht-schatten` – Licht und Schatten (Kl. 6–7): Verschiebe Lampe, Gegenstand und Schirm und sieh, wie Kernschatten und Halbschatten entstehen. Dazu Sonnen- und Mondfinsternis.
- `reflexion` – Reflexion am ebenen Spiegel (Kl. 6–8): Richte einen Laser auf einen Spiegel und miss die Winkel. Dazu das Spiegelbild einer Kerze.
- `brechung` – Brechung und Totalreflexion (Kl. 8–10): Ein Lichtstrahl knickt beim Übergang in Glas oder Wasser ab. Bei flachem Winkel kann er gar nicht mehr hinaus: Totalreflexion.
- `linsen` – Linsen und Bildentstehung (Kl. 8–10): Verschiebe eine Kerze vor einer Linse und konstruiere das Bild mit drei besonderen Strahlen. Auf dem Schirm wird es scharf.
- `doppelspalt` – Doppelspalt und Gitter (Kl. 11–13): Laserlicht fällt durch einen Doppelspalt oder ein Gitter. Auf dem Schirm entsteht ein Muster aus hellen und dunklen Streifen.
- `teilchenmodell` – Teilchenmodell und Temperatur (Kl. 7–8): Heize Eis zu Wasser und Dampf und sieh, wie sich die Teilchen dabei bewegen. Dazu ein Diagramm der Temperatur.
- `gasgesetze` – Gasgesetze (Kl. 9–13): Ein Gas in einem Zylinder mit Kolben: Ändere Druck, Volumen oder Temperatur und sieh, wie sich die anderen Größen verhalten.
- `radioaktiver-zerfall` – Radioaktiver Zerfall und Halbwertszeit (Kl. 9–12): Viele Atomkerne zerfallen zufällig, und ein Zählrohr knackt. Trotzdem ist nach jeder Halbwertszeit ungefähr die Hälfte übrig.
- `photoeffekt` – Photoeffekt (Kl. 12–13): Licht trifft auf ein Metall und löst Elektronen heraus, aber nur ab einer bestimmten Farbe. So zeigt sich, dass Licht aus Photonen besteht.
- `linienspektren` – Atommodelle und Linienspektren (Kl. 12–13): Ein Elektron springt zwischen den Energiestufen eines Atoms und sendet dabei Licht einer bestimmten Farbe aus. So entsteht das Linienspektrum.
- `elektronenbeugung` – Elektronenbeugung (Kl. 12–14): Elektronen treffen auf eine dünne Graphitschicht und bilden Ringe auf dem Schirm, wie es nur Wellen tun.
