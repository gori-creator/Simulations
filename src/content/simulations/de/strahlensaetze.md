---
description: "Interaktive Simulation für die 9. Klasse: Punkte auf zwei Strahlen ziehen und die Strahlensätze an V- und X-Figur entdecken, sehen, warum die Parallelität nötig ist, und die Sätze anwenden – Baumhöhe über den Schatten und die Breite eines Teichs."
---

## Worum geht es?

Zwei Strahlen mit gemeinsamem Anfangspunkt $Z$ werden von zwei **parallelen** Geraden geschnitten: auf dem ersten Strahl in $A$ und $A'$, auf dem zweiten in $B$ und $B'$. Dann gelten die **Strahlensätze**:

**1. Strahlensatz:** Die Abschnitte auf dem einen Strahl verhalten sich wie die entsprechenden Abschnitte auf dem anderen Strahl:

$$
\frac{\overline{ZA'}}{\overline{ZA}} = \frac{\overline{ZB'}}{\overline{ZB}} \qquad \text{und auch} \qquad \frac{\overline{ZA}}{\overline{AA'}} = \frac{\overline{ZB}}{\overline{BB'}}
$$

**2. Strahlensatz:** Die Abschnitte auf den Parallelen verhalten sich wie die zugehörigen, von $Z$ aus gemessenen Abschnitte auf einem Strahl:

