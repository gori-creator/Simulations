---
description: "Einen Punkt im Raum ziehen und den Koordinatenweg x₁ → x₂ → x₃ verfolgen, Projektionen in die Koordinatenebenen und Quader mit benannten Ecken – drehbar und mit Blick von oben, vorn und von der Seite."
---

## Worum geht es?

Im **räumlichen (kartesischen) Koordinatensystem** stehen drei Achsen paarweise senkrecht aufeinander und schneiden sich im **Ursprung** $O(0 \mid 0 \mid 0)$. Wie im Schulbuch zeigt

- die $x_1$-Achse schräg **nach vorn** (auf dich zu),
- die $x_2$-Achse **nach rechts**,
- die $x_3$-Achse **nach oben**.

Ein Punkt $P(p_1 \mid p_2 \mid p_3)$ wird über seinen **Koordinatenweg** erreicht: vom Ursprung $p_1$ Einheiten in $x_1$-Richtung, dann $p_2$ Einheiten in $x_2$-Richtung, dann $p_3$ Einheiten in $x_3$-Richtung. Negative Koordinaten bedeuten die Gegenrichtung (nach hinten, links, unten).

Je zwei Achsen spannen eine **Koordinatenebene** auf: die $x_1x_2$-Ebene („Boden“, $x_3 = 0$), die $x_1x_3$-Ebene ($x_2 = 0$) und die $x_2x_3$-Ebene ($x_1 = 0$). Liegt ein Punkt in einer Koordinatenebene, ist eine seiner Koordinaten $0$; liegt er auf einer Achse, sind es zwei.

**Projektionen:** Lässt man von $P(2 \mid 3 \mid 4)$ das Lot auf die $x_1x_2$-Ebene fällen, erhält man den Fußpunkt $P_{12}(2 \mid 3 \mid 0)$ – die dritte Koordinate wird $0$. Ebenso $P_{13}(2 \mid 0 \mid 4)$ und $P_{23}(0 \mid 3 \mid 4)$.

**Abstand vom Ursprung:** Zweimal der Satz des Pythagoras (erst im Boden, dann senkrecht dazu) ergibt

$$
\overline{OP} = \sqrt{p_1^2 + p_2^2 + p_3^2}, \qquad \text{z. B. } \sqrt{3^2 + 4^2 + 2^2} = \sqrt{29} \approx 5{,}39.
$$

Ein **achsenparalleler Quader** $ABCDEFGH$ mit Ecke $A(a_1 \mid a_2 \mid a_3)$ und Kantenlängen $a, b, c$ hat die Ecken $B = A + (a \mid 0 \mid 0)$, $C = A + (a \mid b \mid 0)$, $D = A + (0 \mid b \mid 0)$ und darüber $E, F, G, H$ (jeweils $x_3$ um $c$ größer). Die **Raumdiagonale** ist $\sqrt{a^2 + b^2 + c^2}$ lang.

**Vorsicht beim Ablesen:** Ein Schrägbild ist zweideutig – viele Raumpunkte erscheinen an derselben Stelle der Zeichnung. Erst Hilfslinien (Koordinatenweg, Lot auf den Boden) oder ein Drehen der Ansicht zeigen, wo ein Punkt wirklich liegt.

## Ausprobieren

1. Klicke auf **Weg vom Ursprung** und verfolge, wie man zu $P(3 \mid 4 \mid 2)$ kommt. [Beispiel laden](?x=3&y=4&z=2)
2. Ziehe den hellen Fußpunkt in der $x_1x_2$-Ebene und dann den Punkt nach oben. Welche Koordinate ändert sich jeweils?
3. Schalte die Ansicht mit **Blick** um: von oben, von vorn, von der Seite. Welche Koordinaten kannst du in welcher Ansicht ablesen – und welche verschwindet? [Beispiel laden](?x=2&y=3&z=3&proj=1)
4. Lege den Punkt in die $x_2x_3$-Ebene. Was passiert mit seiner Projektion $P_{23}$? [Beispiel laden](?x=0&y=3&z=3&proj=1)
5. Blende den Koordinatenweg aus und drehe die Ansicht nicht. Kannst du die Koordinaten trotzdem sicher ablesen? [Beispiel laden](?x=-2&y=3&z=-1.5&lines=0)
6. Wechsle zum **Quader** und tippe die Ecken an. Welche Ecken liegen in der $x_1x_2$-Ebene? [Quader](?mode=box&x=0&y=0&z=0&a=3&b=4&c=2)

