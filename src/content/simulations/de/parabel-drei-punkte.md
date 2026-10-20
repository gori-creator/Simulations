---
description: "Interaktive Simulation: Drei Punkte bestimmen genau eine Parabel y = ax² + bx + c. Einsetzen ergibt ein lineares Gleichungssystem, das Schritt für Schritt gelöst wird – dazu Scheitel- und Nullstellenform, Sonderfälle sowie Wurfbahn und Brückenbogen."
---

## Worum geht es?

Durch zwei Punkte geht genau eine Gerade. Für eine **Parabel** $y = ax^2 + bx + c$ braucht man **drei Punkte**, denn es sind drei Zahlen $a$, $b$, $c$ zu bestimmen. Setzt man jeden Punkt $P_i(x_i \mid y_i)$ in den Ansatz ein, entsteht für jeden Punkt eine Gleichung – zusammen ein **lineares Gleichungssystem** mit drei Unbekannten:

$$
\begin{aligned}
\text{I:}\quad & x_1^2\,a + x_1\,b + c = y_1\\
\text{II:}\quad & x_2^2\,a + x_2\,b + c = y_2\\
\text{III:}\quad & x_3^2\,a + x_3\,b + c = y_3
\end{aligned}
$$

Die Unbekannten sind hier $a$, $b$ und $c$ – die Koordinaten der Punkte sind bekannte Zahlen. Gelöst wird mit dem **Additionsverfahren**:

1. **c eliminieren:** $\text{IV} = \text{II} - \text{I}$ und $\text{V} = \text{III} - \text{I}$ enthalten nur noch $a$ und $b$. Liegt ein Punkt auf der $y$-Achse ($x = 0$), liest man sofort $c = y$ ab und setzt es ein.
2. **b eliminieren:** IV und V mit passenden Zahlen multiplizieren und subtrahieren – übrig bleibt eine Gleichung für $a$.
3. **Zurückrechnen:** $a$ in IV einsetzen liefert $b$, $a$ und $b$ in I einsetzen liefert $c$.

Beispiel mit $P_1(-1 \mid 1{,}5)$, $P_2(2 \mid 3)$, $P_3(4 \mid -1)$: Aus $a - b + c = 1{,}5$, $4a + 2b + c = 3$ und $16a + 4b + c = -1$ wird $\text{IV}: 3a + 3b = 1{,}5$ und $\text{V}: 15a + 5b = -2{,}5$. Dann $5 \cdot \text{IV} - 3 \cdot \text{V}: -30a = 15$, also $a = -\frac{1}{2}$, $b = 1$, $c = 3$:

$$
f(x) = -\tfrac{1}{2}x^2 + x + 3
$$

**Kürzere Wege, wenn die Punkte besonders liegen:**

- Ist ein Punkt der **Scheitel** $S(x_S \mid y_S)$, hilft die Scheitelform $y = a(x - x_S)^2 + y_S$. Ein weiterer Punkt liefert $a$.
- Liegen zwei Punkte auf der $x$-Achse, sind es **Nullstellen** $x_1$, $x_2$: $y = a(x - x_1)(x - x_2)$. Der dritte Punkt liefert $a$.

**Sonderfälle:**

- Haben zwei Punkte denselben $x$-Wert, aber verschiedene $y$-Werte, gibt es **keine** Funktion durch sie. Im Gleichungssystem zeigt sich das als Widerspruch wie $0 = -4{,}5$.
- Fallen zwei Punkte zusammen, fehlt eine Bedingung: **Unendlich viele** Parabeln gehen hindurch.
- Liegen die drei Punkte auf einer **Geraden**, ergibt die Rechnung $a = 0$. Dann ist $f(x) = bx + c$ eine lineare Funktion und keine Parabel.

## Ausprobieren

