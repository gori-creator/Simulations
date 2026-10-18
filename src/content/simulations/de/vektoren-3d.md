---
description: "Vektorpfeile im Raum mit ziehbaren Spitzen: Spitze an Fuß und Parallelogramm, Gegenvektor und Differenz, Vielfache, Linearkombinationen in einer Ebene und der Verbindungsvektor AB = B − A – mit Rechnung in Spaltenschreibweise."
---

## Worum geht es?

Ein **Vektor** beschreibt eine Verschiebung: wie weit in $x_1$-, $x_2$- und $x_3$-Richtung. Man schreibt ihn als Spalte, z. B. $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$, und zeichnet ihn als Pfeil. Alle gleich langen, gleich gerichteten Pfeile stellen denselben Vektor dar – man darf einen Pfeil also verschieben.

**Addition („Spitze an Fuß“):** Man hängt den Pfeil von $\vec b$ an die Spitze von $\vec a$. Der Summenpfeil führt vom Fuß von $\vec a$ zur Spitze von $\vec b$; er ist die Diagonale des von $\vec a$ und $\vec b$ aufgespannten **Parallelogramms**. Gerechnet wird komponentenweise:

$$
\begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix} + \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix} = \begin{pmatrix} 3 \\ 3 \\ 3 \end{pmatrix}
$$

**Subtraktion:** $\vec a - \vec b = \vec a + (-\vec b)$. Der **Gegenvektor** $-\vec b$ ist gleich lang wie $\vec b$, zeigt aber in die Gegenrichtung. Der Differenzpfeil führt außerdem von der Spitze von $\vec b$ zur Spitze von $\vec a$.

**Vervielfachen (S-Multiplikation):** $k \cdot \vec a$ ist parallel zu $\vec a$ und $|k|$-mal so lang; für $k < 0$ kehrt sich die Richtung um. Jede Komponente wird mit $k$ multipliziert.

**Linearkombination:** $r \cdot \vec a + s \cdot \vec b$. Sind $\vec a$ und $\vec b$ nicht parallel, liegen alle Linearkombinationen in einer **Ebene** durch den Ursprung – das ist später die Grundlage für Ebenengleichungen.

**Verbindungsvektor:** Für Punkte $A$ und $B$ gilt „Spitze minus Fuß“:

$$
\overrightarrow{AB} = \vec b - \vec a, \qquad M = \tfrac12 (A + B) \text{ ist der Mittelpunkt der Strecke } [AB].
$$

**Länge (Betrag):** $|\vec v| = \sqrt{v_1^2 + v_2^2 + v_3^2}$, z. B. $\left|\begin{pmatrix} -4 \\ 4 \\ 2 \end{pmatrix}\right| = \sqrt{36} = 6$.

## Ausprobieren

1. Spiele die **Animation** ab: Der Pfeil von $\vec b$ wandert an die Spitze von $\vec a$. Ziehe dann die Spitzen von $\vec a$ und $\vec b$ (sie bewegen sich parallel zum Bildschirm). [Beispiel laden](?op=add)
2. Vertausche gedanklich die Reihenfolge: Ist $\vec a + \vec b = \vec b + \vec a$? Wo sieht man das im Parallelogramm?
3. Bei der Subtraktion klappt $\vec b$ zum Gegenvektor um. Prüfe: Der Ergebnispfeil verbindet die Spitzen von $\vec b$ und $\vec a$. [Subtraktion](?op=sub)
4. Stelle beim Vervielfachen $k$ von $2$ auf $-1{,}5$. Was passiert mit Richtung und Länge? [Vervielfachen](?op=scale&k=-1.5)
5. Verändere bei der Linearkombination $r$ und $s$ und drehe die Ansicht, bis du auf die Kante der Ebene schaust. Liegt das Ergebnis immer in der Ebene? [Linearkombination](?op=lin&r=1.5&s=0.5)
6. Mach $\vec b$ zu einem Vielfachen von $\vec a$, z. B. $\vec b = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$. Was wird aus der Ebene? [Parallele Vektoren](?op=lin&b1=1&b2=2&b3=0)
7. Berechne beim Verbindungsvektor zuerst selbst, dann vergleiche. [Verbindungsvektor](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3)

## Aufgaben

### Aufgabe 1: Summe und Differenz

