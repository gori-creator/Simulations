---
description: Interaktive Simulation zur linearen Funktion f(x) = mx + b – mit Steigungsdreieck, Nullstelle, zweiter Geraden und Aufgaben.
---

## Worum geht es?

Eine **lineare Funktion** hat die Funktionsgleichung

$$
f(x) = m \cdot x + b
$$

Ihr Graph ist immer eine **Gerade**.

- Der **y-Achsenabschnitt** $b$ gibt an, wo die Gerade die y-Achse schneidet: im Punkt $(0 \mid b)$.
- Die **Steigung** $m$ gibt an, wie steil die Gerade ist: Geht man **1 nach rechts**, so geht es **$m$ nach oben** – bei negativem $m$ nach unten. Genau das zeigt das **Steigungsdreieck**.

Kennt man zwei Punkte $P_1(x_1 \mid y_1)$ und $P_2(x_2 \mid y_2)$ der Geraden, berechnet man die Steigung so:

$$
m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{\Delta y}{\Delta x}
$$

Die **Nullstelle** ist die Stelle, an der die Gerade die x-Achse schneidet. Man findet sie, indem man $f(x) = 0$ setzt: $x_0 = -\frac{b}{m}$ (für $m \neq 0$).

## Ausprobieren

1. Verändere nur $b$. Was passiert mit der Geraden – und was bleibt gleich? [Beispiel laden](?m=0.5&b=-3)
2. Verändere nur $m$. Beobachte das Steigungsdreieck. Was passiert bei $m = 0$? [Beispiel laden](?m=0&b=2)
3. Ziehe die markierten Punkte direkt im Koordinatensystem: den Punkt auf der y-Achse und die Spitze des Steigungsdreiecks.
4. Schalte die zweite Gerade $g$ ein. Wann schneiden sich zwei Geraden nicht? [Parallele Geraden](?m=0.5&b=1&second=1&m2=0.5&b2=-2)

## Aufgaben

### Aufgabe 1: Funktionsgleichung ablesen

[Aufgabe laden](?m=-1.5&b=2&_hide=1) Lies die Steigung und den y-Achsenabschnitt am Graphen ab und gib die Funktionsgleichung an. Die Ergebnisse rechts sind verdeckt – decke sie erst zur Kontrolle auf.

<details>
<summary>Lösung anzeigen</summary>

Die Gerade schneidet die y-Achse bei 2, also ist $b = 2$. Geht man 1 nach rechts, geht es 1,5 nach unten, also ist $m = -1{,}5$:

$$f(x) = -1{,}5x + 2$$

</details>

### Aufgabe 2: Gerade durch zwei Punkte

Bestimme die Gleichung der Geraden durch $A(-2 \mid -1)$ und $B(2 \mid 5)$. Stelle die Gerade anschließend in der Simulation ein und überprüfe, ob sie durch beide Punkte geht.

<details>
<summary>Lösung anzeigen</summary>

$$m = \frac{5 - (-1)}{2 - (-2)} = \frac{6}{4} = 1{,}5$$

Einsetzen von $A$: $-1 = 1{,}5 \cdot (-2) + b$, also $b = 2$. Damit ist $f(x) = 1{,}5x + 2$. [In der Simulation zeigen](?m=1.5&b=2)

</details>

### Aufgabe 3: Nullstelle berechnen

Berechne die Nullstelle von $f(x) = 0{,}5x - 2$ und überprüfe sie in der Simulation.

<details>
<summary>Lösung anzeigen</summary>

$0 = 0{,}5x - 2 \;\Rightarrow\; x = 4$. Die Gerade schneidet die x-Achse in $N(4 \mid 0)$. [In der Simulation zeigen](?m=0.5&b=-2)

</details>

### Aufgabe 4: Senkrechte Geraden

Stelle $f(x) = 2x - 1$ ein und schalte die zweite Gerade ein. Finde eine Gerade $g$, die $f$ **senkrecht** schneidet. Was fällt dir an den beiden Steigungen auf?

<details>
<summary>Lösung anzeigen</summary>

Zum Beispiel $g(x) = -0{,}5x + 2$. Für senkrechte Geraden gilt $m \cdot m_2 = -1$, also $m_2 = -\frac{1}{2}$. Der y-Achsenabschnitt von $g$ ist beliebig. [In der Simulation zeigen](?m=2&b=-1&second=1&m2=-0.5&b2=2)

</details>

### Aufgabe 5: Handytarif (Modellieren)

Ein Handytarif kostet 5 € Grundgebühr im Monat und 2 € pro verbrauchtem Gigabyte.

1. Stelle die Funktionsgleichung für die monatlichen Kosten auf ($x$: Gigabyte, $f(x)$: Kosten in €).
2. Wie teuer ist ein Monat mit 3 GB?
3. Ein zweiter Tarif kostet 8 € Grundgebühr und 1 € pro GB. Ab wie vielen GB ist er günstiger?

<details>
<summary>Lösung anzeigen</summary>

1. $f(x) = 2x + 5$
2. $f(3) = 11$, also 11 €.
3. $g(x) = x + 8$. Schnittpunkt: $2x + 5 = x + 8 \Rightarrow x = 3$. Ab mehr als 3 GB ist der zweite Tarif günstiger. [Beide Tarife zeigen](?m=2&b=5&second=1&m2=1&b2=8)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Einführung in Klasse 7/8 oder Wiederholung vor quadratischen Funktionen. Am Beamer bewährt: Die Klasse sagt vorher, was passiert, bevor ein Regler bewegt wird.
- **Typische Fehlvorstellungen:**
  - Steigung und y-Achsenabschnitt werden verwechselt.
  - Bei negativer Steigung wird das Steigungsdreieck „nach oben“ gezeichnet.
  - Die konstante Funktion ($m = 0$) wird nicht als lineare Funktion erkannt.
  - Ein flacher wirkender Graph wird mit kleinerer Steigung gleichgesetzt, obwohl nur die Achsen anders skaliert sind. Die Simulation verwendet gleich lange Einheiten auf beiden Achsen.
- **Aufgabenmodus:** Über **Teilen → Ergebnisse verdecken** entsteht ein Link oder QR-Code, bei dem Funktionsgleichung, Nullstelle und Schnittpunkt verdeckt sind – ideal für Ableseübungen. Mit **Regler sperren** wird die Einstellung nicht versehentlich verändert.
- **Differenzierung:** Schnellere Lernende untersuchen mit der zweiten Geraden parallele und senkrechte Geraden oder lösen lineare Gleichungssysteme grafisch.
