## Worum geht es?

Zwei Größen heißen **indirekt proportional**, wenn ihr Produkt immer gleich ist: Verdoppelt man die eine, halbiert sich die andere. Für eine feste Zahl $a$ gilt dann

$$
x \cdot y = a \quad\Longleftrightarrow\quad y = \frac{a}{x} \qquad (x \neq 0)
$$

Anschaulich: Alle **Rechtecke** zwischen den Achsen und einem Punkt $P(x \mid y)$ des Graphen haben denselben **Flächeninhalt** $|a|$ – ein schmales hohes Rechteck genauso wie ein breites flaches. Der Graph heißt **Hyperbel**; die einfachste ist die Grundfunktion $y = \frac{1}{x}$.

Streckt man mit dem Faktor $a$ und verschiebt anschließend um $b$ in $x$-Richtung und um $c$ in $y$-Richtung, erhält man

$$
f(x) = \frac{a}{x - b} + c
$$

- **Senkrechte Asymptote** $x = b$: Dort ist der Nenner null, $f$ ist nicht definiert (**Polstelle**). Kommt $x$ der Stelle $b$ immer näher, werden die Funktionswerte betragsmäßig beliebig groß.
- **Waagrechte Asymptote** $y = c$: Für $x \to +\infty$ und $x \to -\infty$ wird $\frac{a}{x-b}$ beliebig klein, der Graph nähert sich der Geraden $y = c$, erreicht sie aber nie.
- **Definitionsmenge** $D = \mathbb{R} \setminus \{b\}$, **Wertemenge** $W = \mathbb{R} \setminus \{c\}$.
- **Vorzeichen von $a$**: Bezogen auf das Achsenkreuz der Asymptoten (Schnittpunkt $Z(b \mid c)$) liegen die beiden **Äste** für $a > 0$ im I. und III. Quadranten (auf beiden Teilintervallen fallend), für $a < 0$ im II. und IV. Quadranten (steigend). Je größer $|a|$, desto weiter liegen die Äste von den Asymptoten entfernt.
- Auch nach dem Verschieben gilt die indirekte Proportionalität – nur gemessen von den Asymptoten aus: $(x - b) \cdot (y - c) = a$.

**Schnittpunkte mit den Achsen:**

$$
f(x) = 0 \;\Longleftrightarrow\; x = b - \frac{a}{c} \quad (c \neq 0), \qquad f(0) = c - \frac{a}{b} \quad (b \neq 0)
$$

Für $c = 0$ ist die $x$-Achse selbst Asymptote – dann gibt es keine Nullstelle; für $b = 0$ gibt es keinen Schnittpunkt mit der $y$-Achse.

## Ausprobieren

1. Ziehe den orangen Punkt $P$ am Graphen entlang. Das grüne Rechteck ändert seine Form, aber sein Flächeninhalt bleibt $4$. Lies in der Wertetabelle ab: Was passiert mit $y$, wenn $x$ doppelt so groß wird? [Beispiel laden](?a=4&u=1)
2. Stelle $a$ negativ ein. In welchen Quadranten liegen die Äste jetzt? Was bedeutet das für die Monotonie? [Beispiel laden](?a=-3&u=1.5)
3. Klicke auf **Erst strecken, dann verschieben**: Aus der Grundfunktion $\frac{1}{x}$ entsteht Schritt für Schritt die Hyperbel. [Beispiel laden](?a=2&b=3&c=-2&u=1)
4. Ziehe das Asymptotenkreuz $Z$. Wie hängen $D$ und $W$ mit $Z$ zusammen?
5. Wähle bei **Wertetabelle** „x → ±∞“ und lass $P$ nach außen laufen. Um wie viel wird der Abstand zur waagrechten Asymptote kleiner, wenn $x - b$ zehnmal so groß wird? [Beispiel laden](?a=2&b=-1&c=1.5&u=3&lim=inf)
6. Lass $P$ zur Polstelle laufen. Was passiert mit den Funktionswerten? [Beispiel laden](?a=-2&b=1&c=-1&u=0.5&lim=pole)
7. Ziehe den grünen Punkt $Q(b + 1 \mid c + a)$: Er liegt $1$ rechts von $Z$ und um $a$ verschoben (für $a < 0$ also unterhalb). Das Rechteck mit der Breite $1$ hat den Flächeninhalt $|a|$. Liegt $P$ gerade dort, springt $Q$ auf die andere Seite: $Q(b - 1 \mid c - a)$.

## Aufgaben

### Aufgabe 1: Indirekt proportional?

Ein Rechteck soll den Flächeninhalt $12\,\text{cm}^2$ haben. Stelle die Länge $y$ in Abhängigkeit von der Breite $x$ dar und berechne $y$ für $x = 1{,}5$; $3$; $6$.

<details>
<summary>Lösung anzeigen</summary>

