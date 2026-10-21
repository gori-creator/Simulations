---
description: "Interaktive Simulation für die Oberstufe: Normalverteilung mit Glockenkurve, ziehbaren Grenzen und Wahrscheinlichkeit als Fläche, Verteilungsfunktion Φ, Sigma-Regeln, Standardisieren als Animation, Eigenschaften der Glocke, Umkehrung mit der z-Tabelle (Quantile), Vergleich zweier Abfüllanlagen, Näherung der Binomialverteilung mit Laplace-Bedingung und Stichproben."
---

## Worum geht es?

Viele Messgrößen – Körpergrößen, Abfüllmengen, Messfehler, IQ-Werte – sind näherungsweise **normalverteilt**. Ihre Werte häufen sich um den **Erwartungswert** $\mu$; die **Standardabweichung** $\sigma$ beschreibt, wie stark sie streuen. Man schreibt $X \sim N(\mu;\,\sigma^2)$.

Bei einer stetigen Zufallsgröße hat ein einzelner Wert die Wahrscheinlichkeit $0$: Über einem Punkt liegt keine Fläche, also $P(X = a) = 0$. Man fragt nach Intervallen. Die Wahrscheinlichkeit $P(a \leq X \leq b)$ ist die **Fläche unter der Dichtekurve**

$$\varphi(x) = \frac{1}{\sigma\sqrt{2\pi}} \cdot e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

zwischen $a$ und $b$. Die **Verteilungsfunktion** $F(x) = P(X \leq x)$ gibt die Fläche links von $x$ an; also ist $P(a \leq X \leq b) = F(b) - F(a)$ und $P(X \geq a) = 1 - F(a)$. Für die Standardnormalverteilung $N(0;\,1)$ heißt sie $\Phi$; nach dem Standardisieren gilt $F(x) = \Phi\!\left(\frac{x - \mu}{\sigma}\right)$, zum Beispiel beim IQ $P(X \leq 130) = F(130) = \Phi(2{,}00)$.

**Eigenschaften der Glockenkurve:** symmetrisch zu $x = \mu$, Hochpunkt bei $\mu$ mit $\varphi(\mu) = \frac{1}{\sigma\sqrt{2\pi}}$ (für $\sigma = 1$ etwa $0{,}3989$), Wendestellen bei $\mu \pm \sigma$, Gesamtfläche $1$. Die Wendetangenten schneiden die $x$-Achse genau bei $\mu \pm 2\sigma$. Halbiert man $\sigma$, wird die Glocke halb so breit und doppelt so hoch.

**Sigma-Regeln:** $P(\mu - \sigma \leq X \leq \mu + \sigma) \approx 68{,}3\,\%$, für $2\sigma$ etwa $95{,}4\,\%$, für $3\sigma$ etwa $99{,}7\,\%$ – für jede Normalverteilung. **Standardisieren:** Mit $z = \frac{x - \mu}{\sigma}$ wird jede Normalverteilung zur Standardnormalverteilung $N(0;\,1)$. Die Glocke wird um $\mu$ verschoben und mit dem Faktor $\frac{1}{\sigma}$ gestreckt bzw. gestaucht, die markierte Fläche bleibt dabei gleich groß. Deshalb genügt eine einzige Tabelle für $\Phi$. **Umkehrung (Quantile):** Ist die Wahrscheinlichkeit gegeben und die Grenze gesucht, liest man die $z$-Tabelle rückwärts. Aus $P(X \geq x) = 5\,\%$ folgt $\Phi(z) = 0{,}95$, also $z \approx 1{,}645$ und $x = \mu + z \cdot \sigma$.

**Näherung der Binomialverteilung:** Für $X \sim B(n;\,p)$ mit $\mu = n \cdot p$ und $\sigma = \sqrt{n \cdot p \cdot (1-p)}$ gilt bei großem $\sigma$ die Näherung $P(X \leq k) \approx \Phi\!\left(\frac{k + 0{,}5 - \mu}{\sigma}\right)$. Das $+\,0{,}5$ ist die **Stetigkeitskorrektur**: Der Balken für $k$ reicht von $k - 0{,}5$ bis $k + 0{,}5$. Als Faustregel gilt die **Laplace-Bedingung** $\sigma > 3$.

## Ausprobieren

