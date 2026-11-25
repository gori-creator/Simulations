## Worum geht es?

Ein Elektron, das in einem engen Bereich eingesperrt ist – etwa in einem langen Molekül oder einem winzigen Halbleiterkristall –, verhält sich wie eine **Welle**. Im einfachsten Modell steckt es in einem **Potentialtopf** der Breite $L$ mit unendlich hohen Wänden.

### Stehende Wellen und Energiestufen

Wie bei einer eingespannten Saite passen nur **stehende Wellen** in den Topf, deren halbe Wellenlänge genau $n$-mal hineinpasst:

$$
\lambda_n = \frac{2L}{n} \qquad n = 1, 2, 3, \dots
$$

Mit der de-Broglie-Beziehung $p = \frac{h}{\lambda}$ folgen daraus die erlaubten Energien

$$
E_n = \frac{h^2}{8 m L^2} \cdot n^2
$$

Die Energie ist also **gequantelt**: Es gibt nur bestimmte Stufen, und sie werden mit $n^2$ immer weiter auseinander. Je enger der Topf, desto größer die Abstände. Selbst im **Grundzustand** ($n = 1$) ruht das Teilchen nie.

### Aufenthaltswahrscheinlichkeit

Wo genau das Teilchen ist, kann man nicht sagen. Die **Wellenfunktion** $\psi_n(x) = \sqrt{\frac{2}{L}} \sin\left(\frac{n \pi x}{L}\right)$ liefert über ihr **Betragsquadrat** $|\psi|^2$ die Wahrscheinlichkeitsdichte. Die Fläche unter $|\psi|^2$ in einem Bereich ist die Wahrscheinlichkeit, das Teilchen dort zu finden.

- Im Grundzustand ist das Teilchen am ehesten in der Mitte.
- Für $n = 2$ ist es genau in der Mitte **nie** – dort hat die Welle einen Knoten.
- Für große $n$ wird die Verteilung immer gleichmäßiger, wie man es klassisch erwarten würde.

### Übergänge und Licht

Springt das Elektron von einer höheren auf eine tiefere Stufe, sendet es ein **Photon** mit $E = h f = \frac{h c}{\lambda} = E_{n_1} - E_{n_2}$ aus. So erklärt das Modell die Farben mancher Farbstoffe und die Leuchtfarben von Quantenpunkten. Mit Nukleonen im Atomkern ($L \approx 10\,\text{fm}$) liegen die Energien im MeV-Bereich – daher kommt Gammastrahlung.

## Ausprobieren

- [Grundzustand](?n=1): Wie groß ist die Wahrscheinlichkeit im mittleren Fünftel?
- [n = 2](?n=2&xa=0.45&xb=0.55): Warum ist die Wahrscheinlichkeit in der Mitte fast null?
- [Großes n](?n=5&xa=0&xb=0.5)
- [Sichtbares Licht](?Lnm=0.65&n=2&n2=1) und [Nukleon im Kern](?teil=n&Lfm=10&n=2&n2=1).

## Aufgaben

**1. Energiestufen.** Ein Elektron sitzt in einem Topf mit $L = 1\,\text{nm}$. Berechne $E_1$ und $E_3$ in eV. [Aufgabe laden](?Lnm=1&n=3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$E_1 = \frac{(6{,}63 \cdot 10^{-34})^2}{8 \cdot 9{,}11 \cdot 10^{-31} \cdot (10^{-9})^2}\,\text{J} \approx 6{,}0 \cdot 10^{-20}\,\text{J} \approx 0{,}376\,\text{eV}$, $E_3 = 9 \cdot E_1 \approx 3{,}38\,\text{eV}$.

</details>

**2. Engerer Topf.** Wie ändern sich die Energien, wenn man den Topf halb so breit macht?

<details><summary>Lösung anzeigen</summary>

$E \sim \frac{1}{L^2}$: Alle Energien werden **viermal** so groß. Deshalb leuchten kleinere Quantenpunkte blauer.

</details>

**3. Welche Farbe?** Ein Elektron springt in einem 0,65 nm breiten Topf von $n = 2$ auf $n = 1$. Welche Wellenlänge hat das Photon? [Aufgabe laden](?Lnm=0.65&n=2&n2=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\Delta E = 3 E_1 = \frac{3 h^2}{8 m L^2}$, also $\lambda = \frac{h c}{\Delta E} = \frac{8 m L^2 c}{3 h} \approx 465\,\text{nm}$ – blaues Licht.

</details>

**4. Aufenthaltswahrscheinlichkeit.** Mit welcher Wahrscheinlichkeit findet man das Teilchen im Grundzustand im mittleren Fünftel ($0{,}4L$ bis $0{,}6L$)? Was sagt die klassische Physik? [Aufgabe laden](?n=1&xa=0.4&xb=0.6&_hide=1)

<details><summary>Lösung anzeigen</summary>

Etwa 39 %. Klassisch wäre jeder Ort gleich wahrscheinlich, also 20 %.

</details>

## Ideen für den Unterricht

- **Analogie:** Saite mit Grund- und Obertönen – dieselbe Bedingung $L = n \cdot \frac{\lambda}{2}$.
- **Farbstoffe:** Die Farbe langkettiger Farbstoffmoleküle mit dem Modell abschätzen.
- **Vernetzung:** Linienspektren, Photoeffekt und Elektronenbeugung als weitere Hinweise auf Quantelung und Welleneigenschaften.
