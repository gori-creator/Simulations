---
description: "Interaktive Simulation für die 11. Klasse: Den Graphen einer Grundfunktion mit g(x) = a · f(b(x − c)) + d verschieben, strecken und spiegeln – Schritt für Schritt auf einer Zeitleiste, mit ziehbarem Anker- und Formpunkt, wandernden markanten Punkten, Punkttabelle und Eigenschaften für Parabel, Wurzel, Betrag, Hyperbel, Sinus und Exponentialfunktion."
---

## Worum geht es?

Aus dem Graphen einer **Grundfunktion** $f$ (zum Beispiel $x^2$, $\sqrt{x}$, $\frac{1}{x}$, $\sin x$ oder $2^x$) entsteht durch Verschieben, Strecken und Spiegeln der Graph von

$$
g(x) = a \cdot f\big(b\,(x - c)\big) + d .
$$

Man kann sich die Entstehung als **Folge von vier Schritten** vorstellen – genau so spielt die Zeitleiste sie ab:

| Schritt | Term | Wirkung auf den Graphen |
| --- | --- | --- |
| ① $b$ | $f(bx)$ | Streckung in $x$-Richtung mit dem Faktor $\frac{1}{b}$ (für $\lvert b\rvert > 1$ Stauchung); $b < 0$: zusätzlich Spiegelung an der $y$-Achse |
| ② $c$ | $f\big(b(x - c)\big)$ | Verschiebung um $c$ in $x$-Richtung ($c > 0$: nach **rechts**) |
| ③ $a$ | $a \cdot f\big(b(x - c)\big)$ | Streckung in $y$-Richtung mit dem Faktor $a$; $a < 0$: zusätzlich Spiegelung an der $x$-Achse |
| ④ $d$ | $\ldots + d$ | Verschiebung um $d$ in $y$-Richtung ($d > 0$: nach oben) |

Ein Punkt $(x \mid y)$ des Graphen von $f$ wird dabei zu

$$
\left(\frac{x}{b} + c \;\middle|\; a \cdot y + d\right).
$$

Beispiel: Bei $g(x) = 2\,(x - 1)^2 - 2$ ist $a = 2$, $b = 1$, $c = 1$, $d = -2$. Der Scheitel $(0 \mid 0)$ der Normalparabel wandert nach $S(1 \mid -2)$, der Punkt $(2 \mid 4)$ nach $(2 + 1 \mid 2 \cdot 4 - 2) = (3 \mid 6)$. Probe: $g(3) = 2 \cdot 4 - 2 = 6$. Die Nullstellen sind $0$ und $2$, und $g(0) = 0$.

**Warum zuerst $b$, dann $c$?** Steht im Inneren $f(bx - c)$, so wird die schon verschobene Kurve gestreckt – und die Verschiebung schrumpft mit. Man muss $b$ ausklammern: $f(2x - 1) = f\big(2(x - 0{,}5)\big)$. Der Scheitel von $(2x - 1)^2$ liegt bei $x = 0{,}5$, der von $\big(2(x - 1)\big)^2$ bei $x = 1$.

**Gut zu wissen:** Bei manchen Grundfunktionen lässt sich $b$ durch einen Faktor vor $f$ ersetzen, etwa $(2x)^2 = 4x^2$ oder $\frac{1}{2x} = \frac{0{,}5}{x}$. Beim Sinus geht das nicht: $\sin(2x)$ hat die halbe Periode, $2 \sin x$ die doppelte Amplitude.

## Ausprobieren

