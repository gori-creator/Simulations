# Bilder-Wunschliste

## Noch zu erzeugen (Stand 18.10.2026)

Alle bisher gelieferten, passenden Bilder sind eingebaut (siehe `docs/BILDER.md`). Diese Bilder fehlen noch oder müssen neu erzeugt werden. Hochladen: Zweig `claude/sleepy-goodall-ddchwy`, Ordner `incoming/`.

**Fehlen noch ganz**

| Simulation | Bild | Hintergrund | Prompt |
| --- | --- | --- | --- |
| Hebelgesetz | Hebelstange | transparent | A long horizontal aluminium lever bar with evenly spaced small holes along its length, brushed metal, front view, isolated on a transparent background, photorealistic, no text |
| Kreisbewegung | Auto von oben | transparent | A small modern car seen exactly from above, red paint, generic design with no brand, isolated on a transparent background, photorealistic, no text |
| Kreisbewegung | Asphalt von oben | deckend | Top-down view of a large empty asphalt area with fine texture, dark grey, evenly lit, seamless, photorealistic, no markings |
| Brechung | Glasblock | transparent | A semicircular clear acrylic glass block seen exactly from above, flat side horizontal, subtle edge reflections, isolated on a transparent background, photorealistic |
| Zahlengerade | Thermometer | transparent | An outdoor glass thermometer tube with a red liquid column, mounted on a blank white board without any scale or numbers, vertical, front view, isolated on a transparent background, photorealistic |
| Brüche rechnen | Messbecher | transparent | A clear glass measuring jug, empty, without any scale marks or numbers, front view, isolated on a transparent background, photorealistic |
| Primfaktoren | zarter Baum | transparent | A delicate stylised tree with bare thin branches spreading upwards, soft light green watercolour style, very subtle and light, isolated on a transparent background, no text |
| Winkel messen | Geodreieck | transparent | A transparent plastic set square triangle, right isosceles, slightly bluish clear acrylic, completely without scale, marks or numbers, top view, long side horizontal at the bottom, isolated on a transparent background, photorealistic |

**Neu erzeugen (geliefertes Bild passte nicht)**

| Simulation | Bild | Grund | Prompt |
| --- | --- | --- | --- |
| Doppler-Effekt | Krankenwagen von oben | geliefert: Seitenansicht, Szene ist Draufsicht | A modern ambulance seen exactly from above (top-down view), white roof with red stripes and blue light bars, generic design with no text, no brand, front pointing right, isolated on a transparent background, photorealistic |
| Hebelgesetz | Flaschenöffner von der Seite | geliefert: Draufsicht | A simple stainless steel bottle opener seen exactly from the side in profile, showing the hook tooth and the handle, flat, isolated on a transparent background, photorealistic, no text |
| Stöße | Gleiter | geliefert: schräg, zu flach | A small air track glider seen exactly from the side with no perspective, long aluminium rider with a V-shaped profile, aspect ratio about 3.5 to 1, no text, no markings, isolated on a transparent background, photorealistic |
| Hookesches Gesetz | flache Schlitzscheibe | geliefert: hohes Hakengewicht | A single flat slotted brass laboratory weight disc seen exactly from the side, thin cylinder, polished brass, isolated on a transparent background, photorealistic, no text |
| Mittelsenkrechte | Zirkel in zwei Teilen | fester Öffnungswinkel passt nicht | A metal school compass taken apart into its two legs, each leg shown separately side by side: left the needle leg with the hinge head and grip, right the leg with a clamped yellow pencil, both legs exactly vertical, front view, isolated on a transparent background, photorealistic |
| Bewegungsdiagramme | neutrales Auto | jetziges ist als echtes Modell erkennbar | A small generic compact car in glossy blue, exact side view facing right, simple rounded shape that does not resemble any real brand or model, no logo, isolated on a transparent background, photorealistic |

**Würde verbessern (eingebaut, aber nur mäßig)**

