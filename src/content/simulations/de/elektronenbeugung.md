---
description: "Interaktive Simulation zur Elektronenbeugung an Graphit: Elektronen werden beschleunigt, an einer Graphitfolie gebeugt und erzeugen Elektron für Elektron zwei Ringe auf dem Leuchtschirm – mit de-Broglie-Wellenlänge λ = h/(m·v), Bragg-Bedingung, Messkreis und Diagramm r über U."
---

## Worum geht es?

In der **Elektronenbeugungsröhre** treten aus einer Glühkathode Elektronen aus und werden mit der Spannung $U$ zur Anode hin beschleunigt. Danach fliegen sie durch eine sehr dünne **Graphitfolie** und treffen auf einen Leuchtschirm. Erwartet man Teilchen, sollte dort nur ein heller Fleck entstehen. Man sieht aber zusätzlich **zwei helle Ringe** – ein typisches Beugungsmuster, wie man es von Wellen kennt.

**De Broglie** hat 1924 vorgeschlagen: Auch Teilchen mit dem Impuls $p$ haben eine Wellenlänge,

$$
\lambda = \frac{h}{p} = \frac{h}{m \cdot v}.
$$

Aus der Energie im elektrischen Feld $e \cdot U = \frac{1}{2} m v^2$ folgt $p = \sqrt{2 \cdot m \cdot e \cdot U}$ und damit

$$
\lambda = \frac{h}{\sqrt{2 \cdot m \cdot e \cdot U}} \approx \frac{1{,}226\,\text{nm}}{\sqrt{U/\text{V}}}.
$$

Bei $U = 4\,\text{kV}$ ist $\lambda \approx 19{,}4\,\text{pm}$ – viel kleiner als die Wellenlänge von Licht, aber in der Größenordnung der Atomabstände im Kristall.

Graphit besteht aus vielen winzigen Kristallen, die in alle Richtungen gedreht sind. An parallelen **Netzebenen** mit dem Abstand $d$ verstärken sich die gestreuten Wellen nach der **Bragg-Bedingung**

$$
2 \cdot d \cdot \sin\theta = \lambda .
$$

Der Strahl wird dabei um $2\theta$ abgelenkt. Weil die Kristalle in allen Richtungen liegen, bilden alle abgelenkten Strahlen einen Kegel – auf dem Schirm im Abstand $L$ einen Ring mit

$$
r = L \cdot \tan 2\theta \approx L \cdot 2\theta \approx \frac{L \cdot \lambda}{d}.
$$

Graphit hat zwei wichtige Netzebenenabstände: $d_1 = 0{,}213\,\text{nm}$ (innerer Ring) und $d_2 = 0{,}123\,\text{nm}$ (äußerer Ring). In der Röhre ist $L = 13{,}5\,\text{cm}$. Wichtig: $r \sim \lambda \sim \frac{1}{\sqrt{U}}$ – höhere Spannung, kleinere Ringe.

**Welle und Teilchen:** Auf dem Schirm kommt jedes Elektron an einem einzelnen Punkt an. Erst viele Elektronen zusammen zeigen das Ringmuster. Die Welle bestimmt nur, *wo* ein Elektron mit welcher Wahrscheinlichkeit auftrifft.

**Zur Darstellung:** Die de-Broglie-Welle im Strahl ist um ein Vielfaches vergrößert gezeichnet; ihre Länge ändert sich aber im richtigen Verhältnis mit $U$. Der Schirm ist hier eben gezeichnet; echte Röhren haben einen gekrümmten Kolben, das ändert die Radien nur wenig. Relativistische Effekte sind bei wenigen kV vernachlässigbar (etwa $0{,}2\,\%$).

## Ausprobieren

1. Beobachte den Schirm: Wie entsteht das Ringmuster aus einzelnen Elektronen? [Beispiel laden](?U=4)
2. Verändere $U$. Wie ändern sich Geschwindigkeit, Wellenlänge und die Ringe? [Kleine Spannung](?U=2.5) · [Große Spannung](?U=7.5)
3. Ziehe den gestrichelten Messkreis auf den inneren Ring und lies $r_1$ ab. Vergleiche mit $r_1 \approx \frac{L \cdot \lambda}{d_1}$. [Ring ausmessen](?U=5&rm=8&val=0)
4. Nimm mit „Messreihe automatisch“ Messwerte auf. Welche Form hat der Graph $r$ über $U$?
5. Schalte auf $r$ über $\frac{1}{\sqrt{U}}$ um. Was erkennst du? [Linearisierung](?ch=rinv)

## Aufgaben

### Aufgabe 1: Wellenlänge der Elektronen

