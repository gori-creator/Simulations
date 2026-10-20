---
description: "Interaktive Simulation für die 10. Klasse: Sinussatz und Kosinussatz am allgemeinen Dreieck – Umkreis und Beweis über die Höhe, Quadrate an den Seiten mit dem Korrekturterm 2ab · cos γ, ein Löser für SSS, SWS, WSW und SSW (mit zwei Lösungen) und zwei Vermessungsaufgaben im Lageplan."
---

## Worum geht es?

Sinus, Kosinus und Tangens helfen im **rechtwinkligen** Dreieck. Für **beliebige** Dreiecke gibt es zwei Sätze. Dabei gehören immer eine Seite und der Winkel **gegenüber** zusammen: $a$ und $\alpha$, $b$ und $\beta$, $c$ und $\gamma$ – in der Simulation haben sie dieselbe Farbe.

**Sinussatz:** In jedem Dreieck ist das Verhältnis aus einer Seite und dem Sinus ihres Gegenwinkels gleich – und zwar gleich dem Durchmesser $2r$ des Umkreises:

$$
\frac{a}{\sin \alpha} = \frac{b}{\sin \beta} = \frac{c}{\sin \gamma} = 2r
$$

*Beweisidee:* Die Höhe $h_c$ (Fußpunkt $F$) zerlegt das Dreieck in zwei rechtwinklige Dreiecke. Im Dreieck $AFC$ gilt $\sin \alpha = \frac{h_c}{b}$, also $h_c = b \cdot \sin \alpha$; im Dreieck $BFC$ gilt $h_c = a \cdot \sin \beta$. Gleichsetzen und durch $\sin \alpha \cdot \sin \beta$ teilen ergibt $\frac{a}{\sin \alpha} = \frac{b}{\sin \beta}$. Ist ein Winkel stumpf, liegt $F$ außerhalb, und man braucht $\sin(180° - \alpha) = \sin \alpha$.

**Kosinussatz:** Für die Seite $c$ gegenüber von $\gamma$ gilt

$$
c^2 = a^2 + b^2 - 2ab \cdot \cos \gamma
$$

Das ist der „Pythagoras mit Korrektur“. Im Bild sitzen Quadrate an den Seiten. Die Höhen teilen sie in Rechtecke; die beiden Rechtecke an der Ecke $C$ haben jeweils den Inhalt $ab \cdot \cos \gamma$. Nimmt man sie weg, bleibt genau so viel übrig, wie das Quadrat über $c$ groß ist.

Für $\gamma < 90°$ ist $\cos \gamma > 0$: Es wird abgezogen, $c^2 < a^2 + b^2$. Für $\gamma = 90°$ ist $\cos \gamma = 0$ – der **Satz des Pythagoras**. Für $\gamma > 90°$ ist $\cos \gamma < 0$: Die Rechtecke liegen außen und kommen dazu, $c^2 > a^2 + b^2$.

Umgestellt erhält man einen Winkel aus drei Seiten: $\cos \gamma = \frac{a^2 + b^2 - c^2}{2ab}$. **Flächeninhalt:** Aus $A = \frac12 \cdot c \cdot h_c$ und $h_c = b \cdot \sin \alpha$ folgt $A = \frac12 \cdot b \cdot c \cdot \sin \alpha$, ebenso $A = \frac12 \cdot a \cdot b \cdot \sin \gamma$.

**Welcher Satz passt?** Drei Seiten (SSS) oder zwei Seiten mit dem Winkel dazwischen (SWS): **Kosinussatz**. Eine Seite und zwei Winkel (WSW, zuerst die Winkelsumme) oder zwei Seiten und der Gegenwinkel einer davon (SSW): **Sinussatz**. Beim Fall SSW liefert $\sin \gamma = 0{,}75$ zwei Winkel: $\gamma_1 \approx 48{,}59°$ und $\gamma_2 = 180° - \gamma_1 \approx 131{,}41°$. Beide sind möglich, wenn noch Platz für den dritten Winkel bleibt.

## Ausprobieren

