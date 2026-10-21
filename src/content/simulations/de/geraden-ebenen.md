---
description: "Geraden und Ebenen im Raum: Ein Punkt läuft auf der Geraden x = a + t · u, Spurpunkte und Punktprobe; Ebenen in Parameterform, Umrechnung in Normalen- und Koordinatenform mit Normalenvektor, Spurpunkten und Spurdreieck."
---

## Worum geht es?

Eine **Gerade** im Raum ist durch einen Punkt $A$ und eine Richtung festgelegt. In **Parameterform**:

$$
g\colon\ \vec x = \vec a + t \cdot \vec u, \qquad t \in \mathbb R .
$$

Dabei ist $\vec a$ der **Stützvektor** (Ortsvektor von $A$) und $\vec u \ne \vec o$ der **Richtungsvektor**. Jeder Wert von $t$ liefert genau einen Punkt $X$ der Geraden: Man geht vom Ursprung zu $A$ und dann $t$-mal den Pfeil $\vec u$ weiter. Für $g\colon \vec x = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + t \cdot \begin{pmatrix} 2 \\ -1 \\ 1 \end{pmatrix}$ und $t = 2$ erhält man $X(5 \mid 0 \mid 5)$.

**Spurpunkte** sind die Punkte, in denen die Gerade eine Koordinatenebene durchstößt. Für die $x_1x_2$-Ebene setzt man $x_3 = 0$: $3 + t = 0$, also $t = -3$ und $S_{12}(-5 \mid 5 \mid 0)$. Ebenso $S_{23}(0 \mid 2{,}5 \mid 2{,}5)$ ($t = -0{,}5$) und $S_{13}(5 \mid 0 \mid 5)$ ($t = 2$). Ist z. B. $u_3 = 0$, verläuft $g$ parallel zur $x_1x_2$-Ebene oder liegt in ihr. Dann gibt es mit dieser Ebene keinen Spurpunkt (oder $g$ liegt ganz in ihr).

**Punktprobe:** $P$ liegt auf $g$, wenn die Gleichung $\vec p = \vec a + t \cdot \vec u$ eine Lösung hat – also alle drei Zeilen **dasselbe** $t$ ergeben. Für $P(5 \mid 0 \mid 5)$: $t = 2$, $t = 2$, $t = 2$ ✓. Für $Q(3 \mid 1 \mid 5)$: $t = 1$, $t = 1$, $t = 2$ – also $Q \notin g$.

Eine **Ebene** braucht zwei Richtungen, die **Spannvektoren** $\vec u$ und $\vec v$ (nicht parallel):

$$
E\colon\ \vec x = \vec a + r \cdot \vec u + s \cdot \vec v .
$$

Der **Normalenvektor** $\vec n = \vec u \times \vec v$ steht senkrecht auf beiden Spannvektoren und damit auf der Ebene. Daraus entstehen die **Normalenform** $\vec n \cdot (\vec x - \vec a) = 0$ und durch Ausmultiplizieren die **Koordinatenform**

$$
n_1 x_1 + n_2 x_2 + n_3 x_3 = d \quad\text{mit}\quad d = \vec n \cdot \vec a .
$$

Beispiel: $A(6 \mid 0 \mid 0)$, $\vec u = \begin{pmatrix} -3 \\ 2 \\ 0 \end{pmatrix}$, $\vec v = \begin{pmatrix} -3 \\ 0 \\ 1 \end{pmatrix}$ ergibt $\vec n = \begin{pmatrix} 2 \\ 3 \\ 6 \end{pmatrix}$, $d = 12$ und $E\colon 2x_1 + 3x_2 + 6x_3 = 12$. Die **Spurpunkte** (Achsenabschnitte) liest man ab, indem man zwei Koordinaten null setzt: $S_1(6 \mid 0 \mid 0)$, $S_2(0 \mid 4 \mid 0)$, $S_3(0 \mid 0 \mid 2)$. Sie bilden das **Spurdreieck**, seine Seiten liegen auf den **Spurgeraden**.

## Ausprobieren

