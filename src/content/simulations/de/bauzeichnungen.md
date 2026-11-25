## Worum geht es?

Ein Gebäude ist dreidimensional, ein Bauplan aber flach. Damit man trotzdem alle Maße ablesen kann, zeichnet man das Gebäude aus mehreren Richtungen. Dazu dienen **Parallelprojektionen**: Alle Punkte werden entlang paralleler Linien auf die Zeichenebene übertragen.

### Dreitafelprojektion

Bei der **senkrechten Parallelprojektion** blickt man genau senkrecht auf eine Seite:

- Der **Aufriss** zeigt die Ansicht von vorn mit Länge und Höhe.
- Der **Seitenriss** zeigt die Ansicht von links mit Breite und Höhe.
- Der **Grundriss** zeigt die Ansicht von oben mit Länge und Breite.

Die drei Ansichten werden so angeordnet, dass zusammengehörige Punkte auf denselben **Ordnungslinien** liegen: Der Grundriss steht unter dem Aufriss, der Seitenriss rechts daneben. Architekten nennen das Grundriss, Ansichten und Schnitte.

### Schrägbild

Das **Schrägbild** zeigt den Körper räumlich in einem Bild. Die Vorderansicht wird unverzerrt gezeichnet, und die nach hinten laufenden Kanten werden unter einem Winkel $\alpha$ gezeichnet und mit einem Faktor $k$ verkürzt. Üblich sind $\alpha = 45°$ und $k = \tfrac12$ (**Kavalierprojektion**). Strecken parallel zur Vorderfläche erscheinen in wahrer Länge, Tiefen dagegen verkürzt.

### Wahre Größe

Eine Strecke oder Fläche erscheint in einer Ansicht nur dann in **wahrer Größe**, wenn sie **parallel** zur Zeichenebene liegt. Die schräge Dachfläche eines Satteldachs liegt in keiner der drei Tafeln parallel:

- Im **Grundriss** erscheint sie verkürzt, ihre Tiefe ist dort nur die halbe Hausbreite $\tfrac b2$.
- Im **Seitenriss** erscheint die Dachschräge $s$ in wahrer Länge. Mit dem Satz des Pythagoras gilt $s = \sqrt{\left(\tfrac b2\right)^2 + d^2}$.

Die wahre Größe der Dachfläche (zum Beispiel für die Anzahl der Dachziegel) ist dann $a \cdot s$. Sie ist immer größer als die Fläche, die man im Grundriss sieht.

## Ausprobieren

- [Einfamilienhaus](?mode=dreitafel&body=haus&a=10&b=6&h=3&d=4): Folge den Ordnungslinien. Wo erscheint der First im Seitenriss?
- [Walmdach](?mode=dreitafel&body=walm&a=12&b=8&h=3&d=3): Wie unterscheidet sich der Grundriss vom Satteldach?
- [Schrägbild 45°, ½](?mode=schraeg&body=haus&al=45&k=0.5): Verändere Winkel und Faktor. Welche Kanten behalten ihre Länge?
- [Dachfläche in wahrer Größe](?mode=wahre&body=haus&a=10&b=6&h=3&d=4): Wie hängt die Länge s von der Dachhöhe ab?

## Aufgaben

**1. Dachschräge.** Ein Haus ist 6 m breit, das Dach 4 m hoch. Wie lang ist die Dachschräge? [Aufgabe laden](?mode=wahre&body=haus&a=10&b=6&h=3&d=4&_hide=1)

<details><summary>Lösung anzeigen</summary>

$s = \sqrt{3^2 + 4^2} = 5$ m.

</details>

**2. Dachfläche.** Wie groß sind beide Dachflächen zusammen, wenn das Haus 10 m lang ist? Wie groß erscheinen sie im Grundriss?

<details><summary>Lösung anzeigen</summary>

Die wahre Größe ist $2 \cdot 10 \cdot 5 = 100\,\text{m}^2$. Im Grundriss erscheinen sie nur als $10 \cdot 6 = 60\,\text{m}^2$.

</details>

**3. Schrägbild.** Ein Würfel mit 4 cm Kantenlänge wird mit $\alpha = 45°$ und $k = \tfrac12$ gezeichnet. Wie lang zeichnest du die nach hinten laufenden Kanten? [Aufgabe laden](?mode=schraeg&body=winkel&al=45&k=0.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$4\,\text{cm} \cdot \tfrac12 = 2$ cm, unter 45° zur Waagerechten.

</details>

**4. Ansicht zuordnen.** In welcher Ansicht sieht man beim Satteldach den dreieckigen Giebel?

<details><summary>Lösung anzeigen</summary>

Im Seitenriss, denn der Giebel liegt an der Schmalseite und parallel zur Seitentafel.

</details>
