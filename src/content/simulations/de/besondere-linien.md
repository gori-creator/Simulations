---
description: "Interaktive Simulation für die 7. und 8. Klasse: Ecken eines Dreiecks ziehen und entdecken, dass sich Mittelsenkrechten, Winkelhalbierende, Seitenhalbierende und Höhen jeweils in einem Punkt schneiden – mit Umkreis, Inkreis, Schwerpunkt, Höhenschnittpunkt und Euler-Gerade."
---

## Worum geht es?

In jedem Dreieck gibt es vier Sorten **besonderer Linien**. Von jeder Sorte gibt es drei – und jedes Mal schneiden sich alle drei in **einem** Punkt:

| Linien | Schnittpunkt | Eigenschaft |
| --- | --- | --- |
| Mittelsenkrechten der Seiten | Umkreismittelpunkt $U$ | $\overline{UA} = \overline{UB} = \overline{UC} = r$ |
| Winkelhalbierende der Innenwinkel | Inkreismittelpunkt $I$ | gleicher Abstand $\rho$ zu allen drei Seiten |
| Seitenhalbierende (Ecke → Mitte der Gegenseite) | Schwerpunkt $S$ | teilt jede Seitenhalbierende im Verhältnis $2 : 1$ |
| Höhen (Lot von einer Ecke auf die Gegenseite) | Höhenschnittpunkt $H$ | – |

**Warum schneiden sich die Mittelsenkrechten in einem Punkt?** Der Schnittpunkt $U$ von zwei Mittelsenkrechten ist von $A$ und $B$ und von $B$ und $C$ gleich weit entfernt – also auch von $A$ und $C$. Deshalb liegt er auch auf der dritten Mittelsenkrechten. Genauso argumentiert man bei den Winkelhalbierenden mit den Abständen zu den Seiten.

**Wo liegen die Punkte?** $I$ und $S$ liegen immer innerhalb des Dreiecks. $U$ und $H$ hängen von der Dreiecksart ab: Im spitzwinkligen Dreieck liegen sie innen, im stumpfwinkligen außen. Im rechtwinkligen Dreieck ist $U$ der Mittelpunkt der Hypotenuse (Thaleskreis!) und $H$ die Ecke mit dem rechten Winkel.

**Ausblick – die Euler-Gerade:** $U$, $S$ und $H$ liegen immer auf einer Geraden, und es gilt $\overline{HS} = 2 \cdot \overline{SU}$. Im gleichseitigen Dreieck fallen alle besonderen Punkte zusammen.

## Ausprobieren

1. [Schnittpunkt selbst suchen](?pt=0): Schneiden sich die drei Mittelsenkrechten wirklich in einem Punkt? Ziehe die Ecken. Schalte danach „Schnittpunkt und Kreis zeigen“ ein.
2. Ziehe $C$ so weit nach unten, dass das Dreieck [stumpfwinklig](?ax=2&ay=2.5&bx=14&by=2.5&cx=5&cy=5.5) wird. Wo liegt $U$ jetzt? Wann liegt $U$ genau auf einer Seite?
3. [Inkreis](?m=wh&ax=2.5&ay=1.5&bx=13.5&by=2&cx=8.5&cy=9): Achte auf die rechten Winkel an den Berührpunkten. Kann der Inkreis jemals aus dem Dreieck herausragen?
4. [Schwerpunkt](?m=sh&ax=2&ay=1.5&bx=14&by=3&cx=6&cy=9): Vergleiche in der Karte die Teilstücke jeder Seitenhalbierenden. Welches Verhältnis siehst du?
5. [Höhen im stumpfwinkligen Dreieck](?m=h&ax=2&ay=2.5&bx=14&by=2.5&cx=5&cy=5.5): Zwei Höhen treffen die Gegenseite gar nicht – man braucht die Verlängerungen.
6. [Euler-Gerade](?m=eu): Ziehe die Ecken. Bleiben $U$, $S$ und $H$ auf einer Geraden? Mache das Dreieck [gleichseitig](?m=eu&ax=4&ay=1.5&bx=12&by=1.5&cx=8&cy=8.4).

## Aufgaben

### Aufgabe 1: Ein rechtwinkliges Dreieck

