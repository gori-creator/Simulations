---
description: "Interaktive Simulation für die 11. Klasse: Den Graphen einer Grundfunktion mit g(x) = a · f(b(x − c)) + d verschieben, strecken und spiegeln – mit ziehbaren Punkten, wandernden markanten Punkten und einer Schritt-für-Schritt-Animation für Parabel, Wurzel, Hyperbel, Sinus und Exponentialfunktion."
---

## Worum geht es?

Aus dem Graphen einer **Grundfunktion** $f$ entsteht durch Verschieben, Strecken und Spiegeln der Graph von

$$
g(x) = a \cdot f\big(b\,(x - c)\big) + d
$$

Jeder Parameter hat eine eigene Wirkung:

| Parameter | Wirkung auf den Graphen |
| --- | --- |
| $a$ | Streckung in $y$-Richtung mit dem Faktor $a$ (für $\lvert a\rvert < 1$ Stauchung); $a < 0$: zusätzlich Spiegelung an der $x$-Achse |
| $b$ | Streckung in $x$-Richtung mit dem Faktor $\frac{1}{b}$ (für $\lvert b\rvert > 1$ Stauchung); $b < 0$: zusätzlich Spiegelung an der $y$-Achse |
| $c$ | Verschiebung um $c$ in $x$-Richtung ($c > 0$: nach rechts) |
| $d$ | Verschiebung um $d$ in $y$-Richtung ($d > 0$: nach oben) |

Achtung bei den Parametern **im Inneren** der Funktion: $f(x - 2)$ ist um $2$ nach **rechts** verschoben, und $f(2x)$ ist in $x$-Richtung **gestaucht**. Ein Punkt $(x \mid y)$ des Graphen von $f$ wird zu

$$
\left(\frac{x}{b} + c \;\middle|\; a \cdot y + d\right)
$$

Man kann sich die Entstehung als Folge vorstellen: erst $b$ (Streckung in $x$-Richtung), dann $c$ (Verschiebung in $x$-Richtung), dann $a$ (Streckung in $y$-Richtung), zuletzt $d$ (Verschiebung in $y$-Richtung).

## Ausprobieren

1. Ziehe den grünen Punkt am Graphen: Er verschiebt (ändert $c$ und $d$). Der rote Punkt streckt (ändert $a$ und $b$). Beobachte die Pfeile von den Punkten der Grundfunktion zu ihren Bildpunkten.
2. Starte „Schritt für Schritt“ und verfolge, wie aus $f$ nacheinander $g$ entsteht.
3. [Spiegeln an der $x$-Achse](?a=-1&b=1&c=0&d=0): Was ändert sich am Term, was am Graphen?
4. [Wurzelfunktion](?f=sqrt&a=1&b=-1&c=2&d=0): Warum wird der Graph an der $y$-Achse gespiegelt, obwohl $a = 1$ ist?
5. [Sinusfunktion](?f=sin&a=2&b=2&c=0&d=1): Lies Amplitude und Periode ab. Wie hängt die Periode mit $b$ zusammen?
6. [Hyperbel](?f=inv&a=2&b=1&c=-1&d=1) und [Exponentialfunktion](?f=exp&a=-1&b=1&c=1&d=3): Wie wandern die Asymptoten?

## Aufgaben

### Aufgabe 1: Parameter ablesen

Der Graph entsteht aus der Normalparabel. Bestimme $a$, $c$ und $d$ und gib den Term an. [Aufgabe laden](?a=-1&b=1&c=-3&d=4&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Parabel ist nach unten geöffnet und nicht gestreckt: $a = -1$. Der Scheitel liegt bei $S(-3 \mid 4)$, also $c = -3$ und $d = 4$: $g(x) = -(x + 3)^2 + 4$. [Lösung zeigen](?a=-1&b=1&c=-3&d=4)

</details>

### Aufgabe 2: Ein Punkt wandert

Auf welchen Punkt wird der Punkt $(2 \mid 4)$ der Normalparabel bei $g(x) = 0{,}5 \cdot (x + 1)^2 + 3$ abgebildet?

<details>
<summary>Lösung anzeigen</summary>

Hier ist $a = 0{,}5$, $b = 1$, $c = -1$, $d = 3$. Aus $(2 \mid 4)$ wird $(2 + (-1) \mid 0{,}5 \cdot 4 + 3) = (1 \mid 5)$. Probe: $g(1) = 0{,}5 \cdot 4 + 3 = 5$. ✓ [Zeigen](?a=0.5&b=1&c=-1&d=3)

</details>

### Aufgabe 3: Achtung, Klammer!

Um wie viel ist der Graph von $g(x) = (2x - 4)^2$ gegenüber dem von $f(x) = (2x)^2$ verschoben?

<details>
<summary>Lösung anzeigen</summary>

Man klammert $b = 2$ aus: $g(x) = \big(2\,(x - 2)\big)^2$. Der Graph ist um $c = 2$ nach rechts verschoben – nicht um $4$. [Zeigen](?a=1&b=2&c=2&d=0)

</details>

### Aufgabe 4: Eine Sinuskurve

Gesucht ist eine Funktion $g(x) = a \cdot \sin(b x) + d$ mit Amplitude $2$, Periode $\pi$ und Mittellinie $y = 1$. [Aufgabe laden](?f=sin&a=1&b=1&c=0&d=0)

<details>
<summary>Lösung anzeigen</summary>

Amplitude $a = 2$, Periode $\frac{2\pi}{b} = \pi$, also $b = 2$, Mittellinie $d = 1$: $g(x) = 2\sin(2x) + 1$. [Lösung zeigen](?f=sin&a=2&b=2&c=0&d=1)

</details>

### Aufgabe 5: Asymptoten

Gib die Asymptoten von $g(x) = \frac{2}{x + 1} + 1$ an.

<details>
<summary>Lösung anzeigen</summary>

Die Kehrwertfunktion hat die Asymptoten $x = 0$ und $y = 0$. Verschoben um $c = -1$ und $d = 1$: senkrechte Asymptote $x = -1$, waagrechte Asymptote $y = 1$. [Zeigen](?f=inv&a=2&b=1&c=-1&d=1)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 11, Lernbereich „Spezielle Eigenschaften von Funktionen“ (LehrplanPLUS Gymnasium Bayern): Verschieben, Strecken und Spiegeln von Graphen; Wiederholung bekannter Funktionstypen. Die gleiche Logik für verschiedene Grundfunktionen zeigt, dass die Wirkung der Parameter nicht vom Funktionstyp abhängt.
- **Spiel:** Eine Person stellt mit „Term und Wirkung zeigen“ aus einen Graphen ein, die andere bestimmt die Parameter.
- **Modell:** Alle Parameter in Zehnteln; $b = 0$ ist nicht erlaubt. Die Schrittfolge zeigt eine mögliche Reihenfolge der Abbildungen.
- **Häufige Stolpersteine:**
  - „$f(x - 2)$ ist nach links verschoben.“ – Das Minuszeichen in der Klammer bedeutet eine Verschiebung nach **rechts**.
  - „$f(2x)$ ist in $x$-Richtung gestreckt.“ – Es ist gestaucht, mit dem Faktor $\frac{1}{2}$.
  - Bei $f(2x - 4)$ wird $b$ nicht ausgeklammert.
  - Das Vorzeichen von $a$ und das von $b$ werden verwechselt (Spiegelung an der $x$- bzw. $y$-Achse).
