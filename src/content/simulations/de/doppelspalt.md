---
description: "Interaktive Simulation zu Doppelspalt, Mehrfachspalt und Gitter: Laserlicht wird an Spalten gebeugt, die Wellen überlagern sich, auf dem Schirm entstehen Maxima bei sin α_k = k · λ/g – mit Wellenfeld, Intensitätsverteilung und ziehbarer Messmarke."
---

## Worum geht es?

Schickt man Laserlicht durch zwei sehr schmale, eng benachbarte Spalte, sieht man auf einem weit entfernten Schirm nicht zwei helle Striche, sondern eine ganze Reihe heller und dunkler Streifen. Das lässt sich nur mit dem **Wellenmodell des Lichts** erklären: Von jedem Spalt geht nach dem **Huygens-Prinzip** eine Kreiswelle aus, und die Wellen **überlagern** sich (Interferenz).

In Richtung $\alpha$ hat das Licht aus benachbarten Spalten den **Gangunterschied** $\Delta s = g \cdot \sin\alpha$; $g$ ist der Abstand der Spaltmitten. Hauptmaxima (Verstärkung) entstehen, wenn $\Delta s$ ein Vielfaches der Wellenlänge ist:

$$
\sin\alpha_k = \frac{k \cdot \lambda}{g}, \qquad k = 0, \pm 1, \pm 2, \dots
$$

Auf einem Schirm im Abstand $a$ liegt das $k$-te Maximum bei $x_k = a \cdot \tan\alpha_k$. Für kleine Winkel gilt $\tan\alpha \approx \sin\alpha$, und benachbarte Maxima haben den Abstand

$$
\Delta x \approx \frac{\lambda \cdot a}{g}.
$$

Dunkle Streifen (Minima) liegen beim Doppelspalt genau dazwischen: Dort ist der Gangunterschied ein ungerades Vielfaches der halben Wellenlänge, $\Delta s = (2k + 1) \cdot \frac{\lambda}{2}$, und die beiden Wellen löschen sich aus.

Weil $|\sin\alpha| < 1$ sein muss, gibt es nur endlich viele Maxima: Die höchste Ordnung ist das größte $k$ mit $k < \frac{g}{\lambda}$. Ist $\lambda \geq g$, gibt es außer der Mitte gar kein Maximum.

**Mehr Spalte und Gitter:** Mit $N$ Spalten bleiben die Hauptmaxima an denselben Stellen, werden aber **schärfer und heller**; dazwischen liegen $N - 1$ Nullstellen und $N - 2$ schwache **Nebenmaxima**. Ein **Gitter** hat sehr viele Spalte mit kleinem Abstand. Sein Spaltabstand heißt **Gitterkonstante** $g = \frac{1\,\text{mm}}{\text{Strichzahl pro mm}}$, bei $500$ Strichen pro mm also $g = \frac{1\,\text{mm}}{500} = 2\,\mu\text{m}$. Die Maxima sind scharfe Linien unter großen Winkeln – ideal zum genauen Messen von Wellenlängen. Weil die Winkel groß sind, muss man hier mit $\tan$ und $\sin$ rechnen; die Kleinwinkelnäherung ist zu ungenau.

**Einzelspalt:** Auch ein einzelner Spalt der Breite $b$ beugt das Licht. Er erzeugt ein breites helles Mittelmaximum und Minima bei $\sin\alpha = k \cdot \frac{\lambda}{b}$. Diese **Einzelspalt-Hülle** begrenzt auch die Helligkeit der Maxima beim Doppelspalt und Gitter. Fällt ein Hauptmaximum genau auf ein Minimum der Hülle, fehlt es ganz („fehlende Ordnung“).

**Licht und Farbe:** Sichtbares Licht hat Wellenlängen von etwa $380\,\text{nm}$ (violett) bis $780\,\text{nm}$ (rot); der Regler deckt $400$ bis $700\,\text{nm}$ ab. Ein roter Laserpointer hat etwa $650\,\text{nm}$, ein grüner $532\,\text{nm}$. Rotes Licht wird stärker abgelenkt als blaues, die Streifen liegen also weiter auseinander.

**Zur Darstellung:** Im Aufbau oben sind die Spalte stark vergrößert und der Abstand $a$ ist nicht maßstäblich. Die Spaltbreite ist im Modell $b = \frac{g}{6}$; deshalb fehlen die Ordnungen $k = 6, 12, \dots$ Das Schirmbild und die Werte in der Tabelle sind dagegen genau berechnet.

