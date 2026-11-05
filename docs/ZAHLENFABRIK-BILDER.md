# Zahlenfabrik: Bilder (Prompts)

Stand 04.11.2026 (Runde 2 ergänzt). Bilder für das Spiel Zahlenfabrik (`/de/zahlenfabrik/`). Sie ersetzen die gezeichneten Grafiken. **Alle Bilder sind optional:** Fehlt eine Datei, zeichnet das Spiel weiter seine eigene Grafik (`src/spiele/zahlenfabrik/art.ts`).

## So geht’s

1. Jedes Bild mit **Stil-Block + Motiv-Prompt** erzeugen. Beide Teile gehören zusammen in einen Prompt.
2. **Alle Bilder im selben Verlauf** erzeugen und das erste gelungene Bild als Vorlage mitgeben („same style as the reference image“), damit Linien, Farben und Licht gleich bleiben.
3. Quadratisch, mindestens **1024 × 1024 px**, **transparenter Hintergrund** (PNG). Ausnahme: der Boden (deckend, nahtlos kachelbar).
4. Hochladen nach **`incoming/zahlenfabrik/<dateiname>.png`**, die Dateinamen stehen unten. Den Rest macht Claude: zuschneiden, als WebP speichern, einbauen.

**Prüfen vor dem Hochladen**

- keine Schrift, keine Zahlen, keine Symbole und kein Pseudo-Text auf den Teilen (die Zahlen setzt das Spiel selbst darüber)
- genau **von oben** gesehen (Draufsicht), nicht schräg
- **kein Schlagschatten** zu einer Seite, weil das Spiel die Teile dreht und der Schatten dann falsch läge (weicher Schatten direkt unter dem Teil ist ok)
- der **Ausgang** (Rutsche/Öffnung) zeigt bei allen Teilen nach **rechts**
- die **Mitte bleibt frei bzw. ruhig** (dort steht später die Zahl)
- das Motiv füllt etwa 85 % der Fläche und ist nicht abgeschnitten

## Stil-Block (bei jedem Bild voranstellen)

```text
Top-down orthographic view, 2D game sprite for a friendly educational factory puzzle game for 10–14 year olds. Clean, high-quality stylized 3D look like painted soft plastic toys, smooth rounded shapes, subtle bevels, soft even studio lighting from directly above, gentle ambient occlusion, only a very soft contact shadow directly underneath, no directional cast shadow. Bright, friendly but not childish colors, crisp silhouette that reads well when small (64 px). Centered, fills about 85% of the square frame. Transparent background. No text, no letters, no numbers, no symbols, no logos, no watermark.
```

## Motive

| Nr. | Datei | Motiv | Farbe |
| --- | --- | --- | --- |
| 1 | `quelle.png` | Zahlenquelle (spuckt Zahlen aus) | grün |
| 2 | `maschine.png` | Rechenmaschine (+, −, ×, ÷, x²) | gelb/orange |
| 3 | `weiche.png` | Weiche (sortiert) | violett |
| 4 | `zusammenfuehren.png` | Zusammenführer (2 → 1) | türkis |
| 5 | `lager.png` | Lager (Level-Ziel) | blau |
| 6 | `basis.png` | Basis (offene Welt, 3 × 3 Felder) | blau |
| 7 | `fels-1.png` | Fels, Variante 1 | grau |
| 8 | `fels-2.png` | Fels, Variante 2 | grau |
| 9 | `fels-3.png` | Fels, Variante 3 (mit etwas Moos) | grau/grün |
| 10 | `bruecke.png` | Brücke (Kreuzung zweier Bänder) | holz/orange |
| 11 | `boden.png` | Bodenkachel (nahtlos) | hell |
| 12 | `boden-dunkel.png` | Bodenkachel für den Dunkelmodus (nahtlos) | dunkel |
| 13 | `muenze.png` | Münze (für die offene Welt) | gold |
| 14 | `kiste-voll.png` | Lager voll (Auftrag erfüllt) | blau/gold |

### 1 · `quelle.png` – Zahlenquelle