Gegeben ist das Dreieck $A(2|2)$, $B(10|2)$, $C(2|8)$ (Angaben in cm). Wo liegen $U$ und $H$? Wie groß ist der Umkreisradius? [Aufgabe laden](?ax=2&ay=2&bx=10&by=2&cx=2&cy=8&pt=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Dreieck hat bei $A$ einen rechten Winkel. $U$ ist der Mittelpunkt der Hypotenuse $[BC]$, also $U(6|5)$. Die Hypotenuse ist $\sqrt{8^2 + 6^2}\,\text{cm} = 10\,\text{cm}$ lang, der Radius beträgt $r = 5\,\text{cm}$. Die Höhen schneiden sich in der Ecke $A(2|2)$, denn die Katheten sind selbst Höhen. [Umkreis zeigen](?ax=2&ay=2&bx=10&by=2&cx=2&cy=8) · [Höhen zeigen](?m=h&ax=2&ay=2&bx=10&by=2&cx=2&cy=8)

</details>

### Aufgabe 2: Der Inkreis

Im selben Dreieck: Begründe, dass der Inkreisradius $\rho = 2\,\text{cm}$ beträgt. Tipp: Zerlege das Dreieck in drei Teildreiecke mit der Spitze $I$. [Aufgabe laden](?m=wh&ax=2&ay=2&bx=10&by=2&cx=2&cy=8&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die drei Teildreiecke $ABI$, $BCI$ und $CAI$ haben alle die Höhe $\rho$. Zusammen ergeben sie das ganze Dreieck: $\frac{1}{2}\cdot(8 + 10 + 6)\,\text{cm}\cdot\rho = \frac{1}{2}\cdot 8\,\text{cm}\cdot 6\,\text{cm}$, also $12\,\text{cm}\cdot\rho = 24\,\text{cm}^2$ und $\rho = 2\,\text{cm}$.

</details>

### Aufgabe 3: Ein Funkmast und ein Spielplatz

Drei Dörfer liegen an den Ecken eines Dreiecks. (a) Ein Funkmast soll von allen drei Dörfern gleich weit entfernt sein. (b) Ein Spielplatz in einem dreieckigen Park soll von allen drei geraden Wegen am Rand gleich weit entfernt sein. Welche besonderen Punkte sind gesucht?

<details>
<summary>Lösung anzeigen</summary>

(a) Der Umkreismittelpunkt $U$ (Schnittpunkt der Mittelsenkrechten). (b) Der Inkreismittelpunkt $I$ (Schnittpunkt der Winkelhalbierenden).

</details>

### Aufgabe 4: Balancieren

Ein Dreieck aus Pappe soll auf einer Nadelspitze balancieren. Wo muss die Nadel stehen? Wie weit ist dieser Punkt von $A$ entfernt, wenn die Seitenhalbierende von $A$ aus $6\,\text{cm}$ lang ist?

<details>
<summary>Lösung anzeigen</summary>

Im Schwerpunkt $S$. Er teilt die Seitenhalbierende im Verhältnis $2 : 1$, also liegt er $\frac{2}{3}\cdot 6\,\text{cm} = 4\,\text{cm}$ von $A$ entfernt. [Schwerpunkt zeigen](?m=sh)

</details>

### Aufgabe 5: Wann fallen Punkte zusammen?

In welchem Dreieck fallen $U$ und $I$ zusammen? Probiere es aus und begründe.

<details>
<summary>Lösung anzeigen</summary>

Im gleichseitigen Dreieck: Dort ist jede Mittelsenkrechte zugleich Winkelhalbierende, Seitenhalbierende und Höhe (Symmetrieachse). Dann fallen sogar $U$, $I$, $S$ und $H$ zusammen. [Zeigen](?m=eu&ax=4&ay=1.5&bx=12&by=1.5&cx=8&cy=8.4)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 7, Lernbereich „Kongruenz, besondere Dreiecke und Dreieckskonstruktionen“ (LehrplanPLUS Gymnasium Bayern): Umkreis und Inkreis; Seitenhalbierende, Höhen und die Euler-Gerade als Vertiefung oder Ausblick. Mit „Schnittpunkt und Kreis zeigen“ aus können die Lernenden die Vermutung „Die drei Linien schneiden sich in einem Punkt“ selbst aufstellen.
- **Arbeitsteilig:** Vier Gruppen untersuchen je eine Linienart (Lage des Punktes bei spitz-, recht- und stumpfwinkligen Dreiecken) und stellen ihre Ergebnisse in einer gemeinsamen Tabelle zusammen.
- **Modell:** Die Ecken rasten auf halben Zentimetern ein; Längen werden gerundet angezeigt.
- **Häufige Stolpersteine:**
  - Mittelsenkrechte und Seitenhalbierende werden verwechselt – beide gehen durch den Seitenmittelpunkt, aber nur die Mittelsenkrechte steht senkrecht auf der Seite.
  - Höhe und Winkelhalbierende werden verwechselt.
  - „Der Umkreismittelpunkt liegt immer im Dreieck.“ – Bei stumpfwinkligen Dreiecken liegt er außen.
  - Bei stumpfwinkligen Dreiecken wird vergessen, die Seiten für die Höhen zu verlängern.
