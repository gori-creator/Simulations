---
description: "Interaktive Simulation für die 7. und 8. Klasse: Mittelsenkrechten, Winkelhalbierende, Seitenhalbierende und Höhen entstehen mit Zirkel, Lineal und Geodreieck auf Karopapier – und schneiden sich jedes Mal in einem Punkt. Mit Umkreis, Inkreis, Schwerpunkt (Pappdreieck auf der Nadel), Höhenschnittpunkt, Euler-Gerade und allen Sonderfällen."
---

## Worum geht es?

In jedem Dreieck gibt es vier Sorten **besonderer Linien**, von jeder Sorte drei. Das Erstaunliche: Jedes Mal schneiden sich alle drei in **einem** Punkt.

| Linien | Schnittpunkt | Eigenschaft |
| --- | --- | --- |
| Mittelsenkrechten $m_a, m_b, m_c$ der Seiten | Umkreismittelpunkt $U$ | $\overline{UA} = \overline{UB} = \overline{UC} = r$ |
| Winkelhalbierende $w_\alpha, w_\beta, w_\gamma$ | Inkreismittelpunkt $W$ (oft auch $I$) | gleicher Abstand $\rho$ zu allen drei Seiten |
| Seitenhalbierende $s_a, s_b, s_c$ (Ecke → Mitte der Gegenseite) | Schwerpunkt $S$ | teilt jede Seitenhalbierende im Verhältnis $2 : 1$ |
| Höhen $h_a, h_b, h_c$ (Lot von der Ecke auf die Gegenseite) | Höhenschnittpunkt $H$ | – |

**Warum schneiden sich die Mittelsenkrechten in einem Punkt?** Die Mittelsenkrechte einer Strecke ist eine **Ortslinie**: Genau ihre Punkte sind von beiden Endpunkten gleich weit entfernt. Liegt $U$ auf $m_c$ und auf $m_a$, so gilt $\overline{UA} = \overline{UB}$ und $\overline{UB} = \overline{UC}$ – also auch $\overline{UA} = \overline{UC}$. Damit liegt $U$ auch auf $m_b$. Der Kreis um $U$ mit $r = \overline{UA}$ geht durch alle drei Ecken: der **Umkreis**.

**Bei den Winkelhalbierenden** argumentiert man genauso, nur mit den Abständen zu den **Seiten**: Jeder Punkt auf $w_\alpha$ ist von $b$ und $c$ gleich weit entfernt. Der Schnittpunkt $W$ hat zu allen Seiten den Abstand $\rho$; der Kreis um $W$ mit Radius $\rho$ **berührt** jede Seite (dort steht der Radius senkrecht auf der Seite): der **Inkreis**.

**Der Schwerpunkt** $S$ teilt jede Seitenhalbierende so, dass das Stück von der Ecke bis $S$ doppelt so lang ist wie das Stück von $S$ bis zur Seitenmitte. Seine Koordinaten sind die Mittelwerte der Eckkoordinaten:

$$
S\left(\tfrac{x_A + x_B + x_C}{3} \;\middle|\; \tfrac{y_A + y_B + y_C}{3}\right)
$$

Ein Dreieck aus Pappe lässt sich genau in $S$ auf einer Nadelspitze balancieren.

**Wo liegen die Punkte?** $W$ und $S$ liegen immer im Inneren. $U$ und $H$ liegen im **spitzwinkligen** Dreieck innen, im **stumpfwinkligen** außen (für zwei Höhen muss man die Seiten verlängern). Im **rechtwinkligen** Dreieck ist $U$ die Mitte der Hypotenuse (Thaleskreis!) und $H$ die Ecke mit dem rechten Winkel – die Katheten sind selbst Höhen. Im **gleichschenkligen** Dreieck liegen alle vier Punkte auf der Symmetrieachse, im **gleichseitigen** fallen sie zusammen.

