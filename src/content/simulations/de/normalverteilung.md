---
description: "Interaktive Simulation für die Oberstufe: Normalverteilung mit Glockenkurve, ziehbaren Grenzen, Wahrscheinlichkeit als Fläche, Verteilungsfunktion Φ, Sigma-Regeln und Standardisierung, Näherung der Binomialverteilung mit Laplace-Bedingung und Stichproben, deren Histogramm sich der Glocke nähert."
---

## Worum geht es?

Viele Messgrößen – Körpergrößen, Abfüllmengen, Messfehler, IQ-Werte – sind näherungsweise **normalverteilt**. Ihre Werte häufen sich um den **Erwartungswert** $\mu$; die **Standardabweichung** $\sigma$ beschreibt, wie stark sie streuen.

Bei einer stetigen Zufallsgröße hat ein einzelner Wert die Wahrscheinlichkeit $0$. Man fragt deshalb nach Intervallen: Die Wahrscheinlichkeit $P(a \leq X \leq b)$ ist die **Fläche unter der Dichtekurve** (Glockenkurve)

$$\varphi(x) = \frac{1}{\sigma\sqrt{2\pi}} \cdot e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

zwischen $a$ und $b$. Die **Verteilungsfunktion** $\Phi(x) = P(X \leq x)$ gibt die Fläche links von $x$ an. Damit gilt

$$P(a \leq X \leq b) = \Phi(b) - \Phi(a).$$

**Eigenschaften der Glockenkurve:** symmetrisch zu $x = \mu$, Maximum bei $\mu$, Wendestellen bei $\mu \pm \sigma$, Gesamtfläche $1$. Je größer $\sigma$, desto flacher und breiter die Glocke.

**Sigma-Regeln:** $P(\mu - \sigma \leq X \leq \mu + \sigma) \approx 68{,}3\,\%$, für $2\sigma$ etwa $95{,}4\,\%$, für $3\sigma$ etwa $99{,}7\,\%$.

**Standardisieren:** Mit $z = \frac{x - \mu}{\sigma}$ führt man jede Normalverteilung auf die Standardnormalverteilung ($\mu = 0$, $\sigma = 1$) zurück.

**Näherung der Binomialverteilung** (Ansicht *Binomialverteilung nähern*): Für $X \sim B(n;\,p)$ mit $\mu = n \cdot p$ und $\sigma = \sqrt{n \cdot p \cdot (1-p)}$ gilt bei großem $\sigma$

$$P(X \leq k) \approx \Phi\!\left(\frac{k + 0{,}5 - \mu}{\sigma}\right).$$

Das $+\,0{,}5$ ist die **Stetigkeitskorrektur**: Der Balken für $k$ reicht von $k - 0{,}5$ bis $k + 0{,}5$. Als Faustregel gilt die **Laplace-Bedingung** $\sigma > 3$. Die Simulation zeigt dazu den größten Näherungsfehler für alle $n$ von 5 bis 200.

**Stichproben** (Ansicht *Stichprobe*): Zieht man viele normalverteilte Werte, nähert sich das Histogramm der Glockenkurve, Mittelwert $\bar{x}$ und Standardabweichung $s$ der Stichprobe nähern sich $\mu$ und $\sigma$, und etwa $68\,\%$ der Werte liegen in $[\mu - \sigma;\, \mu + \sigma]$.

## Ausprobieren

1. [Standardnormalverteilung](?sit=abs&mu=0&sg=1&a=-1&b=1): Ziehe die Grenzen $a$ und $b$. Wie ändern sich Fläche und $\Phi(b) - \Phi(a)$?
2. Drücke nacheinander „μ ± σ“, „μ ± 2σ“ und „μ ± 3σ“.
3. Verändere $\sigma$. Warum bleibt die Wahrscheinlichkeit für $\mu \pm \sigma$ gleich, obwohl die Kurve ganz anders aussieht?
4. [IQ über 130](?sit=iq&typ=ge&ia=130): Wie viel Prozent der Menschen haben einen IQ über 130?
5. [Abfüllmenge](?sit=fill&typ=le&fb=495): Wie oft enthält eine Flasche weniger als $495\,\text{ml}$?
6. [Binomialverteilung nähern](?mode=binom&bn=50&bp=0.3&bk=12): Verändere $n$ und $p$. Wann passt die Glocke gut zu den Balken? Schalte die Stetigkeitskorrektur aus und an.
7. [Näherung zu grob](?mode=binom&bn=20&bp=0.1&bk=1): Warum passt die Glocke hier schlecht? Erhöhe $n$, bis die Laplace-Bedingung erfüllt ist.
8. [Stichprobe aus der Abfüllanlage](?mode=sample&sit=fill): Ziehe mehrmals 50 Werte, dann 1000 auf einmal. Wie entwickeln sich Histogramm, $\bar{x}$, $s$ und die Anteile?

## Aufgaben

### Aufgabe 1: Sigma-Regel anwenden

