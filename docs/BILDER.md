# Bilder für die Simulationen

Einige Simulationen können Fotos bzw. gerenderte Bilder verwenden, damit sie hochwertiger aussehen. **Alle Bilder sind optional:** Fehlt eine Datei, zeichnet die Simulation eine eigene Ersatzgrafik. Man kann die Bilder also nach und nach ergänzen.

## So werden Bilder eingebunden

1. Bild mit dem Prompt unten erzeugen (die Prompts sind auf Englisch, weil die meisten Bildgeneratoren damit am besten arbeiten).
2. Auf die angegebene Größe zuschneiden und als **WebP** speichern (Qualität ca. 85). Bei „transparent“ muss der Hintergrund wirklich transparent sein (Alpha-Kanal) – ggf. mit einem Freistellungswerkzeug nachbearbeiten.
3. Datei unter dem angegebenen Pfad ablegen, z. B. `src/assets/sims/ziegenproblem/ziege.webp`.
4. `npm run verify` – fertig. Der Build findet die Datei automatisch.

**Allgemeine Regeln**

- Keine Schrift, keine Logos, keine Wasserzeichen, keine echten Marken (Autohersteller, Münzen echter Währungen).
- Personen nur nach diesen Regeln (Entscheidung der Projektleitung vom 28.10.2026, vorher waren Personen ganz ausgeschlossen):
  - eindeutig erfundene Menschen, fotorealistisch, keine Ähnlichkeit mit realen Personen, keine Prominenten
  - von der Seite oder von hinten, keine Nahaufnahme von Gesichtern; Hände nur, wo der Gegenstand es verlangt (Griff)
  - Kinder und Jugendliche nur in Alltagskleidung bei alltäglichen Tätigkeiten
  - über alle Bilder hinweg vielfältig gemischt (Hautfarbe, Geschlecht)
  - kein Text, keine Logos auf der Kleidung
  - die Kennzeichnung als KI-Bild steht auf der Seite „Über das Projekt“
- Einheitlicher Stil: fotorealistisch, weiches Studiolicht, freundlich, nicht kitschig.
- Dateigröße höchstens 300 KB (Schulnetze!); ein Test in `tests/simulations.test.ts` prüft das. Bilder nur so groß anlegen, wie sie höchstens gezeichnet werden (Gerätepixel), und unbenutzte Bildteile einfarbig lassen.
- Bitte nur Bilder verwenden, die frei genutzt werden dürfen (selbst erzeugt oder mit passender Lizenz).
- Herkunft, Prüfung aller Bilder und Rechtslage: `docs/BILDRECHTE.md`.

## Herkunft und Rechte

Ausführlich (Durchsicht aller Bilder, Rechtslage, offene Fragen): `docs/BILDRECHTE.md`. Kurz: alle Fotos selbst mit KI erzeugt, Prompt zu jedem Bild, keine fremden Vorlagen, Marken oder Personen; Vorbild-Bilder fremder Designer kommen nicht ins Repository.

## Übersicht

