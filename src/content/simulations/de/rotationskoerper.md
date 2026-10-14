---
description: "Rotationskörper: Die Fläche unter einem Graphen dreht sich um die x-Achse, wird in Zylinderscheiben zerlegt, und aus der Scheibensumme entsteht das Volumenintegral V = π∫f(x)² dx."
---

## Worum geht es?

Dreht sich die Fläche zwischen dem Graphen einer Funktion $f$ und der $x$-Achse im Intervall $[a; b]$ einmal ganz um die $x$-Achse, so entsteht ein **Rotationskörper**. Aus einem Rechteck wird ein Zylinder, aus einem Dreieck ein Kegel, aus einem Halbkreis eine Kugel.

### Querschnitt an der Stelle x

Schneidet man den Körper senkrecht zur Achse an der Stelle $x$ auf, sieht man einen **Kreis** mit dem Radius $|f(x)|$. Sein Flächeninhalt ist

$$
A(x) = \pi \cdot \big(f(x)\big)^2 .
$$

### Scheibenmethode

Zerlegt man $[a; b]$ in $n$ gleich breite Streifen der Breite $\Delta x = \tfrac{b - a}{n}$, wird jeder Streifen beim Drehen zu einer dünnen **Zylinderscheibe** mit dem Radius $r_i$ und dem Volumen $\pi r_i^2 \cdot \Delta x$. Die Summe

$$
V_n = \sum_{i=1}^{n} \pi \, r_i^2 \cdot \Delta x
$$

ist eine Näherung für das Volumen. Nimmt man als Radius den kleinsten Funktionswert im Streifen (innere Scheiben), liegt die Summe unter dem Volumen, mit dem größten Wert (äußere Scheiben) darüber – wie bei Unter- und Obersumme. Für $n \to \infty$ streben beide gegen denselben Grenzwert, das Integral:

$$
V = \pi \int_a^b \big(f(x)\big)^2 \, dx .
$$

### Kontrolle mit bekannten Körperformeln

- $f(x) = r$ auf $[0; h]$: $V = \pi \int_0^h r^2 \, dx = \pi r^2 h$ (Zylinder).
- $f(x) = \tfrac{r}{h}x$ auf $[0; h]$: $V = \pi \int_0^h \tfrac{r^2}{h^2}x^2 \, dx = \tfrac{1}{3}\pi r^2 h$ (Kegel).
- $f(x) = \sqrt{r^2 - x^2}$ auf $[-r; r]$: $V = \pi \int_{-r}^{r} (r^2 - x^2) \, dx = \pi\left[r^2x - \tfrac{x^3}{3}\right]_{-r}^{r} = \tfrac{4}{3}\pi r^3$ (Kugel).
- $f(x) = \sqrt{x}$ auf $[0; 4]$: $V = \pi \int_0^4 x \, dx = 8\pi$ – genau die Hälfte des umschließenden Zylinders $\pi \cdot 2^2 \cdot 4 = 16\pi$.

Für den Sinusbogen oder das „Horn“ zu $f(x) = \tfrac{1}{x}$ gibt es keine Formel aus der Mittelstufe – hier hilft nur das Integral.

## Ausprobieren

1. Wähle „Rotieren lassen“ und beobachte, wie die grüne Fläche den Körper überstreicht. Stelle den Drehwinkel $\varphi$ auf $90°$ und auf $270°$: Welche Teile der Kugel siehst du? [Viertel gedreht](?phi=90)
2. Verschiebe den orangen Querschnitt an der Stelle $x$. Wo ist $A(x)$ am größten, wo ist $A(x) = 0$? [Kugel mit Querschnitt](?xs=1.5)
3. Zerlege den Kegel in 4 Scheiben und vergleiche „kleinster Wert (innen)“ mit „größter Wert (außen)“. Verdopple $n$ mehrmals. [Kegel in 4 Scheiben](?fn=kegel&m=1&a=0&b=4&n=4&pt=lower&sep=1)
4. Ziehe die Scheiben des Paraboloids auseinander und wieder zusammen. Warum stimmt hier schon die Mittelpunktsumme mit 8 Scheiben exakt? [Paraboloid](?fn=para&k=1&a=0&b=4&n=8&sep=1)
5. Ziehe am grünen Griff in der Seitenansicht: Wie ändert sich das Volumen, wenn man $f$ verdoppelt? [Kegelstumpf](?fn=stumpf&m=0.5&c=1&a=0&b=4)
6. Gabriels Horn: Schiebe $b$ immer weiter nach rechts. Wächst das Volumen über alle Grenzen? [Horn](?fn=horn&k=1&a=1&b=10)

## Aufgaben

### Aufgabe 1: Kegel

