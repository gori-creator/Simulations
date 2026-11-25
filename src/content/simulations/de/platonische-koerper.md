## Worum geht es?

Ein **platonischer Körper** ist ein Körper, dessen Flächen **lauter gleiche regelmäßige Vielecke** sind und an dessen Ecken jeweils **gleich viele** Flächen zusammenstoßen. Schon die alten Griechen wussten: Es gibt genau **fünf** davon.

| Körper | Flächen | an jeder Ecke | Ecken e | Kanten k | Flächen f |
| --- | --- | --- | --- | --- | --- |
| Tetraeder | gleichseitige Dreiecke | 3 | 4 | 6 | 4 |
| Würfel (Hexaeder) | Quadrate | 3 | 8 | 12 | 6 |
| Oktaeder | gleichseitige Dreiecke | 4 | 6 | 12 | 8 |
| Dodekaeder | regelmäßige Fünfecke | 3 | 20 | 30 | 12 |
| Ikosaeder | gleichseitige Dreiecke | 5 | 12 | 30 | 20 |

### Warum nur fünf?

An einer Ecke müssen mindestens drei Flächen zusammenkommen, und ihre Winkel müssen zusammen **weniger als 360°** ergeben, sonst liegt alles flach in einer Ebene.

- **Dreiecke** haben $60°$-Winkel. Drei ($180°$), vier ($240°$) oder fünf ($300°$) passen, sechs ergeben schon $360°$. Daraus entstehen Tetraeder, Oktaeder und Ikosaeder.
- **Quadrate** haben $90°$-Winkel. Nur drei passen ($270°$), daraus entsteht der Würfel.
- **Fünfecke** haben $108°$-Winkel. Nur drei passen ($324°$), daraus entsteht das Dodekaeder.
- **Sechsecke** haben $120°$-Winkel. Schon drei ergeben $360°$, deshalb geht es nicht.

### Der Eulersche Polyedersatz

Leonhard Euler entdeckte: Für jeden Körper, der aus ebenen Flächen besteht und keine Löcher hat, gilt

$$e - k + f = 2$$

Das funktioniert nicht nur bei den platonischen Körpern, sondern zum Beispiel auch bei jedem Prisma ($2n - 3n + (n+2) = 2$) und jeder Pyramide ($(n+1) - 2n + (n+1) = 2$).

### Duale Körper

Verbindet man die Mittelpunkte benachbarter Flächen, entsteht wieder ein platonischer Körper, der **duale** Körper. Dabei tauschen Ecken und Flächen ihre Anzahl:

- Würfel und Oktaeder sind zueinander dual.
- Dodekaeder und Ikosaeder sind zueinander dual.
- Das Tetraeder ist zu sich selbst dual.

## Ausprobieren

- [Tetraeder](?k=tetra&mark=ecken): Drehe den Körper und zähle die Ecken.
- [Würfel mit Oktaeder](?k=hexa&mark=keine&dual=1): Wie viele Ecken hat das innere Oktaeder? Wie viele Flächen hat der Würfel?
- [Dodekaeder](?k=dodeka&mark=flaechen): Wie viele Fünfecke treffen sich an einer Ecke?
- [Euler am Prisma](?k=prisma&n=6&mark=ecken): Ändere die Eckenzahl der Grundfläche. Bleibt e − k + f gleich?

## Aufgaben

**1. Zählen.** Zähle beim Oktaeder Ecken, Kanten und Flächen und prüfe den Eulerschen Polyedersatz. [Aufgabe laden](?k=okta&mark=ecken&_hide=1)

<details><summary>Lösung anzeigen</summary>

$e = 6$, $k = 12$, $f = 8$, also $6 - 12 + 8 = 2$.

</details>

**2. Kanten berechnen.** Das Ikosaeder hat 20 Dreiecksflächen. Wie viele Kanten hat es, ohne dass du zählst?

<details><summary>Lösung anzeigen</summary>

Jede Fläche hat 3 Kanten, und jede Kante gehört zu 2 Flächen. Also $k = \tfrac{20 \cdot 3}{2} = 30$.

</details>

**3. Euler nutzen.** Ein Körper hat 12 Flächen und 30 Kanten. Wie viele Ecken hat er? [Aufgabe laden](?k=dodeka&mark=keine&_hide=1)

<details><summary>Lösung anzeigen</summary>

$e = 2 + k - f = 2 + 30 - 12 = 20$. Das ist das Dodekaeder.

</details>

**4. Kein sechster.** Warum gibt es keinen platonischen Körper aus Sechsecken?

<details><summary>Lösung anzeigen</summary>

Ein regelmäßiges Sechseck hat Innenwinkel von $120°$. Drei davon ergeben an einer Ecke schon $360°$ und liegen flach in der Ebene. So entsteht ein Parkett, aber keine räumliche Ecke.

</details>
