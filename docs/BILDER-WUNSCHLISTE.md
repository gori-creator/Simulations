# Bilder-Wunschliste

## Noch zu erzeugen (Stand 20.10.2026)

**Zusammenfassung:** 94 Bilder – **14 × A**, **57 × B**, **23 × C** – für **47 Simulationen** (23 Physik, 24 Mathematik). Jedes Bild steht genau einmal da; wird es mehrfach gebraucht, stehen alle Verwendungen beim Bild. Dazu kommen 16 vorhandene Bilder, die weitere Simulationen ohne neues Bild mitnutzen können, und ein Bild aus `docs/bilder-eingang/`, das nur eingebaut werden muss (Abschnitte am Ende).

Grundlage: alle 129 Simulationen im Code (`src/simulations/<fach>/<id>/index.ts`) und im Browser (hell und dunkel) durchgesehen, abgeglichen mit `src/assets/sims/`, `docs/BILDER.md`, `docs/bilder-eingang/` und der bisherigen Wunschliste (deren Einträge sind hier eingearbeitet oder unten mit Grund als „nicht nötig“ vermerkt).

### So geht's

1. Bild mit dem Prompt erzeugen. Die Prompts sind vollständig (Stil, Licht, Ausschlüsse stehen jeweils drin) und auf Englisch.
2. **Format PNG mit echter Transparenz** (Alpha-Kanal), bei „deckend“ normales PNG. Den Rest (Zuschneiden, WebP, Größe) erledigt der Einbau.
3. **Dateiname genau wie angegeben** (Spalte „Datei“, ohne Ordner, mit `.png` statt `.webp`), hochladen in den Ordner `incoming/` auf dem Zweig `claude/sleepy-goodall-ddchwy`.
4. Mindestauflösung einhalten – größer ist immer besser als kleiner. Seitenverhältnis möglichst genau treffen; etwas Rand um freigestellte Gegenstände ist in Ordnung.
5. **Wenn der Generator nur quadratische Bilder liefert** (z. B. 2048 × 2048 – so waren die bisherigen Lieferungen): kein Problem. Freigestellte Gegenstände werden beim Einbau ausgeschnitten. Wichtig ist nur, dass der Gegenstand **vollständig** im Bild ist und **die längere Bildseite fast ganz ausfüllt** (bei langen, schmalen Dingen also von links bis rechts). Dann am Ende des Prompts ergänzen: `the object spans almost the full width of a square image, empty transparent space above and below`. Bei **deckenden** Hintergründen und Texturen (Asphalt, Holz, Meer, Ziegel …) einfach quadratisch erzeugen; der Einbau schneidet den passenden Streifen heraus.
6. **Zusammengehörige Bilder** (z. B. A2 Mittel- und Endstück, die Leitertest-Gegenstände B47–B54, die Oberflächen C1–C3) **im selben Chat direkt nacheinander** erzeugen, damit Licht, Maßstab und Stil zusammenpassen.
7. Nach dem Erzeugen kurz prüfen: exakt von der Seite bzw. von oben? kein Text, keine Skala? Hintergrund wirklich durchsichtig (Schachbrettmuster im Bildbetrachter)? Wenn nicht: neu erzeugen, nicht hochladen.

**Grundregeln für alle Bilder** (stehen auch in jedem Prompt): fotorealistisch, sauber, freundlich, weiches Studiolicht von links oben, keine harten Schatten, **kein Text, keine Zahlen, keine Skalen, keine Logos/Marken, keine Personen, keine Hände**. Alles, was die Simulation selbst einzeichnet (Skalen, Zeiger, Beschriftung, Füllstände, Flüssigkeitssäulen, Kraftpfeile), muss im Bild **fehlen**.

**Typische Fehler der Generatoren** (dann bitte neu erzeugen): leichte Schrägsicht statt exakter Seiten- oder Draufsicht; Fantasie-Schrift oder Logos; Schatten auf dem „transparenten“ Hintergrund; ein weißer statt transparenter Hintergrund; Gegenstand angeschnitten.

**Noch nicht auf der Liste:** Fadenpendel und Brechung werden gerade vom Physik-Helfer überarbeitet (T04 Teil 2); ihre Bilder kommen nach dem Einbau dazu.

**Nicht auf der Liste** (bleibt gezeichnet): alles, was von Reglern abhängt oder sich verformt (Graphen, Pfeile, Federn, Seile, Wellen, Feldlinien, Flüssigkeitsstände, Kolben, geometrische Figuren, 3D-Körper), Personen und Körperteile (Kinder auf der Wippe, Beobachter, Hände beim Lineal-Test, Auge – Regel in `docs/BILDER.md`), sehr kleine Symbole (Piktogramme, Baumdiagramm-Icons, Galton-Nägel) und Karten/Pläne, die die Simulation erzeugt.

---

### Priorität A – sieht jetzt deutlich schwach aus oder ist sehr sichtbar

#### A1 · Neutrales Auto, Seitenansicht
- **Simulationen:** Bewegungsdiagramme (`physik/bewegungsdiagramme/index.ts:504` `paintCar`, ersetzt das vorhandene, als echtes Modell erkennbare `auto.webp`), Ähnliche Figuren – Auto und Modell (`mathematik/vergroessern/index.ts:2093` `drawCar`), Integral als Gesamtänderung – Autofahrt (`mathematik/aenderungsrate/index.ts:1049` `drawCar`)
- **Datei:** `src/assets/sims/bewegungsdiagramme/auto.webp` (ersetzt die alte Datei; die anderen beiden bekommen eine Kopie)
- **Hintergrund:** transparent · **Format:** 2,8 : 1, mind. 1600 × 570 px · **Blick:** exakte Seitenansicht, Front nach rechts
> A small generic compact hatchback car in glossy medium blue, exact orthographic side view with no perspective distortion, the front of the car points to the right, both wheels fully visible as perfect circles with simple five-spoke silver rims, simple friendly rounded shape that does not resemble any real brand or model, no logo, no badge, no license plate, tinted dark windows, no driver, no people, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no ground, no shadow, photorealistic, clean educational style, no text, no numbers
- **Hinweis:** Die Felgen werden ausgeschnitten und gedreht – sie müssen kreisrund sein (keine Schrägsicht, sonst Ellipsen). Kein Markenmodell erkennbar (kein VW-, Toyota-Gesicht o. Ä.).

#### A2 · Hebelstange: Mittelstück mit einem Loch und Endstück (2 Bilder)
- **Simulationen:** Hebelgesetz – Versuch (`physik/hebelgesetz/index.ts:874` `drawLab`, Balken Zeile 957)
- **Warum zwei Teile:** Die Simulation zeichnet den Balken etwa 35- bis 48-mal so lang wie hoch (21 Löcher im festen Abstand). Ein einziges Bild in diesem Format liefert kein Generator, und gestreckt würden die Löcher zu Ellipsen. Deshalb wird ein **Mittelstück mit genau einem Loch** 21-mal nebeneinandergesetzt, dazu links und rechts ein **Endstück**.
- **Dateien:** `src/assets/sims/hebelgesetz/hebel-segment.webp` und `src/assets/sims/hebelgesetz/hebel-ende.webp`
- **Hintergrund:** transparent · **Format:** Mittelstück 9 : 4, mind. 900 × 400 px; Endstück 3 : 2, mind. 600 × 400 px · **Blick:** exakte Vorderansicht, waagerecht

**Mittelstück:**
> A short straight section of a laboratory lever bar made of brushed anodised aluminium, flat rectangular profile, exact orthographic front view with no perspective, the bar section is perfectly horizontal and fills the full image width from the left edge to the right edge so that it can be tiled seamlessly side by side, the top and bottom edges are perfectly straight and horizontal, exactly one small round through-hole exactly in the centre of the section, the brushing lines run horizontally and continue at both cut edges, both cut ends are straight vertical cuts without any rounding or end face, soft even studio light from the upper left, subtle metallic sheen, no hard shadows, isolated on a fully transparent background above and below the bar, no shadow, photorealistic, clean educational style, no text, no numbers, no scale marks

**Endstück:**
> The right end of a laboratory lever bar made of brushed anodised aluminium, flat rectangular profile, exact orthographic front view with no perspective, the bar comes in from the left image edge with a straight vertical cut and ends on the right with a neatly rounded end, no hole, the top and bottom edges perfectly straight and horizontal, same height as a bar section, horizontal brushing lines, soft even studio light from the upper left, subtle metallic sheen, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers
- **Hinweis:** Beide Bilder mit **gleicher Balkenhöhe** und gleichem Metallton erzeugen (am besten im selben Chat direkt nacheinander). Das Mittelstück muss **links und rechts randlos** sein, sonst sieht man beim Aneinandersetzen Fugen. Das Loch muss genau in der Mitte und kreisrund sein. Das linke Ende entsteht durch Spiegeln des Endstücks.

#### A3 · Gleiter für die Luftkissenbahn
- **Simulationen:** Elastische und unelastische Stöße (`physik/stoesse/index.ts:794` `drawGlider`)
- **Datei:** `src/assets/sims/stoesse/gleiter.webp` (ersetzt das nicht verwendbare Bild in `docs/bilder-eingang/stoesse/`)
- **Hintergrund:** transparent · **Format:** 3,5 : 1, mind. 1400 × 400 px · **Blick:** exakte Seitenansicht
> A single air track glider seen exactly from the side, orthographic view with no perspective, no end face visible, an inverted V-shaped rider made of brushed silver aluminium, the bottom edge perfectly straight and horizontal, a small round bumper ring on the right end and a small flat plate on the left end, plain uncoloured metal, overall aspect ratio about 3.5 to 1, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no track, no shadow, photorealistic, clean educational style, no text, no numbers, no markings
- **Hinweis:** Die Simulation färbt die Gleiter blau bzw. rosa ein und schreibt die Masse darauf – das Metall muss deshalb neutral silbern und ohne Aufschrift sein. Das gelieferte Bild war schräg (Stirnfläche sichtbar) und mit 6,6 : 1 zu flach.

#### A4 · Flache Schlitzscheibe (Massestück 50 g)
- **Simulationen:** Hookesches Gesetz (`physik/hookesches-gesetz/index.ts:447` `drawPiece`, Massestücke am Haken und im Kasten), Stöße (`physik/stoesse/index.ts:749` `drawStack`, Zusatzmassen auf den Gleitern)
- **Datei:** `src/assets/sims/hookesches-gesetz/massestueck.webp` (Kopie nach `stoesse/`)
- **Hintergrund:** transparent · **Format:** 4 : 1, mind. 1000 × 250 px · **Blick:** exakte Seitenansicht (Scheibe auf der Kante, flach liegend)
> A single flat slotted laboratory mass disc made of polished brass, seen exactly from the side with no perspective, so it appears as a thin horizontal rectangle with slightly rounded edges, about four times as wide as high, the slot is not visible from this side, warm golden reflections, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no engraving
- **Hinweis:** Das Bild wird je nach Simulation unterschiedlich dick dargestellt (Hookesches Gesetz etwa 2,7 : 1, Zusatzmassen bei den Stößen 5 : 1 bis 16 : 1) – deshalb eine schlichte Scheibe **ohne Details an der Kante** (keine Fasen, Rillen oder Gravur). Keine Gravur „50 g“ (die Masse schreibt die Simulation). Oft kommt ein hohes Hakengewicht oder eine Schrägsicht von oben – beides passt nicht; das gelieferte `hookesches-gesetz/gewicht.webp` ist identisch mit `federpendel/gewicht.webp`.

#### A5 · Auto von oben
- **Simulationen:** Kreisbewegung – Auto in der Kurve (`physik/kreisbewegung/index.ts:948` `paintCar`, Szene `drawCarScene` Zeile 801)
- **Datei:** `src/assets/sims/kreisbewegung/auto-oben.webp`
- **Hintergrund:** transparent · **Format:** 2 : 1, mind. 1200 × 600 px · **Blick:** exakte Draufsicht, Front nach rechts
> A small generic compact car seen exactly from above, orthographic top-down view with no perspective, the front of the car points to the right, bright yellow-orange paint, dark tinted windscreen and rear window, side mirrors visible, simple rounded design that does not resemble any real brand or model, no logo, no roof sign, no people visible, soft even light from above, no hard shadows, isolated on a fully transparent background, no road, no shadow, photorealistic, clean educational style, no text, no numbers
- **Hinweis:** Muss genau von oben sein (beide Seiten symmetrisch). Gelb-orange passt zur bisherigen Farbe der Szene.

#### A6 · Krankenwagen von oben
- **Simulationen:** Doppler-Effekt (`physik/doppler-effekt/index.ts:995` `drawAmbulance`)
- **Datei:** `src/assets/sims/doppler-effekt/krankenwagen.webp` (die Seitenansicht in `docs/bilder-eingang/doppler-effekt/` wird nicht gebraucht)
- **Hintergrund:** transparent · **Format:** 2,2 : 1, mind. 1400 × 640 px · **Blick:** exakte Draufsicht, Front nach rechts
> A modern white ambulance van seen exactly from above, orthographic top-down view with no perspective, the front of the vehicle points to the right, white roof with a red stripe along both sides, a blue light bar across the front of the roof, a small roof vent, generic design with no text, no lettering, no cross symbol, no logo, no brand, soft even light from above, no hard shadows, isolated on a fully transparent background, no road, no shadow, photorealistic, clean educational style, no numbers
- **Hinweis:** Generatoren liefern gern eine Seiten- oder Schrägansicht oder schreiben „AMBULANCE“ aufs Dach – beides neu erzeugen.

