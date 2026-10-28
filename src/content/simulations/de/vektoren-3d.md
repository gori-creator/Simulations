---
description: "Vektorpfeile im Raum mit ziehbaren Spitzen: Spitze an Fuß, Differenz, Vielfache, Linearkombinationen, Verbindungsvektor, eine Linearkombination finden, Vektorzüge im Spat, Länge und Einheitsvektor, Schwerpunkt und Teilpunkt sowie ein Zufallsweg aus vielen Einheitsschritten – mit Rechnung in Spaltenschreibweise."
---

## Worum geht es?

Ein **Vektor** beschreibt eine Verschiebung, z. B. $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$. Alle gleich langen, gleich gerichteten Pfeile stellen denselben Vektor dar.

- **Addition („Spitze an Fuß“):** Der Summenpfeil ist die Diagonale des Parallelogramms; gerechnet wird komponentenweise, z. B. $\begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix} + \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix} = \begin{pmatrix} 3 \\ 3 \\ 3 \end{pmatrix}$.
- **Subtraktion:** $\vec a - \vec b = \vec a + (-\vec b)$ mit dem Gegenvektor $-\vec b$.
- **Vielfaches:** $k \cdot \vec a$ ist parallel zu $\vec a$ und $|k|$-mal so lang; für $k < 0$ kehrt sich die Richtung um.
- **Linearkombination:** Alle $r \cdot \vec a + s \cdot \vec b$ liegen in einer Ebene durch $O$ (wenn $\vec a \nparallel \vec b$).
- **Verbindungsvektor:** $\overrightarrow{AB} = \vec b - \vec a$ („Spitze minus Fuß“), Mittelpunkt $M = \tfrac12 (A + B)$.

**Länge und Einheitsvektor:** Zweimal Pythagoras – erst $d_{12} = \sqrt{v_1^2 + v_2^2}$ in der $x_1x_2$-Ebene, dann mit der Höhe:

$$
|\vec v| = \sqrt{v_1^2 + v_2^2 + v_3^2}, \qquad \left|\begin{pmatrix} 1 \\ 2 \\ 2 \end{pmatrix}\right| = \sqrt{9} = 3, \qquad \vec v^{\,0} = \frac{1}{|\vec v|} \cdot \vec v = \begin{pmatrix} \frac13 \\ \frac23 \\ \frac23 \end{pmatrix}.
$$

Der **Einheitsvektor** hat die Länge $1$ und endet auf der Einheitskugel. Der Nullvektor hat keinen.

**Schwerpunkt und Teilpunkt:** Der Schwerpunkt eines Dreiecks ist $S = \tfrac13 (A + B + C)$. Er teilt jede Seitenhalbierende im Verhältnis $2 : 1$ (von der Ecke aus). Ein Punkt $T = A + t \cdot \overrightarrow{AB}$ teilt die Strecke $[AB]$ im Verhältnis $t : (1 - t)$; für $t < 0$ oder $t > 1$ liegt er außerhalb.

**Zufallsweg:** Jeder Schritt ist einer der sechs Einheitsvektoren $\pm\vec e_1, \pm\vec e_2, \pm\vec e_3$. Die Summe $\vec s$ zeigt vom Start zum Ziel; sortiert man die Schritte, endet der Weg am selben Punkt (die Reihenfolge beim Addieren ist egal). Im Mittel ist $|\vec s|^2 = n$, der typische Abstand wächst also nur wie $\sqrt n$.

**Sonderfälle** werden angesagt: Nullvektor, parallele Vektoren, flacher Spat, Punkte auf einer Geraden (kein Dreieck), Rückkehr zum Ursprung.

## Ausprobieren

1. Spiele die **Animation** ab und ziehe die Spitzen von $\vec a$ und $\vec b$. Ist $\vec a + \vec b = \vec b + \vec a$? [Addition](?op=add)
2. Stelle beim Vervielfachen $k = -1{,}5$ ein. Was passiert mit Richtung und Länge? [Vervielfachen](?op=scale&k=-1.5)
3. **Finden:** Ziehe die rote Spitze, bis sie genau auf $\vec c$ zeigt. [Ziel in der Ebene](?op=goal&c1=3&c2=3&c3=3&r=0.5&s=0.5) · [Ziel außerhalb](?op=goal&c1=0&c2=0&c3=3&r=0.5&s=0.5)
4. **Spat:** Tippe Ecken an. Welcher Vektorzug führt zur Ecke $\vec b + \vec c$? [Spat](?op=spat&a1=3&a2=0&a3=0&b1=1&b2=3&b3=0&c1=0.5&c2=0.5&c3=2.5)
5. **Länge:** Finde fünf ganzzahlige Vektoren der Länge $3$. Danach erscheint die Kugel mit allen Lösungen. [Länge 3](?op=len&a1=1&a2=1&a3=1)
6. **Schwerpunkt:** Ziehe $A$, $B$ oder $C$ und beobachte das Verhältnis $2 : 1$. Lege dann alle drei auf eine Gerade. [Schwerpunkt](?op=tri&a1=3&a2=0&a3=0&b1=0&b2=3&b3=0&c1=0&c2=0&c3=3)
7. **Teilpunkt:** Ziehe $T$ entlang der Geraden $AB$ – auch über $B$ hinaus. [Teilpunkt](?op=tri&a1=3&a2=0&a3=0&b1=-1&b2=4&b3=0&c1=0&c2=0&c3=3&tp=1&t=0.25&med=0)
8. **Zufallsweg:** Mache 100 Schritte und sortiere sie dann. [Zufallsweg](?op=walk) · Vergleiche 500 Wege und tippe einen Balken an. [Viele Wege](?op=walk&many=1&wn=20)

