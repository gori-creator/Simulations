---
description: "Eine Glaskugel im Raum: Kugelgleichung und Punktprobe, Schnittkreis mit einer Ebene, Passante, Tangente oder Sekante über die Diskriminante und die Tangentialebene in einem Kugelpunkt – drehbar und mit Rechnung zum Mitlesen."
---

## Worum geht es?

Eine **Kugel** $K$ mit Mittelpunkt $M$ und Radius $r$ besteht aus allen Punkten $X$, die von $M$ den Abstand $r$ haben: $|\overrightarrow{MX}| = r$. Quadriert ergibt das die **Kugelgleichung** in Vektor- und in Koordinatenform:

$$
K:\ (\vec x - \vec m)^2 = r^2 \qquad\Longleftrightarrow\qquad (x_1 - m_1)^2 + (x_2 - m_2)^2 + (x_3 - m_3)^2 = r^2
$$

Für $M(1 \mid 2 \mid 3)$ und $r = 3$ lautet sie $(x_1 - 1)^2 + (x_2 - 2)^2 + (x_3 - 3)^2 = 9$.

**Punktprobe:** Man setzt einen Punkt $P$ in die linke Seite ein und vergleicht mit $r^2$. Kleiner heißt innerhalb, gleich heißt auf der Kugel, größer heißt außerhalb. Beispiel: $P(1 \mid 7 \mid 3)$ ergibt $0 + 25 + 0 = 25 > 9$, also liegt $P$ außerhalb.

**Kugel und Ebene:** Entscheidend ist der Abstand $d$ des Mittelpunkts von der Ebene $E:\ n_1x_1 + n_2x_2 + n_3x_3 = c$ (Hessesche Normalform):

$$
d = \frac{|\vec n \cdot \vec m - c|}{|\vec n|}
$$

- $d > r$: kein gemeinsamer Punkt,
- $d = r$: $E$ berührt $K$ in genau einem Punkt (Tangentialebene),
- $d < r$: $E$ schneidet $K$ in einem **Schnittkreis**. Sein Mittelpunkt $M'$ ist der Lotfußpunkt von $M$ auf $E$, sein Radius folgt aus dem Satz des Pythagoras: $\rho = \sqrt{r^2 - d^2}$. Geht $E$ durch $M$, ist der Schnittkreis ein **Großkreis** mit $\rho = r$.

**Kugel und Gerade:** Man setzt $g:\ \vec x = \vec a + t \cdot \vec u$ in die Kugelgleichung ein und erhält eine quadratische Gleichung $At^2 + Bt + C = 0$. Ihre Diskriminante $D = B^2 - 4AC$ entscheidet: $D > 0$ **Sekante** (zwei Schnittpunkte), $D = 0$ **Tangente** (ein Berührpunkt), $D < 0$ **Passante** (kein gemeinsamer Punkt).

**Tangentialebene:** In einem Punkt $B$ der Kugel steht die Tangentialebene senkrecht auf dem Radius $\overrightarrow{MB}$. Dieser Vektor ist also ein Normalenvektor:

$$
T:\ (\vec x - \vec b) \cdot (\vec b - \vec m) = 0
$$

## Ausprobieren

1. Ziehe den Punkt $P$ durch den Raum und beobachte die Punktprobe in der Tafel. Wann wird aus „$>$“ ein „$=$“? [Punkt auf K](?p1=1&p2=2&p3=6)
2. Ziehe den Mittelpunkt $M$ und den Radius (Griff rechts unten an der Kugel). Wie ändert sich die Koordinatenform?
3. Wähle „Kugel und Ebene“ und tippe auf **Ebene durch die Kugel schieben**. Der Schnittkreis wächst bis zum Großkreis und schrumpft wieder zu einem Punkt. [Ebene laden](?mode=plane)
4. Lege die Ebene durch den Mittelpunkt. Wie groß ist $\rho$? [Großkreis](?mode=plane&n1=1&n2=1&n3=1&c=6)
5. Verschiebe bei „Kugel und Gerade“ die Gerade $x_3$-parallel immer weiter nach außen: Sekante, Tangente, Passante. Achte auf das Vorzeichen von $D$. [Tangente](?mode=line&a1=4&a2=2&a3=0&u1=0&u2=0&u3=1) · [Passante](?mode=line&a1=5&a2=2&a3=0&u1=0&u2=0&u3=1)
6. Ziehe bei „Tangentialebene“ den Punkt $B$ über die Kugel. Der rechte Winkel zwischen $\overrightarrow{MB}$ und der Ebene bleibt immer erhalten. [Tangentialebene](?mode=tangent)
7. Starte den **Rundflug**: Erst von allen Seiten sieht man, dass der Schnittkreis wirklich in der Ebene liegt.

## Aufgaben

### Aufgabe 1: Punktprobe