## Aufgaben

### Aufgabe 1: Koordinaten ablesen

Lies die Koordinaten des Punktes ab. Drehe die Ansicht, wenn du unsicher bist. [Aufgabe laden](?x=-2&y=3&z=-1.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P(-2 \mid 3 \mid -1{,}5)$: $2$ nach hinten, $3$ nach rechts, $1{,}5$ nach unten – der Punkt liegt unterhalb der $x_1x_2$-Ebene. [In der Simulation zeigen](?x=-2&y=3&z=-1.5)

</details>

### Aufgabe 2: Projektionen

Gib die Projektionen von $P(2 \mid 3 \mid 3)$ in die drei Koordinatenebenen an. [Aufgabe laden](?x=2&y=3&z=3&proj=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P_{12}(2 \mid 3 \mid 0)$, $P_{13}(2 \mid 0 \mid 3)$, $P_{23}(0 \mid 3 \mid 3)$. [In der Simulation zeigen](?x=2&y=3&z=3&proj=1)

</details>

### Aufgabe 3: Abstand vom Ursprung

Berechne den Abstand des Punktes $P(3 \mid 4 \mid 2)$ vom Ursprung. Welcher Punkt auf der $x_3$-Achse hat denselben Abstand (mit positiver Koordinate)? [Aufgabe laden](?x=3&y=4&z=2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\overline{OP} = \sqrt{9 + 16 + 4} = \sqrt{29} \approx 5{,}39$. Auf der $x_3$-Achse: $Q(0 \mid 0 \mid \sqrt{29})$.

</details>

### Aufgabe 4: Eckpunkte eines Quaders

Ein Quader hat die Ecke $A(1 \mid -2 \mid 1)$ und die Kantenlängen $a = 2$, $b = 3$, $c = 2{,}5$. Gib die Koordinaten aller Ecken an. [Aufgabe laden](?mode=box&x=1&y=-2&z=1&a=2&b=3&c=2.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A(1 \mid -2 \mid 1)$, $B(3 \mid -2 \mid 1)$, $C(3 \mid 1 \mid 1)$, $D(1 \mid 1 \mid 1)$, $E(1 \mid -2 \mid 3{,}5)$, $F(3 \mid -2 \mid 3{,}5)$, $G(3 \mid 1 \mid 3{,}5)$, $H(1 \mid 1 \mid 3{,}5)$. [In der Simulation zeigen](?mode=box&x=1&y=-2&z=1&a=2&b=3&c=2.5)

</details>

### Aufgabe 5: Raumdiagonale

Der Quader am Ursprung hat $a = 3$, $b = 4$, $c = 2$. Berechne die Länge der Raumdiagonale $\overline{AG}$ und das Volumen. [Aufgabe laden](?mode=box&x=0&y=0&z=0&a=3&b=4&c=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\overline{AG} = \sqrt{3^2 + 4^2 + 2^2} = \sqrt{29} \approx 5{,}39$ – genauso lang wie $\overline{OP}$ in Aufgabe 3, denn $G(3 \mid 4 \mid 2)$. Volumen $V = 3 \cdot 4 \cdot 2 = 24$. [In der Simulation zeigen](?mode=box&x=0&y=0&z=0&a=3&b=4&c=2)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12, Lernbereich „Grundlagen der Koordinatengeometrie im Raum“ (LehrplanPLUS Bayern, Gymnasium), als Einstieg in die analytische Geometrie.
- **Zweideutigkeit des Schrägbilds:** Eine Möglichkeit ist, die Ansicht zunächst nicht zu drehen und Punkte ohne Hilfslinien ablesen zu lassen – die Diskussion, warum das nicht eindeutig ist, motiviert Koordinatenweg und Lot.
- **Blickrichtungen:** Die Ansichten von oben, vorn und von der Seite entsprechen Grundriss, Aufriss und Seitenriss; sie zeigen jeweils genau zwei Koordinaten.
- **Häufige Stolpersteine:**
  - Die $x_1$-Achse wird mit der „waagerechten“ $x$-Achse aus der Ebene verwechselt.
  - Beim Ablesen wird der Fußpunkt in der $x_1x_2$-Ebene übersehen und der Punkt nur „im Bild“ verortet.
  - Bei Projektionen wird die falsche Koordinate $0$ gesetzt (in der $x_1x_2$-Ebene ist es $x_3$).
  - Die Benennung der Quaderecken ist nicht überall gleich; ein kurzer Blick auf die Festlegung im Schulbuch hilft.
