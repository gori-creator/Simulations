## Worum geht es?

Die **Sekante** ist die Gerade durch zwei Punkte des Graphen: $P(x_0 \mid f(x_0))$ und $Q(x_0 + h \mid f(x_0 + h))$. Ihre Steigung ist der **Differenzenquotient**

$$
m_s = \frac{f(x_0 + h) - f(x_0)}{h}.
$$

Er beschreibt die **mittlere Änderungsrate** von $f$ zwischen $x_0$ und $x_0 + h$. Im Steigungsdreieck ist $h$ die waagrechte und $\Delta y = f(x_0 + h) - f(x_0)$ die senkrechte Seite.

Lässt man $Q$ immer näher an $P$ heranrücken ($h \to 0$), dreht sich die Sekante in eine Grenzlage: die **Tangente** in $P$. Ihre Steigung ist die **Ableitung** von $f$ an der Stelle $x_0$ (lokale Änderungsrate):

$$
f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}.
$$

Wichtig: $h = 0$ darf man **nicht einsetzen**. Dann stünde $\frac{0}{0}$ da, und durch $0$ kann man nicht teilen. Man betrachtet, wogegen $m_s$ strebt, wenn $h$ immer kleiner wird – von rechts ($h > 0$) und von links ($h < 0$).

### Beispiel: $f(x) = x^2$ (h-Methode)

$$
m_s = \frac{(x_0 + h)^2 - x_0^2}{h} = \frac{2x_0 h + h^2}{h} = 2x_0 + h \;\xrightarrow{\;h \to 0\;}\; 2x_0
$$

Das Kürzen durch $h$ ist erlaubt, solange $h \neq 0$ ist. Also ist $f'(x_0) = 2x_0$, z. B. $f'(1) = 2$. Die Tangente in $P(1 \mid 1)$ hat die Gleichung $y = 2(x - 1) + 1 = 2x - 1$.

### Wenn es keinen Grenzwert gibt: der Knick bei $|x|$

Bei $f(x) = |x|$ und $x_0 = 0$ ist $m_s = \frac{|h|}{h}$. Für jedes $h > 0$ ergibt das $1$, für jedes $h < 0$ ergibt das $-1$. Von rechts und von links kommt also nicht dasselbe heraus. Der Grenzwert existiert nicht, $f$ ist an der Stelle $0$ **nicht differenzierbar**. Am Graphen sieht man einen **Knick**, und es gibt dort keine Tangente.

## Ausprobieren

1. Ziehe $Q$ in Richtung $P$ oder drücke **h → 0**. Beobachte den Differenzenquotienten und die Tabelle.
2. Wähle ein negatives $h$: $Q$ liegt dann links von $P$. Ist der Grenzwert derselbe? [h negativ](?h=-1.5)
3. Stelle $h = 0$ ein. Was zeigt die Simulation an, und warum?
4. Blende die Tangente ein und verschiebe $P$. Wo ist die Tangente waagrecht? [Kubische Funktion](?fn=cubic&x0=-1&h=2&tangent=1)
5. Schalte **Ableitungsgraph f′ entstehen lassen** ein und ziehe $P$ langsam von links nach rechts. Welche Funktion entsteht bei $\sin x$? [Sinus](?fn=sin&x0=0.5&h=1&trace=1)
6. Wähle $f(x) = |x|$ mit $x_0 = 0$. Vergleiche die Tabelle für positives und für negatives $h$. [Knick bei |x|](?fn=abs&x0=0&h=1)

## Aufgaben

### Aufgabe 1: Differenzenquotienten berechnen

Berechne für $f(x) = x^2$ und $x_0 = 1$ den Differenzenquotienten für $h = 1$, $h = 0{,}5$ und $h = 0{,}1$. Rechne zuerst von Hand und vergleiche dann mit der Tabelle. Gegen welchen Wert streben die Ergebnisse?

<details>
<summary>Lösung anzeigen</summary>

- $h = 1$: $\frac{4 - 1}{1} = 3$
- $h = 0{,}5$: $\frac{2{,}25 - 1}{0{,}5} = 2{,}5$
- $h = 0{,}1$: $\frac{1{,}21 - 1}{0{,}1} = 2{,}1$

Allgemein ist $m_s = 2 + h$, die Werte streben gegen $f'(1) = 2$. [In der Simulation zeigen](?x0=1&h=0.5)

</details>

### Aufgabe 2: h-Methode mit negativem h

Bestimme mit der h-Methode die Ableitung von $f(x) = x^2$ an der Stelle $x_0 = -2$. Berechne außerdem $m_s$ für $h = 1$ und für $h = -1$. Was bedeutet das Vorzeichen von $f'(-2)$?

<details>
<summary>Lösung anzeigen</summary>

$m_s = 2x_0 + h = -4 + h$. Für $h = 1$ ist $m_s = -3$, für $h = -1$ ist $m_s = -5$. Von beiden Seiten strebt $m_s$ gegen $-4$, also $f'(-2) = -4$. Die Tangente fällt: Der Graph ist an dieser Stelle fallend. [In der Simulation zeigen](?x0=-2&h=1&tangent=1)

</details>

### Aufgabe 3: Waagrechte Tangente

