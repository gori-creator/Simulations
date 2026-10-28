---
description: "Interaktive Simulation für die 9. Klasse: Quadratwurzeln als Seitenlänge eines Quadrats auf Kästchenpapier, das Heron-Verfahren als Rechteck, das Schritt für Schritt zum Quadrat wird, die Intervallschachtelung mit Lupe und Probe durch Quadrieren – und warum √2 kein Bruch ist."
---

## Worum geht es?

Die **Quadratwurzel** $\sqrt{a}$ (für $a \geq 0$) ist die nichtnegative Zahl, deren Quadrat $a$ ergibt: $\left(\sqrt{a}\right)^2 = a$ und $\sqrt{a} \geq 0$. Die Zahl $a$ unter der Wurzel heißt **Radikand**. Geometrisch ist $\sqrt{a}$ die **Seitenlänge eines Quadrats mit dem Flächeninhalt $a$**.

Legt man $a$ Einheitsquadrate auf Kästchenpapier zu immer größeren Quadraten zusammen ($1 + 3 + 5 + \ldots$), so gehen nur bei **Quadratzahlen** alle Kästchen genau auf: $\sqrt{49} = 7$, $\sqrt{144} = 12$. Sonst bleibt ein Rest, und $\sqrt{a}$ liegt zwischen zwei natürlichen Zahlen:

$$
7^2 = 49 < 50 < 64 = 8^2 \quad\Rightarrow\quad 7 < \sqrt{50} < 8
$$

Steckt im Radikanden ein Quadratfaktor, kann man **teilweise die Wurzel ziehen**: $\sqrt{50} = \sqrt{25 \cdot 2} = \sqrt{25} \cdot \sqrt{2} = 5\sqrt{2} \approx 7{,}071$.

**Heron-Verfahren:** Man startet mit einem Rechteck mit dem Flächeninhalt $a$, also mit den Seiten $x_0$ und $\frac{a}{x_0}$. Als neue Seite nimmt man den **Mittelwert** der beiden Seiten; die andere Seite ergibt sich wieder aus $a$ geteilt durch die neue Seite:

$$
x_{n+1} = \frac{x_n + \frac{a}{x_n}}{2}
$$

Die Fläche bleibt immer $a$, das Rechteck wird immer quadratischer. Warum? Schneidet man vom Rechteck einen Streifen der Breite $\frac{x - a/x}{2}$ ab und legt ihn an die kurze Seite, entsteht fast ein Quadrat mit der Seite $x_{n+1}$ – es fehlt nur eine kleine Ecke. Darum liegt $x_{n+1}$ ab dem ersten Schritt immer etwas **über** $\sqrt{a}$ und $\frac{a}{x_{n+1}}$ etwas **darunter**. Das geht sehr schnell: Die Zahl der richtigen Stellen verdoppelt sich ungefähr. Für $\sqrt{2}$ mit $x_0 = 2$:

$$
x_1 = 1{,}5 \qquad x_2 = \tfrac{17}{12} \approx 1{,}416667 \qquad x_3 = \tfrac{577}{408} \approx 1{,}4142157 \qquad \sqrt{2} \approx 1{,}4142136
$$

**Intervallschachtelung:** Man schließt $\sqrt{a}$ zwischen Zahlen ein, deren Quadrate $a$ einschließen, und prüft durch **Quadrieren**:

$$
1 < \sqrt{2} < 2, \qquad 1{,}4 < \sqrt{2} < 1{,}5 \;\;(1{,}96 < 2 < 2{,}25), \qquad 1{,}41 < \sqrt{2} < 1{,}42 \;\;(1{,}9881 < 2 < 2{,}0164)
$$

Mit jeder Stelle wird das Intervall zehnmal kürzer.

**$\sqrt{2}$ ist irrational:** Die Diagonale des Einheitsquadrats hat die Länge $\sqrt{2}$, denn das Quadrat über ihr besteht aus vier halben Einheitsquadraten und hat den Flächeninhalt $2$. Diese Länge ist kein Bruch. Wäre $\sqrt{2} = \frac{p}{q}$ vollständig gekürzt, so wäre $p^2 = 2q^2$, also $p$ gerade, $p = 2r$; dann $4r^2 = 2q^2$, also $q^2 = 2r^2$ und auch $q$ gerade – Widerspruch zum gekürzten Bruch. Die Dezimaldarstellung von $\sqrt{2}$ bricht deshalb nie ab und wird nie periodisch. Genauso ist $\sqrt{a}$ für jede natürliche Zahl $a$, die keine Quadratzahl ist, irrational.