Berechne $\vec a + \vec b$ und $\vec a - \vec b$ für $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix}$ sowie die Länge von $\vec a + \vec b$. [Aufgabe laden](?op=add&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec a + \vec b = \begin{pmatrix} 3 \\ 3 \\ 3 \end{pmatrix}$, $|\vec a + \vec b| = \sqrt{27} \approx 5{,}20$. $\vec a - \vec b = \begin{pmatrix} 1 \\ 5 \\ -3 \end{pmatrix}$. [Summe zeigen](?op=add) · [Differenz zeigen](?op=sub)

</details>

### Aufgabe 2: Gegenvektor und Vielfache

Gib $-1{,}5 \cdot \vec a$ an und begründe, warum dieser Vektor $1{,}5$-mal so lang ist wie $\vec a$. [Aufgabe laden](?op=scale&k=-1.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$-1{,}5 \cdot \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix} = \begin{pmatrix} -3 \\ -6 \\ 0 \end{pmatrix}$. Länge: $\sqrt{9 + 36} = \sqrt{45} = 1{,}5 \cdot \sqrt{20}$, weil jede Komponente mit $1{,}5$ (bis aufs Vorzeichen) multipliziert wird und $|k|$ vor die Wurzel gezogen werden kann. [In der Simulation zeigen](?op=scale&k=-1.5)

</details>

### Aufgabe 3: Verbindungsvektor und Mittelpunkt

Gegeben sind $A(3 \mid -1 \mid 1)$ und $B(-1 \mid 3 \mid 3)$. Berechne $\overrightarrow{AB}$, die Länge der Strecke $[AB]$ und ihren Mittelpunkt $M$. [Aufgabe laden](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\overrightarrow{AB} = \begin{pmatrix} -1 - 3 \\ 3 - (-1) \\ 3 - 1 \end{pmatrix} = \begin{pmatrix} -4 \\ 4 \\ 2 \end{pmatrix}$, $\overline{AB} = \sqrt{16 + 16 + 4} = 6$, $M(1 \mid 1 \mid 2)$. [In der Simulation zeigen](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3)

</details>

### Aufgabe 4: Linearkombination

Stelle $\vec c = \begin{pmatrix} 3{,}5 \\ 5{,}5 \\ 1{,}5 \end{pmatrix}$ als Linearkombination von $\vec a = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$ und $\vec b = \begin{pmatrix} 1 \\ -1 \\ 3 \end{pmatrix}$ dar. Tipp: Beginne mit der dritten Komponente. [Aufgabe laden](?op=lin&r=0&s=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Dritte Komponente: $0 \cdot r + 3s = 1{,}5$, also $s = 0{,}5$. Erste: $2r + 0{,}5 = 3{,}5$, also $r = 1{,}5$. Probe zweite: $4 \cdot 1{,}5 - 0{,}5 = 5{,}5$ ✓. [In der Simulation zeigen](?op=lin&r=1.5&s=0.5)

</details>

### Aufgabe 5: Parallelogramm ergänzen

Die Punkte $A(3 \mid -1 \mid 1)$, $B(-1 \mid 3 \mid 3)$ und $C(0 \mid 4 \mid 0)$ sind Ecken eines Parallelogramms $ABCD$. Berechne $D$.

<details>
<summary>Lösung anzeigen</summary>

$\overrightarrow{AD} = \overrightarrow{BC} = \begin{pmatrix} 1 \\ 1 \\ -3 \end{pmatrix}$, also $D = A + \overrightarrow{BC} = (4 \mid 0 \mid -2)$.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12, Lernbereich „Grundlagen der Koordinatengeometrie im Raum“ (LehrplanPLUS Bayern, Gymnasium): Vektoren addieren und vervielfachen, Verbindungsvektor, Mittelpunkt.
- **Vektor als Klasse von Pfeilen:** Die verschobene Kopie von $\vec b$ an der Spitze von $\vec a$ kann zeigen, dass ein Vektor nicht an einen Ort gebunden ist; der Ortsvektor ist ein besonderer Repräsentant.
- **Ausblick:** Die Ebene im Modus Linearkombination lässt sich später als Parameterform $\vec x = r \cdot \vec a + s \cdot \vec b$ wieder aufgreifen.
- **Häufige Stolpersteine:**
  - Beim Verbindungsvektor wird „Fuß minus Spitze“ gerechnet ($\vec a - \vec b$ statt $\vec b - \vec a$).
  - Bei der Subtraktion wird das Vorzeichen nur bei einer Komponente gewechselt.
  - Die Länge der Summe wird als Summe der Längen berechnet ($|\vec a + \vec b| \ne |\vec a| + |\vec b|$ im Allgemeinen).
  - Punkte und Vektoren werden vermischt: Punkte in Zeilen mit Strichen, Vektoren als Spalten.
