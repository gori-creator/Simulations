---
description: "Interaktive Simulation für Oberstufe und Studium: Taylorpolynome von sin x, cos x, eˣ, ln(1 + x) und 1/(1 − x) – Summand für Summand aufbauen, Entwicklungsstelle ziehen, Fehler und Lagrange-Abschätzung vergleichen, ε-Schlauch und Konvergenzintervall sehen."
---

## Worum geht es?

Viele Funktionen lassen sich in der Nähe einer Stelle $a$ gut durch **Polynome** annähern. Das **Taylorpolynom** $n$-ten Grades

$$T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}\,(x-a)^k$$

hat bei $x = a$ denselben Funktionswert und dieselben ersten $n$ Ableitungen wie $f$. $T_1$ ist die Tangente, $T_2$ die „Schmiegparabel“, und mit jedem weiteren Grad schmiegt sich das Polynom über einen größeren Bereich an den Graphen.

**Woher kommen die Koeffizienten?** Leitet man $(x-a)^k$ $k$-mal ab, entsteht $k!$. Damit $T_n^{(k)}(a) = f^{(k)}(a)$ gilt, muss der Koeffizient $c_k = \frac{f^{(k)}(a)}{k!}$ sein. Die Ansicht **Summanden** zeigt das als Tabelle: Ableitungswert, Fakultät, Koeffizient – und im Bild, wie jeder neue Summand $c_n(x-a)^n$ die vorige Näherung korrigiert.

*Beispiele* (Entwicklung um $a = 0$):

- $\sin x \approx x - \frac{x^3}{6} + \frac{x^5}{120} - \ldots$
- $\cos x \approx 1 - \frac{x^2}{2} + \frac{x^4}{24} - \ldots$
- $e^x \approx 1 + x + \frac{x^2}{2} + \frac{x^3}{6} + \ldots$
- $\frac{1}{1-x} \approx 1 + x + x^2 + x^3 + \ldots$ (geometrische Reihe)

**Wie gut ist die Näherung?** Der Fehler $R_n(x) = f(x) - T_n(x)$ ist nahe bei $a$ winzig und wächst mit dem Abstand. Für sin, cos und $e^x$ gibt die **Lagrange-Abschätzung** eine Schranke:

$$|R_n(x)| \le M \cdot \frac{|x-a|^{n+1}}{(n+1)!},$$

wobei $M$ eine Schranke für $|f^{(n+1)}|$ zwischen $a$ und $x$ ist ($M = 1$ bei sin und cos, $M = e^{\max(a,x)}$ bei $e^x$). Die Ansicht **ε-Schlauch** dreht die Frage um: In welchem Bereich weicht $T_n$ um weniger als $\varepsilon$ von $f$ ab? Bei sin, cos und $e^x$ wird dieser Bereich mit wachsendem $n$ immer breiter. Bei $\ln(1+x)$ und $\frac{1}{1-x}$ bleibt er für großes $n$ im **Konvergenzintervall** $|x - a| < r$ – außerhalb wird der Fehler mit wachsendem $n$ sogar größer.

## Ausprobieren

1. [sin x um 0](?fn=sin&n=1&a=0&x=2): Drücke mehrmals „Grad erhöhen“. Warum ändert sich bei jedem zweiten Schritt nichts?
2. [Summand für Summand](?view=terms&fn=sin&n=1&a=0): Erhöhe den Grad bis 7 und beobachte den gestrichelten neuen Summanden. Welche Zeilen der Tabelle sind 0 – und warum?
3. [eˣ](?fn=exp&n=4&a=0&x=1): Wie gut nähert $T_4(1)$ die Zahl $e$ an? Vergleiche den wahren Fehler mit der Lagrange-Abschätzung. Wie viele Summanden braucht man für sechs Nachkommastellen? (Fehlerdiagramm!)
4. [cos x um π](?fn=cos&n=2&a=3.1&x=2): Ziehe die Entwicklungsstelle. Was ist $T_2$ geometrisch?
5. [ε-Schlauch bei eˣ](?view=band&fn=exp&n=4&a=0&eps=0.01): Lass „Alle Grade durchlaufen“. Warum ist der Bereich nicht symmetrisch um $a$?
6. [ε-Schlauch bei ln(1 + x)](?view=band&fn=ln&n=3&a=0&eps=0.1): Erhöhe den Grad. Ab wann wächst der Bereich kaum noch? Vergleiche mit der gestrichelten Linie (Konvergenzintervall).
7. [ln(1 + x)](?fn=ln&n=6&a=0&x=1.5): Ziehe die Prüfstelle aus dem grünen Bereich heraus. Was zeigt das Fehlerdiagramm?

## Aufgaben

### Aufgabe 1: e berechnen