## Aufgaben

### Aufgabe 1: Summe, Differenz, Länge

Berechne für $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix}$ die Vektoren $\vec a + \vec b$, $\vec a - \vec b$ und $|\vec a + \vec b|$. [Aufgabe laden](?op=add&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec a + \vec b = \begin{pmatrix} 3 \\ 3 \\ 3 \end{pmatrix}$, $\vec a - \vec b = \begin{pmatrix} 1 \\ 5 \\ -3 \end{pmatrix}$, $|\vec a + \vec b| = \sqrt{27} \approx 5{,}20$. Zur Kontrolle: $|\vec a + \vec b| = \sqrt{27} \approx 5{,}20 < |\vec a| + |\vec b| = \sqrt{20} + \sqrt{11} \approx 7{,}79$ – die Längen addieren sich nicht. [In der Simulation zeigen](?op=add)

</details>

### Aufgabe 2: Verbindungsvektor und Mittelpunkt

Gegeben sind $A(3 \mid -1 \mid 1)$ und $B(-1 \mid 3 \mid 3)$. Berechne $\overrightarrow{AB}$, $\overline{AB}$ und $M$. [Aufgabe laden](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\overrightarrow{AB} = \begin{pmatrix} -4 \\ 4 \\ 2 \end{pmatrix}$, $\overline{AB} = \sqrt{16 + 16 + 4} = 6$, $M(1 \mid 1 \mid 2)$. [In der Simulation zeigen](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3)

</details>

### Aufgabe 3: Geht es oder nicht?

Lässt sich $\vec c = \begin{pmatrix} 0 \\ 0 \\ 3 \end{pmatrix}$ als Linearkombination von $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$ und $\vec b = \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix}$ schreiben? [Aufgabe laden](?op=goal&c1=0&c2=0&c3=3&r=0.5&s=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Aus $2r + s = 0$ und $4r - s = 0$ folgt $r = s = 0$, dann ist die dritte Komponente $0 \ne 3$. $\vec c$ liegt nicht in der Ebene – es geht nicht. [In der Simulation zeigen](?op=goal&c1=0&c2=0&c3=3&r=0&s=0)

</details>

### Aufgabe 4: Einheitsvektor

Berechne den Einheitsvektor zu $\vec v = \begin{pmatrix} 0 \\ 3 \\ 4 \end{pmatrix}$. Wie viele Vektoren mit ganzzahligen Komponenten haben die Länge $3$? [Aufgabe laden](?op=len&a1=0&a2=3&a3=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$|\vec v| = \sqrt{0 + 9 + 16} = 5$, $\vec v^{\,0} = \begin{pmatrix} 0 \\ 0{,}6 \\ 0{,}8 \end{pmatrix}$. Länge $3$: $(\pm3 \mid 0 \mid 0)$ und Vertauschungen ($6$ Vektoren) sowie alle Vorzeichen und Vertauschungen von $(1 \mid 2 \mid 2)$ ($3 \cdot 8 = 24$) – zusammen $30$. [In der Simulation zeigen](?op=len&a1=0&a2=3&a3=4)

</details>

### Aufgabe 5: Schwerpunkt und Teilpunkt

Berechne den Schwerpunkt des Dreiecks $A(3 \mid 0 \mid 0)$, $B(0 \mid 3 \mid 0)$, $C(0 \mid 0 \mid 3)$ und prüfe $S = A + \tfrac23 \overrightarrow{AM_a}$. Welcher Punkt $T$ teilt $[AB]$ mit $B(-1 \mid 4 \mid 0)$ im Verhältnis $1 : 3$? [Aufgabe laden](?op=tri&a1=3&a2=0&a3=0&b1=0&b2=3&b3=0&c1=0&c2=0&c3=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$S = \tfrac13 (3 \mid 3 \mid 3) = (1 \mid 1 \mid 1)$; $M_a(0 \mid 1{,}5 \mid 1{,}5)$, $A + \tfrac23 \begin{pmatrix} -3 \\ 1{,}5 \\ 1{,}5 \end{pmatrix} = (1 \mid 1 \mid 1)$ ✓. Teilpunkt: $t = \tfrac14$, $T = A + \tfrac14 \begin{pmatrix} -4 \\ 4 \\ 0 \end{pmatrix} = (2 \mid 1 \mid 0)$. [In der Simulation zeigen](?op=tri&a1=3&a2=0&a3=0&b1=-1&b2=4&b3=0&c1=0&c2=0&c3=3&tp=1&t=0.25&med=0)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe, Grundlagen der Koordinatengeometrie im Raum.
- **Zufallsweg als Experiment:** Erst schätzen lassen, wie weit man nach $100$ Schritten kommt, dann simulieren; das sortierte Bild zeigt das Kommutativgesetz.
- **Häufige Stolpersteine:**
  - Beim Verbindungsvektor wird „Fuß minus Spitze“ gerechnet.
  - $|\vec a + \vec b|$ wird als $|\vec a| + |\vec b|$ berechnet.
  - Beim Einheitsvektor wird nur eine Komponente durch die Länge geteilt.
  - Der Schwerpunkt wird beim Verhältnis $2 : 1$ von der falschen Seite gemessen.
