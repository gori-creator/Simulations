---
description: "Interaktive Simulation für Oberstufe und Studium: 2×2-Matrizen als lineare Abbildungen der Ebene – Bilder der Einheitsvektoren ziehen, Determinante als Flächenfaktor, Eigenrichtungen sowie Drehung, Spiegelung, Scherung und Projektion."
---

## Worum geht es?

Eine $2 \times 2$-Matrix $A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$ beschreibt eine **lineare Abbildung** der Ebene: Jeder Vektor $\vec{x}$ wird auf $A \cdot \vec{x}$ abgebildet. Geraden bleiben Geraden, der Ursprung bleibt fest, parallele Geraden bleiben parallel.

**Die Spalten sind die Bilder der Einheitsvektoren:** $A \cdot \vec{e}_1 = \begin{pmatrix} a \\ c \end{pmatrix}$ und $A \cdot \vec{e}_2 = \begin{pmatrix} b \\ d \end{pmatrix}$. Kennt man diese beiden Bilder, kennt man die ganze Abbildung – das Gitter wird zu einem Gitter aus Parallelogrammen.

**Determinante:** $\det A = ad - bc$ ist der Flächeninhalt (mit Vorzeichen) des Bildes des Einheitsquadrats. Alle Flächen werden mit $|\det A|$ multipliziert. Ist $\det A < 0$, kehrt sich der Umlaufsinn um (das F erscheint gespiegelt). Ist $\det A = 0$, fällt alles auf eine Gerade – die Abbildung ist nicht umkehrbar.

**Eigenvektoren:** Ein Vektor $\vec{v} \neq \vec{0}$ mit $A \cdot \vec{v} = \lambda \vec{v}$ wird nur gestreckt; seine Richtung bleibt erhalten. $\lambda$ heißt **Eigenwert**. Bei einer Drehung (außer um $0°$ oder $180°$) gibt es keine reellen Eigenwerte.

## Ausprobieren

1. [Allgemein](?a=2&b=1&c=0&d=1): Ziehe die Spitzen von $A \cdot \vec{e}_1$ und $A \cdot \vec{e}_2$. Wie verändern sich Gitter und F?
2. Drücke „Abbildung abspielen“: Die Einheitsmatrix verformt sich stetig zu $A$.
3. [Drehung um 90°](?a=0&b=-1&c=1&d=0): Warum gibt es keine Eigenrichtung?
4. [Spiegelung](?a=1&b=0&c=0&d=-1): Was zeigt das Vorzeichen der Determinante?
5. [Scherung](?a=1&b=1&c=0&d=1): Flächeninhalt bleibt gleich – warum?
6. [Projektion](?a=1&b=0&c=0&d=0): Was passiert bei $\det A = 0$?
7. [Symmetrische Matrix](?a=2&b=1&c=1&d=2): Die beiden Eigenrichtungen stehen senkrecht aufeinander.

## Aufgaben

### Aufgabe 1: Matrix aus Bildern

Die Abbildung bildet $\vec{e}_1$ auf $\begin{pmatrix} 2 \\ 1 \end{pmatrix}$ und $\vec{e}_2$ auf $\begin{pmatrix} 1 \\ 2 \end{pmatrix}$ ab. Gib die Matrix an und berechne den Flächenfaktor. [Aufgabe laden](?a=2&b=1&c=1&d=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$, $\det A = 4 - 1 = 3$: Flächen werden verdreifacht. [Lösung zeigen](?a=2&b=1&c=1&d=2)

</details>

### Aufgabe 2: Eigenwerte

Bestimme die Eigenwerte von $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$.

<details>
<summary>Lösung anzeigen</summary>

$\det(A - \lambda E) = (2 - \lambda)^2 - 1 = 0 \Rightarrow \lambda = 3$ oder $\lambda = 1$; Eigenvektoren $\begin{pmatrix} 1 \\ 1 \end{pmatrix}$ und $\begin{pmatrix} 1 \\ -1 \end{pmatrix}$. [Zeigen](?a=2&b=1&c=1&d=2)

</details>

### Aufgabe 3: Welche Abbildung?

Welche Abbildung beschreibt $\begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$? Begründe mit den Bildern der Einheitsvektoren.

<details>
<summary>Lösung anzeigen</summary>

$\vec{e}_1 \mapsto \vec{e}_2$ und $\vec{e}_2 \mapsto -\vec{e}_1$: eine Drehung um $90°$ gegen den Uhrzeigersinn; $\det A = 1$. [Zeigen](?a=0&b=-1&c=1&d=0)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Lineare Algebra im ersten Studienjahr; in der Oberstufe als Ausblick im Anschluss an Vektoren (z. B. Seminar oder Begabtenförderung).
- **Vermutungen sammeln:** Erst Abbildungen durch Ziehen „bauen“ (Drehung, Spiegelung, Scherung), dann die Matrizen notieren und vergleichen.
- **Häufige Stolpersteine:**
  - Zeilen und Spalten werden vertauscht (die Bilder der Einheitsvektoren stehen in den **Spalten**).
  - Die Determinante wird als Flächeninhalt ohne Vorzeichen verstanden.
  - Eigenvektoren werden für „die Vektoren, die sich nicht ändern“ gehalten – sie dürfen gestreckt werden.