Stand Oktober 2026: Alle Bilder dieser Tabelle sind vorhanden. Neue Einträge kommen unten dazu; ob eine Datei schon existiert, zeigt der Ordner `src/assets/sims/`.

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
| Licht und Schatten | `sun` | `src/assets/sims/licht-schatten/sonne.webp` | 1024 × 1024 | transparent |
| Licht und Schatten | `earth` | `src/assets/sims/licht-schatten/erde.webp` | 1024 × 1024 | transparent |
| Licht und Schatten | `moon` | `src/assets/sims/licht-schatten/mond.webp` | 1024 × 1024 | transparent |
| Planetenbahnen | `sun` | `src/assets/sims/planetenbahnen/sonne.webp` | 1024 × 1024 | transparent |
| Planetenbahnen | `planet` | `src/assets/sims/planetenbahnen/erde.webp` | 1024 × 1024 | transparent |
| Bewegungsdiagramme | `car` | `src/assets/sims/bewegungsdiagramme/auto.webp` | 1600 × 686 | transparent |
| Bewegungsdiagramme | `road` | `src/assets/sims/bewegungsdiagramme/strasse.webp` | 2400 × 392 | deckend |
| Freier Fall | `ball` | `src/assets/sims/freier-fall/kugel.webp` | 256 × 256 | transparent |
| Freier Fall | `ruler` | `src/assets/sims/freier-fall/lineal.webp` | 96 × 1063 | transparent |
| Fadenpendel | `stand` | `src/assets/sims/fadenpendel/stativ.webp` | 183 × 520 | transparent |
| Federpendel | `stand` | `src/assets/sims/federpendel/stativ.webp` | 183 × 520 | transparent |
| Federpendel | `mass` | `src/assets/sims/federpendel/gewicht.webp` | 161 × 410 | transparent |
| Hookesches Gesetz | `stand` | `src/assets/sims/hookesches-gesetz/stativ.webp` | 183 × 520 | transparent |
| Hebelgesetz | `mass` | `src/assets/sims/hebelgesetz/gewicht.webp` | 161 × 410 | transparent |
| Hebelgesetz | `barrow` | `src/assets/sims/hebelgesetz/schubkarre.webp` | 557 × 237 | transparent |
| Kräfteaddition | `lamp` | `src/assets/sims/kraefteaddition/lampe.webp` | 267 × 447 | transparent |
| Schiefe Ebene | `block` | `src/assets/sims/schiefe-ebene/holzklotz.webp` | 1600 × 410 | transparent |
| Schiefe Ebene | `board` | `src/assets/sims/schiefe-ebene/brett.webp` | 677 × 68 | deckend |
| Stöße | `track` | `src/assets/sims/stoesse/bahn.webp` | 628 × 54 | transparent |
| Resonanz | `wheel` | `src/assets/sims/resonanz/rad.webp` | 384 × 376 | transparent |
| Wellenausbreitung | `ball` | `src/assets/sims/wellen-ausbreitung/kugel.webp` | 202 × 201 | transparent |
| Achterbahn | `land` | `src/assets/sims/energieerhaltung/landschaft.webp` | 1003 × 126 | transparent oben |
| Achterbahn | `mid` | `src/assets/sims/energieerhaltung/wagen-mitte.webp` | 660 × 390 | transparent |
| Achterbahn | `station` | `src/assets/sims/energieerhaltung/station.webp` | 1200 × 455 | transparent |
| Achterbahn | `pano` | `src/assets/sims/energieerhaltung/landschaft-panorama.webp` | 3000 × 230 | transparent oben |
| Achterbahn | `night` | `src/assets/sims/energieerhaltung/himmel-abend.webp` | 1920 × 1200 | deckend |
| Einfacher Stromkreis | `battery` | `src/assets/sims/einfacher-stromkreis/batterie.webp` | 350 × 307 | transparent |
| Einfacher Stromkreis | `bulb` | `src/assets/sims/einfacher-stromkreis/gluehlampe.webp` | 250 × 445 | transparent |
| Einfacher Stromkreis | `switch` | `src/assets/sims/einfacher-stromkreis/schalter.webp` | 415 × 254 | transparent |
| Einfacher Stromkreis | `motor` | `src/assets/sims/einfacher-stromkreis/motor.webp` | 382 × 312 | transparent |
| Einfacher Stromkreis | `bell` | `src/assets/sims/einfacher-stromkreis/klingel.webp` | 302 × 398 | transparent |
| Reihen- und Parallelschaltung | `battery` | `src/assets/sims/reihe-parallel/batterie.webp` | 350 × 307 | transparent |
| Reihen- und Parallelschaltung | `bulb` | `src/assets/sims/reihe-parallel/gluehlampe.webp` | 250 × 445 | transparent |
| Reihen- und Parallelschaltung | `resistor` | `src/assets/sims/reihe-parallel/widerstand.webp` | 788 × 96 | transparent |
| Ohmsches Gesetz | `supply` | `src/assets/sims/ohmsches-gesetz/netzgeraet.webp` | 347 × 251 | transparent |
| Ohmsches Gesetz | `meter` | `src/assets/sims/ohmsches-gesetz/messgeraet.webp` | 322 × 321 | transparent |
| Licht und Schatten | `lamp` | `src/assets/sims/licht-schatten/lampe.webp` | 448 × 206 | transparent |
| Licht und Schatten | `sky` | `src/assets/sims/licht-schatten/sternenhimmel.webp` | 1400 × 1400 | deckend |
| Planetenbahnen | `sky` | `src/assets/sims/planetenbahnen/sternenhimmel.webp` | 1400 × 1400 | deckend |
| Reflexion | `candle` | `src/assets/sims/reflexion/kerze.webp` | 540 × 1352 | transparent |
| Reflexion | `laser` | `src/assets/sims/reflexion/laser.webp` | 700 × 200 | transparent |
| Linsen | `candle` | `src/assets/sims/linsen/kerze.webp` | 540 × 1352 | transparent |
| Linsen | `lens` | `src/assets/sims/linsen/linse.webp` | 97 × 731 | transparent |
| Doppler-Effekt | `road` | `src/assets/sims/doppler-effekt/strasse.webp` | 1800 × 890 | deckend |
| Waagemodell | `stand` | `src/assets/sims/waagemodell/waage.webp` | 314 × 332 | transparent |
| Waagemodell | `pan` | `src/assets/sims/waagemodell/schale.webp` | 199 × 291 | transparent |
| Waagemodell | `box` | `src/assets/sims/waagemodell/paeckchen.webp` | 291 × 293 | transparent |
| Waagemodell | `weight` | `src/assets/sims/waagemodell/gewicht.webp` | 284 × 401 | transparent |
| Zahlengerade | `sea` | `src/assets/sims/zahlengerade/meer.webp` (ersetzt, schon in BILDER.md) | 1024 × 1024 | deckend |
| Umfang und Flächeninhalt | `ant` | `src/assets/sims/umfang-flaeche/ameise.webp` | 256 × 221 | transparent |
| Gesetz der großen Zahlen | `die` | `src/assets/sims/gesetz-grosse-zahlen/wuerfel.webp` | 338 × 312 | transparent |
| Extremwertaufgaben | `grass` | `src/assets/sims/extremwert-parabel/wiese.webp` | 900 × 900 | deckend |
| Extremwertaufgaben | `wall` | `src/assets/sims/extremwert-parabel/mauer.webp` | 677 × 118 | deckend |
| Extremwertaufgaben | `wood` | `src/assets/sims/extremwert-parabel/holzdreieck.webp` (ersetzt, schon in BILDER.md) | 1173 × 1186 | transparent |
| Extremwertaufgaben | `metal` | `src/assets/sims/extremwert-parabel/blech.webp` (ersetzt, schon in BILDER.md) | 1536 × 512 | deckend |
| Parabel durch drei Punkte | `ball` | `src/assets/sims/parabel-drei-punkte/ball.webp` | 255 × 256 | transparent |
| Parabel durch drei Punkte | `river` | `src/assets/sims/parabel-drei-punkte/fluss.webp` | 2400 × 1187 | deckend |
| LGS grafisch lösen | `phone` | `src/assets/sims/lgs-grafisch/handy.webp` | 265 × 565 | transparent |
| Einfacher Stromkreis | `clamp` | `src/assets/sims/einfacher-stromkreis/krokodilklemme.webp` | 1600 × 310 | transparent |
| Einfacher Stromkreis | `clip` | `src/assets/sims/einfacher-stromkreis/bueroklammer.webp` | 1600 × 354 | transparent |
| Einfacher Stromkreis | `coin` | `src/assets/sims/einfacher-stromkreis/muenze.webp` | 1252 × 1251 | transparent |
| Einfacher Stromkreis | `lead` | `src/assets/sims/einfacher-stromkreis/bleistiftmine.webp` | 1600 × 35 | transparent |
| Einfacher Stromkreis | `foil` | `src/assets/sims/einfacher-stromkreis/alufolie.webp` | 1600 × 228 | transparent |
| Einfacher Stromkreis | `wood` | `src/assets/sims/einfacher-stromkreis/holzstab.webp` | 1600 × 121 | transparent |
| Einfacher Stromkreis | `eraser` | `src/assets/sims/einfacher-stromkreis/radiergummi.webp` | 1600 × 517 | transparent |
| Einfacher Stromkreis | `ruler` | `src/assets/sims/einfacher-stromkreis/kunststofflineal.webp` | 1600 × 180 | transparent |
| Einfacher Stromkreis | `glass` | `src/assets/sims/einfacher-stromkreis/glasstab.webp` | 1600 × 107 | transparent |
| Gasgesetze | `gauge` | `src/assets/sims/gasgesetze/manometer.webp` | 1011 × 1236 | transparent |
| Gasgesetze | `thermo` | `src/assets/sims/gasgesetze/thermometer.webp` | 200 × 1410 | transparent |
| Gasgesetze | `plate` | `src/assets/sims/gasgesetze/heizplatte.webp` | 1600 × 303 | transparent |
| Gasgesetze | `table` | `src/assets/sims/gasgesetze/tischkante.webp` | 2172 × 271 | deckend |
| Teilchenmodell | `thermo` | `src/assets/sims/teilchenmodell/thermometer.webp` | 200 × 1410 | transparent |
| Teilchenmodell | `plate` | `src/assets/sims/teilchenmodell/heizplatte.webp` | 1600 × 303 | transparent |
| Teilchenmodell | `pipette` | `src/assets/sims/teilchenmodell/pipette.webp` | 216 × 1423 | transparent |
| Teilchenmodell | `table` | `src/assets/sims/teilchenmodell/tischkante.webp` | 2172 × 271 | deckend |
| Linsen | `rider` | `src/assets/sims/linsen/reiter.webp` | 1257 × 769 | transparent |
| Linsen | `rail` | `src/assets/sims/linsen/optische-bank.webp` | 1600 × 107 | transparent |
| Reflexion | `table` | `src/assets/sims/reflexion/tischkante.webp` | 2172 × 271 | deckend |
| Licht und Schatten | `rider` | `src/assets/sims/licht-schatten/reiter.webp` | 1257 × 769 | transparent |
| Licht und Schatten | `rail` | `src/assets/sims/licht-schatten/optische-bank.webp` | 1600 × 107 | transparent |
| Elektromagnetische Induktion | `magnet` | `src/assets/sims/induktion/stabmagnet.webp` | 1600 × 233 | transparent |
| Elektromagnetische Induktion | `coil` | `src/assets/sims/induktion/spule.webp` | 1215 × 742 | transparent |
| Radioaktiver Zerfall | `tube` | `src/assets/sims/radioaktiver-zerfall/zaehlrohr.webp` | 1600 × 181 | transparent |
| Radioaktiver Zerfall | `counter` | `src/assets/sims/radioaktiver-zerfall/zaehlgeraet.webp` | 1277 × 886 | transparent |
| Stehende Wellen | `driver` | `src/assets/sims/stehende-wellen/erreger.webp` | 839 × 906 | transparent |
| Stehende Wellen | `pulley` | `src/assets/sims/stehende-wellen/umlenkrolle.webp` | 491 × 1446 | transparent |
| Lorentzkraft | `tube` | `src/assets/sims/lorentzkraft/fadenstrahlrohr.webp` | 913 × 1166 | transparent |
| Photoeffekt | `meter` | `src/assets/sims/photoeffekt/manometer.webp` | 1011 × 1236 | transparent |
| Linienspektren | `prism` | `src/assets/sims/linienspektren/prisma.webp` | 1244 × 1050 | transparent |
| Zehnerpotenzen | `sand` | `src/assets/sims/zehnerpotenzen/sandkorn.webp` | 1280 × 973 | transparent |
| Zehnerpotenzen | `bug` | `src/assets/sims/zehnerpotenzen/marienkaefer.webp` | 1378 × 735 | transparent |
| Zehnerpotenzen | `apple` | `src/assets/sims/zehnerpotenzen/apfel.webp` | 1051 × 1115 | transparent |
| Zehnerpotenzen | `house` | `src/assets/sims/zehnerpotenzen/haus.webp` | 1288 × 1092 | transparent |
| Zehnerpotenzen | `field` | `src/assets/sims/zehnerpotenzen/fussballfeld.webp` | 1600 × 358 | transparent |
| Zehnerpotenzen | `peak` | `src/assets/sims/zehnerpotenzen/berg.webp` | 1280 × 852 | transparent |
| Zehnerpotenzen | `plane` | `src/assets/sims/zehnerpotenzen/flugzeug.webp` | 1600 × 442 | transparent |
| Zehnerpotenzen | `iss` | `src/assets/sims/zehnerpotenzen/raumstation.webp` | 1280 × 606 | transparent |
| Zehnerpotenzen | `earth` | `src/assets/sims/zehnerpotenzen/erde.webp` | 1000 × 1000 | transparent |
| Zehnerpotenzen | `cloud` | `src/assets/sims/zehnerpotenzen/wolke.webp` | 1600 × 660 | transparent |
| Maßstab | `bug` | `src/assets/sims/massstab/marienkaefer-oben.webp` | 1066 × 995 | transparent |
| Maßstab | `stamp` | `src/assets/sims/massstab/briefmarke.webp` | 921 × 1254 | transparent |
| Maßstab | `sand` | `src/assets/sims/massstab/sandkorn.webp` | 1280 × 973 | transparent |
| Maßstab | `lupe` | `src/assets/sims/massstab/lupe.webp` | 1000 × 994 | transparent |
| Zahlengerade | `frog` | `src/assets/sims/zahlengerade/frosch.webp` | 1045 × 899 | transparent |
| Zahlengerade | `piggy` | `src/assets/sims/zahlengerade/sparschwein.webp` | 1326 × 979 | transparent |
| Zahlengerade | `penguin` | `src/assets/sims/zahlengerade/pinguin.webp` | 775 × 1372 | transparent |
| Zahlengerade | `thermo` | `src/assets/sims/zahlengerade/thermometer.webp` | 200 × 1410 | transparent |
| Strahlensätze | `tree` | `src/assets/sims/strahlensaetze/baum.webp` | 666 × 1000 | transparent |
| Strahlensätze | `crown` | `src/assets/sims/strahlensaetze/baumkrone.webp` | 450 × 440 | transparent |
| Prozentstreifen | `tag` | `src/assets/sims/prozentstreifen/preisschild.webp` | 1600 × 615 | transparent |
| Prozentstreifen | `receipt` | `src/assets/sims/prozentstreifen/kassenbon.webp` | 754 × 1336 | transparent |
| Sinus, Kosinus, Tangens | `wheelchair` | `src/assets/sims/sin-cos-tan-dreieck/rollstuhl.webp` | 1279 × 1086 | transparent |
| Sinus, Kosinus, Tangens | `bricks` | `src/assets/sims/sin-cos-tan-dreieck/ziegelwand.webp` | 1024 × 1024 | deckend |
| Sinussatz und Kosinussatz | `crown` | `src/assets/sims/sinussatz-kosinussatz/baumkrone.webp` | 450 × 440 | transparent |
| Integral als Gesamtänderung | `car` | `src/assets/sims/aenderungsrate/auto.webp` | 1600 × 686 | transparent |
| Integral als Gesamtänderung | `bike` | `src/assets/sims/aenderungsrate/fahrrad.webp` | 1280 × 701 | transparent |
| Ähnliche Figuren | `car` | `src/assets/sims/vergroessern/auto.webp` | 1600 × 686 | transparent |
| Ähnliche Figuren | `bucket` | `src/assets/sims/vergroessern/farbeimer.webp` | 1055 × 1226 | transparent |
| Proportionalität | `apple` | `src/assets/sims/proportional/apfel.webp` | 320 × 339 | transparent |
| Proportionalität | `taxi` | `src/assets/sims/proportional/taxi.webp` | 1600 × 582 | transparent |
| Mittelsenkrechte und Winkelhalbierende | `compass` | `src/assets/sims/mittelsenkrechte/zirkel-teile.webp` | 459 × 1038 | transparent |
| Mittelsenkrechte und Winkelhalbierende | `pencil` | `src/assets/sims/mittelsenkrechte/bleistift.webp` | 1600 × 120 | transparent |
| Besondere Linien im Dreieck | `compass` | `src/assets/sims/besondere-linien/zirkel-teile.webp` | 459 × 1038 | transparent |
| Besondere Linien im Dreieck | `pencil` | `src/assets/sims/besondere-linien/bleistift.webp` | 1600 × 120 | transparent |
| Dreieckskonstruktion | `compass` | `src/assets/sims/dreieckskonstruktion/zirkel-teile.webp` | 459 × 1038 | transparent |
| Dreieckskonstruktion | `pencil` | `src/assets/sims/dreieckskonstruktion/bleistift.webp` | 1600 × 120 | transparent |
| Zählprinzip | `cone` | `src/assets/sims/zaehlprinzip/waffel.webp` | 679 × 1317 | transparent |
| Zählprinzip | `lock` | `src/assets/sims/zaehlprinzip/zahlenschloss.webp` | 796 × 1145 | transparent |
| Waagemodell | `table` | `src/assets/sims/waagemodell/tischkante.webp` | 2172 × 271 | deckend |
| Einheiten umrechnen | `clock` | `src/assets/sims/einheiten/uhr.webp` | 1234 × 1234 | transparent |
| Winkel schätzen und messen | `geo` | `src/assets/sims/winkel-messen/geodreieck.webp` | 1482 × 750 | transparent |
| Koordinatensystem – Lagebeziehungen | `geo` | `src/assets/sims/koordinaten-lage/geodreieck.webp` | 1482 × 750 | transparent |
| Gesetz der großen Zahlen | `dieTop` | `src/assets/sims/gesetz-grosse-zahlen/wuerfel-oben.webp` | 1041 × 1016 | transparent |
| Bewegungsdiagramme | `cloud` | `src/assets/sims/bewegungsdiagramme/wolke.webp` | 1600 × 660 | transparent |
| Freier Fall | `tube` | `src/assets/sims/freier-fall/fallroehre.webp` | 346 × 1454 | transparent |
| Freier Fall | `gauge` | `src/assets/sims/freier-fall/manometer.webp` | 1011 × 1236 | transparent |
| Schiefer Wurf | `tt` | `src/assets/sims/schiefer-wurf/tischtennisball.webp` | 255 × 256 | transparent |
| Schiefer Wurf | `kugel` | `src/assets/sims/schiefer-wurf/stosskugel.webp` | 256 × 255 | transparent |
| Schiefer Wurf | `target` | `src/assets/sims/schiefer-wurf/zielscheibe.webp` | 918 × 1186 | transparent |
| Kräfteaddition | `shirt` | `src/assets/sims/kraefteaddition/t-shirt.webp` | 1220 × 1132 | transparent |
| Kräfteaddition | `meter` | `src/assets/sims/kraefteaddition/kraftmesser.webp` | 1600 × 170 | transparent |
| Kräfteaddition | `table` | `src/assets/sims/kraefteaddition/tischkante.webp` | 2172 × 271 | deckend |
| Schiefe Ebene | `blockSteel` | `src/assets/sims/schiefe-ebene/klotz-stahl.webp` | 1600 × 438 | transparent |
| Schiefe Ebene | `blockRubber` | `src/assets/sims/schiefe-ebene/klotz-gummi.webp` | 1600 × 380 | transparent |
| Schiefe Ebene | `boardSteel` | `src/assets/sims/schiefe-ebene/brett-stahl.webp` | 2172 × 274 | deckend |
| Schiefe Ebene | `boardIce` | `src/assets/sims/schiefe-ebene/brett-eis.webp` | 2172 × 392 | deckend |
| Schiefe Ebene | `cart` | `src/assets/sims/schiefe-ebene/wagen.webp` | 1600 × 249 | transparent |
| Schiefe Ebene | `wheel` | `src/assets/sims/schiefe-ebene/wagen-rad.webp` | 1234 × 1242 | transparent |
| Schiefe Ebene | `meter` | `src/assets/sims/schiefe-ebene/kraftmesser.webp` | 1600 × 170 | transparent |
| Schiefe Ebene | `table` | `src/assets/sims/schiefe-ebene/tischkante.webp` | 2172 × 271 | deckend |
| Hebelgesetz | `beamSeg` | `src/assets/sims/hebelgesetz/hebel-segment.webp` | 1600 × 213 | transparent |
| Hebelgesetz | `beamEnd` | `src/assets/sims/hebelgesetz/hebel-ende.webp` | 1600 × 325 | transparent |
| Hebelgesetz | `meter` | `src/assets/sims/hebelgesetz/kraftmesser.webp` | 1600 × 170 | transparent |
| Hebelgesetz | `table` | `src/assets/sims/hebelgesetz/tischkante.webp` | 2172 × 271 | deckend |
| Hebelgesetz | `bottle` | `src/assets/sims/hebelgesetz/flasche.webp` | 882 × 1414 | transparent |
| Hebelgesetz | `nut` | `src/assets/sims/hebelgesetz/walnuss.webp` | 1075 × 1173 | transparent |
| Hebelgesetz | `nutArm` | `src/assets/sims/hebelgesetz/nussknacker-arm.webp` | 1600 × 187 | transparent |
| Hebelgesetz | `stand` | `src/assets/sims/hebelgesetz/wippe-gestell.webp` | 1278 × 965 | transparent |
| Hebelgesetz | `board` | `src/assets/sims/hebelgesetz/brett.webp` | 677 × 68 | deckend |
| Hookesches Gesetz | `piece` | `src/assets/sims/hookesches-gesetz/massestueck.webp` | 1600 × 146 | transparent |
| Hookesches Gesetz | `table` | `src/assets/sims/hookesches-gesetz/tischkante.webp` | 2172 × 271 | deckend |
| Stöße | `glider` | `src/assets/sims/stoesse/gleiter.webp` | 1600 × 363 | transparent |
| Stöße | `piece` | `src/assets/sims/stoesse/massestueck.webp` | 1600 × 146 | transparent |
| Stöße | `table` | `src/assets/sims/stoesse/tischkante.webp` | 2172 × 271 | deckend |
| Kreisbewegung | `car` | `src/assets/sims/kreisbewegung/auto-oben.webp` | 1600 × 801 | transparent |
| Kreisbewegung | `asphalt` | `src/assets/sims/kreisbewegung/asphalt.webp` | 768 × 768 | deckend |
| Doppler-Effekt | `ambulance` | `src/assets/sims/doppler-effekt/krankenwagen.webp` | 1600 × 735 | transparent |
| Hebelgesetz | `opener` | `src/assets/sims/hebelgesetz/flaschenoeffner.webp` | 1600 × 140 | transparent |
| Zahlengerade | `iceberg` | `src/assets/sims/zahlengerade/eisberg.webp` | 558 × 1400 | transparent |
| Teilchenmodell | `beaker` | `src/assets/sims/teilchenmodell/becherglas.webp` | 816 × 1000 | transparent |
| Baumdiagramm | `urn` | `src/assets/sims/baumdiagramm/urne.webp` | 1000 × 886 | transparent |
| Sinus, Kosinus, Tangens | `ladder` | `src/assets/sims/sin-cos-tan-dreieck/leiter.webp` | 198 × 1600 | transparent |
| Schiefe Ebene | `boardAsphalt` | `src/assets/sims/schiefe-ebene/brett-asphalt.webp` | 2160 × 216 | deckend |
| Strahlensätze | `pole` | `src/assets/sims/strahlensaetze/fluchtstab.webp` | 97 × 1499 | transparent |
| Prozentstreifen | `book` | `src/assets/sims/prozentstreifen/sparbuch.webp` | 1200 × 799 | transparent |

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

