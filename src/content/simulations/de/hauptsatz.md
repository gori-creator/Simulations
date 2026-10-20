---
description: "Interaktive Simulation für Oberstufe und Studium: Integralfunktion und Hauptsatz der Differential- und Integralrechnung – Fläche von a bis x, Streifen h → 0, Berechnen mit F(b) − F(a), Zusammenhang der Graphen von f und I, Riemann-Summen und acht Anwendungen von Weg bis Regenmenge."
---

## Worum geht es?

Hält man die untere Grenze $a$ fest und lässt die obere Grenze $x$ variieren, wird das Integral zu einer Funktion von $x$, der **Integralfunktion**

$$I_a(x) = \int_a^x f(t)\,dt.$$

Sie misst die **orientierte Fläche** (Flächenbilanz) zwischen dem Graphen von $f$ und der $x$-Achse: Teile oberhalb zählen positiv (grün), Teile unterhalb negativ (rot). Es gilt immer $I_a(a) = 0$. Ist $x < a$, wird „rückwärts“ gezählt und das Vorzeichen dreht sich um. Der **Flächeninhalt** ist dagegen $A^+ + A^-$.

**Hauptsatz der Differential- und Integralrechnung** (für stetiges $f$):

1. $I_a'(x) = f(x)$. Wächst $x$ um $h$, kommt ein Streifen dazu. Seine Fläche ist $I_a(x+h) - I_a(x)$, seine **mittlere Höhe** liegt zwischen dem kleinsten und dem größten Funktionswert auf dem Streifen:
$$\min f \;\le\; \frac{I_a(x+h) - I_a(x)}{h} \;\le\; \max f.$$
Für $h \to 0$ rücken $\min f$ und $\max f$ beide an $f(x)$ heran – die Sekantensteigung von $I_a$ wird zur Tangentensteigung $f(x)$.
2. Ist $F$ irgendeine Stammfunktion von $f$, dann gilt
$$\int_a^b f(x)\,dx = F(b) - F(a) = \bigl[F(x)\bigr]_a^b.$$
Eine Konstante $C$ kürzt sich heraus: $(F(b) + C) - (F(a) + C) = F(b) - F(a)$.

**Folgen für den Graphen von $I_a$:** Wo $f > 0$ ist, steigt $I_a$; wo $f < 0$ ist, fällt $I_a$. Nullstellen von $f$ mit Vorzeichenwechsel sind Extremstellen von $I_a$, Extremstellen von $f$ sind Wendestellen von $I_a$. Ein anderes $a$ verschiebt den Graphen nur senkrecht: $I_b(x) = I_a(x) - I_a(b)$.

**Riemann-Summen:** Teilt man $[a; b]$ in $n$ Streifen der Breite $h = \frac{b-a}{n}$, nähert die Summe der Rechteck- bzw. Trapezflächen das Integral an. Für $n \to \infty$ streben alle gegen $\int_a^b f(x)\,dx$ – Mittelpunkt- und Trapezsumme besonders schnell.

**Anwendungen:** Integriert man eine **Änderungsrate**, erhält man die **Gesamtänderung des Bestands**: Geschwindigkeit → Weg, Zufluss → Wassermenge, Leistung → Energie, Grenzkosten → Kosten, Wachstumsrate → Zuwachs, Aufnahmerate → Wirkstoffmenge, Regenintensität → Regenmenge, Luftstrom → Luftmenge.

## Ausprobieren

