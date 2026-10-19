# Prompt: Lehrpläne der Bundesländer aufbereiten

Für einen Helfer **ohne GitHub**: In einem neuen Chat auf claude.ai die Lehrplan-PDFs eines Bundeslands hochladen (je Fach, Schulart, Jahrgangsstufen) und den Text unten **komplett** als erste Nachricht einfügen. Ergebnis (Markdown-Datei + JSON-Block) an die Projektleitung schicken; sie kommt in `docs/lehrplaene/<land>-<schulart>-<fach>.md` und wird von Claude in `src/curriculum/lehrplaene/` eingebaut.

Pro Chat **ein** Bundesland + **ein** Fach + **eine** Schulart (sonst wird es zu lang). Bei großen Lehrplänen notfalls in zwei Hälften (z. B. Klasse 5–8 und 9–13).

---

## Der Prompt (ab hier kopieren)

Du bist Fachdidaktiker:in für Mathematik und Physik und hilfst beim Aufbau einer kostenlosen Lernplattform mit interaktiven Simulationen für Schulen in Deutschland. Im Anhang sind die offiziellen Lehrpläne (Kerncurricula/Bildungspläne) eines Bundeslands.

### Deine Aufgabe

Bereite den Lehrplan **vollständig und extrem sauber strukturiert** auf und ordne jedem Lernbereich die passenden Simulationen unserer Plattform zu (Liste unten).

### Regeln

1. **Nur aus den hochgeladenen Dokumenten arbeiten.** Nichts erfinden. Wenn etwas unklar ist oder fehlt, schreibe es ausdrücklich in den Abschnitt „Unklarheiten“.
2. **Struktur genau wie im Lehrplan:** Jahrgangsstufe (bzw. Doppeljahrgangsstufe) → Lernbereich/Themenfeld/Inhaltsfeld (mit Nummer und Originalüberschrift) → Unterbereiche. Nummerierung und Überschriften **wörtlich** übernehmen.
3. **Kurzbeschreibungen in eigenen Worten** (1–2 Sätze je Bereich, keine wörtlichen Lehrplanzitate außer den Überschriften – Urheberrecht).
4. Wenn der Lehrplan Jahrgangsstufen zusammenfasst (z. B. „Klasse 5/6“) oder Wahlbereiche, Grund-/Leistungskurs, G8/G9 oder Anforderungsniveaus unterscheidet: genau so wiedergeben und kennzeichnen.
5. **Zuordnung der Simulationen:** Nur IDs aus der Liste unten verwenden. Nur zuordnen, wenn die Simulation wirklich zum Inhalt passt (nicht „irgendwie verwandt“). Lieber eine Simulation weniger. Geplante Simulationen (markiert „geplant“) dürfen zugeordnet werden.
6. **Lücken finden:** Liste Lernbereiche, zu denen **keine** Simulation passt, und schlage dafür neue Simulationen vor (Titel + 1 Satz Idee).
7. Zu jeder Jahrgangsstufe: Quelle angeben (Dokumentname, Seitenzahl, falls im Dokument eine Internetadresse steht, diese).
8. Deutsch; zusätzlich je Überschrift und Kurzbeschreibung eine englische Übersetzung.

### Ausgabeformat (genau so)

**Teil A – Überblick (Markdown)**
- Bundesland, Schulart, Fach, Name/Jahr des Lehrplans, gültig für welche Jahrgänge, G8/G9.
- Tabelle aller Jahrgangsstufen mit Anzahl der Lernbereiche und Anzahl zugeordneter Simulationen.

**Teil B – Lehrplan im Detail (Markdown)**, je Jahrgangsstufe:

```
## Jahrgangsstufe 7   (Quelle: <Dokument>, S. 12–15)
### 7.1 <Originalüberschrift>
- Kurz (DE): …
- Kurz (EN): …
- Simulationen: `id-1`, `id-2`
- Unterbereiche:
  - 7.1.1 <Originalüberschrift> – Kurz: … – Simulationen: …
```

**Teil C – JSON** in genau dieser Struktur (für den direkten Einbau):

