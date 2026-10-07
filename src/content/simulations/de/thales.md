---
description: Interaktive Simulation zum Satz des Thales – Punkt C auf dem Halbkreis ziehen, rechten Winkel beobachten, Beweisidee und Umkehrung untersuchen.
---

## Worum geht es?

Zeichnet man über einer Strecke $\overline{AB}$ einen Kreis, dessen **Durchmesser** genau diese Strecke ist, erhält man den **Thaleskreis**. Sein Mittelpunkt $M$ ist der Mittelpunkt von $\overline{AB}$.

> **Satz des Thales:** Liegt der Punkt $C$ auf dem Thaleskreis über $\overline{AB}$ (und ist $C \neq A, B$), dann hat das Dreieck $ABC$ bei $C$ einen **rechten Winkel**: $\gamma = 90^\circ$.

Es ist ganz gleich, wo auf dem Kreis $C$ liegt – der Winkel bei $C$ bleibt immer $90^\circ$.

**Umkehrung:** Hat ein Dreieck $ABC$ bei $C$ einen rechten Winkel, dann liegt $C$ auf dem Thaleskreis über $\overline{AB}$. Liegt $C$ innerhalb des Kreises, ist $\gamma$ größer als $90^\circ$; liegt $C$ außerhalb, ist $\gamma$ kleiner als $90^\circ$.

### Beweisidee

Zeichnet man den Radius $\overline{MC}$ ein, zerfällt das Dreieck in zwei **gleichschenklige Dreiecke**, denn $\overline{MA} = \overline{MB} = \overline{MC} = r$.

- Im Dreieck $AMC$ sind die Basiswinkel gleich groß: beide $\alpha$.
- Im Dreieck $MBC$ sind die Basiswinkel gleich groß: beide $\beta$.

Der Winkel bei $C$ setzt sich also aus $\alpha$ und $\beta$ zusammen: $\gamma = \alpha + \beta$. Mit der Winkelsumme im Dreieck $ABC$ folgt

$$
\alpha + \beta + (\alpha + \beta) = 180^\circ \quad\Rightarrow\quad \alpha + \beta = 90^\circ \quad\Rightarrow\quad \gamma = 90^\circ.
$$

## Ausprobieren

1. Ziehe den Punkt $C$ über den Kreis oder drücke **Abspielen**. Was passiert mit dem Winkel bei $C$ – und was mit den Winkeln bei $A$ und $B$?
2. Was passiert, wenn $C$ ganz nah an $A$ oder $B$ heranrückt? [Beispiel laden](?phi=170)
3. Schalte die **Beweisidee** ein und beobachte die gleich großen Winkel. [Beweisidee zeigen](?phi=70&proof=1)
4. Schalte **C frei verschieben** ein und ziehe $C$ in den Kreis hinein bzw. aus ihm heraus. [C innerhalb](?free=1&cx=0.8&cy=1.4) · [C außerhalb](?free=1&cx=-1.2&cy=3.8)

## Aufgaben

### Aufgabe 1: Winkel berechnen

$C$ liegt auf dem Thaleskreis über $\overline{AB}$, und es ist $\alpha = 35^\circ$. Berechne $\beta$ und den Winkel $\angle AMC$ am Mittelpunkt.

<details>
<summary>Lösung anzeigen</summary>

Nach dem Satz des Thales ist $\gamma = 90^\circ$, also $\beta = 180^\circ - 90^\circ - 35^\circ = 55^\circ$.

Das Dreieck $AMC$ ist gleichschenklig mit den Basiswinkeln $35^\circ$, also ist $\angle AMC = 180^\circ - 2 \cdot 35^\circ = 110^\circ$. [In der Simulation zeigen](?phi=70&proof=1)

</details>

### Aufgabe 2: Rechtwinkliges Dreieck konstruieren

Konstruiere ein rechtwinkliges Dreieck mit der Hypotenuse $c = \overline{AB} = 6\,\text{cm}$ und der Kathete $a = \overline{BC} = 4\,\text{cm}$. Beschreibe dein Vorgehen.

<details>
<summary>Lösung anzeigen</summary>

1. Strecke $\overline{AB}$ mit $6\,\text{cm}$ zeichnen und ihren Mittelpunkt $M$ konstruieren.
2. Thaleskreis um $M$ mit Radius $3\,\text{cm}$ zeichnen.
3. Kreis um $B$ mit Radius $4\,\text{cm}$ zeichnen. Ein Schnittpunkt mit dem Thaleskreis ist $C$.

Nach dem Satz des Thales hat das Dreieck bei $C$ einen rechten Winkel. Es gibt zwei Schnittpunkte (oberhalb und unterhalb von $\overline{AB}$) – die beiden Dreiecke sind spiegelbildlich und damit kongruent.

</details>

### Aufgabe 3: Innerhalb oder außerhalb?

Untersuche mit **C frei verschieben**: Wie groß ist $\gamma$, wenn $C$ innerhalb des Kreises liegt, und wie groß, wenn $C$ außerhalb liegt? Formuliere die Umkehrung des Satzes des Thales.

<details>
<summary>Lösung anzeigen</summary>

Innerhalb des Kreises ist $\gamma > 90^\circ$ (stumpfer Winkel), außerhalb ist $\gamma < 90^\circ$ (spitzer Winkel). Nur auf dem Kreis ist $\gamma = 90^\circ$.

Umkehrung: *Ist der Winkel bei $C$ ein rechter Winkel, so liegt $C$ auf dem Kreis mit dem Durchmesser $\overline{AB}$.* [C innerhalb zeigen](?free=1&cx=0.8&cy=1.4)

</details>

### Aufgabe 4: Tangenten an einen Kreis (Knobelaufgabe)

Gegeben sind ein Kreis $k$ um $M$ und ein Punkt $P$ außerhalb des Kreises. Konstruiere die beiden Tangenten von $P$ an den Kreis. Tipp: Eine Tangente steht senkrecht auf dem Radius zum Berührpunkt.

<details>
<summary>Lösung anzeigen</summary>

Für einen Berührpunkt $B$ gilt $\angle MBP = 90^\circ$. Nach der Umkehrung des Satzes des Thales liegt $B$ also auf dem Thaleskreis über $\overline{MP}$.

Konstruktion: Mittelpunkt von $\overline{MP}$ bestimmen, Thaleskreis über $\overline{MP}$ zeichnen – seine Schnittpunkte mit $k$ sind die Berührpunkte $B_1$ und $B_2$. Die Geraden $PB_1$ und $PB_2$ sind die Tangenten.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Entdeckend in Jahrgangsstufe 7 (Bayern: Lernbereich zu Dreiecken und besonderen Linien). Die Lernenden formulieren die Vermutung selbst, bevor die Beweisidee eingeblendet wird.
- **Animation:** Mit **Abspielen** wandert $C$ gleichmäßig über den Kreis. Gut geeignet, um die Konstanz von $\gamma$ trotz wechselnder $\alpha$ und $\beta$ zu betonen.
- **Typische Fehlvorstellungen:**
  - „Der rechte Winkel liegt bei $M$.“ – Der rechte Winkel liegt immer gegenüber dem Durchmesser, also bei $C$.
  - Satz und Umkehrung werden nicht unterschieden. Der Modus **C frei verschieben** macht die Umkehrung erfahrbar.
  - In der Lage unterhalb von $\overline{AB}$ wird der Winkel nicht wiedererkannt – auch dort gilt der Satz.
- **Aufgabenmodus:** Mit **Teilen → Ergebnisse verdecken** sind der Winkel und die Beweisidee verdeckt; so lässt sich erst vermuten, dann kontrollieren.
