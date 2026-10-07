---
description: Interaktives Galtonbrett – Kugeln fallen durch Nagelreihen und bilden die Binomialverteilung, mit Pascal'schem Dreieck, Erwartungswert und Glockenkurve.
---

## Worum geht es?

Auf einem **Galtonbrett** fallen Kugeln durch $n$ Reihen von Nägeln. An jedem Nagel springt eine Kugel mit der Wahrscheinlichkeit $p$ nach **rechts** und mit $1 - p$ nach **links**. Am Ende landet sie in einem der Fächer $0, 1, \ldots, n$ – die Fachnummer $k$ ist genau die **Anzahl der Rechts-Sprünge**.

Jeder Nagel ist ein **Bernoulli-Versuch**, der ganze Weg eine **Bernoulli-Kette** der Länge $n$. Die Anzahl $X$ der Rechts-Sprünge ist **binomialverteilt**:

$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n - k}
$$

- $\binom{n}{k}$ zählt die **Wege** zum Fach $k$. Diese Zahlen bilden das **Pascal'sche Dreieck**: Die Anzahl der Wege zu einem Nagel ist die Summe der Wege zu den beiden Nägeln darüber.
- $p^k \cdot (1 - p)^{n - k}$ ist die Wahrscheinlichkeit für **einen** solchen Weg.

**Erwartungswert und Standardabweichung:**

$$
\mu = n \cdot p \qquad \sigma = \sqrt{n \cdot p \cdot (1 - p)}
$$

Bei vielen Reihen nähert sich die Form der Verteilung einer **Glockenkurve** (Normalverteilung). Als Faustregel gilt die Näherung als gut, wenn $\sigma > 3$ ist (Laplace-Bedingung).

## Ausprobieren

1. Lass einzelne Kugeln fallen und verfolge ihren Weg. Wie hängt das Fach mit der Folge aus L und R zusammen?
2. Blende das Pascal'sche Dreieck ein. Warum landen in der Mitte mehr Kugeln? [Pascal'sches Dreieck](?n=6&pascal=1&binomial=1)
3. Stelle $p = 0{,}7$ ein. Wohin verschiebt sich die Verteilung? [Schief](?p=0.7&binomial=1)
4. Wirf mit 16 Reihen **1000 sofort** und vergleiche mit der Glockenkurve. [16 Reihen](?n=16&normal=1&binomial=1&rate=40)

## Aufgaben

### Aufgabe 1: Wahrscheinlichkeit für ein Fach

Ein Galtonbrett hat $n = 4$ Reihen, $p = 0{,}5$. Mit welcher Wahrscheinlichkeit landet eine Kugel in Fach 2?

<details>
<summary>Lösung anzeigen</summary>

$$P(X = 2) = \binom{4}{2} \cdot 0{,}5^2 \cdot 0{,}5^2 = \frac{6}{16} = 37{,}5\,\%$$

Es gibt 6 Wege mit genau zwei Rechts-Sprüngen (z. B. RRLL, RLRL, …). [In der Simulation zeigen](?n=4&pascal=1&binomial=1)

</details>

### Aufgabe 2: Wege zählen

Wie viele Wege führen bei $n = 6$ Reihen in Fach 3? Lies im Pascal'schen Dreieck ab und rechne nach.

<details>
<summary>Lösung anzeigen</summary>

$$\binom{6}{3} = \frac{6 \cdot 5 \cdot 4}{3 \cdot 2 \cdot 1} = 20$$

In der untersten Nagelreihe stehen 1, 5, 10, 10, 5, 1 – Fach 3 wird von den beiden mittleren Nägeln erreicht: $10 + 10 = 20$. [In der Simulation zeigen](?n=6&pascal=1)

</details>

### Aufgabe 3: Erwartungswert und Streuung

Berechne $\mu$ und $\sigma$ für $n = 10$ und $p = 0{,}7$. Prüfe mit 1000 Kugeln.

<details>
<summary>Lösung anzeigen</summary>

$\mu = 10 \cdot 0{,}7 = 7$, $\sigma = \sqrt{10 \cdot 0{,}7 \cdot 0{,}3} = \sqrt{2{,}1} \approx 1{,}45$. Der Mittelwert der 1000 Kugeln liegt meist sehr nahe bei 7. [In der Simulation zeigen](?n=10&p=0.7&binomial=1)

</details>

### Aufgabe 4: Symmetrie

Warum ist die Verteilung für $p = 0{,}5$ symmetrisch, für $p = 0{,}7$ aber nicht? Wie hängen die Verteilungen für $p = 0{,}3$ und $p = 0{,}7$ zusammen?

<details>
<summary>Lösung anzeigen</summary>

Für $p = 0{,}5$ ist jeder Weg gleich wahrscheinlich, und es gibt zu Fach $k$ genauso viele Wege wie zu Fach $n - k$: $\binom{n}{k} = \binom{n}{n-k}$. Für $p = 0{,}7$ sind Wege mit vielen R wahrscheinlicher. Vertauscht man links und rechts, wird aus $p = 0{,}3$ die Verteilung für $p = 0{,}7$ – sie sind spiegelbildlich: $P_{0{,}3}(X = k) = P_{0{,}7}(X = n - k)$.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 12 (Bernoulli-Ketten, Binomialverteilung); qualitativ auch früher bei mehrstufigen Zufallsexperimenten. Die Glockenkurve leitet zur Normalverteilung über.
- **Darstellung:** Solange es passt, werden die Kugeln einzeln gestapelt; bei vielen Kugeln werden die Fächer als Säulen dargestellt. Die roten Markierungen zeigen die erwartete Anzahl $N \cdot P(X = k)$ bei $N$ Kugeln.
- **Bilder:** Holzbrett und Kugeln werden gezeichnet; optional können Fotos ergänzt werden (siehe `docs/BILDER.md`).
- **Typische Fehlvorstellungen:**
  - „Die Kugel wird zur Mitte gelenkt.“ – Es gibt nur mehr Wege dorthin.
  - Fachnummer und Weg werden verwechselt: Viele verschiedene Wege führen ins gleiche Fach.
  - Die Glockenkurve ist eine Näherung für große $n$ – für kleine $n$ oder $p$ nahe 0 oder 1 passt sie schlecht.
