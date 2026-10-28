## Worum geht es?

Bewegt sich eine Ladung $q$ mit der Geschwindigkeit $v$ senkrecht zu einem Magnetfeld $B$, wirkt auf sie die **Lorentzkraft**

$$
F = q \cdot v \cdot B .
$$

Sie steht senkrecht auf $v$ und auf $B$. Bildet $v$ mit $B$ den Winkel $\alpha$, gilt allgemein $F = q \cdot v \cdot B \cdot \sin\alpha$. Fliegt die Ladung **parallel** zu den Feldlinien, wirkt also **keine** Kraft – ebenso ohne Feld ($B = 0$).

**Richtung (Drei-Finger-Regel, „Ursache – Vermittlung – Wirkung“):** Daumen in Bewegungsrichtung (Ursache), Zeigefinger in Feldrichtung (Vermittlung), dann zeigt der Mittelfinger in Richtung der Kraft (Wirkung).

- Für **Elektronen** (negative Ladung) nimmt man die **linke Hand**. Diese Regel zeigt die Simulation.
- Für **positive Ladungen** (und für die technische Stromrichtung) nimmt man die **rechte Hand**. Die Kraft zeigt dann genau in die andere Richtung.

Weil die Kraft immer senkrecht zur Bewegung wirkt, ändert sie nur die Richtung, nicht den Betrag der Geschwindigkeit: Die Elektronen laufen auf einem **Kreis**.

**Zusammenhang mit dem Leiter im Magnetfeld:** Auf einen stromdurchflossenen Leiter der Länge $l$ senkrecht zum Feld wirkt $F = I \cdot l \cdot B$ (Leiterschaukel). Das ist die Summe der Lorentzkräfte auf alle bewegten Ladungen im Leiter.

Im **Fadenstrahlrohr** ist eine Glaskugel mit wenig Gas gefüllt. Die Elektronen stoßen mit den Gasatomen zusammen und bringen sie zum Leuchten, so wird ihre Bahn sichtbar.

**1. Beschleunigen:** Eine Elektronenkanone beschleunigt die Elektronen mit der Spannung $U$. Aus $e \cdot U = \tfrac12 m v^2$ folgt

$$
v = \sqrt{2 \cdot \frac{e}{m} \cdot U} .
$$

**2. Magnetfeld:** Zwei **Helmholtzspulen** (Windungszahl $n$, Radius $R$, Abstand $R$) erzeugen in der Mitte ein nahezu homogenes Feld

$$
B = \left(\tfrac45\right)^{3/2} \cdot \mu_0 \cdot \frac{n \cdot I}{R} .
$$

Hier ist $n = 130$, $R = 15\,\text{cm}$, also $B \approx 0{,}78\,\text{mT}$ pro Ampere.

**3. Kreisbahn:** Die Lorentzkraft wirkt als Zentripetalkraft: $e \cdot v \cdot B = \frac{m v^2}{r}$. Damit ist

$$
r = \frac{m \cdot v}{e \cdot B} = \frac{1}{B}\sqrt{\frac{2 \, U \, m}{e}}
\qquad\text{und}\qquad
\frac{e}{m} = \frac{2 \, U}{B^2 \, r^2} .
$$

Aus $U$, $I$ und dem abgelesenen Radius lässt sich also die **spezifische Ladung** $e/m$ des Elektrons bestimmen. Der Literaturwert ist $e/m \approx 1{,}76 \cdot 10^{11}\,\frac{\text{C}}{\text{kg}}$.

**Umlaufzeit:** Für einen Umlauf braucht ein Elektron

$$
T = \frac{2\pi r}{v} = \frac{2\pi \cdot m}{e \cdot B} .
$$

$T$ hängt nicht von $v$ ab: Schnellere Elektronen laufen auf einem größeren Kreis, brauchen aber genauso lange.

**Messen:**

- Die waagerechte Messleiter beginnt an der Kanone. Ihre Marken liegen bei 2, 4, 6, 8 und 10 cm **Durchmesser**.
- Man stellt den Spulenstrom so ein, dass der Strahl genau eine Marke trifft (sie leuchtet dann auf), und nimmt den Messwert auf.
- Die Marke 2 cm erreicht der Strahl mit den Reglergrenzen nicht. Dafür bräuchte man bei 100 V etwa 4,3 A, der Regler geht nur bis 3 A.
- Trägt man $2U$ über $B^2 r^2$ auf, liegen die Punkte auf einer Ursprungsgeraden mit der Steigung $e/m$.

