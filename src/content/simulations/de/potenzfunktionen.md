---
description: "Interaktive Simulation zu Potenzfunktionen f(x) = a · xⁿ mit ganzzahligem Exponenten: Graphen verwandeln sich weich, Symmetrie, Steckbrief, Familien mit gemeinsamen Punkten und der Vergleich zweier Potenzfunktionen."
---

## Worum geht es?

Eine **Potenzfunktion** hat die Form

$$
f(x) = a \cdot x^n \qquad (a \neq 0,\; n \text{ ganzzahlig})
$$

Der **Exponent** $n$ bestimmt die Form des Graphen, der **Streckfaktor** $a$ streckt ($|a| > 1$) oder staucht ($|a| < 1$) ihn in $y$-Richtung; für $a < 0$ wird er zusätzlich an der $x$-Achse gespiegelt. Der Punkt $Q(1 \mid a)$ liegt immer auf dem Graphen, denn $1^n = 1$.

Je nach $n$ unterscheidet man vier Klassen (in der Simulation farbig):

| Exponent | Graph (für $a = 1$) | Symmetrie | $D$ | $W$ |
| --- | --- | --- | --- | --- |
| $n$ gerade, $n > 0$ | Parabel $n$-ter Ordnung, beide Äste oben | zur $y$-Achse | $\mathbb{R}$ | $\mathbb{R}_0^+$ |
| $n$ ungerade, $n > 0$ | Parabel $n$-ter Ordnung, von links unten nach rechts oben | zum Ursprung | $\mathbb{R}$ | $\mathbb{R}$ |
| $n$ gerade, $n < 0$ | Hyperbel, beide Äste oben | zur $y$-Achse | $\mathbb{R} \setminus \{0\}$ | $\mathbb{R}^+$ |
| $n$ ungerade, $n < 0$ | Hyperbel, Äste im I. und III. Quadranten | zum Ursprung | $\mathbb{R} \setminus \{0\}$ | $\mathbb{R} \setminus \{0\}$ |

- **Symmetrie:** Für gerades $n$ gilt $f(-x) = f(x)$, der Graph ist **achsensymmetrisch zur $y$-Achse**. Für ungerades $n$ gilt $f(-x) = -f(x)$, der Graph ist **punktsymmetrisch zum Ursprung**.
- **Negative Exponenten:** $x^{-n} = \frac{1}{x^n}$. Bei $x = 0$ ist die Funktion nicht definiert (**Polstelle**); die Achsen $x = 0$ und $y = 0$ sind **Asymptoten**.
- **Sonderfälle:** $n = 1$ ergibt die Ursprungsgerade $y = a \cdot x$. Für $n = 0$ ist $x^0 = 1$ (für $x \neq 0$), also $f(x) = a$: eine Parallele zur $x$-Achse. Den Ausdruck $0^0$ betrachten wir hier nicht – die Simulation nimmt die Stelle $0$ aus der Definitionsmenge heraus (hohler Punkt).
- **Gemeinsame Punkte:** Alle Graphen von $y = x^n$ gehen durch $(1 \mid 1)$. Bei geradem $n$ gehen sie durch $(-1 \mid 1)$, bei ungeradem durch $(-1 \mid -1)$, und für $n > 0$ durch den Ursprung.
- **Zwischen $-1$ und $1$** gilt: Je größer der (positive) Exponent, desto flacher der Graph, z. B. $0{,}5^4 = 0{,}0625 < 0{,}5^2 = 0{,}25$. Außerhalb ist es umgekehrt.

## Ausprobieren

1. Bewege den Regler für $n$ langsam von $-4$ bis $6$ oder klicke auf **Alle Exponenten durchlaufen**. Der Graph verwandelt sich weich. Bei welchen $n$ ändert sich die Farbe (die Klasse)?
2. Klicke bei $n = 3$ auf **Symmetrie zeigen**: Der rechte Teil wird um $180°$ um den Ursprung gedreht. Probiere dasselbe bei $n = 4$. [Beispiel laden](?n=3&x=1.2)
3. Ziehe den Punkt $Q(1 \mid a)$ nach oben und unten. Was passiert für $a < 0$ mit Wertemenge und Monotonie? [Beispiel laden](?n=2&a=-0.5)
4. Ziehe $P$ am Graphen entlang und vergleiche die Rechnung unten im Bild mit der Wertetabelle.
5. Wähle die Ansicht **Familie** und tippe auf die einzelnen Exponenten. Welche Punkte bleiben immer gleich? [Gerade Exponenten](?view=family&n=4) · [Ungerade Exponenten](?view=family&n=3)
6. Vergleiche $x$ und $x^3$ und lass die senkrechte Linie mit **Vergleich von links nach rechts** durchfahren. Wo liegt $x^3$ oberhalb von $x$? [Beispiel laden](?view=compare&n=1&m=3)
7. Stelle $n = -1$ und $n = -2$ ein. Wie verhalten sich die Funktionswerte nahe $0$ links und rechts? [Beispiel laden](?n=-1&x=0.5)

## Aufgaben

### Aufgabe 1: Punktprobe

Liegen die Punkte $A(-2 \mid -4)$ und $B(3 \mid 13)$ auf dem Graphen von $f(x) = 0{,}5 \cdot x^3$?

<details>
<summary>Lösung anzeigen</summary>

$f(-2) = 0{,}5 \cdot (-2)^3 = 0{,}5 \cdot (-8) = -4$, also liegt $A$ auf dem Graphen. $f(3) = 0{,}5 \cdot 27 = 13{,}5 \neq 13$, also liegt $B$ nicht darauf. [In der Simulation zeigen](?n=3&a=0.5&x=-2)

