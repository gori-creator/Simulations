## Worum geht es?

In einer **Wellenwanne** tauchen zwei Erreger $E_1$ und $E_2$ im Abstand $d$ im gleichen Takt ins Wasser. Jeder erzeugt **Kreiswellen** mit derselben Wellenlänge $\lambda = \frac{c}{f}$. Wo sich die Wellen treffen, addieren sich ihre Auslenkungen (**Superposition**): $y = y_1 + y_2$.

Ob sie sich in einem Punkt $P$ verstärken oder auslöschen, hängt nur von den Wegstrecken $s_1$ und $s_2$ ab, die die Wellen bis $P$ zurücklegen, genauer vom **Gangunterschied**

$$
\Delta s = s_1 - s_2 .
$$

Bei gleichphasigen Erregern gilt:

- **Maximum** (konstruktive Interferenz): $\Delta s = k \cdot \lambda$ – Berg trifft auf Berg, Tal auf Tal, die Amplitude ist $2\hat y$.
- **Minimum** (destruktive Interferenz): $\Delta s = \left(k + \tfrac{1}{2}\right) \cdot \lambda$ – Berg trifft auf Tal, das Wasser bleibt in Ruhe.

Dabei ist $k = 0, \pm 1, \pm 2, \dots$ die **Ordnung**. Allgemein schwingt $P$ mit der Amplitude

$$
A = 2\hat y \cdot \left|\cos\frac{\delta}{2}\right| \quad \text{mit} \quad \delta = 2\pi \cdot \frac{\Delta s}{\lambda} + \Delta\varphi ,
$$

wobei $\Delta\varphi$ der Phasenunterschied der Erreger ist. Im **Zeigerdiagramm** sieht man das direkt: Die beiden Zeiger der Länge $\hat y$ werden aneinandergehängt; ihre Summe ist lang, wenn sie in dieselbe Richtung zeigen, und null, wenn sie entgegengesetzt sind.

Alle Punkte mit demselben Gangunterschied liegen auf einer **Hyperbel** mit den Brennpunkten $E_1$ und $E_2$. Deshalb sieht man im Wasser ruhige **Knotenlinien** und stark bewegte **Bauchlinien**, die wie ein Fächer auseinanderlaufen. Weil nach der Dreiecksungleichung $|\Delta s| \le d$ ist, gibt es nur endlich viele: Bei gleichphasigen Erregern ist $|k| \le \frac{d}{\lambda}$. Für $d = 3\lambda$ sind das die $7$ Bauchlinien $k = -3, \dots, 3$; die äußersten liegen auf der Verbindungsachse außerhalb der Erreger.

**Fernfeld:** Weit weg von den Erregern nähern sich die Hyperbeln Geraden durch die Mitte. Für ihre Richtung gilt

$$
\sin \alpha_k = \frac{\Delta s_k}{d} = k \cdot \frac{\lambda}{d} .
$$

Genau diese Formel begegnet dir beim **Doppelspalt** mit Licht wieder.

**Zur Darstellung:** Im **Momentbild** sind Wellenberge hell und Täler dunkel. Das **Amplitudenbild** zeigt, wie stark das Wasser an jeder Stelle im Mittel schwingt: dunkel = Knoten, hell = Bauch. Die Wellen schwingen in Wirklichkeit mit etwa $10\,\text{Hz}$; im Bild laufen sie stark verlangsamt (oben rechts steht, wie stark). Die Dämpfung der Wellen wird vernachlässigt.

## Ausprobieren

1. Drücke „Wellen neu starten“. Wo entsteht das Muster zuerst? Ab wann ändert es sich nicht mehr?
2. Ziehe den Korken $P$ (den Messpunkt) auf eine ruhige Linie und lies $\Delta s$ ab. Wiederhole das auf einer anderen ruhigen Linie. Was fällt dir auf?
3. Schalte auf das Amplitudenbild um und blende beide Linienarten ein. [Beispiel laden](?view=amp&lines=both)
4. Ziehe $E_2$ langsam nach außen. Wie viele Bauchlinien gibt es bei $d = 2\lambda$, $3\lambda$, $4\lambda$? Was passiert, wenn eine neue Linie „geboren“ wird?
5. Mach $d$ kleiner als $\frac{\lambda}{2}$. Warum verschwinden alle Knotenlinien? [d < λ/2](?d=0.8&lam=2.4&lines=both&view=amp)
6. Stelle $\Delta\varphi = 180°$ ein. Was passiert auf der Mittelsenkrechten? Beobachte dazu das Zeigerdiagramm. [Gegenphasig](?ph=180&lines=both&px=0&py=12)
7. Blende das Fernfeld ein und vergleiche die gestrichelten Richtungen mit den Hyperbeln weit oben. [Fernfeld](?d=4&lam=1.2&lines=max&far=1&view=amp&px=7&py=15)

