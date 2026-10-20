---
description: "Interaktive Simulation für Oberstufe und Studium: Taylorpolynome von sin x, cos x, eˣ, ln(1 + x) und 1/(1 − x) – Summand für Summand aufbauen, Ableitungen bei a anpassen, Fehler und Lagrange-Abschätzung, ε-Schlauch, Konvergenzradius, Partialsummen wie im Taschenrechner und die Kleinwinkelnäherung beim Pendel."
---

## Worum geht es?

Viele Funktionen lassen sich in der Nähe einer Stelle $a$ gut durch **Polynome** annähern. Das **Taylorpolynom** $n$-ten Grades

$$T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}\,(x-a)^k$$

hat bei $x = a$ denselben Funktionswert und dieselben ersten $n$ Ableitungen wie $f$. $T_0$ ist die waagerechte Gerade $y = f(a)$, $T_1$ die Tangente, $T_2$ die „Schmiegparabel“ mit derselben Krümmung. Die Ansicht **Ableitungen anpassen** zeigt das als Liste mit Häkchen: Wert ✓, Steigung ✓, Krümmung ✓ …

**Woher kommen die Koeffizienten?** Leitet man $(x-a)^k$ $k$-mal ab, entsteht $k!$. Damit $T_n^{(k)}(a) = f^{(k)}(a)$ gilt, muss $c_k = \frac{f^{(k)}(a)}{k!}$ sein. Beispiele um $a = 0$:

$\sin x \approx x - \frac{x^3}{6} + \frac{x^5}{120}$, $\cos x \approx 1 - \frac{x^2}{2} + \frac{x^4}{24}$, $e^x \approx 1 + x + \frac{x^2}{2} + \frac{x^3}{6}$, $\frac{1}{1-x} \approx 1 + x + x^2 + x^3$ (geometrische Reihe), $\ln(1+x) \approx x - \frac{x^2}{2} + \frac{x^3}{3}$. Bei $\sin x$ um $0$ sind alle geraden Ableitungen $0$. Deshalb ist $T_4 = T_3$ – ein neuer Grad bringt dort keinen neuen Summanden.

**Wie gut ist die Näherung?** Der Fehler $R_n(x) = f(x) - T_n(x)$ ist nahe bei $a$ winzig und wächst mit dem Abstand. Für sin, cos und $e^x$ gibt die **Lagrange-Abschätzung** die Schranke $|R_n(x)| \le M \cdot \frac{|x-a|^{n+1}}{(n+1)!}$, wobei $M$ eine Schranke für $|f^{(n+1)}|$ zwischen $a$ und $x$ ist ($M = 1$ bei sin und cos, $M = e^{\max(a,x)}$ bei $e^x$). Ist $T_n = T_{n+1}$, darf man sogar mit $n + 1$ rechnen.

**Konvergenzradius:** Bei sin, cos und $e^x$ wird die Näherung mit wachsendem $n$ überall besser. Bei $\ln(1+x)$ und $\frac{1}{1-x}$ nur im **Konvergenzintervall** $|x - a| < r$; $r$ ist der Abstand von $a$ zur Definitionslücke $-1$ bzw. zur Polstelle $1$. Außerhalb „explodieren“ die Polynome, und der Fehler wächst mit $n$.

## Ausprobieren

