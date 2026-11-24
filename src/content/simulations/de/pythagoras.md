## Worum geht es?

In einem **rechtwinkligen Dreieck** heißen die beiden Seiten am rechten Winkel **Katheten** ($a$ und $b$), die Seite gegenüber dem rechten Winkel heißt **Hypotenuse** ($c$). Sie ist immer die längste Seite.

> **Satz des Pythagoras:** In jedem rechtwinkligen Dreieck ist die Summe der Flächeninhalte der Kathetenquadrate gleich dem Flächeninhalt des Hypotenusenquadrats:
> $$a^2 + b^2 = c^2$$

Damit kann man eine fehlende Seite berechnen:

$$
c = \sqrt{a^2 + b^2} \qquad b = \sqrt{c^2 - a^2}
$$

Beispiel: $a = 3\,\text{cm}$, $b = 4\,\text{cm}$ ergibt $c = \sqrt{9 + 16} = \sqrt{25} = 5\,\text{cm}$.

### Puzzle-Beweis

In ein Quadrat mit der Seitenlänge $a + b$ legt man vier gleiche rechtwinklige Dreiecke.

- In der ersten Anordnung bleibt in der Mitte ein Quadrat mit der Seitenlänge $c$ frei: Fläche $c^2$.
- Schiebt man die Dreiecke um, bleiben zwei Quadrate frei: Fläche $a^2 + b^2$.

Das große Quadrat und die vier Dreiecke sind dieselben – also muss die freie Fläche gleich groß sein: $c^2 = a^2 + b^2$.

### Umkehrung

Gilt in einem Dreieck $a^2 + b^2 = c^2$, dann ist es rechtwinklig, und der rechte Winkel liegt gegenüber von $c$. Mehr noch: Vergleicht man $c^2$ mit $a^2 + b^2$, erkennt man die Art des Winkels $\gamma$ zwischen $a$ und $b$:

| Vergleich | Winkel $\gamma$ |
| --- | --- |
| $c^2 < a^2 + b^2$ | spitz (kleiner als $90°$) |
| $c^2 = a^2 + b^2$ | rechter Winkel |
| $c^2 > a^2 + b^2$ | stumpf (größer als $90°$) |

Schon die alten Ägypter sollen so rechte Winkel abgesteckt haben: mit einem Seil, das durch Knoten in $3 + 4 + 5 = 12$ gleiche Stücke geteilt ist.

### Pythagoreische Tripel

Drei ganze Zahlen mit $a^2 + b^2 = c^2$ heißen **pythagoreisches Tripel**, zum Beispiel $(3, 4, 5)$, $(5, 12, 13)$, $(8, 15, 17)$ und $(20, 21, 29)$. Vielfache eines Tripels sind wieder Tripel: $(6, 8, 10)$, $(9, 12, 15)$. Tripel ohne gemeinsamen Teiler heißen **grundlegend** (primitiv). Im Koordinatensystem ist $c = \sqrt{a^2 + b^2}$ der Abstand des Punktes $P(a \mid b)$ vom Ursprung – ein Tripel gehört also zu einem Gitterpunkt mit ganzzahligem Abstand.

### Anwendungen

Wo immer ein rechter Winkel vorkommt, steckt ein rechtwinkliges Dreieck: Leiter, Wand und Boden; Breite, Höhe und Diagonale eines Bildschirms; der Abstand zweier Punkte im Koordinatensystem $d = \sqrt{(\Delta x)^2 + (\Delta y)^2}$; die Abkürzung quer über eine rechteckige Wiese.

## Ausprobieren

1. Ziehe die beiden farbigen Eckpunkte und zähle die Kästchen in den Quadraten. Beim 3-4-5-Dreieck geht das genau. Gilt $a^2 + b^2 = c^2$ auch beim gleichschenkligen Dreieck? [Gleichschenklig](?a=3&b=3)
2. Wechsle zum **Puzzle-Beweis** und lass die Dreiecke umlegen. Welche Flächen bleiben gleich? [Puzzle-Beweis](?mode=puzzle) · [Flaches Dreieck](?mode=puzzle&a=1.5&b=5)
3. **Umkehrung:** Zieh die Ecke $B$ und beobachte die Balken oben. Bei welchem Winkel sind sie gleich lang? [Stumpfer Winkel](?mode=angle&gam=120) · [Spitzer Winkel](?mode=angle&gam=60)
4. **Anwendungen:** Wie lang muss eine Leiter sein, die in $6\,\text{m}$ Höhe an der Wand lehnen soll? [Leiter](?mode=apply&ex=ladder&a=6&b=1.5) · [Bildschirm](?mode=apply&ex=screen&a=3.5&b=6) · [Abstand von P und Q](?mode=apply&ex=coord&a=3&b=4) · [Wiese](?mode=apply&ex=field&a=3&b=4)
5. **Tripel:** Zieh den Punkt $P$ auf die markierten Gitterpunkte. Welche Tripel sind Vielfache von $(3, 4, 5)$? [Tripel 5-12-13](?mode=triples&ta=5&tb=12)
6. **Üben:** Berechne die fehlende Seite, trage dein Ergebnis ein und lass es prüfen. Mit „Neue Aufgabe“ geht es weiter. [Üben](?mode=quiz&q=1)