**Ausblick – die Euler-Gerade:** $H$, $S$ und $U$ liegen in jedem Dreieck auf einer Geraden, und es gilt $\overline{HS} = 2 \cdot \overline{SU}$. Der Inkreismittelpunkt liegt nur bei gleichschenkligen Dreiecken auf ihr.

## Ausprobieren

1. Beim Laden entsteht die Konstruktion einmal zügig. Drücke **„Konstruieren“**: Zirkel und Lineal zeichnen nacheinander die drei Mittelsenkrechten, die passende Zeile erscheint in der Konstruktionsbeschreibung, dann leuchtet $U$ auf und der Zirkel zieht den Umkreis. Mit **„Nächster Schritt“** geht es Zeile für Zeile.
2. [Selbst entdecken](?pt=0): Punkt und Kreis sind verdeckt. Ziehe die Ecken – schneiden sich die drei Linien immer in einem Punkt? Schalte danach „Schnittpunkt und Kreis zeigen“ ein.
3. Ziehe $C$ nach unten, bis das Dreieck [stumpfwinklig](?ax=2&ay=2&bx=12&by=2&cx=4.5&cy=4.5) ist. Wo liegt $U$ jetzt? Wann liegt $U$ genau auf einer Seite? Vergleiche mit dem [rechtwinkligen Dreieck](?ax=3&ay=2&bx=11&by=2&cx=3&cy=8).
4. [Inkreis](?m=wh&ax=2.5&ay=1.5&bx=13.5&by=2&cx=8.5&cy=9): Achte auf die rechten Winkel an den Berührpunkten und auf die drei gleich langen Balken in der Karte. Kann der Inkreis aus dem Dreieck herausragen?
5. [Schwerpunkt](?m=sh&ax=2&ay=1.5&bx=14&by=3&cx=6&cy=9): Die Perlen teilen jede Seitenhalbierende in drei gleiche Stücke. Drücke **„Auf der Nadel balancieren“** oder tippe selbst irgendwo auf die Pappe: Wann kippt sie, wann nicht?
6. [Höhen im stumpfwinkligen Dreieck](?m=h&ax=2&ay=2&bx=12&by=2&cx=4.5&cy=4.5): Zwei Höhen treffen die Gegenseite nicht – das Geodreieck braucht die gestrichelte Verlängerung.
7. [Euler-Gerade](?m=eu&ax=2&ay=2&bx=13&by=2&cx=4&cy=9): Ziehe die Ecken. Bleiben $H$, $S$ und $U$ auf einer Geraden? Mache das Dreieck [gleichschenklig](?m=eu&ax=3&ay=2&bx=11&by=2&cx=7&cy=9) und dann (fast) [gleichseitig](?m=eu&ax=4&ay=2&bx=12&by=2&cx=8&cy=8.9).

## Aufgaben

### Aufgabe 1: Ein rechtwinkliges Dreieck