## Ausprobieren

1. Beobachte das Wellenfeld hinter dem Doppelspalt. Wo verstärken sich die Wellen, wo löschen sie sich aus? [Beispiel laden](?xm=13)
2. Ziehe die Messmarke auf das erste helle Maximum neben der Mitte und lies $x_1$ ab. Vergleiche mit $\Delta x \approx \frac{\lambda a}{g}$.
3. Verändere $\lambda$, $g$ und $a$ nacheinander. Wie ändert sich der Abstand der Streifen jeweils?
4. Erhöhe die Anzahl der Spalte von $2$ auf $5$ und $10$. Was passiert mit den Maxima, was entsteht dazwischen? [Fünf Spalte](?N=5&env=1)
5. Schalte auf das Gitter um. Warum sieht man nur wenige, weit auseinanderliegende Linien? [Gitter](?mode=grating&gl=500&lam=500&a=1&xm=258)
6. Nur ein Spalt: Wie sieht das Muster jetzt aus? [Einzelspalt](?N=1&xm=40)

## Aufgaben

### Aufgabe 1: Roter Laser am Doppelspalt

Ein Laser ($\lambda = 650\,\text{nm}$) beleuchtet einen Doppelspalt mit $g = 0{,}10\,\text{mm}$. Der Schirm ist $2{,}0\,\text{m}$ entfernt. Wie weit liegen benachbarte Maxima auseinander? [Aufgabe laden](?val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\Delta x \approx \frac{\lambda \cdot a}{g} = \frac{650 \cdot 10^{-9}\,\text{m} \cdot 2{,}0\,\text{m}}{0{,}10 \cdot 10^{-3}\,\text{m}} = 13\,\text{mm}$. Der Winkel zum ersten Maximum ist nur $0{,}37°$, die Kleinwinkelnäherung passt also sehr gut. [In der Simulation zeigen](?xm=13)

</details>

### Aufgabe 2: Wellenlänge messen

Am gleichen Doppelspalt ($g = 0{,}10\,\text{mm}$, $a = 2{,}0\,\text{m}$) misst man vom Maximum $k = -2$ bis $k = 2$ den Abstand $52\,\text{mm}$. Bestimme $\lambda$.

<details>
<summary>Lösung anzeigen</summary>

Zwischen $k = -2$ und $k = 2$ liegen $4$ Abstände: $\Delta x = 13\,\text{mm}$. $\lambda = \frac{\Delta x \cdot g}{a} = \frac{13 \cdot 10^{-3}\,\text{m} \cdot 0{,}10 \cdot 10^{-3}\,\text{m}}{2{,}0\,\text{m}} = 650\,\text{nm}$. Über mehrere Abstände zu messen verkleinert den Messfehler.

</details>

### Aufgabe 3: Gitter

Ein Gitter hat $500$ Striche pro mm; es wird mit $\lambda = 500\,\text{nm}$ beleuchtet, der Schirm ist $1{,}0\,\text{m}$ entfernt. Berechne $\alpha_1$ und $x_1$. Welches ist die höchste sichtbare Ordnung? [Aufgabe laden](?mode=grating&gl=500&lam=500&a=1&val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$g = \frac{1\,\text{mm}}{500} = 2\,\mu\text{m}$. $\sin\alpha_1 = \frac{500\,\text{nm}}{2000\,\text{nm}} = 0{,}25$, also $\alpha_1 \approx 14{,}48°$ und $x_1 = 1{,}0\,\text{m} \cdot \tan 14{,}48° \approx 25{,}8\,\text{cm}$. Wegen $\frac{g}{\lambda} = 4$ läge $k = 4$ genau bei $90°$; sichtbar sind $k = 0, \pm 1, \pm 2, \pm 3$ ($\alpha_3 \approx 48{,}6°$). [In der Simulation zeigen](?mode=grating&gl=500&lam=500&a=1&xm=258)

</details>

### Aufgabe 4: Kleinwinkelnäherung beim Gitter

Warum darf man in Aufgabe 3 nicht mit $\Delta x \approx \frac{\lambda a}{g}$ rechnen? Vergleiche $x_1$ und $x_2$.

<details>
<summary>Lösung anzeigen</summary>

Die Winkel sind groß ($\alpha_2 = 30°$). Mit $\tan$ ergibt sich $x_2 = \tan 30° \cdot 1{,}0\,\text{m} \approx 57{,}7\,\text{cm}$, also nicht das Doppelte von $x_1 = 25{,}8\,\text{cm}$. Die Näherung würde für alle Abstände $25\,\text{cm}$ liefern.

</details>

### Aufgabe 5: Mehr Spalte

Was ändert sich am Schirmbild, wenn man statt zwei Spalten fünf Spalte mit gleichem Abstand nimmt? Was bleibt gleich? [Fünf Spalte](?N=5&env=1)

<details>
<summary>Lösung anzeigen</summary>

Die Lage der Hauptmaxima bleibt gleich, denn sie hängt nur von $g$ und $\lambda$ ab. Die Maxima werden schmaler und heller; dazwischen gibt es $4$ Nullstellen und $3$ schwache Nebenmaxima.

</details>

### Aufgabe 6: Erstes Minimum

Wo liegt beim Doppelspalt aus Aufgabe 1 das erste dunkle Minimum neben der Mitte? Begründe mit dem Gangunterschied. [Aufgabe laden](?val=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Beim ersten Minimum ist $\Delta s = \frac{\lambda}{2}$, also $\sin\alpha = \frac{\lambda}{2g} = \frac{650\,\text{nm}}{0{,}20\,\text{mm}} = 0{,}00325$. Damit $x \approx a \cdot \sin\alpha = 2{,}0\,\text{m} \cdot 0{,}00325 = 6{,}5\,\text{mm}$, genau in der Mitte zwischen $k = 0$ und $k = 1$. Die Messmarke zeigt dort $0\,\%$ Intensität. [In der Simulation zeigen](?xm=6.5)

</details>

### Aufgabe 7: Wellenlänge mit dem Gitter messen

Ein grüner Laser beleuchtet ein Gitter mit $500$ Strichen pro mm. Auf dem Schirm in $1{,}0\,\text{m}$ Abstand liegt das Maximum 1. Ordnung $27{,}6\,\text{cm}$ neben der Mitte. Bestimme $\lambda$.

<details>
<summary>Lösung anzeigen</summary>

$\tan\alpha_1 = \frac{27{,}6\,\text{cm}}{100\,\text{cm}} = 0{,}276$, also $\alpha_1 \approx 15{,}43°$ und $\sin\alpha_1 \approx 0{,}266$. Mit $g = 2\,\mu\text{m}$ folgt $\lambda = g \cdot \sin\alpha_1 \approx 2000\,\text{nm} \cdot 0{,}266 \approx 532\,\text{nm}$. Die Kleinwinkelnäherung ($\lambda \approx \frac{g \cdot x}{a}$) ergäbe $552\,\text{nm}$, also fast $4\,\%$ zu viel. [In der Simulation zeigen](?mode=grating&gl=500&lam=532&a=1&xm=276)

</details>

## Ideen für den Unterricht

- **Einsatz:** in der Oberstufe beim Wellenmodell des Lichts; die genaue Einordnung bitte am Lehrplan prüfen. Gut als Vorbereitung auf den Schülerversuch mit Laser, Doppelspalt und Gitter: erst hier vorhersagen, dann real messen.
- **Möglicher Ablauf:** an die Interferenz in der Wellenwanne anknüpfen, dann die Bedingung $\Delta s = k \cdot \lambda$ für Licht übertragen, mit der Messmarke $\Delta x$ bestimmen und zum Schluss mit dem Gitter die Wellenlänge genau messen. Mit dem Schalter „Werte im Bild anzeigen“ lassen sich Winkel und Abstände in der Tabelle verdecken; die Aufgaben-Links tun das automatisch.
- **Modell:** Fraunhofer-Näherung (Schirm weit entfernt), gleiche Spaltbreiten $b = \frac{g}{6}$, ideal monochromatisches Licht.
- **Häufige Stolpersteine:**
  - „Größerer Spaltabstand, größere Streifenabstände.“ – Umgekehrt: $\Delta x \sim \frac{1}{g}$.
  - „Das Gitter hat mehr Maxima, weil es mehr Spalte hat.“ – Die Zahl der Hauptmaxima hängt von $\frac{g}{\lambda}$ ab, nicht von $N$; mehr Spalte machen sie nur schärfer.
  - Die Kleinwinkelnäherung wird beim Gitter oft ungeprüft verwendet.
- **Weiterführend:** Spektren mit dem Gitter, Elektronenbeugung, Röntgenbeugung an Kristallen, Interferenz an dünnen Schichten.
