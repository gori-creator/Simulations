---
description: "Interaktive Achterbahn zur Energieerhaltung – Energie-Säulen, synchrone Energie-Diagramme, eigene Bahn, Kräfte im Looping und eine Messreihe zur kleinsten Starthöhe."
---

## Worum geht es?

Ein Achterbahnwagen hat oben am Start **Lageenergie** (Höhenenergie). Rollt er hinunter, wird sie in **Bewegungsenergie** umgewandelt – und beim Hochfahren wieder zurück:

$$
E_\text{pot} = m \cdot g \cdot h \qquad E_\text{kin} = \tfrac{1}{2}\, m\, v^2
$$

Ohne Reibung gilt der **Energieerhaltungssatz**: Die Summe bleibt an jeder Stelle gleich. Daraus folgt die Geschwindigkeit in jeder Höhe:

$$
m g h_0 = m g h + \tfrac{1}{2} m v^2 \quad\Rightarrow\quad v = \sqrt{2 g\,(h_0 - h)}
$$

Die Masse kürzt sich heraus: Ein schwerer und ein leichter Wagen sind an jeder Stelle **gleich schnell**, nur ihre Energien sind verschieden. Ohne Reibung kehrt der Wagen genau in der Starthöhe um; über einen Hügel kommt er nur, wenn der Hügel niedriger als $h_0$ ist.

Mit **Reibung** wird ein Teil der Energie in **innere Energie** (Reibungswärme $W_\text{R}$) umgewandelt: Schienen und Räder werden ein wenig wärmer. Diese Energie lässt sich kaum wieder nutzen, man spricht von **Energieentwertung**. Die Gesamtenergie bleibt erhalten, $E_\text{pot} + E_\text{kin}$ nimmt aber ab:

$$
E_\text{pot} + E_\text{kin} + W_\text{R} = m g h_0 = \text{konstant}
$$

**Looping (Radius $r$):** Im höchsten Punkt muss die Gewichtskraft allein höchstens so groß sein wie die nötige Zentripetalkraft: $m g \leq m \frac{v^2}{r}$, also $v \geq \sqrt{g \cdot r}$. Ohne Reibung braucht man dafür eine Starthöhe von mindestens $2{,}5 \cdot r$ über dem Tiefpunkt. Startet der Wagen niedriger (aber höher als $r$), würde er ohne Sicherungsbügel in der Höhe $h = \frac{2 h_0 + r}{3}$ aus der Bahn fallen.

## Ausprobieren

1. Drücke **Losfahren** und beobachte die Energie-Säulen. Was bleibt immer gleich? Ziehe den Wagen vor der Fahrt an eine andere Stelle der Startrampe.
2. Tippe auf die Schiene, um bis zu vier **Messpunkte** zu setzen. Die Simulation zeigt dort Höhe und Geschwindigkeit, die Tabelle die Energien. Verdopple dann die Masse: Was ändert sich, was nicht? [Doppelte Masse](?track=tal&h0=15&m=800)
3. Schalte Reibung ein. In welche Energieform wird die Energie umgewandelt? Achte auf die Säule $W_\text{R}$. Die zweite, gepunktete Linie zeigt, wie hoch der Wagen noch kommen kann. [Mit Reibung](?mu=0.03)
4. Öffne die **Energie-Diagramme**. Oben ist die Lageenergie über dem Weg ein „Energieberg“ in Form der Bahn; der Abstand bis zur waagerechten Linie ist die Bewegungsenergie. Unten stapeln sich die Energien über der Zeit – die Oberkante bleibt immer gleich. Tippe ins untere Diagramm, um die Zeit zu verschieben. [Energie-Diagramme](?mode=energy&track=tal&h0=15&mu=0.02)
5. Baue eine **eigene Bahn**: Ziehe die Punkte 1 bis 4 und den Wagen. Wann schafft er den Hügel bei Punkt 2? [Eigene Bahn](?track=eigen)
6. Sieh dir die **Kräfte im Looping** an: aus 20 m und aus 13 m Höhe. [Looping aus 20 m](?mode=loop&track=looping&h0=20) · [aus 13 m](?mode=loop&track=looping&h0=13)
7. **Entdeckungsaufgabe:** Finde die kleinste Starthöhe, mit der der Wagen den Looping schafft. Jede Fahrt erscheint als Punkt in der Messreihe. [Aufgabe starten](?mode=task&track=looping&h0=10&_hide=1)

