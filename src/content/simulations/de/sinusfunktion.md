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

Die **Wertemenge** ist $W = [\,d - |a|\,;\; d + |a|\,]$.

Die x-Werte sind im **Bogenmaß** angegeben: $\pi$ entspricht $180^\circ$, eine volle Periode des Sinus $2\pi$ entspricht $360^\circ$.

> **Achtung, Schreibweise:** Manche Bücher schreiben $f(x) = a \cdot \sin(bx + c) + d$. Dort ist die Verschiebung in x-Richtung nicht $c$, sondern $-\frac{c}{b}$.

Der **Kosinus** ist ein verschobener Sinus: $\cos(x) = \sin\!\left(x + \frac{\pi}{2}\right)$. Deshalb kann die Simulation beide Grundfunktionen gleich behandeln.

## Ausprobieren

1. Verändere $a$ und $d$. Beide wirken nur in **y-Richtung**. [Amplitude 3](?a=3) [Mittellinie y = 1](?d=1)
2. Verändere $b$. Wird die Periode bei größerem $b$ länger oder kürzer? [b = 2](?b=2) [b = 0,5](?b=0.5)
3. Verschiebe den Graphen mit $c$ oder ziehe den Punkt $(c \mid d)$ auf der Mittellinie, an dem die Periode beginnt. [c = π/4](?cPi=3)
4. Ziehe den Hochpunkt (Amplitude) und den hohlen Punkt am Ende der Periode direkt im Koordinatensystem.
5. Zeige, dass der Kosinus ein verschobener Sinus ist. [Sinus um π/2 nach links](?cPi=-6) – vergleiche mit [der Kosinusfunktion](?base=cos).
6. **Schritt für Schritt:** Baue $f(x) = 2 \cdot \sin(2(x - \frac{\pi}{4})) + 1$ aus $\sin x$ auf. Drücke mehrmals „Nächster Schritt“. Was ändert jeder Schritt am Graphen? [Schritt für Schritt](?mode=build&step=0&a=2&b=2&cPi=3&d=1)
7. Vertausche in Gedanken die Reihenfolge: Was passiert, wenn man zuerst verschiebt und dann mit $b$ staucht? Vergleiche mit der Simulation.
8. **Spiel: Kurve treffen.** Lies Mittellinie, Amplitude, Periode und Verschiebung an der orangen Kurve ab und stelle die Regler so ein, dass deine Kurve genau darauf liegt. [Spiel starten](?mode=match&q=1)

## Aufgaben

### Aufgabe 1: Parameter ablesen

[Aufgabe laden](?a=2&b=2&cPi=3&d=1&info=0&_hide=1) Bestimme Amplitude, Periode, Verschiebungen, Wertemenge und die Funktionsgleichung. Die gestrichelte Kurve ist $y = \sin x$.

<details>
<summary>Lösung anzeigen</summary>

Mittellinie $y = 1$, also $d = 1$. Amplitude 2, also $a = 2$. Eine volle Periode ist $\pi$ lang, also $b = \frac{2\pi}{\pi} = 2$. Der Graph startet um $\frac{\pi}{4}$ nach rechts verschoben:

$$f(x) = 2 \sin\!\left(2\left(x - \tfrac{\pi}{4}\right)\right) + 1, \qquad W = [-1;\, 3]$$

Auch jede um ganze Perioden versetzte Verschiebung passt, z. B. $c = \frac{5\pi}{4}$. In der Schreibweise $a \cdot \sin(b(x + c)) + d$ ist $c = -\frac{\pi}{4}$. Unter **Anzeige → Werte und Hilfslinien zeigen** kannst du dein Ergebnis prüfen.

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

### Aufgabe 4: Reihenfolge der Schritte

$f(x) = 2 \cdot \sin\left(2\left(x - \frac{\pi}{4}\right)\right) + 1$ entsteht aus $\sin x$. Gib die vier Schritte in der richtigen Reihenfolge an und bestimme den ersten Hochpunkt rechts von $x = 0$. [Aufgabe laden](?mode=build&step=0&a=2&b=2&cPi=3&d=1&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

1. Streckung in y-Richtung mit dem Faktor 2 (Amplitude 2),
2. Streckung in x-Richtung: Periode $\frac{2\pi}{2} = \pi$,
3. Verschiebung um $\frac{\pi}{4}$ nach rechts,
4. Verschiebung um 1 nach oben.

Der Hochpunkt von $2\sin(2x)$ liegt bei $x = \frac{\pi}{4}$, nach der Verschiebung also bei $x = \frac{\pi}{2}$ mit $y = 2 + 1 = 3$: $H\left(\frac{\pi}{2} \mid 3\right)$. [Schritte zeigen](?mode=build&step=4&a=2&b=2&cPi=3&d=1)

</details>

## Ideen für den Unterricht

- **Reihenfolge:** Zuerst die „vertikalen“ Parameter $a$ und $d$, dann $c$, zuletzt $b$ – die Wirkung von $b$ ist für viele am wenigsten intuitiv.
- **Spiel als Einstieg oder Wiederholung:** Im Spiel „Kurve treffen“ sind die Kurven nummeriert; gleiche Nummer heißt gleiche Kurve. Die ersten beiden Kurven brauchen nur $a$ und $d$. Jede Lösung in anderer Schreibweise zählt auch, zum Beispiel $-\sin x$ statt $\sin(x - \pi)$.
- **Häufige Stolpersteine:**
  - „Größeres $b$ – längere Periode“: Tatsächlich wird die Periode kürzer.
  - Das Vorzeichen von $c$ wird wie bei Parabeln falsch gedeutet.
  - Bei $\sin(bx + c)$ wird $c$ direkt als Verschiebung gelesen.
- **π-Achse:** Standardmäßig ist die x-Achse in Vielfachen von $\pi$ beschriftet und $c$ rastet in Schritten von $\frac{\pi}{12}$ ein. Für Modellierungsaufgaben lässt sich das unter **Anzeige** abschalten; dann ist $c$ dezimal einstellbar.
- **Aufgabenmodus:** Schalten Sie **Werte und Hilfslinien zeigen** aus. Dann sind Regler, Hilfslinien und Ergebnisse verdeckt, und die Klasse liest die Parameter am Graphen ab. Über **Teilen** lässt sich ein solcher Zustand als Link weitergeben.
- **Einstieg:** Die Simulation „Einheitskreis“ zeigt, wie die Sinuskurve aus der Kreisbewegung entsteht.
- **Schreibweise:** Manche Lehrpläne und Lehrwerke schreiben $a \cdot \sin(b \cdot (x + c)) + d$. Unter **Anzeige → Schreibweise** lässt sich die Simulation darauf umstellen; ein positives $c$ verschiebt dann nach links.
