---
description: "Interaktive Simulation zum elektrischen Feld: Punktladungen ziehen und einstellen, Feldlinien, Äquipotentiallinien und Feldstärke live sehen, Probeladung mit Kraftpfeil und Vektoraddition, dazu der Plattenkondensator mit E = U / d."
---

## Worum geht es?

Eine elektrische Ladung verändert den Raum um sich herum: Jede andere Ladung erfährt dort eine Kraft. Diesen Zustand nennt man **elektrisches Feld**. Gemessen wird es mit einer kleinen positiven **Probeladung** $q_0$: Die **Feldstärke** ist die Kraft pro Ladung,

$$
\vec E = \frac{\vec F}{q_0}, \qquad [E] = 1\,\frac{\text{N}}{\text{C}} = 1\,\frac{\text{V}}{\text{m}} .
$$

Für eine **Punktladung** $Q$ folgt aus dem Coulombschen Gesetz im Abstand $r$

$$
E = k \cdot \frac{|Q|}{r^2}, \qquad k = \frac{1}{4\pi\varepsilon_0} \approx 8{,}99 \cdot 10^9\,\frac{\text{N}\,\text{m}^2}{\text{C}^2} .
$$

Doppelter Abstand heißt also nur noch ein Viertel der Feldstärke. Das Feld zeigt bei positiver Ladung von ihr weg, bei negativer Ladung zu ihr hin. Direkt auf der Ladung ($r = 0$) ist die Feldstärke nicht definiert; setzt du die Probeladung genau auf eine Ladung, zeigt die Simulation deshalb keinen Wert.

**Kraft auf eine Ladung:** Auf eine Ladung $q$ im Feld wirkt $F = q \cdot E$. Ist $q$ positiv, zeigt die Kraft in Richtung der Feldlinien; ist $q$ negativ (zum Beispiel ein Elektron), zeigt sie genau entgegengesetzt. Die Probeladung in der Simulation ist immer positiv ($q_0 = +1\,\text{nC}$).

Wirken **mehrere Ladungen**, addieren sich ihre Felder als **Vektoren** (Superposition). Der Kasten „Vektoraddition“ zeigt das: Die Einzelfelder $\vec E_1, \vec E_2, \dots$ werden aneinandergehängt, der orange Pfeil ist die Summe.

**Feldlinien** machen das Feld sichtbar:

- Sie beginnen an positiven und enden an negativen Ladungen (oder im Unendlichen).
- Die Feldstärke zeigt an jeder Stelle in Richtung der Feldlinie.
- Wo die Linien dicht liegen, ist das Feld stark. Die Zahl der Linien ist hier proportional zur Ladung (8 Linien pro nC).
- Feldlinien schneiden sich nie.

**Äquipotentiallinien** (grün gestrichelt) verbinden Punkte mit gleichem Potential $\varphi = \sum k \cdot Q_i / r_i$. Sie stehen überall senkrecht auf den Feldlinien. Bewegt man eine Ladung entlang einer Äquipotentiallinie, wird keine Arbeit verrichtet.

Im **Plattenkondensator** ist das Feld zwischen den Platten **homogen**: überall gleich stark und gleich gerichtet, mit

$$
E = \frac{U}{d} .
$$

Die Äquipotentiallinien sind dort parallel zu den Platten und gleich weit voneinander entfernt.

**Zur Darstellung:** Die Farbe im Hintergrund zeigt die Feldstärke auf einer logarithmischen Skala (10 bis 100 000 N/C). Der Kraftpfeil wächst proportional zu $E$ und wird bei sehr starken Feldern gekappt (Zeichen ≫). Beim Kondensator sind Randeffekte vernachlässigt: außen ist kein Feld.

## Ausprobieren