```text
A compact square machine block that produces numbers: a rounded green body with a wide funnel-shaped hopper opening on top (seen from above as a dark round opening with a rim), a small chimney stub in one corner, and a short metal chute sticking out on the RIGHT edge where items leave. Leave a calm flat round panel in the center of the top surface (empty, no markings). Colors: fresh green body (#3DAA6A family), light grey metal details.
```

### 2 · `maschine.png` – Rechenmaschine

```text
A square calculating machine block: sturdy yellow-orange housing (#F2B33D family) with four round bolts in the corners, a few visible interlocking gears around the edge, an input slot on the LEFT edge and an output chute on the RIGHT edge. In the center a large empty, flat, slightly recessed display panel in light cream color (completely blank, no markings), big enough for a short label.
```

### 3 · `weiche.png` – Weiche

```text
A square sorting switch block: violet housing (#8A5CD6 family) with a Y-shaped channel on top – one channel enters from the LEFT, splits in the middle into two channels, one leaving to the RIGHT and one leaving DOWNWARD (bottom edge). Small metal flap at the split point. Center area calm and slightly flat (empty, no markings).
```

### 4 · `zusammenfuehren.png` – Zusammenführer

```text
A square merging machine block: teal housing (#1FA79A family) with two input channels, one from the LEFT edge and one from the BOTTOM edge, meeting in a round mixing chamber in the center, and one output chute on the RIGHT edge. The mixing chamber lid is flat and empty (no markings).
```

### 5 · `lager.png` – Lager

```text
A square storage crate / container for a factory: sturdy blue painted wooden or plastic crate (#3B6FD9 family) seen from above with an open top, reinforced corners, a small intake ramp on the LEFT edge. Inside the crate the floor is plain and calm (empty, no markings), a blank light label plate on the rim.
```

### 6 · `basis.png` – Basis

```text
The player's home base building in a factory world, square footprint seen exactly from above: a friendly small warehouse/headquarters with a blue roof (#3B6FD9 family) split into panels, a skylight, small solar panels, and four short intake conveyor openings, one in the middle of each side. A calm flat blank area in the center of the roof (empty, no markings). Large, detailed but clean.
```

### 7–9 · Felsen

```text
fels-1.png: A single chunky boulder, rounded grey stone with a few facets and subtle cracks, natural but stylized.
fels-2.png: A cluster of two or three smaller rounded grey stones touching each other.
fels-3.png: A flat wide grey rock with a little bit of green moss on top and one small tuft of grass at its base.
```

### 10 · `bruecke.png` – Brücke

```text
A small square bridge deck for crossing conveyor belts: a short wooden plank bridge with orange painted rails on its top and bottom sides, the planks running from LEFT to RIGHT, open underneath so that a belt can pass below from top to bottom. Light, readable, centered.
```

### 11 · `boden.png` – Bodenkachel hell

```text
Seamless tileable ground texture for a factory game floor seen from above: very light warm grey concrete floor with extremely subtle speckles and faint panel seams, low contrast, calm so that game pieces on top stay readable. Square, edges must tile seamlessly in all directions. Opaque, no transparency, no objects.
```

### 12 · `boden-dunkel.png` – Bodenkachel dunkel

```text
Seamless tileable ground texture for the dark mode of a factory game floor seen from above: very dark blue-grey concrete (#151B26 family) with extremely subtle speckles and faint panel seams, low contrast, calm. Square, edges must tile seamlessly in all directions. Opaque, no transparency, no objects.
```

### 13 · `muenze.png` – Münze

```text
A single shiny gold game coin seen from the front, thick rim, a simple embossed gear shape in the middle (no numbers, no letters, no real currency design), soft highlight.
```

### 14 · `kiste-voll.png` – volles Lager

```text
The same blue storage crate as before, now full: neatly stacked glowing round tokens inside (no numbers or symbols on them), small golden sparkle on one corner to show success.
```

## Runde 2: weitere Bilder (Stand 04.11.2026)

