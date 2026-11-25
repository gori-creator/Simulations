## Worum geht es?

Wir schreiben Zahlen im **Zehnersystem**: Zehn Einer werden zu einem Zehner gebündelt, zehn Zehner zu einem Hunderter und so weiter. Jede Stelle ist zehnmal so viel wert wie die rechts daneben. Statt mit zehn kann man aber auch mit jeder anderen Zahl bündeln, der **Basis**.

### Stellenwertsysteme

Im System zur Basis $b$ haben die Stellen die Werte $\dots,\ b^3,\ b^2,\ b^1,\ b^0 = 1$. Es gibt die Ziffern $0$ bis $b - 1$.

- **Zweiersystem (Dual- oder Binärsystem), Basis 2:** Es gibt nur die Ziffern 0 und 1, die Stellenwerte sind $1, 2, 4, 8, 16, \dots$ Beispiel: $1011_2 = 1 \cdot 8 + 0 \cdot 4 + 1 \cdot 2 + 1 \cdot 1 = 11$. Computer speichern alles so: Eine Stelle heißt **Bit**, acht Bits sind ein **Byte**.
- **Hexadezimalsystem, Basis 16:** Für die Ziffern zehn bis fünfzehn nimmt man Buchstaben: A = 10, B = 11, …, F = 15. Beispiel: $\text{FF}_{16} = 15 \cdot 16 + 15 = 255$. Eine Hexadezimalziffer steht genau für vier Bits. Deshalb sieht man das System oft bei Farbcodes wie #FF8800.

Die tiefgestellte Zahl gibt die Basis an. Ohne sie ist das Zehnersystem gemeint.

### Umrechnen

**In das Zehnersystem:** Man multipliziert jede Ziffer mit ihrem Stellenwert und addiert.

**Aus dem Zehnersystem (Divisionsverfahren):** Man teilt immer wieder durch die Basis und notiert die Reste. Von unten nach oben gelesen ergeben die Reste die gesuchte Darstellung:

$$\begin{aligned} 13 : 2 &= 6 \text{ Rest } 1 \\ 6 : 2 &= 3 \text{ Rest } 0 \\ 3 : 2 &= 1 \text{ Rest } 1 \\ 1 : 2 &= 0 \text{ Rest } 1 \end{aligned} \qquad\Rightarrow\qquad 13 = 1101_2$$

### Rechnen

Schriftlich addiert man genau wie im Zehnersystem. Einen Übertrag gibt es aber schon, sobald eine Stelle die Basis erreicht. Im Zweiersystem gilt also $1_2 + 1_2 = 10_2$.

### Die größte Zahl mit k Stellen

Die größte $k$-stellige Zahl zur Basis $b$ hat lauter Ziffern $b - 1$, im Zweiersystem also lauter Einsen. Sie ist um eins kleiner als die nächste Stufe:

$$1 + 2 + 4 + \dots + 2^{k-1} = 2^k - 1$$

Das ist ein Beispiel für die **geometrische Summenformel**. Mit 8 Bits kann man deshalb die Zahlen $0$ bis $2^8 - 1 = 255$ darstellen.

### Zahlschriften anderer Kulturen

- **Römer:** Sie hatten kein Stellenwertsystem, sondern Zeichen mit festen Werten: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500 und M = 1000. Die Werte werden addiert. Steht ein kleineres Zeichen vor einem größeren, wird es abgezogen: IV = 4, XC = 90. Eine Null gab es nicht.
- **Maya:** Sie bündelten in **Zwanzigern**. Ein Punkt steht für 1, ein Strich für 5, und eine Muschel steht für die Null. Die Stellen werden von unten nach oben geschrieben.
- **Babylonier:** Sie bündelten in **Sechzigern**. Ein Winkelhaken steht für 10, ein senkrechter Keil für 1. Die Sechzigerteilung lebt bis heute in Stunden, Minuten und Sekunden und in den 360° eines Kreises fort.

## Ausprobieren

- [11 im Zweiersystem](?mode=stellen&n=11&base=2): Erhöhe die Zahl um eins. Wann kommt eine neue Stelle dazu?
- [255 hexadezimal](?mode=stellen&n=255&base=16): Wechsle zwischen den Basen 2, 8 und 16.
- [13 umrechnen](?mode=umrechnen&n=13&base=2): Lies die Reste von unten nach oben.
- [1011₂ + 110₂](?mode=rechnen&x=11&y=6&base=2): Wo entstehen Überträge?
- [Die Zahl 2026](?mode=kulturen&n=2026): Vergleiche die drei Schreibweisen.

## Aufgaben

**1. Ins Zehnersystem.** Welche Zahl ist $101101_2$? [Aufgabe laden](?mode=stellen&n=45&base=2&_hide=1)

<details><summary>Lösung anzeigen</summary>

$32 + 8 + 4 + 1 = 45$.

</details>

**2. Divisionsverfahren.** Schreibe $100$ im Zweier- und im Hexadezimalsystem. [Aufgabe laden](?mode=umrechnen&n=100&base=2&_hide=1)

<details><summary>Lösung anzeigen</summary>

$100 = 1100100_2 = 64_{16}$, denn $6 \cdot 16 + 4 = 100$.

</details>

**3. Addieren.** Berechne $111_2 + 101_2$ schriftlich. [Aufgabe laden](?mode=rechnen&x=7&y=5&base=2&_hide=1)

<details><summary>Lösung anzeigen</summary>

$1100_2$, das ist $7 + 5 = 12$.

</details>

**4. Bits.** Wie viele verschiedene Zahlen lassen sich mit 4 Bits darstellen? Wie groß ist die größte?

<details><summary>Lösung anzeigen</summary>

$2^4 = 16$ Zahlen, nämlich $0$ bis $1111_2 = 15$.

</details>

**5. Römisch.** Schreibe 1999 mit römischen Zahlzeichen. [Aufgabe laden](?mode=kulturen&n=1999&_hide=1)

<details><summary>Lösung anzeigen</summary>

MCMXCIX, also $1000 + 900 + 90 + 9$.

</details>
