## Worum geht es?

Die Fläche zwischen einem Graphen und der x-Achse lässt sich mit **Rechtecken** annähern. Man teilt das Intervall $[a; b]$ in $n$ gleich breite Streifen der Breite $\Delta x = \frac{b - a}{n}$.

- **Untersumme** $U_n$: Jedes Rechteck ist so hoch wie der **kleinste** Funktionswert im Streifen.
- **Obersumme** $O_n$: Jedes Rechteck ist so hoch wie der **größte** Funktionswert im Streifen.

Dann liegt das Integral immer dazwischen: $U_n \leq \int_a^b f(x)\,\mathrm{d}x \leq O_n$ (für $f \geq 0$ ist das die Fläche). Mit wachsendem $n$ rücken beide Summen zusammen; ihr gemeinsamer Grenzwert ist das **Integral**:

$$
\int_a^b f(x)\,\mathrm{d}x = \lim_{n \to \infty} U_n = \lim_{n \to \infty} O_n
$$

**Flächenbilanz:** Flächen **unterhalb** der x-Achse zählen **negativ**. Das Integral von $\sin x$ über $[0; 2\pi]$ ist deshalb $0$, obwohl die Fläche nicht null ist.

Weitere Näherungen: Links-, Rechts- und Mittelsumme (Höhe am linken, rechten Rand bzw. in der Mitte) und die **Trapezsumme**.

### Vom Zufluss zur Wassermenge

Fließen $r$ Liter pro Minute in ein Becken, kommen in einer kurzen Zeit $\Delta t$ etwa $r \cdot \Delta t$ Liter dazu – ein schmales Rechteck unter dem Graphen der **Zuflussrate** $r(t)$. Alle Rechtecke zusammen ergeben die zugeflossene Menge, und im Grenzwert ist das ein Integral:

$$
V(t) = V_0 + \int_0^t r(s)\,\mathrm{d}s
$$

Ist $r(t)$ negativ, fließt Wasser ab: Die Fläche unter der t-Achse zählt negativ, das Wasser im Becken nimmt ab. Am Vorzeichenwechsel von $r$ ist das Becken am vollsten. So rekonstruiert man aus einer Änderungsrate den **Bestand**.

## Ausprobieren

1. Drücke mehrmals **n verdoppeln** und beobachte, wie Unter- und Obersumme zusammenrücken.
2. Ziehe die Grenzen $a$ und $b$ auf der x-Achse.
3. Wähle $\sin x$ von $0$ bis $2\pi$. Warum ist die Summe fast null? [Flächenbilanz](?fn=sin&a=0&b=6.3&kind=mid&n=12)
4. Vergleiche Mittelsumme und Trapezsumme. Welche ist bei gleichem $n$ genauer? [Trapezsumme](?fn=sqrt&a=0&b=9&kind=trapez&n=6)
5. **Zufluss und Wassermenge:** Drück **Abspielen** und beobachte, wie das Becken mit der Fläche unter dem Graphen wächst. Was passiert, wenn der Graph unter die t-Achse geht? [Becken füllen](?mode=fill&prof=const&t=0&n=10) · [Zufluss und Abfluss](?mode=fill&prof=outflow&t=0&n=10)
6. **Üben:** Rechne eine Rechtecksumme von Hand aus, trag das Ergebnis ein und lass es prüfen. Nach der richtigen Antwort erscheinen die Rechtecke mit ihren Höhen. [Üben](?mode=quiz&q=1)

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

$O_n - U_n = \frac{2}{n} \cdot (4 - 0) = \frac{8}{n} < 0{,}1 \Rightarrow n > 80$, also mindestens $n = 81$. Zum Beispiel $n = 128$: $\frac{8}{128} = 0{,}0625$. [In der Simulation zeigen](?n=128)

</details>

### Aufgabe 3: Flächen unter der x-Achse

Berechne $\int_{-2}^{3} (0{,}5x^3 - 2x)\,\mathrm{d}x$ mit der Stammfunktion $F(x) = 0{,}125x^4 - x^2$ und vergleiche mit der Simulation. Warum ist das nicht der Inhalt der eingeschlossenen Fläche?