| Simulation | Bild | Prompt |
| --- | --- | --- |
| Schiefe Ebene | kompakter Holzklotz | A rectangular wooden block of light oak, aspect ratio about 1.6 to 1, small metal eyelet on the right end, exact side view, isolated on a transparent background, photorealistic |
| Zahlengerade | Polarmeer (passt zu Eisberg und Pinguin) | Side cross-section view of a polar sea: calm dark blue water surface exactly horizontal in the middle of the image, pale sky and distant snowy coast above, clear underwater part below fading into deep blue, no animals, no icebergs in the left half, photorealistic |
| Gesetz der großen Zahlen | Würfel von oben | A single white plastic game die without pips seen exactly from above, rounded edges, isolated on a transparent background, photorealistic |
| Extremwertaufgaben | rechtwinkliges Holzbrett | Top-down view of a right-angled triangular plywood board, right angle at the bottom left, warm wood with clearly visible grain, evenly lit, isolated on a transparent background, photorealistic |
| Extremwertaufgaben | gebürstetes Blech | A sheet of brushed stainless steel with fine horizontal brushing lines, evenly lit, no hotspot, seamless, photorealistic |
| Reflexion, Linsen | Kerze ohne Flamme | A white wax candle with a short black wick and no flame, front view, isolated on a transparent background, photorealistic |

**Nicht nötig:** Karopapier, weißer Hintergrund, Baumscheibe, Holzplättchen, Münze, Spielkarte, Holztextur (3D-Ansichten und eigene Raster vertragen keine Fotos), Kanone, Brunnen, Riesenrad (keine passende Stelle in der Simulation).

---

## Ursprüngliche Liste (15.10.2026)


Ziel: Die Simulationen sollen durch echte Bilder statt gezeichneter Ersatzgrafiken deutlich hochwertiger wirken. Diese Liste sammelt **Vorschläge mit Prompts**. Eingebaut wird ein Bild erst, wenn die Datei vorliegt; danach kommt der Eintrag nach `docs/BILDER.md` (Regeln dort gelten weiter: keine Schrift, keine Logos, keine Personen, WebP, möglichst < 300 KB, immer gezeichneter Ersatz im Code).

**Ablauf:** Bild erzeugen → zuschneiden → als WebP unter dem angegebenen Pfad ablegen → Bescheid geben. Dann baue ich es in die Simulation ein (bei den neuen Bildern ist dafür jeweils eine kleine Code-Änderung nötig).

**Priorität:** ★★★ = macht die Simulation sichtbar schöner · ★★ = schöner Zusatz · ★ = nur Feinschliff

**Stil für alle Bilder** (an jeden Prompt anhängen, falls der Generator es nicht schon trifft):
`photorealistic, soft studio lighting, friendly and clean, high detail, no text, no logos, no watermark, no people`

**„Transparent“** heißt: Hintergrund wirklich durchsichtig (Alpha-Kanal), ggf. mit einem Freistellungswerkzeug nachbearbeiten. **„Deckend“** heißt: normales Bild ohne Transparenz.

---

## 0. Schon eingebaut, aber Datei fehlt noch (sofort wirksam, kein Code nötig)

Die Prompts stehen in `docs/BILDER.md`. Sonne und Erde werden in beiden Simulationen benutzt – einmal erzeugen, zweimal ablegen.

| Datei | Größe | Hintergrund | Prompt |
| --- | --- | --- | --- |
| `src/assets/sims/licht-schatten/sonne.webp` und `src/assets/sims/planetenbahnen/sonne.webp` | 1024 × 1024 | transparent | siehe BILDER.md, „Licht und Schatten → sonne.webp“ |
| `src/assets/sims/licht-schatten/erde.webp` und `src/assets/sims/planetenbahnen/erde.webp` | 1024 × 1024 | transparent | siehe BILDER.md, „Licht und Schatten → erde.webp“ |
| `src/assets/sims/licht-schatten/mond.webp` | 1024 × 1024 | transparent | siehe BILDER.md, „Licht und Schatten → mond.webp“ |

---

## 1. Physik

### Bewegungsdiagramme ★★★
- `bewegungsdiagramme/auto.webp` – 1200 × 600, transparent – Auto auf der Strecke
  > A small modern compact car in glossy blue, exact side view facing right, wheels visible, generic design with no brand, isolated on a transparent background, soft contact shadow removed, photorealistic
