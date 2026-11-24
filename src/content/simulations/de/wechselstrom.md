## Worum geht es?

Aus der Steckdose kommt **Wechselspannung**: Sie ändert 50-mal pro Sekunde ihre Richtung und folgt einer Sinuskurve:

$$
u(t) = \hat{u} \cdot \sin(\omega t) \qquad \omega = 2\pi f
$$

Den **Effektivwert** $U = \frac{\hat{u}}{\sqrt{2}}$ gibt man meistens an – die 230 V der Steckdose sind ein Effektivwert. Ein Gleichstrom mit diesem Wert würde in einem Widerstand dieselbe Wärme erzeugen.

### Drei Bauteile, drei Verhaltensweisen

- **Widerstand $R$:** Strom und Spannung sind **in Phase**. $I = \frac{U}{R}$, unabhängig von der Frequenz.
- **Spule $L$:** Die Selbstinduktion bremst jede Stromänderung. Der Strom **eilt der Spannung um 90° nach**. Der induktive Blindwiderstand wächst mit der Frequenz: $X_L = \omega L$.
- **Kondensator $C$:** Er muss erst geladen werden, bevor Spannung anliegt. Der Strom **eilt um 90° voraus**. Der kapazitive Blindwiderstand sinkt mit der Frequenz: $X_C = \frac{1}{\omega C}$.

### Zeigerdiagramm

Eine Sinusschwingung lässt sich als **Zeiger** darstellen, der sich mit der Winkelgeschwindigkeit $\omega$ dreht. Seine Höhe ist der Momentanwert. In der Simulation drehen sich die Zeiger in Zeitlupe.

In einer **Reihenschaltung** fließt überall derselbe Strom. Die Teilspannungen zeigen in verschiedene Richtungen: $U_R$ in Richtung des Stroms, $U_L$ um 90° davor, $U_C$ um 90° dahinter. Man addiert sie **als Zeiger** (Kopf an Fuß), nicht als Zahlen:

$$
U = \sqrt{U_R^2 + (U_L - U_C)^2} \qquad Z = \frac{U}{I} = \sqrt{R^2 + (X_L - X_C)^2} \qquad \tan\varphi = \frac{X_L - X_C}{R}
$$

$Z$ heißt **Scheinwiderstand** (Impedanz), $\varphi$ ist die **Phasenverschiebung** zwischen Spannung und Strom.

### Leistung

Die Momentanleistung $p(t) = u(t) \cdot i(t)$ ist zeitweise negativ: Dann gibt die Spule oder der Kondensator Energie an die Quelle zurück. Im Mittel kommt nur die **Wirkleistung** an:

$$
P = U \cdot I \cdot \cos\varphi \qquad Q = U \cdot I \cdot \sin\varphi \qquad S = U \cdot I
$$

$Q$ ist die **Blindleistung** (sie pendelt nur hin und her), $S$ die **Scheinleistung**. Bei reiner Spule oder reinem Kondensator ist $P = 0$.

### Resonanz

Im **Reihenschwingkreis** heben sich $X_L$ und $X_C$ bei der Resonanzfrequenz gerade auf:

$$
f_0 = \frac{1}{2\pi\sqrt{L \cdot C}}
$$

Dann ist $Z = R$, der Strom ist am größten und in Phase mit der Spannung. Die Spannungen an Spule und Kondensator können dabei **viel größer** als die angelegte Spannung werden.

## Ausprobieren

- [Nur Widerstand](?kreis=R): Beide Kurven laufen im Gleichtakt, $p(t)$ ist nie negativ.
- [Nur Spule](?kreis=L): Der Strom kommt eine Viertelperiode später. Die Leistungskurve ist zur Hälfte negativ – im Mittel null.
- [Nur Kondensator](?kreis=C): Jetzt ist der Strom eine Viertelperiode früher dran. Erhöhe die Frequenz: Der Strom wird größer.
- [R und L](?kreis=RL): Verändere die Frequenz und beobachte den Winkel $\varphi$.
- [Reihenschwingkreis](?kreis=RLC&Lm=500&C=20&R=50&f=30): Erhöhe $f$ langsam bis etwa 50 Hz. Die Zeiger $U_L$ und $U_C$ werden lang, $U$ und $I$ fallen zusammen.

## Aufgaben

