---
description: "Interaktive Simulation für die 9. und 10. Klasse: Sinus, Kosinus und Tangens als Seitenverhältnisse im rechtwinkligen Dreieck – mit ziehbarer Ecke, farbig markierter Gegenkathete, Ankathete und Hypotenuse, ähnlichen Dreiecken und den Graphen von 0° bis 90°."
---

## Worum geht es?

In einem rechtwinkligen Dreieck heißt die Seite gegenüber dem rechten Winkel **Hypotenuse**. Die beiden anderen Seiten sind die **Katheten**. Von einem spitzen Winkel aus gesehen liegt eine Kathete am Winkel an (**Ankathete**), die andere liegt ihm gegenüber (**Gegenkathete**).

Für den Winkel $\alpha$ gilt:

$$\sin \alpha = \frac{\text{Gegenkathete}}{\text{Hypotenuse}}, \qquad \cos \alpha = \frac{\text{Ankathete}}{\text{Hypotenuse}}, \qquad \tan \alpha = \frac{\text{Gegenkathete}}{\text{Ankathete}}$$

Warum hängen diese Verhältnisse nur vom Winkel ab? Alle rechtwinkligen Dreiecke mit demselben Winkel $\alpha$ sind **ähnlich**. Vergrößert man das Dreieck, werden alle Seiten mit demselben Faktor gestreckt – das Verhältnis bleibt gleich.

**Achtung:** Welche Kathete Gegen- oder Ankathete ist, hängt vom Winkel ab. Für $\beta$ tauschen die beiden Katheten ihre Rollen. Deshalb gilt zum Beispiel $\sin \alpha = \cos \beta$ mit $\beta = 90° - \alpha$.

*Beispiel:* Bei $\alpha = 30°$ ist die Gegenkathete genau halb so lang wie die Hypotenuse: $\sin 30° = 0{,}5$.

## Ausprobieren

1. [Start](?al=35&c=6): Ziehe die Ecke $B$. Welche Seite ist die Gegenkathete von $\alpha$, welche die Ankathete?
2. Drücke „Dreieck vergrößern und verkleinern“. Was passiert mit den Seitenlängen, was mit dem Verhältnis?
3. [Ähnliche Dreiecke](?sim=1&al=40&c=9): Vergleiche die Verhältnisse der drei ineinanderliegenden Dreiecke.
4. [Bezugswinkel β](?ref=b): Welche Seiten tauschen ihre Rollen? Vergleiche $\cos \beta$ mit $\sin \alpha$.
5. [α = 45°, Tangens](?al=45&f=tan&c=7): Warum ist $\tan 45° = 1$?
6. [Steiler Winkel](?al=70&f=tan&c=8): Wie groß kann der Tangens werden, wie groß der Sinus? Beobachte die Graphen.

## Aufgaben

### Aufgabe 1: Seiten berechnen

In einem rechtwinkligen Dreieck ist $c = 6\,\text{cm}$ und $\alpha = 30°$. Berechne $a$ und $b$. [Aufgabe laden](?al=30&c=6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$a = c \cdot \sin \alpha = 6\,\text{cm} \cdot 0{,}5 = 3\,\text{cm}$; $b = c \cdot \cos \alpha = 6\,\text{cm} \cdot \cos 30° \approx 5{,}20\,\text{cm}$. [Lösung zeigen](?al=30&c=6)

</details>

### Aufgabe 2: Die Leiter

Eine $5\,\text{m}$ lange Leiter lehnt an einer Wand und bildet mit dem Boden einen Winkel von $70°$. In welcher Höhe berührt sie die Wand? [Aufgabe laden](?al=70&c=5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Höhe ist die Gegenkathete zum Winkel am Boden: $h = 5\,\text{m} \cdot \sin 70° \approx 4{,}70\,\text{m}$. (Im Modell: $1\,\text{cm}$ entspricht $1\,\text{m}$.) [Lösung zeigen](?al=70&c=5)

</details>

### Aufgabe 3: Winkel bestimmen

Eine Rampe steigt auf $100\,\text{m}$ waagerechter Strecke um $12\,\text{m}$ an. Wie groß ist der Steigungswinkel?

<details>
<summary>Lösung anzeigen</summary>

$\tan \alpha = \frac{12}{100} = 0{,}12$, also $\alpha = \tan^{-1}(0{,}12) \approx 6{,}8°$. [Ähnliches Dreieck zeigen](?al=7&f=tan&c=10)

</details>

### Aufgabe 4: Stimmt das?

Lena behauptet: „$\sin \alpha$ kann nie größer als $1$ sein, $\tan \alpha$ aber schon.“ Begründe.

<details>
<summary>Lösung anzeigen</summary>

Die Hypotenuse ist die längste Seite, deshalb ist $\frac{\text{Gegenkathete}}{\text{Hypotenuse}} < 1$. Beim Tangens steht die Ankathete im Nenner; ab $\alpha = 45°$ ist die Gegenkathete länger als die Ankathete, also $\tan \alpha > 1$. [Zeigen](?al=70&f=tan&c=8)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 9 bzw. 10 (Trigonometrie am rechtwinkligen Dreieck), LehrplanPLUS Gymnasium Bayern. Gut als Einstieg: Erst die Konstanz der Verhältnisse entdecken (Animation, ähnliche Dreiecke), dann die Namen einführen.
- **Messen statt rechnen:** Die Lernenden zeichnen selbst Dreiecke mit $\alpha = 35°$ in verschiedenen Größen, messen und bilden die Quotienten – anschließend Vergleich mit der Simulation.
- **Taschenrechner:** Gradmodus prüfen (DEG); die Umkehrtasten $\sin^{-1}$ usw. liefern den Winkel zum Verhältnis.
- **Häufige Stolpersteine:**
  - Gegenkathete und Ankathete werden ohne Blick auf den Bezugswinkel festgelegt.
  - Die Hypotenuse wird mit der „schrägen“ Seite verwechselt, auch wenn das Dreieck gedreht liegt.
  - Der Taschenrechner steht im Bogenmaß.
