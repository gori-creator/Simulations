# Scitura · Startseitenentwurf 13

V13 stimmt Farben, Typografie, Abstände und Bedienelemente aufeinander ab. Der Aufbau mit zwei Fachbuttons, beweglicher Skulptur, Achterbahn und vollständigem Katalog bleibt erhalten.

## Gestaltung

Die gemeinsame Palette besteht aus hellem Graublau (#f6f7fa), Akzentblau (#3157d5), Marineblau (#183365) und einem helleren Bedienfeld-Blau (#203e72). Der Katalog liegt auf #edf1f8. Die Achterbahn behält ihre helle Zeichenfläche. Navigation, Einstieg, Experiment und Katalog orientieren sich an gemeinsamen Seitenrändern; die linke Münzspur hat auf Desktop weiterhin ihren eigenen Platz.

Systemschriften ohne externe Downloads, abgestufte Schriftgrößen, einheitliche Eckradien und weniger Schatten. Die Bahnwahl ist als zusammengehörige Gruppe gestaltet, die Regler haben eine einheitliche blaue Spur. Beschriftungen, Suchfelder und Filter greifen dieselbe Palette auf. Mobile Überschriften dürfen umbrechen, damit auch die englische Ansicht bei 320 Pixeln nicht überläuft.

## Bewegung und Funktion

Die Skulptur aus V12 bleibt unverändert: drei verbundene Ringe, körnige Oberfläche, begrenzter Schwenk um etwa 20 Grad zu beiden Seiten und vollständig umlaufende Satelliten. Der graue Sockel bleibt vollständig sichtbar. Die Münze folgt auf Desktop der linken Spur durch die Seite; auf Handy erreicht sie das Experiment.

`sculpture.js`, `stage.ts`, `stage.js` und `catalog.js` sind bytegleich mit V12. In `app.js` und `variants.js` wurde ausschließlich der sichtbare Markenname durch Scitura ersetzt. Ebenso das Experiment- und Katalog-Markup. 129 Einträge, Suchfunktion, Filter, Originalsimulationen, DE/EN, Pause und reduzierte Bewegung bleiben erhalten. Keine neuen Abhängigkeiten und keine Änderungen an produktiven Astro-Dateien, Curriculum oder Simulationskern.

## Verwendung

`Vorschau-starten.cmd` startet die vollständige lokale Website auf http://127.0.0.1:4176/. Eine ältere Vorschau auf diesem Port vorher beenden. Die einzelne Datei `Coin-Reise-V13.html` zeigt den Einstieg auch ohne Server; Links zu den Original-Fachseiten benötigen die vollständige lokale Vorschau.

Quellen: `docs/design/coin-reise-v13/`. Zum Neubündeln im Originalprojekt: `npm run build`, danach `node docs/design/coin-reise-v13/build-preview.cjs`.

Prüfung im Chromium-App-Browser: DE/EN von 320 bis 1600 Pixeln, Farbkontraste, Links, Filter, Experimentbedienung, Münzfahrt und gerenderte Skulptur. Kein Test auf realen Mobilgeräten, Safari oder Firefox. Die Modell- und Typprüfung wurde für die unveränderte Simulationslogik nicht wiederholt. Die acht Textvarianten bleiben erreichbar; ältere Vorschaubilder dienen dem Vergleich ihrer Texte und Anordnung.

## Markenname

Seit 27. Oktober 2026 heißt die Website Scitura. Navigation, zugängliche Markenbeschriftung, DE/EN-Seitentitel, Fußbereich und Textvarianten tragen den neuen Namen. Logo 01 ist als ausgewähltes Scitura-Zeichen in Navigation, Browser-Icon und auf beiden Münzseiten eingebunden. Die PNG-Dateien in assets/ haben einen transparenten Hintergrund; auf der Münze erscheint das Zeichen per CSS hell. Die ursprünglichen zehn Formstudien bleiben als Vergleich erhalten.

## Übergabe

Der aktuelle Stand verwendet Logo 01 in dunklem Marineblau, passend zum Experimentbereich (Zielfarbe #183365). Das transparente Master-PNG liegt unter assets/scitura-logo-master.png. START-HIER.md enthält die Übergabe an den Claude-Code-Main-Manager; INTEGRATION.md beschreibt die produktive Astro-Integration. Logo und Browser-Icon sind Raster-PNGs, keine Vektordateien.