Die Gerade $f(x) = 0{,}5x$ dreht sich auf $[0; 4]$ um die $x$-Achse. Berechne das Volumen mit dem Integral und kontrolliere mit der Kegelformel. [Aufgabe laden](?fn=kegel&m=0.5&a=0&b=4&vals=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V = \pi \int_0^4 0{,}25x^2 \, dx = \pi \left[\tfrac{x^3}{12}\right]_0^4 = \tfrac{16}{3}\pi \approx 16{,}76$. Kontrolle: $r = f(4) = 2$, $h = 4$, $V = \tfrac{1}{3}\pi \cdot 2^2 \cdot 4 = \tfrac{16}{3}\pi$.

[In der Simulation zeigen](?fn=kegel&m=0.5&a=0&b=4)

</details>

### Aufgabe 2: Kugelvolumen

Leite mit $f(x) = \sqrt{9 - x^2}$ das Volumen einer Kugel mit $r = 3$ her. [Aufgabe laden](?r=3&a=-3&b=3&vals=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V = \pi \int_{-3}^{3} (9 - x^2) \, dx = \pi \left[9x - \tfrac{x^3}{3}\right]_{-3}^{3} = \pi\,(18 - (-18)) = 36\pi \approx 113{,}10$, passend zu $\tfrac{4}{3}\pi \cdot 3^3 = 36\pi$.

[In der Simulation zeigen](?r=3&a=-3&b=3)

</details>

### Aufgabe 3: Innere und äußere Scheiben

Ersetze den Kegel zu $f(x) = x$ auf $[0; 4]$ durch 4 innere bzw. 4 äußere Zylinderscheiben. Berechne beide Summen und das exakte Volumen. [Aufgabe laden](?fn=kegel&m=1&a=0&b=4&n=4&pt=lower&vals=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta x = 1$. Innen: $\pi(0^2 + 1^2 + 2^2 + 3^2) = 14\pi \approx 43{,}98$. Außen: $\pi(1^2 + 2^2 + 3^2 + 4^2) = 30\pi \approx 94{,}25$. Exakt: $\pi \int_0^4 x^2 \, dx = \tfrac{64}{3}\pi \approx 67{,}02$ – es liegt zwischen beiden Summen.

[In der Simulation zeigen](?fn=kegel&m=1&a=0&b=4&n=4&pt=upper)

</details>

### Aufgabe 4: Spindel

Der Sinusbogen $f(x) = \sin x$ auf $[0; \pi]$ dreht sich um die $x$-Achse. Berechne das Volumen. Tipp: $\sin^2 x = \tfrac{1}{2}(1 - \cos 2x)$. [Aufgabe laden](?fn=sin&k=1&a=0&b=3.15&vals=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V = \pi \int_0^\pi \sin^2 x \, dx = \pi \left[\tfrac{x}{2} - \tfrac{\sin 2x}{4}\right]_0^\pi = \tfrac{\pi^2}{2} \approx 4{,}93$.

[In der Simulation zeigen](?fn=sin&k=1&a=0&b=3.15)

</details>

### Aufgabe 5: Kugelabschnitt

Eine Kugel mit $r = 2$ wird bei $x = 1$ abgeschnitten. Berechne das Volumen des kleineren Teils mit dem Integral und mit der Formel $V = \tfrac{1}{3}\pi h^2 (3r - h)$. [Aufgabe laden](?r=2&a=1&b=2&vals=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V = \pi \int_1^2 (4 - x^2) \, dx = \pi\left[4x - \tfrac{x^3}{3}\right]_1^2 = \pi\left(\tfrac{16}{3} - \tfrac{11}{3}\right) = \tfrac{5}{3}\pi \approx 5{,}24$. Formel mit $h = 1$: $\tfrac{1}{3}\pi \cdot 1 \cdot 5 = \tfrac{5}{3}\pi$.

[In der Simulation zeigen](?r=2&a=1&b=2)

</details>

### Aufgabe 6: Gabriels Horn

Berechne das Volumen für $f(x) = \tfrac{1}{x}$ auf $[1; b]$ und untersuche $b \to \infty$. [Aufgabe laden](?fn=horn&k=1&a=1&b=10&vals=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V(b) = \pi \int_1^b \tfrac{1}{x^2} \, dx = \pi\left(1 - \tfrac{1}{b}\right)$, für $b = 10$ also $0{,}9\pi \approx 2{,}83$. Für $b \to \infty$ gilt $V \to \pi$: Der unendlich lange Körper hat ein endliches Volumen.

[In der Simulation zeigen](?fn=horn&k=1&a=1&b=10)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe 13, Integralrechnung (Anwendungen des Integrals) – Zuordnung als Entwurf, bitte gegen den aktuellen LehrplanPLUS prüfen; Rotationskörper sind je nach Lehrplanfassung Vertiefung bzw. Ausblick. Geeignet als Einstieg (Drehen der Fläche), zur Herleitung der Formel über die Scheibensumme und zur Kontrolle bekannter Körperformeln aus Jahrgangsstufe 10.
- **Modell:** Die Scheiben sind Zylinder der Dicke $\Delta x$; als Radius dienen wahlweise der Funktionswert in der Streifenmitte, der kleinste oder der größte Wert im Streifen. Die Seitenansicht zeigt den Graphen mit den zugehörigen Rechtecken und ihr Spiegelbild (Längsschnitt). Grenzen außerhalb des Definitionsbereichs werden angepasst (z. B. höchstens $\pi$ beim Sinus).
- **Typische Fehlvorstellungen:**
  - „$V = \pi \int_a^b f(x) \, dx$“ – der Radius wird quadriert, weil der Querschnitt die Kreisfläche $\pi f(x)^2$ ist; ein Faktor 2 beim Doppeln von $f$ wird zum Faktor 4 beim Volumen.
  - „$V = \left(\pi \int_a^b f(x)\,dx\right)^2$“ – quadriert wird der Integrand, nicht das Integral.
  - „Liegt der Graph unter der $x$-Achse, wird das Volumen negativ.“ – $f(x)^2 \geq 0$, das Volumen ist immer positiv.
  - Gabriels Horn: Das Volumen ist endlich ($\pi$), die Oberfläche aber unendlich groß – ein schöner Anlass, über Grenzwerte zu sprechen.
