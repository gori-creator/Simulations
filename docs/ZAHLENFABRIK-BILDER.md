# Zahlenfabrik: Bilder (Prompts)

Stand 09.11.2026 (Runde 2 und 3 eingebaut, Runde 4 angefordert). Bilder für das Spiel Zahlenfabrik (`/de/zahlenfabrik/`). Sie ersetzen die gezeichneten Grafiken. **Alle Bilder sind optional:** Fehlt eine Datei, zeichnet das Spiel weiter seine eigene Grafik (`src/spiele/zahlenfabrik/art.ts`).

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

## Runde 3: übrige Bausteine, Abnehmer, Kapitel (Stand 05.11.2026)

Für alle Bausteine, die noch kein eigenes Bild haben, die neuen Abnehmer der offenen Welt und die neuen Kapitel. Wieder **alles optional**. Hochladen wie gehabt nach `incoming/zahlenfabrik/<dateiname>.png`.

Für A–C den **Stil-Block von oben** voranstellen (quadratisch, transparent, genau von oben, Ausgang rechts, Mitte frei). Für D den Stil-Block für Kapitelbilder (16 : 9, deckend). Am besten im selben Verlauf wie Runde 2 und mit `maschine-plus.png` als Vorlage („same style as the reference image“).

### A · Maschinen (10)

Gleiche Grundform wie `maschine-plus.png` (Eingang **links**, Ausgang **rechts**, in der Mitte ein **großes leeres helles Feld** ohne Zeichen), jede mit eigener Farbe und eigenem Innenleben.

| Nr. | Datei | Motiv | Farbe |
| --- | --- | --- | --- |
| 51 | `maschine-rest.png` | Rest-Maschine (mod) | türkisblau |
| 52 | `maschine-quersumme.png` | Quersummen-Maschine | himmelblau |
| 53 | `maschine-wurzel.png` | Wurzel-Maschine | dunkelgrün |
| 54 | `maschine-vorzeichen.png` | Vorzeichen-Maschine (±) | rot-blau geteilt |
| 55 | `maschine-betrag.png` | Betrags-Maschine (\|x\|) | grau-silber |
| 56 | `maschine-spiegel.png` | Spiegel-Maschine (Ziffern umdrehen) | lila-pink |
| 57 | `maschine-runden.png` | Runden-Maschine | braun-gold |
| 58 | `maschine-bruch.png` | Bruch-Maschine (teilt in Teile) | hellorange |
| 59 | `maschine-kehrwert.png` | Kehrwert-Maschine (1/x) | mint |
| 60 | `maschine-allgemein.png` | neutrale Maschine (Ersatz für alle anderen) | hellgrau |

```text
maschine-rest.png: A square remainder machine block with a teal-blue housing (#1E9BB0 family): a small round sieve drum near the LEFT input that lets a few small leftover pieces drop into a tiny tray on the bottom edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-quersumme.png: A square digit-sum machine block with a sky-blue housing (#4FA3E8 family): a row of small funnels along the top edge that merge into one channel, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-wurzel.png: A square square-root machine block with a deep green housing (#2E8B57 family): a small stylized root-like branching pipe pattern in the corners, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-vorzeichen.png: A square sign-flip machine block whose housing is split diagonally into warm red (#E5604D family) and cool blue (#3B7DDD family), a small round flip switch in one corner, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-betrag.png: A square absolute-value machine block with a brushed silver-grey housing (#A9B3BF family), two parallel vertical rails left and right of the center panel, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-spiegel.png: A square mirror machine block with a violet-pink housing (#B65BC9 family), a small shiny mirror strip along the top edge and a curved arrow-shaped rail (no arrow symbol, just a curved rail), input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-runden.png: A square rounding machine block with a warm brown-gold housing (#C2913A family), a small set of round smoothing rollers near the input, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-bruch.png: A square fraction machine block with a light orange housing (#F5A65B family), a small cutter that slices a round token into equal wedges near the input, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-kehrwert.png: A square reciprocal machine block with a mint green housing (#5CC9A7 family), a small turntable that flips a token upside down, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-allgemein.png: A square neutral machine block with a light grey housing (#C9CED6 family), simple bolts in the corners, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
```

