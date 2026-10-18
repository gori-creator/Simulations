---
description: "Zwei Vektoren im Raum: Winkel und Projektion über das Skalarprodukt, senkrecht bei a · b = 0; das Vektorprodukt wächst als Normalenvektor aus dem Parallelogramm, das Spatprodukt liefert das Volumen des Spats."
---

## Worum geht es?

**Skalarprodukt:** Zwei Vektoren werden komponentenweise multipliziert und die Produkte addiert – das Ergebnis ist eine **Zahl**:

$$
\vec a \cdot \vec b = a_1 b_1 + a_2 b_2 + a_3 b_3, \qquad \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix} \cdot \begin{pmatrix} 0 \\ 1 \\ 2 \end{pmatrix} = 0 + 2 + 0 = 2.
$$

Geometrisch gilt $\vec a \cdot \vec b = |\vec a| \cdot |\vec b| \cdot \cos\varphi$, wobei $\varphi$ der Winkel zwischen den Pfeilen ist ($0° \le \varphi \le 180°$). Daraus folgt die **Winkelformel**

$$
\cos\varphi = \frac{\vec a \cdot \vec b}{|\vec a| \cdot |\vec b|}, \qquad \text{z. B. } \cos\varphi = \frac{2}{\sqrt5 \cdot \sqrt5} = 0{,}4 \;\Rightarrow\; \varphi \approx 66{,}4°.
$$

- $\vec a \cdot \vec b > 0$: spitzer Winkel, $\vec a \cdot \vec b < 0$: stumpfer Winkel.
- $\vec a \cdot \vec b = 0$: Die Vektoren stehen **senkrecht** (orthogonal) aufeinander.
- $\frac{\vec a \cdot \vec b}{|\vec a|}$ ist die (vorzeichenbehaftete) Länge der **Projektion** von $\vec b$ auf die Richtung von $\vec a$.

**Vektorprodukt (Kreuzprodukt):** Das Ergebnis ist ein **Vektor**,

$$
\vec a \times \vec b = \begin{pmatrix} a_2 b_3 - a_3 b_2 \\ a_3 b_1 - a_1 b_3 \\ a_1 b_2 - a_2 b_1 \end{pmatrix}, \qquad \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix} \times \begin{pmatrix} 0 \\ 1 \\ 2 \end{pmatrix} = \begin{pmatrix} 4 \\ -2 \\ 1 \end{pmatrix}.
$$

Er steht **senkrecht auf $\vec a$ und $\vec b$** (Normalenvektor), $\vec a$, $\vec b$, $\vec a \times \vec b$ bilden ein Rechtssystem (Rechte-Hand-Regel), und seine Länge ist die **Fläche des Parallelogramms**: $A = |\vec a \times \vec b|$. Das Dreieck mit den Seiten $\vec a$ und $\vec b$ hat die halbe Fläche. Vertauscht man die Reihenfolge, kehrt sich die Richtung um: $\vec b \times \vec a = -(\vec a \times \vec b)$.

**Spatprodukt:** $(\vec a \times \vec b) \cdot \vec c$. Sein Betrag ist das **Volumen des Spats** (schiefen Prismas mit Parallelogramm-Grundfläche), denn Grundfläche $|\vec a \times \vec b|$ mal Höhe (Projektion von $\vec c$ auf den Normalenvektor). Die dreiseitige Pyramide mit denselben Kanten hat $\frac16$ davon.

## Ausprobieren

1. Ziehe die Spitze von $\vec b$, bis der Winkel genau $90°$ ist. Was zeigt das Skalarprodukt? [Beispiel laden](?b1=-2&b2=1&b3=2)
2. Mach den Winkel stumpf. Wohin zeigt nun die Projektion von $\vec b$ auf $\vec a$? [Stumpfer Winkel](?b1=-2&b2=-1&b3=2)
3. Wechsle zum **Vektorprodukt** und drehe die Ansicht: Steht $\vec a \times \vec b$ wirklich senkrecht auf dem Parallelogramm? Tausche dann $\vec a$ und $\vec b$. [Vektorprodukt](?mode=cross)
4. Mach $\vec b$ parallel zu $\vec a$ (z. B. $\vec b = \begin{pmatrix} 2 \\ 4 \\ 0 \end{pmatrix}$). Was passiert mit Fläche und Normalenvektor? [Parallele Vektoren](?mode=cross&b1=2&b2=4&b3=0)
5. Im **Spatprodukt**: Ziehe $\vec c$ in die Ebene von $\vec a$ und $\vec b$. Wie groß wird das Volumen? [Spat](?mode=spat)

