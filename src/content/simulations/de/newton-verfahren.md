---
description: "Interaktive Simulation für die 11. Klasse: das Newton-Verfahren Schritt für Schritt – Tangente anlegen, Schnittpunkt mit der x-Achse als neuer Näherungswert, ziehbarer Startwert, Tabelle der richtigen Stellen, Einzugsbereiche der Nullstellen, Vergleich mit der Intervallhalbierung und Fälle, in denen das Verfahren scheitert."
---

## Worum geht es?

Viele Gleichungen lassen sich nicht nach $x$ auflösen, zum Beispiel $x^3 - 2x - 5 = 0$ oder $\cos x = x$. Das **Newton-Verfahren** findet Nullstellen näherungsweise:

1. Wähle einen **Startwert** $x_0$ in der Nähe der Nullstelle.
2. Lege im Punkt $(x_0 \mid f(x_0))$ die **Tangente** an den Graphen.
3. Der Schnittpunkt der Tangente mit der $x$-Achse ist der neue Näherungswert $x_1$.
4. Wiederhole mit $x_1$, $x_2$, …

Aus der Tangentengleichung $y = f(x_n) + f'(x_n)(x - x_n)$ und $y = 0$ folgt die **Iterationsvorschrift**

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}.$$

Liegt der Startwert nahe genug an einer einfachen Nullstelle, geht es sehr schnell: Die Zahl der richtigen Nachkommastellen **verdoppelt sich ungefähr** mit jedem Schritt.

*Beispiel:* Für $f(x) = x^2 - 2$ und $x_0 = 1$ ergibt sich $x_1 = 1{,}5$, $x_2 = 1{,}41\overline{6}$, $x_3 \approx 1{,}414216$ – schon sehr nahe an $\sqrt{2} = 1{,}41421356\ldots$

**Das Verfahren kann scheitern:**

