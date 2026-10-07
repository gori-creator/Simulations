---
description: Interaktive Simulation zum Einheitskreis – Sinus, Kosinus und Tangens für beliebige Winkel, Bogenmaß und die Entstehung der Sinuskurve.
---

## Worum geht es?

Der **Einheitskreis** ist der Kreis um den Ursprung mit dem Radius 1. Ein Punkt $P$ läuft auf diesem Kreis; der Winkel $\alpha$ wird von der positiven x-Achse aus **gegen den Uhrzeigersinn** gemessen.

Die Koordinaten von $P$ sind genau Kosinus und Sinus des Winkels:

$$
P\,(\cos\alpha \mid \sin\alpha)
$$

So sind Sinus und Kosinus nicht nur für spitze Winkel im rechtwinkligen Dreieck, sondern für **alle Winkel** definiert – auch für 150° oder 300°.

- Der **Tangens** ist $\tan\alpha = \frac{\sin\alpha}{\cos\alpha}$. Am Einheitskreis ist er die Länge des Abschnitts auf der Tangente $x = 1$.
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

## Ausprobieren

1. Starte die **Animation**. Verfolge die waagerechte Hilfslinie: Wie entsteht aus der Kreisbewegung die Sinuskurve?
2. Vergleiche $\alpha = 30^\circ$ und $\alpha = 150^\circ$. Was haben die Sinuswerte gemeinsam? [30°](?angle=30) [150°](?angle=150)
3. In welchen Quadranten ist der Sinus negativ, in welchen der Kosinus?
4. Blende den **Tangens** ein und ziehe $P$ in die Nähe von 90°. Was passiert? [Tangens zeigen](?angle=80&tan=1&cos=0)
5. Stelle die Achse auf **Bogenmaß** um. [Bogenmaß](?unit=rad&angle=90)

## Aufgaben

### Aufgabe 1: Werte ohne Taschenrechner

Bestimme $\sin 120^\circ$ und $\cos 120^\circ$ mithilfe der Symmetrie am Einheitskreis.

<details>
<summary>Lösung anzeigen</summary>

$P$ liegt im II. Quadranten und ist das Spiegelbild des Punkts für $60^\circ$ an der y-Achse. Daher ist $\sin 120^\circ = \sin 60^\circ = \frac{\sqrt{3}}{2}$ und $\cos 120^\circ = -\cos 60^\circ = -\frac{1}{2}$. [Überprüfen](?angle=120)

</details>

### Aufgabe 2: Gleichung lösen

Für welche Winkel $\alpha$ zwischen 0° und 360° gilt $\sin\alpha = 0{,}5$?

<details>
<summary>Lösung anzeigen</summary>

Für $\alpha_1 = 30^\circ$ und – wegen $\sin(180^\circ - \alpha) = \sin\alpha$ – für $\alpha_2 = 150^\circ$. [30°](?angle=30) [150°](?angle=150)

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

Bei 90° ist $\cos\alpha = 0$ – man müsste durch null teilen. Geometrisch verläuft die Gerade durch $O$ und $P$ dann parallel zur Tangente $x = 1$ und schneidet sie nicht.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Übergang von der Trigonometrie im rechtwinkligen Dreieck zu den trigonometrischen Funktionen (in Bayern: Jahrgangsstufe 9, Lernbereich 7.2, und Jahrgangsstufe 10, Lernbereich 3).
- **Am Beamer:** Die Animation mit niedriger Geschwindigkeit (z. B. 10 °/s) laufen lassen und die Klasse vorhersagen lassen, wann der Sinus sein Maximum erreicht.
- **Typische Fehlvorstellungen:**
  - Sinus und Kosinus gibt es „nur im Dreieck“, also nur für Winkel unter 90°.
  - Das Bogenmaß wird als bloße andere Einheit gesehen, ohne die geometrische Bedeutung als Bogenlänge.
  - Die Vorzeichen in den Quadranten werden auswendig gelernt statt am Kreis abgelesen.
- **Weiterführend:** Die Simulation „Allgemeine Sinusfunktion“ knüpft direkt an.
