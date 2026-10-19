---
description: "Histogramm von B(n; p) mit Erwartungswert und σ-Umgebungen: P(X = k), P(X ≤ k), P(X ≥ k) und P(a ≤ X ≤ b) direkt am Histogramm wählen, mit eingesetzten Werten rechnen, die Treppenfunktion F(k) ansehen und Bernoulli-Ketten simulieren."
---

## Worum geht es?

Ein Zufallsexperiment mit nur zwei Ausgängen – **Treffer** oder **Niete** – heißt **Bernoulli-Experiment**. Wird es $n$-mal **unabhängig** wiederholt und ist die **Trefferwahrscheinlichkeit** $p$ jedes Mal gleich, spricht man von einer **Bernoulli-Kette** der Länge $n$. Die Zufallsgröße $X$ = „Anzahl der Treffer“ ist dann **binomialverteilt**, kurz $X \sim B(n;\,p)$:

$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n - k}, \qquad k = 0, 1, \dots, n
$$

Dabei zählt der **Binomialkoeffizient** $\binom{n}{k}$, auf wie viele Arten sich die $k$ Treffer auf die $n$ Plätze der Kette verteilen lassen, und $p^k \cdot (1-p)^{n-k}$ ist die Wahrscheinlichkeit eines einzelnen solchen Pfades. Beispiel $B(10;\,0{,}5)$: $P(X = 5) = 252 \cdot 0{,}5^{10} \approx 0{,}2461$.

Meist sind Bereiche gefragt. Mit der **kumulierten Verteilungsfunktion** $F(k) = P(X \le k)$ gilt:

- „höchstens $k$“: $P(X \le k) = F(k)$
- „mindestens $k$“: $P(X \ge k) = 1 - P(X \le k - 1) = 1 - F(k - 1)$
- „zwischen $a$ und $b$“: $P(a \le X \le b) = F(b) - F(a - 1)$

Der **Erwartungswert** $\mu = n \cdot p$ ist der Schwerpunkt des Histogramms, die **Standardabweichung** $\sigma = \sqrt{n \cdot p \cdot (1-p)}$ misst die Breite. In der $\sigma$-Umgebung $[\mu - \sigma;\, \mu + \sigma]$ liegt oft etwa $70\,\%$ der Wahrscheinlichkeit, in der $2\sigma$-Umgebung meist rund $95\,\%$ (für nicht zu kleine $\sigma$; die Werte schwanken, weil nur ganze $k$ zählen – in der Simulation werden sie genau angezeigt).

## Ausprobieren

1. Ziehe am Histogramm die Grenze $k$ hin und her. Die markierten Balken ergeben zusammen die gesuchte Wahrscheinlichkeit, die Karte rechnet mit. [Beispiel laden](?n=10&p=0.5&ev=le&k=3)
2. Verändere $p$ langsam von $0{,}1$ bis $0{,}9$. Wohin wandert $\mu$? Wann ist das Histogramm symmetrisch? [B(20; 0,3)](?n=20&p=0.3&ev=eq&k=6)
3. Vergrößere $n$ bei festem $p = 0{,}5$. Das Histogramm wird breiter ($\sigma$ wächst mit $\sqrt{n}$), die einzelnen Balken werden niedriger.
4. Schalte auf „kumuliert“ um. Jeder Balken des Histogramms wird zu einer Stufe der Treppenfunktion $F(k)$. Wie hoch ist die Stufe bei $k$? [Treppenfunktion](?n=20&p=0.3&ev=ge&k=9&view=cdf)
5. Starte einzelne Bernoulli-Ketten und dann das „Experiment 1000-mal“. Wie gut passt der orange Umriss der relativen Häufigkeiten zu den Balken?
6. Stelle die Randfälle $p = 0$ und $p = 1$ ein. Wo liegt jetzt die ganze Wahrscheinlichkeit? [p = 1](?n=10&p=1&ev=ge&k=10)

## Aufgaben

### Aufgabe 1: Raten im Test