#### A7 · Thermometer (Glasröhre ohne Skala)
- **Simulationen:** Ganze Zahlen an der Zahlengerade – Thermometer (`mathematik/zahlengerade/index.ts:835` `drawThermo`), Gasgesetze (`physik/gasgesetze/index.ts:1540` `drawThermo`), Teilchenmodell (`physik/teilchenmodell/index.ts:1115` `drawThermo`)
- **Datei:** `src/assets/sims/zahlengerade/thermometer.webp` (Kopien nach `gasgesetze/` und `teilchenmodell/`)
- **Hintergrund:** transparent · **Format:** 1 : 6, mind. 300 × 1800 px · **Blick:** exakte Vorderansicht, senkrecht, Kugel unten
> A single glass liquid thermometer tube standing exactly vertical, exact front view with no perspective, a round glass bulb at the bottom filled with red liquid, above it a long straight empty clear glass capillary with a rounded top end, the capillary contains no liquid at all, clear glass with subtle highlights on the left edge, no mounting board, no scale, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no scale marks, no tick marks
- **Hinweis:** Die rote Säule zeichnet die Simulation (sie steigt und fällt) – im Bild darf nur die Kugel gefüllt sein. Fast immer kommen Striche oder Zahlen mit – dann neu.

#### A8 · Zirkel, in zwei Schenkel zerlegt
- **Simulationen:** Mittelsenkrechte und Winkelhalbierende (`mathematik/mittelsenkrechte/index.ts:1525` `drawCompass`), Besondere Linien im Dreieck (`mathematik/besondere-linien/index.ts:1392`), Dreieckskonstruktion (`mathematik/dreieckskonstruktion/index.ts:1226`)
- **Datei:** `src/assets/sims/mittelsenkrechte/zirkel-teile.webp` (Kopien in die beiden anderen Ordner)
- **Hintergrund:** transparent · **Format:** 4 : 5, mind. 1000 × 1250 px · **Blick:** exakte Vorderansicht, beide Schenkel senkrecht nebeneinander
> A metal school drawing compass taken apart into its two legs, both legs shown separately side by side with a clear gap between them, both exactly vertical, exact front view with no perspective: on the left the needle leg with the round hinge head and the knurled grip on top, steel needle point at the bottom; on the right the second leg with a short yellow pencil clamped at the bottom, sharpened pencil tip pointing down, both legs the same length, chrome-plated metal, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no logo
- **Hinweis:** Ganz wichtig: zwei **getrennte** Teile, beide **senkrecht** (kein geöffneter Zirkel – der feste Öffnungswinkel war beim gelieferten Bild das Problem). Nadel- und Bleistiftspitze müssen gut erkennbar unten enden.

#### A9 · Rundes Zeigerinstrument (Manometer)
- **Simulationen:** Gasgesetze – Manometer (`physik/gasgesetze/index.ts:1397` `drawGauge`), Photoeffekt – Strommesser (`physik/photoeffekt/index.ts:926` `drawAmmeter`), Freier Fall – Anzeige der Vakuumpumpe (`physik/freier-fall/index.ts:751` `drawTube`)
- **Datei:** `src/assets/sims/gasgesetze/manometer.webp` (Kopien nach `photoeffekt/`, `freier-fall/`)
- **Hintergrund:** transparent · **Format:** 1 : 1,15 (hochkant), mind. 1000 × 1150 px · **Blick:** exakte Vorderansicht
> A round analogue pressure gauge seen exactly from the front with no perspective, polished chrome bezel ring, a completely blank plain white dial face with no scale, no numbers, no tick marks and no needle, only a small chrome centre cap in the exact middle, flat glass cover with a soft reflection at the upper left, a short brass threaded connector stem pointing straight down from the bottom of the housing, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Skala und Zeiger zeichnet die Simulation genau um die Mitte – die Mittelkappe muss exakt in der Kreismitte liegen und das Zifferblatt wirklich leer sein.

#### A10 · Frosch (Laufmodell der Zahlengerade)
- **Simulationen:** Ganze Zahlen an der Zahlengerade – Startszene (`mathematik/zahlengerade/figures.ts:29` `drawFrog`)
- **Datei:** `src/assets/sims/zahlengerade/frosch.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 800 × 800 px · **Blick:** exakte Seitenansicht, Blick nach rechts
> A cute friendly green tree frog sitting upright, exact side view in profile facing right, big round golden eyes, smooth bright green skin with a pale belly, hind legs folded under the body, front legs straight, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no ground, no leaf, no shadow, photorealistic but friendly, clean educational style, no text
- **Hinweis:** Genau im Profil, sonst wirkt das Spiegeln (Blick nach links bei Subtraktion) falsch. Das Hüpfen entsteht durch Bewegung des Bildes; ausgestreckte Beine sind nicht nötig.

#### A11 · Pinguin
- **Simulationen:** Zahlengerade – Meeresspiegel (`mathematik/zahlengerade/figures.ts:221` `drawPenguin`, Szene `drawSea` Zeile 913)
- **Datei:** `src/assets/sims/zahlengerade/pinguin.webp`
- **Hintergrund:** transparent · **Format:** 1 : 2 (hochkant), mind. 600 × 1200 px · **Blick:** Seitenansicht, Blick nach rechts
> A single emperor-style penguin standing upright, side view in profile facing right, black back, white belly, soft yellow patch at the neck, flippers held close to the body, feet visible at the bottom, friendly look, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no ice, no snow, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Unter Wasser wird das Bild um 90° gedreht („schwimmt“) – deshalb ganz freigestellt, ohne Eisscholle unter den Füßen.

#### A12 · Eisberg im Querschnitt
- **Simulationen:** Zahlengerade – Meeresspiegel (`mathematik/zahlengerade/index.ts:964`, Eisberg in `drawSea`)
- **Datei:** `src/assets/sims/zahlengerade/eisberg.webp`
- **Hintergrund:** transparent · **Format:** 1 : 2,5 (hochkant), mind. 600 × 1500 px · **Blick:** exakte Seitenansicht (Querschnitt)
> A single iceberg shown in side cross-section, the small pointed part above the water line takes the top fifth of the image, the much larger rounded underwater part below takes the remaining four fifths, a perfectly straight horizontal water line crossing the iceberg exactly at one fifth of the image height from the top, white snowy ice above the line, translucent pale turquoise-blue ice below the line, no water, no sea, no sky, only the iceberg itself, soft even light, isolated on a fully transparent background, photorealistic, clean educational style, no text, no animals
- **Hinweis:** Die Wasserlinie muss im Bild genau waagerecht und deutlich erkennbar sein (sie wird auf die Höhe 0 gelegt). Kein Meer im Bild – das liefert `meer.webp` bzw. B22.

#### A13 · Apfel
- **Simulationen:** Zehnerpotenzen – Apfel (`mathematik/zehnerpotenzen/index.ts:825` `drawApple`), Proportionalität (`mathematik/proportional/index.ts:1017` `drawApple`)
- **Datei:** `src/assets/sims/zehnerpotenzen/apfel.webp` (Kopie nach `proportional/`)
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 800 × 800 px · **Blick:** Seitenansicht, leicht von vorn
> A single fresh shiny red apple with a short brown stem and one small green leaf, side view at eye level, the apple stands upright on its base, smooth skin with a few tiny natural speckles, soft even studio light from the upper left with a gentle highlight, no hard shadows, isolated on a fully transparent background, no table, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Unterkante des Apfels soll gerade auf dem „Boden“ stehen können – nicht schräg liegend.

#### A14 · Flaschenöffner, Seitenansicht
- **Simulationen:** Hebelgesetz – Flaschenöffner (`physik/hebelgesetz/index.ts:1728` `drawOpener`)
- **Datei:** `src/assets/sims/hebelgesetz/flaschenoeffner.webp` (ersetzt die Draufsicht in `docs/bilder-eingang/hebelgesetz/`)
- **Hintergrund:** transparent · **Format:** 5 : 1, mind. 1500 × 300 px · **Blick:** exakte Seitenansicht im Profil, Haken links
> A classic flat stainless steel bottle opener seen exactly from the side in profile, orthographic view with no perspective, so only the thin edge profile is visible: on the left end the curved hook with the small tooth pointing down, then a straight flat steel shank, on the right a black rubber handle grip, the whole opener lying horizontal, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no bottle, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Gebraucht wird das **Profil** (Zahn unter dem Kronkorken, Auflage auf dem Rand) – Generatoren zeigen fast immer die Draufsicht mit dem Loch. Das wäre wieder unbrauchbar.

---

### Priorität B – merkliche Verbesserung

#### B1 · Federkraftmesser (Hülse ohne Skala)
- **Simulationen:** Schiefe Ebene (`physik/schiefe-ebene/index.ts:997` `drawMeter`), Kräfte addieren (`physik/kraefteaddition/index.ts:816` `drawSpringScale`), Hebelgesetz (`physik/hebelgesetz/index.ts:1139` `drawMeter`)
- **Datei:** `src/assets/sims/schiefe-ebene/kraftmesser.webp` (Kopien nach `kraefteaddition/`, `hebelgesetz/`)
- **Hintergrund:** transparent · **Format:** 6 : 1, mind. 1500 × 250 px · **Blick:** exakte Seitenansicht, waagerecht, Haken rechts
> A school spring balance (newton meter) housing lying exactly horizontal, exact orthographic side view, a clear transparent plastic tube with a metal cap and a small ring on the left end, the right end open with a short metal hook sticking out, the inner scale rod is pulled fully in so it is not visible, plain tube without any scale, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no scale marks, no colours other than clear plastic and metal
- **Hinweis:** Die ausfahrende Skalenstange zeichnet die Simulation; die Hülse muss leer und ohne Teilstriche sein. Wird gedreht (entlang Seil bzw. Hang).

#### B2 · Tischkante aus Holz (Labortisch, Vorderansicht)
- **Simulationen:** Tisch bzw. Boden unter den Versuchen: Stöße (`physik/stoesse/index.ts:578` `drawBackground`), Gasgesetze (`physik/gasgesetze/index.ts:742` `drawRoom`), Hebelgesetz (Zeile 865), Hookesches Gesetz (Zeile 527), Federpendel (Zeile 1117), Schiefe Ebene (Zeile 647), Teilchenmodell, Reflexion (Zeile 821), Kräfte addieren (Zeile 912), Waagemodell (`mathematik/waagemodell/index.ts:926`)
- **Datei:** `src/assets/sims/stoesse/tischkante.webp` (Kopien in die anderen Ordner)
- **Hintergrund:** deckend · **Format:** 8 : 1, mind. 2400 × 300 px · **Blick:** exakte Vorderansicht auf die Tischkante
> A long horizontal strip showing the front edge of a light beech wood laboratory table seen exactly from the front at eye level, the top tenth of the image shows the thin bright edge of the table top surface, below it the front face of the thick wooden table top with fine horizontal wood grain, evenly lit from the upper left, no objects, no knots, no scratches, seamless and horizontally tileable, photorealistic, clean educational style, no text
- **Hinweis:** Muss nahtlos kachelbar sein (linker und rechter Rand passen aneinander). Keine Astlöcher – sie würden sich beim Kacheln wiederholen.

#### B3 · Asphalt von oben (Textur)
- **Simulationen:** Kreisbewegung – Kreisbahn der Straße (`physik/kreisbewegung/index.ts:801` `drawCarScene`, auch Glätte „nass, Schnee, Eis“ wird darübergelegt)
- **Datei:** `src/assets/sims/kreisbewegung/asphalt.webp`
- **Hintergrund:** deckend · **Format:** 1 : 1, mind. 1024 × 1024 px · **Blick:** exakte Draufsicht
> Top-down view of plain dark grey road asphalt, fine even grain with tiny light stones, no markings, no cracks, no manholes, evenly lit with no hotspot and no vignette, seamless tileable texture, photorealistic, no text
- **Hinweis:** Wird als Muster in den Ring gelegt; Fahrbahnmarkierungen zeichnet die Simulation.

#### B4 · Experimentierwagen (ohne Räder)
- **Simulationen:** Schiefe Ebene – Wagen (`physik/schiefe-ebene/index.ts:920`, Zweig `body === 'cart'` in `drawBody`)
- **Datei:** `src/assets/sims/schiefe-ebene/wagen.webp`
- **Hintergrund:** transparent · **Format:** 3 : 1, mind. 1200 × 400 px · **Blick:** exakte Seitenansicht
> The body of a small physics laboratory dynamics cart without wheels, exact orthographic side view, a low rectangular blue anodised aluminium chassis with rounded corners, a small metal eyelet on the right end, two small round axle holes near the bottom at one quarter and three quarters of the length, flat top surface, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no wheels, no track, no shadow, photorealistic, clean educational style, no text, no numbers, no logo
- **Hinweis:** Ohne Räder – die drehen sich und kommen aus B5.

#### B5 · Rad des Experimentierwagens
- **Simulationen:** Schiefe Ebene – Wagen (wie B4)
- **Datei:** `src/assets/sims/schiefe-ebene/wagen-rad.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 512 × 512 px · **Blick:** exakte Vorderansicht (Radfläche)
> A single small black rubber wheel of a laboratory cart seen exactly face-on, perfectly circular, a silver metal hub with three short spokes, the wheel fills the square image edge to edge, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, no text
- **Hinweis:** Exakt kreisrund und mittig (wird gedreht). Speichen müssen sichtbar sein, damit man das Rollen erkennt.

#### B6 · Stahlklotz
- **Simulationen:** Schiefe Ebene – Materialien „Stahl auf Stahl“ und „Eis“ (`physik/schiefe-ebene/index.ts:953`, Zweig `mat === 'steel' || mat === 'ice'`)
- **Datei:** `src/assets/sims/schiefe-ebene/klotz-stahl.webp`
- **Hintergrund:** transparent · **Format:** 2,2 : 1, mind. 1100 × 500 px · **Blick:** exakte Seitenansicht
> A rectangular block of brushed stainless steel, exact orthographic side view so only one long side face is visible, aspect ratio 2.2 to 1, fine horizontal brushing lines, slightly rounded edges, a small steel eyelet on the right end face, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no engraving
- **Hinweis:** Öse rechts (zeigt hangaufwärts zum Kraftmesser), wie beim Holzklotz.