### `stativ.webp` – Laborstativ

Aufhängung des Pendels (statt der gezeichneten Decke). Fuß unten, senkrechte Stange, oben kurzer Ausleger **nach rechts**; die Simulation spiegelt das Stativ bei Bedarf und streckt nur Stange und Ausleger (gleichförmige Metallstäbe), Fuß und Klemme bleiben unverzerrt (`src/sim-core/lab-stand.ts`). Gleiche Datei wie bei Federpendel und Hookeschem Gesetz.

> A physics lab stand with a heavy dark base, vertical steel rod and a short horizontal clamp arm at the top pointing right, front view, isolated on a transparent background, photorealistic

## Achterbahn (Energieerhaltung)

### `wagen.webp` – Wagen

Wird entlang der Schiene gedreht. Seitenansicht, Fahrtrichtung nach **rechts**, die Räder liegen genau auf dem **unteren Bildrand** (dort sitzt die Schiene).

> Side view of a single empty modern roller coaster car facing right, bright red with yellow details, empty seats with safety bars, visible wheels at the very bottom edge of the image, no people, no track, no logos, no text, isolated on a transparent background, photorealistic, aspect ratio 1.9:1

### `himmel.webp` – Himmel

Füllt den Hintergrund; unten wird ein Wiesenstreifen darübergezeichnet.

> Bright summer sky with soft cumulus clouds, a faint distant amusement park skyline with a Ferris wheel along the bottom edge, gentle colours, no people, no text, no logos, photorealistic, 16:10

### `landschaft.webp` – Parklandschaft

Panoramastreifen eines Freizeitparks mit durchsichtigem Himmel. Liegt über dem Himmel am unteren Rand hinter der Bahn: volle Breite der Szene (Seitenverhältnis bleibt), die Unterkante reicht knapp in den gezeichneten Wiesenstreifen. Vorab skaliert; im Dunkelmodus wie der Himmel abgedunkelt. Die Auflösung (1003 px breit) reicht für den Hintergrund knapp.

> Wide panoramic strip of a summer amusement park landscape, green rolling grass and a few trees at the bottom, transparent sky above, side view, photorealistic

Die folgenden vier Bilder gehören zur Mega-Bahn bzw. zum Dunkelmodus (Oktober 2026, mit einem KI-Bildwerkzeug erzeugt; der Mittelwagen mit `wagen.webp` als Vorlage für Form und Farben). Beim Einbau wurde jeweils der leere durchsichtige Rand oben abgeschnitten.

### `wagen-mitte.webp` – Mittelwagen

Mittlerer und hinterer Wagen des Zugs auf der Mega-Bahn: gleiche Höhe wie der vordere Wagen (`wagen.webp`), Breite nach Seitenverhältnis, Räder genau am unteren Bildrand. Ersatz ohne Bild: das Wagenbild ohne die Spitze.

> Strict orthographic side view (camera exactly perpendicular, no perspective, no tilt) of a single empty middle car of a modern steel roller coaster train, facing right. The car has NO nose and NO front fairing: both ends are flat and vertical, with a short dark grey metal coupling bar sticking out at the left end and at the right end at axle height, cut off by the image border. Glossy bright red fibreglass body (signal red, like a sports car, slightly metallic clear coat) with two sweeping thin golden-yellow racing stripes along the side, running horizontally from end to end and slightly rising toward the front. Two rows of empty seats one behind the other, black padded seats, each row with a black over-the-shoulder safety restraint with yellow grab handles, restraints in the closed, locked position. Below the body a dark grey steel chassis with two bogies, one under each end, each bogie with two large polyurethane road wheels (dark grey tyre, silver hub) on top and smaller up-stop wheels below, as on real steel coasters. The lowest wheels touch the bottom edge of the image exactly. The car fills the image width almost completely, from left border to right border. Soft, even daylight from the upper left, gentle reflections on the red paint, a very subtle contact shadow is NOT included. No track, no rails, no ground, no people, no text, no logos, no numbers, no stickers. Isolated on a fully transparent background (alpha channel), clean crisp edges, photorealistic product render, high detail, aspect ratio 1.29:1.

### `station.webp` – Station

Steht auf dem waagerechten Anfangsstück der Mega-Bahn hinter der Schiene; der Bahnsteigboden (gelbe Kante, bei etwa 79 % der Bildhöhe nach dem Zuschnitt) liegt auf Höhe der Schiene, etwas breiter als das waagerechte Stück. Im Dunkelmodus abgedunkelt. Ersatz ohne Bild: gezeichnetes Dach mit Aufschrift „Start“.

> Strict orthographic side view (no perspective) of a small modern open-air roller coaster boarding station standing on an elevated platform high above the ground, like the loading station at the top of a steel coaster. Composition from bottom to top: at the bottom a horizontal concrete-and-steel platform slab spanning the full image width, its top surface (the boarding floor) exactly at 85 percent of the image height measured from the top, its underside at the bottom edge; on the platform a row of thin vertical steel columns painted dark anthracite grey, a simple yellow-and-black safety railing along the back edge of the platform, a few turnstile gates at the back, warm wood panelling on the rear wall, two or three small round lamps; on top a wide, flat, slightly overhanging cantilevered roof in glossy signal red (same red as a red roller coaster car), with a thin white fascia strip along its front edge and subtle LED strip lighting under the roof edge. The station is open at the front (toward the viewer) and at both short ends, so a train could pass straight through it from left to right. Sunny summer daylight from the upper left, soft shadows under the roof. No train, no track, no rails, no people, no text, no signs with letters, no logos, no ground, no sky. Isolated on a fully transparent background (alpha channel), clean crisp edges, photorealistic architectural render, aspect ratio 15:8.

### `landschaft-panorama.webp` – Panorama

Landschaft, die beim Mitfahren (Mega-Bahn) langsamer vorbeizieht als die Bahn (Parallaxe). Feste Höhe (etwa ein Viertel der Szene), abwechselnd gespiegelt aneinandergesetzt, weil die Ränder nicht pixelgenau zusammenpassen. Ersatz ohne Bild: `landschaft.webp`.

> Ultra-wide seamless horizontally tileable panoramic landscape strip (left and right edges must match perfectly so the image can be repeated endlessly), side view at eye level, for use as a parallax background layer behind a roller coaster. Content: a lush green summer amusement park landscape seen from far away: gently rolling meadow hills, clusters of deciduous trees (oaks, beeches, birches) in varied greens, a few tall poplars, small bushes; far in the distance and small, partly hidden behind trees, a few colourful amusement park attractions: a Ferris wheel, a drop tower, a carousel roof with a striped tent top, colourful flags, a small lake reflection between trees; the attractions are hazy from atmospheric perspective, lighter and slightly bluish, so they stay in the background. The silhouette of trees and hills varies in height along the strip and fills only the lower half of the image; the bottom edge is a continuous band of green grass across the full width. Everything above the tree line is fully transparent (alpha channel), no sky, no clouds, no sun. Bright, warm summer afternoon light from the left, soft shadows. No roller coaster track in the foreground, no people, no text, no logos, no signs, no buildings with letters. Photorealistic, high detail, clean cut-out edges along the tree line, aspect ratio 10:1.