- `bewegungsdiagramme/strasse.webp` – 2400 × 400, deckend – Fahrbahn als Streifen unter dem Auto
  > Straight asphalt road seen exactly from the side as a long horizontal strip, dark grey asphalt with a thin white edge line, a narrow strip of green grass below, seamless horizontally tileable, photorealistic

### Freier Fall ★★
- `freier-fall/kugel.webp` – 256 × 256, transparent – Stahlkugel in der Fallröhre und im Stroboskop
  > A polished steel ball, perfectly round, bright specular highlight, isolated on a transparent background, photorealistic
- `freier-fall/lineal.webp` – 300 × 1600, transparent – Lineal beim Reaktionstest
  > A wooden school ruler standing vertically, light beech wood with black millimetre tick marks but no numbers, front view, isolated on a transparent background, photorealistic

### Schiefer Wurf
(Hintergründe und Ball sind vorhanden.)
- `schiefer-wurf/kanone.webp` – 800 × 500, transparent – Abwurfgerät ★★
  > A small friendly toy cannon on two wooden wheels, barrel pointing to the right at 30 degrees, painted dark green with brass details, side view, isolated on a transparent background, photorealistic

### Fadenpendel ★★
- `fadenpendel/stativ.webp` – 1000 × 1400, transparent – Aufhängung
  > A physics lab stand with a heavy dark base, vertical steel rod and a short horizontal clamp arm at the top pointing right, front view, isolated on a transparent background, photorealistic

### Federpendel ★★★
- `federpendel/gewicht.webp` – 512 × 512, transparent – Massestück an der Feder
  > A slotted brass laboratory weight with a hook on top, cylindrical, shiny polished brass, front view, isolated on a transparent background, photorealistic
- `federpendel/stativ.webp` – wie beim Fadenpendel (gleiche Datei kopieren)

### Hookesches Gesetz ★★★
- `hookesches-gesetz/gewicht.webp` – wie beim Federpendel (gleiche Datei kopieren)
- `hookesches-gesetz/stativ.webp` – wie beim Fadenpendel (gleiche Datei kopieren)
- `hookesches-gesetz/massstab.webp` – 300 × 1800, transparent – Messlatte neben der Feder
  > A vertical white measuring scale bar with fine black centimetre and millimetre tick marks but no numbers, slightly glossy plastic, front view, isolated on a transparent background, photorealistic

### Hebelgesetz ★★★
- `hebelgesetz/hebel.webp` – 2400 × 300, transparent – Hebelstange
  > A long horizontal aluminium lever bar with evenly spaced small holes along its length, brushed metal, front view, isolated on a transparent background, photorealistic
- `hebelgesetz/gewicht.webp` – wie beim Federpendel (gleiche Datei kopieren)
- `hebelgesetz/schubkarre.webp` – 1400 × 800, transparent – Beispiel Schubkarre
  > A classic garden wheelbarrow with a green metal tub, one front wheel and two wooden handles, exact side view facing left, empty, isolated on a transparent background, photorealistic
- `hebelgesetz/flaschenoeffner.webp` – 1000 × 400, transparent – Beispiel Flaschenöffner
  > A simple stainless steel bottle opener, flat, top view, isolated on a transparent background, photorealistic

### Kräfteaddition ★★
- `kraefteaddition/lampe.webp` – 600 × 600, transparent – Straßenlampe an zwei Seilen
  > A round vintage street lamp hanging from above, dark metal housing with a warm glowing glass globe, front view, two attachment rings on top, isolated on a transparent background, photorealistic

### Schiefe Ebene ★★★
- `schiefe-ebene/holzklotz.webp` – 800 × 500, transparent – Klotz auf der Rampe
  > A rectangular wooden block of light oak with visible grain and a small metal hook on one end, side view, isolated on a transparent background, photorealistic
- `schiefe-ebene/brett.webp` – 2400 × 200, deckend – Oberfläche der Rampe
  > A long plank of smooth light wood seen exactly from the side, horizontal, fine wood grain, seamless horizontally tileable, photorealistic