```json
{
  "id": "hessen-gymnasium-mathematik",
  "subject": "mathematik",
  "slug": { "de": "hessen-gymnasium", "en": "hesse-gymnasium" },
  "state": { "de": "Hessen", "en": "Hesse" },
  "schoolType": { "de": "Gymnasium", "en": "Gymnasium" },
  "sourceName": "Kerncurriculum Hessen",
  "grades": [
    {
      "grade": 5,
      "sourceUrl": "https://…",
      "note": { "de": "…", "en": "…" },
      "units": [
        {
          "code": "1",
          "title": { "de": "…", "en": "…" },
          "summary": { "de": "…", "en": "…" },
          "simulations": ["stellenwerte", "zahlengerade"],
          "parts": [ { "code": "1.1", "title": {…}, "summary": {…}, "simulations": [] } ]
        }
      ]
    }
  ]
}
```
(`note`, `summary`, `simulations`, `parts` dürfen fehlen, wenn leer. Doppeljahrgangsstufen: bei beiden Jahrgangsstufen eintragen und in `note` vermerken.)

**Teil D – Lücken und Vorschläge** (Lernbereiche ohne passende Simulation, mit Ideen für neue Simulationen).

**Teil E – Unklarheiten** (alles, was du nicht sicher zuordnen konntest).

Arbeite gründlich Jahrgangsstufe für Jahrgangsstufe. Wenn die Antwort zu lang wird, höre nach einer vollständigen Jahrgangsstufe auf und schreibe „Weiter mit Jahrgangsstufe X – bitte ‚weiter‘ schreiben“.

### Unsere Simulationen (ID – Titel – Klassenstufe)