Der IQ ist normalverteilt mit $\mu = 100$ und $\sigma = 15$. Wie viel Prozent der Menschen haben einen IQ zwischen 85 und 115? [Aufgabe laden](?sit=iq&typ=between&ia=85&ib=115&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$85$ und $115$ sind $\mu - \sigma$ und $\mu + \sigma$, also etwa $68{,}3\,\%$. [Lösung zeigen](?sit=iq&typ=between&ia=85&ib=115)

</details>

### Aufgabe 2: Standardisieren

Wie groß ist $P(X \geq 130)$ beim IQ? [Aufgabe laden](?sit=iq&typ=ge&ia=130&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$z = \frac{130 - 100}{15} = 2$, also $P(X \geq 130) = 1 - \Phi(2) \approx 1 - 0{,}9772 = 0{,}0228 \approx 2{,}3\,\%$. [Lösung zeigen](?sit=iq&typ=ge&ia=130)

</details>

### Aufgabe 3: Abfüllanlage

Eine Anlage füllt Flaschen mit $\mu = 500\,\text{ml}$ und $\sigma = 4\,\text{ml}$. Mit welcher Wahrscheinlichkeit enthält eine Flasche zwischen $497$ und $503\,\text{ml}$? [Aufgabe laden](?sit=fill&typ=between&fa=497&fb=503&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$z = \pm 0{,}75$, also $P = \Phi(0{,}75) - \Phi(-0{,}75) \approx 0{,}7734 - 0{,}2266 = 0{,}5467 \approx 54{,}7\,\%$. [Lösung zeigen](?sit=fill&typ=between&fa=497&fb=503)

</details>

### Aufgabe 4: Breiter oder schmaler?

Zwei Normalverteilungen haben denselben Erwartungswert, aber $\sigma_1 = 1$ und $\sigma_2 = 2$. Welche Glocke ist höher? Begründe mit der Gesamtfläche.

<details>
<summary>Lösung anzeigen</summary>

Die Glocke mit $\sigma_1 = 1$: Beide Flächen sind $1$; die breitere Kurve muss daher niedriger sein. Das Maximum $\frac{1}{\sigma\sqrt{2\pi}}$ halbiert sich bei doppeltem $\sigma$. [Vergleichen](?sit=abs&mu=0&sg=2&a=-2&b=2)

</details>

### Aufgabe 5: Binomialverteilung nähern

Eine Münze wird 100-mal geworfen. Berechne $P(X \leq 55)$ für die Anzahl $X$ der Wappen näherungsweise mit der Normalverteilung. [Aufgabe laden](?mode=binom&bn=100&bp=0.5&bk=55&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\mu = 50$, $\sigma = \sqrt{100 \cdot 0{,}5 \cdot 0{,}5} = 5 > 3$. $P(X \leq 55) \approx \Phi\!\left(\frac{55{,}5 - 50}{5}\right) = \Phi(1{,}1) \approx 0{,}8643$. Exakt: $0{,}8644$. Ohne Stetigkeitskorrektur käme $\Phi(1) \approx 0{,}8413$ heraus – deutlich schlechter. [Lösung zeigen](?mode=binom&bn=100&bp=0.5&bk=55)

</details>

### Aufgabe 6: Laplace-Bedingung

Bei $p = 0{,}1$: Ab welcher Anzahl $n$ ist die Laplace-Bedingung $\sigma > 3$ erfüllt? [Aufgabe laden](?mode=binom&bn=20&bp=0.1&bk=1&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\sigma = \sqrt{n \cdot 0{,}1 \cdot 0{,}9} > 3 \iff n \cdot 0{,}09 > 9 \iff n > 100$. [Lösung zeigen](?mode=binom&bn=101&bp=0.1&bk=8)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 13 (stetige Zufallsgrößen, Normalverteilung), LehrplanPLUS Gymnasium Bayern; auch für den Studienbeginn geeignet.
- **Übergang von der Binomialverteilung:** Mit dem Galtonbrett beginnen und dann in der Ansicht *Binomialverteilung nähern* zeigen, wie sich die Histogramme bei großem $n$ der Glockenkurve annähern. Ob die Näherung im Unterricht noch gerechnet wird, ist je nach Lehrplan verschieden – bitte am Lehrplan prüfen.
- **Stichprobe als Experiment:** Die Klasse schätzt vorher, wie viele von 1000 Flaschen außerhalb von $500 \pm 8\,\text{ml}$ liegen; dann ziehen und mit $1 - 95{,}4\,\% \approx 4{,}6\,\%$ vergleichen.
- **Tabelle und Rechner:** Die Werte von $\Phi$ aus der Simulation mit einer Tabelle oder dem Taschenrechner vergleichen.
- **Häufige Stolpersteine:**
  - Die Höhe der Dichtekurve wird als Wahrscheinlichkeit gelesen (es zählt die Fläche).
  - Bei $P(X \geq a)$ wird $1 - \Phi(a)$ vergessen.
  - Beim Standardisieren werden $\mu$ und $\sigma$ vertauscht.
  - Bei der Näherung wird die Stetigkeitskorrektur vergessen oder in die falsche Richtung angewendet ($P(X < k) = P(X \leq k - 1)$!).
  - Die Höhe eines Histogrammbalkens wird mit der relativen Häufigkeit verwechselt; bei der Glocke zählt Höhe × Klassenbreite.