Bei $f(x) = 0{,}25x^3 - x$ gibt es zwei Stellen mit waagrechter Tangente. Suche sie in der Simulation und berechne sie mit $f'(x) = 0{,}75x^2 - 1$.

<details>
<summary>Lösung anzeigen</summary>

$0{,}75x^2 - 1 = 0 \Rightarrow x^2 = \frac{4}{3} \Rightarrow x = \pm\frac{2}{\sqrt{3}} \approx \pm 1{,}15$. Dort liegen ein Hochpunkt ($x \approx -1{,}15$) und ein Tiefpunkt ($x \approx 1{,}15$). Bei $x_0 = 1{,}15$ zeigt die Simulation $f'(1{,}15) \approx -0{,}008$, weil $1{,}15$ nur gerundet ist. [In der Simulation zeigen](?fn=cubic&x0=1.15&h=0.8&tangent=1)

</details>

### Aufgabe 4: Ableitung der Sinusfunktion

Ziehe bei $f(x) = \sin x$ mit eingeschaltetem Ableitungsgraphen den Punkt $P$ über den Graphen. Welche bekannte Funktion entsteht?

<details>
<summary>Lösung anzeigen</summary>

Es entsteht die Kosinusfunktion: $(\sin x)' = \cos x$. Zum Beispiel ist die Steigung bei $x = 0$ gleich $1$ und an den Hoch- und Tiefpunkten gleich $0$. [In der Simulation zeigen](?fn=sin&x0=0&h=1&trace=1&tangent=1)

</details>

### Aufgabe 5: Tangente an die e-Funktion

Berechne für $f(x) = e^x$ und $x_0 = 0$ den Differenzenquotienten für $h = 1$ und $h = 0{,}1$ mit dem Taschenrechner. Schätze daraus $f'(0)$ und gib die Gleichung der Tangente in $P(0 \mid 1)$ an.

<details>
<summary>Lösung anzeigen</summary>

- $h = 1$: $\frac{e - 1}{1} \approx 1{,}718$
- $h = 0{,}1$: $\frac{e^{0{,}1} - 1}{0{,}1} \approx 1{,}052$

Die Werte streben gegen $f'(0) = 1$. Die Tangente ist $y = x + 1$. [In der Simulation zeigen](?fn=exp&x0=0&h=0.1&tangent=1)

</details>

### Aufgabe 6: Knick bei $|x|$

Berechne für $f(x) = |x|$ an der Stelle $x_0 = 0$ den Differenzenquotienten für $h = 0{,}1$ und für $h = -0{,}1$. Hat der Graph bei $0$ eine Tangente?

<details>
<summary>Lösung anzeigen</summary>

$h = 0{,}1$: $\frac{0{,}1 - 0}{0{,}1} = 1$. $\;h = -0{,}1$: $\frac{0{,}1 - 0}{-0{,}1} = -1$. Rechts kommt immer $1$, links immer $-1$ heraus. Es gibt keinen gemeinsamen Grenzwert, also keine Ableitung und keine Tangente bei $0$. An jeder anderen Stelle ist $|x|$ differenzierbar ($f'(x) = -1$ für $x < 0$, $f'(x) = 1$ für $x > 0$). [In der Simulation zeigen](?fn=abs&x0=0&h=-0.1&tangent=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe, Einführung der Differentialrechnung (Sekanten- und Tangentensteigung, mittlere und lokale Änderungsrate, Ableitungsfunktion, Tangentengleichung). Die Animation **h → 0** verkleinert $h$ logarithmisch, sodass die Annäherung gleichmäßig sichtbar bleibt.
- **Tabelle:** Die Annäherungstabelle zeigt die Differenzenquotienten für $h = 1;\ 0{,}1;\ 0{,}01;\ 0{,}001$ mit dem Vorzeichen des eingestellten $h$. Sie eignet sich gut, um den Grenzwertbegriff numerisch vorzubereiten. Lassen Sie die Klasse die Werte zuerst vermuten oder von Hand rechnen.
- **h = 0:** Stellt man $h = 0$ ein, ist der Differenzenquotient nicht definiert ($\frac{0}{0}$); die Simulation zeigt dann nur die Tangente. Das ist ein guter Anlass, über den Unterschied zwischen „$h = 0$ einsetzen“ und „Grenzwert für $h \to 0$“ zu sprechen.
- **Beidseitiger Grenzwert:** Vergleichen Sie $h > 0$ und $h < 0$ zuerst bei $x^2$ (gleicher Grenzwert) und dann bei $|x|$ (verschiedene Werte). So wird greifbar, warum Differenzierbarkeit mehr verlangt als „der Graph hat keinen Sprung“.
- **Häufige Stolpersteine:**
  - „Die Tangente berührt den Graphen nur in einem Punkt“ – bei der kubischen Funktion schneidet die Tangente den Graphen oft noch an einer anderen Stelle.
  - Sekante und Tangente werden verwechselt. In der Simulation ist die Sekante durchgezogen und die Tangente gestrichelt, die Legende zeigt beide Linienarten.
  - Beim Kürzen durch $h$ wird vergessen, dass das nur für $h \neq 0$ gilt.
