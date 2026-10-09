---
description: "Interaktive Simulation zu Linsen – Bildkonstruktion mit Parallel-, Mittelpunkt- und Brennpunktstrahl, Linsengleichung, Abbildungsmaßstab, Lupe, Projektor und Kamera sowie das Scharfstellen auf der optischen Bank."
---

## Worum geht es?

Eine **Sammellinse** (konvex, in der Mitte dicker) bricht Licht, das parallel zur optischen Achse einfällt, so, dass es sich im **Brennpunkt** $F$ trifft. Der Abstand vom Brennpunkt zur Linsenmitte ist die **Brennweite** $f$. Eine **Zerstreuungslinse** (konkav, in der Mitte dünner) lässt paralleles Licht auseinanderlaufen, als käme es von einem Brennpunkt vor der Linse.

**Bildkonstruktion.** Von jedem Punkt eines Gegenstands geht Licht aus. Um den Bildpunkt der Pfeilspitze zu finden, genügen zwei von drei besonderen Strahlen (gebrochen wird vereinfacht an der Mittelebene der Linse):

- **Parallelstrahl:** läuft parallel zur Achse und wird zum Brennpunktstrahl – durch $F$ hinter der Linse.
- **Mittelpunktstrahl:** geht ungebrochen durch die Linsenmitte.
- **Brennpunktstrahl:** läuft durch $F$ vor der Linse und danach parallel zur Achse.

Schneiden sich die Strahlen hinter der Linse, entsteht ein **reelles Bild** – man kann es auf einem Schirm auffangen. Laufen sie auseinander, scheinen sie (rückwärts verlängert) von einem Punkt vor der Linse zu kommen: ein **virtuelles Bild**, das man nur beim Blick durch die Linse sieht.

**Linsengleichung und Abbildungsmaßstab.** Mit der Gegenstandsweite $g$, der Bildweite $b$, der Gegenstandsgröße $G$ und der Bildgröße $B$ gilt

$$
\frac{1}{f} = \frac{1}{g} + \frac{1}{b} \qquad\text{und}\qquad \frac{B}{G} = \frac{b}{g}.
$$

Bei einem virtuellen Bild wird $b$ negativ, bei einer Zerstreuungslinse ist $f$ negativ. Die **Brechkraft** $D = \frac{1}{f}$ wird in Dioptrien angegeben: $1\,\text{dpt} = \frac{1}{\text{m}}$, eine Linse mit $f = 10\,\text{cm}$ hat $10\,\text{dpt}$.

| Gegenstandsweite | Bild | Anwendung |
| --- | --- | --- |
| $g > 2f$ | reell, umgekehrt, verkleinert, $f < b < 2f$ | Kamera, Auge |
| $g = 2f$ | reell, umgekehrt, gleich groß, $b = 2f$ | – |
| $f < g < 2f$ | reell, umgekehrt, vergrößert, $b > 2f$ | Projektor, Beamer |
| $g = f$ | kein Bild (Strahlen parallel) | Scheinwerfer (umgekehrter Lichtweg) |
| $g < f$ | virtuell, aufrecht, vergrößert | Lupe |

**Optische Bank.** Mit Kerze, Linse und Schirm sieht man ein scharfes Bild nur, wenn der Schirm in der Bildweite steht. Davor oder dahinter trifft jedes Lichtbündel als Fleck auf den Schirm – das Bild wird unscharf. Eine kleine **Blende** macht die Bündel schmaler: Das Bild wird dunkler, bleibt aber über einen größeren Bereich scharf (**Schärfentiefe**).

## Ausprobieren

