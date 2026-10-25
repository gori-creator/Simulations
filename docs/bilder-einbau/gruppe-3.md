# Bilder-Einbau Gruppe 3 (Mathematik)

Stand 22.10.2026. Eingebaut nach `docs/BILDER-WUNSCHLISTE.md` (Abschnitt „Noch zu erzeugen“). Jede Simulation zeichnet weiterhin ihre Ersatzgrafik, solange ein Bild fehlt oder noch lädt. Die Tabelle ist zum Übernehmen in `docs/BILDER.md` gedacht; erst dann besteht der Test „führt alle Bilder in docs/BILDER.md auf“.

## Eingebaute Bilder

| Simulation | Schlüssel | Datei | Größe | Hintergrund |
| --- | --- | --- | --- | --- |
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
| Maßstab | `lupe` | `src/assets/sims/massstab/lupe.webp` | 1074 × 949 | transparent |
| Zahlengerade | `frog` | `src/assets/sims/zahlengerade/frosch.webp` | 1045 × 899 | transparent |
| Zahlengerade | `piggy` | `src/assets/sims/zahlengerade/sparschwein.webp` | 1326 × 979 | transparent |
| Zahlengerade | `penguin` | `src/assets/sims/zahlengerade/pinguin.webp` | 775 × 1372 | transparent |
| Zahlengerade | `thermo` | `src/assets/sims/zahlengerade/thermometer.webp` | 200 × 1410 | transparent |
| Zahlengerade | `sea` | `src/assets/sims/zahlengerade/meer.webp` (ersetzt, schon in BILDER.md) | 1024 × 1024 | deckend |
| Strahlensätze | `tree` | `src/assets/sims/strahlensaetze/baum.webp` | 666 × 1000 | transparent |
| Strahlensätze | `crown` | `src/assets/sims/strahlensaetze/baumkrone.webp` | 900 × 881 | transparent |
| Prozentstreifen | `tag` | `src/assets/sims/prozentstreifen/preisschild.webp` | 1600 × 615 | transparent |
| Prozentstreifen | `receipt` | `src/assets/sims/prozentstreifen/kassenbon.webp` | 754 × 1336 | transparent |
| Sinus, Kosinus, Tangens | `wheelchair` | `src/assets/sims/sin-cos-tan-dreieck/rollstuhl.webp` | 1279 × 1086 | transparent |
| Sinus, Kosinus, Tangens | `bricks` | `src/assets/sims/sin-cos-tan-dreieck/ziegelwand.webp` | 1024 × 1024 | deckend |
| Sinussatz und Kosinussatz | `crown` | `src/assets/sims/sinussatz-kosinussatz/baumkrone.webp` | 900 × 881 | transparent |
| Integral als Gesamtänderung | `car` | `src/assets/sims/aenderungsrate/auto.webp` | 1600 × 686 | transparent |
| Integral als Gesamtänderung | `bike` | `src/assets/sims/aenderungsrate/fahrrad.webp` | 1280 × 701 | transparent |
| Ähnliche Figuren | `car` | `src/assets/sims/vergroessern/auto.webp` | 1600 × 686 | transparent |
| Ähnliche Figuren | `bucket` | `src/assets/sims/vergroessern/farbeimer.webp` | 1055 × 1226 | transparent |
| Extremwertaufgaben | `wood` | `src/assets/sims/extremwert-parabel/holzdreieck.webp` (ersetzt, schon in BILDER.md) | 1173 × 1186 | transparent |
| Extremwertaufgaben | `metal` | `src/assets/sims/extremwert-parabel/blech.webp` (ersetzt, schon in BILDER.md) | 1536 × 512 | deckend |
| Proportionalität | `apple` | `src/assets/sims/proportional/apfel.webp` | 1051 × 1115 | transparent |
| Proportionalität | `taxi` | `src/assets/sims/proportional/taxi.webp` | 1600 × 582 | transparent |

### Hinweise zum Einbau