1. [Startbild](?f=sq&a=2&b=1&c=1&d=-2): Drücke „Schritt für Schritt abspielen“. Beobachte, wie der Graph nacheinander gestreckt, verschoben, gestreckt und verschoben wird. Halte an, gehe mit „Schritt zurück“ und „Schritt vor“ oder ziehe den Knopf der Zeitleiste.
2. Ziehe den runden **Ankerpunkt**: Er ist das Bild des Ursprungs, also $(c \mid d)$. Ziehe den rautenförmigen **Formpunkt**: Er ändert $a$ und $b$. Was passiert, wenn du ihn unter den Ankerpunkt oder links an ihm vorbei ziehst?
3. [Wurzelfunktion mit b = −1](?f=sqrt&a=1&b=-1&c=2&d=0): Spiele die Schrittfolge ab. Wie „klappt“ der Graph an der $y$-Achse um? Warum ist die Definitionsmenge jetzt $x \le 2$?
4. [Sinusfunktion](?f=sin&a=2&b=2&c=0&d=1): Lies Amplitude, Periode und Mittellinie ab. Verändere $b$ und beobachte die Periode $\frac{2\pi}{\lvert b\rvert}$.
5. [Hyperbel](?f=inv&a=2&b=1&c=-1&d=1) und [Exponentialfunktion](?f=exp&a=-1&b=1&c=1&d=3): Wie wandern die Asymptoten mit?
6. [Stolperstein Reihenfolge](?f=sq&a=1&b=2&c=1&d=0&ord=swap): Die Animation verschiebt zuerst und streckt dann. Vergleiche das Ergebnis $h$ mit dem richtigen $g$ (gestrichelt).
7. Stelle $a = 0$ ein. Was bleibt vom Graphen übrig?

## Aufgaben

### Aufgabe 1: Parameter ablesen

Der Graph entsteht aus der Betragsfunktion $f(x) = \lvert x\rvert$. Bestimme $a$, $c$ und $d$ (hier $b = 1$) und gib den Term an. [Aufgabe laden](?f=abs&a=-0.5&b=1&c=-2&d=3&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Der Knickpunkt liegt bei $(-2 \mid 3)$, also $c = -2$ und $d = 3$. Der Graph ist nach unten geöffnet und flacher als $\lvert x\rvert$: Geht man 2 nach rechts, sinkt er um 1, also $a = -0{,}5$. Damit $g(x) = -0{,}5 \cdot \lvert x + 2\rvert + 3$. [Lösung zeigen](?f=abs&a=-0.5&b=1&c=-2&d=3)

</details>

### Aufgabe 2: Ein Punkt wandert

Auf welchen Punkt wird der Punkt $(2 \mid 4)$ der Normalparabel bei $g(x) = 0{,}5 \cdot (x + 1)^2 + 3$ abgebildet?

<details>
<summary>Lösung anzeigen</summary>

$a = 0{,}5$, $b = 1$, $c = -1$, $d = 3$. Aus $(2 \mid 4)$ wird $(2 + (-1) \mid 0{,}5 \cdot 4 + 3) = (1 \mid 5)$. Probe: $g(1) = 0{,}5 \cdot 4 + 3 = 5$. [Zeigen](?f=sq&a=0.5&b=1&c=-1&d=3)

</details>

### Aufgabe 3: Achtung, Klammer!

Um wie viel ist der Graph von $g(x) = (2x - 4)^2$ gegenüber dem von $f(x) = (2x)^2$ verschoben?

<details>
<summary>Lösung anzeigen</summary>

$b = 2$ ausklammern: $g(x) = \big(2(x - 2)\big)^2$. Der Graph ist um $c = 2$ nach rechts verschoben – nicht um $4$. [Zeigen](?f=sq&a=1&b=2&c=2&d=0) Zum Vergleich die falsche Reihenfolge „erst um 4 verschieben, dann stauchen“: [Vergleich](?f=sq&a=1&b=2&c=4&d=0&ord=swap)

</details>

### Aufgabe 4: Eine Sinuskurve bauen

Gesucht ist $g(x) = a \cdot \sin(bx) + d$ mit Amplitude $2$, Periode $\pi$ und Mittellinie $y = 1$. Gib auch die Wertemenge an. [Aufgabe laden](?f=sin&a=1&b=1&c=0&d=0)

<details>
<summary>Lösung anzeigen</summary>

Amplitude $a = 2$, Periode $\frac{2\pi}{b} = \pi$, also $b = 2$, Mittellinie $d = 1$: $g(x) = 2\sin(2x) + 1$. Die Werte schwanken um $1$ jeweils um $2$: $W_g = [-1;\, 3]$. [Lösung zeigen](?f=sin&a=2&b=2&c=0&d=1)

</details>

### Aufgabe 5: Gespiegelte Wurzel

Schreibe $g(x) = \sqrt{2 - x}$ in der Form $\sqrt{b(x - c)}$. Gib die Definitionsmenge an und berechne $g(-2)$.

<details>
<summary>Lösung anzeigen</summary>

$2 - x = -(x - 2)$, also $b = -1$, $c = 2$: Die Wurzel wird an der $y$-Achse gespiegelt und um $2$ nach rechts verschoben. Unter der Wurzel darf nichts Negatives stehen: $2 - x \ge 0$, also $D_g = \,]-\infty;\, 2]$. $g(-2) = \sqrt{4} = 2$. [Zeigen](?f=sqrt&a=1&b=-1&c=2&d=0)

