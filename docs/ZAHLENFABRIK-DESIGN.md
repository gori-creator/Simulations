# Zahlenfabrik: neues Spiel-Design und Bild-Prompts

> **Stand 11.11.2026 – ruhiges Design im Stil der Webseite.** Wunsch der Projektleitung: Der Spiel-Look „Bunte Werkstatt“ (Entwurf D2, unten beschrieben) wirkte unprofessionell und kindlich und passte nicht zur übrigen Webseite. Die Oberfläche nutzt jetzt die Farben, Schriften, Karten und Knöpfe der Webseite (`global.css`), in hell und dunkel; farbig sind nur noch die Spielteile selbst. Umsetzung: `src/styles/zahlenfabrik-skin.css` (ersetzt die D2-Schicht), Titelseite in `game.ts` (`showTitle`), Aufgabe unter dem Titel (`SpielView.astro`, `data-task`).
>
> - **Titelseite** wie die Startseite der Webseite: links Zeile „Lernspiel · Mathematik“, großer Titel, ein erklärender Satz, drei Angaben (Kapitel, Level, Klasse 5–9), ein Hauptknopf („Spielen“ bzw. „Weiterspielen“) und zwei Nebenknöpfe; rechts das Titelbild in einer Karte. Am Handy das Bild oben.
> - **Spielansicht:** eine weiße Karte; die Aufgabe steht in einem Satz unter dem Titel (vor dem Spielfeld, auch am Handy). Seitenleiste in der Reihenfolge der Arbeit: Start (groß) mit kleinen Nebenknöpfen in einer Reihe, darunter der Werkzeugkasten, dann Tipp, Rechenweg und Kennzahlen.
> - **Spielfeld:** heller, neutraler Boden statt Sand, dünne Kanten, schlichte weiße Schilder auf den Teilen, Zahlen als helle Scheiben. Der 3D-Blick bleibt. Statt Gleisen laufen die Zahlen wieder auf einem **Förderband** (Metallrahmen, dunkles Gummiband, helle Querstreifen, die beim Start mitlaufen).
> - Die Abschnitte unten (Richtungen A–D, D2, Prompts für Rahmen, Knöpfe und Schilder) sind damit **überholt**; die Prompts für Spielteile und Kapitelbilder gelten weiter.

Stand 05.11.2026. Wunsch der Projektleitung: weg vom „Lernplattform“-Look, hin zu einem echten Spiel, auf das Kinder und Jugendliche Lust haben. Vorbild ist der Stil gängiger Handyspiele mit dicken, plastischen Rahmen und Knöpfen, Schildern, Nieten, Zahnrädern und kräftigen Farben. Die Beispielbilder der Projektleitung sind gekaufte Stock-Grafiken: Wir übernehmen **nur den Stil**, keine Bilder, Formen oder Texte daraus. Alle Grafiken entstehen neu über die Prompts unten.

## Vier Richtungen (Entwürfe zum Vergleichen)

| | A „Werkstatt“ | B „Spielzeugfabrik“ | C „Messing & Holz“ |
| --- | --- | --- | --- |
| Stimmung | Fabrikhalle bei Nacht, Stahlplatten, gelb-schwarze Warnstreifen | hell, freundlich, Himmel und Wiese, dicke dunkle Umrisse | warmes Holz, Messingrahmen, Nieten, Zahnräder (Steampunk) |
| Farben | Dunkelblau/Stahl, Orange, Gelb, Scitura-Blau | Himmelblau, Weiß, Orange, Grün | Braun, Gold, Pergament, Blau als Akzent |
| passt zu | Jugendlichen, „echtes“ Fabrikspiel | jüngeren Kindern (Klasse 5–6) | allen, wirkt wertig und gemütlich |

**D „Bunte Werkstatt“ (empfohlen):** Die Projektleitung möchte die **bisherigen Spielbilder behalten** (`src/assets/zahlenfabrik/`: Quelle, Maschine, Weiche, Zusammenführer, Lager leer/voll, Basis, Brücke, drei Felsen, Münze, Boden hell/dunkel). Sie zeigen bunte, glänzende Kästen mit grauen Metallecken, runden Schrauben und Warnstreifen. Richtung D übernimmt genau das für die Oberfläche: helle Platten mit **Metallecken und Schrauben**, dunkelblauer Hintergrund mit großen Zahnrädern, orange und blaue 3D-Knöpfe, gelbe Schilder. Nur die Oberfläche (Rahmen, Knöpfe, Symbole, Hintergründe, Effekte) wird neu erzeugt; die Spielteile aus Abschnitt 6 gibt es schon.