1. [Standardnormalverteilung](?sit=abs&mu=0&sg=1&a=-1&b=1): Ziehe die Grenzen $a$ und $b$. Wie ändern sich die Fläche und der Balken $F(b) - F(a)$? (Hier ist $F = \Phi$.) Drücke nacheinander „μ ± σ“, „μ ± 2σ“ und „μ ± 3σ“.
2. Verändere $\sigma$, während „μ ± σ“ markiert ist. Warum bleibt die Wahrscheinlichkeit gleich, obwohl die Kurve ganz anders aussieht?
3. [Eigenschaften der Glocke](?prop=1&cdf=0): Wo liegen Hochpunkt, Wendestellen und die Nullstellen der Wendetangenten? Stelle dann [sehr kleines σ](?sg=0.2&a=-0.2&b=0.2&prop=1) ein: Wie hoch wird die Glocke?
4. [Standardisieren](?sit=iq&typ=between&ia=115&ib=130): Drücke „Standardisieren“. Beobachte, wie die IQ-Achse zur $z$-Achse wird. Welche Zahlen stehen am Ende über $z = 1$ und $z = 2$?
5. [Sonderfall X = a](?typ=eq&a=1): Warum ist $P(X = 1) = 0$, obwohl die Kurve dort nicht null ist?
6. [Umkehrung](?mode=quant&sit=iq&qt=ge&qp=5): Drücke „Grenze suchen“ und ziehe die Grenze. Zwischen welchen Tabellenwerten liegt $0{,}95$?
7. [Zwei Abfüllanlagen](?mode=cmp): Welche Anlage hält den Bereich $495$ bis $505\,\text{ml}$ besser ein? Drücke „Beide mittig einstellen“. Vergleiche mit [schmal, aber verschoben](?mode=cmp&m2=504&s2=2).
8. [Binomialverteilung nähern](?mode=binom&bn=50&bp=0.3&bk=12): Schalte die Stetigkeitskorrektur aus und an. Ziehe dann in der [Stichprobe](?mode=sample&sit=fill) 1000 Werte auf einmal.

## Aufgaben

### Aufgabe 1: Standardisieren

a) Berechne $P(X \geq 130)$ und $P(115 \leq X \leq 130)$ beim IQ ($\mu = 100$, $\sigma = 15$). [Aufgabe laden](?sit=iq&typ=ge&ia=130&show=0&_hide=1) b) Eine Anlage füllt Flaschen mit $\mu = 500\,\text{ml}$ und $\sigma = 4\,\text{ml}$. Wie wahrscheinlich sind $497$ bis $503\,\text{ml}$? [Aufgabe laden](?sit=fill&typ=between&fa=497&fb=503&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

a) $z = \frac{130 - 100}{15} = 2$, also $P(X \geq 130) = 1 - \Phi(2) \approx 1 - 0{,}9772 = 0{,}0228 \approx 2{,}3\,\%$. Für $115$ ist $z = 1$: $P(115 \leq X \leq 130) = \Phi(2) - \Phi(1) \approx 0{,}9772 - 0{,}8413 = 0{,}1359$. [Lösung zeigen](?sit=iq&typ=between&ia=115&ib=130&zs=1)

b) $z = \pm 0{,}75$, also $P = 2\Phi(0{,}75) - 1 \approx 2 \cdot 0{,}7734 - 1 = 0{,}5467 \approx 54{,}7\,\%$. [Lösung zeigen](?sit=fill&typ=between&fa=497&fb=503)

</details>

### Aufgabe 2: Die Grenze ist gesucht

a) Welcher IQ wird nur von $5\,\%$ der Menschen übertroffen? b) In welchem Bereich symmetrisch um $500\,\text{ml}$ liegen $95\,\%$ der Füllmengen? [Aufgabe laden](?mode=quant&sit=iq&qt=ge&qp=5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

a) $1 - \Phi(z) = 0{,}05$, also $\Phi(z) = 0{,}95$. In der Tabelle liegt $0{,}95$ zwischen $\Phi(1{,}64) = 0{,}9495$ und $\Phi(1{,}65) = 0{,}9505$, also $z \approx 1{,}645$. Dann $x = 100 + 1{,}645 \cdot 15 \approx 124{,}7$. [Lösung zeigen](?mode=quant&sit=iq&qt=ge&qp=5)

b) $2\Phi(z) - 1 = 0{,}95$, also $\Phi(z) = 0{,}975$ und $z \approx 1{,}96$. $c = 1{,}96 \cdot 4\,\text{ml} = 7{,}84\,\text{ml}$, Bereich $[492{,}16;\ 507{,}84]\,\text{ml}$. [Lösung zeigen](?mode=quant&sit=fill&qt=mid&qp=95)

