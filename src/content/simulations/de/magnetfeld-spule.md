## Worum geht es?

1820 bemerkte **Hans Christian Ørsted**, dass eine Kompassnadel ausschlägt, wenn neben ihr Strom durch einen Draht fließt. Jeder elektrische Strom ist von einem **Magnetfeld** umgeben.

**Gerader Leiter:** Die Feldlinien sind konzentrische Kreise um den Draht. Ihre Richtung liefert die **Rechte-Faust-Regel**: Der Daumen zeigt in Stromrichtung, die gekrümmten Finger zeigen die Richtung der Feldlinien. Die **magnetische Flussdichte** $B$ (Einheit Tesla, $1\,\text{T} = 1\,\tfrac{\text{Vs}}{\text{m}^2}$) nimmt mit dem Abstand $r$ ab:

$$
B = \frac{\mu_0 \cdot I}{2\pi \cdot r}, \qquad \mu_0 = 4\pi \cdot 10^{-7}\,\tfrac{\text{Vs}}{\text{Am}} \approx 1{,}257 \cdot 10^{-6}\,\tfrac{\text{Vs}}{\text{Am}}.
$$

Beispiel: $I = 10\,\text{A}$, $r = 2\,\text{cm}$ ergibt $B = \tfrac{1{,}257 \cdot 10^{-6} \cdot 10}{2\pi \cdot 0{,}02}\,\text{T} = 0{,}1\,\text{mT}$. Das ist etwa fünfmal so viel wie das Erdmagnetfeld (rund $20\,\mu\text{T}$ waagerecht). Darum schlägt die Kompassnadel so deutlich aus.

**Zwei Leiter:** Die Felder überlagern sich. Fließen die Ströme in dieselbe Richtung, ziehen sich die Leiter an, bei entgegengesetzten Strömen stoßen sie sich ab. Die Kraft pro Meter ist $\tfrac{F}{l} = \tfrac{\mu_0 \cdot I_1 \cdot I_2}{2\pi \cdot d}$.

**Leiterschleife und Spule:** Biegt man den Draht zu einem Ring, bündeln sich die Feldlinien im Inneren. Viele Windungen hintereinander bilden eine **Spule**. Innen ist ihr Feld fast **homogen**, außen sieht es aus wie das Feld eines Stabmagneten. Für eine lange Spule gilt

$$
B = \mu_0 \cdot \mu_r \cdot \frac{N \cdot I}{l}.
$$

Beispiel: $N = 500$, $I = 2\,\text{A}$, $l = 0{,}25\,\text{m}$ ergibt $B = 1{,}257 \cdot 10^{-6} \cdot \tfrac{500 \cdot 2}{0{,}25}\,\text{T} \approx 5{,}03\,\text{mT}$. Am Ende der Spule ist das Feld nur noch etwa halb so groß.

**Elektromagnet:** Ein **Eisenkern** verstärkt das Feld stark (Permeabilitätszahl $\mu_r$ von einigen Hundert bis Tausend). Weil Eisen ab etwa $2\,\text{T}$ gesättigt ist, wird das Feld in Wirklichkeit nicht beliebig stark.

**Anwendungen:** Im **Relais** zieht der Elektromagnet einen Anker an und schließt so einen zweiten Stromkreis. Ein kleiner Strom schaltet einen großen. Im **Elektromotor** wirken auf die Seiten einer stromdurchflossenen Spule im Magnetfeld Kräfte. Der **Stromwender** (Kommutator) polt den Strom jede halbe Umdrehung um, damit sich die Spule immer weiter dreht.

## Ausprobieren

1. Erhöhe die Stromstärke langsam. Ab wann zeigen die Kompassnadeln nicht mehr nach Norden? [Ørsted](?mode=wire&I=10&w2=none&earth=1&needles=1)
2. Ziehe die Sonde vom Draht weg. Wie ändert sich $B$, wenn du den Abstand verdoppelst? [Sonde](?mode=wire&I=10&w2=none&probe=1)
3. Vergleiche gleich- und entgegengesetzt gerichtete Ströme. Wo ist das Feld null? [Zwei Leiter](?mode=wire&I=15&w2=same&dw=6&earth=0)
4. Verkürze die Spule bei gleicher Windungszahl. Was passiert mit $B$ und mit den Feldlinien innen? [Spule](?mode=coil&N=500&I=2&len=25&rad=3&core=air)
5. Verringere beim angezogenen Relais den Strom langsam. Wann fällt der Anker ab? [Relais](?mode=relay&ir=200)
6. Schalte beim Motor den Stromwender aus. Was macht die Spule jetzt? [Motor](?mode=motor&im=2&comm=0)

## Aufgaben

### Aufgabe 1: Gerader Leiter

