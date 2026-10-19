---
description: "Interaktive Simulation für die 10. Klasse: Sinussatz und Kosinussatz an einem Dreieck mit ziehbaren Ecken – mit Umkreis, Beweisidee über eine Höhe und Balken, die zeigen, wie c² von a² + b² abweicht."
---

## Worum geht es?

Mit Sinus, Kosinus und Tangens kann man rechtwinklige Dreiecke berechnen. Für **beliebige** Dreiecke gibt es zwei Sätze:

**Sinussatz:** In jedem Dreieck ist das Verhältnis aus einer Seite und dem Sinus des gegenüberliegenden Winkels gleich:

$$\frac{a}{\sin \alpha} = \frac{b}{\sin \beta} = \frac{c}{\sin \gamma}$$

Dieser gemeinsame Wert ist sogar der Durchmesser $2r$ des Umkreises. *Beweisidee:* Die Höhe $h_c$ lässt sich auf zwei Arten berechnen, $h_c = b \cdot \sin \alpha$ und $h_c = a \cdot \sin \beta$. Gleichsetzen und dividieren ergibt den Satz.

**Kosinussatz:** Für die Seite $c$ gegenüber dem Winkel $\gamma$ gilt

$$c^2 = a^2 + b^2 - 2ab \cdot \cos \gamma$$

Für $\gamma = 90°$ ist $\cos \gamma = 0$ – das ist der Satz des Pythagoras. Bei spitzem $\gamma$ wird etwas abgezogen ($c^2 < a^2 + b^2$), bei stumpfem $\gamma$ ist $\cos \gamma$ negativ und es kommt etwas dazu ($c^2 > a^2 + b^2$).

**Wann welcher Satz?**

- Kosinussatz: zwei Seiten und der eingeschlossene Winkel gegeben (SWS) oder alle drei Seiten (SSS).
- Sinussatz: eine Seite und zwei Winkel gegeben (WSW, SWW) oder zwei Seiten und ein gegenüberliegender Winkel (SsW).

## Ausprobieren

1. [Sinussatz](?m=sin): Ziehe die Ecken. Vergleiche die drei Quotienten mit dem Durchmesser des Umkreises.
2. [Stumpfer Winkel](?ax=1&ay=1&bx=7&by=1&cx=10&cy=4): Wo liegt jetzt der Fußpunkt der Höhe $h_c$? Warum gilt der Sinussatz trotzdem?
3. [Kosinussatz](?m=cos): Beobachte die Balken. Wann ist $c^2$ kleiner, wann größer als $a^2 + b^2$?
4. [γ = 90°](?m=cos&ax=2&ay=7&bx=10&by=1&cx=2&cy=1): Was wird aus dem Kosinussatz?
5. Drücke „Neues Dreieck“ und berechne zuerst selbst, bevor du hinschaust (Werte ausschalten).

## Aufgaben

### Aufgabe 1: Kosinussatz (SWS)

Gegeben sind $a \approx 7{,}81\,\text{cm}$, $b \approx 5{,}83\,\text{cm}$ und $\gamma \approx 81{,}2°$. Berechne $c$. [Aufgabe laden](?m=cos&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$c^2 = 7{,}81^2 + 5{,}83^2 - 2 \cdot 7{,}81 \cdot 5{,}83 \cdot \cos 81{,}2° \approx 61 + 34 - 14 = 81$, also $c \approx 9\,\text{cm}$. [Lösung zeigen](?m=cos)

</details>

### Aufgabe 2: Sinussatz (WSW)

Gegeben sind $a \approx 7{,}81\,\text{cm}$, $\alpha \approx 59{,}0°$ und $\beta \approx 39{,}8°$. Berechne $b$ und $\gamma$. [Aufgabe laden](?m=sin&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\gamma = 180° - 59{,}0° - 39{,}8° = 81{,}2°$; $b = \frac{a \cdot \sin \beta}{\sin \alpha} \approx \frac{7{,}81 \cdot 0{,}640}{0{,}857} \approx 5{,}83\,\text{cm}$. [Lösung zeigen](?m=sin)

</details>

### Aufgabe 3: Quer über den See

Von einem Punkt $C$ aus sind zwei Uferpunkte $A$ und $B$ $400\,\text{m}$ bzw. $300\,\text{m}$ entfernt. Der Winkel $\angle ACB$ beträgt $50°$. Wie weit sind $A$ und $B$ voneinander entfernt?

<details>
<summary>Lösung anzeigen</summary>

$c^2 = 300^2 + 400^2 - 2 \cdot 300 \cdot 400 \cdot \cos 50° \approx 95\,730$, also $c \approx 309\,\text{m}$.

</details>

### Aufgabe 4: Winkel aus drei Seiten

Ein Dreieck hat die Seiten $a = 5\,\text{cm}$, $b = 6\,\text{cm}$ und $c = 7\,\text{cm}$. Berechne $\gamma$.

<details>
<summary>Lösung anzeigen</summary>

$\cos \gamma = \frac{25 + 36 - 49}{2 \cdot 5 \cdot 6} = \frac{12}{60} = 0{,}2$, also $\gamma \approx 78{,}5°$.

</details>

### Aufgabe 5: Stumpf oder spitz?

In einem Dreieck ist $c^2 > a^2 + b^2$. Was kannst du über $\gamma$ sagen? [Beispiel zeigen](?m=cos&ax=0.5&ay=1&bx=11.5&by=1&cx=4&cy=3.5)

<details>
<summary>Lösung anzeigen</summary>

Dann muss $-2ab \cdot \cos \gamma > 0$ sein, also $\cos \gamma < 0$: Der Winkel $\gamma$ ist stumpf.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 10 (Sinus- und Kosinussatz, Sinus und Kosinus am Einheitskreis), LehrplanPLUS Gymnasium Bayern. Der Kosinussatz lässt sich gut als „Pythagoras mit Korrektur“ einführen.
- **Vorwissen:** Sinus und Kosinus stumpfer Winkel am Einheitskreis (eigene Simulation) – beim stumpfen Winkel ist $\cos \gamma < 0$ und $\sin \gamma = \sin(180° - \gamma)$.
- **Entscheidungstraining:** Kärtchen mit gegebenen Stücken (SSS, SWS, WSW, SsW) – welcher Satz passt, in welcher Reihenfolge wird gerechnet?
- **Häufige Stolpersteine:**
  - Beim Sinussatz werden Seite und Winkel vertauscht, die sich nicht gegenüberliegen.
  - Beim Kosinussatz wird das Minuszeichen vergessen oder $2ab \cdot \cos\gamma$ vor dem Subtrahieren nicht ausgerechnet.
  - Beim Fall SsW kann es zwei Lösungen geben (Sinus ist für $\gamma$ und $180° - \gamma$ gleich).