Gegeben ist die Kugel $K$ mit $M(1 \mid 2 \mid 3)$ und $r = 3$. Stelle zuerst selbst die Kugelgleichung auf (die Simulation zeigt sie zur Kontrolle) und prüfe dann, ob $P(1 \mid 2 \mid 6)$, $Q(2 \mid 2 \mid 3)$ und $R(5 \mid 2 \mid 3)$ innerhalb, auf oder außerhalb von $K$ liegen. [Aufgabe laden](?p1=1&p2=2&p3=6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$K:\ (x_1 - 1)^2 + (x_2 - 2)^2 + (x_3 - 3)^2 = 9$.
$P$: $0 + 0 + 9 = 9$, also auf $K$. $Q$: $1 + 0 + 0 = 1 < 9$, innerhalb. $R$: $16 + 0 + 0 = 16 > 9$, außerhalb. [P zeigen](?p1=1&p2=2&p3=6) · [Q zeigen](?p1=2&p2=2&p3=3) · [R zeigen](?p1=5&p2=2&p3=3)

</details>

### Aufgabe 2: Schnittkreis

Die Ebene $E:\ x_3 = 5$ schneidet $K$. Berechne Mittelpunkt und Radius des Schnittkreises. [Aufgabe laden](?mode=plane&n1=0&n2=0&n3=1&c=5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$d = |3 - 5| = 2 < 3$, also Schnittkreis. Der Lotfußpunkt liegt senkrecht über $M$: $M'(1 \mid 2 \mid 5)$. Radius $\rho = \sqrt{9 - 4} = \sqrt 5 \approx 2{,}24$. [In der Simulation zeigen](?mode=plane&n1=0&n2=0&n3=1&c=5)

</details>

### Aufgabe 3: Berührende Ebenen

Für welche Werte von $c$ berührt die Ebene $x_3 = c$ die Kugel $K$? Gib die Berührpunkte an. [Aufgabe laden](?mode=plane&n1=0&n2=0&n3=1&c=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Berühren heißt $d = |3 - c| = 3$, also $c = 6$ oder $c = 0$. Berührpunkte $(1 \mid 2 \mid 6)$ und $(1 \mid 2 \mid 0)$ – der „Nordpol“ und der „Südpol“ der Kugel. [c = 6](?mode=plane&n1=0&n2=0&n3=1&c=6) · [c = 0](?mode=plane&n1=0&n2=0&n3=1&c=0)

</details>

### Aufgabe 4: Gerade durch die Kugel

Bestimme die gemeinsamen Punkte von $K$ und $g:\ \vec x = \begin{pmatrix} 1 \\ 2 \\ -5 \end{pmatrix} + t \cdot \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}$. [Aufgabe laden](?mode=line&a1=1&a2=2&a3=-5&u1=0&u2=0&u3=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Einsetzen: $0^2 + 0^2 + (-5 + t - 3)^2 = 9$, also $(t - 8)^2 = 9$ bzw. $t^2 - 16t + 55 = 0$. $D = 256 - 220 = 36 > 0$: Sekante. $t_1 = 5$, $t_2 = 11$, Schnittpunkte $S_1(1 \mid 2 \mid 0)$ und $S_2(1 \mid 2 \mid 6)$. [In der Simulation zeigen](?mode=line&a1=1&a2=2&a3=-5&u1=0&u2=0&u3=1)

</details>

### Aufgabe 5: Tangentialebene

Zeige, dass $B(3 \mid 4 \mid 4)$ auf $K$ liegt, und bestimme die Tangentialebene in $B$ in Koordinatenform. [Aufgabe laden](?mode=tangent&b1=3&b2=4&b3=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Punktprobe: $4 + 4 + 1 = 9$ ✓. Normalenvektor $\overrightarrow{MB} = \begin{pmatrix} 2 \\ 2 \\ 1 \end{pmatrix}$, also $2x_1 + 2x_2 + x_3 = c$ mit $c = 2 \cdot 3 + 2 \cdot 4 + 4 = 18$: $T:\ 2x_1 + 2x_2 + x_3 = 18$. [In der Simulation zeigen](?mode=tangent&b1=3&b2=4&b3=4)

</details>

### Aufgabe 6: Schräge Ebene

Untersuche die Lage von $E:\ 2x_1 - x_2 + 2x_3 = 12$ zur Kugel $K$ und berechne gegebenenfalls Mittelpunkt und Radius des Schnittkreises. [Aufgabe laden](?mode=plane&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$d = \frac{|2 - 2 + 6 - 12|}{\sqrt{4 + 1 + 4}} = \frac{6}{3} = 2 < 3$: Schnittkreis mit $\rho = \sqrt 5$. Lotgerade $\vec x = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + s \begin{pmatrix} 2 \\ -1 \\ 2 \end{pmatrix}$ in $E$ einsetzen: $6 + 9s = 12$, $s = \tfrac23$, also $M'\left(\tfrac73 \mid \tfrac43 \mid \tfrac{13}3\right)$. [In der Simulation zeigen](?mode=plane)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe, analytische Geometrie: die Kugel mit Kugelgleichung, Lage zu Ebenen und Geraden und Tangentialebene – Umfang und Gewichtung unterscheiden sich je nach Lehrplan. Geeignet als Einstieg (Kugel als Punktmenge) und zur Übung.
- **Verbindung zu Bekanntem:** Die Kugelgleichung ist der räumliche Abstand $|\overrightarrow{MX}|$ – wie die Kreisgleichung in der Ebene. Der Schnittkreis greift den Abstand Punkt–Ebene und den Satz des Pythagoras auf.
- **Animation als Gesprächsanlass:** Beim Durchschieben der Ebene kann die Klasse vorher vermuten, wie $\rho$ von $d$ abhängt (kein linearer Zusammenhang, sondern ein Viertelkreis).
- **Häufige Stolpersteine:**
  - In der Kugelgleichung werden die Vorzeichen verwechselt: Zu $M(1 \mid -2 \mid 3)$ gehört $(x_2 + 2)^2$.
  - Rechts steht $r^2$, nicht $r$ – die Punktprobe vergleicht mit $r^2$.
  - Als Radius des Schnittkreises wird $r$ oder $r - d$ angegeben statt $\sqrt{r^2 - d^2}$.
  - Beim Abstand Punkt–Ebene wird vergessen, durch $|\vec n|$ zu teilen.
  - Bei der Tangentialebene wird $\vec b$ statt $\vec b - \vec m$ als Normalenvektor genommen.
