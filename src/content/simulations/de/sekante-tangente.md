---
description: Interaktive Simulation zum Übergang von der Sekante zur Tangente – Differenzenquotient, Grenzwert h → 0 und Ableitung anschaulich.
---

## Worum geht es?

Die **Sekante** ist die Gerade durch zwei Punkte des Graphen: $P(x_0 \mid f(x_0))$ und $Q(x_0 + h \mid f(x_0 + h))$. Ihre Steigung ist der **Differenzenquotient**

$$
m_s = \frac{f(x_0 + h) - f(x_0)}{h}.
$$

Er beschreibt die **mittlere Änderungsrate** von $f$ zwischen $x_0$ und $x_0 + h$.

Lässt man $Q$ immer näher an $P$ heranrücken ($h \to 0$), dreht sich die Sekante in eine Grenzlage: die **Tangente** in $P$. Ihre Steigung ist die **Ableitung** von $f$ an der Stelle $x_0$ (lokale Änderungsrate):

$$
f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}.
$$

### Beispiel: $f(x) = x^2$ (h-Methode)

$$
m_s = \frac{(x_0 + h)^2 - x_0^2}{h} = \frac{2x_0 h + h^2}{h} = 2x_0 + h \;\xrightarrow{\;h \to 0\;}\; 2x_0
$$

Also ist $f'(x_0) = 2x_0$, z. B. $f'(1) = 2$.

## Ausprobieren

1. Ziehe $Q$ in Richtung $P$ oder drücke **h → 0**. Beobachte den Differenzenquotienten und die Tabelle.
2. Wähle ein negatives $h$: $Q$ liegt dann links von $P$. Ist der Grenzwert derselbe? [h negativ](?h=-1.5)
3. Blende die Tangente ein und verschiebe $P$. Wo ist die Tangente waagrecht? [Kubische Funktion](?fn=cubic&x0=-1&h=2&tangent=1)
4. Schalte **Ableitungsgraph entstehen lassen** ein und ziehe $P$ langsam von links nach rechts. Welche Funktion entsteht bei $\sin x$? [Sinus](?fn=sin&x0=0.5&h=1&trace=1)

## Aufgaben

### Aufgabe 1: Differenzenquotienten berechnen

Berechne für $f(x) = x^2$ und $x_0 = 1$ den Differenzenquotienten für $h = 1$, $h = 0{,}5$ und $h = 0{,}1$. Gegen welchen Wert streben die Ergebnisse?

<details>
<summary>Lösung anzeigen</summary>

- $h = 1$: $\frac{4 - 1}{1} = 3$
- $h = 0{,}5$: $\frac{2{,}25 - 1}{0{,}5} = 2{,}5$
- $h = 0{,}1$: $\frac{1{,}21 - 1}{0{,}1} = 2{,}1$

Allgemein ist $m_s = 2 + h$, die Werte streben gegen $f'(1) = 2$. [In der Simulation zeigen](?x0=1&h=0.5)

</details>

### Aufgabe 2: h-Methode

Bestimme mit der h-Methode die Ableitung von $f(x) = x^2$ an der Stelle $x_0 = -2$. Was bedeutet das Vorzeichen?

<details>
<summary>Lösung anzeigen</summary>

$m_s = 2x_0 + h = -4 + h \to -4$, also $f'(-2) = -4$. Die Tangente fällt: Der Graph ist an dieser Stelle fallend. [In der Simulation zeigen](?x0=-2&h=1&tangent=1)

</details>

### Aufgabe 3: Waagrechte Tangente

Bei $f(x) = 0{,}25x^3 - x$ gibt es zwei Stellen mit waagrechter Tangente. Suche sie in der Simulation und berechne sie mit $f'(x) = 0{,}75x^2 - 1$.

<details>
<summary>Lösung anzeigen</summary>

$0{,}75x^2 - 1 = 0 \Rightarrow x^2 = \frac{4}{3} \Rightarrow x = \pm\frac{2}{\sqrt{3}} \approx \pm 1{,}15$. Dort liegen ein Hochpunkt ($x \approx -1{,}15$) und ein Tiefpunkt ($x \approx 1{,}15$). [In der Simulation zeigen](?fn=cubic&x0=1.15&h=0.8&tangent=1)

</details>

### Aufgabe 4: Ableitung der Sinusfunktion

Ziehe bei $f(x) = \sin x$ mit eingeschaltetem Ableitungsgraphen den Punkt $P$ über den Graphen. Welche bekannte Funktion entsteht?

<details>
<summary>Lösung anzeigen</summary>

Es entsteht die Kosinusfunktion: $(\sin x)' = \cos x$. Zum Beispiel ist die Steigung bei $x = 0$ gleich $1$ und an den Hoch- und Tiefpunkten gleich $0$. [In der Simulation zeigen](?fn=sin&x0=0&h=1&trace=1&tangent=1)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 11 (Einführung der Ableitung). Die Animation **h → 0** verkleinert $h$ logarithmisch, sodass die Annäherung gleichmäßig sichtbar bleibt.
- **Tabelle:** Die Annäherungstabelle zeigt die Differenzenquotienten für $h = 1;\ 0{,}1;\ 0{,}01;\ 0{,}001$ – gut geeignet, um den Grenzwertbegriff numerisch vorzubereiten.
- **h = 0:** Stellt man $h = 0$ ein, ist der Differenzenquotient nicht definiert ($\frac{0}{0}$); die Simulation zeigt dann nur die Tangente. Ein guter Anlass, über den Unterschied zwischen „$h = 0$ einsetzen“ und „Grenzwert für $h \to 0$“ zu sprechen.
- **Typische Fehlvorstellungen:**
  - Die Tangente berührt den Graphen „nur in einem Punkt“ – bei der kubischen Funktion schneidet die Tangente den Graphen oft noch an einer anderen Stelle.
  - Sekante und Tangente werden verwechselt; Farben und Legende unterscheiden sie konsequent.