Berechne Geschwindigkeit, Impuls und de-Broglie-Wellenlänge der Elektronen bei $U = 4{,}0\,\text{kV}$ ($m = 9{,}11 \cdot 10^{-31}\,\text{kg}$). [Aufgabe laden](?U=4&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$v = \sqrt{\frac{2 e U}{m}} = \sqrt{\frac{2 \cdot 1{,}602 \cdot 10^{-19}\,\text{C} \cdot 4000\,\text{V}}{9{,}11 \cdot 10^{-31}\,\text{kg}}} \approx 3{,}75 \cdot 10^{7}\,\frac{\text{m}}{\text{s}}$, $p = m \cdot v \approx 3{,}42 \cdot 10^{-23}\,\text{kg}\cdot\frac{\text{m}}{\text{s}}$, $\lambda = \frac{h}{p} \approx 1{,}94 \cdot 10^{-11}\,\text{m} = 19{,}4\,\text{pm}$. [In der Simulation zeigen](?U=4)

</details>

### Aufgabe 2: Ringradius vorhersagen

Berechne den Bragg-Winkel und den Radius des inneren Rings bei $U = 4{,}0\,\text{kV}$.

<details>
<summary>Lösung anzeigen</summary>

$\sin\theta_1 = \frac{\lambda}{2 d_1} = \frac{19{,}4\,\text{pm}}{426\,\text{pm}} \approx 0{,}0455$, also $\theta_1 \approx 2{,}61°$ und $2\theta_1 \approx 5{,}22°$. $r_1 = 13{,}5\,\text{cm} \cdot \tan 5{,}22° \approx 12{,}3\,\text{mm}$. Die Näherung $r \approx \frac{L \lambda}{d}$ gibt ebenfalls $12{,}3\,\text{mm}$. [In der Simulation zeigen](?U=4&rm=12.3)

</details>

### Aufgabe 3: Netzebenenabstand messen

Bei $U = 5{,}0\,\text{kV}$ misst man für den inneren Ring $r_1 = 11{,}0\,\text{mm}$. Bestimme den Netzebenenabstand $d_1$. [Aufgabe laden](?U=5&rm=8&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\lambda = \frac{1{,}226\,\text{nm}}{\sqrt{5000}} \approx 17{,}3\,\text{pm}$. $d_1 \approx \frac{L \cdot \lambda}{r_1} = \frac{135\,\text{mm} \cdot 17{,}3\,\text{pm}}{11{,}0\,\text{mm}} \approx 0{,}213\,\text{nm}$. [In der Simulation zeigen](?U=5&rm=11)

</details>

### Aufgabe 4: Doppelte Spannung

Wie ändert sich der Ringradius, wenn man die Spannung von $4\,\text{kV}$ auf $8\,\text{kV}$ verdoppelt?

<details>
<summary>Lösung anzeigen</summary>

$r \sim \lambda \sim \frac{1}{\sqrt{U}}$, also wird $r$ um den Faktor $\sqrt{2}$ kleiner: $r_1 \approx \frac{12{,}3\,\text{mm}}{1{,}41} \approx 8{,}7\,\text{mm}$. [In der Simulation zeigen](?U=8)

</details>

### Aufgabe 5: Auswertung mit Linearisierung

Erkläre, warum die Messpunkte im Diagramm $r$ über $\frac{1}{\sqrt{U}}$ auf einer Ursprungsgeraden liegen. Wie bestimmt man aus der Steigung $k$ den Netzebenenabstand? [Linearisierung](?ch=rinv)

<details>
<summary>Lösung anzeigen</summary>

$r \approx \frac{L \lambda}{d} = \frac{L \cdot h}{d \cdot \sqrt{2 m e}} \cdot \frac{1}{\sqrt{U}}$, also $r = k \cdot \frac{1}{\sqrt{U}}$ mit $k = \frac{L h}{d \sqrt{2 m e}}$. Daraus $d = \frac{L h}{k \sqrt{2 m e}}$. Die Simulation zeigt diese Auswertung nach einer Messreihe unter „Auswertung“.

</details>

### Aufgabe 6: Warum nicht mit Licht?

Grünes Licht hat $\lambda = 530\,\text{nm}$. Warum kann man damit an Graphit keine Beugungsringe erzeugen?

<details>
<summary>Lösung anzeigen</summary>

Die Bragg-Bedingung $\sin\theta = \frac{\lambda}{2d}$ ist nur für $\lambda \le 2d$ erfüllbar. Mit $2 d_1 = 0{,}43\,\text{nm}$ ist Licht rund tausendmal zu langwellig. Elektronen mit einigen kV haben dagegen Wellenlängen im pm-Bereich.

</details>

## Ideen für den Unterricht

- **Einsatz:** in der Oberstufe beim Thema Quantenobjekte und Welle-Teilchen-Dualismus; die genaue Einordnung bitte am Lehrplan prüfen. Gut als Vor- oder Nachbereitung des Realexperiments mit der Elektronenbeugungsröhre: Hier lässt sich in Ruhe messen, auch ohne Hochspannung im Raum.
- **Möglicher Ablauf:** erst das Ringmuster beobachten und die Wellenhypothese diskutieren, dann $\lambda = \frac{h}{p}$ herleiten, mit dem Messkreis Radien ablesen und schließlich über die Linearisierung den Netzebenenabstand bestimmen. Mit „Werte im Bild anzeigen“ aus (`val=0`) werden die Ergebnisse verdeckt.
- **Modell:** ebener Schirm, nur die beiden Hauptringe, Messwerte mit etwa $1{,}5\,\%$ Ablesefehler. Ein Teil der Elektronen geht ungebeugt durch (heller Fleck in der Mitte).
- **Häufige Stolpersteine:**
  - „Die Elektronen werden an den Atomen abgelenkt wie Kugeln.“ – Dann gäbe es keine scharfen Ringe; erst die Welle mit fester Wellenlänge erklärt die festen Winkel.
  - „Der Ringradius ist der Netzebenenabstand.“ – $r$ hängt von $L$, $\lambda$ und $d$ ab; große Ringe gehören zu kleinem $d$.
  - „Höhere Spannung, größere Ringe.“ – Umgekehrt: schnellere Elektronen haben kürzere Wellenlängen.
  - Beim Messen wird oft der Durchmesser $D$ abgelesen; dann gilt $D \approx \frac{2 L \lambda}{d}$.
- **Weiterführend:** Doppelspalt mit Elektronen, Elektronenmikroskop, Bragg-Reflexion von Röntgenstrahlen, Photoeffekt.
