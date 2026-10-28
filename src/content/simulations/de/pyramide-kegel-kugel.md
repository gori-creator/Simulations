---
description: "Pyramide, Kegel und Kugel erforschen: Hilfsdreiecke mit dem Satz des Pythagoras, Volumen durch Umschütten, Oberfläche über das Netz."
---

## Worum geht es?

Pyramide, Kegel und Kugel sind Körper, bei denen man Volumen und Oberfläche nicht einfach „Länge mal Breite mal Höhe“ rechnen kann. Die Simulation zeigt, **woher die Formeln kommen**: Du kannst den Körper drehen, Wasser umschütten und das Netz abwickeln.

### Bausteine

- **Höhe $h$**: Abstand der Spitze von der Grundfläche (senkrecht).
- **Seitenhöhe $h_a$** (Pyramide): Höhe einer Seitenfläche, vom Grundkantenmittelpunkt zur Spitze.
- **Mantellinie $s$** (Kegel) bzw. **Seitenkante $s$** (Pyramide): Strecke von der Spitze zum Rand der Grundfläche.
- **Radius $r$**: bei Kegel und Kugel der Abstand zum Mittelpunkt.

Diese Strecken hängen über rechtwinklige Dreiecke zusammen (Satz des Pythagoras). Bei der quadratischen Pyramide mit der Diagonale $d = a\sqrt{2}$ der Grundfläche gilt

$$
h_a^2 = h^2 + \left(\tfrac{a}{2}\right)^2, \qquad s^2 = h^2 + \left(\tfrac{d}{2}\right)^2 = h_a^2 + \left(\tfrac{a}{2}\right)^2 .
$$

Beim Kegel gilt für die Mantellinie $s^2 = h^2 + r^2$. Achtung: Die Seitenhöhe $h_a$ und die Seitenkante $s$ sind verschiedene Strecken. $h_a$ trifft die Grundkante in der Mitte und senkrecht, $s$ endet in einer Ecke.

### Pyramide

Mit Grundfläche $G$ und Höhe $h$ gilt

$$
V = \tfrac{1}{3} \cdot G \cdot h, \qquad M = \text{Summe der Seitenflächen}, \qquad O = G + M .
$$

Bei der quadratischen Pyramide ist $G = a^2$ und $M = 4 \cdot \tfrac{1}{2} \cdot a \cdot h_a$. Das Wasser aus drei Pyramiden füllt genau das Prisma mit gleicher Grundfläche und Höhe.

### Kegel

$$
V = \tfrac{1}{3}\pi r^2 h, \qquad M = \pi r s, \qquad O = \pi r^2 + \pi r s .
$$

Der Mantel lässt sich als **Kreissektor** mit Radius $s$ und Bogenlänge $2\pi r$ abwickeln. Sein Winkel ist $\alpha = 360^\circ \cdot \tfrac{r}{s}$.

### Kugel

$$
V = \tfrac{4}{3}\pi r^3, \qquad O = 4\pi r^2 .
$$

- **Archimedes:** Zylinder (Höhe $r$, Radius $r$) = Kegel + Halbkugel. Der Kegel hat $\tfrac{1}{3}\pi r^3$, der Zylinder $\pi r^3$, also bleibt für die Halbkugel $\tfrac{2}{3}\pi r^3$ und für die ganze Kugel $\tfrac{4}{3}\pi r^3$.
- **Aus Pyramiden:** Zerlegt man die Kugel in viele Pyramiden mit Höhe $r$, ist $V = \tfrac{1}{3} \cdot O \cdot r$. Daraus folgt $O = 3V : r = 4\pi r^2$.

## Ausprobieren

1. Wähle die quadratische Pyramide und schalte zwischen den Hilfsdreiecken um. Welche Strecke ist immer die längste? [Pyramide laden](?a=4&h=5)
2. Schütte die Pyramide dreimal um. Wie viel vom Prisma füllt eine Pyramide? [Umschütten](?mode=volumen&a=4&h=5)
3. Probiere dasselbe mit dem Kegel. Was ändert sich, wenn du $r$ oder $h$ änderst? [Kegel umschütten](?body=kegel&mode=volumen)
4. Wickle den Kegelmantel ab. Verändere $h$ und beobachte den Winkel $\alpha$. [Kegelmantel](?body=kegel&mode=oberflaeche&open=100)
5. Schütte nach Archimedes: Kegel, dann Halbkugel. [Archimedes](?body=kugel&mode=volumen&r=2.5)
6. Zerlege die Kugel in Pyramiden und dreh sie. [Kugel aus Pyramiden](?body=kugel&mode=oberflaeche&r=2&split=70)

