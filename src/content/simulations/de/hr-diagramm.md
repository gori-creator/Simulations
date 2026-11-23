---
description: Hertzsprung-Russell-Diagramm interaktiv – echte Sterne nach Temperatur und Leuchtkraft, Stefan-Boltzmann- und Wien-Gesetz, Lebensweg eines Sterns bis zur Supernova und Entfernung über die Parallaxe.
---

## Worum geht es?

Sterne unterscheiden sich vor allem in zwei Dingen: wie **heiß** ihre Oberfläche ist und wie viel Licht sie insgesamt abstrahlen, ihre **Leuchtkraft** $L$. Trägt man jeden Stern mit diesen beiden Werten in ein Diagramm ein, erhält man das **Hertzsprung-Russell-Diagramm** (HRD). Die Temperatur nimmt dabei nach **rechts ab** (links heiß und blau, rechts kühl und rot), die Leuchtkraft nach oben zu. Beide Achsen sind logarithmisch geteilt, sonst passten Sterne mit dem Millionenfachen und dem Tausendstel der Sonnenleuchtkraft nicht in ein Bild.

Die Sterne verteilen sich nicht zufällig:

- Etwa 90 % liegen auf der **Hauptreihe**. Dort verschmelzen sie im Kern Wasserstoff zu Helium – so wie die Sonne.
- Oben rechts liegen **Rote Riesen** und **Überriesen**: kühl, aber riesig und deshalb hell (zum Beispiel Beteigeuze).
- Unten links liegen **Weiße Zwerge**: heiß, aber nur so groß wie die Erde (zum Beispiel Sirius B).

**Stefan-Boltzmann-Gesetz:** Ein Stern strahlt pro Quadratmeter Oberfläche $\sigma \cdot T^4$ ab. Mit der Oberfläche $4\pi R^2$ folgt

$$
L = 4\pi R^2 \cdot \sigma \cdot T^4, \qquad \frac{L}{L_\odot} = \left(\frac{R}{R_\odot}\right)^{2} \cdot \left(\frac{T}{T_\odot}\right)^{4},
$$

mit $T_\odot \approx 5772\,\text{K}$ (oft gerundet $5778\,\text{K}$) und $L_\odot = 3{,}83 \cdot 10^{26}\,\text{W}$. Doppelte Temperatur bei gleichem Radius ergibt $2^4 = 16$-fache Leuchtkraft, doppelter Radius $4$-fache. Darum sind die gestrichelten Linien gleichen Radius im HRD Geraden.

**Farbe und Wiensches Verschiebungsgesetz:** Das Maximum der Strahlung liegt bei $\lambda_{\max} = \frac{2{,}898\,\text{mm}\cdot\text{K}}{T}$. Für die Sonne sind das etwa $502\,\text{nm}$ (grün; wir sehen die Sonne trotzdem weißlich, weil sie alle Farben abstrahlt). Kühle Sterne leuchten rötlich, heiße bläulich. Danach ordnet man Sterne in **Spektralklassen** O, B, A, F, G, K, M (von heiß nach kühl); die Sonne ist ein G-Stern.

**Lebensweg:** Die **Masse** bestimmt das Leben eines Sterns. Auf der Hauptreihe gilt ungefähr $L \sim M^{3{,}5}$ bis $M^4$, die Lebensdauer ist etwa $t \approx 10\,\text{Mrd. Jahre} \cdot \frac{M}{L}$ (in Sonneneinheiten). Ein Stern mit $2\,M_\odot$ ist 16-mal so hell und lebt nur $1{,}25$ Mrd. Jahre. Sterne wie die Sonne werden zum Roten Riesen, stoßen ihre Hülle als **Planetarischen Nebel** ab und enden als **Weißer Zwerg**. Ab etwa $8\,M_\odot$ endet der Stern als **Supernova**; übrig bleibt ein **Neutronenstern** oder ein **Schwarzes Loch**.

**Entfernung über die Parallaxe:** Im Lauf eines Jahres sieht man einen nahen Stern von verschiedenen Punkten der Erdbahn aus. Vor den fernen Sternen scheint er hin und her zu wandern. Der halbe Winkel heißt **Parallaxe** $p$. Es gilt

$$
d = \frac{1}{p} \quad (d \text{ in Parsec, } p \text{ in Bogensekunden}), \qquad 1\,\text{pc} \approx 3{,}26\,\text{Lichtjahre}.
$$

Ein **Lichtjahr** ist die Strecke, die Licht in einem Jahr zurücklegt, etwa $9{,}46 \cdot 10^{12}\,\text{km}$.

## Ausprobieren

