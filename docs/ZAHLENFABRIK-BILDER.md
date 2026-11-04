# Zahlenfabrik: Bilder (Prompts)

Stand 04.11.2026. Bilder für das Spiel Zahlenfabrik (`/de/zahlenfabrik/`). Sie ersetzen die gezeichneten Grafiken. **Alle Bilder sind optional:** Fehlt eine Datei, zeichnet das Spiel weiter seine eigene Grafik (`src/spiele/zahlenfabrik/art.ts`).

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

## Einbau (für Claude)

- Ziel: `src/assets/zahlenfabrik/<name>.webp`, Größe 256 × 256 (Basis 512 × 512, Boden 512 × 512), Qualität ca. 85, transparent (außer Boden).
- `art.ts` nimmt das Bild, wenn es die Datei gibt, sonst die gezeichnete Grafik. Teile mit Richtung werden gedreht (Ausgang rechts = Richtung 0).
- Jede Datei mit Prompt in `docs/BILDER.md` eintragen (Abschnitt „Zahlenfabrik“).
