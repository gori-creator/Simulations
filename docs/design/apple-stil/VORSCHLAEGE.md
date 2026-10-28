# Apple-Stil: Vorschläge und Entwurf (28.10.2026)

Auftrag: `docs/agenten/AUFTRAG-APPLE-STIL.md`. Vorbild ist das Glasfenster der Achterbahn auf der Startseite: ruhig, hochwertig, viel Luft, feine Glas- und Lichteffekte, nicht bunt.

**Stand: Entwurf zur Abnahme.** Eingebaut sind die Vorschläge 1–5. Alles steht in einer eigenen Datei, `src/styles/apple-stil.css`. Sie wird nach `global.css` geladen (`BaseLayout.astro`, `404.astro`). Ohne diese Datei sieht die Seite aus wie vorher. Nach der Zustimmung kann sie in `global.css` aufgehen.

## Vorschläge

Aufwand: S = unter 1 Stunde, M = halber Tag, L = mehr.

| Nr. | Vorschlag | Eingebaut? | Aufwand |
| --- | --- | --- | --- |
| 1 | Kopfzeile aus mattem Glas, Sprachumschalter als Segmented Control | **ja** | S |
| 2 | Simulationsfenster mit weichem Fensterschatten und getönter Seitenleiste | **ja** | S |
| 3 | Reiter „Einstellungen · Beispiele · Ergebnisse“ als Segmented Control | **ja** | S |
| 4 | Karten mit Haarlinie, größerer Rundung und sanftem Anheben | **ja** | S |
| 5 | Knöpfe als Kapseln mit sanften Übergängen | **ja** | S |
| 6 | Große Titel im Apple-Stil (Typografie und Abstände) | nein | S |
| 7 | Tieferer Dunkelmodus (fast Schwarz, hellere Flächen darüber) | nein | M |
| 8 | Ruhigere Fußzeile | nein | S |
| 9 | Lernmaterial und Infoseiten lesefreundlicher | nein | M |
| 10 | Fensterleiste mit Ampelpunkten auch auf der Simulationsseite | nein (abgeraten) | M |
| 11 | Fachseiten-Kopf mit weichem Lichtschein | nein | S |
| 12 | Katalogfilter als schwebende Glasleiste | nein | M |

### 1. Kopfzeile aus Glas (eingebaut)

- **Was:** Die Kopfzeile war schon leicht durchscheinend. Jetzt ist sie mattes Glas mit stärkerer Unschärfe (`blur(20px) saturate(180%)`) und einer feinen Haarlinie unten. Navigationspunkte haben Kapselform. Der Sprachumschalter ist ein Segmented Control: Das gewählte Segment ist hell und leicht angehoben statt blau gefüllt. Die Einstellungstafel (Zahnrad) bekommt größere Rundung und einen weicheren Schatten. Knöpfe ohne Rahmen (`btn--ghost`, z. B. Zahnrad und Farbschema) bleiben ohne Rahmen.
- **Wo:** `src/styles/apple-stil.css`, Abschnitt 1.
- **Risiken:**
  - Lesbarkeit: Der Glasgrund ist zu 72 % deckend, Schrift bleibt lesbar.
  - Leistung: Ein `backdrop-filter` auf einer kleinen Fläche ist auch auf schwachen Rechnern unkritisch.
  - Ohne `backdrop-filter` und bei `prefers-reduced-transparency` ist die Kopfzeile deckend.
  - Kontrast: nicht gewählte Sprache auf der Spur 5,4 : 1 (hell) und 6,5 : 1 (dunkel).

### 2. Simulationsfenster (eingebaut)

- **Was:** Die Simulation wirkt wie ein macOS-Fenster: mehrstufiger, weicher Schatten nach unten und ein feiner Rand. Das Bedienfeld ist wie eine Seitenleiste leicht getönt. Die einklappbaren Gruppen liegen darauf als helle Inseln wie in den iOS-Einstellungen.
- **Wo:** `apple-stil.css`, Abschnitt 2.
- **Unverändert wegen der Bildtests:** Größe, Rand, Rundung und Hintergrund der Bühne und alles, was auf ihr liegt. Breite des Bedienfelds und Innenabstände bleiben gleich. Die Bühne ist also gleich groß.
- **Risiken:**
  - Kontrast: graue Schrift auf der Seitenleiste 6,0 : 1 (hell) und 7,4 : 1 (dunkel).
  - Die Tönung ist bewusst schwach. Auf schlechten Beamern ist sie kaum sichtbar, das schadet aber nicht.

### 3. Reiter als Segmented Control (eingebaut)

