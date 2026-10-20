---
description: "Zwei Vektoren im Raum: Winkel und Projektion über das Skalarprodukt, b drehen mit dem Verlauf von cos und sin, das Vektorprodukt Schritt für Schritt „über Kreuz“ als Normalenvektor mit Parallelogrammfläche, das Spatprodukt als Volumen (mit Scherung nach Cavalieri) – und Entdeckungsaufgaben, bei denen sich die Lösungsmenge zeigt."
---

## Worum geht es?

**Skalarprodukt:** Komponentenweise multiplizieren und addieren – das Ergebnis ist eine **Zahl**: $\vec a \cdot \vec b = a_1 b_1 + a_2 b_2 + a_3 b_3$. Geometrisch gilt $\vec a \cdot \vec b = |\vec a| \cdot |\vec b| \cdot \cos\varphi$ mit dem Winkel $0° \le \varphi \le 180°$, also

$$
\cos\varphi = \frac{\vec a \cdot \vec b}{|\vec a| \cdot |\vec b|}, \qquad \text{z. B. } \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} \cdot \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix} = 1, \quad \cos\varphi = \frac{1}{1 \cdot \sqrt2} \;\Rightarrow\; \varphi = 45°.
$$

- $\vec a \cdot \vec b > 0$: spitzer Winkel, $< 0$: stumpfer Winkel, $= 0$: **senkrecht** (orthogonal).
- $\frac{\vec a \cdot \vec b}{|\vec a|}$ ist die (vorzeichenbehaftete) Länge der **Projektion** von $\vec b$ auf die Richtung von $\vec a$.
- **Sonderfälle:** Bei einem Nullvektor gibt es keinen Winkel. Bei parallelen Vektoren ist $\vec a \cdot \vec b = \pm|\vec a| \cdot |\vec b|$.

**Vektorprodukt (Kreuzprodukt):** Das Ergebnis ist ein **Vektor**. Man schreibt $\vec a$ und $\vec b$ nebeneinander, wiederholt die ersten beiden Zeilen darunter und rechnet „über Kreuz“, beginnend in Zeile 2:

$$
\vec a \times \vec b = \begin{pmatrix} a_2 b_3 - a_3 b_2 \\ a_3 b_1 - a_1 b_3 \\ a_1 b_2 - a_2 b_1 \end{pmatrix}, \qquad \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} \times \begin{pmatrix} 4 \\ 5 \\ 6 \end{pmatrix} = \begin{pmatrix} 12 - 15 \\ 12 - 6 \\ 5 - 8 \end{pmatrix} = \begin{pmatrix} -3 \\ 6 \\ -3 \end{pmatrix}.
$$

$\vec a \times \vec b$ steht **senkrecht auf $\vec a$ und $\vec b$** (Rechte-Hand-Regel), und seine Länge ist die **Fläche des Parallelogramms**: $|\vec a \times \vec b| = |\vec a| \cdot |\vec b| \cdot \sin\varphi$, hier $\sqrt{9 + 36 + 9} = \sqrt{54} \approx 7{,}35$. Das Dreieck hat die halbe Fläche. Es gilt $\vec b \times \vec a = -(\vec a \times \vec b)$; bei parallelen Vektoren ist $\vec a \times \vec b = \vec o$.

**Spatprodukt:** $|(\vec a \times \vec b) \cdot \vec c|$ ist das **Volumen des Spats**: Grundfläche $G = |\vec a \times \vec b|$ mal Höhe $h$ (Projektion von $\vec c$ auf $\vec a \times \vec b$). Schert man den Spat gerade, bleiben $G$ und $h$ gleich – und damit das Volumen (Prinzip von Cavalieri). Die dreiseitige Pyramide mit den Kanten $\vec a$, $\vec b$, $\vec c$ hat $\frac16$ davon. Ist das Spatprodukt negativ, bilden $\vec a$, $\vec b$, $\vec c$ ein Linkssystem; ist es $0$, liegen sie in einer Ebene.

## Ausprobieren

1. Ziehe die Spitze von $\vec b$, bis der Winkel $90°$ ist. Was zeigen Skalarprodukt und Balken? [Senkrecht](?b1=-2&b2=1&b3=2)
2. In **Winkel drehen** läuft $\vec b$ auf einem Halbkreis. Starte „φ von 0° bis 180° drehen“ und beobachte beide Kurven. [Winkel drehen](?mode=angle&a1=1&a2=0&a3=0&b1=1&b2=1&b3=0&phi=45)
3. Lass im **Vektorprodukt** die Rechnung Schritt für Schritt ablaufen und tippe auf eine Zeile des Schemas. [Über Kreuz](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6)
4. Mach $\vec b$ parallel zu $\vec a$. Was passiert mit Fläche und Normalenvektor? [Parallel](?mode=cross&a1=1&a2=2&a3=3&b1=2&b2=4&b3=6)
5. Schalte im **Spatprodukt** „Spat gerade scheren“ ein. Was bleibt gleich? [Cavalieri](?mode=spat&a1=2&a2=0&a3=0&b1=0&b2=3&b3=0&c1=2&c2=1&c3=2&cav=1)
6. Unter **Entdecken** suchst du drei Lösungen – danach zeigt sich, wo alle Lösungen liegen. [Entdecken](?mode=find&task=perp&b1=1&b2=1&b3=2)

## Aufgaben