1. [Parabel](?mode=area&a=-1&x=2): Drücke „Fläche wachsen lassen“ und beobachte, wie der orange Graph von $I_{-1}$ mitwächst. Wo steigt er, wo fällt er?
2. Ziehe $x$ links von $a$. Warum ändert sich das Vorzeichen, obwohl die Fläche gleich aussieht?
3. [Streifen h → 0](?mode=diff&x=2&h=1): Drücke „h gegen 0 gehen lassen“. Was passiert mit der Sekante unten, was mit min und max oben? Vergleiche die Tabelle.
4. [Rechenweg](?mode=calc&fn=sin&a=0&x=3.14): Lass den Rechenweg Schritt für Schritt laufen. Verändere dann die Konstante $C$ – warum bleibt das Ergebnis gleich?
5. [Polynom 3. Grades](?mode=graph&k3=0.25&k2=0&k1=-1&k0=0&a=-3&x=3): Suche die Hoch-, Tief- und Wendepunkte von $I_{-3}$ im Graphen von $f$. Drücke „untere Grenze a wandern lassen“.
6. [Sprungstelle](?fn=step&a=-2&x=3): $I$ ist stetig, hat aber an der Sprungstelle einen Knick – dort ist $I$ nicht differenzierbar.
7. [Riemann-Summen für x²](?mode=riem&k2=1&k0=0&a=0&x=2&n=4): Wechsle zwischen links, rechts, Mitte und Trapez, dann „Streifen verfeinern“.
8. Anwendungen: [Auto](?kind=app&app=car&a=0&x=25), [Solaranlage](?kind=app&app=solar&a=0&x=24), [Stausee](?mode=graph&kind=app&app=lake&a=0&x=12), [Medikament](?mode=graph&kind=app&app=drug&a=0&x=8), [Gewitter](?mode=riem&kind=app&app=rain&a=0&x=6&n=6&rm=mid), [Atemzug](?kind=app&app=breath&a=0&x=5). Was bedeutet die Fläche jeweils, und welche Einheit hat sie?

## Aufgaben

### Aufgabe 1: Mit Stammfunktion berechnen