Für die Kapitel mit wachsendem Werkzeugkasten: jede Maschine und jede Weiche bekommt ein eigenes Aussehen, dazu Hindernisse, Belohnungen, ein Bild je Kapitel und ein Titelbild. Wieder gilt: **alles optional**, fehlt ein Bild, nimmt das Spiel das bisherige. Hochladen wie gehabt nach `incoming/zahlenfabrik/<dateiname>.png`.

Für die Teile A–D den **Stil-Block von oben** voranstellen (quadratisch, transparent, von oben, Ausgang rechts, Mitte frei). Für E und F gibt es einen eigenen Stil-Block (breites Bild).

### A · Maschinen je Rechenart (5)

Alle mit Eingang **links**, Ausgang **rechts**, in der Mitte ein **leeres, helles Feld** (dort steht später z. B. „+3“). Gleiche Grundform wie `maschine.png`, aber jede mit eigener Farbe und eigenem Innenleben, damit man sie auf einen Blick unterscheidet.

| Nr. | Datei | Motiv | Farbe |
| --- | --- | --- | --- |
| 15 | `maschine-plus.png` | Plus-Maschine | sonnengelb |
| 16 | `maschine-minus.png` | Minus-Maschine | korallrot |
| 17 | `maschine-mal.png` | Mal-Maschine | orange |
| 18 | `maschine-geteilt.png` | Geteilt-Maschine | pink/magenta |
| 19 | `maschine-quadrat.png` | Quadrat-Maschine | hellgrün |

```text
maschine-plus.png: A square adding machine block with a sunny yellow housing (#F2C230 family): two small feeder rollers near the LEFT input that push pieces together, rounded bolts in the corners, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-minus.png: A square subtracting machine block with a coral red housing (#E5604D family): a small rotating cutter wheel near the LEFT input and a tiny scrap tray at the bottom edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-mal.png: A square multiplying machine block with an orange housing (#F28C28 family): stacked copy rollers that look like a little printing press, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-geteilt.png: A square dividing machine block with a magenta-pink housing (#D9559B family): a small splitting blade and several narrow parallel slots near the RIGHT output, input slot on the LEFT edge, a large blank light cream panel in the center (completely empty).
maschine-quadrat.png: A square squaring machine block with a fresh lime green housing (#8CC63F family): two mirror panels at right angles in two corners, a small glowing lens, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
```

### B · Weichen je Prüfung (4)

Alle violett wie `weiche.png`, mit Y-Kanal: hinein von **links**, „ja“ nach **rechts**, „nein“ nach **unten**. Unterschiedliches Innenleben in der Gabelung:

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 20 | `weiche-gerade.png` | Weiche „gerade?“ |
| 21 | `weiche-teilbar.png` | Weiche „teilbar durch …?“ |
| 22 | `weiche-groesser.png` | Weiche „größer als …?“ |
| 23 | `weiche-prim.png` | Weiche „Primzahl?“ |

```text
weiche-gerade.png: A square violet sorting switch block (#8A5CD6 family) with a Y-shaped channel (in from LEFT, out to RIGHT and out to BOTTOM); at the split point a small flap and two neat pairs of round pegs standing side by side. Calm flat center area, no markings.
weiche-teilbar.png: A square violet sorting switch block (#8A5CD6 family) with a Y-shaped channel (in from LEFT, out to RIGHT and out to BOTTOM); at the split point a small round sieve plate with a regular grid of holes. Calm flat center area, no markings.
weiche-groesser.png: A square violet sorting switch block (#8A5CD6 family) with a Y-shaped channel (in from LEFT, out to RIGHT and out to BOTTOM); at the split point a tiny balance scale with two small pans. Calm flat center area, no markings.
weiche-prim.png: A square violet sorting switch block (#8A5CD6 family) with a Y-shaped channel (in from LEFT, out to RIGHT and out to BOTTOM); at the split point a small faceted gem crystal in a metal holder that glows softly. Calm flat center area, no markings.
```

### C · Hindernisse und Gelände (6)