#### B7 · Gummiklotz
- **Simulationen:** Schiefe Ebene – Material „Gummi“ (`physik/schiefe-ebene/index.ts:957`, Zweig `mat === 'rubber'`)
- **Datei:** `src/assets/sims/schiefe-ebene/klotz-gummi.webp`
- **Hintergrund:** transparent · **Format:** 2,2 : 1, mind. 1100 × 500 px · **Blick:** exakte Seitenansicht
> A rectangular block of matte black rubber, exact orthographic side view so only one long side face is visible, aspect ratio 2.2 to 1, fine matte rubber texture, slightly rounded edges, a small steel eyelet on the right end face, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Schwarz auf dunklem Hintergrund – die Kanten brauchen etwas Glanzlicht, sonst verschwindet der Klotz im Dunkelmodus.

#### B8 · T-Shirt an der Wäscheleine
- **Simulationen:** Kräfte addieren – Wäscheleine (`physik/kraefteaddition/index.ts:1145` `drawShirt`)
- **Datei:** `src/assets/sims/kraefteaddition/t-shirt.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 800 × 800 px · **Blick:** exakte Vorderansicht
> A single plain red cotton T-shirt hanging flat, exact front view, sleeves slightly spread, the shoulders forming a straight horizontal top line where a clothesline would run, slightly damp with a few soft folds, two small wooden clothes pegs on the shoulders, no print, no label, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no line, no hanger, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Die Leine zeichnet die Simulation: die Schulterlinie muss gerade sein, die Klammern oben auf den Schultern.

#### B9 · Glasflasche mit Kronkorken (Hals)
- **Simulationen:** Hebelgesetz – Flaschenöffner (`physik/hebelgesetz/index.ts:1728` `drawOpener`)
- **Datei:** `src/assets/sims/hebelgesetz/flasche.webp`
- **Hintergrund:** transparent · **Format:** 1 : 2 (hochkant), mind. 600 × 1200 px · **Blick:** exakte Seitenansicht
> The upper part of a brown glass bottle, exact orthographic side view, the image shows the neck and shoulder of the bottle widening towards the bottom edge, a plain red crown cork cap on top seen exactly from the side, no label, glossy brown glass with a soft vertical highlight on the left, soft even studio light from the upper left, no hard shadows, the bottle is cut off at the bottom edge of the image, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo, no brand
- **Hinweis:** Kronkorken genau waagerecht und ohne Aufdruck.

#### B10 · Walnuss
- **Simulationen:** Hebelgesetz – Nussknacker (`physik/hebelgesetz/index.ts:1877` `drawNut`)
- **Datei:** `src/assets/sims/hebelgesetz/walnuss.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 512 × 512 px · **Blick:** Seitenansicht
> A single whole walnut in its shell, side view with the seam running vertically, light brown wrinkled shell, the nut fills most of the square image, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, no text

#### B11 · Nussknacker-Arm
- **Simulationen:** Hebelgesetz – Nussknacker (`physik/hebelgesetz/index.ts:1877` `drawNut`; beide Arme drehen sich beim Zudrücken, deshalb ein Arm, zweimal verwendet)
- **Datei:** `src/assets/sims/hebelgesetz/nussknacker-arm.webp`
- **Hintergrund:** transparent · **Format:** 8 : 1, mind. 2000 × 250 px · **Blick:** exakte Seitenansicht, waagerecht, Gelenk links
> One single arm of a classic lever nutcracker lying exactly horizontal, exact orthographic side view, on the left end a round chrome hinge eye with a hole, then a straight chrome steel bar with a small ribbed gripping section near the hinge, on the right half a cylindrical dark walnut wood handle, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no second arm, no nut, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Nur **ein** Arm (der zweite ist dieselbe Datei, gespiegelt und gedreht). Gelenkauge genau am linken Ende.

#### B12 · Glasrohr mit Endkappen (Fallröhre)
- **Simulationen:** Freier Fall – Fallröhre (`physik/freier-fall/index.ts:751` `drawTube`)
- **Datei:** `src/assets/sims/freier-fall/fallroehre.webp`
- **Hintergrund:** transparent · **Format:** 1 : 7 (hochkant), mind. 300 × 2100 px · **Blick:** exakte Vorderansicht, senkrecht
> A long straight vertical clear glass tube used for the coin-and-feather experiment, exact front view with no perspective, black metal end caps at the top and the bottom, a small valve nipple on the bottom cap pointing to the right, the glass is empty and perfectly clear with subtle vertical highlights at the left and right edges, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no scale, no numbers
- **Hinweis:** Das Glas muss durchsichtig sein (Alpha), sonst verdeckt es Kugel und Feder. Die Simulation streckt nur das gleichförmige Glasstück, Kappen bleiben unverzerrt.

#### B13 · Heizplatte
- **Simulationen:** Gasgesetze (`physik/gasgesetze/index.ts:956` `drawPlate`), Teilchenmodell (`physik/teilchenmodell/index.ts:900` `drawPlate`)
- **Datei:** `src/assets/sims/gasgesetze/heizplatte.webp` (Kopie nach `teilchenmodell/`)
- **Hintergrund:** transparent · **Format:** 6 : 1, mind. 1800 × 300 px · **Blick:** exakte Vorderansicht auf Augenhöhe
> A flat laboratory hot plate seen exactly from the front at eye level, a wide low dark grey metal housing with a black ceramic heating surface on top seen edge-on as a thin line, one small round black control knob on the right of the front panel and a tiny unlit indicator lamp next to it, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no logo, no scale on the knob
- **Hinweis:** Das rote/blaue Glühen beim Heizen und Kühlen zeichnet die Simulation darüber.

#### B14 · Becherglas
- **Simulationen:** Teilchenmodell – Diffusion (`physik/teilchenmodell/index.ts:1997` `drawBeaker`)
- **Datei:** `src/assets/sims/teilchenmodell/becherglas.webp`
- **Hintergrund:** transparent · **Format:** 4 : 5, mind. 1000 × 1250 px · **Blick:** exakte Vorderansicht auf Augenhöhe
> An empty laboratory glass beaker seen exactly from the front at eye level with no perspective, straight cylindrical walls, a small pouring spout on the upper left rim, thick clear borosilicate glass with soft vertical highlights at the edges, completely clear and see-through in the middle, no liquid, no graduation marks, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no scale marks
- **Hinweis:** Das Glas muss in der Mitte **durchsichtig** bleiben (halbtransparente Pixel), denn Wasser und Teilchen liegen dahinter. Keine weißen Teilstriche.

#### B15 · Reiter für die optische Bank
- **Simulationen:** Licht und Schatten (`physik/licht-schatten/index.ts:874` `drawBench`), Linsen (`physik/linsen/index.ts:1205` `drawBench`)
- **Datei:** `src/assets/sims/linsen/reiter.webp` (Kopie nach `licht-schatten/`)
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 600 × 600 px · **Blick:** exakte Seitenansicht
> A single optical bench rider (carriage) seen exactly from the side, orthographic view, a black anodised aluminium sliding block with a short vertical steel post holder on top and a small black thumb screw on the side, the bottom edge straight and horizontal where it sits on the rail, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no rail, no shadow, photorealistic, clean educational style, no text, no numbers, no logo
- **Hinweis:** Darauf sitzen Kerze, Linse, Schirm bzw. Lampe – die Stange oben muss mittig sein.

#### B16 · Profilschiene der optischen Bank
- **Simulationen:** wie B15 (Schiene unter den Reitern; Skala zeichnet die Simulation)
- **Datei:** `src/assets/sims/linsen/optische-bank.webp` (Kopie nach `licht-schatten/`)
- **Hintergrund:** transparent · **Format:** 12 : 1, mind. 2400 × 200 px · **Blick:** exakte Seitenansicht, waagerecht
> A long straight optical bench rail made of black anodised aluminium profile seen exactly from the side, horizontal, a flat top surface with a slight bevel, a subtle groove along the side, small rubber feet at both ends, the profile is perfectly uniform along its length, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no scale marks
- **Hinweis:** Gleichmäßig über die ganze Länge (wird gestreckt). Keine Skala – die liegt gezeichnet darauf.

#### B17 · Glasprisma
- **Simulationen:** Linienspektren (`physik/linienspektren/index.ts:899` `drawPrism`)
- **Datei:** `src/assets/sims/linienspektren/prisma.webp`
- **Hintergrund:** transparent · **Format:** 8 : 7, mind. 800 × 700 px · **Blick:** exakte Ansicht auf die Dreiecksfläche, Spitze oben
> A clear glass equilateral triangular prism seen exactly face-on onto its triangular end, so it appears as an equilateral triangle with the tip pointing straight up and the base horizontal, polished edges with fine bright highlights, the glass is clear and see-through, no light rays, no rainbow, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Keinen Regenbogen erzeugen lassen – die Strahlen und das Spektrum berechnet die Simulation. Gleichseitig, sonst stimmen die Strahlwege nicht.

#### B18 · Stabmagnet
- **Simulationen:** Elektromagnetische Induktion – Magnet und Spule (`physik/induktion/index.ts:448` `drawMagnetScene`)
- **Datei:** `src/assets/sims/induktion/stabmagnet.webp`
- **Hintergrund:** transparent · **Format:** 4 : 1, mind. 1200 × 300 px · **Blick:** exakte Seitenansicht, waagerecht
> A school bar magnet lying exactly horizontal, exact orthographic side view, rectangular with slightly rounded edges, the left half painted glossy green, the right half painted glossy red, the colour boundary exactly in the middle, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no letters N or S, no numbers
- **Hinweis:** Links grün (S), rechts rot (N) – wie in der Simulation. Die Buchstaben schreibt die Simulation (beim Umdrehen des Magneten richtig).

#### B19 · Kupferspule
- **Simulationen:** Elektromagnetische Induktion – Magnet und Spule (`physik/induktion/index.ts:448` `drawMagnetScene`)
- **Datei:** `src/assets/sims/induktion/spule.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1,1 (hochkant), mind. 900 × 1000 px · **Blick:** exakte Seitenansicht, Spulenachse waagerecht
> A cylindrical coil of shiny copper enamelled wire wound on a clear plastic tube, exact orthographic side view with the coil axis horizontal, about twelve visible neat windings, the hollow tube open at both ends so a magnet can pass through, two straight wire ends leaving the coil at the bottom and pointing straight down, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers
- **Hinweis:** Der Magnet fährt durch die Spule – die Mitte muss offen wirken. Die Drahtenden unten führen zum Spannungsmesser.

#### B20 · Zählrohr (Geiger-Müller)
- **Simulationen:** Radioaktiver Zerfall (`physik/radioaktiver-zerfall/index.ts:1236` `drawTube`)
- **Datei:** `src/assets/sims/radioaktiver-zerfall/zaehlrohr.webp`
- **Hintergrund:** transparent · **Format:** 4 : 1, mind. 1200 × 300 px · **Blick:** exakte Seitenansicht, waagerecht, Fenster links
> A Geiger-Mueller counter tube probe lying exactly horizontal, exact orthographic side view, a slim cylindrical brushed metal body, on the left end a thin dark mica window behind a protective mesh, on the right end a black plastic cap with a short cable stub, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo, no warning sign
- **Hinweis:** Wird schräg an das Präparat gelegt; das Kabel zeichnet die Simulation weiter.

#### B21 · Zählgerät mit leerer Anzeige
- **Simulationen:** Radioaktiver Zerfall (`physik/radioaktiver-zerfall/index.ts:1310` `drawCounter`)
- **Datei:** `src/assets/sims/radioaktiver-zerfall/zaehlgeraet.webp`
- **Hintergrund:** transparent · **Format:** 4 : 3, mind. 800 × 600 px · **Blick:** exakte Vorderansicht
> A small school radiation counter unit seen exactly from the front, dark grey plastic housing with rounded corners, a large empty dark rectangular display window in the upper two thirds, below it one small round red push button and one small grey switch, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no digits on the display, no logo
- **Hinweis:** Die grünen Ziffern zeichnet die Simulation ins leere Fenster.

#### B22 · Polarmeer im Querschnitt
- **Simulationen:** Zahlengerade – Meeresspiegel (ersetzt `zahlengerade/meer.webp`, `mathematik/zahlengerade/index.ts:913` `drawSea`)
- **Datei:** `src/assets/sims/zahlengerade/meer.webp` (ersetzt die Datei)
- **Hintergrund:** deckend · **Format:** 1 : 1, mind. 1600 × 1600 px · **Blick:** Seitenansicht, Querschnitt
> Side cross-section view of a calm polar sea, the dark blue water surface is perfectly straight and exactly horizontal at 43 percent of the image height from the top, above it a pale cold sky and a distant low snowy coast on the right, below the surface a clear underwater view fading from turquoise to deep dark blue at the bottom, no animals, no penguins, no icebergs, no boats, evenly lit, photorealistic, no text
- **Hinweis:** Die Wasserlinie muss genau waagerecht und auf etwa 43 % der Höhe liegen (wie beim jetzigen Bild, Zeile 683 von 1600). Kein Eisberg und kein Tier – die kommen aus A11/A12.

#### B23 · Sparschwein
- **Simulationen:** Zahlengerade – Kontostand (`mathematik/zahlengerade/figures.ts:129` `drawPiggy`)
- **Datei:** `src/assets/sims/zahlengerade/sparschwein.webp`
- **Hintergrund:** transparent · **Format:** 4 : 3, mind. 900 × 680 px · **Blick:** exakte Seitenansicht, Blick nach rechts
> A glossy pink ceramic piggy bank standing on four short legs, exact side view in profile facing right, a coin slot on the top of the back, curly tail on the left, friendly painted eye, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no coins, no shadow, photorealistic, clean educational style, no text, no pattern
- **Hinweis:** Genau im Profil (wird gespiegelt). Kein Muster und keine Aufschrift.

#### B24 · Marienkäfer, Seitenansicht
- **Simulationen:** Zehnerpotenzen (`mathematik/zehnerpotenzen/index.ts:758` `drawBug`)
- **Datei:** `src/assets/sims/zehnerpotenzen/marienkaefer.webp`
- **Hintergrund:** transparent · **Format:** 2 : 1, mind. 1000 × 500 px · **Blick:** exakte Seitenansicht, Kopf rechts
> A single seven-spot ladybird walking, exact side view in profile, head pointing to the right, glossy red domed wing cases with black spots, black head with small white patches, thin black legs touching an invisible flat ground line at the bottom, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no leaf, no shadow, photorealistic macro, clean educational style, no text
- **Hinweis:** Beine unten auf einer gedachten waagerechten Linie (Boden). Für die Draufsicht siehe B25.

#### B25 · Marienkäfer, Draufsicht
- **Simulationen:** Maßstab – Vergrößerung (`mathematik/massstab/index.ts:2006` `drawObject`, Objekt `bug`)
- **Datei:** `src/assets/sims/massstab/marienkaefer-oben.webp`
- **Hintergrund:** transparent · **Format:** 4 : 3, mind. 1000 × 750 px · **Blick:** exakte Draufsicht, Kopf rechts
> A single seven-spot ladybird seen exactly from above, top-down view, body axis exactly horizontal with the head pointing to the right, glossy red wing cases with seven black spots, black head with white patches, six thin legs and two short antennae visible, soft even light from above, no hard shadows, isolated on a fully transparent background, no leaf, no shadow, photorealistic macro, clean educational style, no text
- **Hinweis:** Körperachse genau waagerecht – die Simulation misst die Länge von Kopf bis Hinterende.

#### B26 · Sandkorn
- **Simulationen:** Maßstab (`mathematik/massstab/index.ts:2212`, Objekt `sand`), Zehnerpotenzen (`mathematik/zehnerpotenzen/index.ts:717` `drawSand`)
- **Datei:** `src/assets/sims/massstab/sandkorn.webp` (Kopie nach `zehnerpotenzen/`)
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 600 × 600 px · **Blick:** Seitenansicht
> A single grain of quartz sand, strongly magnified macro photograph, irregular rounded shape slightly wider than high, translucent golden-beige colour with tiny facets and soft highlights, the grain fills most of the image, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no other grains, no shadow, photorealistic, no text

#### B27 · Briefmarke (ohne Schrift)
- **Simulationen:** Maßstab – Briefmarke (`mathematik/massstab/index.ts:2145`, Objekt `stamp`)
- **Datei:** `src/assets/sims/massstab/briefmarke.webp`
- **Hintergrund:** transparent · **Format:** 5 : 6 (hochkant), mind. 1000 × 1200 px · **Blick:** exakte Draufsicht
> A single postage stamp seen exactly from above, portrait format, perforated white zigzag edge all around, the printed picture shows a simple friendly mountain landscape with green meadows, grey mountains with snowy tops and a yellow sun in a blue sky, flat and evenly lit, isolated on a fully transparent background, no shadow, photorealistic, no text, no numbers, no country name, no value, no postmark
- **Hinweis:** Briefmarken bekommen fast immer Schrift und Wert – unbedingt ohne (Regel: keine echten Marken, keine Schrift).

#### B28 · Einfamilienhaus
- **Simulationen:** Zehnerpotenzen – Haus (`mathematik/zehnerpotenzen/index.ts:937` `drawHouse`)
- **Datei:** `src/assets/sims/zehnerpotenzen/haus.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 1000 × 1000 px · **Blick:** exakte Vorderansicht (Giebelseite)
> A small detached family house seen exactly from the front gable side with no perspective, cream-coloured plastered walls, a steep red tiled gable roof with a small chimney, a brown wooden front door in the middle, four white windows, the house stands on an invisible flat ground line at the bottom edge, soft daylight from the upper left, no hard shadows, isolated on a fully transparent background, no garden, no trees, no fence, no shadow, photorealistic, clean educational style, no text, no house number
- **Hinweis:** Höhe bis zum First ≈ Bildhöhe (die Simulation setzt 10 m an). Kein Garten oder Zaun.

