---
description: "Interaktive Simulation zu Linsen – Bildkonstruktion mit Parallel-, Mittelpunkt- und Brennpunktstrahl, Linsengleichung, Abbildungsmaßstab, scharfes Bild auf dem Schirm sowie Lupe, Projektor, Kamera und Auge."
---

## Worum geht es?

Eine **Sammellinse** lenkt Licht, das parallel zur optischen Achse einfällt, durch ihren **Brennpunkt** $F'$. Der Abstand vom Brennpunkt zur Linse ist die **Brennweite** $f$. Eine **Zerstreuungslinse** lenkt parallel einfallendes Licht so ab, als käme es von einem Brennpunkt $F'$ vor der Linse.

Das Bild eines Gegenstandspunkts findet man mit drei besonderen Strahlen (zwei genügen):

- **Parallelstrahl** – verläuft parallel zur Achse und wird zum **Brennpunktstrahl** durch $F'$.
- **Mittelpunktstrahl** – geht ungebrochen durch die Linsenmitte.
- **Brennpunktstrahl** – verläuft durch $F$ und wird zum **Parallelstrahl**.

Dort, wo sich die Strahlen hinter der Linse treffen, entsteht ein **reelles Bild**: Man kann es auf einem Schirm auffangen. Laufen die Strahlen hinter der Linse auseinander, scheinen sie von einem Punkt vor der Linse zu kommen: ein **virtuelles Bild**, das man nur durch die Linse hindurch sieht.

Mit der Gegenstandsweite $g$, der Bildweite $b$, der Gegenstandsgröße $G$ und der Bildgröße $B$ gelten die **Linsengleichung** und der **Abbildungsmaßstab**:

$$
\frac{1}{f} = \frac{1}{g} + \frac{1}{b} \qquad\qquad \frac{B}{G} = \frac{b}{g}
$$

| Lage des Gegenstands | Bild | Beispiel |
| --- | --- | --- |
| $g > 2f$ | reell, umgekehrt, verkleinert | Kamera, Auge |
| $g = 2f$ | reell, umgekehrt, gleich groß ($b = 2f$) | |
| $f < g < 2f$ | reell, umgekehrt, vergrößert | Projektor |
| $g = f$ | kein Bild, die Strahlen verlaufen parallel | Scheinwerfer |
| $g < f$ | virtuell, aufrecht, vergrößert | Lupe |

Eine Zerstreuungslinse erzeugt immer ein virtuelles, aufrechtes, verkleinertes Bild. Rechnet man bei ihr mit negativer Brennweite und bei virtuellen Bildern mit negativer Bildweite, gilt die Linsengleichung auch hier.

## Ausprobieren

1. Drücke **Abspielen**: Der Gegenstand wandert langsam auf die Linse zu. Beobachte, wie sich das Bild verändert und welcher Fall in der Tabelle gerade gilt.
2. Stelle $g = 2f$ ein. Wie groß ist das Bild, wo liegt es? [Doppelte Brennweite](?g=20&h=6)
3. Rücke den Gegenstand innerhalb der Brennweite an die Linse heran – wie bei einer **Lupe**. [Lupe](?app=loupe&g=6&h=3)
4. Wechsle zu „Lichtbündel und Schirm“ und verschiebe den Schirm, bis das Bild scharf ist. [Unscharfes Bild](?mode=bundle&s=30)
5. Ein **Projektor** wirft ein vergrößertes Bild des Dias an die Wand. [Projektor](?app=projector&mode=bundle&g=13&h=3&s=43.5)
6. In einer **Kamera** liegt das Bild auf dem Bildsensor. Rücke den Gegenstand näher – wohin muss der Sensor? [Kamera](?app=camera&mode=bundle&g=45&f=8&h=10&s=9.5)
7. Im **Auge** liegt die Netzhaut fest. Ziehe den Gegenstand näher heran: Wie ändert sich die Augenlinse? [Auge](?app=eye&g=40&h=8)
8. Vergleiche mit einer **Zerstreuungslinse**. [Zerstreuungslinse](?typ=div&g=20)

## Aufgaben

### Aufgabe 1: Bild berechnen