1. [sin x um 0](?fn=sin&n=1&a=0&x=2): Drücke mehrmals „Grad erhöhen“. Warum ändert sich bei jedem zweiten Schritt nichts? Die Hinweiskarte erklärt es.
2. [Summand für Summand](?view=terms&fn=sin&n=1&a=0): Erhöhe den Grad bis 7 und beobachte den gestrichelten neuen Summanden. Welche Zeilen der Tabelle sind 0?
3. [Ableitungen anpassen](?view=match&fn=cos&n=2&a=0.5&dk=2): Welche Häkchen sind grün, welches rot? Tippe die Zeilen an und vergleiche $f''$ mit $T_2''$. Wie sieht $T_2'''$ aus?
4. [Sonderfall n = 0](?fn=exp&n=0&a=0.5&x=1.5): Warum ist $T_0$ waagerecht? Ziehe danach die Entwicklungsstelle. Im [ε-Schlauch bei eˣ](?view=band&fn=exp&n=4&a=0&eps=0.01): Lass „Alle Grade durchlaufen“. Warum ist der Bereich nicht symmetrisch um $a$?
5. [Konvergenzradius bei ln(1 + x)](?view=conv&fn=ln&n=12&a=0&x=1.5): Drücke „Alle Grade durchlaufen“. Was passiert rechts von $x = 1$? Schiebe die Prüfstelle auf $x = 0{,}5$ und vergleiche das Fehlerdiagramm. Wie groß ist der Radius [mit a nahe −1](?view=conv&fn=ln&n=8&a=-0.9&x=-0.7)?
6. [Taschenrechner](?view=calc&fn=exp&n=9&a=0&x=1): Wie viele Stellen von $e$ stimmen nach jedem Summanden? Vergleiche mit [sin 0,5](?view=calc&fn=sin&n=7&a=0&x=0.5) und [1/(1 − x) an x = 1](?view=calc&fn=geo&n=10&a=0&x=1).
7. [Pendel](?view=small&phi=20): Ziehe den Punkt. Bis zu welchem Winkel ist der Bogen $l \cdot \varphi$ fast so lang wie die Auslenkung $l \cdot \sin\varphi$?

## Aufgaben

### Aufgabe 1: e berechnen

Berechne $T_4(1)$ für $f(x) = e^x$ und $a = 0$. Wie groß ist der Fehler, und was sagt die Lagrange-Abschätzung? Wie viele Summanden braucht man für 6 richtige Nachkommastellen? [Aufgabe laden](?view=calc&fn=exp&n=4&a=0&x=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T_4(1) = 1 + 1 + \frac{1}{2} + \frac{1}{6} + \frac{1}{24} = \frac{65}{24} \approx 2{,}708333$; Fehler $e - \frac{65}{24} \approx 0{,}009948$. Lagrange mit $M = e^1$: $|R_4(1)| \le \frac{e}{5!} \approx 0{,}022652$ – die Schranke stimmt, ist aber gut doppelt so groß. Für 6 Stellen muss $|R_n(1)| < 5 \cdot 10^{-7}$ sein: Bei $T_8$ ist der Fehler noch $\approx 3{,}1 \cdot 10^{-6}$, bei $T_9$ nur $\approx 3{,}0 \cdot 10^{-7}$. Also $n = 9$ mit $T_9(1) \approx 2{,}718282$. [Lösung zeigen](?view=calc&fn=exp&n=9&a=0&x=1)

</details>

### Aufgabe 2: sin 0,5 näherungsweise

Bestimme $T_3$ von $\sin x$ um $a = 0$, berechne $\sin 0{,}5$ näherungsweise und schätze den Fehler mit Lagrange ab. [Aufgabe laden](?fn=sin&n=3&a=0&x=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f(0) = 0$, $f'(0) = 1$, $f''(0) = 0$, $f'''(0) = -1$, also $T_3(x) = x - \frac{x^3}{6}$ und $T_3(0{,}5) = 0{,}5 - \frac{0{,}125}{6} \approx 0{,}479167$; genau ist $\sin 0{,}5 \approx 0{,}479426$. Lagrange: $|R_3(0{,}5)| \le \frac{0{,}5^4}{4!} \approx 0{,}002604$. Weil $T_3 = T_4$ ist, gilt sogar $|R_3(0{,}5)| \le \frac{0{,}5^5}{5!} \approx 0{,}000260$ – der wahre Fehler ist $0{,}000259$. [Lösung zeigen](?fn=sin&n=3&a=0&x=0.5)

</details>

### Aufgabe 3: Koeffizienten aus der Tabelle

