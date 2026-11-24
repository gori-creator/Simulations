## Worum geht es?

Der Graph einer **quadratischen Funktion** ist eine **Parabel**. Die einfachste ist die **Normalparabel** $y = x^2$ mit dem Scheitelpunkt im Ursprung.

In der **Scheitelpunktform** kann man den Scheitelpunkt $S(d \mid e)$ direkt ablesen:

$$
f(x) = a\,(x - d)^2 + e
$$

- $a$ bestimmt **Öffnung** und **Form**: Für $a > 0$ ist die Parabel nach oben, für $a < 0$ nach unten geöffnet. Für $|a| > 1$ ist sie **gestreckt** (schmaler), für $|a| < 1$ **gestaucht** (breiter).
- $d$ verschiebt die Parabel in **x-Richtung**. Achtung Vorzeichen: $(x - 3)^2$ verschiebt um 3 nach **rechts**.
- $e$ verschiebt die Parabel in **y-Richtung**.

Multipliziert man die Klammer aus, erhält man die **allgemeine Form**:

$$
f(x) = a x^2 + b x + c \quad\text{mit}\quad b = -2ad,\;\; c = ad^2 + e
$$

Umgekehrt (quadratische Ergänzung): $d = -\frac{b}{2a}$ und $e = c - \frac{b^2}{4a}$.

### Nullstellen

Ob und wo die Parabel die x-Achse schneidet, verrät die **Diskriminante** $D = b^2 - 4ac$:

| Diskriminante | Anzahl der Nullstellen |
| --- | --- |
| $D > 0$ | zwei Nullstellen |
| $D = 0$ | eine (doppelte) Nullstelle – der Scheitel liegt auf der x-Achse |
| $D < 0$ | keine Nullstelle |

Die Nullstellen selbst liefert die Lösungsformel:

$$
x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### Parabel und Gerade

Wo schneidet die Parabel $f(x) = ax^2 + bx + c$ die Gerade $y = mx + n$? Gleichsetzen ergibt die quadratische Gleichung $ax^2 + (b - m)x + (c - n) = 0$. Ihre Diskriminante entscheidet: positiv – zwei Schnittpunkte (**Sekante**), null – ein Berührpunkt (**Tangente**), negativ – kein gemeinsamer Punkt (**Passante**). Beispiel: $x^2 = x + 2$ führt auf $x^2 - x - 2 = 0$ mit $x_1 = -1$, $x_2 = 2$.

## Ausprobieren

1. Verändere nur $a$ – auch ins Negative. Vergleiche mit der gestrichelten Normalparabel. [a = 2](?a=2) [a = −0,5](?a=-0.5)
2. Stelle $d = 3$ ein. Warum steht in der Funktionsgleichung dann ein **Minus**? [Beispiel laden](?d=3)
3. Ziehe den Scheitelpunkt $S$ nach oben und unten. Wann gibt es zwei, eine oder keine Nullstelle?
4. Schalte das **Streckfaktor-Dreieck** ein: Vom Scheitel aus geht es 1 nach rechts und $a$ nach oben. Ziehe den hohlen Punkt rechts vom Scheitel nach oben oder unten – so änderst du $a$. [Beispiel laden](?a=1.5&d=-1&e=-2&step=1)
5. Wechsle oben zur **allgemeinen Form**. Die Parabel bleibt gleich – nur die Darstellung ändert sich.
6. **Parabel und Gerade:** Zieh die beiden Punkte der Geraden. Stelle eine Tangente ein: Wann gibt es genau einen gemeinsamen Punkt? [Sekante](?mode=line&a=1&d=0&e=0&m=1&n=2) · [Tangente](?mode=line&a=1&d=0&e=0&m=2&n=-1)
7. **Wurfparabel:** Tippe auf „Werfen“ und verändere dann den höchsten Punkt $(d \mid e)$ und $a$. Wie weit fliegt der Ball? [Ballwurf](?mode=throw&a=-0.1&d=6&e=5)
8. **Spiel:** Lies Scheitel und Streckfaktor der orangen Parabel ab und stelle sie nach. [Parabel treffen](?mode=match&q=1&a=1&d=0&e=0)

## Aufgaben

### Aufgabe 1: Scheitelpunktform ablesen

[Aufgabe laden](?a=0.5&d=-2&e=-4.5&_hide=1) Lies den Scheitelpunkt ab und bestimme $a$ mit dem Streckfaktor-Dreieck. Gib die Funktionsgleichung an und berechne die Nullstellen.

<details>
<summary>Lösung anzeigen</summary>

Scheitelpunkt $S(-2 \mid -4{,}5)$. Vom Scheitel 1 nach rechts geht es 0,5 nach oben, also $a = 0{,}5$:

$$f(x) = 0{,}5\,(x + 2)^2 - 4{,}5$$

Nullstellen: $0{,}5\,(x+2)^2 = 4{,}5 \Rightarrow (x+2)^2 = 9 \Rightarrow x + 2 = \pm 3$, also $x_1 = -5$ und $x_2 = 1$.

</details>

### Aufgabe 2: Umrechnen

Schreibe $f(x) = 2\,(x - 1)^2 - 8$ in der allgemeinen Form und bestimme die Nullstellen. Überprüfe mit der Simulation.