### B · Weichen und Zusammenführer (6)

Weichen wie `weiche-gerade.png` (violett, Y-Kanal: hinein von **links**, hinaus nach **rechts** und **unten**). Zusammenführer wie `zusammenfuehren.png` (türkis, hinein von **links** und **unten**, hinaus nach **rechts**), mit eigenem Innenleben je Rechenart.

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 61 | `weiche-quadrat.png` | Weiche „Quadratzahl?“ |
| 62 | `wechselweiche.png` | Wechsel-Weiche (abwechselnd) |
| 63 | `zusammen-summe.png` | Zusammenführer „Summe“ |
| 64 | `zusammen-differenz.png` | Zusammenführer „Differenz“ |
| 65 | `zusammen-produkt.png` | Zusammenführer „Produkt“ |
| 66 | `zusammen-quotient.png` | Zusammenführer „Quotient“ |

```text
weiche-quadrat.png: The violet sorting switch block (same as weiche-gerade.png) with a Y-shaped channel; at the split point a small square frame made of four equal tiles. Calm flat center area, no markings.
wechselweiche.png: An orange-amber sorting switch block (#F2A33D family) with the same Y-shaped channel (in from LEFT, out to RIGHT and out to BOTTOM); at the split point a small rocking flap that tilts back and forth, with two tiny lamps. Calm flat center area, no markings.
zusammen-summe.png: A teal merging block (same shape as zusammenfuehren.png, inputs from LEFT and BOTTOM, output on the RIGHT) whose round mixing chamber shows two small tokens joining into one bigger token. No symbols.
zusammen-differenz.png: The same teal merging block, but the mixing chamber shows a big token next to a small token with a small slice being taken away. No symbols.
zusammen-produkt.png: The same teal merging block, but the mixing chamber shows a little stacking press that piles tokens into a tall stack. No symbols.
zusammen-quotient.png: The same teal merging block, but the mixing chamber shows a token being split into several equal smaller tokens. No symbols.
```

### C · Offene Welt: Abnehmer (3)

Abnehmer stehen am Kartenrand und kaufen bestimmte Zahlen (2 × 2 Felder, quadratisch, von oben). Eingang an allen vier Seiten.

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 67 | `abnehmer-1.png` | kleiner Laden mit Markise |
| 68 | `abnehmer-2.png` | Lagerhalle mit Laderampe |
| 69 | `abnehmer-3.png` | Rakete auf Startplatz (kauft große Zahlen) |

```text
abnehmer-1.png: A small cheerful shop building seen exactly from above, square footprint, striped awning in coral and white on one side, a few crates in front, four small intake openings in the middle of each side. A calm flat blank area on the roof (empty, no signs, no letters).
abnehmer-2.png: A medium warehouse seen exactly from above, square footprint, corrugated blue-grey roof with skylights, a loading ramp on one side with a small forklift, four small intake openings in the middle of each side. A calm flat blank area on the roof (empty, no signs).
abnehmer-3.png: A small rocket on a round launch pad seen exactly from above, square footprint, white rocket with red fins in the center, gantry beside it, four small intake openings in the middle of each side of the pad. No letters, no flags.
```

### D · Kapitelbilder für die neuen Kapitel (16)

Wie die Kapitelbilder aus Runde 2 (Stil-Block für Kapitelbilder, 16 : 9, deckend, Platz links für einen Titel).