- **Zehnerpotenzen:** Alle Objekte maßstäblich wie die Ersatzgrafik (Käfer: Körper ohne Fühler = 7 mm, Apfel ohne Blatt = 8 cm, Haus bis zum First = 10 m, Berg = 2962 m mit gezeichnetem Gipfelkreuz). Die Erde wird erst eingeblendet, wenn die Kugel ganz zu sehen ist; davor bleibt die gezeichnete Kugel der Boden. Wolken abwechselnd gespiegelt.
- **Maßstab:** Lupe über dem Objekt im Feld „In Wirklichkeit“ (Glasmitte und Rahmenradius aus dem Foto); die Briefmarke ist hochkant 1 : 1,36 (statt gezeichnet 1 : 1,2), deshalb etwas tiefer gesetzt und das Lineal darunter weiter unten.
- **Zahlengerade:** Frosch und Sparschwein drehen sich wie die Zeichnungen (Spiegeln). Pinguin wird beim Schwimmen gedreht. Das Thermometer ist in drei Teile geschnitten: Kappe und Kugel unverzerrt, nur der gleichförmige Mittelteil der Röhre wird in Längsrichtung gestreckt; die Kugel wird in der Flüssigkeitsfarbe (`series[1]`) eingefärbt, die Säule zeichnet die Simulation. `meer.webp` war schon eingebaut, die neue Datei hat aber andere Maße (1024 statt 1600 px, Wasserlinie Zeile 311 statt 683) – `SEA_IMG` angepasst; vorher wurde das neue Bild falsch ausgeschnitten.
- **Strahlensätze:** Baumhöhe = Bildhöhe, Stamm mittig auf B′. Baumkronen statt der gezeichneten Büsche am Teich.
- **Prozentstreifen:** Preisschild mit Schnur (Schild selbst 1275 px breit); Kassenbon: unterer Teil des langen Bons im Seitenverhältnis des Felds ausgeschnitten (nicht gestreckt). Im Dunkelmodus beide abgedunkelt (`theme.bg` darübergelegt), damit die hellen Schriftfarben lesbar bleiben.
- **Sinus, Kosinus, Tangens:** Ziegelfoto als Muster, eine Ziegelreihe so hoch wie in der Ersatzgrafik, im Dunkelmodus abgedunkelt. Rollstuhl ohne Person (statt Piktogramm), etwa 0,95 m hoch, mit der Rampe gedreht.
- **Integral als Gesamtänderung:** Auto mit ausgeschnittenen, sich drehenden Felgen; Bremslicht als Lichtschein am Rücklicht des Fotos. Beim Fahrrad drehen sich die Räder **nicht**: ein gedrehter Radausschnitt würde Rahmen, Kette und Schaltwerk mitdrehen. Die Bewegung zeigt das Fahren über die Straße.
- **Ähnliche Figuren:** Das Auto wird beim Laden rot umgefärbt (nur kräftig blaue Pixel, Farbton gedreht), damit es zur Ersatzgrafik, den kleinen gezeichneten Modellen und dem roten Streifen des Farbeimers passt. Sehr kleine Modelle (unter 34 px) bleiben gezeichnet.
- **Extremwertaufgaben:** Das neue Holzdreieck wird unverzerrt am rechten Winkel angelegt und in das gezeichnete Dreieck geschnitten (statt eines kleinen Maserungsausschnitts). Blech: ganzes Foto statt des früheren Ausschnitts ohne Lichtfleck.
- **Proportionalität:** Jeder fünfte Apfel wird wie bisher grün (`series[2]`, eingefärbt). Taxi ohne Schrift auf dem Dachschild (bei 40–64 px Länge zu klein für Text).

## Nicht eingebaute Bilder

Die Dateien liegen weiter in `src/assets/sims/<id>/`, sind aber nicht deklariert. Der Test „Abgelegte Bilder müssen auch deklariert sein“ schlägt deshalb fehl, bis sie verschoben (z. B. nach `docs/bilder-eingang/`) oder gelöscht werden.

- `zahlengerade/eisberg.webp` (993 × 1429) – Seitenverhältnis 1 : 1,44 statt 1 : 2,5 und Wasserlinie bei 24 % statt 20 %. Der Pinguin steht auf der Flanke des Eisbergs bis zur Höhe +10 m. Ist der Teil über Wasser so hoch, wird der Eisberg (unverzerrt) etwa 650 px breit und verdeckt Skala und Pfeile. Ist er so breit wie der gezeichnete, reicht er nur bis etwa +2 m, und der Pinguin stünde in der Luft. Gezeichneter Eisberg bleibt.
- `strahlensaetze/fluchtstab.webp` (53 × 1458) – Seitenverhältnis 1 : 27,5 statt 1 : 15. Der Stab ist in der Szene 40–90 px hoch, als Foto also nur 1,5–3 px breit (gezeichnet 6 px). Rot-weiße Bänder sind dann nicht mehr zu erkennen.
- `prozentstreifen/sparbuch.webp` (1470 × 876) – aufgeschlagene Doppelseite mit Mittelfalz und eigenen Linien. Die Simulation schreibt drei Zeilen (Bezeichnung links, Betrag rechts) über die ganze Breite eines flachen Felds (etwa 210 × 70 px). Die Schrift liefe über den Falz, und die Fotolinien passen nicht zu den Zeilen. Bei passender Höhe wäre das Buch zudem nur etwa 120 px breit, zu schmal für die Beträge.
- `sin-cos-tan-dreieck/leiter.webp` (335 × 1518) – Seitenverhältnis 1 : 4,5 statt 1 : 8. Unverzerrt wäre eine 4-m-Leiter fast 1 m breit (gezeichnet etwa 0,1 m). Eine gekachelte, schmale Leiter hätte Sprossen in etwa halbem Abstand (0,15 statt 0,28 m).