Abwechslung neben den Felsen (im Spiel bunt gemischt, nur Schmuck).

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 24 | `baum-1.png` | runder Laubbaum von oben |
| 25 | `baum-2.png` | Nadelbaum von oben |
| 26 | `busch.png` | kleiner Busch mit Blüten |
| 27 | `fels-4.png` | großer, flacher Felsblock |
| 28 | `kisten.png` | Stapel alter Holzkisten |
| 29 | `nebel.png` | Nebel über gesperrtem Land (nahtlos, halbtransparent) |

```text
baum-1.png: A single round leafy tree seen exactly from above: a fluffy round crown in fresh greens with soft highlights, a hint of trunk shadow directly underneath, no cast shadow to the side.
baum-2.png: A single conifer tree seen exactly from above: a star-shaped crown of layered dark green needles with lighter tips, centered.
busch.png: A small rounded bush seen from above with a few tiny white and yellow flowers, low and soft.
fels-4.png: One big flat grey rock slab with a few cracks and a small puddle in a hollow, seen from above.
kisten.png: A small stack of three old wooden crates seen from above, slightly rotated against each other, no labels or markings on them.
nebel.png: Seamless tileable soft white-grey fog texture seen from above, gentle swirls, partly transparent (about 60 % opacity), edges must tile seamlessly. No objects.
```

### D · Belohnungen und Effekte (7)

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 30 | `stern-voll.png` | goldener Stern (Bewertung) |
| 31 | `stern-leer.png` | leerer Stern (noch nicht geschafft) |
| 32 | `pokal.png` | Pokal (Kapitel geschafft) |
| 33 | `konfetti.png` | Konfetti-Explosion (Level geschafft) |
| 34 | `puff.png` | kleine Staubwolke (Zahl fällt vom Band) |
| 35 | `funke.png` | heller Funke (zwei Zahlen werden zusammengeführt) |
| 36 | `zahnrad.png` | einzelnes Zahnrad (Ladebild, Schmuck) |

Hier gilt **nicht** „von oben“: diese Motive frontal, flach und mittig.

```text
stern-voll.png: A single plump five-pointed star seen from the front, shiny warm gold with a soft highlight and a subtle bevel, friendly rounded tips.
stern-leer.png: The same five-pointed star shape as an empty slot: light grey translucent glass-like star with a thin darker rim, no glow.
pokal.png: A small shiny golden trophy cup with two handles on a short dark blue base, seen from the front, a little sparkle on the rim. No text or engraving.
konfetti.png: A cheerful burst of confetti pieces and small streamers flying outward from the center in bright game colors (yellow, coral, blue, green, violet), transparent background, center mostly empty.
puff.png: A small soft cartoon dust cloud puff, light grey with a few tiny specks, round and fluffy.
funke.png: A small bright star-shaped spark with a warm yellow-white glow and four short rays.
zahnrad.png: A single chunky gear wheel with eight rounded teeth in soft blue-grey metal, seen from the front, centered.
```

### E · Ein Bild je Kapitel (13)

Breite Bilder für die Erklärkarten und die Level-Auswahl. **Format 16 : 9, mindestens 1536 × 864 px, deckend (nicht transparent).** Stil-Block für E und F:

```text
Wide 16:9 illustration for a chapter card in a friendly educational factory puzzle game for 10–14 year olds. Same look as the game pieces: clean stylized 3D like painted soft plastic toys, smooth rounded shapes, soft even light, bright friendly but not childish colors. A small tidy factory scene on a light floor grid, slightly from above (three-quarter top view), lots of calm empty space on the left third for a title. No people, no characters, no text, no letters, no numbers, no symbols, no logos, no watermark.
```

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 37 | `kapitel-01.png` | Bänder |
| 38 | `kapitel-02.png` | Plus-Maschine |
| 39 | `kapitel-03.png` | Minus-Maschine |
| 40 | `kapitel-04.png` | Mal-Maschine |
| 41 | `kapitel-05.png` | Geteilt-Maschine |
| 42 | `kapitel-06.png` | Rückwärts rechnen |
| 43 | `kapitel-07.png` | Weiche „gerade?“ |
| 44 | `kapitel-08.png` | Weiche „teilbar?“ |
| 45 | `kapitel-09.png` | Weiche „größer als?“ |
| 46 | `kapitel-10.png` | Weiche „Primzahl?“ |
| 47 | `kapitel-11.png` | Wertetabellen |
| 48 | `kapitel-12.png` | Quadrat-Maschine |
| 49 | `kapitel-13.png` | Meisterprüfung |