| Nr. | Datei | Kapitel |
| --- | --- | --- |
| 70 | `kapitel-zusammen.png` | Zusammenführer (zwei Quellen) |
| 71 | `kapitel-rest.png` | Rest-Maschine |
| 72 | `kapitel-quersumme.png` | Quersummen-Maschine |
| 73 | `kapitel-wurzel.png` | Wurzel-Maschine |
| 74 | `kapitel-quadratzahl.png` | Weiche „Quadratzahl?“ |
| 75 | `kapitel-terme.png` | Terme mit zwei Quellen |
| 76 | `kapitel-bruecke.png` | Brücke |
| 77 | `kapitel-raetsel.png` | Rätsel-Werkstatt |
| 78 | `kapitel-detektiv.png` | Funktionen-Detektiv |
| 79 | `kapitel-vorzeichen.png` | Vorzeichen und Betrag |
| 80 | `kapitel-spiegel.png` | Spiegel-Maschine |
| 81 | `kapitel-runden.png` | Runden-Maschine |
| 82 | `kapitel-wechsel.png` | Wechsel-Weiche |
| 83 | `kapitel-grossmeister.png` | Großmeister |
| 84 | `kapitel-brueche.png` | Brüche |
| 85 | `kapitel-gleichungen.png` | Gleichungen |

```text
kapitel-zusammen.png: Two green source blocks on the right, each with its own belt, the two belts meeting in a teal merging machine; one bigger token leaves towards a blue crate.
kapitel-rest.png: A teal-blue remainder machine on a belt; small leftover pieces drop into a tray beside it, the remaining tokens continue to a crate.
kapitel-quersumme.png: A sky-blue digit-sum machine with several small funnels merging into one; many small tokens go in, one token comes out.
kapitel-wurzel.png: A deep green square-root machine; a large square block enters and a small slim token leaves; a little plant grows on the machine roof.
kapitel-quadratzahl.png: A violet switch with a small square frame at its fork; neat square stacks of tokens go one way, loose tokens the other way.
kapitel-terme.png: Two sources, two belts with a yellow and a lime machine, meeting in a teal merger, leading to a row of crates with tokens growing in size.
kapitel-bruecke.png: Two conveyor belts crossing each other with a small wooden bridge with orange rails; tokens travel on both belts.
kapitel-raetsel.png: A tidy workshop table seen from above with several small machines arranged like puzzle pieces and a magnifying glass lying next to them.
kapitel-detektiv.png: A row of five blue crates with tokens of different sizes, a magnifying glass hovering above them, a detective-style desk lamp casting soft light.
kapitel-vorzeichen.png: A red-blue split sign machine on a belt; tokens above the belt are warm red, tokens below are cool blue, like a mirror line.
kapitel-spiegel.png: A violet-pink mirror machine with a shiny mirror strip; tokens enter on one side and appear mirrored on the other.
kapitel-runden.png: A brown-gold rounding machine with smoothing rollers; rough uneven tokens go in, smooth round tokens come out.
kapitel-wechsel.png: An amber alternating switch sending tokens left and right in turn into two crates, one token at a time.
kapitel-grossmeister.png: A grand finished factory at golden hour with every machine color, many crossing belts and bridges, and a big golden trophy on a podium.
kapitel-brueche.png: A light orange fraction machine slicing round tokens into halves, thirds and quarters that travel on to a crate.
kapitel-gleichungen.png: A large balance scale built into the factory; two belts feed tokens into the two pans, which are exactly level.
```

### E · Bauen und Bearbeiten (2)

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 86 | `baukasten.png` | Werkzeugkiste (Level-Baukasten) |
| 87 | `auswahl.png` | Rahmen mit Ecken (Auswählen und Kopieren) |

```text
baukasten.png: An open red toolbox seen from the front, filled with small machine blocks, belts and a few tokens, friendly and tidy. Transparent background.
auswahl.png: A rounded square selection frame made of four thick blue corner brackets with a small hand cursor next to it, seen from the front. Transparent background.
```

## Runde 4: Maschinen mit Gedächtnis, Puffer, Weiche „ganze Zahl?“, Schleife, Erz-Arten (Stand 09.11.2026)

