---
description: "Interaktive Simulation zum grafischen Lösen von Gleichungen: beide Seiten als Graphen, Lösungen als x-Koordinaten der Schnittpunkte, Differenzfunktion, Berührpunkt, Bruch- und Betragsgleichungen und Intervallhalbierung mit Lupe."
---

## Worum geht es?

Eine Gleichung wie $x^2 - 1 = 0{,}5x + 2$ vergleicht zwei Terme. Fasst man beide Seiten als **Funktionen** auf, also $f(x) = x^2 - 1$ und $g(x) = 0{,}5x + 2$, dann sucht man alle $x$, für die beide Funktionen **denselben Wert** haben. An genau diesen Stellen haben die Graphen von $f$ und $g$ einen gemeinsamen Punkt – sie **schneiden** (oder berühren) sich.

**Grafisches Lösungsverfahren:**

1. Linke und rechte Seite als Funktionen $f$ und $g$ auffassen und beide Graphen in ein Koordinatensystem zeichnen.
2. Die Schnittpunkte der Graphen suchen.
3. Die **$x$-Koordinaten** der Schnittpunkte ablesen – das sind die Lösungen. Die Lote auf die $x$-Achse helfen dabei.
4. **Probe:** Die abgelesenen Werte in beide Seiten einsetzen.

Im Beispiel schneiden sich die Graphen in $S_1(-1{,}5 \mid 1{,}25)$ und $S_2(2 \mid 3)$, also ist $L = \{-1{,}5;\ 2\}$. Probe für $x = 2$: $f(2) = 2^2 - 1 = 3$ und $g(2) = 0{,}5 \cdot 2 + 2 = 3$ ✓.

**Wie viele Lösungen gibt es?**

| Lage der Graphen | Lösungen |
| --- | --- |
| schneiden sich in zwei Punkten | zwei Lösungen |
| berühren sich in einem Punkt (Berührpunkt) | eine Lösung |
| haben keinen gemeinsamen Punkt | keine Lösung: $L = \{\,\}$ |
| fallen (teilweise) zusammen | unendlich viele Lösungen |

**Differenzfunktion:** Es gilt $f(x) = g(x) \iff f(x) - g(x) = 0$. Die Lösungen der Gleichung sind also die **Nullstellen** von

$$
h(x) = f(x) - g(x).
$$

Im Bild wird dabei jeder Punkt um $g(x)$ nach unten verschoben: Der Graph von $g$ wandert auf die $x$-Achse, die Schnittpunkte „fallen“ senkrecht auf die $x$-Achse – die Lösungen bleiben dieselben.

**Bruchgleichungen:** Bei $\dfrac{2}{x - 1} = x$ ist $x = 1$ ausgeschlossen, die Definitionsmenge ist $D = \mathbb{R} \setminus \{1\}$. Grafisch schneiden sich eine Hyperbel und eine Gerade; die Lösungen sind $-1$ und $2$.

**Näherung durch Intervallhalbierung:** Liegt eine Lösung nicht auf dem Gitter, z. B. bei $x^2 = 2$, kann man sie einschließen. Für $h(x) = x^2 - 2$ gilt $h(1) = -1 < 0$ und $h(2) = 2 > 0$: Das Vorzeichen wechselt, also liegt eine Lösung zwischen $1$ und $2$. Nun prüft man die Mitte $m = 1{,}5$: $h(1{,}5) = 0{,}25 > 0$, also liegt die Lösung in $[1;\ 1{,}5]$. Mit jedem Schritt halbiert sich die Breite des Intervalls; nach 10 Schritten ist sie kleiner als $0{,}001$. So nähert man $\sqrt{2} \approx 1{,}414$ beliebig genau an. Bei einem **Berührpunkt** wechselt das Vorzeichen nicht – dort funktioniert das Verfahren nicht.

## Ausprobieren