Ein Test hat $20$ Fragen mit je vier Antworten, genau eine ist richtig. Jemand kreuzt rein zufällig an. Berechne die Wahrscheinlichkeit für genau $5$ richtige Antworten. [Aufgabe laden](?n=20&p=0.25&ev=eq&k=5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$X \sim B(20;\,0{,}25)$: $P(X = 5) = \binom{20}{5} \cdot 0{,}25^5 \cdot 0{,}75^{15} = 15504 \cdot 0{,}0009766 \cdot 0{,}01336 \approx 0{,}2023$. [In der Simulation zeigen](?n=20&p=0.25&ev=eq&k=5)

</details>

### Aufgabe 2: Bestehen durch Raten?

Zum Bestehen braucht man im Test aus Aufgabe 1 mindestens $10$ richtige Antworten. Wie wahrscheinlich ist das beim reinen Raten? [Aufgabe laden](?n=20&p=0.25&ev=ge&k=10&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P(X \ge 10) = 1 - F(9) \approx 1 - 0{,}9861 = 0{,}0139$, also nur etwa $1{,}4\,\%$. [In der Simulation zeigen](?n=20&p=0.25&ev=ge&k=10)

</details>

### Aufgabe 3: Elfmeter

Eine Spielerin verwandelt einen Elfmeter mit der Wahrscheinlichkeit $0{,}8$. Sie schießt $10$-mal. Mit welcher Wahrscheinlichkeit trifft sie mindestens $8$-mal? [Aufgabe laden](?n=10&p=0.8&ev=ge&k=8&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P(X \ge 8) = P(X = 8) + P(X = 9) + P(X = 10) \approx 0{,}3020 + 0{,}2684 + 0{,}1074 = 0{,}6778$. Ebenso: $1 - F(7) \approx 1 - 0{,}3222 = 0{,}6778$. [In der Simulation zeigen](?n=10&p=0.8&ev=ge&k=8)

</details>

### Aufgabe 4: 100 Münzwürfe

Eine Münze wird $100$-mal geworfen. Berechne $\mu$, $\sigma$ und $P(40 \le X \le 60)$ für die Anzahl $X$ der Würfe mit „Zahl“. Welche Umgebung von $\mu$ ist das? [Aufgabe laden](?n=100&p=0.5&ev=ab&a=40&b=60&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\mu = 100 \cdot 0{,}5 = 50$, $\sigma = \sqrt{100 \cdot 0{,}5 \cdot 0{,}5} = 5$. $P(40 \le X \le 60) = F(60) - F(39) \approx 0{,}9824 - 0{,}0176 = 0{,}9648$. Das ist genau die $2\sigma$-Umgebung $[50 - 10;\, 50 + 10]$. [In der Simulation zeigen](?n=100&p=0.5&ev=ab&a=40&b=60)

</details>

### Aufgabe 5: Mindestens ein Treffer

Ein Bauteil ist mit der Wahrscheinlichkeit $0{,}05$ defekt. Wie wahrscheinlich ist unter $50$ Bauteilen mindestens ein defektes? Wie viele defekte erwartet man? [Aufgabe laden](?n=50&p=0.05&ev=ge&k=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Über das Gegenereignis „kein Treffer“: $P(X \ge 1) = 1 - P(X = 0) = 1 - 0{,}95^{50} \approx 1 - 0{,}0769 = 0{,}9231$. Erwartungswert $\mu = 50 \cdot 0{,}05 = 2{,}5$. [In der Simulation zeigen](?n=50&p=0.05&ev=ge&k=1)

</details>

### Aufgabe 6: Binomialverteilt oder nicht?

Aus einer Klasse mit $12$ Mädchen und $13$ Jungen werden ohne Zurücklegen $5$ Personen ausgelost; $X$ ist die Anzahl der Mädchen. Ist $X$ binomialverteilt? Begründe.

<details>
<summary>Lösung anzeigen</summary>

Nein. Ohne Zurücklegen ändert sich die Wahrscheinlichkeit für „Mädchen“ von Zug zu Zug (zuerst $\frac{12}{25}$, danach z. B. $\frac{11}{24}$), und die Züge sind nicht unabhängig. Eine Bernoulli-Kette verlangt dieselbe Trefferwahrscheinlichkeit bei jedem Versuch.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Stochastik der Oberstufe (Binomialverteilung, Erwartungswert, Standardabweichung, σ-Umgebungen) – die genaue Zuordnung zur Jahrgangsstufe bitte am Lehrplan prüfen. Gut als Ergänzung zum Galtonbrett, das die Entstehung der Verteilung zeigt.
- **Vom Tafelwerk zum Bild:** Die Treppenansicht macht sichtbar, was in Tabellen der kumulierten Binomialverteilung steht; Werte daraus lassen sich direkt an den Stufen ablesen.
- **Modellieren:** Vor dem Rechnen gemeinsam prüfen, ob die Voraussetzungen erfüllt sind (zwei Ausgänge, unabhängig, gleiches $p$) – Aufgabe 6 bietet einen Gegenbeispiel-Einstieg.
- **Häufige Stolpersteine:**
  - „Mindestens $k$“ wird als $1 - F(k)$ statt $1 - F(k - 1)$ gerechnet – der Wert $k$ selbst gehört dazu.
  - Bei $P(a \le X \le b)$ wird $F(b) - F(a)$ gerechnet; dann fehlt $P(X = a)$.
  - „Höchstens“ und „mindestens“ werden verwechselt; das farbige Markieren der Balken kann hier helfen.
  - $\sigma$ wird mit der Varianz $n \cdot p \cdot (1-p)$ verwechselt.