Für die neuen Bauteile aus dem Ausbau vom 09.11.2026 (Zähler, Sammler, Puffer, Weiche „ganze Zahl?“, Verteiler für Schleifen), die neuen Quellen-Arten der offenen Welt und die neuen Kapitel. Wieder **alles optional**: Ohne Datei zeigt das Spiel das allgemeine Maschinenbild (umgefärbt) bzw. die gezeichnete Grafik. Hochladen wie gehabt nach `incoming/zahlenfabrik/<dateiname>.png`.

Für A–C den **Stil-Block von oben** voranstellen (quadratisch, transparent, genau von oben, Ausgang rechts, Mitte frei), am besten mit `maschine-plus.png` als Vorlage („same style as the reference image“). Für D den Stil-Block für Kapitelbilder (16 : 9, deckend, Platz links für einen Titel).

### A · Maschinen mit Gedächtnis (3)

Gleiche Grundform wie `maschine-plus.png` (Eingang **links**, Ausgang **rechts**, in der Mitte ein **großes leeres helles Feld** ohne Zeichen).

| Nr. | Datei | Motiv | Farbe |
| --- | --- | --- | --- |
| 88 | `maschine-zaehler.png` | Zähler-Maschine (gibt 1, 2, 3, … aus) | blaugrün |
| 89 | `maschine-sammel.png` | Sammel-Maschine (Summe aller Zahlen bisher) | violett |
| 90 | `maschine-puffer.png` | Puffer-Maschine (hält eine Zahl fest, gibt die vorige weiter) | sandgelb |

```text
maschine-zaehler.png: A square counter machine block with a blue-green housing (#2A9D8F family): along the top edge a small row of three round click-counter wheels with tiny notches (no digits), a small lever on the left, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-sammel.png: A square collector machine block with a violet housing (#7B5EA7 family): a small open hopper at the back where a neat little heap of tokens is piling up, a tiny scoop arm beside it, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
maschine-puffer.png: A square buffer machine block with a warm sand-yellow housing (#E0B756 family): a single round holding bay on top with a transparent dome, one token resting inside, a small gate on the right that lets the previous token out, input slot on the LEFT edge, output chute on the RIGHT edge, a large blank light cream panel in the center (completely empty).
```

### B · Weiche und Verteiler (2)

Weiche wie `weiche-gerade.png` (violett, Y-Kanal: hinein von **links**, hinaus nach **rechts** und **unten**). Verteiler in der gleichen Form, aber **türkis** (beide Ausgänge bekommen eine Kopie).

| Nr. | Datei | Motiv |
| --- | --- | --- |
| 91 | `weiche-ganz.png` | Weiche „ganze Zahl?“ (ganze Zahlen geradeaus, Brüche zur Seite) |
| 92 | `verteiler.png` | Verteiler (jede Zahl als Kopie in beide Richtungen, für Schleifen) |

```text
weiche-ganz.png: The violet sorting switch block (same as weiche-gerade.png) with a Y-shaped channel; at the split point a small gauge with a whole round token on one side and a token cut into wedges on the other. Calm flat center area, no markings.
verteiler.png: A teal splitter block (#1FA9A0 family) with the same Y-shaped channel (in from LEFT, out to RIGHT and out to BOTTOM); at the split point a small stamping press that duplicates a token, two identical tokens leaving on both exits, two tiny green lamps. Calm flat center area, no markings.
```

### C · Offene Welt: Quellen-Arten und Abnehmer (5)

Neue Zahlenquellen weiter draußen auf der Karte (gleiche Grundform wie `quelle.png`: Trichter oben, Ausgang **rechts**, runde Scheibe in der Mitte frei), je mit eigener Farbe. Dazu zwei neue Abnehmer (2 × 2 Felder, von oben, Eingang an allen vier Seiten).