**Zur Darstellung:** Das Magnetfeld zeigt in die Zeichenebene hinein (⊗). Die Spulen sind maßstäblich zur Glaskugel gezeichnet und daher am Rand abgeschnitten. Elektronen sind hier nicht relativistisch gerechnet; bei bis zu 300 V ist das sehr genau.

## Ausprobieren

1. Erhöhe den Spulenstrom. Wie ändert sich der Kreis? Was passiert ohne Magnetfeld? [Ohne Magnetfeld](?I=0)
2. Erhöhe die Beschleunigungsspannung bei gleichem Strom. Warum wird der Kreis größer? [Beispiel](?U=300&I=1.4)
3. Prüfe die Richtung der Kraft mit der Linke-Hand-Regel am Austrittspunkt der Kanone: Das Elektron fliegt nach oben, das Feld zeigt in die Zeichenebene hinein, die Kraft zeigt nach rechts. [Linke-Hand-Regel](?hand=1)
4. Stelle den Strahl mit dem Knopf „Strahl auf nächste Marke einstellen“ auf eine Marke und nimm Messwerte bei verschiedenen Spannungen auf. Welche Steigung hat die Gerade? [Messung](?U=200&I=1.4)
5. Stelle ein sehr starkes Feld ein: Wie klein wird der Kreis? [Starkes Feld](?U=150&I=3)

## Aufgaben

### Aufgabe 1: Magnetfeld der Helmholtzspulen

