## Worum geht es?

Eine Werkstatt baut Tische ($x$) und Stühle ($y$). Ein Tisch bringt $30$ € Gewinn, ein Stuhl $20$ €. Holz, Arbeitszeit und Lagerplatz sind aber begrenzt. Wie viele Tische und Stühle sollte die Werkstatt bauen, damit der Gewinn möglichst groß wird? Solche Fragen löst die **lineare Optimierung**.

### 1. Bedingungen aufstellen

Jede Beschränkung wird zu einer linearen Ungleichung:

| Bedingung | Ungleichung |
| --- | --- |
| Holz: Tisch 2 Einheiten, Stuhl 1, höchstens 16 | $2x + y \le 16$ |
| Arbeitszeit: Tisch 1 h, Stuhl 2 h, höchstens 14 h | $x + 2y \le 14$ |
| Lager: höchstens 6 Stühle | $y \le 6$ |
| keine negativen Stückzahlen | $x \ge 0,\; y \ge 0$ |

### 2. Planungsvieleck zeichnen

Jede Ungleichung beschreibt eine **Halbebene**, deren Rand eine Gerade ist. Alle Punkte, die **alle** Bedingungen erfüllen, bilden das **Planungsvieleck**. In der Simulation ist es grün gefärbt.

### 3. Zielfunktion und Zielgerade

Der Gewinn ist $z = 30x + 20y$. Für einen festen Wert von $z$ ist das eine Gerade, die **Zielgerade**. Alle Zielgeraden sind zueinander parallel, und je weiter man sie in Pfeilrichtung schiebt, desto größer wird $z$.

Man verschiebt die Zielgerade so weit, dass sie das Vieleck **gerade noch berührt**. Dieser Punkt ist das **Optimum**. Er liegt immer in einer **Ecke** des Vielecks. Ist die Zielgerade zu einer Kante parallel, sind sogar alle Punkte dieser Kante optimal.

Im Beispiel ist die beste Ecke $(6 \mid 4)$: $6$ Tische und $4$ Stühle bringen $z = 30 \cdot 6 + 20 \cdot 4 = 260$ € Gewinn.

### Ecken prüfen

Statt zu schieben, kann man auch alle Ecken in die Zielfunktion einsetzen und die beste auswählen:

| Ecke | $(0 \mid 0)$ | $(8 \mid 0)$ | $(6 \mid 4)$ | $(2 \mid 6)$ | $(0 \mid 6)$ |
| --- | --- | --- | --- | --- | --- |
| $z$ | $0$ | $240$ | $260$ | $180$ | $120$ |

### Minimieren und ganze Zahlen

Bei Kostenaufgaben sucht man das **Minimum**. Die Bedingungen lauten dann oft „mindestens …“ ($\ge$), und der Bereich ist nach oben offen. Dürfen nur **ganze Stückzahlen** vorkommen, ist eine Ecke mit Bruchzahlen nicht erlaubt. Dann sucht man unter den Gitterpunkten im Vieleck den besten.

## Ausprobieren

- [Tische und Stühle](?sz=werkstatt&p=30&q=20&zl=0.4): Schiebe die Zielgerade nach außen. Wo verlässt sie das Vieleck zuletzt?
- [Zielgerade parallel zu einer Kante](?sz=werkstatt&p=20&q=10&zl=0.8&sol=1): Was ist hier anders?
- [Futtermischung](?sz=futter&p=3&q=2&zl=0.3): Hier sollen die Kosten möglichst klein werden.
- [Ganzzahlige Lösung](?sz=eigen&a1=2&b1=3&c1=12&a2=3&b2=1&c2=11&p=4&q=5&goal=max&int=1&sol=1): Vergleiche die beste Ecke mit dem besten Gitterpunkt.

## Aufgaben

**1. Andere Gewinne.** Ein Tisch bringt jetzt $40$ € und ein Stuhl $10$ €. Welche Ecke ist nun optimal? [Aufgabe laden](?sz=werkstatt&p=40&q=10&zl=0.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$(8 \mid 0)$ mit $z = 320$ €. Es lohnt sich, nur Tische zu bauen.

</details>

**2. Ecken ausrechnen.** Berechne den Schnittpunkt der Geraden $2x + y = 16$ und $x + 2y = 14$.

<details><summary>Lösung anzeigen</summary>

Aus der ersten Gleichung folgt $y = 16 - 2x$. Eingesetzt in die zweite: $x + 32 - 4x = 14$, also $x = 6$ und $y = 4$.

</details>

**3. Futtermischung.** Sack A kostet $3$ €, Sack B $2$ €. Welche Mischung ist am billigsten? [Aufgabe laden](?sz=futter&p=3&q=2&zl=0.3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$2$ Säcke A und $4$ Säcke B kosten $3 \cdot 2 + 2 \cdot 4 = 14$ €.

</details>