1. Tippe auf die Sonne, Beteigeuze und Sirius B. Vergleiche Temperatur, Leuchtkraft und Radius. [HR-Diagramm](?mode=hrd&star=sun&own=0)
2. Zeichne deinen eigenen Stern ein und zieh ihn entlang einer gestrichelten Linie. Was bleibt gleich? [Eigener Stern](?mode=hrd&own=1&T=8000&lr=0.3)
3. Verdopple die Temperatur bei gleichem Radius. Um welchen Faktor steigt die Leuchtkraft? [Vergleich](?mode=compare&star=sun&T=11500&lr=0)
4. Stell die Sonne neben Beteigeuze. Wie viele Sonnen passen in den Durchmesser? [Riese](?mode=compare&star=betelgeuse&T=5800&lr=0)
5. Spiele das Leben der Sonne ab. Welcher Abschnitt dauert am längsten? [Sonne](?mode=life&m=1&age=30)
6. Vergleiche mit einem Stern von 20 Sonnenmassen. [Supernova](?mode=life&m=20&age=30)
7. Wähle nahe Sterne aus. Welche kann man mit bloßem Auge sehen? [Parallaxe](?mode=parallax&pstar=sirius&p=0.379)
8. Üben: Ordne unbekannte Sterne ins HR-Diagramm ein. [Üben](?mode=quiz&qn=1)
9. Schalte die Spektralklassen ein. Zu welcher Klasse gehört die Sonne? [Klassen](?mode=hrd&classes=1&star=sun)

## Aufgaben

### Aufgabe 1: Heißer Stern

Ein Stern hat denselben Radius wie die Sonne, aber die doppelte Oberflächentemperatur. Wie groß ist seine Leuchtkraft?

<details>
<summary>Lösung anzeigen</summary>

$\frac{L}{L_\odot} = 1^2 \cdot 2^4 = 16$. Er strahlt 16-mal so viel Licht ab wie die Sonne. [In der Simulation zeigen](?mode=compare&star=sun&T=11500&lr=0)

</details>

### Aufgabe 2: Roter Riese

Ein Stern hat den 100-fachen Sonnenradius, aber nur die halbe Temperatur der Sonne. Wie hell ist er?

<details>
<summary>Lösung anzeigen</summary>

$\frac{L}{L_\odot} = 100^2 \cdot \left(\tfrac{1}{2}\right)^4 = \frac{10\,000}{16} = 625$. Trotz der kühlen Oberfläche ist er 625-mal so hell wie die Sonne, weil seine Oberfläche 10 000-mal so groß ist. [Im HRD zeigen](?mode=hrd&own=1&T=2900&lr=2)

</details>

### Aufgabe 3: Parallaxe

Proxima Centauri hat eine Parallaxe von $0{,}768''$. Wie weit ist der Stern entfernt?

<details>
<summary>Lösung anzeigen</summary>

$d = \frac{1}{0{,}768}\,\text{pc} \approx 1{,}30\,\text{pc} \approx 1{,}30 \cdot 3{,}26\,\text{Lj} \approx 4{,}25\,\text{Lj}$. Sein Licht braucht also gut vier Jahre bis zu uns. [In der Simulation zeigen](?mode=parallax&pstar=proxima&p=0.768)

</details>

### Aufgabe 4: Lebensdauer

Wie lange bleibt ein Stern mit $2\,M_\odot$ auf der Hauptreihe, wenn $L = M^4$ gilt?

<details>
<summary>Lösung anzeigen</summary>

$L = 2^4 = 16\,L_\odot$, also $t \approx 10\,\text{Mrd. Jahre} \cdot \frac{2}{16} = 1{,}25\,\text{Mrd. Jahre}$. Er hat doppelt so viel Brennstoff wie die Sonne, verbraucht ihn aber 16-mal so schnell. [In der Simulation zeigen](?mode=life&m=2&age=30)

</details>

## Ideen für den Unterricht

- **Einstieg:** Ein Bild des Orion zeigen: Warum ist Beteigeuze rötlich und Rigel bläulich? Danach beide im HRD suchen.
- **Linien gleichen Radius:** Den eigenen Stern einmal entlang einer Linie und einmal senkrecht dazu ziehen und beschreiben, was sich jeweils ändert.
- **Lebensweg:** Die Zeitleiste ist nicht linear – die Spätphasen sind stark gestreckt. Das lässt sich gut zum Anlass nehmen, über Darstellungen und Maßstäbe zu sprechen.
- **Häufige Stolpersteine:** „Rote Sterne sind heißer“ (Herdplatte!); „Große Sterne leben länger“; die nach rechts abnehmende Temperaturachse.
- **Bezug zum Lehrplan:** Astrophysik ist in vielen Ländern Wahl- oder Vertiefungsthema der Oberstufe; einfache Teile (Lichtjahr, Sternentwicklung) gibt es teils schon ab Klasse 7 – bitte am eigenen Lehrplan prüfen. Die Werte der echten Sterne sind gerundet, der Lebensweg ist schematisch.