| Nr. | Datei | Motiv | Farbe |
| --- | --- | --- | --- |
| 93 | `quelle-prim.png` | Primzahl-Quelle (gibt 2, 3, 5, 7, 11, … aus) | dunkelrot |
| 94 | `quelle-quadrat.png` | Quadratzahl-Quelle (1, 4, 9, 16, …) | gold |
| 95 | `quelle-zaehl.png` | Zähl-Quelle (1, 2, 3, 4, …) | blaugrün |
| 96 | `abnehmer-4.png` | Sternwarte (kauft Dreieckszahlen) | nachtblau |
| 97 | `abnehmer-5.png` | Bäckerei (kauft Vielfache von 12, „Dutzend“) | braun-creme |

```text
quelle-prim.png: The green source machine from quelle.png recolored to a deep crimson housing (#B3263B family), with a small crystal-like ore chunk sticking out of the hopper and a tiny lamp, round empty metal disc in the center, output chute on the RIGHT edge.
quelle-quadrat.png: The source machine from quelle.png recolored to a warm gold housing (#D4A017 family), the hopper rim shaped as a neat square frame, round empty metal disc in the center, output chute on the RIGHT edge.
quelle-zaehl.png: The source machine from quelle.png recolored to a blue-green housing (#2A9D8F family), with a small row of three click-counter wheels on the hopper rim (no digits), round empty metal disc in the center, output chute on the RIGHT edge.
abnehmer-4.png: A small observatory seen exactly from above, square footprint, round night-blue dome with a slit and a small telescope tube, four small intake openings in the middle of each side. No letters, no symbols.
abnehmer-5.png: A cozy bakery seen exactly from above, square footprint, brown roof with a cream-colored awning strip, a tray of round buns beside the door, four small intake openings in the middle of each side. No letters, no signs.
```

### D · Kapitelbilder (6)

Wie die Kapitelbilder aus Runde 2 (Stil-Block für Kapitelbilder, 16 : 9, deckend, Platz links für einen Titel).

| Nr. | Datei | Kapitel |
| --- | --- | --- |
| 98 | `kapitel-zaehler.png` | Zähler-Maschine |
| 99 | `kapitel-sammel.png` | Sammel-Maschine |
| 100 | `kapitel-puffer.png` | Puffer-Maschine |
| 101 | `kapitel-ganz.png` | Weiche „ganze Zahl?“ |
| 102 | `kapitel-schleife.png` | Schleife (Rückführung) |
| 103 | `kapitel-endgegner.png` | Endgegner |

```text
kapitel-zaehler.png: A blue-green counter machine on a belt with three click-counter wheels on top; identical tokens go in, tokens of growing size come out in a neat row.
kapitel-sammel.png: A violet collector machine with a growing heap of tokens in its hopper; small tokens go in, bigger and bigger tokens come out towards a blue crate.
kapitel-puffer.png: A sand-yellow buffer machine with a transparent dome holding one token while the belt waits; a second token is just arriving, the first is leaving.
kapitel-ganz.png: A violet switch with a small gauge at its fork; whole round tokens roll straight on, tokens cut into wedges turn aside into a separate crate.
kapitel-schleife.png: A conveyor belt that runs in a closed loop around a teal splitter and a machine, with one branch leaving the loop towards a crate; tokens of growing size circle inside.
kapitel-endgegner.png: A huge dramatic factory hall at dusk with every kind of machine, crossing belts, bridges and a giant glowing boss machine in the middle with warning stripes and a crown-shaped roof.
```

## Einbau (für Claude)

- Ziel: `src/assets/zahlenfabrik/<name>.webp`, Größe 256 × 256 (Basis 512 × 512, Boden 512 × 512), Qualität ca. 85, transparent (außer Boden).
- `art.ts` nimmt das Bild, wenn es die Datei gibt, sonst die gezeichnete Grafik. Teile mit Richtung werden gedreht (Ausgang rechts = Richtung 0).
- Jede Datei mit Prompt in `docs/BILDER.md` eintragen (Abschnitt „Zahlenfabrik“).
