---
description: "Interaktive Simulation für die 11. Klasse: das Newton-Verfahren Schritt für Schritt – Lot zum Graphen, Tangente, Schnittpunkt mit der x-Achse, Steigungsdreieck als Herleitung, Lupe für winzige Schritte, Tabelle mit fett gedruckten richtigen Stellen, Newton = Heron für √2 und die Fälle, in denen das Verfahren scheitert."
---

## Worum geht es?

Viele Gleichungen lassen sich nicht nach $x$ auflösen, zum Beispiel $x^3 - 2x - 5 = 0$ oder $\cos x = x$. Das **Newton-Verfahren** bestimmt eine Nullstelle von $f$ näherungsweise – und zwar erstaunlich schnell:

1. Wähle einen **Startwert** $x_0$ in der Nähe der Nullstelle.
2. Gehe vom Punkt $(x_0 \mid 0)$ senkrecht zum Graphen und lege im Punkt $(x_0 \mid f(x_0))$ die **Tangente** an.
3. Der Schnittpunkt der Tangente mit der $x$-Achse ist der neue Näherungswert $x_1$.
4. Wiederhole das mit $x_1$, $x_2$, … (**Iteration**).

**Woher kommt die Formel?** Das Lot, die $x$-Achse und die Tangente bilden ein **Steigungsdreieck** mit der senkrechten Kathete $f(x_n)$ und der waagrechten Kathete $x_n - x_{n+1}$. Die Steigung der Tangente ist $f'(x_n)$, also

$$f'(x_n) = \frac{f(x_n)}{x_n - x_{n+1}} \quad\Longrightarrow\quad x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}.$$

*Beispiel:* $f(x) = x^2 - 2$, $f'(x) = 2x$, $x_0 = 1$:
$x_1 = 1 - \frac{-1}{2} = 1{,}5$, $\;x_2 = 1{,}5 - \frac{0{,}25}{3} = \frac{17}{12} \approx 1{,}416667$, $\;x_3 = \frac{577}{408} \approx 1{,}4142157$ – und $\sqrt 2 = 1{,}41421356\ldots$

**Newton = Heron:** Für $f(x) = x^2 - 2$ gilt $x_{n+1} = x_n - \frac{x_n^2 - 2}{2x_n} = \frac{1}{2}\left(x_n + \frac{2}{x_n}\right)$. Das ist genau das Heron-Verfahren: der Mittelwert aus $x_n$ und $2 : x_n$.

**Wie schnell?** In der Nähe einer einfachen Nullstelle $x^*$ wird der Fehler $e_n = |x_n - x^*|$ in jedem Schritt ungefähr **quadriert**: $e_{n+1} \approx C \cdot e_n^2$ (für $x^2 - 2$ ist $C = \frac{1}{2\sqrt 2} \approx 0{,}354$). Deshalb **verdoppelt sich die Anzahl der richtigen Stellen ungefähr** – in der Tabelle für $\sqrt 2$: $0 \to 2 \to 5 \to 11$. Man spricht von **quadratischer Konvergenz**. Der Grund: Aus der Nähe (Lupe!) sieht der Graph fast aus wie seine Tangente.

**Das Verfahren kann scheitern:**

