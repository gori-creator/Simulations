---
description: "Interaktive Simulation für die 12. und 13. Klasse: Funktionenscharen mit Parameter k – Extrem- und Wendepunkte in Abhängigkeit von k, Ortskurven mit Herleitung, gemeinsame Punkte aller Scharkurven und Fallunterscheidung auf einem ziehbaren k-Strahl."
---

## Worum geht es?

Eine **Funktionenschar** fasst unendlich viele Funktionen zusammen, die sich nur in einem **Parameter** $k$ unterscheiden, zum Beispiel $f_k(x) = x^3 - kx$. Für jedes $k$ erhält man einen eigenen Graphen.

Typische Fragen:

- **Fallunterscheidung:** Für welche $k$ gibt es Extrempunkte? Bei $f_k(x) = x^3 - kx$ ist $f_k'(x) = 3x^2 - k$. Für $k < 0$ gibt es keine Nullstelle, für $k = 0$ einen Terrassenpunkt, für $k > 0$ einen Hoch- und einen Tiefpunkt bei $x = \pm\sqrt{\frac{k}{3}}$.
- **Ortskurve:** Auf welcher Kurve wandern die Extrempunkte, wenn $k$ sich ändert? Man löst $x = \sqrt{\frac{k}{3}}$ nach $k$ auf ($k = 3x^2$) und setzt in $y = f_k(x)$ ein: $y = x^3 - 3x^2 \cdot x = -2x^3$.
- **Gemeinsame Punkte:** Gibt es Punkte, durch die alle Scharkurven gehen? Aus $f_{k_1}(x) = f_{k_2}(x)$ für $k_1 \neq k_2$ folgt hier $(k_2 - k_1) \cdot x = 0$, also $x = 0$ und der Punkt $(0 \mid 0)$. Es kann auch **keinen** gemeinsamen Punkt geben: Bei $f_k(x) = (x - k) \cdot e^x$ ist $f_{k_1}(x) - f_{k_2}(x) = (k_2 - k_1) \cdot e^x$ nie null.
- **Wendepunkte:** Sie wandern ebenfalls auf einer Ortskurve. Bei $f_k(x) = x \cdot e^{-kx}$ ist $f_k''(x) = k \cdot e^{-kx}(kx - 2)$, also $W\left(\frac{2}{k} \mid \frac{2}{k \cdot e^2}\right)$ auf der Geraden $y = \frac{x}{e^2}$.

Der **k-Strahl** unter dem Koordinatensystem zeigt die Fallunterscheidung: Jeder Abschnitt ist mit der Art der Extrempunkte beschriftet, und der aktuelle Wert von $k$ lässt sich dort ziehen.

## Ausprobieren

1. [x³ − kx](?fam=cub&k=1.5): Ziehe den Hochpunkt. Auf welcher Kurve bewegt er sich?
2. Drücke „k durchlaufen lassen“. Wann verschwinden die Extrempunkte?
3. [Parabelschar](?fam=par&k=1): Alle Parabeln gehen durch einen Punkt. Welchen?
4. [x · e^(−kx)](?fam=exp&k=1): Was passiert mit dem Extrempunkt, wenn $k$ negativ wird?
5. [kx² − x⁴](?fam=quart&k=2): Wie ändert sich die Form zwischen $k < 0$ und $k > 0$? Ziehe den Punkt auf dem k-Strahl über die Grenze $k = 0$.
6. [Wendepunkte](?fam=exp&k=1&wp=1): Schalte „Wendepunkte und ihre Ortskurve“ ein und lass $k$ durchlaufen. Welche Spur hinterlassen Extrem- und Wendepunkte?
7. [(x − k) · eˣ](?fam=expk&k=1&wp=1): Warum haben diese Kurven keinen gemeinsamen Punkt? Wie hängen sie miteinander zusammen?

## Aufgaben

### Aufgabe 1: Extrempunkte in Abhängigkeit von k