```text
kapitel-01.png: A green source block on the right, a long grey conveyor belt curving around two round boulders to a blue storage crate; small round blank tokens travelling on the belt.
kapitel-02.png: The same conveyor line, in its middle a sunny yellow adding machine glowing softly as tokens pass through; tokens before it are small, tokens after it a little bigger.
kapitel-03.png: A conveyor line through a coral red subtracting machine with a tiny cutter wheel; small shavings fall into a tray; tokens get a little smaller after it.
kapitel-04.png: A conveyor line through an orange multiplying machine that looks like a small printing press; after it the tokens are noticeably larger and stacked in a neat pile at the crate.
kapitel-05.png: A conveyor line through a magenta dividing machine; one big token enters and several small equal tokens leave on parallel lanes.
kapitel-06.png: A short conveyor line with three locked machines (small padlocks on them), seen from the storage side looking back towards the source, with a gentle reversed arrow made of floor tiles (no text).
kapitel-07.png: A violet sorting switch splitting one belt into two, tokens alternating to the two blue crates; small pairs of pegs decorating the switch.
kapitel-08.png: A violet sorting switch with a sieve plate, tokens dropping through holes into one lane while others roll on to a second crate.
kapitel-09.png: A violet sorting switch with a tiny balance scale; big tokens go one way, small tokens the other way, two crates.
kapitel-10.png: A violet sorting switch with a glowing gem crystal; a few special shiny tokens are sent to a crate decorated with a small gem.
kapitel-11.png: A neat row of five blue crates side by side, a belt feeding them in order, tokens growing in size step by step from left to right like a staircase.
kapitel-12.png: A lime green squaring machine with two mirror panels; a token enters and a much bigger square-shaped block leaves.
kapitel-13.png: A large busy but tidy factory with all machine colors (yellow, coral, orange, magenta, lime, violet switches), several crates, and a golden trophy on a small podium in the corner.
```

### F · Titelbild (1)

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 50 | `titelbild.png` | Titelbild für die Spielseite und Vorschau beim Teilen |

```text
titelbild.png: A wide panoramic view of a cheerful number factory from slightly above: winding conveyor belts, colorful machines (sunny yellow, coral, orange, magenta, lime), violet switches, a green source block and blue storage crates, small blank round tokens on the belts, warm soft light. Calm empty space in the upper left for a title.
```

**Einbau Runde 2 (für Claude):** Maschinen nach Rechenzeichen (`maschine-plus` … `maschine-quadrat`, sonst `maschine`), Weichen nach Prüfung (`weiche-gerade` …, sonst `weiche`), Hindernisse gemischt mit den Felsen (gleiches Muster je Feld), Sterne/Pokal in Auswahl und Siegmeldung, Effekte statt der gezeichneten Wölkchen, Kapitelbilder oben in den Erklärkarten und auf den Kapitel-Karten (WebP, 960 × 540, Qualität ca. 80), Titelbild als Vorschaubild der Spielseite. Alles mit Ersatz, wenn eine Datei fehlt.

## Einbau (für Claude)

- Ziel: `src/assets/zahlenfabrik/<name>.webp`, Größe 256 × 256 (Basis 512 × 512, Boden 512 × 512), Qualität ca. 85, transparent (außer Boden).
- `art.ts` nimmt das Bild, wenn es die Datei gibt, sonst die gezeichnete Grafik. Teile mit Richtung werden gedreht (Ausgang rechts = Richtung 0).
- Jede Datei mit Prompt in `docs/BILDER.md` eintragen (Abschnitt „Zahlenfabrik“).
