## Worum geht es?

Radiowellen, Mikrowellen, Wärmestrahlung, Licht, UV, Röntgen- und Gammastrahlung sind **dieselbe Art Welle**: elektromagnetische Wellen. Sie bestehen aus einem elektrischen und einem magnetischen Feld, die sich gegenseitig erzeugen, und brauchen kein Medium. Im Vakuum laufen alle gleich schnell, mit der **Lichtgeschwindigkeit**

$$
c \approx 3 \cdot 10^8\,\tfrac{\text{m}}{\text{s}} \qquad c = \lambda \cdot f
$$

Sie unterscheiden sich nur in der **Wellenlänge** $\lambda$ und damit in der **Frequenz** $f$. Das ganze Spektrum reicht über mehr als 18 Zehnerpotenzen, deshalb ist das Band in der Simulation **logarithmisch**: Jeder Teilstrich bedeutet „zehnmal so groß“.

### Energie und Gefahr

Elektromagnetische Strahlung gibt ihre Energie in Portionen ab, den **Photonen**. Eine Portion hat die Energie

$$
E = h \cdot f \qquad h \approx 6{,}63 \cdot 10^{-34}\,\text{J s}
$$

Je kürzer die Wellenlänge, desto mehr Energie pro Photon. Ab dem fernen UV (etwa 10 eV) reicht sie, um Elektronen aus Atomen zu lösen: Die Strahlung ist **ionisierend** und kann Erbgut schädigen. Radiowellen, Mikrowellen und Licht sind nicht ionisierend; sie wirken vor allem durch Erwärmung.

### Wie entstehen Radiowellen? Der Hertz’sche Dipol

Ein Schwingkreis aus Spule und Kondensator schwingt, strahlt aber kaum ab. Biegt man die Kondensatorplatten auseinander und streckt die Spule zu einem Draht, entsteht ein **offener Schwingkreis**: ein gerader Stab, der **Hertz’sche Dipol**. Die Elektronen darin schwingen hin und her, an den Enden wechseln sich Plus und Minus ab. Das sich ändernde Feld löst sich vom Stab und läuft als Welle davon.

Am besten schwingt ein Dipol, dessen Länge eine halbe Wellenlänge beträgt:

$$
l = \frac{\lambda}{2} = \frac{c}{2f}
$$

### Wie kommt Musik auf die Welle? Modulation

Ein Ton (Tonfrequenz) ist viel zu langsam, um selbst abgestrahlt zu werden. Man nimmt deshalb eine schnelle **Trägerschwingung** und prägt ihr den Ton auf:

- **Amplitudenmodulation (AM):** Die Amplitude des Trägers folgt dem Ton. Der Empfänger „schält“ die Hüllkurve heraus.
- **Frequenzmodulation (FM):** Die Amplitude bleibt gleich, die Frequenz schwankt im Takt des Tons. Störungen verändern vor allem die Amplitude, deshalb klingt UKW-Radio (FM) rauschärmer.

## Ausprobieren

- [Grünes Licht](?lg=-6.3): Wellenlänge etwa 500 nm – so groß wie ein Bakterium? Lies den Vergleich ab.
- [UKW-Radio](?lg=0.5): Wellenlänge etwa 3 m, Frequenz etwa 100 MHz.
- [WLAN](?lg=-0.9): etwa 12 cm, also Mikrowellen – wie im Mikrowellenherd.
- [Röntgen](?lg=-10): Die Photonenenergie ist tausendfach größer als bei Licht.
- [Hertz’scher Dipol](?mode=dipol&fMHz=100): Beobachte, wann der Strom im Stab am größten ist und wann die Ladungen an den Enden.
- [AM](?mode=mod&art=am) und [FM](?mode=mod&art=fm) vergleichen.

## Aufgaben

**1. Frequenz aus der Wellenlänge.** Ein Radiosender sendet auf UKW mit $\lambda \approx 3\,\text{m}$. Berechne die Frequenz. [Aufgabe laden](?lg=0.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$f = \frac{c}{\lambda} = \frac{3 \cdot 10^8\,\text{m/s}}{3\,\text{m}} = 10^8\,\text{Hz} = 100\,\text{MHz}$. (Die Simulation zeigt genauer $\lambda = 10^{0{,}5}\,\text{m} \approx 3{,}16\,\text{m}$ und $f \approx 94{,}8\,\text{MHz}$.)

</details>

**2. Mikrowellenherd.** Ein Mikrowellenherd arbeitet mit $f = 2{,}45\,\text{GHz}$. Welche Wellenlänge hat die Strahlung? In welchen Bereich gehört sie?

<details><summary>Lösung anzeigen</summary>

$\lambda = \frac{c}{f} = \frac{3 \cdot 10^8\,\text{m/s}}{2{,}45 \cdot 10^9\,\text{Hz}} \approx 0{,}12\,\text{m} = 12\,\text{cm}$. Das sind Mikrowellen – fast dieselbe Frequenz wie beim WLAN.

</details>

**3. Photonenenergie.** Vergleiche die Energie eines Photons von grünem Licht ($\lambda = 500\,\text{nm}$) mit der eines Röntgenphotons ($\lambda = 0{,}1\,\text{nm}$). Welches ist ionisierend? [Aufgabe laden](?lg=-10&_hide=1)

<details><summary>Lösung anzeigen</summary>

Grün: $E = \frac{h \cdot c}{\lambda} \approx \frac{6{,}63 \cdot 10^{-34} \cdot 3 \cdot 10^8}{500 \cdot 10^{-9}}\,\text{J} \approx 4{,}0 \cdot 10^{-19}\,\text{J} \approx 2{,}5\,\text{eV}$. Röntgen: 5000-mal kürzere Wellenlänge, also 5000-mal mehr Energie, etwa $12\,400\,\text{eV}$. Nur das Röntgenphoton ist ionisierend.

</details>

**4. Antennenlänge.** Wie lang muss ein $\lambda/2$-Dipol für einen Sender mit $100\,\text{MHz}$ sein? Und für $433\,\text{MHz}$ (Funkfernbedienung)? [Aufgabe laden](?mode=dipol&fMHz=100&_hide=1)

<details><summary>Lösung anzeigen</summary>

$100\,\text{MHz}$: $\lambda = 3\,\text{m}$, also $l = 1{,}5\,\text{m}$. $433\,\text{MHz}$: $\lambda \approx 0{,}69\,\text{m}$, also $l \approx 35\,\text{cm}$. Höhere Frequenz, kürzere Antenne – darum haben Handys keine langen Antennen mehr.

</details>

## Ideen für den Unterricht

- **Einstieg:** Gegenstände aus dem Alltag (Radio, Handy, Fernbedienung, Lampe, Sonnencreme, Röntgenbild) an das Band heften lassen.
- **Größenvergleich:** Die Anzeige „So groß wie“ macht die Zehnerpotenzen greifbar – von der Kleinstadt bis zum Atomkern.
- **Vernetzung:** Der Dipol ist ein aufgeklappter Schwingkreis (siehe Simulation „Elektromagnetischer Schwingkreis“). Die Photonenenergie führt zum Fotoeffekt.
- **Diskussion:** Warum ist UV-Licht gefährlich, Handystrahlung aber kaum? (Energie pro Photon statt Gesamtleistung.)
