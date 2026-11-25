## Worum geht es?

1895 entdeckte Wilhelm Conrad Röntgen eine unsichtbare Strahlung, die durch Papier, Holz und sogar die Hand dringt. Heute weiß man: Röntgenstrahlung ist elektromagnetische Strahlung mit sehr kurzer Wellenlänge – rund tausendmal kürzer als sichtbares Licht.

### Die Röntgenröhre

In einer luftleeren Röhre treten aus einer Glühkathode Elektronen aus. Die Spannung $U$ (einige zehn Kilovolt) beschleunigt sie zur Anode. Jedes Elektron hat dort die Energie $e\cdot U$. Beim Aufprall entstehen zwei Arten von Strahlung:

- **Bremsstrahlung:** Die Elektronen werden im Feld der Atomkerne abgebremst und geben dabei Photonen ab – mal viel, mal wenig Energie. Es entsteht ein **kontinuierliches Spektrum**.
- **Charakteristische Strahlung:** Ein Elektron schlägt ein anderes aus der innersten Schale (K-Schale) eines Anodenatoms. Ein Elektron aus einer höheren Schale fällt nach und sendet ein Photon fester Energie aus: die **Kα- und Kβ-Linien**. Sie sind für jedes Element typisch.

### Die kurzwellige Grenze

Ein Photon kann höchstens die ganze Energie $e\cdot U$ eines Elektrons bekommen. Daraus folgt eine **kleinste Wellenlänge** (Gesetz von Duane und Hunt):

$$\lambda_\text{min} = \frac{h \cdot c}{e \cdot U}$$

Mit dieser Formel kann man aus dem Spektrum sogar die Planck-Konstante $h$ bestimmen.

### Messen mit dem Drehkristall

Röntgenstrahlung wird an den Atomebenen eines Kristalls reflektiert. Die Wellen, die an benachbarten Ebenen zurückgeworfen werden, verstärken sich nur, wenn ihr Gangunterschied ein Vielfaches der Wellenlänge ist (**Bragg-Bedingung**):

$$2d \cdot \sin \theta = n \cdot \lambda$$

Für jeden Glanzwinkel $\theta$ erreicht also nur eine Wellenlänge das Zählrohr, das unter $2\theta$ steht. Dreht man den Kristall langsam, misst man das ganze Spektrum. Die Simulation nutzt einen Lithiumfluorid-Kristall mit $d = 201{,}4$ pm und zeigt die erste Ordnung ($n = 1$).

### Das Moseley-Gesetz

Die Energie der Kα-Linie wächst mit der Kernladungszahl $Z$ ungefähr so:

$$E_{K\alpha} \approx 10{,}2\,\text{eV} \cdot (Z-1)^2$$

Henry Moseley ordnete damit 1913 die Elemente im Periodensystem nach $Z$ und fand Lücken für noch unbekannte Elemente.

### Der Compton-Effekt

Trifft ein Röntgenphoton auf ein (fast) freies Elektron, prallt es ab wie eine Billardkugel. Es gibt dem Elektron Energie und Impuls ab und hat danach eine **größere Wellenlänge**:

$$\Delta\lambda = \lambda' - \lambda = \lambda_C \cdot (1 - \cos\varphi), \qquad \lambda_C = \frac{h}{m_e \cdot c} \approx 2{,}43\,\text{pm}$$

Die Verschiebung hängt nur vom Streuwinkel $\varphi$ ab, nicht von $\lambda$. Arthur Compton zeigte damit 1923, dass Photonen einen **Impuls** $p = h/\lambda$ tragen.

## Ausprobieren

- [Molybdän, 30 kV](?mode=roehre&anode=mo&U=30&th=10): Drehe den Kristall von 3° bis 30°. Wo liegen die Linien?
- [Unter der Schwelle](?mode=roehre&anode=mo&U=18&th=10): Erhöhe die Spannung langsam. Ab wann erscheinen die Linien?
- [Kupfer](?mode=roehre&anode=cu&U=25&th=22.5): Vergleiche die Lage der Kα-Linie mit Molybdän.
- [Compton](?mode=compton&l0=20&phi=90): Ändere den Streuwinkel. Wann ist die Verschiebung am größten?

## Aufgaben

**1. Grenzwellenlänge.** Berechne $\lambda_\text{min}$ für $U = 30$ kV. [Aufgabe laden](?mode=roehre&anode=mo&U=30&th=10&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\lambda_\text{min} = \dfrac{1240\,\text{keV pm}}{30\,\text{keV}} \approx 41{,}3$ pm.

</details>

**2. Bragg-Winkel.** Unter welchem Glanzwinkel erscheint die Kα-Linie von Molybdän (71 pm) am LiF-Kristall? [Aufgabe laden](?mode=roehre&anode=mo&U=30&th=5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\sin\theta = \dfrac{71}{2 \cdot 201{,}4} \approx 0{,}176$, also $\theta \approx 10{,}2°$.

</details>

**3. Moseley.** Schätze die Energie der Kα-Linie von Kupfer ($Z = 29$) und vergleiche mit dem Messwert 8,04 keV. [Aufgabe laden](?mode=roehre&anode=cu&U=25&th=22.5&_hide=1)

<details><summary>Lösung anzeigen</summary>

$10{,}2\,\text{eV} \cdot 28^2 \approx 8{,}0$ keV – sehr nah am Messwert.

</details>

**4. Compton.** Ein Photon mit 20 pm wird um 90° gestreut. Wie groß ist die neue Wellenlänge, und welche Energie erhält das Elektron? [Aufgabe laden](?mode=compton&l0=20&phi=90&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\lambda' = 20 + 2{,}43 = 22{,}43$ pm. $E_e = \dfrac{1240}{20} - \dfrac{1240}{22{,}43} \approx 62{,}0 - 55{,}3 = 6{,}7$ keV.

</details>