## Aufgaben

### Aufgabe 1: Winkel berechnen

Berechne den Winkel zwischen $\vec a = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$ und $\vec b = \begin{pmatrix} -2 \\ -1 \\ 2 \end{pmatrix}$. [Aufgabe laden](?b1=-2&b2=-1&b3=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec a \cdot \vec b = -2 - 2 + 0 = -4$, $|\vec a| = \sqrt5$, $|\vec b| = 3$. $\cos\varphi = \frac{-4}{3\sqrt5} \approx -0{,}596$, also $\varphi \approx 126{,}6°$ – stumpf, wie das negative Vorzeichen verrät. [In der Simulation zeigen](?b1=-2&b2=-1&b3=2)

</details>

### Aufgabe 2: Senkrecht machen

Bestimme $t$ so, dass $\vec a = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$ und $\vec b = \begin{pmatrix} -2 \\ 1 \\ t \end{pmatrix}$ senkrecht aufeinander stehen. Gibt es mehrere Lösungen?

<details>
<summary>Lösung anzeigen</summary>

$\vec a \cdot \vec b = -2 + 2 + 0 \cdot t = 0$ für **jedes** $t$: Alle diese Vektoren sind senkrecht zu $\vec a$, denn $a_3 = 0$. [Beispiel mit t = 2](?b1=-2&b2=1&b3=2)

</details>

### Aufgabe 3: Normalenvektor und Fläche

Berechne $\vec a \times \vec b$ für $\vec a = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 0 \\ 1 \\ 2 \end{pmatrix}$, mache die Probe mit dem Skalarprodukt und gib die Fläche des Dreiecks mit den Seiten $\vec a$, $\vec b$ an. [Aufgabe laden](?mode=cross&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec a \times \vec b = \begin{pmatrix} 2 \cdot 2 - 0 \cdot 1 \\ 0 \cdot 0 - 1 \cdot 2 \\ 1 \cdot 1 - 2 \cdot 0 \end{pmatrix} = \begin{pmatrix} 4 \\ -2 \\ 1 \end{pmatrix}$. Probe: $4 - 4 + 0 = 0$ und $0 - 2 + 2 = 0$ ✓. Dreieck: $\frac12\sqrt{16 + 4 + 1} = \frac12\sqrt{21} \approx 2{,}29$. [In der Simulation zeigen](?mode=cross&tri=1)

</details>

### Aufgabe 4: Volumen

Berechne das Volumen des Spats und der Pyramide, die von $\vec a$, $\vec b$ aus Aufgabe 3 und $\vec c = \begin{pmatrix} 1 \\ -1 \\ 2 \end{pmatrix}$ aufgespannt werden. [Aufgabe laden](?mode=spat&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$(\vec a \times \vec b) \cdot \vec c = 4 + 2 + 2 = 8$: Spat $V = 8$, Pyramide $V = \frac86 = \frac43 \approx 1{,}33$. [In der Simulation zeigen](?mode=spat&pyr=1)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12, Lernbereich „Grundlagen der Koordinatengeometrie im Raum“ (LehrplanPLUS Bayern, Gymnasium): Skalarprodukt für Längen und Winkel, Vektorprodukt für Flächen und Volumina.
- **Entdecken statt Vorgeben:** Eine Möglichkeit ist, zuerst Paare mit $\vec a \cdot \vec b = 0$ zu suchen und erst danach die Winkelformel einzuführen.
- **Rechte-Hand-Regel:** Mit „a und b tauschen“ lässt sich zeigen, dass das Vektorprodukt nicht kommutativ ist.
- **Häufige Stolpersteine:**
  - Das Skalarprodukt wird als Vektor notiert – es ist eine Zahl.
  - Bei der Kreuzproduktformel werden Indizes oder Vorzeichen der mittleren Komponente vertauscht; die Probe $(\vec a \times \vec b) \cdot \vec a = 0$ hilft.
  - Der Winkel wird nicht auf $0° \ldots 180°$ bezogen bzw. das Vorzeichen von $\cos\varphi$ wird ignoriert.
  - Die Dreiecksfläche wird ohne den Faktor $\frac12$, das Pyramidenvolumen ohne $\frac16$ angegeben.
