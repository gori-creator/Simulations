## Worum geht es?

Der **Einheitskreis** ist der Kreis um den Ursprung mit dem Radius 1. Ein Punkt $P$ läuft auf diesem Kreis; der Winkel $\alpha$ wird von der positiven x-Achse aus **gegen den Uhrzeigersinn** gemessen.

Die Koordinaten von $P$ sind genau Kosinus und Sinus des Winkels:

$$
P\,(\cos\alpha \mid \sin\alpha)
$$

So sind Sinus und Kosinus nicht nur für spitze Winkel im rechtwinkligen Dreieck, sondern für **alle Winkel** definiert – auch für 150° oder 300°.

- Der **Tangens** ist $\tan\alpha = \frac{\sin\alpha}{\cos\alpha}$. Am Einheitskreis schneidet die Gerade durch den Ursprung $O$ und $P$ die Tangente $x = 1$. Die y-Koordinate dieses Schnittpunkts ist $\tan\alpha$ (unterhalb der x-Achse negativ).
- Nach dem Satz des Pythagoras gilt immer $\sin^2\alpha + \cos^2\alpha = 1$.

### Gradmaß und Bogenmaß

Im **Bogenmaß** misst man einen Winkel durch die Länge des zugehörigen Bogens auf dem Einheitskreis. Ein voller Kreis hat den Umfang $2\pi$, also entspricht $360^\circ$ genau $2\pi$:

$$
x = \frac{\pi}{180^\circ} \cdot \alpha
$$

| $\alpha$ | 0° | 30° | 45° | 60° | 90° | 180° | 270° | 360° |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bogenmaß | 0 | $\frac{\pi}{6}$ | $\frac{\pi}{4}$ | $\frac{\pi}{3}$ | $\frac{\pi}{2}$ | $\pi$ | $\frac{3\pi}{2}$ | $2\pi$ |
| $\sin\alpha$ | 0 | $\frac{1}{2}$ | $\frac{\sqrt{2}}{2}$ | $\frac{\sqrt{3}}{2}$ | 1 | 0 | −1 | 0 |
| $\cos\alpha$ | 1 | $\frac{\sqrt{3}}{2}$ | $\frac{\sqrt{2}}{2}$ | $\frac{1}{2}$ | 0 | −1 | 0 | 1 |

### Symmetrien am Einheitskreis

Spiegelt man $P$ an einer Achse oder am Ursprung, erhält man Punkte mit denselben Beträgen der Koordinaten. Daraus folgen die Beziehungen:

| Spiegelung | zugehöriger Winkel | Sinus | Kosinus |
| --- | --- | --- | --- |
| an der y-Achse | $180^\circ - \alpha$ | $\sin(180^\circ - \alpha) = \sin\alpha$ | $\cos(180^\circ - \alpha) = -\cos\alpha$ |
| am Ursprung | $180^\circ + \alpha$ | $\sin(180^\circ + \alpha) = -\sin\alpha$ | $\cos(180^\circ + \alpha) = -\cos\alpha$ |
| an der x-Achse | $360^\circ - \alpha$ | $\sin(360^\circ - \alpha) = -\sin\alpha$ | $\cos(360^\circ - \alpha) = \cos\alpha$ |

So lassen sich alle Werte auf Winkel zwischen $0^\circ$ und $90^\circ$ zurückführen.

### Gleichungen wie $\sin\alpha = c$

Eine waagrechte Gerade $y = c$ mit $-1 < c < 1$ schneidet den Einheitskreis in **zwei** Punkten. Deshalb hat $\sin\alpha = c$ zwischen $0^\circ$ und $360^\circ$ zwei Lösungen: $\alpha_1$ (Taschenrechner: $\sin^{-1}$) und $\alpha_2 = 180^\circ - \alpha_1$. Für $\cos\alpha = c$ schneidet eine senkrechte Gerade $x = c$, und es gilt $\alpha_2 = 360^\circ - \alpha_1$. Bei $c = \pm 1$ gibt es nur eine Lösung. Wegen der Periode kommen zu jeder Lösung noch alle Vielfachen von $360^\circ$ hinzu.

## Ausprobieren

1. Starte die **Animation**. Verfolge die Höhe von $P$ und den Punkt auf der Sinuskurve: Wie entsteht aus der Kreisbewegung die Sinuskurve? Auf breiten Bildschirmen verbindet eine waagerechte Hilfslinie die beiden Punkte.
2. Vergleiche $\alpha = 30^\circ$ und $\alpha = 150^\circ$. Was haben die Sinuswerte gemeinsam? [30°](?angle=30) [150°](?angle=150)
3. In welchen Quadranten ist der Sinus negativ, in welchen der Kosinus?
4. Blende den **Tangens** ein und ziehe $P$ in die Nähe von 90°. Was passiert? [Tangens zeigen](?angle=80&tan=1&cos=0)
5. Stelle die Achse auf **Bogenmaß** um. [Bogenmaß](?unit=rad&angle=90)
6. **Symmetrien:** Wähle „180° − α“ und ziehe $P$. Welche Strecke bleibt gleich lang, welche wechselt das Vorzeichen? [180° − α](?mode=symm&angle=30&rel=y) · [180° + α](?mode=symm&angle=50&rel=o) · [360° − α](?mode=symm&angle=40&rel=x)
7. **Gleichung lösen:** Zieh die waagrechte Linie im Graphen. Wann gibt es zwei Lösungen, wann nur eine? [sin α = 0,5](?mode=solve&fn=sin&cv=0.5) · [cos α = −0,5](?mode=solve&fn=cos&cv=-0.5)
8. **Üben:** Tippe auf den Punkt, der zur Aufgabe passt. Wie viele schaffst du am Stück? [Üben](?mode=quiz&q=1)