## Aufgaben

### Aufgabe 1: Maximum oder Minimum?

Die Erreger sind $6\,\text{cm}$ voneinander entfernt und schwingen gleichphasig mit $\lambda = 2\,\text{cm}$. Der Punkt $P$ liegt $8\,\text{cm}$ senkrecht über $E_2$. Bestimme $s_1$, $s_2$ und $\Delta s$. Wie schwingt das Wasser in $P$? [Aufgabe laden](?px=3&py=8&val=0&lines=none&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$s_2 = 8\,\text{cm}$, $s_1 = \sqrt{(6\,\text{cm})^2 + (8\,\text{cm})^2} = 10\,\text{cm}$, also $\Delta s = 2\,\text{cm} = 1 \cdot \lambda$. $P$ liegt auf der Bauchlinie erster Ordnung und schwingt mit der Amplitude $2\hat y$. [In der Simulation zeigen](?px=3&py=8&lines=max)

</details>

### Aufgabe 2: Teilweise Verstärkung

Wie Aufgabe 1, aber mit $\lambda = 1{,}6\,\text{cm}$. Berechne die Amplitude in $P$. [Aufgabe laden](?px=3&py=8&lam=1.6&val=0&lines=none&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{\Delta s}{\lambda} = \frac{2\,\text{cm}}{1{,}6\,\text{cm}} = 1{,}25$, also $\delta = 2{,}5\pi$ und $A = 2\hat y \cdot |\cos(1{,}25\pi)| \approx 1{,}41\,\hat y$. Die Zeiger stehen senkrecht aufeinander. [In der Simulation zeigen](?px=3&py=8&lam=1.6)

</details>

### Aufgabe 3: Linien zählen

Wie viele Bauch- und Knotenlinien gibt es bei $d = 7\,\text{cm}$ und $\lambda = 2\,\text{cm}$ (gleichphasig)? [Aufgabe laden](?d=7&lines=none&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Bauchlinien: $|k| \le \frac{7}{2} = 3{,}5$, also $k = -3, \dots, 3$: $7$ Linien. Knotenlinien: $|\Delta s| = 1, 3, 5, 7\,\text{cm} \le d$, also $8$ Linien – die beiden mit $|\Delta s| = 7\,\text{cm} = d$ liegen auf der Verbindungsachse außerhalb der Erreger. [In der Simulation zeigen](?d=7&lines=both&view=amp)

</details>

### Aufgabe 4: Gegenphasige Erreger

Was ändert sich in Aufgabe 1, wenn $E_2$ gegenphasig schwingt ($\Delta\varphi = 180°$)? Welche Linie liegt jetzt auf der Mittelsenkrechten?

<details>
<summary>Lösung anzeigen</summary>

Der zusätzliche Phasenunterschied $\pi$ vertauscht Maxima und Minima: In $P$ ist $\delta = 2\pi + \pi$, also $A = 0$. Auf der Mittelsenkrechten ($\Delta s = 0$) liegt jetzt eine Knotenlinie. Bauchlinien gibt es für $\Delta s = \pm 1, \pm 3, \pm 5\,\text{cm}$, also $6$ Stück. [In der Simulation zeigen](?ph=180&px=3&py=8&lines=both)

</details>

### Aufgabe 5: Fernfeld

Bei $d = 4\,\text{cm}$ und $\lambda = 1{,}2\,\text{cm}$: Unter welchen Winkeln zur Mittelsenkrechten liegen weit weg die Bauchlinien? Wie viele gibt es insgesamt? [Aufgabe laden](?d=4&lam=1.2&lines=none&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\sin\alpha_k = k \cdot \frac{1{,}2}{4} = 0{,}3 \cdot k$: $\alpha_1 \approx 17{,}5°$, $\alpha_2 \approx 36{,}9°$, $\alpha_3 \approx 64{,}2°$. Für $k = 4$ wäre $\sin\alpha > 1$. Insgesamt $7$ Bauchlinien ($k = -3, \dots, 3$). [In der Simulation zeigen](?d=4&lam=1.2&lines=max&far=1&view=amp)

</details>

### Aufgabe 6: Wellenlänge messen

In einer Wellenwanne mit $d = 5\,\text{cm}$ misst man weit weg das erste Maximum unter $\alpha_1 = 23{,}6°$. Bestimme $\lambda$ und mit $c = 20\,\frac{\text{cm}}{\text{s}}$ die Frequenz der Erreger.

<details>
<summary>Lösung anzeigen</summary>

$\lambda = d \cdot \sin\alpha_1 = 5\,\text{cm} \cdot 0{,}400 \approx 2{,}0\,\text{cm}$, $f = \frac{c}{\lambda} = 10\,\text{Hz}$. So bestimmt man später auch die Wellenlänge von Licht am Doppelspalt. [Prüfen](?d=5&lam=2&lines=max&far=1&view=amp)

</details>

### Aufgabe 7: Phasenverschiebung verschiebt das Muster

Wie in Aufgabe 1 ist $d = 6\,\text{cm}$ und $\lambda = 2\,\text{cm}$. Jetzt eilt $E_2$ aber dem Erreger $E_1$ um $\Delta\varphi = 90°$ voraus. Bei welchem Gangunterschied liegt die Bauchlinie, die vorher auf der Mittelsenkrechten lag? Liegt sie jetzt näher an $E_1$ oder an $E_2$? Wie viele Bauchlinien gibt es? [Aufgabe laden](?ph=90&lines=none&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Maximum heißt $\delta = 2\pi \cdot \frac{\Delta s}{\lambda} + \frac{\pi}{2} = k \cdot 2\pi$, also $\Delta s = \left(k - \tfrac{1}{4}\right) \cdot \lambda$. Für $k = 0$ ist $\Delta s = -0{,}5\,\text{cm}$: Dort ist $s_1$ um $0{,}5\,\text{cm}$ kürzer als $s_2$. Die Linie ist also zu $E_1$ hin gerückt, zu dem Erreger, der nachhinkt. Seine Welle hat einen kürzeren Weg und holt so die Viertelperiode auf. Bauchlinien gibt es für $\Delta s = -4{,}5;\ -2{,}5;\ -0{,}5;\ 1{,}5;\ 3{,}5;\ 5{,}5\,\text{cm}$, also $6$ Stück. Das Muster ist nicht mehr symmetrisch. [In der Simulation zeigen](?ph=90&lines=max&view=amp)

</details>

## Ideen für den Unterricht

- **Einsatz:** In der Oberstufe beim Thema Interferenz mechanischer Wellen, als Vorbereitung auf den Doppelspalt und das Gitter. Gut als Ergänzung zum Realexperiment in der Wellenwanne: Was dort schnell und flüchtig ist, lässt sich hier anhalten, verlangsamen und vermessen. Die Zuordnung zu einer bestimmten Klassenstufe hängt vom Lehrplan ab.
- **Vorschlag für den Ablauf:** zuerst das Momentbild beobachten und die ruhigen Linien finden lassen, dann mit dem Messpunkt die Bedingung $\Delta s = (k + \frac{1}{2}) \cdot \lambda$ selbst entdecken, erst danach das Amplitudenbild und die Hyperbeln zeigen. Mit „Werte im Bild anzeigen“ aus (`val=0`) lassen sich Messaufgaben stellen.
- **Modell:** gleich große Amplituden, keine Dämpfung, ideale Punktquellen. In der echten Wellenwanne nimmt die Amplitude mit dem Abstand ab; die Knotenlinien sind dann nicht ganz in Ruhe.
- **Häufige Stolpersteine:**
  - „Auf den Knotenlinien gibt es keine Wellen.“ – Beide Wellen laufen dort hindurch, sie heben sich nur gegenseitig auf.
  - „Der Gangunterschied ist der Abstand zwischen den Erregern.“ – $\Delta s$ ist der Unterschied der Wege zum Punkt $P$; nur auf der Verbindungsachse außerhalb der Erreger ist $|\Delta s| = d$.
  - „Mehr Abstand, gleiche Linien, nur weiter auseinander.“ – Mit größerem $d$ entstehen zusätzliche Linien, ihre Zahl hängt von $\frac{d}{\lambda}$ ab.
  - „Interferenz geht mit beliebigen Wellen.“ – Ein stabiles Muster gibt es nur bei gleicher Frequenz und festem Phasenunterschied (Kohärenz).
- **Weiterführend:** Doppelspalt und Gitter mit Licht, Interferenz von Schall (zwei Lautsprecher), Gegenschall in Kopfhörern.
