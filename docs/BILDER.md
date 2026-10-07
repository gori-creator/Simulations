# Bilder für die Simulationen

Einige Simulationen können Fotos bzw. gerenderte Bilder verwenden, damit sie hochwertiger aussehen. **Alle Bilder sind optional:** Fehlt eine Datei, zeichnet die Simulation eine eigene Ersatzgrafik. Man kann die Bilder also nach und nach ergänzen.

## So werden Bilder eingebunden

1. Bild mit dem Prompt unten erzeugen (die Prompts sind auf Englisch, weil die meisten Bildgeneratoren damit am besten arbeiten).
2. Auf die angegebene Größe zuschneiden und als **WebP** speichern (Qualität ca. 85). Bei „transparent“ muss der Hintergrund wirklich transparent sein (Alpha-Kanal) – ggf. mit einem Freistellungswerkzeug nachbearbeiten.
3. Datei unter dem angegebenen Pfad ablegen, z. B. `src/assets/sims/ziegenproblem/ziege.webp`.
4. `npm run verify` – fertig. Der Build findet die Datei automatisch.

**Allgemeine Regeln**

- Keine Schrift, keine Logos, keine Wasserzeichen, keine echten Marken (Autohersteller, Münzen echter Währungen).
- Keine Personen.
- Einheitlicher Stil: fotorealistisch, weiches Studiolicht, freundlich, nicht kitschig.
- Dateigröße möglichst unter 300 KB (Schulnetze!).
- Bitte nur Bilder verwenden, die frei genutzt werden dürfen (selbst erzeugt oder mit passender Lizenz).

## Übersicht

| Simulation | Schlüssel | Datei | Größe | Hintergrund |
| --- | --- | --- | --- | --- |
| Ziegenproblem | `stage` | `src/assets/sims/ziegenproblem/buehne.webp` | 1920 × 1080 | deckend |
| Ziegenproblem | `door` | `src/assets/sims/ziegenproblem/tuer.webp` | 600 × 1050 | deckend |
| Ziegenproblem | `goat` | `src/assets/sims/ziegenproblem/ziege.webp` | 1000 × 1000 | transparent |
| Ziegenproblem | `car` | `src/assets/sims/ziegenproblem/auto.webp` | 1000 × 1000 | transparent |
| Gesetz der großen Zahlen | `table` | `src/assets/sims/gesetz-grosse-zahlen/tischplatte.webp` | 1024 × 1024 | deckend |
| Gesetz der großen Zahlen | `coinHead` | `src/assets/sims/gesetz-grosse-zahlen/muenze-kopf.webp` | 800 × 800 | transparent |
| Gesetz der großen Zahlen | `coinTail` | `src/assets/sims/gesetz-grosse-zahlen/muenze-zahl.webp` | 800 × 800 | transparent |
| Gesetz der großen Zahlen | `tackUp` | `src/assets/sims/gesetz-grosse-zahlen/reissnagel-spitze-oben.webp` | 1024 × 1024 | transparent |
| Gesetz der großen Zahlen | `tackSide` | `src/assets/sims/gesetz-grosse-zahlen/reissnagel-seitenlage.webp` | 1024 × 1024 | transparent |
| Monte-Carlo-Methode | `paper` | `src/assets/sims/monte-carlo-pi/papier.webp` | 1024 × 1024 | deckend |
| Galtonbrett | `board` | `src/assets/sims/galtonbrett/holzbrett.webp` | 1600 × 1600 | deckend |
| Galtonbrett | `ball` | `src/assets/sims/galtonbrett/stahlkugel.webp` | 256 × 256 | transparent |

## Ziegenproblem

### `buehne.webp` – Bühne (Hintergrund)

Wird bildfüllend hinter die Türen gelegt und leicht abgedunkelt. Die Türen zeichnet die Simulation selbst darüber – die Bühne muss also in der unteren Bildhälfte **leer** sein.

> Wide empty game show stage, front view, warm purple and magenta stage lighting, three soft spotlight cones from above, glossy dark stage floor in the lower quarter, softly blurred background with subtle bokeh lights, no doors, no people, no text, no logos, cinematic, photorealistic, 16:9

### `tuer.webp` – Tür

Wird auf die Größe einer Tür gestreckt (Seitenverhältnis 4 : 7) und beim Öffnen perspektivisch verkürzt. Das Bild soll **nur das Türblatt** zeigen, randlos von Kante zu Kante, ohne Rahmen und ohne Wand.