1. Ziehe am Scheitel der Parabel oder an den Punkten der Geraden. Wann gibt es zwei, eine oder keine Lösung? Stelle einen [Berührpunkt](?e1=0&m2=2&t2=-1) ein.
2. Schalte **Als Nullstellen von h(x) = f(x) − g(x)** ein und beobachte, wohin die Schnittpunkte wandern. [Beispiel laden](?diff=1)
3. Lade [x² = 2](?e1=0&m2=0&t2=2) und drücke mehrmals **x₂ annähern** bzw. **Intervall halbieren**. Die Lupe oben links zeigt, wo du gerade bist. Nach wie vielen Schritten ist die zweite Nachkommastelle sicher?
4. Untersuche die Bruchgleichung [2/(x − 1) = x](?f=hyp&a1=2&d1=1&e1=0&m2=1&t2=0). Warum kann $x = 1$ nie eine Lösung sein?
5. Vergleiche [|x − 1| = 0,5x + 1](?f=abs&a1=1&d1=1&e1=0&m2=0.5&t2=1) mit [|x − 1| = −x + 1](?f=abs&a1=1&d1=1&e1=0&m2=-1&t2=1). Was ist im zweiten Fall besonders?
6. Bei [1/x = x² − 2](?f=hyp&g=quad&a1=1&d1=0&e1=0&a2=1&d2=0&e2=-2) gibt es drei Lösungen. Welche kannst du exakt ablesen, welche nur ungefähr?

## Aufgaben

### Aufgabe 1: Ablesen und Probe

[Aufgabe laden](?e1=-4&m2=1&t2=2&show=0&_hide=1) Löse $x^2 - 4 = x + 2$ grafisch und mache die Probe.

<details>
<summary>Lösung anzeigen</summary>

Die Graphen schneiden sich in $(-2 \mid 0)$ und $(3 \mid 5)$, also $L = \{-2;\ 3\}$.
Probe: $(-2)^2 - 4 = 0$ und $-2 + 2 = 0$ ✓; $3^2 - 4 = 5$ und $3 + 2 = 5$ ✓. [In der Simulation zeigen](?e1=-4&m2=1&t2=2)

</details>

### Aufgabe 2: Wie viele Lösungen?

Entscheide mithilfe der Graphen, wie viele Lösungen die Gleichung hat: (a) $x^2 + 1 = x$, (b) $x^2 = 4x - 4$, (c) $0{,}5x^2 = 2$.

<details>
<summary>Lösung anzeigen</summary>

(a) Die Parabel liegt ganz über der Geraden: **keine** Lösung. [Zeigen](?e1=1&m2=1&t2=0)

(b) Parabel und Gerade berühren sich in $(2 \mid 4)$: **eine** Lösung, $L = \{2\}$. [Zeigen](?e1=0&m2=4&t2=-4)

(c) Die Parabel schneidet die Parallele zur $x$-Achse zweimal: $L = \{-2;\ 2\}$. [Zeigen](?a1=0.5&e1=0&m2=0&t2=2)

</details>

### Aufgabe 3: Bruchgleichung

[Aufgabe laden](?f=hyp&a1=4&d1=0&e1=0&m2=1&t2=3&show=0&_hide=1) Gib die Definitionsmenge an und löse $\dfrac{4}{x} = x + 3$ grafisch.

<details>
<summary>Lösung anzeigen</summary>

$D = \mathbb{R} \setminus \{0\}$. Hyperbel und Gerade schneiden sich in $(-4 \mid -1)$ und $(1 \mid 4)$, also $L = \{-4;\ 1\}$.
Rechnerisch: Multiplizieren mit $x$ ergibt $4 = x^2 + 3x$, also $x^2 + 3x - 4 = 0$ bzw. $(x + 4)(x - 1) = 0$. [In der Simulation zeigen](?f=hyp&a1=4&d1=0&e1=0&m2=1&t2=3)

</details>

### Aufgabe 4: Eine Wurzel einschließen

[Aufgabe laden](?e1=0&m2=0&t2=3&_hide=1) Die Gleichung $x^2 = 3$ hat eine positive Lösung. Schließe sie mit Intervallhalbierung ein, bis die erste Nachkommastelle sicher ist.

<details>
<summary>Lösung anzeigen</summary>

Mit $h(x) = x^2 - 3$: Start $[1;\ 2]$. $h(1{,}5) < 0 \Rightarrow [1{,}5;\ 2]$; $h(1{,}75) > 0 \Rightarrow [1{,}5;\ 1{,}75]$; $h(1{,}625) < 0 \Rightarrow [1{,}625;\ 1{,}75]$; $h(1{,}6875) < 0 \Rightarrow [1{,}6875;\ 1{,}75]$.
Alle Zahlen in diesem Intervall runden auf $1{,}7$, also $x \approx 1{,}7$ (genauer $\sqrt{3} \approx 1{,}732$).

