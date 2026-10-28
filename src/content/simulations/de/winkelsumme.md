## Worum geht es?

In **jedem Dreieck** ergeben die drei Innenwinkel zusammen $180^\circ$:

$$
\alpha + \beta + \gamma = 180^\circ
$$

**Begründung mit der Parallelen:** Zeichne durch $C$ die Parallele $g$ zur Seite $[AB]$. An der Geraden $AC$ sind $\alpha$ und $\alpha'$ **Wechselwinkel** an den Parallelen $AB$ und $g$ (Z-Figur), also $\alpha' = \alpha$. Genauso ist $\beta' = \beta$. Die drei Winkel $\alpha'$, $\gamma$ und $\beta'$ liegen nebeneinander an $g$ und bilden einen **gestreckten Winkel**: $\alpha' + \gamma + \beta' = 180^\circ$. Also gilt $\alpha + \beta + \gamma = 180^\circ$.

Daraus folgt: Kennt man zwei Winkel, kennt man den dritten, z. B. $\alpha = 50^\circ$, $\beta = 70^\circ$ $\Rightarrow$ $\gamma = 180^\circ - 50^\circ - 70^\circ = 60^\circ$.

**Vielecke:** Von einer Ecke aus lässt sich ein (konvexes) $n$-Eck durch Diagonalen in $n - 2$ Dreiecke zerlegen. Ihre Winkel setzen genau die Innenwinkel des $n$-Ecks zusammen. Deshalb ist die **Innenwinkelsumme im $n$-Eck**

$$
(n - 2) \cdot 180^\circ
$$

| $n$ | 3 | 4 | 5 | 6 | 8 | 10 |
| --- | --- | --- | --- | --- | --- | --- |
| Dreiecke | 1 | 2 | 3 | 4 | 6 | 8 |
| Winkelsumme | $180^\circ$ | $360^\circ$ | $540^\circ$ | $720^\circ$ | $1080^\circ$ | $1440^\circ$ |

In einem **regelmäßigen** $n$-Eck sind alle Winkel gleich groß: $(n - 2) \cdot 180^\circ : n$, z. B. $108^\circ$ im Fünfeck und $120^\circ$ im Sechseck. Die Formel gilt auch für **nicht konvexe** Vielecke mit einer einspringenden Ecke (Innenwinkel über $180^\circ$) – aber nicht, wenn sich Seiten überkreuzen.

**Außenwinkel:** Verlängert man eine Seite über die Ecke hinaus, entsteht der Außenwinkel – der Winkel, um den man beim Umrunden an dieser Ecke abbiegt. Am Dreieck gilt $\alpha^* = 180^\circ - \alpha = \beta + \gamma$. Wer ein konvexes Vieleck einmal umrundet, dreht sich genau einmal ganz herum: Die **Außenwinkelsumme** ist immer $360^\circ$.

## Ausprobieren

1. Ziehe die Ecken des Dreiecks. Wie ändern sich $\alpha$, $\beta$, $\gamma$ – und wie ihre Summe? Achte auf die farbige Leiste.
2. Drücke „Ecken abreißen“: Die Winkelstücke drehen sich um die Seitenmitten und legen sich an $C$ zu einem gestreckten Winkel zusammen. Versuch es auch mit einem [sehr flachen Dreieck](?ax=0&ay=1&bx=16&by=1&cx=6&cy=2.5).
3. Drücke „Beweis mit Parallele“ und verfolge die Schritte. Wo erkennst du die Z-Figur?
4. Schalte die [Außenwinkel](?ax=1&ay=2&bx=15&by=2&cx=5&cy=6&ext=1) ein. Vergleiche $\alpha^*$ mit $\beta + \gamma$.
5. Wechsle zum [Fünfeck](?mode=poly) und drücke „In Dreiecke zerlegen“. Wie viele Dreiecke sind es? Stelle mit dem Regler $n$ andere Eckenzahlen ein und vergleiche mit der Tabelle.
6. Ziehe eine Ecke nach innen, bis ein [nicht konvexes Sechseck](?mode=poly&n=6&pts=2,1;14,1;14,11;8,6.5;2,11;4,6) entsteht. Stimmt die Summe noch? Von welcher Ecke aus wird jetzt zerlegt?
7. Was passiert, wenn sich [Seiten überkreuzen](?mode=poly&n=4&pts=2,2;12,10;12,2;2,10)?
8. Schalte beim [regelmäßigen Achteck](?mode=poly&n=8&ext=1) die Außenwinkel ein und drücke „Umrunden“. Um wie viel Grad hat sich der Pfeil am Ende gedreht?

## Aufgaben

### Aufgabe 1: Der dritte Winkel

In einem Dreieck ist $\alpha = 48^\circ$ und $\beta = 67^\circ$. Berechne $\gamma$.

<details>
<summary>Lösung anzeigen</summary>

$\gamma = 180^\circ - 48^\circ - 67^\circ = 65^\circ$.

</details>

### Aufgabe 2: Ein rechtwinkliges Dreieck

[Aufgabe laden](?ax=3&ay=2&bx=11&by=2&cx=3&cy=8&vals=0&_hide=1) Bei $A$ ist ein rechter Winkel, $\beta \approx 36{,}9^\circ$. Wie groß ist $\gamma$? Warum kann ein Dreieck nicht zwei rechte Winkel haben?

