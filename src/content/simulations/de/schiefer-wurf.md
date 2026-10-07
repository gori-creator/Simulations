---
description: Interaktive Simulation zum waagerechten und schiefen Wurf – Wurfbahn, Wurfweite, Steighöhe und Flugzeit auf Erde, Mond und Mars, mit und ohne Luftwiderstand.
---

## Worum geht es?

Ein geworfener Ball führt zwei Bewegungen **gleichzeitig** aus, die sich nicht gegenseitig stören (**Superpositionsprinzip**):

- **waagerecht:** eine gleichförmige Bewegung mit $v_x = v_0 \cdot \cos\alpha$,
- **senkrecht:** einen senkrechten Wurf nach oben mit $v_{y,0} = v_0 \cdot \sin\alpha$, der durch die Fallbeschleunigung $g$ gebremst wird.

$$
x(t) = v_0 \cos\alpha \cdot t \qquad y(t) = h_0 + v_0 \sin\alpha \cdot t - \tfrac{1}{2} g t^2
$$

Eliminiert man $t$, erhält man die **Bahnkurve** – eine Parabel:

$$
y = h_0 + \tan\alpha \cdot x - \frac{g}{2 v_0^2 \cos^2\alpha} \cdot x^2
$$

Für einen Abwurf vom Boden ($h_0 = 0$) gilt:

$$
T = \frac{2 v_0 \sin\alpha}{g} \qquad w = \frac{v_0^2 \sin(2\alpha)}{g} \qquad h_{\max} = \frac{v_0^2 \sin^2\alpha}{2g}
$$

Die größte Wurfweite erreicht man dann bei $\alpha = 45^\circ$. Zwei Winkel, die sich zu $90^\circ$ ergänzen (z. B. $30^\circ$ und $60^\circ$), ergeben dieselbe Wurfweite.

Beim **waagerechten Wurf** ($\alpha = 0^\circ$) aus der Höhe $h_0$ dauert der Flug genauso lange wie ein freier Fall: $T = \sqrt{2h_0/g}$.

## Ausprobieren

1. Ziehe die Spitze des orangefarbenen Pfeils, um $v_0$ und $\alpha$ zu ändern, und drücke **Werfen**.
2. Beobachte die Positionen in gleichen Zeitabständen: Waagerecht sind die Abstände immer gleich – senkrecht nicht. Warum?
3. Bei welchem Winkel fliegt der Ball am weitesten? [Vergleich der Winkel](?family=1&angle=45)
4. Wirf auf dem Mond und auf dem Mars. [Mond](?planet=mond&angle=45&v0=10)
5. Schalte den Luftwiderstand ein. Wie verändert sich die Form der Bahn? [Fußball](?air=1&v0=28&angle=35)

## Aufgaben

### Aufgabe 1: Wurfweite berechnen

Ein Ball wird vom Boden mit $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$ unter $45^\circ$ geworfen ($g = 9{,}81\,\tfrac{\text{m}}{\text{s}^2}$). Berechne Flugzeit, Wurfweite und Steighöhe. [Aufgabe laden](?v0=15&angle=45&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$T = \frac{2 \cdot 15 \cdot \sin 45^\circ}{9{,}81} \approx 2{,}16\,\text{s} \qquad w = \frac{15^2 \cdot \sin 90^\circ}{9{,}81} \approx 22{,}9\,\text{m} \qquad h_{\max} = \frac{15^2 \cdot \sin^2 45^\circ}{2 \cdot 9{,}81} \approx 5{,}7\,\text{m}$$

</details>

### Aufgabe 2: Gleiche Wurfweite

Zeige mit der Formel für $w$, dass $30^\circ$ und $60^\circ$ dieselbe Wurfweite ergeben. Welche Bahn ist höher und welche dauert länger? [Vergleich zeigen](?family=1&angle=30)

<details>
<summary>Lösung anzeigen</summary>

$\sin(2 \cdot 30^\circ) = \sin 60^\circ = \sin 120^\circ = \sin(2 \cdot 60^\circ)$, also gleiche Weite. Beim $60^\circ$-Wurf ist $v_{y,0}$ größer: Die Bahn ist dreimal so hoch ($\sin^2 60^\circ : \sin^2 30^\circ = 3$) und der Flug dauert länger ($\sin 60^\circ : \sin 30^\circ \approx 1{,}73$).

</details>

### Aufgabe 3: Waagerechter Wurf vom Turm

Ein Stein wird von einem $20\,\text{m}$ hohen Turm waagerecht mit $8\,\tfrac{\text{m}}{\text{s}}$ geworfen. Wann und wo trifft er auf? Wie schnell ist er dann? [Aufgabe laden](?v0=8&angle=0&h0=20&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T = \sqrt{2 \cdot 20 / 9{,}81} \approx 2{,}02\,\text{s}$, $w = 8 \cdot 2{,}02 \approx 16{,}2\,\text{m}$. Beim Aufprall ist $v_y = 9{,}81 \cdot 2{,}02 \approx 19{,}8\,\tfrac{\text{m}}{\text{s}}$, also

$$v = \sqrt{8^2 + 19{,}8^2} \approx 21{,}4\,\tfrac{\text{m}}{\text{s}}.$$

</details>

### Aufgabe 4: Auf dem Mond

Auf dem Mond ist $g = 1{,}62\,\tfrac{\text{m}}{\text{s}^2}$. Wie viel weiter fliegt derselbe Ball (ohne Luftwiderstand) als auf der Erde?

<details>
<summary>Lösung anzeigen</summary>

Die Wurfweite ist umgekehrt proportional zu $g$: $\frac{9{,}81}{1{,}62} \approx 6{,}1$. Der Ball fliegt etwa sechsmal so weit – und auch sechsmal so hoch und sechsmal so lange. [In der Simulation zeigen](?planet=mond&angle=45&v0=10)

</details>

### Aufgabe 5: Luftwiderstand

Vergleiche die Bahn mit und ohne Luftwiderstand. Nenne drei Unterschiede. [Fußball mit Luftwiderstand](?air=1&v0=28&angle=35)

<details>
<summary>Lösung anzeigen</summary>

Mit Luftwiderstand ist die Bahn keine Parabel mehr: Der Ball fliegt deutlich weniger weit und weniger hoch, der höchste Punkt liegt weiter hinten, und der Ball kommt steiler herunter. Außerdem ist der beste Abwurfwinkel kleiner als $45^\circ$.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Mechanik der Oberstufe (Superposition von Bewegungen), je nach Lehrplan Jahrgangsstufe 10 oder 11.
- **Darstellung:** Die Stroboskop-Punkte zeigen die gleichförmige waagerechte Bewegung besonders deutlich. Mit **Zeitlupe** und **Abspielen/Anhalten** lassen sich einzelne Momente besprechen; der Bereich **Momentan** zeigt $t$, $x$, $y$ und $v$.
- **Luftwiderstand:** Modell mit quadratischem Luftwiderstand für einen Fußball ($m = 0{,}43\,\text{kg}$, $d = 22\,\text{cm}$, $c_w \approx 0{,}25$). Auf dem Mond gibt es keine Luft, auf dem Mars ist die Luftdichte etwa 60-mal kleiner.
- **Typische Fehlvorstellungen:**
  - „Im höchsten Punkt ist die Geschwindigkeit null.“ – Nur $v_y$ ist null, $v_x$ bleibt erhalten.
  - „Ein schneller waagerecht geworfener Ball fällt langsamer.“ – Die Fallzeit hängt nur von $h_0$ ab.
- **Bilder:** Hintergründe und Ball können durch Fotos ergänzt werden (siehe `docs/BILDER.md`).