Gemeinsam: Schrift **sehr fett mit dunklem Umriss** (frei lizenzierte Schrift, z. B. „Lilita One“ oder „Baloo 2 ExtraBold“, als Datei auf dem eigenen Server – keine Webfonts von außen), Knöpfe mit Lichtkante oben und dicker Unterkante (wirken drückbar), Titel auf **Schildern**, Sterne gold mit Umriss, Zahlen auf weißen **Kugeln**. Quelle grün, Maschinen gelb/orange, Lager/Basis blau. Hell/dunkel: Richtung A ist von sich aus dunkel, B hell, C mittel; die Seite schaltet dann nur Kleinigkeiten um.

Wichtig für alle Bilder: **kein Text im Bild** (außer Logo), weil die Texte zweisprachig sind und Zahlen vom Spiel kommen. Zahlen, Rechenzeichen und Beschriftungen setzt das Spiel darüber.

## Technik der Bilder

- Format **PNG mit transparentem Hintergrund** (Hintergründe ohne Transparenz). Das Spiel wandelt später in WebP um.
- Spielteile: **Draufsicht von schräg oben** (leichte 3/4-Ansicht), alle im **gleichen Licht von oben links**, gleiche Umrissdicke.
- Größen: Spielteile 512 × 512 (Basis 1024 × 1024), Knöpfe 512 × 512, Rahmen 1024 × 1024, Hintergründe 2560 × 1440 (Handy-Variante 1080 × 1920), Symbole 256 × 256.
- Rahmen und Knöpfe so, dass die **Mitte leer und einfarbig** ist und die Ecken gleich groß sind (das Spiel streckt nur die Mitte, „9-Slice“).
- Ablage: `src/assets/zahlenfabrik/v2/<gruppe>/<name>.png`; jedes eingebaute Bild mit Prompt in `docs/ZAHLENFABRIK-BILDER.md` eintragen.

## Stil-Vorsatz (vor jeden Prompt setzen)

Je nach gewählter Richtung **einen** dieser Sätze vor jeden Prompt kopieren:

- **D Bunte Werkstatt (empfohlen, passt zu den bisherigen Bildern):** `Mobile game UI asset, glossy cartoon 3D style matching a set of colorful plastic machine boxes with light grey metal corner brackets, round silver bolts and small yellow-black hazard stripes, clean white and light grey panels, accents in orange (#f07b00), yellow (#ffd23f), blue (#2b5fd9) and green (#2ea043), thick dark navy outline (#1b2a4a), soft top-left lighting, soft shadows, no text, no logos, transparent background.`

- **A Werkstatt:** `Mobile game UI asset, polished cartoon style, industrial workshop theme, brushed steel plates with bolts, yellow-and-black hazard stripes, warm orange and bright yellow accents, deep navy blue shadows, thick dark navy outline (#0a1120), soft top-left lighting, glossy highlights, clean vector look, no text, no logos, transparent background.`
- **B Spielzeugfabrik:** `Mobile game UI asset, bright friendly cartoon style for kids, toy factory theme, chunky rounded shapes, candy colors orange (#ff7a00), sky blue (#2b5fd9), grass green (#2fb14a), white panels, very thick dark navy outline (#1b2a4a), soft top-left lighting, glossy plastic highlights, clean vector look, no text, no logos, transparent background.`
- **C Messing & Holz:** `Mobile game UI asset, polished cartoon steampunk style, warm wooden planks with brass frames, rivets and small gears, golden yellow (#ffcf4d) and warm brown, parchment panels, accents in blue (#2b5fd9), thick dark brown outline (#2a1406), soft top-left lighting, glossy highlights, clean vector look, no text, no logos, transparent background.`

## Prompt-Liste

### 1. Logo und Titel

1. `Game logo lettering "ZAHLENFABRIK", chunky bold rounded letters with thick outline and 3D bevel, small gear replacing the letter A, conveyor belt underline with tiny number balls 1 2 3, centered, transparent background.`
2. Wie 1, aber Text `"NUMBER FACTORY"` (englische Fassung).
3. `Small square app icon for a math factory game: a cute machine with a funnel on top and a "+" symbol on its front, conveyor belt in front, rounded square badge, transparent background.`
4. `Title sign plaque, wide horizontal banner board for headings, empty center for text, decorative corners, hanging on two short chains (C) / bolted metal sign with hazard edge (A) / rounded candy-colored ribbon sign (B).`

