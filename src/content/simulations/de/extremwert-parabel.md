## Worum geht es?

Bei einer **Extremwertaufgabe** sucht man den größten (oder kleinsten) Wert einer Größe, z. B. die größte Fläche bei vorgegebener Zaunlänge. Beispiel: Mit $40\,\text{m}$ Zaun soll an einer Mauer ein rechteckiges Gehege entstehen. Die Mauer ersetzt eine Seite, der Zaun bildet die drei anderen.

1. **Hauptbedingung** (was groß werden soll): $A = x \cdot y$.
2. **Nebenbedingung** (was fest ist): $2x + y = 40$, also $y = 40 - 2x$.
3. **Zielfunktion** (nur noch eine Variable): Einsetzen ergibt

$$
A(x) = x \cdot (40 - 2x) = -2x^2 + 40x .
$$

4. **Definitionsbereich:** Nur Werte mit $x > 0$ und $y = 40 - 2x > 0$ ergeben ein Rechteck, also $D = \,]0;\,20[$. Außerhalb davon hat die Parabel keine Bedeutung für die Aufgabe (in der Simulation ist sie dort blass).

Der Graph der Zielfunktion ist eine **nach unten geöffnete Parabel** ($a = -2 < 0$). Ihr höchster Punkt ist der **Scheitel**. Ohne Ableitung findet man ihn mit der **quadratischen Ergänzung**:

$$
\begin{aligned}
A(x) &= -2\,(x^2 - 20x)\\
&= -2\,(x^2 - 20x + 10^2 - 10^2)\\
&= -2\,\big((x - 10)^2 - 100\big)\\
&= -2\,(x - 10)^2 + 200
\end{aligned}
$$

Am Scheitel $S(10 \mid 200)$ liest man ab: Für $x = 10\,\text{m}$ (und damit $y = 20\,\text{m}$) ist die Fläche am größten, $A_{\max} = 200\,\text{m}^2$. Denn $(x - 10)^2$ ist nie negativ, also ist $-2\,(x - 10)^2 \le 0$, und $A(x)$ wird höchstens $200$.

**Kontrolle über die Symmetrie:** Die Zielfunktion ist ein Produkt. Ihre Nullstellen ($x = 0$ und $x = 20$) sind genau die Ränder des Definitionsbereichs. Der Scheitel liegt in der Mitte dazwischen, bei $x = 10$.

Weitere Sachsituationen in der Simulation:

- **Gehege ohne Mauer** (Umfang $40\,\text{m}$): $A(x) = x\,(20 - x)$, Maximum beim **Quadrat** mit $10\,\text{m}$ Seitenlänge, $A = 100\,\text{m}^2$.
- **Rechteck im Dreieck:** Aus einem rechtwinklig-dreieckigen Brett (Katheten $a$, $b$) wird ein Rechteck gesägt, eine Ecke liegt auf der Hypotenuse. Mit dem Strahlensatz gilt $h = b - \frac{b}{a}\,x$. Am besten ist $x = \frac{a}{2}$, $h = \frac{b}{2}$.
- **Eintrittspreis:** Bisher $8\,€$ und $300$ Besucher; je $1\,€$ mehr kommen $20$ weniger. Erlös $E(x) = (8 + x)(300 - 20x)$. Der Erlös ist die Fläche des Rechtecks „Preis mal Besucher“.
- **Regenrinne:** Ein Blechstreifen der Breite $s$ wird an beiden Rändern um $x$ hochgebogen. Querschnitt $A(x) = x\,(s - 2x)$ – dieselbe Zielfunktion wie beim Gehege an der Mauer!

## Ausprobieren

1. Ziehe den Griff am Gehege (oder den Punkt auf dem Graphen). Beobachte, wie Fläche und Höhe des Punktes zusammenhängen. Wann ist das Gehege schmal und lang, wann kurz und tief? [Beispiel laden](?sit=wall&L=40&x=4)
2. Stelle die Karte auf **Wertetabelle**. Bei welchem Tabellenwert ist die Fläche am größten? Was fällt an den Werten links und rechts davon auf? [Beispiel laden](?sit=wall&L=40&x=6&card=table)
3. Klicke auf **Maximum suchen**. Erst wird probiert, dann gerechnet. Verfolge jede Zeile der quadratischen Ergänzung.
4. Ohne Mauer: Welche Form hat das beste Gehege? Ändere die Zaunlänge – bleibt es bei dieser Form? [Beispiel laden](?sit=free&L=40&x=4)
5. Rechteck im Dreieck: Ziehe die Ecke auf der Hypotenuse. Vergleiche die größte Rechteckfläche mit der Dreiecksfläche. [Beispiel laden](?sit=tri&a=80&b=60&xt=16)
6. Eintrittspreis: Lohnt sich eine Preiserhöhung? Probiere auch das zweite Beispiel, in dem eine Preissenkung besser ist. [Erhöhung](?sit=price&p=8&n=300&k=20&xp=0) · [Senkung](?sit=price&p=12&n=200&k=25&xp=0)
7. Regenrinne: Vergleiche mit dem Gehege an der Mauer. Warum ist die Rechnung dieselbe? [Beispiel laden](?sit=gutter&s=30&xg=3)

## Aufgaben

### Aufgabe 1: Gehege an der Mauer

Mit $60\,\text{m}$ Zaun wird an einer Mauer ein rechteckiges Gehege gebaut. Stelle die Zielfunktion auf und bestimme die größte Fläche. [Aufgabe laden](?sit=wall&L=60&x=5&sol=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$A(x) = x\,(60 - 2x) = -2x^2 + 60x = -2\,(x^2 - 30x) = -2\,\big((x - 15)^2 - 225\big) = -2\,(x - 15)^2 + 450$. Breite $15\,\text{m}$, Länge $30\,\text{m}$, $A_{\max} = 450\,\text{m}^2$. [In der Simulation zeigen](?sit=wall&L=60&x=15)

</details>

### Aufgabe 2: Quadrat oder nicht?

Ein rechteckiges Beet soll den Umfang $28\,\text{m}$ haben. Zeige mit quadratischer Ergänzung, dass ein Quadrat die größte Fläche hat.

<details>
<summary>Lösung anzeigen</summary>

$2x + 2y = 28$, also $y = 14 - x$. $A(x) = x\,(14 - x) = -(x^2 - 14x) = -\big((x - 7)^2 - 49\big) = -(x - 7)^2 + 49$. Maximum bei $x = 7$, dann $y = 7$: ein Quadrat mit $49\,\text{m}^2$. [In der Simulation zeigen](?sit=free&L=28&x=7)

</details>

### Aufgabe 3: Rechteck im Dreieck

Ein rechtwinklig-dreieckiges Brett hat die Katheten $a = 100\,\text{cm}$ und $b = 40\,\text{cm}$. Wie groß wird das größte rechteckige Stück, wenn eine Ecke auf der Hypotenuse liegt? [Aufgabe laden](?sit=tri&a=100&b=40&xt=20&sol=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Strahlensatz: $\frac{h}{40} = \frac{100 - x}{100}$, also $h = 40 - 0{,}4x$. $A(x) = x\,(40 - 0{,}4x) = -0{,}4\,(x^2 - 100x) = -0{,}4\,(x - 50)^2 + 1000$. Also $x = 50\,\text{cm}$, $h = 20\,\text{cm}$, $A_{\max} = 1000\,\text{cm}^2$ – die Hälfte der Dreiecksfläche $2000\,\text{cm}^2$. [In der Simulation zeigen](?sit=tri&a=100&b=40&xt=50)

</details>

### Aufgabe 4: Eintrittspreis

Ein Freibad verlangt $4\,€$ und hat $600$ Gäste am Tag. Eine Umfrage zeigt: Je $1\,€$ Preiserhöhung kommen $50$ Gäste weniger. Bei welchem Preis ist der Erlös am größten? [Aufgabe laden](?sit=price&p=4&n=600&k=50&xp=0&sol=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$E(x) = (4 + x)(600 - 50x) = -50x^2 + 400x + 2400 = -50\,(x^2 - 8x) + 2400 = -50\,(x - 4)^2 + 3200$. Preis $8\,€$, dann kommen $400$ Gäste, Erlös $3200\,€$ statt $2400\,€$. [In der Simulation zeigen](?sit=price&p=4&n=600&k=50&xp=4)

</details>

### Aufgabe 5: Regenrinne

Aus einem $24\,\text{cm}$ breiten Blechstreifen soll eine Rinne mit rechteckigem Querschnitt gebogen werden. Wie hoch müssen die Ränder sein, damit möglichst viel Wasser hineinpasst?

<details>
<summary>Lösung anzeigen</summary>

$A(x) = x\,(24 - 2x) = -2\,(x - 6)^2 + 72$. Ränder $6\,\text{cm}$ hoch, Boden $12\,\text{cm}$ breit, Querschnitt $72\,\text{cm}^2$. [In der Simulation zeigen](?sit=gutter&s=24&xg=6)

</details>

### Aufgabe 6: Begründen

Begründe ohne Rechnung: Bei jeder der Aufgaben liegt das Maximum genau in der Mitte des Definitionsbereichs.

<details>
<summary>Lösung anzeigen</summary>

Die Zielfunktion ist jeweils ein Produkt aus zwei linearen Faktoren. An den Rändern des Definitionsbereichs wird einer der Faktoren null (Seite $0$, Preis $0$ oder keine Besucher). Diese Ränder sind also die beiden Nullstellen der Parabel. Der Scheitel einer Parabel liegt wegen der Symmetrie genau in der Mitte zwischen ihren Nullstellen.

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 9, quadratische Funktionen, Anwendungen und Modellieren. Ableitungen werden nicht benötigt; die Simulation eignet sich zur Einführung (Probieren, Wertetabelle) und zur Übung (Rechenweg).
- **Aufbau einer Lösung:** Hauptbedingung, Nebenbedingung, Zielfunktion, Definitionsbereich, Scheitel bestimmen, Ergebnis im Sachzusammenhang deuten. Die Karte rechts zeigt genau diese Schritte.
- **Bedienung:** Der Wert $x$ lässt sich am Griff in der Szene, am Punkt auf dem Graphen und am Regler ändern. Werte außerhalb des Definitionsbereichs werden auf den Rand begrenzt. Mit `sol=0` und **Teilen → Ergebnisse verdecken** sind Scheitel und Rechnung verdeckt; „Maximum suchen“ zeigt sie.
- **Häufige Stolpersteine:**
  - „Der Scheitel ist schon das Ergebnis.“ – Gefragt ist meist nach den Maßen (Breite, Länge, Preis) und dem größten Wert mit Einheit.
  - „Das Quadrat ist immer am besten.“ – Nur beim festen Umfang ohne Mauer. An der Mauer ist das beste Gehege doppelt so lang wie breit.
  - Vorzeichenfehler beim Ausklammern eines negativen Faktors: $-2x^2 + 40x = -2\,(x^2 - 20x)$, nicht $-2\,(x^2 + 20x)$.
  - Der Definitionsbereich wird vergessen. Er entscheidet, welcher Teil der Parabel überhaupt zur Aufgabe gehört.
- **Modell:** Beim Eintrittspreis ist der lineare Rückgang der Besucherzahl eine Modellannahme. Die Simulation lässt auch gebrochene Besucherzahlen zu; im Unterricht kann man das als Grenze des Modells besprechen.