### Kreisbewegung ★★
- `kreisbewegung/auto-oben.webp` – 600 × 1000, transparent – Auto in der Kurve (Draufsicht)
  > A small modern car seen exactly from above, red paint, generic design with no brand, isolated on a transparent background, photorealistic
- `kreisbewegung/asphalt.webp` – 1600 × 1600, deckend – Straße/Kreisverkehr von oben
  > Top-down view of a large empty asphalt area with fine texture, dark grey, evenly lit, seamless, photorealistic

### Stöße ★★★
- `stoesse/gleiter.webp` – 1000 × 400, transparent – Wagen auf der Luftkissenbahn
  > A small air track glider, a long aluminium rider with a V-shaped profile and a small bumper spring at the front, side view, isolated on a transparent background, photorealistic
- `stoesse/bahn.webp` – 2400 × 240, transparent – Luftkissenbahn
  > A long horizontal aluminium air track with tiny holes along the top surface, side view, brushed metal, isolated on a transparent background, photorealistic

### Planetenbahnen
- `planetenbahnen/sternenhimmel.webp` – 2048 × 2048, deckend – Hintergrund ★★★
  > Deep space starfield, black background with many tiny white and faintly coloured stars, very subtle distant blue and purple nebula haze, no planets, no bright objects in the centre, photorealistic astrophotography

### Energieerhaltung (Achterbahn)
(Wagen und Himmel sind vorhanden.)
- `energieerhaltung/landschaft.webp` – 2400 × 600, transparent oben – Hügel und Bäume am unteren Rand ★★
  > Wide panoramic strip of a summer amusement park landscape, green rolling grass and a few trees at the bottom, transparent sky above, side view, photorealistic

### Resonanz (Pohlsches Rad) ★★★
- `resonanz/rad.webp` – 1024 × 1024, transparent – Kupferrad
  > A Pohl's wheel physics apparatus seen from the front: a flat polished copper disc with a fine scale ring around the edge, a coiled spiral spring in the centre, isolated on a transparent background, photorealistic

### Wellenausbreitung ★
- `wellen-ausbreitung/kugel.webp` – 256 × 256, transparent – Teilchen der Kette
  > A small glossy red sphere, perfectly round, soft highlight, isolated on a transparent background, photorealistic

### Einfacher Stromkreis ★★★
- `einfacher-stromkreis/batterie.webp` – 800 × 500, transparent
  > A 4.5 volt flat battery with two brass contact tabs on top, generic design with no brand or text, three-quarter view, isolated on a transparent background, photorealistic
- `einfacher-stromkreis/gluehlampe-aus.webp` – 512 × 768, transparent
  > A small clear glass incandescent bulb in an E10 socket on a small holder, switched off, visible filament, front view, isolated on a transparent background, photorealistic
- `einfacher-stromkreis/gluehlampe-an.webp` – 512 × 768, transparent
  > The same small clear incandescent bulb switched on, warm bright glowing filament with soft light bloom, front view, isolated on a transparent background, photorealistic
- `einfacher-stromkreis/schalter.webp` – 600 × 400, transparent
  > A simple school lab knife switch on a small wooden base, brass lever, three-quarter view, isolated on a transparent background, photorealistic
- `einfacher-stromkreis/motor.webp` – 600 × 500, transparent
  > A small electric hobby motor with a red propeller, silver metal housing, side view, isolated on a transparent background, photorealistic
- `einfacher-stromkreis/klingel.webp` – 600 × 600, transparent
  > A classic electric bell with a shiny brass dome and a small hammer, front view, isolated on a transparent background, photorealistic
- `einfacher-stromkreis/tisch.webp` – 1920 × 1080, deckend – Arbeitsfläche
  > Top-down view of a clean light grey lab bench surface with subtle texture, evenly lit, empty, photorealistic

### Reihen- und Parallelschaltung ★★
- Glühlampen (an/aus), Batterie und Tisch wie beim einfachen Stromkreis (gleiche Dateien kopieren)
- `reihe-parallel/widerstand.webp` – 600 × 240, transparent
  > A single through-hole resistor with coloured bands, beige body, horizontal, isolated on a transparent background, photorealistic