> Front view of a single closed wooden game show door panel, painted glossy deep red with two recessed rectangular panels, small round brass knob on the right side, even soft lighting, the door fills the entire image edge to edge, no frame, no wall, no number, no text, photorealistic, portrait 4:7

### `ziege.webp` – Ziege

Erscheint hinter einer geöffneten Tür, freigestellt und eingepasst.

> A friendly white goat standing, full body, three-quarter side view facing right, slightly smiling expression, soft studio lighting, isolated on a transparent background, no ground shadow, photorealistic, centered with some margin

### `auto.webp` – Auto (Hauptgewinn)

Erscheint hinter der Gewinnertür, freigestellt und eingepasst.

> A shiny modern compact car in bright red, three-quarter front view, generic design without any brand logo or badge, no license plate text, soft studio lighting, isolated on a transparent background, no ground shadow, photorealistic, centered with some margin

## Gesetz der großen Zahlen

### `tischplatte.webp` – Unterlage

Hintergrund der Wurffläche, bildfüllend (wird beschnitten).

> Top-down view of a dark green felt dice tray surface, fine fabric texture, soft vignette at the edges, evenly lit, seamless, no objects, no text, photorealistic, square

### `muenze-kopf.webp` – Münze, Seite „Kopf“

Wird kreisförmig zugeschnitten – die Münze muss das Bild **randlos ausfüllen** (Draufsicht, Kreis berührt alle vier Bildkanten).

> Top-down view of a fantasy gold coin, the coin fills the entire square image edge to edge, embossed profile of a stylised laurel-crowned head in the centre, decorative raised rim, no real currency, no text, no numbers, soft studio lighting, photorealistic

### `muenze-zahl.webp` – Münze, Seite „Zahl“

Gleiche Münze, Rückseite; ebenfalls randlos.

> Top-down view of the back side of the same fantasy gold coin, the coin fills the entire square image edge to edge, a large embossed numeral 1 in the centre surrounded by an oak leaf wreath, decorative raised rim, no real currency, no other text, soft studio lighting, photorealistic

### `reissnagel-spitze-oben.webp` – Reißnagel liegt auf dem Kopf

Der Reißnagel liegt auf seinem runden Kopf, die Spitze zeigt **senkrecht nach oben**. Freigestellt, mittig.

> A single metal drawing pin (thumbtack) with a round silver head lying flat on its head, the sharp point pointing straight up, side view slightly from above, isolated on a transparent background, soft studio lighting, photorealistic, centered, object fills about 70 percent of the image

### `reissnagel-seitenlage.webp` – Reißnagel in Seitenlage

Der Reißnagel liegt schräg auf der Seite – Rand des Kopfes und Spitze berühren den Boden.

> The same metal drawing pin (thumbtack) lying tilted on its side, the rim of the round head and the tip of the point both touching the ground, side view slightly from above, isolated on a transparent background, soft studio lighting, photorealistic, centered, object fills about 70 percent of the image

## Monte-Carlo-Methode

### `papier.webp` – Papier

Liegt sehr dezent unter dem Quadrat, in das die Punkte fallen (im dunklen Modus fast unsichtbar). Muss **sehr hell und ruhig** sein, damit die farbigen Punkte gut sichtbar bleiben.

> Very light off-white paper texture, subtle fibres, evenly lit, flat top-down view, seamless, no lines, no grid, no stains, no text, square

## Galtonbrett

### `holzbrett.webp` – Rückwand des Galtonbretts

Hintergrund des Bretts, bildfüllend (wird beschnitten). Nägel, Fächer und Kugeln zeichnet die Simulation selbst darüber – das Holz muss also **leer** und eher hell sein.

> Flat front view of a light maple wood board, fine vertical grain, smooth satin finish, even soft lighting, no nails, no holes, no objects, no text, seamless, photorealistic, square

### `stahlkugel.webp` – Kugel

Wird für jede Kugel in einem kleinen Quadrat gezeichnet (Durchmesser ca. 5 bis 15 Pixel auf dem Bildschirm). Die Kugel muss das Bild **randlos ausfüllen**, mit transparentem Hintergrund und klarem Glanzlicht oben links.

> A single polished steel ball bearing, perfectly round, the sphere fills the entire square image edge to edge, bright specular highlight at the upper left, subtle reflections, isolated on a transparent background, no shadow, photorealistic
