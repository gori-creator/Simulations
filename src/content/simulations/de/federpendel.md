---
description: "Interaktive Simulation zum Federpendel – harmonische Schwingung mit Zeigerdiagramm, y(t)-, v(t)- und a(t)-Diagramm, Energieumwandlung, Dämpfung und Messung der Periodendauer T = 2π·√(m/D) mit der Stoppuhr."
---

## Worum geht es?

Ein Körper der Masse $m$ hängt an einer Schraubenfeder mit der **Federhärte** $D$. In der **Ruhelage** ist die Feder um $s_0$ gedehnt; dort ist die Federkraft genauso groß wie die Gewichtskraft:

$$
D \cdot s_0 = m \cdot g \qquad\Rightarrow\qquad s_0 = \frac{m \cdot g}{D}
$$

Lenkt man den Körper um die **Elongation** $y$ aus der Ruhelage aus (hier: nach oben positiv), bleibt als resultierende Kraft die **Rückstellkraft**

$$
F = -D \cdot y .
$$

Sie ist proportional zur Elongation und ihr entgegengesetzt (**lineares Kraftgesetz**). Daraus folgt eine **harmonische Schwingung** mit dem Zeit-Elongation-Gesetz

$$
y(t) = \hat y \cdot \sin(\omega t + \varphi_0), \qquad \omega = \frac{2\pi}{T} = 2\pi f .
$$

Dabei ist $\hat y$ die **Amplitude**, $\omega$ die **Kreisfrequenz** und $\varphi_0$ der **Nullphasenwinkel** (Lage zur Zeit $t = 0$). Für die **Periodendauer** gilt

$$
T = 2\pi \sqrt{\frac{m}{D}} .
$$

$T$ hängt weder von der Amplitude noch vom Ortsfaktor $g$ ab: Die Gewichtskraft verschiebt nur die Ruhelage.

**Zeigerdiagramm:** Ein Zeiger der Länge $\hat y$ dreht sich mit der Winkelgeschwindigkeit $\omega$ gegen den Uhrzeigersinn. Der Winkel zur Waagerechten ist der Phasenwinkel $\varphi = \omega t + \varphi_0$; die senkrechte Projektion der Zeigerspitze ist die Elongation $y$. Eine volle Umdrehung dauert genau eine Periode.

**Geschwindigkeit und Beschleunigung** sind ebenfalls sinusförmig:

$$
v(t) = \hat y \, \omega \cos(\omega t + \varphi_0), \qquad a(t) = -\hat y \, \omega^2 \sin(\omega t + \varphi_0) = -\omega^2 \, y(t)
$$

In der Ruhelage ist der Betrag der Geschwindigkeit am größten ($\hat v = \hat y \, \omega$), in den Umkehrpunkten die Beschleunigung ($\hat a = \hat y \, \omega^2$).

**Energie:** Spann- und Lageenergie zusammen ändern sich wie $\tfrac12 D y^2$. Ohne Reibung gilt

$$
\tfrac12 D y^2 + \tfrac12 m v^2 = \tfrac12 D \hat y^2 = \text{konstant}.
$$

Mit **Dämpfung** wird Energie in innere Energie umgewandelt; die Amplitude nimmt mit $e^{-\delta t}$ ab.

## Ausprobieren