- **Was:** „Einstellungen · Beispiele · Ergebnisse“ stehen auf einer grauen Spur. Der gewählte Reiter ist ein helles, leicht angehobenes Segment, wie in macOS und iOS. Die Auswahlfelder in den Einstellungen (z. B. „Fahrt / Energie-Diagramme“, „Tal / Hügel …“) haben denselben Stil.
- **Wo:** `apple-stil.css`, Abschnitt 3.
- **Was erhalten bleibt:** Das Markup ist unverändert. Tastaturbedienung (Pfeiltasten, Pos1/Ende) und Rollen kommen weiter aus `host.ts`. Geprüft: Mit Pfeil rechts wechselt der Reiter und das passende Feld erscheint.
  - Auf dem Handy haftet die Leiste weiter unter der Kopfzeile (geprüft: 64 px von oben, hell und dunkel).
  - Im Vollbild haftet sie am oberen Rand des Bedienfelds.
- **Risiken:**
  - Kontrast: Fokusrahmen auf der Spur 4,4 : 1, mindestens 3 : 1 sind nötig.
  - Das gewählte Segment ist nicht mehr durch einen blauen Strich markiert, sondern durch Fläche und Schatten. In Hell ist der Unterschied deutlich, in Dunkel etwas schwächer (siehe offene Fragen).

### 4. Karten (eingebaut)

- **Was:** Simulationskarten und die Kästen auf Fach- und Simulationsseite haben:
  - eine Haarlinie statt des grauen Rahmens
  - 18 px Rundung
  - einen sehr weichen Schatten
- Beim Überfahren hebt sich die Karte sanft an. Der Schatten wird größer, der Rand färbt sich leicht in der Fachfarbe. Bei reduzierter Bewegung hebt sich die Karte nicht, nur der Schatten ändert sich.
- **Wo:** `apple-stil.css`, Abschnitt 4. Die Startseite behält ihre eigene, ruhigere Kartendarstellung aus dem Entwurf v13 (`home.css` wiegt dort schwerer).
- **Risiken:**
  - Kontrast: Die Kartenränder sind schwächer. Die Karte hebt sich vor allem durch die weiße Fläche und den Schatten ab. Inhalt und Link sind über den Titel klar erkennbar.
  - Leistung: Auf der Fachseite liegen viele Karten (auch versteckte für andere Bundesländer). Der Schatten ist statisch, die Animation läuft nur auf der Karte unter der Maus.

### 5. Knöpfe als Kapseln (eingebaut)

- **Was:** Alle Knöpfe (`.btn`) sind kapselförmig, Symbolknöpfe rund.
  - Der Hauptknopf (z. B. „Abspielen“, „Losfahren“) hat oben einen zarten Glanz und einen farbigen weichen Schatten.
  - Beim Drücken gibt der Knopf kurz nach (`scale(0.97)`), nur wenn keine reduzierte Bewegung gewünscht ist.
  - Alle Übergänge nutzen eine gemeinsame, sanfte Kurve.
- **Wo:** `apple-stil.css`, Abschnitt 5.
- **Risiken:**
  - Kontrast: Der Glanz endet auf halber Höhe. Hinter der Schrift liegt das unveränderte Blau, Weiß auf Blau bleibt über 4,5 : 1.
  - „Abspielen läuft“ sieht aus wie bisher: heller Knopf mit blauer Schrift.

### 6. Große Titel (nicht eingebaut)

- **Was:** Seitentitel größer und etwas enger gesetzt (`letter-spacing: −0.025em`), mit mehr Luft über und unter dem Seitenkopf. Untertitel in Grau.
- **Wo:** `global.css` (`h1`, `.page-head`, `.lead`).
- **Aufwand:** S.
- **Risiko:** Auf dem Handy brauchen lange deutsche Wörter (z. B. „Energieerhaltung“) Platz. Eine zu große Schrift führt zu Silbentrennung oder Überlauf. Deshalb erst nach Rückmeldung.

### 7. Tieferer Dunkelmodus (nicht eingebaut)

- **Was:** Seitengrund fast schwarz, Flächen darüber in Stufen heller, wie in macOS.
- **Aufwand:** M.
- **Risiko:**
  - `--surface` und `--border` bestimmen auch Rand und Ecken der Bühne. Eine Änderung macht alle 129 Bildtests im Dunkelmodus rot und braucht ein bewusstes Erneuern.
  - Kontraste müssen neu gemessen werden.

### 8. Ruhigere Fußzeile (nicht eingebaut)