Stelle $T_4$ von $\cos x$ um $a = 0$ auf, indem du die Tabelle $k$ | $f^{(k)}(0)$ | $k!$ | $c_k$ selbst ausfüllst. [Aufgabe laden](?view=terms&fn=cos&n=4&a=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ableitungen $\cos, -\sin, -\cos, \sin, \cos$, bei $0$ also $1, 0, -1, 0, 1$. Koeffizienten $1, 0, -\frac{1}{2}, 0, \frac{1}{24}$, also $T_4(x) = 1 - \frac{x^2}{2} + \frac{x^4}{24}$. [Lösung zeigen](?view=terms&fn=cos&n=4&a=0)

</details>

### Aufgabe 4: Kleinwinkelnäherung

Für welche Winkel weicht $\sin\varphi$ um weniger als $0{,}01$ von $\varphi$ ab? Schätze mit dem nächsten Summanden $\frac{\varphi^3}{6}$ und gib das Ergebnis auch in Grad an. [Aufgabe laden](?view=small&phi=20&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Schätzung: $\frac{\varphi^3}{6} < 0{,}01 \Rightarrow \varphi < \sqrt[3]{0{,}06} \approx 0{,}39$. Genau gilt $|\sin\varphi - \varphi| < 0{,}01$ für $|\varphi| < 0{,}392493$, also bis etwa $22{,}5°$. Verlangt man einen relativen Fehler unter $1\,\%$, reicht es nur bis etwa $14{,}0°$. [Lösung zeigen](?view=small&phi=22)

</details>

### Aufgabe 5: ln 2 aus der Reihe

Berechne $T_5(1)$ für $\ln(1+x)$ um $0$ und vergleiche mit $\ln 2$. Was passiert bei $x = 1{,}5$? [Aufgabe laden](?view=calc&fn=ln&n=5&a=0&x=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T_5(1) = 1 - \frac{1}{2} + \frac{1}{3} - \frac{1}{4} + \frac{1}{5} \approx 0{,}783333$, aber $\ln 2 \approx 0{,}693147$. Die Partialsummen $1;\ 0{,}5;\ 0{,}8333;\ 0{,}5833;\ 0{,}7833$ pendeln langsam um $\ln 2$ – $x = 1$ ist der Randpunkt des Konvergenzintervalls $(-1;\,1]$. Bei $x = 1{,}5$ ist $|x - a| > r = 1$: Die Polynome divergieren. [Lösung zeigen](?view=conv&fn=ln&n=12&a=0&x=1.5)

</details>

### Aufgabe 6: Geometrische Reihe (Knobelaufgabe)

Begründe, dass alle Koeffizienten von $\frac{1}{1-x}$ um $0$ gleich $1$ sind. Für welche $x$ konvergiert die Reihe? Was passiert bei $x = 1$ und $x = -1$? [Zeigen](?view=conv&fn=geo&n=12&a=0&x=-1.3)

<details>
<summary>Lösung anzeigen</summary>

$f^{(k)}(x) = \frac{k!}{(1-x)^{k+1}}$, also $f^{(k)}(0) = k!$ und $c_k = 1$. Die Reihe $1 + x + x^2 + \ldots$ konvergiert für $|x| < 1$. Bei $x = 1$ wachsen die Partialsummen $1, 2, 3, \ldots$ über alle Grenzen, bei $x = -1$ springen sie $1, 0, 1, 0, \ldots$ und haben keinen Grenzwert. [Lösung zeigen](?view=calc&fn=geo&n=10&a=0&x=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Vertiefung in Jahrgangsstufe 13 (z. B. Seminar, Begabtenförderung) und Analysis im ersten Studienjahr. Der Lehrplanbezug ist je nach Land und Kurs verschieden – bitte am Lehrplan prüfen.
- **Einstieg über den Taschenrechner:** „Wie berechnet ein Rechner $\sin 0{,}5$ oder $e$?“ Die fett markierten Stellen in der Ansicht *Taschenrechner* machen sichtbar, wie schnell die Näherung besser wird.
- **Von der Tangente zur Schmiegparabel:** Die Ansicht *Ableitungen anpassen* knüpft an die Tangente an. Die Klasse kann vorab vermuten, welche Häkchen bei $T_2$ grün werden.
- **Physik-Bezug:** Kleinwinkelnäherung $\sin\varphi \approx \varphi$ beim Fadenpendel; die Schwingungsdauer $T = 2\pi\sqrt{l/g}$ gilt nur für kleine Ausschläge.
- **Häufige Stolpersteine:**
  - Die Fakultät im Nenner wird vergessen, oder bei $a \neq 0$ steht $x^k$ statt $(x-a)^k$.
  - Man erwartet, dass mehr Summanden immer helfen – das gilt nur im Konvergenzintervall.
  - Die Lagrange-Abschätzung wird mit dem wahren Fehler verwechselt; sie ist nur eine obere Schranke.
