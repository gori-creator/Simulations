# Landschaft für den Kopfbereich der Startseite – Bildaufträge

## Überblick

Hinter der blauen Skulptur im Kopfbereich steht eine Landschaft: ein See, an dessen Ufer Felsnadeln aufragen (Stil wie die Karstfelsen von Guilin, aber ruhig und stilisiert). Sie besteht aus **zwei Ebenen**, die übereinanderliegen und sich beim Scrollen und mit der Maus unterschiedlich schnell bewegen (Tiefenwirkung):

| Ebene | Datei hell | Datei dunkel | Inhalt |
|---|---|---|---|
| 1 – fern | `land-fern-hell.png` | `land-fern-dunkel.png` | hohe Felsnadeln weit hinten, im Dunst |
| 2 – nah | `land-nah-hell.png` | `land-nah-dunkel.png` | niedrige Uferfelsen und Steine davor |

**Insgesamt vier Bilder.** Himmel, See, Spiegelung, Nebel und Lichtpunkte macht die Website selbst. Die Bilder enthalten **nur die Felsen**.

## Vorgaben für alle vier Bilder

1. **Größe:** genau **3840 × 960 Pixel** (Seitenverhältnis 4 : 1), PNG.
2. **Hintergrund:**
   - am besten **transparent** (PNG mit Alphakanal),
   - falls der Generator das nicht kann: **einfarbig reines Grün `#00FF00`** (ich stelle es dann frei),
   - kein Himmel, keine Wolken, kein Verlauf im Hintergrund.
3. **Unterkante = Uferlinie:** Die Felsen stehen auf einer **ganz geraden, waagerechten Linie an der Unterkante** des Bildes, über die volle Breite. Unten nichts abschneiden, kein Wasser, keine Spiegelung.
4. **Nahtlos links/rechts:** Der linke Rand (0 %) und der rechte Rand (100 %) müssen **nahtlos aneinanderpassen**: gleiche Höhe, gleiche Form am Rand. Auf sehr breiten Bildschirmen wird das Bild wiederholt.
5. **Komposition nach Vorlage:** Die Vorlagenbilder `vorlage-fern.png` und `vorlage-nah.png` zeigen, wo welche Höhe erlaubt ist. **Die orange Linie ist die maximale Felshöhe.** Am besten gibst du dem Generator die Vorlage als Referenzbild mit.
   - **Links (9–45 % der Breite) steht der Text der Website:** dort nur sehr niedrige, flache Felsen.
   - **Rechts (63–87 %) steht die Skulptur:** links und rechts davon die höchsten Felstürme als Rahmen, direkt dahinter (70–80 %) bewusst niedriger, damit die Skulptur frei steht.
   - In Ebene 2 bleibt **unter der Skulptur (67–83 %) das Ufer fast flach**, dort steht ihr Sockel.
6. **Licht:** Die Lichtquelle sitzt **oben, leicht rechts der Mitte** (über der Skulptur, ca. 75 % der Breite). Die Felsen bekommen dort einen hellen Lichtsaum an der zugewandten Kante, ihre Flanken werden zum Rand hin dunkler.
7. **Stil:**
   - weich gerenderte, **stilisierte 3D-Optik** (wie ein ruhiges Spiel- oder Animationsfilm-Rendering),
   - glatte, matte Oberflächen mit **sehr feiner Körnung** (wie mattierter Sandstein),
   - keine Fotorealistik, keine harten schwarzen Konturen, keine Comic-Linien, keine scharfen Details.
8. **Farben:** ausschließlich Blautöne, genau nach den Hex-Werten unten. Kein Grün, Lila, Grau, Braun oder Weißstich.
9. **Verboten:** Menschen, Tiere, Gebäude, Pflanzen mit Farbe, Text, Logos, Wasserzeichen, Sonne, Mond, Sterne.
10. **Zusammenspiel:** Ebene 1 und 2 sollen wie **eine** Szene aussehen: gleiche Perspektive (Blick leicht von oben, Horizont auf Augenhöhe), gleiches Licht, gleicher Stil. Ebene 2 ist überall **niedriger** als Ebene 1 und etwas **dunkler und kontrastreicher**.

---

## Bild 1: `land-fern-hell.png` (ferne Felsen, helles Farbschema)

```
Create a wide panoramic image, exactly 3840 x 960 pixels, PNG with a fully transparent background (if transparency is not possible, use a flat pure green #00FF00 background).

Subject: a row of distant karst limestone towers and tall rounded rock spires, like the misty mountains of Guilin, seen from far away across a lake. Only the rocks – no sky, no clouds, no water, no reflection, no ground plane in front.

Composition (follow the attached layout reference exactly; the orange line is the maximum rock height):
- All rocks stand on one perfectly straight horizontal line at the very bottom edge of the image, across the full width.
- From 9% to 45% of the width: only very low, gentle rock hills, at most 15% of the image height.
- From 45% to 60%: the rocks rise gradually up to about 45% of the image height.
- Around 63%: a group of tall slender rock towers, up to 60% of the image height.
- From 70% to 80%: noticeably lower rocks (at most 38% of the image height), leaving space for a sculpture that stands in front.
- Around 88%: the tallest group of rock towers, up to 70% of the image height.
- Towards 100%: falling back to about 25% of the image height.
- The left edge and the right edge must tile seamlessly: same height and same shape at 0% and 100%.

Style: soft stylized 3D render, smooth matte surfaces with a very fine subtle grain like matte sandstone, gentle atmospheric haze, low contrast because the rocks are far away, rocks become paler and dissolve into a soft pale mist towards their base. No photorealism, no hard outlines, no sharp details.

Lighting: soft light from above, slightly right of the center (around 75% of the width); faint bright rim light on the edges facing that point.

Colours: strictly pale icy blues only – main rock colour #C6D3F1, shadow sides #A9BCE8, lit edges and mist #DCE5F8. No other colours.

Do not include: people, animals, buildings, trees, plants, text, logos, watermark, sun, moon, stars.
```

