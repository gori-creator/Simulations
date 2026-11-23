---
description: "Kegelschnitte als Ortslinien: Ellipse mit der Gärtnerkonstruktion, Parabel aus Brennpunkt und Leitlinie, Hyperbel über die Abstandsdifferenz, alle über die Exzentrizität ε und als Schnitt am Doppelkegel."
---

## Worum geht es?

Eine **Ortslinie** ist die Menge aller Punkte mit einer bestimmten Eigenschaft. Der Kreis ist das bekannteste Beispiel: alle Punkte mit gleichem Abstand zum Mittelpunkt. Ellipse, Parabel und Hyperbel lassen sich genauso beschreiben:

| Kurve | Eigenschaft jedes Punktes $P$ | Gleichung |
| --- | --- | --- |
| Ellipse | $\lvert PF_1\rvert + \lvert PF_2\rvert = 2a$ | $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$ |
| Hyperbel | $\big\lvert \lvert PF_1\rvert - \lvert PF_2\rvert \big\rvert = 2a$ | $\dfrac{x^2}{a^2} - \dfrac{y^2}{b^2} = 1$ |
| Parabel | $\lvert PF\rvert = $ Abstand zur Leitlinie $l$ | $y = \dfrac{x^2}{4f}$ |

**Ellipse:** Die Brennpunkte liegen bei $(\pm e \mid 0)$ mit $e = \sqrt{a^2 - b^2}$. Beispiel: $a = 5$, $b = 3$ ergibt $e = 4$, also $F_{1,2}(\pm 4 \mid 0)$, und für jeden Punkt ist die Abstandssumme $10$. Darauf beruht die **Gärtnerkonstruktion**: Ein Faden der Länge $2a$ wird an zwei Pflöcken befestigt und mit einem Stift straff gehalten – so entsteht ein ovales Beet.

**Parabel:** Bei $y = \tfrac14 x^2$ ist $4f = 4$, also $f = 1$: Brennpunkt $F(0 \mid 1)$, Leitlinie $y = -1$. Zu jedem Punkt $Q$ auf der Leitlinie findet man den Parabelpunkt $P$ senkrecht über $Q$ auf der Mittelsenkrechten von $F$ und $Q$. Diese Mittelsenkrechte ist zugleich die Tangente in $P$ – deshalb bündeln Parabolspiegel Licht im Brennpunkt.

**Hyperbel:** Hier ist $e = \sqrt{a^2 + b^2}$. Die Äste nähern sich den Asymptoten $y = \pm \tfrac{b}{a} x$.

**Eine Regel für alle:** Mit Brennpunkt $F$ und Leitlinie $l$ gilt $\lvert PF\rvert = \varepsilon \cdot \lvert Pl\rvert$. Die **Exzentrizität** $\varepsilon$ entscheidet: $\varepsilon < 1$ Ellipse, $\varepsilon = 1$ Parabel, $\varepsilon > 1$ Hyperbel.

**Tangente und Spiegelung:** Die Tangente in $P$ bildet mit beiden Brennstrahlen $PF_1$ und $PF_2$ gleich große Winkel. Ein Lichtstrahl aus $F_1$ wird an einer spiegelnden Ellipse deshalb immer nach $F_2$ gelenkt (Flüstergewölbe). Bei der Parabel wird Licht, das parallel zur Achse einfällt, in den Brennpunkt gespiegelt. Bei der Hyperbel scheint das gespiegelte Licht aus $F_2$ aus $F_1$ zu kommen.

**Leitkreis:** Zeichnet man um $F_1$ einen Kreis mit Radius $2a$ und wählt darauf einen Punkt $Q$, dann schneidet die Mittelsenkrechte von $Q$ und $F_2$ die Gerade $F_1Q$ in einem Kurvenpunkt $P$. Wegen $\lvert PF_2
vert = \lvert PQ
vert$ gilt $\lvert PF_1
vert + \lvert PF_2
vert = 2a$. Liegt $F_2$ außerhalb des Kreises, entsteht eine Hyperbel.

**Kegelschnitte:** Schneidet man einen Doppelkegel mit einer Ebene, entsteht je nach Neigung ein Kreis, eine Ellipse, eine Parabel (Ebene parallel zu einer Mantellinie) oder eine Hyperbel (Ebene schneidet beide Kegelhälften).

## Ausprobieren

