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

**Fenster** sind die Schwachstellen eines Hauses. Einfachglas hat $U \approx 5{,}8\,\frac{\text{W}}{\text{m}^2 \cdot \text{K}}$, modernes Dreifachglas nur etwa $0{,}7$. Zwischen den Scheiben steckt Luft oder ein Edelgas, das schlecht leitet, und eine hauchdünne Metallschicht spiegelt die Wärmestrahlung ins Zimmer zurück.

### Alltag: Warum bleibt Tee in der Thermoskanne heiß?

Heißer Tee verliert Wärme auf allen drei Wegen: durch die Wand des Bechers (**Leitung**), mit der warmen Luft und dem Dampf über der offenen Oberfläche (**Strömung** und Verdunstung) und als **Strahlung**. Je größer der Temperaturunterschied zur Umgebung, desto schneller kühlt er ab. Darum fällt die Temperatur erst schnell, dann immer langsamer (Newton’sches Abkühlungsgesetz):

$$
T(t) = T_U + (T_0 - T_U) \cdot e^{-k t}
$$

- Ein **Deckel** hält die warme Luft und den Dampf zurück.
- Ein **doppelwandiger** Becher hat eine Luftschicht, die schlecht leitet.
- Die **Thermoskanne** hat zwischen ihren zwei Wänden ein **Vakuum**: Ohne Teilchen gibt es weder Leitung noch Strömung. Die Wände sind innen **verspiegelt** und werfen die Strahlung zurück. Übrig bleibt vor allem die Leitung über den Hals und den Verschluss.

### Alltag: Kleidung und Wind

Der Körper erzeugt in Ruhe etwa 100 W Wärme, beim zügigen Gehen deutlich mehr. Abgegeben wird sie über die Haut: durch Leitung, Strömung und Strahlung. Kleidung dämmt, weil sie Luft zwischen den Fasern festhält – wie eine Hauswand mit Dämmung. Wind bläst die warme Luftschicht an der Oberfläche weg, darum fühlt sich ein windiger Tag kälter an als ein windstiller bei gleicher Temperatur. Die Simulation rechnet ohne Schwitzen mit P = A · ΔT / (R_Kleidung + R_Luft).

### Sonnenkollektor

Ein Flachkollektor auf dem Dach nutzt alle drei Arten des Wärmetransports: Ein schwarzer Absorber schluckt die Sonnenstrahlung, über Wärmeleitung gelangt die Wärme ins Wasser, und eine Glasscheibe bremst die Verluste durch Strömung und Wärmestrahlung. Je heißer das Wasser im Vergleich zur Luft, desto mehr geht wieder verloren – der Wirkungsgrad sinkt.

## Ausprobieren

- [Winterspaziergang mit Wind](?mode=koerper&kclo=2&kta=-5&kv=6&kakt=gehen) und [T-Shirt bei 5 °C](?mode=koerper&kclo=0.5&kta=5&kv=0&kakt=ruhe): Wie viel Kleidung brauchst du, damit dir nicht kalt wird?
- [Kollektor im Sommer](?mode=kollektor&sg=800&stc=50&sta=20&sglas=1&sschw=1) und [ohne Glas, blankes Blech](?mode=kollektor&sg=800&stc=50&sta=20&sglas=0&sschw=0): Was bringen Glas und schwarze Farbe?
- [Kupfer](?mode=leitung&mat=copper) und [Holz](?mode=leitung&mat=wood&raffer=10000): Wie lange dauert es, bis das rechte Ende warm wird?
- [Wassertopf](?mode=stroemung): Wo steigt das Wasser auf, wo sinkt es ab?
- [Herdplatte](?mode=strahlung&tk=500): Vergleiche die Oberflächen.
- [Altbau](?mode=daemmung&di=0) und [gedämmt](?mode=daemmung&di=16): Achte auf den Temperaturverlauf in der Wand.
- [Einfachglas](?mode=daemmung&bau=fenster&fen=einfach&fa=4&ta=-5) und [Dreifachglas](?mode=daemmung&bau=fenster&fen=dreifach&fa=4&ta=-5): Wie viele kWh spart das Fenster an einem Wintertag?
- [Blanke Oberfläche](?mode=strahlung&tk=200&surf=0.05) und [Mensch](?mode=strahlung&tk=34&surf=0.95): Wie viel strahlt unsere Haut ab?
- [Tee im Becher](?mode=abkuehlen&gef=becher&t0=85&dauer=60): Drücke „Start“. Wann ist der Tee auf 50 °C abgekühlt?
- [Thermoskanne über 6 Stunden](?mode=abkuehlen&gef=thermos&t0=85&dauer=360): Wie warm ist der Tee am Nachmittag noch?
- [Üben](?mode=ueben&qn=1): Acht Aufgaben – zuordnen und rechnen.

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

**5. Fenster tauschen.** Ein 4 m² großes Fenster mit Einfachglas ($U = 5{,}8$) wird durch Dreifachglas ($U = 0{,}7$) ersetzt. Draußen sind −5 °C, drinnen 20 °C. Wie viele kWh spart man an einem Tag? [Aufgabe laden](?mode=daemmung&bau=fenster&fen=dreifach&fa=4&ta=-5&_hide=1)

<details><summary>Lösung anzeigen</summary>

Vorher: $5{,}8 \cdot 4 \cdot 25\,\text{W} = 580\,\text{W}$, nachher $0{,}7 \cdot 4 \cdot 25\,\text{W} = 70\,\text{W}$. Ersparnis $510\,\text{W} \cdot 24\,\text{h} \approx 12{,}2\,\text{kWh}$ pro Tag.

</details>

**6. Tee abkühlen lassen.** Tee mit 85 °C kühlt im offenen Becher mit $k = 0{,}024\,\frac{1}{\text{min}}$ ab, der Raum hat 20 °C. Wie warm ist er nach 30 Minuten? [Aufgabe laden](?mode=abkuehlen&gef=becher&t0=85&dauer=60&_hide=1)

<details><summary>Lösung anzeigen</summary>

$T = 20\,°\text{C} + 65\,\text{K} \cdot e^{-0{,}024 \cdot 30} = 20\,°\text{C} + 65\,\text{K} \cdot e^{-0{,}72} \approx 51{,}6\,°\text{C}$.

</details>

## Ideen für den Unterricht

- **Versuch:** Stäbe aus verschiedenen Metallen mit Wachs bestreichen und an einem Ende erwärmen – wo schmilzt das Wachs zuerst?
- **Konvektion sichtbar machen:** Einen Tropfen Tinte oder ein paar Tee-Krümel in einem von unten erwärmten Becherglas beobachten.
- **Energiesparen:** Mit der Wand-Ansicht ausrechnen, wie viel Heizenergie ein Winter spart, und mit einer echten Heizkostenabrechnung vergleichen.
- **Klima:** Die Erde gibt Wärme nur durch Strahlung ans All ab – das führt zum Treibhauseffekt.
- **Versuch:** Zwei gleiche Becher mit heißem Wasser – einer mit Deckel, einer offen – alle 5 Minuten messen und die Kurven mit der Simulation vergleichen.
- **Häufiger Fehler:** Kälte „kriecht“ nicht herein – es ist immer die Wärme, die von warm nach kalt fließt.