## Aufgaben

### Aufgabe 1: Hypotenuse berechnen

Die Katheten eines rechtwinkligen Dreiecks sind $a = 1{,}5\,\text{cm}$ und $b = 2\,\text{cm}$ lang. Berechne $c$. [Aufgabe laden](?a=1.5&b=2&numbers=0&_hide=1)

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
- $5^2 + 6^2 = 61 \neq 64 = 8^2$ – nicht rechtwinklig. Weil $64 > 61$, ist der Winkel gegenüber der längsten Seite sogar stumpf.

</details>

### Aufgabe 5: Bildschirmdiagonale

Ein Bildschirm ist $60\,\text{cm}$ breit und $35\,\text{cm}$ hoch. Wie lang ist die Diagonale? Gib sie auch in Zoll an ($1$ Zoll $= 2{,}54\,\text{cm}$). [Aufgabe laden](?mode=apply&ex=screen&a=3.5&b=6&numbers=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$d = \sqrt{60^2 + 35^2} = \sqrt{3600 + 1225} = \sqrt{4825} \approx 69{,}5\,\text{cm} \approx 27{,}3\ \text{Zoll}$$

[In der Simulation zeigen](?mode=apply&ex=screen&a=3.5&b=6)

</details>

### Aufgabe 6: Abstand zweier Punkte

Berechne den Abstand der Punkte $P(1 \mid 1)$ und $Q(5 \mid 4)$. [Aufgabe laden](?mode=apply&ex=coord&a=3&b=4&numbers=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta x = 5 - 1 = 4$, $\Delta y = 4 - 1 = 3$, also $d = \sqrt{4^2 + 3^2} = 5$. [In der Simulation zeigen](?mode=apply&ex=coord&a=3&b=4)

</details>

### Aufgabe 7: Tripel finden

Zeige, dass $(20, 21, 29)$ ein pythagoreisches Tripel ist. Finde ein weiteres Tripel mit $c = 25$.

<details>
<summary>Lösung anzeigen</summary>

$20^2 + 21^2 = 400 + 441 = 841 = 29^2$ ✓. Mit $c = 25$: $(7, 24, 25)$, denn $49 + 576 = 625$, und $(15, 20, 25)$ als Fünffaches von $(3, 4, 5)$. [Tripel zeigen](?mode=triples&ta=20&tb=21)

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 8/9 (Satz des Pythagoras), anschaulich vorbereitend auch früher. Das Kästchenzählen in der Quadrat-Ansicht funktioniert besonders gut bei ganzzahligen Tripeln wie 3-4-5.
- **Beweis:** Der Puzzle-Beweis kommt ohne Rechnung aus. Anschließend kann man ihn algebraisch nachrechnen: $(a + b)^2 = c^2 + 4 \cdot \frac{1}{2}ab$ liefert mit der 1. binomischen Formel $a^2 + b^2 = c^2$.
- **Umkehrung handfest:** Mit einer Schnur mit 12 gleichen Abschnitten ein 3-4-5-Dreieck auf dem Schulhof spannen und den rechten Winkel mit dem Geodreieck prüfen; in der Simulation anschließend zeigen, was bei anderen Winkeln passiert.
- **Üben:** Die Übungsaufgaben sind nummeriert. Gleiche Nummer heißt gleiche Aufgabe – so kann die ganze Klasse an derselben Aufgabe arbeiten. Ungerade Nummern gehen glatt auf, bei geraden muss gerundet werden.
- **Häufige Stolpersteine:**
  - Der Satz wird auf nicht rechtwinklige Dreiecke angewendet.
  - $c$ wird mit irgendeiner Seite gleichgesetzt statt mit der Seite gegenüber dem rechten Winkel.
  - $\sqrt{a^2 + b^2} = a + b$ – mit Zahlen prüfen lassen ($\sqrt{9 + 16} = 5 \neq 7$).
  - Bei der Kathete wird addiert statt subtrahiert: $b = \sqrt{c^2 - a^2}$.
