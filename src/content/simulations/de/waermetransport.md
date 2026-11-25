## Worum geht es?

Wärme fließt von selbst immer vom **wärmeren** zum **kälteren** Körper – so lange, bis beide gleich warm sind. Dafür gibt es drei Wege.

### Wärmeleitung

Im Stab schwingen die Teilchen am heißen Ende stark und stoßen ihre Nachbarn an. So wandert die Energie durch den Stoff, **ohne dass der Stoff selbst sich bewegt**. Metalle leiten Wärme sehr gut (Kupfer, Aluminium), Holz, Glas, Styropor und vor allem Luft schlecht – sie sind **Wärmedämmstoffe**. Ein Maß dafür ist die **Wärmeleitfähigkeit** $\lambda$. Fließt Wärme durch eine Schicht der Dicke $l$ mit der Fläche $A$, gilt im Gleichgewicht

$$
P = \lambda \cdot A \cdot \frac{\Delta T}{l}
$$

### Wärmeströmung (Konvektion)

In Flüssigkeiten und Gasen kann sich der Stoff selbst bewegen. Wasser, das unten erwärmt wird, dehnt sich aus, wird leichter und **steigt auf**; kaltes Wasser sinkt an den Seiten ab. Die Strömung **trägt die Wärme mit**. So funktionieren Heizkörper, Föhn, Wind und Meeresströmungen.

### Wärmestrahlung

Jeder Körper sendet unsichtbare Infrarotstrahlung aus – je heißer, desto **viel** mehr. Strahlung braucht keinen Stoff, sie kommt auch durch das Vakuum: So wärmt uns die Sonne. Nach dem **Stefan-Boltzmann-Gesetz** wächst die abgestrahlte Leistung mit der vierten Potenz der absoluten Temperatur:

$$
P = \varepsilon \cdot \sigma \cdot A \cdot T^4 \qquad \sigma \approx 5{,}67 \cdot 10^{-8}\,\tfrac{\text{W}}{\text{m}^2\,\text{K}^4}
$$

Matt schwarze Flächen strahlen viel ab (und nehmen viel auf, Emissionsgrad $\varepsilon \approx 1$), blanke Metallflächen kaum ($\varepsilon \approx 0{,}05$). Darum ist eine Rettungsdecke silbern und eine Thermoskanne innen verspiegelt.

### Wärmedämmung

Durch eine Hauswand geht Wärme verloren. Wie gut sie dämmt, sagt der **U-Wert** (Wärmedurchgangskoeffizient): Er gibt an, wie viele Watt pro Quadratmeter und pro Kelvin Temperaturunterschied hindurchgehen.

$$
P = U \cdot A \cdot \Delta T
$$

Je kleiner $U$, desto besser. Eine Dämmschicht aus Styropor enthält viel eingeschlossene Luft und senkt den U-Wert stark.

## Ausprobieren

- [Kupfer](?mode=leitung&mat=copper) und [Holz](?mode=leitung&mat=wood&raffer=10000): Wie lange dauert es, bis das rechte Ende warm wird?
- [Wassertopf](?mode=stroemung): Wo steigt das Wasser auf, wo sinkt es ab?
- [Herdplatte](?mode=strahlung&tk=500): Vergleiche die Oberflächen.
- [Altbau](?mode=daemmung&di=0) und [gedämmt](?mode=daemmung&di=16): Achte auf den Temperaturverlauf in der Wand.

## Aufgaben

**1. Kupfer oder Holz?** Ein 20 cm langer Stab mit 1 cm² Querschnitt verbindet 100 °C mit 20 °C. Berechne den Wärmestrom für Kupfer ($\lambda = 390\,\tfrac{\text{W}}{\text{m K}}$) und Holz ($\lambda = 0{,}13\,\tfrac{\text{W}}{\text{m K}}$). [Aufgabe laden](?mode=leitung&mat=copper&th=100&_hide=1)

<details><summary>Lösung anzeigen</summary>

Kupfer: $P = 390 \cdot 10^{-4} \cdot \frac{80}{0{,}2}\,\text{W} = 15{,}6\,\text{W}$. Holz: $P = 0{,}13 \cdot 10^{-4} \cdot \frac{80}{0{,}2}\,\text{W} \approx 0{,}005\,\text{W}$ – 3000-mal weniger. Darum haben Kochlöffel einen Holzstiel.

</details>

**2. Doppelte Temperatur?** Eine matt schwarze Fläche ($\varepsilon = 0{,}95$) hat 200 °C. Wie viel strahlt 1 m² ab? Wie viel bei 500 °C? [Aufgabe laden](?mode=strahlung&tk=200&_hide=1)

<details><summary>Lösung anzeigen</summary>

$T = 473\,\text{K}$: $P = 0{,}95 \cdot 5{,}67 \cdot 10^{-8} \cdot 473^4\,\text{W} \approx 2{,}7\,\text{kW}$. Bei $773\,\text{K}$: etwa $19\,\text{kW}$ – siebenmal so viel, weil $\left(\frac{773}{473}\right)^4 \approx 7{,}1$. Man muss in Kelvin rechnen!

</details>

**3. Lohnt sich die Dämmung?** 10 m² Ziegelwand (24 cm, $\lambda = 0{,}8$) trennt 20 °C innen von −5 °C außen. Berechne den Wärmeverlust ohne und mit 16 cm Styropor ($\lambda = 0{,}035$). Die Übergangswiderstände sind $R_\text{si} = 0{,}13$ und $R_\text{se} = 0{,}04\,\tfrac{\text{m}^2\text{K}}{\text{W}}$. [Aufgabe laden](?mode=daemmung&dw=24&di=0&ta=-5&_hide=1)

<details><summary>Lösung anzeigen</summary>

Ohne: $U = \frac{1}{0{,}13 + 0{,}30 + 0{,}04} \approx 2{,}13\,\tfrac{\text{W}}{\text{m}^2\text{K}}$, $P = 2{,}13 \cdot 10 \cdot 25\,\text{W} \approx 532\,\text{W}$ (etwa 12,8 kWh pro Tag).
Mit Dämmung: $U = \frac{1}{0{,}13 + 0{,}30 + 4{,}57 + 0{,}04} \approx 0{,}20$, $P \approx 50\,\text{W}$ – rund ein Zehntel.

</details>

**4. Welcher Transport?** Ordne zu: Heizkörper unter dem Fenster – Sonnenbrand – heißer Topfgriff – Thermoskanne mit Spiegelschicht.

<details><summary>Lösung anzeigen</summary>

Heizkörper: vor allem **Strömung** (warme Luft steigt auf). Sonnenbrand: **Strahlung**. Topfgriff: **Leitung**. Thermoskanne: Die Spiegelschicht verhindert **Strahlung**, das Vakuum dazwischen **Leitung** und **Strömung**.

</details>

## Ideen für den Unterricht

- **Versuch:** Stäbe aus verschiedenen Metallen mit Wachs bestreichen und an einem Ende erwärmen – wo schmilzt das Wachs zuerst?
- **Konvektion sichtbar machen:** Einen Tropfen Tinte oder ein paar Tee-Krümel in einem von unten erwärmten Becherglas beobachten.
- **Energiesparen:** Mit der Wand-Ansicht ausrechnen, wie viel Heizenergie ein Winter spart, und mit einer echten Heizkostenabrechnung vergleichen.
- **Klima:** Die Erde gibt Wärme nur durch Strahlung ans All ab – das führt zum Treibhauseffekt.