1. [Sinussatz](?m=sin): Ziehe die Ecken. Die drei Balken bleiben immer gleich lang wie der Durchmesser $2r$. Der dunkle Teil ist die Seite – welcher Anteil ist das?
2. Drücke **„Beweis abspielen“**: Die Höhe fällt, die Teildreiecke leuchten nacheinander auf, die Rechnung entsteht Zeile für Zeile. Bei [stumpfem Winkel in B](?m=sin&ax=1&ay=1&bx=7&by=1&cx=10&cy=4): Wo liegt jetzt $F$? Warum gilt der Satz trotzdem?
3. [Kosinussatz](?m=cos): Drücke **„γ durch 90° fahren“** und beobachte die orangen Rechtecke an der Ecke $C$. Was passiert bei $90°$, was danach? Vergleiche [γ = 90°](?m=cos&ax=2&ay=7&bx=10&by=1&cx=2&cy=1) und [γ stumpf](?m=cos&ax=0.5&ay=1&bx=11.5&by=1&cx=4&cy=3.5).
4. [Welcher Satz passt?](?m=solve&g=sws&a=7&b=5&ga=60): Tippe oben im Bild auf SSS, SWS, WSW und SSW. Lass dir die Lösung Schritt für Schritt zeigen.
5. [SSW mit zwei Lösungen](?m=solve&g=ssw&a=4&c=6&al=30): Verkleinere $a$ auf $3\,\text{cm}$ und dann auf $2\,\text{cm}$. Wie viele Dreiecke gibt es jeweils?
6. Anwendungen: Ein Fall WSW, ein Fall SWS – [Baum am anderen Ufer](?m=app&app=tree) und [Quer über den See](?m=app&app=lake). Drücke „Messung abspielen“ und ziehe die Punkte im Lageplan.

## Aufgaben

### Aufgabe 1: Zwei Seiten und der Winkel dazwischen

