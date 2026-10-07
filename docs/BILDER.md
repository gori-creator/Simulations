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
| Schiefer Wurf | `erde` | `src/assets/sims/schiefer-wurf/hintergrund-erde.webp` | 2400 × 1200 | deckend |
| Schiefer Wurf | `mond` | `src/assets/sims/schiefer-wurf/hintergrund-mond.webp` | 2400 × 1200 | deckend |
| Schiefer Wurf | `mars` | `src/assets/sims/schiefer-wurf/hintergrund-mars.webp` | 2400 × 1200 | deckend |
| Schiefer Wurf | `ball` | `src/assets/sims/schiefer-wurf/ball.webp` | 256 × 256 | transparent |
| Fadenpendel | `bob` | `src/assets/sims/fadenpendel/pendelkugel.webp` | 256 × 256 | transparent |
| Achterbahn | `car` | `src/assets/sims/energieerhaltung/wagen.webp` | 960 × 510 | transparent |
| Achterbahn | `sky` | `src/assets/sims/energieerhaltung/himmel.webp` | 1920 × 1200 | deckend |
| Brechung | `laser` | `src/assets/sims/brechung/laser.webp` | 700 × 200 | transparent |
| Bruchteile | `pizza` | `src/assets/sims/bruchteile/pizza.webp` | 1024 × 1024 | transparent |
| Bruchteile | `cake` | `src/assets/sims/bruchteile/blechkuchen.webp` | 1400 × 1000 | deckend |
| Kreiszahl π | `wheel` | `src/assets/sims/kreiszahl-pi/rad.webp` | 1024 × 1024 | transparent |
| Kreiszahl π | `pizza` | `src/assets/sims/kreiszahl-pi/pizza.webp` | 1024 × 1024 | transparent |
| Exponentielles Wachstum | `pond` | `src/assets/sims/exponentielles-wachstum/teich.webp` | 1024 × 1024 | deckend |
| Exponentielles Wachstum | `lily` | `src/assets/sims/exponentielles-wachstum/seerose.webp` | 256 × 256 | transparent |
| Freier Fall | `feather` | `src/assets/sims/freier-fall/feder.webp` | 1024 × 384 | transparent |

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

## Schiefer Wurf

Die drei Hintergründe füllen den Himmel über dem Boden. Der Boden selbst wird gezeichnet – der **Horizont muss genau am unteren Bildrand liegen**, ohne Vordergrund. Wichtige Bildteile in die Mitte, weil das Bild je nach Bildschirm seitlich oder oben beschnitten wird.

### `hintergrund-erde.webp` – Erde

> Wide panoramic landscape background, bright blue sky with a few soft white clouds, gentle distant green hills and a faint tree line, the horizon line lies exactly at the bottom edge of the image, no foreground ground, no people, no buildings, no text, calm and friendly, photorealistic, 2:1

### `hintergrund-mond.webp` – Mond

> Wide panoramic view from the surface of the Moon, deep black sky with stars, distant grey lunar mountains and crater rims at the horizon, the Earth small in the upper sky, the horizon line lies exactly at the bottom edge of the image, no foreground ground, no astronauts, no spacecraft, no text, photorealistic, 2:1

### `hintergrund-mars.webp` – Mars

> Wide panoramic view on Mars, dusty butterscotch-coloured sky, distant reddish-brown mountains and mesas at the horizon, the horizon line lies exactly at the bottom edge of the image, no foreground ground, no rovers, no people, no text, photorealistic, 2:1

### `ball.webp` – Ball

Wird klein (Durchmesser ca. 18 Pixel) gezeichnet und dreht sich im Flug.

> A classic black and white football (soccer ball), the ball fills the entire square image edge to edge, generic design without logos, soft studio lighting, isolated on a transparent background, no shadow, photorealistic

## Fadenpendel

### `pendelkugel.webp` – Pendelkörper

Der Faden wird bis zur Mitte gezeichnet, die Kugel darüber.

> A polished solid brass sphere as a physics pendulum bob, perfectly round, the sphere fills the entire square image edge to edge, warm golden reflections, bright highlight at the upper left, no hook, isolated on a transparent background, no shadow, photorealistic

## Achterbahn (Energieerhaltung)

### `wagen.webp` – Wagen