- **Was:** Fußzeile ohne eigene Fläche, nur mit Haarlinie, kleinere graue Schrift, mehr Abstand.
- **Aufwand:** S.
- **Risiko:** gering. Die Startseite hat eine eigene Fußzeilen-Regel und müsste mit angepasst werden.

### 9. Lernmaterial lesefreundlicher (nicht eingebaut)

- **Was:**
  - Lesebreite höchstens etwa 68 Zeichen
  - etwas mehr Zeilenabstand
  - die Seitenkästen „Auf dieser Seite“ und „Lehrplanbezug“ als gruppierte Listen wie in den iOS-Einstellungen
- **Wo:** `.prose`, `.aside-box`.
- **Aufwand:** M.
- **Risiko:** Formeln und Tabellen brauchen Breite. Das muss an vielen Seiten geprüft werden.

### 10. Fensterleiste auf der Simulationsseite (nicht eingebaut, abgeraten)

- **Was:** Fensterleiste mit drei Ampelpunkten über jeder Simulation, wie auf der Startseite.
- **Risiko:**
  - Die Punkte sehen aus wie Knöpfe, tun aber nichts. Schülerinnen und Schüler klicken darauf.
  - Die Leiste kostet Höhe über der Bühne, gerade am Beamer.
  - Auf der Startseite passt sie als Schaufenster, im Arbeitswerkzeug eher nicht.

### 11. Fachseiten-Kopf mit Lichtschein (nicht eingebaut)

- **Was:** Hinter Titel und Untertitel der Fachseiten liegt ein sehr weicher, statischer Lichtschein in der Fachfarbe (CSS-Verlauf, keine Animation).
- **Aufwand:** S.
- **Risiko:** Er kann schnell bunt wirken. Die Fachfarbe Orange (Physik) ist kräftig. Eher nur in Blau.

### 12. Katalogfilter als schwebende Glasleiste (nicht eingebaut)

- **Was:** Die Leiste mit Suche und Filtern bleibt beim Scrollen im Katalog unter der Kopfzeile stehen, als Glas.
- **Aufwand:** M.
- **Risiko:**
  - Zwei Glasflächen übereinander kosten Höhe auf dem Handy.
  - Das muss mit dem Menü und dem Zahnrad-Panel zusammenspielen.

## Vorher und nachher

Alle Bilder liegen in diesem Ordner. Jeweils links vorher, rechts nachher.

| Seite | 1360 px hell | 1360 px dunkel | 390 px hell | 390 px dunkel |
| --- | --- | --- | --- | --- |
| Startseite `/de/` | `start-1360-hell.jpg` | `start-1360-dunkel.jpg` | `start-390-hell.jpg` | `start-390-dunkel.jpg` |
| Fachseite `/de/physik/` | `physik-1360-hell.jpg` | `physik-1360-dunkel.jpg` | `physik-390-hell.jpg` | `physik-390-dunkel.jpg` |
| Simulation `/de/physik/mechanik/energieerhaltung-achterbahn/` | `sim-1360-hell.jpg` | `sim-1360-dunkel.jpg` | `sim-390-hell.jpg` | `sim-390-dunkel.jpg` |

Dazu `detail-bedienfeld.jpg`: das Bedienfeld der Simulation in Originalgröße, hell und dunkel.

Die Bilder sind im Browser mit „reduzierter Bewegung“ entstanden: Die Skulptur steht still, und ein Karten-Hover ist nicht zu sehen.

## Prüfung

- `npm run verify`: 0 Fehler, 0 Warnungen, 0 Hinweise, alle Tests grün, Build fertig.
- **Bildtests lokal:** Alter und neuer Build wurden gegeneinander fotografiert (gleiches Werkzeug, gleiche Toleranz).
  - 256 von 258 Bühnenbildern sind gleich.
  - `fourier-reihen` (hell und dunkel) weicht auch zwischen zwei Läufen des alten Builds ab, liegt also nicht an diesem Entwurf.
  - Die Zoom-Knöpfe auf der Bühne hatte der Entwurf zuerst mit verändert; das ist zurückgenommen.
- **Browser (Chromium), hell und dunkel:**
  - Startseite mit Münzbahn und Achterbahn-Fenster
  - Katalogsuche („Pendel“ → 4 Treffer)
  - Reiter per Tastatur, ⓘ-Hinweis, einklappbare Gruppe
  - Vollbild, `?_lock=1`, `?_hide=1`
  - Handy 390 px mit haftender Reiterleiste
  - keine Fehler auf der Seite, kein waagerechtes Scrollen
- **Nicht geprüft:** Safari und Firefox, echte Mobilgeräte, echte Schulrechner.