Gegeben sind $a = 7\,\text{cm}$, $b = 5\,\text{cm}$ und $\gamma = 60°$. Berechne $c$ und den Flächeninhalt. [Aufgabe laden](?m=solve&g=sws&a=7&b=5&ga=60&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$c^2 = 49 + 25 - 2 \cdot 7 \cdot 5 \cdot \cos 60° = 74 - 35 = 39$, also $c = \sqrt{39}\,\text{cm} \approx 6{,}24\,\text{cm}$. $A = \frac12 \cdot 7 \cdot 5 \cdot \sin 60° \approx 15{,}16\,\text{cm}^2$. [Lösung zeigen](?m=solve&g=sws&a=7&b=5&ga=60)

</details>

### Aufgabe 2: Winkel aus drei Seiten

Ein Dreieck hat die Seiten $4\,\text{cm}$, $5\,\text{cm}$ und $6\,\text{cm}$. Berechne alle Winkel. [Aufgabe laden](?m=solve&g=sss&a=4&b=5&c=6&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Gegenüber der längsten Seite: $\cos \gamma = \frac{16 + 25 - 36}{2 \cdot 4 \cdot 5} = \frac{5}{40} = 0{,}125$, also $\gamma \approx 82{,}82°$. $\cos \alpha = \frac{25 + 36 - 16}{2 \cdot 5 \cdot 6} = 0{,}75$, also $\alpha \approx 41{,}41°$. $\beta = 180° - \alpha - \gamma \approx 55{,}77°$. [Lösung zeigen](?m=solve&g=sss&a=4&b=5&c=6)

</details>

### Aufgabe 3: Zwei Dreiecke?

Gegeben sind $a = 4\,\text{cm}$, $c = 6\,\text{cm}$ und $\alpha = 30°$. Berechne $\gamma$ und $b$. Wie viele Dreiecke gibt es? [Aufgabe laden](?m=solve&g=ssw&a=4&c=6&al=30&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Sinussatz: $\sin \gamma = \frac{6 \cdot \sin 30°}{4} = 0{,}75$. Also $\gamma_1 \approx 48{,}59°$ oder $\gamma_2 \approx 131{,}41°$. Wegen $30° + 131{,}41° < 180°$ sind beide möglich: $\beta_1 \approx 101{,}41°$, $b_1 \approx 7{,}84\,\text{cm}$ und $\beta_2 \approx 18{,}59°$, $b_2 \approx 2{,}55\,\text{cm}$. Es gibt zwei Dreiecke (Flächeninhalt etwa $11{,}76\,\text{cm}^2$ bzw. $3{,}83\,\text{cm}^2$). [Lösung zeigen](?m=solve&g=ssw&a=4&c=6&al=30)

</details>

### Aufgabe 4: Baum am anderen Ufer

Am Ufer wird eine Standlinie $|AB| = 200\,\text{m}$ abgesteckt. Von $A$ aus sieht man den Baum $T$ am anderen Ufer unter $\alpha = 70°$ zur Standlinie, von $B$ aus unter $\beta = 60°$. Wie weit ist der Baum von $A$ und von $B$ entfernt, und wie weit von der Standlinie? [Aufgabe laden](?m=app&app=tree&s=200&p1=70&p2=60&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Winkel am Baum: $180° - 70° - 60° = 50°$. Sinussatz: $|AT| = \frac{200\,\text{m} \cdot \sin 60°}{\sin 50°} \approx 226{,}1\,\text{m}$ und $|BT| = \frac{200\,\text{m} \cdot \sin 70°}{\sin 50°} \approx 245{,}3\,\text{m}$. Abstand zur Standlinie: $d = |AT| \cdot \sin 70° \approx 212{,}5\,\text{m}$. [Lösung zeigen](?m=app&app=tree&s=200&p1=70&p2=60)

</details>

### Aufgabe 5: Quer über den See

Von einem Punkt $C$ aus sind die Orte $A$ und $B$ auf beiden Seiten eines Sees $400\,\text{m}$ bzw. $300\,\text{m}$ entfernt. Der Winkel $\angle ACB$ beträgt $50°$. Wie weit sind $A$ und $B$ voneinander entfernt? [Aufgabe laden](?m=app&app=lake&d1=400&d2=300&w=50&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Kosinussatz: $c^2 = 300^2 + 400^2 - 2 \cdot 300 \cdot 400 \cdot \cos 50° \approx 250\,000 - 154\,269 = 95\,731$, also $c \approx 309{,}4\,\text{m}$. [Lösung zeigen](?m=app&app=lake&d1=400&d2=300&w=50)

</details>

### Aufgabe 6: Begründen (Knobelaufgabe)

a) In einem Dreieck ist $c^2 > a^2 + b^2$. Was folgt für $\gamma$? b) Warum gibt es im Fall SSW nur ein Dreieck, wenn die Seite gegenüber dem gegebenen Winkel die längere ist ($a \geq c$)?

<details>
<summary>Lösung anzeigen</summary>

a) Aus $c^2 = a^2 + b^2 - 2ab \cdot \cos \gamma > a^2 + b^2$ folgt $\cos \gamma < 0$, also ist $\gamma$ stumpf. [Beispiel zeigen](?m=cos&ax=0.5&ay=1&bx=11.5&by=1&cx=4&cy=3.5)

b) Der längeren Seite liegt der größere Winkel gegenüber. Aus $a \geq c$ folgt $\gamma \leq \alpha$, und weil $\alpha + \gamma < 180°$ ist, muss $\gamma$ spitz sein. Die zweite Lösung $180° - \gamma$ wäre mindestens so groß wie $180° - \alpha$ – dann bliebe für $\beta$ kein Platz. [Beispiel zeigen](?m=solve&g=ssw&a=7&c=6&al=30)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 10, Lernbereich zu Sinus- und Kosinussatz und Sinus/Kosinus am Einheitskreis (LehrplanPLUS Gymnasium Bayern; die genaue Zuordnung bitte am Lehrplan prüfen). Vorwissen: $\sin(180° - \alpha) = \sin \alpha$ und $\cos(180° - \alpha) = -\cos \alpha$.
- **Entdecken vor Beweisen:** Zuerst nur die Balken beobachten lassen („Was bleibt beim Ziehen gleich?“), dann „Beweis abspielen“ gemeinsam kommentieren. Ebenso die γ-Fahrt beim Kosinussatz: Wann wird abgezogen, wann dazugezählt?
- **Entscheidungstraining:** Kärtchen mit gegebenen Stücken (SSS, SWS, WSW, SSW) sortieren lassen; danach im Löser mit „Ergebnisse zeigen“ aus (`show=0`) selbst rechnen. Die Fälle entsprechen den Kongruenzsätzen der 7. Klasse; beim Fall SSW zeigt die Kreiskonstruktion, warum es zwei Schnittpunkte geben kann.
- **Häufige Stolpersteine:**
  - Im Sinussatz werden Seite und Winkel kombiniert, die sich nicht gegenüberliegen.
  - Beim Kosinussatz wird $a^2 + b^2 - 2ab$ zuerst ausgerechnet und dann mit $\cos \gamma$ multipliziert.
  - Im Fall SSW wird nur $\sin^{-1}$ genommen und die zweite Lösung $180° - \gamma$ übersehen.
  - Für einen stumpfen Winkel wird der Sinussatz benutzt – der Taschenrechner liefert dann den spitzen Winkel. Sicherer: den größten Winkel mit dem Kosinussatz bestimmen.
  - Der Taschenrechner steht im Bogenmaß.