### 2. Hintergründe

5. `Main menu background, wide 16:9, a big friendly number factory seen from the front: chimneys with soft smoke, conveyor belts carrying glowing number balls, big gears, depth with blurred foreground gears, empty space in the center for the logo and buttons, no text.` (ohne „transparent background“)
6. Wie 5, im Hochformat 9:16 für das Handy.
7. `Level map background, wide 16:9, factory interior hall with workbenches, pipes and belts in the distance, darker edges (vignette), calm and not distracting, center area plain for a level panel, no text.`
8. `Seamless tileable floor texture for a top-down game board, subtle square grid of 1 tile, factory floor (steel plates for A / light toy mat for B / wooden parquet for C), low contrast, no objects, square 1024x1024.`
9. Wie 8, aber eine **dunklere** Variante für den Dunkelmodus.
10. `Fog of war tile for locked map areas, soft swirling cloud, seamless, semi-transparent white-grey, square, transparent background.`
11. `Six themed backgrounds for world sections (one image each): 1 conveyor workshop, 2 green garden greenhouse factory, 3 icy freezer hall, 4 volcano forge with lava pipes, 5 crystal laboratory, 6 sky factory on clouds; wide 16:9, calm, center plain, no text.` (6 einzelne Bilder)

### 3. Rahmen und Fenster (9-Slice, Mitte leer)

12. `Large game panel frame, rectangular window with thick decorative border, empty flat inner area, four matching corners, square 1024x1024.`
13. `Small game panel frame for side cards, same style as large panel, thinner border, empty flat inner area, square 1024x1024.`
14. `Inner inset area, recessed rounded rectangle with inner shadow, for placing level buttons or a game board, empty, square 1024x1024.`
15. `Dialog window frame with a title plaque on top and a close button spot in the top right corner, empty center, square 1024x1024.`
16. `Speech bubble / tooltip frame, rounded, thick outline, small pointer at the bottom left, empty center.`
17. `Tab button, inactive state, rounded top corners, empty center.` und 18. `Tab button, active highlighted state, slightly taller, glowing edge, empty center.`
19. `Horizontal progress bar frame, empty track with inner shadow, rounded ends.` und 20. `Progress bar fill, glossy green with diagonal stripes, rounded ends, horizontally tileable.`
21. `Coin counter pill frame, rounded capsule, coin socket on the left, empty right part for numbers.`
22. `Toast notification banner, wide rounded strip with icon spot on the left, empty center.`

### 4. Knöpfe (je normal und gedrückt = 2 Bilder)

23. `Round glossy game button, empty face, orange, thick outline, bottom lip shadow, highlight on top.` → 24. dieselbe **gedrückt** (flacher, dunkler).
25.–30. Wie 23 in **Blau, Grün, Rot, Lila, Gelb, Grau (gesperrt)**.
31. `Large rectangular glossy game button for "Start", green, empty face, rounded corners, thick outline, bottom lip shadow.` → 32. gedrückt.
33. `Wide rectangular game button, orange, empty face, for menu entries like Play/Options.` → 34. gedrückt.
35. `Level select button, square with rounded corners, empty face for a level number, orange, with a small socket below for three stars.`
36. Wie 35 **aktuelles Level** (blau, leuchtender Rand). 37. Wie 35 **gesperrt** (grau, kleines Vorhängeschloss in der Mitte). 38. Wie 35 **Profi-Level** (rot-gold mit kleiner Flamme an der Ecke).
39. `Arrow button left, round, orange, chunky arrow symbol.` 40. Pfeil rechts.

### 5. Symbole (256 × 256, gleiche Strichstärke)

41. `Set of game icons, same style, each separate: home, play triangle, pause, fast forward, single step, stop square, undo arrow, trash bin, settings gear, music note, speaker on, speaker muted, question mark, level grid, world map, open hand (pan tool), conveyor belt piece, eraser sponge, lock, star full, star empty, gold coin, check mark, cross, zoom in, zoom out, fit-to-screen corners, trophy, gift box, "new" burst badge (empty), arrow left, arrow right.` (als einzelne Bilder anfordern; je 1 Bild pro Symbol)

