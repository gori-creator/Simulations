---
description: "Interaktive Simulation für Oberstufe und Studium: 2×2-Matrizen als lineare Abbildungen der Ebene – Ebene verformt sich stetig, Verkettung und AB ≠ BA, Determinante als orientierter Flächeninhalt, Eigenvektoren mit charakteristischem Polynom, Inverse, Iteration mit Fixvektor und zehn Alltagsbeispiele."
---

## Worum geht es?

Eine $2 \times 2$-Matrix $A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$ beschreibt eine **lineare Abbildung** der Ebene: Jeder Vektor $\vec{x}$ wird auf $A \cdot \vec{x}$ abgebildet. Der Ursprung bleibt fest, Geraden bleiben Geraden, parallele Geraden bleiben parallel – das Koordinatengitter wird zu einem Gitter aus Parallelogrammen.

**Die Spalten sind die Bilder der Einheitsvektoren:** $A \cdot \vec{e}_1 = \begin{pmatrix} a \\ c \end{pmatrix}$, $A \cdot \vec{e}_2 = \begin{pmatrix} b \\ d \end{pmatrix}$ und wegen der Linearität $A \cdot \begin{pmatrix} x \\ y \end{pmatrix} = x \cdot \begin{pmatrix} a \\ c \end{pmatrix} + y \cdot \begin{pmatrix} b \\ d \end{pmatrix}$.

**Bekannte Abbildungen** haben feste Baupläne: Drehung um $\varphi$: $\begin{pmatrix} \cos\varphi & -\sin\varphi \\ \sin\varphi & \cos\varphi \end{pmatrix}$, Spiegelung an der Ursprungsgeraden mit Winkel $\alpha$: $\begin{pmatrix} \cos 2\alpha & \sin 2\alpha \\ \sin 2\alpha & -\cos 2\alpha \end{pmatrix}$, Scherung $\begin{pmatrix} 1 & k \\ 0 & 1 \end{pmatrix}$, Streckung $\begin{pmatrix} k_x & 0 \\ 0 & k_y \end{pmatrix}$, senkrechte Projektion auf die Gerade mit Winkel $\alpha$: $\begin{pmatrix} \cos^2\alpha & \sin\alpha\cos\alpha \\ \sin\alpha\cos\alpha & \sin^2\alpha \end{pmatrix}$.

**Verkettung:** Erst $B$, dann $A$ anwenden ergibt $A \cdot B$ (die zuerst angewendete Matrix steht rechts). Eintrag $p_{ij}$ = Zeile $i$ von $A$ mal Spalte $j$ von $B$. Im Allgemeinen ist $A \cdot B \neq B \cdot A$.

**Determinante:** $\det A = ad - bc$ ist der **orientierte Flächeninhalt** des Bildes des Einheitsquadrats. Alle Flächen werden mit $|\det A|$ multipliziert, und $\det(A \cdot B) = \det A \cdot \det B$. Bei $\det A < 0$ kehrt sich der Umlaufsinn um, bei $\det A = 0$ fällt die Ebene auf eine Gerade (oder einen Punkt): Die Abbildung ist nicht umkehrbar.

**Inverse:** Für $\det A \neq 0$ gilt

$$
A^{-1} = \frac{1}{ad - bc} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}, \qquad A \cdot A^{-1} = E.
$$

**Eigenvektoren:** Ein Vektor $\vec{v} \neq \vec{0}$ mit $A \cdot \vec{v} = \lambda \vec{v}$ wird nur gestreckt, seine Richtung bleibt erhalten. Die Eigenwerte sind die Lösungen des **charakteristischen Polynoms**

$$
\det(A - \lambda E) = \lambda^2 - (a + d)\lambda + (ad - bc) = 0.
$$

Ist die Diskriminante negativ (z. B. bei Drehungen um $\varphi \neq 0°, 180°$), sind die Eigenwerte komplex und keine Richtung bleibt erhalten.

**Iteration:** $\vec{x}_{n+1} = A \cdot \vec{x}_n$ beschreibt Prozesse in Schritten (Populationen, Kundenwanderung). Langfristig bestimmt der betragsgrößte Eigenwert das Verhalten; ein Eigenvektor zum Eigenwert $1$ ist ein **Fixvektor** ($A\vec{v} = \vec{v}$). Bei einer **Übergangsmatrix** (Einträge $\geq 0$, Spaltensummen $1$) heißt der Fixvektor mit Summe $1$ **stationäre Verteilung**.

## Ausprobieren

