## Worum geht es?

Die Erde bekommt ihre Energie fast nur von der **Sonne**. Im Gleichgewicht muss sie genauso viel Energie wieder abgeben – und das geht ins Weltall nur durch **Strahlung**. Die Simulation zeigt diesen **Strahlungshaushalt** in einem einfachen Modell. Alle Zahlen sind Mittelwerte in Watt pro Quadratmeter Erdoberfläche.

### Sonnenlicht und Albedo

Auf jeden Quadratmeter der Erde fällt im Mittel ein Viertel der Solarkonstante, also etwa $\frac{1361}{4} \approx 340\,\tfrac{\text{W}}{\text{m}^2}$ (Tag und Nacht, Pole und Äquator gemittelt). Etwa 30 % davon werfen Wolken, Eis und Schnee gleich wieder zurück – das ist die **Albedo** $a \approx 0{,}3$. Der Rest erwärmt den Boden.

### Wärmestrahlung des Bodens

Der warme Boden strahlt unsichtbares Infrarot ab, nach dem Stefan-Boltzmann-Gesetz $P = \sigma \cdot T^4$. Ohne Atmosphäre stellt sich ein Gleichgewicht bei

$$
(1 - a) \cdot \frac{S}{4} = \sigma \cdot T^4 \quad\Rightarrow\quad T \approx 255\,\text{K} \approx -18\,°\text{C}
$$

ein. Die Erde wäre ein Eisball.

### Die Atmosphäre als Decke

Für Sonnenlicht ist die Luft weitgehend durchsichtig, für Infrarot aber nicht: **Treibhausgase** wie Wasserdampf, Kohlenstoffdioxid (CO₂) und Methan nehmen einen Teil $\varepsilon$ der Bodenstrahlung auf. Die erwärmte Luft strahlt selbst – **zur Hälfte nach oben, zur Hälfte zurück nach unten**. Diese **Gegenstrahlung** wärmt den Boden zusätzlich. Im Modell gilt dann

$$
\sigma \cdot T_\text{Boden}^4 = (1 - a) \cdot \frac{S}{4} \cdot \frac{2}{2 - \varepsilon}
$$

Mit $\varepsilon \approx 0{,}78$ ergibt sich die heutige Mitteltemperatur von etwa 15 °C. Dieser **natürliche Treibhauseffekt** macht die Erde bewohnbar.

### Mehr Treibhausgase

Verbrennen wir Kohle, Öl und Gas, steigt der CO₂-Anteil, und $\varepsilon$ wird größer. Schon wenige Hundertstel mehr bedeuten mehrere Grad Erwärmung (**menschengemachter Treibhauseffekt**). Schmilzt dadurch Eis, wird die Erde dunkler, die Albedo sinkt, und es wird noch wärmer – eine **Rückkopplung**.

Das Modell ist stark vereinfacht: echte Atmosphären haben viele Schichten, Wolken, Konvektion und Verdunstung. Die Grundidee stimmt aber.

## Ausprobieren

- [Ohne Treibhausgase](?eps=0): Wie kalt wird es?
- [Heute](?eps=0.78): Verfolge die Pfeile. Warum ist die Abstrahlung des Bodens größer als die Sonneneinstrahlung?
- [Mehr Treibhausgase](?eps=0.82): Wie stark steigt die Temperatur?
- [Weniger Eis](?alb=0.27) und [Schneeball-Erde](?alb=0.6): Was bewirkt die Albedo?

## Aufgaben

**1. Erde ohne Lufthülle.** Berechne die Gleichgewichtstemperatur für $a = 0{,}3$ und $S = 1361\,\tfrac{\text{W}}{\text{m}^2}$ ohne Atmosphäre. [Aufgabe laden](?eps=0&alb=0.3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\sigma T^4 = 0{,}7 \cdot 340\,\tfrac{\text{W}}{\text{m}^2} \approx 238\,\tfrac{\text{W}}{\text{m}^2}$, also $T = \sqrt[4]{\frac{238}{5{,}67 \cdot 10^{-8}}}\,\text{K} \approx 255\,\text{K} \approx -18\,°\text{C}$.

</details>

**2. Mehr Energie am Boden als von der Sonne?** Im Modell „heute“ strahlt der Boden etwa $390\,\tfrac{\text{W}}{\text{m}^2}$ ab, bekommt aber nur $238\,\tfrac{\text{W}}{\text{m}^2}$ von der Sonne. Woher kommt der Rest? [Aufgabe laden](?eps=0.78&_hide=1)

<details><summary>Lösung anzeigen</summary>

Von der **Gegenstrahlung** der Atmosphäre: $238 + 152 = 390$. Die Energie wird nicht „erzeugt“, sondern pendelt zwischen Boden und Luft hin und her, bevor sie das All erreicht. Oben gehen ebenfalls $86 + 152 = 238\,\tfrac{\text{W}}{\text{m}^2}$ ins All – die Bilanz stimmt.

</details>

**3. Wie viel wärmer?** Erhöhe $\varepsilon$ von 0,78 auf 0,82. Um wie viel Grad steigt die Temperatur? [Aufgabe laden](?eps=0.82&_hide=1)

<details><summary>Lösung anzeigen</summary>

Von etwa 14,9 °C auf 17,3 °C, also um rund 2,4 Grad. Die Bodenstrahlung steigt von 390 auf 404 W/m².

</details>

**4. Eis und Albedo.** Erkläre mit der Simulation, warum das Abschmelzen von Eis die Erwärmung verstärkt.

<details><summary>Lösung anzeigen</summary>

Eis wirft viel Sonnenlicht zurück. Schmilzt es, kommt dunkler Boden oder Wasser zum Vorschein, die Albedo sinkt (z. B. von 0,30 auf 0,27). Dann wird mehr Sonnenlicht aufgenommen und die Temperatur steigt weiter (von 14,9 °C auf etwa 18 °C) – noch mehr Eis schmilzt. Das ist eine **positive Rückkopplung**.

</details>

## Ideen für den Unterricht

- **Modellkritik:** Welche Vorgänge fehlen im Modell (Wolken, Wind, Verdunstung, Ozeane)? Warum ist es trotzdem nützlich?
- **Daten vergleichen:** Die Messreihe des CO₂-Anteils (Mauna Loa) mit der globalen Temperatur vergleichen.
- **Vernetzung:** Stefan-Boltzmann aus der Simulation „Wärmetransport“; Infrarot im „Elektromagnetischen Spektrum“.
- **Bewerten:** Welche Maßnahmen senken $\varepsilon$ oder halten es konstant? Was bedeuten zwei Grad mehr für Gletscher und Meeresspiegel?