Bestimme die Extrempunkte von $f_k(x) = x^2 - 2kx + k$ und die Ortskurve. [Aufgabe laden](?fam=par&k=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k'(x) = 2x - 2k = 0 \Rightarrow x = k$, $f_k(k) = k - k^2$, also Tiefpunkt $T(k \mid k - k^2)$. Ortskurve: $k = x$ einsetzen: $y = x - x^2$. [Lösung zeigen](?fam=par&k=1)

</details>

### Aufgabe 2: Gemeinsamer Punkt

Zeige, dass alle Graphen von $f_k(x) = x^2 - 2kx + k$ durch den Punkt $\left(\frac{1}{2} \mid \frac{1}{4}\right)$ gehen.

<details>
<summary>Lösung anzeigen</summary>

$f_k\left(\frac{1}{2}\right) = \frac{1}{4} - k + k = \frac{1}{4}$ – unabhängig von $k$. [Zeigen](?fam=par&k=-1)

</details>

### Aufgabe 3: Fallunterscheidung

Für welche $k$ hat $f_k(x) = kx^2 - x^4$ drei Extrempunkte? Gib sie an. [Aufgabe laden](?fam=quart&k=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k'(x) = 2kx - 4x^3 = 2x(k - 2x^2)$. Für $k > 0$: $x = 0$ (Tiefpunkt) und $x = \pm\sqrt{\frac{k}{2}}$ (Hochpunkte $\left(\pm\sqrt{\frac{k}{2}} \mid \frac{k^2}{4}\right)$). Für $k \leq 0$ nur der Hochpunkt $(0 \mid 0)$. [Lösung zeigen](?fam=quart&k=2)

</details>

### Aufgabe 4: Wendepunkte und ihre Ortskurve

Bestimme den Wendepunkt von $f_k(x) = x \cdot e^{-kx}$ ($k \neq 0$) und die Kurve, auf der alle Wendepunkte liegen. Die zweite Ableitung ist $f_k''(x) = k \cdot e^{-kx}(kx - 2)$. [Aufgabe laden](?fam=exp&k=1&wp=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k''(x) = 0 \Rightarrow x = \frac{2}{k}$ (Vorzeichenwechsel, weil $kx - 2$ dort das Vorzeichen wechselt). $f_k\left(\frac{2}{k}\right) = \frac{2}{k} \cdot e^{-2}$, also $W\left(\frac{2}{k} \mid \frac{2}{k e^2}\right)$; für $k = 1$: $W(2 \mid 0{,}27)$. Ortskurve: $k = \frac{2}{x}$ einsetzen ergibt $y = \frac{x}{e^2}$. [Lösung zeigen](?fam=exp&k=1&wp=1)

</details>

### Aufgabe 5: Eine Schar ohne gemeinsamen Punkt

Gegeben ist $f_k(x) = (x - k) \cdot e^x$. Bestimme den Tiefpunkt in Abhängigkeit von $k$, seine Ortskurve und zeige, dass es keinen gemeinsamen Punkt aller Scharkurven gibt. [Aufgabe laden](?fam=expk&k=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k'(x) = e^x + (x - k)e^x = e^x(x - k + 1) = 0 \Rightarrow x = k - 1$; $f_k(k - 1) = -e^{k-1}$, also $T(k - 1 \mid -e^{k-1})$, für $k = 1$: $T(0 \mid -1)$. Ortskurve: $k = x + 1$, $y = -e^x$. Gemeinsame Punkte: $(x - k_1)e^x = (x - k_2)e^x \iff (k_2 - k_1)e^x = 0$ – für $k_1 \neq k_2$ unmöglich, weil $e^x > 0$. Tatsächlich ist $f_k(x) = f_0(x - k) \cdot e^k$: Jede Kurve ist eine verschobene und gestreckte Kopie von $x \cdot e^x$. [Lösung zeigen](?fam=expk&k=1&wp=1)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12 (ganzrationale Funktionen mit Parametern) und 13 (Funktionenscharen in Anwendungen), LehrplanPLUS Gymnasium Bayern.
- **Vermuten, dann rechnen:** Erst die Ortskurve mit „k durchlaufen lassen“ als Spur sichtbar machen, dann rechnerisch bestätigen.
- **Fallunterscheidung am k-Strahl:** Die Klasse markiert vorher auf einem Zahlenstrahl, für welche $k$ welche Art von Extrempunkten entsteht, und vergleicht dann mit dem k-Strahl der Simulation.
- **Häufige Stolpersteine:**
  - Beim Ableiten wird $k$ wie eine Variable behandelt.
  - Die Fallunterscheidung (z. B. $k < 0$) wird vergessen; Wurzeln aus negativen Zahlen.
  - Bei der Ortskurve wird $x$ nicht nach $k$ aufgelöst, sondern $k$ einfach weggelassen.
  - Beim Ansatz für gemeinsame Punkte wird $k_1 \neq k_2$ nicht genutzt, sodass man durch null teilt.