$$
\frac{\overline{A'B'}}{\overline{AB}} = \frac{\overline{ZA'}}{\overline{ZA}}
$$

Der gemeinsame Wert ist der **Streckfaktor** $k$: Das Dreieck $ZA'B'$ ist eine Vergrößerung ($k > 1$) bzw. Verkleinerung ($k < 1$) des Dreiecks $ZAB$ – die beiden Dreiecke sind **ähnlich**.

Liegen die Parallelen auf verschiedenen Seiten von $Z$, spricht man von der **X-Figur**. Die Strahlensätze gelten dort genauso; man misst immer von $Z$ aus.

**Ohne Parallelen geht es nicht:** Sind $AB$ und $A'B'$ nicht parallel, sind die Verhältnisse verschieden. Umgekehrt gilt: Sind die Verhältnisse im 1. Strahlensatz gleich, so sind die Geraden parallel (**Umkehrung** des 1. Strahlensatzes).

## Ausprobieren

1. Ziehe $A'$ auf dem ersten Strahl. Wie ändern sich die drei Brüche? Ziehe danach $A$ und $B$ – wann ist $k = 2$, wann $k = 0{,}5$? [Beispiel $k = 0{,}5$](?k=0.5&a=6&b=7)
2. Drehe den ersten Strahl am Griff außen. Bleiben die Verhältnisse gleich?
3. [X-Figur](?mode=x&a=4&b=5&k=0.75&th=40): Vergleiche mit der V-Figur. Wo liegen $A'$ und $B'$?
4. [Nicht parallel](?par=0&kb=1.4): Schiebe $B'$, bis die Brüche im 1. Strahlensatz gleich werden. Was passiert dann mit $A'B'$?
5. [Baumhöhe](?mode=baum): Ziehe die Sonne. Die Schatten werden länger oder kürzer – ändert sich das Ergebnis für $h$?
6. [Teichbreite](?mode=teich): Ziehe $A'$ näher an $Z$ heran. Warum wird $\overline{A'B'}$ kleiner, die berechnete Breite aber nicht?

## Aufgaben

### Aufgabe 1: Fehlende Länge

In einer V-Figur mit $AB \parallel A'B'$ ist $\overline{ZA} = 3\,\text{cm}$, $\overline{ZA'} = 7{,}5\,\text{cm}$ und $\overline{ZB} = 4\,\text{cm}$. Berechne $\overline{ZB'}$. [Aufgabe laden](?a=3&b=4&k=2.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Nach dem 1. Strahlensatz ist $\frac{\overline{ZB'}}{4\,\text{cm}} = \frac{7{,}5\,\text{cm}}{3\,\text{cm}} = 2{,}5$, also $\overline{ZB'} = 10\,\text{cm}$. [Lösung zeigen](?a=3&b=4&k=2.5)

</details>

### Aufgabe 2: Der 2. Strahlensatz

Wie lang ist in derselben Figur $\overline{A'B'}$, wenn $\overline{AB} = 2{,}6\,\text{cm}$ ist?

<details>
<summary>Lösung anzeigen</summary>

$\overline{A'B'} = 2{,}5 \cdot 2{,}6\,\text{cm} = 6{,}5\,\text{cm}$. Achtung: Im 2. Strahlensatz muss man immer von $Z$ aus messen – $\frac{\overline{A'B'}}{\overline{AB}} = \frac{\overline{AA'}}{\overline{ZA}}$ wäre falsch.

</details>

### Aufgabe 3: Wie hoch ist der Baum?

Ein Stab ist $1{,}5\,\text{m}$ lang. Er wird so aufgestellt, dass die Spitzen seines Schattens und des Baumschattens zusammenfallen. Der Stab steht $2\,\text{m}$, der Baum $16\,\text{m}$ von der Schattenspitze entfernt. [Aufgabe laden](?mode=baum&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Nach dem 2. Strahlensatz: $\frac{h}{1{,}5\,\text{m}} = \frac{16\,\text{m}}{2\,\text{m}} = 8$, also $h = 12\,\text{m}$. Sonnenstrahlen verlaufen (fast) parallel; Stab und Baum stehen senkrecht und sind deshalb parallel. [Lösung zeigen](?mode=baum)

</details>

### Aufgabe 4: Über den Teich

Um die Breite $\overline{AB}$ eines Teichs zu bestimmen, wird die X-Figur abgesteckt: $\overline{ZA'} = \frac{1}{4}\,\overline{ZA}$ und $\overline{ZB'} = \frac{1}{4}\,\overline{ZB}$. Gemessen wird $\overline{A'B'} = 6\,\text{m}$. Wie breit ist der Teich? Warum ist $A'B'$ automatisch parallel zu $AB$? [Aufgabe laden](?mode=teich&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\overline{AB} = 4 \cdot 6\,\text{m} = 24\,\text{m}$. Die Verhältnisse auf beiden Geraden sind gleich ($4 : 1$), nach der Umkehrung des 1. Strahlensatzes sind $AB$ und $A'B'$ also parallel. [Lösung zeigen](?mode=teich)

</details>

### Aufgabe 5: Gilt der Satz?

In einer Figur ist $\overline{ZA} = 3\,\text{cm}$, $\overline{ZA'} = 6\,\text{cm}$, $\overline{ZB} = 4\,\text{cm}$ und $\overline{ZB'} = 5{,}6\,\text{cm}$. Sind $AB$ und $A'B'$ parallel?

<details>
<summary>Lösung anzeigen</summary>

Nein: $\frac{6}{3} = 2$, aber $\frac{5{,}6}{4} = 1{,}4$. Die Verhältnisse sind verschieden, also sind die Geraden nicht parallel. [Zeigen](?par=0&kb=1.4)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 9, Lernbereich „Ähnlichkeit, Strahlensätze“ (LehrplanPLUS Gymnasium Bayern). Die Simulation kann eine Vermutung anregen („Die Verhältnisse bleiben gleich – aber nur, wenn …“) und bei Anwendungsaufgaben die Modellierung sichtbar machen.
- **Draußen messen:** Die Baum- und Teichaufgabe lassen sich auf dem Schulgelände nachstellen (Stab, Maßband, Fluchtstäbe).
- **Modell:** Längen werden gerundet angezeigt; bei der Baumhöhe sind die Abstände auf Zentimeter gerundet, wie mit einem Maßband gemessen. Sonnenstrahlen werden als parallel angenommen.
- **Häufige Stolpersteine:**
  - Im 2. Strahlensatz werden die Abschnitte $\overline{AA'}$ statt $\overline{ZA'}$ verwendet.
  - Die Strahlensätze werden ohne Parallelen angewendet.
  - In der X-Figur werden Strecken über $Z$ hinweg addiert.
  - Zähler und Nenner werden zwischen den beiden Seiten der Gleichung vertauscht.
