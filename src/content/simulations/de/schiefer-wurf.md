---
description: "Interaktive Simulation zum waagerechten und schiefen Wurf – Bahn mit Stroboskop und Vektoren, Zerlegung in x- und y-Bewegung, Winkelvergleich, Zielwurf und Luftwiderstand auf Erde, Mond und Mars."
---

## Worum geht es?

Ein geworfener Ball führt zwei Bewegungen **gleichzeitig** aus, die sich nicht gegenseitig stören (**Superpositionsprinzip**):

- **waagerecht:** eine gleichförmige Bewegung mit der konstanten Geschwindigkeit $v_x = v_0 \cdot \cos\alpha$,
- **senkrecht:** einen senkrechten Wurf mit $v_{y,0} = v_0 \cdot \sin\alpha$, der durch die Fallbeschleunigung $g$ gebremst wird: $v_y(t) = v_0 \sin\alpha - g\,t$.

$$
x(t) = v_0 \cos\alpha \cdot t \qquad y(t) = h_0 + v_0 \sin\alpha \cdot t - \tfrac{1}{2} g t^2
$$

Eliminiert man $t$, erhält man die **Bahnkurve** – eine Parabel:

$$
y = h_0 + \tan\alpha \cdot x - \frac{g}{2 v_0^2 \cos^2\alpha} \cdot x^2
$$

Für einen Abwurf vom Boden ($h_0 = 0$) gilt für Flugzeit, Wurfweite und Steighöhe:

$$
T = \frac{2 v_0 \sin\alpha}{g} \qquad w = \frac{v_0^2 \sin(2\alpha)}{g} \qquad h_{\max} = \frac{v_0^2 \sin^2\alpha}{2g}
$$

Die größte Wurfweite erreicht man dann bei $\alpha = 45^\circ$. Zwei Winkel, die sich zu $90^\circ$ ergänzen (z. B. $30^\circ$ und $60^\circ$), ergeben dieselbe Weite. Wirft man aus der Höhe $h_0 > 0$, liegt der beste Winkel **unter** $45^\circ$. Beim **waagerechten Wurf** ($\alpha = 0^\circ$) dauert der Flug genauso lange wie ein freier Fall aus $h_0$: $T = \sqrt{2h_0/g}$. Die Wurfweite ist dann $w = v_0 \cdot \sqrt{2h_0/g}$.

Die **Bahngeschwindigkeit** setzt sich aus den beiden Komponenten zusammen: $v = \sqrt{v_x^2 + v_y^2}$. Ohne Luftwiderstand trifft der Ball mit $v = \sqrt{v_0^2 + 2 g h_0}$ auf – das folgt auch aus dem Energieerhaltungssatz.

## Ausprobieren

1. Ziehe die Spitze des orangefarbenen Pfeils, um $v_0$ und $\alpha$ zu ändern, und drücke **Werfen**. Ziehe den Abwurfpunkt nach oben, um $h_0$ zu ändern.
2. Öffne die Zerlegung. Der blaue Schatten auf dem Boden bewegt sich gleichförmig, der rote auf der senkrechten Schiene wie bei einem senkrechten Wurf. Ziehe im Diagramm, um die Zeit zu verschieben. [Zerlegung](?mode=parts&v0=14&angle=50)
3. Welcher Winkel ergibt die größte Weite? Tippe im Diagramm auf verschiedene Winkel. [Winkel vergleichen](?mode=angles&angle=45)
4. Wirf mit $v_0 = 10\,\tfrac{\text{m}}{\text{s}}$ aus $h_0 = 20\,\text{m}$. Wo liegt das Maximum jetzt? (Es liegt bei etwa $24^\circ$.) [Aus 20 m Höhe](?mode=angles&v0=10&h0=20&angle=24)
5. Triff die Zielscheibe! Nach dem ersten Treffer zeigt die Simulation beide Lösungswinkel. [Zielwurf](?mode=target)
6. Vergleiche Fußball, Tischtennisball und Stoßkugel mit und ohne Luft. [Luftwiderstand](?mode=drag&v0=28&angle=35)
7. Auf dem Mond ($g = 1{,}62\,\tfrac{\text{m}}{\text{s}^2}$) fliegt derselbe Ball etwa 6-mal so weit: $19{,}86\,\text{m}$ werden zu $120{,}3\,\text{m}$. [Mond](?planet=mond)