<details>
<summary>Lösung anzeigen</summary>

$F(3) - F(-2) = (10{,}125 - 9) - (2 - 4) = 3{,}125$. Teile des Graphen liegen unter der x-Achse; diese Flächen werden abgezogen. Für den Flächeninhalt müsste man an den Nullstellen aufteilen und die Beträge addieren. [In der Simulation zeigen](?fn=cubic&a=-2&b=3&kind=mid&n=10)

</details>

### Aufgabe 4: Zufluss und Abfluss

In ein Becken mit $20$ Litern fließen $r(t) = 4 - t$ Liter pro Minute ($t$ in Minuten). Wann ist das Becken am vollsten? Wie viel Wasser ist dann darin, und wie viel nach $10$ Minuten? [Aufgabe laden](?mode=fill&prof=outflow&t=0&n=10&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Bis $t = 4$ ist $r(t) > 0$, danach fließt Wasser ab. Am vollsten ist das Becken also bei $t = 4$:

$$V(4) = 20 + \int_0^4 (4 - t)\,\mathrm{d}t = 20 + \left[4t - \tfrac{1}{2}t^2\right]_0^4 = 20 + 8 = 28\ \text{Liter}$$

$$V(10) = 20 + \left(40 - 50\right) = 10\ \text{Liter}$$

[In der Simulation zeigen](?mode=fill&prof=outflow&t=4&n=10)

</details>

### Aufgabe 5: Geschätzt mit Rechtecken

Der Hahn wird langsam aufgedreht: $r(t) = 0{,}6t$ Liter pro Minute. Schätze die Wassermenge nach $10$ Minuten mit $5$ Rechtecken (Höhe jeweils am linken Rand) und vergleiche mit dem exakten Wert. Warum ist die Schätzung zu klein?

<details>
<summary>Lösung anzeigen</summary>

$\Delta t = 2$; Höhen $0;\ 1{,}2;\ 2{,}4;\ 3{,}6;\ 4{,}8$. Schätzung: $2 \cdot 12 = 24$ Liter. Exakt: $\int_0^{10} 0{,}6t\,\mathrm{d}t = 0{,}3 \cdot 100 = 30$ Liter. Weil $r$ steigt, ist die Linkssumme eine Untersumme – jedes Rechteck bleibt unter dem Graphen. [In der Simulation zeigen](?mode=fill&prof=linear&t=10&n=5)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe (Flächeninhalt und bestimmtes Integral, oft auf erhöhtem Anforderungsniveau); auch für die Einführung des Integralbegriffs allgemein.
- **Animation:** Beim Verdoppeln bzw. Halbieren von $n$ wachsen die neuen Rechtecke aus den alten heraus. Die Tabelle zeigt die Summen für $n = 4$ bis $128$.
- **Hinweis zur Berechnung:** Minimum und Maximum je Streifen werden exakt bestimmt: Die Simulation vergleicht die Funktionswerte an den Streifenrändern und an den Stellen mit $f'(x) = 0$ im Streifen.
- **Rekonstruktion:** Der Teil „Zufluss und Wassermenge“ verbindet Rechtecksummen mit dem Sachkontext „Änderungsrate → Bestand“. Gut als Einstieg, bevor der Hauptsatz behandelt wird.
- **Üben:** Die Aufgaben sind nummeriert. Gleiche Nummer bedeutet gleiche Aufgabe – so kann die ganze Klasse dieselbe bearbeiten. Die ersten beiden fragen Links- und Rechtssumme, danach auch Unter-, Ober- und Mittelsumme.
- **Häufige Stolpersteine:**
  - Integral und Flächeninhalt werden gleichgesetzt, auch wenn der Graph unter die x-Achse geht.
  - Untersumme = Linkssumme gilt nur für steigende Funktionen.
  - Beim Rechnen von Hand wird die Streifenbreite $\Delta x$ vergessen oder es werden $n + 1$ Höhen addiert.