### `himmel-abend.webp` – Abendhimmel

Himmel im Dunkelmodus (alle Bahnen), nur leicht abgedunkelt. Ersatz ohne Bild: der abgedunkelte Taghimmel.

> Wide evening sky over an amusement park at blue hour, about twenty minutes after sunset, for use as a dark-mode background. Gradient from deep navy blue and indigo at the top to a soft violet and warm, muted orange glow just above the horizon at the very bottom edge of the image. A few thin, softly lit wispy clouds catching the last pink and peach light, more concentrated in the lower third. The first faint stars visible in the upper part of the sky, very subtle, small. Along the very bottom edge only a faint, tiny, hazy glow of distant amusement park lights (warm points of light, a barely visible Ferris wheel silhouette with tiny lights), nothing else in the foreground, no ground, no trees, the horizon line exactly at the bottom edge. Calm, atmospheric, not too bright overall so that white text and coloured graphics stay readable on top of it. No moon, no people, no text, no logos, no lens flare. Photorealistic, smooth gradients without banding, high detail, aspect ratio 16:10.

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

### `kugel.webp` – Stahlkugel

Kugel im Fallturm (auch Stroboskopbilder) und in der Fallröhre; die Kugel füllt das quadratische Bild randlos. Gezeichnet mit 6–12 px Radius; ein heller Saum hält sie vor dem dunklen Fallturm sichtbar.

> A polished steel ball, perfectly round, bright specular highlight, isolated on a transparent background, photorealistic

### `lineal.webp` – Holzlineal

Reaktionstest. Verwendet wird nur der **Mittelstreifen ohne Teilstriche** als Holzmaserung (unverzerrt vergrößert); Skala, Zahlen und ms-Skala zeichnet die Simulation selbst, weil die Striche des Fotos nicht gleichmäßig sind.

> A wooden school ruler standing vertically, light beech wood with black millimetre tick marks but no numbers, front view, isolated on a transparent background, photorealistic

## Licht und Schatten

Alle drei Bilder sind kreisrunde Himmelskörper, die das quadratische Bild **randlos ausfüllen** (der Kreis berührt alle vier Bildkanten), außerhalb transparent. Erde und Mond müssen **gleichmäßig von vorn beleuchtet** sein (ohne Nachtseite, ohne Schattenkante) – Tag und Nacht, Mondphasen und Finsternisschatten berechnet die Simulation selbst und legt sie darüber.

### `sonne.webp` – Sonne

Wird als große, leuchtende Kugel am linken Rand gezeichnet; einen Lichtschein ergänzt die Simulation.

> The Sun as a perfectly round glowing disc, yellow-orange surface with fine granulation and slight limb darkening towards the edge, no flares or prominences beyond the disc, no corona, the disc fills the entire square image edge to edge, isolated on a transparent background, photorealistic, no text

### `erde.webp` – Erde

Blick **von oben auf den Nordpol** (Arktis in der Bildmitte), weil die Simulation die Bahnebene von Norden aus zeigt.

> The planet Earth seen from space directly above the North Pole, Arctic sea ice in the centre, surrounding continents and blue oceans with some white clouds, evenly lit from the front with no night side and no terminator, perfectly round, the globe fills the entire square image edge to edge, isolated on a transparent background, photorealistic, no text

### `mond.webp` – Mond

Vorderseite des Vollmonds, **Norden oben**. Wird auch im Fenster „Blick zum Mond“ verwendet (Mondphasen und rötlicher Mond bei einer Mondfinsternis entstehen durch die Simulation).

> The full Moon, near side as seen from Earth with north up, grey surface with dark maria and bright craters such as Tycho, evenly lit from the front with no shadow and no terminator, perfectly round, the Moon fills the entire square image edge to edge, isolated on a transparent background, photorealistic, no text

## Planetenbahnen

Beide Bilder sind **dieselben Dateien wie bei „Licht und Schatten“** (gleicher Prompt, gleiche Größe) – liegen sie dort schon vor, genügt es, sie nach `src/assets/sims/planetenbahnen/` zu kopieren. Kreisrunde Himmelskörper, die das quadratische Bild **randlos ausfüllen**, außerhalb transparent. Beide werden klein gezeichnet (Stern etwa 10–30 px, Planet etwa 13–16 px Durchmesser); den Lichtschein der Sonne und die Nachtseite des Planeten (zum Stern abgewandte Hälfte) ergänzt die Simulation.

### `sonne.webp` – Sonne

Der Zentralstern im Brennpunkt der Bahn.

> The Sun as a perfectly round glowing disc, yellow-orange surface with fine granulation and slight limb darkening towards the edge, no flares or prominences beyond the disc, no corona, the disc fills the entire square image edge to edge, isolated on a transparent background, photorealistic, no text

### `erde.webp` – Planet (Erde)

Blick **von oben auf den Nordpol**, passend zur Draufsicht auf die Bahnebene (der Planet läuft gegen den Uhrzeigersinn). **Gleichmäßig von vorn beleuchtet**, ohne Nachtseite.

> The planet Earth seen from space directly above the North Pole, Arctic sea ice in the centre, surrounding continents and blue oceans with some white clouds, evenly lit from the front with no night side and no terminator, perfectly round, the globe fills the entire square image edge to edge, isolated on a transparent background, photorealistic, no text

## Bewegungsdiagramme

### `auto.webp` – Auto

Blaues Kompaktauto in exakter Seitenansicht; das Foto blickt **nach links**, die Simulation spiegelt es je nach Fahrtrichtung. Die Felgen werden als runde Ausschnitte gedreht, solange das Auto fährt; der Messpunkt (Ort des Autos) wird darüber gezeichnet. Auch die Stroboskopbilder verwenden das Foto.

> A small modern compact car in glossy blue, exact side view facing right, wheels visible, generic design with no brand, isolated on a transparent background, soft contact shadow removed, photorealistic

### `strasse.webp` – Fahrbahn

Asphaltstreifen mit weißer Randlinie oben und Grasstreifen unten; wird auf die Höhe der Fahrbahn skaliert und waagerecht abwechselnd gespiegelt gekachelt (keine Nahtstellen), im Dunkelmodus leicht abgedunkelt.

> Straight asphalt road seen exactly from the side as a long horizontal strip, dark grey asphalt with a thin white edge line, a narrow strip of green grass below, seamless horizontally tileable, photorealistic

## Federpendel

### `stativ.webp` – Laborstativ

Gleiche Datei wie beim Fadenpendel (siehe dort); im Vergleichsmodus wird das zweite Stativ gespiegelt.

> A physics lab stand with a heavy dark base, vertical steel rod and a short horizontal clamp arm at the top pointing right, front view, isolated on a transparent background, photorealistic

### `gewicht.webp` – Hakengewicht

Pendelkörper: Messing-Schlitzgewicht mit Haken. Oben der Haken (etwa ein Viertel der Bildhöhe), darunter der Zylinder; der Zylinder bildet den Körper, die Masse steht als Beschriftung darauf. Seitenverhältnis bleibt erhalten (der Körper ist mit Foto schlanker und höher als die Ersatzgrafik).

> A slotted brass laboratory weight with a hook on top, cylindrical, shiny polished brass, front view, isolated on a transparent background, photorealistic

## Hookesches Gesetz

### `stativ.webp` – Laborstativ

Gleiche Datei wie beim Fadenpendel (siehe dort); der Ausleger wird bis über die Federn gestreckt.

> A physics lab stand with a heavy dark base, vertical steel rod and a short horizontal clamp arm at the top pointing right, front view, isolated on a transparent background, photorealistic

## Hebelgesetz

### `gewicht.webp` – Hakengewicht

Gleiche Datei wie beim Federpendel. Am Hebel wird das Foto zerlegt: Haken und Kopf (bis zur Oberkante des Zylinders) hängen mit der Innenseite des Hakens im Loch, darunter werden die 50-g-Massestücke als waagerechte Bänder aus dem Messingzylinder geschnitten (das unterste mit der gerundeten Unterkante). Breite = Stapelbreite, Seitenverhältnis bleibt; der Haken ist mit Foto etwas länger als in der Ersatzgrafik. Auch die Stücke im Kasten und das gezogene Stück verwenden das Foto.

> A slotted brass laboratory weight with a hook on top, cylindrical, shiny polished brass, front view, isolated on a transparent background, photorealistic

### `schubkarre.webp` – Schubkarre

Beispiel „Hebel im Alltag“: grüne Schubkarre in Seitenansicht, **Rad links**. Das Foto wird um die Radmitte (= Drehachse) gedreht, um 2,6° so geneigt, dass Rad und Stütze auf dem Boden stehen, und so skaliert, dass das Griffende bei 152 cm liegt (Rad dann 21,6 cm Radius). Griffhöhe und Muldenrand sind aus dem Foto vermessen; die Hebelarme (waagerechte Abstände) und Kraftpfeile bleiben unverändert. Der Sand wird hinter die Mulde gezeichnet und schaut oben heraus.

> A classic garden wheelbarrow with a green metal tub, one front wheel and two wooden handles, exact side view facing left, empty, isolated on a transparent background, photorealistic

### `flaschenoeffner.webp` – Flaschenöffner (nachgeliefert 26.10.2026)

Beispiel „Hebel im Alltag“ → Flaschenöffner, exaktes Profil. Die Spitze liegt auf dem Kronkorken genau an der Drehachse, die Innenkante des Zahns knapp hinter dem rechten Rand (Lastarm 2 cm wie in der Rechnung). Kopf und Griff unverzerrt, nur der gleichförmige Schaft gestaucht; senkrecht leicht gestaucht, damit der Zahn knapp unter den Rand greift. Der Öffner dreht sich beim Anheben mit.

> A classic flat stainless steel lever bottle opener seen exactly from the side in profile, orthographic view, lying horizontal: the left end is a short flat tip that rests on top of a bottle cap, just to the right of the tip a small sharp tooth points straight down to hook under the rim of the cap, from there a long straight flat handle continues to the right and ends in a rounded black rubber grip, only the thin side profile is visible, not the top face and not the hole, soft studio light from the upper left, isolated on a fully transparent background, no bottle, no cap, no shadow, photorealistic, no text, no logo

## Kräfteaddition

### `lampe.webp` – Laterne

Hängende Laterne mit zwei Ösen. Das Foto wird unterhalb der Kabelstummel abgeschnitten; die Seile enden innen oben an den Ösen. Die Ösen liegen genau auf den Seilgeraden, der Winkel α bleibt exakt. Die Kraftpfeile greifen am Schnittpunkt der Seilgeraden an (Kräfte entlang der Wirkungslinie verschoben, gestrichelt angedeutet); bei sehr steilen Seilen bleibt dieser Punkt im oberen Viertel der Lampe. Im Dunkelmodus leuchtet die Glühlampe.

> A round vintage street lamp hanging from above, dark metal housing with a warm glowing glass globe, front view, two attachment rings on top, isolated on a transparent background, photorealistic

## Schiefe Ebene

### `holzklotz.webp` – Holzklotz

Klotz aus Eiche mit Öse (Seitenansicht), nur bei „Holz auf Holz“ und eigenen Werten. Der Klotz im Foto ist sehr lang (etwa 4 : 1); für die Simulation wird ein Stück aus der Mitte herausgenommen und die Naht weich überblendet (nichts gestreckt), sodass er etwa 2,2 : 1 ist. Er wird mit der Ebene gedreht; die Öse zeigt hangaufwärts zum Kraftmesser.

