---
description: Interaktive Simulation zur allgemeinen Sinusfunktion f(x) = a·sin(b(x − c)) + d – Amplitude, Periode, Verschiebungen und Modellieren.
---

## Worum geht es?

Mit der **allgemeinen Sinusfunktion**

$$
f(x) = a \cdot \sin\big(b\,(x - c)\big) + d
$$

lassen sich periodische Vorgänge beschreiben – zum Beispiel Schwingungen, Gezeiten oder die Tageslänge im Jahresverlauf. Jeder Parameter hat eine anschauliche Bedeutung:

| Parameter | Bedeutung | Wirkung auf den Graphen |
| --- | --- | --- |
| $a$ | Amplitude $\lvert a \rvert$ | Streckung in y-Richtung; $a < 0$ spiegelt an der Mittellinie |
| $b$ | Periode $p = \frac{2\pi}{b}$ | Stauchung ($b > 1$) oder Streckung ($b < 1$) in x-Richtung |
| $c$ | Verschiebung in x-Richtung | um $c$ nach rechts ($c > 0$) bzw. links ($c < 0$) |
| $d$ | Verschiebung in y-Richtung | Mittellinie $y = d$ |

Der **Wertebereich** ist $W = [\,d - |a|\,;\; d + |a|\,]$.

> **Achtung, Schreibweise:** Manche Bücher schreiben $f(x) = a \cdot \sin(bx + c) + d$. Dort ist die Verschiebung in x-Richtung nicht $c$, sondern $-\frac{c}{b}$.

Der **Kosinus** ist ein verschobener Sinus: $\cos(x) = \sin\!\left(x + \frac{\pi}{2}\right)$. Deshalb kann die Simulation beide Grundfunktionen gleich behandeln.

## Ausprobieren

1. Verändere $a$ und $d$. Beide wirken nur in **y-Richtung**. [Amplitude 3](?a=3) [Mittellinie y = 1](?d=1)
2. Verändere $b$. Wird die Periode bei größerem $b$ länger oder kürzer? [b = 2](?b=2) [b = 0,5](?b=0.5)
3. Verschiebe den Graphen mit $c$ oder ziehe den roten Punkt. [c = π/4](?cPi=3)
4. Ziehe den grünen Punkt (Amplitude) und den violetten Punkt (Ende der Periode) direkt im Koordinatensystem.
5. Zeige, dass der Kosinus ein verschobener Sinus ist. [Sinus um π/2 nach links](?cPi=-6) – vergleiche mit [der Kosinusfunktion](?base=cos).

## Aufgaben

### Aufgabe 1: Parameter ablesen

[Aufgabe laden](?a=2&b=2&cPi=3&d=1&_hide=1) Bestimme Amplitude, Periode, Verschiebungen und die Funktionsgleichung.

<details>
<summary>Lösung anzeigen</summary>

Mittellinie $y = 1$, also $d = 1$. Amplitude 2, also $a = 2$. Eine volle Periode ist $\pi$ lang, also $b = \frac{2\pi}{\pi} = 2$. Der Graph startet um $\frac{\pi}{4}$ nach rechts verschoben:

$$f(x) = 2 \sin\!\left(2\left(x - \tfrac{\pi}{4}\right)\right) + 1, \qquad W = [-1;\, 3]$$

</details>

### Aufgabe 2: Periode

Bestimme die Periode von $f(x) = \sin(3x)$. Wie viele vollständige Schwingungen liegen im Intervall $[0;\, 2\pi]$?

<details>
<summary>Lösung anzeigen</summary>

$p = \frac{2\pi}{3}$. Im Intervall $[0;\,2\pi]$ liegen genau 3 Schwingungen. [In der Simulation zeigen](?b=3)

</details>

### Aufgabe 3: Tageslänge (Modellieren)

In München ist der längste Tag (um den 21. Juni) etwa 16 Stunden lang, der kürzeste (um den 21. Dezember) etwa 8 Stunden 20 Minuten. Beschreibe die **Abweichung der Tageslänge von 12 Stunden** durch eine Sinusfunktion ($t$: Zeit in Monaten ab dem 1. Januar).

<details>
<summary>Lösung anzeigen</summary>

- Mittelwert: $\frac{16 + 8{,}33}{2} \approx 12{,}2$, also Mittellinie $d \approx 0{,}2$ (Abweichung von 12 h).
- Amplitude: $a \approx \frac{16 - 8{,}33}{2} \approx 3{,}8$.
- Periode 12 Monate: $b = \frac{2\pi}{12} \approx 0{,}52$.
- Maximum Ende Juni ($t \approx 5{,}7$). Beim Sinus liegt das Maximum eine Viertelperiode (3 Monate) nach $c$, also $c \approx 2{,}7$.

$$f(t) \approx 3{,}8 \cdot \sin\big(0{,}52\,(t - 2{,}7)\big) + 0{,}2$$

[Modell in der Simulation zeigen](?piAxis=0&a=3.8&b=0.52&c=2.7&d=0.2&compare=0)

</details>

## Hinweise für Lehrkräfte

- **Reihenfolge:** Zuerst die „vertikalen“ Parameter $a$ und $d$, dann $c$, zuletzt $b$ – die Wirkung von $b$ ist für viele am wenigsten intuitiv.
- **Typische Fehlvorstellungen:**
  - „Größeres $b$ – längere Periode“: Tatsächlich wird die Periode kürzer.
  - Das Vorzeichen von $c$ wird wie bei Parabeln falsch gedeutet.
  - Bei $\sin(bx + c)$ wird $c$ direkt als Verschiebung gelesen.
- **π-Achse:** Standardmäßig ist die x-Achse in Vielfachen von $\pi$ beschriftet und $c$ rastet in Schritten von $\frac{\pi}{12}$ ein. Für Modellierungsaufgaben lässt sich das unter **Anzeige** abschalten; dann ist $c$ dezimal einstellbar.
- **Einstieg:** Die Simulation „Einheitskreis“ zeigt, wie die Sinuskurve aus der Kreisbewegung entsteht.
