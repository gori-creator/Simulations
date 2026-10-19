---
description: "Interaktive Simulation für Oberstufe und Studium: Taylorpolynome von sin x, cos x, eˣ, ln(1 + x) und 1/(1 − x) – Grad erhöhen, Entwicklungsstelle ziehen, Fehler an einer Prüfstelle messen und das Konvergenzintervall sehen."
---

## Worum geht es?

Viele Funktionen lassen sich in der Nähe einer Stelle $a$ gut durch **Polynome** annähern. Das **Taylorpolynom** $n$-ten Grades

$$T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}\,(x-a)^k$$

hat bei $x = a$ denselben Funktionswert und dieselben ersten $n$ Ableitungen wie $f$. $T_1$ ist die Tangente, $T_2$ die „Schmiegparabel“, und mit jedem weiteren Grad schmiegt sich das Polynom über einen größeren Bereich an den Graphen.

*Beispiele* (Entwicklung um $a = 0$):

- $\sin x \approx x - \frac{x^3}{6} + \frac{x^5}{120} - \ldots$
- $e^x \approx 1 + x + \frac{x^2}{2} + \frac{x^3}{6} + \ldots$
- $\frac{1}{1-x} \approx 1 + x + x^2 + x^3 + \ldots$ (geometrische Reihe)

**Wie gut ist die Näherung?** Der Fehler $f(x) - T_n(x)$ ist nahe bei $a$ winzig und wächst mit dem Abstand. Bei $\sin x$, $\cos x$ und $e^x$ wird er für jedes $x$ beliebig klein, wenn $n$ groß genug ist. Bei $\ln(1+x)$ und $\frac{1}{1-x}$ klappt das nur im **Konvergenzintervall** $|x - a| < r$; außerhalb wird der Fehler mit wachsendem $n$ sogar größer.

## Ausprobieren

1. [sin x um 0](?fn=sin&n=1&a=0&x=2): Drücke mehrmals „Grad erhöhen“. Warum ändert sich bei jedem zweiten Schritt nichts?
2. Drücke „Alle Grade durchlaufen“ und beobachte, wie weit sich die Näherung ausdehnt.
3. [eˣ](?fn=exp&n=4&a=0&x=1): Wie gut nähert $T_4(1)$ die Zahl $e$ an? Wie viele Summanden braucht man für sechs Nachkommastellen? (Fehlerdiagramm!)
4. [cos x um π](?fn=cos&n=2&a=3.1&x=2): Ziehe die Entwicklungsstelle. Was ist $T_2$ geometrisch?
5. [ln(1 + x)](?fn=ln&n=6&a=0&x=1.5): Ziehe die Prüfstelle aus dem grünen Bereich heraus. Was zeigt das Fehlerdiagramm?

## Aufgaben

### Aufgabe 1: e berechnen

Berechne $T_4(1)$ für $f(x) = e^x$ und $a = 0$. Wie groß ist der Fehler? [Aufgabe laden](?fn=exp&n=4&a=0&x=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T_4(1) = 1 + 1 + \frac{1}{2} + \frac{1}{6} + \frac{1}{24} = \frac{65}{24} \approx 2{,}7083$; Fehler $e - 2{,}7083 \approx 0{,}0099$. [Lösung zeigen](?fn=exp&n=4&a=0&x=1)

</details>

### Aufgabe 2: Taylorpolynom aufstellen

Bestimme $T_3$ von $f(x) = \sin x$ an der Stelle $a = 0$ und berechne damit $\sin 0{,}5$ näherungsweise. [Aufgabe laden](?fn=sin&n=3&a=0&x=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f(0) = 0$, $f'(0) = 1$, $f''(0) = 0$, $f'''(0) = -1$, also $T_3(x) = x - \frac{x^3}{6}$. $T_3(0{,}5) = 0{,}5 - \frac{0{,}125}{6} \approx 0{,}47917$; genau: $\sin 0{,}5 \approx 0{,}47943$. [Lösung zeigen](?fn=sin&n=3&a=0&x=0.5)

</details>

### Aufgabe 3: Geometrische Reihe

Begründe, dass alle Koeffizienten des Taylorpolynoms von $\frac{1}{1-x}$ um $0$ gleich $1$ sind. Für welche $x$ konvergiert die Reihe? [Zeigen](?fn=geo&n=5&a=0&x=0.5)

<details>
<summary>Lösung anzeigen</summary>

$f^{(k)}(x) = \frac{k!}{(1-x)^{k+1}}$, also $f^{(k)}(0) = k!$ und $\frac{f^{(k)}(0)}{k!} = 1$. Die Reihe $1 + x + x^2 + \ldots$ konvergiert für $|x| < 1$.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Vertiefung in Jahrgangsstufe 13 (z. B. Seminar, Begabtenförderung) und Analysis im ersten Studienjahr. Gut als Verallgemeinerung der Tangente.
- **Taschenrechner-Frage:** „Wie berechnet ein Rechner $\sin 0{,}5$?“ – als Einstieg in Näherungspolynome.
- **Häufige Stolpersteine:**
  - Die Fakultät im Nenner wird vergessen.
  - Bei $a \neq 0$ wird $x^k$ statt $(x-a)^k$ geschrieben.
  - Man erwartet, dass mehr Summanden immer helfen – das gilt nur im Konvergenzintervall.