1. Ziehe den Punkt $X$ entlang der Geraden oder bewege den Regler $t$. Beobachte die Pfeilkette $\vec a + t \cdot \vec u$. Was passiert bei negativem $t$? [Beispiel laden](?mode=line&t=1.5)
2. Stelle $t = -3$ ein. Welcher besondere Punkt ist $X$ jetzt? [t = −3](?mode=line&t=-3)
3. Mache $\vec u$ parallel zur $x_3$-Achse. Wie viele Spurpunkte bleiben? Drehe die Ansicht. [Gerade parallel zur x₃-Achse](?mode=line&a1=2&a2=3&a3=1&u1=0&u2=0&u3=1&t=1.5)
4. Schalte die Punktprobe ein und ziehe $P$ auf die Gerade. Wann stimmen die drei $t$-Werte überein? [Punktprobe](?mode=line&probe=1&q1=3&q2=1&q3=5)
5. Ebene in Parameterform: Ziehe $X$ in der Ebene. Für welche $r$ und $s$ landet $X$ auf der $x_2$-Achse? [Ebene laden](?mode=param&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&r=0.5&s=0.5)
6. Mache $\vec v$ zu einem Vielfachen von $\vec u$. Was passiert? [u und v parallel](?mode=param&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=1.5&v2=-1&v3=0)
7. Starte „Umrechnen“ und verfolge die vier Schritte bis zum Spurdreieck. Drehe die Ansicht so, dass du auf die Kante der Ebene schaust: Der Normalenvektor steht senkrecht. [Umrechnen](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1)
8. Hier ergibt $\vec u \times \vec v$ einen „großen“ Normalenvektor. Er darf gekürzt werden – warum? [Normalenvektor kürzen](?mode=normal&a1=3&a2=0&a3=0&u1=-3&u2=3&u3=0&v1=-3&v2=0&v3=3)
9. Eine Ebene mit nur einem Spurpunkt: [Ebene parallel zur x₁x₂-Ebene](?mode=normal&a1=0&a2=0&a3=3&u1=2&u2=0&u3=0&v1=0&v2=2&v3=0)

## Aufgaben

### Aufgabe 1: Punkte auf der Geraden