Berechne $T_4(1)$ für $f(x) = e^x$ und $a = 0$. Wie groß ist der Fehler, und was sagt die Lagrange-Abschätzung? [Aufgabe laden](?fn=exp&n=4&a=0&x=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T_4(1) = 1 + 1 + \frac{1}{2} + \frac{1}{6} + \frac{1}{24} = \frac{65}{24} \approx 2{,}7083$; Fehler $e - 2{,}7083 \approx 0{,}0099$. Lagrange mit $M = e^1$: $|R_4(1)| \le \frac{e}{5!} = \frac{e}{120} \approx 0{,}0227$ – die Schranke stimmt, ist aber etwa doppelt so groß wie der wahre Fehler. [Lösung zeigen](?fn=exp&n=4&a=0&x=1)

</details>

### Aufgabe 2: Taylorpolynom aufstellen

Bestimme $T_3$ von $f(x) = \sin x$ an der Stelle $a = 0$ und berechne damit $\sin 0{,}5$ näherungsweise. Schätze den Fehler mit Lagrange ab. [Aufgabe laden](?fn=sin&n=3&a=0&x=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f(0) = 0$, $f'(0) = 1$, $f''(0) = 0$, $f'''(0) = -1$, also $T_3(x) = x - \frac{x^3}{6}$. $T_3(0{,}5) = 0{,}5 - \frac{0{,}125}{6} \approx 0{,}47917$; genau: $\sin 0{,}5 \approx 0{,}47943$. Lagrange: $|R_3(0{,}5)| \le \frac{0{,}5^4}{4!} \approx 0{,}0026$. (Weil $T_3 = T_4$ ist, gilt sogar $\le \frac{0{,}5^5}{5!} \approx 0{,}00026$.) [Lösung zeigen](?fn=sin&n=3&a=0&x=0.5)

</details>

### Aufgabe 3: Koeffizienten aus der Tabelle

Stelle $T_4$ von $f(x) = \cos x$ um $a = 0$ auf, indem du die Tabelle $k$ | $f^{(k)}(0)$ | $k!$ | $c_k$ selbst ausfüllst. [Aufgabe laden](?view=terms&fn=cos&n=4&a=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ableitungen: $\cos, -\sin, -\cos, \sin, \cos$, bei $0$ also $1, 0, -1, 0, 1$. Koeffizienten: $1, 0, -\frac{1}{2}, 0, \frac{1}{24}$, also $T_4(x) = 1 - \frac{x^2}{2} + \frac{x^4}{24}$. [Lösung zeigen](?view=terms&fn=cos&n=4&a=0)

</details>

### Aufgabe 4: Wie weit reicht „sin x ≈ x“?

Für welche $x$ weicht $\sin x$ um weniger als $0{,}01$ von $x$ ab? Schätze zuerst mit dem nächsten Summanden $\frac{x^3}{6}$ und prüfe dann im ε-Schlauch. [Aufgabe laden](?fn=sin&n=1&a=0&x=0.4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Schätzung: $\frac{|x|^3}{6} < 0{,}01 \Rightarrow |x| < \sqrt[3]{0{,}06} \approx 0{,}39$. Die Simulation zeigt $-0{,}39 < x < 0{,}39$ (genauer $|x| < 0{,}3925$). Im Gradmaß sind das etwa $22{,}5°$. [Lösung zeigen](?view=band&fn=sin&n=1&a=0&eps=0.01)

</details>

### Aufgabe 5: Geometrische Reihe

Begründe, dass alle Koeffizienten des Taylorpolynoms von $\frac{1}{1-x}$ um $0$ gleich $1$ sind. Für welche $x$ konvergiert die Reihe? [Zeigen](?fn=geo&n=5&a=0&x=0.5)

<details>
<summary>Lösung anzeigen</summary>

$f^{(k)}(x) = \frac{k!}{(1-x)^{k+1}}$, also $f^{(k)}(0) = k!$ und $\frac{f^{(k)}(0)}{k!} = 1$. Die Reihe $1 + x + x^2 + \ldots$ konvergiert für $|x| < 1$. Im [ε-Schlauch](?view=band&fn=geo&n=15&a=0&eps=0.01) sieht man: Auch bei Grad 15 bleibt der Bereich zwischen $-1$ und $1$.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Vertiefung in Jahrgangsstufe 13 (z. B. Seminar, Begabtenförderung) und Analysis im ersten Studienjahr. Gut als Verallgemeinerung der Tangente; der Lehrplanbezug ist je nach Land und Kurs verschieden – bitte am Lehrplan prüfen.
- **Taschenrechner-Frage:** „Wie berechnet ein Rechner $\sin 0{,}5$?“ – als Einstieg in Näherungspolynome.
- **Drei Ansichten, drei Fragen:** *Näherung* (Wie groß ist der Fehler an einer Stelle?), *Summanden* (Woher kommen die Koeffizienten?), *ε-Schlauch* (Wo ist die Näherung gut genug?).
- **Physik-Bezug:** Kleinwinkelnäherung $\sin\varphi \approx \varphi$ beim Fadenpendel – Aufgabe 4 zeigt, bis zu welchem Winkel sie auf 0,01 genau ist.
- **Häufige Stolpersteine:**
  - Die Fakultät im Nenner wird vergessen.
  - Bei $a \neq 0$ wird $x^k$ statt $(x-a)^k$ geschrieben.
  - Man erwartet, dass mehr Summanden immer helfen – das gilt nur im Konvergenzintervall.
  - Die Lagrange-Abschätzung wird mit dem wahren Fehler verwechselt; sie ist nur eine obere Schranke.