1. Spiele die Gärtnerkonstruktion ab und ziehe dann $P$ über die Ellipse. Was bleibt gleich? [Ellipse](?mode=ellipse&a=5&b=3&t=50)
2. Setze $a = b$. Wo liegen jetzt die Brennpunkte? [Kreis](?mode=ellipse&a=4&b=4&t=30)
3. Ziehe $P$ auf der Parabel. Sind die beiden farbigen Strecken immer gleich lang? [Parabel](?mode=parabola&f=1&t=50)
4. Verändere $\varepsilon$ langsam von $0$ bis $2$. Bei welchem Wert springt die Kurve auf? [Exzentrizität](?mode=focal&eps=0.8&d=2.25&t=60)
5. Kippe die Ebene am Kegel. Bei welchem Winkel entsteht genau eine Parabel? [Kegel](?mode=cone&alpha=30&beta=35&h=1)
6. Schalte die Tangente ein und ziehe $P$. Bleiben die beiden Winkel gleich? [Flüstergewölbe](?mode=ellipse&a=5&b=3&t=70&tan=1) · [Parabolspiegel](?mode=parabola&f=1.5&t=60&tan=1)
7. Ziehe $Q$ auf dem Leitkreis einmal herum. Welche Kurve zeichnet $P$? [Leitkreis](?mode=ellipse&a=4&b=3&t=40&cons=circle)
8. Üben: Ziehe die Brennpunkte an die richtige Stelle und prüfe. [Üben](?mode=quiz&q=1)
9. Planetenbahn: Erhöhe die Startgeschwindigkeit von 0,6 bis 1,8. Wann wird aus der Ellipse eine Parabel, wann eine Hyperbel? [Planet](?mode=orbit&ov=1.2) · [Komet](?mode=orbit&ov=1.37)
10. Allgemeine Gleichung: Verändere $B$. Wie dreht sich die Ellipse, und ab wann wird sie zur Hyperbel? [Gedrehte Ellipse](?mode=general&gA=1&gB=1&gC=2&gD=0&gE=0&gF=-4) · [xy = 1](?mode=general&gA=0&gB=1&gC=0&gD=0&gE=0&gF=-1)

## Aufgaben

### Aufgabe 1: Ellipse

Eine Ellipse hat $a = 5$ und $b = 3$. Bestimme die Brennpunkte und die Abstandssumme.

<details>
<summary>Lösung anzeigen</summary>

$e = \sqrt{25 - 9} = 4$, also $F_{1,2}(\pm 4 \mid 0)$. Die Abstandssumme ist $2a = 10$. [In der Simulation zeigen](?mode=ellipse&a=5&b=3&t=50)

</details>

### Aufgabe 2: Parabel

Bestimme Brennpunkt und Leitlinie der Parabel $y = \tfrac14 x^2$.

<details>
<summary>Lösung anzeigen</summary>

$\tfrac{1}{4f} = \tfrac14$, also $f = 1$: $F(0 \mid 1)$, Leitlinie $y = -1$. [In der Simulation zeigen](?mode=parabola&f=1&t=50)

</details>

### Aufgabe 3: Gärtnerkonstruktion

Ein Gärtner will ein ovales Beet mit 6 m Länge und 4 m Breite anlegen. Wie weit müssen die Pflöcke auseinander, wie lang ist der Faden?

<details>
<summary>Lösung anzeigen</summary>

$a = 3$, $b = 2$, $e = \sqrt{9 - 4} = \sqrt5 \approx 2{,}24$ m. Die Pflöcke stehen also etwa $4{,}47$ m auseinander, der Faden ist $2a = 6$ m lang. [In der Simulation zeigen](?mode=ellipse&a=3&b=2&t=40)

</details>

### Aufgabe 4: Verschobene Ellipse

Wo liegen die Brennpunkte der Ellipse $\dfrac{(x-2)^2}{2{,}25} + \dfrac{(y+1)^2}{6{,}25} = 1$?

<details>
<summary>Lösung anzeigen</summary>

Mittelpunkt $(2 \mid -1)$. Die größere Zahl $6{,}25$ steht bei $y$, die lange Achse ist also senkrecht: $a = 2{,}5$, $b = 1{,}5$, $e = \sqrt{6{,}25 - 2{,}25} = 2$. Brennpunkte $F_1(2 \mid -3)$ und $F_2(2 \mid 1)$. [In der Simulation üben](?mode=quiz&q=2)

</details>

### Aufgabe 5: Welche Kurve?

Welche Art Kegelschnitt beschreibt $x^2 + 4xy + y^2 = 3$?

<details>
<summary>Lösung anzeigen</summary>

$B^2 - 4AC = 16 - 4 = 12 > 0$: eine Hyperbel. Ihre Achsen sind um $45°$ gedreht, weil $A = C$ ist. [In der Simulation zeigen](?mode=general&gA=1&gB=4&gC=1&gD=0&gE=0&gF=-3)

</details>

## Ideen für den Unterricht

- **Einsatz:** Ortslinien handlungsorientiert (Faden, Pflöcke, Faltpapier) und dann in der Simulation; Verbindung zu Parabeln als Funktionsgraphen.
- **Üben:** In der Übungsansicht hat jede Aufgabe eine Nummer. Gleiche Nummer bedeutet gleiche Aufgabe, so können alle dieselbe Kurve bearbeiten.
- **Anwendungen:** Planetenbahnen (Ellipsen mit der Sonne im Brennpunkt), Parabolspiegel und Satellitenschüsseln, Flüstergewölbe.
- **Häufige Stolpersteine:**
  - Bei der Ellipse $e = \sqrt{a^2 + b^2}$ statt $\sqrt{a^2 - b^2}$ rechnen (das gilt nur für die Hyperbel).
  - Brennpunkt der Parabel bei $(0 \mid a)$ statt bei $(0 \mid \tfrac{1}{4a})$ vermuten.