1. Ziehe den Gegenstand langsam von weit weg bis an die Linse – oder drücke **Abspielen**. Wie verändern sich Lage, Größe und Richtung des Bildes?
2. Stelle den Gegenstand genau in die doppelte Brennweite. Was fällt dir am Bild auf? [g = 2f](?g=20)
3. Was passiert, wenn der Gegenstand im Brennpunkt steht? Schalte das Lichtbündel ein. [g = f](?g=10&bun=1)
4. Rücke den Gegenstand innerhalb der Brennweite. Wo liegt jetzt das Bild? [Lupe](?g=6&gs=4)
5. Wechsle zur Zerstreuungslinse und verschiebe den Gegenstand. Kannst du ein reelles Bild erzeugen? [Zerstreuungslinse](?lt=zer&g=20&gs=8)
6. Schalte das Lichtbündel ein: Alle Strahlen von der Pfeilspitze treffen sich im Bildpunkt – nicht nur die drei Konstruktionsstrahlen. [Lichtbündel](?bun=1)
7. Schiebe auf der optischen Bank den Schirm, bis das Kerzenbild scharf ist. Prüfe mit der Linsengleichung. [Optische Bank](?mode=bench)
8. Verkleinere die Blende. Wie ändern sich Helligkeit und Schärfe? [Kleine Blende](?mode=bench&d=1&s=34)

## Aufgaben

### Aufgabe 1: Bild konstruieren und berechnen