Ein Leiter führt $I = 10\,\text{A}$. Wie groß ist $B$ in $2\,\text{cm}$ und in $4\,\text{cm}$ Abstand?

<details>
<summary>Lösung anzeigen</summary>

$B(2\,\text{cm}) = \tfrac{1{,}257 \cdot 10^{-6} \cdot 10}{2\pi \cdot 0{,}02}\,\text{T} = 0{,}1\,\text{mT}$, in doppeltem Abstand halb so viel: $0{,}05\,\text{mT}$. [In der Simulation zeigen](?mode=wire&I=10&w2=none&probe=1)

</details>

### Aufgabe 2: Ørsted-Versuch

In welchem Abstand von einem Draht mit $10\,\text{A}$ ist sein Feld so stark wie das Erdfeld ($20\,\mu\text{T}$)? Um welchen Winkel dreht sich dort eine Kompassnadel, die ohne Strom senkrecht zum Feld des Drahts nach Norden zeigt?

<details>
<summary>Lösung anzeigen</summary>

$r = \tfrac{\mu_0 \cdot I}{2\pi \cdot B} = \tfrac{1{,}257 \cdot 10^{-6} \cdot 10}{2\pi \cdot 20 \cdot 10^{-6}}\,\text{m} = 0{,}1\,\text{m} = 10\,\text{cm}$. Beide Felder sind gleich stark und stehen senkrecht aufeinander, die Nadel dreht sich also um $45^\circ$.

</details>

### Aufgabe 3: Spule

Eine Spule hat $N = 500$ Windungen, ist $25\,\text{cm}$ lang und wird von $2\,\text{A}$ durchflossen. Wie groß ist $B$ innen? Wie ändert sich $B$, wenn man die Spule bei gleicher Windungszahl auf die halbe Länge zusammenschiebt?

<details>
<summary>Lösung anzeigen</summary>

$B = 1{,}257 \cdot 10^{-6} \cdot \tfrac{500 \cdot 2}{0{,}25}\,\text{T} \approx 5{,}03\,\text{mT}$. Bei halber Länge verdoppelt sich $B$, solange die Spule noch deutlich länger als dick ist. [In der Simulation zeigen](?mode=coil&N=500&I=2&len=25&rad=3&core=air)

</details>

### Aufgabe 4: Zwei Leiter

Zwei parallele Leiter im Abstand $6\,\text{cm}$ führen je $15\,\text{A}$ in dieselbe Richtung. Wie groß ist die Kraft auf $1\,\text{m}$ Leiterlänge? Ziehen sie sich an oder stoßen sie sich ab?

<details>
<summary>Lösung anzeigen</summary>

$\tfrac{F}{l} = \tfrac{1{,}257 \cdot 10^{-6} \cdot 15 \cdot 15}{2\pi \cdot 0{,}06}\,\tfrac{\text{N}}{\text{m}} \approx 0{,}75\,\tfrac{\text{mN}}{\text{m}}$. Gleichgerichtete Ströme ziehen sich an. [In der Simulation zeigen](?mode=wire&I=15&w2=same&dw=6&earth=0)

</details>

### Aufgabe 5: Elektromotor

Die Spule eines Motors hat $50$ Windungen und eine Fläche von $12\,\text{cm}^2$. Sie liegt in einem Feld mit $B = 0{,}25\,\text{T}$ und wird von $2\,\text{A}$ durchflossen. Wie groß ist das größte Drehmoment?

<details>
<summary>Lösung anzeigen</summary>

$M = N \cdot B \cdot I \cdot A = 50 \cdot 0{,}25\,\text{T} \cdot 2\,\text{A} \cdot 0{,}0012\,\text{m}^2 = 0{,}03\,\text{N m} = 30\,\text{mN m}$. [In der Simulation zeigen](?mode=motor&im=2&comm=1)

</details>

## Ideen für den Unterricht

- **Einstieg:** Den Ørsted-Versuch mit einem dicken Draht, einem Netzgerät und einer Kompassnadel vorführen. Danach in der Simulation die Stromstärke langsam erhöhen.
- **Messen:** Mit einer Hallsonde $B$ in einer Schulspule bei verschiedenen Stromstärken und Längen messen und mit $B = \mu_0 \cdot \tfrac{N \cdot I}{l}$ vergleichen.
- **Anwendungen:** Relais und Motor auseinandernehmen lassen und die Teile in der Simulation wiederfinden.
- **Häufige Stolpersteine:**
  - Die Feldlinien zeigen nicht vom Draht weg, sondern laufen im Kreis um ihn herum.
  - Die Formel für lange Spulen gilt für kurze, dicke Spulen nur ungefähr.
  - Der Eisenkern verstärkt das Feld nicht unbegrenzt.