## Bild 2: `land-nah-hell.png` (nahe Uferfelsen, helles Farbschema)

```
Create a wide panoramic image, exactly 3840 x 960 pixels, PNG with a fully transparent background (if transparency is not possible, use a flat pure green #00FF00 background).

Subject: the near shore of a calm lake: low weathered karst rocks, a few smooth rounded boulders and some short rock pillars directly at the waterline, seen from a slightly elevated viewpoint. This layer lies in front of a second image with tall distant rock towers, so it must be clearly lower everywhere. Only the rocks – no sky, no water, no reflection.

Composition (follow the attached layout reference exactly; the orange line is the maximum rock height):
- All rocks stand on one perfectly straight horizontal line at the very bottom edge of the image, across the full width.
- From 9% to 45% of the width: only a few very low flat stones, at most 8% of the image height, with gaps between them.
- From 45% to 62%: rising rocks up to about 30% of the image height.
- From 67% to 83%: an almost flat, open shore (at most 5% of the image height) – a sculpture's base stands here.
- Around 90%: a group of shore rocks up to about 34% of the image height.
- Towards 100%: falling back to about 14% of the image height.
- The left edge and the right edge must tile seamlessly: same height and same shape at 0% and 100%.

Style: soft stylized 3D render, smooth matte surfaces with a very fine subtle grain like matte sandstone, a little more contrast and detail than the distant rocks, slight haze. No photorealism, no hard outlines.

Lighting: soft light from above, slightly right of the center (around 75% of the width); bright rim light on edges facing that point, deeper shadows on the far sides.

Colours: strictly blues only – main rock colour #A9BCE8, shadow sides #7F98D6, deepest crevices #4A63A8, lit edges #DCE5F8. No green, no other colours.

Do not include: people, animals, buildings, trees, coloured plants, text, logos, watermark, sun, moon, stars.
```

## Bild 3: `land-fern-dunkel.png` (ferne Felsen, dunkles Farbschema)

```
Create a wide panoramic image, exactly 3840 x 960 pixels, PNG with a fully transparent background (if transparency is not possible, use a flat pure green #00FF00 background).

Subject: exactly the same distant karst limestone towers as in the light version (same shapes, same positions, same composition), but as a calm night scene. Only the rocks – no sky, no stars, no clouds, no water, no reflection.

Composition: identical to the light version and the attached layout reference (very low between 9% and 45% of the width, tall towers around 63% and 88%, lower between 70% and 80%, straight bottom edge, seamless left and right edges).

Style: soft stylized 3D render, smooth matte surfaces with a very fine subtle grain, soft night haze, low contrast because the rocks are far away. No photorealism, no hard outlines.

Lighting: faint cool moonlight from above, slightly right of the center (around 75% of the width), giving a thin glowing blue rim on the edges facing that point; the rest of the rocks stay dark.

Colours: strictly deep navy and midnight blues only – main rock colour #1D3264, shadow sides #13244F, rim light #3A5BA8. No other colours.

Do not include: people, animals, buildings, trees, plants, text, logos, watermark, moon, stars.
```

## Bild 4: `land-nah-dunkel.png` (nahe Uferfelsen, dunkles Farbschema)

```
Create a wide panoramic image, exactly 3840 x 960 pixels, PNG with a fully transparent background (if transparency is not possible, use a flat pure green #00FF00 background).

Subject: exactly the same near lake shore rocks as in the light version (same shapes, same positions), but as a calm night scene. Only the rocks – no sky, no water, no reflection.

Composition: identical to the light version and the attached layout reference (only a few very low flat stones between 9% and 45% of the width, almost flat open shore between 67% and 83%, shore rocks up to 34% of the height around 90%, straight bottom edge, seamless left and right edges).

Style: soft stylized 3D render, smooth matte surfaces with a very fine subtle grain, a little more contrast than the distant rocks. No photorealism, no hard outlines.

Lighting: cool moonlight from above, slightly right of the center (around 75% of the width), giving a soft glowing blue rim on the edges facing that point; deep shadows elsewhere.

Colours: strictly navy and midnight blues only – main rock colour #13244F, shadow sides #0D1C42, rim light #5B8CFF at low intensity. No other colours.

Do not include: people, animals, buildings, trees, plants, text, logos, watermark, moon, stars.
```

---

## Tipps für die Erzeugung

- **Reihenfolge:** Zuerst Bild 1 (fern, hell) erzeugen. Dann für die anderen drei Bilder **Bild 1 als Referenz mitgeben** („same scene, same style as the attached image“), damit alles zusammenpasst.
- Für die **dunklen Fassungen** am besten das jeweilige helle Bild mitgeben und bitten: „Turn this exact image into the night version described below, keep all shapes identical.“
- Wenn ein Generator 3840 × 960 nicht direkt kann: im Verhältnis **4 : 1** in der größten möglichen Auflösung erzeugen. Ich skaliere dann.
- Ist ein Bild nicht ganz nahtlos oder der Rand nicht perfekt gerade, ist das nicht schlimm. Kleine Korrekturen mache ich beim Einbauen.

## Ablage

Die vier Bilder bitte in den Ordner `incoming/` auf `main` legen, mit genau diesen Dateinamen:

- `land-fern-hell.png`
- `land-nah-hell.png`
- `land-fern-dunkel.png`
- `land-nah-dunkel.png`