1. [Allgemein](?a=2&b=1&c=0&d=1): Ziehe die Spitzen von $A \cdot \vec{e}_1$ und $A \cdot \vec{e}_2$. Drücke „Abbildung abspielen“ oder verschiebe den Regler $t$: Die Einheitsmatrix verformt sich stetig zu $A$.
2. [Drehung um 90°](?typ=rot&phi=90), [Spiegelung an y = x](?typ=refl&al=45), [Scherung](?typ=shear&k=1), [Kreis → Ellipse](?typ=scale&kx=2&ky=0.5&fig=circle&uc=1): Welche Geraden bleiben fest?
3. [AB ≠ BA](?mode=comp&a=1&b=2&c=3&d=4): Drücke „Nacheinander abspielen“ und dann „Reihenfolge tauschen“. Die rot gepunktete Figur zeigt die andere Reihenfolge.
4. [Negative Determinante](?mode=det&a=1&b=2&c=2&d=1&hgt=1): Woran erkennst du im Bild, dass $\det A < 0$ ist? Vergleiche mit Grundseite · Höhe des Parallelogramms. [Projektion](?mode=det&typ=proj&al=30&fig=house): Was ist der Kern?
5. [Symmetrische Matrix](?mode=eig&a=2&b=1&c=1&d=2): Drücke „v einmal herumdrehen“. Wann liegen $\vec{v}$ und $A\vec{v}$ auf einer Geraden? Das Diagramm $\sin\angle(\vec{v}, A\vec{v})$ hat dort Nullstellen. Vergleiche mit der [Drehung um 60°](?mode=eig&typ=rot&phi=60) und der [Scherung](?mode=eig&typ=shear&k=1).
6. [Inverse](?mode=inv&a=2&b=1&c=1&d=1&fig=house): „Hin mit A, zurück mit A⁻¹“. Was passiert bei der [singulären Matrix](?mode=inv&a=1&b=2&c=0.5&d=1)?
7. Alltag: [Raumschiff drehen](?ex=sprite&typ=rot&phi=30&fig=rocket), [schräge Schrift](?ex=italic&typ=shear&k=0.25&fig=f), [Schatten](?ex=shadow&a=1&b=-1&c=0&d=0&fig=house&eig=0), [Spiegelbild im See](?ex=mirror&typ=refl&al=0&fig=house), [Kaleidoskop](?ex=kaleido&mode=comp&typ=refl&al=60&ba=1&bb=0&bc=0&bd=-1), [Karten-App](?ex=zoom&typ=rs&phi=30&r=1.5&fig=house), [Breitbild](?ex=wide&mode=det&typ=scale&kx=1.5&ky=1&fig=smile).
8. Iteration: [Population stabil](?ex=pop&mode=pow&a=0&b=1&c=0.5&d=0.5&x0=4&y0=0&n=8), [Population wachsend](?ex=popg&mode=pow&a=0&b=2&c=0.5&d=0.5&x0=1&y0=1&n=8), [Kundenwanderung](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=10). Ziehe den Startpunkt: Ändert sich das Ziel?

## Aufgaben

### Aufgabe 1: Matrix aus Bildern