### 6. Spielteile (Draufsicht 3/4, 512 × 512)

**Bei Richtung D schon vorhanden** (bleiben): 42 Quelle, 43 Maschine, 51 Weiche, 53 Zusammenführer, 54 Brücke, 55/56 Lager, 57 Basis, 58–60 Felsen, dazu Münze und Boden (8/9). Neu nötig sind nur: 44–50 (Farbvarianten der Maschine, optional – sonst färbt das Spiel um), 52 Verteiler, 61 Deko, 65–67 Zahl-Kugeln. Für neue Teile in den Prompt ergänzen: `same style as the existing machine boxes: glossy colored plastic box, light grey metal corner brackets with round bolts, grey connector sockets on the sides`.


42. `Number source machine, top-down 3/4 view, green box with a funnel and a small chimney puffing smoke, round empty display window on the front for a number, output chute on the right side.`
43. `Calculating machine housing, top-down 3/4 view, yellow-orange box with gears on the sides and a big empty square display on top for a math symbol and number, input on the left, output on the right.`
44.–50. Wie 43, je eigene Farbe und kleines Erkennungsmerkmal: **Plus** (grün, Schraubenschlüssel), **Minus** (rot, Säge), **Mal** (orange, Presse mit Hammer), **Geteilt** (lila, Schneidmesser), **Rest** (türkis, Sieb), **Quersumme** (pink, Rührwerk), **Wurzel** (blau, Pflanzenwurzel-Rohr), **Quadrat** (gold, zwei Walzen).
51. `Sorting switch machine, top-down 3/4 view, box with a fork-shaped track splitting into straight and side exit, green light on the straight exit, red light on the side exit, empty sign on top for a question symbol.`
52. `Splitter machine, top-down 3/4 view, box with one input and two outputs, copying arrows, small blinking lights.`
53. `Merger machine, top-down 3/4 view, box with two inputs and one output, funnel combining two lanes, empty display on top for + or ×.`
54. `Bridge piece, top-down 3/4 view, small arched metal bridge over a conveyor crossing, one lane under, one lane over.`
55. `Storage crate target, top-down 3/4 view, blue crate with open top and an empty round display on the front, empty state.` 56. Wie 55 **voll** (Kugeln schauen oben heraus, leuchtend).
57. `Home base building for open world, top-down 3/4 view, 3x3 tiles big, friendly factory headquarters with a flag, four input docks on each side, solar panels, big empty display on the roof, square 1024x1024.`
58.–60. `Rock obstacle, top-down 3/4 view, cartoon boulder` in **drei Formen** (klein, groß, Gruppe).
61. `Decoration pieces for the factory floor, separate: oil barrel, crate stack, potted plant, pipe valve, warning cone, small tree.` (einzeln)
62. `Conveyor belt tile straight, top-down view, narrow belt in the center of a square tile with rollers and side rails, horizontally tileable, square 256x256.` 63. Wie 62 als **Kurve**. 64. **Endstück**. (Optional – das Spiel zeichnet die laufenden Bänder auch selbst.)
65. `Number ball token, glossy white sphere with thick outline, empty face for a number, small shadow below.` 66. Wie 65 in **Gold** (große Zahl), 67. in **Rot** (Fehler).

### 7. Effekte

68. `Small smoke puff cloud effect, cartoon, 4 frames growing and fading, sprite sheet horizontal.`
69. `Sparkle burst effect, golden stars and sparks radiating, sprite sheet 4 frames.`
70. `Confetti pieces set, colorful rectangles and stars, separate small pieces on transparent background.`
71. `Coin pop effect, gold coin with "plus" sparkle, sprite sheet 4 frames.`
72. `Red warning flash ring for a tile, glowing outline square with soft glow.`

### 8. Fenster „Level geschafft“ und Belohnungen

73. `Victory banner ribbon, wide golden ribbon with folded ends, empty center for text.`
74. `Three big star slots for level result, empty dark star sockets in an arc.` 75. `Big glossy gold star with thick outline and shine.`
76. `Trophy cup, gold, cartoon, with confetti behind.`
77. `Treasure chest reward, closed and open (two images), gold coins spilling.`
78. `Chapter badge medal, round medal with ribbon, empty center for a chapter symbol.`

### 9. Kapitel-Bilder (Level-Auswahl, 512 × 512, je 1 Bild)