1. Ziehe die drei Punkte. Die Parabel gleitet mit und geht immer durch alle drei. Wann ist sie nach oben, wann nach unten geöffnet? [Beispiel laden](?x1=-1&y1=1.5&x2=2&y2=3&x3=4&y3=-1)
2. Klicke auf **Rechenweg Schritt für Schritt**. Achte darauf, woher die farbigen Zahlen in den Gleichungen I, II und III kommen.
3. Lade die Punkte $(0 \mid 0)$, $(1 \mid 1)$ und $(2 \mid 4)$. Welche Parabel ist das? Warum steht in Gleichung I nur „c = 0“? [Beispiel laden](?x1=0&y1=0&x2=1&y2=1&x3=2&y3=4)
4. Diese drei Punkte liegen auf einer Geraden. Ziehe $P_2$ langsam nach oben und wieder zurück: Wie wird aus der Parabel eine Gerade? Was passiert mit $a$? [Beispiel laden](?x1=-2&y1=-3&x2=0&y2=1&x3=2&y3=5)
5. Hier haben $P_1$ und $P_2$ denselben $x$-Wert. Warum kann keine Funktion durch beide gehen? Welche Gleichung entsteht bei II − I? [Beispiel laden](?x1=1&y1=3&x2=1&y2=-1.5&x3=3.5&y3=1)
6. Lege zwei Punkte genau aufeinander. Wie viele Parabeln gibt es jetzt? [Beispiel laden](?x1=1&y1=2&x2=1&y2=2&x3=3&y3=-1)
7. Stelle den Lösungsweg **Scheitelform** ein: Hier ist $P_2$ der Scheitel. Vergleiche die Länge der Rechnung mit dem Gleichungssystem. [Beispiel laden](?way=vertex&x1=-1&y1=2&x2=1&y2=-2&x3=2&y3=-1)
8. Wähle die Anwendung **Wurfbahn eines Balls** und wirf den Ball. Wo landet er? [Beispiel laden](?scene=ball&x1=-5&y1=1&x2=-3&y2=4&x3=3&y3=1)

## Aufgaben

### Aufgabe 1: Gleichungssystem aufstellen und lösen

