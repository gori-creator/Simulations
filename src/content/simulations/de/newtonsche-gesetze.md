## Worum geht es?

Isaac Newton hat die Mechanik in drei Gesetzen zusammengefasst. Die Simulation zeigt zu jedem einen Versuch.

### 1. Trägheitsgesetz

> Ein Körper bleibt in Ruhe oder bewegt sich geradlinig mit gleichbleibender Geschwindigkeit, solange keine Kraft auf ihn wirkt.

Jeder Körper ist **träge**: Er „will“ seinen Bewegungszustand beibehalten. Bremst ein Lastwagen scharf, fährt die lose Kiste auf der Ladefläche erst einmal weiter – nur die Reibung bremst sie, und die reicht oft nicht. Darum gibt es **Sicherheitsgurte** und Ladungssicherung: Der Gurt übt die nötige Kraft aus, damit die Kiste (oder der Mensch) mit abgebremst wird.

### 2. Grundgleichung der Mechanik

> Die Beschleunigung eines Körpers ist proportional zur Kraft und umgekehrt proportional zu seiner Masse.

$$
F = m \cdot a
$$

Im Versuch zieht ein Gewicht über eine Rolle an einem Wagen. Die Zugkraft $F = m_Z \cdot g$ muss **beide** Massen beschleunigen, den Wagen und das Zuggewicht:

$$
a = \frac{m_Z \cdot g}{m_W + m_Z}
$$

Die Krafteinheit ergibt sich daraus: $1\,\text{N} = 1\,\text{kg} \cdot \frac{\text{m}}{\text{s}^2}$.

Gibt es **Reibung**, zieht man die Reibungskraft $\mu \cdot m_W \cdot g$ ab. In vielen Rechnungen lässt man sie weg und betrachtet den Wagen als **Massepunkt** – eine **Idealisierung**, die man mit der Simulation überprüfen kann.

### 3. Wechselwirkungsprinzip

> Übt ein Körper A eine Kraft auf B aus, so übt B eine gleich große, entgegengesetzte Kraft auf A aus („actio = reactio“).

Die gespannte Feder drückt beide Wagen mit **gleich großer** Kraft auseinander. Der leichtere Wagen wird dabei stärker beschleunigt. Danach gilt $m_1 \cdot v_1 = -m_2 \cdot v_2$.

## Ausprobieren

- [Lose Kiste](?mode=traeg&gurt=0) und [festgeschnallt](?mode=traeg&gurt=1): Drücke „Start“. Vergleiche die Geschwindigkeiten im Diagramm.
- [F = m · a](?mode=grund&mc=0.5&mh=0.1&mu=0): Das v-t-Diagramm ist eine Gerade – die Beschleunigung ist konstant.
- [Doppelte Wagenmasse](?mode=grund&mc=1&mh=0.1&mu=0): Wird die Beschleunigung halb so groß?
- [Mit Reibung](?mode=grund&mu=0.1): Wie stark weicht das Ergebnis von der Idealisierung ab?
- [Abstoßen](?mode=wechsel&m1=1&m2=2): Welcher Wagen ist schneller?

## Aufgaben

**1. Beschleunigung berechnen.** Ein Wagen ($0{,}5\,\text{kg}$) wird reibungsfrei von einem Zuggewicht mit $100\,\text{g}$ gezogen. Berechne die Beschleunigung und die Zeit für $1{,}6\,\text{m}$. [Aufgabe laden](?mode=grund&mc=0.5&mh=0.1&mu=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$a = \frac{0{,}1 \cdot 9{,}81}{0{,}5 + 0{,}1}\,\frac{\text{m}}{\text{s}^2} \approx 1{,}64\,\frac{\text{m}}{\text{s}^2}$. Aus $s = \frac{1}{2} a t^2$ folgt $t = \sqrt{\frac{2 \cdot 1{,}6}{1{,}64}}\,\text{s} \approx 1{,}40\,\text{s}$.

</details>

**2. Doppelte Masse, halbe Beschleunigung?** Verdopple die Wagenmasse auf $1\,\text{kg}$. Warum halbiert sich die Beschleunigung nicht genau? [Aufgabe laden](?mode=grund&mc=1&mh=0.1&mu=0&_hide=1)

<details><summary>Lösung anzeigen</summary>

$a = \frac{0{,}981}{1{,}1} \approx 0{,}89\,\frac{\text{m}}{\text{s}^2}$ statt $0{,}82$. Die Zugkraft beschleunigt auch das Zuggewicht selbst; die Gesamtmasse steigt von 0,6 kg auf 1,1 kg, nicht auf das Doppelte.

</details>

**3. Kiste auf der Ladefläche.** Der Lastwagen bremst mit $8\,\frac{\text{m}}{\text{s}^2}$. Die Reibungszahl zwischen Kiste und Ladefläche ist $0{,}3$. Mit welcher Verzögerung wird die Kiste gebremst? Was folgt daraus? [Aufgabe laden](?mode=traeg&gurt=0&mub=0.3&_hide=1)

<details><summary>Lösung anzeigen</summary>

Die Reibung kann höchstens $\mu \cdot g = 0{,}3 \cdot 9{,}81\,\frac{\text{m}}{\text{s}^2} \approx 2{,}9\,\frac{\text{m}}{\text{s}^2}$ bewirken. Die Kiste wird also langsamer gebremst als der Wagen und rutscht nach vorn, bis sie gegen die Stirnwand prallt. Ladung muss gesichert werden.

</details>

**4. Abstoßen.** Eine Feder drückt einen 1-kg- und einen 2-kg-Wagen auseinander. Der leichte Wagen fährt danach mit $2\,\frac{\text{m}}{\text{s}}$. Wie schnell ist der schwere? [Aufgabe laden](?mode=wechsel&m1=1&m2=2&F=20&_hide=1)

<details><summary>Lösung anzeigen</summary>

Beide erfahren gleich große Kräfte gleich lange, also gleich große, entgegengesetzte Impulse: $1\,\text{kg} \cdot 2\,\frac{\text{m}}{\text{s}} = 2\,\text{kg} \cdot v_2$, also $v_2 = 1\,\frac{\text{m}}{\text{s}}$ in die Gegenrichtung.

</details>

## Ideen für den Unterricht

- **Alltag:** Warum kippt man in einem anfahrenden Bus nach hinten? Warum braucht ein voll beladener Lastwagen einen längeren Bremsweg?
- **Messen:** Den Fahrbahnversuch real mit Lichtschranken durchführen und die Messwerte mit der Simulation vergleichen.
- **Häufiger Fehler:** Die Kräfte beim Wechselwirkungsprinzip wirken auf **verschiedene** Körper – sie heben sich deshalb nicht auf.