<details>
<summary>Lösung anzeigen</summary>

$\gamma \approx 180^\circ - 90^\circ - 36{,}9^\circ = 53{,}1^\circ$. Zwei rechte Winkel ergäben schon $180^\circ$, für den dritten Winkel bliebe $0^\circ$ – das ist kein Dreieck. In einem rechtwinkligen Dreieck ergeben die beiden anderen Winkel zusammen $90^\circ$. [In der Simulation zeigen](?ax=3&ay=2&bx=11&by=2&cx=3&cy=8)

</details>

### Aufgabe 3: Achteck

Wie groß ist die Innenwinkelsumme im Achteck? Wie groß ist ein Innenwinkel im regelmäßigen Achteck?

<details>
<summary>Lösung anzeigen</summary>

$(8 - 2) \cdot 180^\circ = 6 \cdot 180^\circ = 1080^\circ$. Im regelmäßigen Achteck: $1080^\circ : 8 = 135^\circ$. [In der Simulation zeigen](?mode=poly&n=8)

</details>

### Aufgabe 4: Rückwärts gedacht

Die Innenwinkel eines Vielecks ergeben zusammen $1260^\circ$. Wie viele Ecken hat es?

<details>
<summary>Lösung anzeigen</summary>

$1260^\circ : 180^\circ = 7$, also $n - 2 = 7$ und $n = 9$: ein Neuneck. [In der Simulation zeigen](?mode=poly&n=9)

</details>

### Aufgabe 5: Außenwinkel

An jeder Ecke eines regelmäßigen Vielecks beträgt der Außenwinkel $40^\circ$. Wie viele Ecken hat es, und wie groß ist ein Innenwinkel?

<details>
<summary>Lösung anzeigen</summary>

Die Außenwinkel ergeben zusammen $360^\circ$, also $n = 360^\circ : 40^\circ = 9$. Ein Innenwinkel ist $180^\circ - 40^\circ = 140^\circ$ (Probe: $7 \cdot 180^\circ : 9 = 140^\circ$). [In der Simulation zeigen](?mode=poly&n=9&ext=1)

</details>

### Aufgabe 6: Knobelaufgabe

Gibt es ein regelmäßiges Vieleck mit Innenwinkeln von $100^\circ$? Ein Viereck hat Winkel von $30^\circ$, $40^\circ$ und $50^\circ$. Wie groß ist der vierte, und wie sieht das Viereck aus?

<details>
<summary>Lösung anzeigen</summary>

Aus $(n - 2) \cdot 180^\circ = 100^\circ \cdot n$ folgt $80^\circ \cdot n = 360^\circ$, also $n = 4{,}5$ – keine ganze Zahl, so ein Vieleck gibt es nicht. (Oder mit Außenwinkeln: $360^\circ : 80^\circ = 4{,}5$.)

Der vierte Winkel ist $360^\circ - 30^\circ - 40^\circ - 50^\circ = 240^\circ$. Er ist größer als $180^\circ$: Das Viereck ist nicht konvex, es hat eine einspringende Ecke (Form einer Pfeilspitze).

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 7, Winkel an Figuren: Innenwinkelsumme im Dreieck begründen und auf Vielecke übertragen. Das Abreißen eignet sich als Einstieg (gern parallel mit echten Papierdreiecken), der Beweis mit der Parallelen zur Sicherung, die Vielecke für eine Forschungsphase mit der Tabelle.
- **Vom Experiment zum Beweis:** Das Abreißen zeigt nur, dass es „passt“ – gemessen ist das nie ganz genau. Der Vergleich beider Wege kann gut zur Frage führen, warum man überhaupt beweist. Die halbe Drehung der Stücke um die Seitenmitten ist übrigens genau die Punktspiegelung, die Wechselwinkel aufeinander abbildet.
- **Modell:** Die Ecken rasten auf halben Kästchen ein, Winkel werden auf eine Nachkommastelle gerundet und so verteilt, dass die angezeigte Summe stimmt. „Winkelgrößen anzeigen“ aus und `_hide=1` eignen sich für Rechenaufgaben.
- **Häufige Stolpersteine:**
  - „Größere Dreiecke haben eine größere Winkelsumme.“ – Die Winkelsumme hängt nicht von der Größe ab; das Ziehen der Ecken zeigt das schnell.
  - Bei der Zerlegung werden Diagonalen von mehreren Ecken gezogen; dann entstehen mehr als $n - 2$ Dreiecke, deren Winkel teils im Inneren liegen.
  - Wechselwinkel und Stufenwinkel werden verwechselt – die Z-Figur kann helfen.
  - Bei nicht konvexen Vielecken wird der überstumpfe Innenwinkel übersehen bzw. statt seiner der Winkel auf der Außenseite ($360^\circ$ minus Innenwinkel) gemessen.
- **Außenwinkel:** Das Umrunden verbindet sich gut mit Bewegungsspielen auf dem Schulhof oder dem Programmieren einer „Turtle“. Bei einspringenden Ecken dreht man zurück; dort ist der Außenwinkel hier negativ angegeben – das geht über den Lehrplan hinaus und ist als Ausblick gedacht.