<details>
<summary>Lösung anzeigen</summary>

$2\,(x^2 - 2x + 1) - 8 = 2x^2 - 4x - 6$. Nullstellen: $x^2 - 2x - 3 = 0 \Rightarrow x_1 = -1,\; x_2 = 3$. [In der Simulation zeigen](?form=allgemein&a=2&b=-4&c=-6)

</details>

### Aufgabe 3: Wie viele Nullstellen?

Entscheide ohne die Nullstellen auszurechnen, wie viele Nullstellen die Funktionen haben:

1. $f(x) = x^2 + 2x + 3$
2. $g(x) = -x^2 + 4x - 4$
3. $h(x) = 0{,}5x^2 - 2$

<details>
<summary>Lösung anzeigen</summary>

1. $D = 4 - 12 = -8 < 0$: keine Nullstelle. [Zeigen](?form=allgemein&b=2&c=3)
2. $D = 16 - 16 = 0$: eine doppelte Nullstelle bei $x = 2$. [Zeigen](?form=allgemein&a=-1&b=4&c=-4)
3. $D = 0 + 4 = 4 > 0$: zwei Nullstellen ($x = \pm 2$). [Zeigen](?form=allgemein&a=0.5&c=-2)

</details>

### Aufgabe 4: Ballwurf (Modellieren)

Die Flugbahn eines Balls wird durch $h(x) = -0{,}2\,(x - 5)^2 + 6$ beschrieben ($x$: Entfernung in m, $h$: Höhe in m). Wie hoch fliegt der Ball höchstens, und wie weit fliegt er? Zum Überprüfen eignet sich die Ansicht „Wurfparabel“.

<details>
<summary>Lösung anzeigen</summary>

Der Scheitelpunkt $S(5 \mid 6)$ ist der höchste Punkt: 6 m Höhe nach 5 m. Landung: $0{,}2\,(x-5)^2 = 6 \Rightarrow (x-5)^2 = 30 \Rightarrow x = 5 + \sqrt{30} \approx 10{,}5$ m. [In der Simulation zeigen](?mode=throw&a=-0.2&d=5&e=6)

</details>

### Aufgabe 5: Gerade durch die Parabel

Berechne die Schnittpunkte der Parabel $f(x) = x^2$ mit der Geraden $y = x + 2$. Für welches $n$ ist $y = 2x + n$ eine Tangente? [Aufgabe laden](?mode=line&a=1&d=0&e=0&m=1&n=2&zeros=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$x^2 = x + 2 \iff x^2 - x - 2 = 0 \iff (x + 1)(x - 2) = 0$: $S_1(-1 \mid 1)$, $S_2(2 \mid 4)$. Tangente: $x^2 - 2x - n = 0$ braucht die Diskriminante $4 + 4n = 0$, also $n = -1$; Berührpunkt $(1 \mid 1)$. [Tangente zeigen](?mode=line&a=1&d=0&e=0&m=2&n=-1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Einführung der Scheitelpunktform (Klasse 9), Zusammenhang der Darstellungsformen, Vorbereitung der Lösungsformel.
- **Wurfparabel als Einstieg:** Erst den Ball werfen lassen, dann fragen: Welche Bedeutung haben $d$, $e$ und das Vorzeichen von $a$? Höchster Punkt und Landestelle stehen im Bild, wenn **Nullstellen** eingeschaltet ist.
- **Spiel „Parabel treffen“:** Die Parabeln sind nummeriert, gleiche Nummer heißt gleiche Parabel. Gut zum Üben, den Streckfaktor über „1 nach rechts, $a$ nach oben“ abzulesen.
- **Häufige Stolpersteine:**
  - Das Vorzeichen von $d$ wird falsch gedeutet: $(x + 2)^2$ verschiebt nach **links**.
  - „Gestreckt“ wird mit „breiter“ verwechselt. Der gestrichelte Vergleich mit der Normalparabel hilft.
  - Der Parameter $b$ der allgemeinen Form wird als Verschiebung interpretiert – beim Ziehen am Scheitel sieht man, dass sich $b$ und $c$ gemeinsam ändern.
- **Regionale Unterschiede:** Je nach Bundesland wird mit der $pq$-Formel (Normalform $x^2 + px + q$) oder der $abc$-Formel gearbeitet. Die Simulation zeigt die Diskriminante $b^2 - 4ac$; für $a = 1$ entspricht sie $p^2 - 4q$.
- **Gerundete Werte:** Sind Nullstellen oder Scheitel nicht exakt mit zwei Nachkommastellen darstellbar, zeigt die Simulation „≈“ statt „=“ (z. B. $x_2 \approx 10{,}48$ beim Ballwurf). Das ist ein guter Anlass, über exakte Werte wie $5 + \sqrt{30}$ zu sprechen.
- **Aufgabenmodus:** Mit **Teilen → Ergebnisse verdecken** werden Funktionsgleichungen, Scheitelpunkt und Nullstellen verdeckt. So eignet sich jede Einstellung als Ableseaufgabe.
- **Schreibweise:** Manche Lehrpläne und Lehrwerke schreiben den Term als $a \cdot (x + d)^2 + e$. Unter **Anzeige → Schreibweise der Scheitelpunktform** lässt sich die Simulation darauf umstellen; ein positives $d$ verschiebt dann nach links.
