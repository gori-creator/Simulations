## Worum geht es?

Ein **dynamisches System** beschreibt, wie sich ein Zustand mit der Zeit verändert, wobei jeder neue Zustand aus dem vorigen folgt. Schon sehr einfache Regeln können erstaunliches Verhalten erzeugen: regelmäßige Schwingungen, scheinbaren Zufall oder Figuren, die in sich selbst immer wieder vorkommen.

### Räuber und Beute

Hasen ($x$) vermehren sich, Füchse ($y$) fressen Hasen. Das **Lotka-Volterra-Modell** beschreibt das mit zwei Änderungsraten:

$$x' = a\,x - b\,x\,y, \qquad y' = d\,x\,y - c\,y$$

- Ohne Füchse wachsen die Hasen exponentiell (Rate $a$).
- Ohne Hasen sterben die Füchse aus (Rate $c$).
- Begegnungen ($x \cdot y$) verringern die Hasen und vermehren die Füchse.

Das Ergebnis sind **phasenverschobene Schwingungen**: Erst gibt es viele Hasen, dann viele Füchse, dann wenige Hasen, dann wenige Füchse und so weiter. Im **Phasendiagramm** (Hasen nach rechts, Füchse nach oben) wird daraus eine geschlossene Bahn um das **Gleichgewicht** $\big(\tfrac{c}{d} \mid \tfrac{a}{b}\big)$. Startet man genau dort, bleibt alles konstant.

### Die logistische Gleichung und das Feigenbaum-Diagramm

Eine Population (als Anteil $x$ zwischen 0 und 1) wächst mit dem Faktor $r$, wird aber durch knappe Nahrung gebremst:

$$x_{n+1} = r \cdot x_n \cdot (1 - x_n)$$

Je nach $r$ verhält sie sich ganz verschieden:

| $r$ | Verhalten |
| --- | --- |
| bis 1 | die Population stirbt aus |
| 1 bis 3 | Annäherung an einen festen Wert $1 - \tfrac1r$ |
| 3 bis etwa 3,45 | Pendeln zwischen 2 Werten |
| bis etwa 3,54 | Pendeln zwischen 4 Werten, dann 8, 16, … |
| ab etwa 3,57 | **Chaos**: kein Muster, extreme Empfindlichkeit gegenüber dem Startwert |

Das **Feigenbaum-Diagramm** trägt für jedes $r$ die Werte auf, die die Folge auf Dauer annimmt. Man sieht die **Periodenverdopplungen** und den Übergang ins Chaos, mitten darin aber auch wieder Fenster mit Ordnung, etwa die Periode 3 bei $r \approx 3{,}83$.

### Fraktale

Ein **Fraktal** entsteht, wenn man eine Regel immer wieder auf immer kleinere Teile anwendet. Jeder Ausschnitt sieht dann aus wie das Ganze (**Selbstähnlichkeit**).

- **Koch-Schneeflocke:** Jede Strecke wird gedrittelt, und über das mittlere Drittel kommt eine Spitze. Pro Stufe wird der Umfang $\tfrac43$-mal so lang, er wächst also über alle Grenzen. Die Fläche dagegen nähert sich dem $1{,}6$-Fachen des Startdreiecks.
- **Sierpinski-Dreieck:** Aus jedem Dreieck wird das mittlere Teildreieck herausgenommen. Die Fläche schrumpft pro Stufe auf $\tfrac34$ und geht gegen $0$, trotzdem bleiben unendlich viele Punkte übrig.

Die **fraktale Dimension** $D = \tfrac{\log(\text{Anzahl der Teile})}{\log(\text{Verkleinerungsfaktor})}$ liegt zwischen den gewohnten Dimensionen. Beim Sierpinski-Dreieck ist sie $\tfrac{\log 3}{\log 2} \approx 1{,}585$, bei der Koch-Kurve $\tfrac{\log 4}{\log 3} \approx 1{,}262$.

## Ausprobieren

- [Hasen und Füchse](?mode=raeuber&x0=30&y0=5&a=1&c=1.5&u=0.3): Verschiebe den Zeitpunkt. Wann gibt es die meisten Füchse?
- [Start im Gleichgewicht](?mode=raeuber&x0=20&y0=10&a=1&c=1.5&u=0.5): Was passiert, wenn du nur ein wenig davon abweichst?
- [Periode 2](?mode=logistisch&r=3.2&xs=0.2): Erhöhe r in kleinen Schritten bis 3,6.
- [Chaos bei r = 3,9](?mode=logistisch&r=3.9&xs=0.2): Ändere den Startwert nur um 0,01. Wie unterschiedlich verlaufen die Folgen?
- [Koch-Schneeflocke](?mode=fraktal&f=koch&n=4): Wie oft wächst der Umfang von Stufe zu Stufe?

## Aufgaben

**1. Gleichgewicht.** Bestimme für $a = 1$, $b = 0{,}1$, $c = 1{,}5$ und $d = 0{,}075$ den Gleichgewichtspunkt. [Aufgabe laden](?mode=raeuber&x0=20&y0=10&a=1&c=1.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

Beide Änderungsraten müssen $0$ sein: $x = \tfrac{c}{d} = 20$ und $y = \tfrac{a}{b} = 10$.

</details>

**2. Fester Wert.** Gegen welchen Wert strebt die logistische Folge für $r = 2{,}5$? [Aufgabe laden](?mode=logistisch&r=2.5&xs=0.2&_hide=1)

<details><summary>Lösung anzeigen</summary>

Für einen festen Wert gilt $x = r\,x\,(1 - x)$, also $x = 1 - \tfrac1r = 0{,}6$.

</details>

**3. Umfang der Schneeflocke.** Das Startdreieck hat den Umfang 3. Wie groß ist der Umfang nach 5 Stufen? [Aufgabe laden](?mode=fraktal&f=koch&n=5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$3 \cdot \big(\tfrac43\big)^5 \approx 12{,}64$.

</details>

**4. Sierpinski.** Wie viele Dreiecke gibt es nach 6 Stufen, und welcher Anteil der Fläche ist übrig?

<details><summary>Lösung anzeigen</summary>

$3^6 = 729$ Dreiecke und $\big(\tfrac34\big)^6 \approx 0{,}178$, also etwa 18 % der Fläche.

</details>