$x \cdot y = 12$, also $y = \frac{12}{x}$: $y = 8$; $4$; $2$ (jeweils in cm). Doppelte Breite – halbe Länge. Der Graph ist der Ast im I. Quadranten der Hyperbel $y = \frac{12}{x}$ (nur $x > 0$ ist sinnvoll). Die Simulation reicht bis $a = 8$, das Prinzip zeigt sie genauso: [Zeigen](?a=8&u=2)

</details>

### Aufgabe 2: Term ablesen

[Aufgabe laden](?a=-2&b=2&c=1&u=1&info=0&_hide=1) Lies die Asymptoten im Bild ab (nicht an den Reglern) und bestimme $a$ mit einem Punkt des Graphen. Gib den Funktionsterm, $D$ und $W$ an.

<details>
<summary>Lösung anzeigen</summary>

Asymptoten $x = 2$ und $y = 1$, also $b = 2$, $c = 1$. Der Punkt $P(3 \mid -1)$ liegt auf dem Graphen: $(3 - 2) \cdot (-1 - 1) = -2 = a$. Damit $f(x) = \frac{-2}{x - 2} + 1$, $D = \mathbb{R} \setminus \{2\}$, $W = \mathbb{R} \setminus \{1\}$. Die Äste liegen im II. und IV. Quadranten, weil $a < 0$. [In der Simulation zeigen](?a=-2&b=2&c=1&u=1)

</details>

### Aufgabe 3: Nullstelle und y-Achsenabschnitt

Berechne die Schnittpunkte des Graphen von $f(x) = \frac{3}{x - 2} + 1$ mit den Koordinatenachsen.

<details>
<summary>Lösung anzeigen</summary>

Nullstelle: $\frac{3}{x-2} = -1 \Rightarrow x - 2 = -3 \Rightarrow x = -1$, also $N(-1 \mid 0)$. $y$-Achse: $f(0) = \frac{3}{-2} + 1 = -0{,}5$, also $S_y(0 \mid -0{,}5)$. [In der Simulation zeigen](?a=3&b=2&c=1&u=2)

</details>

### Aufgabe 4: Annäherung an die Asymptote

Für $f(x) = \frac{2}{x + 1} + 1{,}5$: Ab welchem $x$ unterscheiden sich die Funktionswerte um weniger als $0{,}01$ von $1{,}5$ (für $x > -1$)?

<details>
<summary>Lösung anzeigen</summary>

$\frac{2}{x+1} < 0{,}01 \Leftrightarrow x + 1 > 200 \Leftrightarrow x > 199$. Die Wertetabelle zeigt: Bei $x - b = 100$ ist der Abstand noch $0{,}02$, bei $1000$ nur noch $0{,}002$. [In der Simulation zeigen](?a=2&b=-1&c=1.5&u=3&lim=inf)

</details>

### Aufgabe 5: Hyperbel durch zwei Punkte

Die Hyperbel $f(x) = \frac{a}{x} + c$ geht durch $A(1 \mid 5)$ und $B(4 \mid 2)$. Bestimme $a$ und $c$.

<details>
<summary>Lösung anzeigen</summary>

$a + c = 5$ und $\frac{a}{4} + c = 2$. Subtrahieren: $\frac{3}{4}a = 3$, also $a = 4$ und $c = 1$: $f(x) = \frac{4}{x} + 1$. [In der Simulation zeigen](?a=4&c=1&u=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 8, elementare gebrochen-rationale Funktionen: Einstieg über die indirekte Proportionalität (Rechtecke gleichen Flächeninhalts), danach Einfluss der Parameter, Definitions- und Wertemenge, Asymptoten. Die Schreibweise $\frac{a}{x - b} + c$ entspricht der Scheitelpunktform der Parabel – die Animation „Erst strecken, dann verschieben“ knüpft daran an.
- **Grenzwertbegriff:** Die Annäherung an die Asymptoten wird nur propädeutisch über Wertetabellen behandelt („kommt beliebig nahe, erreicht aber nicht“); $x \to \infty$ ist hier eine Sprechweise, kein formaler Grenzwert.
- **Häufige Stolpersteine:**
  - „Der Graph schneidet die Asymptote nie.“ – Für diese Hyperbeln stimmt das, im Allgemeinen (später: gebrochen-rationale Funktionen) kann ein Graph seine waagrechte Asymptote durchaus schneiden.
  - Das Vorzeichen von $b$: Bei $\frac{a}{x + 2}$ liegt die Polstelle bei $x = -2$.
  - „Die beiden Äste sind zwei Funktionen.“ – Es ist **eine** Funktion mit einer Definitionslücke; die Äste liegen punktsymmetrisch zu $Z(b \mid c)$.
  - Die Polstelle wird als Nullstelle gelesen, weil dort der **Nenner** null wird.
- **Aufgabenmodus:** Mit `info=0` und **Teilen → Ergebnisse verdecken** sind Steckbrief, Wertetabelle und Beschriftungen verdeckt; Asymptoten und Graph bleiben sichtbar und können abgelesen werden.