### Ohmsches Gesetz ★★★
- `ohmsches-gesetz/netzgeraet.webp` – 1000 × 700, transparent – Netzgerät (die Anzeige zeichnet die Simulation darüber)
  > A school laboratory DC power supply, grey metal housing, one large black rotary knob and two banana-plug sockets red and black, an empty dark display window, front view, no text, isolated on a transparent background, photorealistic
- `ohmsches-gesetz/messgeraet.webp` – 800 × 800, transparent – Zeigerinstrument (Skala und Zeiger zeichnet die Simulation)
  > An analogue lab meter housing, black case with a large blank white dial face without any scale or numbers and without a needle, front view, isolated on a transparent background, photorealistic

### Licht und Schatten
- `licht-schatten/lampe.webp` – 600 × 600, transparent ★★
  > A small lab lamp housing with a round opening facing right, black metal, side view, isolated on a transparent background, photorealistic
- `licht-schatten/sternenhimmel.webp` – wie bei Planetenbahnen (gleiche Datei kopieren) ★★★

### Reflexion ★★
- `reflexion/kerze.webp` – 400 × 900, transparent – Kerze vor dem Spiegel
  > A white wax candle with a small calm burning flame, front view, isolated on a transparent background, photorealistic
- `reflexion/laser.webp` – wie bei der Brechung (Datei von `brechung/laser.webp` kopieren)

### Linsen ★★
- `linsen/kerze.webp` – wie bei der Reflexion (gleiche Datei kopieren)
- `linsen/linse.webp` – 400 × 1200, transparent – Sammellinse von der Seite
  > A biconvex glass lens seen exactly edge-on from the side, clear glass with subtle reflections and a thin metal rim, vertical, isolated on a transparent background, photorealistic

### Brechung
(Laser ist vorhanden.)
- `brechung/glasblock.webp` – 1024 × 1024, transparent – Halbzylinder auf der optischen Scheibe ★★
  > A semicircular clear acrylic glass block seen exactly from above, flat side horizontal, subtle edge reflections, isolated on a transparent background, photorealistic

### Doppler-Effekt (in Arbeit) ★★★
- `doppler-effekt/krankenwagen.webp` – 1200 × 600, transparent
  > A modern ambulance seen from the side facing right, white with red stripes and blue lights on the roof, generic design with no text, no brand, isolated on a transparent background, photorealistic
- `doppler-effekt/strasse-oben.webp` – 2400 × 1200, deckend – Straße von oben
  > Top-down aerial view of a straight two-lane road running horizontally, grass on both sides, evenly lit, photorealistic

---

## 2. Mathematik

### Ziegenproblem, Galtonbrett, Gesetz der großen Zahlen, Monte-Carlo, Kreiszahl π, Bruchteile, Exponentielles Wachstum
Bilder sind vorhanden. Mögliche Ergänzungen:
- `gesetz-grosse-zahlen/wuerfel.webp` – 512 × 512, transparent ★★ (Würfel; Augenzahlen zeichnet die Simulation, deshalb ohne Augen)
  > A single white plastic game die without any pips, blank faces, rounded edges, three-quarter view, isolated on a transparent background, photorealistic
- `monte-carlo-pi/sand.webp` – 64 × 64, transparent ★ (ein „Regentropfen“ statt Punkt)
  > A single small water droplet seen from above, clear with soft highlight, isolated on a transparent background, photorealistic

### Stellenwerte ★★
- `stellenwerte/plaettchen.webp` – 256 × 256, transparent – Plättchen in der Stellenwerttafel
  > A single round wooden counter chip, light natural wood, top view, isolated on a transparent background, photorealistic

### Zahlengerade ★★★
- `zahlengerade/thermometer.webp` – 300 × 1600, transparent (Skala zeichnet die Simulation)
  > An outdoor glass thermometer tube with a red liquid column, mounted on a blank white board without any scale or numbers, vertical, front view, isolated on a transparent background, photorealistic
