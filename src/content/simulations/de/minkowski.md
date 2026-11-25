## Worum geht es?

In der speziellen Relativitätstheorie gehören Raum und Zeit zusammen. Ein **Minkowski-Diagramm** zeigt beides in einem Bild: waagerecht den Ort $x$, senkrecht die Zeit – als Strecke $ct$, die das Licht in dieser Zeit zurücklegt. Licht läuft deshalb immer unter **45°**.

### Ereignisse und Bezugssysteme

Ein Punkt im Diagramm ist ein **Ereignis**: etwas, das an einem bestimmten Ort zu einer bestimmten Zeit passiert. Ein Beobachter, der sich mit der Geschwindigkeit $v = \beta c$ bewegt, benutzt eigene Koordinaten $x'$ und $ct'$. Seine Achsen sind im Diagramm **gekippt** – beide in Richtung der Lichtlinie, umso stärker, je schneller er ist:

- die $ct'$-Achse ist seine eigene Weltlinie: $x = \beta \cdot ct$,
- die $x'$-Achse enthält alle Ereignisse, die für ihn gleichzeitig mit $ct' = 0$ sind: $ct = \beta \cdot x$.

Die Lichtlinie bleibt für beide unter 45° – das ist die **Konstanz der Lichtgeschwindigkeit**.

### Die Lorentz-Transformation

Die Koordinaten eines Ereignisses im bewegten System berechnet man mit

$$x' = \gamma\,(x - \beta\,ct), \qquad ct' = \gamma\,(ct - \beta\,x), \qquad \gamma = \frac{1}{\sqrt{1-\beta^2}}.$$

Im Diagramm liest man sie ab, indem man vom Ereignis **parallel zu den gekippten Achsen** zur jeweils anderen Achse geht (gestrichelte Linien). Die Einheiten auf den gekippten Achsen (Punkte) sind dabei gestreckt.

**Relativität der Gleichzeitigkeit:** Zwei Ereignisse auf der $x$-Achse sind in $S$ gleichzeitig ($ct = 0$), in $S'$ aber nicht. Gleich bleibt dagegen der **Raumzeit-Abstand** $s^2 = (ct)^2 - x^2$.

### Geschwindigkeiten addieren

Fährt ein Zug mit $v$ und fliegt darin eine Rakete mit $u'$ nach vorn, ist sie vom Bahnsteig aus nicht einfach $u' + v$ schnell, sondern

$$u = \frac{u' + v}{1 + \dfrac{u' \cdot v}{c^2}}.$$

Bei Alltagsgeschwindigkeiten ist der Nenner fast 1 – dann gilt die klassische Rechnung. Nahe der Lichtgeschwindigkeit wird $u$ aber **nie größer als $c$**: $0{,}9c + 0{,}9c$ ergibt etwa $0{,}994c$.

## Ausprobieren

- [Gleichzeitig?](?mode=diagramm&beta=0.5&ex=3&et=0): Das Ereignis passiert in $S$ zur Zeit 0. Wann passiert es in $S'$?
- [Lichtsignal](?mode=diagramm&beta=0.6&ex=3&et=3): Ändere $\beta$. Was fällt bei $x'$ und $ct'$ auf?
- [0,6c + 0,6c](?mode=addition&v=0.6&u=0.6): Vergleiche relativistisch und klassisch.
- [0,9c + 0,9c](?mode=addition&v=0.9&u=0.9): Wie nah kommt die Rakete an $c$?

## Aufgaben

**1. Lorentz-Faktor.** Berechne $\gamma$ für $\beta = 0{,}6$. [Aufgabe laden](?mode=diagramm&beta=0.6&ex=2&et=3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\gamma = \dfrac{1}{\sqrt{1 - 0{,}36}} = \dfrac{1}{0{,}8} = 1{,}25$.

</details>

**2. Koordinaten umrechnen.** Ein Ereignis hat in $S$ die Koordinaten $x = 2$, $ct = 3$. Berechne $x'$ und $ct'$ für $\beta = 0{,}6$. [Aufgabe laden](?mode=diagramm&beta=0.6&ex=2&et=3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$x' = 1{,}25 \cdot (2 - 0{,}6 \cdot 3) = 0{,}25$, $ct' = 1{,}25 \cdot (3 - 0{,}6 \cdot 2) = 2{,}25$. Probe: $3^2 - 2^2 = 5 = 2{,}25^2 - 0{,}25^2$.

</details>

**3. Addition.** Ein Raumschiff fliegt mit $0{,}5c$ und schießt eine Sonde mit $0{,}8c$ nach vorn. Wie schnell ist die Sonde von der Erde aus? [Aufgabe laden](?mode=addition&v=0.5&u=0.8&_hide=1)

<details><summary>Lösung anzeigen</summary>

$u = \dfrac{0{,}8 + 0{,}5}{1 + 0{,}4}\,c = \dfrac{1{,}3}{1{,}4}\,c \approx 0{,}93c$.

</details>
