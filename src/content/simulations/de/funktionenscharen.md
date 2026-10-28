## Worum geht es?

Eine **Funktionenschar** fasst unendlich viele Funktionen zusammen, die sich nur in einem **Parameter** $k$ unterscheiden, zum Beispiel $f_k(x) = x^3 - kx$. Für jedes $k$ erhält man einen eigenen Graphen. Beim Ableiten wird $k$ wie eine feste Zahl behandelt: $f_k'(x) = 3x^2 - k$, $f_k''(x) = 6x$.

- **Fallunterscheidung:** Für welche $k$ gibt es Extrempunkte? $f_k'(x) = 0 \iff x^2 = \frac{k}{3}$. Für $k < 0$ hat das keine Lösung ($f_k$ ist streng monoton steigend), für $k = 0$ gibt es den Terrassenpunkt $(0 \mid 0)$, für $k > 0$ einen Hoch- und einen Tiefpunkt bei $x = \pm\sqrt{\frac{k}{3}}$.
- **Ortskurve:** Auf welcher Kurve wandern die Extrempunkte, wenn $k$ sich ändert? Man bestimmt den Extrempunkt in Abhängigkeit von $k$, löst die $x$-Koordinate nach $k$ auf ($x^2 = \frac{k}{3} \Rightarrow k = 3x^2$) und setzt in die $y$-Koordinate ein: $y = x^3 - 3x^2 \cdot x = -2x^3$. Der Punkt $(0 \mid 0)$ gehört nicht dazu, er ist für $k = 0$ kein Extrempunkt: Ortskurve $y = -2x^3$ mit $x \neq 0$.
- **Gemeinsame Punkte:** Aus $f_{k_1}(x) = f_{k_2}(x)$ für $k_1 \neq k_2$ folgt hier $(k_2 - k_1) \cdot x = 0$, also $x = 0$ und der Punkt $(0 \mid 0)$. Es kann auch **keinen** gemeinsamen Punkt geben: Bei $f_k(x) = (x - k) \cdot e^x$ ist $f_{k_1}(x) - f_{k_2}(x) = (k_2 - k_1) \cdot e^x$ nie null. Bei $x \cdot e^{-kx}$ und $kx^2 - x^4$ **berühren** sich alle Kurven im Ursprung, weil dort alle dieselbe Steigung haben.
- **Wendepunkte** wandern ebenfalls auf einer Ortskurve. Bei $f_k(x) = x \cdot e^{-kx}$ ist $f_k''(x) = k \cdot (kx - 2) \cdot e^{-kx}$, also $W\left(\frac{2}{k} \mid \frac{2}{k \cdot e^2}\right)$ auf der Geraden $y = \frac{x}{e^2}$.

In der Simulation sind die Extrempunkte rote Perlen: Ändert sich $k$, gleiten sie auf ihrer Ortskurve und hinterlassen eine leuchtende Spur. Der **k-Strahl** unter dem Bild zeigt die Fallunterscheidung; mit ▶ läuft $k$ von selbst. Die Karte „Ortskurve“ führt in vier Schritten durch die Herleitung.

## Ausprobieren

1. [x³ − kx](?fam=cub&k=1.5): Ziehe den Hochpunkt (rote Perle). Auf welcher Kurve gleitet er, und was passiert mit $k$?
2. Drücke „k durchlaufen lassen“ oder ▶ auf dem k-Strahl. Wann verschwinden die Extrempunkte? Achte auf die hervorgehobene Zeile in der Fallunterscheidung.
3. [Herleitung von vorn](?fam=cub&k=1.5&dv=1): Drücke mehrmals „Herleitung: nächster Schritt“. Im Bild erscheinen zuerst $x_E$ und $y_E$, dann die Probe für $k$, zuletzt wächst die Ortskurve.
4. [Parabelschar](?fam=par&k=1): Alle Parabeln gehen durch einen Punkt. Welchen? Tippe blasse Kurven an, um zu anderen $k$ zu springen.
5. [x · e^(−kx)](?fam=exp&k=1): Was passiert mit dem Extrempunkt, wenn $k$ negativ wird? Und bei $k = 0$?
6. [kx² − x⁴](?fam=quart&k=2): Ziehe den Punkt auf dem k-Strahl über $k = 0$. Wie ändert sich die Form?
7. [Wendepunkte](?fam=exp&k=1&wp=1): Lass $k$ laufen. Welche Spur hinterlassen Extrem- und Wendepunkte?
8. [(x − k) · eˣ](?fam=expk&k=1&wp=1): Warum haben diese Kurven keinen gemeinsamen Punkt?

## Aufgaben

### Aufgabe 1: Extrempunkte in Abhängigkeit von k

