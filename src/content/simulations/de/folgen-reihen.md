## Worum geht es?

Eine **Folge** ist eine unendliche Liste von Zahlen $a_1, a_2, a_3, \dots$ – zum Beispiel $1, \tfrac12, \tfrac13, \tfrac14, \dots$ Addiert man die Glieder nacheinander, entsteht eine **Reihe**. Zwei Fragen sind spannend: Nähern sich die Glieder einer festen Zahl? Und hat die unendliche Summe einen endlichen Wert?

### Arithmetische und geometrische Folgen

- **Arithmetisch:** Es kommt immer dieselbe Zahl $d$ dazu: $a_n = a + (n-1)\,d$.
- **Geometrisch:** Es wird immer mit derselben Zahl $q$ multipliziert: $a_n = a \cdot q^{\,n-1}$.

### Grenzwert und ε-Umgebung

Eine Folge **konvergiert** gegen den Grenzwert $g$, wenn ihre Glieder $g$ **beliebig nahe** kommen und dort bleiben. Genauer: Zu jeder noch so kleinen Zahl $\varepsilon > 0$ gibt es einen Index $N$, ab dem **alle** weiteren Glieder im Streifen $g - \varepsilon < a_n < g + \varepsilon$ liegen.

In der Simulation ist dieser Streifen eingefärbt. Verkleinert man $\varepsilon$, rückt $N$ nach rechts – aber es gibt immer eines. Bei $a_n = \tfrac1n$ liegt für $\varepsilon = 0{,}01$ jedes Glied ab $n = 101$ im Streifen.

Eine Folge ohne Grenzwert **divergiert**: Sie wächst über alle Grenzen (wie $a_n = n$) oder springt hin und her (wie $(-1)^n$).

**Grenzwertsätze:** Konvergieren $(a_n) \to a$ und $(b_n) \to b$, dann gilt $a_n \pm b_n \to a \pm b$, $a_n \cdot b_n \to a \cdot b$ und – falls $b \ne 0$ – $\tfrac{a_n}{b_n} \to \tfrac{a}{b}$. So folgt etwa $\tfrac{n}{n+1} = \tfrac{1}{1 + 1/n} \to 1$.

### Reihen

Die **Teilsumme** $s_n = a_1 + a_2 + \dots + a_n$ bildet selbst wieder eine Folge.

- **Arithmetische Reihe:** $s_n = \tfrac{n}{2}\,(a_1 + a_n)$ – so rechnete schon der junge Gauß $1 + 2 + \dots + 100 = 5050$. Sie wächst über alle Grenzen.
- **Geometrische Reihe:** $s_n = a \cdot \dfrac{1 - q^n}{1 - q}$. Für $|q| < 1$ geht $q^n \to 0$, und die unendliche Reihe hat die Summe $\dfrac{a}{1-q}$. Beispiel: $1 + \tfrac12 + \tfrac14 + \dots = 2$.
- **Harmonische Reihe:** $1 + \tfrac12 + \tfrac13 + \dots$ Obwohl die Glieder gegen null gehen, wächst die Summe über alle Grenzen – nur sehr langsam.

## Ausprobieren

- [1/n](?mode=folge&typ=inv&eps=0.1): Verkleinere ε. Ab welchem n liegen die Glieder im Streifen?
- [Folge zur Zahl e](?mode=folge&typ=euler&eps=0.1): Gegen welche Zahl strebt $(1 + 1/n)^n$?
- [(−1)ⁿ](?mode=folge&typ=alt&eps=0.1): Warum gibt es keinen Grenzwert?
- [1 + 1/2 + 1/4 + …](?mode=reihe&rt=geom&a=1&q=0.5): Ändere q. Wann hat die Reihe eine Summe?

## Aufgaben

**1. ε-Umgebung.** Ab welchem $n$ ist $\tfrac1n < 0{,}05$? [Aufgabe laden](?mode=folge&typ=inv&eps=0.05&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\tfrac1n < 0{,}05 \Leftrightarrow n > 20$, also ab $n = 21$.

</details>

**2. Geometrische Reihe.** Berechne $3 + 1 + \tfrac13 + \tfrac19 + \dots$ [Aufgabe laden](?mode=reihe&rt=geom&a=3&q=0.35&_hide=1)

<details><summary>Lösung anzeigen</summary>

$a = 3$, $q = \tfrac13$: Summe $\dfrac{3}{1 - 1/3} = 4{,}5$. (In der Simulation lässt sich q nur in Schritten von 0,05 einstellen – mit $q = 0{,}35$ ergibt sich ein ähnlicher Wert.)

</details>

**3. Gauß.** Berechne $1 + 2 + 3 + \dots + 30$. [Aufgabe laden](?mode=reihe&rt=arith&a=1&d=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$s_{30} = \tfrac{30}{2} \cdot (1 + 30) = 465$.

</details>