Ein $G = 4\,\text{cm}$ großer Gegenstand steht $g = 25\,\text{cm}$ vor einer Sammellinse mit $f = 10\,\text{cm}$. Konstruiere das Bild und berechne $b$ und $B$. Welche Eigenschaften hat das Bild? [Aufgabe laden](?g=25&gs=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{1}{b} = \frac{1}{f} - \frac{1}{g} = \frac{1}{10\,\text{cm}} - \frac{1}{25\,\text{cm}} = \frac{3}{50\,\text{cm}}$, also $b \approx 16{,}7\,\text{cm}$.

$B = G \cdot \frac{b}{g} \approx 4\,\text{cm} \cdot \frac{16{,}7}{25} \approx 2{,}7\,\text{cm}$. Das Bild ist reell, umgekehrt und verkleinert ($g > 2f$). [In der Simulation zeigen](?g=25&gs=4)

</details>

### Aufgabe 2: Der Projektor

Ein Projektor hat ein Objektiv mit $f = 10\,\text{cm}$. Ein $3\,\text{cm}$ großes Bild soll auf einer Leinwand $b = 50\,\text{cm}$ hinter der Linse scharf erscheinen. Wie weit muss das Dia von der Linse entfernt sein, und wie groß wird das Bild? [Aufgabe laden](?f=10&gs=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{1}{g} = \frac{1}{10\,\text{cm}} - \frac{1}{50\,\text{cm}} = \frac{4}{50\,\text{cm}}$, also $g = 12{,}5\,\text{cm}$ – knapp außerhalb der Brennweite. $B = 3\,\text{cm} \cdot \frac{50}{12{,}5} = 12\,\text{cm}$. [In der Simulation zeigen](?g=12.5&gs=3)

</details>

### Aufgabe 3: Die Lupe

Eine Lupe hat die Brennweite $f = 8\,\text{cm}$. Eine $3\,\text{cm}$ große Briefmarke liegt $6\,\text{cm}$ vor der Linse. Wo entsteht das Bild, und wie groß erscheint es? [Aufgabe laden](?f=8&g=6&gs=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{1}{b} = \frac{1}{8\,\text{cm}} - \frac{1}{6\,\text{cm}} = -\frac{1}{24\,\text{cm}}$, also $b = -24\,\text{cm}$: ein virtuelles Bild $24\,\text{cm}$ vor der Linse, auf derselben Seite wie die Briefmarke. $\frac{B}{G} = \frac{24}{6} = 4$, das Bild ist aufrecht und $12\,\text{cm}$ groß. [In der Simulation zeigen](?f=8&g=6&gs=3)

</details>

### Aufgabe 4: Scharfstellen bei der Kamera

Ein Kameraobjektiv hat $f = 5\,\text{cm}$. Wie weit muss der Sensor hinter der Linse sein, wenn der Gegenstand $50\,\text{cm}$ bzw. $20\,\text{cm}$ entfernt ist? Was muss man also beim Scharfstellen tun, wenn der Gegenstand näher kommt?

<details>
<summary>Lösung anzeigen</summary>

$b = \frac{f \cdot g}{g - f} = \frac{5 \cdot 50}{45}\,\text{cm} \approx 5{,}6\,\text{cm}$ bzw. $\frac{5 \cdot 20}{15}\,\text{cm} \approx 6{,}7\,\text{cm}$. Kommt der Gegenstand näher, muss das Objektiv weiter vom Sensor weg. Das Auge macht es anders: Dort bleibt der Abstand gleich, und die Augenlinse wird stärker gekrümmt (kleinere Brennweite). [Gegenstand bei 50 cm](?mode=bench&f=5&g=50&s=5.5) · [bei 20 cm](?mode=bench&f=5&g=20&s=6.5)

</details>

### Aufgabe 5: Zerstreuungslinse

Ein $5\,\text{cm}$ großer Gegenstand steht $15\,\text{cm}$ vor einer Zerstreuungslinse mit $f = -10\,\text{cm}$. Berechne $b$ und $B$.

<details>
<summary>Lösung anzeigen</summary>

$\frac{1}{b} = -\frac{1}{10\,\text{cm}} - \frac{1}{15\,\text{cm}} = -\frac{1}{6\,\text{cm}}$, also $b = -6\,\text{cm}$ (virtuell, vor der Linse). $B = 5\,\text{cm} \cdot \frac{6}{15} = 2\,\text{cm}$: aufrecht und verkleinert. [In der Simulation zeigen](?lt=zer&g=15&gs=5)

</details>

### Aufgabe 6: Gleich groß

Zeige mit der Linsengleichung: Steht der Gegenstand in der doppelten Brennweite, entsteht das Bild ebenfalls in der doppelten Brennweite und ist gleich groß.

<details>
<summary>Lösung anzeigen</summary>

Mit $g = 2f$: $\frac{1}{b} = \frac{1}{f} - \frac{1}{2f} = \frac{1}{2f}$, also $b = 2f$, und $\frac{B}{G} = \frac{b}{g} = 1$. [In der Simulation zeigen](?g=20)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Optik in der Mittelstufe (Linsen, Bildentstehung, optische Geräte); am bayerischen Gymnasium im Physikunterricht der Jahrgangsstufen 8 bis 10 (Zuordnung als Entwurf, bitte mit dem LehrplanPLUS abgleichen). Teil 1 eignet sich zum Einführen und Üben der Bildkonstruktion, Teil 2 als Ersatz oder Vorbereitung für den Versuch auf der optischen Bank.
- **Modell:** dünne Linse, achsennahe Strahlen, keine Linsenfehler; gebrochen wird an der Mittelebene. Konstruktionsstrahlen dürfen die Mittelebene auch außerhalb der gezeichneten Linse treffen – sie dienen nur der Konstruktion. Die Zeichnung passt ihren Maßstab der Brennweite an.
- **Vorzeichen:** virtuelles Bild $b < 0$, Zerstreuungslinse $f < 0$; im Abbildungsmaßstab werden Beträge verwendet.
- **Konstruktionsübungen:** Unter „Anzeige“ lassen sich Bild und Strahlen ausblenden, die Ergebnisse mit `_hide=1` verdecken.
- **Optische Bank:** Das Schirmbild entsteht aus den Lichtbündeln aller Kerzenpunkte (Unschärfekreis aus ähnlichen Dreiecken); als scharf gilt ein Unschärfekreis bis $3\,\text{mm}$. Die Blende verkleinert die wirksame Linsenöffnung.
- **Typische Fehlvorstellungen:**
  - „Deckt man die halbe Linse ab, fehlt die Hälfte des Bildes.“ – Das ganze Bild bleibt, es wird nur dunkler (kleine Blende ausprobieren).
  - „Das Bild entsteht erst, wenn ein Schirm da ist.“ – Die Lichtbündel treffen sich auch ohne Schirm; der Schirm macht das Bild sichtbar.
  - „Es gibt nur die drei Konstruktionsstrahlen.“ – Sie sind Hilfsmittel; das Lichtbündel zeigt, dass alle Strahlen durch den Bildpunkt gehen.
  - „Ein virtuelles Bild kann man nicht sehen.“ – Man sieht es beim Blick durch die Linse, nur auffangen kann man es nicht.
