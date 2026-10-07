---
description: Interaktive Simulation zum Satz des Pythagoras – Quadrate über den Seiten eines rechtwinkligen Dreiecks und ein animierter Puzzle-Beweis.
---

## Worum geht es?

In einem **rechtwinkligen Dreieck** heißen die beiden Seiten am rechten Winkel **Katheten** ($a$ und $b$), die Seite gegenüber dem rechten Winkel heißt **Hypotenuse** ($c$). Sie ist immer die längste Seite.

> **Satz des Pythagoras:** In jedem rechtwinkligen Dreieck ist die Summe der Flächeninhalte der Kathetenquadrate gleich dem Flächeninhalt des Hypotenusenquadrats:
> $$a^2 + b^2 = c^2$$

Damit kann man eine fehlende Seite berechnen:

$$
c = \sqrt{a^2 + b^2} \qquad a = \sqrt{c^2 - b^2}
$$

**Umkehrung:** Gilt in einem Dreieck $a^2 + b^2 = c^2$, dann ist es rechtwinklig (mit dem rechten Winkel gegenüber von $c$).

### Puzzle-Beweis

In ein Quadrat mit der Seitenlänge $a + b$ legt man vier gleiche rechtwinklige Dreiecke.

- In der ersten Anordnung bleibt in der Mitte ein Quadrat mit der Seitenlänge $c$ frei: Fläche $c^2$.
- Schiebt man die Dreiecke um, bleiben zwei Quadrate frei: Fläche $a^2 + b^2$.

Das große Quadrat und die vier Dreiecke sind dieselben – also muss die freie Fläche gleich groß sein: $c^2 = a^2 + b^2$.

## Ausprobieren

1. Ziehe die Eckpunkte des Dreiecks und zähle die Kästchen in den Quadraten. Gilt $a^2 + b^2 = c^2$ immer? [Gleichschenklig](?a=3&b=3)
2. Wechsle zum **Puzzle-Beweis** und lass die Dreiecke umlegen. Welche Flächen bleiben gleich? [Puzzle-Beweis](?mode=puzzle)
3. Probiere den Puzzle-Beweis mit einem flachen Dreieck. Funktioniert er immer noch? [Flaches Dreieck](?mode=puzzle&a=1.5&b=5)

## Aufgaben

### Aufgabe 1: Hypotenuse berechnen

Die Katheten eines rechtwinkligen Dreiecks sind $a = 1{,}5\,\text{cm}$ und $b = 2\,\text{cm}$ lang. Berechne $c$.

<details>
<summary>Lösung anzeigen</summary>

$$c = \sqrt{1{,}5^2 + 2^2} = \sqrt{2{,}25 + 4} = \sqrt{6{,}25} = 2{,}5\,\text{cm}$$

[In der Simulation zeigen](?a=1.5&b=2)

</details>

### Aufgabe 2: Kathete berechnen

Die Hypotenuse ist $c = 10\,\text{cm}$ lang, eine Kathete $a = 6\,\text{cm}$. Wie lang ist $b$?

<details>
<summary>Lösung anzeigen</summary>

$$b = \sqrt{c^2 - a^2} = \sqrt{100 - 36} = \sqrt{64} = 8\,\text{cm}$$

</details>

### Aufgabe 3: Leiter an der Wand (Modellieren)

Eine $5\,\text{m}$ lange Leiter steht mit dem Fuß $1{,}4\,\text{m}$ von einer senkrechten Wand entfernt. In welcher Höhe lehnt sie an der Wand?

<details>
<summary>Lösung anzeigen</summary>

Leiter, Wand und Boden bilden ein rechtwinkliges Dreieck mit der Hypotenuse $5\,\text{m}$:

$$h = \sqrt{5^2 - 1{,}4^2} = \sqrt{25 - 1{,}96} = \sqrt{23{,}04} = 4{,}8\,\text{m}$$

</details>

### Aufgabe 4: Rechtwinklig oder nicht?

Prüfe, ob die Dreiecke mit den Seitenlängen $7, 24, 25$ und $5, 6, 8$ rechtwinklig sind.

<details>
<summary>Lösung anzeigen</summary>

- $7^2 + 24^2 = 49 + 576 = 625 = 25^2$ – rechtwinklig (Umkehrung des Satzes).
- $5^2 + 6^2 = 61 \neq 64 = 8^2$ – nicht rechtwinklig. Weil $61 < 64$, ist der Winkel gegenüber der längsten Seite sogar stumpf.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 9 (Satz des Pythagoras), anschaulich vorbereitend auch früher. Das Kästchenzählen in der Quadrat-Ansicht funktioniert besonders gut bei ganzzahligen Tripeln wie 3-4-5.
- **Beweis:** Der Puzzle-Beweis kommt ohne Rechnung aus. Anschließend kann man ihn algebraisch nachrechnen: $(a + b)^2 = c^2 + 4 \cdot \frac{1}{2}ab$ liefert mit der 1. binomischen Formel $a^2 + b^2 = c^2$.
- **Typische Fehlvorstellungen:**
  - Der Satz wird auf nicht rechtwinklige Dreiecke angewendet.
  - $c$ wird mit irgendeiner Seite gleichgesetzt statt mit der Seite gegenüber dem rechten Winkel.
  - $\sqrt{a^2 + b^2} = a + b$ – mit Zahlen prüfen lassen ($\sqrt{9 + 16} = 5 \neq 7$).