1. Ziehe den Körper nach unten und lass ihn los. Verfolge, wie die Projektion des Zeigers und der Körper gemeinsam auf und ab gehen.
2. Halte an und tippe in eines der Diagramme: Die Zeitmarke zeigt den Zustand zu diesem Zeitpunkt. Setze sie auf einen Hochpunkt von $y(t)$. Was gilt dort für $v$ und $a$?
3. Starte die Stoppuhr, wenn der Zeiger an einer gut erkennbaren Stelle ist, und stoppe nach 10 vollen Umdrehungen. Vergleiche $T = t/10$ mit der Formel.
4. Verändere die Amplitude. Ändert sich die Periodendauer? [Kleine Amplitude](?amp=2)
5. Vergleiche zwei Pendel: vierfache Masse [Beispiel laden](?cmp=1&m=0.25&m2=1&D2=20) oder vierfache Federhärte [Beispiel laden](?cmp=1&m=0.3&D=10&m2=0.3&D2=40).
6. Schau dir die Kräfte und alle drei Energieformen an. Warum ändert sich die Bewegungsenergie so wenig? [Kräfte und Energieformen](?energy=full&vec=F&graphs=yv)
7. Schalte die Dämpfung ein und beobachte Zeiger, Diagramm und Energie. [Gedämpft](?damp=0.3&graphs=y)

## Aufgaben

### Aufgabe 1: Periodendauer berechnen