Gegeben ist $g\colon \vec x = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + t \cdot \begin{pmatrix} 2 \\ -1 \\ 1 \end{pmatrix}$. Berechne den Punkt für $t = -1$ und prüfe, ob $R(7 \mid -1 \mid 6)$ auf $g$ liegt. [Aufgabe laden](?mode=line&probe=1&q1=7&q2=-1&q3=6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$t = -1$: $(1 - 2 \mid 2 + 1 \mid 3 - 1) = (-1 \mid 3 \mid 2)$. Punktprobe für $R$: $1 + 2t = 7 \Rightarrow t = 3$; $2 - t = -1 \Rightarrow t = 3$; $3 + t = 6 \Rightarrow t = 3$. Alle drei Zeilen liefern $t = 3$, also $R \in g$. [In der Simulation zeigen](?mode=line&probe=1&q1=7&q2=-1&q3=6&t=3)

</details>

### Aufgabe 2: Spurpunkte einer Geraden

Berechne alle Spurpunkte von $h\colon \vec x = \begin{pmatrix} 2 \\ -1 \\ 4 \end{pmatrix} + t \cdot \begin{pmatrix} 1 \\ 1 \\ -2 \end{pmatrix}$. [Aufgabe laden](?mode=line&a1=2&a2=-1&a3=4&u1=1&u2=1&u3=-2&t=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$x_3 = 0$: $4 - 2t = 0$, $t = 2$, $S_{12}(4 \mid 1 \mid 0)$. $x_1 = 0$: $2 + t = 0$, $t = -2$, $S_{23}(0 \mid -3 \mid 8)$. $x_2 = 0$: $-1 + t = 0$, $t = 1$, $S_{13}(3 \mid 0 \mid 2)$. [In der Simulation zeigen](?mode=line&a1=2&a2=-1&a3=4&u1=1&u2=1&u3=-2&t=2)

</details>

### Aufgabe 3: Von der Parameterform zur Koordinatenform

Bestimme eine Koordinatenform von $E\colon \vec x = \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} + r \cdot \begin{pmatrix} -1 \\ 1 \\ 0 \end{pmatrix} + s \cdot \begin{pmatrix} -1 \\ 0 \\ 1 \end{pmatrix}$ und ihre Spurpunkte. [Aufgabe laden](?mode=normal&a1=1&a2=0&a3=0&u1=-1&u2=1&u3=0&v1=-1&v2=0&v3=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec n = \vec u \times \vec v = \begin{pmatrix} 1 \cdot 1 - 0 \cdot 0 \\ 0 \cdot (-1) - (-1) \cdot 1 \\ (-1) \cdot 0 - 1 \cdot (-1) \end{pmatrix} = \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix}$, $d = \vec n \cdot \vec a = 1$. Also $E\colon x_1 + x_2 + x_3 = 1$ mit $S_1(1 \mid 0 \mid 0)$, $S_2(0 \mid 1 \mid 0)$, $S_3(0 \mid 0 \mid 1)$. [In der Simulation zeigen](?mode=normal&a1=1&a2=0&a3=0&u1=-1&u2=1&u3=0&v1=-1&v2=0&v3=1)

</details>

### Aufgabe 4: Spurdreieck

Die Ebene $E\colon 2x_1 + 3x_2 + 6x_3 = 12$ schneidet die Achsen in $S_1$, $S_2$, $S_3$. Berechne die Spurpunkte und den Flächeninhalt des Spurdreiecks. [Aufgabe laden](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$S_1(6 \mid 0 \mid 0)$, $S_2(0 \mid 4 \mid 0)$, $S_3(0 \mid 0 \mid 2)$. Mit $\overrightarrow{S_1S_2} = \begin{pmatrix} -6 \\ 4 \\ 0 \end{pmatrix}$ und $\overrightarrow{S_1S_3} = \begin{pmatrix} -6 \\ 0 \\ 2 \end{pmatrix}$ ist $\overrightarrow{S_1S_2} \times \overrightarrow{S_1S_3} = \begin{pmatrix} 8 \\ 12 \\ 24 \end{pmatrix}$, Länge $\sqrt{784} = 28$. Flächeninhalt: $\tfrac12 \cdot 28 = 14$. [In der Simulation zeigen](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1)

</details>

### Aufgabe 5: Punktprobe in der Ebene

Liegen $P(3 \mid 0 \mid 1)$ und $Q(5 \mid 0 \mid 5)$ in $E\colon 2x_1 + 3x_2 + 6x_3 = 12$? [Aufgabe laden](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&probe=1&q1=5&q2=0&q3=5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P$: $2 \cdot 3 + 3 \cdot 0 + 6 \cdot 1 = 12$ ✓, also $P \in E$. $Q$: $2 \cdot 5 + 0 + 6 \cdot 5 = 40 \ne 12$, also $Q \notin E$. [P zeigen](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&probe=1&q1=3&q2=0&q3=1) · [Q zeigen](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&probe=1&q1=5&q2=0&q3=5)

</details>

### Aufgabe 6: Besondere Lage

Welche Spurpunkte hat die Ebene $E\colon x_3 = 3$? Gib eine Parameterform an und begründe, warum es kein Spurdreieck gibt.

<details>
<summary>Lösung anzeigen</summary>

Nur $S_3(0 \mid 0 \mid 3)$: Für $x_1$- und $x_2$-Achse müsste $0 = 3$ gelten. Eine Parameterform ist $\vec x = \begin{pmatrix} 0 \\ 0 \\ 3 \end{pmatrix} + r \cdot \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} + s \cdot \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix}$; $E$ ist parallel zur $x_1x_2$-Ebene. [In der Simulation zeigen](?mode=normal&a1=0&a2=0&a3=3&u1=2&u2=0&u3=0&v1=0&v2=2&v3=0)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 12/13, analytische Geometrie, Geraden und Ebenen im Raum (LehrplanPLUS Bayern, Gymnasium; Zuordnung zu den Jahrgangsstufen bitte am Lehrplan prüfen). Als Einstieg in die Parameterform, zum Üben von Spurpunkten oder zur Vorbereitung auf Lagebeziehungen.
- **Parameter als „Fahrplan“:** Der Regler $t$ kann als Zeit gedeutet werden – $X$ fährt mit konstanter Geschwindigkeit $\vec u$ durch den Raum. Das hilft beim Verständnis, warum $t$ negativ sein darf.
- **Gleiche Ebene, andere Gleichung:** Zwei verschiedene Parameterformen derselben Ebene führen zur gleichen Koordinatenform (bis auf einen Faktor). Das lässt sich mit den Spannvektoren direkt ausprobieren.
- **Spurdreieck zeichnen:** Mit den drei Spurpunkten lässt sich eine Ebene schnell in ein Schrägbild einzeichnen – die Simulation kann zur Kontrolle dienen.
- **Häufige Stolpersteine:**
  - Bei der Punktprobe werden nur zwei Zeilen geprüft – entscheidend ist, dass **alle drei** dasselbe $t$ liefern.
  - Stützpunkt und Richtungsvektor werden vertauscht: $\vec u$ ist kein Punkt der Geraden, sondern eine Verschiebung.
  - Beim Vektorprodukt geht ein Vorzeichen verloren (mittlere Komponente!). Die Probe $\vec n \cdot \vec u = 0$ und $\vec n \cdot \vec v = 0$ deckt das auf.
  - Die Spurpunkte einer Geraden (mit den Koordinaten**ebenen**) werden mit den Spurpunkten einer Ebene (mit den Koordinaten**achsen**) verwechselt.