- `zahlengerade/meer.webp` – 1600 × 1600, deckend – Meeresspiegel-Beispiel
  > Side cross-section view of a coastal scene: a hill with green grass above the water line, calm blue sea surface in the middle, underwater part fading into deep blue below, photorealistic

### Bruchteile
- `bruchteile/schokolade.webp` – 1400 × 900, deckend ★★ (Tafel Schokolade als vierte Darstellung)
  > A bar of milk chocolate seen from above, 4 by 6 rectangular pieces, unwrapped, no brand, evenly lit, photorealistic

### Brüche vergleichen ★★
- Pizza und Blechkuchen wie bei Bruchteile (Dateien kopieren)

### Brüche rechnen ★
- `brueche-rechnen/messbecher.webp` – 600 × 1000, transparent (Dividieren durch Messen)
  > A clear glass measuring jug, empty, without any scale marks or numbers, front view, isolated on a transparent background, photorealistic

### Primfaktoren ★
- `primfaktoren/baum.webp` – 1600 × 1200, transparent – zarter Baum als Hintergrund des Faktorbaums
  > A delicate stylised tree silhouette with bare branches, light watercolour green, very subtle, isolated on a transparent background

### Waagemodell ★★★
- `waagemodell/waage.webp` – 1600 × 1000, transparent – Balkenwaage (Balken wird gedreht, daher ohne Schalen)
  > A classic brass balance scale stand without the beam and without pans, ornate column on a wooden base, front view, isolated on a transparent background, photorealistic
- `waagemodell/schale.webp` – 700 × 300, transparent
  > A single shallow brass weighing pan hanging from three thin chains, front view, isolated on a transparent background, photorealistic
- `waagemodell/paeckchen.webp` – 400 × 400, transparent – „x-Päckchen“
  > A small cardboard parcel tied with twine, cube shaped, front view, isolated on a transparent background, photorealistic
- `waagemodell/gewicht.webp` – 300 × 300, transparent
  > A small cast iron weight with a top handle, front view, isolated on a transparent background, photorealistic

### Umfang und Fläche ★★
- `umfang-flaeche/ameise.webp` – 256 × 256, transparent – Ameise läuft den Rand ab
  > A single cute ant seen exactly from above, walking pose, isolated on a transparent background, photorealistic macro
- `umfang-flaeche/rechenpapier.webp` – 1600 × 1600, deckend
  > Top-down view of a sheet of white squared maths paper with light blue grid, slightly textured paper, evenly lit, photorealistic

### Koordinaten und Lage, Vierecke, Spiegelung, Winkel messen, Mittelsenkrechte, Thales ★★
Gemeinsame Bilder (einmal erzeugen, in jeden Ordner kopieren):
- `<id>/karopapier.webp` – 1600 × 1600, deckend
  > Top-down view of a sheet of white squared exercise paper with faint grey-blue 5 mm grid, slightly textured, evenly lit, photorealistic
- `winkel-messen/geodreieck.webp` – 1600 × 800, transparent (Skala zeichnet die Simulation darüber)
  > A transparent plastic set square triangle, right isosceles, slightly bluish clear acrylic, without any scale, marks or numbers, top view, long side horizontal at the bottom, isolated on a transparent background, photorealistic
- `mittelsenkrechte/zirkel.webp` – 600 × 1000, transparent
  > A metal school compass with pencil, legs opened slightly, front view, isolated on a transparent background, photorealistic

### Körpernetze, Quader-Volumen, Prisma und Zylinder, Pyramide/Kegel/Kugel, Cavalieri, Rotationskörper (3D) ★
3D-Körper werden gezeichnet und gedreht – echte Fotos passen dort nicht. Möglich sind Oberflächen:
- `quader-volumen/wuerfel.webp` – 256 × 256, deckend – Holz-Textur der Einheitswürfel
  > Square close-up texture of light maple wood, fine grain, evenly lit, seamless, photorealistic
- `cavalieri/muenze.webp` – 512 × 512, transparent – Münze im Stapel (ohne echtes Münzbild)
  > A plain golden coin seen from above with a simple raised rim and a blank smooth centre, no symbols, no text, isolated on a transparent background, photorealistic
