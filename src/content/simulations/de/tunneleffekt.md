## Worum geht es?

Ein Ball, der zu langsam ist, kommt nicht über einen Hügel – er rollt zurück. Für ein Elektron gilt das nicht ganz: Es kann eine Energiebarriere **durchtunneln**, obwohl seine Energie dafür nicht reicht. Diesen **Tunneleffekt** gibt es nur in der Quantenphysik.

### Die Welle in der Barriere

Das Elektron wird durch eine **Wellenfunktion** $\psi$ beschrieben. Vor der Barriere läuft eine Welle ein, ein Teil wird zurückgeworfen. In der Barriere schwingt $\psi$ nicht mehr, sondern **klingt exponentiell ab**:

$$\psi(x) \sim e^{-\kappa x} \quad\text{mit}\quad \kappa = \frac{\sqrt{2m\,(V_0 - E)}}{\hbar}$$

Ist die Barriere dünn genug, ist $\psi$ am rechten Rand noch nicht null. Dort läuft eine kleine Welle weiter. Das Quadrat ihrer Amplitude ist die **Durchlasswahrscheinlichkeit** $T$. Für nicht zu dünne Barrieren gilt näherungsweise

$$T \approx \frac{16\,E\,(V_0 - E)}{V_0^2}\, e^{-2\kappa d}.$$

Entscheidend ist der Exponentialfaktor; der Bruch davor liegt meist zwischen 1 und 4.

Doppelte Breite bedeutet also nicht halben, sondern **quadrierten** (viel kleineren) Durchlass. Auch eine etwas höhere Barriere senkt $T$ stark.

Liegt die Energie **über** der Barriere, kommt das Elektron klassisch immer durch. Quantenphysikalisch wird trotzdem ein Teil zurückgeworfen – außer bei bestimmten Energien, bei denen die Welle genau in die Barriere passt.

### Das Rastertunnelmikroskop

Eine feine Metallspitze wird bis auf etwa einen halben Nanometer an eine leitende Oberfläche herangefahren. Dazwischen ist Vakuum – eine Barriere von einigen Elektronenvolt (die **Austrittsarbeit**). Legt man eine kleine Spannung an, tunneln Elektronen hindurch: Es fließt ein **Tunnelstrom** von etwa einem Nanoampere.

Weil der Strom exponentiell vom Abstand abhängt, ändert er sich schon bei 0,1 nm etwa um den Faktor 9. Fährt man die Spitze Zeile für Zeile über die Probe (**rastern**), entsteht aus dem Strom ein Bild, in dem einzelne **Atome**, Lücken und aufgesetzte Atome zu sehen sind. Gerd Binnig und Heinrich Rohrer erhielten dafür 1986 den Nobelpreis.

Das Diagramm in der Simulation zeigt den Strom **logarithmisch**: Eine Einheit nach oben bedeutet zehnmal so viel Strom.

**Weitere Beispiele:** Der **Alpha-Zerfall** ist ein Tunnelprozess aus dem Atomkern. **Flash-Speicher** (USB-Sticks) speichern Daten, indem Elektronen durch eine dünne Isolierschicht tunneln.

## Ausprobieren

- [Dünne Barriere](?mode=barriere&E=3&V=5&d=0.3): Wie groß ist die Durchlasswahrscheinlichkeit?
- [Dicke Barriere](?mode=barriere&E=3&V=5&d=1): Erkennst du rechts noch eine Welle?
- [Über der Barriere](?mode=barriere&E=7&V=5&d=0.5): Ändere die Breite und beobachte $T$.
- [Rastertunnelmikroskop](?mode=stm&h=0.5): Starte den Abtastvorgang. Wo ist der Strom am größten?

## Aufgaben

**1. Abklingen.** Ein Elektron mit 3 eV trifft auf eine 5 eV hohe Barriere. Berechne $\kappa$ (mit $\tfrac{\hbar^2}{2m} \approx 0{,}0381\,\text{eV nm}^2$) und schätze $T$ für $d = 0{,}4$ nm ab. [Aufgabe laden](?mode=barriere&E=3&V=5&d=0.4&_hide=1)

<details><summary>Lösung anzeigen</summary>

$\kappa = \sqrt{2 / 0{,}0381}\,\text{nm}^{-1} \approx 7{,}2\,\text{nm}^{-1}$. $T \approx e^{-2 \cdot 7{,}2 \cdot 0{,}4} = e^{-5{,}8} \approx 3 \cdot 10^{-3}$. Mit dem Vorfaktor $\tfrac{16 \cdot 3 \cdot 2}{25} \approx 3{,}8$ ergibt sich $T \approx 0{,}012$ – genau das zeigt die Simulation.

</details>

**2. Doppelte Breite.** Wie ändert sich $T$, wenn die Barriere von 0,4 nm auf 0,8 nm verbreitert wird? [Aufgabe laden](?mode=barriere&E=3&V=5&d=0.8&_hide=1)

<details><summary>Lösung anzeigen</summary>

$T$ wird etwa mit $e^{-5{,}8} \approx 0{,}003$ multipliziert, also rund 300-mal kleiner.

</details>

**3. Empfindlichkeit.** Beim Rastertunnelmikroskop ist $\kappa \approx 10{,}9\,\text{nm}^{-1}$. Um welchen Faktor steigt der Strom, wenn die Spitze 0,1 nm näher kommt? [Aufgabe laden](?mode=stm&h=0.4&_hide=1)

<details><summary>Lösung anzeigen</summary>

$e^{2 \cdot 10{,}9 \cdot 0{,}1} = e^{2{,}18} \approx 9$. Darum lassen sich Höhenunterschiede von Bruchteilen eines Atomdurchmessers messen.

</details>
