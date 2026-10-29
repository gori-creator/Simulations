# Scitura – Bilder Runde 3

Stand: 29.10.2026. 20 PNG-Quelldateien für R1–R17 und P1–P3, erzeugt mit dem integrierten Imagegen-Werkzeug. Kein Anwendungscode geändert. Die archivierten älteren Wunschlisten wurden nicht erneut erzeugt.

## Vor der Integration beachten

Die Motive sind vollständig geliefert, aber nicht alle technischen und visuellen Vorgaben sind vollständig erfüllt. Diese Dateien sind Quellen zur Integration, keine pauschal freigegebenen Produktionsassets.

- **Fotozelle:** native Ausgabe 1086 × 1448 statt der geforderten 1200 × 1600 Pixel. Auch ein weiterer Generierungsversuch mit höherer Auflösungsanforderung lieferte diese Größe. Nicht künstlich hochskaliert. Vor Einsatz mit strikter Mindestauflösung ersetzen.
- **Freistellkanten:** Die 18 Objektbilder haben echten Alpha-Hintergrund. An einigen Konturen bleiben helle oder farbige Säume und kleine Hintergrundreste sichtbar; insbesondere Kleidung, Tennissaiten, Glas, Ballettschuhe und Turnringe. Gezielte Bildkorrekturen haben das reduziert, nicht vollständig beseitigt. Vor Freigabe auf Weiß und Dunkelblau kontrollieren und die Maske sauber nacharbeiten.
- **Glas:** Innenräume der Kolben wurden weitgehend transparent gemacht. Im Hals der Beugungsröhre bleiben graue Reflexionsflächen. Strahl, Elektroden und Elektronen bei der Integration davor zeichnen oder die Glasmaske vorher nacharbeiten; nicht verdecken lassen.
- **Texturen:** Karton und Holz sind deckend. Pixelgenaue Nahtlosigkeit wurde nicht bestätigt; beim Kacheln Übergänge prüfen.
- **Kinder:** Beide Sitzfiguren schauen nach rechts. Für die Wippe das rechte Kind in der Anwendung spiegeln. Pixelmaßstab und Sitzanker bei der Integration abstimmen, da die generierten Bildhöhen allein keinen gemeinsamen physischen Maßstab garantieren.

## Dateien und Zielorte

| ID | PNG in incoming/ | Vorgesehener WebP-Zielort |
|---|---|---|
| R1 | kind.png | `src/assets/sims/zehnerpotenzen/kind.webp` |
| R2 | hose.png | `src/assets/sims/zaehlprinzip/hose.webp` |
| R3 | t-shirt.png | `src/assets/sims/zaehlprinzip/t-shirt.webp` |
| R4 | muetze.png | `src/assets/sims/zaehlprinzip/muetze.webp` |
| R5 | fotozelle.png | `src/assets/sims/photoeffekt/fotozelle.webp` |
| R6 | lampe.png | `src/assets/sims/photoeffekt/lampe.webp` |
| R7 | beugungsroehre.png | `src/assets/sims/elektronenbeugung/beugungsroehre.webp` |
| R8 | laser.png | `src/assets/sims/doppelspalt/laser.webp` |
| R9 | karton.png | `src/assets/sims/extremwertprobleme/karton.webp` |
| R10 | holz.png | `src/assets/sims/quader-volumen/holz.webp` |
| R11 | haus.png | `src/assets/sims/mittelsenkrechte/haus.webp` |
| R12 | schaukel.png | `src/assets/sims/mittelsenkrechte/schaukel.webp` |
| R13 | fussball.png | `src/assets/sims/diagramme/fussball.webp` |
| R14 | tanzschuhe.png | `src/assets/sims/diagramme/tanzschuhe.webp` |
| R15 | reithelm.png | `src/assets/sims/diagramme/reithelm.webp` |
| R16 | tennis.png | `src/assets/sims/diagramme/tennis.webp` |
| R17 | turnringe.png | `src/assets/sims/diagramme/turnringe.webp` |
| P1 | kind-wippe-1.png | `src/assets/sims/hebelgesetz/kind-wippe-1.webp` |
| P2 | kind-wippe-2.png | `src/assets/sims/hebelgesetz/kind-wippe-2.webp` |
| P3 | beobachter.png | `src/assets/sims/doppler-effekt/beobachter.webp` |

## Integration

PNG-Alpha beim WebP-Export erhalten. Transparente Ränder gezielt beschneiden und Anker danach passend setzen. Die Zeichnungen für Strahlen, Elektroden, Messwerte, Beschriftungen und verformbare Teile bleiben Anwendungscode. Vorhandene Ersatzgrafiken erst nach visueller Abnahme austauschen. Kein automatisches Zusammenführen mit main vorgesehen.

## Lokales Übergabepaket

- `prompts.json`: ursprüngliche und normalisierte Prompts, Zielorte und Sollmaße.
- `korrekturen.json`: zusätzlich ausgeführte Korrekturprompts.
- `manifest.json`: tatsächliche Maße, Alpha-Statistik, Dateigröße und SHA-256.
- `Vorschau.html`: alle 20 Motive auf Weiß, Dunkelblau oder Transparenzraster.
- `pruefen.py`: liest PNGs unverändert, erneuert Manifest, Vorschau und ZIP.

GitHub-Ziel: `gori-creator/Simulations`, Zweig `claude/exciting-gauss-noh1h9`, Ordner `incoming/`.