## Aufgaben

### Aufgabe 1: Werte ohne Taschenrechner

Bestimme $\sin 120^\circ$ und $\cos 120^\circ$ mithilfe der Symmetrie am Einheitskreis.

<details>
<summary>Lösung anzeigen</summary>

$P$ liegt im II. Quadranten und ist das Spiegelbild des Punkts für $60^\circ$ an der y-Achse. Daher ist $\sin 120^\circ = \sin 60^\circ = \frac{\sqrt{3}}{2}$ und $\cos 120^\circ = -\cos 60^\circ = -\frac{1}{2}$. [Überprüfen](?angle=120)

</details>

### Aufgabe 2: Gleichung lösen

Für welche Winkel $\alpha$ zwischen 0° und 360° gilt $\sin\alpha = 0{,}5$? [Aufgabe laden](?mode=solve&fn=sin&cv=0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Für $\alpha_1 = 30^\circ$ und – wegen $\sin(180^\circ - \alpha) = \sin\alpha$ – für $\alpha_2 = 150^\circ$. [In der Simulation zeigen](?mode=solve&fn=sin&cv=0.5)

</details>

### Aufgabe 3: Umrechnen

1. Gib $45^\circ$ und $225^\circ$ im Bogenmaß an.
2. Gib $\frac{3\pi}{2}$ und $\frac{2\pi}{3}$ im Gradmaß an.

<details>
<summary>Lösung anzeigen</summary>

1. $45^\circ = \frac{\pi}{4}$, $225^\circ = \frac{5\pi}{4}$
2. $\frac{3\pi}{2} = 270^\circ$, $\frac{2\pi}{3} = 120^\circ$

</details>

### Aufgabe 4: Tangens bei 90°

Begründe am Einheitskreis, warum $\tan 90^\circ$ nicht definiert ist.

<details>
<summary>Lösung anzeigen</summary>

Bei 90° ist $\cos\alpha = 0$ – man müsste durch null teilen. Geometrisch verläuft die Gerade durch den Ursprung $O$ und $P$ dann parallel zur Tangente $x = 1$ und schneidet sie nicht.

</details>

### Aufgabe 5: Kosinus negativ

Löse $\cos\alpha = -0{,}5$ für $0^\circ \le \alpha < 360^\circ$. [Aufgabe laden](?mode=solve&fn=cos&cv=-0.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\cos 60^\circ = 0{,}5$. Der Kosinus ist im II. und III. Quadranten negativ, also $\alpha_1 = 180^\circ - 60^\circ = 120^\circ$ und $\alpha_2 = 180^\circ + 60^\circ = 240^\circ$. Probe: $\alpha_2 = 360^\circ - \alpha_1$. [In der Simulation zeigen](?mode=solve&fn=cos&cv=-0.5)

</details>

### Aufgabe 6: Winkel aus zwei Angaben

Für welchen Winkel zwischen $0^\circ$ und $360^\circ$ gilt $\sin\alpha = -\frac{\sqrt{2}}{2}$ und $\cos\alpha > 0$?

<details>
<summary>Lösung anzeigen</summary>

$\sin\alpha < 0$ und $\cos\alpha > 0$: IV. Quadrant. Der Bezugswinkel ist $45^\circ$, also $\alpha = 360^\circ - 45^\circ = 315^\circ$. [Spiegelung an der x-Achse zeigen](?mode=symm&angle=45&rel=x)

</details>

## Ideen für den Unterricht

- **Einsatz:** Übergang von der Trigonometrie im rechtwinkligen Dreieck zu den trigonometrischen Funktionen (meist Klasse 9/10).
- **Am Beamer:** Die Animation mit niedriger Geschwindigkeit (z. B. 10 °/s) laufen lassen und die Klasse vorhersagen lassen, wann der Sinus sein Maximum erreicht.
- **Symmetrien statt Auswendiglernen:** In der Ansicht „Symmetrien“ läuft die Animation weiter, der gespiegelte Punkt läuft mit. Im Graphen zeigen die Höhenlinien, wann die Werte gleich sind und wann sie sich nur im Vorzeichen unterscheiden.
- **Üben:** Die Aufgaben sind nummeriert. Gleiche Nummer heißt gleiche Aufgabe, so kann die ganze Klasse an derselben Aufgabe arbeiten. Ungerade Nummern fragen nach einem Winkel, gerade nach Werten mit Vorzeichen. Die Punkte lassen sich auch mit der Tastatur wählen.
- **Häufige Stolpersteine:**
  - Sinus und Kosinus gibt es „nur im Dreieck“, also nur für Winkel unter 90°.
  - Das Bogenmaß wird als bloße andere Einheit gesehen, ohne die geometrische Bedeutung als Bogenlänge.
  - Die Vorzeichen in den Quadranten werden auswendig gelernt statt am Kreis abgelesen.
- **Weiterführend:** Die Simulation „Allgemeine Sinusfunktion“ knüpft direkt an.
