## Worum geht es?

Ein bestimmtes Integral $\int_a^b f(x)\,dx$ misst eine Fläche zwischen zwei festen Grenzen. Was aber, wenn die Fläche **unendlich lang** ist oder **unendlich hoch**? Dann spricht man von einem **uneigentlichen Integral**. Man rechnet mit einer beweglichen Grenze und untersucht, ob sich ein **Grenzwert** ergibt.

### Typ 1: Unbeschränktes Intervall

$$\int_1^{\infty} f(x)\,dx = \lim_{b \to \infty} \int_1^{b} f(x)\,dx$$

Beispiel $f(x) = \tfrac{1}{x^2}$:

$$\int_1^{b} \frac{1}{x^2}\,dx = \Big[-\frac{1}{x}\Big]_1^b = 1 - \frac{1}{b} \;\xrightarrow{\;b \to \infty\;}\; 1$$

Die Fläche reicht unendlich weit nach rechts und hat trotzdem genau den Inhalt $1$. Das Integral **konvergiert**.

Ganz anders ist es bei $f(x) = \tfrac{1}{x}$. Hier ist $\int_1^b \tfrac{1}{x}\,dx = \ln b$, und das wächst über alle Grenzen. Das Integral **divergiert**, obwohl die Kurve ebenfalls gegen $0$ geht. Sie tut es nur zu langsam.

Allgemein gilt für $\int_1^{\infty} x^{-p}\,dx$: Es konvergiert genau für $p > 1$ und hat dann den Wert $\tfrac{1}{p-1}$.

Auch $\int_0^{\infty} e^{-x}\,dx = \lim_{b \to \infty} (1 - e^{-b}) = 1$ konvergiert. Die Exponentialfunktion fällt sehr schnell.

### Typ 2: Unbeschränkte Funktion (Polstelle)

Hat $f$ an einer Grenze eine Polstelle, ersetzt man diese Grenze durch $\varepsilon$ und lässt $\varepsilon$ gegen die Polstelle laufen:

$$\int_0^{1} \frac{1}{\sqrt{x}}\,dx = \lim_{\varepsilon \to 0} \Big[2\sqrt{x}\Big]_\varepsilon^1 = \lim_{\varepsilon \to 0} (2 - 2\sqrt{\varepsilon}) = 2$$

Die Fläche ist unendlich hoch und hat trotzdem den Inhalt $2$. Für $\int_0^1 x^{-p}\,dx$ gilt genau umgekehrt wie bei Typ 1: Es konvergiert für $p < 1$ und hat dann den Wert $\tfrac{1}{1-p}$.

### Das untere Diagramm

Es zeigt den Integralwert in Abhängigkeit von der Grenze. Auf der Rechtsachse ist $\lg b$ bzw. $\lg \varepsilon$ aufgetragen, sodass ein Schritt um $1$ die Grenze verzehnfacht bzw. zehntelt. Nähert sich die Kurve einer waagerechten Linie, konvergiert das Integral, und die Linie ist sein Wert.

## Ausprobieren

- [1/x²](?typ=unendlich&p=2&lb=1): Schiebe b bis 10 000. Wie nahe kommt der Wert an 1?
- [1/x](?typ=unendlich&p=1&lb=2): Wie verändert sich der Wert, wenn b zehnmal so groß wird?
- [1/√x bei 0](?typ=polstelle&p=0.5&le=-2): Schiebe ε gegen 0. Was passiert bei p = 1 und bei p = 2?
- [e^(−x)](?typ=exp&lb=0.5): Wie schnell erreicht die Fläche fast 1?

## Aufgaben

**1. Konvergenz prüfen.** Berechne $\int_1^{\infty} x^{-3}\,dx$. [Aufgabe laden](?typ=unendlich&p=3&lb=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\int_1^b x^{-3}\,dx = \big[-\tfrac{1}{2x^2}\big]_1^b = \tfrac12 - \tfrac{1}{2b^2} \to \tfrac12$.

</details>

**2. Divergenz.** Zeige, dass $\int_1^{\infty} \tfrac{1}{\sqrt{x}}\,dx$ divergiert. [Aufgabe laden](?typ=unendlich&p=0.5&lb=2&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\int_1^b x^{-1/2}\,dx = 2\sqrt{b} - 2$, und das wächst für $b \to \infty$ über alle Grenzen.

</details>

**3. Polstelle.** Berechne $\int_0^1 x^{-0{,}75}\,dx$. [Aufgabe laden](?typ=polstelle&p=0.75&le=-3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\big[4\,x^{0{,}25}\big]_\varepsilon^1 = 4 - 4\,\varepsilon^{0{,}25} \to 4$.

</details>

**4. Gabriels Horn.** Lässt man $y = \tfrac1x$ für $x \ge 1$ um die $x$-Achse rotieren, ist das Volumen $\pi\int_1^\infty \tfrac{1}{x^2}\,dx$ endlich. Wie groß ist es?

<details><summary>Lösung anzeigen</summary>

$V = \pi \cdot 1 = \pi$. Die Oberfläche dieses Körpers ist dagegen unendlich groß. Das ist ein berühmtes Paradoxon.

</details>