- **Waagrechte Tangente** ($f'(x_n) = 0$): Sie schneidet die $x$-Achse nicht, in der Formel müsste man durch $0$ teilen.
- **Sprung:** Nahe einem Extrempunkt ist die Tangente fast waagrecht – der nächste Wert landet weit weg, oft bei einer ganz anderen Nullstelle.
- **Zyklus:** Die Werte springen endlos hin und her.
- **Doppelte Nullstelle:** Berührt der Graph die $x$-Achse nur, wird es langsam: Der Fehler halbiert sich bloß noch.

## Ausprobieren

1. [√2 mit x₀ = 1](?fn=sq2&x0=1&k=0): Drücke „Nächster Schritt“ und verfolge die Animation: Lot, Tangente, Steigungsdreieck, neuer Punkt. Drücke dann „Alles abspielen“ und beobachte die fett gedruckten Stellen in der Tabelle.
2. Ab Schritt 2 erscheint die **Lupe**. Wie stark muss sie vergrößern, damit man Schritt 3 oder 4 noch sieht? Wie sieht der Graph in der Lupe aus?
3. Ziehe den Startwert $x_0$ oder tippe auf die $x$-Achse. Was passiert bei $x_0 = 0$, was bei negativen Startwerten?
4. [Newtons Beispiel](?fn=cubic&x0=2&k=3): Isaac Newton rechnete selbst mit $x^3 - 2x - 5$. Nach wie vielen Schritten stimmen 8 Nachkommastellen? Und bei [cos x = x](?fn=cos&x0=1&k=3), einer Gleichung, die keine Umformung löst?
5. [Waagrechte Tangente](?fn=three&x0=1&k=1): Warum gibt es hier keinen nächsten Wert? Verschiebe $x_0$ ein kleines Stück.
6. [Sprung zur anderen Nullstelle](?fn=three&x0=0.95&k=5&basin=1): Der Startwert liegt neben der rechten Nullstelle – gefunden wird die linke. Die Farben auf der $x$-Achse zeigen die **Einzugsbereiche**: wohin jeder Startwert führt.
7. [Zyklus](?fn=cycle&x0=0&k=4): Die Folge springt zwischen $0$ und $1$ hin und her. Welche Startwerte führen zur Nullstelle? Schalte „Einzugsbereiche färben“ ein.
8. [Doppelte Nullstelle](?fn=dbl&x0=2&k=8): Vergleiche die Tabelle mit der von $\sqrt 2$. Was ist anders?

## Aufgaben

### Aufgabe 1: Zwei Schritte von Hand

Berechne für $f(x) = x^2 - 2$ mit $x_0 = 2$ die Näherungswerte $x_1$ und $x_2$. [Aufgabe laden](?fn=sq2&x0=2&k=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 2x$. $x_1 = 2 - \frac{2}{4} = 1{,}5$; $x_2 = 1{,}5 - \frac{0{,}25}{3} = \frac{17}{12} \approx 1{,}41667$. Mit Heron: $\frac12\left(2 + \frac22\right) = 1{,}5$ und $\frac12\left(1{,}5 + \frac{2}{1{,}5}\right) = \frac{17}{12}$ – dieselben Zahlen. [Lösung zeigen](?fn=sq2&x0=2&k=2)

</details>

### Aufgabe 2: Die Formel herleiten

Stelle die Gleichung der Tangente an den Graphen von $f$ im Punkt $(x_n \mid f(x_n))$ auf und berechne ihren Schnittpunkt mit der $x$-Achse. [Steigungsdreieck ansehen](?fn=sq2&x0=1&k=1)

<details>
<summary>Lösung anzeigen</summary>

$t(x) = f(x_n) + f'(x_n)\,(x - x_n)$. Aus $t(x) = 0$ folgt $x - x_n = -\frac{f(x_n)}{f'(x_n)}$, also $x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$ – vorausgesetzt $f'(x_n) \neq 0$. Im Steigungsdreieck: Steigung $=$ Höhe $:$ Breite, also $f'(x_n) = \frac{f(x_n)}{x_n - x_{n+1}}$.

</details>

### Aufgabe 3: Newtons eigenes Beispiel

Bestimme die Nullstelle von $f(x) = x^3 - 2x - 5$ mit $x_0 = 2$ auf sechs Nachkommastellen. [Aufgabe laden](?fn=cubic&x0=2&k=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 3x^2 - 2$. $f(2) = -1$, $f'(2) = 10$, also $x_1 = 2 + 0{,}1 = 2{,}1$. $f(2{,}1) = 9{,}261 - 4{,}2 - 5 = 0{,}061$, $f'(2{,}1) = 11{,}23$, also $x_2 = 2{,}1 - \frac{0{,}061}{11{,}23} \approx 2{,}094568$. Ein weiterer Schritt liefert $x_3 \approx 2{,}0945515$; die Nullstelle ist $x \approx 2{,}094551$. [Lösung zeigen](?fn=cubic&x0=2&k=3)

</details>

### Aufgabe 4: cos x = x

Bestimme mit dem Newton-Verfahren eine Lösung von $\cos x = x$ auf vier Nachkommastellen ($x_0 = 1$, Bogenmaß!). [Aufgabe laden](?fn=cos&x0=1&k=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f(x) = \cos x - x$, $f'(x) = -\sin x - 1$. $f(1) \approx -0{,}4597$, $f'(1) \approx -1{,}8415$, also $x_1 \approx 1 - 0{,}2496 = 0{,}7504$. Weiter $x_2 \approx 0{,}739113$ und $x_3 \approx 0{,}739085$. Ergebnis: $x \approx 0{,}7391$. [Lösung zeigen](?fn=cos&x0=1&k=3)

</details>

### Aufgabe 5: Warum scheitert es?

a) Für $f(x) = x^3 - 3x + 1$ und $x_0 = 1$ gibt es keinen Wert $x_1$. b) Für $f(x) = x^3 - 2x + 2$ und $x_0 = 0$ erhält man $x_1 = 1$, $x_2 = 0$, … Erkläre beides mit einer Skizze. [a) zeigen](?fn=three&x0=1&k=1) · [b) zeigen](?fn=cycle&x0=0&k=4)