Berechne die Flussdichte für $n = 130$, $R = 15\,\text{cm}$ und $I = 1{,}0\,\text{A}$. [Aufgabe laden](?I=1&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$B = 0{,}716 \cdot 1{,}257 \cdot 10^{-6}\,\frac{\text{T}\,\text{m}}{\text{A}} \cdot \frac{130 \cdot 1{,}0\,\text{A}}{0{,}15\,\text{m}} \approx 0{,}779\,\text{mT}$. [In der Simulation zeigen](?I=1)

</details>

### Aufgabe 2: Bahnradius

Elektronen werden mit $U = 200\,\text{V}$ beschleunigt und laufen in einem Feld mit $B = 1{,}0\,\text{mT}$. Berechne Geschwindigkeit und Bahnradius. [Aufgabe laden](?U=200&I=1.28&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v = \sqrt{2 \cdot 1{,}76 \cdot 10^{11}\,\frac{\text{C}}{\text{kg}} \cdot 200\,\text{V}} \approx 8{,}39 \cdot 10^6\,\frac{\text{m}}{\text{s}}$,
$r = \frac{v}{(e/m) \cdot B} \approx 4{,}77\,\text{cm}$. In der Simulation ist mit $I = 1{,}28\,\text{A}$ das Feld $B \approx 0{,}997\,\text{mT}$, also $r \approx 4{,}78\,\text{cm}$. [In der Simulation zeigen](?U=200&I=1.28)

</details>

### Aufgabe 3: e/m bestimmen

Bei $U = 250\,\text{V}$ trifft der Strahl die Marke 8 cm, wenn $I = 1{,}71\,\text{A}$ fließt. Bestimme $e/m$. [Aufgabe laden](?U=250&I=1.71&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$B = 0{,}779\,\frac{\text{mT}}{\text{A}} \cdot 1{,}71\,\text{A} \approx 1{,}333\,\text{mT}$, $r = 4{,}0\,\text{cm}$:
$\frac{e}{m} = \frac{2 \cdot 250\,\text{V}}{(1{,}333 \cdot 10^{-3}\,\text{T})^2 \cdot (0{,}040\,\text{m})^2} \approx 1{,}76 \cdot 10^{11}\,\frac{\text{C}}{\text{kg}}$. [In der Simulation zeigen](?U=250&I=1.71)

</details>

### Aufgabe 4: Umlaufzeit

Zeige mit $r = \frac{m \cdot v}{e \cdot B}$, dass die Umlaufzeit $T$ nicht von der Geschwindigkeit abhängt. Berechne $T$ für $B = 1{,}0\,\text{mT}$. [Aufgabe laden](?U=200&I=1.28&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T = \frac{2\pi r}{v} = \frac{2\pi}{v} \cdot \frac{m \cdot v}{e \cdot B} = \frac{2\pi \cdot m}{e \cdot B}$ – das $v$ kürzt sich heraus.
$T = \frac{2\pi}{1{,}76 \cdot 10^{11}\,\frac{\text{C}}{\text{kg}} \cdot 1{,}0 \cdot 10^{-3}\,\text{T}} \approx 3{,}57 \cdot 10^{-8}\,\text{s} = 35{,}7\,\text{ns}$.
Bei $U = 300\,\text{V}$ wird der Kreis größer, $T$ bleibt gleich. [In der Simulation zeigen](?U=300&I=1.28)

</details>

### Aufgabe 5: Lorentzkraft und Gewichtskraft

Bei $U = 200\,\text{V}$ und $I = 1{,}4\,\text{A}$ ist $B \approx 1{,}09\,\text{mT}$ und $v \approx 8{,}39 \cdot 10^6\,\frac{\text{m}}{\text{s}}$. Berechne die Lorentzkraft auf ein Elektron und vergleiche sie mit seiner Gewichtskraft ($m = 9{,}11 \cdot 10^{-31}\,\text{kg}$). [Aufgabe laden](?U=200&I=1.4&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F = e \cdot v \cdot B = 1{,}60 \cdot 10^{-19}\,\text{C} \cdot 8{,}39 \cdot 10^6\,\frac{\text{m}}{\text{s}} \cdot 1{,}09 \cdot 10^{-3}\,\text{T} \approx 1{,}47 \cdot 10^{-15}\,\text{N}$.
$F_G = m \cdot g = 9{,}11 \cdot 10^{-31}\,\text{kg} \cdot 9{,}81\,\frac{\text{N}}{\text{kg}} \approx 8{,}94 \cdot 10^{-30}\,\text{N}$.
Die Lorentzkraft ist etwa $1{,}6 \cdot 10^{14}$-mal so groß. Die Gewichtskraft darf man deshalb weglassen. [In der Simulation zeigen](?U=200&I=1.4)

</details>

### Aufgabe 6: Protonen statt Elektronen

Angenommen, im Rohr würden Protonen (positive Ladung $e$, Masse $1836$-mal so groß) mit derselben Spannung $U = 200\,\text{V}$ beschleunigt, bei $B \approx 1{,}09\,\text{mT}$. In welche Richtung werden sie abgelenkt, und wie groß wäre der Bahnradius? (Für Elektronen: $r \approx 4{,}37\,\text{cm}$.)

<details>
<summary>Lösung anzeigen</summary>

Protonen sind positiv: Mit der rechten Hand zeigt die Kraft am Austrittspunkt nach **links**, der Kreis läuft andersherum.
Aus $r = \frac{1}{B}\sqrt{\frac{2\,U\,m}{e}}$ folgt $r \sim \sqrt{m}$: $r_p \approx 4{,}37\,\text{cm} \cdot \sqrt{1836} \approx 4{,}37\,\text{cm} \cdot 42{,}8 \approx 1{,}87\,\text{m}$ – viel zu groß für das Rohr.

</details>

## Ideen für den Unterricht

- Erst qualitativ (Kreis wird kleiner bei mehr Strom, größer bei mehr Spannung), dann die Formel für $r$ herleiten lassen.
- Die Messreihe von Hand aufnehmen und auswerten, danach mit „Messreihe automatisch“ vergleichen.
- **Typische Stolpersteine:**
  - „Die Lorentzkraft macht die Elektronen schneller.“ – Sie steht senkrecht zur Bewegung und ändert nur die Richtung.
  - Rechte statt linke Hand: Für Elektronen gilt die linke Hand. Mit der rechten Hand muss der Daumen gegen die Flugrichtung der Elektronen zeigen (technische Stromrichtung).
  - „Jede bewegte Ladung im Magnetfeld spürt eine Kraft.“ – Nur der Anteil der Bewegung senkrecht zu den Feldlinien zählt; parallel zum Feld ist $F = 0$.
  - Durchmesser und Radius verwechseln: Die Marken geben den Durchmesser an.
