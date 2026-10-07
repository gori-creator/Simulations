---
description: Interaktive Simulation zu Ober- und Untersummen – das Integral als Grenzwert von Rechtecksummen und als Flächenbilanz.
---

## Worum geht es?

Die Fläche zwischen einem Graphen und der x-Achse lässt sich mit **Rechtecken** annähern. Man teilt das Intervall $[a; b]$ in $n$ gleich breite Streifen der Breite $\Delta x = \frac{b - a}{n}$.

- **Untersumme** $U_n$: Jedes Rechteck ist so hoch wie der **kleinste** Funktionswert im Streifen.
- **Obersumme** $O_n$: Jedes Rechteck ist so hoch wie der **größte** Funktionswert im Streifen.

Dann liegt die gesuchte Fläche immer dazwischen: $U_n \leq A \leq O_n$. Mit wachsendem $n$ rücken beide Summen zusammen; ihr gemeinsamer Grenzwert ist das **Integral**:

$$
\int_a^b f(x)\,\mathrm{d}x = \lim_{n \to \infty} U_n = \lim_{n \to \infty} O_n
$$

**Flächenbilanz:** Flächen **unterhalb** der x-Achse zählen **negativ**. Das Integral von $\sin x$ über $[0; 2\pi]$ ist deshalb $0$, obwohl die Fläche nicht null ist.

Weitere Näherungen: Links-, Rechts- und Mittelsumme (Höhe am linken, rechten Rand bzw. in der Mitte) und die **Trapezsumme**.

## Ausprobieren

1. Drücke mehrmals **n verdoppeln** und beobachte, wie Unter- und Obersumme zusammenrücken.
2. Ziehe die Grenzen $a$ und $b$ auf der x-Achse.
3. Wähle $\sin x$ von $0$ bis $2\pi$. Warum ist die Summe fast null? [Flächenbilanz](?fn=sin&a=0&b=6.3&kind=mid&n=12)
4. Vergleiche Mittelsumme und Trapezsumme. Welche ist bei gleichem $n$ genauer? [Trapezsumme](?fn=sqrt&a=0&b=9&kind=trapez&n=6)

## Aufgaben

### Aufgabe 1: Von Hand rechnen

Berechne für $f(x) = x^2$ auf $[0; 2]$ mit $n = 4$ die Unter- und die Obersumme. [Aufgabe laden](?_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta x = 0{,}5$. Weil $f$ auf $[0; 2]$ steigt, liegt das Minimum jeweils links, das Maximum rechts:

$$U_4 = 0{,}5 \cdot (0 + 0{,}25 + 1 + 2{,}25) = 1{,}75 \qquad O_4 = 0{,}5 \cdot (0{,}25 + 1 + 2{,}25 + 4) = 3{,}75$$

Der exakte Wert ist $\frac{8}{3} \approx 2{,}67$.

</details>

### Aufgabe 2: Wie viele Streifen?

Für steigende Funktionen gilt $O_n - U_n = \Delta x \cdot (f(b) - f(a))$. Wie groß muss $n$ für $f(x) = x^2$ auf $[0; 2]$ sein, damit $O_n - U_n < 0{,}1$ gilt?

<details>
<summary>Lösung anzeigen</summary>

$O_n - U_n = \frac{2}{n} \cdot (4 - 0) = \frac{8}{n} < 0{,}1 \Rightarrow n > 80$. Zum Beispiel $n = 128$: $\frac{8}{128} = 0{,}0625$. [In der Simulation zeigen](?n=128)

</details>

### Aufgabe 3: Flächen unter der x-Achse

Berechne $\int_{-2}^{3} (0{,}5x^3 - 2x)\,\mathrm{d}x$ mit der Stammfunktion $F(x) = 0{,}125x^4 - x^2$ und vergleiche mit der Simulation. Warum ist das nicht der Inhalt der eingeschlossenen Fläche?

<details>
<summary>Lösung anzeigen</summary>

$F(3) - F(-2) = (10{,}125 - 9) - (2 - 4) = 3{,}125$. Teile des Graphen liegen unter der x-Achse; diese Flächen werden abgezogen. Für den Flächeninhalt müsste man an den Nullstellen aufteilen und die Beträge addieren. [In der Simulation zeigen](?fn=cubic&a=-2&b=3&kind=mid&n=10)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 13 (erhöhtes Anforderungsniveau: Flächeninhalt und bestimmtes Integral); auch für die Einführung des Integralbegriffs allgemein.
- **Animation:** Beim Verdoppeln bzw. Halbieren von $n$ wachsen die neuen Rechtecke aus den alten heraus. Die Tabelle zeigt die Summen für $n = 4$ bis $128$.
- **Hinweis zur Berechnung:** Minimum und Maximum je Streifen werden numerisch bestimmt (dichte Abtastung) – für die hier verwendeten Funktionen ist das sehr genau.
- **Typische Fehlvorstellungen:**
  - Integral und Flächeninhalt werden gleichgesetzt, auch wenn der Graph unter die x-Achse geht.
  - Untersumme = Linkssumme gilt nur für steigende Funktionen.