<details>
<summary>Lösung anzeigen</summary>

a) $f'(x) = 3x^2 - 3$, also $f'(1) = 0$: Bei $x = 1$ hat der Graph einen Tiefpunkt, die Tangente ist waagrecht und schneidet die $x$-Achse nicht.

b) $f'(x) = 3x^2 - 2$. $x_1 = 0 - \frac{2}{-2} = 1$ und $x_2 = 1 - \frac{1}{1} = 0$. Die Tangente in $0$ trifft die Achse bei $1$, die Tangente in $1$ trifft sie wieder bei $0$ – ein Zyklus. Ein Startwert links der Nullstelle, z. B. $x_0 = -2$, funktioniert: $x_1 = -1{,}8$, … $\to -1{,}769$. [Zeigen](?fn=cycle&x0=-2&k=4)

</details>

### Aufgabe 6: Wie schnell ist schnell?

Für $f(x) = x^2 - 2$ und $x_0 = 1$ ist $e_2 = \frac{17}{12} - \sqrt 2 \approx 0{,}00245$. Schätze $e_3$ mit $e_{n+1} \approx \frac{e_n^2}{2\sqrt 2}$ und vergleiche mit der Tabelle. Wie verhält sich der Fehler bei der doppelten Nullstelle von $x^3 - 3x + 2$? [Aufgabe laden](?fn=sq2&x0=1&k=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$e_3 \approx \frac{0{,}00245^2}{2{,}828} \approx 2{,}1 \cdot 10^{-6}$; tatsächlich ist $\frac{577}{408} - \sqrt2 \approx 2{,}12 \cdot 10^{-6}$. Der nächste Fehler liegt dann schon bei etwa $1{,}6 \cdot 10^{-12}$. Bei $x^3 - 3x + 2 = (x-1)^2(x+2)$ ist dagegen $f'(1) = 0$: Ab $x_0 = 2$ ($x_1 = \frac{14}{9}$) halbiert sich der Fehler nur – $1 \to 0{,}56 \to 0{,}30 \to 0{,}16 \to \ldots$ [√2 zeigen](?fn=sq2&x0=1&k=4) · [Doppelte Nullstelle zeigen](?fn=dbl&x0=2&k=8)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 11, Anwendungen der Differentialrechnung (Tangentengleichung, Nullstellen ganzrationaler Funktionen) im LehrplanPLUS Gymnasium Bayern – bitte am Lehrplan prüfen. $\cos x = x$ eignet sich als Ausblick.
- **Herleitung entdecken lassen:** Erst „Nächster Schritt“ mit ausgeschalteten Werten (`show=0`) zeigen, die Lernenden das Steigungsdreieck beschriften lassen und daraus die Formel gewinnen.
- **Heron und Tabellenkalkulation:** Für $x^2 - 2$ entsteht genau das Heron-Verfahren aus der 9. Klasse. Das Verfahren in einer Tabellenkalkulation nachbauen, mit der Simulation vergleichen und anschließend mit dem Halbierungsverfahren (Bisektion) um die Wette rechnen.
- **Einzugsbereiche:** Mit „Einzugsbereiche färben“ lässt sich untersuchen, warum Startwerte nahe den Extremstellen unberechenbar werden – gut als Projekt oder für Interessierte.
- **Häufige Stolpersteine:**
  - Vorzeichenfehler: Es heißt $x_n \mathbin{-} \frac{f(x_n)}{f'(x_n)}$; bei negativem $f(x_n)$ oder $f'(x_n)$ hilft eine Klammer.
  - Der Taschenrechner steht bei $\cos x$ im Gradmaß statt im Bogenmaß.
  - „Das Verfahren klappt immer“ – waagrechte Tangente, Sprung und Zyklus zeigen, wie wichtig der Startwert ist.
