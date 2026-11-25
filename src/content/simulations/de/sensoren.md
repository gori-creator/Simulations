## Worum geht es?

Ein Thermostat schaltet die Heizung ab, wenn es warm genug ist. Eine Straßenlaterne geht an, wenn es dunkel wird. Dafür braucht es **Sensoren**: Bauteile, die eine Größe wie Temperatur oder Helligkeit in eine elektrische Größe umwandeln.

### Widerstände, die sich ändern

- Ein **Heißleiter** (NTC) leitet warm besser: Sein Widerstand sinkt, wenn die Temperatur steigt. Bei 25 °C hat der Sensor in der Simulation 10 kΩ, bei 60 °C nur noch etwa 2,5 kΩ.
- Ein **Fotowiderstand** (LDR) leitet im Hellen besser: Im Dunkeln hat er einige hundert Kilo-Ohm, im Sonnenlicht nur wenige hundert Ohm.

### Der Spannungsteiler

Einen Widerstand kann man nicht direkt „sehen“. Deshalb schaltet man den Sensor mit einem **Festwiderstand** in Reihe an eine Spannung (hier 5 V). Die Spannung teilt sich im Verhältnis der Widerstände auf:

$$U_\text{aus} = U \cdot \frac{R_\text{fest}}{R_\text{Sensor} + R_\text{fest}}$$

Wird der Sensorwiderstand kleiner, bekommt der Festwiderstand einen größeren Anteil der Spannung. So wird aus Temperatur oder Licht eine **Spannung**, die man messen oder weiterverarbeiten kann – zum Beispiel mit einem Mikrocontroller.

### Schalten mit einer Schwelle

Ein **Vergleicher** prüft, ob die Spannung über oder unter einer **Schaltschwelle** liegt:

- Temperaturschalter: Steigt die Spannung über die Schwelle (es ist warm), läuft der Lüfter.
- Dämmerungsschalter: Fällt die Spannung unter die Schwelle (es ist dunkel), geht die Lampe an.

Mit dem Festwiderstand und der Schwelle legt man fest, **bei welcher Temperatur oder Helligkeit** geschaltet wird.

## Ausprobieren

- [Heißleiter, kalt](?sensor=ntc&T=10&Rf=10&Us=3): Erhöhe die Temperatur. Wann springt der Lüfter an?
- [Heißleiter, 50 °C](?sensor=ntc&T=50&Rf=10&Us=3): Verändere die Schwelle so, dass der Lüfter erst bei 60 °C anläuft.
- [Tageslicht](?sensor=ldr&lg=3&Rf=10&Us=2.5): Mach es dunkler. Wann geht die Lampe an?

## Aufgaben

**1. Halbe-halbe.** Bei welcher Temperatur liegt am Festwiderstand (10 kΩ) genau die halbe Spannung, also 2,5 V? [Aufgabe laden](?sensor=ntc&T=10&Rf=10&Us=2.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

Wenn Sensor und Festwiderstand gleich groß sind: bei 25 °C (10 kΩ).

</details>

**2. Spannung berechnen.** Bei 60 °C hat der Heißleiter etwa 2,5 kΩ. Berechne die Spannung am 10-kΩ-Festwiderstand. [Aufgabe laden](?sensor=ntc&T=60&Rf=10&Us=3&_hide=1)

<details><summary>Lösung anzeigen</summary>

$U = 5\,\text{V} \cdot \dfrac{10}{2{,}5 + 10} = 4\,\text{V}$.

</details>

**3. Früher einschalten.** Die Straßenlaterne soll schon bei etwas mehr Licht angehen. Musst du die Schwelle erhöhen oder senken? [Aufgabe laden](?sensor=ldr&lg=1.5&Rf=10&Us=2.5)

<details><summary>Lösung anzeigen</summary>

Erhöhen: Bei mehr Licht ist die Spannung größer. Liegt die Schwelle höher, wird sie schon bei mehr Licht unterschritten.

</details>