- `cavalieri/spielkarte.webp` – 700 × 1000, deckend – Kartenrücken
  > The back of a playing card, dark red with a fine symmetric ornamental pattern and a white border, no text, no logo, front view, photorealistic

### Extremwertaufgaben ★★★
- `extremwert-parabel/wiese.webp` – 1600 × 1600, deckend – Gehege von oben
  > Top-down view of a lush green meadow with short grass and a few tiny daisies, evenly lit, seamless, photorealistic
- `extremwert-parabel/mauer.webp` – 2400 × 200, deckend – Mauer am oberen Rand
  > A red brick wall seen exactly from above as a long horizontal strip, seamless horizontally tileable, photorealistic
- `extremwert-parabel/zaunpfahl.webp` – 128 × 128, transparent
  > A single wooden fence post seen exactly from above, round, isolated on a transparent background, photorealistic
- `extremwert-parabel/holzbrett.webp` – 1600 × 1200, deckend – Dreiecksbrett
  > Top-down view of a light plywood board with visible wood grain, evenly lit, photorealistic
- `extremwert-parabel/blech.webp` – 1200 × 400, deckend – Regenrinne
  > A sheet of brushed galvanised steel, horizontal, evenly lit, seamless, photorealistic

### Parabel durch drei Punkte ★★★
- `parabel-drei-punkte/ball.webp` – 256 × 256, transparent – Ball der Wurfbahn
  > A classic white and black football, perfectly round, isolated on a transparent background, photorealistic
- `parabel-drei-punkte/bruecke.webp` – 2400 × 1200, deckend – Hintergrund Brückenbogen (Bogen selbst zeichnet die Simulation)
  > A wide river landscape seen from the side, calm water in the lower third, grassy banks left and right, soft sky, no bridge, photorealistic

### Quadratische Funktion ★★
- `quadratische-funktion/brunnen.webp` – 2400 × 1200, deckend – Wasserstrahl als Parabel-Beispiel
  > A park fountain shooting a single smooth arc of water from left to right against a soft blurred green park background, side view, photorealistic

### Lineare Funktion, LGS grafisch ★
- `lgs-grafisch/handy.webp` – 600 × 1100, transparent – Tarifvergleich-Beispiel
  > A generic modern smartphone, front view, blank dark screen, no brand, isolated on a transparent background, photorealistic

### Sinusfunktion ★★
- `sinusfunktion/riesenrad.webp` – 1600 × 1600, transparent – Modellieren mit Riesenrad
  > A Ferris wheel seen exactly from the front, white steel structure with colourful gondolas, isolated on a transparent background, photorealistic

### Einheitskreis, Sekante/Tangente, Ober-/Untersummen, Hyperbel, Gleichungen grafisch, Funktionsplotter, Funktion/Zuordnung, Termbaum, Binomische Formeln, Pythagoras, Dezimalbrüche
Hier sind die Graphen und Figuren selbst das Wichtige – Fotos würden eher ablenken. Wenn gewünscht, eine gemeinsame, sehr zurückhaltende Papier-Textur:
- `<id>/papier.webp` – 1600 × 1600, deckend ★
  > Top-down view of smooth warm white paper with a very faint natural fibre texture, evenly lit, seamless, photorealistic

---

## Zusammenfassung

- **Sofort wirksam:** 3 Bilder (Sonne, Erde, Mond) – fehlen nur noch als Datei.
- **Neu vorgeschlagen:** rund 70 Bilder; durch gemeinsame Dateien (Stativ, Gewicht, Glühlampe, Karopapier …) müssen davon nur etwa 55 erzeugt werden.
- **Größte Wirkung (★★★):** Stromkreise, Ohmsches Gesetz, Hebel, Federpendel/Hooke, Schiefe Ebene, Stöße, Pohlsches Rad, Bewegungsdiagramme, Sternenhimmel, Waagemodell, Zahlengerade, Extremwertaufgaben, Parabel-Anwendungen, Doppler-Effekt.
