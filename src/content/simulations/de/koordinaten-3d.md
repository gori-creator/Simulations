---
description: "Räumliches Koordinatensystem in sechs Ansichten: Punkt mit Koordinatenweg, Projektionen und Spiegelpunkt, Quader mit Raumdiagonale, Abstand zweier Punkte, Punkte finden, Grundriss–Aufriss–Seitenriss mit Rätsel und die acht Oktanten mit Zufallspunkten – drehbar und mit Blick von oben, vorn und von der Seite."
---

## Worum geht es?

Im **räumlichen Koordinatensystem** stehen drei Achsen paarweise senkrecht aufeinander und schneiden sich im **Ursprung** $O(0 \mid 0 \mid 0)$: die $x_1$-Achse zeigt schräg **nach vorn**, die $x_2$-Achse **nach rechts**, die $x_3$-Achse **nach oben**. Ein Punkt $P(p_1 \mid p_2 \mid p_3)$ wird über seinen **Koordinatenweg** erreicht: $p_1$ in $x_1$-Richtung, dann $p_2$ in $x_2$-Richtung, dann $p_3$ in $x_3$-Richtung; negative Koordinaten bedeuten die Gegenrichtung.

Je zwei Achsen spannen eine **Koordinatenebene** auf ($x_1x_2$-Ebene: $x_3 = 0$ usw.). In einer Koordinatenebene ist eine Koordinate $0$, auf einer Achse sind es zwei – dann leuchtet die Ebene bzw. Achse auf. Die **Projektion** von $P(2 \mid 3 \mid 4)$ in die $x_1x_2$-Ebene ist $P_{12}(2 \mid 3 \mid 0)$.

**Abstände** ergeben sich mit zweimal Pythagoras:

$$
\overline{OP} = \sqrt{p_1^2 + p_2^2 + p_3^2}, \qquad \overline{PQ} = \sqrt{\Delta x_1^2 + \Delta x_2^2 + \Delta x_3^2}, \qquad \text{z. B. } \sqrt{3^2 + 4^2 + 2^2} = \sqrt{29} \approx 5{,}39.
$$

Ein **achsenparalleler Quader** mit Kanten $a, b, c$ hat die Raumdiagonale $\sqrt{a^2 + b^2 + c^2}$. **Risse:** Der Blick von oben (**Grundriss**) zeigt $x_1$ und $x_2$, der Blick von vorn (**Aufriss**) $x_2$ und $x_3$, der Blick von der Seite (**Seitenriss**) $x_1$ und $x_3$. Je zwei Risse teilen eine Koordinate – die gestrichelten **Ordnungslinien** verbinden sie. Zwei Risse genügen: Aus $P'(2 \mid -1)$ und $P''(-1 \mid 3)$ folgt $P(2 \mid -1 \mid 3)$. Passen die gemeinsamen Koordinaten nicht zusammen, gibt es keinen solchen Punkt.

**Oktanten:** Die drei Koordinatenebenen teilen den Raum in acht **Oktanten**. Oben ($x_3 > 0$) liegen I bis IV wie die Quadranten der $x_1x_2$-Ebene, darunter V bis VIII. Das Vorzeichenmuster bestimmt den Oktanten, z. B. $(+ \mid - \mid +)$: IV. Punkte auf einer Koordinatenebene liegen in **keinem** Oktanten.

## Ausprobieren

1. Klicke auf **Weg vom Ursprung** und verfolge, wie man zu $P(3 \mid 4 \mid 2)$ kommt. [Punkt](?x=3&y=4&z=2)
2. Blende den Koordinatenweg aus und drehe nicht: Kannst du die Koordinaten sicher ablesen? [Ohne Hilfslinien](?x=-2&y=3&z=-1.5&lines=0)
3. Tippe im **Quader** Ecken an und lass Pythagoras Schritt für Schritt ablaufen. [Quader](?mode=box&x=0&y=0&z=0&a=4&b=3&c=2)
4. Ziehe in **Abstand** die Punkte $P$ und $Q$. Wann ist $\Delta x_3 = 0$? [Abstand](?mode=dist&x=3&y=4&z=2&qx=-1&qy=1&qz=-2)
5. In **Risse**: Tippe einen Riss an – die Kamera schaut aus dieser Richtung. Welcher Riss zeigt das Giebeldreieck des Hauses? [Risse](?mode=views&fig=house)
6. Schalte das **Rätsel** ein: Von $T$ siehst du nur die drei Risse. Ziehe $P$, bis alle Kreuze grün sind. [Rätsel](?mode=views&fig=none&quiz=1&x=0&y=0&z=0)
7. In **Oktanten**: Tippe einen Oktanten an – $P$ springt hinein. Welche Vorzeichen ändern sich? [Oktanten](?mode=oct&x=2&y=-3&z=2)
8. Lass mehrmals **50 Zufallspunkte** fallen. Wie viele landen auf einer Ebene? [Zufallspunkte](?mode=oct)

## Aufgaben