</details>

### Aufgabe 2: Streckfaktor bestimmen

Der Graph von $f(x) = a \cdot x^4$ geht durch den Punkt $(2 \mid 8)$. Bestimme $a$ und gib die Wertemenge an. [Aufgabe laden](?n=4&a=0.5&x=2&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$a \cdot 2^4 = 8 \Rightarrow 16a = 8 \Rightarrow a = 0{,}5$. Weil $n$ gerade und $a > 0$ ist, gilt $W = \mathbb{R}_0^+$. [In der Simulation zeigen](?n=4&a=0.5&x=2)

</details>

### Aufgabe 3: Steckbrief

Erstelle einen Steckbrief für $f(x) = -2 \cdot x^{-3}$: Definitionsmenge, Wertemenge, Symmetrie, Monotonie, Verhalten für $x \to \pm\infty$ und nahe $0$. Berechne $f(1)$ und $f(-1)$.

<details>
<summary>Lösung anzeigen</summary>

$D = W = \mathbb{R} \setminus \{0\}$, punktsymmetrisch zum Ursprung ($n$ ungerade). Wegen $a < 0$ ist der Graph der Hyperbel $\frac{1}{x^3}$ an der $x$-Achse gespiegelt: Die Äste liegen im II. und IV. Quadranten, $f$ ist **steigend** für $x < 0$ und für $x > 0$. Für $x \to \pm\infty$ gilt $f(x) \to 0$; links von $0$ gilt $f(x) \to +\infty$, rechts $f(x) \to -\infty$. Asymptoten $x = 0$ und $y = 0$. $f(1) = -2$, $f(-1) = -2 \cdot \frac{1}{-1} = 2$. [In der Simulation zeigen](?n=-3&a=-2&x=1)

</details>

### Aufgabe 4: Wer ist größer?

Für welche $x$ gilt $x^4 < x^2$? Begründe mit einem Zahlenbeispiel.

<details>
<summary>Lösung anzeigen</summary>

Die Graphen schneiden sich bei $x = -1$, $0$ und $1$. Für $0 < |x| < 1$ gilt $x^4 < x^2$, z. B. $0{,}5^4 = 0{,}0625 < 0{,}25 = 0{,}5^2$. Für $|x| > 1$ ist es umgekehrt, z. B. $2^4 = 16 > 4$. [In der Simulation zeigen](?view=compare&n=2&m=4)

</details>

### Aufgabe 5: Gemeinsame Punkte

Welche Punkte haben alle Graphen von $y = x^n$ mit ungeradem $n > 0$ gemeinsam? Welcher fällt weg, wenn man auch $n = -1$ und $n = -3$ zulässt?

<details>
<summary>Lösung anzeigen</summary>

$(-1 \mid -1)$, $(0 \mid 0)$ und $(1 \mid 1)$, denn $(-1)^n = -1$, $0^n = 0$ und $1^n = 1$. Für negative $n$ ist $0$ nicht in der Definitionsmenge, also fällt der Ursprung weg. [In der Simulation zeigen](?view=family&n=3)

</details>

### Aufgabe 6: Graph erkennen

Ein Graph von $f(x) = x^n$ liegt vollständig oberhalb der $x$-Achse, ist achsensymmetrisch zur $y$-Achse und hat bei $x = 0$ eine Polstelle. Was weißt du über $n$? Gib ein Beispiel an.

<details>
<summary>Lösung anzeigen</summary>

$n$ ist gerade und negativ, z. B. $n = -2$: $f(x) = \frac{1}{x^2}$ mit $W = \mathbb{R}^+$. [In der Simulation zeigen](?n=-2&x=0.5)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 9, Lernbereich „Potenzfunktionen mit natürlichen Exponenten und Erweiterung des Potenzbegriffs“, und Jahrgangsstufe 10, „Ganzrationale Funktionen“ (LehrplanPLUS Bayern, Gymnasium). Die negativen Exponenten knüpfen an die Hyperbel $y = \frac{1}{x}$ aus Jahrgangsstufe 8 an; ob und in welchem Umfang sie im Unterricht vorkommen, bitte am Lehrplan prüfen.
- **Entdeckend:** Die Familien-Ansicht eignet sich zum Sammeln von Vermutungen („Was haben alle gemeinsam?“), die anschließend mit $1^n$, $(-1)^n$ und $0^n$ begründet werden.
- **Symmetrie begründen:** Die Animation zeigt, *was* Achsen- und Punktsymmetrie bedeuten; die Begründung $(-x)^n = x^n$ bzw. $(-x)^n = -x^n$ kann daran anschließen.
- **Häufige Stolpersteine:**
  - „$x^4$ ist immer größer als $x^2$.“ – Nur für $|x| > 1$; zwischen $-1$ und $1$ ist es umgekehrt.
  - $x^{-2}$ wird als $-x^2$ gelesen. – Richtig ist $x^{-2} = \frac{1}{x^2} > 0$.
  - Bei $n = 0$ wird $0^0$ einfach als $1$ gesetzt. – Die Simulation lässt die Stelle $0$ bewusst weg; hier lohnt ein kurzes Gespräch.
  - Monotonie bei ungeradem negativem $n$: $\frac{1}{x}$ ist auf beiden Teilen fallend, aber **nicht** auf ganz $D$ (z. B. $f(-1) = -1 < f(1) = 1$).
- **Aufgabenmodus:** Mit `info=0` und **Teilen → Ergebnisse verdecken** werden Steckbrief, Wertetabelle und Rechnung durch „?“ ersetzt; der Graph bleibt sichtbar.
