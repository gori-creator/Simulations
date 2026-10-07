---
description: "Interaktive Simulation zum freien Fall – Stroboskopaufnahme mit den Abständen 1 : 3 : 5 : 7, Fallgesetze auf Erde, Mond, Mars und Jupiter, Kugel und Feder in der Fallröhre und ein Reaktionstest mit fallendem Lineal."
---

## Worum geht es?

Lässt man einen Körper los, fällt er immer schneller. Ohne Luftwiderstand ist der **freie Fall** eine **gleichmäßig beschleunigte Bewegung** mit der Fallbeschleunigung $g$ (dem Ortsfaktor). In Mitteleuropa ist $g \approx 9{,}81\,\tfrac{\text{m}}{\text{s}^2}$. Aus der Ruhe gelten die **Fallgesetze**

$$
s = \tfrac{1}{2}\, g\, t^2 \qquad v = g \cdot t .
$$

Daraus folgen für die Fallhöhe $h$ die **Fallzeit** und die **Aufprallgeschwindigkeit**

$$
t = \sqrt{\frac{2h}{g}} \qquad v = \sqrt{2\, g\, h}.
$$

**Stroboskop:** Blitzt eine Lampe in gleichen Zeitabständen $\Delta t$, sieht man die Kugel an mehreren Stellen. Die Abstände wachsen im Verhältnis $1 : 3 : 5 : 7 : \ldots$ – jeder Abstand ist um $g \cdot (\Delta t)^2$ größer als der vorige.

**Masse spielt keine Rolle:** Ohne Luft fallen eine schwere Kugel und eine leichte Feder **gleich schnell**. In Luft bremst der **Luftwiderstand** die Feder stark: Sie erreicht schnell eine kleine **Endgeschwindigkeit** und fällt dann fast gleichförmig. Auf dem Mond (ohne Luft) ließ ein Astronaut 1971 bei der Mission Apollo 15 einen Hammer und eine Feder fallen – beide kamen gleichzeitig unten an.

**Andere Himmelskörper** haben andere Ortsfaktoren: Mond $1{,}62\,\tfrac{\text{m}}{\text{s}^2}$, Mars $3{,}71\,\tfrac{\text{m}}{\text{s}^2}$, Jupiter $24{,}79\,\tfrac{\text{m}}{\text{s}^2}$.

**Reaktionszeit:** Fängt man ein fallendes Lineal, kann man aus der Fallstrecke $s$ die Reaktionszeit berechnen: $t = \sqrt{\frac{2s}{g}}$.

## Ausprobieren

1. Drücke **Fallen lassen** und betrachte das Stroboskopbild. Lies die Abstände an der blauen Leiste ab: $1 : 3 : 5 : 7 : 9$.
2. Ziehe die Kugel im Fallturm nach unten und beobachte, wie sich Zeit und Geschwindigkeit ändern.
3. Wiederhole den Versuch auf dem Mond und auf dem Jupiter. [Auf dem Mond](?planet=mond)
4. Drehe die **Fallröhre** um – einmal mit Luft, einmal luftleer. [Fallröhre mit Luft](?mode=tube) · [Fallröhre luftleer](?mode=tube&vac=1)
5. Miss deine **Reaktionszeit**: Drücke Start und fange das Lineal (Tippen, Klick oder Leertaste). Mache mindestens fünf Versuche. [Reaktionstest](?mode=ruler)

## Aufgaben

### Aufgabe 1: Fallturm