</details>

### Aufgabe 6: Asymptoten und Nullstellen

a) Gib für $g(x) = \frac{2}{x + 1} + 1$ die Asymptoten und die Nullstelle an. b) Bestimme für $h(x) = -2^{x - 1} + 3$ die Asymptote und die Nullstelle.

<details>
<summary>Lösung anzeigen</summary>

a) Die Asymptoten $x = 0$ und $y = 0$ von $\frac{1}{x}$ wandern mit $c = -1$ und $d = 1$: $x = -1$ und $y = 1$. Nullstelle: $\frac{2}{x + 1} = -1 \Rightarrow x + 1 = -2 \Rightarrow x = -3$. [Zeigen](?f=inv&a=2&b=1&c=-1&d=1)

b) Waagrechte Asymptote $y = 3$ (wegen $d = 3$). Nullstelle: $2^{x - 1} = 3 \Rightarrow x - 1 = \log_2 3 \Rightarrow x = 1 + \log_2 3 \approx 2{,}585$. [Zeigen](?f=exp&a=-1&b=1&c=1&d=3)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 11, Lernbereich „Spezielle Eigenschaften von Funktionen“ (LehrplanPLUS Gymnasium Bayern): Verschieben, Strecken und Spiegeln von Graphen, angewandt auf bekannte Funktionstypen. Welche Grundfunktionen dort im Einzelnen vorkommen, bitte am Lehrplan prüfen.
- **Schrittfolge an der Tafel:** Die Zeitleiste lässt sich nach jedem Schritt anhalten. So kann die Klasse vorher vermuten, wohin der Graph als Nächstes wandert, und die Vermutung dann prüfen.
- **Term erraten:** Mit „Term und Wirkung zeigen“ aus erscheint nur der Graph, die Regler für $a$, $b$, $c$ und $d$ sind dann ausgeblendet; „Neue Aufgabe“ würfelt neue, eindeutig ablesbare Werte, „Term aufdecken“ löst auf und spielt die Schrittfolge ab. Gut geeignet für Partnerarbeit.
- **Gleiche Logik, verschiedene Funktionen:** Dieselben vier Schritte wirken bei Parabel, Wurzel, Hyperbel, Sinus und Exponentialfunktion gleich. Vielleicht lohnt es sich, eine Transformation einzustellen und nur die Grundfunktion zu wechseln.
- **Modell:** Parameter in Zehnteln, $b = 0$ ist nicht erlaubt. Die gezeigte Schrittfolge ist eine mögliche Reihenfolge; andere Reihenfolgen führen zum Ziel, wenn man die Parameter entsprechend anpasst. Ist am Gerät „Bewegung reduzieren“ eingestellt, springt „Schritt für Schritt abspielen“ auf den ersten Schritt; weiter geht es mit „Schritt vor“.
- **Häufige Stolpersteine:**
  - „$f(x - 2)$ ist nach links verschoben.“ – Das Minus in der Klammer bedeutet eine Verschiebung nach **rechts**.
  - „$f(2x)$ ist in $x$-Richtung gestreckt.“ – Es ist gestaucht, mit dem Faktor $\frac{1}{2}$.
  - Bei $f(2x - 4)$ wird $b$ nicht ausgeklammert und die Verschiebung als $4$ statt $2$ abgelesen.
  - Die Spiegelungen werden verwechselt: $a < 0$ spiegelt an der $x$-Achse, $b < 0$ an der $y$-Achse.
  - Bei der Parabel wird erwartet, dass $b$ und $a$ eindeutig ablesbar sind – $(2x)^2 = 4x^2$ zeigt, dass das nicht so ist.