Berechne $\int_{-1}^{2} (0{,}5x^2 - 1)\,dx$ und den Flächeninhalt zwischen Graph und $x$-Achse auf $[-1; 2]$. [Aufgabe laden](?mode=calc&a=-1&x=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F(x) = \frac{1}{6}x^3 - x$; $F(2) - F(-1) = \left(\frac{8}{6} - 2\right) - \left(-\frac{1}{6} + 1\right) = -\frac{2}{3} - \frac{5}{6} = -1{,}5$. Nullstelle bei $\sqrt{2}$: $A^- = |F(\sqrt 2) - F(-1)| = \frac{2\sqrt2}{3} + \frac56 \approx 1{,}776$, $A^+ = F(2) - F(\sqrt 2) \approx 0{,}276$, Flächeninhalt $\approx 2{,}052$. [Lösung zeigen](?mode=area&a=-1&x=2)

</details>

### Aufgabe 2: Zwei berühmte Integrale

Berechne $\int_0^{\pi} \sin x\,dx$ und $\int_1^{e} \frac{1}{x}\,dx$. [Aufgabe laden](?mode=calc&fn=sin&a=0&x=3.14&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$[-\cos x]_0^{\pi} = -\cos\pi + \cos 0 = 1 + 1 = 2$. $[\ln x]_1^{e} = \ln e - \ln 1 = 1$. [Sinus zeigen](?mode=calc&fn=sin&a=0&x=3.14) · [1/x zeigen](?mode=calc&fn=inv&a=1&x=2.72)

</details>

### Aufgabe 3: Integralfunktion untersuchen

Wo hat $I_{-1}(x) = \int_{-1}^x (0{,}5t^2 - 1)\,dt$ Extrem- und Wendestellen? [Aufgabe laden](?mode=graph&a=-1&x=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$I_{-1}'(x) = f(x) = 0{,}5x^2 - 1 = 0 \Rightarrow x = \pm\sqrt{2}$. Bei $-\sqrt2$ wechselt $f$ von $+$ nach $-$: Hochpunkt; bei $\sqrt2$ von $-$ nach $+$: Tiefpunkt. $f$ hat bei $x = 0$ seinen Tiefpunkt, also hat $I_{-1}$ dort eine Wendestelle. [Zeigen](?mode=graph&a=-1&x=2)

</details>

### Aufgabe 4: Wie weit fährt das Auto?

Ein Auto fährt 5 s lang mit $v(t) = 3t$ (in m/s) an, fährt dann 15 s mit $15\,\tfrac{\text{m}}{\text{s}}$ und bremst in 5 s gleichmäßig bis zum Stillstand. Berechne den Weg. [Aufgabe laden](?kind=app&app=car&a=0&x=25&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Dreieck $\frac12 \cdot 5 \cdot 15 = 37{,}5\,\text{m}$, Rechteck $15 \cdot 15 = 225\,\text{m}$, Dreieck $37{,}5\,\text{m}$; zusammen $300\,\text{m}$. [Zeigen](?kind=app&app=car&a=0&x=25)

</details>

### Aufgabe 5: Grenzkosten und Fixkosten

Die Grenzkosten sind $K'(x) = 0{,}3x^2 - 3x + 10$ (GE pro ME), die Fixkosten $20$ GE. Bestimme $K(10)$ und die Stelle, an der $K$ von rechts- in linksgekrümmt übergeht. [Aufgabe laden](?mode=calc&kind=app&app=cost&a=0&x=10&c=20&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$K(x) = 0{,}1x^3 - 1{,}5x^2 + 10x + 20$, also $K(10) = 100 - 150 + 100 + 20 = 70$ GE (davon $50$ GE variable Kosten). $K''(x) = 0{,}6x - 3 = 0 \Rightarrow x = 5$: Am Minimum der Grenzkosten hat $K$ seine Wendestelle (Kostenkehre). [Zeigen](?mode=calc&kind=app&app=cost&a=0&x=10&c=20)

</details>

### Aufgabe 6: Riemann-Summen

Berechne für $f(x) = x^2$ auf $[0; 2]$ mit $n = 4$ die linke, rechte, Mittelpunkt- und Trapezsumme und vergleiche mit dem Integral. [Aufgabe laden](?mode=riem&k2=1&k0=0&a=0&x=2&n=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$h = 0{,}5$. Links: $0{,}5 \cdot (0 + 0{,}25 + 1 + 2{,}25) = 1{,}75$; rechts: $0{,}5 \cdot (0{,}25 + 1 + 2{,}25 + 4) = 3{,}75$; Mitte: $0{,}5 \cdot (0{,}0625 + 0{,}5625 + 1{,}5625 + 3{,}0625) = 2{,}625$; Trapez: $\frac{1{,}75 + 3{,}75}{2} = 2{,}75$. Exakt: $\frac{8}{3} \approx 2{,}667$ – die Mittelpunktsumme liegt nur halb so weit daneben wie die Trapezsumme. [Zeigen](?mode=riem&k2=1&k0=0&a=0&x=2&n=4)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 12 (Integralfunktion, Hauptsatz, Flächenbilanz) im LehrplanPLUS Gymnasium Bayern, dazu Analysis im ersten Studienjahr – bitte am Lehrplan prüfen. Die Ansichten lassen sich als Abfolge nutzen: Integralfunktion → Ableitung (Beweisidee) → Berechnen → Kurvendiskussion von $I_a$ → Riemann-Summen als Ausblick oder Wiederholung.
- **Anwendungen:** Die acht Beispiele zeigen „Änderungsrate integrieren ergibt Bestandsänderung“ mit Einheiten (m/s · s = m, kW · h = kWh). Gut für Gruppenarbeit: Jede Gruppe stellt eine Anwendung vor und deutet Nullstellen und Extrema von $f$ im Sachzusammenhang.
- **Aufgaben aus dem Bild:** Mit „Werte zeigen“ aus (`show=0`) eignen sich die Bilder als Rechenaufgaben.
- **Häufige Stolpersteine:**
  - Integral und Flächeninhalt werden verwechselt, wenn $f$ das Vorzeichen wechselt.
  - Integralfunktion und Stammfunktion werden gleichgesetzt: Jede Integralfunktion hat eine Nullstelle, $F(x) = x^2 + 1$ zu $f(x) = 2x$ hat keine.
  - Bei $F(b) - F(a)$ wird die Reihenfolge vertauscht oder bei negativem $F(a)$ die Klammer vergessen.
  - Der Hauptsatz setzt Stetigkeit voraus – an einer Sprungstelle hat $I$ einen Knick.