Eine Kugel fällt aus $20\,\text{m}$ Höhe (ohne Luftwiderstand). Wie lange dauert der Fall, mit welcher Geschwindigkeit kommt sie unten an? [Aufgabe laden](?_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$t = \sqrt{\frac{2 \cdot 20\,\text{m}}{9{,}81\,\text{m/s}^2}} \approx 2{,}02\,\text{s}$ und $v = g \cdot t \approx 19{,}8\,\tfrac{\text{m}}{\text{s}} \approx 71\,\tfrac{\text{km}}{\text{h}}$.

</details>

### Aufgabe 2: Stroboskopbild auswerten

Das Stroboskop blitzt alle $0{,}4\,\text{s}$. Berechne die Abstände zwischen den ersten fünf Bildern und ihr Verhältnis. [Aufgabe laden](?dt=0.4&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Orte: $s(0{,}4\,\text{s}) \approx 0{,}78\,\text{m}$, $s(0{,}8\,\text{s}) \approx 3{,}14\,\text{m}$, $s(1{,}2\,\text{s}) \approx 7{,}06\,\text{m}$, $s(1{,}6\,\text{s}) \approx 12{,}56\,\text{m}$. Abstände: $0{,}78\,\text{m}$; $2{,}35\,\text{m}$; $3{,}92\,\text{m}$; $5{,}49\,\text{m}$ – also $1 : 3 : 5 : 7$. Jeder Abstand ist um $g \cdot (0{,}4\,\text{s})^2 \approx 1{,}57\,\text{m}$ größer als der vorige.

</details>

### Aufgabe 3: Auf dem Mond

Wie lange fällt die Kugel auf dem Mond aus $20\,\text{m}$? Wie viel länger ist das als auf der Erde? [Aufgabe laden](?planet=mond&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$t = \sqrt{\frac{2 \cdot 20}{1{,}62}}\,\text{s} \approx 4{,}97\,\text{s}$ – etwa $\sqrt{9{,}81 / 1{,}62} \approx 2{,}5$-mal so lange wie auf der Erde.

</details>

### Aufgabe 4: Brunnentiefe

Ein Stein fällt in einen Brunnen und schlägt nach $2\,\text{s}$ auf dem Wasser auf. Wie tief ist der Brunnen (Luftwiderstand und Schalllaufzeit vernachlässigt)?

<details>
<summary>Lösung anzeigen</summary>

$s = \tfrac12 \cdot 9{,}81\,\tfrac{\text{m}}{\text{s}^2} \cdot (2\,\text{s})^2 \approx 19{,}6\,\text{m}$. [In der Simulation prüfen](?h=19.5)

</details>

### Aufgabe 5: Reaktionszeit und Reaktionsweg

Jemand fängt das Lineal nach $18\,\text{cm}$. Wie groß ist die Reaktionszeit? Welche Strecke fährt ein Auto mit $50\,\tfrac{\text{km}}{\text{h}}$ in dieser Zeit, bevor die Fahrerin überhaupt bremst?

<details>
<summary>Lösung anzeigen</summary>

$t = \sqrt{\frac{2 \cdot 0{,}18\,\text{m}}{9{,}81\,\text{m/s}^2}} \approx 0{,}19\,\text{s}$. Mit $50\,\tfrac{\text{km}}{\text{h}} \approx 13{,}9\,\tfrac{\text{m}}{\text{s}}$ ergibt sich ein Reaktionsweg von etwa $13{,}9 \cdot 0{,}19\,\text{m} \approx 2{,}6\,\text{m}$. Im Straßenverkehr rechnet man mit etwa $1\,\text{s}$ Reaktionszeit, weil man die Gefahr erst erkennen und den Fuß umsetzen muss.

</details>

### Aufgabe 6: Feder und Kugel

Erkläre, warum die Feder in der Röhre mit Luft viel länger braucht, im luftleeren Rohr aber genauso schnell fällt wie die Kugel. [Mit Luft](?mode=tube) · [Luftleer](?mode=tube&vac=1)

<details>
<summary>Lösung anzeigen</summary>

Auf beide wirkt die Gewichtskraft; ohne Luft beschleunigen beide mit $g$ – unabhängig von der Masse. In Luft wirkt zusätzlich der Luftwiderstand. Er wächst mit der Geschwindigkeit und ist bei der leichten, großflächigen Feder schon bei etwa $0{,}6\,\tfrac{\text{m}}{\text{s}}$ so groß wie ihre Gewichtskraft – danach wird sie nicht mehr schneller. Bei der schweren, kleinen Kugel spielt er auf $1{,}5\,\text{m}$ kaum eine Rolle.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Gleichmäßig beschleunigte Bewegung und Fallgesetze (Klasse 9/10), historischer Bezug zu Galilei, Anwendung im Verkehr (Reaktionszeit). Die drei Experimente lassen sich einzeln über Links mit `mode=…` aufrufen.
- **Modell:** Im Fallturm wird ohne Luftwiderstand gerechnet. In der Fallröhre wird der Luftwiderstand als proportional zu $v^2$ angenommen, mit Endgeschwindigkeiten von etwa $75\,\tfrac{\text{m}}{\text{s}}$ (Stahlkugel, Ø $3\,\text{cm}$) und $0{,}6\,\tfrac{\text{m}}{\text{s}}$ (Feder) – das sind Näherungswerte. Das Schaukeln der Feder ist nur angedeutet. Jupiter hat keine feste Oberfläche; der Wert $24{,}79\,\tfrac{\text{m}}{\text{s}^2}$ gilt in Höhe der Wolkenobergrenze – der Fallturm dort ist ein Gedankenexperiment.
- **Reaktionstest:** Das Lineal fällt nach einer zufälligen Wartezeit (1,2 bis 3,5 s). Bildschirm und Eingabegerät verzögern um einige Hundertstelsekunden; die gemessenen Zeiten liegen daher meist etwas über denen mit einem echten Lineal. Ein Vergleich mit einem echten Lineal (Partnerarbeit) bietet sich an – mit eingeschalteter ms-Skala wird das Lineal zum „Reaktionszeit-Lineal“.
- **Typische Fehlvorstellungen:**
  - „Schwere Körper fallen schneller.“ – nur der Luftwiderstand macht einen Unterschied.
  - „In gleichen Zeiten fällt der Körper gleich weit.“ – Die Abstände im Stroboskopbild werden immer größer, und zwar jeweils um denselben Betrag $g \cdot (\Delta t)^2$.
  - „Auf dem Mond gibt es keine Schwerkraft.“ – sie ist nur etwa ein Sechstel so groß.
  - „$g$ ist eine Geschwindigkeit.“ – $g$ gibt an, um wie viel $\tfrac{\text{m}}{\text{s}}$ die Geschwindigkeit pro Sekunde zunimmt.