### Aufgabe 1: Winkel berechnen

Berechne den Winkel zwischen $\vec a = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$ und $\vec b = \begin{pmatrix} -2 \\ -1 \\ 2 \end{pmatrix}$. [Aufgabe laden](?b1=-2&b2=-1&b3=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec a \cdot \vec b = -2 - 2 + 0 = -4$, $|\vec a| = \sqrt5$, $|\vec b| = 3$. $\cos\varphi = \frac{-4}{3\sqrt5} \approx -0{,}596$, also $\varphi \approx 126{,}6°$ – stumpf, wie das Minuszeichen verrät. [In der Simulation zeigen](?b1=-2&b2=-1&b3=2)

</details>

### Aufgabe 2: Gleich groß

Für welche Winkel $\varphi$ sind $|\vec a \cdot \vec b|$ und $|\vec a \times \vec b|$ gleich groß? [Aufgabe laden](?mode=angle&a1=1&a2=0&a3=0&b1=1&b2=1&b3=0&phi=20&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$|\cos\varphi| = \sin\varphi$ gilt für $\varphi = 45°$ und $\varphi = 135°$. Beispiel: $\vec a = \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix}$: $\vec a \cdot \vec b = 1$ und $\vec a \times \vec b = \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}$ mit Länge $1$. [In der Simulation zeigen](?mode=angle&a1=1&a2=0&a3=0&b1=1&b2=1&b3=0&phi=45)

</details>

### Aufgabe 3: Normalenvektor und Fläche

Berechne $\vec a \times \vec b$ für $\vec a = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix}$, $\vec b = \begin{pmatrix} 4 \\ 5 \\ 6 \end{pmatrix}$, mache die Probe und gib die Fläche des Parallelogramms an. [Aufgabe laden](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec a \times \vec b = \begin{pmatrix} 2 \cdot 6 - 3 \cdot 5 \\ 3 \cdot 4 - 1 \cdot 6 \\ 1 \cdot 5 - 2 \cdot 4 \end{pmatrix} = \begin{pmatrix} -3 \\ 6 \\ -3 \end{pmatrix}$. Probe: $-3 + 12 - 9 = 0$ und $-12 + 30 - 18 = 0$ ✓. Fläche $\sqrt{54} \approx 7{,}35$. [In der Simulation zeigen](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6)

</details>

### Aufgabe 4: Volumen und Orientierung

Berechne das Spatprodukt für $\vec a = \begin{pmatrix} 1 \\ 2 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 0 \\ 1 \\ 2 \end{pmatrix}$ und $\vec c = \begin{pmatrix} -1 \\ 1 \\ -2 \end{pmatrix}$. Wie groß sind die Volumina von Spat und Pyramide? [Aufgabe laden](?mode=spat&c1=-1&c2=1&c3=-2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec a \times \vec b = \begin{pmatrix} 4 \\ -2 \\ 1 \end{pmatrix}$, $(\vec a \times \vec b) \cdot \vec c = -4 - 2 - 2 = -8$: ein Linkssystem. Spat $V = 8$, Pyramide $V = \frac86 = \frac43 \approx 1{,}33$. [In der Simulation zeigen](?mode=spat&c1=-1&c2=1&c3=-2&pyr=1)

</details>

### Aufgabe 5: Alle Lösungen

Gesucht sind alle $\vec c$, für die der Spat aus $\vec a = \begin{pmatrix} 2 \\ 0 \\ 0 \end{pmatrix}$, $\vec b = \begin{pmatrix} 0 \\ 3 \\ 0 \end{pmatrix}$ und $\vec c$ das Volumen $12$ hat. Finde zuerst drei in der Simulation und beschreibe dann alle. [Aufgabe laden](?mode=find&task=vol&c1=1&c2=1&c3=1)

<details>
<summary>Lösung anzeigen</summary>

$\vec a \times \vec b = \begin{pmatrix} 0 \\ 0 \\ 6 \end{pmatrix}$, also $V = |6 c_3| = 12$ genau für $c_3 = 2$ oder $c_3 = -2$; $c_1$ und $c_2$ sind beliebig. Die Spitzen liegen in zwei Ebenen parallel zur $x_1x_2$-Ebene: Grundfläche $6$ mal Höhe $2$. [In der Simulation zeigen](?mode=find&task=vol&c1=1&c2=1&c3=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 12, Lernbereich „Grundlagen der Koordinatengeometrie im Raum“ (LehrplanPLUS Bayern, Gymnasium).
- **Entdecken statt Vorgeben:** Zuerst unter „Entdecken“ senkrechte Vektoren suchen lassen – die Ebene der Lösungen führt direkt zur Normalenform.
- **cos und sin zusammen:** „Winkel drehen“ zeigt Skalarprodukt (Projektion) und Fläche (Höhe) im selben Bild.
- **Häufige Stolpersteine:**
  - Das Skalarprodukt wird als Vektor notiert – es ist eine Zahl.
  - Vorzeichen oder Indizes der mittleren Komponente werden vertauscht; die Probe $(\vec a \times \vec b) \cdot \vec a = 0$ hilft.
  - Das Vorzeichen von $\cos\varphi$ wird ignoriert; der Winkel liegt immer zwischen $0°$ und $180°$.
  - Dreiecksfläche ohne $\frac12$, Pyramidenvolumen ohne $\frac16$.
