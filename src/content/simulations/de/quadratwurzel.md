---
description: "Interaktive Simulation für die 9. Klasse: Quadratwurzeln mit dem Heron-Verfahren annähern – ein Rechteck wird Schritt für Schritt zum Quadrat – und mit der Intervallschachtelung auf einem Zahlenstrahl mit Lupe einschließen; dazu die Frage, warum √2 kein Bruch ist."
---

## Worum geht es?

Die **Quadratwurzel** $\sqrt{a}$ (für $a \geq 0$) ist die nichtnegative Zahl, deren Quadrat $a$ ergibt: $\sqrt{a}^{\,2} = a$. Geometrisch ist $\sqrt{a}$ die **Seitenlänge eines Quadrats mit dem Flächeninhalt $a$**. Die Zahl $a$ unter der Wurzel heißt **Radikand**.

Nur bei Quadratzahlen ist $\sqrt{a}$ eine natürliche Zahl ($\sqrt{49} = 7$). Sonst ist $\sqrt{a}$ – für natürliche Zahlen $a$ – **irrational**: keine endliche und keine periodische Dezimalzahl. Man kann sie nur annähern.

**Heron-Verfahren:** Man startet mit einem Rechteck mit dem Flächeninhalt $a$, z. B. mit den Seiten $x_0$ und $\frac{a}{x_0}$. Als neue Länge nimmt man den **Mittelwert** der beiden Seiten; die neue Breite ergibt sich wieder aus $a$ geteilt durch die Länge:

$$
x_{n+1} = \frac{x_n + \frac{a}{x_n}}{2}
$$

Die Fläche bleibt immer $a$, das Rechteck wird immer quadratischer. Das geht sehr schnell: Ungefähr verdoppelt sich mit jedem Schritt die Zahl der richtigen Stellen. Für $\sqrt{2}$ mit $x_0 = 2$: $1{,}5$; $1{,}41\overline{6}$; $1{,}4142157\ldots$

**Intervallschachtelung:** Wegen $1^2 = 1 < 2 < 4 = 2^2$ liegt $\sqrt{2}$ zwischen $1$ und $2$. Wegen $1{,}4^2 = 1{,}96 < 2 < 2{,}25 = 1{,}5^2$ liegt $\sqrt{2}$ zwischen $1{,}4$ und $1{,}5$, und so weiter. Mit jeder Stelle wird das Intervall zehnmal kürzer.

## Ausprobieren

1. [√2 mit Heron](?a=2&x0=2): Klicke auf „Nächster Schritt“. Wie ändern sich Länge und Breite? Ab welchem Schritt stimmen in der Tabelle alle angezeigten Stellen?
2. [√10 mit einem langen Start-Rechteck](?a=10&x0=10): Wie viele Schritte braucht man jetzt? Probiere andere Startlängen.
3. [Quadratzahl](?a=49&x0=14): Was passiert bei einer Quadratzahl?
4. [√2 einschachteln](?mode=nest&a=2): Verfolge die Lupe. Welche Ungleichung steht jeweils unten?
5. [√3](?mode=nest&a=3) und [√25](?mode=nest&a=25): Wann endet die Intervallschachtelung, wann nicht?

## Aufgaben

### Aufgabe 1: Heron von Hand

Berechne mit dem Heron-Verfahren zwei Näherungen für $\sqrt{10}$, Start $x_0 = 3$. [Aufgabe laden](?a=10&x0=3)

<details>
<summary>Lösung anzeigen</summary>

$x_1 = \frac{3 + \frac{10}{3}}{2} = \frac{19}{6} \approx 3{,}1667$, $x_2 = \frac{3{,}1\overline{6} + \frac{10}{3{,}1\overline{6}}}{2} \approx 3{,}162281$. Zum Vergleich: $\sqrt{10} \approx 3{,}162278$.

</details>

### Aufgabe 2: Intervall bestimmen

Zwischen welchen Zahlen mit einer Nachkommastelle liegt $\sqrt{3}$? Begründe mit Quadratzahlen. [Aufgabe laden](?mode=nest&a=3)

<details>
<summary>Lösung anzeigen</summary>

$1{,}7^2 = 2{,}89 < 3 < 3{,}24 = 1{,}8^2$, also $1{,}7 < \sqrt{3} < 1{,}8$.

</details>

### Aufgabe 3: Warum der Mittelwert?

Begründe: Ist $x$ größer als $\sqrt{a}$, dann ist $\frac{a}{x}$ kleiner als $\sqrt{a}$.

<details>
<summary>Lösung anzeigen</summary>

Es gilt $x \cdot \frac{a}{x} = a = \sqrt{a} \cdot \sqrt{a}$. Ist ein Faktor größer als $\sqrt{a}$, muss der andere kleiner sein. $\sqrt{a}$ liegt also immer zwischen Länge und Breite – deshalb ist der Mittelwert eine bessere Näherung.

</details>

### Aufgabe 4: Wie genau?

Bei $\sqrt{2}$ zeigt die Tabelle nach Schritt 3 den Wert $1{,}414215686$. Wie viele Nachkommastellen stimmen? Wie groß ist das Quadrat dieses Werts ungefähr?

<details>
<summary>Lösung anzeigen</summary>

$\sqrt{2} = 1{,}414213562\ldots$, also stimmen fünf Nachkommastellen. $1{,}414215686^2 \approx 2{,}000006$ – schon sehr nahe an $2$. [Zeigen](?a=2&x0=2)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 9, Lernbereich „Quadratwurzeln“ (LehrplanPLUS Gymnasium Bayern): Wurzelbegriff, Näherungsverfahren, irrationale Zahlen als neue Zahlenart. Das Rechteckbild macht das Heron-Verfahren ohne Formel verständlich.
- **Wettbewerb:** Wer schafft mit Taschenrechner zuerst sechs richtige Stellen – mit Heron oder mit der Intervallschachtelung?
- **Modell:** Die Tabelle zeigt neun Nachkommastellen; fett gedruckt sind die Stellen, die schon mit $\sqrt{a}$ übereinstimmen. Die Intervallschachtelung rechnet mit ganzen Zahlen und daher ohne Rundungsfehler.
- **Häufige Stolpersteine:**
  - „$\sqrt{2} = 1{,}41$“ – das ist nur eine Näherung.
  - Die Intervallgrenzen werden nicht durch Quadrieren überprüft.
  - Beim Heron-Verfahren wird die Breite nicht neu berechnet, sondern ebenfalls gemittelt.
