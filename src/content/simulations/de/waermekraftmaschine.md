## Worum geht es?

Automotoren, Dampfturbinen im Kraftwerk und Wärmepumpen haben eines gemeinsam: Ein Gas durchläuft immer wieder einen **Kreisprozess**. Es nimmt Wärme auf, dehnt sich aus, schiebt einen Kolben – und kehrt am Ende in seinen Anfangszustand zurück.

### Innere Energie und erster Hauptsatz

Die Teilchen eines Gases bewegen sich ungeordnet; ihre Bewegungsenergie ist die **innere Energie** $U$. Sie ändert sich, wenn Wärme $Q$ zugeführt oder Arbeit $W$ am Gas verrichtet wird:

$$
\Delta U = Q + W
$$

Das ist der **erste Hauptsatz**: Energie geht nicht verloren, sie wird nur umgewandelt.

### Der Carnot-Kreisprozess

Die Simulation zeigt den idealen Kreisprozess nach Sadi Carnot in vier Schritten:

1. **Isotherme Ausdehnung** bei $T_h$: Das Gas nimmt die Wärme $Q_h$ vom heißen Speicher auf.
2. **Adiabatische Ausdehnung**: kein Wärmeaustausch, das Gas kühlt auf $T_k$ ab.
3. **Isotherme Verdichtung** bei $T_k$: Das Gas gibt die Wärme $Q_k$ an den kalten Speicher ab.
4. **Adiabatische Verdichtung** zurück zum Anfang.

Im **p-V-Diagramm** ist die eingeschlossene Fläche die abgegebene Arbeit $W = Q_h - Q_k$.

### Wirkungsgrad und zweiter Hauptsatz

Nicht die ganze Wärme kann zu Arbeit werden – ein Teil muss immer ans Kalte abgegeben werden. Selbst die ideale Maschine erreicht nur den **Carnot-Wirkungsgrad**

$$
\eta = \frac{W}{Q_h} = 1 - \frac{T_k}{T_h} \qquad (T \text{ in Kelvin})
$$

Je heißer die heiße und je kälter die kalte Seite, desto besser. Echte Maschinen liegen deutlich darunter.

### Entropie

Die **Entropie** $S$ misst, wie „entwertet“ Energie ist. Bei einem umkehrbaren (**reversiblen**) Prozess gilt $\frac{Q_h}{T_h} = \frac{Q_k}{T_k}$ – die Entropie bleibt gleich. Fließt Wärme dagegen **direkt** vom Heißen zum Kalten, nimmt die Entropie zu:

$$
\Delta S = \frac{Q}{T_k} - \frac{Q}{T_h} > 0
$$

Dieser Vorgang ist **irreversibel**: Von selbst fließt Wärme nie vom Kalten zum Heißen (**zweiter Hauptsatz**).

### Wärmepumpe und Kühlschrank

Läuft der Kreisprozess **rückwärts**, pumpt er mit der Arbeit $W$ Wärme vom Kalten ins Warme. Eine Wärmepumpe holt Wärme aus der Außenluft und heizt das Haus; ein Kühlschrank holt sie aus dem Innenraum. Die ideale **Leistungszahl** ist

$$
\varepsilon = \frac{Q_h}{W} = \frac{T_h}{T_h - T_k}
$$

Je kleiner der Temperaturunterschied, desto mehr Wärme pro Joule Strom.

## Ausprobieren

- [Motor](?mode=motor&th=327&tc=27): Verfolge den Punkt im p-V-Diagramm und die Wärmepfeile am Zylinder.
- [Kraftwerk](?mode=motor&th=550&tc=30): Wie groß ist der Wirkungsgrad höchstens?
- [Wärmepumpe](?mode=pumpe&th=35&tc=5) und [bei Frost](?mode=pumpe&th=35&tc=-15): Wie ändert sich die Leistungszahl?
- [Direkter Wärmefluss](?mode=direkt&th=227&tc=-23): Was passiert mit der Entropie?

## Aufgaben

**1. Wirkungsgrad eines Kraftwerks.** Ein Dampfkraftwerk arbeitet zwischen 550 °C und 30 °C. Wie groß ist der Wirkungsgrad höchstens? [Aufgabe laden](?mode=motor&th=550&tc=30&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\eta = 1 - \frac{303\,\text{K}}{823\,\text{K}} \approx 0{,}63 = 63\,\%$. Echte Kraftwerke erreichen etwa 40–45 %. Mehr als die Hälfte der Wärme geht als Abwärme an Fluss oder Kühlturm.

</details>

**2. Wärme und Arbeit.** Im Motor zwischen 327 °C und 27 °C nimmt das Gas pro Umlauf etwa 346 J Wärme auf. Wie viel Arbeit gibt es ab, wie viel Wärme landet auf der kalten Seite? [Aufgabe laden](?mode=motor&th=327&tc=27&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\eta = 1 - \frac{300\,\text{K}}{600\,\text{K}} = 0{,}5$. Also $W \approx 173\,\text{J}$ und $Q_k \approx 173\,\text{J}$.

</details>

**3. Wärmepumpe im Winter.** Eine Wärmepumpe heizt mit 35 °C Vorlauf. Vergleiche die ideale Leistungszahl bei 5 °C und bei −15 °C Außentemperatur. [Aufgabe laden](?mode=pumpe&th=35&tc=5&_hide=1)

<details><summary>Lösung anzeigen</summary>

Bei 5 °C: $\varepsilon = \frac{308}{30} \approx 10{,}3$. Bei −15 °C: $\varepsilon = \frac{308}{50} \approx 6{,}2$. Bei Frost braucht die Pumpe für dieselbe Wärme deutlich mehr Strom. Echte Geräte erreichen etwa die Hälfte dieser Werte.

</details>

**4. Entropie beim Abkühlen.** 1000 J fließen direkt von einem 227 °C heißen Körper auf einen −23 °C kalten. Berechne die Entropieänderung. [Aufgabe laden](?mode=direkt&th=227&tc=-23&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\Delta S = \frac{1000\,\text{J}}{250\,\text{K}} - \frac{1000\,\text{J}}{500\,\text{K}} = 4\,\tfrac{\text{J}}{\text{K}} - 2\,\tfrac{\text{J}}{\text{K}} = 2\,\tfrac{\text{J}}{\text{K}}$. Die Entropie nimmt zu – der Vorgang lässt sich nicht von selbst umkehren.

</details>

## Ideen für den Unterricht

- **Alltag:** Warum steht hinter dem Kühlschrank ein warmes Gitter? Warum lohnen sich Wärmepumpen besonders mit Fußbodenheizung (niedriger Vorlauf)?
- **Historisch:** Carnot fand seine Formel 1824, noch bevor man wusste, was Wärme eigentlich ist.
- **Bewerten:** Warum ist „Strom aus Wärme“ grundsätzlich verlustreich, „Wärme aus Strom“ per Wärmepumpe aber sehr effizient?