Ein Körper mit $m = 0{,}5\,\text{kg}$ hängt an einer Feder mit $D = 20\,\tfrac{\text{N}}{\text{m}}$. Berechne Periodendauer und Frequenz und prüfe mit der Stoppuhr. [Aufgabe laden](?per=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$T = 2\pi\sqrt{\frac{0{,}5\,\text{kg}}{20\,\text{N/m}}} \approx 0{,}99\,\text{s}$ und $f = \frac1T \approx 1{,}01\,\text{Hz}$. Zehn Perioden dauern also knapp $10\,\text{s}$. [In der Simulation zeigen](?per=1)

</details>

### Aufgabe 2: Federhärte aus einer Messung

Ein Körper mit $m = 0{,}4\,\text{kg}$ führt 10 Schwingungen in $12{,}6\,\text{s}$ aus. Wie groß ist die Federhärte?

<details>
<summary>Lösung anzeigen</summary>

$T = 1{,}26\,\text{s}$. Aus $T = 2\pi\sqrt{m/D}$ folgt $D = \frac{4\pi^2 m}{T^2} = \frac{4\pi^2 \cdot 0{,}4\,\text{kg}}{(1{,}26\,\text{s})^2} \approx 9{,}9\,\tfrac{\text{N}}{\text{m}}$, also etwa $10\,\tfrac{\text{N}}{\text{m}}$. [Prüfen](?m=0.4&D=10)

</details>

### Aufgabe 3: Doppelte Periodendauer

Wie muss man die Masse ändern, damit sich die Periodendauer verdoppelt? Und wie die Federhärte?

<details>
<summary>Lösung anzeigen</summary>

Wegen $T \sim \sqrt{m}$ braucht man die **vierfache** Masse, wegen $T \sim \frac{1}{\sqrt{D}}$ alternativ eine Feder mit einem **Viertel** der Federhärte. [Vergleich zeigen](?cmp=1&m=0.25&m2=1&D2=20)

</details>

### Aufgabe 4: Höchstwerte

Für $m = 0{,}5\,\text{kg}$, $D = 20\,\tfrac{\text{N}}{\text{m}}$ und $\hat y = 8\,\text{cm}$: Berechne die größte Geschwindigkeit und die größte Beschleunigung. Wo treten sie auf? [Aufgabe laden](?_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\omega = \sqrt{D/m} \approx 6{,}32\,\tfrac1{\text{s}}$, also $\hat v = \hat y\,\omega \approx 0{,}51\,\tfrac{\text{m}}{\text{s}}$ (beim Durchgang durch die Ruhelage) und $\hat a = \hat y\,\omega^2 = 3{,}2\,\tfrac{\text{m}}{\text{s}^2}$ (in den Umkehrpunkten, zur Ruhelage hin gerichtet).

</details>

### Aufgabe 5: Dehnung und Periodendauer

Zeige mit $s_0 = \frac{m g}{D}$, dass $T = 2\pi\sqrt{\frac{s_0}{g}}$ gilt. Wie groß ist $T$ bei $s_0 = 24{,}5\,\text{cm}$?

<details>
<summary>Lösung anzeigen</summary>

Aus $s_0 = \frac{mg}{D}$ folgt $\frac{m}{D} = \frac{s_0}{g}$, also $T = 2\pi\sqrt{\frac{s_0}{g}} = 2\pi\sqrt{\frac{0{,}245\,\text{m}}{9{,}81\,\text{m/s}^2}} \approx 0{,}99\,\text{s}$. Man kann $T$ also schon an der Dehnung in der Ruhelage ablesen – unabhängig davon, wie $m$ und $D$ einzeln gewählt sind. [Beispiel: m und D verdoppelt](?m=1&D=40)

</details>

### Aufgabe 6: Phasenwinkel

Der Körper wird aus der Ruhelage nach oben angestoßen: $y(t) = 8\,\text{cm} \cdot \sin(\omega t)$. Wo ist er bei $t = \tfrac14 T$, $t = \tfrac12 T$ und $t = \tfrac34 T$? Welcher Nullphasenwinkel gehört zu „nach unten ziehen und loslassen“?

<details>
<summary>Lösung anzeigen</summary>

Bei $\tfrac14 T$ im oberen Umkehrpunkt ($y = 8\,\text{cm}$), bei $\tfrac12 T$ wieder in der Ruhelage (nach unten unterwegs), bei $\tfrac34 T$ im unteren Umkehrpunkt. Nach unten ziehen und loslassen bedeutet $y(0) = -\hat y$, also $\varphi_0 = -\tfrac{\pi}{2}$ ($-90^\circ$). [Anstoßen zeigen](?phi=0)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Mechanische Schwingungen in der Oberstufe bzw. dort, wo der Lehrplan harmonische Schwingungen vorsieht: Einstieg (Beobachten, Zeigerdiagramm), Erarbeitung von $T = 2\pi\sqrt{m/D}$ durch Messen mit der Stoppuhr und Vergleichspendel, Vertiefung (Phasenbeziehungen von $y$, $v$, $a$ mit der Zeitmarke; Energie; Dämpfung).
- **Modell:** Ideale, masselose Feder, für die das Hookesche Gesetz auch beim Stauchen gilt. Die Elongation $y$ ist **nach oben positiv**. Die Dämpfung ist geschwindigkeitsproportional ($m\ddot y = -Dy - 2m\delta\dot y$); die Bewegung wird mit dem Runge-Kutta-Verfahren (Schrittweite $1\,\text{ms}$) berechnet. Spann- und Lageenergie werden in der Einstellung „½·D·y²“ zusammengefasst; die dritte Einstellung zeigt sie getrennt (Bezugsniveau der Lageenergie: unterer Umkehrpunkt).
- **Vergleichspendel:** Die beiden Pendel sind so aufgehängt, dass ihre Ruhelagen auf gleicher Höhe liegen; sie starten mit gleicher Amplitude und gleichem Nullphasenwinkel.
- **Stoppuhr:** Der Zähler $n$ zählt volle Umdrehungen des Zeigers seit dem Start (grüne Marke). Wird zwischen zwei vollen Perioden gestoppt, weist die Auswertung darauf hin. Am Vergleich mit einer Messung über nur eine Periode lässt sich zeigen, warum man mehrere Perioden misst.
- **Typische Fehlvorstellungen:**
  - „Bei größerer Amplitude dauert eine Schwingung länger.“ – Beim Federpendel ist $T$ unabhängig von $\hat y$.
  - „Im Umkehrpunkt ist die Beschleunigung null, weil der Körper kurz still steht.“ – Dort ist $|a|$ am größten.
  - „In der Ruhelage wirkt keine Kraft.“ – Gewichtskraft und Federkraft wirken, ihre Summe ist null.
  - „Auf dem Mond schwingt ein Federpendel langsamer.“ – $g$ geht nicht in $T$ ein, nur die Dehnung $s_0$ ist kleiner.