Die Abbildung bildet $\vec{e}_1$ auf $\begin{pmatrix} 2 \\ 1 \end{pmatrix}$ und $\vec{e}_2$ auf $\begin{pmatrix} 1 \\ 2 \end{pmatrix}$ ab. Gib die Matrix an und berechne den Flächenfaktor. [Aufgabe laden](?a=2&b=1&c=1&d=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$, $\det A = 4 - 1 = 3$: Flächen werden verdreifacht. [Lösung zeigen](?mode=det&a=2&b=1&c=1&d=2)

</details>

### Aufgabe 2: Eigenwerte

Bestimme die Eigenwerte und Eigenvektoren von $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$. [Aufgabe laden](?mode=eig&a=2&b=1&c=1&d=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\det(A - \lambda E) = (2 - \lambda)^2 - 1 = \lambda^2 - 4\lambda + 3 = 0 \Rightarrow \lambda = 3$ oder $\lambda = 1$; Eigenvektoren $\begin{pmatrix} 1 \\ 1 \end{pmatrix}$ und $\begin{pmatrix} 1 \\ -1 \end{pmatrix}$. [Zeigen](?mode=eig&a=2&b=1&c=1&d=2&w=45)

</details>

### Aufgabe 3: Welche Abbildung?

Welche Abbildung beschreibt $\begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$? Begründe mit den Bildern der Einheitsvektoren und zeige, dass es keine reellen Eigenwerte gibt.

<details>
<summary>Lösung anzeigen</summary>

$\vec{e}_1 \mapsto \vec{e}_2$ und $\vec{e}_2 \mapsto -\vec{e}_1$: eine Drehung um $90°$ gegen den Uhrzeigersinn, $\det A = 1$. $\lambda^2 + 1 = 0$ hat keine reelle Lösung ($\lambda = \pm i$). [Zeigen](?mode=eig&typ=rot&phi=90)

</details>

### Aufgabe 4: Reihenfolge

Berechne für $A = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}$ und $B = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ die Produkte $A \cdot B$ und $B \cdot A$. Was bewirkt $B$ jeweils? [Aufgabe laden](?mode=comp&a=1&b=2&c=3&d=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A \cdot B = \begin{pmatrix} 2 & 1 \\ 4 & 3 \end{pmatrix}$ (die Spalten von $A$ sind vertauscht), $B \cdot A = \begin{pmatrix} 3 & 4 \\ 1 & 2 \end{pmatrix}$ (die Zeilen sind vertauscht). Also $A \cdot B \neq B \cdot A$, aber $\det(AB) = \det(BA) = (-2) \cdot (-1) = 2$. [Zeigen](?mode=comp&a=1&b=2&c=3&d=4)

</details>

### Aufgabe 5: Rückweg

Berechne die Inverse von $A = \begin{pmatrix} 2 & 1 \\ 1 & 1 \end{pmatrix}$ und prüfe sie am Punkt $P(1 \mid 1)$. [Aufgabe laden](?mode=inv&a=2&b=1&c=1&d=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\det A = 2 - 1 = 1$, also $A^{-1} = \begin{pmatrix} 1 & -1 \\ -1 & 2 \end{pmatrix}$. Probe: $A \cdot \begin{pmatrix} 1 \\ 1 \end{pmatrix} = \begin{pmatrix} 3 \\ 2 \end{pmatrix}$ und $A^{-1} \cdot \begin{pmatrix} 3 \\ 2 \end{pmatrix} = \begin{pmatrix} 3 - 2 \\ -3 + 4 \end{pmatrix} = \begin{pmatrix} 1 \\ 1 \end{pmatrix}$. [Zeigen](?mode=inv&a=2&b=1&c=1&d=1&fig=house)

</details>

### Aufgabe 6: Kundenwanderung

Von Anbieter P bleiben jedes Jahr 90 % der Kunden, 10 % wechseln zu Q; von Q wechseln 20 % zu P. Anfangs sind alle Kunden bei P. Berechne die Anteile nach einem und nach zwei Jahren und die stationäre Verteilung. [Aufgabe laden](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A = \begin{pmatrix} 0{,}9 & 0{,}2 \\ 0{,}1 & 0{,}8 \end{pmatrix}$: $\vec{x}_1 = \begin{pmatrix} 0{,}9 \\ 0{,}1 \end{pmatrix}$, $\vec{x}_2 = \begin{pmatrix} 0{,}81 + 0{,}02 \\ 0{,}09 + 0{,}08 \end{pmatrix} = \begin{pmatrix} 0{,}83 \\ 0{,}17 \end{pmatrix}$. Stationär: $0{,}9p + 0{,}2q = p$, also $0{,}2q = 0{,}1p$, $p = 2q$; mit $p + q = 1$ folgt $p = \frac{2}{3}$, $q = \frac{1}{3}$. [Zeigen](?ex=market&mode=pow&a=0.9&b=0.2&c=0.1&d=0.8&x0=1&y0=0&n=10)

</details>

## Ideen für den Unterricht

- **Einsatz:** Lineare Algebra im ersten Studienjahr; in der Oberstufe als Vertiefung im Anschluss an Vektoren, etwa in einem Seminar, im Profilfach oder in der Begabtenförderung. Übergangsmatrizen und Populationsmodelle kommen in manchen Lehrplänen (nicht in Bayern, Gymnasium) direkt vor – bitte am eigenen Lehrplan prüfen.
- **Vermutungen sammeln:** Erst Abbildungen durch Ziehen „bauen“ (Drehung, Spiegelung, Scherung), dann die Matrizen notieren und mit den Bauplänen vergleichen.
- **Rechnen und Sehen verbinden:** Mit „Werte zeigen“ aus rechnen die Lernenden zuerst (Determinante, Produkt, Inverse, Eigenwerte) und prüfen dann im Bild.
- **Häufige Stolpersteine:**
  - Zeilen und Spalten werden vertauscht – die Bilder der Einheitsvektoren stehen in den **Spalten**.
  - Bei $A \cdot B$ wird $A$ zuerst angewendet gedacht; tatsächlich wirkt $B$ zuerst.
  - Die Determinante wird als Flächeninhalt ohne Vorzeichen verstanden.
  - Eigenvektoren werden für „die Vektoren, die sich nicht ändern“ gehalten – sie dürfen gestreckt oder umgedreht werden ($\lambda < 0$).
