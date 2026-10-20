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

Doppelter Abstand heißt also nur noch ein Viertel der Feldstärke. Das Feld zeigt bei positiver Ladung von ihr weg, bei negativer Ladung zu ihr hin.

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

1. Ziehe die Probeladung um den Dipol herum. Wo ist das Feld am stärksten, wo zeigt es senkrecht nach unten? [Dipol](?px=0&py=0)
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

## Ideen für den Unterricht

- Mit Grießkörnern in Öl oder Watteflocken zeigen, wie Feldlinienbilder im Experiment aussehen, dann hier vergleichen.
- Die Vektoraddition zuerst von Hand mit zwei Ladungen zeichnen lassen und mit dem Kasten prüfen.
- **Typische Stolpersteine:**
  - „Feldlinien sind Bahnen, auf denen sich Ladungen bewegen.“ – Sie zeigen die Kraftrichtung; eine Ladung mit Anfangsgeschwindigkeit folgt ihnen im Allgemeinen nicht.
  - „Zwischen zwei Feldlinien ist kein Feld.“ – Das Feld ist überall; die Linien sind nur eine Auswahl.
  - „Im Kondensator ist das Feld in der Mitte schwächer.“ – Im idealen Kondensator ist es überall gleich.
