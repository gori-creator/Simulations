# Bilder-Einbau Gruppe 2 (Physik)

Stand 22.10.2026, Zweig `bilder-g2`. Grundlage: `docs/BILDER-WUNSCHLISTE.md` („Noch zu erzeugen“) und die gelieferten WebP-Dateien in `src/assets/sims/`. Alle Bilder sind optional; fehlt eine Datei, zeichnet die Simulation wie bisher ihre Ersatzgrafik.

Die Zeilen der Tabelle gehören in die Übersicht von `docs/BILDER.md` (der Test „führt alle Bilder in docs/BILDER.md auf“ verlangt jede deklarierte Datei dort). Die beiden vorhandenen Kerzen-Zeilen (Reflexion, Linsen) ändern sich nur in der Größe.

## Eingebaute Bilder

| Simulation | Schlüssel | Datei | Größe | Hintergrund |
| --- | --- | --- | --- | --- |
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
| Linsen | `candle` | `src/assets/sims/linsen/kerze.webp` | 540 × 1352 | transparent |
| Linsen | `rider` | `src/assets/sims/linsen/reiter.webp` | 1257 × 769 | transparent |
| Linsen | `rail` | `src/assets/sims/linsen/optische-bank.webp` | 1600 × 107 | transparent |
| Reflexion | `candle` | `src/assets/sims/reflexion/kerze.webp` | 540 × 1352 | transparent |
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

Kopien: `thermometer.webp` aus `zahlengerade/`, `tischkante.webp` aus `stoesse/`, `manometer.webp` aus `gasgesetze/` (byte-gleich). Die Tischkante steht in der Wunschliste (B2) auch bei Teilchenmodell und Reflexion; dort ist sie mit eingebaut.

### Hinweise zum Einbau

- **Einfacher Stromkreis:** Gegenstände in voller Länge (`OBJ_LEN`), Seitenverhältnis des Fotos bleibt (meist etwas schlanker als die Ersatzgrafik); gilt für Prüfstrecke, Kasten, Flugbewegung und Schaltplan. Krokodilklemme: Hülle (linke 56 % des Fotos) in Rot bzw. Schwarz eingefärbt und auf die Helligkeit der Farbe abgedunkelt, die zweite Klemme gespiegelt, Maul an der Prüfstelle.
- **Gasgesetze, Teilchenmodell:** Thermometer: Kopf und Kugel maßstabsgetreu, nur das gleichförmige Röhrenstück in der Länge gestreckt; Kugel in der Farbe der Säule eingefärbt, Säule und Skala gezeichnet. Heizplatte: Enden (mit Drehknopf und Kontrolllampe) maßstabsgetreu, nur das Mittelstück waagerecht gestreckt; Glühen, Reif, Knopfstellung und Lampe gezeichnet darüber. Tischkante: waagerecht abwechselnd gespiegelt gekachelt (das Foto hat einen leichten Helligkeitsverlauf), im Dunkelmodus abgedunkelt. Manometer: Zifferblattmitte genau auf dem Zeigerdrehpunkt, Skala und Zeiger gezeichnet, Gewindestutzen bis zur Leitung; im Dunkelmodus wird das Zifferblatt abgedunkelt (helle Schrift).
- **Teilchenmodell:** Pipette leer, Spitze auf dem Tropfpunkt, Tinte gezeichnet darüber.
- **Linsen, Reflexion:** Die gelieferte Kerze ersetzt die alte Datei; die Maße in `CANDLE_IMG` sind an das neue Foto angepasst (vorher wurde das neue Bild mit den alten Ausschnitten verzerrt gezeichnet).
- **Linsen, Licht und Schatten:** Reiter so breit wie der gezeichnete Reiter, Stange genau unter dem Bauteil, farbige Marke gezeichnet. Profilschiene: Profil so hoch wie die gezeichnete Schiene, die Füße stehen darunter auf dem Tisch; Endstücke maßstabsgetreu, nur das gleichförmige Mittelstück waagerecht gestreckt. Skala und Zahlen auf der dunklen Schiene hell.
- **Bleistiftmine (Einfacher Stromkreis):** Das Foto ist mit 46 : 1 viel schlanker als die Mine im Aufbau (14 : 1). Dicke wie die Ersatzgrafik, die abgerundeten Enden maßstabsgetreu, nur das gleichförmige Mittelstück in der Länge gestaucht.
- **Induktion:** Spule hinter dem Magneten, die Wicklung vorn noch einmal halb durchsichtig, damit der Magnet in der Spule sichtbar bleibt; Radius der Spule aus dem Foto (Stromfluss-Punkte, Pol-Anzeige), Leitungen setzen an den Anschlussdrähten an. Magnet in voller Länge, schlanker als die Ersatzgrafik; S/N gezeichnet.
- **Radioaktiver Zerfall:** Zählrohr: Fenster und Endkappe maßstabsgetreu, das gleichförmige Rohrstück gestaucht (das Foto ist mit 8,8 : 1 schlanker als das Rohr im Aufbau). Zählgerät: Ziffern und Zählrate im leeren Fenster, der rote Knopf leuchtet bei jedem Impuls, Lautsprecher-Schalter mit gezeichnetem Symbol daneben.
- **Stehende Wellen:** Erreger ohne den Stift des Fotos (der bewegte Stößel bleibt gezeichnet). Umlenkrolle auf dem Drehpunkt, Tischklemme abgeschnitten (es gibt keinen Tisch in der Szene).
- **Lorentzkraft:** Kugel des Fotos genau auf der gezeichneten Kugel, das Innere dunkel überlagert (Strahl, Skala, Kanone gezeichnet). Die Spulen liegen im Foto enger um die Kugel als maßstäblich.
- **Photoeffekt:** Manometer-Gehäuse als Strommesser, Stutzen abgeschnitten, Skala und Zeiger gezeichnet.
- **Linienspektren:** Prisma mit Grundseite und Breite des gezeichneten Dreiecks.

## Nicht eingebaute Bilder

| Datei | Simulation | Grund |
| --- | --- | --- |
| `teilchenmodell/becherglas.webp` | Teilchenmodell (Diffusion) | Falsche Ansicht: leicht von oben, mit dickem, fast deckendem Boden (elliptische Bodenfläche, gut 13 % der Höhe) und deckenden Wänden. Vorn gezeichnet verdeckt der Boden die unterste Teilchenreihe. Datei entfernt (Git-Geschichte). |

Hinweis: Bleistiftmine und Profilschiene waren in der Lieferung vertauscht (die schwarze Profilleiste mit Füßen lag als `bleistiftmine.webp` vor, der Rundstab als `optische-bank.webp`). Nach Rückmeldung der Projektleitung sind beide vertauscht eingebaut.

Nicht bearbeitet (kein neues Bild, nur „Vorhandene Bilder mitnutzen“ der Wunschliste): Lampe bei Linienspektren und Photoeffekt, Netzgerät beim Photoeffekt, Messgerät bei der Induktion, Hakengewicht an der Umlenkrolle (Stehende Wellen).