79. `Chapter card illustration, square, a cute machine scene that represents <THEMA>, no text.` Für jedes Kapitel `<THEMA>` ersetzen: conveyor belts · plus machine · minus machine · multiply machine · divide machine · working backwards (rewinding machine) · even/odd sorting switch · divisibility switch · greater-than switch · prime number switch with a golden crown · value table board · square machine · remainder machine · digit sum machine · square root machine · square number switch · splitter · merger sum · merger product · bridge crossing · puzzle workshop · function detective with magnifying glass · final master exam.

### 10. Offene Welt

80. `Map region border marker, glowing fence posts with a small padlock sign, cartoon.`
81. `Unlock land sign, wooden/metal signpost with a coin symbol and an arrow, empty plate for a price.`
82. `Order board at the base, clipboard notice board with an empty paper for a task, pinned with a gear.`

## Nächste Schritte

1. Projektleitung wählt eine Richtung (empfohlen D, sonst A, B, C oder eine Mischung) und gibt Feedback zu den Entwürfen.
2. Mit dem passenden Stil-Vorsatz zuerst die **Proben** erzeugen: 4 (Schild), 12 (Rahmen), 23 (Knopf), 31 (Start-Knopf), 35 (Level-Knopf), 41 (ein paar Symbole), 65 (Zahl-Kugel). Passen sie zu den vorhandenen Spielbildern, den Rest erzeugen.
3. Danach baut die Oberfläche um: Hauptmenü, Level-Auswahl als Kartenfenster, Spielbildschirm mit HUD, Fenster „Level geschafft“, Einstellungen. Die gezeichnete Grafik bleibt als Ersatz, wenn ein Bild fehlt.

## Entwurf D2 (Stand 05.11.2026, nach Feedback der Projektleitung)

- **Raster stimmt:** Das Bodenbild ist auf genau zwei Kästchen ausgerichtet, die dünnen Linien liegen auf den Feldgrenzen. Jedes Teil (Quelle, Maschine, Lager, Fels, Baum) sitzt genau in **einem** Kästchen, die Bänder laufen durch die Feldmitten, die Zahl-Kugeln liegen auf den Feldmitten.
- **Anzeigen statt Aufdruck:** Maschinen zeigen ihre Rechnung auf einem kleinen **Leuchtdisplay** (dunkler Bildschirm, leuchtende Ziffern: Plus grün, Mal gelb, Lager blau). Die Quelle zeigt ihre Zahl auf einer runden Metallscheibe. Das Lager hat Punkte für den Fortschritt (●○○). Große Zahlen auf goldenen Kugeln.
- **Vorhandene Bilder eingebaut:** Titelbild als Startbildschirm, die 13 **Kapitelbilder** als Karten in der Level-Auswahl, Maschinen je Rechenart, Weichen, Bäume, Büsche, Sterne, Münze.
- Oberfläche: helle Platten mit Metallecken und Schrauben, gelbe Schilder mit Nieten, Warnstreifen am unteren Rand, dunkelblauer Hintergrund mit Zahnrädern.
- Alle Bild-Prompts komplett ausgeschrieben: `docs/ZAHLENFABRIK-PROMPTS.md`.
- Entwurf als HTML zum Nachbauen: Screenshots in der Unterhaltung; beim Umbau zuerst Spielbildschirm, dann Level-Auswahl, dann Titel.

### Umsetzung (05.11.2026)

- Stil-Schicht `src/styles/zahlenfabrik-skin.css` über `zahlenfabrik.css` (nur Aussehen): Platten mit Metallecken, gelbe Schilder, 3D-Knöpfe, dunkelblaue Halle mit Warnstreifen, Leuchtanzeigen auf Maschinen und Lager, Metallscheibe an der Quelle, Punkte für den Fortschritt am Lager, Boden auf zwei Felder ausgerichtet.
- Titelbildschirm mit `titelbild` (ab dem zweiten Besuch; beim ersten Mal zeigt die Einführung das Titelbild), Level-Auswahl mit großen Kapitelbildern, Start-Knopf am Desktop immer sichtbar, Spielfeld am Handy größer, leere Sterne grau.
- Sobald die Bilder aus `docs/ZAHLENFABRIK-PROMPTS.md` da sind, ersetzen sie die gezeichneten Formen (Platten, Knöpfe, Display).