</details>

### Aufgabe 3: Zwei Anlagen, eine Toleranz

Anlage A: $\mu = 500\,\text{ml}$, $\sigma = 4\,\text{ml}$. Anlage B: $\mu = 502\,\text{ml}$, $\sigma = 2{,}5\,\text{ml}$. Erlaubt sind $495$ bis $505\,\text{ml}$. Welche Anlage ist besser? Was ändert sich, wenn man B auf $500\,\text{ml}$ einstellt? [Aufgabe laden](?mode=cmp&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

A: $\Phi(1{,}25) - \Phi(-1{,}25) \approx 0{,}7887$. B: $z_1 = \frac{495 - 502}{2{,}5} = -2{,}8$, $z_2 = 1{,}2$, also $\Phi(1{,}2) - \Phi(-2{,}8) \approx 0{,}8849 - 0{,}0026 = 0{,}8824$. B ist besser. Mittig eingestellt liegen die Grenzen bei $\pm 2\sigma$, dann sind es sogar $95{,}4\,\%$. [Lösung zeigen](?mode=cmp&m2=500)

</details>

### Aufgabe 4: Binomialverteilung nähern

Eine Münze wird 100-mal geworfen. Berechne $P(X \leq 55)$ für die Anzahl $X$ der Wappen näherungsweise. [Aufgabe laden](?mode=binom&bn=100&bp=0.5&bk=55&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\mu = 50$, $\sigma = \sqrt{100 \cdot 0{,}5 \cdot 0{,}5} = 5 > 3$. $P(X \leq 55) \approx \Phi\!\left(\frac{55{,}5 - 50}{5}\right) = \Phi(1{,}1) \approx 0{,}8643$. Exakt: $0{,}8644$. Ohne Stetigkeitskorrektur: $\Phi(1) \approx 0{,}8413$. [Lösung zeigen](?mode=binom&bn=100&bp=0.5&bk=55)

</details>

### Aufgabe 5: Laplace-Bedingung (Knobelaufgabe)

Bei $p = 0{,}1$: Ab welcher Anzahl $n$ ist die Laplace-Bedingung $\sigma > 3$ erfüllt? Ist sie für $n = 100$ erfüllt? [Aufgabe laden](?mode=binom&bn=20&bp=0.1&bk=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\sigma = \sqrt{n \cdot 0{,}1 \cdot 0{,}9} > 3 \iff n \cdot 0{,}09 > 9 \iff n > 100$. Für $n = 100$ ist $\sigma = 3$ – knapp nicht erfüllt. Erst ab $n = 101$. [Lösung zeigen](?mode=binom&bn=101&bp=0.1&bk=10)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 13 (stetige Zufallsgrößen, Normalverteilung), LehrplanPLUS Gymnasium Bayern. Ob Quantile und die Näherung der Binomialverteilung im Unterricht gerechnet werden, bitte am Lehrplan prüfen.
- **Einstieg über die Fläche:** Erst schätzen lassen, welcher Anteil zwischen $a$ und $b$ liegt, dann ziehen und vergleichen. Der Balken im Diagramm der Verteilungsfunktion zeigt, warum man zwei Tabellenwerte subtrahiert.
- **Standardisieren sichtbar machen:** Die Animation eignet sich, um zu begründen, warum eine einzige $\Phi$-Tabelle für alle Normalverteilungen reicht.
- **Tabelle rückwärts und Qualitätskontrolle:** Die Ansicht „Umkehrung“ zeigt, wo man in der Tabelle sucht (Vergleich mit dem Taschenrechner). Beim Vergleich zweier Anlagen kann die Klasse vorab argumentieren, ob kleines $\sigma$ oder mittiges $\mu$ wichtiger ist.
- **Häufige Stolpersteine:**
  - Die Höhe der Dichtekurve wird als Wahrscheinlichkeit gelesen – es zählt die Fläche; $\varphi$ kann sogar größer als $1$ sein.
  - Bei $P(X \geq a)$ wird $1 - F(a)$ vergessen.
  - Beim Standardisieren werden $\mu$ und $\sigma$ vertauscht oder es wird durch $\sigma^2$ geteilt.
  - Bei der Umkehrung wird $\Phi(z) = 0{,}05$ statt $0{,}95$ gesucht.
  - Die Stetigkeitskorrektur wird vergessen oder falsch angewendet ($P(X < k) = P(X \leq k - 1)$).
