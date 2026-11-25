## Worum geht es?

Viele Größen hängen von **zwei** Einflüssen ab. Die Höhe einer Landschaft hängt von der Position in Ost-West- und in Nord-Süd-Richtung ab, das Volumen eines Zylinders von Radius und Höhe. Eine **Funktion mit zwei Veränderlichen** ordnet jedem Paar $(x \mid y)$ einen Wert $z = f(x, y)$ zu.

### Der Graph ist eine Fläche

Trägt man über jedem Punkt $(x \mid y)$ der Grundebene den Wert $z = f(x, y)$ nach oben ab, entsteht eine **Fläche im Raum**:

- $f(x, y) = \tfrac12(x^2 + y^2)$ ergibt eine Schüssel (**Paraboloid**) mit Tiefpunkt im Ursprung.
- $f(x, y) = \tfrac12(x^2 - y^2)$ ergibt einen **Sattel**.
- $f(x, y) = ax + by + c$ ergibt eine **Ebene**.

### Schnittkurven

Hält man eine Variable fest, wird aus der Fläche eine gewöhnliche Kurve:

- Für $y = y_0$ (fest) erhält man die Kurve $x \mapsto f(x, y_0)$. Sie liegt in einer Ebene parallel zur $x$-$z$-Ebene.
- Für $x = x_0$ (fest) erhält man die Kurve $y \mapsto f(x_0, y)$.

Beim Sattel $\tfrac12(x^2 - y^2)$ ist der Schnitt mit $y = 0$ eine nach oben geöffnete Parabel, der Schnitt mit $x = 0$ eine nach unten geöffnete.

### Partielle Ableitungen

Die Steigung der Schnittkurve in $x$-Richtung heißt **partielle Ableitung nach $x$**, geschrieben $f_x$ oder $\tfrac{\partial f}{\partial x}$. Man leitet nach $x$ ab und behandelt $y$ dabei wie eine Konstante. Entsprechend berechnet man $f_y$.

Beispiel: $f(x, y) = x^2 y + 3y$ hat $f_x = 2xy$ und $f_y = x^2 + 3$.

In der Simulation sind $f_x$ und $f_y$ die Steigungen der beiden gestrichelten **Tangenten** im Punkt $P$.

### Waagerechte Punkte

Sind beide partiellen Ableitungen null, ist die Fläche in $P$ waagerecht. Das kann ein **Hochpunkt**, ein **Tiefpunkt** oder ein **Sattelpunkt** sein. Am Sattelpunkt geht es in eine Richtung bergauf und in die andere bergab, wie auf einem Bergpass.

## Ausprobieren

- [Sattelpunkt](?fn=sattel&x0=0&y0=0&cut=beide&tan=1): Drehe das Bild. Welche Form haben die beiden Schnittkurven?
- [Tiefpunkt](?fn=paraboloid&x0=0&y0=0&cut=beide&tan=1): Ziehe den Punkt weg. Wie ändern sich die Tangenten?
- [Welle](?fn=welle&x0=0.5&y0=1&cut=x&tan=1): Suche Punkte, an denen die Fläche waagerecht ist.
- [Ebene](?fn=ebene&x0=1&y0=-1&cut=beide&tan=1): Warum sind die Steigungen überall gleich?

## Aufgaben

**1. Funktionswert.** Berechne für $f(x, y) = \tfrac12(x^2 - y^2)$ den Wert im Punkt $(2 \mid 1)$. [Aufgabe laden](?fn=sattel&x0=2&y0=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$f(2, 1) = \tfrac12(4 - 1) = 1{,}5$.

</details>

**2. Partielle Ableitungen.** Bestimme $f_x$ und $f_y$ für $f(x, y) = x^2 y + 3y$.

<details><summary>Lösung anzeigen</summary>

$f_x = 2xy$, denn $y$ wird wie eine Zahl behandelt. Und $f_y = x^2 + 3$.

</details>

**3. Schnittkurve.** Welche Kurve entsteht, wenn man das Paraboloid $\tfrac12(x^2 + y^2)$ mit der Ebene $y = 1$ schneidet? [Aufgabe laden](?fn=paraboloid&x0=0&y0=1&cut=x&_hide=1)

<details><summary>Lösung anzeigen</summary>

$z = \tfrac12 x^2 + \tfrac12$. Das ist eine Normalparabel, die mit dem Faktor $\tfrac12$ gestaucht und um $\tfrac12$ nach oben verschoben ist.

</details>

**4. Steigung im Punkt.** Wie groß sind die partiellen Ableitungen der Glocke $2e^{-(x^2+y^2)/2}$ im Punkt $(0 \mid 0)$? Was bedeutet das? [Aufgabe laden](?fn=glocke&x0=0&y0=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

Beide sind $0$. Die Fläche ist dort waagerecht, und es handelt sich um den Hochpunkt der Glocke.

</details>