</details>

### Aufgabe 5: Betragsgleichung

[Aufgabe laden](?f=abs&a1=1&d1=-2&e1=0&m2=0&t2=3&show=0&_hide=1) Löse $|x + 2| = 3$ grafisch. Deute die Lösungen als Abstände auf der Zahlengeraden.

<details>
<summary>Lösung anzeigen</summary>

$L = \{-5;\ 1\}$. $|x + 2| = |x - (-2)|$ ist der Abstand von $x$ zu $-2$ – genau die Zahlen $-5$ und $1$ haben von $-2$ den Abstand $3$. [In der Simulation zeigen](?f=abs&a1=1&d1=-2&e1=0&m2=0&t2=3)

</details>

### Aufgabe 6: Begründen

Begründe mit dem Graphen, warum die Gleichung $\dfrac{1}{x} = 0$ keine Lösung hat.

<details>
<summary>Lösung anzeigen</summary>

Die Hyperbel $y = \frac{1}{x}$ nähert sich der $x$-Achse beliebig nahe an, erreicht sie aber nie: Die $x$-Achse ist eine Asymptote. Ein Bruch mit dem Zähler $1$ ist nie $0$. Also $L = \{\,\}$. [Zeigen](?f=hyp&a1=1&d1=0&e1=0&m2=0&t2=0)

</details>

## Hinweise für Lehrkräfte

- **Einsatz (Bezug als Entwurf):** Jahrgangsstufe 8, Lernbereich 4 (Bruchgleichungen lösen und als Schnittproblem von Graphen deuten), aufbauend auf dem Funktionsbegriff aus Lernbereich 1; Jahrgangsstufe 9, Lernbereich 2 (quadratische Gleichungen, Schnittpunkte von Parabel und Gerade) und Lernbereich 1 (Näherungswerte für Quadratwurzeln: die Intervallhalbierung ist eine Form der Intervallschachtelung). Geeignet als Einstieg, zum Üben und zum Vergleich grafisch – rechnerisch.
- **Modell:** Jede Seite ist eine Gerade $mx + t$, Parabel $a(x - d)^2 + e$, Hyperbel $\frac{a}{x - d} + e$ oder ein Betragsgraph $a \cdot |x - d| + e$. Die Simulation rechnet die Lösungen exakt (bei quadratischen Gleichungen mit Wurzeln, z. B. $\frac{1 + \sqrt{5}}{2}$), bei Gleichungen dritten Grades (Hyperbel und Parabel) numerisch. Grundmenge ist $\mathbb{R}$; in Jahrgangsstufe 8 (rationale Zahlen) Beispiele mit rationalen Lösungen wählen.
- **Aufgabenmodus:** `show=0` blendet Schnittpunkte, Lote und Lösungskarte im Bild aus, `_hide=1` verdeckt Anzahl, Lösungsmenge und Probe in den Ergebnissen.
- **Typische Fehlvorstellungen:**
  - Als Lösung wird der Schnittpunkt $(2 \mid 3)$ angegeben statt seiner $x$-Koordinate $2$.
  - Ein Berührpunkt wird übersehen oder als „zwei Lösungen“ gezählt.
  - Bei Bruchgleichungen wird die Definitionsmenge vergessen. Nach dem Multiplizieren mit dem Nenner können Scheinlösungen entstehen: $\frac{x}{x - 1} = \frac{1}{x - 1}$ führt auf $x = 1$, das nicht in $D$ liegt. Die Graphen von $\frac{1}{x - 1} + 1$ (das ist $\frac{x}{x - 1}$) und $\frac{1}{x - 1}$ haben tatsächlich keinen gemeinsamen Punkt. [Zeigen](?f=hyp&g=hyp&a1=1&d1=1&e1=1&a2=1&d2=1&e2=0)
  - Abgelesene Werte werden für exakt gehalten – ohne Probe bleibt jede grafische Lösung eine Näherung.