### Mathematik
- `einheiten` – Einheiten umrechnen mit der Einheitentafel (Kl. 5)
- `koerpernetze` – Netze und Oberflächen von Körpern (Kl. 5–8)
- `koordinaten-lage` – Punkte, Geraden und Kreise: Lagebeziehungen (Kl. 5)
- `massstab` – Maßstab: Karte und Wirklichkeit (Kl. 5)
- `primfaktoren` – Primfaktorzerlegung und Teilbarkeit (Kl. 5–6)
- `stellenwerte` – Stellenwertsystem und Runden (Kl. 5)
- `termbaum` – Termbaum: die Struktur von Termen (Kl. 5–7)
- `umfang-flaeche` – Umfang und Flächeninhalt von Rechtecken (Kl. 5)
- `vierecke` – Das Haus der Vierecke (Kl. 5–7)
- `winkel-messen` – Winkel schätzen und messen (Kl. 5)
- `zaehlprinzip` – Zählprinzip und Baumdiagramm (Kl. 5–8)
- `zahlengerade` – Ganze Zahlen an der Zahlengeraden addieren und subtrahieren (Kl. 5)
- `zehnerpotenzen` – Potenzen, Zehnerpotenzen und Größenordnungen (Kl. 5–6)
- `bruchteile` – Bruchteile darstellen (Kl. 6)
- `brueche-rechnen` – Brüche multiplizieren und dividieren am Rechteckmodell (Kl. 6)
- `brueche-vergleichen` – Brüche erweitern, kürzen und vergleichen (Kl. 6)
- `dezimalbrueche` – Endliche und periodische Dezimalbrüche (Kl. 6)
- `diagramme` – Diagramme lesen und kritisch prüfen (Kl. 6)
- `flaechen-zerlegen` – Parallelogramm, Dreieck und Trapez durch Zerlegen und Ergänzen (Kl. 6) (geplant)
- `gesetz-grosse-zahlen` – Gesetz der großen Zahlen (Kl. 6–9)
- `proportional` – Direkte und indirekte Proportionalität (Kl. 6–8)
- `prozentstreifen` – Prozentstreifen (Kl. 6–7)
- `quader-volumen` – Volumen von Quadern mit Einheitswürfeln (Kl. 6)
- `besondere-linien` – Umkreis, Inkreis und besondere Linien im Dreieck (Kl. 7–8)
- `binomische-formeln` – Binomische Formeln am Quadrat (Kl. 7)
- `boxplot` – Mittelwert, Median und Boxplot (Kl. 7)
- `dreieckskonstruktion` – Kongruenzsätze und Dreieckskonstruktionen (Kl. 7)
- `lineare-funktion` – Lineare Funktion (Kl. 7–9)
- `mittelsenkrechte` – Mittelsenkrechte und Winkelhalbierende (Kl. 7)
- `spiegelung` – Achsen- und Punktspiegelung (Kl. 7)
- `thales` – Satz des Thales (Kl. 7)
- `waagemodell` – Lineare Gleichungen am Waagemodell (Kl. 7)
- `winkel-geradenkreuzung` – Winkel an Geradenkreuzungen (Kl. 7) (geplant)
- `winkelsumme` – Innenwinkelsumme in Dreieck und Vieleck (Kl. 7) (geplant)
- `baumdiagramm` – Mehrstufige Zufallsexperimente und Pfadregeln (Kl. 8–10)
- `funktion-zuordnung` – Funktion oder nicht? Zuordnungen und ihre Graphen (Kl. 8)
- `funktionsplotter` – Funktionsplotter mit eigenen Termen (Kl. 8–13)
- `gleichungen-grafisch` – Gleichungen grafisch lösen: Schnittpunkte von Graphen (Kl. 8–9)
- `hyperbel` – Hyperbeln und ihre Asymptoten (Kl. 8)
- `kreiszahl-pi` – Kreisumfang, Kreisfläche und die Zahl π (Kl. 8)
- `lgs-grafisch` – Lineare Gleichungssysteme grafisch lösen (Kl. 8)
- `prisma-zylinder` – Prisma und Zylinder: Oberfläche und Volumen (Kl. 8)
- `pythagoras` – Satz des Pythagoras (Kl. 8–9)
- `einheitskreis` – Einheitskreis (Kl. 9–10)
- `extremwert-parabel` – Extremwertaufgaben mit Parabeln (Kl. 9)
- `galtonbrett` – Galtonbrett (Kl. 9–12)
- `parabel-drei-punkte` – Parabel durch drei Punkte (Kl. 9)
- `potenzfunktionen` – Potenzfunktionen y = a · xⁿ (Kl. 9–10)
- `quadratische-funktion` – Quadratische Funktion (Kl. 9–10)
- `quadratwurzel` – Quadratwurzeln und das Heron-Verfahren (Kl. 9)
- `sin-cos-tan-dreieck` – Sinus, Kosinus und Tangens im rechtwinkligen Dreieck (Kl. 9–10)
- `sinussatz-kosinussatz` – Sinussatz und Kosinussatz (Kl. 9–10)
- `strahlensaetze` – Strahlensätze (Kl. 9)
- `vergroessern` – Ähnliche Figuren: Wie wachsen Fläche und Volumen? (Kl. 9)
- `vierfeldertafel` – Vierfeldertafel und Mengendiagramm (Kl. 9–11)
- `cavalieri` – Prinzip von Cavalieri (Kl. 10)
- `exponentielles-wachstum` – Exponentielles Wachstum und Zerfall (Kl. 10)
- `ganzrationale-funktionen` – Ganzrationale Funktionen: Nullstellen, Vielfachheit und Randverhalten (Kl. 10–11)
- `geburtstagsproblem` – Geburtstagsproblem simulieren (Kl. 10)
- `logarithmus` – Logarithmus als Umkehrung des Potenzierens (Kl. 10–12) (geplant)
- `monte-carlo-pi` – Monte-Carlo-Methode: π mit Zufall bestimmen (Kl. 10)
- `pyramide-kegel-kugel` – Pyramide, Kegel und Kugel (Kl. 10)
- `sinusfunktion` – Allgemeine Sinusfunktion (Kl. 10–11)
- `ziegenproblem` – Ziegenproblem (Kl. 10)
- `ableitungsfunktion` – Ableitungsfunktion grafisch (Kl. 11–12)
- `bedingte-wahrscheinlichkeit` – Bedingte Wahrscheinlichkeit am Beispiel medizinischer Tests (Kl. 11) (geplant)
- `grenzverhalten` – Grenzverhalten und Asymptoten (Kl. 11)
- `kurvendiskussion` – Monotonie, Extrem- und Wendestellen (Kl. 11–12)
- `newton-verfahren` – Newton-Verfahren (Kl. 11)
- `polstellen-asymptoten` – Polstellen und Asymptoten gebrochen-rationaler Funktionen (Kl. 11–12)
- `sekante-tangente` – Von der Sekante zur Tangente (Kl. 11)
- `transformationen` – Graphen verschieben, strecken und spiegeln (Kl. 11)
- `binomialverteilung` – Binomialverteilung (Kl. 12) (geplant)
- `e-funktion` – Die natürliche Exponentialfunktion (Kl. 12)
- `funktionenscharen` – Funktionenscharen (Kl. 12–13)
- `geraden-ebenen` – Geraden und Ebenen im Raum (Kl. 12–13) (geplant)
- `hauptsatz` – Integralfunktion und Hauptsatz (Kl. 12–13)
- `koordinaten-3d` – Punkte und Körper im räumlichen Koordinatensystem (Kl. 12)
- `matrix-abbildungen` – Matrizen als lineare Abbildungen (Kl. 12–14)
- `ober-untersummen` – Integral als Flächenbilanz (Rechtecksummen) (Kl. 12–13)
- `signifikanztest` – Einseitiger Signifikanztest: Fehler 1. und 2. Art (Kl. 12) (geplant)
- `skalar-vektorprodukt` – Skalarprodukt und Vektorprodukt (Kl. 12)
- `stammfunktion-grafisch` – Vom Graphen zur Stammfunktion (Kl. 12–13)
- `umkehrfunktion` – Umkehrfunktionen: Spiegeln an y = x (Kl. 12)
- `vektoren-3d` – Vektoren addieren und vervielfachen (3D) (Kl. 12)
- `aenderungsrate` – Integral als Gesamtänderung: von der Geschwindigkeit zum Weg (Kl. 13)
- `extremwertprobleme` – Extremwertprobleme (Kl. 13)
- `kugeln` – Kugeln, Geraden und Ebenen (Kl. 13) (geplant)
- `lage-abstaende` – Lagebeziehungen und Abstände im Raum (Kl. 13) (geplant)
- `normalverteilung` – Normalverteilung (Kl. 13)
- `rotationskoerper` – Rotationskörper (Kl. 13)
- `taylor-polynome` – Taylorpolynome (Kl. 13–14)
- `fourier-reihen` – Fourier-Reihen (Kl. 14)
### Physik
- `licht-schatten` – Licht und Schatten (Kl. 6–7)
- `reflexion` – Reflexion am ebenen Spiegel (Kl. 6–8)
- `bewegungsdiagramme` – Gleichförmige und beschleunigte Bewegung (t-s- und t-v-Diagramme) (Kl. 7–10)
- `einfacher-stromkreis` – Einfacher Stromkreis (Kl. 7–8)
- `hebelgesetz` – Hebelgesetz (Kl. 7–8)
- `hookesches-gesetz` – Hookesches Gesetz (Kl. 7–8)
- `teilchenmodell` – Teilchenmodell und Temperatur (Kl. 7–8)
- `brechung` – Brechung und Totalreflexion (Kl. 8–10)
- `kraefteaddition` – Kräfte addieren und zerlegen (Kl. 8–10)
- `linsen` – Linsen und Bildentstehung (Kl. 8–10)
- `ohmsches-gesetz` – Ohmsches Gesetz (Kl. 8–9)
- `reihe-parallel` – Reihen- und Parallelschaltung (Kl. 8–9)
- `schiefe-ebene` – Schiefe Ebene (Kl. 8–10)
- `energieerhaltung` – Energieerhaltung (Achterbahn) (Kl. 9–10)
- `freier-fall` – Freier Fall (Kl. 9–10)
- `gasgesetze` – Gasgesetze (Kl. 9–13) (geplant)
- `radioaktiver-zerfall` – Radioaktiver Zerfall und Halbwertszeit (Kl. 9–12) (geplant)
- `doppler-effekt` – Doppler-Effekt (Kl. 10–12)
- `fadenpendel` – Fadenpendel (Kl. 10–12)
- `federpendel` – Federpendel (Kl. 10–12)
- `kreisbewegung` – Kreisbewegung und Zentripetalkraft (Kl. 10–11)
- `schiefer-wurf` – Waagerechter und schiefer Wurf (Kl. 10–11)
- `stoesse` – Elastische und unelastische Stöße (Kl. 10–11)
- `wellen-ausbreitung` – Transversal- und Longitudinalwellen (Kl. 10–12)
- `doppelspalt` – Doppelspalt und Gitter (Kl. 11–13) (geplant)
- `feldlinien` – Feldlinien von Punktladungen (Kl. 11–12) (geplant)
- `induktion` – Elektromagnetische Induktion (Kl. 11–13) (geplant)
- `interferenz` – Interferenz zweier Kreiswellen (Kl. 11–13)
- `kondensator` – Lade- und Entladekurve des Kondensators (Kl. 11–12) (geplant)
- `lorentzkraft` – Lorentzkraft und Fadenstrahlrohr (Kl. 11–13) (geplant)
- `planetenbahnen` – Planetenbahnen und Keplersche Gesetze (Kl. 11–13)
- `resonanz` – Erzwungene Schwingung und Resonanz (Kl. 11–13)
- `stehende-wellen` – Stehende Wellen (Kl. 11–13)
- `elektronenbeugung` – Elektronenbeugung (Kl. 12–14) (geplant)
- `linienspektren` – Atommodelle und Linienspektren (Kl. 12–13) (geplant)
- `photoeffekt` – Photoeffekt (Kl. 12–13) (geplant)
