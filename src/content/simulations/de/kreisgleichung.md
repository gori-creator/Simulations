## Worum geht es?

Ein **Kreis** mit Mittelpunkt $M(a \mid b)$ und Radius $r$ besteht aus allen Punkten $P(x \mid y)$, die von $M$ genau den Abstand $r$ haben. Mit dem Satz des Pythagoras wird daraus eine Gleichung.

### Die Kreisgleichung

$$(x - a)^2 + (y - b)^2 = r^2$$

Das ist die **Mittelpunktsform**. Ein Beispiel: Der Kreis um $M(1 \mid -1)$ mit $r = 4$ hat die Gleichung $(x - 1)^2 + (y + 1)^2 = 16$. Achtung beim Vorzeichen: Aus $y - (-1)$ wird $y + 1$.

Multipliziert man die Klammern aus, erhält man die **allgemeine Form**:

$$x^2 + y^2 + Dx + Ey + F = 0$$

Umgekehrt findet man $M$ und $r$ durch **quadratische Ergänzung**. Beispiel:

$$x^2 + y^2 - 4x + 6y - 3 = 0 \;\Leftrightarrow\; (x - 2)^2 + (y + 3)^2 = 16$$

Das ist ein Kreis um $M(2 \mid -3)$ mit $r = 4$.

### Lage eines Punktes

Man setzt den Punkt in die linke Seite ein und vergleicht das Ergebnis mit $r^2$:

- Ist es kleiner als $r^2$, liegt der Punkt **innerhalb** des Kreises.
- Ist es gleich $r^2$, liegt der Punkt **auf** dem Kreis.
- Ist es größer als $r^2$, liegt der Punkt **außerhalb** des Kreises.

### Kreis und Gerade

Eine Gerade kann einen Kreis **schneiden** (Sekante), **berühren** (Tangente) oder an ihm **vorbeigehen** (Passante). Zwei Wege führen zur Entscheidung:

1. **Rechnerisch:** Man setzt $y = mx + n$ in die Kreisgleichung ein. Es entsteht eine quadratische Gleichung. Ihre Diskriminante entscheidet: positiv heißt zwei Schnittpunkte, null heißt ein Berührpunkt, negativ heißt kein gemeinsamer Punkt.
2. **Mit dem Abstand:** Man vergleicht den Abstand $d$ des Mittelpunkts von der Geraden mit $r$. Ist $d < r$, ist die Gerade eine Sekante. Ist $d = r$, ist sie eine Tangente. Ist $d > r$, ist sie eine Passante.

### Zwei Kreise

Entscheidend ist der Abstand $|M_1M_2|$ der Mittelpunkte:

| Abstand der Mittelpunkte | Lage |
| --- | --- |
| größer als $r_1 + r_2$ | außerhalb voneinander |
| gleich $r_1 + r_2$ | berühren sich von außen |
| zwischen $\lvert r_1 - r_2 \rvert$ und $r_1 + r_2$ | schneiden sich in zwei Punkten |
| gleich $\lvert r_1 - r_2 \rvert$ | berühren sich von innen |
| kleiner als $\lvert r_1 - r_2 \rvert$ | ein Kreis liegt im anderen |

Die Schnittpunkte berechnet man so: Man subtrahiert die beiden Gleichungen. Dabei fallen $x^2$ und $y^2$ weg, und es bleibt eine Gerade übrig. Diese Gerade schneidet man dann mit einem der beiden Kreise.

### Tangenten

Die Tangente steht **senkrecht auf dem Radius** zum Berührpunkt $T(t_1 \mid t_2)$. Ihre Gleichung lautet:

$$(x - a)(t_1 - a) + (y - b)(t_2 - b) = r^2$$

Von einem Punkt $P$ **außerhalb** des Kreises gibt es zwei Tangenten. Ihre Berührpunkte liegen auf dem **Thaleskreis** über der Strecke $\overline{MP}$, denn der Winkel bei $T$ ist ein rechter Winkel.

## Ausprobieren

- [Kreis um den Ursprung](?mode=punkt&a=0&b=0&r=5&px=3&py=4): Liegt P(3|4) auf dem Kreis? Ziehe P nach innen und nach außen.
- [Sekante](?mode=gerade&a=1&b=-1&r=4&m=0.5&n=1): Verschiebe die Gerade, bis sie den Kreis nur noch berührt.
- [Zwei Kreise](?mode=zwei&a=0&b=0&r=4&c=5&e=1&s=3): Ziehe M₂ und beobachte die Fälle in der Tabelle.
- [Tangenten von außen](?mode=tangente&a=0&b=0&r=3&px=7&py=2): Wo schneidet der Thaleskreis den Kreis?

## Aufgaben

**1. Gleichung aufstellen.** Gib die Gleichung des Kreises um $M(-2 \mid 3)$ mit $r = 5$ an. Liegt $P(1 \mid 7)$ auf dem Kreis? [Aufgabe laden](?mode=punkt&a=-2&b=3&r=5&px=1&py=7&_hide=1)

<details><summary>Lösung anzeigen</summary>

$(x + 2)^2 + (y - 3)^2 = 25$. Einsetzen ergibt $3^2 + 4^2 = 25$. Also liegt $P$ auf dem Kreis.

</details>

**2. Mittelpunkt finden.** Bestimme Mittelpunkt und Radius von $x^2 + y^2 + 2x - 4y - 4 = 0$.

<details><summary>Lösung anzeigen</summary>

$(x + 1)^2 - 1 + (y - 2)^2 - 4 - 4 = 0$, also $(x + 1)^2 + (y - 2)^2 = 9$. Der Kreis hat den Mittelpunkt $M(-1 \mid 2)$ und den Radius $r = 3$.

</details>

**3. Kreis und Gerade.** Schneidet $y = 3$ den Kreis $x^2 + y^2 = 25$? [Aufgabe laden](?mode=gerade&a=0&b=0&r=5&m=0&n=3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$x^2 + 9 = 25$, also $x = \pm 4$. Die Gerade ist eine Sekante mit den Schnittpunkten $(-4 \mid 3)$ und $(4 \mid 3)$.

</details>

**4. Tangente.** Bestimme die Tangente an $x^2 + y^2 = 25$ im Punkt $T(3 \mid 4)$. [Aufgabe laden](?mode=tangente&a=0&b=0&r=5&px=3&py=4&_hide=1)

<details><summary>Lösung anzeigen</summary>

$3x + 4y = 25$, also $y = -0{,}75x + 6{,}25$.

</details>