## Aufgaben

### Aufgabe 1: Geschwindigkeit im Tal

Der Wagen startet im Tal aus $15\,\text{m}$ Höhe. Wie schnell ist er am tiefsten Punkt (ohne Reibung)? [Aufgabe laden](?track=tal&h0=15&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$$v = \sqrt{2 \cdot 9{,}81\,\tfrac{\text{m}}{\text{s}^2} \cdot 15\,\text{m}} \approx 17{,}2\,\tfrac{\text{m}}{\text{s}} \approx 62\,\tfrac{\text{km}}{\text{h}}$$

</details>

### Aufgabe 2: Energien unterwegs

Ein Wagen mit $m = 400\,\text{kg}$ startet aus $20\,\text{m}$ Höhe. Berechne seine Lageenergie am Start sowie Geschwindigkeit, Lage- und Bewegungsenergie in $10\,\text{m}$ Höhe. Prüfe mit einem Messpunkt. [Aufgabe laden](?track=tal&h0=20&m=400&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Start: $E_\text{pot} = 400 \cdot 9{,}81 \cdot 20\,\text{J} = 78\,480\,\text{J}$. In $10\,\text{m}$ Höhe ist die Hälfte davon Lageenergie ($39\,240\,\text{J}$), die andere Hälfte Bewegungsenergie ($39\,240\,\text{J}$). Daraus $v = \sqrt{2 \cdot 9{,}81 \cdot 10}\,\tfrac{\text{m}}{\text{s}} \approx 14{,}0\,\tfrac{\text{m}}{\text{s}}$.

</details>

### Aufgabe 3: Mindesthöhe für den Looping

Begründe, dass der Wagen ohne Reibung mindestens aus $2{,}5 \cdot r$ starten muss, um den Looping ($r = 6\,\text{m}$) sicher zu durchfahren. Wie schnell ist er dann oben?

<details>
<summary>Lösung anzeigen</summary>

Oben gilt $m g \leq m \frac{v^2}{r}$, also $v^2 \geq g r$. Energieerhaltung zwischen Start und höchstem Punkt ($h = 2r$):

$$m g h_0 = m g \cdot 2r + \tfrac{1}{2} m v^2 \geq m g \cdot 2r + \tfrac{1}{2} m g r \quad\Rightarrow\quad h_0 \geq 2{,}5\,r = 15\,\text{m}.$$

Oben ist dann $v = \sqrt{9{,}81 \cdot 6}\,\tfrac{\text{m}}{\text{s}} \approx 7{,}67\,\tfrac{\text{m}}{\text{s}}$. Aus $14\,\text{m}$ fiele der Wagen ohne Bügel in $h = \frac{2 \cdot 14 + 6}{3}\,\text{m} \approx 11{,}3\,\text{m}$ heraus, aus $16\,\text{m}$ schafft er es mit $v \approx 8{,}86\,\tfrac{\text{m}}{\text{s}}$ oben. [14 m](?mode=loop&track=looping&h0=14) · [16 m](?mode=loop&track=looping&h0=16)

</details>

### Aufgabe 4: Kräfte oben im Looping

Der Wagen ($400\,\text{kg}$) startet aus $20\,\text{m}$. Berechne oben die Geschwindigkeit, die Gewichtskraft, die nötige Zentripetalkraft und die Kraft der Schiene. [Aufgabe laden](?mode=loop&track=looping&h0=20&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v = \sqrt{2 \cdot 9{,}81 \cdot (20 - 12)}\,\tfrac{\text{m}}{\text{s}} \approx 12{,}5\,\tfrac{\text{m}}{\text{s}}$, $F_\text{G} = 400 \cdot 9{,}81\,\text{N} = 3924\,\text{N}$, $F_\text{Z} = \frac{400 \cdot 156{,}96}{6}\,\text{N} \approx 10\,464\,\text{N}$. Die Schiene drückt also zusätzlich mit $F_\text{N} = F_\text{Z} - F_\text{G} \approx 6540\,\text{N}$ nach unten.

</details>

### Aufgabe 5: Reibung

Starte im Tal aus $15\,\text{m}$ mit $\mu = 0{,}02$. Wie hoch kommt der Wagen auf der anderen Seite? Wie viel Energie steckt dann in der Reibungswärme? [Ausprobieren](?mode=energy&track=tal&h0=15&mu=0.02)

<details>
<summary>Lösung anzeigen</summary>

Er kehrt in etwa $13{,}4\,\text{m}$ Höhe um. Es fehlen etwa $1{,}6\,\text{m}$ Höhe, also $W_\text{R} \approx 400 \cdot 9{,}81 \cdot 1{,}59\,\text{J} \approx 6{,}2\,\text{kJ}$. Die Summe aller Energien bleibt $400 \cdot 9{,}81 \cdot 15\,\text{J} \approx 58{,}9\,\text{kJ}$. Mit Reibung braucht der Looping übrigens mehr als $15\,\text{m}$: bei $\mu = 0{,}02$ etwa $17\,\text{m}$. [Messreihe mit Reibung](?mode=task&track=looping&mu=0.02&h0=15)

</details>

### Aufgabe 6: Zu niedrig gestartet

Auf der eigenen Bahn liegt der Hügel bei Punkt 2 in $14\,\text{m}$ Höhe. Der Wagen startet ohne Reibung aus $12\,\text{m}$. Wo kehrt er um? Wie schnell ist er im Tal bei Punkt 1 ($2\,\text{m}$)? [Aufgabe laden](?track=eigen&h0=12&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ohne Reibung kehrt er genau in der Starthöhe um, also in $12\,\text{m}$ Höhe am Hang vor dem Hügel. Den $14\,\text{m}$ hohen Hügel schafft er nicht. Im Tal ist $\Delta h = 12\,\text{m} - 2\,\text{m} = 10\,\text{m}$, also $v = \sqrt{2 \cdot 9{,}81 \cdot 10}\,\tfrac{\text{m}}{\text{s}} \approx 14{,}0\,\tfrac{\text{m}}{\text{s}}$. Danach rollt er zurück zum Start und pendelt hin und her.

</details>

## Ideen für den Unterricht

- **Einsatz:** Energieerhaltung in der Mittelstufe (Jahrgangsstufe 9/10, bitte am Lehrplan prüfen); die Energie-Diagramme bereiten auf Potentialdiagramme vor, der Looping eignet sich als Vertiefung zur Kreisbewegung.
- **Entdeckungsaufgabe in Gruppen:** Jede Gruppe sucht die Mindesthöhe – erst ohne, dann mit Reibung – und begründet das Ergebnis anschließend mit $v^2 \geq g r$.
- **Modell:** Massenpunkt auf der Schiene, Reibung proportional zur Normalkraft (auch im Looping), $g = 9{,}81\,\tfrac{\text{m}}{\text{s}^2} = 9{,}81\,\tfrac{\text{N}}{\text{kg}}$. Wer im Unterricht mit $g \approx 10\,\tfrac{\text{N}}{\text{kg}}$ rechnet, erhält etwa $2\,\%$ größere Energien und Kräfte und etwa $1\,\%$ größere Geschwindigkeiten. Energien zeigt die Simulation in Kilojoule ($1\,\text{kJ} = 1000\,\text{J}$). Der gezeichnete Wagen ist größer als maßstäblich. Sicherungsbügel halten ihn auf der Schiene; wo er ohne sie abheben würde, zeigt die Simulation das an (auch „Airtime“ auf Hügeln).
- **Häufige Stolpersteine:**
  - „Schwere Wagen sind schneller.“ – Die Geschwindigkeit hängt nicht von der Masse ab.
  - „Mit Reibung geht Energie verloren.“ – Sie wird in innere Energie umgewandelt, nicht vernichtet.
  - „Für den Looping reicht eine Starthöhe von $2r$.“ – Oben braucht der Wagen noch Geschwindigkeit, deshalb $2{,}5\,r$.