> A rectangular wooden block of light oak with visible grain and a small metal hook on one end, side view, isolated on a transparent background, photorealistic

### `brett.webp` – Holzleiste

Oberfläche der Ebene bei Holz (auch für den Wagen): wird entlang der Schräge gedreht, auf die Leistendicke skaliert und gespiegelt aneinandergesetzt (höchstens leicht in Längsrichtung gestreckt), im Dunkelmodus leicht abgedunkelt.

> A long plank of smooth light wood seen exactly from the side, horizontal, fine wood grain, seamless horizontally tileable, photorealistic

## Stöße

### `bahn.webp` – Luftkissenbahn

Vierkantprofil mit Luftlöchern oben, von der Oberkante bis zur Unterkante des Balkens. Die Enden bleiben unverzerrt, das gleichförmige Profil wird in Längsrichtung gestreckt (gekachelt sähe man die Helligkeitsverläufe als Muster). Skala, Endstücke und Stützen zeichnet die Simulation darüber; die Gleiter schweben knapp über der Oberkante.

> A long horizontal aluminium air track with tiny holes along the top surface, side view, brushed metal, isolated on a transparent background, photorealistic

`gleiter.webp` ist **nicht eingebaut** (liegt in `docs/bilder-eingang/stoesse/`): Das Foto ist keine reine Seitenansicht (Stirnfläche sichtbar, Unterkante um etwa 3° schräg) und mit 6,6 : 1 zu flach – für die Beschriftung und die Farbe der Gleiter müsste es stark gestaucht und eingefärbt werden, das wirkte unruhiger als die gezeichneten Gleiter. Die Aufschrift „10 cm“ wäre bei der Darstellungsgröße nicht lesbar.

## Resonanz (Pohlsches Rad)

### `rad.webp` – Kupferrad

Verwendet wird nur die Kupferscheibe innerhalb des Skalenrings: kreisförmig ausgeschnitten (ohne Fuß und ohne die Zahlen der Foto-Skala), sie dreht sich mit dem Ausschlag. Die Spiralfeder des Fotos würde starr mitdrehen; sie wird beim Laden mit der Kupferfarbe übermalt, die ringsum gemessen wird (die gebürstete Scheibe ändert ihre Helligkeit nur mit dem Winkel). Skala, Zeiger, Feder, Erreger und Bremse zeichnet die Simulation; sie sind maßgeblich.

> A Pohl's wheel physics apparatus seen from the front: a flat polished copper disc with a fine scale ring around the edge, a coiled spiral spring in the centre, isolated on a transparent background, photorealistic

## Wellenausbreitung

### `kugel.webp` – Teilchen der Kette

Rote Kugel; wird für jedes Teilchen vorab skaliert und in der Farbe des Zustands eingefärbt (in Bewegung, in Ruhe, markiertes Teilchen), Glanzlicht und Schattierung bleiben. Sehr kleine Teilchen (Radius unter 3,2 px) bleiben gezeichnete Punkte.

> A small glossy red sphere, perfectly round, soft highlight, isolated on a transparent background, photorealistic

## Einfacher Stromkreis

### `batterie.webp` – 4,5-V-Flachbatterie

Steht wie die gezeichnete Batterie unten im Aufbau (Breite fest, Seitenverhältnis bleibt). Die lange Messingfahne links ist der Minuspol, die kurze rechts der Pluspol; die Kabel setzen genau an den Fahnen an. Banderole mit „4,5 V“ und die Polzeichen zeichnet die Simulation auf die Vorderseite (das Foto ist ohne Aufdruck).

> A 4.5 volt flat battery with two brass contact tabs on top, generic design with no brand or text, three-quarter view, isolated on a transparent background, photorealistic

### `gluehlampe.webp` – Glühlampe

Das Foto zeigt die Lampe **leuchtend**. Die ausgeschaltete Lampe wird beim Laden daraus abgeleitet (`sim-core/circuit-photos.ts`): Das warme Licht im Glas wird weichgezeichnet entfernt, die helle Wendel wird zu dunklem, kaltem Draht, das Glas leicht durchsichtig. Bei schwachem Strom glüht zuerst nur die Wendel, ab mittlerer Helligkeit der ganze Kolben (stufenlose Überblendung). Die Lampe steckt in einer gezeichneten Fassung; Elektronen laufen entlang der Haltedrähte und der Wendel des Fotos. Eine eigene Aufnahme der ausgeschalteten Lampe wäre noch besser (siehe Prompt in `docs/BILDER-WUNSCHLISTE.md`).

> The same small clear incandescent bulb switched on, warm bright glowing filament with soft light bloom, front view, isolated on a transparent background, photorealistic

### `schalter.webp` – Hebelschalter

Holzsockel mit Lagerbock und Federkontakt, im Foto offen. Der Hebel wird beim Laden ausgeschnitten und dreht sich beim Schalten um seine Achse (offen etwa 8° weiter geöffnet als im Foto, geschlossen im Federkontakt); der Lagerbock wird darübergelegt. Die Kabel setzen an den beiden Anschlussschrauben an, bei geschlossenem Schalter laufen die Elektronen über Lagerbock, Hebel und Kontakt.

> A simple school lab knife switch on a small wooden base, brass lever, three-quarter view, isolated on a transparent background, photorealistic

### `motor.webp` – Elektromotor mit Propeller

Liegt mit waagerechter Welle auf einem gezeichneten Halter über dem Grundbrett. Der Propeller wird ausgeschnitten und dreht sich um die Welle (Seitenansicht: senkrecht gestaucht mit dem Drehwinkel), bei hoher Drehzahl mit Bewegungsunschärfe; die Nabe bleibt stehen. Der kleine Aufdruck auf dem Gehäuse wird mit einem sauberen Stück Gehäuse überdeckt. Gezeichnete Anschlussdrähte führen zu den Buchsen.

> A small electric hobby motor with a red propeller, silver metal housing, side view, isolated on a transparent background, photorealistic

### `klingel.webp` – Klingel

Steht auf dem Grundbrett; der Klöppelarm wird ausgeschnitten und schwingt beim Läuten (etwa 11 Schläge je Sekunde). Kurze gezeichnete Leitungen führen von den Klemmen unten zu den Buchsen.

> A classic electric bell with a shiny brass dome and a small hammer, front view, isolated on a transparent background, photorealistic

## Reihen- und Parallelschaltung

### `batterie.webp` – Batterie

Dieselbe Datei wie beim einfachen Stromkreis, gespiegelt (Pluspol wie im Schaltzeichen links bzw. oben); in senkrechten Leitungen liegt sie gedreht. Die Leitung läuft hinter dem Gehäuse, kurze Anschlussdrähte führen zu den Fahnen; ein Spannungsmesser an der Quelle greift außerhalb der Batterie ab. Nur ohne „Schaltzeichen“.

> A 4.5 volt flat battery with two brass contact tabs on top, generic design with no brand or text, three-quarter view, isolated on a transparent background, photorealistic

### `gluehlampe.webp` – Glühlampe

Dieselbe Datei wie beim einfachen Stromkreis (leuchtend; „aus“ wird daraus abgeleitet, die Helligkeit jeder Lampe stufenlos gemischt). Gezeigt wird der Kolben bis kurz unter den Hals mit gezeichneter Fassung; der Kolben liegt auf der Leitung, der Sockel zeigt vom Spannungsmesser weg. Durchgebrannte Lampen bekommen einen Rußschleier.

> The same small clear incandescent bulb switched on, warm bright glowing filament with soft light bloom, front view, isolated on a transparent background, photorealistic

### `widerstand.webp` – Kohleschicht-Widerstand

Waagerecht, in senkrechten Leitungen gedreht; die Anschlussdrähte reichen genau bis zu den Leitungsenden. Die Farbringe des Fotos werden überdeckt und **passend zum eingestellten Wert neu gemalt** (zwei Ziffern + Multiplikator + Gold, bei drei Ziffern fünf Ringe mit Braun für ±1 %), damit das Bild nie einen falschen Wert zeigt.

> A single through-hole resistor with coloured bands, beige body, horizontal, isolated on a transparent background, photorealistic

## Ohmsches Gesetz

### `netzgeraet.webp` – Netzgerät

Frontansicht mit Drehknopf, leerem Display, roter und schwarzer Buchse, Schalter und zwei Leuchten. Der Drehknopf wird rund ausgeschnitten und dreht sich mit der eingestellten Spannung (Strich oben = 6 V); Skala, Spannungsanzeige im Display (grüne LCD-Schrift, bei Strombegrenzung mit Hinweis), Leuchten (grün = an, rot = I-Begrenzung) zeichnet die Simulation. Die Kabel stecken in den Buchsen des Fotos.

> A school laboratory DC power supply, grey metal housing, one large black rotary knob and two banana-plug sockets red and black, an empty dark display window, front view, no text, isolated on a transparent background, photorealistic

### `messgeraet.webp` – Zeigerinstrument

Quadratisches Gehäuse mit leerem rundem Zifferblatt; die Zeigerachse in der Mitte ist Mittelpunkt von Skala (±62°) und Zeiger, beides wird genau in den Kreis gezeichnet. Buchsen (+, COM) sitzen gezeichnet auf dem schwarzen Rahmen unter dem Zifferblatt.

> An analogue lab meter housing, black case with a large blank white dial face without any scale or numbers and without a needle, front view, isolated on a transparent background, photorealistic

## Licht und Schatten (Lampe, Sternenhimmel)

### `lampe.webp` – Experimentierleuchte

Schwarzes Gehäuse, Öffnung nach rechts, Kabel links. Die Mitte der Öffnung liegt genau im Ursprung der Lichtstrahlen; bei der ausgedehnten Lampe ist die leuchtende Öffnung so hoch wie die Lichtquelle (2 r), die Randstrahlen gehen also vom Rand der Öffnung aus. Das Leuchten in der Öffnung zeichnet die Simulation (auch farbig bei zwei Lampen).

> A small lab lamp housing with a round opening facing right, black metal, side view, isolated on a transparent background, photorealistic

### `sternenhimmel.webp` – Sternenhimmel

Hintergrund im Modus „Sonnen- und Mondfinsternis“, bildfüllend zugeschnitten (Seitenverhältnis bleibt), gedämpft; ersetzt die gezeichneten Sterne. Dieselbe Datei wie bei den Planetenbahnen.

> Deep space starfield, black background with many tiny white and faintly coloured stars, very subtle distant blue and purple nebula haze, no planets, no bright objects in the centre, photorealistic astrophotography

## Planetenbahnen (Sternenhimmel)

### `sternenhimmel.webp` – Sternenhimmel

Hintergrund der Bahnebene, bildfüllend zugeschnitten und leicht gedämpft; dazu nur noch wenige gezeichnete helle Sterne. Wird einmal je Größe vorab gerendert.

> Deep space starfield, black background with many tiny white and faintly coloured stars, very subtle distant blue and purple nebula haze, no planets, no bright objects in the centre, photorealistic astrophotography

## Reflexion (Kerze, Laser)

### `kerze.webp` – Kerze

Weiße Kerze; die Flamme des Fotos wird abgeschnitten, Docht und Flamme zeichnet die Simulation (an der eingestellten Höhe). Kopf und Fuß bleiben unverzerrt, nur der gleichförmige Schaft wird auf die eingestellte Höhe gestreckt. Das Spiegelbild ist dasselbe Foto, blass und seitenverkehrt.

> A white wax candle with a small calm burning flame, front view, isolated on a transparent background, photorealistic