#### B29 · Berg mit Gipfel (Zugspitze-artig)
- **Simulationen:** Zehnerpotenzen – Zugspitze (`mathematik/zehnerpotenzen/index.ts:1084` `drawPeak`)
- **Datei:** `src/assets/sims/zehnerpotenzen/berg.webp`
- **Hintergrund:** transparent · **Format:** 2 : 1, mind. 2000 × 1000 px · **Blick:** Seitenansicht, Gipfel in der Mitte
> A single rocky alpine mountain seen from the side as a free-standing massif, grey limestone rock faces, snow on the upper slopes, one clear summit exactly in the horizontal centre touching the top edge of the image, slopes running down to a perfectly flat horizontal base line at the bottom edge, soft daylight from the upper left, isolated on a fully transparent background with no sky, no clouds, no buildings, no cable car, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Gipfel oben mittig, Fuß genau waagerecht unten – die Simulation skaliert auf 2962 m Höhe. Keine Gipfelstation (die echte Zugspitze ist bebaut – das stört hier).

#### B30 · Verkehrsflugzeug
- **Simulationen:** Zehnerpotenzen – Flugzeug in 10 km Höhe (`mathematik/zehnerpotenzen/index.ts:1166` `drawPlane`)
- **Datei:** `src/assets/sims/zehnerpotenzen/flugzeug.webp`
- **Hintergrund:** transparent · **Format:** 3 : 1, mind. 1200 × 400 px · **Blick:** exakte Seitenansicht, Nase rechts
> A generic white twin-engine passenger airliner in flight, exact side view in profile, nose pointing to the right, landing gear retracted, plain white fuselage with a light grey belly and a plain blue tail fin, no airline livery, soft daylight from the upper left, isolated on a fully transparent background, no sky, no clouds, no contrails, no shadow, photorealistic, clean educational style, no text, no logo, no registration letters
- **Hinweis:** Keine Airline-Bemalung, keine Kennung.

#### B31 · Raumstation
- **Simulationen:** Zehnerpotenzen – ISS (`mathematik/zehnerpotenzen/index.ts:1213` `drawISS`)
- **Datei:** `src/assets/sims/zehnerpotenzen/raumstation.webp`
- **Hintergrund:** transparent · **Format:** 3 : 2, mind. 1200 × 800 px · **Blick:** Draufsicht von der Erde aus, waagerecht
> A large modular space station seen face-on from below, a long horizontal central truss with large dark blue-gold solar panel wings on both sides, white cylindrical modules in the middle, symmetric arrangement, crisp sunlight from the upper left, isolated on a fully transparent background, no Earth, no stars, no shadow, photorealistic, clean educational style, no text, no flags, no logos
- **Hinweis:** Waagerecht ausgerichtet und ohne Erde im Hintergrund (die zeichnet die Simulation).

#### B32 · Erde mit Europa
- **Simulationen:** Zehnerpotenzen – Erde (`mathematik/zehnerpotenzen/index.ts:1428`, Erdkugel in `drawObjects`)
- **Datei:** `src/assets/sims/zehnerpotenzen/erde.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 1024 × 1024 px · **Blick:** von vorn, Europa und Afrika mittig
> The planet Earth seen from space, Europe and Africa in the centre of the disc, blue oceans, green and brown continents, some white clouds, evenly lit from the front with no night side and no terminator, perfectly round, the globe fills the entire square image edge to edge, isolated on a fully transparent background, photorealistic, no text, no borders, no labels
- **Hinweis:** Anders als `licht-schatten/erde.webp` (Nordpol-Ansicht) hier die bekannte Ansicht mit Europa. Der Kreis muss alle vier Bildkanten berühren.

#### B33 · Laubbaum, Seitenansicht
- **Simulationen:** Strahlensätze – Baumhöhe über den Schatten (`mathematik/strahlensaetze/index.ts:1194` `drawBaum`)
- **Datei:** `src/assets/sims/strahlensaetze/baum.webp`
- **Hintergrund:** transparent · **Format:** 3 : 4, mind. 1200 × 1600 px · **Blick:** Seitenansicht
> A single free-standing deciduous tree in summer, side view at eye level, a straight brown trunk exactly in the horizontal centre, a full round green crown, the bottom of the trunk ends on a perfectly flat horizontal ground line at the bottom edge, the top of the crown touches the top edge of the image, soft daylight from the upper left, isolated on a fully transparent background, no grass, no shadow, no sky, photorealistic, clean educational style, no text
- **Hinweis:** Stamm genau mittig und senkrecht, Krone oben am Bildrand (Spitze = gemessene Baumhöhe). Den Schatten zeichnet die Simulation.

#### B34 · Baumkrone von oben
- **Simulationen:** Sinussatz – Baum am anderen Ufer (`mathematik/sinussatz-kosinussatz/index.ts:1654` `drawTree`), Strahlensätze – Bäume am Teich (`mathematik/strahlensaetze/index.ts:1555` `drawTeich`)
- **Datei:** `src/assets/sims/sinussatz-kosinussatz/baumkrone.webp` (Kopie nach `strahlensaetze/`)
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 600 × 600 px · **Blick:** exakte Draufsicht
> A single round deciduous tree crown seen exactly from above, top-down aerial view, lush green leaves with natural light and dark patches, roughly circular outline, the crown fills the square image, soft daylight, isolated on a fully transparent background, no ground, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Die Mitte der Krone ist der Messpunkt T – bitte rund und mittig.

#### B35 · Urne (Glasgefäß)
- **Simulationen:** Baumdiagramm und Pfadregeln (`mathematik/baumdiagramm/index.ts:516` `drawUrn`)
- **Datei:** `src/assets/sims/baumdiagramm/urne.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 1000 × 1000 px · **Blick:** exakte Vorderansicht
> An empty wide clear glass jar with a wide open top, exact front view at eye level with no perspective, straight walls with rounded lower corners and a slightly narrower neck rim, thick clear glass with soft vertical highlights at both edges, completely clear and see-through in the middle, no lid, no label, no contents, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Muss innen durchsichtig sein – die farbigen Kugeln liegen gezeichnet bzw. als `wellen-ausbreitung/kugel.webp` (eingefärbt) im Glas.

#### B36 · Preisschild (leer)
- **Simulationen:** Prozentstreifen – Rabatt (`mathematik/prozentstreifen/index.ts:728` `drawTag`)
- **Datei:** `src/assets/sims/prozentstreifen/preisschild.webp`
- **Hintergrund:** transparent · **Format:** 3 : 2, mind. 1200 × 800 px · **Blick:** exakte Draufsicht
> A blank kraft paper price tag seen exactly from above, rectangular with two cut corners on the left side, a small reinforced round hole on the left with a short natural twine string, plain beige-brown paper with fine fibre texture, completely empty surface, flat and evenly lit, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no price, no barcode
- **Hinweis:** Preise und der „−25 %“-Sticker kommen von der Simulation. Schräg liegend (wie jetzt) dreht die Simulation selbst.

#### B37 · Taxi, Seitenansicht
- **Simulationen:** Proportionalität – Taxifahrt (`mathematik/proportional/index.ts:1198` `drawTaxi`)
- **Datei:** `src/assets/sims/proportional/taxi.webp`
- **Hintergrund:** transparent · **Format:** 2,6 : 1, mind. 1300 × 500 px · **Blick:** exakte Seitenansicht, Front nach rechts
> A generic light ivory-yellow taxi sedan, exact orthographic side view, front pointing to the right, a small blank yellow roof sign without any text, both wheels visible as perfect circles, simple modern shape that does not resemble any real brand, no logo, no lettering, no phone number, no license plate, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no road, no shadow, photorealistic, clean educational style, no text, no numbers
- **Hinweis:** Dachschild ohne „TAXI“-Schrift (die könnte die Simulation zweisprachig darauf schreiben).

#### B38 · Fahrrad, Seitenansicht
- **Simulationen:** Integral als Gesamtänderung – Radfahrt (`mathematik/aenderungsrate/index.ts:1142` `drawBike`)
- **Datei:** `src/assets/sims/aenderungsrate/fahrrad.webp`
- **Hintergrund:** transparent · **Format:** 5 : 3, mind. 1200 × 720 px · **Blick:** exakte Seitenansicht, Fahrtrichtung rechts
> A simple orange city bicycle without rider, exact orthographic side view, front wheel on the right, both wheels perfectly circular with thin silver spokes and black tyres, straight diamond frame, black saddle, flat handlebar, no basket, no lights, no mudguards, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no ground, no shadow, photorealistic, clean educational style, no text, no logo, no brand
- **Hinweis:** Räder kreisrund (werden gedreht). Keine Person.