Ein $4\,\text{cm}$ hoher Gegenstand steht $30\,\text{cm}$ vor einer Sammellinse mit $f = 10\,\text{cm}$. Berechne Bildweite und Bildgröße und beschreibe das Bild. [Aufgabe laden](?g=30&h=4&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{1}{b} = \frac{1}{f} - \frac{1}{g} = \frac{1}{10\,\text{cm}} - \frac{1}{30\,\text{cm}} = \frac{2}{30\,\text{cm}}$, also $b = 15\,\text{cm}$.

$B = G \cdot \frac{b}{g} = 4\,\text{cm} \cdot \frac{15}{30} = 2\,\text{cm}$. Das Bild ist reell, umgekehrt und verkleinert ($g > 2f$).

</details>

### Aufgabe 2: Wohin mit der Leinwand?

Ein Projektor hat ein Objektiv mit $f = 10\,\text{cm}$. Das $3\,\text{cm}$ hohe Dia steht $12\,\text{cm}$ vor dem Objektiv. Wie weit muss die Leinwand entfernt sein, und wie groß wird das Bild? [Aufgabe laden](?app=projector&mode=bundle&g=12&h=3&s=40&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$b = \frac{f \cdot g}{g - f} = \frac{10 \cdot 12}{12 - 10}\,\text{cm} = 60\,\text{cm}$ und $B = 3\,\text{cm} \cdot \frac{60}{12} = 15\,\text{cm}$ – fünfmal so groß wie das Dia. [In der Simulation zeigen](?app=projector&mode=bundle&g=12&h=3&s=60)

</details>

### Aufgabe 3: Brennweite bestimmen

Im Experiment ist das Bild einer Kerze scharf, wenn die Kerze $24\,\text{cm}$ und der Schirm $12\,\text{cm}$ von der Linse entfernt sind. Welche Brennweite hat die Linse?

<details>
<summary>Lösung anzeigen</summary>

$\frac{1}{f} = \frac{1}{24\,\text{cm}} + \frac{1}{12\,\text{cm}} = \frac{3}{24\,\text{cm}}$, also $f = 8\,\text{cm}$. [In der Simulation prüfen](?mode=bundle&f=8&g=24&s=12)

</details>

### Aufgabe 4: Die Lupe

Eine Briefmarke liegt $5\,\text{cm}$ unter einer Lupe mit $f = 10\,\text{cm}$. Wo entsteht das Bild, und wie stark wird vergrößert? [Aufgabe laden](?app=loupe&g=5&h=3&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$b = \frac{10 \cdot 5}{5 - 10}\,\text{cm} = -10\,\text{cm}$: Das Bild ist virtuell und liegt $10\,\text{cm}$ vor der Linse, auf der Seite der Briefmarke. Der Abbildungsmaßstab ist $\frac{|b|}{g} = 2$ – die Briefmarke erscheint doppelt so groß und aufrecht.

</details>

### Aufgabe 5: Fotografieren aus der Ferne

Mit einem Objektiv der Brennweite $f = 5\,\text{cm}$ wird ein $10\,\text{m}$ hoher Baum aus $20\,\text{m}$ Entfernung fotografiert. Wie weit muss der Bildsensor vom Objektiv entfernt sein? Wie groß ist der Baum auf dem Sensor?

<details>
<summary>Lösung anzeigen</summary>

$b = \frac{5 \cdot 2000}{2000 - 5}\,\text{cm} \approx 5{,}01\,\text{cm}$ – bei weit entfernten Gegenständen liegt das Bild fast genau im Brennpunkt. $B = 1000\,\text{cm} \cdot \frac{5{,}01}{2000} \approx 2{,}5\,\text{cm}$.

</details>

### Aufgabe 6: Zerstreuungslinse

Ein Gegenstand steht $15\,\text{cm}$ vor einer Zerstreuungslinse mit $f = -10\,\text{cm}$. Berechne Bildweite und Abbildungsmaßstab. [Aufgabe laden](?typ=div&g=15&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$b = \frac{(-10) \cdot 15}{15 - (-10)}\,\text{cm} = -6\,\text{cm}$ (virtuell, $6\,\text{cm}$ vor der Linse), $\frac{|b|}{g} = \frac{6}{15} = 0{,}4$: aufrecht und verkleinert.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bildentstehung an Linsen im Optikunterricht der Mittelstufe (in vielen Ländern Klasse 8–10; am bayerischen Gymnasium beginnt die Optik in Jahrgangsstufe 7). Ob Linsengleichung, Abbildungsmaßstab und Zerstreuungslinse verbindlich sind oder der Vertiefung dienen, bitte im jeweiligen Lehrplan nachsehen (Zuordnung als Entwurf). Geeignet als Einstieg mit der Konstruktion, zum Üben mit der Linsengleichung und als Schülerversuch-Ersatz mit dem Schirm.
- **Modell:** dünne Linse, achsennahe Strahlen; die Strahlen werden an der Mittelebene der Linse geknickt. Bei „Lichtbündel und Schirm“ füllt das Licht eines Punkts die ganze Linse (Durchmesser $22\,\text{cm}$); steht der Schirm nicht in der Bildweite, wird jeder Punkt zu einem Unschärfekreis. Das Auge ist stark vergrößert gezeichnet (Netzhaut $10\,\text{cm}$ hinter der Linse).
- **Typische Fehlvorstellungen:**
  - „Durch die Linse gehen nur die drei Konstruktionsstrahlen.“ – Sie sind nur besonders einfach zu zeichnen; das Licht eines Punkts geht durch die ganze Linse (Lichtbündel).
  - „Deckt man die halbe Linse ab, fehlt das halbe Bild.“ – Das Bild bleibt vollständig, wird aber dunkler, weil jeder Bildpunkt von der ganzen Linse gebildet wird.
  - „Das Bild entsteht auf der Linse“ oder „nur, wenn ein Schirm da ist.“ – Ein reelles Bild entsteht im Raum hinter der Linse; der Schirm macht es nur sichtbar.