### `laser.webp` – Laser

Kopie von `brechung/laser.webp`; Seitenverhältnis bleibt, die Austrittsöffnung liegt genau im Strahlursprung.

> Side view of a metal laboratory laser module, cylindrical brushed aluminium body with a black end cap on the left and the light aperture on the right edge of the image, small red indicator light, isolated on a transparent background, soft studio lighting, photorealistic, aspect ratio 3.5:1

## Linsen (Kerze, Sammellinse)

### `kerze.webp` – Kerze

Dieselbe Datei wie bei der Reflexion: auf der optischen Bank (Flamme gezeichnet, Schaft gestreckt) und im Schirmbild um 180° gedreht, warm und gedämpft, im Maßstab des Bildes.

> A white wax candle with a small calm burning flame, front view, isolated on a transparent background, photorealistic

### `linse.webp` – Sammellinse

Hochkant in Seitenansicht, nur für die Sammellinse (Zerstreuungslinse bleibt gezeichnet, beim Umschalten weich überblendet). Höhe wie die gezeichnete Linse, Seitenverhältnis bleibt; die dickste Stelle liegt genau auf der Linsenebene, an der die Konstruktionsstrahlen abknicken.

> A biconvex glass lens seen exactly edge-on from the side, clear glass with subtle reflections and a thin metal rim, vertical, isolated on a transparent background, photorealistic

## Doppler-Effekt

### `strasse.webp` – Straße von oben

Draufsicht, Straße waagerecht, Wiese beidseitig. Verwendet werden zwei Ausschnitte als Texturen, gespiegelt gekachelt: die Wiese und eine Fahrspur aus reinem Asphalt. So bleiben Maßstab und Lage der Fahrbahn genau wie gezeichnet; Rand- und Mittellinie (gestrichelt, wie in Deutschland) zeichnet die Simulation. Im Dunkelmodus abgedunkelt. Genutzt werden nur die Bildzeilen 357–431 (Fahrspur) und 592–788 (Wiese, `LANE`/`GRASS` in `index.ts`); der Rest der Datei ist einfarbig, damit sie klein bleibt. Die Bildgröße 1800 × 890 muss bleiben, sonst stimmen die Ausschnitte nicht.

> Top-down aerial view of a straight two-lane road running horizontally, grass on both sides, evenly lit, photorealistic

`krankenwagen.webp` ist **nicht eingebaut** (liegt in `docs/bilder-eingang/doppler-effekt/`): Das Foto ist eine Seitenansicht, die Simulation zeigt die Straße aber von oben. Gebraucht wird eine Draufsicht:

> A modern white ambulance seen exactly from above (top-down view), red stripes, blue lights on the roof, facing right, generic design with no text, no brand, isolated on a transparent background, photorealistic

## Waagemodell

### `waage.webp` – Waagensäule

Messingsäule auf Holzsockel, ohne Balken und Schalen. Verwendet werden nur Säule mit Fuß (unterhalb des festen Querträgers abgeschnitten, unverzerrt; Breite wie die gezeichnete Säule) und der Sockel; von der Säule bis zum Drehpunkt führt eine gezeichnete Messingstange. Der Sockel ist höchstens so hoch, dass die tiefste Schale darüber bleibt; seine Mitte (Längsmaserung) wird auf die Lücke zwischen den Schalen gestaucht, die Enden mit den Füßen bleiben unverzerrt. Balken, Drehpunkt, Skala und Zeiger bleiben gezeichnet und maßgeblich.

> A classic brass balance scale stand without the beam and without pans, ornate column on a wooden base, front view, isolated on a transparent background, photorealistic

### `schale.webp` – Waagschale an drei Ketten

Hängt senkrecht unter dem Balkenende: Der Ring liegt über der Balkenspitze, nur die Ketten werden auf die Länge des Gehänges gestreckt, Ring und Schale bleiben unverzerrt (Breite der Schale wie die gezeichnete). Päckchen und Gewichte stehen in Höhe der Mitte des Schalenrands.

> A single shallow brass weighing pan hanging from three thin chains, front view, isolated on a transparent background, photorealistic

### `paeckchen.webp` – x-Päckchen

Schachtel mit Schnur, Seitenverhältnis bleibt (etwas höher als der Platz, stapelt leicht überlappend). Das Etikett mit *x* zeichnet die Simulation auf die untere Hälfte unter die Schnur. Beim Öffnen dreht sich das Foto wie die gezeichnete Schachtel; das Innere (x Gewichtsstücke) bleibt gezeichnet.

> A small cardboard parcel tied with twine, cube shaped, front view, isolated on a transparent background, photorealistic

### `gewicht.webp` – Gewichtsstück (1)

Eisengewicht mit Griff, volle Höhe des Platzes, Breite aus dem Seitenverhältnis. Die „1“ zeichnet die Simulation hell auf den Körper (mit leichtem Schatten, in beiden Farbschemata lesbar).

> A small cast iron weight with a top handle, front view, isolated on a transparent background, photorealistic

## Ganze Zahlen an der Zahlengerade (Meeresspiegel)

### `meer.webp` – Küste mit Unterwasseransicht

Hintergrund des Beispiels „Meeresspiegel“, bildfüllend und gleichmäßig skaliert, rechtsbündig (offenes Meer). Die Wasseroberfläche des Fotos (Bildzeile 683 von 1600, gemessen) liegt immer genau auf der Höhe 0 der Skala, auch wenn sich der Bereich ändert; Wellenlinie, Eisberg, Pinguin und Skala (mit hellem Hintergrund) bleiben gezeichnet. Im Dunkelmodus abgedunkelt. Ein Bild mit polarer Küste würde besser zu Eisberg und Pinguin passen (siehe unten).

> Side cross-section view of a coastal scene: a hill with green grass above the water line, calm blue sea surface in the middle, underwater part fading into deep blue below, photorealistic

## Umfang und Flächeninhalt (Ameise)

### `ameise.webp` – Ameise von oben

Läuft den Rand ab und wird in Laufrichtung gedreht (im Foto ist die Körperachse um 23,6° geneigt, Kopf rechts oben – das gleicht die Simulation aus). Drehpunkt ist die Körpermitte auf der Randlinie; leichtes Pendeln ersetzt die Beinbewegung der gezeichneten Ameise. Im Dunkelmodus aufgehellt.

> A single cute ant seen exactly from above, walking pose, isolated on a transparent background, photorealistic macro

## Gesetz der großen Zahlen (Würfel)

### `wuerfel.webp` – Würfel ohne Augen

Weißer Würfel schräg von vorn. Die Perspektive passt nicht zur Draufsicht, in der das Ergebnis (die Augenzahl oben) gezeigt wird; deshalb nur für den Flug beim einzelnen Wurf: Die Augen werden perspektivisch auf die beiden sichtbaren Seitenflächen gezeichnet (benachbarte Zahlen, nie Gegenseiten), beim Landen blendet der Würfel weich in die gezeichnete Draufsicht über.

> A single white plastic game die without any pips, blank faces, rounded edges, three-quarter view, isolated on a transparent background, photorealistic

## Extremwertaufgaben (Wiese, Mauer, Holz, Blech)

### `wiese.webp` – Rasen von oben

Nahtlose Kachel (Breite ca. halbe Szene, 220–360 px) als Untergrund der Gehege „an der Mauer“ und „ohne Mauer“, nur innerhalb des abgerundeten Bildfelds. Im Hellmodus mit blassem Grün aufgehellt, im Dunkelmodus abgedunkelt; unten liegt ein ruhiger Streifen unter der Zaun-Leiste. Gezeichnete Grashalme entfallen, die gestrichelte Linie der möglichen Ecken wird kräftiger.

> Top-down view of a lush green meadow with short grass and a few tiny daisies, evenly lit, seamless, photorealistic

### `mauer.webp` – Ziegelmauer

Verwendet wird nur der obere Streifen (Rollschicht und zwei Ziegelreihen, Bildzeilen 0–50, endet an einer Fuge), auf 22 px Höhe skaliert und gespiegelt gekachelt (keine Naht). Mit Foto ist die Mauer 22 statt 15 px hoch; die Aufschrift „MAUER“ bekommt einen dunklen Schein. Im Dunkelmodus abgedunkelt.

> A red brick wall seen exactly from above as a long horizontal strip, seamless horizontally tileable, photorealistic

### `holzdreieck.webp` – Holzmaserung für das Dreiecksbrett

Das Foto zeigt ein gleichschenkliges Brett, die Aufgabe braucht ein rechtwinkliges. Deshalb wird nur die Maserung aus dem größten Rechteck im Inneren (x 140–372, y 185–365) gleichmäßig skaliert in die gezeichnete Dreiecksform eingeschnitten; Umriss, Schatten, rechter Winkel und Rechteck bleiben gezeichnet. Leicht warm schattiert, im Dunkelmodus abgedunkelt.

> Top-down view of a light plywood board with visible wood grain, evenly lit, photorealistic

### `blech.webp` – verzinktes Blech

Untere Bildhälfte (ohne den hellen Lichtfleck oben) als Textur in Boden und Seitenwände der Regenrinne eingeschnitten (hell: multipliziert, dunkel: weiches Licht), die gezeichneten Grautöne bleiben als Schattierung; Wasser, Profil und Maße liegen darüber.

> A sheet of brushed galvanised steel, horizontal, evenly lit, seamless, photorealistic

## Parabel durch drei Punkte (Ball, Fluss)

### `ball.webp` – Fußball

Ersetzt beim „Ball werfen“ den gezeichneten Ball (Durchmesser 22 px) und rollt im Flug ab (Drehwinkel = zurückgelegter Weg / Radius). Bodenschatten und Stroboskop-Spuren bleiben gezeichnet.

> A classic white and black football, perfectly round, isolated on a transparent background, photorealistic

### `fluss.webp` – Flusslandschaft

Hintergrund der Anwendung „Brückenbogen“, nur im Koordinatensystem, gleichmäßig skaliert (deckt die Fläche, Größe in kleinen Stufen vorab skaliert). Die Wasserlinie am fernen Ufer (Bildzeile 680, gemessen) liegt immer auf dem gezeichneten Wasserspiegel knapp unter y = 0, auch beim Verschieben und Zoomen. Stark gedämpft (hell 45 %, dunkel 62 % Hintergrundfarbe darüber), Gitter, Achsen, Graph und Punkte liegen darüber. Die Uferböschungen an den Nullstellen bleiben gezeichnet (mit Foto deckend).

> A wide river landscape seen from the side, calm water in the lower third, grassy banks left and right, soft sky, no bridge, photorealistic

## LGS grafisch lösen (Handy)

### `handy.webp` – Smartphone

Beim Tarifvergleich quer gelegt (um 90° gedreht, einmal je Größe vorab gerendert) als Rahmen der Legende: Die Tarife A und B (Gleichung, Grundgebühr und Minutenpreis) stehen hell auf dem schwarzen Bildschirm (gemessen: x 18–250, y 33–533 im Hochformat); die Spiegelung auf dem Glas wird abgeschwächt. Ohne Foto die gewohnte Karte.

> A generic modern smartphone, front view, blank dark screen, no brand, isolated on a transparent background, photorealistic

## Nicht eingebaute Bilder (Mathematik, Stand 16.10.2026)

Diese Dateien liegen weiter in `docs/bilder-eingang/<id>/`:

- `stellenwerte/plaettchen.webp` – Die Plättchen sind in der Stellenwerttafel nur etwa 18 px groß; die Holzmaserung ist dort nicht zu sehen. Eingefärbt (Farbe der Stellenwert-Gruppe trägt Bedeutung) wirkten die Fotos stumpfer und flacher als die gezeichneten, glänzenden Plättchen.
- `bruchteile/schokolade.webp` – Nur 441 × 245 px (auf dem Desktop bzw. Beamer 1,5- bis 3-fach vergrößert, unscharf). Eine vierte Darstellung bräuchte eigene Teilungslogik (Teile als Blöcke aus 24 : n Stücken, Antippen, Erweitern nur bei n · k | 24, gezeichnete Tafel für n = 5, 7, 9, 10, 11). Für einen späteren Einbau besser in voller Größe:
  > A bar of milk chocolate seen exactly from above, 6 by 4 rectangular pieces with deep grooves, unwrapped, no brand, evenly lit, the bar fills the entire image edge to edge, photorealistic, 1400 × 950 px
- `umfang-flaeche/karopapier.webp` – Das Fotoraster (grau, fest) beißt sich mit dem eigenen, zoombaren Zentimeter-Raster der Simulation; ohne Raster bliebe nur fast einfarbiges Weiß, und im Dunkelmodus ist das Blatt dunkel.
- `cavalieri/muenze.webp`, `cavalieri/spielkarte.webp` – Die 3D-Ansicht (`view3d`) füllt Flächen einfarbig mit Beleuchtung, Texturen gibt es nicht. Außerdem tragen die Farben Bedeutung (gerader und schiefer Körper, A₁ und A₂ in denselben Farben); goldene Münzen bzw. rote Karten würden diese Zuordnung aufheben.
- `quadratische-funktion/brunnen.webp` – Die Simulation hat keine Sachsituation (nur Parameter, Formen, Nullstellen); ein Wasserstrahl-Beispiel mit passendem Maßstab wäre eine neue Funktion. Für einen späteren Einbau müsste die Bahn des Strahls im Foto vermessen werden.
- `sinusfunktion/riesenrad.webp` – Es gibt keinen Modellieren-Kontext „Riesenrad“ (das Modell-Beispiel ist die Tageslänge). Eine statische Illustration neben dem Graphen würde nur ablenken.
- `mittelsenkrechte/zirkel.webp` – Ausprobiert (Foto nur gedreht und skaliert, Nadel genau im Einstichpunkt, Bleistiftspitze genau auf dem Bogen): Der Öffnungswinkel im Foto ist fest (etwa 24°), das Foto ist deshalb rund 2,5-mal so hoch wie der Radius. Schon bei der Winkelhalbierenden ragt es beim Bogenschlagen über Papier und Zeichenfläche, bei der Mittelsenkrechten (Radius über die halbe Strecke) ist es fast so hoch wie das Papier. Es hätte nur in einzelnen Schritten gepasst; der Wechsel zwischen Foto und gezeichnetem Zirkel mitten in der Konstruktion wirkte unruhig. Der gezeichnete Zirkel öffnet seine Schenkel passend zum Radius. Besser wäre ein Foto, das sich in Teile zerlegen lässt (siehe unten).
- `karopapier.webp` in `koordinaten-lage`, `vierecke`, `spiegelung`, `winkel-messen`, `mittelsenkrechte`, `thales` – Alle sechs zeichnen ihr eigenes Raster, dessen Kästchengröße sich mit der Bildschirmbreite ändert (Koordinatensystem, Thales mit Plot, Winkel messen ohne festes Raster); die Kästchenzahl des Fotos (rund 37 × 37, nicht exakt gleichmäßig) passt zu keinem davon. Ein darübergelegtes eigenes Raster ergäbe doppelte Linien, ohne Raster bliebe fast einfarbiges Weiß; im Dunkelmodus ist das Blatt dunkel. Wie bei `umfang-flaeche` nicht eingebaut.
- `quader-volumen/holz.webp` – Ebenfalls keine Texturen in `view3d`; die Farben der Einheitswürfel zeigen Reihe, Schicht und abwechselnde Schichten beim Zählen. Eine Holzmaserung je Würfelfläche (bis zu 3000 Flächen beim Drehen) wäre auf Schul-Tablets zu langsam und schwächte die Farbunterscheidung.

Für den Zirkel: zwei getrennte Schenkel, damit die Simulation den Öffnungswinkel selbst einstellen kann:

> A metal school compass taken apart into its two legs, each leg shown separately side by side: left the needle leg with the hinge head and grip, right the leg with a clamped yellow pencil, both legs exactly vertical, front view, isolated on a transparent background, photorealistic, 800 × 1000 px

Für die Zahlengerade wäre ein polares Motiv stimmiger (Eisberg und Pinguin):

> Side cross-section view of a polar sea: calm dark blue water surface exactly horizontal in the middle of the image, pale sky and distant snowy coast above, clear underwater part below fading into deep blue, no animals, no icebergs in the left half, photorealistic, 1600 × 1600 px

## Nachgelieferte Bilder (26.10.2026)

Zweiter Versuch für die Bilder, die beim ersten Mal nicht passten (Gründe in `docs/BILDER-WUNSCHLISTE.md`, Abschnitt „Stand 22.10.2026“). Den Flaschenöffner beschreibt der Abschnitt „Hebelgesetz“. Alle Bilder haben weiterhin eine gezeichnete Ersatzgrafik.

### `zahlengerade/eisberg.webp` – Eisberg

Meeresspiegel: Die Wasserlinie (Bildzeile 271) liegt auf Höhe 0, die Spitze reicht bis zum Pinguin, der Unterwasserteil bis zur Tiefe der Ersatzgrafik. Beide Teile werden einzeln eingepasst. Im Dunkelmodus wird der Unterwasserteil wie das Meer abgedunkelt.

> A single tall and narrow iceberg in side cross-section, the whole iceberg is two and a half times as tall as it is wide and fills the image height edge to edge, a slim pointed tip above a perfectly straight horizontal water line at exactly one fifth of the image height from the top, white snowy ice above the line, a slim tapering translucent pale turquoise-blue underwater part below the line, no water, no sea, no sky, only the iceberg, soft even light, isolated on a fully transparent background, photorealistic, no text, no animals

### `teilchenmodell/becherglas.webp` – Becherglas

Diffusion: Das Glas liegt vor Wasser und Teilchen; es ist in der Mitte vollständig durchsichtig. Die Außenkanten der Wände liegen auf den Kanten der Ersatzgrafik. Das rechte Glas ist gespiegelt, damit die Ausgüsse nach außen zeigen.

> An empty laboratory glass beaker seen exactly from the front at eye level, perfectly straight vertical walls, the top rim appears as a straight horizontal line (no visible ellipse), thin flat bottom seen edge-on as a thin line, small pouring spout on the upper left rim, very thin crystal clear glass that is almost invisible: only thin bright edge highlights and the outline are visible, the whole inside is fully transparent, no liquid, no graduation marks, isolated on a fully transparent background, no shadow, photorealistic, no text, no numbers

### `baumdiagramm/urne.webp` – Urne

Das Glas wird hinter die Kugeln gezeichnet und danach noch einmal zart (45 %) davor. So wirken die Kugeln wie im Glas. Innen ist es durchsichtig, auch im Dunkelmodus.

> An empty wide clear glass jar with a wide open top, exact front view at eye level, straight walls with rounded lower corners and a slightly narrower neck rim, very thin crystal clear glass that is almost invisible: only thin bright edge highlights and the outline are visible, the inside is completely transparent and empty, no lid, no label, no contents, no white or frosted areas, isolated on a fully transparent background, no shadow, photorealistic, no text

### `sin-cos-tan-dreieck/leiter.webp` – Leiter

Leiter anlehnen: gedreht und auf die Leiterlänge skaliert, Breite im Seitenverhältnis des Fotos (1 : 8). Die 14 Sprossen haben bei 4 m Leiterlänge etwa 0,27 m Abstand.

> A single long straight aluminium ladder standing exactly vertical, exact front view, the ladder is very slim: eight times as tall as it is wide and it fills the image height edge to edge, two parallel silver side rails and exactly fourteen evenly spaced flat rungs, grey rubber feet at the bottom, isolated on a fully transparent background, no wall, no shadow, photorealistic, no text, no labels, no warning stickers

### `schiefe-ebene/brett-asphalt.webp` – Asphalt

Oberfläche der Ebene beim Materialpaar „Gummi auf Asphalt“, gekachelt wie `brett-stahl`/`brett-eis`.

> A long horizontal strip showing the edge of a thick slab of road asphalt seen exactly from the side, dark grey asphalt with fine embedded gravel, a slightly lighter rough top surface line, evenly lit, the texture is uniform and seamless horizontally tileable, photorealistic, no road markings, no text

### `strahlensaetze/fluchtstab.webp` – Fluchtstab

Baumhöhe: Stab bei Z und vergrößert in der Lupe. Der Stab reicht vom Boden bis zur Stablänge s, die Stahlspitze (ab Bildzeile 1432) steckt im Boden.

> A single surveying ranging pole standing exactly vertical, exact front view, a sturdy round pole that is fifteen times as tall as it is wide and fills the image height edge to edge, painted in exactly eight alternating red and white bands of equal length, a short pointed steel tip at the bottom, soft daylight from the upper left, isolated on a fully transparent background, no ground, no shadow, photorealistic, no text, no numbers

### `massstab/lupe.webp` – Lupe (ersetzt)

Ersetzt die milchige Fassung. Die Glasmitte liegt bei (323 | 323), der Außenradius des Rahmens beträgt 322 px. Bei `dezimalbrueche` gibt es keine passende Stelle.

> A classic round magnifying glass seen exactly from the front, a thin polished black frame ring, the handle pointing diagonally to the lower right at 45 degrees, black handle with a silver collar, the lens is completely clear and fully transparent like empty air, with only one faint thin reflection arc at the upper left, no milky or frosted glass, isolated on a fully transparent background, no shadow, photorealistic, no text, no logo

### `prozentstreifen/sparbuch.webp` – Sparbuch

Zinsen: Die linierte Seite mit Einbandrand ersetzt Einband und Seite der Ersatzgrafik; Überschrift und Zeilen schreibt die Simulation darauf. Im Dunkelmodus wird die Seite abgedunkelt wie der Kassenbon.

> A single page of a small savings passbook lying flat, exact top-down view, one cream-coloured page with faint empty ruled horizontal lines across its full width, a narrow dark teal cover border visible around all four edges, no centre fold, no second page, no spine, completely blank with no writing, evenly lit, isolated on a fully transparent background, no shadow, photorealistic, no text, no numbers, no bank logo

## Runde 3 (eingebaut 29.10.2026)

Erzeugt mit dem integrierten Bildwerkzeug (Übergabe: `incoming/RUNDE-3-HINWEISE.md`, nach dem Einbau gelöscht), freigestellt geliefert, beim Einbau auf den sichtbaren Inhalt beschnitten und als WebP gespeichert. Jede Stelle behält ihre gezeichnete Ersatzgrafik. Prompts wörtlich aus der Wunschliste (Runde 3).

### `zehnerpotenzen/kind.webp` – Kind (Zehnerpotenzen)

R1 · Datei `src/assets/sims/zehnerpotenzen/kind.webp`. Stufe „Kind“: Scheitel bis Sohle = Bildhöhe = 1,4 m, Füße auf dem Boden. Zugeschnitten auf 185 × 900 px.

> A fictional ten-year-old child standing upright in a relaxed pose, seen exactly from the side in profile looking to the right, full body from head to feet fully visible, casual everyday clothes (plain jeans, plain sweatshirt, sneakers) without any print or logo, arms hanging naturally, exact orthographic side view with no perspective, the child fills almost the full image height, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no ground, no shadow, photorealistic, clean educational style, no text