#### B39 · Wanduhr ohne Zeiger
- **Simulationen:** Einheiten umrechnen – Zeit (`mathematik/einheiten/index.ts:1634` `drawClock`)
- **Datei:** `src/assets/sims/einheiten/uhr.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 1000 × 1000 px · **Blick:** exakte Vorderansicht
> A round modern wall clock seen exactly from the front, a thin brushed silver metal frame, a plain white clock face with no hands, no numbers and no tick marks, a small silver centre cap in the exact middle, flat glass with a soft reflection at the upper left, the clock fills the square image edge to edge, soft even studio light, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Zeiger, Ziffern und die farbige Minutenfläche zeichnet die Simulation – das Zifferblatt muss leer sein.

#### B40 · Bleistift
- **Simulationen:** Mittelsenkrechte (`mathematik/mittelsenkrechte/index.ts:1682` `drawPencil`), Besondere Linien (`mathematik/besondere-linien/index.ts:1548`), Dreieckskonstruktion (`mathematik/dreieckskonstruktion/index.ts:1385`)
- **Datei:** `src/assets/sims/mittelsenkrechte/bleistift.webp` (Kopien in die beiden anderen Ordner)
- **Hintergrund:** transparent · **Format:** 10 : 1, mind. 2000 × 200 px · **Blick:** exakte Seitenansicht, waagerecht, Spitze links
> A single new yellow hexagonal wooden pencil lying exactly horizontal, exact orthographic side view, sharpened graphite tip pointing to the left, natural wood cone, on the right end a silver metal ferrule with a pink eraser, plain yellow lacquer, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no brand, no lettering
- **Hinweis:** Die Spitze ist der Zeichenpunkt – sie muss genau am linken Bildrand enden.

#### B41 · Geodreieck (ohne Skala)
- **Simulationen:** Winkel schätzen und messen (`mathematik/winkel-messen/index.ts:853` `drawGeo`), Koordinatensystem – Geodreieck anlegen (`mathematik/koordinaten-lage/index.ts:1170` `drawGeo`)
- **Datei:** `src/assets/sims/winkel-messen/geodreieck.webp` (Kopie nach `koordinaten-lage/`)
- **Hintergrund:** transparent · **Format:** 2 : 1, mind. 1600 × 800 px · **Blick:** exakte Draufsicht, lange Seite unten waagerecht
> A transparent plastic set square shaped as a right isosceles triangle, exact top-down view, the long side horizontal at the bottom and the right angle pointing straight up, clear slightly bluish acrylic with polished bright edges, a small round grip hole near the top corner, completely without any scale, marks, numbers or lines, flat and evenly lit, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Die Skala muss die Simulation zeichnen (exakt) – ein Bild mit aufgedruckter Skala ist unbrauchbar. Das Plastik muss durchsichtig bleiben (Papier und Winkel darunter sichtbar).

#### B42 · Leiter
- **Simulationen:** Sinus, Kosinus, Tangens – Leiter anlehnen (`mathematik/sin-cos-tan-dreieck/index.ts:1683` `drawLadder`)
- **Datei:** `src/assets/sims/sin-cos-tan-dreieck/leiter.webp`
- **Hintergrund:** transparent · **Format:** 1 : 8 (hochkant), mind. 300 × 2400 px · **Blick:** exakte Vorderansicht, senkrecht
> A single straight aluminium ladder standing exactly vertical, exact front view with no perspective, two parallel silver side rails and twelve evenly spaced flat rungs, grey rubber feet at the bottom, the ladder fills the image height edge to edge, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no wall, no shadow, photorealistic, clean educational style, no text, no labels, no warning stickers
- **Hinweis:** Wird gedreht und auf die Leiterlänge skaliert; Sprossen gleich weit auseinander.

#### B43 · Rollstuhl, Seitenansicht
- **Simulationen:** Sinus, Kosinus, Tangens – Rollstuhlrampe (`mathematik/sin-cos-tan-dreieck/index.ts:1639` `drawWheelchair`)
- **Datei:** `src/assets/sims/sin-cos-tan-dreieck/rollstuhl.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 800 × 800 px · **Blick:** exakte Seitenansicht, Blick nach rechts
> An empty modern manual wheelchair, exact orthographic side view facing right, large rear wheel with a silver push rim as a perfect circle, small front caster wheel on the right, black seat and backrest, silver frame, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no person, no ground, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Ohne Person (Regel). Großes Rad exakt kreisrund – es rollt die Rampe hinauf.

#### B44 · Würfel von oben (ohne Augen)
- **Simulationen:** Gesetz der großen Zahlen – Ergebnis-Draufsicht (`mathematik/gesetz-grosse-zahlen/index.ts:254` `drawDie`; bisher nur gezeichnet, Foto `wuerfel.webp` ist schräg)
- **Datei:** `src/assets/sims/gesetz-grosse-zahlen/wuerfel-oben.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 800 × 800 px · **Blick:** exakte Draufsicht
> A single white plastic game die seen exactly from above, top-down view so only the top face is visible as a square with evenly rounded edges and corners, completely blank faces without any pips, soft even studio light from the upper left with a gentle highlight on the edges, the die fills most of the square image, isolated on a fully transparent background, no table, no shadow, photorealistic, clean educational style, no text, no numbers
- **Hinweis:** Augen zeichnet die Simulation. Keine Seitenflächen sichtbar (genau senkrecht von oben).

#### B45 · Fadenstrahlrohr mit Helmholtzspulen
- **Simulationen:** Lorentzkraft – Fadenstrahlrohr (`physik/lorentzkraft/index.ts:383` `drawScene`)
- **Datei:** `src/assets/sims/lorentzkraft/fadenstrahlrohr.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 1600 × 1600 px · **Blick:** exakte Vorderansicht entlang der Spulenachse
> A fine beam tube physics apparatus seen exactly from the front along the coil axis, a large clear empty glass sphere in the centre, behind it one large ring-shaped Helmholtz coil wound with copper wire whose ring surrounds the sphere concentrically, a short glass neck with the electron gun base pointing down to a dark grey stand at the bottom, the inside of the sphere is empty and dark, no glowing beam, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no scale, no labels
- **Hinweis:** Kein leuchtender Strahl im Bild (Radius stellt die Simulation ein). Kugel und Spulenring genau konzentrisch.

#### B46 · Schwingungserreger
- **Simulationen:** Stehende Wellen – Seil am Erreger (`physik/stehende-wellen/index.ts:939` `drawDriver`)
- **Datei:** `src/assets/sims/stehende-wellen/erreger.webp`
- **Hintergrund:** transparent · **Format:** 4 : 5, mind. 800 × 1000 px · **Blick:** exakte Vorderansicht
> A school mechanical wave driver (vibration generator) seen exactly from the front, a compact dark grey metal box with a ventilation grille, a short vertical steel drive pin sticking straight up out of the top centre, two small banana sockets on the front, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no string, no cable, no shadow, photorealistic, clean educational style, no text, no logo, no scale
- **Hinweis:** Am Stift oben wird das Seil befestigt – der Stift muss oben mittig sein.

#### B47–B54 · Gegenstände für den Leitertest (8 Bilder)
- **Simulationen:** Einfacher Stromkreis – „Leiter oder Nichtleiter?“ (`physik/einfacher-stromkreis/index.ts:2085` `drawObject`; liegen im Kasten `drawTray` Zeile 2904 und zwischen den Krokodilklemmen)
- **Ablage:** alle in `src/assets/sims/einfacher-stromkreis/`
- **Hintergrund:** transparent · **Blick:** exakte Draufsicht, Gegenstand **waagerecht** (Längsachse von links nach rechts), füllt die Bildbreite
- **Gemeinsamer Hinweis:** Die Simulation klemmt die Gegenstände an beiden Enden zwischen zwei Klemmen – sie müssen genau waagerecht liegen und die Bildbreite randlos ausfüllen. Seitenverhältnisse wie unten (aus `OBJ_THICK` im Code), damit sie in die Kästchen passen.

| ID | Datei | Format, mind. | Prompt |
| --- | --- | --- | --- |
| B47 | `bueroklammer.png` | 3 : 1, 900 × 300 | A single silver steel paper clip lying flat, exact top-down view, its long axis exactly horizontal, the clip fills the image width edge to edge, shiny wire with soft highlights, soft even light from the upper left, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text |
| B48 | `muenze.png` | 1 : 1, 600 × 600 | A plain copper-coloured coin seen exactly from above, perfectly round, a raised rim and a smooth blank centre without any symbol, the coin fills the square image edge to edge, soft even light from the upper left, isolated on a fully transparent background, no shadow, photorealistic, no text, no numbers, no real currency |
| B49 | `alufolie.png` | 10 : 3, 1000 × 300 | A small folded strip of crinkled aluminium kitchen foil lying flat, exact top-down view, long axis exactly horizontal, rectangular strip with many fine shiny wrinkles and bright reflections, the strip fills the image width edge to edge, soft even light from the upper left, isolated on a fully transparent background, no shadow, photorealistic, no text |
| B50 | `bleistiftmine.png` | 14 : 1, 1400 × 100 | A single thin black graphite pencil lead refill lying exactly horizontal, exact top-down view, dark grey slightly metallic graphite with a soft sheen, the lead fills the image width edge to edge, isolated on a fully transparent background, no shadow, photorealistic, no text |
| B51 | `holzstab.png` | 7 : 1, 1400 × 200 | A single straight round wooden dowel rod of light beech wood lying exactly horizontal, exact top-down view, fine lengthwise grain, flat cut ends, the rod fills the image width edge to edge, soft even light from the upper left, isolated on a fully transparent background, no shadow, photorealistic, no text |
| B52 | `radiergummi.png` | 2,4 : 1, 960 × 400 | A single rectangular white and blue school eraser lying flat, exact top-down view, long axis exactly horizontal, slightly rounded corners, plain without any print, the eraser fills the image width edge to edge, soft even light from the upper left, isolated on a fully transparent background, no shadow, photorealistic, no text, no logo, no brand |
| B53 | `kunststofflineal.png` | 4,5 : 1, 1350 × 300 | A short clear transparent plastic school ruler lying flat, exact top-down view, long axis exactly horizontal, slightly bluish clear acrylic with polished edges, completely without scale, numbers or marks, the ruler fills the image width edge to edge, soft even light from the upper left, isolated on a fully transparent background, no shadow, photorealistic, no text |
| B54 | `glasstab.png` | 9 : 1, 1350 × 150 | A single solid clear glass rod lying exactly horizontal, exact top-down view, round cross-section with fire-polished rounded ends, bright highlights along the top edge, the rod fills the image width edge to edge, soft even light from the upper left, isolated on a fully transparent background, no shadow, photorealistic, no text |

Hinweis: Durchsichtige Gegenstände (Lineal, Glasstab) brauchen echte Halbtransparenz. Alle ohne Aufdruck.

#### B55 · Krokodilklemme
- **Simulationen:** Einfacher Stromkreis – Leitertest (`physik/einfacher-stromkreis/index.ts:2025` `drawClamp`, zwei Klemmen, eine rot, eine schwarz – die Farbe legt die Simulation darüber)
- **Datei:** `src/assets/sims/einfacher-stromkreis/krokodilklemme.webp`
- **Hintergrund:** transparent · **Format:** 4 : 1, mind. 1200 × 300 px · **Blick:** exakte Seitenansicht, waagerecht, Maul rechts
> A single crocodile clip (alligator clip) with a light grey plastic insulating sleeve, exact orthographic side view lying horizontal, the serrated steel jaws on the right end slightly open, the sleeve on the left end where the cable enters, the cable itself not shown, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Hülle hellgrau (wird rot bzw. schwarz eingefärbt). Die linke Klemme ist dieselbe Datei gespiegelt.

#### B56 · Tischtennisball
- **Simulationen:** Schiefer Wurf – Wurfkörper „Tischtennisball“ bei Luftreibung (`physik/schiefer-wurf/index.ts:1062` `drawBall`, Objekt `tt`)
- **Datei:** `src/assets/sims/schiefer-wurf/tischtennisball.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 256 × 256 px · **Blick:** beliebig (Kugel)
> A single plain white table tennis ball, perfectly round, the ball fills the entire square image edge to edge, matte surface with a soft highlight at the upper left, no seam visible, isolated on a fully transparent background, no shadow, photorealistic, no text, no logo, no stars
- **Hinweis:** Wird sehr klein (ca. 18 px) gezeichnet – rund und randlos, ohne Aufdruck.

#### B57 · Stoßkugel
- **Simulationen:** Schiefer Wurf – Wurfkörper „Stoßkugel“ (`physik/schiefer-wurf/index.ts:1062` `drawBall`, Objekt `kugel`)
- **Datei:** `src/assets/sims/schiefer-wurf/stosskugel.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 256 × 256 px · **Blick:** beliebig (Kugel)
> A single cast iron shot put ball, perfectly round, dark graphite grey slightly rough metal surface with a soft highlight at the upper left, the ball fills the entire square image edge to edge, isolated on a fully transparent background, no shadow, photorealistic, no text, no logo
- **Hinweis:** Rund, randlos; nicht verwechseln mit der polierten Stahlkugel (`freier-fall/kugel.webp`).

---

### Priorität C – nett

#### C1–C3 · Oberflächen der schiefen Ebene (Stahl, Gummi, Eis)
- **Simulationen:** Schiefe Ebene – Materialien (`physik/schiefe-ebene/index.ts:623`, Ebene in `drawScene` Zeile 636; für Holz gibt es schon `brett.webp`)
- **Ablage:** `src/assets/sims/schiefe-ebene/` · **Hintergrund:** deckend · **Format:** 10 : 1, mind. 2400 × 240 px · **Blick:** exakte Seitenansicht auf die Kante einer Platte
- **Gemeinsamer Hinweis:** wie `brett.webp`: wird entlang der Schräge gedreht und gespiegelt gekachelt – nahtlos, gleichmäßig, ohne Flecken.

| ID | Datei | Prompt |
| --- | --- | --- |
| C1 | `brett-stahl.png` | A long horizontal strip showing the edge of a brushed stainless steel plate seen exactly from the side, fine horizontal brushing lines, a thin bright highlight along the top edge, evenly lit, seamless horizontally tileable, photorealistic, no text, no scratches |
| C2 | `brett-gummi.png` | A long horizontal strip showing the edge of a thick black rubber mat seen exactly from the side, fine matte rubber texture, a faint grey highlight along the top edge, evenly lit, seamless horizontally tileable, photorealistic, no text, no pattern |
| C3 | `brett-eis.png` | A long horizontal strip showing the edge of a smooth clear ice slab seen exactly from the side, pale blue-white translucent ice with a few tiny air bubbles, a bright glossy highlight along the top edge, evenly lit, seamless horizontally tileable, photorealistic, no text, no snow |

#### C4 · Pipette mit Gummihütchen
- **Simulationen:** Teilchenmodell – Tinte eintropfen (`physik/teilchenmodell/index.ts:2144` `drawPipettes`)
- **Datei:** `src/assets/sims/teilchenmodell/pipette.webp`
- **Hintergrund:** transparent · **Format:** 1 : 6 (hochkant), mind. 200 × 1200 px · **Blick:** exakte Seitenansicht, Spitze unten
> A single glass dropper pipette standing exactly vertical, exact side view, a red rubber bulb on top, a straight clear glass tube tapering to a fine tip pointing straight down, the glass is empty and clear, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no drop, no shadow, photorealistic, clean educational style, no text, no scale marks
- **Hinweis:** Leer – den Tropfen und die Tinte zeichnet die Simulation.