1. Ziehe die Probeladung um den Dipol herum. Wo ist das Feld am stärksten? In welche Richtung zeigt es auf der Mittelsenkrechten zwischen den beiden Ladungen? [Dipol](?px=0&py=0)
2. Eine einzelne Ladung: Verdopple den Abstand der Probeladung von 10 cm auf 20 cm. Was passiert mit $E$? [Einzelne Ladung](?n=1&x1=0&y1=0&px=10&py=0)
3. Zwei gleiche Ladungen: Suche die Stelle, an der das Feld null ist. [Zwei gleiche Ladungen](?q2=1&eq=1&px=0&py=6)
4. Ungleiche Ladungen: Von der großen Ladung gehen dreimal so viele Linien aus. Wohin laufen die übrigen? [+3 nC und −1 nC](?q1=3&q2=-1&px=0&py=8)
5. Schalte die Äquipotentiallinien ein. Prüfe: Stehen sie überall senkrecht auf den Feldlinien? [Mit Äquipotentiallinien](?eq=1)
6. Plattenkondensator: Verschiebe die Probeladung zwischen den Platten. Ändert sich $E$? [Plattenkondensator](?mode=plates&eq=1&py=3)

## Aufgaben

### Aufgabe 1: Feld einer Punktladung

Eine Ladung $Q = 1{,}0\,\text{nC}$ sitzt im Ursprung. Berechne die Feldstärke im Abstand $10\,\text{cm}$ und im Abstand $20\,\text{cm}$. [Aufgabe laden](?n=1&x1=0&y1=0&px=10&py=0&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$E = 8{,}99 \cdot 10^9\,\frac{\text{N}\,\text{m}^2}{\text{C}^2} \cdot \frac{1{,}0 \cdot 10^{-9}\,\text{C}}{(0{,}10\,\text{m})^2} \approx 899\,\frac{\text{N}}{\text{C}}$.
Bei doppeltem Abstand ein Viertel davon: $E \approx 225\,\frac{\text{N}}{\text{C}}$. [In der Simulation zeigen](?n=1&x1=0&y1=0&px=10&py=0)

</details>

### Aufgabe 2: Dipol

$Q_1 = +1\,\text{nC}$ bei $x = -10\,\text{cm}$, $Q_2 = -1\,\text{nC}$ bei $x = +10\,\text{cm}$. Bestimme Betrag und Richtung der Feldstärke in der Mitte und die Kraft auf $q_0 = 1\,\text{nC}$. [Aufgabe laden](?px=0&py=0&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Jede Ladung liefert $899\,\frac{\text{N}}{\text{C}}$. Beide Felder zeigen nach rechts (weg von $Q_1$, hin zu $Q_2$), also $E \approx 1798\,\frac{\text{N}}{\text{C}}$ zur negativen Ladung hin. Kraft: $F = q_0 \cdot E \approx 1{,}80\,\mu\text{N}$. [In der Simulation zeigen](?px=0&py=0)

</details>

### Aufgabe 3: Plattenkondensator

An einem Kondensator mit $d = 10\,\text{cm}$ liegen $U = 1000\,\text{V}$. Wie groß sind Feldstärke und Kraft auf $q_0 = 1\,\text{nC}$? Welches Potential hat ein Punkt $5\,\text{cm}$ von der negativen Platte? [Aufgabe laden](?mode=plates&py=3&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$E = \frac{U}{d} = \frac{1000\,\text{V}}{0{,}10\,\text{m}} = 10\,000\,\frac{\text{V}}{\text{m}}$, $F = q_0 \cdot E = 10\,\mu\text{N}$. Potential: $\varphi = E \cdot s = 10\,000\,\frac{\text{V}}{\text{m}} \cdot 0{,}05\,\text{m} = 500\,\text{V}$. [In der Simulation zeigen](?mode=plates&py=3&eq=1)

</details>

### Aufgabe 4: Zwei gleiche Ladungen

Zwei Ladungen $+1\,\text{nC}$ sitzen bei $x = -10\,\text{cm}$ und $x = +10\,\text{cm}$. Bestimme die Feldstärke im Punkt $(0 \mid 10\,\text{cm})$ über der Mitte. Wo ist das Feld null? [Aufgabe laden](?q2=1&px=0&py=10&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Abstand zu jeder Ladung: $r = \sqrt{(0{,}10\,\text{m})^2 + (0{,}10\,\text{m})^2} \approx 0{,}141\,\text{m}$, also $E_1 = E_2 = 8{,}99 \cdot 10^9 \cdot \frac{10^{-9}}{0{,}02}\,\frac{\text{N}}{\text{C}} \approx 449\,\frac{\text{N}}{\text{C}}$. Die waagerechten Anteile heben sich auf, die senkrechten addieren sich: $E = 2 \cdot 449\,\frac{\text{N}}{\text{C}} \cdot \frac{10\,\text{cm}}{14{,}1\,\text{cm}} \approx 636\,\frac{\text{N}}{\text{C}}$, senkrecht nach oben (90°). In der Mitte zwischen den Ladungen ($x = 0$, $y = 0$) heben sich beide Felder ganz auf: Dort ist das Feld null (feldfreier Punkt). [In der Simulation zeigen](?q2=1&px=0&py=10)

</details>

### Aufgabe 5: Feldfreier Punkt bei ungleichen Ladungen

$Q_1 = +1\,\text{nC}$ sitzt bei $x = -10\,\text{cm}$, $Q_2 = +4\,\text{nC}$ bei $x = +14\,\text{cm}$. An welcher Stelle zwischen den Ladungen ist das Feld null? [Aufgabe laden](?q2=4&x2=14&px=0&py=0&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Ladungen sind $24\,\text{cm}$ voneinander entfernt. Im Abstand $a$ von $Q_1$ gilt $\frac{k \cdot 1\,\text{nC}}{a^2} = \frac{k \cdot 4\,\text{nC}}{(24\,\text{cm} - a)^2}$, also $24\,\text{cm} - a = 2a$ und $a = 8\,\text{cm}$. Der feldfreie Punkt liegt bei $x = -2\,\text{cm}$, näher an der kleineren Ladung. [In der Simulation zeigen](?q2=4&x2=14&px=-2&py=0)

</details>

### Aufgabe 6: Ein Elektron im Kondensator

Statt der Probeladung befindet sich ein Elektron ($q = -1{,}6 \cdot 10^{-19}\,\text{C}$) im Kondensator aus Aufgabe 3. Wie groß ist die Kraft, und in welche Richtung zeigt sie? [Aufgabe laden](?mode=plates&py=3&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F = |q| \cdot E = 1{,}6 \cdot 10^{-19}\,\text{C} \cdot 10\,000\,\frac{\text{N}}{\text{C}} = 1{,}6 \cdot 10^{-15}\,\text{N}$. Weil das Elektron negativ ist, zeigt die Kraft entgegen den Feldlinien, also zur positiven Platte hin. Der orange Pfeil der positiven Probeladung zeigt genau in die Gegenrichtung. [In der Simulation zeigen](?mode=plates&py=3)

</details>

## Ideen für den Unterricht

- Mit Grießkörnern in Öl oder Watteflocken zeigen, wie Feldlinienbilder im Experiment aussehen, dann hier vergleichen.
- Die Vektoraddition zuerst von Hand mit zwei Ladungen zeichnen lassen und mit dem Kasten prüfen.
- **Typische Stolpersteine:**
  - „Feldlinien sind Bahnen, auf denen sich Ladungen bewegen.“ – Sie zeigen die Kraftrichtung; eine Ladung mit Anfangsgeschwindigkeit folgt ihnen im Allgemeinen nicht.
  - „Zwischen zwei Feldlinien ist kein Feld.“ – Das Feld ist überall; die Linien sind nur eine Auswahl.
  - „Im Kondensator ist das Feld in der Mitte schwächer.“ – Im idealen Kondensator ist es überall gleich.