## Aufgaben

### Aufgabe 1: Wurfweite berechnen

Ein Ball wird vom Boden mit $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$ unter $45^\circ$ geworfen ($g = 9{,}81\,\tfrac{\text{m}}{\text{s}^2}$). Berechne Flugzeit, Wurfweite und Steighöhe. [Aufgabe laden](?v0=15&angle=45&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$T = \frac{2 \cdot 15 \cdot \sin 45^\circ}{9{,}81}\,\text{s} \approx 2{,}16\,\text{s} \qquad w = \frac{15^2 \cdot \sin 90^\circ}{9{,}81}\,\text{m} \approx 22{,}9\,\text{m} \qquad h_{\max} = \frac{15^2 \cdot \sin^2 45^\circ}{2 \cdot 9{,}81}\,\text{m} \approx 5{,}73\,\text{m}$$

</details>

### Aufgabe 2: Gleiche Wurfweite

Zeige, dass $30^\circ$ und $60^\circ$ bei $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$ dieselbe Weite ergeben. Welche Bahn ist höher, welche dauert länger? [Vergleich zeigen](?mode=angles&angle=30)

<details>
<summary>Lösung anzeigen</summary>

$\sin(2 \cdot 30^\circ) = \sin 60^\circ = \sin 120^\circ = \sin(2 \cdot 60^\circ)$, also $w \approx 19{,}86\,\text{m}$ für beide. Der $60^\circ$-Wurf ist dreimal so hoch ($8{,}60\,\text{m}$ statt $2{,}87\,\text{m}$, denn $\sin^2 60^\circ : \sin^2 30^\circ = 3$) und dauert $\sqrt{3}$-mal so lange ($2{,}65\,\text{s}$ statt $1{,}53\,\text{s}$).

</details>

### Aufgabe 3: Waagerechter Wurf vom Turm

Ein Stein wird von einem $20\,\text{m}$ hohen Turm waagerecht mit $10\,\tfrac{\text{m}}{\text{s}}$ geworfen. Wann und wo trifft er auf? Wie schnell ist er dann? [Aufgabe laden](?v0=10&angle=0&h0=20&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T = \sqrt{2 \cdot 20 / 9{,}81}\,\text{s} \approx 2{,}02\,\text{s}$, $w = 10 \cdot 2{,}02\,\text{m} \approx 20{,}2\,\text{m}$. Beim Aufprall ist $v_y = 9{,}81 \cdot 2{,}02\,\tfrac{\text{m}}{\text{s}} \approx 19{,}8\,\tfrac{\text{m}}{\text{s}}$, also

$$v = \sqrt{10^2 + 19{,}8^2}\,\tfrac{\text{m}}{\text{s}} \approx 22{,}2\,\tfrac{\text{m}}{\text{s}}.$$

</details>

### Aufgabe 4: Zielwurf

Eine Scheibe hängt $18\,\text{m}$ entfernt in $2\,\text{m}$ Höhe. Der Ball startet am Boden mit $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$. Unter welchen Winkeln trifft er? Setze dazu $x = 18\,\text{m}$, $y = 2\,\text{m}$ in die Bahngleichung ein und löse nach $\tan\alpha$ auf (mit $\tfrac{1}{\cos^2\alpha} = 1 + \tan^2\alpha$). [Aufgabe laden](?mode=target&tx=18&ty=2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$2 = 18\tan\alpha - \frac{9{,}81 \cdot 18^2}{2 \cdot 15^2}(1 + \tan^2\alpha)$ führt auf $7{,}063\tan^2\alpha - 18\tan\alpha + 9{,}063 = 0$. Lösungen: $\tan\alpha \approx 0{,}691$ bzw. $1{,}858$, also $\alpha \approx 34{,}6^\circ$ (flache Bahn) und $\alpha \approx 61{,}7^\circ$ (steile Bahn). Mit weniger als etwa $14{,}05\,\tfrac{\text{m}}{\text{s}}$ wäre das Ziel unerreichbar. [Lösung zeigen](?mode=target&tx=18&ty=2&angle=35&sol=1)

</details>

### Aufgabe 5: Luftwiderstand

Vergleiche für einen Fußball ($v_0 = 28\,\tfrac{\text{m}}{\text{s}}$, $\alpha = 35^\circ$) die Bahn mit und ohne Luft. Nenne drei Unterschiede und erkläre den Verlauf im Energiediagramm. [Luftwiderstand](?mode=drag&v0=28&angle=35&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ohne Luft: $w = \frac{28^2 \cdot \sin 70^\circ}{9{,}81}\,\text{m} \approx 75{,}1\,\text{m}$. Mit Luft fliegt der Ball nur etwa $45{,}7\,\text{m}$ weit und weniger hoch; die Bahn ist keine Parabel mehr, der Scheitel liegt weiter hinten, der Ball kommt steiler herunter. Der beste Winkel liegt bei etwa $41^\circ$, also unter $45^\circ$. Die Energie pro Kilogramm $\tfrac12 v^2 + g\,y$ bleibt ohne Luft konstant, mit Luft nimmt sie ab – sie wird in innere Energie der Luft und des Balls umgewandelt.

</details>

### Aufgabe 6: Waagerechter Wurf auf dem Mond

Derselbe Stein wie in Aufgabe 3 wird auf dem Mond ($g = 1{,}62\,\tfrac{\text{m}}{\text{s}^2}$) waagerecht mit $10\,\tfrac{\text{m}}{\text{s}}$ aus $20\,\text{m}$ Höhe geworfen. Berechne Flugzeit, Wurfweite und Aufprallgeschwindigkeit. Um welchen Faktor ist die Wurfweite größer als auf der Erde? [Aufgabe laden](?planet=mond&v0=10&angle=0&h0=20&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T = \sqrt{2 \cdot 20 / 1{,}62}\,\text{s} \approx 4{,}97\,\text{s}$, $w = 10 \cdot 4{,}97\,\text{m} \approx 49{,}7\,\text{m}$. Beim Aufprall ist $v_y = 1{,}62 \cdot 4{,}97\,\tfrac{\text{m}}{\text{s}} \approx 8{,}05\,\tfrac{\text{m}}{\text{s}}$, also $v = \sqrt{10^2 + 8{,}05^2}\,\tfrac{\text{m}}{\text{s}} \approx 12{,}8\,\tfrac{\text{m}}{\text{s}}$. Die Wurfweite ist um den Faktor $\sqrt{9{,}81/1{,}62} \approx 2{,}46$ größer als auf der Erde ($20{,}2\,\text{m}$).

</details>

## Ideen für den Unterricht

- **Einsatz:** Mechanik, Superposition von Bewegungen, je nach Lehrplan Klasse 10 oder 11. Die Zerlegung eignet sich als Einstieg, der Zielwurf als Übung oder Wettbewerb in Gruppen.
- **Darstellung:** Stroboskop-Punkte und Schatten zeigen, dass die waagerechten Abstände gleich bleiben, die senkrechten nicht. Mit **Zeitlupe** und dem Ziehen im Diagramm lassen sich einzelne Momente besprechen.
- **Modell:** Massepunkt, konstantes $g$; Luftwiderstand quadratisch in $v$ mit Näherungswerten (Fußball $m = 0{,}43\,\text{kg}$, $d = 22\,\text{cm}$, $c_w \approx 0{,}25$; Tischtennisball $2{,}7\,\text{g}$; Stoßkugel $7{,}26\,\text{kg}$). Auf dem Mond gibt es keine Luft, auf dem Mars ist sie etwa 60-mal dünner.
- **Häufige Stolpersteine:**
  - „Im höchsten Punkt ist die Geschwindigkeit null.“ – Nur $v_y$ ist null, $v_x$ bleibt erhalten.
  - „Ein schneller waagerecht geworfener Ball fällt langsamer.“ – Die Fallzeit hängt nur von $h_0$ ab.
  - „$45^\circ$ ist immer am besten.“ – Nur für $h_0 = 0$ und ohne Luftwiderstand.
