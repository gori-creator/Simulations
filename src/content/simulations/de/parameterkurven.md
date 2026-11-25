## Worum geht es?

Bisher beschreiben wir Kurven meist als Funktionsgraph $y = f(x)$. Viele Kurven lassen sich so aber nicht darstellen, zum Beispiel ein Kreis oder eine Schleife. Ihnen hilft ein **Parameter** $t$: Für jeden Wert von $t$ gibt man **beide** Koordinaten an.

$$P(t) = \big(x(t) \mid y(t)\big)$$

Läuft $t$, wandert der Punkt und zeichnet die Kurve. Oft ist $t$ die **Zeit**. Dann beschreibt die Parameterdarstellung nicht nur die Bahn, sondern auch, **wann** der Punkt wo ist.

### Die Wurfparabel

Ein Ball wird mit der Geschwindigkeit $v_0$ unter dem Winkel $\alpha$ aus der Höhe $h$ geworfen. Waagerecht fliegt er gleichmäßig weiter, senkrecht bremst ihn die Erdbeschleunigung $g \approx 9{,}81\,\tfrac{\text{m}}{\text{s}^2}$:

$$x(t) = v_0 \cos\alpha \cdot t, \qquad y(t) = h + v_0 \sin\alpha \cdot t - \tfrac{g}{2}\, t^2$$

Löst man die erste Gleichung nach $t$ auf und setzt sie in die zweite ein (**den Parameter eliminieren**), erhält man die Bahngleichung, eine Parabel:

$$y = h + \tan\alpha \cdot x - \frac{g}{2 v_0^2 \cos^2\alpha}\, x^2$$

Ohne Luftwiderstand fliegt ein Ball vom Boden aus bei $45°$ am weitesten, nämlich $\tfrac{v_0^2}{g}$.

### Weitere Parameterkurven

- **Kreis** um den Ursprung: $x = r\cos t$, $y = r\sin t$. Eliminiert man $t$, ergibt sich $x^2 + y^2 = r^2$.
- **Ellipse:** $x = a\cos t$, $y = b\sin t$, also $\tfrac{x^2}{a^2} + \tfrac{y^2}{b^2} = 1$.
- **Lissajous-Figur:** $x = \sin(m t + \varphi)$, $y = \sin(n t)$ überlagert zwei Schwingungen. Man sieht sie zum Beispiel auf einem Oszilloskop.
- **Zykloide:** Das ist die Bahn eines Punktes auf einem rollenden Rad, $x = a(t - \sin t)$ und $y = a(1 - \cos t)$.

### Polarkoordinaten

Statt $(x \mid y)$ beschreibt man einen Punkt durch seinen **Abstand** $r$ vom Ursprung und den **Winkel** $\varphi$ zur positiven $x$-Achse. Umgerechnet wird so:

$$x = r\cos\varphi, \quad y = r\sin\varphi \qquad\text{bzw.}\qquad r = \sqrt{x^2 + y^2}$$

Eine Kurve in Polarkoordinaten gibt $r$ in Abhängigkeit von $\varphi$ an. Der Winkel ist hier der Parameter:

- Ein **Kreis** ist $r = a$.
- Die **archimedische Spirale** ist $r = c\,\varphi$. Der Abstand wächst gleichmäßig mit dem Winkel.
- Die **Rosenkurve** ist $r = a\cos(k\varphi)$. Bei ungeradem $k$ hat sie $k$ Blätter, bei geradem $k$ hat sie $2k$ Blätter.
- Die **Kardioide** (Herzkurve) ist $r = \tfrac{a}{2}(1 + \cos\varphi)$.
- Die **Lemniskate** ist $r^2 = a^2 \cos(2\varphi)$. Wo $\cos(2\varphi) < 0$ ist, gibt es keinen Punkt.

## Ausprobieren

- [Ballwurf](?mode=wurf&v0=12&al=40&h=1.5&u=0.4): Verändere den Parameter. Wie verhält sich der Geschwindigkeitspfeil am Gipfel?
- [45° vom Boden](?mode=wurf&v0=15&al=45&h=0&u=0.5): Bei welchem Winkel fliegt der Ball am weitesten? Gilt das auch aus 10 m Höhe?
- [Lissajous 3 : 2](?mode=kurve&kt=lissajous&fa=3&fb=2&ph=90&u=1): Ändere die Frequenzen und die Phase.
- [Zykloide](?mode=kurve&kt=zykloide&a=1.5&u=0.6): Verfolge den Punkt auf dem rollenden Rad.
- [Rose mit k = 3](?mode=polar&pk=rose&ra=4&k=3&u=0.7): Wie viele Blätter entstehen bei k = 2 und bei k = 4?

## Aufgaben

**1. Wurf vom Boden.** Ein Ball wird mit $v_0 = 15\,\tfrac{\text{m}}{\text{s}}$ unter $45°$ vom Boden geworfen. Wie weit fliegt er? [Aufgabe laden](?mode=wurf&v0=15&al=45&h=0&u=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$y(t) = 0$ ergibt $t = \tfrac{2 v_0 \sin 45°}{g} \approx 2{,}16\,\text{s}$. Die Wurfweite ist dann $x = v_0 \cos 45° \cdot t = \tfrac{v_0^2}{g} \approx 22{,}9\,\text{m}$.

</details>

**2. Parameter eliminieren.** Zeige, dass $x = 4\cos t$, $y = 2\sin t$ eine Ellipse beschreibt. [Aufgabe laden](?mode=kurve&kt=ellipse&a=4&b=2&u=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\cos t = \tfrac{x}{4}$ und $\sin t = \tfrac{y}{2}$. Wegen $\cos^2 t + \sin^2 t = 1$ folgt $\tfrac{x^2}{16} + \tfrac{y^2}{4} = 1$.

</details>

**3. Polarkoordinaten.** Gib den Punkt mit $r = 2$ und $\varphi = 120°$ in kartesischen Koordinaten an.

<details><summary>Lösung anzeigen</summary>

$x = 2\cos 120° = -1$ und $y = 2\sin 120° = \sqrt{3} \approx 1{,}73$.

</details>

**4. Rosenkurve.** Wie viele Blätter hat $r = 4\cos(2\varphi)$? [Aufgabe laden](?mode=polar&pk=rose&ra=4&k=2&u=1&_hide=1)

<details><summary>Lösung anzeigen</summary>

Vier Blätter, denn bei geradem $k$ sind es $2k$ Blätter.

</details>
