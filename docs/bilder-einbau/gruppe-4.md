# Bilder-Einbau Gruppe 4 (Mathematik)

Stand 22.10.2026. Einträge für die Übersicht in `docs/BILDER.md` (dort noch nachzutragen; der Test „führt alle Bilder in docs/BILDER.md auf“ verlangt jede Datei dort). Alle Simulationen zeichnen ohne Bild weiter ihre bisherige Ersatzgrafik.

| Simulation | Schlüssel | Datei | Größe | Hintergrund |
| --- | --- | --- | --- | --- |
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

## Wie die Bilder verwendet werden

- **Zirkel** (`zirkel-teile.webp`, Kopien aus `mittelsenkrechte/`): Die beiden Schenkel werden aus dem Foto geschnitten und einzeln um das Gelenk gedreht, bis die Spitzen auf Nadel bzw. Mine zeigen; Länge = Schenkellänge, Seitenverhältnis bleibt. Vom Bleistiftschenkel nur der Teil unter der Gelenkmitte, darüber liegt der Nadelschenkel mit Scheibe und Griff (der Griff zeigt damit in Richtung des Nadelschenkels). Das Leuchten der Mine bleibt gezeichnet.
- **Bleistift** (`bleistift.webp`): gleiche Lage wie der gezeichnete Stift (Spitze am Zeichenpunkt, 57° nach rechts oben), 110 px lang.
- **Eiswaffel**: Rand knapp unter der untersten Kugel, Spitze unten; schmaler als die gezeichnete Waffel (Seitenverhältnis des Fotos).
- **Zahlenschloss**: nur bei vier Stellen (das Foto hat vier Rädchen; bei 1, 2, 3 oder 5 Stellen bleibt das gezeichnete Schloss). Ziffern bzw. „?“ werden dunkel auf die Messingrädchen geschrieben (feste Farbe, das Messing ist in beiden Farbschemata gleich). Das Foto ist hochkant (Bügel hoch) statt 3 : 2 – das Schloss wird dadurch schmaler und die Ziffern bei 390 px Breite sehr klein (der Code steht daneben noch einmal als Text).
- **Tischkante** (Kopie aus `stoesse/`): unverzerrt, mindestens bühnenbreit (unten abgeschnitten), sonst gekachelt mit jeder zweiten Kachel gespiegelt (die Kanten des Fotos passen nicht ganz nahtlos). Im Dunkelmodus abgedunkelt.
- **Wanduhr**: Zifferblatt des Fotos (92 % des Bildradius) = Radius der gezeichneten Uhr. Weil das Zifferblatt auch im Dunkelmodus weiß ist, sind Striche, Zahlen und Zeiger dann dunkel.
- **Geodreieck**: Das Foto wird affin auf das Werkzeugdreieck gelegt. Der Kunststoff ist im Foto fast deckend (Alpha ≈ 0,65); beim Laden wird das Alpha hoch 6 genommen (Fläche ≈ 0,08, Kanten bleiben kräftig), damit Papier und Winkel durchscheinen. Skalen und Zahlen zeichnet weiter die Simulation; die Parallelen lassen das Griffloch des Fotos aus.
- **Würfel von oben**: ersetzt die gezeichnete Oberseite, die Augen werden darauf gezeichnet; Hervorhebung als farbiger Rand.

## Nicht eingebaut

| Bild | Simulation | Grund |
| --- | --- | --- |
| `urne.webp` (B35) | Baumdiagramm | Innen nicht durchsichtig: Die Glasfläche ist fast deckend weiß (Alpha ≈ 0,95), im Dunkelmodus ein weißer Block; die Kugeln wären verdeckt bzw. lägen sichtbar „davor“. Datei nach `docs/bilder-eingang/baumdiagramm/urne.webp` verschoben (sonst schlägt der Test „Abgelegte Bilder müssen deklariert sein“ fehl). Neu erzeugen mit wirklich transparentem Glas. |
| `lupe.webp` (C10) | Dezimalbrüche | In `drawLupe` gibt es keine gezeichnete Lupe – die „Zahlenstrahl-Lupe“ besteht aus gestuften Zahlenstrahlen mit Trichtern; ein Lupenfoto hätte keinen Platz, an dem es etwas vergrößert. Außerdem ist das Glas halbtransparent weiß (im Dunkelmodus grauer Nebel). Datei nach `docs/bilder-eingang/dezimalbrueche/lupe.webp` verschoben. Die Kopie für Maßstab (`massstab/`) ist davon nicht betroffen. |
| `schokolade.webp` (C18) | Bruchteile | Nicht geliefert („vorerst nicht erzeugen“); bräuchte eine vierte Darstellung. |
| `baum-zart.webp` (C19) | Primfaktoren | Nicht geliefert („vorerst nicht erzeugen“). |
| `tischkante.webp` (B2) | Gasgesetze, Stöße | Nicht Gruppe 4 (hier nur Waagemodell). |

Nicht angefasst: die in „Vorhandene Bilder, die weitere Simulationen mitnutzen können“ genannten Zusatzverwendungen (`wellen-ausbreitung/kugel.webp` für die Urne, `freier-fall/lineal.webp` für Einheiten) – sie gehören nicht zu „Noch zu erzeugen“.
