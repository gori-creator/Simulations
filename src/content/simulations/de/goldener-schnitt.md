## Worum geht es?

Eine Strecke wird in zwei Teile geteilt, einen größeren Teil $a$ und einen kleineren Teil $b$. Beim **goldenen Schnitt** verhält sich der größere Teil zum kleineren **genauso** wie die ganze Strecke zum größeren Teil:

$$\frac{a}{b} = \frac{a+b}{a} = \varphi$$

### Die goldene Zahl φ

Setzt man $b = 1$, wird aus der Bedingung $\tfrac{a}{1} = \tfrac{a+1}{a}$ die Gleichung $a^2 = a + 1$, also $a^2 - a - 1 = 0$. Die positive Lösung ist

$$\varphi = \frac{1 + \sqrt{5}}{2} \approx 1{,}618$$

Die Zahl hat besondere Eigenschaften: Es gilt $\varphi^2 = \varphi + 1$ und $\tfrac{1}{\varphi} = \varphi - 1 \approx 0{,}618$. Beim goldenen Schnitt liegt der Teilpunkt also bei etwa $61{,}8\,\%$ der Strecke.

### Konstruktion mit Zirkel und Lineal

1. Zeichne die Strecke $\overline{AB}$.
2. Errichte in $B$ das Lot und trage darauf $\overline{BC} = \tfrac12\,\overline{AB}$ ab.
3. Verbinde $A$ mit $C$.
4. Der Kreis um $C$ mit Radius $\overline{CB}$ schneidet $\overline{AC}$ in $D$.
5. Der Kreis um $A$ mit Radius $\overline{AD}$ schneidet $\overline{AB}$ in $T$.

Dann teilt $T$ die Strecke $\overline{AB}$ im goldenen Schnitt. Mit dem Satz des Pythagoras lässt sich das nachrechnen: Für $\overline{AB} = 1$ ist $\overline{AC} = \tfrac{\sqrt5}{2}$, also $\overline{AT} = \overline{AD} = \tfrac{\sqrt5 - 1}{2} = \tfrac{1}{\varphi}$.

### Goldenes Rechteck und Spirale

Ein Rechteck mit dem Seitenverhältnis $\varphi : 1$ heißt **goldenes Rechteck**. Schneidet man davon ein Quadrat ab, bleibt wieder ein goldenes Rechteck übrig, nur kleiner. Das geht immer weiter. Verbindet man Viertelkreise in den Quadraten, entsteht eine Spirale, die der Spirale eines Schneckenhauses ähnelt.

### Fibonacci-Zahlen

Die Folge $1, 1, 2, 3, 5, 8, 13, 21, \dots$ entsteht, indem man jeweils die beiden vorigen Zahlen addiert. Die Quotienten aufeinanderfolgender Zahlen nähern sich $\varphi$: $\tfrac{8}{5} = 1{,}6$, $\tfrac{13}{8} = 1{,}625$, $\tfrac{21}{13} \approx 1{,}615$, …

### Vorkommen

Im regelmäßigen Fünfeck und im Pentagramm stehen Diagonale und Seite im goldenen Verhältnis. In Kunst und Architektur wird der goldene Schnitt oft als besonders harmonisch empfunden. Viele Beispiele, die ihm zugeschrieben werden, treffen ihn allerdings nur ungefähr. Es lohnt sich, selbst nachzumessen.

## Ausprobieren

- [Goldener Schnitt](?mode=teilung&t=0.618): Verschiebe den Teilpunkt. Wo schneiden sich die beiden Kurven?
- [Konstruktion](?mode=konstruktion&step=1): Gehe die fünf Schritte einzeln durch.
- [Goldene Spirale](?mode=rechteck&depth=8&spiral=1): Wie verändert sich das Rechteck bei jedem abgeschnittenen Quadrat?
- [Fibonacci-Quotienten](?mode=fibonacci&n=12): Ab welchem n stimmen die ersten drei Nachkommastellen mit φ überein?

## Aufgaben

**1. Länge berechnen.** Eine Strecke von $20\,\text{cm}$ soll im goldenen Schnitt geteilt werden. Wie lang ist der größere Teil? [Aufgabe laden](?mode=teilung&t=0.618&_hide=1)

<details><summary>Lösung anzeigen</summary>

$a = \tfrac{20}{\varphi} \approx 12{,}36\,\text{cm}$, und der kleinere Teil ist $b \approx 7{,}64\,\text{cm}$.

</details>

**2. Gleichung.** Zeige, dass $\varphi = \tfrac{1+\sqrt5}{2}$ die Gleichung $x^2 = x + 1$ erfüllt.

<details><summary>Lösung anzeigen</summary>

$\varphi^2 = \tfrac{1 + 2\sqrt5 + 5}{4} = \tfrac{6 + 2\sqrt5}{4} = \tfrac{3 + \sqrt5}{2}$. Außerdem ist $\varphi + 1 = \tfrac{1 + \sqrt5}{2} + \tfrac22 = \tfrac{3 + \sqrt5}{2}$. Beide Ergebnisse sind gleich.

</details>

**3. Fibonacci.** Berechne die nächsten drei Fibonacci-Zahlen nach $21$ und den Quotienten der letzten beiden. [Aufgabe laden](?mode=fibonacci&n=11&_hide=1)

<details><summary>Lösung anzeigen</summary>

$34, 55, 89$ und $\tfrac{89}{55} \approx 1{,}6182$.

</details>

**4. Nachmessen.** Miss bei einem Bild, einem Gebäude oder einem Gesicht zwei Längen und berechne ihr Verhältnis. Wie nah kommst du an $1{,}618$?

<details><summary>Lösung anzeigen</summary>

Hier gibt es keine feste Lösung. Oft liegen die Werte zwischen $1{,}5$ und $1{,}7$, und je nachdem, wo genau man misst, schwanken sie deutlich.

</details>
