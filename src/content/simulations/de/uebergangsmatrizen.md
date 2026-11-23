---
description: "Übergangsgraph, Übergangsmatrix und Zustandsvektor: Schritt für Schritt rechnen, Matrixpotenzen deuten und die stabile Verteilung finden."
---

## Worum geht es?

Viele Vorgänge laufen in **Schritten** ab: Kunden wechseln jedes Jahr ein wenig zwischen Anbietern, auf einen Sonnentag folgt meist wieder Sonne, aus Eiern werden Larven. Wie viele in welchem **Zustand** sind, fasst der **Zustandsvektor** $\vec x_n$ nach $n$ Schritten zusammen.

Die Übergänge stehen im **Übergangsgraphen** (Pfeile mit Wahrscheinlichkeiten) und in der **Übergangsmatrix** $M$. Der Eintrag $m_{ij}$ in Zeile $i$, Spalte $j$ gibt an, welcher Anteil **von** Zustand $j$ **nach** Zustand $i$ wechselt. Deshalb ist bei einer Übergangsmatrix jede **Spaltensumme 1**: Von jedem Zustand geht alles irgendwohin.

$$
\vec x_{n+1} = M \cdot \vec x_n \qquad\Rightarrow\qquad \vec x_n = M^n \cdot \vec x_0
$$

Beim Wetter mit $M = \begin{pmatrix} 0{,}9 & 0{,}2 \\ 0{,}1 & 0{,}8 \end{pmatrix}$ und heute Sonne, $\vec x_0 = \begin{pmatrix} 1 \\ 0 \end{pmatrix}$, ist morgen $\vec x_1 = \begin{pmatrix} 0{,}9 \\ 0{,}1 \end{pmatrix}$.

- **Matrixpotenzen:** Der Eintrag $(M^n)_{ij}$ ist die Wahrscheinlichkeit, in $n$ Schritten von $j$ nach $i$ zu kommen. Er ist die Summe über alle Wege der Länge $n$ (Pfadregeln wie beim Baumdiagramm).
- **Stabile Verteilung (Fixvektor):** Ein Vektor mit $M \cdot \vec x = \vec x$. Man löst $(M - E)\cdot\vec x = \vec 0$ zusammen mit $x_1 + \dots + x_k = 1$.
- **Langfristig:** Bei einer *regulären* Kette nähert sich $M^n$ einer **Grenzmatrix** mit lauter gleichen Spalten – egal, wo man startet. Bei **absorbierenden** Zuständen (wer dort ist, bleibt) hängt das Ende vom Start ab. Bei **zyklischen** Prozessen kommt $M^n$ nie zur Ruhe.
- **Rückwärts:** Ist $M$ invertierbar, gilt $\vec x_{n-1} = M^{-1}\cdot\vec x_n$. Negative Einträge zeigen, dass man zu weit zurückgerechnet hat.
- **Populationen:** Bei Populationsmatrizen (z. B. Eier → Larven → Käfer) sind die Spaltensummen nicht 1; der Bestand kann wachsen, schrumpfen oder sich zyklisch wiederholen.

## Ausprobieren

1. Drücke mehrmals „Schritt weiter“ und beobachte, wie die Punkte entlang der Pfeile fließen. Die Pfeildicke zeigt, wie viel gerade unterwegs ist. [Kunden laden](?sc=kunden&view=step&n=0)
2. Tippe ein Feld der Matrix an: Der passende Pfeil leuchtet, und darunter steht die Zeile ausgerechnet. [Wetter, ein Schritt](?sc=wetter&view=step&n=1)
3. Starte einmal mit allen Kunden bei A und einmal bei C (Zustand im Graphen antippen) und lass bis $n = 20$ laufen. Was fällt dir am Ende auf? [Stabile Verteilung](?sc=kunden&view=fix&n=20)
4. Schau dir $M^2$ beim Wetter an und tippe die Einträge an. Die Wege werden aufgelistet. [M² ansehen](?sc=wetter&view=pow&n=2&ci=1&cj=2)
5. Beim Studium gibt es zwei absorbierende Zustände. Wie sieht die Grenzmatrix aus? [Studium](?sc=studium&view=fix&n=12)
6. Die Käfer kommen nach drei Schritten immer wieder auf denselben Bestand. Prüfe $M^3$. [Käfer](?sc=kaefer&view=pow&n=3&ci=1&cj=1)
7. Rechne beim Wetter rückwärts (negative $n$). Ab wann wird es unmöglich? [Rückwärts](?sc=wetter&view=back&n=-1)

## Aufgaben

### Aufgabe 1: Übermorgen