- Ist die Tangente **waagrecht** ($f'(x_n) = 0$), schneidet sie die $x$-Achse nicht.
- Die Werte können **hin- und herspringen** (Zyklus) oder davonlaufen.
- Bei mehreren Nullstellen hängt vom Startwert ab, **welche** gefunden wird.

**Einzugsbereiche:** Färbt man jeden möglichen Startwert nach der Nullstelle, bei der das Verfahren landet, entstehen die *Einzugsbereiche*. Nahe einer Nullstelle sind sie ruhig; in der Nähe von Extremstellen (wo die Tangente fast waagrecht ist) wechseln die Farben oft wild – ein winziger Unterschied im Startwert führt zu einer ganz anderen Nullstelle.

**Newton oder Halbieren?** Die **Intervallhalbierung** (Bisektion) halbiert ein Intervall mit Vorzeichenwechsel immer wieder. Sie funktioniert sicher, gewinnt aber pro Schritt nur etwa $\log_{10} 2 \approx 0{,}3$ Dezimalstellen. Das Newton-Verfahren verdoppelt die Stellen ungefähr (**quadratische Konvergenz**) – wenn der Startwert passt.

## Ausprobieren

1. [√2](?fn=sq2&x0=1&k=0): Drücke mehrmals „Nächster Schritt“ und beobachte die grünen Stellen in der Tabelle.
2. Ziehe den Startwert $x_0$. Was passiert bei $x_0 = 0$? Was bei negativen Startwerten?
3. [Ansicht mitzoomen](?fn=sq2&x0=1&k=3&zoom=1): Wie sehen die Tangenten aus der Nähe aus?
4. [Newtons Beispiel](?fn=cubic&x0=2&k=2): Isaac Newton rechnete selbst mit $x^3 - 2x - 5$. Wie viele Schritte braucht man für 8 richtige Stellen?
5. [Startwert entscheidet](?fn=three&x0=0.9&k=4): Zu welcher Nullstelle läuft die Folge? Probiere $x_0 = 0{,}5$.
6. [Zyklus](?fn=cycle&x0=0&k=3): Warum findet das Verfahren hier keine Nullstelle? Ändere den Startwert.
7. [Einzugsbereiche](?fn=three&x0=0.9&k=3&basin=1): Welche Farbe hat der Streifen bei $x_0 = 0{,}9$, welche bei $0{,}95$? Wo wechseln die Farben besonders schnell?
8. [Newton gegen Halbieren](?fn=cos&x0=1&k=4&cmp=1): Drücke „Schritte bis zum Ziel“. Nach wie vielen Schritten hat Newton 12 richtige Stellen – und die Intervallhalbierung?

## Aufgaben

### Aufgabe 1: Zwei Schritte von Hand

Berechne für $f(x) = x^2 - 2$ mit $x_0 = 2$ die Näherungswerte $x_1$ und $x_2$. [Aufgabe laden](?fn=sq2&x0=2&k=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 2x$. $x_1 = 2 - \frac{2}{4} = 1{,}5$; $x_2 = 1{,}5 - \frac{0{,}25}{3} = 1{,}41\overline{6}$. [Lösung zeigen](?fn=sq2&x0=2&k=2)

</details>

### Aufgabe 2: cos x = x

Bestimme mit dem Newton-Verfahren eine Lösung von $\cos x = x$ auf vier Nachkommastellen ($x_0 = 1$). [Aufgabe laden](?fn=cos&x0=1&k=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f(x) = \cos x - x$, $f'(x) = -\sin x - 1$. $x_1 \approx 0{,}7504$, $x_2 \approx 0{,}7391$, $x_3 \approx 0{,}7391$; also $x \approx 0{,}7391$. [Lösung zeigen](?fn=cos&x0=1&k=3)

</details>

### Aufgabe 3: Warum scheitert es?

Für $f(x) = x^3 - 2x + 2$ und $x_0 = 0$ erhält man $x_1 = 1$, $x_2 = 0$, … Erkläre mit einer Skizze. [Zeigen](?fn=cycle&x0=0&k=3)

<details>
<summary>Lösung anzeigen</summary>

$x_1 = 0 - \frac{2}{-2} = 1$ und $x_2 = 1 - \frac{1}{1} = 0$. Die Tangente in $x_0 = 0$ trifft die $x$-Achse bei $1$, die Tangente in $1$ trifft sie wieder bei $0$ – die Folge springt endlos hin und her. Ein Startwert links der Nullstelle (z. B. $x_0 = -2$) funktioniert.

</details>

### Aufgabe 4: Waagrechte Tangente

Warum kann man für $f(x) = x^2 - 2$ nicht mit $x_0 = 0$ starten? [Zeigen](?fn=sq2&x0=0&k=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(0) = 0$: Die Tangente ist waagrecht und schneidet die $x$-Achse nicht. In der Formel müsste man durch $0$ teilen.

</details>

### Aufgabe 5: Wie viele Halbierungen?

Ein Startintervall der Länge 1 enthält eine Nullstelle. Wie viele Halbierungsschritte braucht man mindestens, damit die Intervallmitte sicher auf 6 Nachkommastellen genau ist (Fehler $< 0{,}5 \cdot 10^{-6}$)? Vergleiche mit Newton bei $\cos x = x$. [Aufgabe laden](?fn=cos&x0=1&k=0&cmp=1&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Nach $n$ Halbierungen ist das Intervall $2^{-n}$ lang, der Fehler der Mitte höchstens $2^{-(n+1)}$. $2^{-(n+1)} < 0{,}5 \cdot 10^{-6} \iff 2^{n} > 10^{6} \iff n \geq 20$ (denn $2^{20} \approx 1{,}05 \cdot 10^6$). Newton braucht von $x_0 = 1$ aus nur 3 bis 4 Schritte. [Lösung zeigen](?fn=cos&x0=1&k=4&cmp=1)

</details>

### Aufgabe 6: Empfindlicher Startwert

Bei $f(x) = x^3 - 3x + 1$ führen die Startwerte $0{,}9$ und $0{,}95$ zu verschiedenen Nullstellen. Erkläre mit den Tangenten, warum Startwerte nahe der Extremstelle $x = 1$ so empfindlich sind. [Zeigen](?fn=three&x0=0.95&k=2&basin=1)

<details>
<summary>Lösung anzeigen</summary>

Bei $x = 1$ ist $f'(1) = 0$. Nahe daran ist die Tangente fast waagrecht, ihr Schnittpunkt mit der $x$-Achse liegt sehr weit weg – und wohin genau, hängt stark vom Startwert ab: Von $0{,}9$ aus landet $x_1$ bei $-0{,}80$ (danach geht es zur Nullstelle $1{,}53$), von $0{,}95$ aus weit links, sodass die Folge zur Nullstelle $-1{,}88$ läuft.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 11 (Anwendungen der Ableitung, Newton-Verfahren), LehrplanPLUS Gymnasium Bayern. Gut als Anwendung der Tangentengleichung.
- **Herleitung:** Die Lernenden stellen die Tangentengleichung auf und setzen $y = 0$ – so entsteht die Iterationsvorschrift selbst.
- **Tabellenkalkulation:** Das Verfahren mit einer Tabelle nachrechnen und mit der Simulation vergleichen; anschließend mit dem Bisektionsverfahren (Halbieren) vergleichen – die Ansicht „Vergleich mit Intervallhalbierung“ zeigt das Ergebnis als Diagramm.
- **Einzugsbereiche als Ausblick:** Die bunten Streifen sind die eindimensionale Version der bekannten Newton-Fraktale; für interessierte Lernende ein schöner Anlass für eine Recherche.
- **Häufige Stolpersteine:**
  - Vorzeichenfehler in $x_n - \frac{f(x_n)}{f'(x_n)}$.
  - Der Taschenrechner steht bei $\cos x$ im Gradmaß statt im Bogenmaß.
  - „Das Verfahren klappt immer“ – die Gegenbeispiele zeigen, dass der Startwert wichtig ist.