Bestimme die Parabel durch $A(0 \mid 1)$, $B(1 \mid 0)$ und $C(2 \mid 3)$. [Aufgabe laden](?x1=0&y1=1&x2=1&y2=0&x3=2&y3=3&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Aus $A$ folgt sofort $c = 1$. Einsetzen von $B$ und $C$: $a + b + 1 = 0$ und $4a + 2b + 1 = 3$, also $a + b = -1$ und $4a + 2b = 2$. Doppelte erste Gleichung abziehen: $2a = 4$, also $a = 2$ und $b = -3$.
$f(x) = 2x^2 - 3x + 1$. [In der Simulation zeigen](?x1=0&y1=1&x2=1&y2=0&x3=2&y3=3)

</details>

### Aufgabe 2: Scheitel gegeben

Eine Parabel hat den Scheitel $S(2 \mid -3)$ und geht durch $P(4 \mid 1)$. Bestimme ihren Term in Scheitelform und in allgemeiner Form.

<details>
<summary>Lösung anzeigen</summary>

$y = a(x - 2)^2 - 3$. Einsetzen von $P$: $1 = a \cdot 4 - 3$, also $a = 1$. $f(x) = (x - 2)^2 - 3 = x^2 - 4x + 1$. Wegen der Symmetrie liegt auch $(0 \mid 1)$ auf der Parabel. [In der Simulation zeigen](?way=vertex&x1=0&y1=1&x2=2&y2=-3&x3=4&y3=1)

</details>

### Aufgabe 3: Nullstellen gegeben

Eine Parabel hat die Nullstellen $-2$ und $4$ und geht durch $(2 \mid 4)$. Bestimme den Funktionsterm.

<details>
<summary>Lösung anzeigen</summary>

$y = a(x + 2)(x - 4)$. Einsetzen: $4 = a \cdot 4 \cdot (-2) = -8a$, also $a = -\frac{1}{2}$.
$f(x) = -\frac{1}{2}(x + 2)(x - 4) = -\frac{1}{2}x^2 + x + 4$. [In der Simulation zeigen](?way=roots&x1=-2&y1=0&x2=4&y2=0&x3=2&y3=4)

</details>

### Aufgabe 4: Parabel oder nicht?

Gibt es eine Parabel durch $(-1 \mid -1)$, $(1 \mid 3)$ und $(2{,}5 \mid 6)$? Begründe mit dem Gleichungssystem.

<details>
<summary>Lösung anzeigen</summary>

$\text{II} - \text{I}: 2b = 4$, also $b = 2$; $\text{III} - \text{II}: 5{,}25a + 1{,}5b = 3$, mit $b = 2$ also $a = 0$; dann $c = 1$. Weil $a = 0$ ist, liegen die Punkte auf der Geraden $y = 2x + 1$. Es gibt also keine Parabel durch sie. [In der Simulation zeigen](?x1=-1&y1=-1&x2=1&y2=3&x3=2.5&y3=6)

</details>

### Aufgabe 5: Wurfbahn

Von einem geworfenen Ball wurden drei Positionen gemessen (Einheit 1 m): $(-5 \mid 1)$, $(-3 \mid 4)$, $(3 \mid 1)$. Bestimme die Wurfparabel, die größte Höhe und den Landepunkt.

<details>
<summary>Lösung anzeigen</summary>

Die Punkte $(-5 \mid 1)$ und $(3 \mid 1)$ sind gleich hoch, also liegt der Scheitel bei $x = -1$: $y = a(x + 1)^2 + e$. Einsetzen: $16a + e = 1$ und $4a + e = 4$, also $a = -\frac{1}{4}$ und $e = 5$. Damit gilt $f(x) = -\frac{1}{4}x^2 - \frac{1}{2}x + 4{,}75$, die größte Höhe ist $5\,\text{m}$. Landepunkt: $(x + 1)^2 = 20$, also $x = -1 + \sqrt{20} \approx 3{,}47$. [In der Simulation zeigen](?scene=ball&x1=-5&y1=1&x2=-3&y2=4&x3=3&y3=1)

</details>

### Aufgabe 6: Brückenbogen

Ein parabelförmiger Brückenbogen ist am Boden $10\,\text{m}$ breit und in der Mitte $5\,\text{m}$ hoch. Wie hoch ist der Bogen $3\,\text{m}$ neben der Mitte?

<details>
<summary>Lösung anzeigen</summary>

Koordinatensystem mit der Mitte auf der $y$-Achse: Punkte $(-5 \mid 0)$, $(0 \mid 5)$, $(5 \mid 0)$. Aus $(0 \mid 5)$ folgt $c = 5$, aus der Symmetrie $b = 0$, aus $25a + 5 = 0$ folgt $a = -\frac{1}{5}$. $f(3) = -\frac{9}{5} + 5 = 3{,}2$, der Bogen ist dort also $3{,}2\,\text{m}$ hoch. [In der Simulation zeigen](?scene=bridge&x1=-5&y1=0&x2=0&y2=5&x3=5&y3=0)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 9, Lernbereich „Quadratische Funktionen“ (LehrplanPLUS Bayern, Gymnasium). Die Simulation verbindet die Parabel mit dem Lösen linearer Gleichungssysteme. Wie weit Systeme mit drei Unbekannten in Jahrgangsstufe 9 verbindlich sind, bitte am eigenen Lehrplan und Lehrwerk prüfen. Gut geeignet zur Vertiefung und zum Modellieren (Wurfbahn, Brückenbogen).
- **Bedienung:** Die Punkte rasten auf das $0{,}5$er-Gitter ein, damit die Rechnung exakt bleibt. Nicht abbrechende Ergebnisse erscheinen als gekürzter Bruch. Der Term oben links im Bild ist auf zwei Nachkommastellen gerundet.
- **Rechenweg:** Gezeigt wird das Additionsverfahren mit $\text{II} - \text{I}$ und $\text{III} - \text{I}$. Liegt ein Punkt auf der $y$-Achse, wird $c$ direkt abgelesen. Andere Reihenfolgen sind genauso richtig; ein Vergleich mit Schülerlösungen lohnt sich.
- **Häufige Stolpersteine:**
  - „$x$ und $y$ sind die Unbekannten.“ – Beim Aufstellen sind $a$, $b$, $c$ gesucht, die Koordinaten sind bekannte Zahlen.
  - Vorzeichenfehler beim Quadrieren: $(-2)^2 = 4$, nicht $-4$. Die Animation zeigt zuerst die eingesetzte Form mit Klammern.
  - „Durch drei Punkte geht immer eine Parabel.“ – Nicht bei gleichen $x$-Werten (keine Funktion) und nicht bei Punkten auf einer Geraden ($a = 0$).
- **Aufgabenmodus:** Mit `calc=0` und **Teilen → Ergebnisse verdecken** sind Rechenweg, Term und Scheitel verdeckt. Die Parabel bleibt sichtbar und dient zur Kontrolle.