#### C5 · Umlenkrolle mit Tischklemme
- **Simulationen:** Stehende Wellen – Seil über die Rolle (`physik/stehende-wellen/index.ts:988` `drawPulley`; das Gewicht daran: `federpendel/gewicht.webp` mitnutzen, siehe unten)
- **Datei:** `src/assets/sims/stehende-wellen/umlenkrolle.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 600 × 600 px · **Blick:** exakte Seitenansicht, Rolle oben
> A small laboratory pulley wheel mounted on a short metal rod with a table clamp, exact side view, the pulley disc seen face-on as a perfect circle with a groove ring and a central axle, light grey aluminium, the clamp at the bottom, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no string, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Rolle kreisrund und mittig über der Stange.

#### C6 · Zielscheibe auf Pfosten
- **Simulationen:** Schiefer Wurf – Zielwurf (`physik/schiefer-wurf/index.ts:1189` `drawTarget`)
- **Datei:** `src/assets/sims/schiefer-wurf/zielscheibe.webp`
- **Hintergrund:** transparent · **Format:** 1 : 2 (hochkant), mind. 500 × 1000 px · **Blick:** exakte Vorderansicht
> A round target board with red and white concentric rings and a red bullseye, exact front view, mounted on a short wooden post that ends on a flat ground line at the bottom edge, soft daylight from the upper left, no hard shadows, isolated on a fully transparent background, no grass, no arrows, no shadow, photorealistic, clean educational style, no text, no numbers
- **Hinweis:** Die Mitte der Scheibe ist der Zielpunkt; die Simulation staucht das Bild bei Bedarf in die Breite (Schrägblick).

#### C7 · Gestell einer Spielplatz-Wippe
- **Simulationen:** Hebelgesetz – Wippe (`physik/hebelgesetz/index.ts:2041` `drawSeesaw`; das Brett ist `schiefe-ebene/brett.webp`, Kinder bleiben gezeichnet)
- **Datei:** `src/assets/sims/hebelgesetz/wippe-gestell.webp`
- **Hintergrund:** transparent · **Format:** 4 : 3, mind. 800 × 600 px · **Blick:** exakte Seitenansicht
> The metal support stand of a playground seesaw without the board, exact orthographic side view, a sturdy A-shaped frame of orange powder-coated steel tubes with a horizontal pivot bearing at the very top centre, the feet standing on a flat ground line at the bottom edge, soft daylight from the upper left, no hard shadows, isolated on a fully transparent background, no board, no children, no grass, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Das Drehlager oben mittig ist die Drehachse.

#### C8 · Ziegelwand (Textur, Vorderansicht)
- **Simulationen:** Sinus, Kosinus, Tangens – Leiter an der Hauswand (`mathematik/sin-cos-tan-dreieck/index.ts:1705`)
- **Datei:** `src/assets/sims/sin-cos-tan-dreieck/ziegelwand.webp`
- **Hintergrund:** deckend · **Format:** 1 : 1, mind. 1024 × 1024 px · **Blick:** exakte Vorderansicht
> Front view of a plain red clay brick wall in a regular running bond pattern, light grey mortar joints, perfectly straight horizontal rows, evenly lit with no shadows, no windows, no graffiti, seamless tileable texture, photorealistic, no text
- **Hinweis:** Nicht verwechseln mit `extremwert-parabel/mauer.webp` (Mauerkrone von oben).

#### C9 · Fluchtstab
- **Simulationen:** Strahlensätze – Baumhöhe (`mathematik/strahlensaetze/index.ts:1194` `drawBaum`, Stab bei Z)
- **Datei:** `src/assets/sims/strahlensaetze/fluchtstab.webp`
- **Hintergrund:** transparent · **Format:** 1 : 15 (hochkant), mind. 120 × 1800 px · **Blick:** exakte Vorderansicht, senkrecht
> A single surveying ranging pole standing exactly vertical, exact front view, a slim round pole painted in alternating red and white bands of equal length, a pointed steel tip at the bottom, soft daylight from the upper left, isolated on a fully transparent background, no ground, no shadow, photorealistic, no text, no numbers
- **Hinweis:** Gleich lange Farbbänder; die Spitze unten ist der Fußpunkt.

#### C10 · Lupe
- **Simulationen:** Dezimalbrüche – Lupe (`mathematik/dezimalbrueche/index.ts:1295` `drawLupe`), Maßstab – Lupe im Bild „In Wirklichkeit“ (`mathematik/massstab/index.ts:2355` `drawZoomScene`)
- **Datei:** `src/assets/sims/dezimalbrueche/lupe.webp` (Kopie nach `massstab/`)
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 800 × 800 px · **Blick:** exakte Vorderansicht, Griff nach rechts unten
> A classic round magnifying glass seen exactly from the front, a thin polished black frame ring, the handle pointing diagonally to the lower right at 45 degrees, black handle with a silver collar, the lens itself completely clear and see-through with only a faint reflection arc at the upper left, soft even studio light, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Das Glas muss durchsichtig sein – die vergrößerten Inhalte zeichnet die Simulation hinein.

#### C11 · Zahlenschloss
- **Simulationen:** Zählprinzip – Zahlenschloss (`mathematik/zaehlprinzip/index.ts:1446`)
- **Datei:** `src/assets/sims/zaehlprinzip/zahlenschloss.webp`
- **Hintergrund:** transparent · **Format:** 3 : 2, mind. 900 × 600 px · **Blick:** exakte Vorderansicht
> A brass combination padlock with four blank number wheels in a row, exact front view, a silver steel shackle on top, the four rolling wheels are completely blank without digits, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no logo
- **Hinweis:** Die Ziffern (bzw. „?“) schreibt die Simulation auf die vier Rädchen.

#### C12 · Eiswaffel
- **Simulationen:** Zählprinzip – Eistüte (`mathematik/zaehlprinzip/index.ts:1414`)
- **Datei:** `src/assets/sims/zaehlprinzip/waffel.webp`
- **Hintergrund:** transparent · **Format:** 2 : 3 (hochkant), mind. 600 × 900 px · **Blick:** Vorderansicht, Spitze unten
> An empty crisp golden ice cream wafer cone standing upright with the tip pointing down, front view, diamond waffle pattern, the open top rim horizontal, no ice cream, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Leer – die Kugeln (Sorten in Farben) zeichnet die Simulation darauf.

#### C13 · Kassenbon (leer)
- **Simulationen:** Prozentstreifen – Mehrwertsteuer (`mathematik/prozentstreifen/index.ts:832` `drawReceipt`)
- **Datei:** `src/assets/sims/prozentstreifen/kassenbon.webp`
- **Hintergrund:** transparent · **Format:** 4 : 3, mind. 1000 × 750 px · **Blick:** exakte Draufsicht
> A blank white thermal paper till receipt lying flat, exact top-down view, slightly curled, a torn zigzag lower edge, completely empty with no printing, faint paper texture, evenly lit, isolated on a fully transparent background, no shadow, photorealistic, no text, no numbers, no barcode, no logo
- **Hinweis:** Die Zeilen „Netto, MwSt, Summe“ schreibt die Simulation.

#### C14 · Sparbuch (aufgeschlagen, leer)
- **Simulationen:** Prozentstreifen – Zinsen (`mathematik/prozentstreifen/index.ts:883` `drawBook`)
- **Datei:** `src/assets/sims/prozentstreifen/sparbuch.webp`
- **Hintergrund:** transparent · **Format:** 4 : 3, mind. 1000 × 750 px · **Blick:** exakte Draufsicht
> A small open savings passbook lying flat, exact top-down view, dark teal cover visible around the edges, a single cream-coloured page with faint empty ruled lines, completely blank with no writing, evenly lit, isolated on a fully transparent background, no shadow, photorealistic, no text, no numbers, no bank logo
- **Hinweis:** Keine Bank, keine Schrift.

#### C15 · Farbeimer
- **Simulationen:** Ähnliche Figuren – Lack verteilen (`mathematik/vergroessern/index.ts:2196`)
- **Datei:** `src/assets/sims/vergroessern/farbeimer.webp`
- **Hintergrund:** transparent · **Format:** 1 : 1, mind. 600 × 600 px · **Blick:** Vorderansicht, leicht von oben
> A closed metal paint bucket with a wire handle, front view slightly from above, plain silver tin with a wide plain red band around the middle, no label, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no paint drips, no shadow, photorealistic, clean educational style, no text, no logo
- **Hinweis:** Der rote Streifen trägt die Farbe der Lackfläche – ohne Etikett.

#### C16 · Wolke
- **Simulationen:** Zehnerpotenzen – Himmel (`mathematik/zehnerpotenzen/index.ts:507` `drawClouds`), Bewegungsdiagramme – Himmel (`physik/bewegungsdiagramme/index.ts:765`)
- **Datei:** `src/assets/sims/zehnerpotenzen/wolke.webp` (Kopie nach `bewegungsdiagramme/`)
- **Hintergrund:** transparent · **Format:** 2 : 1, mind. 1200 × 600 px · **Blick:** Seitenansicht
> A single soft white fluffy cumulus cloud, side view, flat bottom and rounded billowing top, gentle grey shading at the bottom, isolated on a fully transparent background with soft natural edges, no sky, no sun, photorealistic, no text
- **Hinweis:** Weiche Ränder mit echter Transparenz; wird mehrfach, gespiegelt und verschieden groß benutzt.

#### C17 · Fußballfeld von schräg oben
- **Simulationen:** Zehnerpotenzen – Fußballfeld (`mathematik/zehnerpotenzen/index.ts:1008` `drawField`)
- **Datei:** `src/assets/sims/zehnerpotenzen/fussballfeld.webp`
- **Hintergrund:** transparent · **Format:** 5 : 1, mind. 2000 × 400 px · **Blick:** von schräg oben (ca. 15°), Längsseite waagerecht
> A full football pitch seen from a low elevated angle of about 15 degrees from the long side, the long side lines perfectly horizontal, striped mown green grass, white pitch markings with centre circle and both penalty areas, two white goals at the left and right ends, no stadium, no stands, no people, isolated on a fully transparent background, photorealistic, clean educational style, no text, no logos, no advertising
- **Hinweis:** Die Simulation legt den Maßpfeil an die vordere Seitenlinie – die beiden vorderen Eckpunkte müssen klar erkennbar sein.

#### C18 · Tafel Schokolade (volle Auflösung) – vorerst nicht erzeugen
- **Simulationen:** Bruchteile – mögliche vierte Darstellung (`mathematik/bruchteile/index.ts`; bräuchte eigene Teilungslogik, siehe `docs/BILDER.md` „Nicht eingebaute Bilder“)
- **Datei:** `src/assets/sims/bruchteile/schokolade.webp`
- **Hintergrund:** deckend · **Format:** 3 : 2, mind. 1500 × 1000 px · **Blick:** exakte Draufsicht
> A bar of milk chocolate seen exactly from above, 6 by 4 rectangular pieces with deep straight grooves, all pieces exactly equal, unwrapped, no brand, no embossing, evenly lit, the bar fills the entire image edge to edge, photorealistic, no text
- **Hinweis:** Das gelieferte Bild ist mit 441 × 245 px zu klein. Nur erzeugen, wenn die vierte Darstellung gebaut werden soll.

#### C19 · Zarter Baum (Hintergrund des Faktorbaums) – vorerst nicht erzeugen
- **Simulationen:** Primfaktoren – Faktorbaum (`mathematik/primfaktoren/index.ts`, Ansicht „Faktorbaum“, `drawTree`)
- **Datei:** `src/assets/sims/primfaktoren/baum-zart.webp`
- **Hintergrund:** transparent · **Format:** 4 : 3, mind. 1600 × 1200 px · **Blick:** Vorderansicht, Stamm unten mittig
> A delicate stylised tree with a short trunk at the bottom centre and bare thin branches spreading upwards and outwards, very light soft green watercolour style, extremely subtle and pale, no leaves, isolated on a fully transparent background, no ground, no text
- **Hinweis:** Muss sehr blass sein – der Faktorbaum (Kreise, Linien) liegt darüber und darf nicht untergehen.

#### C20 · Rechtwinkliges Holzbrett
- **Simulationen:** Extremwertaufgaben – Dreiecksbrett (`mathematik/extremwert-parabel/index.ts`, Situation „tri“, `drawTri`; ersetzt `holzdreieck.webp`, das nur als Maserung ausgeschnitten wird)
- **Datei:** `src/assets/sims/extremwert-parabel/holzdreieck.webp` (ersetzt)
- **Hintergrund:** transparent · **Format:** 4 : 3, mind. 1600 × 1200 px · **Blick:** exakte Draufsicht
> Top-down view of a right-angled triangular plywood board, the right angle at the bottom left, the two legs exactly horizontal and vertical along the bottom and left image edges, warm light birch plywood with clearly visible grain, clean straight cut edges, evenly lit, isolated on a fully transparent background, no shadow, photorealistic, no text
- **Hinweis:** Rechter Winkel genau unten links, Katheten an den Bildrändern.

#### C21 · Gebürstetes Blech
- **Simulationen:** Extremwertaufgaben – Regenrinne (`mathematik/extremwert-parabel/index.ts`, Situation „gutter“; ersetzt `blech.webp` mit hellem Lichtfleck)
- **Datei:** `src/assets/sims/extremwert-parabel/blech.webp` (ersetzt)
- **Hintergrund:** deckend · **Format:** 3 : 1, mind. 1200 × 400 px · **Blick:** Draufsicht
> A flat sheet of brushed galvanised steel, fine horizontal brushing lines and a subtle spangle pattern, evenly lit with no hotspot and no reflections, seamless, photorealistic, no text, no scratches
- **Hinweis:** Gleichmäßig hell – der Lichtfleck des alten Bildes ist der Grund für den Ersatz.

#### C22 · Kerze ohne Flamme
- **Simulationen:** Reflexion, Linsen (`physik/reflexion/index.ts:1577` `drawFigure` bzw. Kerze, `physik/linsen/index.ts` Kerze auf der Bank; ersetzt `kerze.webp`, dessen Flamme abgeschnitten wird)
- **Datei:** `src/assets/sims/reflexion/kerze.webp` (ersetzt; Kopie nach `linsen/`)
- **Hintergrund:** transparent · **Format:** 1 : 4,4 (hochkant), mind. 300 × 1300 px · **Blick:** exakte Vorderansicht
> A single white wax pillar candle, exact front view, straight cylindrical shaft, slightly melted rounded top edge, a short black wick sticking straight up from the top centre, no flame, unlit, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no holder, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Nur sinnvoll, wenn das jetzige Bild stört – die Flamme zeichnet die Simulation ohnehin.

#### C23 · Kompakter Holzklotz
- **Simulationen:** Schiefe Ebene – Holz auf Holz (`physik/schiefe-ebene/index.ts:901` `drawBody`; ersetzt `holzklotz.webp`, aus dem jetzt ein Mittelstück herausgeschnitten wird)
- **Datei:** `src/assets/sims/schiefe-ebene/holzklotz.webp` (ersetzt)
- **Hintergrund:** transparent · **Format:** 2,2 : 1, mind. 1100 × 500 px · **Blick:** exakte Seitenansicht
> A rectangular wooden block of light oak, exact orthographic side view so only one long side face is visible, aspect ratio 2.2 to 1, visible natural grain, a small metal eyelet on the right end face, soft even studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text
- **Hinweis:** Gleiches Format wie B6/B7, damit alle Klötze gleich groß wirken.

---

## Liegt bereit, nur einbauen (aus `docs/bilder-eingang/`)

| Datei im Eingang | Einbau | Hinweis |
| --- | --- | --- |
| `hookesches-gesetz/massstab.webp` (140 × 1177, transparent) | Hookesches Gesetz, Maßstab neben der Feder (`physik/hookesches-gesetz/index.ts:616`); auch Federpendel (`physik/federpendel/index.ts:1048` `drawRuler`) | Nur als Körper: die Teilstriche des Fotos sind nicht exakt gleichmäßig, Skala und Zahlen zeichnet weiter die Simulation (wie beim Holzlineal des freien Falls nur den strichfreien Mittelstreifen verwenden). Weiße Kunststoff-Optik statt des jetzigen gelben Holzes. |

Alle übrigen Dateien im Eingang sind geprüft und **nicht** einbaufähig (Gründe in `docs/BILDER.md`, Abschnitt „Nicht eingebaute Bilder“): Karopapier (6 ×), `umfang-flaeche/karopapier`, `quader-volumen/holz`, `cavalieri/muenze` und `spielkarte`, `stellenwerte/plaettchen`, `quadratische-funktion/brunnen`, `sinusfunktion/riesenrad`, `schiefer-wurf/kanone` (keine Abwurfstelle mit festem Rohrwinkel), `bruchteile/schokolade` (zu klein, siehe C18). Ersetzt durch neue Prompts oben: `doppler-effekt/krankenwagen` → A6, `hebelgesetz/flaschenoeffner` → A14, `stoesse/gleiter` → A3, `mittelsenkrechte/zirkel` → A8. `hookesches-gesetz/gewicht.webp` ist byte-gleich mit `src/assets/sims/federpendel/gewicht.webp` und kann gelöscht werden.

## Vorhandene Bilder, die weitere Simulationen mitnutzen können (kein neues Bild nötig)

Beim Einbau einfach die Datei in den Ordner der Simulation kopieren (Regel: jede Datei in `src/assets/sims/<id>/` muss dort deklariert und in `docs/BILDER.md` stehen).

| Vorhandenes Bild | Zusätzlich nutzbar in |
| --- | --- |
| `extremwert-parabel/wiese.webp` | Kreisbewegung, Rasen um die Kreisbahn (`physik/kreisbewegung/index.ts:801`); Sinussatz – Lagepläne (`mathematik/sinussatz-kosinussatz/index.ts`); Strahlensätze – Teich (`mathematik/strahlensaetze/index.ts:1555`) |
| `exponentielles-wachstum/teich.webp` | Strahlensätze – Teich und Sinussatz – See (`drawTeich` 1555, `drawLake` 1875), falls die Uferpunkte A, B auf die Ellipse des Fotos gelegt werden können |
| `freier-fall/kugel.webp` | Kreisbewegung – Stahlkugel an der Schnur (`physik/kreisbewegung/index.ts:654` `drawSteelBall`) |
| `brechung/laser.webp` | Doppelspalt und Gitter – Laser (`physik/doppelspalt/index.ts:378` `drawSetup`) |
| `licht-schatten/lampe.webp` | Linienspektren – Lampe „weißes Licht“ (`physik/linienspektren/index.ts:1035`); Photoeffekt – Lampe (`physik/photoeffekt/index.ts:597`) |
| `ohmsches-gesetz/netzgeraet.webp` | Photoeffekt – Netzgerät (`physik/photoeffekt/index.ts:845` `drawSupply`) |
| `ohmsches-gesetz/messgeraet.webp` | Induktion – Spannungsmesser (`physik/induktion/index.ts:905` `drawMeter`, Skala mit Nullpunkt in der Mitte zeichnet die Simulation) |
| `reihe-parallel/widerstand.webp`, `reihe-parallel/gluehlampe.webp` | Ohmsches Gesetz – Bauteile Widerstand und Glühlampe (`physik/ohmsches-gesetz/index.ts`, `drawResistor`, `drawLamp`) |
| `federpendel/gewicht.webp` | Stehende Wellen – Gewicht an der Umlenkrolle (`physik/stehende-wellen/index.ts:988`) |
| `schiefe-ebene/brett.webp` | Hebelgesetz – Brett der Wippe (`physik/hebelgesetz/index.ts:2041`) |
| `bruchteile/pizza.webp` | Ähnliche Figuren – Pizza (`mathematik/vergroessern/index.ts:2012` `drawPizza`) |
| `umfang-flaeche/ameise.webp` | Maßstab – Ameise (`mathematik/massstab/index.ts:2099`, Objekt `ant`; Neigung 23,6° wie dort ausgleichen) |
| `freier-fall/lineal.webp` | Maßstab und Einheiten – Lineal als Holzmaserung, Skala gezeichnet (`mathematik/massstab/index.ts:1439`, `mathematik/einheiten/index.ts:1221`) |
| `licht-schatten/sonne.webp` | Strahlensätze – Sonne über dem Baum (`mathematik/strahlensaetze/index.ts:1194`) |
| `wellen-ausbreitung/kugel.webp` | Baumdiagramm – Kugeln in der Urne, eingefärbt (`mathematik/baumdiagramm/index.ts:516`) |
| `gesetz-grosse-zahlen/muenze-kopf.webp` | Exponentielles Wachstum – Münzen beim Zinseszins (`mathematik/exponentielles-wachstum/index.ts:268` `drawCoins`) |

## Aus der bisherigen Wunschliste gestrichen (nicht nötig)

- **Brechung – Glasblock:** Die Simulation zeigt zwei Medien als Halbflächen mit Winkelscheibe, keinen Halbzylinder.
- **Brüche rechnen – Messbecher:** „Dividieren durch Messen“ arbeitet mit Streifen; einen Messbecher gibt es in der Simulation nicht.
- **Einfacher Stromkreis – Tischplatte von oben, Glühlampe an/aus getrennt:** Der Aufbau liegt auf einer gezeichneten Fläche mit eigenem Hell/Dunkel; „aus“ wird aus dem vorhandenen Lampenfoto abgeleitet.
- **Monte-Carlo – Regentropfen, Umfang/Fläche – Rechenpapier, Papier-Textur für Funktionsgraphen:** eigene Raster und Graphen vertragen keine Fotos (wie beim Karopapier).
- **Extremwertaufgaben – Zaunpfahl:** nur wenige Pixel groß.
- Außerdem bewusst nicht aufgenommen: Fotozelle, Elektronenbeugungsröhre, Glaszylinder mit Kolben, Wellenwanne (Innenleben bzw. Füllung wird gezeichnet und ändert sich; ein Glasfoto darüber wirkt unruhig), Motor und Wirbelstrombremse am Pohlschen Rad (wirkt gezeichnet schon gut).

---

## Archiv: ursprüngliche Liste (15.10.2026)

Nur zur Nachverfolgung. **Maßgeblich ist die Liste oben** – alles hier ist entweder eingebaut (siehe `docs/BILDER.md`) oder oben neu formuliert bzw. gestrichen.

Ziel: Die Simulationen sollen durch echte Bilder statt gezeichneter Ersatzgrafiken deutlich hochwertiger wirken. Diese Liste sammelt **Vorschläge mit Prompts**. Eingebaut wird ein Bild erst, wenn die Datei vorliegt; danach kommt der Eintrag nach `docs/BILDER.md` (Regeln dort gelten weiter: keine Schrift, keine Logos, keine Personen, WebP, möglichst < 300 KB, immer gezeichneter Ersatz im Code).

**Ablauf:** Bild erzeugen → zuschneiden → als WebP unter dem angegebenen Pfad ablegen → Bescheid geben. Dann baue ich es in die Simulation ein (bei den neuen Bildern ist dafür jeweils eine kleine Code-Änderung nötig).

**Priorität:** ★★★ = macht die Simulation sichtbar schöner · ★★ = schöner Zusatz · ★ = nur Feinschliff

**Stil für alle Bilder** (an jeden Prompt anhängen, falls der Generator es nicht schon trifft):
`photorealistic, soft studio lighting, friendly and clean, high detail, no text, no logos, no watermark, no people`

**„Transparent“** heißt: Hintergrund wirklich durchsichtig (Alpha-Kanal), ggf. mit einem Freistellungswerkzeug nachbearbeiten. **„Deckend“** heißt: normales Bild ohne Transparenz.

---

### 0. Schon eingebaut, aber Datei fehlt noch (sofort wirksam, kein Code nötig)

Die Prompts stehen in `docs/BILDER.md`. Sonne und Erde werden in beiden Simulationen benutzt – einmal erzeugen, zweimal ablegen.

| Datei | Größe | Hintergrund | Prompt |
| --- | --- | --- | --- |
| `src/assets/sims/licht-schatten/sonne.webp` und `src/assets/sims/planetenbahnen/sonne.webp` | 1024 × 1024 | transparent | siehe BILDER.md, „Licht und Schatten → sonne.webp“ |
| `src/assets/sims/licht-schatten/erde.webp` und `src/assets/sims/planetenbahnen/erde.webp` | 1024 × 1024 | transparent | siehe BILDER.md, „Licht und Schatten → erde.webp“ |
| `src/assets/sims/licht-schatten/mond.webp` | 1024 × 1024 | transparent | siehe BILDER.md, „Licht und Schatten → mond.webp“ |

---

### 1. Physik

#### Bewegungsdiagramme ★★★
- `bewegungsdiagramme/auto.webp` – 1200 × 600, transparent – Auto auf der Strecke
  > A small modern compact car in glossy blue, exact side view facing right, wheels visible, generic design with no brand, isolated on a transparent background, soft contact shadow removed, photorealistic
- `bewegungsdiagramme/strasse.webp` – 2400 × 400, deckend – Fahrbahn als Streifen unter dem Auto
  > Straight asphalt road seen exactly from the side as a long horizontal strip, dark grey asphalt with a thin white edge line, a narrow strip of green grass below, seamless horizontally tileable, photorealistic

#### Freier Fall ★★
- `freier-fall/kugel.webp` – 256 × 256, transparent – Stahlkugel in der Fallröhre und im Stroboskop
  > A polished steel ball, perfectly round, bright specular highlight, isolated on a transparent background, photorealistic
- `freier-fall/lineal.webp` – 300 × 1600, transparent – Lineal beim Reaktionstest
  > A wooden school ruler standing vertically, light beech wood with black millimetre tick marks but no numbers, front view, isolated on a transparent background, photorealistic

#### Schiefer Wurf
(Hintergründe und Ball sind vorhanden.)
- `schiefer-wurf/kanone.webp` – 800 × 500, transparent – Abwurfgerät ★★
  > A small friendly toy cannon on two wooden wheels, barrel pointing to the right at 30 degrees, painted dark green with brass details, side view, isolated on a transparent background, photorealistic

#### Fadenpendel ★★
- `fadenpendel/stativ.webp` – 1000 × 1400, transparent – Aufhängung
  > A physics lab stand with a heavy dark base, vertical steel rod and a short horizontal clamp arm at the top pointing right, front view, isolated on a transparent background, photorealistic

#### Federpendel ★★★
- `federpendel/gewicht.webp` – 512 × 512, transparent – Massestück an der Feder
  > A slotted brass laboratory weight with a hook on top, cylindrical, shiny polished brass, front view, isolated on a transparent background, photorealistic
- `federpendel/stativ.webp` – wie beim Fadenpendel (gleiche Datei kopieren)

#### Hookesches Gesetz ★★★
- `hookesches-gesetz/gewicht.webp` – wie beim Federpendel (gleiche Datei kopieren)
- `hookesches-gesetz/stativ.webp` – wie beim Fadenpendel (gleiche Datei kopieren)
- `hookesches-gesetz/massstab.webp` – 300 × 1800, transparent – Messlatte neben der Feder
  > A vertical white measuring scale bar with fine black centimetre and millimetre tick marks but no numbers, slightly glossy plastic, front view, isolated on a transparent background, photorealistic

#### Hebelgesetz ★★★
- `hebelgesetz/hebel.webp` – 2400 × 300, transparent – Hebelstange
  > A long horizontal aluminium lever bar with evenly spaced small holes along its length, brushed metal, front view, isolated on a transparent background, photorealistic
- `hebelgesetz/gewicht.webp` – wie beim Federpendel (gleiche Datei kopieren)
- `hebelgesetz/schubkarre.webp` – 1400 × 800, transparent – Beispiel Schubkarre
  > A classic garden wheelbarrow with a green metal tub, one front wheel and two wooden handles, exact side view facing left, empty, isolated on a transparent background, photorealistic
- `hebelgesetz/flaschenoeffner.webp` – 1000 × 400, transparent – Beispiel Flaschenöffner
  > A simple stainless steel bottle opener, flat, top view, isolated on a transparent background, photorealistic

#### Kräfteaddition ★★
- `kraefteaddition/lampe.webp` – 600 × 600, transparent – Straßenlampe an zwei Seilen
  > A round vintage street lamp hanging from above, dark metal housing with a warm glowing glass globe, front view, two attachment rings on top, isolated on a transparent background, photorealistic

#### Schiefe Ebene ★★★
- `schiefe-ebene/holzklotz.webp` – 800 × 500, transparent – Klotz auf der Rampe
  > A rectangular wooden block of light oak with visible grain and a small metal hook on one end, side view, isolated on a transparent background, photorealistic
- `schiefe-ebene/brett.webp` – 2400 × 200, deckend – Oberfläche der Rampe
  > A long plank of smooth light wood seen exactly from the side, horizontal, fine wood grain, seamless horizontally tileable, photorealistic

#### Kreisbewegung ★★
- `kreisbewegung/auto-oben.webp` – 600 × 1000, transparent – Auto in der Kurve (Draufsicht)
  > A small modern car seen exactly from above, red paint, generic design with no brand, isolated on a transparent background, photorealistic
- `kreisbewegung/asphalt.webp` – 1600 × 1600, deckend – Straße/Kreisverkehr von oben
  > Top-down view of a large empty asphalt area with fine texture, dark grey, evenly lit, seamless, photorealistic

#### Stöße ★★★
- `stoesse/gleiter.webp` – 1000 × 400, transparent – Wagen auf der Luftkissenbahn
  > A small air track glider, a long aluminium rider with a V-shaped profile and a small bumper spring at the front, side view, isolated on a transparent background, photorealistic
- `stoesse/bahn.webp` – 2400 × 240, transparent – Luftkissenbahn
  > A long horizontal aluminium air track with tiny holes along the top surface, side view, brushed metal, isolated on a transparent background, photorealistic

#### Planetenbahnen
- `planetenbahnen/sternenhimmel.webp` – 2048 × 2048, deckend – Hintergrund ★★★
  > Deep space starfield, black background with many tiny white and faintly coloured stars, very subtle distant blue and purple nebula haze, no planets, no bright objects in the centre, photorealistic astrophotography

#### Energieerhaltung (Achterbahn)
(Wagen und Himmel sind vorhanden.)
- `energieerhaltung/landschaft.webp` – 2400 × 600, transparent oben – Hügel und Bäume am unteren Rand ★★
  > Wide panoramic strip of a summer amusement park landscape, green rolling grass and a few trees at the bottom, transparent sky above, side view, photorealistic

#### Resonanz (Pohlsches Rad) ★★★
- `resonanz/rad.webp` – 1024 × 1024, transparent – Kupferrad
  > A Pohl's wheel physics apparatus seen from the front: a flat polished copper disc with a fine scale ring around the edge, a coiled spiral spring in the centre, isolated on a transparent background, photorealistic

#### Wellenausbreitung ★
- `wellen-ausbreitung/kugel.webp` – 256 × 256, transparent – Teilchen der Kette
  > A small glossy red sphere, perfectly round, soft highlight, isolated on a transparent background, photorealistic

#### Einfacher Stromkreis ★★★
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

#### Reihen- und Parallelschaltung ★★
- Glühlampen (an/aus), Batterie und Tisch wie beim einfachen Stromkreis (gleiche Dateien kopieren)
- `reihe-parallel/widerstand.webp` – 600 × 240, transparent
  > A single through-hole resistor with coloured bands, beige body, horizontal, isolated on a transparent background, photorealistic

#### Ohmsches Gesetz ★★★
- `ohmsches-gesetz/netzgeraet.webp` – 1000 × 700, transparent – Netzgerät (die Anzeige zeichnet die Simulation darüber)
  > A school laboratory DC power supply, grey metal housing, one large black rotary knob and two banana-plug sockets red and black, an empty dark display window, front view, no text, isolated on a transparent background, photorealistic
- `ohmsches-gesetz/messgeraet.webp` – 800 × 800, transparent – Zeigerinstrument (Skala und Zeiger zeichnet die Simulation)
  > An analogue lab meter housing, black case with a large blank white dial face without any scale or numbers and without a needle, front view, isolated on a transparent background, photorealistic

#### Licht und Schatten
- `licht-schatten/lampe.webp` – 600 × 600, transparent ★★
  > A small lab lamp housing with a round opening facing right, black metal, side view, isolated on a transparent background, photorealistic
- `licht-schatten/sternenhimmel.webp` – wie bei Planetenbahnen (gleiche Datei kopieren) ★★★

#### Reflexion ★★
- `reflexion/kerze.webp` – 400 × 900, transparent – Kerze vor dem Spiegel
  > A white wax candle with a small calm burning flame, front view, isolated on a transparent background, photorealistic
- `reflexion/laser.webp` – wie bei der Brechung (Datei von `brechung/laser.webp` kopieren)

#### Linsen ★★
- `linsen/kerze.webp` – wie bei der Reflexion (gleiche Datei kopieren)
- `linsen/linse.webp` – 400 × 1200, transparent – Sammellinse von der Seite
  > A biconvex glass lens seen exactly edge-on from the side, clear glass with subtle reflections and a thin metal rim, vertical, isolated on a transparent background, photorealistic

#### Brechung
(Laser ist vorhanden.)
- `brechung/glasblock.webp` – 1024 × 1024, transparent – Halbzylinder auf der optischen Scheibe ★★
  > A semicircular clear acrylic glass block seen exactly from above, flat side horizontal, subtle edge reflections, isolated on a transparent background, photorealistic

#### Doppler-Effekt (in Arbeit) ★★★
- `doppler-effekt/krankenwagen.webp` – 1200 × 600, transparent
  > A modern ambulance seen from the side facing right, white with red stripes and blue lights on the roof, generic design with no text, no brand, isolated on a transparent background, photorealistic
- `doppler-effekt/strasse-oben.webp` – 2400 × 1200, deckend – Straße von oben
  > Top-down aerial view of a straight two-lane road running horizontally, grass on both sides, evenly lit, photorealistic

---

### 2. Mathematik

#### Ziegenproblem, Galtonbrett, Gesetz der großen Zahlen, Monte-Carlo, Kreiszahl π, Bruchteile, Exponentielles Wachstum
Bilder sind vorhanden. Mögliche Ergänzungen:
- `gesetz-grosse-zahlen/wuerfel.webp` – 512 × 512, transparent ★★ (Würfel; Augenzahlen zeichnet die Simulation, deshalb ohne Augen)
  > A single white plastic game die without any pips, blank faces, rounded edges, three-quarter view, isolated on a transparent background, photorealistic
- `monte-carlo-pi/sand.webp` – 64 × 64, transparent ★ (ein „Regentropfen“ statt Punkt)
  > A single small water droplet seen from above, clear with soft highlight, isolated on a transparent background, photorealistic

#### Stellenwerte ★★
- `stellenwerte/plaettchen.webp` – 256 × 256, transparent – Plättchen in der Stellenwerttafel
  > A single round wooden counter chip, light natural wood, top view, isolated on a transparent background, photorealistic

#### Zahlengerade ★★★
- `zahlengerade/thermometer.webp` – 300 × 1600, transparent (Skala zeichnet die Simulation)
  > An outdoor glass thermometer tube with a red liquid column, mounted on a blank white board without any scale or numbers, vertical, front view, isolated on a transparent background, photorealistic
- `zahlengerade/meer.webp` – 1600 × 1600, deckend – Meeresspiegel-Beispiel
  > Side cross-section view of a coastal scene: a hill with green grass above the water line, calm blue sea surface in the middle, underwater part fading into deep blue below, photorealistic

#### Bruchteile
- `bruchteile/schokolade.webp` – 1400 × 900, deckend ★★ (Tafel Schokolade als vierte Darstellung)
  > A bar of milk chocolate seen from above, 4 by 6 rectangular pieces, unwrapped, no brand, evenly lit, photorealistic

#### Brüche vergleichen ★★
- Pizza und Blechkuchen wie bei Bruchteile (Dateien kopieren)

#### Brüche rechnen ★
- `brueche-rechnen/messbecher.webp` – 600 × 1000, transparent (Dividieren durch Messen)
  > A clear glass measuring jug, empty, without any scale marks or numbers, front view, isolated on a transparent background, photorealistic

#### Primfaktoren ★
- `primfaktoren/baum.webp` – 1600 × 1200, transparent – zarter Baum als Hintergrund des Faktorbaums
  > A delicate stylised tree silhouette with bare branches, light watercolour green, very subtle, isolated on a transparent background

#### Waagemodell ★★★
- `waagemodell/waage.webp` – 1600 × 1000, transparent – Balkenwaage (Balken wird gedreht, daher ohne Schalen)
  > A classic brass balance scale stand without the beam and without pans, ornate column on a wooden base, front view, isolated on a transparent background, photorealistic
- `waagemodell/schale.webp` – 700 × 300, transparent
  > A single shallow brass weighing pan hanging from three thin chains, front view, isolated on a transparent background, photorealistic
- `waagemodell/paeckchen.webp` – 400 × 400, transparent – „x-Päckchen“
  > A small cardboard parcel tied with twine, cube shaped, front view, isolated on a transparent background, photorealistic
- `waagemodell/gewicht.webp` – 300 × 300, transparent
  > A small cast iron weight with a top handle, front view, isolated on a transparent background, photorealistic

#### Umfang und Fläche ★★
- `umfang-flaeche/ameise.webp` – 256 × 256, transparent – Ameise läuft den Rand ab
  > A single cute ant seen exactly from above, walking pose, isolated on a transparent background, photorealistic macro
- `umfang-flaeche/rechenpapier.webp` – 1600 × 1600, deckend
  > Top-down view of a sheet of white squared maths paper with light blue grid, slightly textured paper, evenly lit, photorealistic

#### Koordinaten und Lage, Vierecke, Spiegelung, Winkel messen, Mittelsenkrechte, Thales ★★
Gemeinsame Bilder (einmal erzeugen, in jeden Ordner kopieren):
- `<id>/karopapier.webp` – 1600 × 1600, deckend
  > Top-down view of a sheet of white squared exercise paper with faint grey-blue 5 mm grid, slightly textured, evenly lit, photorealistic
- `winkel-messen/geodreieck.webp` – 1600 × 800, transparent (Skala zeichnet die Simulation darüber)
  > A transparent plastic set square triangle, right isosceles, slightly bluish clear acrylic, without any scale, marks or numbers, top view, long side horizontal at the bottom, isolated on a transparent background, photorealistic
- `mittelsenkrechte/zirkel.webp` – 600 × 1000, transparent
  > A metal school compass with pencil, legs opened slightly, front view, isolated on a transparent background, photorealistic

#### Körpernetze, Quader-Volumen, Prisma und Zylinder, Pyramide/Kegel/Kugel, Cavalieri, Rotationskörper (3D) ★
3D-Körper werden gezeichnet und gedreht – echte Fotos passen dort nicht. Möglich sind Oberflächen:
- `quader-volumen/wuerfel.webp` – 256 × 256, deckend – Holz-Textur der Einheitswürfel
  > Square close-up texture of light maple wood, fine grain, evenly lit, seamless, photorealistic
- `cavalieri/muenze.webp` – 512 × 512, transparent – Münze im Stapel (ohne echtes Münzbild)
  > A plain golden coin seen from above with a simple raised rim and a blank smooth centre, no symbols, no text, isolated on a transparent background, photorealistic
- `cavalieri/spielkarte.webp` – 700 × 1000, deckend – Kartenrücken
  > The back of a playing card, dark red with a fine symmetric ornamental pattern and a white border, no text, no logo, front view, photorealistic

#### Extremwertaufgaben ★★★
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

#### Parabel durch drei Punkte ★★★
- `parabel-drei-punkte/ball.webp` – 256 × 256, transparent – Ball der Wurfbahn
  > A classic white and black football, perfectly round, isolated on a transparent background, photorealistic
- `parabel-drei-punkte/bruecke.webp` – 2400 × 1200, deckend – Hintergrund Brückenbogen (Bogen selbst zeichnet die Simulation)
  > A wide river landscape seen from the side, calm water in the lower third, grassy banks left and right, soft sky, no bridge, photorealistic

#### Quadratische Funktion ★★
- `quadratische-funktion/brunnen.webp` – 2400 × 1200, deckend – Wasserstrahl als Parabel-Beispiel
  > A park fountain shooting a single smooth arc of water from left to right against a soft blurred green park background, side view, photorealistic

#### Lineare Funktion, LGS grafisch ★
- `lgs-grafisch/handy.webp` – 600 × 1100, transparent – Tarifvergleich-Beispiel
  > A generic modern smartphone, front view, blank dark screen, no brand, isolated on a transparent background, photorealistic

#### Sinusfunktion ★★
- `sinusfunktion/riesenrad.webp` – 1600 × 1600, transparent – Modellieren mit Riesenrad
  > A Ferris wheel seen exactly from the front, white steel structure with colourful gondolas, isolated on a transparent background, photorealistic

#### Einheitskreis, Sekante/Tangente, Ober-/Untersummen, Hyperbel, Gleichungen grafisch, Funktionsplotter, Funktion/Zuordnung, Termbaum, Binomische Formeln, Pythagoras, Dezimalbrüche
Hier sind die Graphen und Figuren selbst das Wichtige – Fotos würden eher ablenken. Wenn gewünscht, eine gemeinsame, sehr zurückhaltende Papier-Textur:
- `<id>/papier.webp` – 1600 × 1600, deckend ★
  > Top-down view of smooth warm white paper with a very faint natural fibre texture, evenly lit, seamless, photorealistic

---

### Zusammenfassung

- **Sofort wirksam:** 3 Bilder (Sonne, Erde, Mond) – fehlen nur noch als Datei.
- **Neu vorgeschlagen:** rund 70 Bilder; durch gemeinsame Dateien (Stativ, Gewicht, Glühlampe, Karopapier …) müssen davon nur etwa 55 erzeugt werden.
- **Größte Wirkung (★★★):** Stromkreise, Ohmsches Gesetz, Hebel, Federpendel/Hooke, Schiefe Ebene, Stöße, Pohlsches Rad, Bewegungsdiagramme, Sternenhimmel, Waagemodell, Zahlengerade, Extremwertaufgaben, Parabel-Anwendungen, Doppler-Effekt.