Gegeben ist das Dreieck $A(2|2)$, $B(10|2)$, $C(2|8)$ (Angaben in cm). Wo liegen $U$ und $H$? Wie groß ist der Umkreisradius? [Aufgabe laden](?ax=2&ay=2&bx=10&by=2&cx=2&cy=8&pt=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Dreieck hat bei $A$ einen rechten Winkel. Nach dem Satz des Thales ist $U$ der Mittelpunkt der Hypotenuse $[BC]$: $U(6|5)$. Die Hypotenuse ist $\sqrt{8^2 + 6^2}\,\text{cm} = 10\,\text{cm}$ lang, also $r = 5\,\text{cm}$. Die Katheten $[AB]$ und $[AC]$ sind selbst Höhen, deshalb ist $H = A(2|2)$. [Umkreis zeigen](?ax=2&ay=2&bx=10&by=2&cx=2&cy=8) · [Höhen zeigen](?m=h&ax=2&ay=2&bx=10&by=2&cx=2&cy=8)

</details>

### Aufgabe 2: Der Inkreis

Zeige für dasselbe Dreieck, dass der Inkreisradius $\rho = 2\,\text{cm}$ beträgt, und gib $W$ an. Tipp: Zerlege das Dreieck in die drei Teildreiecke $ABW$, $BCW$ und $CAW$. [Aufgabe laden](?m=wh&ax=2&ay=2&bx=10&by=2&cx=2&cy=8&pt=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Alle drei Teildreiecke haben die Höhe $\rho$. Zusammen ergeben sie das ganze Dreieck mit $A = \frac{1}{2}\cdot 8\,\text{cm}\cdot 6\,\text{cm} = 24\,\text{cm}^2$:

$\frac{1}{2}\cdot(8 + 10 + 6)\,\text{cm}\cdot\rho = 24\,\text{cm}^2$, also $12\,\text{cm}\cdot\rho = 24\,\text{cm}^2$ und $\rho = 2\,\text{cm}$.

$W$ ist von $[AB]$ (auf $y = 2$) und von $[AC]$ (auf $x = 2$) je $2\,\text{cm}$ entfernt, also $W(4|4)$. [Inkreis zeigen](?m=wh&ax=2&ay=2&bx=10&by=2&cx=2&cy=8)

</details>

### Aufgabe 3: Funkmast und Brunnen

Drei Dörfer liegen an den Ecken eines Dreiecks. (a) Ein Funkmast soll von allen drei Dörfern gleich weit entfernt sein. (b) Ein Brunnen in einem dreieckigen Park soll von den drei geraden Wegen am Rand gleich weit entfernt sein. Welche Punkte sind gesucht, und wie konstruiert man sie? Kann der Funkmast außerhalb des Dreiecks stehen?

<details>
<summary>Lösung anzeigen</summary>

(a) Der Umkreismittelpunkt $U$: Schnitt von zwei Mittelsenkrechten (die dritte dient als Probe). Bei einem stumpfwinkligen Dreieck liegt er außerhalb. [Zeigen](?ax=2&ay=2&bx=12&by=2&cx=4.5&cy=4.5)

(b) Der Inkreismittelpunkt $W$: Schnitt von zwei Winkelhalbierenden. Er liegt immer im Inneren. [Zeigen](?m=wh)

</details>

### Aufgabe 4: Balancieren

Ein Dreieck aus Pappe soll auf einer Nadelspitze balancieren. Wo muss die Nadel stehen? Wie weit ist dieser Punkt von $A$ entfernt, wenn die Seitenhalbierende $s_a$ genau $6\,\text{cm}$ lang ist?

<details>
<summary>Lösung anzeigen</summary>

Im Schwerpunkt $S$. Er teilt $s_a$ im Verhältnis $2 : 1$, also ist $\overline{AS} = \frac{2}{3}\cdot 6\,\text{cm} = 4\,\text{cm}$ und $\overline{SM_a} = 2\,\text{cm}$. [Schwerpunkt zeigen](?m=sh&ax=2&ay=1.5&bx=14&by=3&cx=6&cy=9)

</details>

### Aufgabe 5: Schwerpunkt berechnen, Euler-Gerade prüfen

Gegeben ist das Dreieck $A(1|1)$, $B(7|1)$, $C(3|5)$. Berechne den Schwerpunkt $S$. Man kann zeigen: $U(4|2)$ und $H(3|3)$. Prüfe, dass $\overline{HS} = 2 \cdot \overline{SU}$ gilt. [Aufgabe laden](?m=eu&ax=1&ay=1&bx=7&by=1&cx=3&cy=5&pt=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$S\left(\frac{1 + 7 + 3}{3} \,\middle|\, \frac{1 + 1 + 5}{3}\right) = S\left(\frac{11}{3} \,\middle|\, \frac{7}{3}\right) \approx S(3{,}67|2{,}33)$.

Von $H$ nach $S$ geht es $\frac{2}{3}$ nach rechts und $\frac{2}{3}$ nach unten, von $S$ nach $U$ genau $\frac{1}{3}$ nach rechts und $\frac{1}{3}$ nach unten – dieselbe Richtung, halb so weit. Also liegen $H$, $S$, $U$ auf einer Geraden und $\overline{HS} = 2\cdot\overline{SU}$ (gerundet $0{,}94\,\text{cm}$ und $0{,}47\,\text{cm}$). [Euler-Gerade zeigen](?m=eu&ax=1&ay=1&bx=7&by=1&cx=3&cy=5)

</details>

### Aufgabe 6: Wann fallen Punkte zusammen? (Knobelaufgabe)

In welchen Dreiecken fallen $U$ und $W$ zusammen? Und in welchen liegen alle vier besonderen Punkte auf einer Geraden? Probiere aus und begründe.

<details>
<summary>Lösung anzeigen</summary>

Fallen $U$ und $W$ zusammen, ist dieser Punkt von den Ecken $r$ und von den Seiten $\rho$ entfernt. Das Lot von ihm auf eine Seite trifft deren Mitte (er liegt ja auf der Mittelsenkrechten). So entstehen sechs rechtwinklige Dreiecke wie $U M_c A$, jedes mit der Hypotenuse $r$ und einer Kathete $\rho$. Nach dem Kongruenzsatz SsW sind sie alle kongruent, also sind alle halben Seiten gleich lang: Das Dreieck ist **gleichseitig**, und sogar $U$, $W$, $S$ und $H$ fallen zusammen. [Zeigen](?m=eu&ax=4&ay=2&bx=12&by=2&cx=8&cy=8.9)

Alle vier Punkte liegen auf einer Geraden, wenn das Dreieck **gleichschenklig** ist: Dann ist die Symmetrieachse zugleich Mittelsenkrechte, Winkelhalbierende, Seitenhalbierende und Höhe. (Umgekehrt gilt auch: Liegt $W$ auf der Euler-Geraden, ist das Dreieck gleichschenklig – der Beweis ist aber deutlich schwerer.) [Zeigen](?m=eu&ax=3&ay=2&bx=11&by=2&cx=7&cy=9)

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 7, Dreiecke, Kongruenz und Konstruktionen: Umkreis und Inkreis als Anwendung der Ortslinien Mittelsenkrechte und Winkelhalbierende. Seitenhalbierende, Höhen und Euler-Gerade eignen sich als Vertiefung oder Ausblick.
- **Am Beamer:** „Nächster Schritt“ konstruiert Zeile für Zeile vor, die Klasse zeichnet im Heft mit. Die Begründungskarte („gleich weit von den Ecken“) kann Ausgangspunkt für einen gemeinsam formulierten Beweis sein.
- **Entdecken:** Mit „Schnittpunkt und Kreis zeigen“ aus (`pt=0`) bleiben Punkt, Kreis und Messwerte verdeckt; die Lernenden stellen die Vermutung „Die drei Linien schneiden sich in einem Punkt“ selbst auf.
- **Arbeitsteilig:** Vier Gruppen untersuchen je eine Linienart bei spitz-, recht- und stumpfwinkligen Dreiecken und tragen ihre Ergebnisse in eine gemeinsame Tabelle ein („Wo liegt der Punkt?“).
- **Handfest:** Pappdreiecke ausschneiden, Seitenhalbierende einzeichnen und auf einer Bleistiftspitze balancieren – danach mit der Simulation vergleichen. (Die Ecken rasten beim Ziehen auf halben Zentimetern ein; Werte werden gerundet angezeigt.)
- **Häufige Stolpersteine:**
  - Mittelsenkrechte und Seitenhalbierende werden verwechselt – beide gehen durch die Seitenmitte, aber nur die Mittelsenkrechte steht senkrecht auf der Seite.
  - „Der Umkreismittelpunkt liegt immer im Dreieck.“ – Bei stumpfwinkligen Dreiecken liegt er außen.
  - Bei stumpfwinkligen Dreiecken wird vergessen, die Seiten für die Höhen zu verlängern.
  - Der Inkreisradius wird zu einer Ecke statt senkrecht zur Seite gemessen.
  - Beim Schwerpunkt wird das Verhältnis umgedreht ($1 : 2$ statt $2 : 1$ von der Ecke aus).