## Ausprobieren

1. [49 Kästchen](?mode=square&a=49): Drücke „Quadrat legen“. Wie wachsen die Quadrate $1, 4, 9, \ldots$? Wie viele Kästchen kommen jeweils dazu? Vergleiche mit [50 Kästchen](?mode=square&a=50).
2. Ziehe die grüne Ecke des Quadrats. Bei welchen Werten von $a$ geht alles genau auf?
3. [√2 mit Heron](?a=2&x0=2): Klicke auf „Nächster Schritt“ und beobachte den Streifen und die fehlende Ecke. In der Tabelle sind die richtigen Stellen fett. Wie viele kommen pro Schritt dazu?
4. [Ein langes Rechteck](?a=10&x0=10): Starte mit $10 \times 1$. Ziehe bei Schritt 0 die blaue Ecke und probiere andere Startlängen. Spielt der Start eine große Rolle?
5. [√2 einschachteln](?mode=nest&a=2): Tippe auf das Teilintervall, in dem $\sqrt{2}$ liegt. Was zeigt die Probe, wenn du daneben tippst? Warum endet die Schachtelung bei [√49](?mode=nest&a=49) sofort?
6. [√2 ist kein Bruch](?mode=irr): Gehe den Beweis Schritt für Schritt durch und betrachte die Fast-Treffer $\frac{p}{q}$.

## Aufgaben

### Aufgabe 1: Zwischen zwei Quadratzahlen