**1. Spule am Netz.** Eine Spule mit $L = 0{,}3\,\text{H}$ (ohne ohmschen Widerstand) liegt an $U = 12\,\text{V}$ und $f = 50\,\text{Hz}$. Berechne den Blindwiderstand und die Stromstärke. [Aufgabe laden](?kreis=L&Lm=300&f=50&U=12&_hide=1)

<details><summary>Lösung anzeigen</summary>

$X_L = 2\pi \cdot 50\,\text{Hz} \cdot 0{,}3\,\text{H} \approx 94{,}2\,\Omega$, also $I = \frac{12\,\text{V}}{94{,}2\,\Omega} \approx 127\,\text{mA}$. Der Strom eilt der Spannung um 90° nach.

</details>

**2. Kondensator und Frequenz.** Ein Kondensator mit $C = 20\,\mu\text{F}$ liegt an 50 Hz. Wie groß ist $X_C$? Was ändert sich, wenn man die Frequenz verdoppelt? [Aufgabe laden](?kreis=C&C=20&f=50&_hide=1)

<details><summary>Lösung anzeigen</summary>

$X_C = \frac{1}{2\pi \cdot 50\,\text{Hz} \cdot 20 \cdot 10^{-6}\,\text{F}} \approx 159\,\Omega$. Bei 100 Hz halbiert sich $X_C$ auf etwa $79{,}6\,\Omega$, der Strom verdoppelt sich. Für sehr hohe Frequenzen wirkt der Kondensator fast wie eine Leitung.

</details>

**3. R und L in Reihe.** $R = 100\,\Omega$ und $L = 0{,}3\,\text{H}$ liegen in Reihe an $12\,\text{V}$, $50\,\text{Hz}$. Berechne $Z$, $\varphi$, $I$ und die Wirkleistung $P$. [Aufgabe laden](?kreis=RL&R=100&Lm=300&f=50&U=12&_hide=1)

<details><summary>Lösung anzeigen</summary>

$X_L \approx 94{,}2\,\Omega$, $Z = \sqrt{100^2 + 94{,}2^2}\,\Omega \approx 137{,}4\,\Omega$, $\tan\varphi = \frac{94{,}2}{100}$, also $\varphi \approx 43{,}3°$. $I = \frac{12\,\text{V}}{137{,}4\,\Omega} \approx 87{,}3\,\text{mA}$ und $P = U \cdot I \cdot \cos\varphi = I^2 \cdot R \approx 0{,}763\,\text{W}$. Nur im Widerstand wird Energie in Wärme umgewandelt.

</details>

**4. Resonanz.** Ein Reihenschwingkreis hat $L = 0{,}5\,\text{H}$, $C = 20\,\mu\text{F}$ und $R = 50\,\Omega$ und liegt an $12\,\text{V}$. Berechne die Resonanzfrequenz, die Stromstärke bei Resonanz und die Spannung an der Spule. [Aufgabe laden](?kreis=RLC&Lm=500&C=20&R=50&U=12&f=50&_hide=1)

<details><summary>Lösung anzeigen</summary>

$f_0 = \frac{1}{2\pi\sqrt{0{,}5\,\text{H} \cdot 20 \cdot 10^{-6}\,\text{F}}} \approx 50{,}3\,\text{Hz}$. Dort ist $Z = R = 50\,\Omega$, also $I = 240\,\text{mA}$. Mit $X_L = 2\pi f_0 L \approx 158\,\Omega$ liegt an der Spule $U_L \approx 37{,}9\,\text{V}$ – mehr als dreimal so viel wie die angelegte Spannung. Am Kondensator liegt gleich viel, aber in Gegenrichtung.

</details>

## Ideen für den Unterricht

- **Einstieg:** Eine Glühlampe in Reihe mit einer Spule leuchtet an Gleichspannung hell, an Wechselspannung schwach. Warum? Die Simulation zeigt den Blindwiderstand.
- **Zeiger als Werkzeug:** Erst die Zeiger am Kreis drehen lassen und die Höhe mit dem Liniendiagramm vergleichen, dann die Teilspannungen als Kopf-an-Fuß-Kette deuten.
- **Alltagsbezug:** Blindleistung belastet die Leitungen, ohne Arbeit zu verrichten. Darum gleichen Betriebe mit vielen Motoren sie mit Kondensatoren aus.
- **Vernetzung:** Der Reihenschwingkreis ist ein angetriebener elektromagnetischer Schwingkreis – vergleiche mit der Resonanz beim Federpendel.