## Aufgaben

### Aufgabe 1: Quadratische Pyramide

Eine quadratische Pyramide hat die Grundkante $a = 4\,\text{cm}$ und die Höhe $h = 5\,\text{cm}$. Berechne Seitenhöhe, Volumen, Mantelfläche und Oberfläche. [Aufgabe laden](?a=4&h=5&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$h_a = \sqrt{5^2 + 2^2}\,\text{cm} = \sqrt{29}\,\text{cm} \approx 5{,}39\,\text{cm}$

$V = \tfrac{1}{3} \cdot 16\,\text{cm}^2 \cdot 5\,\text{cm} \approx 26{,}67\,\text{cm}^3$

$M = 4 \cdot \tfrac{1}{2} \cdot 4\,\text{cm} \cdot \sqrt{29}\,\text{cm} = 8\sqrt{29}\,\text{cm}^2 \approx 43{,}08\,\text{cm}^2$

$O = 16\,\text{cm}^2 + 43{,}08\,\text{cm}^2 \approx 59{,}08\,\text{cm}^2$

[In der Simulation zeigen](?a=4&h=5)

</details>

### Aufgabe 2: Kegel

Ein Kegel hat den Radius $r = 3\,\text{cm}$ und die Höhe $h = 4\,\text{cm}$. Bestimme $s$, $V$, $M$ und $O$. [Aufgabe laden](?body=kegel&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$s = \sqrt{4^2 + 3^2}\,\text{cm} = 5\,\text{cm}$

$V = \tfrac{1}{3}\pi \cdot 9\,\text{cm}^2 \cdot 4\,\text{cm} = 12\pi\,\text{cm}^3 \approx 37{,}70\,\text{cm}^3$

$M = \pi \cdot 3\,\text{cm} \cdot 5\,\text{cm} = 15\pi\,\text{cm}^2 \approx 47{,}12\,\text{cm}^2$

$O = 9\pi\,\text{cm}^2 + 15\pi\,\text{cm}^2 = 24\pi\,\text{cm}^2 \approx 75{,}40\,\text{cm}^2$

[In der Simulation zeigen](?body=kegel&mode=oberflaeche&open=100)

</details>

### Aufgabe 3: Kugel

Eine Kugel hat den Radius $r = 2{,}5\,\text{cm}$. Berechne Volumen und Oberfläche. Wie viel Prozent des umgebenden Zylinders (Höhe $2r$) füllt die Kugel? [Aufgabe laden](?body=kugel&r=2.5&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V = \tfrac{4}{3}\pi \cdot (2{,}5\,\text{cm})^3 \approx 65{,}45\,\text{cm}^3$

$O = 4\pi \cdot (2{,}5\,\text{cm})^2 = 25\pi\,\text{cm}^2 \approx 78{,}54\,\text{cm}^2$

Der Zylinder hat $V = 2\pi r^3 \approx 98{,}17\,\text{cm}^3$. Die Kugel füllt $\tfrac{2}{3} \approx 66{,}7\,\%$ davon.

[In der Simulation zeigen](?body=kugel&r=2.5&cyl=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 9/10, Körperberechnung. Geeignet als Einstieg (Umschüttversuch), zur Übung (Pythagoras im Körper) und zur Vertiefung (Archimedes).
- **Modell:** Die Pyramide hat ein regelmäßiges $n$-Eck als Grundfläche, die Spitze liegt senkrecht über dem Mittelpunkt. Beim Umschütten wird das Wasser exakt nach dem Volumen berechnet, gezeichnet ist es nur angenähert.
- **Typische Fehler:**
  - Der Faktor $\tfrac{1}{3}$ wird vergessen – richtig: Pyramide und Kegel füllen nur ein Drittel.
  - $r$ und $d$ werden verwechselt – in den Formeln steht der Radius.
  - Höhe $h$ und Seitenhöhe $h_a$ bzw. Mantellinie $s$ werden verwechselt – $s$ ist immer länger als $h$.