Zwischen welchen natürlichen Zahlen liegt $\sqrt{50}$? Vereinfache $\sqrt{50}$ durch teilweises Wurzelziehen. [Aufgabe laden](?mode=square&a=50&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$7^2 = 49 < 50 < 64 = 8^2$, also $7 < \sqrt{50} < 8$. Weiter $\sqrt{50} = \sqrt{25 \cdot 2} = 5\sqrt{2} \approx 5 \cdot 1{,}4142 \approx 7{,}071$. [In der Simulation zeigen](?mode=square&a=50)

</details>

### Aufgabe 2: Heron von Hand

Berechne mit dem Heron-Verfahren zwei Näherungen für $\sqrt{10}$, Start $x_0 = 3$. [Aufgabe laden](?a=10&x0=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$x_1 = \frac{3 + \frac{10}{3}}{2} = \frac{19}{6} \approx 3{,}16667$ und $\frac{10}{x_1} = \frac{60}{19} \approx 3{,}15789$.

$x_2 = \frac{\frac{19}{6} + \frac{60}{19}}{2} = \frac{721}{228} \approx 3{,}162281$. Zum Vergleich: $\sqrt{10} \approx 3{,}162278$ – schon vier Nachkommastellen stimmen. [In der Simulation zeigen](?a=10&x0=3&n=2)

</details>

### Aufgabe 3: Intervalle bestimmen

Zwischen welchen Zahlen mit einer bzw. zwei Nachkommastellen liegt $\sqrt{3}$? Begründe durch Quadrieren. [Aufgabe laden](?mode=nest&a=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$1{,}7^2 = 2{,}89 < 3 < 3{,}24 = 1{,}8^2$, also $1{,}7 < \sqrt{3} < 1{,}8$.

$1{,}73^2 = 2{,}9929 < 3 < 3{,}0276 = 1{,}74^2$, also $1{,}73 < \sqrt{3} < 1{,}74$. [In der Simulation zeigen](?mode=nest&a=3&n=2)

</details>

### Aufgabe 4: Warum liegt √a immer dazwischen?

Begründe mit dem Bild vom umgelegten Streifen: $x_{n+1}^2 = a + d^2$ mit $d = \frac{x_n - a/x_n}{2}$. Was folgt daraus für $x_{n+1}$ und $\frac{a}{x_{n+1}}$? [Umlegen ansehen](?a=2&x0=2)

<details>
<summary>Lösung anzeigen</summary>

Das Fast-Quadrat mit der Seite $x_{n+1}$ besteht aus dem ganzen Rechteck (Fläche $a$) und der fehlenden Ecke (Fläche $d^2$). Also $x_{n+1}^2 = a + d^2 \geq a$, d. h. $x_{n+1} \geq \sqrt{a}$. Wegen $x_{n+1} \cdot \frac{a}{x_{n+1}} = a = \sqrt{a} \cdot \sqrt{a}$ ist dann $\frac{a}{x_{n+1}} \leq \sqrt{a}$: $\sqrt{a}$ liegt immer zwischen den beiden Seiten.

</details>

### Aufgabe 5: Wie genau ist 577/408?

Beim Heron-Verfahren für $\sqrt{2}$ (Start $2$) ist $x_3 = \frac{577}{408}$. Wie viele Nachkommastellen stimmen? Berechne $\left(\frac{577}{408}\right)^2$ ohne Taschenrechner möglichst genau. [Aufgabe laden](?a=2&x0=2&n=3&show=0)

<details>
<summary>Lösung anzeigen</summary>

$\frac{577}{408} = 1{,}4142156\ldots$ und $\sqrt{2} = 1{,}4142135\ldots$: Fünf Nachkommastellen stimmen. Es ist $577^2 = 332\,929$ und $2 \cdot 408^2 = 2 \cdot 166\,464 = 332\,928$. Also $\left(\frac{577}{408}\right)^2 = 2 + \frac{1}{166\,464} \approx 2{,}000006$ – fast $2$, aber eben nicht genau. [Zeigen](?a=2&x0=2&n=3)

</details>

### Aufgabe 6: Kein Bruch trifft genau

Prüfe ohne Taschenrechner, ob $\frac{17}{12}$ oder $\frac{99}{70}$ gleich $\sqrt{2}$ sein kann. [Beweis ansehen](?mode=irr)

<details>
<summary>Lösung anzeigen</summary>

$17^2 = 289$, aber $2 \cdot 12^2 = 288$; $99^2 = 9801$, aber $2 \cdot 70^2 = 9800$. Beide Male fehlt genau $1$ – sehr nah, aber nie gleich: $p^2 = 2q^2$ ist nach dem Beweis unmöglich. [Alle Schritte zeigen](?mode=irr&n=5)

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 9, Quadratwurzeln (Wurzelbegriff, Näherungsverfahren, irrationale und reelle Zahlen, Rechnen mit Wurzeln). Die vier Ansichten passen gut als Einstieg (Kästchen), Erarbeitung (Heron, Intervalle) und Vertiefung (Beweis).
- **Ohne Formel beginnen:** Das umgelegte Rechteck macht das Heron-Verfahren anschaulich, bevor die Formel steht. Vielleicht lohnt es sich, die Lernenden zuerst selbst vorschlagen zu lassen, wie man ein Rechteck „quadratischer“ machen könnte.
- **Wettrechnen:** Wer schafft zuerst sechs richtige Stellen – mit Heron oder mit der Intervallschachtelung?
- **Für Aufgaben:** Mit „Werte zeigen“ aus (`show=0`) erscheinen $\sqrt{a}$ und die Näherungen im Bild als „?“.
- **Modell:** Fett sind in der Tabelle die Stellen, die schon mit $\sqrt{a}$ übereinstimmen; die Intervallschachtelung rechnet ganzzahlig, also ohne Rundungsfehler.
- **Häufige Stolpersteine:**
  - „$\sqrt{2} = 1{,}41$“ – das ist nur eine Näherung; $1{,}41^2 = 1{,}9881$.
  - Die Grenzen eines Intervalls werden geschätzt, aber nicht durch Quadrieren geprüft.
  - Beim Heron-Verfahren wird die zweite Seite ebenfalls gemittelt statt als $a : x$ neu berechnet – dann stimmt die Fläche nicht mehr.
  - $\sqrt{a + b} = \sqrt{a} + \sqrt{b}$ – gilt nicht (z. B. $\sqrt{9 + 16} = 5 \neq 7$); nur für Produkte gilt $\sqrt{a \cdot b} = \sqrt{a} \cdot \sqrt{b}$.
  - Aus „viele Stellen sehen zufällig aus“ wird auf irrational geschlossen – erst der Beweis zeigt, dass sich nichts wiederholt.