Wird entlang der Schiene gedreht. Seitenansicht, Fahrtrichtung nach **rechts**, die Räder liegen genau auf dem **unteren Bildrand** (dort sitzt die Schiene).

> Side view of a single empty modern roller coaster car facing right, bright red with yellow details, empty seats with safety bars, visible wheels at the very bottom edge of the image, no people, no track, no logos, no text, isolated on a transparent background, photorealistic, aspect ratio 1.9:1

### `himmel.webp` – Himmel

Füllt den Hintergrund; unten wird ein Wiesenstreifen darübergezeichnet.

> Bright summer sky with soft cumulus clouds, a faint distant amusement park skyline with a Ferris wheel along the bottom edge, gentle colours, no people, no text, no logos, photorealistic, 16:10

## Brechung

### `laser.webp` – Laser

Seitenansicht, die **Austrittsöffnung zeigt nach rechts** und liegt am rechten Bildrand (dort beginnt der Strahl).

> Side view of a metal laboratory laser module, cylindrical brushed aluminium body with a black end cap on the left and the light aperture on the right edge of the image, small red indicator light, isolated on a transparent background, soft studio lighting, photorealistic, aspect ratio 3.5:1

## Bruchteile

### `pizza.webp` – Pizza

Wird in Stücke geschnitten (Draufsicht). Die Pizza muss das Bild **randlos ausfüllen** (Kreis berührt alle vier Bildkanten), außerhalb transparent. Schnittlinien zeichnet die Simulation.

> Top-down view of a whole round margherita pizza with a few slices of salami and basil leaves, evenly distributed toppings, golden crust, not cut, the pizza fills the entire square image edge to edge, isolated on a transparent background, no plate, no shadow, photorealistic

### `blechkuchen.webp` – Blechkuchen

Draufsicht, randlos, **ohne Blech und ohne Schnittlinien**.

> Top-down view of a rectangular German sheet cake with crumble topping (Streuselkuchen) and a few strawberries, evenly distributed, the cake fills the entire image edge to edge, no baking tray, no cuts, no plate, soft daylight, photorealistic, aspect ratio 1.4:1

## Kreiszahl π

### `rad.webp` – Rad

Dreht sich beim Abrollen. Frontansicht, das Rad füllt das Bild **randlos** aus.

> Front view of a bicycle wheel with black tyre, silver rim and thin spokes, perfectly circular and centred, the tyre touches all four edges of the square image, isolated on a transparent background, no shadow, photorealistic

### `pizza.webp` – Pizza

Wie bei Bruchteile (dasselbe Bild kann verwendet werden): Draufsicht, randlos, transparent.

> Top-down view of a whole round margherita pizza with a few slices of salami and basil leaves, evenly distributed toppings, golden crust, not cut, the pizza fills the entire square image edge to edge, isolated on a transparent background, no plate, no shadow, photorealistic

## Exponentielles Wachstum

### `teich.webp` – Teich

Draufsicht. Die Wasserfläche sollte als **Ellipse in der Mitte** liegen (etwa 85 % der Bildbreite und 75 % der Bildhöhe), drumherum Ufer und Gras. Die Seerosen setzt die Simulation darauf.

> Top-down aerial view of a small oval garden pond, clear dark green-blue water surface in the centre covering about 85 percent of the width and 75 percent of the height, grassy bank with a few stones around it, no water lilies, no plants on the water, no people, soft daylight, photorealistic, square

### `seerose.webp` – Seerosenblatt

Wird klein (ca. 20–30 Pixel) und gedreht gezeichnet.

> Top-down view of a single round green water lily pad with a small notch, a tiny pink water lily flower on it, the pad fills the entire square image, isolated on a transparent background, no water, no shadow, photorealistic

## Freier Fall

### `feder.webp` – Feder

Fällt in der Fallröhre neben der Stahlkugel. Wird klein (etwa 35–40 Pixel lang) und leicht schaukelnd gezeichnet. Die Feder liegt **waagerecht**, der Kiel zeigt nach **links**, die Spitze nach rechts; sie füllt die Bildbreite **randlos** aus und ist senkrecht mittig.

> A single small white bird feather lying horizontally, quill pointing to the left and tip to the right, side view, soft natural barbs with a slight grey tint at the edges, the feather spans the full width of the image edge to edge and is vertically centred, isolated on a transparent background, no shadow, no text, photorealistic, aspect ratio 8:3