### `zaehlprinzip/hose.webp` – Hose (Zählprinzip)

R2 · Datei `src/assets/sims/zaehlprinzip/hose.webp`. Hellgrau; die Simulation färbt jedes Kleidungsstück pixelweise in seine Farbe (Helligkeit relativ zum Bildmittel), so werden auch schwarze Hosen wirklich dunkel. Feiner Schattenrand, damit das weiße T-Shirt auf Weiß sichtbar bleibt.

> A pair of plain long trousers laid perfectly flat and symmetric, seen exactly from the front, very light neutral grey cotton fabric without any pattern, print, logo or label, simple waistband and two straight legs, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text

### `zaehlprinzip/t-shirt.webp` – T-Shirt (Zählprinzip)

R3 · Datei `src/assets/sims/zaehlprinzip/t-shirt.webp`. Wie die Hose eingefärbt.

> A plain short-sleeved crew-neck T-shirt laid perfectly flat and symmetric, seen exactly from the front, very light neutral grey cotton without any pattern, print, logo or label, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text

### `zaehlprinzip/muetze.webp` – Mütze (Zählprinzip)

R4 · Datei `src/assets/sims/zaehlprinzip/muetze.webp`. Wie die Hose eingefärbt.

> A plain knitted beanie hat with a folded cuff, seen exactly from the front, very light neutral grey wool without any pattern, logo or label, no pompom, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text

### `photoeffekt/fotozelle.webp` – Fotozelle (Photoeffekt)

R5 · Datei `src/assets/sims/photoeffekt/fotozelle.webp`. Kolbenmitte (252 | 262), Radius 252 px; die Steckerstifte (unter Bildzeile 690) werden abgeschnitten. Kathode, Anode und Zuleitungen zeichnet die Simulation in den Kolben, die Kabel setzen seitlich am Sockel an. Geliefert nur in 1086 × 1448 statt 1200 × 1600 (nicht hochskaliert).

> An empty evacuated glass bulb of a laboratory photocell, clear thin glass with a smooth rounded shape on a short black base with two metal pins below, the inside completely empty and transparent, exact side view with no perspective, soft studio light from the upper left with gentle highlights on the glass, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no labels

### `photoeffekt/lampe.webp` – Lampe (Photoeffekt)

R6 · Datei `src/assets/sims/photoeffekt/lampe.webp`. Lichtaustritt rechts, Zylindermitte bei Bildzeile 158; zur Kathode gedreht, der farbige Filter wird davor gezeichnet.

> A compact cylindrical laboratory lamp housing made of dark grey powder-coated metal with small cooling slots, a round light exit opening on the right side with a dark lens, mounted on a short metal rod, exact side view with no perspective, the lamp is switched off, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no labels, no logo

### `elektronenbeugung/beugungsroehre.webp` – Elektronenbeugungsröhre

R7 · Datei `src/assets/sims/elektronenbeugung/beugungsroehre.webp`. Sockel x 0 … 200, gleichmäßiger Hals bis 900, Kolben mit Mitte (1172 | 228) und Radius 228. Der Hals wird je nach Bühnenbreite gestreckt, Sockel und Kolben bleiben unverzerrt. Das Vakuum wird dunkel hinterlegt; Glühdraht, Anode, Folie und Strahl liegen davor.

> A laboratory electron diffraction tube lying perfectly horizontal, a long clear glass neck on the left with a small electron gun inside near the left end and electrical contacts at the left end cap, widening on the right into a large clear glass sphere, the inside of the sphere completely empty, the tube is switched off and not glowing, exact side view with no perspective, soft studio light from the upper left with gentle reflections on the glass, no hard shadows, isolated on a fully transparent background, no stand, no shadow, photorealistic, clean educational style, no text, no numbers, no labels

### `doppelspalt/laser.webp` – Laser (Doppelspalt)

R8 · Datei `src/assets/sims/doppelspalt/laser.webp`. Austritt rechts, Gehäusemitte bei Bildzeile 72. Im dunklen Raum mit schwachem Lichtschein dahinter, damit das schwarze Gehäuse sichtbar bleibt.

> A compact cylindrical laboratory diode laser module in matte black anodised aluminium with a small aperture on the right end and a cable gland on the left end, mounted on a short silver post with a small round foot, exact side view with no perspective, the laser is switched off, no beam, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no numbers, no warning label, no logo

### `extremwertprobleme/karton.webp` – Karton (Extremwertprobleme)

R9 · Datei `src/assets/sims/extremwertprobleme/karton.webp`. Oberfläche der Schachtel und des flachen Bogens (View3D-Option `texture`, ein Bild je Fläche, nicht gekachelt); Licht und Schatten der Fläche liegen darüber, beim Aufleuchten im Maximum tritt die Farbe hervor.

> A seamless flat surface of plain brown cardboard seen exactly from above, fine paper fibres and a very subtle corrugation texture, evenly lit with soft diffuse light, no edges, no folds, no stains, no print, no tape, fills the entire image, photorealistic texture, no text

### `quader-volumen/holz.webp` – Holz (Quader-Volumen)

R10 · Datei `src/assets/sims/quader-volumen/holz.webp`. Der Einheitswürfel ist naturbelassen; die gezählten Würfel bleiben bunt (Foto mit der Würfelfarbe multipliziert, schwach).

> A seamless flat surface of light natural beech wood seen exactly from above, fine straight grain, matte finish, evenly lit with soft diffuse light, no knots, no edges, no stains, fills the entire image, photorealistic texture, no text

### `mittelsenkrechte/haus.webp` – Haus (Mittelsenkrechte)

R11 · Datei `src/assets/sims/mittelsenkrechte/haus.webp`. Häuser A und B; ein farbiger Sockelstreifen zeigt, welches Haus A bzw. B ist.

> A small detached family house seen exactly from the front, white plastered walls, a dark grey pitched roof, a wooden front door in the middle and two windows, simple and friendly, no garden, no fence, no car, no people, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no ground, no shadow, photorealistic, clean educational style, no text, no house number

### `mittelsenkrechte/schaukel.webp` – Schaukel (Mittelsenkrechte)

R12 · Datei `src/assets/sims/mittelsenkrechte/schaukel.webp`. Spielplatz; noch nicht gefundene Plätze blass.

> A simple wooden playground swing frame with two swings hanging on chains, seen exactly from the front, natural wood, no people, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no ground, no shadow, photorealistic, clean educational style, no text

### `diagramme/fussball.webp` – Fußball (Diagramme)

R13 · Datei `src/assets/sims/diagramme/fussball.webp`. Kleines Bild vor der Beschriftung „Fußball“ (Säulen, Balken, Kreis), auf runder Unterlage.

> A classic white and black leather football, centred, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo

### `diagramme/tanzschuhe.webp` – Tanzschuhe (Diagramme)

R14 · Datei `src/assets/sims/diagramme/tanzschuhe.webp`. Vor „Tanzen“.

> A pair of light pink satin ballet shoes with ribbons, centred, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo

### `diagramme/reithelm.webp` – Reithelm (Diagramme)

R15 · Datei `src/assets/sims/diagramme/reithelm.webp`. Vor „Reiten“; im Dunkeln dank heller Unterlage sichtbar.

> A black velvet equestrian riding helmet, centred, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo

### `diagramme/tennis.webp` – Tennis (Diagramme)

R16 · Datei `src/assets/sims/diagramme/tennis.webp`. Vor „Tennis“.

> A tennis racket leaning diagonally with a yellow tennis ball in front of it, centred, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo

### `diagramme/turnringe.webp` – Turnringe (Diagramme)

R17 · Datei `src/assets/sims/diagramme/turnringe.webp`. Vor „Turnen“.

> A pair of wooden gymnastics rings hanging on straps, centred, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no shadow, photorealistic, clean educational style, no text, no logo

### `hebelgesetz/kind-wippe-1.webp` – Kind auf der Wippe, links (Hebelgesetz)

P1 · Datei `src/assets/sims/hebelgesetz/kind-wippe-1.webp`. Sitzpunkt (90 | 440), Hände (300 | 270). Der Maßstab folgt aus der Masse (Kubikwurzel); der Haltegriff rückt mit, sodass die Hände ihn greifen. Körper bleibt aufrecht, auch wenn die Wippe kippt.

> A fictional child of about six years sitting astride on an invisible plank, seen exactly from the side in profile looking to the right, both hands holding an invisible handle in front at chest height, legs hanging down on both sides, casual plain everyday clothes without print or logo, sneakers, exact orthographic side view, the bottom of the seated child is a straight horizontal line where the plank would be, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no seesaw, no plank, no handle, no shadow, photorealistic, clean educational style, no text

### `hebelgesetz/kind-wippe-2.webp` – Kind auf der Wippe, rechts (Hebelgesetz)

P2 · Datei `src/assets/sims/hebelgesetz/kind-wippe-2.webp`. Sitzpunkt (150 | 417), Hände (365 | 250); wird gespiegelt (schaut nach links).

> A fictional child of about ten years sitting astride on an invisible plank, seen exactly from the side in profile looking to the right, both hands holding an invisible handle in front at chest height, legs hanging down on both sides, casual plain everyday clothes without print or logo, sneakers, exact orthographic side view, the bottom of the seated child is a straight horizontal line where the plank would be, soft studio light from the upper left, no hard shadows, isolated on a fully transparent background, no seesaw, no plank, no handle, no shadow, photorealistic, clean educational style, no text

### `doppler-effekt/beobachter.webp` – Beobachter von oben (Doppler-Effekt)

P3 · Datei `src/assets/sims/doppler-effekt/beobachter.webp`. Kopf oben (zur Straße); die Schallbögen am Ohr zeichnet die Simulation weiter.

> A fictional adult person standing still, seen from directly above (top-down bird's-eye view), only the top of the head with short hair, the shoulders and a plain dark green jacket visible, arms at the sides, no face visible, exact top-down orthographic view, soft light from the upper left, isolated on a fully transparent background, no ground, no shadow, photorealistic, clean educational style, no text

## Marke: Scitura-Logo 01

Kein Simulationsbild, sondern das Zeichen der Website (seit 27.10.2026). Ausgewählt von der Projektleitung aus einer Logo-Studie, abgeleitet aus der Orbit-Skulptur der Startseite. Erzeugt mit dem Bildwerkzeug von OpenAI (über Codex), transparent freigestellt und auf Wunsch in Marineblau #183365 umgefärbt. Den wörtlichen Prompt der ersten Studie enthält die Übergabe nicht; Herkunft und Bearbeitungsauftrag stehen in `docs/design/coin-reise-v13/LOGO-HERKUNFT.md`.

| Verwendung | Datei | Größe | Hintergrund |
| --- | --- | --- | --- |
| Masterdatei | `docs/design/coin-reise-v13/assets/scitura-logo-master.png` | 1254 × 1254 | transparent |
| Kopfleiste, Münze der Startseite | `src/assets/brand/scitura-logo.png` | 256 × 256 | transparent |
| Browser-Icon | `public/favicon.png` | 64 × 64 | transparent |
| App-Icons (aus der Masterdatei verkleinert) | `public/icons/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | 180–512 | deckend #f6f7fa |

Ersatzgrafik: keine nötig (Rasterbild ohne Ladefehler-Risiko im Build). Im dunklen Farbschema und auf der Münze erscheint das Zeichen per CSS-Filter hell. Eine spätere Vektorfassung soll dieselbe Form behalten; kein neues Logo entwerfen.