### Aufgabe 1: Koordinaten ablesen

Lies die Koordinaten des Punktes ab. Drehe die Ansicht, wenn du unsicher bist. [Aufgabe laden](?x=-2&y=3&z=-1.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P(-2 \mid 3 \mid -1{,}5)$: $2$ nach hinten, $3$ nach rechts, $1{,}5$ nach unten. [In der Simulation zeigen](?x=-2&y=3&z=-1.5)

</details>

### Aufgabe 2: Raumdiagonale

Ein Quader hat die Ecken $(0 \mid 0 \mid 0)$ und $G(4 \mid 3 \mid 2)$. Berechne $\overline{AC}$, die Raumdiagonale $\overline{AG}$ und das Volumen. [Aufgabe laden](?mode=box&x=0&y=0&z=0&a=4&b=3&c=2&show=0&diag=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\overline{AC} = \sqrt{16 + 9} = 5$, $\overline{AG} = \sqrt{25 + 4} = \sqrt{29} \approx 5{,}39$, $V = 4 \cdot 3 \cdot 2 = 24$. [In der Simulation zeigen](?mode=box&x=0&y=0&z=0&a=4&b=3&c=2)

</details>

### Aufgabe 3: Abstand zweier Punkte

Berechne den Abstand von $P(3 \mid 4 \mid 2)$ und $Q(-1 \mid 1 \mid -2)$. [Aufgabe laden](?mode=dist&x=3&y=4&z=2&qx=-1&qy=1&qz=-2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta x_1 = -4$, $\Delta x_2 = -3$, $\Delta x_3 = -4$: $d_{12} = \sqrt{16 + 9} = 5$, $\overline{PQ} = \sqrt{25 + 16} = \sqrt{41} \approx 6{,}40$. [In der Simulation zeigen](?mode=dist&x=3&y=4&z=2&qx=-1&qy=1&qz=-2)

</details>

### Aufgabe 4: Punkt aus zwei Rissen

Der Grundriss eines Punktes ist $T'(2 \mid -1)$, der Aufriss $T''(-1 \mid 3)$. Bestimme $T$ und seinen Seitenriss. Warum gibt es zu $T'(2 \mid -1)$ und $T''(1 \mid 3)$ keinen Punkt?

<details>
<summary>Lösung anzeigen</summary>

$T(2 \mid -1 \mid 3)$, Seitenriss $T'''(2 \mid 3)$. Im zweiten Fall widersprechen sich die Risse beim gemeinsamen $x_2$ ($-1$ gegen $1$). [In der Simulation zeigen](?mode=views&fig=none&x=2&y=-1&z=3)

</details>

### Aufgabe 5: Oktanten

In welchem Oktanten liegen $A(2 \mid -3 \mid 2)$, $B(-1 \mid -2 \mid -3)$ und $C(2 \mid 0 \mid 3)$? [Aufgabe laden](?mode=oct&x=2&y=-3&z=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A$: $(+ \mid - \mid +)$, Oktant IV. $B$: $(- \mid - \mid -)$, Oktant VII. $C$ liegt wegen $x_2 = 0$ in der $x_1x_3$-Ebene, also in keinem Oktanten. [In der Simulation zeigen](?mode=oct&x=2&y=0&z=3)

</details>

### Aufgabe 6: Zufallspunkte auf Ebenen

Die Zufallspunkte haben Koordinaten aus $-4; -3{,}5; \ldots; 4$ (17 Werte, gleich wahrscheinlich). Mit welcher Wahrscheinlichkeit liegt ein Punkt auf einer Koordinatenebene? [Aufgabe laden](?mode=oct)

<details>
<summary>Lösung anzeigen</summary>

Keine Koordinate ist $0$ mit Wahrscheinlichkeit $\left(\frac{16}{17}\right)^3 = \frac{4096}{4913}$. Also $1 - \frac{4096}{4913} = \frac{817}{4913} \approx 16{,}6\,\%$. Bei $100$ Punkten erwartet man je Oktant etwa $100 \cdot \frac{4096}{4913} : 8 \approx 10{,}4$ Punkte. [In der Simulation zeigen](?mode=oct)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12, Lernbereich „Grundlagen der Koordinatengeometrie im Raum“ (LehrplanPLUS Bayern, Gymnasium), als Einstieg in die analytische Geometrie.
- **Zweideutigkeit des Schrägbilds:** Punkte ohne Hilfslinien ablesen lassen – die Diskussion motiviert Koordinatenweg, Lot und Risse. Das Risse-Rätsel eignet sich zu zweit.
- **Häufige Stolpersteine:**
  - Die $x_1$-Achse wird mit der „waagerechten“ $x$-Achse der Ebene verwechselt.
  - Bei Projektionen wird die falsche Koordinate $0$ gesetzt (in der $x_1x_2$-Ebene ist es $x_3$).
  - Punkte auf einer Koordinatenebene werden einem Oktanten zugeordnet.
  - Beim Abstand Klammern vergessen: $(-4)^2 = 16$.