Bestimme die Extrempunkte von $f_k(x) = x^2 - 2kx + k$ und die Ortskurve. [Aufgabe laden](?fam=par&k=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k'(x) = 2x - 2k = 0 \Rightarrow x = k$, $f_k''(x) = 2 > 0$, $f_k(k) = k^2 - 2k^2 + k = k - k^2$, also Tiefpunkt $T(k \mid k - k^2)$. Ortskurve: $k = x$ einsetzen: $y = x - x^2$. Für $k = 1$: $T(1 \mid 0)$. [Lösung zeigen](?fam=par&k=1)

</details>

### Aufgabe 2: Gemeinsamer Punkt

Zeige, dass alle Graphen von $f_k(x) = x^2 - 2kx + k$ durch den Punkt $\left(\frac{1}{2} \mid \frac{1}{4}\right)$ gehen.

<details>
<summary>Lösung anzeigen</summary>

$f_k\left(\frac{1}{2}\right) = \frac{1}{4} - k + k = \frac{1}{4}$ – unabhängig von $k$. Allgemein: $f_k(x) = x^2 + k(1 - 2x)$, und der Summand mit $k$ fällt genau für $x = \frac{1}{2}$ weg. [Zeigen](?fam=par&k=-1)

</details>

### Aufgabe 3: Fallunterscheidung

Für welche $k$ hat $f_k(x) = kx^2 - x^4$ drei Extrempunkte? Gib sie an. [Aufgabe laden](?fam=quart&k=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k'(x) = 2kx - 4x^3 = 2x(k - 2x^2)$. Für $k > 0$: $x = 0$ (Tiefpunkt) und $x = \pm\sqrt{\frac{k}{2}}$ (Hochpunkte $\left(\pm\sqrt{\frac{k}{2}} \mid \frac{k^2}{4}\right)$), für $k = 2$ also $H(\pm 1 \mid 1)$ und $T(0 \mid 0)$. Für $k \leq 0$ nur der Hochpunkt $(0 \mid 0)$. [Lösung zeigen](?fam=quart&k=2)

</details>

### Aufgabe 4: Ortskurve Schritt für Schritt

Bestimme für $f_k(x) = x^3 - kx$ ($k > 0$) die Extrempunkte und die Gleichung der Kurve, auf der sie liegen. Mache die Probe mit $k = 3$. [Aufgabe laden](?fam=cub&k=3&dv=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$x_E = \pm\sqrt{\frac{k}{3}}$, $y_E = x_E\left(x_E^2 - k\right) = \mp\frac{2k}{3}\sqrt{\frac{k}{3}}$. Aus $x^2 = \frac{k}{3}$ folgt $k = 3x^2$, eingesetzt $y = x^3 - 3x^2 \cdot x = -2x^3$ (mit $x \neq 0$). Probe $k = 3$: $H(-1 \mid 2)$, $T(1 \mid -2)$, und tatsächlich $-2 \cdot (-1)^3 = 2$. [Lösung zeigen](?fam=cub&k=3)

</details>

### Aufgabe 5: Wendepunkte und ihre Ortskurve

Bestimme den Wendepunkt von $f_k(x) = x \cdot e^{-kx}$ ($k \neq 0$) und die Kurve, auf der alle Wendepunkte liegen. Es ist $f_k''(x) = k \cdot e^{-kx}(kx - 2)$. [Aufgabe laden](?fam=exp&k=1&wp=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k''(x) = 0 \Rightarrow x = \frac{2}{k}$ (Vorzeichenwechsel, weil $kx - 2$ dort das Vorzeichen wechselt). $f_k\left(\frac{2}{k}\right) = \frac{2}{k} \cdot e^{-2}$, also $W\left(\frac{2}{k} \mid \frac{2}{k e^2}\right)$; für $k = 1$: $W(2 \mid 0{,}27)$. Ortskurve: $k = \frac{2}{x}$ einsetzen ergibt $y = \frac{x}{e^2}$. [Lösung zeigen](?fam=exp&k=1&wp=1)

</details>

### Aufgabe 6: Eine Schar ohne gemeinsamen Punkt

Gegeben ist $f_k(x) = (x - k) \cdot e^x$. Bestimme den Tiefpunkt in Abhängigkeit von $k$, seine Ortskurve und zeige, dass es keinen gemeinsamen Punkt aller Scharkurven gibt. [Aufgabe laden](?fam=expk&k=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k'(x) = e^x + (x - k)e^x = e^x(x - k + 1) = 0 \Rightarrow x = k - 1$; $f_k(k - 1) = -e^{k-1}$, also $T(k - 1 \mid -e^{k-1})$, für $k = 1$: $T(0 \mid -1)$. Ortskurve: $k = x + 1$, $y = -e^x$. Gemeinsame Punkte: $(x - k_1)e^x = (x - k_2)e^x \iff (k_2 - k_1)e^x = 0$ – für $k_1 \neq k_2$ unmöglich, weil $e^x > 0$. [Lösung zeigen](?fam=expk&k=1&wp=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe: ganzrationale Funktionen mit Parametern, danach Anwendungen und verknüpfte Funktionen mit Parametern (auch Scharen von e-Funktionen).
- **Vermuten, dann rechnen:** Erst die Ortskurve mit „k durchlaufen lassen“ als leuchtende Spur sichtbar machen und eine Gleichung vermuten lassen, dann mit „Ergebnisse zeigen“ aus rechnen und schrittweise aufdecken.
- **Fallunterscheidung am k-Strahl:** Die Klasse markiert vorher auf einem Zahlenstrahl, für welche $k$ welche Art von Extrempunkten entsteht, und vergleicht mit dem k-Strahl der Simulation.
- **Sonderfälle:** Lücke der Ortskurve bei $x = 0$, Terrassenpunkt bei $k = 0$, Berühren statt Schneiden im gemeinsamen Punkt – gut für ein Gespräch über genaues Formulieren.
- **Häufige Stolpersteine:**
  - Beim Ableiten wird $k$ wie eine Variable behandelt.
  - Die Fallunterscheidung (z. B. $k < 0$) wird vergessen; Wurzeln aus negativen Zahlen.
  - Bei der Ortskurve wird $x$ nicht nach $k$ aufgelöst, sondern $k$ einfach weggelassen.
  - Beim Ansatz für gemeinsame Punkte wird $k_1 \neq k_2$ nicht genutzt, sodass man durch null teilt.