Heute scheint die Sonne. Mit welcher Wahrscheinlichkeit scheint sie übermorgen? [Aufgabe laden](?sc=wetter&view=step&n=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Zwei Wege führen von Sonne zu Sonne: S → S → S mit $0{,}9 \cdot 0{,}9 = 0{,}81$ und S → R → S mit $0{,}1 \cdot 0{,}2 = 0{,}02$. Zusammen $0{,}83$, das ist der Eintrag $(M^2)_{11}$. [In der Simulation zeigen](?sc=wetter&view=pow&n=2&ci=1&cj=1)

</details>

### Aufgabe 2: Ein Jahr Kundenwanderung

Anbieter A, B und C haben 400, 350 und 250 Kunden. Berechne die Kundenzahlen nach einem Jahr. [Aufgabe laden](?sc=kunden&view=step&n=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A: 0{,}8 \cdot 400 + 0{,}2 \cdot 350 + 0{,}1 \cdot 250 = 415$, $B: 0{,}1 \cdot 400 + 0{,}7 \cdot 350 + 0{,}2 \cdot 250 = 335$, $C: 0{,}1 \cdot 400 + 0{,}1 \cdot 350 + 0{,}7 \cdot 250 = 250$. Die Summe bleibt 1000. [In der Simulation zeigen](?sc=kunden&view=step&n=0)

</details>

### Aufgabe 3: Stabile Verteilung

Bestimme die stabile Verteilung der Kundenwanderung. Wie viele der 1000 Kunden hat A auf lange Sicht?

<details>
<summary>Lösung anzeigen</summary>

Aus $(M - E)\cdot\vec x = \vec 0$ folgt $0{,}2a = 0{,}2b + 0{,}1c$ und $0{,}3c = 0{,}1a + 0{,}1b$, also $a = 1{,}75c$, $b = 1{,}25c$. Mit $a + b + c = 1$: $c = \tfrac14$, $b = \tfrac{5}{16}$, $a = \tfrac{7}{16}$. A hat auf lange Sicht $437{,}5$ Kunden. [In der Simulation zeigen](?sc=kunden&view=fix&n=20)

</details>

### Aufgabe 4: Abschluss oder Abbruch?

Pro Jahr schließen 30 % der Studierenden ab, 10 % brechen ab, der Rest studiert weiter. Welcher Anteil schließt am Ende ab?

<details>
<summary>Lösung anzeigen</summary>

Wer im Studium bleibt, steht jedes Jahr wieder vor derselben Wahl. Der Abschluss-Anteil ist $0{,}3 + 0{,}6 \cdot 0{,}3 + 0{,}6^2 \cdot 0{,}3 + \dots = \frac{0{,}3}{1 - 0{,}6} = 0{,}75$. Also 75 % Abschluss, 25 % Abbruch. [In der Simulation zeigen](?sc=studium&view=fix&n=12)

</details>

### Aufgabe 5: Ein Käferzyklus

600 Eier: Die Hälfte wird zu Larven, ein Drittel der Larven zu Käfern, jeder Käfer legt 6 Eier. Wie entwickelt sich der Bestand? Zeige $M^3 = E$.

<details>
<summary>Lösung anzeigen</summary>

$600$ Eier → $300$ Larven → $100$ Käfer → $600$ Eier. Für $M^3$ wird jeder Zustand einmal reihum durchlaufen: $6 \cdot 0{,}5 \cdot \tfrac13 = 1$ auf der Diagonalen, sonst 0. Also $M^3 = E$, der Bestand wiederholt sich alle 3 Schritte. [In der Simulation zeigen](?sc=kaefer&view=pow&n=3&ci=1&cj=1)

</details>

### Aufgabe 6: Gestern?

Heute ist sicher Sonne, $\vec x_0 = (1 \mid 0)$. Wie hätte die Verteilung gestern sein müssen?

<details>
<summary>Lösung anzeigen</summary>

$M^{-1} = \frac{1}{0{,}7}\begin{pmatrix} 0{,}8 & -0{,}2 \\ -0{,}1 & 0{,}9 \end{pmatrix}$, also $\vec x_{-1} = M^{-1}\vec x_0 \approx (1{,}143 \mid -0{,}143)$. Ein negativer Anteil ist unmöglich: Sichere Sonne heute kann aus keiner Verteilung von gestern entstehen. [In der Simulation zeigen](?sc=wetter&view=back&n=0)

</details>

## Ideen für den Unterricht

- **Einsatz:** Übergangsprozesse und Markov-Ketten in der Qualifikationsphase, meist im Bereich Lineare Algebra. Der Graph eignet sich zum Einstieg, die Matrix-Ansicht zum Üben der Multiplikation, der Verlauf für Vermutungen zum Langzeitverhalten.
- **Mögliche Abfolge:** Graph lesen → einen Schritt von Hand rechnen → $M^2$ über Wege deuten → Grenzverhalten vermuten → Fixvektor rechnen → Sonderfälle (absorbierend, zyklisch) vergleichen.
- **Eigene Matrizen:** Unter „Eigene Matrix“ lassen sich Aufgaben aus dem Schulbuch eingeben (Zeilen mit Semikolon trennen, Brüche wie 1/3 erlaubt).
- **Häufige Stolpersteine:**
  - Zeilen und Spalten vertauscht – hier steht in Spalte $j$, wohin es **von** $j$ geht; manche Bücher schreiben die Matrix transponiert (Zeilensumme 1).
  - Die stabile Verteilung wird mit dem Startvektor verwechselt: Sie hängt bei regulären Ketten gar nicht vom Start ab.
  - Beim Rückwärtsrechnen werden negative Einträge übersehen.
- **Bezug zum Lehrplan:** Bezeichnungen (Übergangsmatrix, Prozessmatrix, Zustandsvektor) unterscheiden sich zwischen Lehrplänen und Büchern – bitte am eigenen Lehrplan prüfen.
